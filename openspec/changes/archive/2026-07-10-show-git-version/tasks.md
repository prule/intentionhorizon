## 1. Inject version constants at build time

- [x] 1.1 In [vite.config.ts](../../../vite.config.ts), add a `MAJOR = 1` constant and a helper that computes the version via `git rev-list --first-parent --count main` (falling back to `HEAD`, then to `dev`) and the short hash via `git rev-parse --short HEAD`, each wrapped in try/catch.
- [x] 1.2 Add a `define` block to the Vite config exposing `__APP_VERSION__` (e.g. `"v1.42"` or `"dev"`) and `__GIT_SHA__` (e.g. `"a1b2c3d"` or `""`), using `JSON.stringify` for each value.
- [x] 1.3 Declare `__APP_VERSION__` and `__GIT_SHA__` as `const string` globals in [src/vite-env.d.ts](../../../src/vite-env.d.ts) so `tsc --noEmit` passes.

## 2. Display on the Manage screen

- [x] 2.1 Add a pure `formatVersion(version: string, sha: string): string` helper returning `"<version> · <sha>"` when `sha` is non-empty, else just `<version>`.
- [x] 2.2 In [src/screens/SettingsScreen.tsx](../../../src/screens/SettingsScreen.tsx), render a muted, non-interactive version line (`data-testid="app-version"`) at the bottom of the `screen-settings` scroll container using `formatVersion(__APP_VERSION__, __GIT_SHA__)`.

## 3. Tests & verification

- [x] 3.1 Add a unit test for `formatVersion` covering the git-derived case (`'v1.42','a1b2c3d' → 'v1.42 · a1b2c3d'`) and the fallback case (`'dev','' → 'dev'`).
- [x] 3.2 Run `pnpm build` (tsc + vite) to confirm the git commands run, constants inject, and the build succeeds; sanity-check the rendered version line on the Manage screen.
