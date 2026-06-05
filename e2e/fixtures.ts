import { useFixtures } from '@serenity-js/playwright-test';
import type { E2ESeedSpec } from '../src/data/store';
import { OpenTheApp } from './tasks';

/**
 * Deterministic dataset injected before the app boots. Completions are day
 * offsets from today (0 = today), so they stay anchored to the real clock and
 * the date-window math behaves exactly as it does for a user. "Read" has 3 of
 * its last 7 days logged (none today); "Workout" has none.
 */
export const defaultSeed: E2ESeedSpec = {
  categories: [{ id: 'c_health', name: 'Health' }],
  intentions: [
    { id: 'i_read', name: 'Read', categoryId: 'c_health', color: 'blue', targetEnabled: true, targetCompletions: 5, targetPeriodDays: 7 },
    { id: 'i_work', name: 'Workout', categoryId: 'c_health', color: 'clay', targetEnabled: true, targetCompletions: 4, targetPeriodDays: 7 },
  ],
  completionsByOffset: {
    i_read: [1, 2, 3],
  },
};

/**
 * Serenity/JS-flavoured Playwright Test API. Each test gets an actor named
 * "Tess" who can `BrowseTheWebWithPlaywright` using the `page` fixture below.
 *
 * The `seed` option fixture lets a spec swap the dataset (`test.use({ seed })`)
 * before the actor opens the app. We override the built-in `page` fixture to
 * register the seed via `addInitScript` so it lands on `window.__IH_E2E_SEED__`
 * before the app boots — `store.initStore()` reads it, and production builds
 * (where the hook is gated behind `import.meta.env.DEV`) never see it.
 */
export const { describe, it, test, beforeEach, beforeAll, afterEach, afterAll, expect } = useFixtures<{
  /** Override the seed for a specific test before the actor opens the app. */
  seed: E2ESeedSpec;
  /** Auto fixture: opens the freshly-seeded app on the Journal screen per test. */
  openApp: void;
}>({
  seed: [defaultSeed, { option: true }],
  page: async ({ page, seed }, use) => {
    await page.addInitScript((s) => {
      (window as unknown as { __IH_E2E_SEED__: E2ESeedSpec }).__IH_E2E_SEED__ = s;
      // Pre-decide analytics consent so the first-run consent banner never
      // mounts and overlays elements under test (e.g. a low-positioned save
      // button). Key/values mirror src/consent.ts; 'denied' keeps GA off.
      localStorage.setItem('ih-consent', 'denied');
    }, seed);
    await use(page);
  },
  openApp: [
    async ({ actor }, use) => {
      await actor.attemptsTo(OpenTheApp.fresh());
      await use();
    },
    { auto: true },
  ],
});
