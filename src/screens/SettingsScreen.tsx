/* ───────────────────────────────────────────────
   SettingsScreen.tsx — manage categories & intentions
   ─────────────────────────────────────────────── */
import React from 'react';
import * as IH from '../data/store';
import { Icon } from '../components/Icon';
import { Sheet, PrimaryButton, DragList, ScreenHeader, type DragHandleProps } from '../components/ui';
import { getStoredConsent, setConsent } from '../consent';

function ColorPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {IH.PALETTE.map((p) => {
        const active = p.id === value;
        return (
          <button key={p.id} className="ih-btn" onClick={() => onChange(p.id)} style={{
            width: 36, height: 36, borderRadius: 99, background: p.var,
            display: 'grid', placeItems: 'center',
            boxShadow: active ? `0 0 0 2.5px var(--surface), 0 0 0 4.5px ${p.var}` : 'none',
            transition: 'transform 0.12s ease',
          }}>
            {active && <Icon.check style={{ width: 17, height: 17, color: '#fff' }} />}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 7, letterSpacing: '0.01em' }}>{label}</div>
      {children}
    </div>
  );
}

function Switch({ on, onToggle, testid }: { on: boolean; onToggle: () => void; testid?: string }) {
  return (
    <button className="ih-btn" data-testid={testid} onClick={onToggle} style={{
      width: 50, height: 30, borderRadius: 99, padding: 3, flexShrink: 0,
      background: on ? 'var(--c-moss)' : 'var(--line)', transition: 'background 0.2s ease',
      display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start',
    }}>
      <div style={{ width: 24, height: 24, borderRadius: 99, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'all 0.2s var(--ease-spring)' }} />
    </button>
  );
}

function Stepper({ label, value, min, max, onChange, testid }: {
  label: string; value: number; min: number; max: number; onChange: (value: number) => void; testid?: string;
}) {
  const btn = (txt: string, fn: () => void, enabled: boolean, tid?: string) => (
    <button className="ih-btn" data-testid={tid} onClick={() => enabled && fn()} style={{
      width: 34, height: 34, borderRadius: 9, background: 'var(--bg-2)', fontSize: 18, fontWeight: 600,
      color: enabled ? 'var(--ink-2)' : 'var(--ink-4)', display: 'grid', placeItems: 'center',
      border: '1px solid var(--line-soft)',
    }}>{txt}</button>
  );
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        {btn('–', () => onChange(Math.max(min, value - 1)), value > min, testid ? `${testid}-dec` : undefined)}
        <span className="num" data-testid={testid ? `${testid}-value` : undefined} style={{ fontSize: 18, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{value}</span>
        {btn('+', () => onChange(Math.min(max, value + 1)), value < max, testid ? `${testid}-inc` : undefined)}
      </div>
    </div>
  );
}

function IntentionEditor({ open, onClose, editing, categories, onSaved }: {
  open: boolean; onClose: () => void; editing: IH.Intention | null; categories: IH.Category[]; onSaved: () => void;
}) {
  const blank: IH.IntentionInput = { name: '', categoryId: categories[0]?.id || null, color: 'clay', targetEnabled: false, targetCompletions: 3, targetPeriodDays: 7 };
  const [form, setForm] = React.useState<IH.IntentionInput>(blank);
  // Raw text for the period field so it can be blanked mid-edit; clamped on blur.
  const [periodText, setPeriodText] = React.useState(String(blank.targetPeriodDays));
  React.useEffect(() => {
    const next = editing ? { ...editing } : blank;
    setForm(next);
    setPeriodText(String(next.targetPeriodDays));
  }, [open, editing]);
  const set = (patch: Partial<IH.IntentionInput>) => setForm((f) => ({ ...f, ...patch }));
  const valid = form.name.trim().length > 0;

  const save = () => {
    if (!valid) return;
    if (editing) IH.updateIntention(editing.id, form); else IH.addIntention(form);
    onSaved(); onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Edit intention' : 'New intention'}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          {editing && (
            <button className="ih-btn" data-testid="delete-intention" onClick={() => { IH.deleteIntention(editing.id); onSaved(); onClose(); }}
              style={{ width: 52, borderRadius: 14, background: 'var(--bg-2)', color: 'var(--c-rose)', display: 'grid', placeItems: 'center', border: '1px solid var(--line-soft)' }}>
              <Icon.trash />
            </button>
          )}
          <div style={{ flex: 1 }}><PrimaryButton onClick={save} disabled={!valid} color={IH.colorVar(form.color)} testid="save-intention">{editing ? 'Save changes' : 'Create intention'}</PrimaryButton></div>
        </div>
      }>
      <Field label="Name">
        <input className="ih-input" data-testid="intention-name" value={form.name} placeholder="e.g. Morning run"
          onChange={(e) => set({ name: e.target.value })} autoFocus />
      </Field>
      <Field label="Category">
        <select className="ih-select" value={form.categoryId || ''} onChange={(e) => set({ categoryId: e.target.value || null })}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          <option value="">Uncategorized</option>
        </select>
      </Field>
      <Field label="Color">
        <ColorPicker value={form.color} onChange={(c) => set({ color: c })} />
      </Field>

      <div style={{ marginTop: 18, background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--line-soft)', overflow: 'hidden' }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 600 }}>Set a target</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>How many times within a period</div>
          </div>
          <Switch on={form.targetEnabled} onToggle={() => set({ targetEnabled: !form.targetEnabled })} testid="targets-switch" />
        </label>
        {form.targetEnabled && (
          <div style={{ display: 'flex', gap: 12, padding: '0 16px 16px', alignItems: 'flex-end' }}>
            <Stepper label="Completions" value={form.targetCompletions} min={1} max={99} onChange={(v) => set({ targetCompletions: v })} testid="target-completions" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginBottom: 6, fontWeight: 600 }}>Period (days)</div>
              <input className="ih-input num" data-testid="target-period" type="number" inputMode="numeric" min={1}
                value={periodText}
                onChange={(e) => {
                  setPeriodText(e.target.value);
                  const n = Math.floor(Number(e.target.value));
                  if (n >= 1) set({ targetPeriodDays: n });
                }}
                onBlur={() => {
                  const n = Math.max(1, Math.floor(Number(periodText) || 1));
                  set({ targetPeriodDays: n });
                  setPeriodText(String(n));
                }} />
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}

