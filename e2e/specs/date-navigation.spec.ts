import { describe, it } from '../fixtures';
import { Ensure, equals, isFalse } from '@serenity-js/assertions';
import { NavigateDay } from '../tasks';
import { VisibleDate, CanNavigate } from '../questions';

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

  it('stops at the 7-day-back lower bound', async ({ actor }) => {
    for (let i = 0; i < 7; i++) await actor.attemptsTo(NavigateDay.previous());
    await actor.attemptsTo(Ensure.that(CanNavigate.previous(), isFalse()));
  });
});
