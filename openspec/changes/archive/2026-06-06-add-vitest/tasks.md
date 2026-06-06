## 1. Tooling setup

- [x] 1.1 Add devDependencies: `vitest`, `jsdom`, `fake-indexeddb`
- [x] 1.2 Add `test` block to `vite.config.ts` (environment `jsdom`, `globals: true`, `setupFiles`)
- [x] 1.3 Create the setup file that imports `fake-indexeddb/auto`
- [x] 1.4 Add `test:unit` (`vitest run`) and `test:watch` (`vitest`) scripts to package.json
- [x] 1.5 Add `vitest/globals` to tsconfig types; confirm `*.test.ts` under `src` typecheck

## 2. Test isolation helper

- [x] 2.1 Add a `beforeEach` that clears `localStorage` and deletes fake IndexedDB databases (and `vi.resetModules()` where a fresh module `state` is needed)

## 3. Unit tests

- [x] 3.1 `parseCSV` tests: valid parse, missing-required-column error, quote/escape handling, bad-date skip, falsy-`completed` skip
- [x] 3.2 `importCSV`/`toCSV` round-trip after `initStore()` on a clean fake DB
- [x] 3.3 `importCSV` merge-by-name (no duplicate category/intention) and unioned completions
- [x] 3.4 Date helpers (`dateKey`, `parseKey`, `addDays`) and `statusFor`/`windowCount` computation

## 4. CI integration

- [x] 4.1 Add `- run: npm run test:unit` to the `test` job in `.github/workflows/deploy.yml`, after build and before e2e

## 5. Verify

- [x] 5.1 Run `npm run test:unit` locally (green), `npm run typecheck`, and `npm run e2e` (still green)
- [x] 5.2 Run `openspec validate add-vitest`
