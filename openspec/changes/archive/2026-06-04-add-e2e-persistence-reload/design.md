## Context

The e2e harness injects a deterministic dataset onto `window.__IH_E2E_SEED__` via Playwright's `page.addInitScript`. On boot, `store.maybeSeedForE2E()` (gated by `import.meta.env.DEV`) deletes the `real` Dexie DB, recreates it, and loads the seed.

The problem: `addInitScript` re-runs on **every** navigation, including `page.reload()`. So a reload currently wipes IndexedDB and reseeds — erasing any mutation the test made. That makes it impossible to verify the persistence round-trip, which is the whole point of this change.

Each Playwright test already gets a fresh browser context (isolated IndexedDB + localStorage), so cross-test isolation does not depend on the per-load wipe.

## Goals / Non-Goals

**Goals:**
- Verify a logged completion survives a full page reload (real IndexedDB hydrate).
- Make the seed idempotent within a context: seed on first boot, skip on reloads.
- Keep all existing specs green and the hook stripped from production builds.

**Non-Goals:**
- Changing cross-test isolation (still one context per test).
- Testing the legacy-DB migration or the mock/real toggle persistence.
- Persisting across *contexts* (not a real user scenario the suite needs).

## Decisions

**Seed-once guard via a localStorage marker.** In `maybeSeedForE2E`, after seeding, set a marker key (e.g. `localStorage['__ih_e2e_seeded'] = '1'`). On entry, if the marker is already present, return `null` so the normal hydrate path runs and reads persisted IndexedDB. `addInitScript` keeps setting `window.__IH_E2E_SEED__` on every load (harmless); the marker — which lives in the same origin's localStorage and survives reload — gates the wipe.

- *Why localStorage over a `window` flag*: `window` is recreated on reload, so a window flag wouldn't survive; localStorage does, and is per-context so it stays isolated between tests.
- *Alternative considered*: registering the init script only for the first load and removing it before reload. Rejected — Playwright has no clean per-navigation init-script toggle, and it leaks reload knowledge into the fixture.
- *Alternative considered*: seeding directly into IndexedDB from the test instead of via the app hook. Rejected — duplicates the Dexie schema in test code and is brittle.

**`ReloadTheApp` Task.** Add a screenplay Task wrapping `page.reload()` + wait for `screen-entry`, so reload is expressed as actor intent and the persistence spec reads cleanly.

## Risks / Trade-offs

- **Marker leaks between tests** → It lives in localStorage, which Playwright isolates per context; fresh context each test means a fresh (unset) marker. No leak.
- **A test that *wants* a re-wipe mid-test** → None currently do; if needed later, expose a `window.__ihTestReseed()` helper. Out of scope now.
- **Existing "clean state per test" scenario still holds** → First boot of each test still wipes+seeds (marker unset), so the guarantee is unchanged; only intra-test reloads change.
