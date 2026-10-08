# Extension Architecture & Sync Guide

## Purpose

The EPStudy Companion Extension is an optional Chrome/Edge extension that automates importing student assignments, athletic events, and vocabulary practice into the EPStudy web app. It operates strictly in the background without a popup UI.

## Supported Data Sources

- **Canvas LMS**: `eastsideprep.instructure.com`
  - Extracts active course assignments, dated todo items, and due dates.
- **TeamSnap**: `go.teamsnap.com`
  - Extracts games, practices, matches, tournaments, and events across multiple team schedules.
- **Membean**: `*.membean.com` and `membean.com`
  - Extracts weekly session completion counts. (Canvas remains the source of truth for graded assignments).
- **EPStudy Web App**:
  - `https://sillywaffle-4.github.io/Epstudy/*`
  - `https://sillywaffle-4.github.io/EPStudy-V6/*`
  - `https://epstudy.app/*`

## Extension Files & Structure

- [../extension/manifest.json](../extension/manifest.json): Chrome Manifest V3 manifest declaring permissions (`storage`, `alarms`, `notifications`, `scripting`), host permissions, and background worker.
- [../extension/background.js](../extension/background.js): Service worker responsible for periodic sync scheduling (10-minute alarms), tab queries, and cross-tab message delivery.
- [../extension/source-scraper.js](../extension/source-scraper.js): Content script injected into school pages to scrape DOM content into structured JSON.
- [../extension/website-bridge.js](../extension/website-bridge.js): Content script injected into EPStudy web pages to relay `window.postMessage` events to and from the extension runtime.
- [../extension/README.md](../extension/README.md): Installation guide and Chrome Web Store review compliance notes.

## Communication Protocol & Message Types

Communication between the EPStudy web app and the companion extension is mediated by `website-bridge.js` using window events:

| Action / Message Type | Sender | Receiver | Description |
| :--- | :--- | :--- | :--- |
| `EPSTUDY_PING` | Web App | Extension Bridge | Checks whether the extension is installed and responsive. |
| `EPSTUDY_PONG` | Extension Bridge | Web App | Confirms extension is active and provides extension version. |
| `EPSTUDY_REQUEST_SYNC` | Web App | Background Worker | Requests an immediate scrape across open Canvas, TeamSnap, and Membean tabs. |
| `EPSTUDY_PAYLOAD` | Background Worker | Web App | Delivers extracted assignments, events, and Membean progress to the app. |
| `EPSTUDY_FETCH_TEXT` | Web App | Background Worker | Proxies text retrieval for school feeds if permitted. |
| `EPSTUDY_SAVE_EXPORTED_TASKS`| Web App | Background Worker | Synchronizes tasks created in the web app into extension storage. |

## Sync Lifecycle

1. **Automatic Alarm**: Every 10 minutes, Chrome's `alarms` API wakes `background.js`.
2. **Tab Query**: The service worker queries for active or background tabs matching the approved school domains.
3. **Scraper Injection / Execution**: `source-scraper.js` extracts tasks from the active DOM trees.
4. **Data Delivery**: The extracted payload is sent to open EPStudy tabs via `chrome.tabs.sendMessage`.
5. **Bridge Relay**: `website-bridge.js` dispatches a CustomEvent on `window`, triggering `handleExtensionPayload()` in `app-shell.js`.
6. **Task Merge**: The web app merges the payload into local state, deduplicates tasks by ID/title, and refreshes the UI.

## Testing & Verification in Antigravity

When modifying extension code:

1. **Check Syntax**:
   ```powershell
   Get-ChildItem -Path extension -Filter *.js | ForEach-Object { node -c $_.FullName }
   ```
2. **Validate Manifest**:
   Confirm `manifest.json` is valid JSON and contains only required host permissions.
3. **Run Codebase Audit**:
   ```powershell
   node .agents/skills/audit-codebase/scripts/audit.js
   ```
4. **Manual Browser Verification**:
   Follow instructions in [../extension/README.md](../extension/README.md) to load unpacked in `chrome://extensions`.
