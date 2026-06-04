## Why

The app has no automated tests. Regressions in the core flows (logging intentions, navigating dates, viewing insights, managing intentions) are only caught by manual clicking. We need end-to-end tests that exercise the real app in a browser so breakage is detected automatically before it ships.

## What Changes

- Add Playwright as the e2e test runner, configured to launch the Vite dev/preview server and run against Chromium (with room to add Firefox/WebKit).
- Adopt the **Screenplay pattern**: tests are written in terms of Actors who perform Tasks and ask Questions through Abilities (a `BrowserAbility` wrapping the Playwright `Page`). This keeps tests readable and reuses interaction logic.
- Add stable `data-testid` selectors to interactive UI elements (tab/sidebar nav, intention rows, completion toggles, date nav, add/edit forms) so locators are robust against styling changes.
- Make test runs deterministic: seed a known data state and isolate IndexedDB (Dexie) per test so completions/intentions don't bleed between tests.
- Cover the primary user journeys as e2e specs: log a completion, navigate between days, create/edit/delete an intention, switch tabs, and view insights.
- Add an `npm run e2e` script (and headed/debug variants).

## Capabilities

### New Capabilities
- `e2e-testing`: Browser-driven end-to-end test suite using Playwright and the Screenplay pattern, covering the app's core user journeys with deterministic, isolated state.

### Modified Capabilities
<!-- None: no existing spec requirements change. data-testid additions are non-behavioral. -->

## Impact

- **New dependency**: `@playwright/test` (devDependency) + browser binaries.
- **New files**: `playwright.config.ts`, `e2e/` directory (screenplay actors/tasks/questions/abilities + spec files).
- **Touched source**: `data-testid` attributes added to `src/screens/*` and `src/components/ui.tsx`; possibly a small test-seed hook gated behind a flag (no production behavior change).
- **Scripts**: new `e2e` scripts in `package.json`.
- **CI**: ready to wire into CI later (out of scope here, but config supports it).
