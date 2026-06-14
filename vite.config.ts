/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Static, local-first PWA. Relative base so the built app can be served from
// any sub-path (matches the manifest's "scope": "./").
export default defineConfig({
  base: './',
  plugins: [
    react(),
    // PWA service worker. Workbox generates a content-revisioned worker on
    // every build, so each deploy is reliably detected as an update (the old
    // hand-rolled sw.js only changed when its CACHE constant was hand-bumped).
    // 'prompt' means the new worker waits until the in-app UpdateBanner calls
    // updateServiceWorker() — the user decides when to reload. The existing
    // public/manifest.json stays authoritative (manifest: false). The SW is
    // not enabled in dev, so the Playwright dev-server suite is unaffected.
    VitePWA({
      registerType: 'prompt',
      manifest: false,
      workbox: {
        // Cold-start offline: serve the precached shell for navigations that
        // miss the network, mirroring the old SW's index.html fallback.
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Navigations: network-first so a fresh deploy's index.html (and
            // the hashed assets it points at) load as soon as the user is
            // online, falling back to the cached shell when offline.
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages' },
          },
          {
            // Same-origin assets (content-hashed JS/CSS/images): serve fast
            // from cache and refresh in the background.
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'assets' },
          },
        ],
      },
    }),
  ],
  server: { port: 5173 },
  // Unit tests (Vitest) reuse this Vite pipeline. jsdom gives store code
  // localStorage/DOM; the setup file registers a headless IndexedDB so Dexie
  // runs without a browser. E2E (Playwright) lives outside src and is excluded.
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
