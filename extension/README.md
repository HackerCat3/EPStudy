# EPStudy Sync Extension

This Chrome/Edge companion extension syncs authenticated school tabs with the EPStudy web application. It runs as a background service worker without a popup UI, restricted solely to approved school services and authorized EPStudy domains.

## Related Documentation

- [Extension Deep Dive](../docs/extension.md): Full architecture, messaging protocol, and sync lifecycle
- [Agent Rules & Boundaries](../AGENTS.md): Repository structure and coding rules
- [Operations Guide](../docs/operations.md): Local development and verification recipes

## Files Overview

- [manifest.json](manifest.json): Chrome Manifest V3 configuration, permissions, and host patterns
- [background.js](background.js): Background service worker managing 10-minute periodic sync alarms
- [source-scraper.js](source-scraper.js): DOM scraping scripts for Canvas, TeamSnap, and Membean
- [website-bridge.js](website-bridge.js): Content script bridging the web app and extension runtime

## Installation (Developer Mode)

1. Open `chrome://extensions` in Google Chrome or Microsoft Edge.
2. Toggle **Developer mode** on (top right).
3. Click **Load unpacked** (top left).
4. Select this `extension` directory.
5. Open EPStudy at `https://sillywaffle-4.github.io/Epstudy/`, `https://sillywaffle-4.github.io/EPStudy-V6/`, or `https://epstudy.app/`.

## Usage

Keep EPStudy open in one tab, and open signed-in tabs for:

- **Canvas LMS**: `eastsideprep.instructure.com`
- **TeamSnap**: `go.teamsnap.com` schedule pages for teams you want tracked
- **Membean**: `membean.com`

The extension syncs automatically every 10 minutes via background alarms. You can also trigger an instant sync from **Settings -> Extension Sync** within EPStudy.

## What It Sends

- **Canvas LMS**: Active assignments and dated todo items.
- **TeamSnap**: Games, practices, matches, tournaments, and events across team tabs.
- **Membean**: Weekly session completion counts (Canvas assignments remain responsible for graded tasks).
- **Extension Health**: Source connection status, sync timestamps, and exported task counts.

## Security & Web Store Review Compliance

- **No `<all_urls>`**: Access is strictly scoped to the required school and application origins.
- **Minimal Permissions**: Uses only `storage`, `alarms`, `notifications`, and `scripting` for core functionality.
- **Safe Bridge**: `website-bridge.js` validates origins before relaying data to prevent third-party injection.

## Verification for Developers & Antigravity

Before submitting changes to extension files:

```powershell
Get-ChildItem -Path extension -Filter *.js | ForEach-Object { node -c $_.FullName }
node .agents/skills/audit-codebase/scripts/audit.js
```
