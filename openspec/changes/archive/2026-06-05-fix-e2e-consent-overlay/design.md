## Context

The consent choice persists in `localStorage` under the key `ih-consent` with values `'granted' | 'denied'` (`src/consent.ts`). `ConsentBanner` renders only while `getStoredConsent()` returns `null` (undecided). e2e runs start from a clean `real` database and no prior consent, so the banner is always shown and sits as a fixed overlay near the bottom of the viewport.

The e2e fixture (`e2e/fixtures.ts`) already injects the data seed before boot via `page.addInitScript`, landing it on `window.__IH_E2E_SEED__` so `initStore()` reads it. `localStorage` is writable from that same pre-boot init-script context.

## Goals / Non-Goals

**Goals:**
- Make the consent banner absent during e2e so it can never intercept clicks.
- Keep the fix in the test harness; no changes to production consent behaviour.
- Apply uniformly to all specs without per-test boilerplate.

**Non-Goals:**
- Testing the consent banner itself (no spec currently covers it; out of scope here).
- Changing the consent default, storage key, or banner UX for real users.
- Reworking the target form layout (the banner, not the form, is the defect).

## Decisions

- **Pre-set `localStorage['ih-consent'] = 'denied'` in a pre-boot init script, rather than clicking "Decline" in the `OpenTheApp` task.** Pre-setting means the banner never mounts, so there is no overlay and no timing/animation race; it mirrors a returning user who already decided. Clicking Decline would add an interaction (and an implicit dependency on the banner) to every test and remains susceptible to render-order flake. Choosing `'denied'` keeps analytics off during tests, matching the privacy-by-default posture; no spec asserts on consent state, so the value is immaterial to assertions.
- **Place it in the fixture's existing `page` init script** (the same place the data seed is injected) so coverage is automatic and there is a single, documented pre-boot hook. Alternative considered: a separate `OpenTheApp` step — rejected as more surface area for the same effect.

## Risks / Trade-offs

- [A future spec may want to exercise the consent banner] → That spec can clear/omit the key for itself (the fixture seed can be made overridable like the data seed if needed). Not built now since no such spec exists.
- [The storage key/values could drift from `src/consent.ts`] → Low risk; both live in the repo and the suite would fail loudly if the banner reappeared. A shared constant could be introduced later if desired.
