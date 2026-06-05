## ADDED Requirements

### Requirement: Pipeline uses supported action runtimes

The CI pipeline SHALL pin its GitHub Actions to versions that run on a runtime supported by GitHub-hosted runners, so the pipeline continues to function as GitHub retires older Node.js runtimes. Pinned actions SHALL NOT depend on a deprecated runtime.

#### Scenario: No deprecated-runtime warnings

- **WHEN** the pipeline runs
- **THEN** it does not emit a deprecation warning for any action running on an end-of-life Node.js runtime

#### Scenario: Actions stay on supported majors

- **WHEN** an action's runtime reaches end of life on GitHub-hosted runners
- **THEN** the workflow pins a version of that action whose runtime is still supported
