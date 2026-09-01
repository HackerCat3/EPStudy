# Extension Guide

## Purpose

The extension is an optional companion to the EPStudy app. It makes it easier to pull data from school sites into the app, but it is not the app itself.

## Supported sources

- Canvas: `eastsideprep.instructure.com`
- TeamSnap: `go.teamsnap.com`
- Membean: `*.membean.com` and `membean.com`
- EPStudy app URLs and local development hosts

## Files to know

- [../extension/manifest.json](../extension/manifest.json): permissions and allowed domains
- [../extension/background.js](../extension/background.js): sync scheduling and message handling
- [../extension/source-scraper.js](../extension/source-scraper.js): source-specific extraction logic
- [../extension/website-bridge.js](../extension/website-bridge.js): app bridge and relay logic

## Behavior

- Runs as a background service worker
- Watches only approved school domains
- Sends data back to the main EPStudy app when relevant pages are open
- Keeps the surface area narrow instead of using broad URL access

## Common tasks

- Update a data parser: [../extension/source-scraper.js](../extension/source-scraper.js)
- Adjust sync timing or messaging: [../extension/background.js](../extension/background.js)
- Change permissions or hosts: [../extension/manifest.json](../extension/manifest.json)

## Install notes

See [../extension/README.md](../extension/README.md) for setup and usage details.
