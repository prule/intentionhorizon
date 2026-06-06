import { describe, it, expect, beforeEach } from 'vitest';
import {
  initStore, load, resetSeed,
  addCategory, addIntention, toggleCompletion,
  toCSV, parseCSV, importCSV,
  dateKey, parseKey, addDays, today, statusFor, windowCount,
  type Intention,
} from './store';

// A clean, hydrated (empty `real`) store before each test. setup.ts swaps in a
// fresh IndexedDB and clears localStorage, so re-initialising starts blank.
beforeEach(async () => {
  await initStore();
  resetSeed(); // ensure empty even if a prior module-state lingered
});

/** Snapshot the store as comparable plain data (ignores ids/colors/targets). */
function snapshot() {
  const s = load();
  const catNames = s.categories.map((c) => c.name).sort();
  const catById = new Map(s.categories.map((c) => [c.id, c.name]));
  const intentions = s.intentions
    .map((it) => ({
      name: it.name,
      category: it.categoryId ? catById.get(it.categoryId) ?? null : null,
      days: Object.keys(s.completions[it.id] ?? {}).sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { catNames, intentions };
}

const intentionNamed = (name: string): Intention =>
  load().intentions.find((it) => it.name === name)!;

describe('parseCSV', () => {
  it('parses valid export rows', () => {
    const res = parseCSV('date,category,intention,completed\n2026-01-05,Health,Read,1\n');
    expect(res.error).toBeUndefined();
    expect(res.rows).toEqual([{ date: '2026-01-05', category: 'Health', intention: 'Read' }]);
  });

  it('errors on a missing required column', () => {
    const res = parseCSV('date,category,intention\n2026-01-05,Health,Read\n');
    expect(res.error).toMatch(/completed/i);
    expect(res.rows).toHaveLength(0);
  });

  it('tolerates column reordering and is case-insensitive on the header', () => {
    const res = parseCSV('Completed,Intention,Category,Date\n1,Read,Health,2026-01-05\n');
    expect(res.error).toBeUndefined();
    expect(res.rows).toEqual([{ date: '2026-01-05', category: 'Health', intention: 'Read' }]);
  });

  it('handles quoted fields with commas and escaped quotes', () => {
    const res = parseCSV('date,category,intention,completed\n2026-01-05,"Home, etc","Say ""hi""",1\n');
    expect(res.rows[0]).toEqual({ date: '2026-01-05', category: 'Home, etc', intention: 'Say "hi"' });
  });

  it('skips rows with an unparseable (non-calendar) date', () => {
    const res = parseCSV('date,category,intention,completed\n2026-13-99,Health,Bad,1\n2026-01-05,Health,Read,1\n');
    expect(res.rows.map((r) => r.intention)).toEqual(['Read']);
    expect(res.skipped).toBe(1);
  });

  it('skips rows whose completed value is falsy', () => {
    const res = parseCSV('date,category,intention,completed\n2026-01-05,Health,Read,0\n2026-01-06,Health,Read,1\n');
    expect(res.rows.map((r) => r.date)).toEqual(['2026-01-06']);
    expect(res.skipped).toBe(1);
  });
});

describe('importCSV / toCSV round-trip', () => {
  it('reconstructs categories, intentions, and completed days from an export', () => {
    addCategory('Health');
    const health = load().categories[0].id;
    addIntention({ name: 'Read', categoryId: health, color: 'blue', targetEnabled: false, targetCompletions: 3, targetPeriodDays: 7 });
    const read = intentionNamed('Read').id;
    const days = [dateKey(today()), dateKey(addDays(today(), -1)), dateKey(addDays(today(), -2))];
    days.forEach((d) => toggleCompletion(read, d));

    const csv = toCSV();
    const before = snapshot();

    resetSeed(); // simulate a clean target browser
    expect(load().intentions).toHaveLength(0);

    const res = importCSV(csv);
    expect(res.ok).toBe(true);
    expect(snapshot()).toEqual(before);
  });
});

describe('importCSV merge', () => {
  it('merges by name without duplicating, and unions completed days', () => {
    addCategory('Health');
    const health = load().categories[0].id;
    addIntention({ name: 'Read', categoryId: health, color: 'blue', targetEnabled: false, targetCompletions: 3, targetPeriodDays: 7 });
    toggleCompletion(intentionNamed('Read').id, '2026-01-01');

    const res = importCSV([
      'date,category,intention,completed',
      '2026-01-02,Health,Read,1',   // existing intention, new day
      '2026-01-02,Wellness,Yoga,1', // brand-new category + intention
    ].join('\n'));

    expect(res.ok).toBe(true);
    expect(res.categoriesAdded).toBe(1);
    expect(res.intentionsAdded).toBe(1);

    const s = load();
    expect(s.intentions.filter((it) => it.name === 'Read')).toHaveLength(1);
    expect(s.categories.map((c) => c.name).sort()).toEqual(['Health', 'Wellness']);
    expect(Object.keys(s.completions[intentionNamed('Read').id]).sort()).toEqual(['2026-01-01', '2026-01-02']);
  });

  it('leaves the store untouched when the file is invalid', () => {
    addCategory('Health');
    const before = snapshot();
    const res = importCSV('date,category,intention\n2026-01-05,Health,Read\n');
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/completed/i);
    expect(snapshot()).toEqual(before);
  });
});

describe('date helpers', () => {
  it('dateKey/parseKey round-trip a calendar date', () => {
    const k = '2026-01-05';
    expect(dateKey(parseKey(k))).toBe(k);
  });

  it('addDays shifts and normalises to start of day', () => {
    const d = addDays(new Date(2026, 0, 5, 13, 30), -2);
    expect(dateKey(d)).toBe('2026-01-03');
    expect(d.getHours()).toBe(0);
  });
});

describe('computation', () => {
  it('statusFor classifies against a target', () => {
    expect(statusFor(2, null)).toBeNull();
    expect(statusFor(2, 3)).toBe('under');
    expect(statusFor(3, 3)).toBe('on');
    expect(statusFor(4, 3)).toBe('above');
  });

  it('windowCount counts completions in the trailing window', () => {
    addIntention({ name: 'Walk', categoryId: null, color: 'moss', targetEnabled: false, targetCompletions: 3, targetPeriodDays: 7 });
    const walk = intentionNamed('Walk').id;
    [0, 1, 2, 9].forEach((off) => toggleCompletion(walk, dateKey(addDays(today(), -off))));
    expect(windowCount(walk, today(), 7)).toBe(3); // the day -9 falls outside the 7-day window
    expect(windowCount(walk, today(), 30)).toBe(4);
  });
});
