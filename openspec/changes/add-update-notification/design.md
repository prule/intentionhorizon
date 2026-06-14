## Context

The app is a Vite + React SPA deployed to GitHub Pages on every push to `main` ([.github/workflows/deploy.yml](../../../.github/workflows/deploy.yml)). It ships a hand-rolled service worker, [public/sw.js](../../../public/sw.js), registered by an inline `<script>` in [index.html](../../../index.html). That SW is network-first for navigations and stale-while-revalidate for other GET requests, with eager `skipWaiting()` + `clients.claim()` on install. There is a `public/manifest.json` and icons for PWA install.

Two structural problems block any reliable in-app "new version" prompt:

1. **Detection is unreliable.** The browser only installs a new SW when `sw.js` changes byte-for-byte. `sw.js` is static and only changes when the `CACHE` constant is hand-bumped, so a code-only deploy produces no `updatefound`.
2. **No surfaced signal.** Even when a new SW activates, the page has no `updatefound`/`controllerchange` handling and no UI, so an open session silently keeps the old bundle.

The existing `ConsentBanner` ([src/components/ConsentBanner.tsx](../../../src/components/ConsentBanner.tsx)) establishes the pattern for a dismissible bottom banner, mounted in both the desktop and mobile branches of [src/App.tsx](../../../src/App.tsx), styled in [src/styles.css](../../../src/styles.css) under `.consent-banner`.

## Goals / Non-Goals

**Goals:**
- Reliably detect that a newer deployed build is available, including for sessions that stay open without navigating.
- Prompt the user in-app and let them apply the update (activate + reload) on demand.
- A dismissed prompt stays quiet until the next deploy; no persistence.
- Preserve current offline behavior (cold-start offline, fresh content on reload).
- Minimize hand-rolled service-worker code.

**Non-Goals:**
- Silent auto-reload without user consent (jarring; can lose in-progress input).
- Changing PWA install/manifest behavior.
- Persisting "Later" across sessions or showing update history / changelogs.
- Background sync, push notifications, or any new offline capabilities beyond what `sw.js` does today.
- Versioning the app via a hand-written `version.json` poll (the SW revision is the version signal).

## Decisions

### Decision 1: Adopt `vite-plugin-pwa` with the `generateSW` strategy
Let Workbox (via the plugin) generate the service worker from config, rather than maintaining `public/sw.js` or using `injectManifest`.

- **Why:** `generateSW` produces a content-revisioned precache manifest on every build, so each deploy yields a byte-different SW and reliable `updatefound` — the root cause of (1) above — with the least hand-written SW code. The plugin also provides the registration glue and the React update hook.
- **Alternative considered:** `injectManifest` (keep a custom `sw.js`, plugin only injects the precache list). Rejected — keeps us maintaining SW logic for no benefit here; our caching needs are expressible in Workbox runtime-caching config.
- **Alternative considered:** Keep the hand-rolled SW and add a build-time step that stamps a build id into it. Rejected — reinvents what the plugin does for free.

### Decision 2: `registerType: 'prompt'` (user-controlled update)
Use prompt mode, not `autoUpdate`.

- **Why:** Matches the requirement that the user decides when to reload. `autoUpdate` skip-waits and reloads automatically, which can interrupt the user and discard unsaved input (e.g. a half-typed intention).
- **Consequence:** The generated SW does **not** eagerly `skipWaiting()`; it waits for the page to call `updateServiceWorker(true)`. This intentionally drops the current `sw.js`'s eager `skipWaiting()` behavior.

### Decision 3: Surface the signal with `useRegisterSW()` in a dedicated component
Add `src/components/UpdateBanner.tsx` that calls `useRegisterSW({ onRegisteredSW })` and renders when `needRefresh` is true.

- **Why:** First-class React signal from the plugin; no manual SW message plumbing. Keeps update UI isolated and mirrors `ConsentBanner` for consistency.
- **Wiring:** `updateServiceWorker(true)` on "Reload"; `setNeedRefresh(false)` on "Later".

### Decision 4: Dismiss = session-only, no persistence
"Later" calls `setNeedRefresh(false)` and writes nothing to storage.

- **Why:** `needRefresh` is per-session state derived from a waiting worker. Once dismissed it only flips back to `true` when the plugin detects a *new* waiting SW — i.e. the next deploy. That is exactly the requested "quiet until next deploy" behavior with zero persistence code. (If the user reloads for any other reason, the pending update simply applies, which is fine.)

### Decision 5: Force update checks on focus + interval
In `onRegisteredSW`, register a `visibilitychange` handler that calls `registration.update()` when the tab becomes visible, plus a periodic `setInterval` (e.g. 30 min).

- **Why:** Browsers check for SW updates on navigation, but an SPA session may never navigate. Explicit `update()` calls ensure a long-open session detects a deploy and shows the prompt.
- **Trade-off:** Extra conditional requests for `sw.js`; negligible (tiny file, infrequent).

### Decision 6: Keep `public/manifest.json` (manifest: false)
Configure `VitePWA({ manifest: false })` and keep the existing `<link rel="manifest" href="manifest.json">`.

- **Why:** Install behavior and icons already work; no reason to let the plugin regenerate the manifest and risk drift. The plugin's job here is strictly SW generation + update signal.

### Decision 7: Replicate current caching via Workbox runtime caching
Configure `workbox.runtimeCaching` for network-first navigations and a cache strategy for hashed assets, with the app shell precached so cold-start offline still works (`navigateFallback` to the precached `index.html`).

- **Why:** Preserve the existing offline guarantee and "fresh content on reload" property while moving off the hand-written fetch handler.

## Risks / Trade-offs

- **Caching behavior drift from the hand-rolled SW** → mitigate by mapping the existing fetch handler's two cases explicitly to Workbox config (network-first navigations; SWR/cache-first for hashed assets) and verifying offline cold-start + post-deploy freshness manually.
- **e2e suite interaction with the generated SW** → the Playwright suite runs against the dev server; keep the plugin's SW disabled in dev (default, unless `devOptions.enabled`) so tests are unaffected. Verify the suite still passes.
- **Returning users with the old hand-rolled `sw.js` cached** → the first post-deploy load replaces the old SW with the generated one (network-first navigation fetches fresh `index.html`, which registers the new SW); the new SW's activate cleans up. One transitional reload may be needed for the very first upgrade, which is acceptable.
- **Prompt fatigue** → single dismissible banner, quiet until next deploy; not modal, doesn't block the app.
- **TypeScript not recognizing `virtual:pwa-register/react`** → add the `vite-plugin-pwa/client` reference to `src/vite-env.d.ts`.

## Migration Plan

1. Add `vite-plugin-pwa` dev dependency; configure `VitePWA` in `vite.config.ts` (generateSW, prompt, `manifest: false`, runtime caching + `navigateFallback`).
2. Add the `vite-plugin-pwa/client` types to `src/vite-env.d.ts`.
3. Remove the manual SW registration `<script>` from `index.html`; delete `public/sw.js`.
4. Add `src/components/UpdateBanner.tsx` (`useRegisterSW`, focus/interval `update()`, Reload/Later) and styles in `src/styles.css`.
5. Mount `<UpdateBanner />` next to `<ConsentBanner />` in both render branches of `App.tsx`.
6. Verify: typecheck + unit + e2e pass; manual offline cold-start; manual two-deploy check that the banner appears and "Reload" lands the new build while "Later" stays quiet.
7. Rollback: revert the above and restore `public/sw.js` + the registration script; no data migration involved.
