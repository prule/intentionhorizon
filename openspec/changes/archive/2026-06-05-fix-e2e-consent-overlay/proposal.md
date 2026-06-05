## Why

Two e2e specs in `targets.spec.ts` fail with a 30s click timeout. The analytics consent banner (the "Privacy choices" dialog added in #2) renders on first run and overlays the bottom of the app. The target form is tall enough to push the "Create intention" save button beneath that banner, so the click is intercepted and never lands. The other 13 tests pass only incidentally — their buttons sit above the banner. The harness has no step to dismiss or pre-decide consent, so any test whose target control sits low on the page is one layout tweak away from the same failure.

## What Changes

- Suppress the first-run analytics consent banner during e2e runs by seeding a decided consent choice into `localStorage` before the app boots, so no interstitial overlays the UI under test.
- Apply it in the existing e2e fixture's pre-boot init script (alongside the data seed), so it covers every spec uniformly and matches a returning user who has already chosen.
- Re-enable the two `targets.spec.ts` specs to pass; confirm the full suite is green.

## Capabilities

### New Capabilities
<!-- None. -->

### Modified Capabilities
- `e2e-testing`: The deterministic-isolated-state guarantee is extended so the harness also puts the app into a known "first-run decisions already made" state — specifically, the analytics consent choice — so first-run interstitials never obstruct the elements under test.

## Impact

- `e2e/fixtures.ts` — extend the pre-boot init script to set the consent `localStorage` key.
- No production/source code changes; the consent banner behaviour for real users is unchanged.
- Affected specs: `e2e/specs/targets.spec.ts` (both tests), verified against the whole suite.
