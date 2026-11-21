# Development

- [Setup](#setup)
- [Everyday commands](#everyday-commands)
- [Git hooks](#git-hooks)
- [The development process: Claude + OpenSpec](#the-development-process-claude--openspec)

---

## Setup

| Tool                           | Version / why                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| **Node**                       | The version in `.node-version` (CI reads the same file).                           |
| **pnpm**                       | The version in `package.json`'s `packageManager` field. Never npm or yarn.         |
| **Java**                       | Only for `pnpm e2e:report`: `serenity-bdd` renders the BDD report with a Java jar. |
| **Claude Code CLI** (`claude`) | The AI pair-programmer that drives the workflow below.                             |
| **OpenSpec CLI** (`openspec`)  | Spec-driven change management (`npm install -g @fission-ai/openspec`).             |

```bash
pnpm install                                     # also installs the git hooks
pnpm exec playwright install --with-deps chromium   # browser for the e2e suite
pnpm dev                                         # http://localhost:5181
```

---

## Everyday commands

| Command                              | What it does                                                 |
| ------------------------------------ | ------------------------------------------------------------ |
| `pnpm dev`                           | Vite dev server on `5181`.                                   |
| `pnpm build`                         | Type-check (`tsc --noEmit`) then production build.           |
| `pnpm typecheck`                     | Types only.                                                  |
| `pnpm test:unit`                     | Vitest run (jsdom + fake-indexeddb).                         |
| `pnpm test:watch`                    | Vitest in watch mode.                                        |
| `pnpm e2e`                           | Playwright + Serenity/JS Screenplay e2e (Chromium).          |
| `pnpm e2e:headed` / `pnpm e2e:debug` | e2e with a visible browser / the inspector.                  |
| `pnpm e2e:report`                    | Run e2e, then generate the Serenity BDD report (needs Java). |
| `pnpm preview`                       | Serve the production build on `4173`.                        |
| `pnpm format`                        | Format the whole repo with Prettier.                         |
| `pnpm format:check`                  | Check formatting without writing (`prettier --check .`).     |

Enable the mock data source by adding to `.env.local` (see
[`.env.example`](.env.example)):

```
VITE_ENABLE_MOCK_DATA=true
```

---

## Git hooks

Husky-managed hooks under [`.husky/`](.husky) install automatically the first
time you run `pnpm install` (via the `prepare` script) — no separate setup
step.

- **`pre-commit`** runs `lint-staged`, which formats staged files with
  Prettier and re-stages the result. It also stamps the detected `claude` /
  `openspec` CLI versions into `versions/claude-code` and `versions/openspec`
  (see [`scripts/detect-tool-versions.sh`](scripts/detect-tool-versions.sh)),
  staging either file only when its content actually changes — so
  `git log versions/claude-code` shows exactly when that tool's version
  changed.
- **`prepare-commit-msg`** appends `Claude-Code-Version:` / `OpenSpec-Version:`
  trailers to the commit message using the same detection script.

Both hooks are best-effort: a CLI missing from `PATH` (e.g. not installed) just means that trailer/file update is skipped — a commit is never
blocked by version detection.

---

## The development process: Claude + OpenSpec

Requirements on this project move constantly, so every non-trivial change is
driven as a **spec-driven change** rather than an ad-hoc chat instruction. The
loop is: _propose a spec → implement against it → archive it._ [OpenSpec](https://github.com/Fission-AI/OpenSpec)
holds the specs under [`openspec/`](openspec); [Claude Code](https://www.anthropic.com/claude-code)
does the mechanical work through the `/opsx` slash commands.

### Start Claude Code

From the repo root:

```bash
claude
```

(First run asks you to authenticate.) The project's `/opsx` commands and the
matching skills live in [`.claude/`](.claude), so they're available immediately.

### The four-step OpenSpec loop

Run these as slash commands inside a Claude Code session:

1. **`/opsx:explore`** — _(optional)_ think through an idea, investigate a
   problem, or clarify requirements before committing to a change.
2. **`/opsx:propose <name-or-description>`** — create a new change under
   `openspec/changes/<name>/` and generate its artifacts:
   - `proposal.md` — what & why
   - `design.md` — how
   - `tasks.md` — the implementation steps
   - plus the spec deltas
     Under the hood this runs `openspec new change` and `openspec status`.
3. **`/opsx:apply`** — implement the change: work through `tasks.md`, editing
   real source and tests until the change is complete and green.
4. **`/opsx:archive`** — once implemented and verified, move the change into
   `openspec/changes/archive/` (dated, e.g.
   `2026-06-14-add-update-notification`) and fold its deltas into the living
   specs under `openspec/specs/`.

The archive under [`openspec/changes/archive/`](openspec/changes/archive) is the
project's changelog of intent — each entry is a discrete, reviewable unit
(`migrate-to-typescript`, `add-url-routing`, `csv-import`, …) that an agent
implemented against a written contract.

### Why this shape

- **The spec is the shared contract.** An agent works far better against a
  written proposal + tasks than against "make it do X"; the resulting diff can
  be checked against the spec.
- **Small, reviewable units.** One change = one intent = one reviewable diff.
- **Tests are part of the contract.** e2e is Playwright driven through
  Serenity/JS in the Screenplay pattern (locators in `elements.ts`, actions in
  `tasks.ts`, state reads in `questions.ts`) — the agent extends the suite by
  adding a Task or Question against clear boundaries. See the
  [ReadMe](ReadMe.md) for the full rationale.

A typical change, end to end:

```text
/opsx:explore        # (optional) clarify the idea
/opsx:propose add-streak-badge
/opsx:apply          # implement tasks.md; run pnpm test:unit && pnpm e2e
/opsx:archive        # dated archive + specs updated
```
