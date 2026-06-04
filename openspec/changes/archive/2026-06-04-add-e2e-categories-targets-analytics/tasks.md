## 1. Selectors — categories

- [x] 1.1 `SettingsScreen.tsx`: `data-testid="add-category"` on the Add category row button
- [x] 1.2 `data-testid="category-edit"` + `data-category-name` on each section's Edit button
- [x] 1.3 `data-testid="category-section"` + `data-category-name` on each section header
- [x] 1.4 `CategoryEditor`: `data-testid="category-name"` input, `save-category` (PrimaryButton testid), `delete-category` button

## 2. Selectors — targets

- [x] 2.1 `IntentionEditor`: `data-testid="targets-switch"` on the targets Switch
- [x] 2.2 Steppers: `target7-dec`/`target7-inc`/`target7-value` and `target30-*` (pass a testid base to `Stepper`)
- [x] 2.3 Manage intention row: `data-testid="target-badge"` + `data-intention-name` on the `n/wk` badge

## 3. Selectors — analytics

- [x] 3.1 `AnalyticsScreen.tsx` `FilterChips`/`Chip`: `data-testid="filter-chip"` + `data-filter-name`
- [x] 3.2 `StreakStats`: `data-testid="streak-current"` / `streak-best` / `streak-rate` on the value spans
- [x] 3.3 `TotalsBlock`: `data-testid="totals-sum"` on the sum number

## 4. Screenplay — tasks & questions

- [x] 4.1 Tasks: `AddCategory.named`, `RenameCategory.from().to()`, `DeleteCategory.named`
- [x] 4.2 Task: `AddIntentionWithTarget.named().sevenDay(n)` (open add, toggle targets, set 7d, save)
- [x] 4.3 Task: `FilterInsightsBy.intention(name)` / `.all()`
- [x] 4.4 Questions: `CategoryList.names()`, `TargetBadge.of(name)`, `StreakValue.of('current'|'best'|'rate')`, `TotalsSum.value()`

## 5. Specs — category CRUD

- [x] 5.1 `e2e/specs/category-crud.spec.ts`: create category → appears; rename → reflects; delete → gone
- [x] 5.2 Orphan reparenting: seed a category with one intention, delete the category, assert the intention remains (Uncategorized on Manage, still on Today)

## 6. Specs — targets

- [x] 6.1 `e2e/specs/targets.spec.ts`: add intention with targets + 7d value; Manage shows `n/wk` badge; Today shows count/target

## 7. Specs — analytics correctness

- [x] 7.1 `e2e/specs/analytics.spec.ts` with a tailored seed: assert `streak-current`, `streak-best`, `streak-rate`, and `totals-sum` match the seed
- [x] 7.2 Assert filtering by an intention chip re-scopes the streak/total figures

## 8. Verify

- [x] 8.1 Run `npm run e2e` — all new specs pass and existing specs stay green
- [x] 8.2 Run `npm run typecheck` / `npm run build` — no regressions, hook still tree-shaken
