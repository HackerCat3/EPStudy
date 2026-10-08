# Architecture Overview

## Product Scope

EPStudy is the core school-focused study and time-management web application for Eastside Preparatory School students. It combines:

- Coursework and assignment awareness from Canvas LMS
- Dynamic schedule integration tailored to the EPS rotating period timetable
- Focus timer and time-management workflows
- Local browser state persistence with data restoration safeguards
- Optional automatic data sync from Canvas, TeamSnap, and Membean via a companion extension

The web application is the primary product. The browser extension is a separate helper that simplifies school syncing without being required for the web app to function.

## High-Level Component Structure

The frontend architecture consists of a static HTML shell (`index.html`) accompanied by 10 extracted JavaScript modules and a 4-file companion extension:

```text
EPStudy/
├── index.html                  # Main markup, layouts, modals, and styles
├── app-shell.js                # Router, bootstrap glue, modal inert manager
├── app-data.js                 # Configuration, schedule constants, quotes
├── app-state.js                # State schema, migrations, restoration shields
├── app-timer.js                # Focus timer countdown, task loading, audio
├── app-notifications.js        # Notification queue, toasts, badge counts
├── app-dashboard.js            # Dashboard rendering, schedule card, task lists
├── app-calendar.js             # Month/Week/Day calendar views and task slots
├── app-settings.js             # Settings tabs, data import/export, all-tasks view
├── app-helpers.js              # Formatting, date/time math, validation helpers
├── app-visuals.js              # Canvas background particles, themes, confetti
├── extension/
│   ├── manifest.json           # Manifest V3 permissions and host matching
│   ├── background.js           # Background service worker and 10m sync alarm
│   ├── source-scraper.js       # Scrapers for Canvas, TeamSnap, and Membean
│   └── website-bridge.js       # Web-to-extension postMessage relay
└── docs/                       # Architectural and operational documentation
```

## Module Script Loading Order

In `index.html`, modules are loaded sequentially via standard `<script>` tags before the main app initialization block:

1. `app-data.js`: Registers `window.EPSTUDY_APP_CONFIG`
2. `app-state.js`: Registers `window.EPSTUDY_APP_STATE`
3. `app-timer.js`: Registers `window.EPSTUDY_APP_TIMER`
4. `app-notifications.js`: Registers `window.EPSTUDY_APP_NOTIFICATIONS`
5. `app-dashboard.js`: Registers `window.EPSTUDY_APP_DASHBOARD`
6. `app-calendar.js`: Registers `window.EPSTUDY_APP_CALENDAR`
7. `app-settings.js`: Registers `window.EPSTUDY_APP_SETTINGS`
8. `app-helpers.js`: Registers `window.EPSTUDY_APP_HELPERS`
9. `app-visuals.js`: Registers `window.EPSTUDY_APP_VISUALS`
10. `app-shell.js`: Registers `window.EPSTUDY_APP_SHELL`
11. Inline bootstrap block in `index.html`: Initializes state via `appState.loadState()`, binds events via `registerEvents()`, mounts the initial view, and initiates periodic intervals.

## Module Namespaces & Export Contracts

Each module exposes its public API through a distinct namespace on `window`:

| Module | Namespace | Key Exports |
| :--- | :--- | :--- |
| [../app-data.js](../app-data.js) | `EPSTUDY_APP_CONFIG` | `STORAGE_KEY`, `SCHOOL_SCHEDULE`, `ACHIEVEMENTS`, `DEFAULT_COURSES`, `SKIN_IDS`, `MOTIVATIONAL_QUOTES` |
| [../app-state.js](../app-state.js) | `EPSTUDY_APP_STATE` | `defaultState()`, `loadState()` |
| [../app-timer.js](../app-timer.js) | `EPSTUDY_APP_TIMER` | `timerTaskOptions()`, `syncTimerTaskSelectors()`, `loadTaskInTimer()`, `toggleTimer()`, `resetFocusTimer()`, `updateTimerUi()` |
| [../app-notifications.js](../app-notifications.js) | `EPSTUDY_APP_NOTIFICATIONS` | `addNotification()`, `showToast()`, `removeNotification()`, `renderNotifications()` |
| [../app-dashboard.js](../app-dashboard.js) | `EPSTUDY_APP_DASHBOARD` | `renderDashboardSections()`, `renderScheduleCard()`, `renderTaskList()`, `renderSmartCard()`, `getMembeanProgress()` |
| [../app-calendar.js](../app-calendar.js) | `EPSTUDY_APP_CALENDAR` | `renderMonthCalendar()`, `renderWeekCalendar()`, `renderFullCalendar()`, `shiftCalendar()`, `goToCurrentCalendarPeriod()` |
| [../app-settings.js](../app-settings.js) | `EPSTUDY_APP_SETTINGS` | `initPageSettings()`, `updateAllAssignmentsDisplay()`, `toggleAllAssignmentsDisplay()` |
| [../app-helpers.js](../app-helpers.js) | `EPSTUDY_APP_HELPERS` | `isValidTime()`, `safeIsoFromDateTime()`, `toMinutes()`, `nowMinutes()`, `isWeekend()`, `escapeHtml()`, `getCourseById()` |
| [../app-visuals.js](../app-visuals.js) | `EPSTUDY_APP_VISUALS` | `resizeFxCanvas()`, `emitConfetti()`, `updateSkinEffect()`, `drawSkinParticles()`, `animateFx()` |
| [../app-shell.js](../app-shell.js) | `EPSTUDY_APP_SHELL` | `saveState()`, `navigate()`, `showPrompt()`, `requestExtensionSync()`, `fetchTextViaExtension()`, `initAppShell()` |

