## Context

The Journal page (`src/screens/EntryScreen.tsx`, `DateNav`) currently steps one day at a time and caps how far back the user can go with a hard-coded `minDate = addDays(today, -N)`. Completions are stored per-day in Dexie (`completions` table, keyed by `dateKey`, indexed on `dateKey`). There is no existing query that summarizes which months have data — everything today reads/writes single-day or fixed-window (7/30-day) slices via the in-memory `AppState` produced by `load()`.

We're replacing the fixed-day-count cap with a data-driven bound, and adding a "jump to month" popup so the user can navigate directly to any month/year that has at least one completion, without paging one day at a time. The popup should reuse the existing `Sheet` modal component (see `modal-dialog` spec) rather than introduce a new dialog primitive.

## Goals / Non-Goals

**Goals:**
- Let the user open a popup from the Journal page, see a list of month/year periods that contain at least one recorded completion, and jump straight to one.
- Bound the previous-day step control by actual data availability instead of an arbitrary fixed day count.
- Keep next-day step capped at today, unchanged.
- Keep the change scoped to the Journal page's navigation; no changes to Insights/Analytics.

**Non-Goals:**
- No full calendar/date-grid picker — the dialog lists months, not individual days.
- No change to how completions are stored, toggled, or migrated.
- No change to the 1-day step buttons' visual design beyond what's needed to add the new trigger control.
- Not attempting to support navigating to months in the future (the app has no future completions).

## Decisions

**1. Compute "months with data" from the `completions` table, not `AppState`.**
`load()` builds an in-memory snapshot keyed by intention, which is fine for per-day lookups but not for "distinct months across all intentions." Add a store function, e.g. `monthsWithData(): { year: number; month: number }[]`, that reads the Dexie `completions` table once (all rows, since the table only stores dateKeys — it's already the minimal working set), derives distinct `YYYY-MM` prefixes from `dateKey`, and returns them sorted descending (most recent first). This runs once when the dialog opens, not on every render.
- Alternative considered: maintain a running summary (e.g. a `monthsIndex` table) updated on every `toggleCompletion`. Rejected as premature — completions tables are small (one row per completed intention-day), a full scan is cheap, and it avoids a second source of truth to keep in sync.

**2. Bound previous-day navigation by the earliest date with data, not a fixed count.**
Derive `earliestDate` from the same scan used for `monthsWithData()` (or a small dedicated `earliestCompletionDate()` helper). `canPrev = date > earliestDate`. If there is no data at all, previous-day navigation is disabled (nothing to go back to before today). This removes the old `-N days` cap entirely — it was an arbitrary limit disconnected from what the user actually has to look at.
- Alternative considered: keep a separate fixed cap (e.g. 30 days) as a performance/UX safety net independent of data availability. Rejected per the proposal's direction — the whole point of this change is to stop bounding navigation by an arbitrary day count.

**3. Reuse `Sheet` for the popup; list months grouped by year, most recent first.**
The dialog shows a scrollable list of years, each expandable/listing its months with data (or a flat "MMM YYYY" list if that's simpler given the likely small number of months for this app's usage pattern). Selecting a month closes the dialog and navigates the Journal `date` state to a specific day within that month.
- **Which day within the month?** Navigate to the most recent day within that month that has a completion (via a small `latestCompletionInMonth(year, month)` helper), not the 1st. This lands the user on a day they'll actually see data for, matching the intent ("view it") better than an arbitrary 1st-of-month that might have no entries.
- Alternative considered: always land on the 1st of the month. Rejected — for a sparse month this could show an empty day, undermining the point of picking a month "that has data."

**4. Trigger control placement.**
Add a small button (e.g. calendar icon, `data-testid="date-jump"`) inside the existing `DateNav` row, near the date label, that opens the `Sheet`. Keeps the one-day step buttons (`date-prev`/`date-next`) untouched in position and behavior.

## Risks / Trade-offs

- **[Risk]** Scanning the full `completions` table on every dialog open could be slow for long-time users with thousands of rows. → **Mitigation**: this is a single indexed-table read (no per-row Dexie round trip), done once per dialog open, not per keystroke/render; acceptable for expected data volumes. Revisit with a maintained index only if profiling shows it's a problem.
- **[Risk]** Removing the fixed back-navigation cap changes behavior for existing users who relied on (or were constrained by) the old limit — this is called out as **BREAKING** in the proposal. → **Mitigation**: the new bound (earliest data) is strictly more permissive, never more restrictive, so no user loses access to previously-viewable days.
- **[Trade-off]** Landing on the latest-completion day in the chosen month (Decision 3) rather than the 1st is a judgment call about what "view it" means. → Acceptable since it directly serves the stated goal of letting the user see data, and is easy to revisit if it feels surprising in practice.

## Migration Plan

No data migration needed — this is a read-only query addition plus a UI/behavior change over existing completion records. Ship as a single change; no feature flag needed since behavior is strictly additive/more permissive for existing data.

## Open Questions

- Should the month/year picker also show months with *zero* data (grayed out) for calendar context, or omit them entirely as currently designed? Current design omits them per the proposal ("only offers months that contain at least one recorded completion").
