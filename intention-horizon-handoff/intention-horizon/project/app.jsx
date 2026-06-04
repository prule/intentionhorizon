/* ───────────────────────────────────────────────
   app.jsx — responsive shell, routing, state
   Mobile: full-screen + bottom tab bar.
   Desktop: sidebar nav + centered content column.
   ─────────────────────────────────────────────── */

function App() {
  const desktop = useMedia('(min-width: 880px)');
  const [tab, setTab] = React.useState(() => localStorage.getItem('ih-tab') || 'entry');
  const [version, setVersion] = React.useState(0);
  const [guideOpen, setGuideOpen] = React.useState(false);
  const bump = React.useCallback(() => setVersion(v => v + 1), []);
  const openGuide = React.useCallback(() => setGuideOpen(true), []);

  const [date, setDateRaw] = React.useState(() => {
    const saved = localStorage.getItem('ih-entry-date');
    const t = IH.today();
    if (saved) { const d = IH.parseKey(saved); if (d <= t && d >= IH.addDays(t, -7)) return d; }
    return t;
  });
  const setDate = (d) => { setDateRaw(d); localStorage.setItem('ih-entry-date', IH.dateKey(d)); };

  React.useEffect(() => { localStorage.setItem('ih-tab', tab); }, [tab]);

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
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
