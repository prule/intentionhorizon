/* ───────────────────────────────────────────────
   store.ts — IndexedDB (Dexie) persistence, seed, compute helpers
   The synchronous compute/read layer from the original prototype is kept
   intact: a full in-memory cache is hydrated from IndexedDB on startup
   (initStore), reads run against it synchronously, and every mutation both
   updates the cache and is persisted to IndexedDB through a serialized queue.
   ─────────────────────────────────────────────── */
import Dexie, { type Table } from 'dexie';

const SEED_DAYS = 92; // history depth for a lively heatmap (Entry strip still shows 30)

// ── domain types ──
export type Category = { id: string; name: string };

export type IntentionInput = {
  name: string;
  categoryId: string | null;
  color: string;
  targetEnabled: boolean;
  targetCompletions: number; // how many times…
  targetPeriodDays: number;  // …within this trailing N-day window
};
export type Intention = IntentionInput & { id: string };

// Legacy intention shape (pre-flexible-target): two fixed windows. Read only,
// for migrating stored rows — see migrateIntention.
type LegacyIntention = { target7?: number; target30?: number };

export type Completions = Record<string, Record<string, boolean>>;

export type AppState = {
  version: number;
  categories: Category[];
  intentions: Intention[];
  completions: Completions;
};

export type Grouping = 'day' | 'month' | 'year';
export type TargetStatus = 'under' | 'on' | 'above';

// ── data sources (isolated local datasets) ──
export type DataSource = 'mock' | 'real';
const LEGACY_DB = 'intention-horizon';          // pre-toggle single database
const dbName = (src: DataSource): string => `intention-horizon-${src}`;
const SOURCE_KEY = 'ih-data-source';            // localStorage: active source
const MIGRATED_KEY = 'ih-ds-migrated';          // localStorage: legacy migration done

// ── persisted row shapes (order is stored as an index column) ──
type CategoryRow = Category & { order?: number };
type IntentionRow = Intention & { order?: number };
type CompletionRow = { key: string; intentionId: string; dateKey: string };

// ── Dexie schema ──
class IntentionHorizonDB extends Dexie {
  categories!: Table<CategoryRow, string>;
  intentions!: Table<IntentionRow, string>;
  completions!: Table<CompletionRow, string>;

  constructor(name: string) {
    super(name);
    this.version(1).stores({
      categories: 'id',                  // + name, order
      intentions: 'id',                  // + name, categoryId, color, targetEnabled, targetCompletions, targetPeriodDays, order
      completions: 'key, intentionId',   // key = `${intentionId}|${dateKey}`, + dateKey
    });
  }
}

// active DB handle + active source — both set by initStore / switchDataSource.
// Persist functions and mutations reference `db` at call time, so a swap on
// switch (after the write queue drains) routes future writes to the new source.
let db: IntentionHorizonDB;
let currentSource: DataSource;

// ── serialized write queue (keeps IndexedDB writes ordered, off the render path) ──
let writeQ: Promise<unknown> = Promise.resolve();
function enqueue(fn: () => PromiseLike<unknown>): Promise<unknown> {
  writeQ = writeQ.then(fn).catch(() => { /* persistence is best-effort */ });
  return writeQ;
}

