# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Intention Horizon — a local-first habit-tracking PWA. React + TypeScript, IndexedDB via Dexie, no backend. Define intentions, group them by category, tick them off daily, track against a flexible target (_N completions over M days_).

## Commands

```bash
pnpm dev              # Vite dev server on :5173
pnpm build            # tsc --noEmit, then vite build
pnpm typecheck        # tsc --noEmit only
pnpm test:unit        # vitest run (jsdom + fake-indexeddb)
pnpm test:watch       # vitest watch mode
pnpm e2e              # Playwright + Serenity/JS, headless Chromium
pnpm e2e:headed       # same, visible browser
pnpm e2e:debug        # Playwright inspector
pnpm e2e:report       # run e2e, then render the Serenity BDD HTML report (needs Java)
pnpm preview          # serve the production build on :4173
```

Single-test targeting:

```bash
pnpm test:unit -- src/data/store.test.ts        # one vitest file
pnpm test:unit -- -t "toggling off reverts"     # one vitest case by name

pnpm e2e -- e2e/specs/targets.spec.ts           # one e2e spec file
pnpm e2e -- -g "toggling off reverts"           # one e2e test by title
pnpm e2e:headed -- --workers=1 e2e/specs/targets.spec.ts   # slowed-down headed run
```

Vitest config lives inside `vite.config.ts` (`test:` block) — jsdom environment, `src/test/setup.ts` registers `fake-indexeddb` so Dexie works headlessly. Only `src/**/*.test.{ts,tsx}` is included; `e2e/` is a separate Playwright project entirely.

Enable the mock data source locally via `.env.local`: `VITE_ENABLE_MOCK_DATA=true` (see `.env.example`). Without it the app always uses the empty `real` source and hides the Mock/Real switcher in Settings.

## Architecture

### Data layer: `src/data/store.ts`

This module is the entire app's model and persistence layer — everything else reads/writes through it, there is no separate state-management library.

- **Hydrate-then-sync-cache pattern.** `initStore()` loads all rows from IndexedDB (Dexie) into a single in-memory `AppState` object once at boot. Every read (`load()`, `windowCount`, `dayMetric`, `streaks`, …) runs synchronously against that in-memory cache — never against IndexedDB directly. Every mutation (`toggleCompletion`, `addIntention`, …) updates the cache synchronously _and_ enqueues a persist to IndexedDB via a serialized write queue (`enqueue`/`writeQ`), so writes are ordered but never block rendering.
- **Two isolated data sources**, `mock` and `real`, each its own Dexie database (`intention-horizon-mock` / `intention-horizon-real`). `real` is default and always available; `mock` only exists when `VITE_ENABLE_MOCK_DATA` is set. `switchDataSource()` drains the write queue, closes the old DB, and rehydrates from the new one.
- **Targets are one flexible concept**: `targetCompletions` over a trailing `targetPeriodDays` window (e.g. 3×/7d), replacing an older fixed 7/30-day-window model. `migrateIntention()` upgrades legacy rows read from storage; it's a read-time shim, not something to extend for new fields.
- **E2E seeding is a deliberate startup branch**: when `import.meta.env.DEV` and `window.__IH_E2E_SEED__` is present (injected by Playwright before the app boots), `maybeSeedForE2E()` wipes the `real` DB and seeds a deterministic dataset expressed as day-offsets-from-today. This branch is compiled out of production builds.
- CSV export/import (`toCSV`/`parseCSV`/`importCSV`) round-trips a lossy long-format (`date,category,intention,completed`) and merges into the active source by case-insensitive name match — it does not carry ids, colors, or targets.

### App shell: `src/App.tsx`

- Hash-based routing is the source of truth for the active tab (`#/journal`, `#/insights`, `#/manage`); a `hashchange` listener keeps React state in sync so Back/Forward work. A legacy `localStorage` key (`ih-tab`) is read once for upgrade continuity.
- Responsive by layout swap, not separate routes: `useMedia('(min-width: 880px)')` picks sidebar+centered-column (desktop) vs. bottom tab bar (mobile) around the same three screens (`EntryScreen`, `AnalyticsScreen`, `SettingsScreen`).
- The viewed Journal date is intentionally **not** persisted — the app always opens on today.

