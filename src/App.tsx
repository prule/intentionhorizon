/* ───────────────────────────────────────────────
   App.tsx — responsive shell, routing, state
   Mobile: full-screen + bottom tab bar.
   Desktop: sidebar nav + centered content column.
   ─────────────────────────────────────────────── */
import React from 'react';
import * as IH from './data/store';
import { TabBar, Sidebar, useMedia } from './components/ui';
import { ConsentBanner } from './components/ConsentBanner';
import { UpdateBanner } from './components/UpdateBanner';
import { EntryScreen } from './screens/EntryScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { Guide } from './screens/Guide';

// ── hash routing ──
// URL is the source of truth for the active page. Readable slugs map to the
// internal tab ids used throughout the app.
const DEFAULT_TAB = 'entry';
const TAB_TO_SLUG: Record<string, string> = { entry: 'journal', analytics: 'insights', settings: 'manage' };
const SLUG_TO_TAB: Record<string, string> = { journal: 'entry', insights: 'analytics', manage: 'settings' };

const tabToHash = (tab: string): string => `#/${TAB_TO_SLUG[tab] || TAB_TO_SLUG[DEFAULT_TAB]}`;
// returns null for empty/unknown hashes
const hashToTab = (hash: string): string | null => {
  const slug = hash.replace(/^#\/?/, '');
  return SLUG_TO_TAB[slug] || null;
};

// Resolve the initial page: hash wins; else legacy ih-tab (upgrade continuity); else default.
// Normalizes the URL with a replace so no junk history entry is created.
function initialTab(): string {
  const fromHash = hashToTab(window.location.hash);
  if (fromHash) return fromHash;
  const legacy = localStorage.getItem('ih-tab');
  const tab = (legacy && TAB_TO_SLUG[legacy]) ? legacy : DEFAULT_TAB;
  window.history.replaceState(null, '', tabToHash(tab));
  return tab;
}

export default function App() {
  const desktop = useMedia('(min-width: 880px)');
  const [tab, setTabState] = React.useState<string>(initialTab);
  const [version, setVersion] = React.useState(0);
  const [guideOpen, setGuideOpen] = React.useState(false);
  const bump = React.useCallback(() => setVersion((v) => v + 1), []);
  const openGuide = React.useCallback(() => setGuideOpen(true), []);

  // navigation updates the URL (push); the hashchange listener drives state
  const setTab = React.useCallback((next: string) => { window.location.hash = tabToHash(next); }, []);

  // URL is source of truth: sync state on hashchange (Back/Forward, external edits)
  React.useEffect(() => {
    const onHashChange = () => {
      const next = hashToTab(window.location.hash);
      if (next) setTabState((cur) => (cur === next ? cur : next));
      else window.history.replaceState(null, '', tabToHash(DEFAULT_TAB)), setTabState(DEFAULT_TAB);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // The Journal always opens on today; the viewed day is intentionally not
  // persisted, so reopening the app never lands the user on a stale past day.
  const [date, setDate] = React.useState<Date>(IH.today);

  const screen =
    tab === 'entry' ? <EntryScreen date={date} setDate={setDate} version={version} bump={bump} openGuide={openGuide} />
    : tab === 'analytics' ? <AnalyticsScreen version={version} />
    : <SettingsScreen version={version} bump={bump} openGuide={openGuide} />;

  const guide = guideOpen ? <Guide onClose={() => setGuideOpen(false)} /> : null;

  if (desktop) {
    return (
      <div className="app-shell" style={{ display: 'flex' }}>
        <Sidebar tab={tab} setTab={setTab} openGuide={openGuide} />
        <main style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ flex: 1, minWidth: 0, maxWidth: 720, height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 16, boxSizing: 'border-box' }}>
            {screen}
          </div>
        </main>
        {guide}
        <ConsentBanner />
        <UpdateBanner />
      </div>
    );
  }

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
        {screen}
      </div>
      <TabBar tab={tab} setTab={setTab} />
      {guide}
      <ConsentBanner />
      <UpdateBanner />
    </div>
  );
}
