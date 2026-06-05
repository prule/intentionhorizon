/* ───────────────────────────────────────────────
   ui.tsx — shared UI primitives
   ─────────────────────────────────────────────── */
import React from 'react';
import * as IH from '../data/store';
import { Icon } from './Icon';

// ── animated circle toggle ──
export function CircleToggle({ on, color = 'var(--ink)', onToggle, size = 34, testid }: {
  on: boolean; color?: string; onToggle?: () => void; size?: number; testid?: string;
}) {
  return (
    <div
      className="tog"
      data-testid={testid}
      data-on={on ? 'true' : 'false'}
      style={{ width: size, height: size, '--ring': 'var(--line)', '--fill': color } as React.CSSProperties}
      onClick={(e) => { e.stopPropagation(); onToggle && onToggle(); }}
      role="checkbox"
      aria-checked={on}
    >
      <div className="tog-ring" />
      <div className="tog-fill" />
      <Icon.check className="tog-check" />
    </div>
  );
}

// ── trailing stat: count over a target period with target status colour ──
// "Under = faint, on/above = stronger fill"
export function Stat({ count, target, label, testid }: { count: number; target?: number | null; label: string; testid?: string }) {
  const status = (target == null) ? null : (count < target ? 'under' : count === target ? 'on' : 'above');
  let valColor = 'var(--ink)';
  if (status === 'under') valColor = 'var(--ink-4)';
  else if (status === 'on') valColor = 'var(--ink)';
  else if (status === 'above') valColor = 'var(--ink)';
  return (
    <div data-testid={testid} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 38 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <span className="num" data-testid={testid ? `${testid}-count` : undefined} style={{ fontSize: 17, fontWeight: 600, color: valColor, lineHeight: 1 }}>{count}</span>
        {target != null && (
          <span className="num" style={{ fontSize: 11, color: 'var(--ink-4)' }}>/{target}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>{label}</span>
        {status && status !== 'under' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: status === 'above' ? 'var(--c-moss)' : 'var(--ink-3)',
          }}>
            {status === 'above'
              ? <Icon.arrowUp />
              : <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--ink-2)', display: 'block' }} />}
          </span>
        )}
      </div>
    </div>
  );
}

// ── 30-day mini history strip (view only) ──
export function MiniHistory({ intentionId, color, endDate }: { intentionId: string; color: string; endDate: Date }) {
  const dots = [];
  for (let i = 29; i >= 0; i--) {
    const d = IH.addDays(endDate, -i);
    const on = IH.isDone(intentionId, IH.dateKey(d));
    dots.push(
      <div key={i} style={{
        flex: 1, height: 4, borderRadius: 2,
        background: on ? color : 'var(--line)',
        opacity: on ? 1 : 0.7,
      }} />
    );
  }
  return <div style={{ display: 'flex', gap: 2, marginTop: 9 }}>{dots}</div>;
}

// ── segmented control ──
export type SegOption = { value: string; label: string };
export function Segmented({ options, value, onChange, small }: {
  options: SegOption[]; value: string; onChange: (value: string) => void; small?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', background: 'var(--bg-2)', borderRadius: 11, padding: 3, gap: 2,
      border: '1px solid var(--line-soft)',
    }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button key={o.value} className="ih-btn" onClick={() => onChange(o.value)}
            style={{
              flex: 1, padding: small ? '6px 8px' : '8px 10px', borderRadius: 8.5,
              fontSize: small ? 12.5 : 13.5, fontWeight: 600,
              color: active ? 'var(--ink)' : 'var(--ink-3)',
              background: active ? 'var(--surface)' : 'transparent',
              boxShadow: active ? 'var(--shadow-card)' : 'none',
              transition: 'all 0.18s ease',
            }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── bottom sheet (mobile) / centered modal (desktop) ──
export function Sheet({ open, onClose, title, children, footer }: {
  open: boolean; onClose: () => void; title: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="ih-sheet-scrim">
      <div className="ih-sheet-bg" onClick={onClose} />
      <div className="ih-sheet">
        <div className="ih-sheet-grab" style={{ width: 38, height: 5, borderRadius: 99, background: 'var(--line)', margin: '0 auto 6px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px 12px' }}>
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{title}</div>
          <button className="ih-btn" onClick={onClose} style={{ color: 'var(--ink-3)', padding: 4 }}><Icon.close /></button>
        </div>
        <div className="ih-scroll" style={{ padding: '0 20px 16px', flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: '12px 20px calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--line-soft)', background: 'var(--surface)' }}>{footer}</div>}
      </div>
    </div>
  );
}

export function PrimaryButton({ children, onClick, color = 'var(--ink)', disabled, testid }: {
  children?: React.ReactNode; onClick?: () => void; color?: string; disabled?: boolean; testid?: string;
}) {
  return (
    <button className="ih-btn" data-testid={testid} onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '14px', borderRadius: 14, background: disabled ? 'var(--line)' : color,
      color: disabled ? 'var(--ink-4)' : '#fff', fontSize: 16, fontWeight: 600,
      letterSpacing: '-0.01em', transition: 'transform 0.1s ease, opacity 0.15s ease',
    }}
    onPointerDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.985)'; }}
    onPointerUp={(e) => e.currentTarget.style.transform = 'none'}
    onPointerLeave={(e) => e.currentTarget.style.transform = 'none'}>
      {children}
    </button>
  );
}

