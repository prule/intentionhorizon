## MODIFIED Requirements

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
