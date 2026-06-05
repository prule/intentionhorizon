## Why

The app loads Google Analytics 4 (gtag.js) on every visit and previously set analytics cookies unconditionally, with no way for visitors to refuse. For a local-first, privacy-minded app — and to meet consent expectations for EU visitors — analytics must be off by default and only enabled with the user's explicit, revocable consent.

## What Changes

- Analytics consent now defaults to **denied** before GA loads, using Google Consent Mode v2 (`analytics_storage: 'denied'`), so GA runs in cookieless mode until the user opts in.
- A first-run consent banner offers **Accept** / **Decline**; the banner does not reappear once a choice is made.
- The choice persists in `localStorage` (`ih-consent`) and is re-applied on every load before GA initialises, so returning visitors keep their decision and are not re-prompted.
- The Manage (Settings) screen gains a **Usage analytics** toggle so the user can change consent at any time.
- Granting consent updates Consent Mode live (`analytics_storage: 'granted'`); declining keeps it denied. Advertising signals remain denied permanently (the app runs no ad tags).

## Capabilities

### New Capabilities
- `analytics-consent`: Default-denied analytics, a consent prompt, persisted and re-applied consent, and a runtime toggle to change consent — all driving Google Consent Mode v2.

### Modified Capabilities
<!-- None: no existing spec's requirements change. -->

## Impact

- `index.html`: Consent Mode v2 default (denied) set before gtag.js; saved choice re-applied on load.
- `src/consent.ts` (new): read/persist choice in `localStorage` and push `gtag('consent','update', …)`.
- `src/components/ConsentBanner.tsx` (new): first-run Accept/Decline banner.
- `src/App.tsx`: mounts the banner in both desktop and mobile layouts.
- `src/screens/SettingsScreen.tsx`: adds the Usage analytics toggle in Manage.
- `src/styles.css`: banner styles.
- Dependency/system: Google Analytics 4 via gtag.js; no new packages.
