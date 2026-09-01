# EPStudy

EPStudy is the core student time-management and study-planning app for Eastside Preparatory School. It helps students stay on task by surfacing school work, tracking focus time, and organizing study habits.

## What it does

- Surfaces assignments and course work in a student dashboard
- Supports focus and study planning workflows
- Works as a browser-based app for school productivity
- Can optionally use a companion extension to sync data from Canvas, TeamSnap, and Membean

## Product scope

This app is the primary product. The browser extension is a separate helper that makes syncing easier, but the app itself does not depend on it to function as a school study tool.

## Main parts of the repo

- [index.html](index.html): the main app UI and browser-side logic
- [extension/README.md](extension/README.md): optional companion extension setup and sync behavior
- [extension/background.js](extension/background.js): background sync logic
- [extension/source-scraper.js](extension/source-scraper.js): extraction logic for school sources
- [docs/README.md](docs/README.md): documentation entry point

## Documentation

- [docs/README.md](docs/README.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/extension.md](docs/extension.md)
- [docs/operations.md](docs/operations.md)

## Quick start

1. Open [index.html](index.html) to use the main app.
2. Install the optional extension only if you want automatic sync from school services.
3. Follow the setup steps in [extension/README.md](extension/README.md).

## Notes

- The app is a static website and does not require a framework build step.
- The extension is a complementary tool, not the product itself.
- The project is centered on school task planning and Canvas-based academic workflow.

© Aarini Mehta, Aiden Wu