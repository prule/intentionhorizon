/* ───────────────────────────────────────────────
   consent.ts — analytics consent (Google Consent Mode v2)

   The app is local-first; the only third-party data flow is GA4 (gtag.js).
   Consent defaults to 'denied' in index.html before GA loads, so GA runs
   cookieless until the user opts in here. The choice persists in localStorage
   and is re-applied on load by the inline bootstrap in index.html.
   ─────────────────────────────────────────────── */

export type ConsentChoice = 'granted' | 'denied';

const STORAGE_KEY = 'ih-consent';

declare global {
  interface Window {
    dataLayer?: unknown[];
    // Defined globally by the gtag bootstrap in index.html.
    gtag?: (...args: unknown[]) => void;
  }
}

/** The user's stored choice, or null if they haven't decided yet. */
export function getStoredConsent(): ConsentChoice | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

/** Persist the choice and update Google Consent Mode in the live page. */
export function setConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* storage blocked — the update below still applies for this session */
  }
  // analytics_storage only; this app runs no advertising tags.
  window.gtag?.('consent', 'update', { analytics_storage: choice });
}
