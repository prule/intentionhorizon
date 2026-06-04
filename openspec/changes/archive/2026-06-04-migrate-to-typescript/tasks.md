## 1. Toolchain setup

- [x] 1.1 Add dev deps: `typescript`, `@types/react`, `@types/react-dom`
- [x] 1.2 Create `tsconfig.json` (strict, `noEmit`, `jsx: react-jsx`, `moduleResolution: bundler`, `isolatedModules`, libs ES2022 + DOM)
- [x] 1.3 Add `"typecheck": "tsc --noEmit"` script; change `build` to `"tsc --noEmit && vite build"`

## 2. Migrate leaf modules

- [x] 2.1 `git mv src/data/store.js src/data/store.ts`; type Dexie DB as a `Dexie` subclass with `Table<T, key>` fields + per-table interfaces
- [x] 2.2 `git mv src/components/Icon.jsx src/components/Icon.tsx`; type props
- [x] 2.3 `git mv src/components/ui.jsx src/components/ui.tsx`; type props of each exported UI primitive

## 3. Migrate screens

- [x] 3.1 `git mv src/screens/EntryScreen.jsx .tsx`; type props/state
- [x] 3.2 `git mv src/screens/AnalyticsScreen.jsx .tsx`; type props/state
- [x] 3.3 `git mv src/screens/SettingsScreen.jsx .tsx`; type props/state
- [x] 3.4 `git mv src/screens/Guide.jsx .tsx`; type props

## 4. Migrate root + entry

- [x] 4.1 `git mv src/App.jsx src/App.tsx`; type props, screen-routing state, store usage
- [x] 4.2 `git mv src/main.jsx src/main.tsx`; type the `createRoot` mount (non-null root element)
- [x] 4.3 Update `index.html` script `src` from `src/main.jsx` to `src/main.tsx`

## 5. Migrate build config

- [x] 5.1 `git mv vite.config.js vite.config.ts`; confirm `defineConfig` typing resolves
- [x] 5.2 Grep imports for explicit `.js`/`.jsx` extensions; remove or correct them

## 6. Verify

- [x] 6.1 `npm install` then `npm run typecheck` → zero errors (no stray `any`)
- [x] 6.2 `npm run build` → succeeds, `dist/` produced
- [x] 6.3 `npm run dev` → app renders; smoke-test each screen + an entry create/tick; behavior unchanged
- [x] 6.4 Confirm no `.js`/`.jsx` files remain under `src/`
