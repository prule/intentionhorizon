# Intention Horizon

**Intention Horizon** is a high-density, minimalist Progressive Web App (PWA) designed for utilitarian habit tracking. It focuses on the intentional completion of daily goals rather than passive habit formation, providing users with immediate feedback through data-rich grids and consistency visualizations.

[Project Brief](project_brief_intention_horizon.md)
[UI Design](Intention%20Horizon-handoff.zip) -  Claude Design exported as a handoff to Claude Code.

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_ENABLE_MOCK_DATA` | unset (off) | Set to `true` to expose the mock (sample) data source and the Mock/Real switcher in Settings. When off, the app always uses real data and hides the switcher. |

Enable mock data locally by adding to `.env.local`:

```
VITE_ENABLE_MOCK_DATA=true
```

