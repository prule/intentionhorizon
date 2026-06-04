import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static, local-first PWA. Relative base so the built app can be served from
// any sub-path (matches the manifest's "scope": "./").
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173 },
});
