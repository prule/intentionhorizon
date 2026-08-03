## 1. Define the fixture dataset

- [x] 1.1 Transcribe the reference screenshot (`images/intentionhorizon.webp`) into a table of 4 categories × 9 intentions (names matching `buildSeed()` in `src/data/store.ts`), each with the target and today-checked/unchecked state visible in the screenshot.
- [x] 1.2 For each intention, choose a day-offset list (0 = today) for the first ~14 days that reproduces the screenshot's trailing-7-day count and today's checked state; add a fixed repeating stride (e.g. every Nth day) for the remaining ~45 days of history.

## 2. Build the generator script

- [x] 2.1 Create `scripts/generate-screenshot-data.mjs` (plain Node ESM, no new dependencies) with small local `dateKey`/`addDays`/`today` helpers (mirroring `src/data/store.ts`, not imported from it).
- [x] 2.2 Encode the category/intention/offset table from Task 1 in the script.
- [x] 2.3 Emit CSV rows (`date,category,intention,completed`) for every completed offset per intention, using the same quoting rules as `toCSV()` in `src/data/store.ts`.
- [x] 2.4 Write output to `images/screenshot-data.csv`, overwriting any existing file.
- [x] 2.5 Verify no `Math.random()` (or other non-deterministic source) is used anywhere in the script.

## 3. Wire up and document

- [x] 3.1 Add an npm script `gen:screenshot-data` to `package.json` that runs the generator.
- [x] 3.2 Add `images/screenshot-data.csv` to `.gitignore`.
- [x] 3.3 Document the workflow in `ReadMe.md` or `DEVELOPMENT.md`: (a) one-time Manage-screen setup of the 9 reference intentions/categories/colors/targets in a `real` data source, (b) run `pnpm run gen:screenshot-data`, (c) import the resulting CSV via Settings → "Import data from CSV".

## 4. Verify

- [x] 4.1 Run the generator twice on the same day and confirm the two output files are byte-identical.
- [x] 4.2 Follow the documented workflow end-to-end in a dev build: generate the CSV and import it via Settings → "Import data from CSV" against a fresh `real` source; confirmed "6 of 9 intentions complete", per-category splits (Movement 2/3, Mind 2/3, Finance 1/2, Connection 1/1), and every intention's checked state and count match the reference screenshot. (Colors/targets show as defaults since this run skipped the one-time Manage setup from step 1 of the documented workflow — expected per design.md's documented prerequisite, not a defect.)
- [x] 4.3 Re-run the generator on a later day and confirm today's row and window counts shift accordingly (no stale absolute dates). Verified via the script's exported `buildCSV(referenceDate)` with two different reference dates (2026-08-03 vs 2026-08-10): output differs and each anchors correctly to its reference date.
