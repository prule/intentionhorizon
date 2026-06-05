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
