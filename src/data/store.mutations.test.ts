import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initStore, load, resetSeed,
  addCategory, updateCategory, deleteCategory,
  addIntention, updateIntention, deleteIntention,
  toggleCompletion, isDone, reorderIntentions, reorderCategories,
  doneOnDay, dayMet, dayMetric, aggregate, streaks, fmtDay,
  getDataSource, setDataSource,
  monthsWithData, earliestCompletionDate, latestCompletionInMonth,
  dateKey, addDays, today,
  type IntentionInput,
} from './store';

// Clean, hydrated (empty `real`) store before each test. setup.ts swaps a fresh
// IndexedDB and clears localStorage, so re-initialising starts blank.
beforeEach(async () => {
  await initStore();
  resetSeed();
});

const input = (over: Partial<IntentionInput> = {}): IntentionInput => ({
  name: 'Read', categoryId: null, color: 'blue',
  targetEnabled: false, targetCompletions: 3, targetPeriodDays: 7, ...over,
});
const byName = (name: string) => load().intentions.find((it) => it.name === name)!;
const catId = (name: string) => load().categories.find((c) => c.name === name)!.id;

describe('category mutations', () => {
  it('adds and renames a category', () => {
    addCategory('Health');
    expect(load().categories.map((c) => c.name)).toEqual(['Health']);
    updateCategory(catId('Health'), 'Wellness');
    expect(load().categories.map((c) => c.name)).toEqual(['Wellness']);
  });

  it('deleting a category reparents its intentions to uncategorized', () => {
    addCategory('Health');
    addIntention(input({ name: 'Read', categoryId: catId('Health') }));
    expect(byName('Read').categoryId).toBe(catId('Health'));

    deleteCategory(catId('Health'));
    expect(load().categories).toHaveLength(0);
    expect(byName('Read').categoryId).toBeNull(); // intention survives, uncategorized
  });
});

describe('intention mutations', () => {
  it('adds with defaulted fields', () => {
    addIntention({ name: 'Walk' } as IntentionInput);
    const walk = byName('Walk');
    expect(walk).toMatchObject({ categoryId: null, color: 'clay', targetEnabled: false, targetCompletions: 3, targetPeriodDays: 7 });
    expect(walk.id).toBeTruthy();
  });

  it('updates fields in place', () => {
    addIntention(input({ name: 'Read' }));
    updateIntention(byName('Read').id, { name: 'Read more', targetEnabled: true });
    expect(byName('Read more').targetEnabled).toBe(true);
  });

  it('deleting an intention removes its completions', () => {
    addIntention(input({ name: 'Read' }));
    const id = byName('Read').id;
    toggleCompletion(id, dateKey(today()));
    expect(load().completions[id]).toBeDefined();

    deleteIntention(id);
    expect(load().intentions).toHaveLength(0);
    expect(load().completions[id]).toBeUndefined();
  });
});

describe('completions', () => {
  it('toggles a completion on and off', () => {
    addIntention(input({ name: 'Read' }));
    const id = byName('Read').id;
    const k = dateKey(today());
    expect(isDone(id, k)).toBe(false);
    toggleCompletion(id, k);
    expect(isDone(id, k)).toBe(true);
    toggleCompletion(id, k);
    expect(isDone(id, k)).toBe(false);
  });
});

describe('reordering', () => {
  it('reorders intentions within a category group', () => {
    addIntention(input({ name: 'A' }));
    addIntention(input({ name: 'B' }));
    const [a, b] = [byName('A').id, byName('B').id];
    reorderIntentions('_none', [b, a]);
    expect(load().intentions.map((it) => it.name)).toEqual(['B', 'A']);
  });

  it('reorders categories', () => {
    addCategory('One');
    addCategory('Two');
    reorderCategories([catId('Two'), catId('One')]);
    expect(load().categories.map((c) => c.name)).toEqual(['Two', 'One']);
  });
});

