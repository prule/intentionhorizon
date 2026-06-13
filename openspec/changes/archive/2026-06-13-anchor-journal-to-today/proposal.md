# Anchor Journal to today

## Why

The Journal lets users browse up to 7 days back. Toggling a completion on a past
day writes a real `completions` row, so editing the wrong day silently corrupts
streak and target data. Today three weaknesses make wrong-day edits easy:

1. The day label and return-to-today control sit in the header, which scrolls
   out of view — once the user scrolls into the list, nothing shows which day
   they are editing.
2. The "not today" signal is subtle (label text plus a small button); it is easy
   to miss while focused on tapping rows.
3. The viewed day is persisted to `localStorage` (`ih-entry-date`) and restored
   on launch, so reopening the app can drop the user straight onto a past day.

## What Changes

- **Sticky header.** The Journal screen header and date navigator stay pinned to
  the top while the intention list scrolls beneath them, on both mobile and
  desktop layouts. The viewed day and the return-to-today control are always
  visible.
- **Not-today tint.** When the viewed day is not today, the sticky header is
  tinted amber (`--c-amber`) as a loud visual indicator. On today the header uses
  its normal background.
- **Open on today.** The Journal always opens on today. The viewed day is no
  longer persisted; the `ih-entry-date` localStorage read and write are removed.

## Impact

- Affected specs: `journal-page`
- Affected code:
  - `src/screens/EntryScreen.tsx` — restructure so header + `DateNav` are a
    sticky region outside the scroll flow; apply amber tint when `!isToday`.
  - `src/App.tsx` — initialize date to `IH.today()`; remove localStorage read in
    `useState` initializer and write in `setDate`.
  - `src/styles.css` — sticky positioning / tint styling as needed.
- Non-goals: midnight rollover re-anchoring while the app is open; changing the
  7-day back-navigation window; tinting the scroll body or row area.
