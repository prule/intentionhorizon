import { describe, it, test, expect } from '../fixtures';
import type { E2ESeedSpec } from '../../src/data/store';
import { Interaction, Question } from '@serenity-js/core';
import { Ensure, equals, isTrue } from '@serenity-js/assertions';
import { Page } from '@serenity-js/web';
import { LogIntention } from '../tasks';

/**
 * A long list that overflows the viewport, so the Journal scroll container has
 * somewhere to scroll. Names are stable for targeting the last row's toggle.
 */
const COLORS = ['clay', 'moss', 'amber', 'teal', 'blue', 'plum', 'sage', 'rose'];
const longSeed: E2ESeedSpec = {
  categories: [{ id: 'c_daily', name: 'Daily' }],
  intentions: Array.from({ length: 14 }, (_, i) => ({
    id: `i_${i}`, name: `Intention ${i}`, categoryId: 'c_daily',
    color: COLORS[i % COLORS.length], targetEnabled: false, targetCompletions: 3, targetPeriodDays: 7,
  })),
  completionsByOffset: {},
};

/** The current scrollTop of the Journal scroll container. */
const ScrollTop = {
  ofJournal: () =>
    Question.about('the Journal scroll position', async (actor) => {
      const page = await Page.current().answeredBy(actor);
      return page.executeScript<number, []>(() => {
        const el = document.querySelector('[data-testid="screen-entry"]');
        return el ? el.scrollTop : -1;
      });
    }),
};

/** Scroll the Journal container all the way to the bottom. */
const ScrollJournalToBottom = () =>
  Interaction.where('#actor scrolls the Journal to the bottom', async (actor) => {
    const page = await Page.current().answeredBy(actor);
    await page.executeScript(() => {
      const el = document.querySelector('[data-testid="screen-entry"]');
      if (el) el.scrollTop = el.scrollHeight;
    });
  });

describe('Journal scroll position', () => {
  test.use({ seed: longSeed });

  it('is preserved when an intention is toggled', async ({ actor }) => {
    await actor.attemptsTo(ScrollJournalToBottom());

    const before = await actor.answer(ScrollTop.ofJournal());
    // Guard: the list must actually overflow, or the test proves nothing.
    expect(before).toBeGreaterThan(0);

    await actor.attemptsTo(
      LogIntention.named('Intention 13'),
      Ensure.that(ScrollTop.ofJournal(), equals(before)),
    );
  });

  it('still refreshes the day summary after a toggle', async ({ actor }) => {
    await actor.attemptsTo(
      Ensure.that(SummaryShows.complete(0), isTrue()),
      LogIntention.named('Intention 0'),
      Ensure.that(SummaryShows.complete(1), isTrue()),
    );
  });
});

/** Whether the screen header summary reports N completed intentions. */
const SummaryShows = {
  complete: (n: number) =>
    Question.about(`whether the summary shows ${n} complete`, async (actor) => {
      const page = await Page.current().answeredBy(actor);
      return page.executeScript<boolean, [number]>((count) => {
        const el = document.querySelector('[data-testid="screen-entry"]');
        return !!el && new RegExp(`${count} of \\d+ intentions complete`).test(el.textContent || '');
      }, n);
    }),
};
