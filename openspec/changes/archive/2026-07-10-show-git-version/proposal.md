## Why

There is currently no way to tell which build of the app is running. When a user reports a bug or confirms an update landed, we have nothing to correlate against — no version, no commit. We want a lightweight version identifier visible on the Manage screen, derived automatically from git history at build time so it stays accurate without anyone maintaining a version string on branches.

## What Changes

- Show a **version line** at the bottom of the Manage screen (e.g. `v1.42 · a1b2c3d`).
- **Derive the version from git at build time**, not from a stored string:
  - The **minor number** is the count of commits on `main`'s first-parent history (`git rev-list --first-parent --count main`). The major stays a hand-set constant (`1` for now).
  - The **short commit hash** of the build's `HEAD` is injected alongside it.
- Inject both values via **Vite `define`** so they compile into the bundle as build-time constants. No runtime git access.
- **Branches never affect the version.** The number is always computed from `main`'s history; feature branches show whatever `main`-derived count applies at build time, and the commit hash disambiguates the exact build.
- **Graceful fallback** when git metadata is unavailable (e.g. a shallow checkout or non-git tarball): version falls back to a `dev` marker rather than failing the build.
- Cloudflare Pages builds `main`, so the deployed build automatically gets the correct number and hash with no manual step.

## Capabilities

### New Capabilities
- `app-version`: Computing an app version and short commit hash from git history at build time, injecting them into the bundle, and displaying them on the Manage screen with a safe fallback when git metadata is absent.

### Modified Capabilities
<!-- None — no existing spec governs a displayed version. -->

## Impact

- **Code**: [vite.config.ts](../../../vite.config.ts) (add a `define` block that shells out to git at config time), [src/screens/SettingsScreen.tsx](../../../src/screens/SettingsScreen.tsx) (render the version line in the Manage screen), [src/vite-env.d.ts](../../../src/vite-env.d.ts) (declare the injected global constants).
- **Naming**: the injected constants use distinct names (e.g. `__APP_VERSION__`, `__GIT_SHA__`) to avoid collision with the existing `version` data-refresh counter prop passed through the screens.
- **Build**: `vite build` (run by Cloudflare Pages) invokes `git` during config evaluation; the build must tolerate git being absent or the repo being shallow.
- **Dependencies**: adds `@types/node` (dev-only) so `tsc --noEmit` resolves the `node:child_process` import used in the Vite config; no runtime dependency added.
- **Tests**: unit test for the version-string formatting/fallback helper; ensure the Manage-screen version line is rendered.
