## Context

Data lives only in the browser's IndexedDB (Dexie), isolated per data source (`real`/`mock`). The existing `downloadCSV` / `toCSV` (`src/data/store.ts`) emit a **lossy long-format** CSV: header `date,category,intention,completed`, one row per completed `(intention, day)` over the last 90 days. The format carries no intention id, color, target config, or category id — only names and which days were completed. Import must reconstruct a valid `AppState` from this and persist it.

## Goals / Non-Goals

**Goals:**
- Round-trip: a CSV produced by this app's export imports back into an equivalent visible state (categories, intentions, completed days).
- Merge by name into the active `real` source without creating duplicate categories/intentions.
- All-or-nothing: a malformed file leaves the existing store untouched; surface a clear error.

**Non-Goals:**
- A richer/lossless export format (no schema change to export). Reconstructed colors/targets are best-effort defaults.
- Importing into the `mock` source, or cross-format imports (only the app's own long-format CSV is supported).
- Server sync or file pickers beyond the browser File API.

## Decisions

**Parse in `store.ts`, mutate via existing cache + `persistAll`.**
Add `parseCSV(text): ParsedImport` (pure, testable) and `importCSV(text): ImportResult` (mutates in-memory `state`, calls `persistAll`). Reuse `dateKey` validation and `PALETTE`. Rationale: keeps all persistence logic in one module; `persistAll` already rewrites all three tables atomically in a Dexie transaction, giving us the all-or-nothing write for free.

**Name-based merge, case-insensitive.**
Categories matched/created by trimmed name; intentions matched/created by trimmed name **within** the resolved category (an intention name can repeat across categories). Completions unioned (`completed` truthy → set day). Rationale: the export has no stable ids, so names are the only join key; merge avoids duplicating a user's existing data on re-import. Alternative considered: wipe-then-replace — rejected because it would silently destroy data the CSV's 90-day window doesn't cover.

**Defaults for lossy fields.** New intentions: `color` assigned round-robin from `PALETTE`, `targetEnabled: false`, default target 3/7. Existing intentions keep their config. Rationale: the format can't restore these; disabled targets are the safe neutral choice.

**Validation rules.** Require the exact header (order-insensitive set: `date,category,intention,completed`). Reject if missing columns. Skip rows where `completed` is falsy (0/empty) — export only ever writes `1`, but be lenient on read. Reject rows with an unparseable `date` (must match `YYYY-MM-DD` / `dateKey`). Quoted-field parsing must mirror the export's escaping (`"` doubling, fields wrapped when containing `",\n`).

**UI: hidden file input + confirm.** Settings gets an "Import data from CSV" `RowButton` that triggers a hidden `<input type=file accept=".csv,text/csv">`. On file read: `confirm()` (mutates active dataset), then `importCSV`, then `bump()` to re-render, then show a result summary (counts added / errors). Rationale: matches the existing RowButton pattern and the confirm pattern already used for destructive actions.

## Risks / Trade-offs

- **Lossy re-import changes colors/targets** → Documented as expected; merge-by-name means *existing* intentions keep their config, so re-importing your own data on the same browser is non-destructive to config.
- **Name collisions merge unrelated items** (two different habits same name+category) → Acceptable; matches how the export already collapses them into one name.
- **Large CSV blocking the main thread** → 90-day window bounds size to low thousands of rows; synchronous parse is fine, no worker needed.
- **Partial write corruption** → Avoided: parse fully and build the next `state` in memory first; only commit (cache swap + `persistAll`) if parse succeeds.

## Migration Plan

Additive feature, no data migration. Rollback = revert the change; exported CSVs remain readable by any future importer.
