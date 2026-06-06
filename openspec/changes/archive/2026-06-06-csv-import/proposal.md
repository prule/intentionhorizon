## Why

The app can export data as CSV but cannot import it. A user moving between browsers or devices (data lives only in that browser's IndexedDB) has no way to bring their intentions and history along. Export is currently a dead end.

## What Changes

- Add a **Import data from CSV** action in Settings, alongside the existing Export.
- Parse a CSV in the export's long format (`date,category,intention,completed`) and reconstruct categories, intentions, and completions into the active (real) data source.
- Reconstruct lossy fields with sensible defaults: categories created by name, intentions created by name within their category, colors assigned from the palette, targets left disabled (the export format carries no id/color/target columns).
- Merge semantics: importing matches existing categories/intentions by name (case-insensitive) rather than duplicating; completions are unioned with existing ones.
- Validate the file and report row/parse errors without partially corrupting the store (all-or-nothing apply).
- Confirm before import since it mutates the active dataset.

## Capabilities

### New Capabilities
- `data-import`: Importing app data from a CSV file in the export long-format, reconstructing categories/intentions/completions with name-based merge and defaulted lossy fields.

### Modified Capabilities
<!-- None: export behavior is unchanged. -->

## Impact

- `src/data/store.ts`: new `parseCSV` / `importCSV` functions; reuses palette and date helpers; writes via `persistAll`.
- `src/screens/SettingsScreen.tsx`: new "Import data from CSV" RowButton + hidden file input + confirm/result feedback.
- `e2e/`: new spec covering round-trip export→import and merge behavior; possible new page elements/tasks.
- No new dependencies; uses the browser File API and existing Dexie persistence.
