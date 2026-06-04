## ADDED Requirements

### Requirement: Serenity BDD report can be generated

The e2e suite SHALL emit Serenity BDD JSON artifacts for each scenario via a registered `SerenityBDDReporter`, and SHALL provide a documented command that renders those artifacts into the Serenity BDD HTML living-documentation report under `target/site/serenity/`. Generating the report SHALL NOT change the default `npm run e2e` behaviour, the specs, the Tasks/Questions, or any application source.

#### Scenario: JSON artifacts are produced for a run

- **WHEN** the e2e suite runs with the Serenity/JS reporter crew configured
- **THEN** per-scenario Serenity BDD JSON files are written under `target/site/serenity/`

#### Scenario: HTML report is rendered from artifacts

- **WHEN** a developer runs the documented report command after a test run
- **THEN** the Serenity BDD CLI renders an HTML report (with the requirements tree, per-scenario Task/Question narrative, and failure screenshots) into `target/site/serenity/`
- **AND** the report is produced even when the test run had failures

#### Scenario: Default run is unchanged

- **WHEN** a developer runs `npm run e2e` without requesting a report
- **THEN** the suite uses the existing `list` + console reporters and does not invoke the Java report CLI
