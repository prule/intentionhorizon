## Context

`App.tsx` holds the active page in React state (`tab`, one of `entry | analytics | settings`), initialized from `localStorage('ih-tab')` and written back on change. Navigation components (`TabBar`, `Sidebar`) call `setTab`. The app is a Vite SPA served statically (with a `public/sw.js` service worker) — there is no server-side routing or rewrite layer. The `Guide` screen is a modal overlay, not a page.

## Goals / Non-Goals

**Goals:**
- URL is the source of truth for the active page (Today / Insights / Manage).
- Reload and deep links resolve to the page named in the URL.
- Tab bar / sidebar navigation updates the URL; browser Back/Forward move between pages.
- Unknown/empty route falls back to the default page without a dead end.
- Existing users keep their last page on first load after upgrade.

**Non-Goals:**
- Path-based (`/manage`) routing requiring server rewrites.
- Adding a routing library (react-router etc.).
- Encoding the selected entry date or the Guide overlay in the URL (date stays in `localStorage`; Guide stays a modal).
- Server-side rendering or prerendering.

## Decisions

### Decision 1: Hash-based routing (not History API paths)
Use `location.hash` (`#/today`, `#/insights`, `#/manage`) as the route.

- **Why:** Works on any static host with zero server config and is compatible with the existing service worker — a hard reload of `https://app/#/manage` always serves `index.html` and the client resolves the hash. History-API paths (`/manage`) would 404 on reload unless the host rewrites all paths to `index.html`, which isn't guaranteed here.
- **Alternative considered:** History API with `pushState`. Rejected for the static-host / SW reload risk above.

### Decision 2: Friendly slugs mapped to internal tab ids
Keep internal tab ids (`entry`/`analytics`/`settings`) but expose readable slugs in the URL via a small bidirectional map: `today↔entry`, `insights↔analytics`, `manage↔settings`.

- **Why:** Readable, shareable URLs that match the visible nav labels, without renaming existing tab state throughout the app.
- **Alternative considered:** Put raw tab ids in the hash. Rejected — `#/entry` is less clear than `#/today` and leaks internal naming.

### Decision 3: URL is source of truth; derive state from it
Active page is computed from the hash. A `hashchange` listener updates React state; `setTab` writes the hash (which then flows back through the listener). On initial mount, parse the hash to set the starting page.

- **Why:** Single source of truth avoids drift between URL and state, and makes Back/Forward "just work" since they fire `hashchange`.

### Decision 4: Upgrade continuity via one-time `ih-tab` read
On first load, if the hash is empty, seed the hash from a legacy `ih-tab` value when present (mapped to its slug), else default to `today`. After that the URL governs; `ih-tab` is no longer the source of truth.

- **Why:** Existing users land on their last page instead of being bounced to Today on the upgrade load.

### Decision 5: Unknown/empty route → redirect to default
An empty or unrecognized hash is normalized to `#/today` using `history.replaceState`/`location.replace` semantics (replace, not push) so it doesn't create a junk Back entry.

- **Why:** No dead ends; clean history.

## Risks / Trade-offs

- **Hash navigation could conflict with in-page anchor links** → the app uses no `#id` anchor links; all hashes are reserved for routing.
- **`replace` vs `push` confusion creating bad Back behavior** → normalization of unknown routes uses replace; real navigations use a normal hash assignment (push) so Back works as expected.
- **Listener/state feedback loop** → setting the hash triggers `hashchange`, which sets state; guard by only updating state when the derived page actually differs.
- **Service worker serving a stale shell** → unaffected; routing is fully client-side and the SW serves the same `index.html` for any hash.

## Migration Plan

1. Add the slug↔tab map and hash parse/format helpers in `App.tsx`.
2. Initialize the page from the hash on mount; if empty, seed from legacy `ih-tab` or default `today`, via replace.
3. Replace direct `setTab` state writes with hash updates; add a `hashchange` listener that syncs state.
4. Normalize unknown hashes to the default page.
5. Rollback: revert `App.tsx`; `localStorage('ih-tab')` behavior is still present as the upgrade seed, so no data cleanup needed.
