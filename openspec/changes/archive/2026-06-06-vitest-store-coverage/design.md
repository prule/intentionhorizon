## Context

`src/data/store.ts` keeps an in-memory `state` hydrated from IndexedDB (Dexie) on `initStore()`; reads are synchronous against it and mutations update the cache then persist via a serialized write queue. The unit harness (`src/test/setup.ts`) already gives a fresh `IDBFactory` + cleared `localStorage` per test, and `store.test.ts` proves `initStore()` works headlessly. This change is purely additive test coverage — no production code changes — so the main design questions are *what to assert* and *how to test the few async/time-dependent seams deterministically*.

## Goals / Non-Goals

**Goals:**
- Cover the store mutation layer, analytics computation, and consent persistence with fast, deterministic unit tests.
- Assert the subtle behaviors: orphan reparenting on category delete, completion cleanup on intention delete, streak today-grace, window/aggregate boundaries.
- Verify persistence by reading data back through a second `initStore()` on the same in-memory IndexedDB.

**Non-Goals:**
- React component / DOM-render tests (no Testing Library here).
- Testing `App.tsx` routing helpers (`tabToHash`/`hashToTab`/`initialTab` are not exported; refactoring to export them is out of scope).
- Coverage thresholds/gates.

## Decisions

**Anchor time-dependent assertions to `today()`/`addDays`, not literal dates.** `streaks`, `dayMet`, `dayMetric`, `aggregate`, and `windowCount` all compute relative to the real clock. Tests build completions with `dateKey(addDays(today(), -n))` so they stay correct regardless of when they run — mirroring how the e2e seed and existing `windowCount` test already work. Alternative considered: `vi.useFakeTimers()` to freeze the clock — rejected as unnecessary complexity; the relative-offset approach is simpler and already proven in `store.test.ts`.

**Test persistence via re-`initStore()`, not by inspecting Dexie.** To prove a mutation persisted, re-run `initStore()` (same in-memory IndexedDB from setup) and assert the hydrated state contains the change. The write queue is async, so tests `await` a flush point before re-initialising. `switchDataSource`/`initStore` already `await writeQ`, giving a natural drain; where needed a test awaits a microtask/`initStore()` which opens the DB after pending writes. Rationale: tests the real persisted shape (order columns, completion rows), not internals.

**Split test files by concern.** Keep CSV/date/compute basics in `store.test.ts`; add `store.mutations.test.ts` for CRUD + persistence and `store.analytics.test.ts` for aggregate/streak/dayMetric (or fold analytics into one store test file if small). `consent.test.ts` is standalone. Rationale: readability and faster failure localisation. Final file split can flex during implementation as long as the coverage requirements are met.

**Mock `window.gtag` for consent.** `setConsent` calls `window.gtag?.(...)`. Tests assign a `vi.fn()` to `window.gtag` and assert it's called with `('consent','update',{analytics_storage: choice})`, and that the choice is written to `localStorage`. `getStoredConsent` is tested for valid values, an invalid stored value (→ null), and absence (→ null). Rationale: gtag is the only external side effect; a spy verifies the contract without a real analytics tag.

## Risks / Trade-offs

- **Async write-queue timing makes persistence assertions flaky** → Mitigated by draining through `initStore()`/`await` before read-back rather than racing a fixed delay.
- **Relative-date tests near midnight** → Negligible; same risk the existing suite and e2e already accept, and assertions use whole-day keys.
- **Over-asserting on defaulted fields (ids/colors)** → Avoided; assert on stable, behavior-defining fields (names, categoryId links, completion day sets, counts) like the existing snapshot helper.

## Migration Plan

Additive, tests only. Rollback = delete the new test files. No runtime, dependency, or CI changes (the existing `npm run test:unit` step picks up new `src/**/*.test.ts` automatically).
