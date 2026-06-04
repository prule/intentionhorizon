## 1. Playwright setup

- [x] 1.1 Add `@playwright/test` as a devDependency and install Chromium browser binary
- [x] 1.2 Create `playwright.config.ts` with a `webServer` that builds/serves the app (preview), `baseURL`, Chromium project, headless default, and retries/trace on CI
- [x] 1.3 Add `e2e`, `e2e:headed`, and `e2e:debug` scripts to `package.json`
- [x] 1.4 Add Playwright output dirs (`playwright-report/`, `test-results/`) to `.gitignore`

## 2. Test-only seed hook

- [x] 2.1 Add a test-only seed/reset hook on `window` (e.g. `window.__ihTest`) that clears the Dexie DB + relevant localStorage keys and loads a fixed deterministic dataset, gated so it is a no-op outside test builds
- [x] 2.2 Define the fixed seed fixture (categories, intentions with known names/colors/targets, dates anchored to a fixed "today")
- [x] 2.3 Verify the hook compiles out / no-ops in a production build

## 3. Stable selectors

- [x] 3.1 Add `data-testid`s to nav (tab bar items + sidebar items) keyed by tab id
- [x] 3.2 Add `data-testid`s to intention rows and their completion toggle (keyed by intention id/name)
- [x] 3.3 Add `data-testid`s to date-nav prev/next buttons and the visible date label
- [x] 3.4 Add `data-testid`s to the add/edit intention form fields, save button, and delete button

## 4. Screenplay core

- [x] 4.1 Implement `Actor` (holds abilities; `attemptsTo(...tasks)`, `asks(question)`)
- [x] 4.2 Implement `BrowserAbility` / `BrowseTheWeb` wrapping the Playwright `Page` as the sole page accessor
- [x] 4.3 Define `Task` and `Question` interfaces/base types
- [x] 4.4 Create a Playwright fixture (`test.extend`) that resets+seeds state before each test and yields a ready `Actor`

## 5. Tasks and Questions

- [x] 5.1 Tasks: `GoToTab`, `NavigateToDay`, `LogIntention`, `AddIntention`, `EditIntention`, `DeleteIntention`
- [x] 5.2 Questions: `ActiveTab`, `VisibleDate`, `CompletionState`, `WindowCount`, `IntentionList`

## 6. Journey specs

- [x] 6.1 Spec: log a completion → intention shows done and 7-day count increments
- [x] 6.2 Spec: navigate to previous day and back; assert date/state update and bounds are disabled
- [x] 6.3 Spec: create, edit, then delete an intention; assert presence, edited name, absence
- [x] 6.4 Spec: switch to Insights tab → analytics renders and URL hash reflects the active tab

## 7. Verify

- [x] 7.1 Run `npm run e2e` and confirm all specs pass headlessly with a non-zero exit on failure
- [x] 7.2 Run `npm run typecheck` / `npm run build` to confirm no type or build regressions from the added hooks and test-ids
- [x] 7.3 Document how to run the e2e suite (README or e2e/README)
