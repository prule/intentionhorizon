#!/usr/bin/env node
/* ───────────────────────────────────────────────
   generate-screenshot-data.mjs
   Produces a CSV, in the app's export long-format (date,category,intention,
   completed), reproducing the dataset shown in images/intentionhorizon.webp —
   anchored to "today" so the file is always current, not stale.

   Deterministic: no randomness. The near-term completion pattern (last 7
   days) is hand-picked per intention to match the reference screenshot's
   checkmarks and trailing-window counts; older history fills in with a fixed
   per-intention stride so Insights views look populated too.

   Import via Settings -> "Import data from CSV" (see ReadMe.md /
   DEVELOPMENT.md for the one-time intention/target/color setup this assumes).
   ─────────────────────────────────────────────── */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'images', 'screenshot-data.csv');
const HISTORY_DAYS = 60; // offsets 0 (today) .. HISTORY_DAYS-1

// ── date helpers (mirrors src/data/store.ts; not imported — that module
//    pulls in Dexie, which assumes a browser/IndexedDB environment) ──
const pad = (n) => String(n).padStart(2, '0');
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); x.setHours(0, 0, 0, 0); return x; };
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

// ── fixture dataset, transcribed from images/intentionhorizon.webp ──
// recentOffsets: hand-picked day-offsets (0 = today) completed within the
// first 7 days, chosen so today's checked state and the trailing-7-day count
// match the reference screenshot.
// strideDays/stridePhase: for offsets 7..HISTORY_DAYS-1, a day is completed
// when (offset % strideDays) === stridePhase — a fixed, deterministic pattern
// (not hand-picked) that just keeps older history populated.
const INTENTIONS = [
  { name: 'Workout', category: 'Movement', recentOffsets: [0, 1, 2, 4, 5, 6], strideDays: 2, stridePhase: 0 },
  { name: 'Walk 8k steps', category: 'Movement', recentOffsets: [1, 3, 4, 5, 6], strideDays: 2, stridePhase: 1 },
  { name: 'Stretch', category: 'Movement', recentOffsets: [0, 1, 3, 4, 6], strideDays: 3, stridePhase: 0 },
  { name: 'Meditate', category: 'Mind', recentOffsets: [1, 2, 4, 6], strideDays: 2, stridePhase: 0 },
  { name: 'Read 20 min', category: 'Mind', recentOffsets: [0, 1, 2, 4, 6], strideDays: 2, stridePhase: 1 },
  { name: 'No phone in bed', category: 'Mind', recentOffsets: [0, 2, 4, 6], strideDays: 3, stridePhase: 1 },
  { name: 'Invest', category: 'Finance', recentOffsets: [2, 5], strideDays: 4, stridePhase: 0 },
  { name: 'No-spend day', category: 'Finance', recentOffsets: [0, 3, 5], strideDays: 3, stridePhase: 2 },
  { name: 'Call someone', category: 'Connection', recentOffsets: [0, 1, 3, 4, 6], strideDays: 2, stridePhase: 0 },
];

function completedOffsets(intention) {
  const offsets = new Set(intention.recentOffsets);
  for (let o = 7; o < HISTORY_DAYS; o++) {
    if ((o % intention.strideDays) === intention.stridePhase) offsets.add(o);
  }
  return offsets;
}

// same escaping toCSV() uses in src/data/store.ts
function csvField(field) {
  const str = String(field);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function buildCSV(referenceDate = new Date()) {
  const today = startOfDay(referenceDate);
  const rows = [['date', 'category', 'intention', 'completed']];

  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const k = dateKey(addDays(today, -i));
    for (const intention of INTENTIONS) {
      if (completedOffsets(intention).has(i)) {
        rows.push([k, intention.category, intention.name, '1']);
      }
    }
  }

  return rows.map((r) => r.map(csvField).join(',')).join('\n');
}

function main() {
  const csv = buildCSV(new Date());
  writeFileSync(OUTPUT_PATH, csv);
  console.log(`Wrote ${OUTPUT_PATH}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
