## Context

The repo currently has zero formatting automation and zero git hooks (`.git/hooks/` holds only the default `.sample` files, no `core.hooksPath`, no Husky/lint-staged/simple-git-hooks in `package.json`). There's also no Prettier or ESLint config, so there is no established formatting style to preserve — this change is introducing one, not conforming to an existing one.

Everyone works inside the project's Dev Container (`.devcontainer/`), where `pnpm install` already runs on first create via `post-create.sh`, and the `claude` and `openspec` CLIs are already installed. That makes a `prepare`-script-based hook installer (Husky's model) a natural fit: hooks activate automatically on `pnpm install` with no separate manual step.

## Goals / Non-Goals

**Goals:**

- Every commit's staged files are auto-formatted with Prettier before the commit lands, with zero manual step required beyond `pnpm install`.
- Every commit is tagged, best-effort, with the Claude Code and OpenSpec CLI versions active at commit time — mirroring the PR-description convention already in `CLAUDE.md`, but at the finer commit granularity and without relying on anyone remembering to do it.
- Both hooks degrade gracefully: a missing `claude`/`openspec` binary, or a non-container environment, must never block a commit.

**Non-Goals:**

- Not introducing ESLint or any other linter — this change is formatting-only. Linting can be a separate, later change.
- Not enforcing that the version trailers are present (no `commit-msg` validation) — recording is automatic and best-effort, not a gate. (Decided with the user: auto-append over enforce.)
- Not running tests, typecheck, or the e2e suite in the hook — keeping `pre-commit` fast is more important than catching everything before push; that's what CI is for.
- Not reformatting `openspec/` content (proposals/specs/tasks are prose, not code) or generated/vendored paths.

## Decisions

**Husky + lint-staged + Prettier, over simple-git-hooks or a hand-rolled `.githooks/` script.**
Husky is the most widely documented option, and its v9 form is a single `.husky/<hook>` executable file — no `husky install` boilerplate needed beyond a one-line `prepare` script. `lint-staged` is the standard pairing: it runs Prettier only against staged files, which keeps the hook fast regardless of repo size, and re-stages the formatted result automatically. (User confirmed this combination over the lighter-weight alternatives.)

**Prettier config: `singleQuote: true`, `printWidth: 100`, defaults otherwise.**
The existing source (`store.ts`, `App.tsx`, etc.) is already single-quoted and frequently runs well past 80 columns in dense one-liners (e.g. the `store.ts` compute helpers). Setting `printWidth: 100` and `singleQuote: true` up front minimizes the diff of the one-time repo-wide format pass versus taking Prettier's raw defaults (80 cols, double quotes) which would touch nearly every line.

**`lint-staged` glob: `*.{ts,tsx,js,jsx,json,css,md}`.**
Covers the app source, e2e Screenplay layer, config files, and prose docs (README/CLAUDE.md/DEVELOPMENT.md) — the file types actually present in the repo.

**`.prettierignore` excludes several paths beyond build output, discovered by actually running the repo-wide pass.**
The first `pnpm format` run surfaced two real problems that the original plan (ignore `openspec/changes/archive` only) didn't anticipate:
- It rewrote 300+ line diffs in `intention-horizon-handoff/` (the frozen Claude Design handoff export — a point-in-time artifact per `ReadMe.md`, not live source) and in the OpenSpec-generated skill/workflow docs under `.agent/` and `.claude/` (mirrored, tool-vendored content) — large, unrelated diffs with no benefit.
- It reformatted unrelated existing `openspec/specs/**` and `openspec/changes/**` files — contradicting this change's own Non-Goal of not touching OpenSpec's prose contracts.
- Worse, it **silently corrupted `IntentionHorizon.md`**: that file contains a hand-aligned ASCII example table (e.g. `Chinups: X X X   X` — the spacing encodes which of 10 days had a completion). Prettier's Markdown formatter collapses runs of whitespace in prose text outside of a fenced code block, which merged the `X` positions and lost which days they represented. This shows Markdown formatting is **not** always conservative/lossless — it actively damages hand-formatted whitespace-as-data.

Fix: `.prettierignore` now excludes `openspec/` entirely, `intention-horizon-handoff/`, `.agent/`, `.claude/`, and `IntentionHorizon.md` specifically (the one file with this ASCII-table hazard). All reverted before the format-pass commit; re-running `pnpm format` after the fix touches only `src/`, `e2e/`, root config, root prose docs, and `scripts/`, and produces no further changes on a second run.

**`prepare-commit-msg` appends trailers, keyed by presence-check for idempotency.**
The hook reads `claude --version` / `openspec --version` (each via `command -v` guard first), and appends:

```
Claude-Code-Version: <version>
OpenSpec-Version: <version>
```

to the commit message file — but only the trailers whose CLI was actually found, and only if that exact trailer key isn't already present in the message (handles `--amend`/`-c` re-invocation, and lets a human override by hand-editing before committing). Merge and squash messages (`$2` = `merge` or `squash`) are skipped entirely — trailers describe authorship tooling for a unit of work, not merge plumbing.

