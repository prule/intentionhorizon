import { describe, it, test } from '../fixtures';
import type { E2ESeedSpec } from '../../src/data/store';
import { Wait } from '@serenity-js/core';
import { Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';
import { Navigate, isVisible } from '@serenity-js/web';
import { NavigateDay, ReloadTheApp, OpenMonthPicker, PickMonth } from '../tasks';
import { VisibleDate, CanNavigate, ReturnToToday, ActiveTab, MonthPicker } from '../questions';
import { byTestId } from '../elements';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number): string => String(n).padStart(2, '0');
const dateKeyOf = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const labelOf = (d: Date): string => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
/** Day offset (0 = today) from now to the given date, for E2ESeedSpec.completionsByOffset. */
const offsetOf = (d: Date): number => {
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  const t = new Date(d);
  t.setHours(12, 0, 0, 0);
  return Math.round((now.getTime() - t.getTime()) / 86_400_000);
};

describe('Date navigation', () => {
  it('moves to the previous day and back', async ({ actor }) => {
    await actor.attemptsTo(
      Ensure.that(VisibleDate.label(), equals('Today')),
      Ensure.that(CanNavigate.next(), isFalse()), // cannot go past today

      NavigateDay.previous(),
      Ensure.that(VisibleDate.label(), equals('Yesterday')),

      NavigateDay.next(),
      Ensure.that(VisibleDate.label(), equals('Today')),
    );
  });

  // defaultSeed (see fixtures.ts) has "Read" completions on offsets 1,2,3 —
  // so the earliest recorded day is 3 days back, and that's where the
  // data-availability bound kicks in.
  it('disables the previous-day control once the earliest recorded day is reached', async ({
    actor,
  }) => {
    await actor.attemptsTo(
      NavigateDay.previous(),
      Ensure.that(CanNavigate.previous(), isTrue()),
      NavigateDay.previous(),
      Ensure.that(CanNavigate.previous(), isTrue()),
      NavigateDay.previous(), // now at the earliest day with data
      Ensure.that(CanNavigate.previous(), isFalse()),
    );
  });

  it('shows a return-to-today control only off today, and it jumps back', async ({ actor }) => {
    await actor.attemptsTo(
      Ensure.that(ReturnToToday.isShown(), isFalse()), // hidden on today

      NavigateDay.previous(),
      Ensure.that(ReturnToToday.isShown(), isTrue()), // appears once off today

      NavigateDay.toToday(),
      Ensure.that(VisibleDate.label(), equals('Today')),
      Ensure.that(ReturnToToday.isShown(), isFalse()), // hidden again on today
    );
  });

  it('reopens on today after navigating to a past day and reloading', async ({ actor }) => {
    await actor.attemptsTo(
      NavigateDay.previous(),
      Ensure.that(VisibleDate.label(), equals('Yesterday')),

      ReloadTheApp.now(),

      // The viewed day is not persisted: a relaunch always lands on today.
      Ensure.that(VisibleDate.label(), equals('Today')),
    );
  });

  it('treats the legacy #/today hash as an unknown route and falls back to Journal', async ({
    actor,
  }) => {
    await actor.attemptsTo(
      Navigate.to('/#/today'),
      Wait.until(byTestId('screen-entry'), isVisible()),
      Ensure.that(ActiveTab.current(), equals('journal')), // normalized away from today
    );
  });
});

describe('Date navigation with data beyond a week back', () => {
  const farBackSeed: E2ESeedSpec = {
    categories: [{ id: 'c_health', name: 'Health' }],
    intentions: [
      {
        id: 'i_read',
        name: 'Read',
        categoryId: 'c_health',
        color: 'blue',
        targetEnabled: false,
        targetCompletions: 5,
        targetPeriodDays: 7,
      },
    ],
    completionsByOffset: { i_read: [10] }, // earliest recorded day is 10 days back
  };
  test.use({ seed: farBackSeed });

  it('stays enabled past the old fixed 7-day mark when earlier data exists', async ({ actor }) => {
    for (let i = 0; i < 8; i++) await actor.attemptsTo(NavigateDay.previous());
    await actor.attemptsTo(Ensure.that(CanNavigate.previous(), isTrue())); // beyond the old fixed cap, data exists further back

    for (let i = 0; i < 2; i++) await actor.attemptsTo(NavigateDay.previous());
    await actor.attemptsTo(Ensure.that(CanNavigate.previous(), isFalse())); // reached the earliest day with data
  });
});

describe('Jump-to-month picker', () => {
  const noHistorySeed: E2ESeedSpec = {
    categories: [{ id: 'c_health', name: 'Health' }],
    intentions: [
      {
        id: 'i_read',
        name: 'Read',
        categoryId: 'c_health',
        color: 'blue',
        targetEnabled: false,
        targetCompletions: 5,
        targetPeriodDays: 7,
      },
    ],
    completionsByOffset: {},
  };

  describe('with no historical data', () => {
    test.use({ seed: noHistorySeed });

    it('hides the jump-to-month control', async ({ actor }) => {
      await actor.attemptsTo(Ensure.that(MonthPicker.isAvailable(), isFalse()));
    });
  });

  describe('with data in a past month', () => {
    // Mid-month, so it's unambiguously in a different calendar month than
    // today regardless of where in the current month "today" falls.
    const pastMonthDate = new Date();
    pastMonthDate.setMonth(pastMonthDate.getMonth() - 2, 15);
    const pastMonthLabel = labelOf(pastMonthDate);
    const pastMonthKey = dateKeyOf(pastMonthDate);

    const pastMonthSeed: E2ESeedSpec = {
      categories: [{ id: 'c_health', name: 'Health' }],
      intentions: [
        {
          id: 'i_read',
          name: 'Read',
          categoryId: 'c_health',
          color: 'blue',
          targetEnabled: false,
          targetCompletions: 5,
          targetPeriodDays: 7,
        },
      ],
      completionsByOffset: { i_read: [offsetOf(pastMonthDate)] },
    };
    test.use({ seed: pastMonthSeed });

    it('lists only months with data, and selecting one navigates to it', async ({ actor }) => {
      await actor.attemptsTo(
        OpenMonthPicker.now(),
        Ensure.that(MonthPicker.labels(), equals([pastMonthLabel])),

        PickMonth.labelled(pastMonthLabel),
        Ensure.that(VisibleDate.key(), equals(pastMonthKey)),
      );
    });
  });
});
