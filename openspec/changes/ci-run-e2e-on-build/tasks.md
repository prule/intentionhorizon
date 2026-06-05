## 1. Add a test job and gate deploy on it

- [x] 1.1 In `.github/workflows/deploy.yml`, add `pull_request` to the `on:` triggers (keep `push: [main]` and `workflow_dispatch`)
- [x] 1.2 Add a `test` job: checkout, `actions/setup-node@v4` with `node-version-file: .nvmrc` and `cache: npm`, `npm ci`, `npx playwright install --with-deps chromium`, `npm run build`, then `npm run e2e`
- [x] 1.3 Make the Pages `build` job depend on the tests (`needs: test`) and guard the build/deploy jobs to push events only (`if: github.event_name == 'push'`), so PRs run tests but do not deploy
- [x] 1.4 Keep `permissions`/`concurrency` correct for the deploy jobs; ensure the `test` job needs no Pages permissions

## 2. Verify

- [x] 2.1 Lint the workflow YAML (valid syntax; jobs/needs/if wiring is correct — verified: on=push/pull_request/workflow_dispatch, test runs build+e2e, build needs test & if push, deploy needs build & if push)
- [ ] 2.2 Push a branch / open a PR and confirm the `test` job runs the e2e suite and reports a check on the PR (verified on the PR for this change)
- [ ] 2.3 Confirm a deliberately failing e2e (or build) makes the workflow run fail, and that the deploy jobs are skipped on PRs (deploy-skip confirmed via PR; failure-fails-build follows from `npm run e2e` exit code)
- [ ] 2.4 Confirm a passing push to `main` proceeds to build + deploy as before (verified after merge to main)