## Data Flow & Browser Persistence

```
+---------------------+           +------------------------+
|  School Web Pages   |           |    Web App Frontend    |
| (Canvas, TeamSnap,  |           |      (EPStudy)         |
|      Membean)       |           +-----------+------------+
+----------+----------+                       |
           | (DOM scraping)                   | User actions, timer,
           v                                  | settings changes
+----------+----------+                       v
|   source-scraper    |           +-----------+------------+
+----------+----------+           |      saveState()       |
           | chrome.runtime       |   (app-shell.js)       |
           v                      +-----------+------------+
+----------+----------+                       |
|   background.js     |                       | Ultimate Shield check
|  (Service Worker)   |                       | JSON.stringify
           |                                  v
           v chrome.tabs.sendMessage  +-------+------------+
+----------+----------+               |   localStorage     |
|   website-bridge    |               |  (epstudy_secure   |
+----------+----------+               |     _pro_v6)       |
           | window.postMessage       +-------+------------+
           v                                  |
+----------+----------+                       | On page load:
|   app-shell.js      |                       | loadState()
| handleExtension-    |                       | (app-state.js)
|     Payload         |                       v
+----------+----------+           +-----------+------------+
           | Merge tasks          |   In-Memory State      |
           +--------------------->| (state.tasks, etc.)    |
                                  +------------------------+
```

### State Restoration Shields

To safeguard against accidental data loss, `app-shell.js` and `app-state.js` implement defensive shields:
- If a save or load operation produces an empty tasks array while `localStorage` contains existing tasks, the existing tasks are preserved.
- Critical user preferences (`schoolDivision`, `tutorialSeen`) are locked and restored from persistent storage.
- Time values are validated via `isValidTime` before parsing to avoid runtime exceptions on malformed strings.

## Change Boundaries

To maintain clean separation of concerns:
- **Page shell, markup, and layout**: [../index.html](../index.html)
- **Navigation, modals, and extension bridge wiring**: [../app-shell.js](../app-shell.js)
- **Static defaults and schedule constants**: [../app-data.js](../app-data.js)
- **State loading, migrations, and localStorage**: [../app-state.js](../app-state.js)
- **Focus timer UI and countdown flow**: [../app-timer.js](../app-timer.js)
- **Notification banner and toast rendering**: [../app-notifications.js](../app-notifications.js)
- **Dashboard cards and section layout**: [../app-dashboard.js](../app-dashboard.js)
- **Calendar views, task mapping, and date shifting**: [../app-calendar.js](../app-calendar.js)
- **Settings panels and full assignment list**: [../app-settings.js](../app-settings.js)
- **Shared string, time, and validation utilities**: [../app-helpers.js](../app-helpers.js)
- **HTML5 canvas effects and skin animations**: [../app-visuals.js](../app-visuals.js)
- **Extension background sync and alarm logic**: [../extension/background.js](../extension/background.js)
- **School page scraping**: [../extension/source-scraper.js](../extension/source-scraper.js)
- **Extension-to-app message bridge**: [../extension/website-bridge.js](../extension/website-bridge.js)

## Duplicate-Code Prevention & Single Source of Truth

- Extracted modules are the canonical source of truth for their respective domain.
- Never duplicate extracted function implementations in [../index.html](../index.html).
- If compatibility aliases are required, provide a single-line delegation to the module namespace.
- Before concluding any refactor, run the automated workspace audit:
  ```powershell
  node .agents/skills/audit-codebase/scripts/audit.js
  ```

## Documentation Alignment Rule

Keep [../README.md](../README.md), [README.md](README.md), and [../AGENTS.md](../AGENTS.md) aligned whenever module boundaries, dependencies, or contributor guidelines change.
