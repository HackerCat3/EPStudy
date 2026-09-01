# AGENTS.md

## Purpose

EPStudy is the core school-focused study and time-management app. The browser extension is a separate, optional companion that makes syncing easier from Canvas, TeamSnap, and Membean, but it is not required for the app itself.

## Keep agent context narrow

Use the documentation index before reading large files. Load only the docs needed for the task:

- Start with [README.md](README.md) for the high-level product summary.
- Use [docs/README.md](docs/README.md) to choose the relevant deep-dive doc.
- Use [extension/README.md](extension/README.md) when a task touches the browser extension.
- Avoid reading the full app UI in [index.html](index.html) unless the change is directly in the dashboard or page logic.

## Repo map

- [index.html](index.html): main app UI, styling, and browser-side logic.
- [app-data.js](app-data.js): extracted static configuration and app defaults.
- [app-state.js](app-state.js): extracted state initialization and localStorage persistence.
- [app-timer.js](app-timer.js): extracted focus timer and task-loading helpers.
- [app-notifications.js](app-notifications.js): extracted notification and toast feedback system.
- [extension/background.js](extension/background.js): extension service worker that schedules syncs and handles requests from the web app.
- [extension/source-scraper.js](extension/source-scraper.js): scripts that read Canvas, TeamSnap, and Membean pages.
- [extension/website-bridge.js](extension/website-bridge.js): bridge between the web app and the extension.
- [extension/manifest.json](extension/manifest.json): permissions and host access for allowed school services.
- [extension/README.md](extension/README.md): extension setup and behavior notes.

## Product conventions

- This project is primarily a static browser app; it does not use a build system or package manager for the main app.
- Changes should remain compatible with GitHub Pages hosting and browser-based local execution.
- Respect the school-specific product scope: Canvas assignments, schedule-aware planning, focus timer, and student-facing time management workflows.
- If a change touches both the website and the extension, update both the UI documentation and the extension docs together.
- Prefer minimal, targeted edits over broad refactors. The app is highly state-driven and stores a lot of behavior in browser-local data.

## Validation guidance

- There is no Node-based test suite in the main repo, so validation is usually browser-based.
- For UI changes, open the static page in a browser and verify the relevant flow manually.
- For extension changes, validate the manifest hosts and the sync flow against the allowed school domains.
- If you add or change documentation, update [docs/README.md](docs/README.md) and the relevant section in this file so the agent still has a concise entry point.

## Quick rules for contributors

1. Keep school-product behavior intact and student-facing.
2. Favor small, documented edits that match the existing project structure.
3. Treat Canvas, TeamSnap, and Membean as first-class data sources when relevant.
4. Make the extension and website docs reflect the same source-of-truth behavior.

## Related docs

- [README.md](README.md)
- [docs/README.md](docs/README.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/extension.md](docs/extension.md)
- [docs/operations.md](docs/operations.md)
