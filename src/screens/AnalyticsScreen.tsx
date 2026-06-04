/* ───────────────────────────────────────────────
   AnalyticsScreen.tsx — insights: heatmap, filter, totals, CSV
   ─────────────────────────────────────────────── */
import React from 'react';
import * as IH from '../data/store';
import { Icon } from '../components/Icon';
import { Segmented, ScreenHeader } from '../components/ui';

function Chip({ active, onClick, label, color }: {
  active: boolean; onClick: () => void; label: string; color?: string;
}) {
  return (
    <button className="ih-btn" data-testid="filter-chip" data-filter-name={label} onClick={onClick} style={{
      flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 13px', borderRadius: 99, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
      background: active ? 'var(--ink)' : 'var(--surface)',
      color: active ? 'var(--bg)' : 'var(--ink-2)',
      border: '1px solid ' + (active ? 'var(--ink)' : 'var(--line-soft)'),
      boxShadow: active ? 'none' : 'var(--shadow-card)', transition: 'all 0.15s ease',
    }}>
      {color && <span style={{ width: 8, height: 8, borderRadius: 99, background: color }} />}
      {label}
    </button>
  );
}

function FilterChips({ intentions, value, onChange }: {
  intentions: IH.Intention[]; value: string | null; onChange: (id: string | null) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '0 20px 4px', scrollbarWidth: 'none' }}>
      <Chip active={value === null} onClick={() => onChange(null)} label="All" />
      {intentions.map((it) => (
        <Chip key={it.id} active={value === it.id} onClick={() => onChange(it.id)} label={it.name} color={IH.colorVar(it.color)} />
      ))}
    </div>
  );
}

type HeatCell = IH.DayMetric & { day: Date };
function Cell({ cell, heatColor, delay }: { cell: HeatCell | null; heatColor: string; delay: number }) {
  if (!cell) return <div style={{ aspectRatio: '1', borderRadius: 7 }} />;
  const { count, metRatio } = cell;
  const has = count > 0;
  const op = has ? 0.22 + 0.78 * metRatio : 0;
  const dark = metRatio > 0.5 && has;
  const isToday = IH.sameKey(cell.day, IH.today());
  return (
    <div title={`${IH.MONTHS[cell.day.getMonth()]} ${cell.day.getDate()} · ${count} done`}
      style={{
        aspectRatio: '1', borderRadius: 7, position: 'relative',
        display: 'grid', placeItems: 'center',
        background: has ? `color-mix(in oklab, ${heatColor} ${Math.round(op * 100)}%, var(--surface))` : 'var(--bg-2)',
        border: isToday ? '1.6px solid var(--ink)' : '1px solid var(--line-soft)',
        animation: `cellPop 0.3s var(--ease-spring) ${delay}ms both`,
      }}>
      {has && (
        <span className="num" style={{ fontSize: 12, fontWeight: 600, color: dark ? '#fff' : 'var(--ink-2)' }}>{count}</span>
      )}
    </div>
  );
}

function Legend({ heatColor, filter }: { heatColor: string; filter: string | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '0 2px' }}>
      <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{filter ? 'Target met' : 'Targets met'}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>under</span>
        {[0.18, 0.45, 0.72, 1].map((r, i) => (
          <div key={i} style={{ width: 15, height: 15, borderRadius: 4.5, background: `color-mix(in oklab, ${heatColor} ${Math.round((0.22 + 0.78 * r) * 100)}%, var(--surface))`, border: '1px solid var(--line-soft)' }} />
        ))}
        <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>met</span>
      </div>
    </div>
  );
}

function Heatmap({ filter }: { filter: string | null }) {
  const t = IH.today();
  const WEEKS = 13;
  const heatColor = filter ? IH.colorVar(IH.load().intentions.find((i) => i.id === filter)?.color || 'teal') : 'var(--c-teal)';
  const startSunday = IH.addDays(t, -t.getDay() - (WEEKS - 1) * 7);

  const weeks: (HeatCell | null)[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const row: (HeatCell | null)[] = [];
    for (let dow = 0; dow < 7; dow++) {
      const day = IH.addDays(startSunday, w * 7 + dow);
      if (day > t) { row.push(null); continue; }
      const m = IH.dayMetric(day, filter);
      row.push({ day, ...m });
    }
    weeks.push(row);
  }

  // month labels down the left of each week row (show when month changes)
  let lastMonth = -1;

  return (
    <div style={{ padding: '4px 20px 0' }}>
      {/* weekday header */}
      <div style={{ display: 'grid', gridTemplateColumns: '22px repeat(7, 1fr)', gap: 5, marginBottom: 5 }}>
        <div />
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--ink-4)' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {weeks.slice().reverse().map((row, wi) => {
          const firstReal = row.find((c) => c);
          let monthLabel = '';
          if (firstReal) {
            const mo = firstReal.day.getMonth();
            if (mo !== lastMonth) { monthLabel = IH.MONTHS[mo]; lastMonth = mo; }
          }
          return (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: '22px repeat(7, 1fr)', gap: 5 }}>
              <div style={{ fontSize: 9, color: 'var(--ink-4)', alignSelf: 'center', fontWeight: 600 }}>{monthLabel}</div>
              {row.map((c, di) => <Cell key={di} cell={c} heatColor={heatColor} delay={(wi * 7 + di) * 4} />)}
            </div>
          );
        })}
      </div>

      <Legend heatColor={heatColor} filter={filter} />
    </div>
  );
}