function CategoryEditor({ open, onClose, editing, onSaved }: {
  open: boolean; onClose: () => void; editing: IH.Category | null; onSaved: () => void;
}) {
  const [name, setName] = React.useState('');
  React.useEffect(() => { setName(editing ? editing.name : ''); }, [open, editing]);
  const valid = name.trim().length > 0;
  const save = () => { if (!valid) return; if (editing) IH.updateCategory(editing.id, name.trim()); else IH.addCategory(name.trim()); onSaved(); onClose(); };
  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Edit category' : 'New category'}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          {editing && (
            <button className="ih-btn" data-testid="delete-category" onClick={() => { IH.deleteCategory(editing.id); onSaved(); onClose(); }}
              style={{ width: 52, borderRadius: 14, background: 'var(--bg-2)', color: 'var(--c-rose)', display: 'grid', placeItems: 'center', border: '1px solid var(--line-soft)' }}>
              <Icon.trash />
            </button>
          )}
          <div style={{ flex: 1 }}><PrimaryButton onClick={save} disabled={!valid} testid="save-category">{editing ? 'Save' : 'Create category'}</PrimaryButton></div>
        </div>
      }>
      <Field label="Name">
        <input className="ih-input" data-testid="category-name" value={name} placeholder="e.g. Wellbeing" onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      {editing && <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>Deleting a category keeps its intentions and moves them to Uncategorized.</div>}
    </Sheet>
  );
}

function RowButton({ label, onClick, icon, danger, testid }: {
  label: string; onClick: () => void; icon?: React.ReactNode; danger?: boolean; testid?: string;
}) {
  return (
    <button className="ih-btn" data-testid={testid} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 'var(--radius)',
      background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--line-soft)',
      fontSize: 15, fontWeight: 600, color: danger ? 'var(--c-rose)' : 'var(--ink-2)',
    }}>
      {icon}{label}
    </button>
  );
}

type Group = { id: string; name: string };

