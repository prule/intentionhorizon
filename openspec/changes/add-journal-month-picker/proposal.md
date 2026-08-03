## Why

The Journal page currently only lets the user step one day at a time, and how far back stepping is allowed has been an informal, hard-coded day count (a "max N days back" rule) rather than something tied to the user's actual data. That makes it slow to reach a specific past period (e.g. "May") and arbitrarily cuts the user off from days that do have recorded intentions just because they're outside the fixed window. Replacing the fixed day-count cap with a month/year picker scoped to periods that actually have data lets the user jump straight to any month they've used the app in, while keeping the familiar one-day-at-a-time stepping for local browsing.

## What Changes

- Keep the existing previous-day / next-day step controls on the Journal page for moving one day at a time.
- **BREAKING**: Remove the fixed "max days back" cap on day-by-day navigation. The previous-day control is instead bounded only by data availability (see below), not a fixed day count.
- Add a "Jump to month" control next to the date navigator that opens a popup dialog (reusing the existing `Sheet` modal component) for picking a month and year to view.
- The month/year picker only offers months that contain at least one recorded completion, so the user can't pick an empty period.
- Selecting a month/year in the picker navigates the Journal page to the first day of that month that has recorded data (falling back to the 1st of the month if the whole month is being viewed for other reasons), closes the dialog, and updates the pinned header/date label as normal.
- The next-day control remains capped at today (unchanged); the user still cannot navigate into the future.

## Capabilities

### New Capabilities

(none — this extends the existing Journal date-navigation behavior)

### Modified Capabilities

- `journal-page`: Adds a month/year picker dialog for jumping to any past period with data, and changes the previous-day step control from a fixed day-count cap to a data-availability-based bound.

## Impact

- `src/screens/EntryScreen.tsx`: `DateNav` component — remove the fixed `minDate = addDays(today, -N)` cap, add a "Jump to month" trigger button, and render the new picker dialog.
- `src/data/store.ts`: add a query to derive the distinct months (year + month) that have at least one completion recorded, and the earliest date with data, for use by both the picker and the new previous-day bound.
- Reuses the shared `Sheet` modal dialog component (see `modal-dialog` spec) for the popup — no new dialog primitive needed.
- No data migration required; this only changes navigation/query behavior over existing completion records.
