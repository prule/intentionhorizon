## Why

The app ships with one IndexedDB store seeded with fabricated demo data (`buildSeed`). There's no clean way to explore the app with rich sample data and also keep a real, personal dataset — the only control is "Reset to sample data", which destroys whatever was there. Users need to flip between a **mock** dataset (lively demo for screenshots/evaluation) and their **real** dataset (starts empty, accumulates genuine entries) without one clobbering the other, and the choice must survive a reload.

## What Changes

- Introduce two **isolated local datasets**: `mock` (seeded demo data) and `real` (user's own, starts empty). They live in separate IndexedDB stores so switching never overwrites the other.
- Add a persisted **active data source** flag (localStorage) read at startup; `initStore` hydrates the matching dataset before first paint.
- Add a **data-source switcher** in Settings to toggle between Mock and Real; switching re-hydrates the in-memory cache and re-renders the app.
- Mock dataset auto-seeds on first use; Real dataset starts empty (no fabricated history).
- **BREAKING** (data layout): the single `intention-horizon` IndexedDB database is replaced by per-source databases. Existing data is migrated into the `real` source on first run so no user data is lost.

## Capabilities

### New Capabilities
- `data-source-toggle`: Defines the mock/real data sources, the persisted active-source selection, startup hydration of the selected source, runtime switching, and isolation guarantees between sources.

### Modified Capabilities
<!-- None — `typescript-codebase` concerns build typing only; no spec-level requirement changes there. -->

## Impact

- **Code**: `src/data/store.ts` (per-source Dexie databases, active-source flag, switch API, one-time migration of legacy DB into `real`); `src/main.tsx` (hydrate selected source at startup); `src/screens/SettingsScreen.tsx` (switcher UI); `src/App.tsx` (re-render on switch).
- **Storage**: replaces single IndexedDB DB `intention-horizon` with per-source DBs; adds a localStorage key for the active source.
- **Dependencies**: none added — uses existing Dexie + localStorage.
- **Runtime**: data shown depends on selected source; default and migrated state preserve current behavior for existing users.
