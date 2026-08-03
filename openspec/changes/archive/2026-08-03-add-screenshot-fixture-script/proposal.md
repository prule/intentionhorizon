## Why

Mock data (`buildSeed()` in `src/data/store.ts`) is randomized on every hydrate, so the Journal/Insights views never look the same twice. That makes it impossible to reliably reproduce a specific, presentable look — like the one in `images/intentionhorizon.webp` (used in `ReadMe.md`) — for a fresh screenshot or a deterministic manual/exploratory test pass. Today reproducing that screenshot requires hand-editing data in the running app.

## What Changes

- Add a standalone Node script that generates a CSV file in the app's existing export long-format (`date,category,intention,completed`, per the `data-import` capability), encoding a fixed, hand-tuned dataset that reproduces the categories, intentions, targets, and completion pattern shown in `images/intentionhorizon.webp`.
- Completion dates are computed relative to the date the script is run (`today`), not hardcoded absolute dates, so the generated file always lands the same relative pattern (e.g. "Workout done today, 6 of last 7 days") regardless of when it's run.
- The dataset is fixed/deterministic — no randomness — so re-running the script on the same day reproduces byte-identical output.
- Add an npm script (e.g. `pnpm run gen:screenshot-data`) to run the generator and write the CSV to a fixed path (e.g. `images/screenshot-data.csv`).
- Document the workflow in `ReadMe.md` or `DEVELOPMENT.md`: run the generator, then use Settings → "Import data from CSV" (the existing `data-import` capability) against a fresh/real data source to reproduce the known-good look before taking a new screenshot.
- No changes to application runtime code, the CSV export format, or the import logic itself.

## Capabilities

### New Capabilities
- `screenshot-fixture-data`: A dev-only generator script that produces a deterministic, current-dated CSV fixture reproducing the reference screenshot's dataset, importable through the app's existing CSV import feature.

### Modified Capabilities
<!-- none -->

## Impact

- **New files**: a generator script (e.g. `scripts/generate-screenshot-data.mjs`) and its generated output (e.g. `images/screenshot-data.csv`, gitignored or committed — TBD in design).
- **`package.json`**: one new npm script.
- **Docs**: `ReadMe.md` / `DEVELOPMENT.md` gains a short "regenerate the screenshot" workflow note.
- **No production code or runtime behavior changes**; the script only produces a file consumed by the existing, unmodified CSV import feature.
