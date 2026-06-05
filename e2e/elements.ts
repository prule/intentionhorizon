import { By, PageElement, PageElements } from '@serenity-js/web';

/**
 * Shared page-element locators, all targeting the app's `data-testid`
 * attributes. Tasks and Questions compose these rather than locating elements
 * themselves, so selectors live in exactly one place. Return types are left to
 * inference — `.describedAs()` yields a `QuestionAdapter`, which is what the
 * Serenity/JS interactions and questions expect.
 */

/** Any element addressed solely by its `data-testid`. */
export const byTestId = (id: string) =>
  PageElement.located(By.css(`[data-testid="${id}"]`)).describedAs(`the ${id}`);

/** A single intention row on the Journal screen, keyed by intention name. */
export const intentionRow = (name: string) =>
  PageElement.located(By.css(`[data-testid="intention-row"][data-intention-name="${name}"]`))
    .describedAs(`the "${name}" intention row`);

/** All intention rows on the Journal screen. */
export const intentionRows = () =>
  PageElements.located(By.css('[data-testid="intention-row"]')).describedAs('the intention rows');

/** An intention's editable row on the Manage screen, keyed by name. */
export const settingsRow = (name: string) =>
  PageElement.located(By.css(`[data-testid="settings-intention"][data-intention-name="${name}"]`))
    .describedAs(`the "${name}" settings row`);

/** The edit affordance for a category on the Manage screen, keyed by name. */
export const categoryEditButton = (name: string) =>
  PageElement.located(By.css(`[data-testid="category-edit"][data-category-name="${name}"]`))
    .describedAs(`the edit button for category "${name}"`);

/** All category sections on the Manage screen. */
export const categorySections = () =>
  PageElements.located(By.css('[data-testid="category-section"]')).describedAs('the category sections');

/** An Insights filter chip, keyed by its label ("All" or an intention name). */
export const filterChip = (label: string) =>
  PageElement.located(By.css(`[data-testid="filter-chip"][data-filter-name="${label}"]`))
    .describedAs(`the "${label}" filter chip`);

/** The target badge(s) shown for an intention on Manage, keyed by name. */
export const targetBadge = (name: string) =>
  PageElements.located(By.css(`[data-testid="target-badge"][data-intention-name="${name}"]`))
    .describedAs(`the target badge for "${name}"`);
