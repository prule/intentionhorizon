---
title: 'Screenplay E2E with Serenity/JS and Playwright: A Working Setup'
date: 2026-06-05T14:00:00+10:00
publishDate: 2026-06-05
draft: true
layout: 'post'
tags: ['playwright', 'serenity-js', 'screenplay', 'e2e', 'testing', 'typescript']
categories: ['testing']
description: 'How Intention Horizon wires Serenity/JS Screenplay onto Playwright — actor injection, the Task/Question/Locator split, deterministic seeding, and the two report pipelines.'
author: 'Paul'
---

If you want e2e tests that read as user journeys instead of selector soup, run **Playwright as the engine and Serenity/JS Screenplay as the authoring layer on top**. Playwright launches the browser, owns the `page`, runs workers in parallel, and captures traces. Serenity/JS layers an **Actor** over that page — the actor performs **Tasks** and answers **Questions**, while **Locators** live in exactly one file. The payoff: a spec line like `Ensure.that(CompletionState.of('Read'), isTrue())` reads top-to-bottom as intent, and a selector change is a one-line edit.

This is exactly how the e2e suite for [Intention Horizon](https://github.com/paulrule/intentionhorizon) is built. Below is the whole stack, bottom to top: config → fixtures/actor → locators → tasks → questions → specs → reports.

{{< notice type="info" >}}
**Versions.** `@serenity-js/*` 3.43.2, `@playwright/test` 1.60, Vite 6, React 18, TypeScript 5.7. Node 24 (the toolchain breaks on older Node — Vite won't boot).
{{< /notice >}}

## The stack at a glance

Playwright is the runner. Serenity/JS plugs into it as fixtures and reporters — nothing more exotic than that.

```
Playwright Test ── runner, browser, fixtures, trace
      │
      └── @serenity-js/playwright-test ── Screenplay fixtures (actor, page override)
                │
                └── @serenity-js/web ── Click / Enter / Wait / Photographer
```

{{< mermaid >}}
flowchart TD
spec["spec (specs/*.spec.ts)"] -->|actor.attemptsTo| task["Task (tasks.ts)"]
spec -->|Ensure.that / Wait.until| question["Question (questions.ts)"]
task --> interactions["Click / Enter / Navigate / Wait"]
task --> locator["Locator (elements.ts)"]
question --> locator
interactions --> page["Playwright page"]
locator --> page
{{< /mermaid >}}

Three rules keep the layers honest, and the whole design falls out of them:

- **Locators never appear in a spec.** Tasks and Questions import them; specs import Tasks and Questions.
- **Tasks never assert.** They click, type, and wait for the UI to settle.
- **Questions never act.** They read state and return a native value; the spec asserts on it.

## 1. Configuration — typing Playwright with Serenity's fixtures

The single source of truth is `playwright.config.ts`. The one move that unlocks everything is typing `defineConfig` with Serenity's fixture shapes, so the `actor` fixture and the `page` override hook are available downstream:

```typescript
import { defineConfig, devices } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
  testDir: './e2e/specs',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    defaultActorName: 'Tess', // the name Serenity gives the injected actor
    crew: [
      [
        '@serenity-js/web:Photographer',
        {
          strategy:
            process.env.PHOTOS === 'all' ? 'TakePhotosOfInteractions' : 'TakePhotosOfFailures',
        },
      ],
    ],
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev', // Vite dev server, not a build — see below
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

A few decisions worth calling out:

- **`testDir: './e2e/specs'`** — only files under `specs/` are tests. `tasks.ts`, `questions.ts`, `elements.ts`, and `fixtures.ts` are imported, never run directly.
- **`defaultActorName: 'Tess'`** — the actor injected into every test is named Tess. That name shows up in the reports.
- **`crew` (the Photographer)** lives under `use.crew`, not in the reporter block. It runs in the **worker process** because that's where the browser is. By default it shoots on failure only; `PHOTOS=all` captures every interaction for a visual walk-through (heavier reports).
- **`webServer: npm run dev`** — Playwright boots Vite and waits for the port. It must be the **dev** server, because the deterministic test seed (next section) is gated behind `import.meta.env.DEV` and stripped from production builds. No dev server → no seed → no determinism.

The reporter block registers Serenity's crew in the **reporter process**, separate from the Photographer:

```typescript
reporter: [
  ['@serenity-js/playwright-test', {
    crew: [
      '@serenity-js/console-reporter',   // prints the actor's Task/Question narrative
      '@serenity-js/serenity-bdd',       // emits per-scenario BDD JSON
      ['@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' }],
    ],
  }],
  ...(process.env.CI
    ? [['github'] as const, ['html', { open: 'never' }] as const]
    : [['list'] as const]),
],
```

{{< notice type="note" >}}
Two reporter sites, on purpose: Serenity's **crew** runs in the reporter process (narrative + BDD JSON + artifact archiving); the **Photographer** runs in the worker process (it needs the browser). Mixing them up means no screenshots.
{{< /notice >}}

## 2. The actor — provided by a fixture, seeded before boot

`e2e/fixtures.ts` does two jobs: it builds the Serenity-flavoured Playwright Test API via `useFixtures`, and it overrides Playwright's `page` fixture to inject a deterministic dataset before the app loads.

```typescript
import { useFixtures } from '@serenity-js/playwright-test';
import type { E2ESeedSpec } from '../src/data/store';
import { OpenTheApp } from './tasks';

export const { describe, it, test, beforeEach, /* ... */ expect } = useFixtures<{
  seed: E2ESeedSpec; // override the dataset per test
  openApp: void; // auto fixture: open the seeded app before each test
}>({
  seed: [defaultSeed, { option: true }],

  // Override Playwright's `page`: stamp the seed onto window before any app code runs.
  page: async ({ page, seed }, use) => {
    await page.addInitScript((s) => {
      (window as unknown as { __IH_E2E_SEED__: E2ESeedSpec }).__IH_E2E_SEED__ = s;
      localStorage.setItem('ih-consent', 'denied'); // suppress the consent banner
    }, seed);
    await use(page);
  },

  // Auto fixture: actor opens the freshly-seeded app on the Journal screen.
  openApp: [
    async ({ actor }, use) => {
      await actor.attemptsTo(OpenTheApp.fresh());
      await use();
    },
    { auto: true },
  ],
});
```

**Where does the actor come from?** You never construct it. `@serenity-js/playwright-test` provides an `actor` fixture; `defaultActorName: 'Tess'` from the config names it. Every test that destructures `{ actor }` gets Tess, already able to `BrowseTheWebWithPlaywright` against the overridden `page`. The ability is wired by the library — the spec just uses it.

**How is state made deterministic?** Three layers stack:

1. Playwright gives each test a **fresh browser context** — isolated IndexedDB and localStorage, so no test sees another's data.
2. The `page` override calls `addInitScript` to stamp the seed onto `window.__IH_E2E_SEED__` _before app code runs_. The app's `store.initStore()` reads it on first load.
3. The `seed` option fixture lets any spec swap the dataset with `test.use({ seed })`.

The default seed expresses completions as **day offsets from today**, so the date-window math behaves exactly as it does for a real user regardless of when the suite runs:

```typescript
export const defaultSeed: E2ESeedSpec = {
  categories: [{ id: 'c_health', name: 'Health' }],
  intentions: [
    { id: 'i_read', name: 'Read', categoryId: 'c_health' /* target 5/7d */ },
    { id: 'i_work', name: 'Workout', categoryId: 'c_health' /* target 4/7d */ },
  ],
  completionsByOffset: { i_read: [1, 2, 3] }, // "Read" done 1-3 days ago, none today
};
```

Finally, the `openApp` **auto fixture** runs `OpenTheApp.fresh()` before every test, so specs start already loaded on the Journal screen with no boilerplate.

## 3. Locators — one file, all `data-testid`

`e2e/elements.ts` is the only place that knows CSS selectors. Everything targets `data-testid` attributes baked into the app source — never text, never styling classes. Tasks and Questions compose these handles; specs never see them.

```typescript
import { By, PageElement, PageElements } from '@serenity-js/web';

/** Any element addressed solely by its data-testid. */
export const byTestId = (id: string) =>
  PageElement.located(By.css(`[data-testid="${id}"]`)).describedAs(`the ${id}`);

/** A single intention row on the Journal screen, keyed by name. */
export const intentionRow = (name: string) =>
  PageElement.located(
    By.css(`[data-testid="intention-row"][data-intention-name="${name}"]`),
  ).describedAs(`the "${name}" intention row`);

/** All intention rows. */
export const intentionRows = () =>
  PageElements.located(By.css('[data-testid="intention-row"]')).describedAs('the intention rows');
```

`.describedAs(...)` is what makes the reports legible — that string is what the narrative prints instead of a raw selector. `PageElement` is a single handle; `PageElements` is a collection you can map over.

## 4. Tasks — user-meaningful actions that end on a settle

`e2e/tasks.ts` holds the verbs. A Task is `Task.where(description, ...activities)`, where activities are Serenity interactions (`Click`, `Enter`, `Navigate`, `Wait`) or nested Tasks. The description prints in the report with `#actor` replaced by the actor's name.

```typescript
import { Task, Wait } from '@serenity-js/core';
import { Click, Enter, isVisible, Navigate } from '@serenity-js/web';
import { not } from '@serenity-js/assertions';
import { byTestId, intentionRow, settingsRow } from './elements';

/** Toggle an intention's completion for the currently shown day. */
export const LogIntention = {
  named: (name: string): Task =>
    Task.where(
      `#actor logs "${name}"`,
      Click.on(byTestId('intention-toggle').of(intentionRow(name))),
    ),
};

