## Context

`src/data/store.ts` hydrates a single in-memory `state` cache from one Dexie database (`intention-horizon`) at startup (`initStore`). Reads are synchronous against the cache; mutations update the cache and persist through a serialized write queue. On an empty DB, `buildSeed()` fabricates ~92 days of demo history. The only data control today is `resetSeed()` (wired to "Reset to sample data" in Settings), which overwrites everything.

There is no remote backend (deps: dexie, react). "Real data" therefore means the user's own local dataset, kept separate from the demo seed.

## Goals / Non-Goals

**Goals:**
- Two isolated local datasets — `mock` (seeded) and `real` (starts empty) — that never overwrite each other.
- Active source persists across reloads; selected source hydrates before first paint.
- Switch sources at runtime from Settings with a full re-render.
- Preserve existing users' data: migrate the legacy single DB into the `real` source once.

**Non-Goals:**
- Remote/API data sources or sync.
- More than two sources, or user-defined source names.
- Changing the compute/read layer or domain types.
- Merging data across sources.

## Decisions

### Decision 1: Per-source Dexie databases (not a discriminator column)
Give each source its own Dexie database, named by source: `intention-horizon-mock` and `intention-horizon-real`. `initStore` opens only the active source's DB.

- **Why:** Hard isolation with zero query changes — every existing table query stays identical, just pointed at a different DB instance. Deleting/resetting one source can't touch the other.
- **Alternative considered:** A `source` column on each row in one DB. Rejected — every read/write/index would need a source filter, raising the chance of cross-source leakage and touching far more code.

### Decision 2: Active source persisted in localStorage
Store the active source under key `ih-data-source` (values `'mock' | 'real'`), read synchronously at startup. This matches existing app-state persistence (`ih-tab`, `ih-entry-date` in `App.tsx`).

- **Why:** Synchronous read available before `initStore`; consistent with current conventions; trivial.
- **Default:** when unset, default to `mock` for a brand-new install (lively first impression), but the migration path (Decision 4) sets it to `real` for existing users so they keep seeing their data.

### Decision 3: Seed only the mock source
`mock` auto-seeds via `buildSeed()` when its DB is empty; `real` starts empty (no fabricated history) and only fills as the user logs entries. `resetSeed` becomes source-aware: it reseeds when on `mock`, and clears to empty when on `real`.

- **Why:** Matches the chosen semantics — mock is the demo, real is genuine.

### Decision 4: One-time migration of the legacy DB into `real`
On first run after this change, if the legacy `intention-horizon` DB exists with data and the `real` DB is empty, copy its rows into `intention-horizon-real`, set `ih-data-source = 'real'`, and mark migration done (e.g. localStorage flag `ih-ds-migrated`). Leave the legacy DB in place (read-only) as a safety net.

- **Why:** Existing users keep their data and keep seeing it by default. Non-destructive — legacy DB untouched, so rollback is possible.

### Decision 5: Switch = persist flag + re-hydrate + bump version
`setDataSource(source)` writes the localStorage flag, re-runs hydration for the new source (opening/seeding its DB as needed), swaps the in-memory `state`, and the caller bumps App's `version` to re-render. Hydration is async; the switcher awaits it before bumping so the UI never reads a half-swapped cache.

- **Why:** Reuses the existing `bump()` re-render mechanism already threaded through screens.

## Risks / Trade-offs

- **In-flight writes during a switch land in the wrong DB** → `setDataSource` drains/awaits the serialized write queue before swapping `state` and the active DB handle.
- **Two open Dexie connections** → open only the active source's DB; close the previous handle on switch to avoid lingering connections.
- **Migration runs twice or partially** → guard with a localStorage `ih-ds-migrated` flag set only after a successful transactional copy; copy is idempotent (skips if `real` already has data).
- **Stale reads right after switch** → hydration completes and `state` is swapped before `bump()` fires; screens read synchronously only after re-render.
- **Default source surprises existing users** → migration sets `ih-data-source = 'real'`, so only fresh installs get `mock`.

## Migration Plan

1. Ship per-source DBs + active-source flag + switch API in `store.ts`.
2. On `initStore`: run one-time legacy migration (copy legacy → `real`, set source to `real`, set migrated flag) if applicable; otherwise read `ih-data-source` (default `mock`).
3. Hydrate the active source (seed `mock` if empty).
4. Rollback: clear `ih-data-source` and `ih-ds-migrated`; legacy `intention-horizon` DB is untouched and can be re-read.
