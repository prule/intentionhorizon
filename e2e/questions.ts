import { Question } from '@serenity-js/core';
import { Attribute, Page, Text } from '@serenity-js/web';
import { byTestId, categorySections, intentionRow, intentionRows, targetBadge } from './elements';

/** The active tab as reflected in the URL hash slug (today | insights | manage). */
export const ActiveTab = {
  current: () =>
    Question.about('the active tab', async (actor) => {
      const url = await (await Page.current().answeredBy(actor)).url();
      return url.hash.replace(/^#\/?/, '');
    }),
};

/** The human-readable label shown by the Today screen's date navigator. */
export const VisibleDate = {
  label: () => Text.of(byTestId('date-label')).describedAs('the visible date'),
};

/** Whether an intention is marked complete for the currently shown day. */
export const CompletionState = {
  of: (name: string) =>
    Question.about(`whether "${name}" is complete`, async (actor) => {
      const toggle = byTestId('intention-toggle').of(intentionRow(name));
      return (await Attribute.called('aria-checked').of(toggle).answeredBy(actor)) === 'true';
    }),
};

/** The trailing target-period completion count shown for an intention. */
export const WindowCount = {
  forTarget: (name: string) =>
    Question.about(`the window count for "${name}"`, async (actor) => {
      const text = await Text.of(byTestId('stat-target-count').of(intentionRow(name))).answeredBy(actor);
      return Number(text?.trim() ?? '0');
    }),
};

/** Whether the Today screen's previous/next date button is currently enabled. */
const canNavigate = (dir: 'prev' | 'next') =>
  Question.about(`whether the actor can go to the ${dir} day`, async (actor) =>
    (await byTestId(`date-${dir}`).answeredBy(actor)).isEnabled(),
  );

export const CanNavigate = {
  previous: () => canNavigate('prev'),
  next: () => canNavigate('next'),
};

/** The names of all intentions currently listed on the Today screen. */
export const IntentionList = {
  names: () =>
    Question.about('the intention names', (actor) =>
      actor.answer(intentionRows().eachMappedTo(Attribute.called('data-intention-name'))),
    ),
};

/** The names of the category sections shown on the Manage screen. */
export const CategoryList = {
  names: () =>
    Question.about('the category names', (actor) =>
      actor.answer(categorySections().eachMappedTo(Attribute.called('data-category-name'))),
    ),
};

/** The target badge text (e.g. "5/7d") shown for an intention on Manage. */
export const TargetBadge = {
  of: (name: string) =>
    Question.about(`the target badge for "${name}"`, async (actor) => {
      const badges = targetBadge(name);
      if ((await badges.count().answeredBy(actor)) === 0) return null;
      return (await Text.of(badges.first()).answeredBy(actor))?.trim() ?? null;
    }),
};

/** A streak tile value on the Insights screen (current | best | rate). */
export const StreakValue = {
  of: (kind: 'current' | 'best' | 'rate') =>
    Question.about(`the ${kind} streak value`, async (actor) => {
      const text = await Text.of(byTestId(`streak-${kind}`)).answeredBy(actor);
      return Number(text?.trim() ?? '0');
    }),
};

/** The "N completions shown" sum on the Insights Totals block. */
export const TotalsSum = {
  value: () =>
    Question.about('the totals sum', async (actor) => {
      const text = await Text.of(byTestId('totals-sum')).answeredBy(actor);
      return Number(text?.trim() ?? '0');
    }),
};
