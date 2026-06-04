/* ───────────────────────────────────────────────
   settings.jsx — manage categories & intentions
   ─────────────────────────────────────────────── */

function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {IH.PALETTE.map(p => {
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

function IntentionEditor({ open, onClose, editing, categories, onSaved }) {
  const blank = { name: '', categoryId: categories[0]?.id || null, color: 'clay', targetEnabled: false, target7: 3, target30: 12 };
  const [form, setForm] = React.useState(blank);
  React.useEffect(() => { setForm(editing ? { ...editing } : blank); }, [open, editing]);
  const set = (patch) => setForm(f => ({ ...f, ...patch }));
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
            <button className="ih-btn" onClick={() => { IH.deleteIntention(editing.id); onSaved(); onClose(); }}
              style={{ width: 52, borderRadius: 14, background: 'var(--bg-2)', color: 'var(--c-rose)', display: 'grid', placeItems: 'center', border: '1px solid var(--line-soft)' }}>
              <Icon.trash />
            </button>
          )}
          <div style={{ flex: 1 }}><PrimaryButton onClick={save} disabled={!valid} color={IH.colorVar(form.color)}>{editing ? 'Save changes' : 'Create intention'}</PrimaryButton></div>
        </div>
      }>
      <Field label="Name">
        <input className="ih-input" value={form.name} placeholder="e.g. Morning run"
          onChange={(e) => set({ name: e.target.value })} autoFocus />
      </Field>
      <Field label="Category">
        <select className="ih-select" value={form.categoryId || ''} onChange={(e) => set({ categoryId: e.target.value || null })}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          <option value="">Uncategorized</option>
        </select>
      </Field>
      <Field label="Color">
        <ColorPicker value={form.color} onChange={(c) => set({ color: c })} />
      </Field>

      <div style={{ marginTop: 18, background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--line-soft)', overflow: 'hidden' }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 600 }}>Set targets</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>Track 7 & 30 day goals</div>
          </div>
          <Switch on={form.targetEnabled} onToggle={() => set({ targetEnabled: !form.targetEnabled })} />
        </label>
        {form.targetEnabled && (
          <div style={{ display: 'flex', gap: 12, padding: '0 16px 16px' }}>
            <Stepper label="7-day target" value={form.target7} min={1} max={7} onChange={(v) => set({ target7: v })} />
            <Stepper label="30-day target" value={form.target30} min={1} max={30} onChange={(v) => set({ target30: v })} />
          </div>
        )}
      </div>
    </Sheet>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 7, letterSpacing: '0.01em' }}>{label}</div>
      {children}
    </div>
  );
}

function Switch({ on, onToggle }) {
  return (
    <button className="ih-btn" onClick={onToggle} style={{
      width: 50, height: 30, borderRadius: 99, padding: 3, flexShrink: 0,
      background: on ? 'var(--c-moss)' : 'var(--line)', transition: 'background 0.2s ease',
      display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start',
    }}>
      <div style={{ width: 24, height: 24, borderRadius: 99, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'all 0.2s var(--ease-spring)' }} />
    </button>
  );
}

function Stepper({ label, value, min, max, onChange }) {
  const btn = (txt, fn, enabled) => (
    <button className="ih-btn" onClick={() => enabled && fn()} style={{
      width: 34, height: 34, borderRadius: 9, background: 'var(--bg-2)', fontSize: 18, fontWeight: 600,
      color: enabled ? 'var(--ink-2)' : 'var(--ink-4)', display: 'grid', placeItems: 'center',
      border: '1px solid var(--line-soft)',
    }}>{txt}</button>
  );
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        {btn('–', () => onChange(Math.max(min, value - 1)), value > min)}
        <span className="num" style={{ fontSize: 18, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{value}</span>
        {btn('+', () => onChange(Math.min(max, value + 1)), value < max)}
      </div>
    </div>
  );
}

function CategoryEditor({ open, onClose, editing, onSaved }) {
  const [name, setName] = React.useState('');
  React.useEffect(() => { setName(editing ? editing.name : ''); }, [open, editing]);
  const valid = name.trim().length > 0;
  const save = () => { if (!valid) return; if (editing) IH.updateCategory(editing.id, name.trim()); else IH.addCategory(name.trim()); onSaved(); onClose(); };
  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Edit category' : 'New category'}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          {editing && (
            <button className="ih-btn" onClick={() => { IH.deleteCategory(editing.id); onSaved(); onClose(); }}
              style={{ width: 52, borderRadius: 14, background: 'var(--bg-2)', color: 'var(--c-rose)', display: 'grid', placeItems: 'center', border: '1px solid var(--line-soft)' }}>
              <Icon.trash />
            </button>
          )}
          <div style={{ flex: 1 }}><PrimaryButton onClick={save} disabled={!valid}>{editing ? 'Save' : 'Create category'}</PrimaryButton></div>
        </div>
      }>
      <Field label="Name">
        <input className="ih-input" value={name} placeholder="e.g. Wellbeing" onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      {editing && <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>Deleting a category keeps its intentions and moves them to Uncategorized.</div>}
    </Sheet>
  );
}

