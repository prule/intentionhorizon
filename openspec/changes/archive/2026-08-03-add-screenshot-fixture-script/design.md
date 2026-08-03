## Context

`images/intentionhorizon.webp` (referenced from `ReadMe.md`) shows the Journal view populated with a specific, legible dataset: 4 categories, 9 intentions, each with a target, a color, and a trailing-7-day count that reads as "realistic but tidy" (e.g. `Workout 6/4`, `Read 20 min 5/4`, `No-spend day 3/3`). That dataset is not a fixture anywhere in the repo — it was hand-produced once, in the running app, and the actual date shown (`Sun May 31`) is now stale.

The app's only bulk-data mechanisms are:
- `buildSeed()` (`src/data/store.ts`) — auto-generates the `mock` data source using `Math.random()`; every hydrate looks different, and it targets the isolated `mock` source, not `real`.
- CSV export/import (`toCSV`/`importCSV`, also `src/data/store.ts`, specified by the existing `data-import` capability) — long format `date,category,intention,completed`, targeting the active `real` source, merge-by-name, unioned completions.
- The Playwright/Serenity e2e seed (`E2ESeedSpec` / `__IH_E2E_SEED__`) — deterministic and offset-based, but injected via `window` before app boot in dev builds only; not usable for taking a screenshot of a normal running instance.

CSV import is the only one of these that (a) targets the normal `real` source a developer would screenshot from, and (b) is driven by an ordinary file a script can produce. This design builds on it rather than adding a new import path.

## Goals / Non-Goals

**Goals:**
- Produce a CSV, in the existing export long-format, that reproduces the reference screenshot's category/intention names and completion pattern (today's checkmarks, trailing-window counts) relative to the date the script runs.
- Make the output deterministic: same run date in, same file out, every time — no `Math.random()`.
- Make regeneration a single command a developer runs before taking a new screenshot.

**Non-Goals:**
- Changing the CSV export/import format to carry color or target metadata. That format is intentionally lossy today (`data-import` capability, "Defaulted lossy fields") and widening it is a larger, separate change with its own migration concerns.
- Reproducing the screenshot pixel-for-pixel (exact random jitter, exact historical shape of the consistency heatmap). "Close enough to be recognizable and presentable" is the bar.
- Any change to `buildSeed()`, the `mock` data source, or e2e seeding.

## Decisions

**Script is a dependency-free Node ESM script (`scripts/generate-screenshot-data.mjs`), not TypeScript.**
The project has no `scripts/` precedent and no `tsx`/`ts-node` dev dependency; `package.json` is already `"type": "module"`, so plain `.mjs` runs directly under `node` with no build step or new dependency. Date math is a ~10-line reimplementation of `dateKey`/`addDays` from `store.ts` (not imported — `store.ts` pulls in Dexie at module scope, which assumes a browser/IndexedDB environment).

**Fixed intention/category table, mirroring `buildSeed()`'s names and categories exactly.**
Reusing the same 9 intention names and 4 category names as `buildSeed()` (Movement/Workout,Walk 8k steps,Stretch; Mind/Meditate,Read 20 min,No phone in bed; Finance/Invest,No-spend day; Connection/Call someone) is what makes the generated data merge cleanly by name (per the `data-import` capability's name-based merge) against a `real` source that already has these intentions configured — see the prerequisite below.

**Completion dates are offset lists from "today", not a probability model.**
Each intention gets a hand-picked, hardcoded array of day-offsets-from-today (0 = today) that are marked complete — the same shape as `E2ESeedSpec.completionsByOffset`, chosen so the trailing-7-day counts and today's checked/unchecked state match the reference screenshot (e.g. Workout: checked today, 6 of the last 7 days). A ~60-day history is generated so the Insights heatmap/streak views also look populated; offsets beyond the first couple of weeks follow a fixed repeating stride per intention (e.g. "every 3rd day") rather than being individually hand-picked, keeping the table small while still being fully deterministic.

**Output path and npm script.**
Written to `images/screenshot-data.csv` via `pnpm run gen:screenshot-data`. The file is generated, not source — add it to `.gitignore` rather than committing it, since its content (and the "today" row) goes stale the moment a day passes. The generator script itself is committed.

**Prerequisite: target categories/intentions already exist in the `real` source with the desired colors and targets.**
Because CSV import defaults color and disables targets for any intention it has to create (lossy format, by design — see `data-import`), a CSV import into an *empty* `real` source would reproduce the right names and completion dots but flat, target-disabled rows, not the `N/target` + status-arrow look in the screenshot. This design does not widen the CSV format to fix that (Non-Goal). Instead, the documented workflow requires the 9 intentions to already exist in `real` with matching names/categories/colors/targets (a one-time manual setup through the Manage screen, documented alongside the script) before importing the generated CSV; re-running the generator afterward only ever unions fresh completions into those already-configured intentions, which is exactly what "existing items are reused" (`data-import`) guarantees.

## Risks / Trade-offs

- **Import targets the active `real` source and mutates it** → Document running this against a dedicated/otherwise-empty `real` profile, or clearing existing sample data first, so a developer doesn't import screenshot fixture data on top of real personal tracking data. The existing "Confirm before mutating" import behavior already gives a checkpoint.
- **Re-running on a different day changes every count** → intentional (Goal), but means the generated file is not reproducible across days; call this out in docs so nobody expects a byte-stable file in version control.
- **Target/color prerequisite is easy to skip** → the generated CSV will still import successfully and look plausible (just without targets/colors matching the reference), so a skipped prerequisite fails silently rather than erroring. Mitigate by keeping the one-time Manage-screen setup list short and documenting it directly next to the npm script.

## Migration Plan

Purely additive: new script, new npm script entry, new `.gitignore` line, doc update. No existing behavior changes and nothing to roll back beyond deleting the script.

## Open Questions

None outstanding — the CSV-format limitation is accepted as a documented prerequisite rather than solved in this change (see Non-Goals).
