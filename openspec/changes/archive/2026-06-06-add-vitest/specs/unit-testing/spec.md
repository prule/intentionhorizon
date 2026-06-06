## ADDED Requirements

### Requirement: Project provides a unit-test runner

The project SHALL provide a Vitest-based unit-test runner that executes headlessly (no real browser) and is invokable through an npm script for a single run. The runner SHALL be configured so that store code depending on `localStorage` and IndexedDB executes without modification.

#### Scenario: Unit suite runs from an npm script

- **WHEN** a developer runs the unit-test npm script
- **THEN** the Vitest suite executes to completion and exits non-zero if any test fails

#### Scenario: Store code runs headlessly

- **WHEN** a unit test exercises store logic that touches `localStorage` or IndexedDB
- **THEN** the test runs without a real browser, using a jsdom environment and an in-memory IndexedDB

### Requirement: Unit tests cover store pure and round-trip logic

The unit suite SHALL cover the store's CSV logic and core computation. For CSV it SHALL verify: an export/import round-trip, name-based merge without duplication, unioned completions, rejection of a file with a missing required column, and skipping of rows with an unparseable date. It SHALL also cover date helpers and target-status computation.

#### Scenario: CSV round-trip is verified

- **WHEN** the suite imports CSV produced by the exporter into a clean store
- **THEN** the reconstructed categories, intentions, and completed days match the exported data

#### Scenario: Invalid CSV is rejected

- **WHEN** the suite parses a CSV whose header is missing a required column
- **THEN** the parser reports an error and no data is imported

#### Scenario: Bad-date rows are skipped

- **WHEN** the suite parses a CSV row whose date is not a real calendar date
- **THEN** that row is skipped and does not create an intention or completion

### Requirement: Unit tests are isolated per test

Each unit test SHALL start from a clean state, with no persisted store data, `localStorage` entries, or module-level state leaking from a prior test.

#### Scenario: No state bleeds between tests

- **WHEN** one test mutates the store and a later test reads it
- **THEN** the later test observes a clean store, not the earlier test's mutations
