## 1. Bump the action versions

- [x] 1.1 In `.github/workflows/deploy.yml`, bump `actions/checkout@v4` → `@v6` (all occurrences)
- [x] 1.2 Bump `actions/setup-node@v4` → `@v6` (in both the `test` and `build` jobs)
- [x] 1.3 Bump `actions/upload-pages-artifact@v3` → `@v5`
- [x] 1.4 Bump `actions/deploy-pages@v4` → `@v5`

## 2. Verify

- [x] 2.1 Validate the workflow YAML still parses and job/needs/if wiring is unchanged (valid; on/jobs/needs/if all unchanged, only versions moved)
- [ ] 2.2 Open a PR and confirm the `test` job (checkout@v6 + setup-node@v6) passes with no Node 20 deprecation warning
- [ ] 2.3 After merge, confirm the `main` run's build + deploy (upload-pages-artifact@v5, deploy-pages@v5) succeed with no deprecation warning
