## 1. Parsing (store.ts)

- [x] 1.1 Add `parseCSV(text: string)` returning parsed rows + errors; reuse export quoting rules (`"` doubling, fields wrapped on `",\n`)
- [x] 1.2 Validate header has columns `date,category,intention,completed` (order-insensitive); reject if missing
- [x] 1.3 Reject rows with unparseable `date` (must match `dateKey` `YYYY-MM-DD`); skip rows with falsy `completed`

## 2. Import logic (store.ts)

- [x] 2.1 Add `importCSV(text: string): ImportResult` that builds the next `AppState` in memory from current `state` + parsed rows
- [x] 2.2 Merge categories by trimmed case-insensitive name; create missing
- [x] 2.3 Merge intentions by trimmed case-insensitive name within resolved category; create missing with palette color (round-robin) + target disabled
- [x] 2.4 Union completed days into `completions`; preserve existing days
- [x] 2.5 Commit only on success: swap in-memory `state`, call `persistAll()`; on parse error leave store untouched
- [x] 2.6 Return summary (categories added, intentions added, days added, rows skipped/errored)

## 3. Settings UI (SettingsScreen.tsx)

- [x] 3.1 Add "Import data from CSV" `RowButton` with an upload icon next to Export
- [x] 3.2 Wire a hidden `<input type="file" accept=".csv,text/csv">` triggered by the button
- [x] 3.3 On file read: `confirm()` then `importCSV`, then `bump()`; reset input value so same file can be re-picked
- [x] 3.4 Show result summary on success and an error message on invalid file

## 4. Tests

- [x] 4.1 Unit-test `parseCSV`/`importCSV`: round-trip, merge-by-name, union completions, invalid header rejection, bad-date rejection
- [x] 4.2 Add e2e spec: export → import into empty source reproduces visible state; add page elements/tasks as needed
- [x] 4.3 Run `openspec validate csv-import`, typecheck, lint, and the e2e suite
