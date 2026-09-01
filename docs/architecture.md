# Architecture Overview

## Product scope

EPStudy is the main app. It is a school productivity tool for Eastside Preparatory School students that combines:

- assignment and schedule awareness from Canvas
- focus and time-management workflows
- browser-local task and settings persistence
- optional sync from TeamSnap and Membean via a companion extension

The app is the primary product. The extension is a separate helper that makes school syncing easier without being required for the app itself.

## High-level structure

- [../index.html](../index.html): main app UI, styles, and browser-side logic
- [../app-data.js](../app-data.js): extracted static defaults and configuration metadata
- [../app-state.js](../app-state.js): extracted state initialization and localStorage persistence
- [../app-timer.js](../app-timer.js): extracted focus timer and task-loading logic
- [../app-notifications.js](../app-notifications.js): extracted notification and toast feedback system
- [../extension/background.js](../extension/background.js): background service worker for sync and messaging
- [../extension/source-scraper.js](../extension/source-scraper.js): content scripts for school pages
- [../extension/website-bridge.js](../extension/website-bridge.js): app-to-extension communication
- [../extension/manifest.json](../extension/manifest.json): allowed hosts and permissions

## Data flow

1. The app stores local state in the browser.
2. The extension, when installed, watches approved school pages.
3. School scrapers extract tasks and metadata.
4. The extension sends data back to the app.
5. The app merges that data into the dashboard and study workflow.

## Implementation notes

- The main app is a static HTML/CSS/JS site.
- Most state is browser-local.
- The extension uses narrow permissions and approved domains.
- The app and extension should stay aligned when a user workflow touches both.

## Change boundaries

- Dashboard, timer, or school-planning logic: [../index.html](../index.html)
- Shared app configuration and default metadata: [../app-data.js](../app-data.js)
- State defaults, validation, and localStorage management: [../app-state.js](../app-state.js)
- Focus timer UI updates and task-in-timer flow: [../app-timer.js](../app-timer.js)
- Notification and toast feedback system: [../app-notifications.js](../app-notifications.js)
- Sync scheduling or background messaging: [../extension/background.js](../extension/background.js)
- Source scraping: [../extension/source-scraper.js](../extension/source-scraper.js)
- App-to-extension bridge: [../extension/website-bridge.js](../extension/website-bridge.js)

## Documentation rule

Keep [../README.md](../README.md) and [README.md](README.md) aligned when contributor guidance changes.
