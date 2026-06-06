## 1. Mutation-layer tests

- [x] 1.1 Create `src/data/store.mutations.test.ts` with the shared clean-store `beforeEach` (initStore + resetSeed)
- [x] 1.2 Categories: add, update (rename), delete-with-reparent (orphaned intentions become uncategorized)
- [x] 1.3 Intentions: add with defaulted fields, update, delete-removes-completions
- [x] 1.4 `toggleCompletion` on/off + `isDone`
- [x] 1.5 `reorderIntentions` (within a category group) and `reorderCategories`

## 2. Analytics tests

- [x] 2.1 Add analytics tests (in store.mutations.test.ts or a new `store.analytics.test.ts`) over a known dataset built with `addDays(today(), -n)`
- [x] 2.2 `doneOnDay` and `dayMet` (filtered + unfiltered)
- [x] 2.3 `dayMetric` (count, met, metRatio, targetedTotal)
- [x] 2.4 `aggregate` for day / month / year grouping
- [x] 2.5 `streaks` current (incl. today-grace), best, rate; and `fmtDay` (Today/Yesterday/explicit)

## 3. Persistence + data-source tests

- [x] 3.1 `getDataSource` default (`real`) + `setDataSource` round-trip via localStorage
- [x] 3.2 Mutate, drain writes, re-`initStore()` against the same in-memory IndexedDB, assert mutation present

## 4. Consent tests

- [x] 4.1 Create `src/consent.test.ts`: `getStoredConsent` valid / invalid / absent → choice / null / null
- [x] 4.2 `setConsent` writes localStorage and calls `window.gtag` with `('consent','update',{analytics_storage: choice})` (spy)

## 5. Verify

- [x] 5.1 Run `npm run test:unit` (all green) and `npm run typecheck`
- [x] 5.2 Run `openspec validate vitest-store-coverage`
