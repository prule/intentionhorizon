# Tasks

## 1. Open on today
- [x] 1.1 In `src/App.tsx`, initialize the entry date to `IH.today()` and remove
      the `localStorage` read from the `useState` initializer.
- [x] 1.2 Remove the `localStorage.setItem('ih-entry-date', ...)` write from
      `setDate` (collapse to plain state setter).

## 2. Sticky header
- [x] 2.1 In `src/screens/EntryScreen.tsx`, group the `ScreenHeader` and
      `DateNav` into a header wrapper pinned with `position: sticky; top: 0`,
      with an opaque background.
- [x] 2.2 Verify list rows scroll cleanly behind the pinned header on both
      mobile and desktop layouts (no show-through, no clipping).

## 3. Not-today tint
- [x] 3.1 Derive `isToday` at the header wrapper and set the wrapper background
      to an `--c-amber`-based tint when not today; normal background on today.
- [x] 3.2 Confirm header/date text stays legible against the amber tint.

## 4. Verify
- [x] 4.1 Run the app: open → lands on today, normal header background.
- [x] 4.2 Navigate back a day → header turns amber and stays pinned while
      scrolling the list; return-to-today control stays visible.
- [x] 4.3 Reload while on a past day → reopens on today (no persistence).
- [x] 4.4 Run unit + e2e suites; update any test that asserted persisted date or
      header-in-scroll behaviour.
