## ADDED Requirements

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
