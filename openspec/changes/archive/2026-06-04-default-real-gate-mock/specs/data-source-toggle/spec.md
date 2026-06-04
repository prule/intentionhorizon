## MODIFIED Requirements

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

## ADDED Requirements

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
