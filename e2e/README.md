# E2e tests (Playwright + Serenity/JS Screenplay)

Browser-driven end-to-end tests for Intention Horizon. They drive the real app
in Chromium and assert on what a user would observe, so broken core flows fail
loudly. The Screenplay pattern is provided by [Serenity/JS](https://serenity-js.org).

See [PLAYWRIGHT.md](./PLAYWRIGHT.md) for the Playwright config and how it wires
into Serenity, and [SCREENPLAY.md](./SCREENPLAY.md) for how tests are written.

## Run

```bash
npm run e2e          # headless, all specs
npm run e2e:headed   # visible browser
npm run e2e:debug    # Playwright inspector
```

Playwright boots the Vite **dev** server (`npm run dev`) via its `webServer`
config and reuses one already running on port 5173. The dev server is required:
the deterministic test seed is gated behind `import.meta.env.DEV` and is
stripped from production builds.

## Targeting & options

Anything after `--` is forwarded to `playwright test`, so the npm scripts above
compose with Playwright's own flags:

| Goal | Command |
|------|---------|
| One spec file | `npm run e2e -- e2e/specs/targets.spec.ts` |
| One test by title | `npm run e2e -- -g "toggling off reverts"` |
| Watch it in a real browser | `npm run e2e:headed -- e2e/specs/targets.spec.ts` |
| Step through interaction-by-interaction | `npm run e2e:debug -- -g "..."` (opens the Playwright Inspector) |
| Slow a headed run down | `npm run e2e:headed -- --workers=1 e2e/specs/targets.spec.ts` |
| Force serial execution | `npm run e2e -- --workers=1` |
| Update on failure, keep going | `npm run e2e -- --max-failures=0` |

`-g` greps against the test title (the string passed to `it(...)`); a spec path
runs just that file. The suite is `fullyParallel`, so targeting a single test
also removes parallelism.

## Reports & artifacts

- **Console narrative** — `@serenity-js/console-reporter` prints each actor's
  Tasks and Questions as the run proceeds.
- **Playwright HTML report** — the HTML reporter only runs in CI by default
  (locally you get the `list` + Serenity console reporters). To produce one
  locally, opt in for the run: `npm run e2e -- --reporter=html` (writes
  `playwright-report/` and opens it); reopen later with
  `npx playwright show-report`.
- **Failure screenshots** — the `Photographer` archives a screenshot for every
  failed scenario under `target/site/serenity/` (git-ignored).
- **Traces** — captured `on-first-retry`; open with
  `npx playwright show-trace <trace.zip>`.

### Serenity BDD report

The rich Serenity BDD living-documentation report (requirements tree, per-scenario
Task/Question narrative, timing, embedded failure screenshots) is opt-in.

```bash
npm run serenity-bdd:update   # one-off: download the report CLI jar (needs Java 11+)
npm run e2e:report            # run the suite, then render the HTML report
open target/site/serenity/index.html
```

- Every run already emits per-scenario JSON to `target/site/serenity/` (the
  `SerenityBDDReporter` crew member); `e2e:report` just adds the Java render step.
- The render runs even when tests fail (the script chains with `;`), so a red run
  still produces a diagnostic report.
- Plain `npm run e2e` does **not** invoke Java — it only writes JSON.
- `target/` is git-ignored.

**Screenshots.** The `Photographer` captures failure screenshots by default
(`TakePhotosOfFailures`). To capture a screenshot of *every* interaction — useful
for a visual walk-through of a passing run — set `PHOTOS=all`:

```bash
PHOTOS=all npm run e2e:report                          # all specs, every step
PHOTOS=all npm run e2e:report -- e2e/specs/targets.spec.ts   # scope to one spec
```

This makes runs slower and the report much heavier (a screenshot per step), so
keep it for debugging rather than as the default.

## How it works

**Deterministic state.** Each test runs in a fresh browser context (isolated
IndexedDB + localStorage). Before the app boots, the overridden `page` fixture
in `fixtures.ts` injects a seed onto `window.__IH_E2E_SEED__` via
`page.addInitScript`; `store.initStore()` picks it up and loads a known dataset.
Completions are expressed as day offsets from today, so date-window math matches
real usage. Override per-test with `test.use({ seed })`.

**Screenplay pattern (Serenity/JS).** Tests are written as an Actor performing
Tasks and asking Questions, using the `@serenity-js/*` libraries. See
[SCREENPLAY.md](./SCREENPLAY.md) for the pattern, the layer boundaries, and how
to add coverage. Quick map:

- `fixtures.ts` — wires the Serenity/JS Playwright Test API via `useFixtures`.
  Each test gets an actor named **Tess** who can `BrowseTheWebWithPlaywright`
  using the (seed-injected) `page` fixture.
- `elements.ts` — shared `PageElement` / `PageElements` locators (all targeting
  `data-testid` attributes), composed by both Tasks and Questions.
- `tasks.ts` — `OpenTheApp`, `ReloadTheApp`, `GoToTab`, `NavigateDay`,
  `LogIntention`, `AddIntention`, `EditIntention`, `DeleteIntention`,
  `AddIntentionWithTarget`, `AddCategory`, `RenameCategory`, `DeleteCategory`,
  `FilterInsightsBy`.
- `questions.ts` — `ActiveTab`, `VisibleDate`, `CompletionState`, `WindowCount`,
  `CanNavigate`, `IntentionList`, `CategoryList`, `TargetBadge`, `StreakValue`,
  `TotalsSum`.
- `specs/` — the journey specs.

A spec reads as intent — assertions are Screenplay `Ensure.that(...)` activities
performed by the actor:

```ts
await actor.attemptsTo(
  LogIntention.named('Read'),
  Ensure.that(CompletionState.of('Read'), isTrue()),
);
```

For values that settle asynchronously (analytics), use `Wait.until(question,
expectation)` instead of a one-shot `Ensure.that`.

## Selectors

Locators target `data-testid` attributes in the app source (nav tabs,
intention rows + toggles, date nav, the add/edit form), centralised in
`elements.ts`. Add more there as coverage grows rather than relying on text or
styling.

## Reporting

The Serenity/JS reporter is registered in `playwright.config.ts` alongside
Playwright's own reporters. `@serenity-js/console-reporter` prints the actor's
narrative, and a `Photographer` captures a screenshot on every failure (archived
under `target/site/serenity`).
