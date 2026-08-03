## 1. Store: data-driven navigation queries

- [x] 1.1 In `src/data/store.ts`, add `monthsWithData(): { year: number; month: number }[]` that scans the `completions` table's `dateKey`s, derives distinct `YYYY-MM` periods, and returns them sorted most-recent-first.
- [x] 1.2 Add `earliestCompletionDate(): Date | null` (or derive inline from the same scan) returning the earliest recorded completion date, or `null` when there is no data.
- [x] 1.3 Add `latestCompletionInMonth(year: number, month: number): Date | null` returning the most recent day within the given month/year that has a recorded completion.
- [x] 1.4 Add unit tests for `monthsWithData`, `earliestCompletionDate`, and `latestCompletionInMonth` in the existing store test suite, covering: no data, data in a single month, data spanning multiple years, and a month with no data (not returned by `monthsWithData`).

## 2. Journal page: remove fixed back-navigation cap

- [x] 2.1 In `src/screens/EntryScreen.tsx`, replace `DateNav`'s hard-coded `minDate = IH.addDays(t, -7)` with a bound derived from `IH.earliestCompletionDate()`; disable the previous-day control (`date-prev`) when there is no earlier data or no data at all.
- [x] 2.2 Leave the next-day control (`date-next`) behavior unchanged (bounded by today).

## 3. Journal page: jump-to-month picker

- [x] 3.1 Add a "jump to month" trigger button in `DateNav` (e.g. `data-testid="date-jump"`), hidden or disabled when `monthsWithData()` is empty.
- [x] 3.2 Build the picker dialog using the shared `Sheet` component (`src/components/ui.tsx`), listing months from `monthsWithData()` grouped/sorted most-recent-first.
- [x] 3.3 Wire month selection to close the dialog and call `setDate` with `latestCompletionInMonth(year, month)` for the chosen period.
- [x] 3.4 Ensure the pinned header, date label, and not-today amber tint update correctly after a picker-driven navigation, same as day-step navigation.

## 4. Tests

- [x] 4.1 Update `e2e/specs/date-navigation.spec.ts`: replace the "stops at the 7-day-back lower bound" test with a test that the previous-day control stays enabled past the old 7-day mark when earlier data exists, and disables only once the earliest day with data is reached.
- [x] 4.2 Add an e2e test that opens the jump-to-month picker, verifies only months with data are listed, selects a month, and asserts the Journal page navigates to a day within that month with data.
- [x] 4.3 Add an e2e test verifying the jump-to-month control is hidden/disabled when there is no historical data (e.g. a fresh/empty data source).
- [x] 4.4 Run the full unit and e2e suites and confirm no regressions in other Journal/date-navigation-adjacent tests (e.g. `journal-scroll.spec.ts`, `persistence.spec.ts`).

## 5. Spec validation

- [x] 5.1 Run `openspec validate add-journal-month-picker --strict` (or equivalent) and fix any issues before archiving.