// ── drag-to-reorder list (pointer based, variable row heights) ──
export type DragHandleProps = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  style: React.CSSProperties;
};
type DragState = {
  index: number; target: number; startY: number; delta: number;
  tops: number[]; heights: number[];
};
export function DragList<T>({ items, getKey, renderItem, onReorder }: {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T, handle: DragHandleProps, dragging: boolean) => React.ReactNode;
  onReorder: (ids: string[]) => void;
}) {
  const [drag, setDrag] = React.useState<DragState | null>(null); // {index, target, delta, tops, heights}
  const dragRef = React.useRef<DragState | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Record<string, HTMLDivElement>>({});

  const begin = (e: React.PointerEvent, index: number) => {
    const c = containerRef.current;
    if (!c) return;
    const cTop = c.getBoundingClientRect().top;
    const tops: number[] = [], heights: number[] = [];
    items.forEach((it) => {
      const n = itemRefs.current[getKey(it)];
      const r = n.getBoundingClientRect();
      tops.push(r.top - cTop); heights.push(r.height);
    });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    const nd: DragState = { index, target: index, startY: e.clientY, delta: 0, tops, heights };
    dragRef.current = nd; setDrag(nd);
  };
  const move = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    e.preventDefault();
    const delta = e.clientY - d.startY;
    const center = d.tops[d.index] + d.heights[d.index] / 2 + delta;
    let cnt = 0;
    for (let i = 0; i < items.length; i++) {
      if (i === d.index) continue;
      if (d.tops[i] + d.heights[i] / 2 < center) cnt++;
    }
    const nd: DragState = { ...d, delta, target: cnt };
    dragRef.current = nd; setDrag(nd);
  };
  const end = () => {
    const d = dragRef.current;
    dragRef.current = null;
    if (d && d.target !== d.index) {
      const arr = items.slice();
      const [moved] = arr.splice(d.index, 1);
      arr.splice(d.target, 0, moved);
      const ids = arr.map(getKey);
      // defer parent setState out of the event/render flush; drag state is
      // cleared by the effect below once new `items` arrive (avoids a flash)
      queueMicrotask(() => onReorder(ids));
    } else {
      setDrag(null);
    }
  };
  // clear drag once the reordered items propagate down (or any items change)
  React.useEffect(() => { dragRef.current = null; setDrag(null); }, [items]);
  const shiftFor = (i: number) => {
    if (!drag || i === drag.index) return 0;
    const { index, target, heights } = drag;
    if (target > index && i > index && i <= target) return -heights[index];
    if (target < index && i >= target && i < index) return heights[index];
    return 0;
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {items.map((it, i) => {
        const dragging = !!drag && i === drag.index;
        return (
          <div key={getKey(it)} ref={(el) => { if (el) itemRefs.current[getKey(it)] = el; }}
            style={{
              position: 'relative',
              zIndex: dragging ? 20 : 1,
              transform: dragging ? `translateY(${drag!.delta}px) scale(1.015)` : `translateY(${shiftFor(i)}px)`,
              transition: dragging ? 'none' : 'transform 0.2s cubic-bezier(0.32,0.72,0,1)',
              boxShadow: dragging ? 'var(--shadow-pop)' : 'none',
              borderRadius: dragging ? 'var(--radius)' : 0,
              background: dragging ? 'var(--surface)' : 'transparent',
            }}>
            {renderItem(it, {
              onPointerDown: (e) => begin(e, i),
              onPointerMove: move,
              onPointerUp: end,
              onPointerCancel: end,
              style: { touchAction: 'none', cursor: 'grab' },
            }, dragging)}
          </div>
        );
      })}
    </div>
  );
}

// ── tab bar ──
export function TabBar({ tab, setTab }: { tab: string; setTab: (tab: string) => void }) {
  const tabs = [
    { id: 'entry', label: 'Journal', icon: Icon.entry },
    { id: 'analytics', label: 'Insights', icon: Icon.analytics },
    { id: 'settings', label: 'Manage', icon: Icon.settings },
  ];
  return (
    <div className="tabbar" style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
      {tabs.map((t) => {
        const I = t.icon;
        return (
          <button key={t.id} className="ih-btn tab" data-testid={`tab-${t.id}`} data-active={tab === t.id} onClick={() => setTab(t.id)}>
            <I />
            <span className="tab-label">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── responsive helper ──
export function useMedia(query: string): boolean {
  const [match, setMatch] = React.useState<boolean>(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatch(e.matches);
    setMatch(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return match;
}

// ── desktop sidebar navigation ──
export function Sidebar({ tab, setTab, openGuide }: { tab: string; setTab: (tab: string) => void; openGuide: () => void }) {
  const items = [
    { id: 'entry', label: 'Journal', icon: Icon.entry },
    { id: 'analytics', label: 'Insights', icon: Icon.analytics },
    { id: 'settings', label: 'Manage', icon: Icon.settings },
  ];
  return (
    <aside className="app-sidebar">
      <div className="brand">
        <svg viewBox="0 0 40 40" width="34" height="34" style={{ flexShrink: 0 }}>
          <circle cx="20" cy="17" r="8.2" fill="var(--c-clay)" />
          <line x1="6" y1="27" x2="34" y2="27" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="12" y1="32" x2="28" y2="32" stroke="var(--ink)" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="brand-name">Intention<br />Horizon</div>
      </div>
      <nav className="nav">
        {items.map((t) => {
          const I = t.icon;
          return (
            <button key={t.id} className="ih-btn nav-item" data-testid={`tab-${t.id}`} data-active={tab === t.id} onClick={() => setTab(t.id)}>
              <I /><span>{t.label}</span>
            </button>
          );
        })}
        <button className="ih-btn nav-item" onClick={openGuide}>
          <Icon.help /><span>User guide</span>
        </button>
      </nav>
      <div className="sidebar-foot">Saved on this device.<br />Works offline.</div>
    </aside>
  );
}

// ── screen header (large title + optional right slot) ──
export function ScreenHeader({ title, subtitle, right }: {
  title: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode;
}) {
  return (
    <div style={{ padding: '8px 20px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 4 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}
