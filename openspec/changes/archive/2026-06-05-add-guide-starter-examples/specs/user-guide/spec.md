## ADDED Requirements

### Requirement: Starter examples of categories and intentions

The user guide SHALL include a section showing example categories, each with one or more example intentions, so a first-time user can see a sensible starting structure rather than facing a blank slate.

The examples SHALL be illustrative content only: they SHALL NOT create, seed, or modify any of the user's categories, intentions, or completions.

The example set SHALL demonstrate a range of target styles, including at least: a frequent (multiple-times-per-week) target, and a rare (long-period) target, so users understand that targets can express different cadences.

The examples SHALL be presented using the guide's existing example framing (the `GExample` strip) and SHALL keep the guide's concise, low-pressure tone.

#### Scenario: First-time user sees starter examples

- **WHEN** a user opens the user guide
- **THEN** a section presents example categories each with one or more example intentions

#### Scenario: Examples span different target cadences

- **WHEN** the starter-examples section is shown
- **THEN** it includes at least one frequent target (multiple times per week) and at least one rare target (a long trailing period)

#### Scenario: Examples do not alter user data

- **WHEN** the user views the starter examples in the guide
- **THEN** no category, intention, or completion is created or changed in the user's data
