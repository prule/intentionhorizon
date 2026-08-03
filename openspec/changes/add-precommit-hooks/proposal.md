## Why

The repo has no automated code formatting and no lint-staged/Husky setup, so formatting drifts between contributors (and between human and AI-authored diffs) unless someone remembers to run a formatter by hand. Separately, `CLAUDE.md` now asks that PR descriptions record which Claude Code / OpenSpec versions produced a change, but that's a manual step that's easy to forget. Both are best enforced automatically at commit time rather than left to memory.

## What Changes

- Add Prettier with a project config (`.prettierrc`, `.prettierignore`) and a `pnpm format` / `pnpm format:check` script.
- Add Husky-managed git hooks (installed via a `prepare` script, so they activate automatically on `pnpm install`):
  - **`pre-commit`**: runs `lint-staged` (Prettier `--write` on staged files matching supported extensions, re-staged automatically), and stamps the current `claude`/`openspec` CLI versions into tracked files under `versions/` (see below), staging them if they changed.
  - **`prepare-commit-msg`**: appends `Claude-Code-Version: <version>` and `OpenSpec-Version: <version>` trailers to the commit message, reading `claude --version` / `openspec --version` from the environment. Skipped for merge/squash messages and when the versions can't be detected (best-effort — never blocks a commit).
- Add a `versions/` folder with one plain-text file per tracked CLI — `versions/claude-code` and `versions/openspec` — each containing just that tool's version string. The `pre-commit` hook rewrites them from the detected CLI versions on every commit; since git only registers a change when file content actually differs, `git log versions/claude-code` (or `openspec`) becomes a clean history of exactly when that tool's version changed, independent of commit-message trailers.
- Document the new hooks, `versions/` files, and `pnpm format*` scripts in `DEVELOPMENT.md` and `CLAUDE.md`.

## Capabilities

### New Capabilities

- `git-hooks`: Husky-managed pre-commit formatting (Prettier via lint-staged), prepare-commit-msg trailers recording the Claude Code / OpenSpec CLI versions used for the commit, and a tracked `versions/` folder that records the same CLI versions as diffable, per-tool text files.

### Modified Capabilities

(none — no existing spec's requirements change)

## Impact

- **New dependencies**: `prettier`, `husky`, `lint-staged` (devDependencies).
- **New files**: `.prettierrc`, `.prettierignore`, `.husky/pre-commit`, `.husky/prepare-commit-msg`, a shared `scripts/detect-tool-versions.sh` helper, `versions/claude-code`, `versions/openspec`, `lint-staged` config (in `package.json`).
- **Modified files**: `package.json` (scripts + `prepare` + devDeps), `DEVELOPMENT.md`, `CLAUDE.md`.
- **Dev container**: no new system dependency — Node/pnpm are already present; `claude` and `openspec` CLIs are already installed there. Outside the container (or if either CLI is missing), trailer detection just no-ops.
- **Existing code formatting**: first run of `pnpm format` will likely reformat most of `src/`, `e2e/`, and config files in one pass — a one-time, separate "format the codebase" commit is expected as part of applying this change.