function TotalsBlock({ filter }: { filter: string | null }) {
  const [grouping, setGrouping] = React.useState<IH.Grouping>('day');
  const ranges: Record<IH.Grouping, number> = { day: 14, month: 186, year: 730 };
  const data = IH.aggregate(filter, grouping, ranges[grouping]);
  // slice to 10 most recent for day grouping, then reverse so newest renders first
  const shown = (grouping === 'day' ? data.slice(-10) : data).slice().reverse();
  const max = Math.max(1, ...shown.map((d) => d.value));
  const totalSum = shown.reduce((a, b) => a + b.value, 0);

  return (
    <div style={{ padding: '20px 20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Totals</div>
        <div style={{ width: 188 }}>
          <Segmented small value={grouping} onChange={(v) => setGrouping(v as IH.Grouping)}
            options={[{ value: 'day', label: 'Day' }, { value: 'month', label: 'Month' }, { value: 'year', label: 'Year' }]} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {shown.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 64, fontSize: 12, color: 'var(--ink-3)', textAlign: 'right', flexShrink: 0 }}>{d.label}</div>
            <div style={{ flex: 1, height: 22, background: 'var(--bg-2)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, width: `${(d.value / max) * 100}%`, background: 'var(--c-teal)', opacity: 0.55, borderRadius: 6, transition: 'width 0.5s var(--ease-spring)' }} />
            </div>
            <div className="num" style={{ width: 26, fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', textAlign: 'right' }}>{d.value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-3)' }}>
        <span className="num" data-testid="totals-sum" style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{totalSum}</span> completions shown
      </div>
    </div>
  );
}

function StreakStats({ filter }: { filter: string | null }) {
  const { current, best, rate } = IH.streaks(filter);
  const tiles = [
    { label: 'Current streak', value: current, unit: current === 1 ? 'day' : 'days', flame: true, testid: 'streak-current' },
    { label: 'Best run', value: best, unit: best === 1 ? 'day' : 'days', testid: 'streak-best' },
    { label: '30-day rate', value: rate, unit: '%', testid: 'streak-rate' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '0 20px 18px' }}>
      {tiles.map((t, i) => (
        <div key={i} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: '13px 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            {t.flame && current > 0 && <Icon.flame style={{ width: 16, height: 16, color: 'var(--c-clay)', alignSelf: 'center' }} />}
            <span className="num" data-testid={t.testid} style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>{t.value}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{t.unit}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: '0.01em', lineHeight: 1.2 }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsScreen({ version }: { version: number }) {
  const s = IH.load();
  const [filter, setFilter] = React.useState<string | null>(null);
  // guard against deleted intention filter
  React.useEffect(() => { if (filter && !s.intentions.find((i) => i.id === filter)) setFilter(null); }, [version]);

  return (
    <div className="ih-scroll fade-up" data-testid="screen-insights" style={{ paddingBottom: 28 }}>
      <ScreenHeader title="Insights" subtitle="Last 13 weeks" right={
        <button className="ih-btn" onClick={() => IH.downloadCSV()} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 11,
          background: 'var(--surface)', border: '1px solid var(--line-soft)', boxShadow: 'var(--shadow-card)',
          fontSize: 13, fontWeight: 600, color: 'var(--ink-2)',
        }}><Icon.download /> CSV</button>
      } />
      <div style={{ marginBottom: 16 }}>
        <FilterChips intentions={s.intentions} value={filter} onChange={setFilter} />
      </div>
      <StreakStats filter={filter} />
      <Heatmap filter={filter} />
      <TotalsBlock filter={filter} />
    </div>
  );
}