### Screens & components

`src/screens/` holds the three tab bodies (`EntryScreen`, `AnalyticsScreen`, `SettingsScreen`) plus `Guide.tsx` (in-app help overlay). `src/components/` holds shared chrome (`ui.tsx` — TabBar/Sidebar/primitives, `ConsentBanner`, `UpdateBanner`, `Icon`). All of them call into `src/data/store.ts` directly for reads and mutations, then call the `bump`/`version` callback passed down from `App.tsx` to force a re-render (there's no reactive subscription — mutations are synchronous and the caller re-renders explicitly).

### Versioning: `vite.config.ts` + `src/version.ts`

App version is derived from git at build time, not hand-bumped: minor = count of first-parent commits on `main` (so each merge counts once), baked in as `__APP_VERSION__`/`__GIT_SHA__` compile-time constants. Falls back to a `dev` marker if git is unavailable.

### E2E tests: Playwright + Serenity/JS Screenplay pattern

Full pattern reference: `e2e/SCREENPLAY.md`. Running/reporting reference: `e2e/README.md`.

Strict layering — **never break these boundaries**:

| Layer     | File                  | Rule                                                                                     |
| --------- | --------------------- | ---------------------------------------------------------------------------------------- |
| Locators  | `e2e/elements.ts`     | `data-testid`-based only, never text/CSS class                                           |
| Tasks     | `e2e/tasks.ts`        | _Do_, never assert. End on an observable settle (`Wait.until(...)`), never a fixed sleep |
| Questions | `e2e/questions.ts`    | _Read_, never act. Return native values (string/number/boolean/array)                    |
| Specs     | `e2e/specs/*.spec.ts` | Compose Tasks + Questions via `actor.attemptsTo(...)`; never touch a locator directly    |

Adding coverage = adding a locator (if needed) → a Task or Question → a spec line, in that order. Determinism comes from a seed injected onto `window.__IH_E2E_SEED__` before boot (`e2e/fixtures.ts`), read by `maybeSeedForE2E()` in `store.ts`; completions are expressed as day-offsets-from-today so date-window math is correct regardless of run date. This whole mechanism is gated behind `import.meta.env.DEV`, which is why e2e always runs against the Vite dev server, never a production build.

### Spec-driven changes: OpenSpec (`openspec/`)

Non-trivial changes are driven through OpenSpec rather than ad-hoc instructions, using the `/opsx:*` slash commands (skills under `.claude/`/`.agent/skills/`):

1. `/opsx:explore` _(optional)_ — think through the idea first.
2. `/opsx:propose <name>` — creates `openspec/changes/<name>/` with `proposal.md`, `design.md`, `tasks.md`, and spec deltas.
3. `/opsx:apply` — implement `tasks.md` against real source + tests.
4. `/opsx:archive` — move the change to `openspec/changes/archive/<date>-<name>/` and fold deltas into the living specs under `openspec/specs/`.

`openspec/specs/` is the current living spec set (one directory per capability, e.g. `completion-targets`, `data-source-toggle`, `e2e-screenplay-framework`); `openspec/changes/archive/` is the dated changelog of intent. Check both before assuming a behavior is undocumented.

## Conventions worth knowing

- Comments in this codebase explain _why_, not _what_ — match that style (see any function in `store.ts`).
- Don't add `data-testid` selection by text/class in e2e code — always thread a testid through `elements.ts`.
- Mock data (`VITE_ENABLE_MOCK_DATA`) is a dev/demo convenience, gated off by default — don't assume it's available or wire new features to depend on it.
- Formatting is enforced by a `pre-commit` hook (Prettier via lint-staged) — don't hand-format as part of a change, the hook re-stages the formatted result automatically. See `.prettierignore` before adding new prose/vendored content: OpenSpec artifacts, the frozen design handoff export, and files with hand-aligned whitespace-as-data are deliberately excluded.
- Commit messages auto-carry `Claude-Code-Version` / `OpenSpec-Version` trailers (via `prepare-commit-msg`), and `versions/claude-code` / `versions/openspec` hold the canonical, diffable per-tool version history — don't hand-edit either.

When raising PRs record the version of claude code and openspec used in the development of the change in the description.
