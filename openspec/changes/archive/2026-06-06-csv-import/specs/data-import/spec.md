## ADDED Requirements

### Requirement: Import data from CSV file

The system SHALL provide an "Import data from CSV" action in Settings that lets the user select a CSV file in the app's export long-format (`date,category,intention,completed`) and reconstruct categories, intentions, and completions into the active `real` data source.

#### Scenario: Round-trip from export

- **WHEN** the user exports their data and then imports the same file into a fresh (empty) data source
- **THEN** the categories, intentions, and completed days visible in the app match those present in the exported file

#### Scenario: Confirm before mutating

- **WHEN** the user selects a file to import
- **THEN** the system asks for confirmation before applying, since import modifies the active dataset
- **AND** if the user cancels, the existing data is unchanged

### Requirement: Name-based merge

The system SHALL match categories by trimmed, case-insensitive name and intentions by trimmed, case-insensitive name within their resolved category, creating only those not already present, and SHALL union completed days into existing completions rather than duplicating entries.

#### Scenario: Existing items are reused

- **WHEN** the imported file contains a category or intention whose name already exists
- **THEN** the system reuses the existing category/intention instead of creating a duplicate
- **AND** the existing intention keeps its current color and target configuration

#### Scenario: Completions are unioned

- **WHEN** the imported file marks a day completed for an intention that already has other completed days
- **THEN** the imported day is added without removing the existing completed days

### Requirement: Defaulted lossy fields

The system SHALL assign defaults for fields absent from the export format when creating new items: a color drawn from the app palette and targets disabled.

#### Scenario: New intention gets defaults

- **WHEN** the import creates an intention not previously present
- **THEN** the intention is assigned a palette color and has its target disabled

### Requirement: Validation and atomic apply

The system SHALL validate the file before applying and SHALL leave the existing store untouched if the file is invalid. A valid file requires the header columns `date`, `category`, `intention`, and `completed`; rows with an unparseable date SHALL be rejected; rows whose `completed` value is falsy SHALL be skipped. Quoted fields SHALL be parsed using the same escaping the export uses.

#### Scenario: Invalid file is rejected without data loss

- **WHEN** the user selects a file missing required header columns or that cannot be parsed
- **THEN** the system reports an error
- **AND** the existing categories, intentions, and completions are unchanged

#### Scenario: Result summary after import

- **WHEN** a valid import completes
- **THEN** the system reports a summary of what was imported (e.g. counts of categories/intentions added and any skipped rows)
