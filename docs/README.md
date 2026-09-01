# Documentation Index

Keep context small. The app is the main product; the extension is an optional companion that helps with syncing.

## Start here

- [../README.md](../README.md): app overview and product scope
- [architecture.md](architecture.md): repo structure and responsibilities, including the extracted main-app module map
- [extension.md](extension.md): optional extension behavior and sync flow
- [operations.md](operations.md): local usage and maintenance notes

## Main app modules

- [../app-data.js](../app-data.js): static defaults and metadata
- [../app-state.js](../app-state.js): local storage and state initialization
- [../app-timer.js](../app-timer.js): timer behavior and task loading
- [../app-dashboard.js](../app-dashboard.js): dashboard rendering
- [../app-calendar.js](../app-calendar.js): calendar display and navigation
- [../app-settings.js](../app-settings.js): settings and assignment views
- [../app-helpers.js](../app-helpers.js): shared helper utilities
- [../app-visuals.js](../app-visuals.js): canvas visuals and particle effects

## When to read each doc

- App overview or scope: [../README.md](../README.md)
- Repo layout and logic boundaries: [architecture.md](architecture.md)
- Sync or scraper work: [extension.md](extension.md)
- Local usage or deployment checks: [operations.md](operations.md)

## Agent loading rule

Load only the docs needed for the task:

1. [../README.md](../README.md)
2. The matching deep-dive doc
3. The exact file being changed

This keeps work focused without losing the core product context.