describe('analytics', () => {
  // Build a known dataset anchored to today: "Read" target-enabled (3 in 7),
  // done on offsets 0,1,2; "Walk" no target, done on offsets 0 and 10.
  const seed = () => {
    addIntention(input({ name: 'Read', targetEnabled: true, targetCompletions: 3, targetPeriodDays: 7 }));
    addIntention(input({ name: 'Walk', color: 'moss' }));
    const read = byName('Read').id, walk = byName('Walk').id;
    [0, 1, 2].forEach((o) => toggleCompletion(read, dateKey(addDays(today(), -o))));
    [0, 10].forEach((o) => toggleCompletion(walk, dateKey(addDays(today(), -o))));
    return { read, walk };
  };

  it('doneOnDay returns the intentions completed that day', () => {
    seed();
    const names = doneOnDay(dateKey(today())).map((it) => it.name).sort();
    expect(names).toEqual(['Read', 'Walk']);
    expect(doneOnDay(dateKey(addDays(today(), -1))).map((it) => it.name)).toEqual(['Read']);
  });

  it('dayMet is true when the filtered/any intention is done', () => {
    const { read } = seed();
    expect(dayMet(dateKey(today()), null)).toBe(true);
    expect(dayMet(dateKey(addDays(today(), -1)), read)).toBe(true);
    expect(dayMet(dateKey(addDays(today(), -5)), null)).toBe(false);
  });

  it('dayMetric reports count and target-met ratio', () => {
    seed();
    const m = dayMetric(today(), null);
    expect(m.count).toBe(2);          // Read + Walk done today
    expect(m.targetedTotal).toBe(1);  // only Read is target-enabled
    expect(m.met).toBe(1);            // Read hit 3-in-7 as of today
    expect(m.metRatio).toBe(1);
  });

  it('aggregate buckets completions by grouping', () => {
    seed();
    const byDay = aggregate(null, 'day', 7);
    expect(byDay).toHaveLength(7);
    expect(byDay[byDay.length - 1].value).toBe(2); // today: Read + Walk
    const total = byDay.reduce((n, b) => n + b.value, 0);
    expect(total).toBe(4); // Read 0,1,2 (3) + Walk 0 (1); Walk -10 is outside the 7-day range

    // year grouping collapses to a single bucket for a short range
    const byYear = aggregate(null, 'year', 7);
    expect(byYear).toHaveLength(1);
    expect(byYear[0].value).toBe(total);
  });

  it('streaks counts current (with today-grace), best, and rate', () => {
    const { read } = seed(); // Read done today,-1,-2
    const s = streaks(read);
    expect(s.current).toBe(3);
    expect(s.best).toBeGreaterThanOrEqual(3);
    expect(s.rate).toBe(Math.round((3 / 30) * 100));
  });

  it('current streak keeps counting when today is not yet logged (grace)', () => {
    addIntention(input({ name: 'Read' }));
    const read = byName('Read').id;
    [1, 2, 3].forEach((o) => toggleCompletion(read, dateKey(addDays(today(), -o)))); // not today
    expect(streaks(read).current).toBe(3);
  });
});

describe('month/date availability', () => {
  it('reports no months, no earliest date, and no month data when there are no completions', () => {
    expect(monthsWithData()).toEqual([]);
    expect(earliestCompletionDate()).toBeNull();
    expect(latestCompletionInMonth(2026, 0)).toBeNull();
  });

  it('finds the single month containing data', () => {
    addIntention(input({ name: 'Read' }));
    const id = byName('Read').id;
    const d = new Date(2026, 2, 15); // Mar 15, 2026
    toggleCompletion(id, dateKey(d));

    expect(monthsWithData()).toEqual([{ year: 2026, month: 2 }]);
    expect(earliestCompletionDate()).toEqual(d);
    expect(latestCompletionInMonth(2026, 2)).toEqual(d);
    expect(latestCompletionInMonth(2026, 3)).toBeNull(); // no data in April
  });

  it('sorts distinct months across years most-recent-first and picks the true earliest/latest', () => {
    addIntention(input({ name: 'Read' }));
    const id = byName('Read').id;
    const early = new Date(2024, 11, 1);   // Dec 1, 2024
    const mid = new Date(2025, 5, 10);     // Jun 10, 2025
    const midLater = new Date(2025, 5, 20); // Jun 20, 2025 — same month as `mid`
    const late = new Date(2026, 0, 3);     // Jan 3, 2026
    [early, mid, midLater, late].forEach((d) => toggleCompletion(id, dateKey(d)));

    expect(monthsWithData()).toEqual([
      { year: 2026, month: 0 },
      { year: 2025, month: 5 },
      { year: 2024, month: 11 },
    ]);
    expect(earliestCompletionDate()).toEqual(early);
    expect(latestCompletionInMonth(2025, 5)).toEqual(midLater);
  });

  it('does not list a month with no recorded completions', () => {
    addIntention(input({ name: 'Read' }));
    toggleCompletion(byName('Read').id, dateKey(new Date(2026, 4, 1)));
    expect(monthsWithData().some((p) => p.year === 2026 && p.month === 6)).toBe(false);
  });
});

describe('fmtDay', () => {
  it('labels today and yesterday', () => {
    expect(fmtDay(today())).toBe('Today');
    expect(fmtDay(addDays(today(), -1))).toBe('Yesterday');
  });
  it('labels other days with weekday + month + date', () => {
    expect(fmtDay(new Date(2026, 0, 5))).toMatch(/^[A-Z][a-z]{2} Jan 5$/);
  });
});

describe('data source flag', () => {
  it('defaults to real and round-trips through localStorage', () => {
    expect(getDataSource()).toBe('real');
    setDataSource('mock');
    expect(getDataSource()).toBe('mock');
    expect(localStorage.getItem('ih-data-source')).toBe('mock');
  });
});

describe('persistence', () => {
  it('a mutation survives re-initialisation against the same database', async () => {
    addCategory('Persisted');
    addIntention(input({ name: 'Survivor', categoryId: catId('Persisted') }));
    toggleCompletion(byName('Survivor').id, dateKey(today()));

    // Re-hydrate from IndexedDB (drains via waitFor since writes are async).
    await vi.waitFor(async () => {
      const s = await initStore();
      expect(s.categories.map((c) => c.name)).toContain('Persisted');
      expect(s.intentions.map((i) => i.name)).toContain('Survivor');
    });
    const survivor = byName('Survivor');
    expect(isDone(survivor.id, dateKey(today()))).toBe(true);
  });
});
