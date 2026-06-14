## Why

The app is a PWA with a hand-rolled service worker ([public/sw.js](../../../public/sw.js)). New versions ship continuously via the Pages deploy on every push to `main`, and the service worker is network-first for navigations specifically "so updates land" — but only on the *next* reload. There is no signal to a user who already has the app open: no `updatefound`/`controllerchange` handling, no prompt. So a user sitting in the app keeps running the old build indefinitely until they happen to reload.

Worse, the current update path is *unreliable* even on reload-for-detection purposes: the browser only treats the SW as updated when `sw.js` changes byte-for-byte, and `sw.js` only changes today when someone hand-bumps the `CACHE` constant. A normal deploy that touches only app code leaves `sw.js` identical, so SW-based update detection never fires.

Adopting `vite-plugin-pwa` (generateSW) solves both halves: it revisions the generated service worker on every build (content-hashed precache manifest), so each deploy is reliably detected, and it exposes a first-class "needs refresh" signal we surface as a banner.

## What Changes

- Add **`vite-plugin-pwa`** (generateSW strategy, `registerType: 'prompt'`) and configure it to replicate today's caching behavior (network-first navigations, cache-first/stale-while-revalidate for hashed assets).
- **Replace the hand-rolled service worker**: delete [public/sw.js](../../../public/sw.js) and the manual registration `<script>` in [index.html](../../../index.html); the plugin generates and registers the SW.
- Keep the existing **`public/manifest.json`** and icons unchanged via `manifest: false` — PWA install behavior is untouched; the plugin only owns SW generation and the update signal.
- Add an **`UpdateBanner`** component that uses `useRegisterSW()` to detect a waiting new version and prompt the user to reload. Mirrors the existing `ConsentBanner` look and placement.
- **Reload on demand**: clicking "Reload" calls `updateServiceWorker(true)`, which activates the waiting worker and reloads the page onto the new build.
- **Dismiss is quiet until the next deploy**: clicking "Later" hides the banner for the session; it only reappears when a genuinely newer service worker is detected (i.e. the next deploy). No dismissal state is persisted.
- **Long-open sessions notice deploys**: trigger an update check on tab focus (and a modest interval) so a user who never reloads still gets prompted.

## Capabilities

### New Capabilities
- `update-notification`: Detecting that a newer deployed version is available, prompting the user in-app, applying the update (activate waiting worker + reload) on demand, and suppressing the prompt after dismissal until the next deploy.

### Modified Capabilities
<!-- None — no existing spec governs service-worker updates or offline caching. -->

## Impact

- **Code**: [vite.config.ts](../../../vite.config.ts) (add `VitePWA`), [index.html](../../../index.html) (remove manual SW registration script), new `src/components/UpdateBanner.tsx`, [src/App.tsx](../../../src/App.tsx) (mount `<UpdateBanner />` alongside `<ConsentBanner />` in both render spots), [src/styles.css](../../../src/styles.css) (banner styles near `.consent-banner`), `src/vite-env.d.ts` (add `vite-plugin-pwa/client` types for the `virtual:pwa-register/react` import).
- **Files removed**: [public/sw.js](../../../public/sw.js) (superseded by the generated worker).
- **Dependencies**: add `vite-plugin-pwa` (dev). It pulls in Workbox build tooling at build time only; no runtime dependency added to the app bundle beyond the tiny generated registration glue.
- **Build**: `vite build` now emits a generated `sw.js` (+ `workbox-*.js`) and a `manifest.webmanifest`-style precache; the existing `public/manifest.json` link stays authoritative via `manifest: false`.
- **Caching**: behavior is reconfigured through Workbox runtime caching rather than the hand-written fetch handler; the offline app-shell guarantee (cold-start offline) is preserved.
- **Tests**: existing e2e suite must still pass against the dev server (the plugin's SW is disabled or no-op in dev unless `devOptions.enabled`); add a unit test for the banner's visibility/dismiss logic.
