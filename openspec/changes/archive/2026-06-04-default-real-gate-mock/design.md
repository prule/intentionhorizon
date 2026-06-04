## Context

`src/data/store.ts` exposes `getDataSource()` which reads `localStorage('ih-data-source')` and defaults to `'mock'` when unset. `initStore`/`switchDataSource` hydrate from the active source; `SettingsScreen` always renders a `DataSourceSwitcher` (Mock/Real). Existing users were migrated to `real` once (migration sets the flag), so only fresh installs currently land on `mock`.

The app is a static Vite SPA. Vite exposes build-time env vars prefixed `VITE_` on `import.meta.env`. There is no `vite-env.d.ts` and `tsconfig` does not include `vite/client` types, so `import.meta.env` is currently untyped.

## Goals / Non-Goals

**Goals:**
- Fresh installs default to `real`.
- Mock source (and its switcher) available only when a build-time flag is enabled.
- When the flag is off, the app always uses `real`, even if `mock` was previously persisted.
- Typed access to the new env var.

**Non-Goals:**
- A runtime/user-facing setting to enable mock (it is a build-time concern).
- Removing mock data or the switcher code (kept, just gated).
- Changing source isolation, migration, or the per-source DB design.
- Erasing a previously persisted `mock` selection.

## Decisions

### Decision 1: Build-time flag via `import.meta.env.VITE_ENABLE_MOCK_DATA`
Read a single boolean-ish env var. Treat the string `'true'` (or `'1'`) as enabled; anything else (including unset) as disabled.

- **Why:** Vite's standard mechanism; tree-shakeable and zero runtime cost; matches "env var?" from the request. Mock is opt-in, so the safe default (unset) hides it.
- **Alternative considered:** A runtime localStorage flag. Rejected — the intent is to keep mock out of normal builds entirely, which a build-time flag expresses cleanly.

### Decision 2: A single `mockEnabled()` predicate in the store
Centralize the flag read in `store.ts` (e.g. `export const mockEnabled = () => import.meta.env.VITE_ENABLE_MOCK_DATA === 'true'`). Both the store and the Settings UI consult it.

- **Why:** One source of truth; avoids the UI and data layer disagreeing.

### Decision 3: Default to `real`; force `real` when mock disabled
`getDataSource()` returns the persisted value if valid, else defaults to `real`. Add an effective-source rule: if mock is disabled, the effective source is always `real` regardless of the persisted value (persisted `mock` is ignored, not deleted).

- **Why:** Guarantees disabled builds never read mock data, while preserving a user's stored choice for builds where mock is enabled again.
- **Note:** `getDataSource()` keeps returning the raw persisted value for the switcher to reflect; the *effective* source used by `initStore`/`switchDataSource` applies the force-to-real rule. Keeping these distinct avoids overwriting the user's stored preference.

### Decision 4: Gate the switcher in Settings
`SettingsScreen` renders `DataSourceSwitcher` only when `mockEnabled()` is true. The source-aware reset label logic stays (effective source is `real` when disabled, so it shows the "Clear all data" path).

- **Why:** Hides mock from normal users; no dead UI.

### Decision 5: Add `src/vite-env.d.ts`
Add `/// <reference types="vite/client" />` plus an `ImportMetaEnv` augmentation declaring `VITE_ENABLE_MOCK_DATA?: string`.

- **Why:** Types `import.meta.env` and the custom var so `tsc --noEmit` stays clean.

## Risks / Trade-offs

- **A user already on `mock` (flag enabled) gets a disabled build** → effective source forces `real`; their `mock` data stays in its DB and their stored preference is untouched, so re-enabling the flag restores it.
- **Env var truthiness confusion (`'false'` is a truthy string)** → compare explicitly to `'true'`/`'1'`; never rely on raw truthiness.
- **Forgetting the flag in dev** → document `VITE_ENABLE_MOCK_DATA=true` (e.g. in `.env.local` / README) so developers can still reach the demo data.

## Migration Plan

1. Add `src/vite-env.d.ts` typing the env var.
2. Add `mockEnabled()` and the effective-source rule in `store.ts`; change the default to `real`.
3. Gate the switcher in `SettingsScreen` on `mockEnabled()`.
4. Document the env var.
5. Rollback: revert the three files; persisted sources and DBs are untouched.
