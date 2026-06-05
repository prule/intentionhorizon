## 1. Suppress the consent banner in the e2e harness

- [x] 1.1 In `e2e/fixtures.ts`, extend the pre-boot `page.addInitScript` so it also sets `localStorage['ih-consent'] = 'denied'` before the app boots
- [x] 1.2 Add a brief comment noting this keeps first-run interstitials from overlaying elements under test (key/values mirror `src/consent.ts`)

## 2. Verify

- [x] 2.1 Run `npm run e2e -- targets.spec.ts` (nvm Node 24) and confirm both target tests pass
- [x] 2.2 Run the full `npm run e2e` suite and confirm all specs are green (15 passed)
- [x] 2.3 Confirm no production/source files changed — the fix is confined to the e2e harness (only `e2e/fixtures.ts` modified)
