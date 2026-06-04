import { describe, it } from '../fixtures';
import { Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';
import { LogIntention } from '../tasks';
import { CompletionState, WindowCount } from '../questions';

describe('Logging a completion', () => {
  it('marks the intention done and bumps its 7-day count', async ({ actor }) => {
    await actor.attemptsTo(
      Ensure.that(CompletionState.of('Read'), isFalse()),
      Ensure.that(WindowCount.forTarget('Read'), equals(3)),

      LogIntention.named('Read'),

      Ensure.that(CompletionState.of('Read'), isTrue()),
      Ensure.that(WindowCount.forTarget('Read'), equals(4)),
    );
  });

  it('toggling off reverts the completion and count', async ({ actor }) => {
    await actor.attemptsTo(
      LogIntention.named('Read'),
      Ensure.that(CompletionState.of('Read'), isTrue()),

      LogIntention.named('Read'),
      Ensure.that(CompletionState.of('Read'), isFalse()),
      Ensure.that(WindowCount.forTarget('Read'), equals(3)),
    );
  });
});
