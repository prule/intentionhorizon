## Context

The app is a static, local-first PWA built with Vite and deployed via Cloudflare Pages, which builds `main` on every push. `package.json` carries a static `"version": "1.0.0"` that nobody maintains. There is no version surfaced in the UI, so builds are indistinguishable in the field.

Two naming hazards to respect:
- `src/App.tsx` already threads a `version` prop through the screens — it is a **data-refresh counter** (`bump()`), unrelated to an app version. The injected constants must use different names.
- `vite.config.ts` has no `define` block today; the PWA plugin owns SW/manifest but nothing injects app-version constants yet.

## Goals / Non-Goals

**Goals:**
- Compute a version number from `main`'s git history at build time (minor = first-parent commit count).
- Inject the version and short commit hash as compile-time constants via Vite `define`.
- Display `v<major>.<minor> · <shortsha>` on the Manage screen.
- Never fail the build when git metadata is missing; fall back to a `dev` marker.
- Zero new dependencies; no runtime git/network access.

**Non-Goals:**
- No semantic-versioning automation, tags, or changelog generation.
- No per-branch version stamping (branches never touch the version).
- No syncing back to `package.json`'s `version` field.

## Decisions

- **Compute in `vite.config.ts` at config-eval time** using `child_process.execSync`. Two commands:
  - Minor: `git rev-list --first-parent --count main`. Using `--first-parent` on `main` keeps the count stable regardless of how many commits a merged branch contributed — each merge counts as one, matching "commits/merges on main". If `main` isn't present locally (e.g. CI checks out a detached HEAD), fall back to `git rev-list --first-parent --count HEAD`, which on a Cloudflare `main` build equals the same history.
  - Hash: `git rev-parse --short HEAD`.
- **Major is a constant** (`MAJOR = 1`) declared in the Vite config. Bump by hand on rare intentional resets.
- **Injected constant names**: `__APP_VERSION__` (string, e.g. `"v1.42"`) and `__GIT_SHA__` (string, e.g. `"a1b2c3d"`). `define` requires `JSON.stringify`'d values. A combined `__APP_VERSION__` string keeps the UI dumb; the raw hash stays separate so the display can format spacing.
- **Fallback**: wrap each git call in try/catch. On failure, `__APP_VERSION__ = "dev"` and `__GIT_SHA__ = ""`. The Manage screen renders just `dev` when the hash is empty.
- **Type declarations** in `src/vite-env.d.ts`: `declare const __APP_VERSION__: string;` and `declare const __GIT_SHA__: string;` so TypeScript (`tsc --noEmit` in the build) accepts them.
- **UI placement**: a small, muted line at the very bottom of the Manage screen's scroll container (after the action buttons, inside `data-testid="screen-settings"`), e.g. `<div data-testid="app-version">v1.42 · a1b2c3d</div>` styled with `var(--muted)` / small font. Non-interactive.
- **Test the formatter, not git**: extract a tiny pure helper `formatVersion(version: string, sha: string): string` in the screen (or a small util) so a unit test can assert `formatVersion('v1.42','a1b2c3d') === 'v1.42 · a1b2c3d'` and `formatVersion('dev','') === 'dev'`. Reading the `define`d globals directly is left to the component.

## Risks / Trade-offs

- **`--first-parent --count main` vs `HEAD`**: on Cloudflare's `main` build these are identical. On a local feature-branch dev build they differ (the branch's `HEAD` count vs `main`'s). This is acceptable — dev builds are throwaway and the hash disambiguates. Preferring `main` when it exists keeps the deployed number authoritative.
- **Shallow clones**: Cloudflare's default checkout depth could truncate `rev-list --count`. Mitigation: the fallback keeps the build green; if an accurate deployed number matters, the build step can `git fetch --unshallow` or set a full-clone depth. Documented as a follow-up, not blocking.
- **Config-time side effect**: shelling out to git during `defineConfig` runs on every `vite` invocation including the dev server and Vitest. It is a fast, cached call and fully guarded by try/catch, so a missing git only yields the `dev` marker.
- **Stale caches**: because the value is baked into the hashed bundle, a new commit produces a new bundle hash, so the PWA update flow surfaces it normally — no extra cache-busting needed.
