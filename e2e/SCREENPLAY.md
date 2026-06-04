# The Screenplay pattern

How our e2e tests are structured, and how to extend them. For running the
suite, flags, and reports see [README.md](./README.md). The pattern itself is
provided by [Serenity/JS](https://serenity-js.org/handbook/design/screenplay-pattern/).

## Why

Page Object tests answer "what's on the page". Screenplay tests answer "what is
the **user** doing" — they read as a script of a person performing a flow, so a
spec doubles as living documentation and a failure points at the user-facing
step that broke, not at a brittle selector buried in a helper.

The trade is one extra layer: you write Tasks and Questions instead of calling
the page directly. The payoff is that selectors, interactions, and assertions
each live in exactly one place and compose.

## The five roles

| Role | What it is | Lives in |
|------|-----------|----------|
| **Actor** | The user. Named **Tess**. Performs Tasks, answers Questions. | injected as the `actor` fixture |
| **Ability** | What the actor *can* do. Here: `BrowseTheWebWithPlaywright`. | wired in `fixtures.ts` |
| **Task** | A user-meaningful action, built from lower-level interactions. | `tasks.ts` |
| **Question** | Reads observable state off the page, returns a value to assert on. | `questions.ts` |
| **Locator** | A `data-testid`-based handle on a DOM element. | `elements.ts` |

A spec wires them together: the actor `attemptsTo(...)` a sequence of Tasks and
`Ensure.that(Question, expectation)` assertions.

```ts
await actor.attemptsTo(
  GoToTab.to('settings'),
  AddIntentionWithTarget.named('Meditate').times(5),
  Ensure.that(TargetBadge.of('Meditate'), equals('5/7d')),
);
```

That line reads top-to-bottom as the user's journey. No `await` per step — the
actor runs the whole sequence.

## How the layers stack

```
spec ── actor.attemptsTo ──▶ Task ──▶ Click / Enter / Wait (Serenity interactions)
                              │                    │
                              └── Question          └── Locator (elements.ts)
                                       │                    │
                                       └────────────────────┘
                                          both compose locators
```

- **Locators** (`elements.ts`) never appear in a spec. Tasks and Questions
  import them; specs import Tasks and Questions. Selectors change in one file.
- **Tasks** never assert. They *do* — click, type, wait for the form to close.
  A Task ends when the action has settled.
- **Questions** never act. They *read* — return a string, number, boolean, or
  list. Assertion lives in the spec via `Ensure.that` / `Wait.until`.

## Anatomy of a Task

```ts
export const LogIntention = {
  named: (name: string): Task =>
    Task.where(`#actor logs "${name}"`,
      Click.on(byTestId('intention-toggle').of(intentionRow(name))),
    ),
};
```

- `Task.where(description, ...activities)` — the description string is what the
  console/BDD reporter prints. `#actor` is replaced with the actor's name.
- Activities are Serenity/JS interactions (`Click`, `Enter`, `Navigate`,
  `Wait`) or nested Tasks. They run in order.
- `.of(...)` scopes a locator to a parent — `intention-toggle` *of* the
  `intentionRow(name)`, so the right row's toggle is clicked.
- **End on a settle, not a guess.** Form Tasks finish with
  `Wait.until(nameField, not(isVisible()))` so the next step never races the
  closing form. Prefer waiting on an observable change over fixed sleeps.

## Anatomy of a Question

```ts
export const CompletionState = {
  of: (name: string) =>
    Question.about(`whether "${name}" is complete`, async (actor) => {
      const toggle = byTestId('intention-toggle').of(intentionRow(name));
      return (await Attribute.called('aria-checked').of(toggle).answeredBy(actor)) === 'true';
    }),
};
```

- `Question.about(description, callback)` — callback gets the actor and returns
  the value.
- Inside, resolve other Serenity constructs with `.answeredBy(actor)` (or
  `actor.answer(...)`). `Attribute`, `Text`, `Page` are the common readers.
- Return native values (`boolean`, `number`, `string`, arrays) so the spec
  asserts with plain matchers (`equals`, `isTrue`, `includes`).
- For lists, map over `PageElements`:
  `intentionRows().eachMappedTo(Attribute.called('data-intention-name'))`.

## Ensure vs Wait

- `Ensure.that(question, expectation)` — one-shot. Use for state that is true
  the moment the prior Task settled.
