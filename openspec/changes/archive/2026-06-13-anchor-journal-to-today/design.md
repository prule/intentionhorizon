# Design

## Sticky header restructure

Today the screen header and `DateNav` live *inside* the `.ih-scroll` container
(`EntryScreen.tsx`), so they scroll away with the list:

```
BEFORE                          AFTER
┌─ ih-scroll ──────┐      ┌─ screen ─────────────────┐
│  Header  ░scroll░│      ├─ sticky (tint if !today) ┤
│  DateNav ░away ░░│      │  Header                  │
│  ───────         │      │  DateNav        [Today]  │ ← pinned
│  rows            │      ├─ ih-scroll ──────────────┤
│  rows            │      │  rows ░scroll behind░    │
└──────────────────┘      └──────────────────────────┘
```

Two viable shapes:

1. **`position: sticky; top: 0`** on a header wrapper that stays inside the
   scroll container. Least structural change. Requires an opaque background on
   the wrapper so list rows do not show through as they scroll under it.
2. **Restructure**: pull header + `DateNav` out as a fixed-flow sibling above a
   now-shorter `.ih-scroll`. Cleaner separation, no overlap concerns, but touches
   the EntryScreen layout and the desktop/mobile flex containers in `App.tsx`.

**Decision:** prefer (1) `position: sticky` for the smaller blast radius. The
wrapper carries an opaque background (normal vs. amber) which doubles as the
tint surface. Verify rows pass cleanly behind it on both layouts; fall back to
(2) only if sticky misbehaves inside the existing flex/overflow ancestors.

Both desktop and mobile render the same `EntryScreen`, so a single change covers
both. Desktop wraps it in a `maxWidth: 720` flex column and mobile in a flex
column with a tab bar — the sticky region sits at the top of the scroll area in
each.

## Not-today tint

- Trigger: existing `isToday = IH.sameKey(date, t)` check already in `DateNav`;
  lift/derive it at the header wrapper level.
- Color: reuse the existing `--c-amber` token (`oklch(0.73 0.095 75)`); no new
  variable. Apply as the header wrapper background (likely a soft/low-alpha
  amber so header text stays legible — tune during implementation).
- Scope: header strip only. The scroll body and rows keep their normal
  background.

## Open on today (drop persistence)

`App.tsx` currently:

```ts
const [date, setDateRaw] = React.useState<Date>(() => {
  const saved = localStorage.getItem('ih-entry-date');
  const t = IH.today();
  if (saved) { const d = IH.parseKey(saved); if (d <= t && d >= IH.addDays(t, -7)) return d; }
  return t;
});
const setDate = (d: Date) => { setDateRaw(d); localStorage.setItem('ih-entry-date', IH.dateKey(d)); };
```

becomes:

```ts
const [date, setDate] = React.useState<Date>(IH.today);
```

The `ih-entry-date` key is no longer read or written; it becomes dead storage on
existing installs (harmless, no migration needed).
