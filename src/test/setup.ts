// Vitest global setup. Registers a headless IndexedDB (fake-indexeddb) so
// Dexie-backed store code runs without a browser, and isolates every test by
// clearing localStorage and dropping all databases between tests.
import 'fake-indexeddb/auto';
import { afterEach, beforeEach } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';

beforeEach(() => {
  // Fresh IndexedDB + localStorage per test; a new IDBFactory discards every
  // database opened by a prior test so module-level store state can't bleed.
  globalThis.indexedDB = new IDBFactory();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});
