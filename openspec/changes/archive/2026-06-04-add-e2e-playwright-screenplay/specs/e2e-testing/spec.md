## ADDED Requirements

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

Each e2e test SHALL run against a known, isolated data state so that completions and intentions created in one test do not affect another.

#### Scenario: Clean state per test

- **WHEN** a test begins
- **THEN** the app's persisted data (IndexedDB/Dexie and relevant localStorage keys) is reset to a known seed before the actor interacts with the app

#### Scenario: Seeded baseline data

- **WHEN** a test needs existing intentions to act on
- **THEN** the harness provides a deterministic seed (fixed intentions, categories, and dates) independent of the production mock/real data toggle

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
