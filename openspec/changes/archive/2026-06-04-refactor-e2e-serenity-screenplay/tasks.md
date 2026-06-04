## 1. Dependencies & wiring

- [x] 1.1 Add `@serenity-js/core`, `@serenity-js/playwright`, `@serenity-js/playwright-test`, `@serenity-js/web`, and `@serenity-js/assertions` to `devDependencies`, pinned to versions compatible with `@playwright/test ^1.60`; run install and confirm peer ranges resolve.
- [x] 1.2 Add the Serenity/JS reporter to `playwright.config.ts` additively (keep existing `list`/`github`/`html` reporters and the `webServer` dev-server config).

## 2. Actor & fixture model

- [x] 2.1 Replace the `actor` Playwright fixture in `e2e/fixtures.ts` with a Serenity/JS cast (`useFixtures`) that prepares each actor with `BrowseTheWebWithPlaywright`, keeping the `seed` option fixture and `defaultSeed`.
- [x] 2.2 Move deterministic seed injection (`window.__IH_E2E_SEED__`) into the `OpenTheApp` Task so it runs before navigation, preserving the `import.meta.env.DEV` contract; wait on `screen-entry` after navigation.

## 3. Tasks

- [x] 3.1 Rewrite `e2e/tasks.ts` Tasks as Serenity/JS `Task.where(...)` built from `@serenity-js/web` interactions: `OpenTheApp`, `ReloadTheApp`, `GoToTab`, `NavigateDay`, `LogIntention`.
- [x] 3.2 Rewrite the intention-form Tasks: `AddIntention`, `EditIntention`, `DeleteIntention`, `AddIntentionWithTarget` (including the completions step loop and period field).
- [x] 3.3 Rewrite the category and insights Tasks: `AddCategory`, `RenameCategory`, `DeleteCategory`, `FilterInsightsBy`.

## 4. Questions

- [x] 4.1 Rewrite `e2e/questions.ts` Questions as Serenity/JS `Question.about(...)`: `ActiveTab`, `VisibleDate`, `CompletionState`, `CanNavigate`.
- [x] 4.2 Rewrite the list/aggregate Questions: `IntentionList`, `CategoryList`, `WindowCount`, `TargetBadge`, `StreakValue`, `TotalsSum`.

## 5. Spec migration

- [x] 5.1 Convert `e2e/specs/intention-crud.spec.ts` to Serenity/JS actors and `Ensure.that(...)`; get it green as the pattern reference.
- [x] 5.2 Convert `category-crud.spec.ts` and `log-completion.spec.ts`.
- [x] 5.3 Convert `date-navigation.spec.ts` and `persistence.spec.ts` (seed-timing canaries).
- [x] 5.4 Convert `targets.spec.ts`, `insights.spec.ts`, and `analytics.spec.ts`.

## 6. Cleanup & verification

- [x] 6.1 Delete `e2e/screenplay/` and remove all dead imports/references to the old module.
- [x] 6.2 Update `e2e/README.md` to document the Serenity/JS-based setup (How it works, vocabulary, run commands).
- [x] 6.3 Run `npm run e2e` to a full green pass; run `npm run typecheck`. Confirm no application source or `data-testid` attribute changed (e.g. `git diff --stat src/`).
