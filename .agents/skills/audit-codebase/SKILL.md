---
name: audit-codebase
description: >-
  Audits the EPStudy codebase for JavaScript syntax validity, checks for unexpected
  duplicate function declarations between index.html and extracted app modules, and verifies
  relative markdown link integrity across all documentation files. Use this skill before
  completing tasks or after refactoring modules or documentation.
---

# Audit Codebase Skill

This workspace skill provides an automated verification workflow to ensure code health, prevent architectural regressions (such as duplicated functions across modules), and maintain documentation link integrity.

## Procedures

### 1. Run the Automated Workspace Audit Script

Execute the bundled Node.js verification script:

```powershell
node .agents/skills/audit-codebase/scripts/audit.js
```

This script checks:
1. **JavaScript Syntax**: Validates all root `app-*.js` files and `extension/*.js` files using `node -c`.
2. **Duplicate Code Audit**: Inspects function declarations in `index.html` and extracted modules to ensure extracted features maintain a single source of truth.
3. **Markdown Link Integrity**: Scans all `*.md` files in the repository and verifies that every relative link resolves to an existing file.

### 2. Manual Verification Recipes

If you need to run specific checks individually:

- **Check JS syntax across all scripts**:
  ```powershell
  Get-ChildItem -Filter *.js | ForEach-Object { node -c $_.FullName }
  Get-ChildItem -Path extension -Filter *.js | ForEach-Object { node -c $_.FullName }
  ```

- **Inspect git working tree**:
  ```powershell
  git status
  ```

- **Verify single source of truth**:
  Ensure that any function moved into an extracted module (such as `app-dashboard.js`, `app-calendar.js`, etc.) is referenced in `index.html` only via the canonical namespace (e.g. `EPSTUDY_APP_DASHBOARD`) or a single delegation alias.

