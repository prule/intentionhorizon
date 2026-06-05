/* ───────────────────────────────────────────────
   Guide.tsx — full-screen user guide overlay
   ─────────────────────────────────────────────── */
import React from 'react';
import { Icon } from '../components/Icon';
import { CircleToggle, PrimaryButton } from '../components/ui';

function GBlock({ n, title, children }: { n: React.ReactNode; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
        <span className="num" style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--ink)', color: 'var(--bg)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{n}</span>
        <h3 style={{ margin: 0, fontSize: 17.5, fontWeight: 700, letterSpacing: '-0.01em', flex: 1, minWidth: 0 }}>{title}</h3>
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.62, color: 'var(--ink-2)' }}>{children}</div>
    </section>
  );
}

// a small framed example strip
function GExample({ children }: { children?: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12, background: 'var(--surface)', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-sm)', padding: '13px 15px', boxShadow: 'var(--shadow-card)' }}>
      {children}
    </div>
  );
}

function ExRow({ children, label }: { children?: React.ReactNode; label: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '5px 0' }}>
      <div style={{ flexShrink: 0 }}>{children}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.45 }}>{label}</div>
    </div>
  );
}

export function Guide({ onClose }: { onClose: () => void }) {
  // lock background scroll while open
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const heat = 'var(--c-teal)';
  const swatch = (r: number) => `color-mix(in oklab, ${heat} ${Math.round((0.22 + 0.78 * r) * 100)}%, var(--surface))`;

  return (
    <div className="guide-overlay">
      <div className="guide-col">
        <header className="guide-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>User guide</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>Everything you can do in Intention Horizon</div>
          </div>
          <button className="ih-btn" onClick={onClose} style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--surface)', border: '1px solid var(--line-soft)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', boxShadow: 'var(--shadow-card)', flexShrink: 0 }}>
            <Icon.close />
          </button>
        </header>

        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)', margin: '4px 0 26px' }}>
          Intention Horizon helps you define the things you want to do regularly, tick them off as you go,
          and see how your last weeks are trending. There are three places to spend your time:
          <strong style={{ color: 'var(--ink)' }}> Journal</strong>,
          <strong style={{ color: 'var(--ink)' }}> Insights</strong>, and
          <strong style={{ color: 'var(--ink)' }}> Manage</strong>.
        </p>

        <GBlock n="1" title="Log your day on Journal">
          Your intentions are grouped by category. Tap the circle beside one to mark it complete for the
          selected day — tap again to undo. Use the arrows to step back up to <strong>7 days</strong> if you
          forgot to log something.
          <GExample>
            <ExRow label="Not done yet — an empty ring."><CircleToggle on={false} color="var(--c-clay)" onToggle={() => {}} /></ExRow>
            <ExRow label="Done — tap fills it in your intention's colour."><CircleToggle on={true} color="var(--c-clay)" onToggle={() => {}} /></ExRow>
          </GExample>
          <div style={{ marginTop: 10 }}>The thin row of dots under each name is your last 30 days at a glance.</div>
        </GBlock>

        <GBlock n="2" title="Totals & targets">
          Each intention shows a rolling count over its target period. A target is a number of completions
          within a number of days — say <strong>3 times in 7 days</strong>, or <strong>once in 365</strong>.
          The number tells you where you stand against it:
          <GExample>
            <ExRow label="Under target — shown faint, a nudge to keep going.">
              <span className="num" style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink-4)' }}>2<span style={{ fontSize: 11 }}>/4</span></span>
            </ExRow>
            <ExRow label="On target — solid, with a marker.">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span className="num" style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>4<span style={{ fontSize: 11, color: 'var(--ink-4)' }}>/4</span></span>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--ink-2)' }} />
              </span>
            </ExRow>
            <ExRow label="Above target — solid, with an upward arrow.">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span className="num" style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>6<span style={{ fontSize: 11, color: 'var(--ink-4)' }}>/4</span></span>
                <Icon.arrowUp style={{ color: 'var(--c-moss)' }} />
              </span>
            </ExRow>
          </GExample>
          <div style={{ marginTop: 10 }}>Targets are optional — turn them on per intention in Manage.</div>
        </GBlock>

        <GBlock n="3" title="Read the Insights heatmap">
          The grid shows one square per day across the last 13 weeks. The <strong>number</strong> is how many
          intentions you completed that day; the <strong>fill strength</strong> reflects how many of your
          targets were being met — faint when you're under, strong when you're hitting them.
          <GExample>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>under</span>
              {[0.18, 0.45, 0.72, 1].map((r, i) => (
                <div key={i} style={{ width: 26, height: 26, borderRadius: 6, background: swatch(r), border: '1px solid var(--line-soft)' }} />
              ))}
              <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>met</span>
            </div>
          </GExample>
          <div style={{ marginTop: 10 }}>
            Tap a chip to focus a single intention. The three tiles up top show your
            <strong> current streak</strong>, your <strong>best run</strong>, and your 30-day completion rate.
            Switch the Totals between Day, Month and Year.
          </div>
        </GBlock>

        <GBlock n="4" title="Organise in Manage">
          Add intentions with the <strong>+</strong> button — give each a name, category, colour and optional
          targets. Tap any intention to edit or delete it. Add and rename categories from here too.
          <GExample>
            <ExRow label="Press and hold the grip, then drag to reorder intentions within a category — or reorder whole categories. The order carries over to Journal.">
              <span style={{ color: 'var(--ink-4)', display: 'flex' }}><Icon.grip /></span>
            </ExRow>
          </GExample>
        </GBlock>

        <GBlock n="5" title="Your data stays yours">
          Everything is saved locally on this device — no account, no cloud. You can
          <strong> export a CSV</strong> of your history anytime from Insights or Manage. Because it's a
          installable web app, it also keeps working <strong>offline</strong>; add it to your home screen
          for a full-screen, app-like experience.
        </GBlock>

        <div style={{ marginTop: 8, paddingTop: 18, borderTop: '1px solid var(--line-soft)', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>
          That's it. Keep it light — a few intentions you genuinely care about beats a long list you ignore.
        </div>

        <div style={{ marginTop: 22 }}>
          <PrimaryButton onClick={onClose}>Got it</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
