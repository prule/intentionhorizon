## Why

The daily entry page is labelled "Today", but it isn't always today — users can navigate up to 7 days back through their history. The fixed "Today" label is misleading when viewing a past day, and there is no quick way to jump back to the current day once the user has navigated away from it.

## What Changes

- Rename the daily entry page from **Today** to **Journal** everywhere it is user-visible: the tab bar label, the sidebar label, and the screen header title.
- Add a **return-to-today** control on the Journal screen that is shown only when the user has navigated to a day other than today; activating it resets the viewed day back to today. It is hidden (or disabled) when already on today.
- Rename the page's URL hash slug from `#/today` to `#/journal`. The old `#/today` hash is dropped; like any unknown route it falls back to the default page.
- Update Guide copy that refers to the page as "Today" so it reads "Journal".

## Capabilities

### New Capabilities
- `journal-page`: The daily entry page is named "Journal" and provides a control to return to the current day when viewing a past day.

### Modified Capabilities
- `url-routing`: The default/daily page is named Journal and is addressed at `#/journal`; the former `#/today` hash is no longer recognized and falls back to the default page.

## Impact

- `src/components/ui.tsx` — TabBar and Sidebar `entry` labels ("Today" → "Journal").
- `src/screens/EntryScreen.tsx` — `ScreenHeader` title and the new return-to-today control in `DateNav`.
- `src/App.tsx` — `TAB_TO_SLUG` / `SLUG_TO_TAB` slug rename (`today` → `journal`).
- `src/screens/Guide.tsx` — copy referencing "Today".
- E2E tests/specs that assert the `#/today` hash or "Today" label.