/** Create a new intention via the Manage screen. */
export const AddIntention = {
  named: (name: string): Task =>
    Task.where(
      `#actor adds the intention "${name}"`,
      Click.on(byTestId('add-intention')),
      Enter.theValue(name).into(byTestId('intention-name')),
      Click.on(byTestId('save-intention')),
      Wait.until(byTestId('intention-name'), not(isVisible())), // settle: form closed
    ),
};
```

Two patterns do the heavy lifting:

- **`.of(...)` scopes a locator to a parent.** `byTestId('intention-toggle').of(intentionRow(name))` clicks the toggle _inside the named row_, not the first toggle on the page.
- **End on an observable settle, not a guess.** Form Tasks finish with `Wait.until(nameField, not(isVisible()))` so the next step never races the closing form. No fixed sleeps.

Tasks compose into fluent builders when an action has parameters. Targets are the richest example — the completions stepper has no text input, so the Task steps inc/dec from the form's known default of 3:

```typescript
export const AddIntentionWithTarget = {
  named: (name: string) => ({
    times: (n: number): Task & { withinDays(d: number): Task } =>
      Object.assign(addIntentionWithTarget(name, n, 7), {
        withinDays: (d: number): Task => addIntentionWithTarget(name, n, d),
      }),
  }),
};

