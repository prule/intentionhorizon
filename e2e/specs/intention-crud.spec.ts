import { describe, it } from '../fixtures';
import { Ensure, contain, not } from '@serenity-js/assertions';
import { GoToTab, AddIntention, EditIntention, DeleteIntention } from '../tasks';
import { IntentionList } from '../questions';

describe('Managing intentions', () => {
  it('creates, renames, and deletes an intention', async ({ actor }) => {
    // create on Manage, see it on Today
    await actor.attemptsTo(
      GoToTab.to('settings'),
      AddIntention.named('Floss'),
      GoToTab.to('entry'),
      Ensure.that(IntentionList.names(), contain('Floss')),
    );

    // rename on Manage, see the new name on Today
    await actor.attemptsTo(
      GoToTab.to('settings'),
      EditIntention.rename('Floss').to('Floss nightly'),
      GoToTab.to('entry'),
      Ensure.that(IntentionList.names(), contain('Floss nightly')),
      Ensure.that(IntentionList.names(), not(contain('Floss'))),
    );

    // delete on Manage, gone from Today
    await actor.attemptsTo(
      GoToTab.to('settings'),
      DeleteIntention.named('Floss nightly'),
      GoToTab.to('entry'),
      Ensure.that(IntentionList.names(), not(contain('Floss nightly'))),
    );
  });
});
