## Context

Stack: Vite 6 + React 18 + TypeScript (strict), Dexie/IndexedDB persistence, Playwright/Serenity e2e. `src/data/store.ts` holds the testable logic but mixes pure helpers (`parseCSV`, `dateKey`, `statusFor`) with stateful ones that read a module-level `state` hydrated from IndexedDB via `initStore()` (and `localStorage` for the data-source flag). There is no unit runner today. Node is pinned to 24.15.0 (`.nvmrc`); CI runs build + e2e and gates Pages deploy.

## Goals / Non-Goals

**Goals:**
- A fast `npm run test:unit` that runs headlessly, locally and in CI.
- Cover the store's pure logic and at least one stateful round-trip (`initStore` → `importCSV` → `toCSV`) without a browser.
- Wire unit tests into CI ahead of e2e so they gate builds/deploys.

**Non-Goals:**
- React component / DOM-render testing (no Testing Library yet) — logic first.
- Replacing or trimming existing e2e coverage.
- Coverage thresholds / reporting gates (can come later).

## Decisions

**Vitest, configured via the existing Vite pipeline.** Vitest reuses `vite.config.ts` (same `@vitejs/plugin-react`, same `import.meta.env`), so tests see the app exactly as the build does. Add the `test` block to `vite.config.ts` rather than a separate `vitest.config.ts` to keep one source of truth. Alternative considered: Jest — rejected; it needs a parallel transform/ESM setup divorced from Vite, more config for no gain here.

**jsdom environment + `fake-indexeddb`.** `store.ts` touches `localStorage` (data-source flag) and IndexedDB (Dexie). `environment: 'jsdom'` provides `localStorage`/DOM; a setup file imports `fake-indexeddb/auto` to provide a headless IndexedDB so `initStore()`/`persistAll()` work unmodified. Rationale: lets us test real store behavior, not a mock. Alternative: `happy-dom` — viable but jsdom is the better-supported default and `fake-indexeddb` is well-trodden with it.

**Per-test store isolation.** Stateful tests must not bleed via the shared module `state`, `localStorage`, or persisted IndexedDB. Use a `beforeEach` that clears `localStorage` and deletes the fake databases (and resets modules with `vi.resetModules()` where a test needs a fresh module-level `state`). Rationale: deterministic tests; mirrors how the e2e seed isolates per context.

**Pure parser tests need no store.** `parseCSV` is pure — tested directly with string inputs (header validation, quote escaping, bad-date rejection, falsy-completed skip). `importCSV`/`toCSV` round-trip tests run after `initStore()` on a clean fake DB.

**CI: a dedicated step before e2e.** Add `- run: npm run test:unit` in the existing `test` job after `npm run build` and before `npm run e2e`. Unit tests are faster, so failing fast saves the browser provisioning cost. They run in the same job (shared `npm ci`, Node from `.nvmrc`). Alternative: a separate job — rejected; extra checkout/install overhead for little parallelism benefit at this size.

**TypeScript.** Enable Vitest globals (`globals: true`) and add `"types": ["vitest/globals"]` (or import from `vitest`). Ensure `*.test.ts` under `src/` typecheck under the existing `tsconfig.json` include of `src`.

## Risks / Trade-offs

- **`fake-indexeddb` divergence from real IndexedDB** → Low; Dexie + fake-indexeddb is a common, well-supported pairing. The e2e suite still exercises real IndexedDB in a browser as a backstop.
- **Shared module state leaking across tests** → Mitigated by `beforeEach` cleanup (clear `localStorage`, delete DBs, `vi.resetModules()` when needed).
- **Vitest jsdom pulling app/React deps into the unit run** → Acceptable; config is shared but tests import only what they touch, keeping runs fast.
- **CI time grows slightly** → Negligible; unit run is seconds and front-loads failures before the slower e2e.

## Migration Plan

Additive. New dev tooling and scripts only; no runtime or data changes. Rollback = revert the change (remove deps, scripts, config block, test files, and the CI step). Existing `npm run e2e` and deploy flow are unaffected.
