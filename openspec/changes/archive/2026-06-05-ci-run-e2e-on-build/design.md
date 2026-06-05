## Context

`.github/workflows/deploy.yml` has two jobs: `build` (checkout → setup-node from `.nvmrc` → `npm ci` → `npm run build` → upload Pages artifact) and `deploy` (`needs: build`). It triggers only on `push: [main]` and `workflow_dispatch`. There is no `pull_request` trigger, so PRs are unchecked.

The e2e suite runs via `npm run e2e` (`playwright test`). `playwright.config.ts` defines a `webServer` of `npm run dev` with `reuseExistingServer: !process.env.CI`; GitHub Actions sets `CI=true`, so in CI Playwright boots its own Vite dev server. The suite must run in DEV mode because the e2e seed hook (`window.__IH_E2E_SEED__` → `initStore`) is gated behind `import.meta.env.DEV`; running against a production `vite build` would disable seeding. Only Chromium is configured (`projects: [{ name: 'chromium' }]`), so just that browser needs installing. The plain `npm run e2e` uses the JS console reporter and needs no Java (Serenity BDD report generation is a separate, non-CI script).

## Goals / Non-Goals

**Goals:**
- A failing e2e test fails the GitHub build.
- PRs get a status check that runs build + e2e.
- `main` deploys only when build + e2e pass.
- Keep one coherent pipeline; reuse `.nvmrc` and npm caching already in place.

**Non-Goals:**
- Multi-browser or sharded test matrices (only Chromium is configured).
- Publishing the Serenity HTML report or uploading Playwright traces (could be a later enhancement).
- Branch-protection / required-check configuration in the GitHub UI (out of repo scope; this change only makes the check exist).
- Any application code change.

## Decisions

- **Single pipeline triggered on both `pull_request` and `push: main`, with a `test` job that the Pages `build` job depends on.** Folding tests into the existing `deploy.yml` (rather than a separate `ci.yml`) keeps deploy gating simple: `build` gains `needs: test` and the deploy chain stays `deploy → needs: build`. A separate workflow would need fragile `workflow_run` cross-wiring to gate deploy. The `test` job runs on every trigger; `build`/`deploy` are guarded with `if: github.event_name == 'push'` so PRs run tests but don't try to deploy.
  - *Alternative considered:* a standalone `ci.yml` for PRs plus leaving `deploy.yml` as-is. Rejected — it wouldn't gate the deploy, so a broken `main` could still publish.
- **Run e2e against the dev server Playwright manages itself.** Do not pre-build or pre-start a server; `npm run e2e` + `webServer` + `CI=true` already start/stop `npm run dev`. The `test` job still runs `npm run build` first as the typecheck+bundle gate (the existing build step), then `npm run e2e`.
- **Install only Chromium with OS deps:** `npx playwright install --with-deps chromium`. Matches the single configured project and keeps CI lean.
- **Reuse `actions/setup-node@v4` with `node-version-file: .nvmrc` and `cache: npm`,** mirroring the current job so Node stays pinned to 24.15.0 (the toolchain the suite is known to pass on).

## Risks / Trade-offs

- [Flaky e2e could block deploys] → The suite is deterministic (fixed seed, anchored dates) and currently green 15/15; Playwright's default retries can be enabled later if flake appears. Mitigation kept minimal for now.
- [Browser install adds CI time] → Small and cached-friendly; acceptable for the safety it buys.
- [PR runs `test` but skipping deploy via `if`] → Must ensure the deploy/build jobs’ `if` guards are correct so PRs don’t attempt Pages deploy (which needs `main`/Pages permissions). Verified by the event-name guard.
