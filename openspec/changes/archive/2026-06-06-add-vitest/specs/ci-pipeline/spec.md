## MODIFIED Requirements

### Requirement: CI runs build and e2e on pushes and pull requests

The project SHALL provide a GitHub Actions pipeline that, on every push to the default branch and on every pull request, builds the app, runs the unit suite, and runs the end-to-end suite. The pipeline SHALL fail (exit non-zero / report a failing check) if the build, any unit test, or any e2e test fails. The unit suite SHALL run before the e2e suite so that fast failures are surfaced before the slower browser run.

#### Scenario: Pull request runs the checks

- **WHEN** a pull request is opened or updated
- **THEN** the pipeline runs the build, the unit suite, and the e2e suite, and reports a status check on the pull request

#### Scenario: Failing unit test fails the build

- **WHEN** the pipeline runs and any unit test fails
- **THEN** the workflow run concludes as failed and the e2e suite is not required to have passed for the run to fail

#### Scenario: Failing e2e fails the build

- **WHEN** the pipeline runs and any e2e test fails
- **THEN** the workflow run concludes as failed

#### Scenario: Push to main runs the checks

- **WHEN** a commit is pushed to the default branch
- **THEN** the pipeline runs the build, the unit suite, and the e2e suite before any deployment step
