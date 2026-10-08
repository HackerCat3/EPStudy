# Documentation Index

Welcome to the EPStudy documentation index. EPStudy is the primary student study and time-management web app; the browser extension is an optional companion that assists with automated school-source syncing.

## Start Here

- [../README.md](../README.md): High-level app overview, features, and quick start
- [../AGENTS.md](../AGENTS.md): Antigravity AI pair programming instructions, coding rules, and module boundaries
- [architecture.md](architecture.md): Full architectural map, module responsibilities, and data flow
- [extension.md](extension.md): Extension architecture, message contracts, and school scraper specifications
- [operations.md](operations.md): Local previewing, static hosting, and automated validation recipes
- [../extension/README.md](../extension/README.md): Step-by-step developer instructions for installing the extension

## Repository Modules

### Web Application Modules
- [../index.html](../index.html): App shell, layout markup, styles, and modal templates
- [../app-shell.js](../app-shell.js): Bootstrap layer for navigation, modal/prompt plumbing, and extension bridge setup
- [../app-data.js](../app-data.js): Static schedule tables, course presets, skin effects, and metadata (`EPSTUDY_APP_CONFIG`)
- [../app-state.js](../app-state.js): State initialization, migrations, and `localStorage` restoration shields (`EPSTUDY_APP_STATE`)
- [../app-timer.js](../app-timer.js): Focus timer engine, countdown loops, and task loading (`EPSTUDY_APP_TIMER`)
- [../app-notifications.js](../app-notifications.js): Toast notifications, alert queue, and badge updates (`EPSTUDY_APP_NOTIFICATIONS`)
- [../app-dashboard.js](../app-dashboard.js): Dashboard widgets, EPS daily schedule card, and task lists (`EPSTUDY_APP_DASHBOARD`)
- [../app-calendar.js](../app-calendar.js): Calendar views (Month, Week, Day) and task mapping (`EPSTUDY_APP_CALENDAR`)
- [../app-settings.js](../app-settings.js): Settings panel controls and all-assignments viewer (`EPSTUDY_APP_SETTINGS`)
- [../app-helpers.js](../app-helpers.js): Shared validation, time formatters, and utility functions (`EPSTUDY_APP_HELPERS`)
- [../app-visuals.js](../app-visuals.js): Canvas visual effects, skin particle systems, and confetti (`EPSTUDY_APP_VISUALS`)

### Companion Extension Files
- [../extension/manifest.json](../extension/manifest.json): Manifest V3 configuration, permissions, and host patterns
- [../extension/background.js](../extension/background.js): Background service worker and 10-minute sync scheduler
- [../extension/source-scraper.js](../extension/source-scraper.js): DOM scraping scripts for Canvas, TeamSnap, and Membean
- [../extension/website-bridge.js](../extension/website-bridge.js): Web-to-extension communication relay

### Agent Customizations
- [../.agents/skills/](../.agents/skills/): Antigravity workspace skills (`audit-codebase`)

## When to Read Each Doc

- **Product overview or scope**: [../README.md](../README.md)
- **Agent guidelines, rules, or boundaries**: [../AGENTS.md](../AGENTS.md)
- **System architecture, namespaces, and data flow**: [architecture.md](architecture.md)
- **Extension syncing, messaging, or scrapers**: [extension.md](extension.md)
- **Local serving, verification, or deployment**: [operations.md](operations.md)
- **Extension installation in browser**: [../extension/README.md](../extension/README.md)

## Agent Loading Rule (Keep Context Narrow)

To conserve model context and maximize reasoning quality, adhere to progressive disclosure:

1. Never load [../index.html](../index.html) into context unless modifying HTML markup or styles.
2. Read [../AGENTS.md](../AGENTS.md) or [../README.md](../README.md) to locate the target module.
3. Read only the matching deep-dive documentation file.
4. Read and modify only the specific module file being changed.
5. Use `.agents/skills/audit-codebase/scripts/audit.js` to verify integrity before concluding.
