# e2e-testing

## Purpose

The app has end-to-end test coverage that exercises its primary user journeys in a real browser. Tests are authored with the Screenplay pattern so specs read as goal-oriented actor flows, run against deterministic isolated state, and locate elements via stable `data-testid` selectors. This gives confidence that core flows (logging completions, navigating days, managing intentions, switching tabs) work end to end without depending on fragile text or styling.

## Requirements

### Requirement: Playwright e2e test harness

The system SHALL provide a Playwright-based end-to-end test harness that launches the built app in a real browser and runs the test suite headlessly by default.

#### Scenario: Run the suite via npm script

- **WHEN** a developer runs `npm run e2e`
- **THEN** Playwright starts the app server, runs all e2e specs against Chromium headlessly, and exits non-zero if any spec fails

#### Scenario: Headed and debug runs

- **WHEN** a developer runs the headed/debug script (e.g. `npm run e2e:headed`)
- **THEN** Playwright runs the same specs with a visible browser for local debugging

### Requirement: Screenplay-pattern test authoring

The e2e suite SHALL be authored using the Screenplay pattern, where an Actor performs Tasks and asks Questions through Abilities, and spec files read as goal-oriented actor flows rather than raw page calls.

#### Scenario: Actor performs a task

- **WHEN** a spec invokes `actor.attemptsTo(LogIntention.named('Read'))`
- **THEN** the Task drives the browser through the Actor's `BrowserAbility` and completes the underlying UI interaction

#### Scenario: Actor asks a question

- **WHEN** a spec invokes `actor.asks(CompletionState.of('Read'))`
- **THEN** a Question reads observable state from the page and returns a value the spec can assert on

#### Scenario: Browser ability wraps the page

- **WHEN** a Task or Question needs to interact with the page
- **THEN** it accesses the Playwright `Page` only through the Actor's `BrowserAbility`, not directly

### Requirement: Deterministic isolated test state

Each e2e test SHALL run against a known, isolated data state so that completions and intentions created in one test do not affect another. The seed SHALL be applied once per browser context, so that reloads within a test hydrate from persisted storage rather than re-wiping to the seed.

#### Scenario: Clean state per test

- **WHEN** a test begins
- **THEN** the app's persisted data (IndexedDB/Dexie and relevant localStorage keys) is reset to a known seed before the actor interacts with the app

#### Scenario: Seeded baseline data

- **WHEN** a test needs existing intentions to act on
- **THEN** the harness provides a deterministic seed (fixed intentions, categories, and dates) independent of the production mock/real data toggle

#### Scenario: Seed applies once and survives reload

- **WHEN** the actor reloads the page partway through a test
- **THEN** the seed hook does NOT re-wipe or reseed, and the app hydrates from the persisted IndexedDB so mutations made before the reload remain intact

### Requirement: Stable element selectors

Interactive UI elements exercised by tests SHALL expose stable `data-testid` selectors so locators do not depend on text or styling that may change.

#### Scenario: Selectors target test ids

- **WHEN** a Task or Question locates an element (nav tab, intention row, completion toggle, date nav button, form field, save button)
- **THEN** it uses a `data-testid` selector that is present in the rendered DOM

### Requirement: Core user-journey coverage

The e2e suite SHALL cover the app's primary user journeys end to end.

#### Scenario: Log a completion

- **WHEN** an actor toggles an intention's completion for the current day on the Today screen
- **THEN** the intention shows as completed and its 7-day count increases by one

#### Scenario: Navigate between days

- **WHEN** an actor uses the date navigation to move to the previous day and back
- **THEN** the displayed date and that day's completion state update accordingly, and navigation past the allowed bounds is disabled

#### Scenario: Create, edit, and delete an intention

- **WHEN** an actor adds a new intention on the Manage screen, edits its name, then deletes it
- **THEN** the intention appears after creation, reflects the edited name, and is absent after deletion

#### Scenario: Switch tabs and view insights

- **WHEN** an actor navigates to the Insights tab
- **THEN** the Insights screen renders its analytics content and the URL hash reflects the active tab

#### Scenario: State persists across reload

- **WHEN** an actor logs a completion and then reloads the page
- **THEN** the completion is still shown after reload, confirming it persisted to IndexedDB

#### Scenario: Manage categories

- **WHEN** an actor creates a category, renames it, and then deletes it on the Manage screen
- **THEN** the category appears after creation, reflects the new name, and after deletion is gone while its intentions remain (moved to Uncategorized)

#### Scenario: Set targets on an intention

- **WHEN** an actor creates an intention with targets enabled and a chosen 7-day target
- **THEN** the Manage list shows the target badge and the Today screen shows the 7-day count against that target

#### Scenario: Analytics reflect logged data

- **WHEN** an actor views the Insights tab against a known seed
- **THEN** the streak tiles (current, best, 30-day rate) and the Totals sum match the seeded completions, and selecting an intention's filter chip re-scopes those figures
