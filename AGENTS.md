# AGENTS.md

Welcome to the EPStudy repository. This file serves as the canonical guidelines and operational instructions for Google Antigravity and AI agents working on this codebase.

## Purpose & Scope

EPStudy is the core school-focused study and time-management web application designed for Eastside Preparatory School students. It surfaces Canvas coursework, organizes study blocks around the EPS academic schedule, tracks focus time, and persists student preferences locally.

- **Primary Product**: The static web application (`index.html` and supporting `app-*.js` modules).
- **Optional Companion**: The browser extension (`extension/`), which simplifies importing assignments and events from Canvas, TeamSnap, and Membean tabs into the web app. The web app is fully functional without the extension.

## Keep Agent Context Narrow (Progressive Disclosure)

> [!IMPORTANT]
> `index.html` is very large (over 280 KB and nearly 5,000 lines). **Do NOT load the entirety of `index.html` into your context** unless your specific task directly requires modifying markup, CSS styles, or root HTML template containers.

Follow the progressive disclosure model:
1. Consult this guide ([AGENTS.md](AGENTS.md)) and the documentation index ([docs/README.md](docs/README.md)) first.
2. Read only the specific documentation relevant to your task (e.g., [docs/architecture.md](docs/architecture.md), [docs/extension.md](docs/extension.md), or [docs/operations.md](docs/operations.md)).
3. Read and modify only the specific extracted module that owns the target behavior (e.g., `app-dashboard.js`, `app-calendar.js`, `app-timer.js`).
4. Delegate deep research or broad searches to the `research` subagent to prevent bloating your main conversation context.

## Repository Map

### Core Web Application
- [index.html](index.html): Main HTML shell, styles, layout containers, SVG assets, and modal wrappers.
- [app-shell.js](app-shell.js): Bootstrap orchestration, navigation router, modal/prompt plumbing, and extension message bridge.
- [app-data.js](app-data.js): Static configuration, school schedule presets, subject colors, skin presets, and quotes (`window.EPSTUDY_APP_CONFIG`).
- [app-state.js](app-state.js): State initialization, default state schema, `localStorage` persistence, and restore shields (`window.EPSTUDY_APP_STATE`).
- [app-timer.js](app-timer.js): Focus timer engine, countdown intervals, audio cues, and active task loading (`window.EPSTUDY_APP_TIMER`).
- [app-notifications.js](app-notifications.js): Notification queue, toast system, and alert badges (`window.EPSTUDY_APP_NOTIFICATIONS`).
- [app-dashboard.js](app-dashboard.js): Dashboard summary cards, EPS schedule blocks, task lists, and Membean card rendering (`window.EPSTUDY_APP_DASHBOARD`).
- [app-calendar.js](app-calendar.js): Calendar views (Month, Week, Day), task placement, time mapping, and date navigation (`window.EPSTUDY_APP_CALENDAR`).
- [app-settings.js](app-settings.js): Settings panel controls, data import/export handlers, and assignment list view (`window.EPSTUDY_APP_SETTINGS`).
- [app-helpers.js](app-helpers.js): Shared date/time formatters, sanitization, duration calculations, and validation helpers (`window.EPSTUDY_APP_HELPERS`).
- [app-visuals.js](app-visuals.js): Canvas particle effects, theme skin visual systems, and confetti animations (`window.EPSTUDY_APP_VISUALS`).

### Companion Browser Extension
- [extension/manifest.json](extension/manifest.json): Chrome Manifest V3 permissions, service worker, and host match patterns.
- [extension/background.js](extension/background.js): Background service worker, 10-minute periodic sync alarm, and message routing.
- [extension/source-scraper.js](extension/source-scraper.js): Scrapers for Canvas assignments/todos, TeamSnap calendar events, and Membean session counters.
- [extension/website-bridge.js](extension/website-bridge.js): Content script bridging `window.postMessage` to `chrome.runtime.sendMessage`.
- [extension/README.md](extension/README.md): Extension developer instructions, installation guide, and permissions justification.

### Documentation & Customizations
- [README.md](README.md): High-level product summary and repository overview.
- [docs/README.md](docs/README.md): Documentation index and guide navigation.
- [docs/architecture.md](docs/architecture.md): Deep-dive into modules, data flow, namespaces, and boundaries.
- [docs/extension.md](docs/extension.md): Extension architecture, message protocols, and source scraper contracts.
- [docs/operations.md](docs/operations.md): Local development, static serving, deployment checks, and verification recipes.
- [.agents/skills/](.agents/skills/): Antigravity workspace skills (`audit-codebase`).

## Module Namespaces & Export Contracts

Each extracted module encapsulates its behavior in an IIFE and attaches a canonical object to `window`:

