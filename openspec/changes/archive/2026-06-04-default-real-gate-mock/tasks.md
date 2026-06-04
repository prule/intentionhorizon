## 1. Env var typing

- [x] 1.1 Add `src/vite-env.d.ts` with `/// <reference types="vite/client" />` and an `ImportMetaEnv` augmentation declaring `readonly VITE_ENABLE_MOCK_DATA?: string`

## 2. Store: default real + gate mock

- [x] 2.1 In `src/data/store.ts`, add `export const mockEnabled = () => import.meta.env.VITE_ENABLE_MOCK_DATA === 'true'`
- [x] 2.2 Change `getDataSource()` default from `'mock'` to `'real'` when unset (still returns the raw persisted value when valid)
- [x] 2.3 Add an effective-source rule: when `mockEnabled()` is false, the source used by `initStore`/`switchDataSource` is forced to `'real'` regardless of the persisted value, without overwriting the persisted selection
- [x] 2.4 Ensure `switchDataSource('mock')` is a no-op (or refused) when mock is disabled, so the app can never hydrate mock in a disabled build

## 3. Settings UI gating

- [x] 3.1 In `src/screens/SettingsScreen.tsx`, render `DataSourceSwitcher` only when `IH.mockEnabled()` is true
- [x] 3.2 Confirm the reset row still resolves correctly (effective source is `real` when disabled → "Clear all data")

## 4. Docs

- [x] 4.1 Document `VITE_ENABLE_MOCK_DATA=true` for enabling mock in dev (e.g. `.env.local` example + a README note)

## 5. Verify

- [x] 5.1 Run `npm run typecheck` clean (with and without the env var typed)
- [x] 5.2 Manual (flag off): fresh load defaults to `real`, Settings shows no switcher, app shows real (empty) data
- [x] 5.3 Manual (flag off, persisted mock): with `ih-data-source=mock` set, app still uses `real` and the persisted value is not erased
- [x] 5.4 Manual (flag on): switcher appears and Mock/Real switching works as before
