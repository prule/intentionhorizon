## Why

The CI & Deploy workflow pins GitHub Actions whose JavaScript runtime is Node.js 20, which GitHub is deprecating: runs are forced to Node 24 around 2026-06-16 and Node 20 is removed from runners around 2026-09-16. The most recent `main` run already logged the deprecation warning for `actions/checkout@v4`, `actions/setup-node@v4`, and the `actions/upload-artifact@v4` wrapped by `actions/upload-pages-artifact@v3`. Bumping now avoids the pipeline breaking when the runtime is withdrawn.

## What Changes

- Bump the pinned actions in `.github/workflows/deploy.yml` to their latest majors, all of which run on Node 24:
  - `actions/checkout@v4` → `@v6`
  - `actions/setup-node@v4` → `@v6`
  - `actions/upload-pages-artifact@v3` → `@v5` (composite; wraps `upload-artifact@v7`, node24)
  - `actions/deploy-pages@v4` → `@v5`
- No change to job structure, triggers, gating, or the build/e2e/deploy behaviour.

## Capabilities

### New Capabilities
<!-- None. -->

### Modified Capabilities
- `ci-pipeline`: Add the maintainability guarantee that the pipeline runs on supported (non-deprecated) action runtimes, so it keeps working as GitHub retires older Node runtimes.

## Impact

- `.github/workflows/deploy.yml` — action version bumps only.
- No application/source code changes; pipeline behaviour is unchanged and verified by the workflow running on the bump PR itself.
