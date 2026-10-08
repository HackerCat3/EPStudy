# EPStudy

EPStudy is the student time-management and study-planning web application built for Eastside Preparatory School. It helps students stay on task by organizing coursework around the EPS academic schedule, tracking focus time, and reinforcing productive study habits.

## What it does

- Surfaces assignments and coursework in a student-friendly dashboard
- Maps tasks directly to the Eastside Prep rotating school schedule
- Supports focus planning workflows with an integrated study timer
- Runs as a standalone browser-based static web app
- Optionally pairs with a companion extension to sync data automatically from Canvas, TeamSnap, and Membean

## Product Scope

The web application is the primary product. The browser extension is an optional companion that streamlines syncing, but the core web application does not require the extension to function.

## Main parts of the repo

### Web Application
- [index.html](index.html): Main app shell, layout markup, modal structures, and styles
- [app-shell.js](app-shell.js): Minimal bootstrap layer for page navigation, modal flow, and extension message plumbing
- [app-data.js](app-data.js): Static app configuration, EPS schedule presets, course colors, and quotes
- [app-state.js](app-state.js): State defaults, local persistence, and data restoration safeguards
- [app-timer.js](app-timer.js): Focus timer engine, countdown intervals, and task-loading flow
- [app-notifications.js](app-notifications.js): Notification queue, toast system, and alert badges
- [app-dashboard.js](app-dashboard.js): Dashboard rendering, schedule card, task lists, and summary cards
- [app-calendar.js](app-calendar.js): Calendar navigation, task display, and day/week/month views
- [app-settings.js](app-settings.js): Settings controls and all-assignments display UI
- [app-helpers.js](app-helpers.js): Shared validation, date/time formatting, and utility helpers
- [app-visuals.js](app-visuals.js): HTML5 canvas particle backgrounds, theme skins, and confetti animations

### Companion Extension
- [extension/manifest.json](extension/manifest.json): Manifest V3 configuration, host permissions, and service worker
- [extension/background.js](extension/background.js): Background service worker and 10-minute sync scheduler
- [extension/source-scraper.js](extension/source-scraper.js): Extraction logic for Canvas, TeamSnap, and Membean
- [extension/website-bridge.js](extension/website-bridge.js): Bridge relay between web app and extension
- [extension/README.md](extension/README.md): Companion extension setup, permissions, and review notes

### Agent Customizations & Documentation
- [AGENTS.md](AGENTS.md): Google Antigravity and AI agent rules, architecture boundaries, and verification recipes
- [.agents/skills/](.agents/skills/): Antigravity workspace skills (`audit-codebase`)
- [docs/README.md](docs/README.md): Documentation entry point and reading guide

## Documentation

- [AGENTS.md](AGENTS.md): AI agent pair programming guide and workspace rules
- [docs/README.md](docs/README.md): Documentation index and navigation
- [docs/architecture.md](docs/architecture.md): Deep-dive into application architecture and module boundaries
- [docs/extension.md](docs/extension.md): Extension architecture, message protocols, and scraper details
- [docs/operations.md](docs/operations.md): Local development, static serving, and deployment checklist
- [extension/README.md](extension/README.md): Extension installation and browser loading instructions

## Quick Start

1. Open [index.html](index.html) in a modern web browser to use the main app.
2. Serve locally with Python if desired: `python -m http.server 8000`
3. Install the optional companion extension only if you want automatic sync from school tabs:
   - Follow the setup steps in [extension/README.md](extension/README.md).

## AI Agent & Antigravity Support

This codebase is configured for Google Antigravity:
- Workspace rules and coding boundaries are defined in [AGENTS.md](AGENTS.md).
- Automated audit tools are available in `.agents/skills/audit-codebase/`:
  ```powershell
  node .agents/skills/audit-codebase/scripts/audit.js
  ```
- Modular workspace skills are registered under `.agents/skills/`.

## Notes

- The app is a static website and does not require a framework build step or package manager.
- The companion extension is a complementary tool, not the product itself.
- State is stored locally in the browser under `epstudy_secure_pro_v6`.

© Aarini Mehta, Aiden Wu