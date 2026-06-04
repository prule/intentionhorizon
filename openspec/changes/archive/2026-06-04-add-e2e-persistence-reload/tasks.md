## 1. Seed-once guard

- [x] 1.1 In `src/data/store.ts` `maybeSeedForE2E`, return early (normal hydrate) when a localStorage marker (e.g. `__ih_e2e_seeded`) is already set
- [x] 1.2 Set that marker after a successful seed so subsequent reloads skip the wipe/reseed
- [x] 1.3 Confirm the guard stays inside the `import.meta.env.DEV` branch (no production change)

## 2. Reload task

- [x] 2.1 Add a `ReloadTheApp` Task to `e2e/tasks.ts` that calls `page.reload()` and waits for `screen-entry`

## 3. Persistence spec

- [x] 3.1 Add `e2e/specs/persistence.spec.ts`: log a completion, reload, assert completion still shown and 7-day count retained
- [x] 3.2 Add a case: create an intention, reload, assert it still appears on Today

## 4. Verify

- [x] 4.1 Run `npm run e2e` — new persistence specs pass and all existing specs stay green
- [x] 4.2 Run `npm run build` to confirm the seed-once guard is still tree-shaken from the production bundle
