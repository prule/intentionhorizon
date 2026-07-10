/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  // Build-time flag: set to 'true' to expose the mock data source + switcher.
  readonly VITE_ENABLE_MOCK_DATA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Injected by Vite `define` at build time (see vite.config.ts). Git-derived
// version string (e.g. "v1.42" or "dev") and short commit hash (may be "").
declare const __APP_VERSION__: string;
declare const __GIT_SHA__: string;
