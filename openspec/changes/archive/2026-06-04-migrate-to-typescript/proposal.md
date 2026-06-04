## Why

The codebase is plain JavaScript (`.jsx`/`.js`), so type errors surface only at runtime and the editor offers weak autocomplete and refactoring. The app uses Dexie (typed IndexedDB) and React across multiple screens — surfaces where prop and schema mistakes are easy to make and costly to debug. Migrating to TypeScript adds compile-time safety and self-documenting types before the project grows further.

## What Changes

- Add TypeScript toolchain: `typescript` + React type packages, `tsconfig.json`, type-checking wired into the build.
- Rename all source files: `.jsx` → `.tsx`, `.js` → `.ts` (9 files under `src/`).
- Add types: component props, the Dexie store schema/tables, and shared UI primitives.
- Update `vite.config.js` → `vite.config.ts` and `index.html` script reference (`main.jsx` → `main.tsx`).
- Add a `typecheck` script (`tsc --noEmit`) and run it in the build.
- **BREAKING** (build-only): build now fails on type errors. No runtime/user-facing behavior changes.

## Capabilities

### New Capabilities
- `typescript-codebase`: All source is TypeScript; the build type-checks the project and fails on type errors. Defines the tsconfig contract, file conventions, and where types live.

### Modified Capabilities
<!-- None — no existing specs and no user-facing requirement changes. -->

## Impact

- **Code**: all 9 files under `src/` renamed and typed; `index.html`, `vite.config.js`, `package.json`.
- **Dependencies**: add dev deps `typescript`, `@types/react`, `@types/react-dom`. Dexie ships its own types.
- **Tooling**: new `tsconfig.json`; `build` script gated by `tsc --noEmit`; Node 24 toolchain unchanged (see `.nvmrc`).
- **Runtime**: none — output bundle behavior identical.
