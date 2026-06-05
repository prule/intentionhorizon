## Context

`.github/workflows/deploy.yml` (the "CI & Deploy" pipeline added in #5) uses four GitHub-maintained actions. Their currently-pinned majors run on Node.js 20:

- `actions/checkout@v4`
- `actions/setup-node@v4` (used in both the `test` and `build` jobs)
- `actions/upload-pages-artifact@v3` (wraps `actions/upload-artifact@v4`)
- `actions/deploy-pages@v4`

Latest majors (verified via the GitHub API) and their runtimes:

- `actions/checkout@v6` → `node24`
- `actions/setup-node@v6` → `node24`
- `actions/upload-pages-artifact@v5` → composite, wrapping `actions/upload-artifact@v7` (node24)
- `actions/deploy-pages@v5` → `node24`

## Goals / Non-Goals

**Goals:**
- Move every pinned action to a Node 24 runtime so the pipeline survives the Node 20 removal.
- Keep the bump minimal and behaviour-preserving.

**Non-Goals:**
- Pinning actions by commit SHA (the repo uses float-by-major tags; keep that convention).
- Restructuring jobs, adding caching/matrix, or any other workflow improvement.
- Touching application code.

## Decisions

- **Bump to the latest major tag of each action, keeping major-tag pinning** (`@v6` / `@v5`) rather than switching to SHA pinning. It matches the existing style and lets patch/minor security fixes flow in. Alternative considered: SHA pinning for supply-chain hardening — out of scope here and a larger policy decision.
- **Take `upload-pages-artifact@v5` as the fix for the wrapped `upload-artifact@v4` warning.** The wrapped dependency is internal to the composite action, so bumping the wrapper (which now pulls `upload-artifact@v7`) is the correct lever rather than referencing `upload-artifact` directly.
- **Verify by running the pipeline on the bump PR.** The workflow runs on `pull_request`, so the `test` job (build + e2e) exercises `checkout@v6` and `setup-node@v6` directly; `upload-pages-artifact`/`deploy-pages` run on the post-merge `main` push (they are push-gated). The deprecation warning should be absent from the new run.

## Risks / Trade-offs

- [A new major could introduce a behaviour change] → These are GitHub's first-party actions with stable interfaces for the inputs used here (`node-version-file`, `cache`, Pages upload `path`); the PR's own CI run validates `checkout`/`setup-node`, and the first `main` run validates the Pages steps. Roll back by reverting the bump if a step fails.
- [`deploy-pages`/`upload-pages-artifact` only exercised after merge] → Accepted; the deploy chain is push-gated by design. The post-merge `main` run is watched to confirm deploy still succeeds.
