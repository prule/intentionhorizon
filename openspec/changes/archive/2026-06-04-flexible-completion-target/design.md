## Context

Targets live entirely on the `Intention` type in `src/data/store.ts` as two fixed fields, `target7` and `target30`, persisted in Dexie (IndexedDB). The Entry screen renders two stats via `windowCount(id, date, 7)` / `windowCount(id, date, 30)`; `dayMetric` hardcodes a 7-day window for "targets met"; Settings edits the two values with steppers; the Settings list badge shows `{target7}/wk`. The app is a local-first PWA with real user data already stored, so the field change is a data-model migration, not just a code refactor.

## Goals / Non-Goals

**Goals:**
- Replace `target7`/`target30` with `targetCompletions` + `targetPeriodDays` end to end (types, store, persistence, UI, seed, tests).
- Migrate existing stored data without loss.
- Keep `windowCount` (it already takes an arbitrary `days` arg — no change needed).

**Non-Goals:**
- Calendar-aligned periods (e.g. "this ISO week"). Periods stay as trailing N-day windows, matching current `windowCount` semantics.
- Multiple targets per intention.
- Changing the heatmap/aggregate visuals beyond the target source.

## Decisions

**Field shape: `targetCompletions: number` + `targetPeriodDays: number`.**
Matches the user's stated model directly (completions=N, period=M days). Alternative considered: keep a generic `{count, days}` object — rejected as needless nesting for two scalars that Dexie stores flat alongside the existing fields.

**Reuse `windowCount(id, date, targetPeriodDays)`.** It already counts completions in a trailing `days` window, so status becomes `statusFor(windowCount(id, date, it.targetPeriodDays), it.targetEnabled ? it.targetCompletions : null)`. No new counting primitive.

**Migration at read time in `load()` / legacy import.** When hydrating a stored intention, if `targetCompletions` is absent but `target7` exists, set `targetCompletions = target7`, `targetPeriodDays = 7`, and drop the legacy fields. This is idempotent and avoids a destructive one-shot schema bump. Dexie table key is `id`; no index on target fields, so no schema version bump is required — only the stored object shape changes.

**Single Entry stat.** Replace the `stat-7d` / `stat-30d` pair with one stat. New testid `stat-target` (keep label dynamic, e.g. `{targetPeriodDays}d`). Existing e2e tests referencing `stat-7d`/`stat-30d` must be updated.

**Settings editor.** Two inputs: a stepper/number for `targetCompletions` and one for `targetPeriodDays`. Validate both ≥ 1. Badge text becomes `{targetCompletions}/{targetPeriodDays}d`.

## Risks / Trade-offs

- [Stored data uses old fields] → Read-time migration in `load()` and the legacy-import path; covered by a migration scenario in the spec.
- [Period larger than seeded/available history] → `windowCount` simply counts what exists; status still computes correctly (just naturally `under` early on). Acceptable.
- [e2e tests reference removed testids `stat-7d`/`stat-30d`/`target7`/`target30`] → Update fixtures and assertions as part of the change; enumerated in tasks.
- [`targetPeriodDays` very large (e.g. 365) loops day-by-day in `windowCount`] → 365 iterations per intention per evaluated date is trivial; no perf concern.

## Migration Plan

1. Add new fields to `Intention` / `IntentionInput`; keep optional legacy fields readable during migration only.
2. In `load()` and legacy import, map `target7`→`targetCompletions`, set `targetPeriodDays = 7`, strip legacy fields before persisting.
3. Update seed data, `createIntention` defaults (`targetCompletions ?? 3`, `targetPeriodDays ?? 7`), UI, and tests.
4. Rollback: revert code; migrated records carry the new fields but a reverted build reads `target7 ?? 3` defaults — acceptable for a local-first app (no shared backend).

## Open Questions

- Should the Settings period input be free-form days or a small preset list (7/30/365)? Default to a free-form number input with min 1; presets can come later.
