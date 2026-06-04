## ADDED Requirements

### Requirement: Two isolated data sources
The system SHALL provide two local data sources, `mock` and `real`, each backed by its own IndexedDB database so that data in one source is never read from or written to the other.

#### Scenario: Sources do not share data
- **WHEN** the `mock` source is active and the user adds, edits, or deletes an intention, category, or completion
- **THEN** the `real` source's data is unchanged
- **AND** switching to the `real` source shows only data written while `real` was active

#### Scenario: Mock source auto-seeds when empty
- **WHEN** the `mock` source is hydrated and its database has no categories and no intentions
- **THEN** the system populates it with the seeded sample dataset

#### Scenario: Real source starts empty
- **WHEN** the `real` source is hydrated for the first time and its database has no categories and no intentions
- **THEN** the system leaves it empty with no fabricated history

### Requirement: Persisted active source
The system SHALL persist the active data source in localStorage and read it at startup so the selection survives page reloads.

#### Scenario: Selection survives reload
- **WHEN** the user has selected a data source and then reloads the app
- **THEN** the app starts on the same data source that was selected before the reload

#### Scenario: Default source on a fresh install
- **WHEN** the app starts and no active source has ever been persisted and no legacy data is migrated
- **THEN** the app defaults to the `mock` source

#### Scenario: Selected source hydrated before first paint
- **WHEN** the app starts
- **THEN** the in-memory store is hydrated from the active source's database before the first render

### Requirement: Runtime source switching
The system SHALL allow the user to switch the active data source at runtime from the Settings screen, re-hydrating the in-memory store from the newly selected source and re-rendering the app.

#### Scenario: Switching updates the displayed data
- **WHEN** the user switches from one source to the other in Settings
- **THEN** the persisted active source is updated
- **AND** the app re-renders showing the newly selected source's data

#### Scenario: Pending writes are not misdirected
- **WHEN** a switch occurs while writes from the previous source are still pending
- **THEN** those pending writes complete against the previous source before the store is swapped to the new source

### Requirement: Source-aware reset
The system SHALL make the existing "reset" action operate on the active source only: reseeding sample data when `mock` is active, and clearing to empty when `real` is active.

#### Scenario: Reset on mock reseeds
- **WHEN** the `mock` source is active and the user confirms reset
- **THEN** the `mock` source is repopulated with the seeded sample dataset
- **AND** the `real` source is unchanged

#### Scenario: Reset on real clears
- **WHEN** the `real` source is active and the user confirms reset
- **THEN** the `real` source is emptied of all categories, intentions, and completions
- **AND** the `mock` source is unchanged

### Requirement: One-time legacy data migration
The system SHALL migrate data from the legacy single `intention-horizon` database into the `real` source exactly once, without destroying the legacy database, so existing users keep their data and keep seeing it by default.

#### Scenario: Existing data migrated to real
- **WHEN** the app starts for the first time after this change, the legacy database contains data, and the `real` source is empty
- **THEN** the legacy data is copied into the `real` source
- **AND** the active source is set to `real`
- **AND** the legacy database is left intact

#### Scenario: Migration runs only once
- **WHEN** the app has already completed the legacy migration and starts again
- **THEN** the migration does not run a second time
- **AND** any data the user has since written to `real` is preserved
