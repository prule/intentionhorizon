## 1. Consent Mode bootstrap (index.html)

- [x] 1.1 Define `dataLayer`/`gtag` and set Consent Mode v2 default to denied (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) before gtag.js loads
- [x] 1.2 Re-apply a stored `ih-consent` choice via `gtag('consent','update', …)` on load, before GA config, wrapped in try/catch
- [x] 1.3 Load gtag.js and run `gtag('js', …)` / `gtag('config', …)` after the consent default

## 2. Consent state module

- [x] 2.1 Create `src/consent.ts` with `ConsentChoice` type and the `ih-consent` storage key
- [x] 2.2 Implement `getStoredConsent()` returning `granted` | `denied` | `null` (safe on storage errors)
- [x] 2.3 Implement `setConsent(choice)` to persist the choice and call `gtag('consent','update', { analytics_storage })`

## 3. Consent banner UI

- [x] 3.1 Create `src/components/ConsentBanner.tsx` shown only when `getStoredConsent()` is null
- [x] 3.2 Wire Accept → `setConsent('granted')` and Decline → `setConsent('denied')`, dismissing the banner
- [x] 3.3 Add banner styles in `src/styles.css` using theme tokens; position above the mobile tab bar
- [x] 3.4 Mount `<ConsentBanner />` in both desktop and mobile layouts in `src/App.tsx`

## 4. Manage (Settings) toggle

- [x] 4.1 Add a "Usage analytics" control in `src/screens/SettingsScreen.tsx` reflecting current consent (off when undecided/denied)
- [x] 4.2 Wire the toggle to `setConsent('granted' | 'denied')`

## 5. Verification

- [x] 5.1 `npm run typecheck` passes
- [ ] 5.2 Manually verify: fresh load shows banner & GA cookieless; Accept sets cookies; reload does not re-prompt; Manage toggle flips consent
