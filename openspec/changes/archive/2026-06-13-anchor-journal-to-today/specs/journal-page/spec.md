# journal-page

## ADDED Requirements

### Requirement: Journal opens on today
The system SHALL open the Journal page on today's date every time the app is
launched. The viewed day SHALL NOT be persisted across launches; navigating to a
past day during a session SHALL NOT affect which day the Journal opens on next
launch.

#### Scenario: App opens on today
- **WHEN** the user launches the app and views the Journal page
- **THEN** the viewed day is today

#### Scenario: Past day is not restored after relaunch
- **WHEN** the user has navigated to a past day on the Journal page
- **AND** the user closes and relaunches the app
- **THEN** the Journal page opens on today, not the previously viewed past day

### Requirement: Sticky Journal header
The system SHALL keep the Journal page header and date navigator pinned to the
top of the page while the intention list scrolls beneath them, so that the
viewed day and the return-to-today control remain visible at all scroll
positions. This SHALL apply on both the mobile and desktop layouts.

#### Scenario: Header stays visible while scrolling
- **WHEN** the user scrolls the intention list on the Journal page
- **THEN** the header and date navigator remain pinned at the top
- **AND** the viewed day and return-to-today control remain visible

### Requirement: Not-today visual indicator
The system SHALL display a distinct visual indicator on the Journal page when the
viewed day is not today, so the user does not mistakenly record entries against
the wrong day. The indicator SHALL be an amber tint applied to the pinned header
region. When the viewed day is today, the header SHALL use its normal
(non-tinted) background.

#### Scenario: Header is tinted on a past day
- **WHEN** the viewed day on the Journal page is not today
- **THEN** the pinned header region is tinted amber

#### Scenario: Header is not tinted on today
- **WHEN** the viewed day on the Journal page is today
- **THEN** the header region uses its normal background with no amber tint