function SettingsScreen({ version, bump, openGuide }) {
  const s = IH.load();
  const [intentEditor, setIntentEditor] = React.useState({ open: false, editing: null });
  const [catEditor, setCatEditor] = React.useState({ open: false, editing: null });

  const intentsByCat = {};
  s.intentions.forEach(it => { const k = it.categoryId || '_none'; (intentsByCat[k] = intentsByCat[k] || []).push(it); });
  const hasNone = !!intentsByCat['_none'];

  const openIntent = (it) => setIntentEditor({ open: true, editing: it });

  const Section = ({ g, handle, noDrag }) => {
    const rows = intentsByCat[g.id] || [];
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 22px 7px' }}>
          {!noDrag && (
            <span {...handle} style={{ ...handle.style, color: 'var(--ink-4)', display: 'flex', marginLeft: -4, padding: '2px 2px' }}><Icon.grip /></span>
          )}
          <span style={{ flex: 1, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{g.name}</span>
          {g.id !== '_none' && (
            <button className="ih-btn" onClick={() => setCatEditor({ open: true, editing: g })} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)' }}>Edit</button>
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
                  <button className="ih-btn" onClick={() => openIntent(it)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 11, padding: '13px 16px 13px 4px', textAlign: 'left', minWidth: 0 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 5, background: IH.colorVar(it.color), flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 15.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</span>
                    {it.targetEnabled && (
                      <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)', background: 'var(--bg-2)', padding: '3px 8px', borderRadius: 7 }}>{it.target7}/wk</span>
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
    <div className="ih-scroll fade-up" style={{ paddingBottom: 28 }}>
      <ScreenHeader title="Manage" subtitle={`${s.intentions.length} intentions · ${s.categories.length} categories`} right={
        <button className="ih-btn" onClick={() => setIntentEditor({ open: true, editing: null })} style={{
          width: 40, height: 40, borderRadius: 12, background: 'var(--ink)', color: 'var(--bg)',
          display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-card)',
        }}><Icon.plus /></button>
      } />

      <DragList items={s.categories} getKey={(c) => c.id}
        onReorder={(ids) => { IH.reorderCategories(ids); bump(); }}
        renderItem={(g, handle) => <Section g={g} handle={handle} />} />
      {hasNone && <Section g={{ id: '_none', name: 'Uncategorized' }} noDrag />}

      <div style={{ padding: '4px 14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <RowButton label="User guide" onClick={openGuide} icon={<Icon.help />} />
        <RowButton label="Add category" onClick={() => setCatEditor({ open: true, editing: null })} icon={<Icon.plus style={{ width: 18, height: 18 }} />} />
        <RowButton label="Export data as CSV" onClick={() => IH.downloadCSV()} icon={<Icon.download />} />
        <RowButton label="Reset to sample data" onClick={() => { if (confirm('Reset all data to the seeded sample set?')) { IH.resetSeed(); bump(); } }} danger />
      </div>

      <IntentionEditor open={intentEditor.open} editing={intentEditor.editing} categories={s.categories}
        onClose={() => setIntentEditor({ open: false, editing: null })} onSaved={bump} />
      <CategoryEditor open={catEditor.open} editing={catEditor.editing}
        onClose={() => setCatEditor({ open: false, editing: null })} onSaved={bump} />
    </div>
  );
}

function RowButton({ label, onClick, icon, danger }) {
  return (
    <button className="ih-btn" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 'var(--radius)',
      background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--line-soft)',
      fontSize: 15, fontWeight: 600, color: danger ? 'var(--c-rose)' : 'var(--ink-2)',
    }}>
      {icon}{label}
    </button>
  );
}

Object.assign(window, { SettingsScreen });