- `Wait.until(question, expectation)` — polls until it passes or times out. Use
  for values that settle asynchronously (analytics recompute, animations).

```ts
Ensure.that(CompletionState.of('Read'), isTrue());           // immediate
Wait.until(StreakValue.of('current'), equals(3));            // settles async
```

## Worked example: the Date navigation spec

`specs/date-navigation.spec.ts` exercises every layer with no setup of its own —
the auto `openApp` fixture already left the actor on Today. It uses two Tasks
(`NavigateDay`) and two Questions (`VisibleDate`, `CanNavigate`).

### Test 1 — "moves to the previous day and back"

```ts
await actor.attemptsTo(
  Ensure.that(VisibleDate.label(), equals('Today')),
  Ensure.that(CanNavigate.next(), isFalse()), // cannot go past today

  NavigateDay.previous(),
  Ensure.that(VisibleDate.label(), equals('Yesterday')),

  NavigateDay.next(),
  Ensure.that(VisibleDate.label(), equals('Today')),
);
```

Step by step:

1. **`VisibleDate.label()` equals `'Today'`** — the Question reads
   `Text.of(byTestId('date-label'))`, the human label the date navigator
   renders. App opens on today, so it reads "Today".
2. **`CanNavigate.next()` is false** — this Question reads `date-next`'s
   `isEnabled()`. You can't log the future, so the next-day button is disabled
   on today. This asserts the *upper bound*.
3. **`NavigateDay.previous()`** — the Task clicks `date-prev`. No wait: the label
   updates synchronously, so the next `Ensure` reads the settled state.
4. **label equals `'Yesterday'`** — same Question, one day back. The app renders
   relative labels ("Today"/"Yesterday") rather than dates, which is why the
   Question returns the *label* not a parsed date.
5. **`NavigateDay.next()` → `'Today'`** — step forward, back where we started.
   Confirms navigation is reversible.

### Test 2 — "stops at the 7-day-back lower bound"

```ts
for (let i = 0; i < 7; i++) await actor.attemptsTo(NavigateDay.previous());
await actor.attemptsTo(Ensure.that(CanNavigate.previous(), isFalse()));
```

- The loop runs the `NavigateDay.previous()` Task seven times — plain JS `for`
  around `attemptsTo` is fine when a step repeats with no per-iteration assert.
- After 7 steps back, **`CanNavigate.previous()` is false** — `date-prev` is now
  disabled. The app only lets you log within a trailing 7-day window, so this
  asserts the *lower bound*.

### What it shows

- **Bounds, not just happy path** — test 1 checks the upper bound (can't go to
  the future), test 2 the lower bound (7-day floor). Together they pin the
  navigable range.
- **Questions return what the user sees** — a relative label string and a
  button's enabled state, not internal date objects.
- **No `Wait`** — label and button-state update synchronously on click, so
  one-shot `Ensure.that` is correct. Async-settling values would need
  `Wait.until` (see above).
- **No seed override** — relies on `defaultSeed` and the real clock; "Today"
  and "Yesterday" are computed live, so the test is correct on any run date.

## Deterministic state (the seed)

Each test gets a fresh browser context. `fixtures.ts` overrides the `page`
fixture to inject a seed onto `window.__IH_E2E_SEED__` via `addInitScript`
*before the app boots*; `store.initStore()` reads it. The hook is gated behind
`import.meta.env.DEV`, so production builds never see it — which is why e2e runs
against the dev server.

- Default dataset: `defaultSeed` in `fixtures.ts`.
- Completions are **day offsets from today** (`0` = today), so date-window math
  matches real usage regardless of when the suite runs.
- Override per test: `test.use({ seed: {...} })` before the `it(...)`.
- An auto fixture (`openApp`) opens the seeded app on the Today screen before
  each test, so specs start already loaded.

## Adding coverage — the recipe

1. **Need a new element?** Add a locator to `elements.ts` targeting a
   `data-testid`. Add the `data-testid` to the app source if it's missing —
   never select by text or CSS class.
2. **Need a new user action?** Add a Task to `tasks.ts`. Compose existing
   locators and Serenity interactions. End on an observable settle.
3. **Need to read new state?** Add a Question to `questions.ts` returning a
   native value.
4. **Write the spec** in `specs/`, composing Tasks and Questions through
   `actor.attemptsTo(...)`.

Keep the boundaries: specs don't touch locators, Tasks don't assert, Questions
don't act. That's what keeps a selector change a one-line edit.
