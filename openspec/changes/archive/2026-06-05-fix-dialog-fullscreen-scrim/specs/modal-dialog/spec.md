## MODIFIED Requirements

### Requirement: Blurred backdrop

When a modal dialog (the `Sheet` component) is open, the system SHALL render a backdrop that blurs and obscures the content behind the dialog and fully covers the window. The backdrop SHALL cover the entire window regardless of where the dialog is mounted in the component tree or what CSS transforms its ancestors carry, and SHALL block interaction with everything behind it.

#### Scenario: Backdrop blurs underlying content

- **WHEN** the Add Category or Add Intention dialog is open
- **THEN** the screen content behind the dialog appears blurred, not sharp
- **AND** the backdrop covers the entire window with no uncovered edges

#### Scenario: Backdrop covers the desktop sidebar

- **WHEN** a dialog is open on a wide (desktop) viewport with the navigation sidebar visible
- **THEN** the sidebar is also covered, dimmed, and blurred by the backdrop
- **AND** the sidebar cannot be interacted with until the dialog closes

#### Scenario: Dismiss via backdrop

- **WHEN** the user clicks/taps the blurred backdrop
- **THEN** the dialog closes
