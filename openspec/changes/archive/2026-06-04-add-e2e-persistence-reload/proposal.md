## Why

The app is local-first: everything a user does persists to IndexedDB (Dexie) and must survive a page reload. That round-trip is the single most important guarantee in the product and currently has no automated coverage. A regression in the persistence layer would silently lose user data.

## What Changes

- Add an e2e journey that logs a completion, reloads the page, and asserts the completion (and other mutations) survive — exercising the real IndexedDB hydrate path, not just in-memory state.
- Make the test seed **idempotent across reloads**: today the seed hook wipes and reseeds on every page load (because `addInitScript` re-runs on reload), which would erase mid-test mutations. Change it to seed once per browser context, so a reload hydrates from persisted IndexedDB like a real user. This also makes the existing specs reload-safe.
- Add a `ReloadTheApp` Task to the screenplay layer so reload is a first-class actor action.

## Capabilities

### New Capabilities
<!-- None: extends existing e2e-testing capability. -->

### Modified Capabilities
- `e2e-testing`: The deterministic-state requirement changes so the seed applies once per context and survives in-test reloads (rather than re-wiping on every load); the journey-coverage requirement gains a persistence-across-reload scenario.

## Impact

- **Touched source**: `src/data/store.ts` — `maybeSeedForE2E` gains a "seed once" guard (e.g. a localStorage marker) so reloads skip reseeding and hydrate from IndexedDB. Still `import.meta.env.DEV`-gated; no production behavior change.
- **New test files**: `e2e/specs/persistence.spec.ts`; a `ReloadTheApp` Task in `e2e/tasks.ts`.
- **Existing specs**: become reload-safe (behavior unchanged for current tests, which never reload).
- No new dependencies.