// usage reads like English:
AddIntentionWithTarget.named('Meditate').times(5); // 5 within 7 days
AddIntentionWithTarget.named('Annual checkup').times(1).withinDays(365);
```

## 5. Questions — read observable state, return native values

`e2e/questions.ts` holds the nouns. A Question is `Question.about(description, callback)`; the callback gets the actor and resolves other Serenity constructs with `.answeredBy(actor)` (or `actor.answer(...)`). It returns a plain `boolean`, `number`, `string`, or array — so the spec asserts with ordinary matchers.

```typescript
import { Question } from '@serenity-js/core';
import { Attribute, Text } from '@serenity-js/web';
import { byTestId, intentionRow, intentionRows } from './elements';

/** Whether an intention is marked complete for the shown day. */
export const CompletionState = {
  of: (name: string) =>
    Question.about(`whether "${name}" is complete`, async (actor) => {
      const toggle = byTestId('intention-toggle').of(intentionRow(name));
      return (await Attribute.called('aria-checked').of(toggle).answeredBy(actor)) === 'true';
    }),
};

/** The trailing target-period completion count shown for an intention. */
export const WindowCount = {
  forTarget: (name: string) =>
    Question.about(`the window count for "${name}"`, async (actor) => {
      const text = await Text.of(byTestId('stat-target-count').of(intentionRow(name))).answeredBy(
        actor,
      );
      return Number(text?.trim() ?? '0');
    }),
};

