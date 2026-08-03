## ADDED Requirements

### Requirement: Jump-to-month picker
The system SHALL provide a control on the Journal page that opens a popup dialog listing every month/year period that contains at least one recorded completion, so the user can navigate directly to a past period without stepping one day at a time. The dialog SHALL only list periods that have at least one recorded completion, and SHALL NOT list periods with no data.

#### Scenario: Opening the picker shows periods with data

- **WHEN** the user activates the "jump to month" control on the Journal page
- **THEN** a popup dialog opens listing each month/year that has at least one recorded completion
- **AND** months with no recorded completions are not listed

#### Scenario: Selecting a month navigates the Journal page

- **WHEN** the user selects a month/year from the picker dialog
- **THEN** the dialog closes
- **AND** the Journal page's viewed day changes to a day within that month that has recorded data
- **AND** the pinned header and date label update to reflect the newly viewed day

#### Scenario: Picker is unavailable with no historical data

- **WHEN** the user has no recorded completions on any day
- **THEN** the "jump to month" control is hidden or disabled

### Requirement: Previous-day navigation bounded by data availability
The system SHALL allow the user to step the Journal page's viewed day backward one day at a time, bounded only by the earliest date that has a recorded completion, rather than by a fixed number of days. When there is no recorded data at all, backward navigation SHALL be disabled.

#### Scenario: Stepping back stops at the earliest day with data

- **WHEN** the user repeatedly activates the previous-day control on the Journal page
- **THEN** the viewed day steps back one day at a time
- **AND** the previous-day control becomes disabled once the viewed day reaches the earliest day that has a recorded completion

#### Scenario: Stepping back beyond old fixed limits is possible when data exists

- **WHEN** the user has recorded completions further back than any previously fixed day-count limit
- **THEN** the previous-day control remains enabled until the viewed day reaches the earliest day with a recorded completion

#### Scenario: Previous-day control disabled with no data

- **WHEN** the user has no recorded completions on any day
- **THEN** the previous-day control is disabled

### Requirement: Forward day-step navigation unchanged
The system SHALL continue to allow the user to step the Journal page's viewed day forward one day at a time, bounded by today; the next-day control SHALL remain disabled when the viewed day is already today.

#### Scenario: Next-day control disabled on today

- **WHEN** the viewed day on the Journal page is today
- **THEN** the next-day control is disabled

#### Scenario: Next-day control steps forward one day

- **WHEN** the viewed day on the Journal page is before today
- **AND** the user activates the next-day control
- **THEN** the viewed day advances by exactly one day
