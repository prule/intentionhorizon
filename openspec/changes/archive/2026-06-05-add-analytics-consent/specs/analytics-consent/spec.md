## ADDED Requirements

### Requirement: Analytics denied by default
The system SHALL set Google Consent Mode v2 to deny analytics storage (`analytics_storage: 'denied'`) before the Google Analytics (gtag.js) script loads, so that no analytics identifiers or cookies are stored until the user grants consent. Advertising signals (`ad_storage`, `ad_user_data`, `ad_personalization`) SHALL remain denied at all times, as the app runs no advertising tags.

#### Scenario: No analytics cookies before any choice
- **WHEN** a visitor with no stored consent loads the app
- **THEN** Consent Mode default is set to denied before gtag.js initialises
- **AND** Google Analytics runs in cookieless mode with no analytics cookies or identifiers stored

#### Scenario: Advertising signals always denied
- **WHEN** the app loads, regardless of the analytics consent choice
- **THEN** `ad_storage`, `ad_user_data`, and `ad_personalization` remain denied

### Requirement: First-run consent prompt
The system SHALL present a consent banner offering an explicit Accept and Decline choice when, and only when, the user has not yet recorded a consent choice. Once a choice is recorded, the banner SHALL NOT be shown again.

#### Scenario: Banner shown to an undecided visitor
- **WHEN** a visitor with no stored consent choice opens the app
- **THEN** the consent banner is shown with Accept and Decline actions

#### Scenario: Banner hidden after a choice exists
- **WHEN** a visitor has already accepted or declined
- **THEN** the consent banner is not shown on subsequent loads

#### Scenario: Accept grants analytics
- **WHEN** the user selects Accept in the banner
- **THEN** Consent Mode is updated to `analytics_storage: 'granted'`
- **AND** the banner is dismissed

#### Scenario: Decline keeps analytics denied
- **WHEN** the user selects Decline in the banner
- **THEN** Consent Mode remains `analytics_storage: 'denied'`
- **AND** the banner is dismissed

### Requirement: Persisted and re-applied consent
The system SHALL persist the user's consent choice in localStorage under the key `ih-consent` (value `granted` or `denied`) and SHALL re-apply the stored choice on each load before Google Analytics initialises, so returning visitors keep their decision without being re-prompted.

#### Scenario: Choice survives reload
- **WHEN** the user has chosen Accept or Decline and reloads the app
- **THEN** the stored choice is re-applied to Consent Mode before gtag.js initialises
- **AND** the user is not prompted again

#### Scenario: Granted consent restored on load
- **WHEN** a returning visitor whose stored choice is `granted` loads the app
- **THEN** Consent Mode is set to `analytics_storage: 'granted'` for that session

#### Scenario: Storage unavailable stays denied
- **WHEN** localStorage cannot be read or written
- **THEN** the system keeps analytics denied for the session and does not error

### Requirement: Change consent in Manage
The system SHALL provide a control in the Manage (Settings) screen that reflects the current consent choice and lets the user change it at any time, updating both the persisted choice and the live Consent Mode state.

#### Scenario: Toggle reflects current choice
- **WHEN** the user opens Manage
- **THEN** the usage-analytics control shows on when consent is granted and off otherwise (including when undecided)

#### Scenario: Enabling analytics from Manage
- **WHEN** the user turns the usage-analytics control on
- **THEN** the stored choice is set to `granted`
- **AND** Consent Mode is updated to `analytics_storage: 'granted'`

#### Scenario: Disabling analytics from Manage
- **WHEN** the user turns the usage-analytics control off
- **THEN** the stored choice is set to `denied`
- **AND** Consent Mode is updated to `analytics_storage: 'denied'`
