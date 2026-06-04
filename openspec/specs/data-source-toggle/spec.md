# data-source-toggle

## Purpose

The app provides two isolated local datasets — `mock` (seeded sample data) and `real` (the user's own, starting empty) — that the user can switch between at runtime. The selection persists across reloads, and existing single-database data is migrated into the `real` source without loss.

## Requirements

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
The system SHALL persist the active data source in localStorage and read it at startup so the selection survives page reloads. When no source has been persisted, the system SHALL default to the `real` source.

#### Scenario: Selection survives reload
- **WHEN** the user has selected a data source and then reloads the app
- **THEN** the app starts on the same data source that was selected before the reload

#### Scenario: Default source on a fresh install
- **WHEN** the app starts and no active source has ever been persisted and no legacy data is migrated
- **THEN** the app defaults to the `real` source

#### Scenario: Selected source hydrated before first paint
- **WHEN** the app starts
- **THEN** the in-memory store is hydrated from the active source's database before the first render

### Requirement: Runtime source switching
The system SHALL allow the user to switch the active data source at runtime from the Settings screen — re-hydrating the in-memory store from the newly selected source and re-rendering the app — but only when the mock data source is enabled by the build flag. When the flag is disabled, the switcher SHALL NOT be shown.

#### Scenario: Switching updates the displayed data
- **WHEN** the mock data source is enabled and the user switches from one source to the other in Settings
- **THEN** the persisted active source is updated
- **AND** the app re-renders showing the newly selected source's data

#### Scenario: Pending writes are not misdirected
- **WHEN** a switch occurs while writes from the previous source are still pending
- **THEN** those pending writes complete against the previous source before the store is swapped to the new source

#### Scenario: Switcher hidden when mock is disabled
- **WHEN** the mock data source is not enabled by the build flag and the user opens Settings
- **THEN** no data-source switcher is shown

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

### Requirement: Mock data source gated by a build flag
The system SHALL expose the mock data source only when a build-time flag (`VITE_ENABLE_MOCK_DATA`) is enabled. When the flag is disabled (including unset), the effective data source SHALL always be `real`, regardless of any previously persisted source, and a previously persisted `mock` selection SHALL be left untouched (ignored, not erased).

#### Scenario: Mock unavailable in a default build
- **WHEN** the app is built without the flag enabled
- **THEN** the effective data source is `real`
- **AND** no mechanism to view or switch to mock data is presented

#### Scenario: Persisted mock is ignored but preserved when disabled
- **WHEN** the persisted source is `mock` and the build flag is disabled
- **THEN** the app uses the `real` source
- **AND** the persisted `mock` selection is not erased

#### Scenario: Mock available when enabled
- **WHEN** the app is built with the flag enabled
- **THEN** the mock data source and the Mock/Real switcher are available
