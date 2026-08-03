# scripts/

Dev-only scripts. Currently just one.

## `generate-screenshot-data.mjs`

Generates a CSV fixture that reproduces the dataset shown in
[`images/intentionhorizon.webp`](../images/intentionhorizon.webp) (the
screenshot used in the project `ReadMe.md`), with completion dates anchored to
today instead of the stale date baked into that image. Import the result
through the app's own CSV import feature to get a known, presentable dataset
in the Journal/Insights views — useful for taking a fresh screenshot, or for
manual/exploratory testing against a dataset with well-known values instead of
the randomized mock seed.

### What it does

- Emits a CSV in the app's export long-format (`date,category,intention,completed`
  — the same format `toCSV()`/`importCSV()` in `src/data/store.ts` use).
- Encodes a fixed table of the 9 intentions across 4 categories from the
  reference screenshot, each with a hand-picked completion pattern for the
  last 7 days (chosen to reproduce that screenshot's checkmarks and
  trailing-window counts) plus a fixed repeating pattern further back so
  Insights views have ~60 days of history to work with.
- Is **deterministic**: no randomness anywhere. Running it twice on the same
  day produces byte-identical output. Run it on a different day and every
  date — including "today" — shifts accordingly.
- Writes to `images/screenshot-data.csv` (gitignored — it's a generated,
  date-relative artifact, not source; re-run any time you want it current).

### How to use it

1. **One-time setup.** CSV import can't carry an intention's color or target
   (that format is intentionally lossy — see the `data-import` spec) — it can
   only add/reuse categories, intentions, and completions by name. So, once,
   in a `real` data source, create these 9 intentions via the Manage screen
   with matching names, categories, colors, and targets:

   | Category   | Intention       | Target     |
   | ---------- | --------------- | ---------- |
   | Movement   | Workout         | 4 / 7 days |
   | Movement   | Walk 8k steps   | 6 / 7 days |
   | Movement   | Stretch         | none       |
   | Mind       | Meditate        | 5 / 7 days |
   | Mind       | Read 20 min     | 4 / 7 days |
   | Mind       | No phone in bed | none       |
   | Finance    | Invest          | 1 / 7 days |
   | Finance    | No-spend day    | 3 / 7 days |
   | Connection | Call someone    | none       |

2. **Generate the CSV:**

   ```bash
   pnpm run gen:screenshot-data
   ```

3. **Import it:** in the app, go to Settings (Manage) → **Import data from
   CSV** → select `images/screenshot-data.csv`. Since the intentions already
   exist from step 1, only completions are added — nothing is duplicated.

Repeat steps 2–3 whenever you want the data refreshed to the current date;
step 1 only needs doing once per data source.

### Why it's built this way

See [`openspec/changes/archive/2026-08-03-add-screenshot-fixture-script/`](../openspec/changes/archive/2026-08-03-add-screenshot-fixture-script)
for the full proposal/design/tasks, and
[`openspec/specs/screenshot-fixture-data/spec.md`](../openspec/specs/screenshot-fixture-data/spec.md)
for the living spec.
