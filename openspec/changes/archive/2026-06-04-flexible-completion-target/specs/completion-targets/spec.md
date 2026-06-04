## ADDED Requirements

### Requirement: Flexible target definition

An intention SHALL express its target as a single pair: `targetCompletions` (a positive integer count) and `targetPeriodDays` (a positive integer number of days). The target means "complete this intention `targetCompletions` times within any trailing `targetPeriodDays`-day window." Targeting is gated by `targetEnabled`; when disabled, no target is shown or evaluated.

#### Scenario: Three times per week

- **WHEN** a user sets `targetCompletions = 3` and `targetPeriodDays = 7`
- **THEN** the intention's target is to be completed 3 times within any trailing 7-day window

#### Scenario: Once a year

- **WHEN** a user sets `targetCompletions = 1` and `targetPeriodDays = 365`
- **THEN** the intention's target is to be completed 1 time within any trailing 365-day window

#### Scenario: Target disabled

- **WHEN** `targetEnabled` is false
- **THEN** no target stat or status is displayed for that intention and it is excluded from "targets met" analytics

### Requirement: Target status derivation

The system SHALL derive a target status for an intention as-of a given date by counting completions in the trailing `targetPeriodDays`-day window (inclusive of that date) and comparing to `targetCompletions`: fewer than the target is `under`, equal is `on`, greater is `above`. When no target applies the status SHALL be null.

#### Scenario: Under target

- **WHEN** completions in the trailing window are fewer than `targetCompletions`
- **THEN** status is `under`

#### Scenario: On target

- **WHEN** completions in the trailing window equal `targetCompletions`
- **THEN** status is `on`

#### Scenario: Above target

- **WHEN** completions in the trailing window exceed `targetCompletions`
- **THEN** status is `above`

### Requirement: Entry screen single target stat

The Entry screen SHALL display, for each intention, a single completion stat showing the count within the trailing `targetPeriodDays`-day window against `targetCompletions`, replacing the former fixed 7-day and 30-day stat pair.

#### Scenario: Stat reflects the period

- **WHEN** an intention has `targetCompletions = 3`, `targetPeriodDays = 7`, and 2 completions in the last 7 days
- **THEN** the Entry screen shows the count 2 against a target of 3 for that intention

### Requirement: Analytics targets-met uses the flexible window

Analytics "targets met" calculations SHALL evaluate each target-enabled intention against its own `targetCompletions` over its own `targetPeriodDays` window, rather than a hardcoded 7-day window.

#### Scenario: Met using the intention's own period

- **WHEN** an intention has `targetCompletions = 1`, `targetPeriodDays = 30`, and 1 completion in the last 30 days as-of a date
- **THEN** that intention counts as "met" for that date in analytics

### Requirement: Migration from dual targets

Existing stored intentions carrying legacy `target7` / `target30` fields SHALL be migrated to the flexible model by setting `targetCompletions = target7` and `targetPeriodDays = 7`, preserving each intention's weekly intent.

#### Scenario: Legacy intention migrated

- **WHEN** a stored intention has `target7 = 4` and `target30 = 16`
- **THEN** after migration it has `targetCompletions = 4` and `targetPeriodDays = 7`
