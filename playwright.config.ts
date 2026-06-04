import { defineConfig, devices } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

/**
 * E2e config. Runs against the Vite dev server so the test-only seed hook
 * (gated behind import.meta.env.DEV) is available; production builds never
 * include it. Each test gets a fresh browser context (isolated IndexedDB +
 * localStorage), and a deterministic dataset is injected per test.
 */
const PORT = 5173;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    // Serenity/JS reporter: enables stage crew in the reporter process so the
    // screenplay narrative is rendered and failure screenshots are archived.
    ['@serenity-js/playwright-test', {
      crew: [
        '@serenity-js/console-reporter',
        // Emits per-scenario Serenity BDD JSON; render to HTML with `npm run e2e:report`.
        '@serenity-js/serenity-bdd',
        ['@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' }],
      ],
    }],
    ...(process.env.CI
      ? [['github'] as const, ['html', { open: 'never' }] as const]
      : [['list'] as const]),
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    // Name given to the actor injected via the `actor` fixture.
    defaultActorName: 'Tess',
    // Photographer (worker-process crew). Failures-only by default; set
    // PHOTOS=all to capture a screenshot of every interaction (heavier report).
    crew: [
      ['@serenity-js/web:Photographer', {
        strategy: process.env.PHOTOS === 'all' ? 'TakePhotosOfInteractions' : 'TakePhotosOfFailures',
      }],
    ],
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
