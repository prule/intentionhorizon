## 1. Store: per-source databases

- [x] 1.1 Add a `DataSource = 'mock' | 'real'` type and per-source DB names (`intention-horizon-mock`, `intention-horizon-real`) in `src/data/store.ts`
- [x] 1.2 Refactor `IntentionHorizonDB` so a Dexie instance is created for a given source name; track the active DB handle as a module variable instead of the single `db` const
- [x] 1.3 Update `enqueue`/persist functions (`persistCategories`, `persistIntentions`, `persistAll`) and mutation persistence to use the active DB handle

## 2. Store: active source + hydration

- [x] 2.1 Add `getDataSource()`/`setDataSource()` backed by localStorage key `ih-data-source`, defaulting to `'mock'` when unset
- [x] 2.2 Refactor `initStore` to hydrate the active source: open its DB, seed via `buildSeed()` only when source is `mock` and DB is empty; leave `real` empty when empty
- [x] 2.3 Implement `switchDataSource(source)`: drain the write queue, close the previous DB handle, persist the new flag, open + hydrate the new source's DB, swap the in-memory `state`; return the new `AppState`
- [x] 2.4 Make `resetSeed` source-aware: reseed when on `mock`, clear to empty when on `real`

## 3. Store: legacy migration

- [x] 3.1 In `initStore`, before normal hydration, run a one-time legacy migration: if localStorage `ih-ds-migrated` is unset, the legacy `intention-horizon` DB has data, and `real` is empty, copy categories/intentions/completions into `intention-horizon-real`
- [x] 3.2 On successful migration set active source to `real`, set `ih-ds-migrated`, and leave the legacy DB intact; make the copy idempotent (skip if `real` already has data)

## 4. App wiring

- [x] 4.1 Confirm `src/main.tsx` still calls `initStore()` (now hydrating the active/migrated source) before mount; no change needed beyond verifying behavior
- [x] 4.2 In `src/App.tsx`, expose the active source to Settings and re-render via existing `bump()` after a switch resolves

## 5. Settings UI

- [x] 5.1 Add a data-source switcher (Mock / Real) to `src/screens/SettingsScreen.tsx` that calls `switchDataSource` then `bump()` once it resolves
- [x] 5.2 Reflect the active source as selected in the switcher; update the "Reset" row label/copy to reflect source-aware behavior (reseed vs clear)

## 6. Verify

- [x] 6.1 Run `npm run typecheck` clean
- [x] 6.2 Manual: add data on `real`, switch to `mock` and back — `real` data intact; reload keeps the last selected source
- [x] 6.3 Manual: confirm `mock` shows seeded history, `real` starts empty, and reset behaves per source
- [x] 6.4 Manual (upgrade path): with pre-existing legacy `intention-horizon` data, first run migrates it into `real` and defaults to `real`
