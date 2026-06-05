## MODIFIED Requirements

### Requirement: Pages map to URL hashes
The system SHALL map each main page to a unique, readable URL hash: Journal to `#/journal`, Insights to `#/insights`, and Manage to `#/manage`.

#### Scenario: Each page has a distinct hash
- **WHEN** the user is on the Journal, Insights, or Manage page
- **THEN** the URL hash is `#/journal`, `#/insights`, or `#/manage` respectively

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
