# journal-page

## Purpose

The daily entry page — where the user records and reviews intentions for a given day — is presented to users as "Journal". It is named consistently across all navigation and headings, and provides a control to return the viewed day to today after browsing past days.

## Requirements

### Requirement: Daily entry page is named Journal
The system SHALL present the daily entry page under the name "Journal" in all user-visible navigation and headings, including the tab bar, the sidebar, and the page's screen header.

#### Scenario: Page is labelled Journal in navigation
- **WHEN** the user views the tab bar or sidebar
- **THEN** the daily entry page is labelled "Journal"

#### Scenario: Page header reads Journal
- **WHEN** the user is on the daily entry page
- **THEN** the screen header title reads "Journal"

### Requirement: Return-to-today control
The system SHALL provide a control on the Journal page that resets the viewed day to today. The control SHALL be available only when the viewed day is not today, and SHALL be hidden or disabled when the viewed day is already today.

#### Scenario: Control returns the user to today
- **WHEN** the user has navigated to a past day on the Journal page
- **AND** the user activates the return-to-today control
- **THEN** the viewed day resets to today
- **AND** the Journal page shows today's intentions

#### Scenario: Control is unavailable on today
- **WHEN** the viewed day on the Journal page is today
- **THEN** the return-to-today control is hidden or disabled

#### Scenario: Control appears after navigating back
- **WHEN** the user navigates from today to a past day on the Journal page
- **THEN** the return-to-today control becomes available

### Requirement: Scroll position preserved on completion toggle
The system SHALL preserve the Journal page's current scroll position when the user toggles an intention's completion state. Toggling completion SHALL refresh the displayed data (completion state and counts) without resetting the scroll view to the top.

#### Scenario: Completing an intention near the bottom keeps the view in place
- **WHEN** the user has scrolled to the bottom of the Journal page
- **AND** the user toggles an intention's completion
- **THEN** the scroll position remains where it was
- **AND** the toggled intention reflects its new completion state

#### Scenario: Day summary still updates after toggling
- **WHEN** the user toggles an intention's completion on the Journal page
- **THEN** the "X of Y intentions complete" summary and category counts update to reflect the change
- **AND** the scroll position does not change

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