function DataSourceSwitcher({ bump }: { bump: () => void }) {
  const active = IH.getDataSource();
  const opts: { id: IH.DataSource; label: string }[] = [
    { id: 'mock', label: 'Mock' },
    { id: 'real', label: 'Real' },
  ];
  const pick = (src: IH.DataSource) => { if (src !== active) IH.switchDataSource(src).then(bump); };
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--line-soft)', padding: '12px 16px' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-2)' }}>Data source</div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>Mock is sample data; Real is your own. Kept separate.</div>
      <div style={{ display: 'flex', gap: 4, marginTop: 11, padding: 3, background: 'var(--bg-2)', borderRadius: 11 }}>
        {opts.map((o) => {
          const on = o.id === active;
          return (
            <button key={o.id} className="ih-btn" onClick={() => pick(o.id)} style={{
              flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 14, fontWeight: 600,
              background: on ? 'var(--surface)' : 'transparent', color: on ? 'var(--ink)' : 'var(--ink-3)',
              boxShadow: on ? 'var(--shadow-card)' : 'none', transition: 'all 0.15s ease',
            }}>{o.label}</button>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsConsent() {
  // null (undecided) is treated as off, matching the default-denied consent state.
  const [on, setOn] = React.useState(() => getStoredConsent() === 'granted');
  const toggle = () => { const next = !on; setOn(next); setConsent(next ? 'granted' : 'denied'); };
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--line-soft)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-2)' }}>Usage analytics</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>Anonymous analytics cookies to improve the app. Your intentions never leave this device.</div>
      </div>
      <Switch on={on} onToggle={toggle} testid="analytics-consent" />
    </div>
  );
}

export function SettingsScreen({ bump, openGuide }: { version: number; bump: () => void; openGuide: () => void }) {
  const s = IH.load();
  const [intentEditor, setIntentEditor] = React.useState<{ open: boolean; editing: IH.Intention | null }>({ open: false, editing: null });
  const [catEditor, setCatEditor] = React.useState<{ open: boolean; editing: IH.Category | null }>({ open: false, editing: null });

  const intentsByCat: Record<string, IH.Intention[]> = {};
  s.intentions.forEach((it) => { const k = it.categoryId || '_none'; (intentsByCat[k] = intentsByCat[k] || []).push(it); });
  const hasNone = !!intentsByCat['_none'];

  const openIntent = (it: IH.Intention) => setIntentEditor({ open: true, editing: it });

  const Section = ({ g, handle, noDrag }: { g: Group; handle?: DragHandleProps; noDrag?: boolean }) => {
    const rows = intentsByCat[g.id] || [];
    return (
      <div style={{ marginBottom: 18 }}>
        <div data-testid="category-section" data-category-name={g.name} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 22px 7px' }}>
          {!noDrag && (
            <span {...handle!} style={{ ...handle!.style, color: 'var(--ink-4)', display: 'flex', marginLeft: -4, padding: '2px 2px' }}><Icon.grip /></span>
          )}
          <span style={{ flex: 1, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{g.name}</span>
          {g.id !== '_none' && (
            <button className="ih-btn" data-testid="category-edit" data-category-name={g.name} onClick={() => setCatEditor({ open: true, editing: g })} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)' }}>Edit</button>
          )}
        </div>
        <div style={{ background: 'var(--surface)', margin: '0 14px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
          {rows.length === 0 && <div style={{ padding: '14px 16px', fontSize: 13.5, color: 'var(--ink-4)' }}>No intentions</div>}
          <DragList items={rows} getKey={(it) => it.id}
            onReorder={(ids) => { IH.reorderIntentions(g.id, ids); bump(); }}
            renderItem={(it, h, dragging) => {
              const idx = rows.indexOf(it); const last = idx === rows.length - 1;
              return (
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', borderBottom: (last || dragging) ? 'none' : '1px solid var(--line-soft)' }}>
                  <span {...h} style={{ ...h.style, color: 'var(--ink-4)', display: 'flex', padding: '14px 4px 14px 12px' }}><Icon.grip /></span>
                  <button className="ih-btn" data-testid="settings-intention" data-intention-name={it.name} onClick={() => openIntent(it)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 11, padding: '13px 16px 13px 4px', textAlign: 'left', minWidth: 0 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 5, background: IH.colorVar(it.color), flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 15.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</span>
                    {it.targetEnabled && (
                      <span className="num" data-testid="target-badge" data-intention-name={it.name} style={{ fontSize: 12, color: 'var(--ink-3)', background: 'var(--bg-2)', padding: '3px 8px', borderRadius: 7 }}>{it.targetCompletions}/{it.targetPeriodDays}d</span>
                    )}
                    <Icon.chevR style={{ color: 'var(--ink-4)', width: 16, height: 16 }} />
                  </button>
                </div>
              );
            }} />
        </div>
      </div>
    );
  };

  return (
    <div className="ih-scroll fade-up" data-testid="screen-settings" style={{ paddingBottom: 28 }}>
      <ScreenHeader title="Manage" subtitle={`${s.intentions.length} intentions · ${s.categories.length} categories`} right={
        <button className="ih-btn" data-testid="add-intention" onClick={() => setIntentEditor({ open: true, editing: null })} style={{
          width: 40, height: 40, borderRadius: 12, background: 'var(--ink)', color: 'var(--bg)',
          display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-card)',
        }}><Icon.plus /></button>
      } />

      <DragList items={s.categories} getKey={(c) => c.id}
        onReorder={(ids) => { IH.reorderCategories(ids); bump(); }}
        renderItem={(g, handle) => <Section g={g} handle={handle} />} />
      {hasNone && <Section g={{ id: '_none', name: 'Uncategorized' }} noDrag />}

      <div style={{ padding: '4px 14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {IH.mockEnabled() && <DataSourceSwitcher bump={bump} />}
        <AnalyticsConsent />
        <RowButton label="User guide" onClick={openGuide} icon={<Icon.help />} />
        <RowButton label="Add category" testid="add-category" onClick={() => setCatEditor({ open: true, editing: null })} icon={<Icon.plus style={{ width: 18, height: 18 }} />} />
        <RowButton label="Export data as CSV" onClick={() => IH.downloadCSV()} icon={<Icon.download />} />
        {IH.mockEnabled() && IH.getDataSource() === 'mock' ? (
          <RowButton label="Reset to sample data" onClick={() => { if (confirm('Reset mock data to the seeded sample set?')) { IH.resetSeed(); bump(); } }} icon={undefined} danger />
        ) : (
          <RowButton label="Clear all data" onClick={() => { if (confirm('Clear all data in the Real source? This cannot be undone.')) { IH.resetSeed(); bump(); } }} icon={undefined} danger />
        )}
      </div>

      <IntentionEditor open={intentEditor.open} editing={intentEditor.editing} categories={s.categories}
        onClose={() => setIntentEditor({ open: false, editing: null })} onSaved={bump} />
      <CategoryEditor open={catEditor.open} editing={catEditor.editing}
        onClose={() => setCatEditor({ open: false, editing: null })} onSaved={bump} />
    </div>
  );
}
