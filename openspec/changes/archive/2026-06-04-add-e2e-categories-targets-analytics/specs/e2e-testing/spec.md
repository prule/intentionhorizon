## MODIFIED Requirements

### Requirement: Core user-journey coverage

The e2e suite SHALL cover the app's primary user journeys end to end.

#### Scenario: Log a completion

- **WHEN** an actor toggles an intention's completion for the current day on the Today screen
- **THEN** the intention shows as completed and its 7-day count increases by one

#### Scenario: Navigate between days

- **WHEN** an actor uses the date navigation to move to the previous day and back
- **THEN** the displayed date and that day's completion state update accordingly, and navigation past the allowed bounds is disabled

#### Scenario: Create, edit, and delete an intention

- **WHEN** an actor adds a new intention on the Manage screen, edits its name, then deletes it
- **THEN** the intention appears after creation, reflects the edited name, and is absent after deletion

#### Scenario: Switch tabs and view insights

- **WHEN** an actor navigates to the Insights tab
- **THEN** the Insights screen renders its analytics content and the URL hash reflects the active tab

#### Scenario: State persists across reload

- **WHEN** an actor logs a completion and then reloads the page
- **THEN** the completion is still shown after reload, confirming it persisted to IndexedDB

#### Scenario: Manage categories

- **WHEN** an actor creates a category, renames it, and then deletes it on the Manage screen
- **THEN** the category appears after creation, reflects the new name, and after deletion is gone while its intentions remain (moved to Uncategorized)

#### Scenario: Set targets on an intention

- **WHEN** an actor creates an intention with targets enabled and a chosen 7-day target
- **THEN** the Manage list shows the target badge and the Today screen shows the 7-day count against that target

#### Scenario: Analytics reflect logged data

- **WHEN** an actor views the Insights tab against a known seed
- **THEN** the streak tiles (current, best, 30-day rate) and the Totals sum match the seeded completions, and selecting an intention's filter chip re-scopes those figures
