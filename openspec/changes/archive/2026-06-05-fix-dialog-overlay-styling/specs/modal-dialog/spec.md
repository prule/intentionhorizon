## ADDED Requirements

### Requirement: Blurred backdrop
When a modal dialog (the `Sheet` component) is open, the system SHALL render a backdrop that blurs and obscures the content behind the dialog and fully covers the viewport.

#### Scenario: Backdrop blurs underlying content
- **WHEN** the Add Category or Add Intention dialog is open
- **THEN** the screen content behind the dialog appears blurred, not sharp
- **AND** the backdrop covers the entire viewport with no uncovered edges

#### Scenario: Dismiss via backdrop
- **WHEN** the user clicks/taps the blurred backdrop
- **THEN** the dialog closes

### Requirement: Rounded dialog corners
The dialog panel SHALL display its rounded corners on all visible edges; child elements including the footer SHALL NOT paint over or square off those corners.

#### Scenario: Desktop centered modal corners
- **WHEN** the centered modal is shown on a wide viewport and includes a footer
- **THEN** all four corners of the dialog are rounded
- **AND** the bottom edge is not cut off or squared

#### Scenario: Mobile bottom sheet bottom edge
- **WHEN** the bottom sheet is shown on a narrow viewport
- **THEN** the top corners are rounded and the bottom edge remains flush to the screen bottom
