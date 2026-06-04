import { describe, it } from '../fixtures';
import { Ensure, contain, equals, isTrue } from '@serenity-js/assertions';
import { GoToTab, LogIntention, AddIntention, ReloadTheApp } from '../tasks';
import { CompletionState, WindowCount, IntentionList } from '../questions';

describe('Persistence across reload', () => {
  it('a logged completion survives a reload', async ({ actor }) => {
    await actor.attemptsTo(
      LogIntention.named('Read'),
      Ensure.that(CompletionState.of('Read'), isTrue()),
      Ensure.that(WindowCount.forTarget('Read'), equals(4)),

      ReloadTheApp.now(),

      // Re-hydrated from IndexedDB, not reseeded.
      Ensure.that(CompletionState.of('Read'), isTrue()),
      Ensure.that(WindowCount.forTarget('Read'), equals(4)),
    );
  });

  it('a newly created intention survives a reload', async ({ actor }) => {
    await actor.attemptsTo(
      GoToTab.to('settings'),
      AddIntention.named('Floss'),
      GoToTab.to('entry'),
      Ensure.that(IntentionList.names(), contain('Floss')),

      ReloadTheApp.now(),

      Ensure.that(IntentionList.names(), contain('Floss')),
    );
  });
});
