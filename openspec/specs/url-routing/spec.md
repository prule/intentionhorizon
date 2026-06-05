# url-routing

## Purpose

The active page (Journal / Insights / Manage) is encoded in the browser URL via a readable hash, making the URL the source of truth for navigation. This lets reloads and deep links resolve to the correct page, enables browser Back/Forward between pages, and falls back cleanly to the default page for unknown routes.

## Requirements

### Requirement: Pages map to URL hashes
The system SHALL map each main page to a unique, readable URL hash: Journal to `#/journal`, Insights to `#/insights`, and Manage to `#/manage`.

#### Scenario: Each page has a distinct hash
- **WHEN** the user is on the Journal, Insights, or Manage page
- **THEN** the URL hash is `#/journal`, `#/insights`, or `#/manage` respectively

### Requirement: URL is the source of truth for the active page
The system SHALL derive the active page from the current URL hash, both on initial load and whenever the hash changes.

#### Scenario: Deep link opens the named page
- **WHEN** the app is opened at a URL whose hash names a known page
- **THEN** that page is shown

#### Scenario: Hash change updates the page
- **WHEN** the URL hash changes to a known page (including via browser navigation)
- **THEN** the displayed page updates to match the hash

### Requirement: Navigation updates the URL
The system SHALL update the URL hash when the user navigates between pages via the tab bar or sidebar, adding a browser history entry so the change is navigable.

#### Scenario: Selecting a page changes the URL
- **WHEN** the user selects a different page from the tab bar or sidebar
- **THEN** the URL hash updates to that page's hash
- **AND** the displayed page updates to match

### Requirement: Reload preserves the current page
The system SHALL keep the user on the same page across a reload, because the page is encoded in the URL.

#### Scenario: Reload stays on the same page
- **WHEN** the user is on a page and reloads the browser
- **THEN** the same page is shown after the reload

### Requirement: Back and Forward navigate between pages
The system SHALL allow the browser Back and Forward buttons to move between previously visited pages.

#### Scenario: Back returns to the previous page
- **WHEN** the user navigates from one page to another and then presses Back
- **THEN** the previously visited page is shown

### Requirement: Unknown or empty route falls back to the default page
The system SHALL show the default page (Journal) when the URL hash is empty or does not name a known page, normalizing the URL without creating a spurious history entry.

#### Scenario: Empty hash shows the default page
- **WHEN** the app is opened with no hash
- **THEN** the Journal page is shown
- **AND** the URL is normalized to the Journal hash

#### Scenario: Unknown hash shows the default page
- **WHEN** the app is opened with a hash that does not name a known page (including the former `#/today`)
- **THEN** the Journal page is shown
- **AND** pressing Back does not return to the unknown hash

### Requirement: Upgrade continuity from legacy stored page
The system SHALL, on the first load where no hash is present, honor a previously stored last page (legacy `ih-tab`) as the initial page so existing users are not moved off their last page.

#### Scenario: Legacy last page is restored once
- **WHEN** the app loads with no hash and a legacy stored last page exists
- **THEN** that stored page is shown
- **AND** the URL is set to that page's hash
