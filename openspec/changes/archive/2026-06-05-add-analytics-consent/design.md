## Context

The app is a local-first PWA: all user data lives in IndexedDB and never leaves the device. The only third-party data flow is Google Analytics 4 via gtag.js, embedded in `index.html`. Previously GA loaded and set cookies on every visit with no consent gate. This change introduces consent gating using Google Consent Mode v2, while keeping the app fully static (deployable to GitHub Pages, no backend).

## Goals / Non-Goals

**Goals:**
- Analytics off by default; cookies/identifiers only after explicit opt-in.
- A clear first-run Accept/Decline prompt that does not nag returning users.
- A persisted, revocable choice the user can change in Manage.
- No new dependencies; remain a static client-only app.

**Non-Goals:**
- A full Consent Management Platform (categories, vendor lists, audit logs).
- Blocking gtag.js from loading entirely before consent — we use cookieless Consent Mode instead.
- Advertising/remarketing consent — the app runs no ad tags; those signals stay denied.
- Geo-targeting the prompt (e.g. showing it only to EU visitors).

## Decisions

- **Google Consent Mode v2 with default `denied`, set before gtag.js loads.** The inline bootstrap in `index.html` defines `dataLayer`/`gtag`, calls `gtag('consent','default', { analytics_storage:'denied', … })`, then loads gtag.js. GA initialises in cookieless mode and is upgraded via `gtag('consent','update', …)` once consent is granted.
  - *Alternative considered:* not injecting gtag.js until consent. Rejected because Consent Mode is Google's supported pattern, preserves anonymous cookieless pings on decline, and avoids race conditions around late script injection. (If stricter "no network call until opt-in" is later required, this can be revisited.)

- **Re-apply stored consent in the inline `index.html` bootstrap, before GA config.** A small `try/catch` reads `ih-consent` from localStorage and issues a `consent update` synchronously, so returning users' choice is in effect before the first GA hit — avoiding a flash of denied→granted.
  - *Alternative considered:* applying consent only from React after hydration. Rejected: React mounts after GA, so the first hit could use the wrong consent state.

- **Single source of truth in `src/consent.ts`.** Exposes `getStoredConsent()` and `setConsent(choice)`; the latter writes localStorage and calls the global `gtag` defined in `index.html`. Both the banner and the Manage toggle use it, so behavior cannot drift.
  - *Alternative considered:* pushing to `dataLayer` directly from TypeScript. Rejected: reusing the global `gtag` shim preserves the correct `arguments`-object push semantics that Consent Mode relies on.

- **Undecided is treated as denied (and as "off") everywhere.** The banner shows only when `getStoredConsent()` is `null`; the Manage toggle renders off when the value is not `granted`. This keeps UI and consent state consistent with the default-denied posture.

- **Styling reuses existing theme tokens** (`--surface`, `--line-soft`, `--radius`, `--shadow-pop`, etc.) and sits above the mobile tab bar via a media query, so it matches the app without new design primitives.

## Risks / Trade-offs

- **Decline still sends cookieless pings to Google.** This is standard Consent Mode behavior, not full blocking. → Documented as a non-goal; switch to deferred script injection if a stricter policy is required.
- **localStorage cleared / private mode** loses the choice, so the banner reappears. → Acceptable; default-denied means no tracking occurs in the meantime, and the `try/catch` prevents errors.
- **Service worker may cache gtag.js / the app shell.** A stale shell could serve old consent wiring. → The SW cache version is bumped on release; document a hard reload when testing locally.
- **No geo-gating** means all users see the prompt. → Intentional simplicity; acceptable for a small privacy-first app.
