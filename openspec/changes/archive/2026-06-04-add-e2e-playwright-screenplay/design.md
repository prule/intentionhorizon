## Context

Intention Horizon is a client-only React + Vite + TypeScript app. State lives in the browser: intentions/categories/completions persist to IndexedDB via Dexie, with a few `localStorage` keys (`ih-tab`, `ih-entry-date`, data-source) for UI continuity. Navigation is hash-based (`#/today`, `#/insights`, `#/manage`). There is a mock-vs-real data toggle gated behind a build flag. There are currently no automated tests, and no `data-testid` attributes in the source.

E2e tests must therefore: (1) control browser-persisted state for determinism, (2) target elements that survive styling changes, and (3) read state the way a user observes it.

## Goals / Non-Goals

**Goals:**
- Stand up Playwright with a config that builds/serves the app and runs Chromium headlessly.
- Establish the Screenplay pattern (Actor, Abilities, Tasks, Questions) as the authoring model.
- Make every test start from a clean, deterministic data state.
- Cover the core journeys: log completion, date navigation, intention CRUD, tab switching + insights.
- Add `data-testid` hooks to the interactive elements those journeys touch.

**Non-Goals:**
- CI wiring (config will be CI-ready, but no pipeline added here).
- Cross-browser matrix beyond Chromium (Firefox/WebKit left as easy future additions).
- Visual regression / screenshot diffing.
- Unit or component tests.
- Changing app behavior or the mock/real data toggle.

## Decisions

**Playwright over Cypress.** Playwright has first-class TypeScript, parallelism, auto-waiting, and a built-in `webServer` that boots Vite. It also gives direct CDP access for clearing IndexedDB. Cypress's IndexedDB story is weaker and its parallelism is paid.

**Screenplay layering.**
- `Actor` — holds Abilities; entry point `actor.attemptsTo(...tasks)` and `actor.asks(question)`.
- `BrowserAbility` — wraps the Playwright `Page`; the only thing that touches `page` directly. Tasks/Questions request it via `BrowseTheWeb.as(actor)`.
- `Task` — composable interaction with a goal (`LogIntention`, `NavigateToDay`, `AddIntention`, `EditIntention`, `DeleteIntention`, `GoToTab`). Tasks may compose sub-tasks.
- `Question` — reads observable state (`CompletionState`, `VisibleDate`, `IntentionList`, `ActiveTab`, `WindowCount`).
This keeps spec files declarative and reuses interaction logic across journeys. Chosen over thin page-object models because the journeys overlap heavily and read better as actor intent.

**State isolation via `context.addInitScript` + storage reset.** Before each test, clear IndexedDB (delete the Dexie database) and the relevant `localStorage` keys, then seed a fixed dataset. Implemented as a Playwright fixture (`test.extend`) that yields a ready `Actor`. Seeding goes through a small test-only hook exposed on `window` (gated so it is a no-op in production) rather than reaching into Dexie internals from the test — keeps the seed authoritative and resilient to schema changes. Alternative considered: driving the UI to create seed data each test — rejected as slow and brittle.

**`data-testid` over text/role locators.** The UI is icon-heavy and style-driven (color buttons, circle toggles) with little stable accessible text, so `data-testid` is the most robust anchor. Add ids to: nav (tab bar + sidebar items), intention rows + their completion toggle, date-nav prev/next + date label, the add/edit form fields and save/delete buttons. Role/text locators used only where naturally stable (headings).

**Fixed seed independent of mock/real toggle.** Tests neither rely on the production mock seed nor on a live dataset; the test seed is its own deterministic fixture so tests are stable regardless of the build flag.

## Risks / Trade-offs

- **Test-only window hook leaks into prod** → Gate behind an env/flag check so it compiles out / no-ops outside test builds; document it.
- **Adding `data-testid` churns many files** → Scope strictly to elements the covered journeys touch; add more later as coverage grows.
- **Date-dependent tests flake around midnight / 7-day bounds** → Seed dates relative to a fixed "today" anchor in the seed and assert on relative movement, not absolute calendar dates.
- **IndexedDB reset races with app boot** → Reset before navigation (init script) and await the app's ready signal before the actor acts.
- **Screenplay adds upfront boilerplate** → Justified once ≥3 journeys share Tasks/Questions; keep the base classes minimal.

## Open Questions

- Exact name/shape of the test seed hook (`window.__ihTestSeed`?) — settle during implementation.
- Whether to run against `vite preview` (built) or `vite dev` — default to preview for production-like behavior; dev acceptable if faster locally.
