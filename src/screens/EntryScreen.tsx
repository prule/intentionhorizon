/* ───────────────────────────────────────────────
   EntryScreen.tsx — daily entry screen
   ─────────────────────────────────────────────── */
import React from 'react';
import * as IH from '../data/store';
import { Icon } from '../components/Icon';
import { CircleToggle, Stat, MiniHistory, ScreenHeader } from '../components/ui';

const navBtn = (enabled: boolean): React.CSSProperties => ({
  width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center',
  background: 'var(--surface)', border: '1px solid var(--line-soft)',
  color: enabled ? 'var(--ink-2)' : 'var(--ink-4)', opacity: enabled ? 1 : 0.45,
  boxShadow: enabled ? 'var(--shadow-card)' : 'none',
});

function DateNav({ date, setDate }: { date: Date; setDate: (d: Date) => void }) {
  const t = IH.today();
  const minDate = IH.addDays(t, -7); // toggling allowed up to 7 days prior
  const canPrev = date > minDate;
  const canNext = date < t;
  const isToday = IH.sameKey(date, t); // hide the return-to-today control on today

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 20px 14px' }}>
      <button className="ih-btn" data-testid="date-prev" disabled={!canPrev} onClick={() => canPrev && setDate(IH.addDays(date, -1))}
        style={navBtn(canPrev)}><Icon.chevL /></button>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div data-testid="date-label" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{IH.fmtDay(date)}</div>
        <div className="num" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>
          {IH.WD[date.getDay()]}, {IH.MONTHS[date.getMonth()]} {date.getDate()}
        </div>
      </div>
      {!isToday && (
        <button className="ih-btn" data-testid="date-today" aria-label="Return to today" onClick={() => setDate(t)}
          style={{
            height: 40, padding: '0 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
            background: 'var(--surface)', border: '1px solid var(--line-soft)', color: 'var(--ink-2)', boxShadow: 'var(--shadow-card)',
          }}>Today</button>
      )}
      <button className="ih-btn" data-testid="date-next" disabled={!canNext} onClick={() => canNext && setDate(IH.addDays(date, 1))}
        style={navBtn(canNext)}><Icon.chevR /></button>
    </div>
  );
}

function IntentionRow({ intention, date, onChange }: { intention: IH.Intention; date: Date; onChange: () => void }) {
  const key = IH.dateKey(date);
  const on = IH.isDone(intention.id, key);
  const color = IH.colorVar(intention.color);
  const periodCount = IH.windowCount(intention.id, date, intention.targetPeriodDays);

  return (
    <div data-testid="intention-row" data-intention-name={intention.name} style={{ padding: '13px 16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <CircleToggle on={on} color={color} testid="intention-toggle" onToggle={() => { IH.toggleCompletion(intention.id, key); onChange(); }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', color: on ? 'var(--ink)' : 'var(--ink-2)' }}>
            {intention.name}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Stat count={periodCount} target={intention.targetEnabled ? intention.targetCompletions : null}
            label={`${intention.targetPeriodDays}d`} testid="stat-target" />
        </div>
      </div>
      <MiniHistory intentionId={intention.id} color={color} endDate={date} />
    </div>
  );
}

export function EntryScreen({ date, setDate, version, bump, openGuide }: {
  date: Date; setDate: (d: Date) => void; version: number; bump: () => void; openGuide?: () => void;
}) {
  const s = IH.load();
  const cats = s.categories;
  const intentsByCat: Record<string, IH.Intention[]> = {};
  s.intentions.forEach((it) => {
    const k = it.categoryId || '_none';
    (intentsByCat[k] = intentsByCat[k] || []).push(it);
  });

  // day summary
  const doneToday = IH.doneOnDay(IH.dateKey(date)).length;
  const total = s.intentions.length;

  const groups = [...cats.map((c) => ({ id: c.id, name: c.name })), ...(intentsByCat['_none'] ? [{ id: '_none', name: 'Uncategorized' }] : [])]
    .filter((g) => (intentsByCat[g.id] || []).length);

  return (
    // No `key={version}` here: a changing key would remount the scroll subtree on
    // every data mutation and reset scrollTop. The `version` prop change still
    // re-renders this component (re-running IH.load() above) without losing scroll.
    <div className="ih-scroll fade-up" data-testid="screen-entry" style={{ paddingBottom: 24 }}>
      <ScreenHeader title="Journal" subtitle={`${doneToday} of ${total} intentions complete`} right={
        openGuide ? (
          <button className="ih-btn" onClick={openGuide} aria-label="User guide" style={{
            width: 40, height: 40, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line-soft)',
            display: 'grid', placeItems: 'center', color: 'var(--ink-3)', boxShadow: 'var(--shadow-card)',
          }}><Icon.help /></button>
        ) : null
      } />
      <DateNav date={date} setDate={setDate} />

      {groups.map((g) => (
        <div key={g.id} style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px 7px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{g.name}</span>
            <span className="num" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
              {IH.doneOnDay(IH.dateKey(date)).filter((it) => (it.categoryId || '_none') === g.id).length}/{(intentsByCat[g.id] || []).length}
            </span>
          </div>
          <div style={{ background: 'var(--surface)', margin: '0 14px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            {(intentsByCat[g.id] || []).map((it, i, arr) => (
              <React.Fragment key={it.id}>
                <IntentionRow intention={it} date={date} onChange={bump} />
                {i < arr.length - 1 && <div style={{ height: 1, background: 'var(--line-soft)', marginLeft: 63 }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}

      {s.intentions.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '60px 30px', fontSize: 14.5, lineHeight: 1.5 }}>
          No intentions yet. Head to <strong style={{ color: 'var(--ink-2)' }}>Manage</strong> to create your first one.
        </div>
      )}
    </div>
  );
}
