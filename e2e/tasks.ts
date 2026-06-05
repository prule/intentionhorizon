import { Task, Wait } from '@serenity-js/core';
import { Click, Enter, isVisible, Navigate } from '@serenity-js/web';
import { not } from '@serenity-js/assertions';
import { byTestId, categoryEditButton, filterChip, intentionRow, settingsRow } from './elements';

/** Map of tab id -> the screen testid that proves the tab has rendered. */
const SCREEN: Record<string, string> = {
  entry: 'screen-entry',
  analytics: 'screen-insights',
  settings: 'screen-settings',
};

/** The intention-name form field, hidden once the add/edit form closes. */
const nameField = byTestId('intention-name');
const categoryField = byTestId('category-name');

/** Open the app at the Journal screen and wait for it to render. */
export const OpenTheApp = {
  fresh: (): Task =>
    Task.where('#actor opens the app',
      Navigate.to('/'),
      Wait.until(byTestId('screen-entry'), isVisible()),
    ),
};

/** Reload the page and wait for the Journal screen to come back. */
export const ReloadTheApp = {
  now: (): Task =>
    Task.where('#actor reloads the app',
      Navigate.reloadPage(),
      Wait.until(byTestId('screen-entry'), isVisible()),
    ),
};

/** Navigate to a top-level tab by its internal id (entry | analytics | settings). */
export const GoToTab = {
  to: (tabId: 'entry' | 'analytics' | 'settings'): Task =>
    Task.where(`#actor goes to the ${tabId} tab`,
      Click.on(byTestId(`tab-${tabId}`)),
      Wait.until(byTestId(SCREEN[tabId]), isVisible()),
    ),
};

/** Move the Journal screen's date one day backward or forward, or jump to today. */
export const NavigateDay = {
  previous: (): Task =>
    Task.where('#actor goes to the previous day', Click.on(byTestId('date-prev'))),
  next: (): Task =>
    Task.where('#actor goes to the next day', Click.on(byTestId('date-next'))),
  toToday: (): Task =>
    Task.where('#actor returns to today', Click.on(byTestId('date-today'))),
};

/** Toggle an intention's completion for the currently shown day. */
export const LogIntention = {
  named: (name: string): Task =>
    Task.where(`#actor logs "${name}"`,
      Click.on(byTestId('intention-toggle').of(intentionRow(name))),
    ),
};

/** Create a new intention with the given name via the Manage screen. */
export const AddIntention = {
  named: (name: string): Task =>
    Task.where(`#actor adds the intention "${name}"`,
      Click.on(byTestId('add-intention')),
      Enter.theValue(name).into(nameField),
      Click.on(byTestId('save-intention')),
      Wait.until(nameField, not(isVisible())),
    ),
};

/** Rename an existing intention via the Manage screen. */
export const EditIntention = {
  rename: (from: string): { to(to: string): Task } => ({
    to: (to: string): Task =>
      Task.where(`#actor renames "${from}" to "${to}"`,
        Click.on(settingsRow(from)),
        Enter.theValue(to).into(nameField),
        Click.on(byTestId('save-intention')),
        Wait.until(nameField, not(isVisible())),
      ),
  }),
};

/** Delete an existing intention via the Manage screen. */
export const DeleteIntention = {
  named: (name: string): Task =>
    Task.where(`#actor deletes the intention "${name}"`,
      Click.on(settingsRow(name)),
      Click.on(byTestId('delete-intention')),
      Wait.until(nameField, not(isVisible())),
    ),
};

/** The completions value the target form opens at before any stepping. */
const TARGET_DEFAULT_COMPLETIONS = 3;

/**
 * Create an intention with a target enabled: `completions` times within
 * `periodDays` days. The completions stepper has no direct input, so we step
 * inc/dec from the form's known default of 3 the right number of times.
 */
const addIntentionWithTarget = (name: string, completions: number, periodDays: number): Task => {
  const delta = completions - TARGET_DEFAULT_COMPLETIONS;
  const stepButton = delta >= 0 ? 'target-completions-inc' : 'target-completions-dec';
  const steps = Array.from({ length: Math.abs(delta) }, () => Click.on(byTestId(stepButton)));
  const periodSteps = periodDays === 7 ? [] : [Enter.theValue(String(periodDays)).into(byTestId('target-period'))];

  return Task.where(`#actor adds "${name}" with a target of ${completions} within ${periodDays} days`,
    Click.on(byTestId('add-intention')),
    Enter.theValue(name).into(nameField),
    Click.on(byTestId('targets-switch')),
    ...steps,
    ...periodSteps,
    Click.on(byTestId('save-intention')),
    Wait.until(nameField, not(isVisible())),
  );
};

/**
 * `.times(n)` defaults the period to 7 and is itself a runnable Task; chain
 * `.withinDays(d)` to choose another period.
 */
export const AddIntentionWithTarget = {
  named: (name: string) => ({
    times: (n: number): Task & { withinDays(d: number): Task } =>
      Object.assign(addIntentionWithTarget(name, n, 7), {
        withinDays: (d: number): Task => addIntentionWithTarget(name, n, d),
      }),
  }),
};

/** Create a new category via the Manage screen. */
export const AddCategory = {
  named: (name: string): Task =>
    Task.where(`#actor adds the category "${name}"`,
      Click.on(byTestId('add-category')),
      Enter.theValue(name).into(categoryField),
      Click.on(byTestId('save-category')),
      Wait.until(categoryField, not(isVisible())),
    ),
};

/** Rename an existing category via the Manage screen. */
export const RenameCategory = {
  rename: (from: string): { to(to: string): Task } => ({
    to: (to: string): Task =>
      Task.where(`#actor renames category "${from}" to "${to}"`,
        Click.on(categoryEditButton(from)),
        Enter.theValue(to).into(categoryField),
        Click.on(byTestId('save-category')),
        Wait.until(categoryField, not(isVisible())),
      ),
  }),
};

/** Delete an existing category via the Manage screen. */
export const DeleteCategory = {
  named: (name: string): Task =>
    Task.where(`#actor deletes the category "${name}"`,
      Click.on(categoryEditButton(name)),
      Click.on(byTestId('delete-category')),
      Wait.until(categoryField, not(isVisible())),
    ),
};

/** Scope the Insights screen to one intention, or back to all. */
export const FilterInsightsBy = {
  intention: (name: string): Task =>
    Task.where(`#actor filters Insights by "${name}"`, Click.on(filterChip(name))),
  all: (): Task =>
    Task.where('#actor clears the Insights filter', Click.on(filterChip('All'))),
};
