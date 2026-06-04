## Why

The data-source toggle ships with `mock` as the fresh-install default and the Mock/Real switcher always visible in Settings. For real users that's backwards: the app should open on their own (`real`) data, and the sample/demo data is a development and screenshot aid, not something every user should see or be able to switch into. We want `real` to be the default and the mock data source to be available only when explicitly enabled at build time.

## What Changes

- **BREAKING** (default behavior): a fresh install defaults to the `real` source instead of `mock`.
- Gate the mock data source behind a **build-time env var** (Vite `VITE_ENABLE_MOCK_DATA`). When it is not enabled:
  - the Mock/Real switcher is hidden in Settings;
  - the app uses `real` regardless of any previously persisted source (a stored `mock` selection is ignored, not erased).
- When the flag **is** enabled, behavior is unchanged: the switcher shows and mock/real work as today.
- Add TypeScript typing for the Vite env var (`src/vite-env.d.ts`).

## Capabilities

### New Capabilities
<!-- None — extends the existing data-source-toggle capability. -->

### Modified Capabilities
- `data-source-toggle`: the fresh-install default becomes `real`; the mock source and its runtime switcher are gated behind a build-time flag, with `real` enforced when the flag is off.

## Impact

- **Code**: `src/data/store.ts` (default source → `real`; effective source forced to `real` when the flag is off); `src/screens/SettingsScreen.tsx` (render the switcher only when the flag is enabled); new `src/vite-env.d.ts` (env typing).
- **Build/config**: new env var `VITE_ENABLE_MOCK_DATA` (unset/false by default → mock hidden); document it (e.g. `.env` / README note).
- **Dependencies**: none.
- **Runtime**: default users see `real` (empty until they log entries) and no mock switcher; existing migrated users are unaffected (already on `real`). Enabling the flag at build time restores the full toggle.
