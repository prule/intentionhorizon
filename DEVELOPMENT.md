# Development

This project ships a **Dev Container** so you get an identical, batteries-included
toolchain in VS Code, IntelliJ IDEA, or WebStorm — no local Node, pnpm, Java, or
Playwright install required. The container is also where the AI-assisted,
spec-driven workflow (Claude Code + OpenSpec) lives.

- [What's in the container](#whats-in-the-container)
- [Open it in VS Code](#open-it-in-vs-code)
- [Open it in IntelliJ IDEA / WebStorm](#open-it-in-intellij-idea--webstorm)
- [Everyday commands](#everyday-commands)
- [The development process: Claude + OpenSpec](#the-development-process-claude--openspec)

---

## What's in the container

Defined in [`.devcontainer/`](.devcontainer). Base image: Microsoft's
TypeScript + Node 24 dev container (Debian bookworm).

| Tool | Why it's there |
| --- | --- |
| **Node 24** | Matches `.nvmrc` and CI. |
| **pnpm 11.5.2** | Pinned to `package.json`'s `packageManager` field via corepack. |
| **Java (headless JRE)** | `serenity-bdd` generates the BDD report by running a Java jar. |
| **Playwright + Chromium deps** | e2e tests. OS libs are baked in; the browser binary is installed per-project on first create. |
| **Claude Code CLI** (`claude`) | The AI pair-programmer that drives the workflow below. |
| **OpenSpec CLI** (`openspec`) | Spec-driven change management. |

Container facts worth knowing:

- **Static name:** the running container is always `intention-horizon-dev`
  (`docker ps`, `docker exec -it intention-horizon-dev bash`, IDE attach). Only
  one instance can exist at a time — a rebuild replaces it.
- **Forwarded ports:** `5173` (Vite dev server) and `4173` (Vite preview).
- **node_modules** lives in a named Docker volume, not the bind-mounted
  workspace, so the host's macOS/Windows native binaries never clash with the
  Linux container's. It's populated by `pnpm install` on first create.

---

## Open it in VS Code

**Prereqs:** [Docker](https://www.docker.com/) running, and the
[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
extension.

1. Open the project folder in VS Code.
2. Command Palette → **Dev Containers: Reopen in Container** (or click the
   pop-up prompt).
3. First build runs the `postCreateCommand` (installs deps + Chromium). When the
   terminal is ready you're inside the container.
4. Run `pnpm dev`, then open http://localhost:5173.

Rebuild after changing anything in `.devcontainer/`: **Dev Containers: Rebuild
Container**.

---

## Open it in IntelliJ IDEA / WebStorm

JetBrains reads the same `.devcontainer/devcontainer.json`.

1. Ensure Docker is running.
2. **From a fresh checkout:** *File → Remote Development → Dev Containers → New
   Dev Container → From Local Project* (or *From VCS*), then point it at
   `.devcontainer/devcontainer.json`.
   **From an already-open project:** right-click `devcontainer.json` → **Create
   Dev Container and Mount Sources** (or use the gutter icon next to it).
3. The IDE builds the image, runs `postCreateCommand`, and installs its backend
   into the container. When it finishes, a full JetBrains IDE opens connected to
   the container.
4. Use the **npm/pnpm** tool window or a container terminal to run `pnpm dev`;
   open http://localhost:5173 on your host.

> Tip: if the dev server isn't reachable from the host browser, start Vite with
> `pnpm dev --host` so it binds to `0.0.0.0` inside the container.

---

## Everyday commands

All run inside the container:

| Command | What it does |
| --- | --- |
| `pnpm dev` | Vite dev server on `5173`. |
| `pnpm build` | Type-check (`tsc --noEmit`) then production build. |
| `pnpm typecheck` | Types only. |
| `pnpm test:unit` | Vitest run (jsdom + fake-indexeddb). |
| `pnpm test:watch` | Vitest in watch mode. |
| `pnpm e2e` | Playwright + Serenity/JS Screenplay e2e (Chromium). |
| `pnpm e2e:headed` / `pnpm e2e:debug` | e2e with a visible browser / the inspector. |
| `pnpm e2e:report` | Run e2e, then generate the Serenity BDD report (needs Java — present in the container). |
| `pnpm preview` | Serve the production build on `4173`. |

Enable the mock data source by adding to `.env.local` (see
[`.env.example`](.env.example)):

```
VITE_ENABLE_MOCK_DATA=true
```

---

## The development process: Claude + OpenSpec

Requirements on this project move constantly, so every non-trivial change is
driven as a **spec-driven change** rather than an ad-hoc chat instruction. The
loop is: *propose a spec → implement against it → archive it.* [OpenSpec](https://github.com/Fission-AI/OpenSpec)
holds the specs under [`openspec/`](openspec); [Claude Code](https://www.anthropic.com/claude-code)
does the mechanical work through the `/opsx` slash commands.

### Start Claude Code

Inside the container terminal:

```bash
claude
```

(First run asks you to authenticate.) The project's `/opsx` commands and the
matching skills live in [`.claude/`](.claude), so they're available immediately.

### The four-step OpenSpec loop

Run these as slash commands inside a Claude Code session:

1. **`/opsx:explore`** — *(optional)* think through an idea, investigate a
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
