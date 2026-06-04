# e2e-screenplay-framework

## Purpose

The end-to-end suite is driven by the Serenity/JS Screenplay framework rather than a hand-rolled Screenplay module. Actors browse the web via `BrowseTheWebWithPlaywright`, perform Tasks, and assert through Serenity/JS Questions and expectations. Deterministic seeding and the full behavioral coverage of the existing suite are preserved unchanged, so the migration is purely a framework refactor with no change to application source or selectors.

## Requirements

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

### Requirement: Serenity BDD report can be generated

The e2e suite SHALL emit Serenity BDD JSON artifacts for each scenario via a registered `SerenityBDDReporter`, and SHALL provide a documented command that renders those artifacts into the Serenity BDD HTML living-documentation report under `target/site/serenity/`. Generating the report SHALL NOT change the default `npm run e2e` behaviour, the specs, the Tasks/Questions, or any application source.

#### Scenario: JSON artifacts are produced for a run

- **WHEN** the e2e suite runs with the Serenity/JS reporter crew configured
- **THEN** per-scenario Serenity BDD JSON files are written under `target/site/serenity/`

#### Scenario: HTML report is rendered from artifacts

- **WHEN** a developer runs the documented report command after a test run
- **THEN** the Serenity BDD CLI renders an HTML report (with the requirements tree, per-scenario Task/Question narrative, and failure screenshots) into `target/site/serenity/`
- **AND** the report is produced even when the test run had failures

#### Scenario: Default run is unchanged

- **WHEN** a developer runs `npm run e2e` without requesting a report
- **THEN** the suite uses the existing `list` + console reporters and does not invoke the Java report CLI
