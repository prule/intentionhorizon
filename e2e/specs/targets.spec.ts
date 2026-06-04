import { describe, it } from '../fixtures';
import { Ensure, equals, includes } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { GoToTab, AddIntentionWithTarget } from '../tasks';
import { TargetBadge, WindowCount } from '../questions';
import { byTestId, intentionRow } from '../elements';

/**
 * The "stat-target" text shown for an intention row on the Today screen,
 * lower-cased: the period label is rendered with a CSS `text-transform:
 * uppercase`, so the visible text is e.g. "7D" / "365D".
 */
const targetStat = (name: string) =>
  Text.of(byTestId('stat-target').of(intentionRow(name))).toLocaleLowerCase();

describe('Intention targets', () => {
  it('a new intention with a weekly target shows it on Manage and Today', async ({ actor }) => {
    await actor.attemptsTo(
      GoToTab.to('settings'),
      AddIntentionWithTarget.named('Meditate').times(5),

      // Manage screen shows the completions/period badge
      Ensure.that(TargetBadge.of('Meditate'), equals('5/7d')),

      // Today screen shows the period count against that target
      GoToTab.to('entry'),
      Ensure.that(WindowCount.forTarget('Meditate'), equals(0)),
      Ensure.that(targetStat('Meditate'), includes('/5')),
      Ensure.that(targetStat('Meditate'), includes('7d')),
    );
  });

  it('a target can span an arbitrary period (1 within 365 days)', async ({ actor }) => {
    await actor.attemptsTo(
      GoToTab.to('settings'),
      AddIntentionWithTarget.named('Annual checkup').times(1).withinDays(365),
      Ensure.that(TargetBadge.of('Annual checkup'), equals('1/365d')),

      GoToTab.to('entry'),
      Ensure.that(targetStat('Annual checkup'), includes('/1')),
      Ensure.that(targetStat('Annual checkup'), includes('365d')),
    );
  });
});
