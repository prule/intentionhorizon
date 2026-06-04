import { describe, it } from '../fixtures';
import { Ensure, equals } from '@serenity-js/assertions';
import { isVisible } from '@serenity-js/web';
import { GoToTab } from '../tasks';
import { ActiveTab } from '../questions';
import { byTestId } from '../elements';

describe('Insights tab', () => {
  it('renders analytics and reflects the tab in the URL hash', async ({ actor }) => {
    await actor.attemptsTo(
      GoToTab.to('analytics'),
      Ensure.that(ActiveTab.current(), equals('insights')),
      Ensure.that(byTestId('screen-insights'), isVisible()),
    );
  });
});
