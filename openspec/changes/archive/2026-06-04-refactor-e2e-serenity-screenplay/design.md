## Context

The e2e suite (`e2e/`) already follows the Screenplay pattern, but via a hand-rolled implementation: `e2e/screenplay/` defines a custom `Actor`, a `BrowseTheWeb` ability wrapping the Playwright `Page`, and bare `Task`/`Question` interfaces. `tasks.ts` and `questions.ts` build on these, `fixtures.ts` exposes an `actor` Playwright fixture that injects `window.__IH_E2E_SEED__` and opens the app, and eight specs in `e2e/specs/` read as `actor.attemptsTo(...)` / `expect(await actor.asks(...))`.

Serenity/JS is the de-facto Screenplay framework for the JS/TS ecosystem and integrates directly with `@playwright/test`. Adopting it removes the bespoke abstraction layer in favour of a maintained one with web-interaction primitives, expectation/assertion APIs, and narrative reporting.

Constraint: the app's deterministic seeding contract (`window.__IH_E2E_SEED__`, gated behind `import.meta.env.DEV`) and all `data-testid` selectors must stay untouched — this is a test-layer refactor only.

## Goals / Non-Goals

**Goals:**
- Replace the homegrown screenplay layer with `@serenity-js/*`.
- Keep identical behavioral coverage across all eight specs.
- Preserve deterministic per-test seeding and the `npm run e2e*` entry points.
- Keep the spec authoring style readable as actor intent.

**Non-Goals:**
- No changes to application source, components, `data-testid` attributes, or the seed hook.
- No new journeys or assertions beyond what exists today (parity migration).
- No CI pipeline redesign beyond reporter wiring.

## Decisions

**Use `@serenity-js/playwright-test` integration over `@playwright/test` directly.**
Serenity/JS ships a `useFixtures` extension and a Serenity reporter that plug into Playwright Test, so we keep Playwright's runner, `webServer`, projects, and parallelism while gaining actors. Alternative: drive Serenity/JS standalone via `@serenity-js/playwright` + its own runner — rejected because it would discard the existing `playwright.config.ts` (webServer dev-server boot, fresh-context isolation) that the deterministic seed depends on.

**Grant browsing via `BrowseTheWebWithPlaywright.using(browser)` through a cast.**
The `actor` fixture is replaced by a Serenity/JS cast that prepares each actor with the browsing ability and runs the seed-injection + app-open as the first interaction. Seed injection stays as `page.addInitScript`-equivalent done through the ability's underlying page/`BrowseTheWeb` before navigation. Alternative: a custom ability wrapping seed state — unnecessary; init-script injection composes fine inside an `OpenTheApp` Task.

**Map the existing vocabulary 1:1.** Each current Task/Question becomes a Serenity/JS `Task.where(...)` / `Question.about(...)` built from `@serenity-js/web` primitives (`Navigate`, `Click`, `Fill`, `Press`, `PageElement`/`PageElements` located by `By.css`/test-id, `Text`, `Attribute`, `isEnabled`). Keeping the same names (`OpenTheApp`, `GoToTab`, `LogIntention`, `IntentionList`, `CompletionState`, …) keeps specs nearly line-for-line and makes review easy.

**Assertions via `@serenity-js/assertions` `Ensure.that(...)`.** Replaces `expect(await actor.asks(...))`. Where a value-returning question is more natural, `actor.answer(question)` is available, but the preferred form is `Ensure.that(Question, expectation)` for narrative reporting.

## Risks / Trade-offs

- **Serenity/JS + Playwright version compatibility** → Pin `@serenity-js/*` to a release matching `@playwright/test ^1.60`; verify the suite runs green before removing the old screenplay module.
- **Seed injection timing changes under the new fixture model** (must run before app boot) → Encapsulate injection inside `OpenTheApp` ahead of `Navigate.to('/')`, and keep an explicit wait on `screen-entry`; the persistence and date-window specs are the canary.
- **Larger dependency footprint** (several `@serenity-js` packages) → devDependencies only; no production/runtime impact.
- **Reporter output format changes** → Keep `list`/`github`/`html` reporters from Playwright; add the Serenity reporter additively rather than replacing existing CI output.
- **Big-bang rewrite of all eight specs at once** → Migrate the harness + one spec first, get it green, then convert the rest spec-by-spec so regressions are isolated.

## Migration Plan

1. Add `@serenity-js/*` devDependencies; confirm versions resolve against Playwright 1.60.
2. Build the new actor/ability wiring (`fixtures.ts` cast + `useFixtures`) alongside the old module.
3. Rewrite `tasks.ts` and `questions.ts` as Serenity/JS Tasks/Questions.
4. Convert one spec (e.g. `intention-crud`) and get it green.
5. Convert the remaining seven specs.
6. Delete `e2e/screenplay/` and any dead imports; update `playwright.config.ts` reporter and `e2e/README.md`.
7. Full `npm run e2e` green run as the acceptance gate. Rollback = revert the branch; no runtime surface is touched.

## Open Questions

- Exact `@serenity-js/*` version set compatible with Playwright `^1.60` — resolve at task 1 by checking the installed peer ranges.
- Whether to keep Playwright's `html` reporter alongside Serenity/JS's reporter or consolidate — default: keep both, revisit if noisy.
