## Context

Three untested areas, all reachable through existing screens:

- **Categories** (`SettingsScreen.tsx`): a `CategoryEditor` sheet (name input, save, delete) opened from an "Add category" row or a per-section "Edit" button. `deleteCategory` reparents orphaned intentions to Uncategorized — the behavior most worth pinning down.
- **Targets** (`SettingsScreen.tsx` `IntentionEditor`): a `Switch` toggles targets; two `Stepper`s set 7d/30d. When enabled, the Manage list shows a `n/wk` badge and the Today `Stat` shows `count/target`.
- **Analytics** (`AnalyticsScreen.tsx`): `StreakStats` (current/best/30-day rate via `IH.streaks`), `TotalsBlock` (sum via `IH.aggregate`), and `FilterChips` that re-scope everything to one intention.

The harness already supports a per-test seed override via the `seed` fixture option, completions expressed as day-offsets from today — exactly what deterministic analytics assertions need.

## Goals / Non-Goals

**Goals:**
- Assert category create/rename/delete + orphan reparenting.
- Assert targets surface on both Manage (badge) and Today (count/target).
- Assert analytics *numbers* (streaks, totals) and filter re-scoping against a fixed seed.
- Add only the `data-testid`s these journeys require.

**Non-Goals:**
- Heatmap cell-level pixel/coloring assertions (visual, brittle) — assert the computed `count` text in a cell at most, not styling.
- Drag-reorder of categories/intentions (pointer-drag is brittle in e2e; defer or unit-test the reducer).
- Stepper edge clamping exhaustively (assert one representative path).

## Decisions

**Deterministic analytics via a tailored seed.** Use the `seed` fixture option per analytics test rather than the default seed, so streak/total math is predictable and independent of the real date. Pick offsets that yield an unambiguous current streak and total (e.g. completions on offsets 0,1,2 → current streak 3; known sum over the visible day window).

- *Why a per-test seed*: the default seed (Read on offsets 1,2,3, Workout none) was chosen for the logging tests; analytics assertions read cleaner with their own minimal seed. The fixture already supports `test.use({ seed })`.

**Questions read rendered numbers, not internals.** `StreakValue.of('current'|'best'|'rate')`, `TotalsSum`, and target display read visible text via `data-testid`, keeping tests honest about what the user sees. The seed makes the expected values computable by hand in the spec.

**New testids (test-only, no behavior change):**
- Categories: `category-name` (input), `save-category`, `delete-category`, `add-category` (row), `category-edit` + `data-category-name`, `category-section` + `data-category-name` on the section header.
- Targets: `targets-switch`, `target7-inc` / `target7-dec` (+ value `target7-value`), same for `target30`, and `target-badge` + `data-intention-name` on the Manage row.
- Analytics: `filter-chip` + `data-filter-name`, `streak-current` / `streak-best` / `streak-rate`, `totals-sum`.

**New screenplay vocabulary:**
- Tasks: `AddCategory`, `RenameCategory`, `DeleteCategory`, `AddIntentionWithTarget` (extends the add flow: toggle targets, set 7d), `FilterInsightsBy`.
- Questions: `CategoryList`, `TargetBadge.of(name)`, `StreakValue.of(kind)`, `TotalsSum`.

## Risks / Trade-offs

- **Streak "grace for today" logic** (`streaks` skips today if not yet logged) → seed completions starting at offset 0 (today logged) so the current-streak expectation is unambiguous; document the chosen offsets in the spec.
- **Totals window depends on grouping** (day grouping shows last 10 days) → assert with `day` grouping (default) and a seed confined to that window so the sum is exact.
- **Adding many testids touches Settings/Analytics broadly** → keep strictly to the elements these three journeys read; no speculative ids.
- **Orphan-reparenting assertion needs an intention in the deleted category** → seed a category with one intention, delete the category, assert the intention still lists under Uncategorized on Manage and still appears on Today.
