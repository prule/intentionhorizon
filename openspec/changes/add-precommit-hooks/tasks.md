## 1. Prettier

- [x] 1.1 Add `prettier` as a devDependency
- [x] 1.2 Add `.prettierrc` (`singleQuote: true`, `printWidth: 100`)
- [x] 1.3 Add `.prettierignore` (`dist`, `node_modules`, `pnpm-lock.yaml`, `target`, `playwright-report`, `test-results`, `blob-report`, `.git-original`, `openspec/`, `intention-horizon-handoff/`, `.agent/`, `.claude/`, `IntentionHorizon.md`)
- [x] 1.4 Add `pnpm format` (`prettier --write .`) and `pnpm format:check` (`prettier --check .`) scripts to `package.json`
- [x] 1.5 Run `pnpm format` once across the repo; verify the diff is scoped to `src/`, `e2e/`, root config, root prose docs, and `scripts/` only (no vendored/generated/OpenSpec content), then leave staged for a dedicated commit before any hook-wiring changes

## 2. Husky + lint-staged

- [x] 2.1 Add `husky` and `lint-staged` as devDependencies
- [x] 2.2 Add a `prepare` script (`husky`) to `package.json` so hooks install on `pnpm install`
- [x] 2.3 Run the Husky init so `.husky/` is created and the hooks directory is wired as `core.hooksPath`
- [x] 2.4 Add a `lint-staged` config to `package.json` mapping `*.{ts,tsx,js,jsx,json,css,md}` → `prettier --write`
- [x] 2.5 Add `.husky/pre-commit` running `pnpm exec lint-staged`

## 3. Shared tool-version detection script

- [x] 3.1 Add `scripts/detect-tool-versions.sh`: for each of `claude`/`openspec`, if the binary is on `PATH` (`command -v`), output its version (trimmed); otherwise output nothing for that tool. Emits `KEY=value` lines (`CLAUDE_CODE_VERSION`, `OPENSPEC_VERSION`) meant to be consumed via `eval "$(...)"` by both hooks.
- [x] 3.2 Make it executable and never exit non-zero (best-effort; detection failures must not block a commit) — verified with both CLIs present and with `PATH` stripped

## 4. Commit-message version trailers

- [x] 4.1 Add `.husky/prepare-commit-msg` that:
  - reads the commit message file path (`$1`) and source (`$2`)
  - skips entirely when `$2` is `merge` or `squash`
  - uses `scripts/detect-tool-versions.sh` to get each tool's version; for each one detected, appends `Claude-Code-Version: <version>` / `OpenSpec-Version: <version>` to the message file — but only if that trailer key isn't already present in the file
- [x] 4.2 Make `.husky/prepare-commit-msg` executable (`chmod +x`)
- [x] 4.3 Manually verify: a normal commit picks up both trailers inside the Dev Container (verified by invoking the hook directly against a synthetic message file, both CLIs on `PATH`)
- [x] 4.4 Manually verify: `git commit --amend` on a commit that already has the trailers does not duplicate them (verified by re-invoking the hook against an already-trailered message file with source `commit`)
- [x] 4.5 Manually verify: temporarily renaming/hiding one CLI on `PATH` still produces a commit with only the other trailer, and no error (verified with a restricted `PATH` exposing only `claude`, and again with neither CLI on `PATH`)

## 5. `versions/` folder

- [x] 5.1 Extend `.husky/pre-commit` (before the `lint-staged` step) to use `scripts/detect-tool-versions.sh` and, for each tool detected, write its version string to `versions/claude-code` / `versions/openspec` (creating the `versions/` folder and file if missing), then `git add` that file
- [x] 5.2 Leave a tool's `versions/` file untouched (do not blank/delete) when that tool isn't detected
- [x] 5.3 Manually verify: both CLIs detected creates/stages both files with the detected version (verified directly against the real repo — files now exist and are staged)
- [x] 5.4 Manually verify: an unchanged version produces no diff, and a real version change does produce one (verified in an isolated sandbox repo: baseline commit, re-stamp with identical content → empty `git diff --cached`; then a changed value → shows a 1-line diff)
- [x] 5.5 `git log versions/claude-code` (and `versions/openspec`) showing only real-change commits follows directly from 5.4's content-addressed-blob behavior; no separate mechanism needed

## 6. Docs

- [x] 6.1 Add `pnpm format` / `pnpm format:check` to the "Everyday commands" table in `DEVELOPMENT.md`
- [x] 6.2 Add a short note in `DEVELOPMENT.md` describing the hooks (pre-commit formatting + `versions/` stamping, prepare-commit-msg trailers) and that they install automatically via `pnpm install`
- [x] 6.3 Add a line to `CLAUDE.md`'s "Conventions worth knowing" section noting formatting is enforced by a pre-commit hook (so agents don't need to hand-format), that commit messages auto-carry tool-version trailers, and that `versions/claude-code` / `versions/openspec` hold the canonical per-tool version history

## 7. Verification

- [x] 7.1 `pnpm typecheck` passes after the repo-wide format pass
- [x] 7.2 `pnpm test:unit` passes after the repo-wide format pass (46 tests, 5 files)
- [x] 7.3 `pnpm e2e` passes after the repo-wide format pass — 24/24 passed on a clean run (an initial run showed all-failing due to a stray dev-server process left over from manual debugging on port 5173, not a real regression; killing it and re-running confirmed the app and its `data-testid`s are unaffected)
- [x] 7.4 Confirmed the `prepare` script (`husky`) correctly recreates `.husky/_` and `core.hooksPath` when run — this is what a genuine fresh clone's `pnpm install` invokes via its lifecycle. Caveat found: an *already-satisfied* `pnpm install` (lockfile/`node_modules` unchanged) short-circuits to "Already up to date" and skips lifecycle scripts entirely, so manually clearing `.husky/_`/`core.hooksPath` without also touching the lockfile does **not** reproduce a true fresh-clone install — that's a pnpm optimization outside this change's control, not a defect in the hook setup itself
