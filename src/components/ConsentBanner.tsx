/* ───────────────────────────────────────────────
   ConsentBanner.tsx — first-run analytics consent prompt
   Shows once, until the user accepts or declines. The choice can be changed
   later in Manage. See consent.ts for the storage / Consent Mode plumbing.
   ─────────────────────────────────────────────── */
import React from 'react';
import { getStoredConsent, setConsent, type ConsentChoice } from '../consent';

export function ConsentBanner() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // Only prompt when the user hasn't chosen yet.
    if (getStoredConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (choice: ConsentChoice) => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <div className="consent-banner" role="dialog" aria-label="Privacy choices" data-testid="consent-banner">
      <div className="consent-text">
        Your intentions stay on this device. We’d also like to use{' '}
        <strong>analytics cookies</strong> to see how the app is used. You can
        change this anytime in Manage.
      </div>
      <div className="consent-actions">
        <button className="ih-btn consent-btn consent-decline" data-testid="consent-decline" onClick={() => choose('denied')}>
          Decline
        </button>
        <button className="ih-btn consent-btn consent-accept" data-testid="consent-accept" onClick={() => choose('granted')}>
          Accept
        </button>
      </div>
    </div>
  );
}
