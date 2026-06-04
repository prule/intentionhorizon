## Context

Intention Horizon is a local-first React 18 PWA built with Vite 6, persisting data through Dexie (IndexedDB). Source is plain JavaScript: 7 `.jsx` components/screens + 2 `.js` modules (`data/store.js`, plus configs). Node 24 toolchain is pinned via `.nvmrc` (system Node 16 breaks Vite — see project memory). No tests and no existing specs. The migration is mechanical but touches every source file plus build config.

## Goals / Non-Goals

**Goals:**
- All `src/` source authored in TypeScript with `strict` enabled.
- Type the Dexie schema and React component props.
- Build fails on type errors (`tsc --noEmit` gate).
- Zero runtime/behavior change; bundle output equivalent.

**Non-Goals:**
- Adding tests or a test runner.
- Linting setup (ESLint/Prettier) — separate concern.
- Refactoring component logic or data model beyond what typing requires.
- CI configuration.

## Decisions

**Decision: Vite handles transpile; `tsc` only type-checks.**
Vite/esbuild already strips types at build with no per-file config. Use `tsc --noEmit` purely as a checker, wired as `"build": "tsc --noEmit && vite build"`. Alternative — emitting JS via `tsc` — rejected: duplicates Vite's job and loses Vite plugin handling.

**Decision: `strict: true` from the start.**
Codebase is small (9 files); enabling strict now avoids a second pass to tighten later. Risk of more upfront annotation is acceptable at this size. Alternative — loose then ratchet — rejected as wasted churn.

**Decision: tsconfig targets bundler resolution.**
Use `"module": "ESNext"`, `"moduleResolution": "bundler"`, `"jsx": "react-jsx"`, `"noEmit": true`, `"isolatedModules": true`, `"lib": ["ES2022", "DOM", "DOM.Iterable"]`. Matches Vite 6 + React 18 automatic JSX runtime (no `import React` needed).

**Decision: Dexie typed via subclass.**
Model the DB as `class IHDB extends Dexie` with `Table<Entry, number>` fields and an `interface` per table, the standard Dexie v4 typing pattern. Dexie ships its own `.d.ts`, so no `@types` package needed.

**Decision: Migrate file-by-file, keep renames as `git mv`.**
Preserves history. Convert leaf modules first (`data/store`, `components/Icon`, `components/ui`), then screens, then `App`, then `main` and configs, so each step type-checks against already-typed deps.

## Risks / Trade-offs

- **Strict mode surfaces latent bugs (e.g. possibly-undefined Dexie reads)** → fix with proper narrowing/optional types, not `any`; treat as the point of the migration.
- **`index.html` still points at `main.jsx` after rename → blank app** → update the script `src` in the same step as the `main` rename; verify dev server renders.
- **Vite config rename can break plugin resolution** → rename `vite.config.js` → `.ts` last and confirm `npm run dev` + `npm run build` both work.
- **Hidden `.js` import paths with extensions** → grep for explicit `.jsx`/`.js` in import statements and drop/adjust extensions.

## Migration Plan

1. Add deps: `typescript`, `@types/react`, `@types/react-dom`; add `tsconfig.json`.
2. Add `typecheck` script; change `build` to gate on `tsc --noEmit`.
3. Rename + type modules leaf-first (store → components → screens → App → main).
4. Rename `vite.config.js` → `.ts`; update `index.html` script ref.
5. Run `npm run typecheck`, `npm run build`, `npm run dev`; verify app renders and behaves unchanged.

**Rollback:** the change is isolated to one branch; revert the branch. No data migration, so no production rollback concern.

## Open Questions

- None blocking. (ESLint/typed-lint and tests can follow as separate changes.)
