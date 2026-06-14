## ADDED Requirements

### Requirement: Detect a newer deployed version
The system SHALL detect when a newer deployed version of the app is available, using the service worker update mechanism, and SHALL make that detection reliable for every deploy (not only deploys that change service-worker source).

#### Scenario: A new deploy is detected on a fresh load
- **WHEN** a new version has been deployed and the user opens or reloads the app
- **THEN** the system detects that a newer version is available

#### Scenario: A new deploy is detected during an open session
- **WHEN** the app has been left open without navigating and a new version is deployed
- **THEN** the system checks for updates on tab focus and periodically
- **AND** detects the newer version without requiring the user to manually reload

### Requirement: Prompt the user when an update is available
The system SHALL show an in-app, non-blocking prompt when a newer version is available, offering to apply the update or to dismiss it.

#### Scenario: Banner appears when an update is available
- **WHEN** a newer version is detected
- **THEN** an update banner is shown with an option to reload and an option to dismiss

#### Scenario: Prompt does not block the app
- **WHEN** the update banner is shown
- **THEN** the user can continue using the app without applying the update

### Requirement: Apply the update on demand
The system SHALL, when the user chooses to update, activate the waiting new version and reload the page onto the new version.

#### Scenario: Reload applies the new version
- **WHEN** the update banner is shown and the user chooses to reload
- **THEN** the waiting service worker is activated
- **AND** the page reloads running the newer version

### Requirement: Dismissal is quiet until the next deploy
The system SHALL hide the prompt when the user dismisses it, and SHALL NOT prompt again for the same version; it SHALL prompt again only when a newer version than the one already dismissed is detected. Dismissal state SHALL NOT be persisted across sessions.

#### Scenario: Dismissed prompt stays hidden for the current version
- **WHEN** the user dismisses the update banner
- **THEN** the banner is hidden
- **AND** it does not reappear for that same available version during the session

#### Scenario: A later deploy prompts again
- **WHEN** the user has dismissed the banner and a still-newer version is later deployed
- **THEN** the banner appears again for the new version

### Requirement: Preserve offline app-shell behavior
The system SHALL continue to serve the app shell offline (cold-start works without a network) and SHALL serve fresh content on reload when online, after moving service-worker generation to the build tooling.

#### Scenario: Cold start works offline
- **WHEN** the app has been opened at least once and is later opened with no network
- **THEN** the app shell loads from cache

#### Scenario: Reload online serves the current version
- **WHEN** the user reloads the app while online after a deploy
- **THEN** the current deployed version is served
