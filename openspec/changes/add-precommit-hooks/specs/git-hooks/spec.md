## ADDED Requirements

### Requirement: Hooks install automatically with dependencies

The system SHALL install its git hooks automatically whenever dependencies are installed, with no separate manual setup step.

#### Scenario: Fresh clone installs hooks

- **WHEN** a contributor runs `pnpm install` on a fresh clone (or the Dev Container's first-create `post-create.sh` runs it)
- **THEN** the `prepare` script runs and Husky's hooks under `.husky/` become the active git hooks for that checkout, with no further action required

### Requirement: Staged files are formatted before commit

The system SHALL run Prettier against staged files matching the project's formatting glob on every commit, and re-stage the formatted result, before the commit is created.

#### Scenario: Committing an unformatted file

- **WHEN** a contributor stages a `.ts` file containing formatting deviations (e.g. double quotes, inconsistent indentation) and runs `git commit`
- **THEN** the `pre-commit` hook runs `lint-staged`, which runs Prettier `--write` on that file, re-stages the formatted version, and the commit proceeds with the formatted content

#### Scenario: Formatting a file with a syntax error

- **WHEN** a staged file has a syntax error that Prettier cannot parse
- **THEN** Prettier exits non-zero, `lint-staged` reports the failure, and the commit is aborted so the contributor can fix the file

#### Scenario: No matching staged files

- **WHEN** a commit's staged files contain none of the extensions in the formatting glob (`*.{ts,tsx,js,jsx,json,css,md}`)
- **THEN** `lint-staged` runs no formatter and the commit proceeds unchanged

### Requirement: Commit messages record tool versions used

The system SHALL append the active Claude Code CLI and OpenSpec CLI versions to the commit message as trailers, on a best-effort basis, without blocking the commit if either tool is unavailable.

#### Scenario: Both CLIs available

- **WHEN** a contributor commits inside an environment where both `claude` and `openspec` are on `PATH`
- **THEN** the `prepare-commit-msg` hook appends `Claude-Code-Version: <version>` and `OpenSpec-Version: <version>` lines to the commit message before the editor (or `-m` message) is finalized

#### Scenario: One CLI unavailable

- **WHEN** a contributor commits in an environment where `openspec` is not on `PATH` but `claude` is
- **THEN** only the `Claude-Code-Version` trailer is appended; the commit proceeds normally with no error about the missing `openspec` CLI

#### Scenario: Neither CLI available

- **WHEN** neither `claude` nor `openspec` is on `PATH`
- **THEN** no trailers are appended and the commit proceeds exactly as if the hook were absent

#### Scenario: Amending a commit that already has trailers

- **WHEN** a contributor runs `git commit --amend` on a commit whose message already contains a `Claude-Code-Version` trailer
- **THEN** the hook does not duplicate that trailer; an already-present trailer key is left as-is

#### Scenario: Merge and squash commits are skipped

- **WHEN** git invokes `prepare-commit-msg` for a merge commit or a squash commit
- **THEN** the hook makes no changes to the commit message

### Requirement: Tool versions are tracked as diffable files under `versions/`

The system SHALL maintain one plain-text file per tracked CLI under a `versions/` folder — `versions/claude-code` and `versions/openspec` — each containing only that tool's current version string, rewritten on every commit so the file's git history shows exactly when the version changed.

#### Scenario: A tool's version changed since the last commit

- **WHEN** the detected `claude` (or `openspec`) version differs from the content currently in `versions/claude-code` (or `versions/openspec`)
- **THEN** the `pre-commit` hook rewrites that file with the new version and stages it, so the change appears in the commit's diff

#### Scenario: A tool's version is unchanged since the last commit

- **WHEN** the detected version matches the file's current content exactly
- **THEN** the hook still writes the (identical) content, but since it produces no actual content change, the file does not appear in the commit's diff and `git log` for that file does not gain an entry

#### Scenario: A tracked CLI is not detected

- **WHEN** a commit is made in an environment where `openspec` is not on `PATH`
- **THEN** `versions/openspec` is left with its last-recorded value untouched — never blanked, deleted, or overwritten with a placeholder

#### Scenario: First time a tool is detected

- **WHEN** a commit is made where `versions/claude-code` does not yet exist and `claude` is detected on `PATH`
- **THEN** the `versions/` folder and `versions/claude-code` file are created and staged with the detected version
