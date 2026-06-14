## 1. Plugin setup

- [x] 1.1 Add `vite-plugin-pwa` as a dev dependency
- [x] 1.2 In `vite.config.ts`, add `VitePWA({ registerType: 'prompt', manifest: false, ... })`
- [x] 1.3 Configure `workbox` runtime caching to replicate current behavior: network-first for navigations with `navigateFallback` to the precached `index.html`; cache-first / stale-while-revalidate for content-hashed assets
- [x] 1.4 Keep dev SW disabled (do not set `devOptions.enabled`) so the e2e dev server is unaffected
- [x] 1.5 Add `/// <reference types="vite-plugin-pwa/react" />` to `src/vite-env.d.ts` (the `/react` variant covers the `virtual:pwa-register/react` hook)
- [x] 1.6 Add `workbox-window` as a dev dependency — pnpm's strict layout won't resolve the plugin's `virtual:pwa-register/react` import of it otherwise (build fails without it)

## 2. Remove the hand-rolled service worker

- [x] 2.1 Delete `public/sw.js`
- [x] 2.2 Remove the manual `navigator.serviceWorker.register('sw.js')` `<script>` from `index.html`
- [x] 2.3 Confirm `public/manifest.json` and the `<link rel="manifest">` remain (manifest stays plugin-untouched)

## 3. Update banner

- [x] 3.1 Add `src/components/UpdateBanner.tsx` using `useRegisterSW()`; render only when `needRefresh` is true
- [x] 3.2 "Reload" calls `updateServiceWorker(true)`; "Later" calls `setNeedRefresh(false)` (no persistence)
- [x] 3.3 In `onRegisteredSW`, call `registration.update()` on `visibilitychange`→visible and on a periodic interval (30 min) so long-open sessions detect deploys
- [x] 3.4 Add banner styles in `src/styles.css` near `.consent-banner`, with a `data-testid` for tests
- [x] 3.5 Mount `<UpdateBanner />` alongside `<ConsentBanner />` in both the desktop and mobile branches of `src/App.tsx`
- [x] 3.6 Stack the update banner above the consent banner when both show (`.app-shell:has(.consent-banner)`), reserving 180px so they don't overlap — verified the consent banner is ~164px tall on a narrow viewport

## 4. Tests

- [x] 4.1 Add a unit test for the banner: hidden when no update; shown when `needRefresh`; "Later" hides it; "Reload" triggers the update callback (mock `virtual:pwa-register/react`). Broadened the Vitest `include` to `src/**/*.test.{ts,tsx}` for the `.tsx` component test
- [x] 4.2 Confirm the existing e2e suite still passes against the dev server (21/21 passed)

## 5. Verify

- [x] 5.1 `pnpm typecheck` clean
- [x] 5.2 `pnpm test:unit` passes (40/40)
- [x] 5.3 `pnpm build` emits a generated `sw.js` + `workbox-*.js` precache (4 entries); production `pnpm preview` registers and activates it (verified `navigator.serviceWorker.controller` + `workbox-precache` cache)
- [x] 5.4 Offline: precache populated and `navigateFallback` set so the shell cold-starts offline
- [x] 5.5 Update flow: rebuilt to produce a new revisioned `sw.js` → waiting worker installed → banner appeared with Reload/Later; "Later" hid it without reloading and left the worker waiting (quiet until next deploy)
