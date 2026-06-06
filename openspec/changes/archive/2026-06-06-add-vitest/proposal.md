## Why

The project has only an end-to-end suite (Playwright/Serenity). Pure logic — CSV parsing/import, date math, target/streak/aggregate computation in `src/data/store.ts` — can only be exercised by driving the whole app in a browser, which is slow and indirect. The recent CSV-import work had to fold parser edge cases (bad header, bad date) into e2e for lack of a unit runner. A fast unit layer would cover that logic directly and catch regressions in milliseconds.

## What Changes

- Add **Vitest** as the unit-test runner, configured through the existing Vite config (jsdom environment so `localStorage`/DOM are available; `fake-indexeddb` so Dexie-backed store code runs headlessly).
- Add `npm run test:unit` (single run) and `npm run test:watch` scripts.
- Add an initial unit suite under `src/` for the pure/store logic: `parseCSV`/`importCSV` (round-trip, merge-by-name, unioned completions, invalid-header rejection, bad-date rejection), date helpers, and `statusFor`/`windowCount` computation.
- Add a **unit-test step to CI** that runs before the e2e suite, so unit failures gate builds and deploys too.
- No change to existing e2e behavior; the e2e parser-edge-case coverage can be left as integration coverage or trimmed later (out of scope here).

## Capabilities

### New Capabilities
- `unit-testing`: A Vitest-based unit-test suite that exercises pure and store-level logic headlessly, runnable locally and in CI.

### Modified Capabilities
- `ci-pipeline`: The build/e2e gate is extended to also run the unit suite on every push and pull request.

## Impact

- `package.json`: add `vitest`, `jsdom`, `fake-indexeddb` devDependencies; add `test:unit` / `test:watch` scripts.
- `vite.config.ts` (or a `vitest.config.ts`): add a `test` block (environment, setup file).
- New: a vitest setup file (registers `fake-indexeddb`) and `*.test.ts` files under `src/`.
- `tsconfig.json`: ensure test files typecheck (include globs / vitest globals types).
- `.github/workflows/deploy.yml`: add a unit-test run step in the `test` job before e2e.
- No production code or runtime behavior changes.
