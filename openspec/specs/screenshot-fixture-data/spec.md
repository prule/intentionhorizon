# screenshot-fixture-data

## Purpose

Defines a dev-only generator script that produces a deterministic, current-dated CSV fixture reproducing the dataset shown in the reference screenshot (`images/intentionhorizon.webp`), in the app's existing export long-format (`date,category,intention,completed`). The fixture is importable through the app's existing CSV import feature (`data-import` capability) to reliably reproduce a known-good look for taking a fresh screenshot, without hand-editing data in the running app or relying on the randomized mock-data seed.

## Requirements

### Requirement: Generate a current-dated CSV fixture

The project SHALL provide a Node script, runnable via an npm script, that generates a CSV file in the app's export long-format (`date,category,intention,completed`) encoding a fixed dataset reproducing the categories, intentions, and completion pattern shown in the reference screenshot (`images/intentionhorizon.webp`), anchored to the date the script is run.

#### Scenario: Script runs from an npm command

- **WHEN** a developer runs the generator's npm script
- **THEN** a CSV file is written to a fixed path in the export long-format, with a header row of `date`, `category`, `intention`, `completed`

#### Scenario: Dates are relative to run date

- **WHEN** the script is run on a given calendar day
- **THEN** every completion date in the output is computed as an offset from that day (e.g. "today", "6 days ago"), so the file's most recent rows are always dated at or before the run date

### Requirement: Deterministic output

The generator SHALL NOT use randomness. Running the script twice on the same calendar day SHALL produce byte-identical CSV output.

#### Scenario: Repeated run is stable

- **WHEN** the script is run twice in succession on the same day
- **THEN** the two generated CSV files are byte-identical

### Requirement: Fixture reproduces the reference completion pattern

The generated CSV SHALL include, for each intention shown in the reference screenshot, a completed row for "today" wherever the screenshot shows that intention checked, and completed rows for prior days such that each intention's trailing-window completion count matches the count shown in the screenshot for that intention.

#### Scenario: Trailing-window counts match the reference

- **WHEN** the generated CSV is imported into a `real` data source whose intentions already carry the same targets as the reference screenshot
- **THEN** each intention's displayed trailing-window count equals the count shown for that intention in `images/intentionhorizon.webp`

### Requirement: Fixture names match existing intentions for merge-by-name import

The generated CSV's category and intention names SHALL exactly match (case-insensitively) the names of the categories and intentions depicted in the reference screenshot, so that importing the file via the app's existing CSV import feature reuses already-configured intentions (retaining their colors and targets) rather than creating new, defaulted ones.

#### Scenario: Import reuses pre-existing intentions

- **WHEN** the generated CSV is imported into a `real` data source that already contains intentions with matching names, colors, and targets
- **THEN** the import adds only completions, and no new categories or intentions are created
