import { describe, it } from '../fixtures';
import { Wait } from '@serenity-js/core';
import { Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';
import { Navigate, isVisible } from '@serenity-js/web';
import { NavigateDay } from '../tasks';
import { VisibleDate, CanNavigate, ReturnToToday, ActiveTab } from '../questions';
import { byTestId } from '../elements';

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

  it('treats the legacy #/today hash as an unknown route and falls back to Journal', async ({ actor }) => {
    await actor.attemptsTo(
      Navigate.to('/#/today'),
      Wait.until(byTestId('screen-entry'), isVisible()),
      Ensure.that(ActiveTab.current(), equals('journal')), // normalized away from today
    );
  });
});
