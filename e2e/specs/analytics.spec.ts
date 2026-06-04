import { describe, it, test } from '../fixtures';
import type { E2ESeedSpec } from '../../src/data/store';
import { Wait } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { GoToTab, FilterInsightsBy } from '../tasks';
import { StreakValue, TotalsSum } from '../questions';

/**
 * Tailored seed with hand-computable analytics:
 *   Read    done on offsets 0,1,2 (today + 2 prior days)
 *   Workout done on offset 5
 *
 * "Met" day = any intention done (unfiltered) / that intention done (filtered).
 *   All:  met days = {0,1,2,5} → current streak 3 (0,1,2), best run 3,
 *         30-day rate = 4/30 = 13%, totals (last 10 days) = 3 + 1 = 4
 *   Read: met days = {0,1,2}    → current 3, best 3, rate = 3/30 = 10%, totals = 3
 */
const analyticsSeed: E2ESeedSpec = {
  categories: [{ id: 'c_health', name: 'Health' }],
  intentions: [
    { id: 'i_read', name: 'Read', categoryId: 'c_health', color: 'blue', targetEnabled: false, targetCompletions: 5, targetPeriodDays: 7 },
    { id: 'i_work', name: 'Workout', categoryId: 'c_health', color: 'clay', targetEnabled: false, targetCompletions: 4, targetPeriodDays: 7 },
  ],
  completionsByOffset: {
    i_read: [0, 1, 2],
    i_work: [5],
  },
};

describe('Analytics correctness', () => {
  test.use({ seed: analyticsSeed });

  it('streaks and totals reflect the seed, and filtering re-scopes them', async ({ actor }) => {
    await actor.attemptsTo(
      GoToTab.to('analytics'),

      // unfiltered (All)
      Wait.until(StreakValue.of('current'), equals(3)),
      Wait.until(StreakValue.of('best'), equals(3)),
      Wait.until(StreakValue.of('rate'), equals(13)),
      Wait.until(TotalsSum.value(), equals(4)),

      // scope to Read
      FilterInsightsBy.intention('Read'),
      Wait.until(StreakValue.of('rate'), equals(10)),
      Wait.until(TotalsSum.value(), equals(3)),

      // back to All restores the broader figures
      FilterInsightsBy.all(),
      Wait.until(TotalsSum.value(), equals(4)),
    );
  });
});
