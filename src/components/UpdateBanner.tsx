/* ───────────────────────────────────────────────
   UpdateBanner.tsx — "a new version is available" prompt
   vite-plugin-pwa (registerType: 'prompt') installs a new service worker but
   waits for the user before activating it. needRefresh flips true when a newer
   worker is waiting; "Reload" activates it and reloads onto the new build,
   "Later" hides the banner until the next deploy produces another worker.
   Mirrors ConsentBanner. See vite.config.ts for the SW config.
   ─────────────────────────────────────────────── */
import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

// How often to ask the browser to re-check for a new service worker, so a
// long-open session notices a deploy even though it never navigates.
const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000;

export function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      const check = () => registration.update().catch(() => {});
      // Check when the tab regains focus and on a steady interval.
      const onVisible = () => { if (document.visibilityState === 'visible') check(); };
      document.addEventListener('visibilitychange', onVisible);
      setInterval(check, UPDATE_CHECK_INTERVAL_MS);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="update-banner" role="dialog" aria-label="Update available" data-testid="update-banner">
      <div className="update-text">
        A new version of Intention Horizon is available.
      </div>
      <div className="update-actions">
        <button className="ih-btn update-btn update-later" data-testid="update-later" onClick={() => setNeedRefresh(false)}>
          Later
        </button>
        <button className="ih-btn update-btn update-reload" data-testid="update-reload" onClick={() => updateServiceWorker(true)}>
          Reload
        </button>
      </div>
    </div>
  );
}
