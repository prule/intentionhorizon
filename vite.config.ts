/// <reference types="vitest/config" />
import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// App version is derived from git at build time — never stored on a branch.
// The minor number is the count of commits on main's first-parent history, so
// each merge counts once. Cloudflare Pages builds main, so the deployed build
// gets the authoritative number automatically. The short HEAD hash pins the
// exact build. Any git failure (shallow clone, no git, source tarball) falls
// back to a `dev` marker rather than breaking the build.
const MAJOR = 1;

function git(cmd: string): string | null {
  try {
    return execSync(`git ${cmd}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function computeVersion(): { version: string; sha: string } {
  const sha = git('rev-parse --short HEAD') ?? '';
  // Prefer main's history so the deployed number is authoritative regardless of
  // which branch is checked out; fall back to HEAD (equals main on a Pages build).
  const minor =
    git('rev-list --first-parent --count main') ?? git('rev-list --first-parent --count HEAD');
  if (minor == null) return { version: 'dev', sha };
  return { version: `v${MAJOR}.${minor}`, sha };
}

const { version: APP_VERSION, sha: GIT_SHA } = computeVersion();

// Static, local-first PWA. Relative base so the built app can be served from
// any sub-path (matches the manifest's "scope": "./").
export default defineConfig({
  base: './',
  // Bake the git-derived version and short hash in as compile-time constants;
  // the app reads these globals with no runtime git or network access.
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
    __GIT_SHA__: JSON.stringify(GIT_SHA),
  },
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
  // host: true binds to 0.0.0.0 so the server is reachable from outside its
  // network namespace — required when running inside the dev container, where
  // a default localhost bind is only visible to the container itself. Harmless
  // on a native host. preview mirrors this for `pnpm preview`.
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
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