| Module | Namespace Export | Primary Responsibilities |
| :--- | :--- | :--- |
| [app-data.js](app-data.js) | `window.EPSTUDY_APP_CONFIG` | Schedule tables, subject defaults, skin constants, motivational quotes |
| [app-state.js](app-state.js) | `window.EPSTUDY_APP_STATE` | `defaultState()`, `loadState()`, validation, task/profile restoration shields |
| [app-timer.js](app-timer.js) | `window.EPSTUDY_APP_TIMER` | `loadTaskInTimer()`, `toggleTimer()`, `resetFocusTimer()`, `updateTimerUi()` |
| [app-notifications.js](app-notifications.js) | `window.EPSTUDY_APP_NOTIFICATIONS` | `addNotification()`, `showToast()`, `removeNotification()`, `renderNotifications()` |
| [app-dashboard.js](app-dashboard.js) | `window.EPSTUDY_APP_DASHBOARD` | `renderDashboardSections()`, `renderScheduleCard()`, `renderTaskList()` |
| [app-calendar.js](app-calendar.js) | `window.EPSTUDY_APP_CALENDAR` | `renderMonthCalendar()`, `renderWeekCalendar()`, `shiftCalendar()` |
| [app-settings.js](app-settings.js) | `window.EPSTUDY_APP_SETTINGS` | `initPageSettings()`, `updateAllAssignmentsDisplay()` |
| [app-helpers.js](app-helpers.js) | `window.EPSTUDY_APP_HELPERS` | `isValidTime()`, `safeIsoFromDateTime()`, `toMinutes()`, `escapeHtml()` |
| [app-visuals.js](app-visuals.js) | `window.EPSTUDY_APP_VISUALS` | `resizeFxCanvas()`, `emitConfetti()`, `updateSkinEffect()`, `animateFx()` |
| [app-shell.js](app-shell.js) | `window.EPSTUDY_APP_SHELL` | `saveState()`, `navigate()`, `showPrompt()`, `requestExtensionSync()` |

## Architectural Boundaries & Change Ownership

- **Page markup, layouts, and modals**: [index.html](index.html)
- **Bootstrap glue, modal inert management, router**: [app-shell.js](app-shell.js)
- **Static defaults and schedule constants**: [app-data.js](app-data.js)
- **State loading, migrations, and localStorage safety**: [app-state.js](app-state.js)
- **Focus timer controls and task loading**: [app-timer.js](app-timer.js)
- **Toast alerts and notification banners**: [app-notifications.js](app-notifications.js)
- **Dashboard widgets, daily schedule card, smart suggestions**: [app-dashboard.js](app-dashboard.js)
- **Calendar grid, day/week/month navigation, task placement**: [app-calendar.js](app-calendar.js)
- **Settings panels and assignment view**: [app-settings.js](app-settings.js)
- **Validation and string/time formatting utilities**: [app-helpers.js](app-helpers.js)
- **Canvas background animations and particle themes**: [app-visuals.js](app-visuals.js)
- **Extension background sync, alarms, and permissions**: [extension/background.js](extension/background.js)
- **School page DOM scraping (Canvas/TeamSnap/Membean)**: [extension/source-scraper.js](extension/source-scraper.js)
- **Website-to-extension communication relay**: [extension/website-bridge.js](extension/website-bridge.js)

## Source-of-Truth & Duplicate-Code Prevention Rule

1. **Extracted modules are the canonical implementation**: Once a function is extracted into a module, that module is the authoritative owner.
2. **Never duplicate logic**: Do not declare duplicate copies of extracted functions in `index.html`. If backwards compatibility is needed, use a single delegation line (e.g. `const fn = () => window.EPSTUDY_APP_MODULE.fn()`).
3. **Run a duplicate audit**: Before finishing any refactor or feature addition, run the audit script to ensure no unauthorized duplicates were introduced.

## Data & State Integrity Safeguards

- The application stores user state in `localStorage` under key `epstudy_secure_pro_v6`.
- **Ultimate Shield**: `app-shell.js` and `app-state.js` contain protective guards to prevent empty state resets from overwriting a student's tasks, division selection, or tutorial status. **Never remove or bypass these guards**.
- Always ensure date/time strings are validated safely via `isValidTime` before performing arithmetic.

## Antigravity Verification Recipes

Use these commands directly in Antigravity to verify changes:

### 1. Run Workspace Audit (Syntax, Duplicates, Links)
```powershell
node .agents/skills/audit-codebase/scripts/audit.js
```

### 2. Check JavaScript Syntax Across All Files
```powershell
Get-ChildItem -Filter *.js | ForEach-Object { node -c $_.FullName }
Get-ChildItem -Path extension -Filter *.js | ForEach-Object { node -c $_.FullName }
```

### 3. Launch Local Static Preview Server
```powershell
python -m http.server 8000
```
Then verify the app in your browser at `http://localhost:8000/`.

## Workspace Skills in Antigravity

This repository includes specialized Antigravity workspace skills in `.agents/skills/`:
- **`audit-codebase`**: Runs syntax validation, duplicate-code checks, and markdown link verification.

## Documentation Index

- [README.md](README.md): High-level overview and product scope.
- [docs/README.md](docs/README.md): Documentation index and navigation.
- [docs/architecture.md](docs/architecture.md): Deep-dive into application architecture, data flow, and module boundaries.
- [docs/extension.md](docs/extension.md): Extension architecture, messaging protocol, and scraper contracts.
- [docs/operations.md](docs/operations.md): Local development, deployment checks, and verification workflows.
- [extension/README.md](extension/README.md): Extension setup, permissions, and Chrome/Edge loading instructions.
