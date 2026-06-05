## 1. Rename the page label

- [x] 1.1 Change the `entry` tab label from "Today" to "Journal" in `TabBar` (`src/components/ui.tsx`)
- [x] 1.2 Change the `entry` tab label from "Today" to "Journal" in `Sidebar` (`src/components/ui.tsx`)
- [x] 1.3 Change the `ScreenHeader` title from "Today" to "Journal" in `src/screens/EntryScreen.tsx`
- [x] 1.4 Update Guide copy in `src/screens/Guide.tsx` that refers to "Today" to read "Journal"

## 2. Update routing

- [x] 2.1 Change `TAB_TO_SLUG.entry` from `'today'` to `'journal'` in `src/App.tsx`
- [x] 2.2 Change the `SLUG_TO_TAB` key from `today` to `journal` (mapping to `'entry'`)
- [x] 2.3 Verify an inbound `#/today` is treated as unknown and falls back to the default page via the existing `replaceState` path

## 3. Add return-to-today control

- [x] 3.1 In `DateNav` (`src/screens/EntryScreen.tsx`), add a control that calls `setDate(IH.today())`
- [x] 3.2 Show the control only when the viewed day is not today (`!IH.sameKey(date, IH.today())`); hide it when on today
- [x] 3.3 Give the control an accessible label and a `data-testid` consistent with the existing `date-prev` / `date-next` buttons

## 4. Tests & verification

- [x] 4.1 Update e2e/screenplay specs and selectors that assert the `#/today` hash or the "Today" label
- [x] 4.2 Add coverage: navigating back shows the return-to-today control, and activating it returns to today
- [x] 4.3 Add coverage: opening `#/today` falls back to the default page and normalizes the URL (no spurious history entry)
- [x] 4.4 Run the test suite and the dev build to confirm no regressions
