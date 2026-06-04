## ADDED Requirements

### Requirement: Serenity/JS drives the e2e suite

The end-to-end test suite SHALL drive the application through the Serenity/JS Screenplay framework. Browser interaction SHALL be provided by an actor granted `BrowseTheWebWithPlaywright`, and tests SHALL be authored as `actor.attemptsTo(...)` performing Tasks and `Ensure.that(Question, expectation)` assertions. The hand-rolled `e2e/screenplay/` module (custom `Actor`, `BrowseTheWeb`, `Task`, `Question`) SHALL be removed.

#### Scenario: Actor performs tasks through Serenity/JS

- **WHEN** a spec invokes `actor.attemptsTo(...)` with a Task
- **THEN** the Task drives the browser via the actor's `BrowseTheWebWithPlaywright` ability
- **AND** no test code references the removed `e2e/screenplay/` module

#### Scenario: Assertions use Serenity/JS expectations

- **WHEN** a spec asserts on observed state
- **THEN** it uses a Serenity/JS Question together with `Ensure.that(...)` (or the configured assertion API) rather than a raw Playwright `expect` on a `Page`

### Requirement: Deterministic seeding is preserved

The suite SHALL inject the deterministic dataset onto `window.__IH_E2E_SEED__` before the application boots, exactly as today, so date-window math stays anchored to the real clock. Per-test seed overrides SHALL remain available.

#### Scenario: Default seed loads

- **WHEN** an actor opens the app with no seed override
- **THEN** the app boots with the default dataset (Read with 3 of its last 7 days logged, Workout with none)

#### Scenario: Per-test seed override

- **WHEN** a spec supplies a custom seed before the actor opens the app
- **THEN** the app boots with that dataset instead of the default

### Requirement: Behavioral coverage is unchanged

The migrated suite SHALL preserve every behavioral journey covered today, across all eight spec files: intention CRUD, category CRUD, logging completion, date navigation, persistence, targets, insights, and analytics. No application source, `data-testid` selector, or seed hook SHALL change as part of this migration.

#### Scenario: All journeys still covered

- **WHEN** the migrated suite runs via `npm run e2e`
- **THEN** every journey present before the migration is still exercised and passes
- **AND** application source files and `data-testid` attributes are unmodified

#### Scenario: Existing entry point works

- **WHEN** a developer runs `npm run e2e`, `npm run e2e:headed`, or `npm run e2e:debug`
- **THEN** the Serenity/JS-based suite runs against the Vite dev server as before
