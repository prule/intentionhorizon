## Why

The current page is tracked only in `localStorage` (`ih-tab`), so the browser URL never changes as the user navigates between Today, Insights, and Manage. That means the URL can't be shared or bookmarked to a specific page, the browser Back/Forward buttons don't move between pages, and — though a reload currently restores the last tab via localStorage — the address bar gives no indication of where you are. Making the URL the source of truth for the active page fixes all of this with one mechanism.

## What Changes

- Introduce **hash-based routing**: each main page maps to a URL hash (e.g. `#/today`, `#/insights`, `#/manage`).
- The active page is **derived from the URL** on load and on `hashchange`; navigating (tab bar / sidebar) updates the hash instead of only local state.
- **Reload / deep link**: opening or reloading a URL lands on the page named in the hash.
- **Back/Forward**: browser history navigates between visited pages.
- Unknown or empty hash **redirects to the default page** (Today).
- Retire `localStorage('ih-tab')` as the page source of truth (URL replaces it); a legacy `ih-tab` value is honored once as the initial redirect target so existing users don't jump pages on upgrade.

## Capabilities

### New Capabilities
- `url-routing`: Defines the mapping between pages and URL hashes, URL-as-source-of-truth for the active page, navigation updating the URL, restore-on-reload/deep-link, Back/Forward behavior, and unknown-route fallback.

### Modified Capabilities
<!-- None — no existing spec governs page navigation. -->

## Impact

- **Code**: `src/App.tsx` (derive active page from the hash, sync navigation to the hash, listen for `hashchange`); minor: nav components already call `setTab`, which now drives the hash.
- **Storage**: `ih-tab` localStorage key is no longer the page source of truth (read once for upgrade continuity, then superseded by the URL).
- **Dependencies**: none — uses the browser History/`location.hash` API, no router library.
- **Runtime**: URL now changes with navigation; reloads and deep links resolve to the page in the hash. The entry-date selection (`ih-entry-date`) is unchanged.
