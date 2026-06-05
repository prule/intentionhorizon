## ADDED Requirements

### Requirement: Test harness suppresses first-run interstitials

The e2e harness SHALL put the app into a state where first-run interstitials (such as the analytics consent banner) do not render during tests, so that no overlay can intercept interactions with the elements under test. This SHALL be achieved before the app boots, by seeding the relevant `localStorage` keys, rather than by dismissing the interstitial through UI interaction.

#### Scenario: Consent banner is absent during tests

- **WHEN** a test opens the app
- **THEN** the analytics consent banner is not displayed and does not overlay any interactive element

#### Scenario: Low-positioned controls remain clickable

- **WHEN** an actor opens a form whose action button sits near the bottom of the viewport (for example, creating an intention with a target enabled)
- **THEN** the action button is not obscured by a first-run interstitial and the click is received

#### Scenario: Suppression is applied before boot

- **WHEN** the harness prepares a test's initial state
- **THEN** it seeds the consent choice in `localStorage` in the same pre-boot step that injects the data seed, so the banner never mounts
