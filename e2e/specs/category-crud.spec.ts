import { describe, it } from '../fixtures';
import { Ensure, contain, not } from '@serenity-js/assertions';
import { GoToTab, AddCategory, RenameCategory, DeleteCategory } from '../tasks';
import { CategoryList, IntentionList } from '../questions';

describe('Managing categories', () => {
  it('creates, renames, and deletes a category', async ({ actor }) => {
    await actor.attemptsTo(
      GoToTab.to('settings'),
      AddCategory.named('Wellbeing'),
      Ensure.that(CategoryList.names(), contain('Wellbeing')),

      RenameCategory.rename('Wellbeing').to('Wellness'),
      Ensure.that(CategoryList.names(), contain('Wellness')),
      Ensure.that(CategoryList.names(), not(contain('Wellbeing'))),

      DeleteCategory.named('Wellness'),
      Ensure.that(CategoryList.names(), not(contain('Wellness'))),
    );
  });

  it('deleting a category reparents its intentions to Uncategorized', async ({ actor }) => {
    // default seed: category "Health" owns Read + Workout
    await actor.attemptsTo(
      GoToTab.to('settings'),
      DeleteCategory.named('Health'),
      Ensure.that(CategoryList.names(), not(contain('Health'))),
      Ensure.that(CategoryList.names(), contain('Uncategorized')),

      // intentions survive the category deletion
      GoToTab.to('entry'),
      Ensure.that(IntentionList.names(), contain('Read')),
      Ensure.that(IntentionList.names(), contain('Workout')),
    );
  });
});
