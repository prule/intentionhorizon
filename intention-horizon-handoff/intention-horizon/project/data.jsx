/* ───────────────────────────────────────────────
   data.jsx — storage, seed, compute helpers
   Prototype persistence via localStorage (swappable for IndexedDB).
   Exposes everything on window.IH
   ─────────────────────────────────────────────── */
(function () {
  const KEY = 'intention-horizon-v2';
  const SEED_DAYS = 92; // history depth for a lively heatmap (Entry strip still shows 30)

  // ── date utils ──
  const pad = (n) => String(n).padStart(2, '0');
  const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseKey = (k) => { const [y, m, dd] = k.split('-').map(Number); return new Date(y, m - 1, dd); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); x.setHours(0,0,0,0); return x; };
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
  const today = () => startOfDay(new Date());
  const sameKey = (a, b) => dateKey(a) === dateKey(b);
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function fmtDay(d) {
    const t = today();
    if (sameKey(d, t)) return 'Today';
    if (sameKey(d, addDays(t, -1))) return 'Yesterday';
    return `${WD[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}`;
  }

  // ── palette (matches styles.css accent family) ──
  const PALETTE = [
    { id: 'clay',  var: 'var(--c-clay)',  hex: '#c0714f' },
    { id: 'amber', var: 'var(--c-amber)', hex: '#c39327' },
    { id: 'moss',  var: 'var(--c-moss)',  hex: '#6f8a3f' },
    { id: 'sage',  var: 'var(--c-sage)',  hex: '#5a9070' },
    { id: 'teal',  var: 'var(--c-teal)',  hex: '#3e8fa0' },
    { id: 'blue',  var: 'var(--c-blue)',  hex: '#5a82c8' },
    { id: 'plum',  var: 'var(--c-plum)',  hex: '#9a6aae' },
    { id: 'rose',  var: 'var(--c-rose)',  hex: '#c46a6f' },
  ];
  const colorVar = (id) => (PALETTE.find(p => p.id === id) || PALETTE[0]).var;

  // ── seed ──
  function buildSeed() {
    const cats = [
      { id: 'c_move', name: 'Movement' },
      { id: 'c_mind', name: 'Mind' },
      { id: 'c_money', name: 'Finance' },
      { id: 'c_connect', name: 'Connection' },
    ];
    // freq = daily completion probability used to fabricate believable history
    const intents = [
      { id: 'i_work',  name: 'Workout',          categoryId: 'c_move',   color: 'clay',  targetEnabled: true,  target7: 4, target30: 16, freq: 0.55 },
      { id: 'i_walk',  name: 'Walk 8k steps',    categoryId: 'c_move',   color: 'moss',  targetEnabled: true,  target7: 6, target30: 24, freq: 0.78 },
      { id: 'i_stretch', name: 'Stretch',        categoryId: 'c_move',   color: 'amber', targetEnabled: false, target7: 3, target30: 12, freq: 0.4 },
      { id: 'i_med',   name: 'Meditate',         categoryId: 'c_mind',   color: 'teal',  targetEnabled: true,  target7: 5, target30: 20, freq: 0.6 },
      { id: 'i_read',  name: 'Read 20 min',      categoryId: 'c_mind',   color: 'blue',  targetEnabled: true,  target7: 4, target30: 16, freq: 0.5 },
      { id: 'i_phone', name: 'No phone in bed',  categoryId: 'c_mind',   color: 'plum',  targetEnabled: false, target7: 5, target30: 20, freq: 0.45 },
      { id: 'i_invest', name: 'Invest',          categoryId: 'c_money',  color: 'sage',  targetEnabled: true,  target7: 1, target30: 4,  freq: 0.16 },
      { id: 'i_nospend', name: 'No-spend day',   categoryId: 'c_money',  color: 'rose',  targetEnabled: true,  target7: 3, target30: 12, freq: 0.42 },
      { id: 'i_call',  name: 'Call someone',     categoryId: 'c_connect', color: 'amber', targetEnabled: false, target7: 2, target30: 8, freq: 0.3 },
    ];

    const completions = {}; // intentionId -> Set-like map of dateKey:true
    const t = today();
    intents.forEach((it) => {
      const m = {};
      // gentle upward drift over time so progress looks like it's improving
      for (let i = 0; i < SEED_DAYS; i++) {
        const d = addDays(t, -i);
        const drift = (1 - i / SEED_DAYS) * 0.14;   // recent days a touch stronger
        const boost = i < 7 ? 0.06 : 0;
        if (Math.random() < it.freq + drift + boost) m[dateKey(d)] = true;
      }
      completions[it.id] = m;
    });

    return {
      version: 1,
      categories: cats,
      intentions: intents.map(({ freq, ...rest }) => rest),
      completions,
    };
  }

  // ── load / save ──
  let state = null;
  function load() {
    if (state) return state;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { state = JSON.parse(raw); return state; }
    } catch (e) { /* ignore */ }
    state = buildSeed();
    save();
    return state;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function resetSeed() { state = buildSeed(); save(); return state; }

  // ── mutations ──
  let _id = 0;
  const uid = (p) => `${p}_${Date.now().toString(36)}${(_id++).toString(36)}`;

  function toggleCompletion(intentionId, key) {
    const s = load();
    if (!s.completions[intentionId]) s.completions[intentionId] = {};
    const m = s.completions[intentionId];
    if (m[key]) delete m[key]; else m[key] = true;
    save();
  }
  function isDone(intentionId, key) {
    const s = load();
    return !!(s.completions[intentionId] && s.completions[intentionId][key]);
  }

  function addCategory(name) { const s = load(); s.categories.push({ id: uid('c'), name }); save(); }
  function updateCategory(id, name) { const s = load(); const c = s.categories.find(c => c.id === id); if (c) c.name = name; save(); }
  function deleteCategory(id) {
    const s = load();
    s.categories = s.categories.filter(c => c.id !== id);
    // orphaned intentions move to no category
    s.intentions.forEach(it => { if (it.categoryId === id) it.categoryId = null; });
    save();
  }

  function addIntention(data) {
    const s = load();
    s.intentions.push({
      id: uid('i'), name: data.name, categoryId: data.categoryId || null,
      color: data.color || 'clay', targetEnabled: !!data.targetEnabled,
      target7: data.target7 ?? 3, target30: data.target30 ?? 12,
    });
    save();
  }
  function updateIntention(id, data) { const s = load(); const it = s.intentions.find(i => i.id === id); if (it) Object.assign(it, data); save(); }
  function deleteIntention(id) { const s = load(); s.intentions = s.intentions.filter(i => i.id !== id); delete s.completions[id]; save(); }

  // reorder intentions WITHIN a category group (categoryKey '_none' for uncategorized)
  function reorderIntentions(categoryKey, orderedIds) {
    const s = load();
    const slots = [];
    s.intentions.forEach((it, idx) => { if ((it.categoryId || '_none') === categoryKey) slots.push(idx); });
    const byId = Object.fromEntries(s.intentions.map(it => [it.id, it]));
    orderedIds.forEach((id, i) => { if (slots[i] != null && byId[id]) s.intentions[slots[i]] = byId[id]; });
    save();
  }
  // reorder whole categories
  function reorderCategories(orderedIds) {
    const s = load();
    const byId = Object.fromEntries(s.categories.map(c => [c.id, c]));
    s.categories = orderedIds.map(id => byId[id]).filter(Boolean);
    save();
  }

  // ── compute ──
  // count completions for intention in trailing window of `days` ending at `endKey` (inclusive)
  function windowCount(intentionId, endDate, days) {
    const s = load();
    const m = s.completions[intentionId];
    if (!m) return 0;
    let n = 0;
    for (let i = 0; i < days; i++) {
      if (m[dateKey(addDays(endDate, -i))]) n++;
    }
    return n;
  }
  // status vs target: 'under' | 'on' | 'above' | null (no target)
  function statusFor(count, target) {
    if (target == null) return null;
    if (count < target) return 'under';
    if (count === target) return 'on';
    return 'above';
  }

  // intentions completed on a given day (array of intention objects)
  function doneOnDay(key) {
    const s = load();
    return s.intentions.filter(it => s.completions[it.id] && s.completions[it.id][key]);
  }

  // For analytics heatmap: for a date, among the relevant (target-enabled) intentions,
  // how many met their 7-day target as-of that date. Returns {count, metRatio, total}.
  function dayMetric(date, filterIntentionId) {
    const s = load();
    const key = dateKey(date);
    let pool = s.intentions;
    if (filterIntentionId) pool = pool.filter(i => i.id === filterIntentionId);

    const count = pool.filter(it => s.completions[it.id] && s.completions[it.id][key]).length;

    const targeted = pool.filter(it => it.targetEnabled);
    let met = 0;
    targeted.forEach(it => {
      const c7 = windowCount(it.id, date, 7);
      if (c7 >= it.target7) met++;
    });
    const metRatio = targeted.length ? met / targeted.length : (count > 0 ? 1 : 0);
    return { count, met, metRatio, targetedTotal: targeted.length };
  }

  // aggregate totals over a range grouped by day/month/year
  function aggregate(filterIntentionId, grouping, rangeDays) {
    const s = load();
    const t = today();
    let pool = s.intentions;
    if (filterIntentionId) pool = pool.filter(i => i.id === filterIntentionId);
    const buckets = {}; // label -> count
    const order = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = addDays(t, -i);
      const k = dateKey(d);
      let label;
      if (grouping === 'day') label = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
      else if (grouping === 'month') label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      else label = `${d.getFullYear()}`;
      if (!(label in buckets)) { buckets[label] = 0; order.push(label); }
      pool.forEach(it => { if (s.completions[it.id] && s.completions[it.id][k]) buckets[label]++; });
    }
    return order.map(l => ({ label: l, value: buckets[l] }));
  }

  // streaks: a day is "met" if (filtered intention done) or (any intention done, when unfiltered)
  function dayMet(key, filterId) {
    const s = load();
    if (filterId) return !!(s.completions[filterId] && s.completions[filterId][key]);
    return s.intentions.some(it => s.completions[it.id] && s.completions[it.id][key]);
  }
  function streaks(filterId) {
    const t = today();
    let current = 0;
    let off = dayMet(dateKey(t), filterId) ? 0 : 1; // grace for today-not-yet-logged
    for (let i = off; i < 400; i++) { if (dayMet(dateKey(addDays(t, -i)), filterId)) current++; else break; }
    let best = 0, run = 0;
    for (let i = 199; i >= 0; i--) { if (dayMet(dateKey(addDays(t, -i)), filterId)) { run++; if (run > best) best = run; } else run = 0; }
    let met30 = 0; for (let i = 0; i < 30; i++) { if (dayMet(dateKey(addDays(t, -i)), filterId)) met30++; }
    return { current, best, rate: Math.round((met30 / 30) * 100) };
  }

  // CSV: long format date,category,intention,completed(1)
  function toCSV() {
    const s = load();
    const catName = (id) => { const c = s.categories.find(c => c.id === id); return c ? c.name : ''; };
    const rows = [['date', 'category', 'intention', 'completed']];
    const t = today();
    // emit a full grid for last 90 days for completeness
    const sorted = [...s.intentions];
    for (let i = 89; i >= 0; i--) {
      const k = dateKey(addDays(t, -i));
      sorted.forEach(it => {
        const done = s.completions[it.id] && s.completions[it.id][k];
        if (done) rows.push([k, catName(it.categoryId), it.name, '1']);
      });
    }
    return rows.map(r => r.map(field => {
      const str = String(field);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')).join('\n');
  }

  function downloadCSV() {
    const csv = toCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intention-horizon-${dateKey(today())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  window.IH = {
    PALETTE, colorVar, MONTHS, WD,
    dateKey, parseKey, addDays, today, fmtDay, sameKey,
    load, save, resetSeed,
    toggleCompletion, isDone,
    addCategory, updateCategory, deleteCategory,
    addIntention, updateIntention, deleteIntention,
    reorderIntentions, reorderCategories,
    windowCount, statusFor, doneOnDay, dayMetric, aggregate,
    dayMet, streaks,
    toCSV, downloadCSV,
  };
})();
