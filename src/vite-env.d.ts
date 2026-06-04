/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Build-time flag: set to 'true' to expose the mock data source + switcher.
  readonly VITE_ENABLE_MOCK_DATA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
