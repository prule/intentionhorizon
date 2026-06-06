/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static, local-first PWA. Relative base so the built app can be served from
// any sub-path (matches the manifest's "scope": "./").
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173 },
  // Unit tests (Vitest) reuse this Vite pipeline. jsdom gives store code
  // localStorage/DOM; the setup file registers a headless IndexedDB so Dexie
  // runs without a browser. E2E (Playwright) lives outside src and is excluded.
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
  },
});