**No dedicated version-parsing logic beyond first-line extraction.**
`claude --version` / `openspec --version` output is used as-is (whitespace-trimmed), rather than parsing out a strict semver — both CLIs already print a clean single-line version string (confirmed: `openspec --version` → `1.6.0`), so a regex would be extra surface for no benefit.

**A `versions/` folder of plain-text files, in addition to commit trailers, so version history is independently greppable/diffable per tool.**
Trailers record the versions used _for that commit_ in the commit message, but they're only visible per-commit (you'd have to scan `git log` output for the trailer lines). A tracked file per tool — `versions/claude-code`, `versions/openspec`, each containing just the raw version string — gives a second, complementary view: `git log versions/claude-code` shows _only_ the commits where that tool's version actually changed, because git only records a diff when blob content differs. The `pre-commit` hook rewrites both files unconditionally on every commit (same detection as the trailers), and `git add`s them; when the content is unchanged, that's a no-op as far as the commit's tree is concerned, which is exactly the "history shows only real changes" behavior the user wants, with no extra logic (like diffing old vs. new value) required on our side — git already provides that for free via content-addressed blobs.

**Version detection is shared between `pre-commit` and `prepare-commit-msg` via one script, not duplicated.**
Both hooks need the same "detect `claude`/`openspec` version, or note it's unavailable" logic. Rather than copy that `command -v` + version-capture logic into two hook files, it lives once in `scripts/detect-tool-versions.sh`, sourced (or invoked and parsed) by both `.husky/pre-commit` and `.husky/prepare-commit-msg`. Keeps the two hooks small and the detection logic in one place to maintain.

**`versions/` files are written from `pre-commit`, not `prepare-commit-msg`.**
File writes need to land in the index _before_ the commit is built, same as lint-staged's re-staging — that's exactly what `pre-commit` already does. `prepare-commit-msg` only touches the message text; keeping file-staging exclusively in `pre-commit` avoids splitting "things that touch the index" across two hooks.

**A CLI that isn't detected leaves its `versions/` file untouched, rather than blanking or deleting it.**
If `openspec` is temporarily not on `PATH` in some environment, overwriting `versions/openspec` with an empty string (or deleting it) would fabricate a false "version changed" event in that file's history. Leaving the last-known-good value in place when detection fails keeps the file's history meaningful (it only ever reflects tool versions that were actually observed).

## Risks / Trade-offs

- **[Risk]** First `pnpm format` run reformats most of `src/`, `e2e/`, and root config files in one large diff, unrelated to any single logical change → **Mitigation**: the format-the-repo pass is its own dedicated commit in `tasks.md`, created _before_ the hook-wiring commit, so history stays reviewable and the hook's own diff is small.
- **[Risk]** Markdown formatting can silently corrupt hand-aligned whitespace-as-data (confirmed: `IntentionHorizon.md`'s ASCII table) → **Mitigation**: that file is explicitly excluded in `.prettierignore`; going forward, any future prose file relying on meaningful whitespace outside a fenced code block needs the same exclusion — this is a standing gotcha for the `.md` glob, not a one-time fix.
- **[Risk]** A contributor who clones the repo and runs a bare `npm i`/`yarn` instead of `pnpm install` won't get hooks installed (the `prepare` script is package-manager-agnostic in principle, but the project standardizes on pnpm anyway per `packageManager` in `package.json`) → **Mitigation**: none needed beyond existing project convention; `DEVELOPMENT.md` already mandates pnpm.
- **[Risk]** Environments without the `claude`/`openspec` CLIs on `PATH` (e.g. a contributor outside the Dev Container) get commits with partial or no trailers → **Mitigation**: by design — best-effort, per-trailer detection; never blocks the commit.
- **[Risk]** `git commit --no-verify` bypasses both hooks entirely → **Mitigation**: accepted; that's standard, expected git behavior, not something these hooks try to prevent.
- **[Risk]** The first commit after this change lands creates `versions/claude-code` and `versions/openspec` as a side effect of an otherwise-unrelated commit, adding a small unrelated diff → **Mitigation**: acceptable one-time noise (same category as the repo-wide Prettier pass); the files' ongoing history is the point.
- **[Risk]** A repo checkout with neither CLI ever on `PATH` never creates the `versions/` files at all → **Mitigation**: harmless — the feature simply has nothing to record yet in that environment; the files appear the first time either CLI is detected.

## Migration Plan

1. Add Prettier + config, run it once across the repo as a standalone commit.
2. Add Husky, lint-staged, and the two hook scripts; wire `prepare` in `package.json`.
3. Document in `DEVELOPMENT.md` (everyday commands table) and `CLAUDE.md` (conventions section).

No rollback complexity: removing the `.husky/` directory and the `prepare` script fully reverts the automation with no data migration involved.

## Open Questions

None outstanding — tooling choice and trailer mechanism were confirmed with the user before writing this design.
