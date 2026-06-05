## Why

The project has an end-to-end suite (`npm run e2e`, 15 specs) but nothing runs it in CI. The only GitHub workflow (`deploy.yml`) builds and deploys on push to `main` and never runs the tests, so a regression can be merged and even deployed with a green checkmark. Pull requests get **no checks at all** (PRs #3 and #4 showed "no checks reported"), so the e2e safety net only exists on developers' machines.

## What Changes

- Run the e2e suite in GitHub Actions so a failing test fails the build.
- Add CI on **pull requests** (and pushes to `main`), giving PRs a required-able status check where none exists today.
- **Gate deployment on the tests**: `main` only builds the Pages artifact and deploys if typecheck/build and e2e pass, so a broken `main` is never published.
- Install the Playwright browser in CI and let Playwright start its own dev server (the e2e seed is gated behind `import.meta.env.DEV`, so tests run against `npm run dev`, not the production build).

## Capabilities

### New Capabilities
- `ci-pipeline`: The GitHub Actions pipeline that validates every push and pull request — building the app and running the e2e suite — and gates the Pages deploy on those checks passing.

### Modified Capabilities
<!-- e2e-testing's "run via npm script" requirement is unchanged; CI invokes that same script. No spec-level behaviour change there. -->

## Impact

- `.github/workflows/` — add/extend a workflow so a `test` job (build + e2e) runs on `pull_request` and `push: main`, and the existing Pages build/deploy depend on it.
- CI dependencies: `npx playwright install --with-deps chromium`; `CI=true` (set by Actions) makes Playwright start its own server rather than reuse one.
- No application/source code changes.
