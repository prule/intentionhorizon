## Why

The unit suite currently covers `store.ts`'s CSV logic, date helpers, and `statusFor`/`windowCount` — but the bulk of the module is untested: the mutation layer (category/intention CRUD with orphan reparenting and completion cleanup), the analytics computation (`aggregate`, `dayMetric`, `streaks`, `doneOnDay`, `dayMet`), reordering, and persistence read-back. `consent.ts` (the only third-party data path) is also untested. These are pure-ish, deterministic functions ideal for fast unit coverage, and several have subtle edge cases (streak grace-for-today, orphan reparenting, window boundaries) that only e2e touches indirectly today.

## What Changes

- Add unit tests for the **store mutation layer**: `addCategory`/`updateCategory`/`deleteCategory` (incl. orphaned intentions reparenting to uncategorized), `addIntention` defaults, `updateIntention`, `deleteIntention` (incl. completion cleanup), `toggleCompletion` on/off, `isDone`, `reorderIntentions`, `reorderCategories`.
- Add unit tests for the **computation/analytics layer**: `doneOnDay`, `dayMet`, `dayMetric`, `aggregate` (day/month/year grouping), `streaks` (current/best/rate incl. today-grace), `fmtDay`.
- Add unit tests for **data-source flag + persistence read-back**: `getDataSource`/`setDataSource` defaults, and that mutations survive a re-`initStore()` against the same in-memory IndexedDB.
- Add a **`consent.ts` test file**: `getStoredConsent` (valid/invalid/missing) and `setConsent` (persists + calls `window.gtag`).
- No production code changes — tests only.

## Capabilities

### New Capabilities
<!-- None: extends the existing unit-testing capability. -->

### Modified Capabilities
- `unit-testing`: Broaden the required unit coverage beyond CSV to the store mutation layer, analytics computation, persistence read-back, and consent persistence.

## Impact

- New test files: `src/data/store.mutations.test.ts` (or extend `store.test.ts`), `src/consent.test.ts`.
- Possibly split `store.test.ts` for readability; no change to `setup.ts` or config.
- No runtime/production code changes; no new dependencies.
