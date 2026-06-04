## Why

The e2e suite covers logging, date nav, intention CRUD, insights rendering, and persistence — but three high-value areas are still untested: category management (with its orphan-reparenting logic), per-intention targets (the 7d/30d goal display), and whether the analytics screen actually computes the right numbers (streaks, totals) rather than merely rendering. Bugs in these would be silent.

## What Changes

- Add e2e coverage for **category CRUD**: create a category, edit its name, delete it, and confirm deleting a category moves its intentions to Uncategorized (the documented behavior in `deleteCategory`).
- Add e2e coverage for **targets**: create an intention with targets enabled and 7d/30d values, and assert the target shows on the Today screen and the `n/wk` badge on Manage.
- Add e2e coverage for **analytics correctness**: against a deterministic seed, assert the Insights streak tiles (current / best / 30-day rate) and the Totals sum reflect the seeded completions, and that selecting a filter chip re-scopes the numbers.
- Add the `data-testid` hooks these journeys need (category editor + section headers, targets switch/steppers, target badge, filter chips, streak tiles, totals sum).
- Extend the screenplay layer with the Tasks/Questions for these flows.

## Capabilities

### New Capabilities
<!-- None: extends existing e2e-testing capability. -->

### Modified Capabilities
- `e2e-testing`: the journey-coverage requirement gains scenarios for category management, targets, and analytics correctness; the screenplay layer and selectors grow to support them.

## Impact

- **Touched source** (test-only `data-testid` additions, no behavior change):
  - `src/screens/SettingsScreen.tsx` — category editor name/save/delete, "Add category" button, per-category Edit button + section header, target switch/steppers, target badge.
  - `src/screens/AnalyticsScreen.tsx` — filter chips, streak tiles, totals sum.
- **New/extended test files**: `e2e/specs/category-crud.spec.ts`, `e2e/specs/targets.spec.ts`, `e2e/specs/analytics.spec.ts`; new Tasks/Questions in `e2e/tasks.ts` / `e2e/questions.ts`; possibly a tailored seed per analytics test via the existing `seed` fixture option.
- No new dependencies.
