/* ───────────────────────────────────────────────
   components.jsx — shared UI primitives
   ─────────────────────────────────────────────── */

// ── icons (simple stroke set) ──
const Icon = {
  entry: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.4 12.1l2.5 2.5 4.6-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  analytics: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="4" y="13" width="4" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="10" y="8" width="4" height="12" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="16" y="4" width="4" height="16" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  settings: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M5 8h14M5 16h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="9" cy="8" r="2.4" fill="var(--bg)" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="15" cy="16" r="2.4" fill="var(--bg)" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  chevL: (p) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  chevR: (p) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  plus: (p) => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>),
  close: (p) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>),
  check: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12.5l4.2 4.3L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  trash: (p) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  download: (p) => (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  grip: (p) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><circle cx="9" cy="6" r="1.5" fill="currentColor" /><circle cx="15" cy="6" r="1.5" fill="currentColor" /><circle cx="9" cy="12" r="1.5" fill="currentColor" /><circle cx="15" cy="12" r="1.5" fill="currentColor" /><circle cx="9" cy="18" r="1.5" fill="currentColor" /><circle cx="15" cy="18" r="1.5" fill="currentColor" /></svg>),
  flame: (p) => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3c.5 3-2 4.2-2 6.8 0 1 .6 1.8 1.4 1.8 1.2 0 1.6-1.2 1.3-2.6 1.7 1 2.8 2.9 2.8 5.1A5.5 5.5 0 016 14.4c0-2 1-3.4 2.2-4.7C10 7.8 11.8 6 12 3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>),
  help: (p) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" /><path d="M9.4 9.4c0-1.5 1.2-2.4 2.6-2.4s2.5.9 2.5 2.3c0 1.9-2.4 2-2.4 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="12" cy="16.6" r="1.05" fill="currentColor" /></svg>),
  arrowUp: (p) => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 19V6m0 0l-6 6m6-6l6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>),
};

// ── animated circle toggle ──
function CircleToggle({ on, color = 'var(--ink)', onToggle, size = 34 }) {
  return (
    <div
      className="tog"
      data-on={on ? 'true' : 'false'}
      style={{ width: size, height: size, '--ring': 'var(--line)', '--fill': color }}
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

// ── trailing stat: 7d / 30d count with target status colour ──
// "Under = faint, on/above = stronger fill"
function Stat({ count, target, label }) {
  const status = (target == null) ? null : (count < target ? 'under' : count === target ? 'on' : 'above');
  let valColor = 'var(--ink)';
  if (status === 'under') valColor = 'var(--ink-4)';
  else if (status === 'on') valColor = 'var(--ink)';
  else if (status === 'above') valColor = 'var(--ink)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 38 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <span className="num" style={{ fontSize: 17, fontWeight: 600, color: valColor, lineHeight: 1 }}>{count}</span>
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
function MiniHistory({ intentionId, color, endDate }) {
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
function Segmented({ options, value, onChange, small }) {
  return (
    <div style={{
      display: 'flex', background: 'var(--bg-2)', borderRadius: 11, padding: 3, gap: 2,
      border: '1px solid var(--line-soft)',
    }}>
      {options.map(o => {
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
function Sheet({ open, onClose, title, children, footer }) {
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

function PrimaryButton({ children, onClick, color = 'var(--ink)', disabled }) {
  return (
    <button className="ih-btn" onClick={onClick} disabled={disabled} style={{
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
function DragList({ items, getKey, renderItem, onReorder }) {
  const [drag, setDrag] = React.useState(null); // {index, target, delta, tops, heights}
  const dragRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const itemRefs = React.useRef({});

  const begin = (e, index) => {
    const c = containerRef.current;
    if (!c) return;
    const cTop = c.getBoundingClientRect().top;
    const tops = [], heights = [];
    items.forEach((it) => {
      const n = itemRefs.current[getKey(it)];
      const r = n.getBoundingClientRect();
      tops.push(r.top - cTop); heights.push(r.height);
    });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    const nd = { index, target: index, startY: e.clientY, delta: 0, tops, heights };
    dragRef.current = nd; setDrag(nd);
  };
  const move = (e) => {
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
    const nd = { ...d, delta, target: cnt };
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
  const shiftFor = (i) => {
    if (!drag || i === drag.index) return 0;
    const { index, target, heights } = drag;
    if (target > index && i > index && i <= target) return -heights[index];
    if (target < index && i >= target && i < index) return heights[index];
    return 0;
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {items.map((it, i) => {
        const dragging = drag && i === drag.index;
        return (
          <div key={getKey(it)} ref={(el) => { if (el) itemRefs.current[getKey(it)] = el; }}
            style={{
              position: 'relative',
              zIndex: dragging ? 20 : 1,
              transform: dragging ? `translateY(${drag.delta}px) scale(1.015)` : `translateY(${shiftFor(i)}px)`,
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
function TabBar({ tab, setTab }) {
  const tabs = [
    { id: 'entry', label: 'Today', icon: Icon.entry },
    { id: 'analytics', label: 'Insights', icon: Icon.analytics },
    { id: 'settings', label: 'Manage', icon: Icon.settings },
  ];
  return (
    <div className="tabbar" style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
      {tabs.map(t => {
        const I = t.icon;
        return (
          <button key={t.id} className="ih-btn tab" data-active={tab === t.id} onClick={() => setTab(t.id)}>
            <I />
            <span className="tab-label">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── responsive helper ──
function useMedia(query) {
  const [match, setMatch] = React.useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatch(e.matches);
    setMatch(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return match;
}

// ── desktop sidebar navigation ──
function Sidebar({ tab, setTab, openGuide }) {
  const items = [
    { id: 'entry', label: 'Today', icon: Icon.entry },
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
        {items.map(t => {
          const I = t.icon;
          return (
            <button key={t.id} className="ih-btn nav-item" data-active={tab === t.id} onClick={() => setTab(t.id)}>
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
function ScreenHeader({ title, subtitle, right }) {
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

Object.assign(window, {
  Icon, CircleToggle, Stat, MiniHistory, Segmented, Sheet, PrimaryButton, TabBar, ScreenHeader, DragList, useMedia, Sidebar,
});
