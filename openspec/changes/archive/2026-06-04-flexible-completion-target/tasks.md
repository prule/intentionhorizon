## 1. Data model & store

- [x] 1.1 In `src/data/store.ts`, replace `target7` / `target30` on the `Intention` type with `targetCompletions: number` and `targetPeriodDays: number`; update `IntentionInput` likewise. Keep optional legacy `target7?`/`target30?` readable for migration only.
- [x] 1.2 Update the Dexie schema comment on the `intentions` table to list the new fields.
- [x] 1.3 Update `createIntention` defaults: `targetCompletions: data.targetCompletions ?? 3`, `targetPeriodDays: data.targetPeriodDays ?? 7`.
- [x] 1.4 Add read-time migration in `load()` and the legacy-import path: when a stored intention has `target7` but no `targetCompletions`, set `targetCompletions = target7`, `targetPeriodDays = 7`, and strip the legacy fields before persisting.

## 2. Status & analytics logic

- [x] 2.1 Update `dayMetric` to evaluate each target-enabled intention via `windowCount(it.id, date, it.targetPeriodDays) >= it.targetCompletions` instead of the hardcoded 7-day / `target7` comparison.
- [x] 2.2 Verify `statusFor` still works unchanged (it takes count + target); confirm callers pass `targetCompletions` and the window count.

## 3. UI

- [x] 3.1 `src/screens/EntryScreen.tsx`: replace the `stat-7d` / `stat-30d` pair with a single stat using `windowCount(intention.id, date, intention.targetPeriodDays)` vs `targetEnabled ? targetCompletions : null`. Label dynamically (e.g. `{targetPeriodDays}d`), testid `stat-target`.
- [x] 3.2 `src/components/ui.tsx`: confirm/adjust the `Stat` component for the single-target case (count vs target, dynamic label).
- [x] 3.3 `src/screens/SettingsScreen.tsx`: replace the two `target7` / `target30` steppers with a `targetCompletions` input and a `targetPeriodDays` input (both min 1); update the blank `IntentionInput`.
- [x] 3.4 `src/screens/SettingsScreen.tsx`: change the target badge from `{target7}/wk` to `{targetCompletions}/{targetPeriodDays}d`.
- [x] 3.5 `src/screens/Guide.tsx`: update target explanation copy to describe the single flexible target.

## 4. Seed data

- [x] 4.1 Update all seed intentions in `src/data/store.ts` to use `targetCompletions` / `targetPeriodDays` (map existing `target7` → completions, period 7).

## 5. Tests

- [x] 5.1 Update `e2e/fixtures.ts` intention fixtures to the new fields.
- [x] 5.2 Update `e2e/specs/targets.spec.ts` for the single target stat, new testids (`stat-target`), Settings inputs, and badge text.
- [x] 5.3 Update `e2e/specs/analytics.spec.ts` and any `e2e/tasks.ts` / `e2e/questions.ts` helpers referencing old target fields/testids.

## 6. Verify

- [x] 6.1 Run typecheck/build and the Playwright suite; confirm green.
- [x] 6.2 Manually verify migration: load with legacy-shaped stored data and confirm targets render correctly.
