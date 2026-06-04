## Why

The e2e suite implements the Screenplay pattern by hand (`e2e/screenplay/` — a custom `Actor`, `BrowseTheWeb` ability, and `Task`/`Question` interfaces). This homegrown layer must be maintained ourselves, lacks built-in waiting/retry semantics, produces no narrative reporting, and reinvents what Serenity/JS provides as a maintained library. Moving to Serenity/JS gives us the same screenplay vocabulary backed by a battle-tested framework, richer assertions, and living documentation reports — with less code to own.

## What Changes

- Add Serenity/JS dependencies (`@serenity-js/core`, `@serenity-js/playwright`, `@serenity-js/playwright-test`, `@serenity-js/web`, `@serenity-js/assertions`) and wire Serenity/JS as the Playwright Test reporter/runner integration.
- Replace the hand-rolled `e2e/screenplay/` module (custom `Actor`, `BrowseTheWeb`, `Task`, `Question`) with Serenity/JS's `actorCalled`, `BrowseTheWebWithPlaywright`, and `Task`/`Question` builders.
- Rewrite `e2e/tasks.ts` and `e2e/questions.ts` as Serenity/JS Tasks and Questions composed from `@serenity-js/web` interactions (`Navigate`, `Click`, `Fill`, `PageElement`, `Text`, etc.).
- Convert the `actor` Playwright fixture to Serenity/JS's `useFixtures`/cast model while preserving the deterministic seed injection (`window.__IH_E2E_SEED__`).
- Rewrite the eight journey specs in `e2e/specs/` to use Serenity/JS actors and assertions (`actor.attemptsTo(...)`, `Ensure.that(...)`), keeping the exact same behavioral coverage.
- Update `playwright.config.ts` reporter config and `e2e/README.md` to document the Serenity/JS-based setup.
- **BREAKING** (test-internal only): the custom screenplay API and spec authoring style change. No application/runtime code changes.

## Capabilities

### New Capabilities
- `e2e-screenplay-framework`: The end-to-end test suite drives the app through the Serenity/JS Screenplay framework — actors with browsing ability, reusable Tasks and Questions, framework-provided assertions and reporting — while preserving deterministic seeding and full behavioral coverage of the existing journeys.

### Modified Capabilities
<!-- none: no existing openspec specs cover the e2e harness; application behavior is unchanged -->

## Impact

- **Dependencies**: adds `@serenity-js/*` packages to `devDependencies`.
- **Test code**: `e2e/screenplay/*` (removed/replaced), `e2e/tasks.ts`, `e2e/questions.ts`, `e2e/fixtures.ts`, all `e2e/specs/*.spec.ts`, `e2e/README.md`, `playwright.config.ts`.
- **App/runtime code**: none. `data-testid` selectors and the seed hook (`window.__IH_E2E_SEED__`, `import.meta.env.DEV` gate) are unchanged.
- **CI**: `npm run e2e` continues to be the entry point; reporter output gains Serenity/JS artifacts.