// ── date utils ──
const pad = (n: number): string => String(n).padStart(2, '0');
export const dateKey = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseKey = (k: string): Date => { const [y, m, dd] = k.split('-').map(Number); return new Date(y, m - 1, dd); };
export const addDays = (d: Date, n: number): Date => { const x = new Date(d); x.setDate(x.getDate() + n); x.setHours(0, 0, 0, 0); return x; };
const startOfDay = (d: Date): Date => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const today = (): Date => startOfDay(new Date());
export const sameKey = (a: Date, b: Date): boolean => dateKey(a) === dateKey(b);
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function fmtDay(d: Date): string {
  const t = today();
  if (sameKey(d, t)) return 'Today';
  if (sameKey(d, addDays(t, -1))) return 'Yesterday';
  return `${WD[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// ── palette (matches styles.css accent family) ──
export type PaletteEntry = { id: string; var: string; hex: string };
export const PALETTE: PaletteEntry[] = [
  { id: 'clay', var: 'var(--c-clay)', hex: '#c0714f' },
  { id: 'amber', var: 'var(--c-amber)', hex: '#c39327' },
  { id: 'moss', var: 'var(--c-moss)', hex: '#6f8a3f' },
  { id: 'sage', var: 'var(--c-sage)', hex: '#5a9070' },
  { id: 'teal', var: 'var(--c-teal)', hex: '#3e8fa0' },
  { id: 'blue', var: 'var(--c-blue)', hex: '#5a82c8' },
  { id: 'plum', var: 'var(--c-plum)', hex: '#9a6aae' },
  { id: 'rose', var: 'var(--c-rose)', hex: '#c46a6f' },
];
export const colorVar = (id: string): string => (PALETTE.find((p) => p.id === id) || PALETTE[0]).var;

// ── seed ──
type SeedIntention = Intention & { freq: number };
function buildSeed(): AppState {
  const cats: Category[] = [
    { id: 'c_move', name: 'Movement' },
    { id: 'c_mind', name: 'Mind' },
    { id: 'c_money', name: 'Finance' },
    { id: 'c_connect', name: 'Connection' },
  ];
  // freq = daily completion probability used to fabricate believable history
  const intents: SeedIntention[] = [
    { id: 'i_work', name: 'Workout', categoryId: 'c_move', color: 'clay', targetEnabled: true, targetCompletions: 4, targetPeriodDays: 7, freq: 0.55 },
    { id: 'i_walk', name: 'Walk 8k steps', categoryId: 'c_move', color: 'moss', targetEnabled: true, targetCompletions: 6, targetPeriodDays: 7, freq: 0.78 },
    { id: 'i_stretch', name: 'Stretch', categoryId: 'c_move', color: 'amber', targetEnabled: false, targetCompletions: 3, targetPeriodDays: 7, freq: 0.4 },
    { id: 'i_med', name: 'Meditate', categoryId: 'c_mind', color: 'teal', targetEnabled: true, targetCompletions: 5, targetPeriodDays: 7, freq: 0.6 },
    { id: 'i_read', name: 'Read 20 min', categoryId: 'c_mind', color: 'blue', targetEnabled: true, targetCompletions: 4, targetPeriodDays: 7, freq: 0.5 },
    { id: 'i_phone', name: 'No phone in bed', categoryId: 'c_mind', color: 'plum', targetEnabled: false, targetCompletions: 5, targetPeriodDays: 7, freq: 0.45 },
    { id: 'i_invest', name: 'Invest', categoryId: 'c_money', color: 'sage', targetEnabled: true, targetCompletions: 1, targetPeriodDays: 30, freq: 0.16 },
    { id: 'i_nospend', name: 'No-spend day', categoryId: 'c_money', color: 'rose', targetEnabled: true, targetCompletions: 3, targetPeriodDays: 7, freq: 0.42 },
    { id: 'i_call', name: 'Call someone', categoryId: 'c_connect', color: 'amber', targetEnabled: false, targetCompletions: 2, targetPeriodDays: 7, freq: 0.3 },
  ];

  const completions: Completions = {}; // intentionId -> map of dateKey:true
  const t = today();
  intents.forEach((it) => {
    const m: Record<string, boolean> = {};
    // gentle upward drift over time so progress looks like it's improving
    for (let i = 0; i < SEED_DAYS; i++) {
      const d = addDays(t, -i);
      const drift = (1 - i / SEED_DAYS) * 0.14; // recent days a touch stronger
      const boost = i < 7 ? 0.06 : 0;
      if (Math.random() < it.freq + drift + boost) m[dateKey(d)] = true;
    }
    completions[it.id] = m;
  });

  return {
    version: 1,
    categories: cats,
    intentions: intents.map(({ freq, ...rest }) => rest),
    completions,
  };
}

// ── in-memory cache (hydrated by initStore) ──
let state: AppState | null = null;

// rewrite a whole table from the in-memory arrays (persists order as index)
function persistCategories(): Promise<unknown> {
  const s = load();
  const rows: CategoryRow[] = s.categories.map((c, i) => ({ ...c, order: i }));
  return enqueue(() => db.transaction('rw', db.categories, async () => {
    await db.categories.clear();
    if (rows.length) await db.categories.bulkPut(rows);
  }));
}
function persistIntentions(): Promise<unknown> {
  const s = load();
  const rows: IntentionRow[] = s.intentions.map((it, i) => ({ ...it, order: i }));
  return enqueue(() => db.transaction('rw', db.intentions, async () => {
    await db.intentions.clear();
    if (rows.length) await db.intentions.bulkPut(rows);
  }));
}
function persistAll(): Promise<unknown> {
  const s = load();
  const comp: CompletionRow[] = [];
  Object.entries(s.completions).forEach(([iid, m]) => {
    Object.keys(m).forEach((dk) => { if (m[dk]) comp.push({ key: `${iid}|${dk}`, intentionId: iid, dateKey: dk }); });
  });
  return enqueue(() => db.transaction('rw', db.categories, db.intentions, db.completions, async () => {
    await Promise.all([db.categories.clear(), db.intentions.clear(), db.completions.clear()]);
    if (s.categories.length) await db.categories.bulkPut(s.categories.map((c, i) => ({ ...c, order: i })));
    if (s.intentions.length) await db.intentions.bulkPut(s.intentions.map((it, i) => ({ ...it, order: i })));
    if (comp.length) await db.completions.bulkPut(comp);
  }));
}

function emptyState(): AppState {
  return { version: 1, categories: [], intentions: [], completions: {} };
}

// Migrate a stored intention from the legacy dual-target shape to the flexible
// one. Idempotent: rows already carrying targetCompletions pass through. Legacy
// `target7` becomes targetCompletions over a 7-day period (preserving weekly
// intent); legacy fields are stripped so they don't linger in storage.
function migrateIntention(raw: Intention & LegacyIntention): Intention {
  const { target7, target30, ...rest } = raw;
  if (rest.targetCompletions != null && rest.targetPeriodDays != null) return rest;
  return { ...rest, targetCompletions: target7 ?? 3, targetPeriodDays: 7 };
}

// ── data source flag ──
// Build-time gate: mock is opt-in. Only '1'/'true' enable it; anything else
// (including unset) disables it so default builds never expose mock.
export const mockEnabled = (): boolean => {
  const v = import.meta.env.VITE_ENABLE_MOCK_DATA;
  return v === 'true' || v === '1';
};

// Raw persisted choice; defaults to `real` for fresh installs.
export function getDataSource(): DataSource {
  const v = localStorage.getItem(SOURCE_KEY);
  return v === 'real' || v === 'mock' ? v : 'real';
}
export function setDataSource(src: DataSource): void {
  localStorage.setItem(SOURCE_KEY, src);
}
// Source actually used by the store: forced to `real` when mock is disabled,
// without overwriting the persisted choice (so it returns if mock is re-enabled).
function effectiveSource(): DataSource {
  return mockEnabled() ? getDataSource() : 'real';
}

// Hydrate the in-memory cache from the given source's (already-assigned) `db`.
// mock auto-seeds when empty; real starts empty.
async function hydrate(src: DataSource): Promise<AppState> {
  await db.open();
  const [cats, ints, comps] = await Promise.all([
    db.categories.toArray(), db.intentions.toArray(), db.completions.toArray(),
  ]);

  if (cats.length === 0 && ints.length === 0) {
    state = src === 'mock' ? buildSeed() : emptyState();
    if (src === 'mock') await persistAll();
    return state;
  }

  cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  ints.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const completions: Completions = {};
  comps.forEach((r) => { (completions[r.intentionId] = completions[r.intentionId] || {})[r.dateKey] = true; });

  state = {
    version: 1,
    categories: cats.map(({ order, ...c }) => c),
    intentions: ints.map(({ order, ...it }) => migrateIntention(it)),
    completions,
  };
  return state;
}

// One-time, non-destructive copy of the legacy single DB into the `real` source.
// Runs before normal hydration; idempotent (skips if real already has data) and
// guarded so it never runs twice. Legacy DB is left intact as a safety net.
async function maybeMigrateLegacy(): Promise<void> {
  if (localStorage.getItem(MIGRATED_KEY)) return;
  try {
    if (!(await Dexie.exists(LEGACY_DB))) { localStorage.setItem(MIGRATED_KEY, '1'); return; }
    const legacy = new IntentionHorizonDB(LEGACY_DB);
    await legacy.open();
    const [cats, ints, comps] = await Promise.all([
      legacy.categories.toArray(), legacy.intentions.toArray(), legacy.completions.toArray(),
    ]);
    if (cats.length === 0 && ints.length === 0) {
      legacy.close();
      localStorage.setItem(MIGRATED_KEY, '1');
      return;
    }
    const real = new IntentionHorizonDB(dbName('real'));
    await real.open();
    const [rc, ri] = await Promise.all([real.categories.count(), real.intentions.count()]);
    if (rc === 0 && ri === 0) {
      await real.transaction('rw', real.categories, real.intentions, real.completions, async () => {
        if (cats.length) await real.categories.bulkPut(cats);
        if (ints.length) await real.intentions.bulkPut(ints);
        if (comps.length) await real.completions.bulkPut(comps);
      });
    }
    real.close();
    legacy.close();
    setDataSource('real');
    localStorage.setItem(MIGRATED_KEY, '1');
  } catch { /* migration is best-effort; never block startup */ }
}

// ── e2e test seed (dev builds only) ──
// A deterministic dataset injected on `window` before the app boots (via
// Playwright's addInitScript). Completions are expressed as day offsets from
// "today" (0 = today, 1 = yesterday, …) so they stay anchored to the real
// clock and exercise the same date-window logic users hit. The whole branch is
// guarded by import.meta.env.DEV, so production builds tree-shake it out.
export type E2ESeedSpec = {
  categories: Category[];
  intentions: Intention[];
  completionsByOffset?: Record<string, number[]>;
};

const E2E_SEEDED_KEY = '__ih_e2e_seeded';

async function maybeSeedForE2E(): Promise<AppState | null> {
  const spec = (globalThis as { __IH_E2E_SEED__?: E2ESeedSpec }).__IH_E2E_SEED__;
  if (!spec) return null;
  // Seed once per browser context: on a reload the marker is already set, so
  // skip the wipe/reseed and let the normal hydrate path read persisted data —
  // exactly what a returning user gets. (Marker lives in localStorage, so it
  // survives reloads but stays isolated per Playwright context.)
  if (localStorage.getItem(E2E_SEEDED_KEY)) return null;
  // Start from a clean `real` database so prior runs never leak in.
  currentSource = 'real';
  db = new IntentionHorizonDB(dbName('real'));
  await db.open();
  await db.delete();
  db = new IntentionHorizonDB(dbName('real'));
  await db.open();

  const completions: Completions = {};
  const t = today();
  Object.entries(spec.completionsByOffset || {}).forEach(([iid, offsets]) => {
    const m: Record<string, boolean> = {};
    offsets.forEach((o) => { m[dateKey(addDays(t, -o))] = true; });
    completions[iid] = m;
  });

  state = { version: 1, categories: spec.categories, intentions: spec.intentions, completions };
  await persistAll();
  localStorage.setItem(E2E_SEEDED_KEY, '1');
  return state;
}

// ── init / load ──
export async function initStore(): Promise<AppState> {
  if (import.meta.env.DEV) {
    const seeded = await maybeSeedForE2E();
    if (seeded) return seeded;
  }
  await maybeMigrateLegacy();
  currentSource = effectiveSource();
  db = new IntentionHorizonDB(dbName(currentSource));
  return hydrate(currentSource);
}

export function load(): AppState {
  if (!state) throw new Error('store not initialized — call initStore() first');
  return state;
}

// Switch active source: drain pending writes against the old DB, swap handles,
// persist the flag, then hydrate the new source. Returns the new state.
export async function switchDataSource(src: DataSource): Promise<AppState> {
  if (src === 'mock' && !mockEnabled()) return load(); // mock gated off: refuse
  if (src === currentSource && state) return state;
  await writeQ.catch(() => { /* drained */ });
  db.close();
  setDataSource(src);
  currentSource = src;
  db = new IntentionHorizonDB(dbName(src));
  return hydrate(src);
}

// Source-aware reset: reseed sample data on mock, clear to empty on real.
export function resetSeed(): AppState {
  state = currentSource === 'mock' ? buildSeed() : emptyState();
  persistAll();
  return state;
}

// ── mutations ──
let _id = 0;
const uid = (p: string): string => `${p}_${Date.now().toString(36)}${(_id++).toString(36)}`;

export function toggleCompletion(intentionId: string, key: string): void {
  const s = load();
  if (!s.completions[intentionId]) s.completions[intentionId] = {};
  const m = s.completions[intentionId];
  const now = !m[key];
  if (m[key]) delete m[key]; else m[key] = true;
  const rowKey = `${intentionId}|${key}`;
  enqueue(() => (now ? db.completions.put({ key: rowKey, intentionId, dateKey: key }) : db.completions.delete(rowKey)));
}
export function isDone(intentionId: string, key: string): boolean {
  const s = load();
  return !!(s.completions[intentionId] && s.completions[intentionId][key]);
}

export function addCategory(name: string): void { const s = load(); s.categories.push({ id: uid('c'), name }); persistCategories(); }
export function updateCategory(id: string, name: string): void { const s = load(); const c = s.categories.find((c) => c.id === id); if (c) c.name = name; persistCategories(); }
export function deleteCategory(id: string): void {
  const s = load();
  s.categories = s.categories.filter((c) => c.id !== id);
  // orphaned intentions move to no category
  s.intentions.forEach((it) => { if (it.categoryId === id) it.categoryId = null; });
  persistCategories();
  persistIntentions();
}

export function addIntention(data: IntentionInput): void {
  const s = load();
  s.intentions.push({
    id: uid('i'), name: data.name, categoryId: data.categoryId || null,
    color: data.color || 'clay', targetEnabled: !!data.targetEnabled,
    targetCompletions: data.targetCompletions ?? 3, targetPeriodDays: data.targetPeriodDays ?? 7,
  });
  persistIntentions();
}
export function updateIntention(id: string, data: Partial<Intention>): void { const s = load(); const it = s.intentions.find((i) => i.id === id); if (it) Object.assign(it, data); persistIntentions(); }
export function deleteIntention(id: string): void {
  const s = load();
  s.intentions = s.intentions.filter((i) => i.id !== id);
  delete s.completions[id];
  persistIntentions();
  enqueue(() => db.completions.where('intentionId').equals(id).delete());
}

// reorder intentions WITHIN a category group (categoryKey '_none' for uncategorized)
export function reorderIntentions(categoryKey: string, orderedIds: string[]): void {
  const s = load();
  const slots: number[] = [];
  s.intentions.forEach((it, idx) => { if ((it.categoryId || '_none') === categoryKey) slots.push(idx); });
  const byId: Record<string, Intention> = Object.fromEntries(s.intentions.map((it) => [it.id, it]));
  orderedIds.forEach((id, i) => { if (slots[i] != null && byId[id]) s.intentions[slots[i]] = byId[id]; });
  persistIntentions();
}
// reorder whole categories
export function reorderCategories(orderedIds: string[]): void {
  const s = load();
  const byId: Record<string, Category> = Object.fromEntries(s.categories.map((c) => [c.id, c]));
  s.categories = orderedIds.map((id) => byId[id]).filter(Boolean);
  persistCategories();
}

// ── compute ──
// count completions for intention in trailing window of `days` ending at `endKey` (inclusive)
export function windowCount(intentionId: string, endDate: Date, days: number): number {
  const s = load();
  const m = s.completions[intentionId];
  if (!m) return 0;
  let n = 0;
  for (let i = 0; i < days; i++) {
    if (m[dateKey(addDays(endDate, -i))]) n++;
  }
  return n;
}
// status vs target: 'under' | 'on' | 'above' | null (no target)
export function statusFor(count: number, target: number | null): TargetStatus | null {
  if (target == null) return null;
  if (count < target) return 'under';
  if (count === target) return 'on';
  return 'above';
}

// intentions completed on a given day (array of intention objects)
export function doneOnDay(key: string): Intention[] {
  const s = load();
  return s.intentions.filter((it) => s.completions[it.id] && s.completions[it.id][key]);
}

export type DayMetric = { count: number; met: number; metRatio: number; targetedTotal: number };
// For analytics heatmap: for a date, among the relevant (target-enabled) intentions,
// how many met their target as-of that date — each evaluated over its own
// targetPeriodDays window. Returns {count, metRatio, total}.
export function dayMetric(date: Date, filterIntentionId: string | null): DayMetric {
  const s = load();
  const key = dateKey(date);
  let pool = s.intentions;
  if (filterIntentionId) pool = pool.filter((i) => i.id === filterIntentionId);

  const count = pool.filter((it) => s.completions[it.id] && s.completions[it.id][key]).length;

  const targeted = pool.filter((it) => it.targetEnabled);
  let met = 0;
  targeted.forEach((it) => {
    const c = windowCount(it.id, date, it.targetPeriodDays);
    if (c >= it.targetCompletions) met++;
  });
  const metRatio = targeted.length ? met / targeted.length : (count > 0 ? 1 : 0);
  return { count, met, metRatio, targetedTotal: targeted.length };
}

export type AggregateBucket = { label: string; value: number };
// aggregate totals over a range grouped by day/month/year
export function aggregate(filterIntentionId: string | null, grouping: Grouping, rangeDays: number): AggregateBucket[] {
  const s = load();
  const t = today();
  let pool = s.intentions;
  if (filterIntentionId) pool = pool.filter((i) => i.id === filterIntentionId);
  const buckets: Record<string, number> = {}; // label -> count
  const order: string[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = addDays(t, -i);
    const k = dateKey(d);
    let label: string;
    if (grouping === 'day') label = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
    else if (grouping === 'month') label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    else label = `${d.getFullYear()}`;
    if (!(label in buckets)) { buckets[label] = 0; order.push(label); }
    pool.forEach((it) => { if (s.completions[it.id] && s.completions[it.id][k]) buckets[label]++; });
  }
  return order.map((l) => ({ label: l, value: buckets[l] }));
}

// streaks: a day is "met" if (filtered intention done) or (any intention done, when unfiltered)
export function dayMet(key: string, filterId: string | null): boolean {
  const s = load();
  if (filterId) return !!(s.completions[filterId] && s.completions[filterId][key]);
  return s.intentions.some((it) => s.completions[it.id] && s.completions[it.id][key]);
}
export type Streaks = { current: number; best: number; rate: number };
export function streaks(filterId: string | null): Streaks {
  const t = today();
  let current = 0;
  const off = dayMet(dateKey(t), filterId) ? 0 : 1; // grace for today-not-yet-logged
  for (let i = off; i < 400; i++) { if (dayMet(dateKey(addDays(t, -i)), filterId)) current++; else break; }
  let best = 0, run = 0;
  for (let i = 199; i >= 0; i--) { if (dayMet(dateKey(addDays(t, -i)), filterId)) { run++; if (run > best) best = run; } else run = 0; }
  let met30 = 0; for (let i = 0; i < 30; i++) { if (dayMet(dateKey(addDays(t, -i)), filterId)) met30++; }
  return { current, best, rate: Math.round((met30 / 30) * 100) };
}

// CSV: long format date,category,intention,completed(1)
export function toCSV(): string {
  const s = load();
  const catName = (id: string | null): string => { const c = s.categories.find((c) => c.id === id); return c ? c.name : ''; };
  const rows: string[][] = [['date', 'category', 'intention', 'completed']];
  const t = today();
  // emit a full grid for last 90 days for completeness
  const sorted = [...s.intentions];
  for (let i = 89; i >= 0; i--) {
    const k = dateKey(addDays(t, -i));
    sorted.forEach((it) => {
      const done = s.completions[it.id] && s.completions[it.id][k];
      if (done) rows.push([k, catName(it.categoryId), it.name, '1']);
    });
  }
  return rows.map((r) => r.map((field) => {
    const str = String(field);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  }).join(',')).join('\n');
}

export function downloadCSV(): void {
  const csv = toCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `intention-horizon-${dateKey(today())}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── CSV import ──
// Inverse of toCSV(): reconstruct categories/intentions/completions from the
// export long-format. The format is lossy (names + completed days only — no
// ids, colors, or targets), so new items get defaulted color/targets and
// everything is merged into the active source by name.

type ParsedRow = { date: string; category: string; intention: string };
type ParseResult = { rows: ParsedRow[]; skipped: number; error?: string };
export type ImportResult = {
  ok: boolean;
  error?: string;
  categoriesAdded: number;
  intentionsAdded: number;
  daysAdded: number;
  rowsSkipped: number;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// A valid key is the shape AND a real calendar date — parseKey/dateKey round-trip
// rejects rollovers like 2026-13-99 that the shape regex alone would accept.
function isValidDateKey(k: string): boolean {
  if (!DATE_RE.test(k)) return false;
  const d = parseKey(k);
  return !Number.isNaN(d.getTime()) && dateKey(d) === k;
}

// Split CSV text into a grid of fields, mirroring toCSV()'s escaping:
// fields wrapped in quotes when they contain `",\n`, and `"` doubled inside.
// Tolerates CRLF and a trailing newline.
function parseCSVGrid(text: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  let started = false; // any char seen for the current record?
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') { inQuotes = true; started = true; }
    else if (ch === ',') { row.push(field); field = ''; started = true; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; started = false; }
    else if (ch === '\r') { /* swallow CR (CRLF) */ }
    else { field += ch; started = true; }
  }
  if (started || field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Parse export-format CSV. Returns a hard error only for an unusable file
// (empty / missing required header columns). Row-level problems (bad date,
// falsy `completed`) drop the row and increment `skipped`.
export function parseCSV(text: string): ParseResult {
  const grid = parseCSVGrid(text);
  if (grid.length === 0) return { rows: [], skipped: 0, error: 'File is empty' };
  const header = grid[0].map((h) => h.trim().toLowerCase());
  const idx: Record<string, number> = {};
  for (const col of ['date', 'category', 'intention', 'completed']) {
    const at = header.indexOf(col);
    if (at === -1) return { rows: [], skipped: 0, error: `Missing required column: ${col}` };
    idx[col] = at;
  }
  const rows: ParsedRow[] = [];
  let skipped = 0;
  for (let r = 1; r < grid.length; r++) {
    const g = grid[r];
    if (g.every((c) => c.trim() === '')) continue; // blank line
    const date = (g[idx.date] ?? '').trim();
    const completed = (g[idx.completed] ?? '').trim().toLowerCase();
    if (!isValidDateKey(date)) { skipped++; continue; }
    if (!completed || completed === '0' || completed === 'false') { skipped++; continue; }
    rows.push({ date, category: (g[idx.category] ?? '').trim(), intention: (g[idx.intention] ?? '').trim() });
  }
  return { rows, skipped };
}

// Import export-format CSV into the active source. Builds the next AppState on
// copies first, so a parse failure leaves the store untouched; only on success
// is the cache swapped and persisted (persistAll writes all tables atomically).
// Merge is by trimmed, case-insensitive name; completed days are unioned.
export function importCSV(text: string): ImportResult {
  const empty: ImportResult = { ok: false, categoriesAdded: 0, intentionsAdded: 0, daysAdded: 0, rowsSkipped: 0 };
  const parsed = parseCSV(text);
  if (parsed.error) return { ...empty, error: parsed.error };

  const s = load();
  const categories: Category[] = s.categories.map((c) => ({ ...c }));
  const intentions: Intention[] = s.intentions.map((it) => ({ ...it }));
  const completions: Completions = {};
  Object.entries(s.completions).forEach(([iid, m]) => { completions[iid] = { ...m }; });

  const norm = (x: string): string => x.trim().toLowerCase();
  const catByName = new Map<string, Category>();
  categories.forEach((c) => catByName.set(norm(c.name), c));
  const intKey = (catId: string | null, name: string): string => `${catId ?? '_none'}|${norm(name)}`;
  const intByKey = new Map<string, Intention>();
  intentions.forEach((it) => intByKey.set(intKey(it.categoryId, it.name), it));

  let categoriesAdded = 0, intentionsAdded = 0, daysAdded = 0;
  let colorCursor = intentions.length; // round-robin palette for new intentions

  for (const row of parsed.rows) {
    let catId: string | null = null;
    if (row.category) {
      let cat = catByName.get(norm(row.category));
      if (!cat) {
        cat = { id: uid('c'), name: row.category };
        categories.push(cat);
        catByName.set(norm(row.category), cat);
        categoriesAdded++;
      }
      catId = cat.id;
    }
    if (!row.intention) continue;
    const key = intKey(catId, row.intention);
    let it = intByKey.get(key);
    if (!it) {
      it = {
        id: uid('i'), name: row.intention, categoryId: catId,
        color: PALETTE[colorCursor++ % PALETTE.length].id,
        targetEnabled: false, targetCompletions: 3, targetPeriodDays: 7,
      };
      intentions.push(it);
      intByKey.set(key, it);
      intentionsAdded++;
    }
    if (!completions[it.id]) completions[it.id] = {};
    if (!completions[it.id][row.date]) { completions[it.id][row.date] = true; daysAdded++; }
  }

  state = { version: 1, categories, intentions, completions };
  persistAll();
  return { ok: true, categoriesAdded, intentionsAdded, daysAdded, rowsSkipped: parsed.skipped };
}
