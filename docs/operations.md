# Operations and Maintenance

## Local usage

EPStudy can be used as a static web app without a build step.

Typical approaches:

- Open [../index.html](../index.html) directly in the browser
- Serve the folder with a lightweight local static server if needed
- Install the extension in Chrome or Edge only if you want school-source syncing

## Deployment expectations

The project fits static hosting patterns, including GitHub Pages, as shown by the CNAME and hosted URLs.

When changing deployment-sensitive details:

- confirm the base URL still matches the intended EPStudy site
- verify extension host permissions still match the deployed site
- confirm the app still works from the supported school and study URLs

## Maintenance checklist

- Keep extension permissions narrow and intentional
- Keep README and docs aligned with supported sources
- Test the main student flow after dashboard or timer changes
- Validate sync behavior against Canvas, TeamSnap, and Membean

## Notes for agents

Read only the docs and files relevant to the change. The app is the primary product; the extension is optional support.
