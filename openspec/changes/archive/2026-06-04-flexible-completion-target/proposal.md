## Why

The current target model is fixed to two windows: a 7-day target and a 30-day target. This forces every intention into a weekly/monthly rhythm and can't express common goals like "once a year" or "twice a fortnight." A single, user-defined target — N completions within M days — covers all of these cases with one concept.

## What Changes

- **BREAKING**: Replace the dual `target7` / `target30` fields on an intention with a single flexible target: `targetCompletions` (how many times) and `targetPeriodDays` (over how many days).
- Settings form: replace the two stacked steppers ("7-day target" / "30-day target") with one target editor — a completions count and a period-in-days input (e.g. completions=3, period=7 → "3× per 7 days").
- Entry screen: replace the fixed "7d" and "30d" stat pair with a single stat showing completions in the trailing `targetPeriodDays` window vs `targetCompletions`.
- Status calc (`statusFor`) and analytics "targets met" logic switch to the single target window instead of the hardcoded 7-day window.
- Target badge in Settings list shows the flexible target (e.g. `3/7d`) instead of `{target7}/wk`.
- Data migration: existing stored intentions with `target7`/`target30` are migrated to `targetCompletions = target7`, `targetPeriodDays = 7`.
- Seed data and Playwright test fixtures updated to the new fields.

## Capabilities

### New Capabilities
- `completion-targets`: Defines how an intention's target is expressed (N completions over M days), how completion counts are measured against it, and how target status (under/on/above) is derived for the Entry and Analytics screens.

### Modified Capabilities
<!-- None: no existing spec covers the target model. -->

## Impact

- `src/data/store.ts`: `Intention` / `IntentionInput` types, Dexie schema comment, `windowCount` usage, `statusFor`, `dayMetric`, seed data, `createIntention` defaults, persistence/migration (`load`, legacy import, test-seed path).
- `src/screens/EntryScreen.tsx`: single target stat replaces the 7d/30d pair.
- `src/screens/SettingsScreen.tsx`: target editor + badge.
- `src/components/ui.tsx`: `Stat` component (single target).
- `src/screens/Guide.tsx`: target explanation copy.
- `tests/` Playwright fixtures and assertions referencing `target7`/`target30`/`stat-7d`/`stat-30d`/`target-badge`.
- Persisted IndexedDB data (migration required for existing users).