/** Names of every intention currently listed — maps over a PageElements collection. */
export const IntentionList = {
  names: () =>
    Question.about('the intention names', (actor) =>
      actor.answer(intentionRows().eachMappedTo(Attribute.called('data-intention-name'))),
    ),
};
```

`Attribute`, `Text`, and `Page` are the common readers. For lists, `eachMappedTo(...)` over a `PageElements` collection yields an array — note the Question returns what the _user observes_ (a count, a label, a set of names), never an internal date object or store value.

## 6. Specs — the journey, assembled

A spec imports Tasks and Questions (never Locators) and hands the actor a sequence. Assertions are themselves Screenplay activities — `Ensure.that(question, expectation)` — interleaved with Tasks. No `await` per step; the actor runs the whole sequence.

```typescript
import { describe, it } from '../fixtures';
import { Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';
import { LogIntention } from '../tasks';
import { CompletionState, WindowCount } from '../questions';

describe('Logging a completion', () => {
  it('marks the intention done and bumps its 7-day count', async ({ actor }) => {
    await actor.attemptsTo(
      Ensure.that(CompletionState.of('Read'), isFalse()),
      Ensure.that(WindowCount.forTarget('Read'), equals(3)),

      LogIntention.named('Read'),

      Ensure.that(CompletionState.of('Read'), isTrue()),
      Ensure.that(WindowCount.forTarget('Read'), equals(4)),
    );
  });
});
```

That reads as a script: _check it's not done and the count is 3 → log it → check it's done and the count is 4._ The seed put "Read" at 3 completions with none today, so the numbers are hand-verifiable.

### Overriding the seed per spec

When a test needs hand-computable analytics, `test.use({ seed })` swaps the dataset — and asynchronously-settling values use `Wait.until` instead of one-shot `Ensure.that`:

```typescript
describe('Analytics correctness', () => {
  test.use({ seed: analyticsSeed }); // Read done offsets 0,1,2; Workout offset 5

  it('streaks and totals reflect the seed, and filtering re-scopes them', async ({ actor }) => {
    await actor.attemptsTo(
      GoToTab.to('analytics'),
      Wait.until(StreakValue.of('current'), equals(3)), // settles after recompute
      Wait.until(TotalsSum.value(), equals(4)),

      FilterInsightsBy.intention('Read'),
      Wait.until(TotalsSum.value(), equals(3)), // re-scoped to Read

      FilterInsightsBy.all(),
      Wait.until(TotalsSum.value(), equals(4)), // restored
    );
  });
});
```

{{< notice type="tip" >}}
**`Ensure` vs `Wait`.** `Ensure.that` is one-shot — use it for state that's true the moment the prior Task settled (a toggle flips, a label updates synchronously). `Wait.until` polls until it passes or times out — use it for values that settle asynchronously (analytics recompute, animations). Reaching for `Wait` everywhere hides real races; reaching for `Ensure` on async state is flaky.
{{< /notice >}}

### Persistence reads the same way

```typescript
await actor.attemptsTo(
  LogIntention.named('Read'),
  Ensure.that(CompletionState.of('Read'), isTrue()),

  ReloadTheApp.now(),

  // Re-hydrated from IndexedDB, not reseeded.
  Ensure.that(CompletionState.of('Read'), isTrue()),
);
```

## 7. Reports — two pipelines from one run

Every run produces a console narrative for free. The richer artifacts are layered on top.

| Output                  | Source                                             | When                                               |
| ----------------------- | -------------------------------------------------- | -------------------------------------------------- |
| Console narrative       | `@serenity-js/console-reporter`                    | every local run                                    |
| Terse list              | Playwright `list` reporter                         | every local run                                    |
| Playwright HTML report  | Playwright `html` reporter                         | CI by default; local with `-- --reporter=html`     |
| Failure screenshots     | `Photographer` (worker crew)                       | on failure (or every step with `PHOTOS=all`)       |
| Traces                  | `trace: 'on-first-retry'`                          | first retry; open with `npx playwright show-trace` |
| **Serenity BDD report** | `@serenity-js/serenity-bdd` JSON → Java CLI render | opt-in via `npm run e2e:report`                    |

The Serenity BDD report is the living-documentation payoff — a requirements tree, per-scenario Task/Question narrative, timing, and embedded failure screenshots. It's a two-step pipeline because rendering needs a Java CLI:

```bash
npm run serenity-bdd:update   # one-off: download the report CLI jar (needs Java 11+)
npm run e2e:report            # run the suite, then render the HTML
open target/site/serenity/index.html
```

```jsonc
// package.json scripts
"e2e": "playwright test",
"e2e:report": "playwright test; serenity-bdd run --destination target/site/serenity",
"serenity-bdd:update": "serenity-bdd update"
```

Note the `;` in `e2e:report` (not `&&`): the render runs **even when tests fail**, so a red run still produces a diagnostic report. Plain `npm run e2e` only writes the per-scenario JSON — it never invokes Java. The `target/` directory is git-ignored.

For a visual walk-through of a passing run, `PHOTOS=all` flips the Photographer to screenshot every interaction:

```bash
PHOTOS=all npm run e2e:report -- e2e/specs/targets.spec.ts
```

## Adding coverage — the recipe

The layer boundaries turn new coverage into a mechanical four-step:

1. **New element?** Add a locator to `elements.ts` targeting a `data-testid`. Add the `data-testid` to the app source if missing — never select by text or class.
2. **New user action?** Add a Task to `tasks.ts`, composing existing locators and interactions. End on an observable settle.
3. **New state to read?** Add a Question to `questions.ts` returning a native value.
4. **Write the spec** in `specs/`, composing Tasks and Questions through `actor.attemptsTo(...)`.

Keep the boundaries — specs don't touch locators, Tasks don't assert, Questions don't act — and a selector change stays a one-line edit. That discipline is the whole point: the tests survive UI churn, and they double as documentation of what the product actually does.
