# Operations, Local Development & Maintenance

## Local Development & Serving

EPStudy is a static browser application requiring no build step, compiler, or package manager.

### Serving the Web App Locally

To test the application locally with full functionality (avoiding `file://` CORS restrictions):

#### Option A: Python Static HTTP Server (Recommended)
```powershell
python -m http.server 8000
```
Open `http://localhost:8000/` in Chrome or Edge.

#### Option B: Node Static Server (`npx`)
```powershell
npx serve -p 8000 .
```

#### Option C: Direct File Opening
You can double-click [../index.html](../index.html) or open it directly in a browser. Core functionality (schedule, timer, local tasks) will work, though certain browser APIs or cross-origin features may have browser restrictions.

## Automated Verification Recipes for Antigravity

Before submitting changes or marking tasks complete, run the following automated checks:

### 1. Full Codebase & Documentation Audit
Run the bundled Antigravity audit tool:
```powershell
node .agents/skills/audit-codebase/scripts/audit.js
```
This script verifies:
- JavaScript syntax across all root and extension files via `node -c`
- Duplicate function definitions between `index.html` and extracted modules
- Relative link integrity across all markdown documentation files

### 2. JavaScript Syntax Validation
```powershell
Get-ChildItem -Filter *.js | ForEach-Object { node -c $_.FullName }
Get-ChildItem -Path extension -Filter *.js | ForEach-Object { node -c $_.FullName }
```

### 3. Check Git Status
```powershell
git status
```
Ensure no unintentional file modifications or temporary files are present.

## Deployment & Hosting

### GitHub Pages Deployment
The production web app is deployed via GitHub Pages from the `main` branch.
- **Custom Domain**: Configured via the [../CNAME](../CNAME) file (`epstudy.app`).
- **Secondary Hosts**: Also hosted on GitHub Pages subdomain paths:
  - `https://sillywaffle-4.github.io/Epstudy/`
  - `https://sillywaffle-4.github.io/EPStudy-V6/`

### Deployment Verification Checklist
When deploying updates:
1. Confirm [../CNAME](../CNAME) exists and specifies the correct domain.
2. Confirm that [../extension/manifest.json](../extension/manifest.json) includes the active production domain in `host_permissions` and content script matches.
3. Confirm that `window.EPSTUDY_APP_CONFIG.PRIVATE_PROXY_URL` remains reachable.
4. Verify that `localStorage` key remains `epstudy_secure_pro_v6` to preserve student state across deployments.

## Maintenance Checklist

- **Keep permissions minimal**: Do not add unnecessary broad host patterns (`<all_urls>`) to the extension manifest.
- **Maintain single source of truth**: Follow the module ownership boundaries defined in [architecture.md](architecture.md).
- **Preserve state restoration shields**: Never remove the protective fallback logic in `app-shell.js` and `app-state.js`.
- **Align documentation**: Update [../AGENTS.md](../AGENTS.md), [../README.md](../README.md), and [README.md](README.md) whenever new modules or configuration options are introduced.
