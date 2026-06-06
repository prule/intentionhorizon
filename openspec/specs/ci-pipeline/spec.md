# ci-pipeline

## Purpose

The project's GitHub Actions pipeline validates every push and pull request by building the app and running the end-to-end suite, and gates the GitHub Pages deployment on those checks passing. This ensures a regression cannot merge or deploy with a green check, and gives pull requests a real status check.

## Requirements

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

### Requirement: e2e runs in a CI-provisioned browser against the dev server

The pipeline SHALL provision the Playwright browser needed by the configured project and SHALL run the e2e suite against the application in development mode, so the dev-only test seed is available. The pipeline SHALL NOT require the suite to run against the production build.

#### Scenario: Browser is installed in CI

- **WHEN** the pipeline prepares to run e2e
- **THEN** it installs the Playwright browser(s) for the configured project before invoking the suite

#### Scenario: Suite runs against the dev server with seeding enabled

- **WHEN** the e2e suite runs in CI
- **THEN** the app is served in development mode so the e2e seed hook is active, and Playwright manages the server lifecycle itself

### Requirement: Deployment is gated on passing checks

The Pages deployment SHALL occur only after the build and e2e checks pass, and SHALL run only for pushes to the default branch (not for pull requests). A failing check SHALL prevent deployment.

#### Scenario: Broken main is not deployed

- **WHEN** a push to the default branch fails the build or e2e checks
- **THEN** no Pages deployment occurs

#### Scenario: Pull requests do not deploy

- **WHEN** the pipeline runs for a pull request
- **THEN** it runs the checks but does not perform a Pages deployment

#### Scenario: Passing main deploys

- **WHEN** a push to the default branch passes the build and e2e checks
- **THEN** the Pages artifact is built and deployed

### Requirement: Pipeline uses supported action runtimes

The CI pipeline SHALL pin its GitHub Actions to versions that run on a runtime supported by GitHub-hosted runners, so the pipeline continues to function as GitHub retires older Node.js runtimes. Pinned actions SHALL NOT depend on a deprecated runtime.

#### Scenario: No deprecated-runtime warnings

- **WHEN** the pipeline runs
- **THEN** it does not emit a deprecation warning for any action running on an end-of-life Node.js runtime

#### Scenario: Actions stay on supported majors

- **WHEN** an action's runtime reaches end of life on GitHub-hosted runners
- **THEN** the workflow pins a version of that action whose runtime is still supported
