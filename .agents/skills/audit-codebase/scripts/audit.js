#!/usr/bin/env node
/**
 * EPStudy Workspace Audit Script
 * Validates JS syntax, checks for duplicate function declarations across modules,
 * and validates relative markdown link integrity across all documentation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspaceRoot = path.resolve(__dirname, '../../../../');
let hasErrors = false;

console.log('==================================================');
console.log('EPStudy Automated Codebase & Documentation Audit');
console.log('Workspace Root:', workspaceRoot);
console.log('==================================================\n');

// 1. Check JavaScript Syntax
console.log('[1/3] Checking JavaScript syntax with node -c...');
const jsFiles = [
  ...fs.readdirSync(workspaceRoot).filter(f => f.endsWith('.js')).map(f => path.join(workspaceRoot, f)),
  ...fs.readdirSync(path.join(workspaceRoot, 'extension')).filter(f => f.endsWith('.js')).map(f => path.join(workspaceRoot, 'extension', f))
];

let syntaxPassed = 0;
for (const file of jsFiles) {
  const rel = path.relative(workspaceRoot, file);
  try {
    execSync(`node -c "${file}"`, { stdio: 'pipe' });
    syntaxPassed++;
  } catch (err) {
    console.error(`  [FAIL] Syntax error in ${rel}:`, err.message);
    hasErrors = true;
  }
}
console.log(`  [OK] ${syntaxPassed}/${jsFiles.length} JavaScript files passed syntax validation.\n`);

// 2. Check for Duplicate Function Implementations
console.log('[2/3] Auditing function definitions across modules and index.html...');
const rootFiles = fs.readdirSync(workspaceRoot).filter(f => (f.endsWith('.js') && f.startsWith('app-')) || f === 'index.html');
const funcDefinitions = {};

for (const f of rootFiles) {
  const content = fs.readFileSync(path.join(workspaceRoot, f), 'utf8');
  // Match standalone function definitions
  const matches = [...content.matchAll(/(?:function\s+([a-zA-Z0-9_]+)\s*\(|(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:function|\([^)]*\)\s*=>))/g)];
  for (const m of matches) {
    const fn = m[1] || m[2];
    if (!fn || fn.startsWith('EPSTUDY_')) continue;
    if (!funcDefinitions[fn]) funcDefinitions[fn] = [];
    if (!funcDefinitions[fn].includes(f)) funcDefinitions[fn].push(f);
  }
}

// Certain functions may have intentional thin compatibility delegations in index.html or defensive shields
const allowedDuplicates = new Set([
  'saveState',             // index.html delegates to EPSTUDY_APP_SHELL.saveState
  'isValidTime',           // Defensive fallback in app-state and app-helpers
  'timerTaskOptions',      // Timer helpers with inline legacy binding
  'syncTimerTaskSelectors',
  'loadTaskInTimer',
  'clearTimerTask',
  'updateTimerUi',
  'setTimerFromMinutes',
  'resetFocusTimer',
  'toggleTimer',
  'notifyTimerFinished',
  'completeSession',
  'toMinutes',
  'normalizeAssignmentTitle',
  'getAppConfig',
  'getAppHelpers',
  'safeEscapeHtml',
  'safeGetCourseById',
  'safeSaveState',
  'safeRenderAll',
  'safeIsActionable',
  'safeNormalizeDueDate',
  'getState',
  'getTaskRemainingMinutes',
  'getStudyChunkMinutes'
]);

let unallowedDuplicates = 0;
for (const [fn, files] of Object.entries(funcDefinitions)) {
  if (files.length > 1 && !allowedDuplicates.has(fn)) {
    console.warn(`  [WARN] Potential unexpected duplicate function '${fn}' in: ${files.join(', ')}`);
    unallowedDuplicates++;
  }
}
if (unallowedDuplicates === 0) {
  console.log('  [OK] No unexpected function duplicate definitions detected across extracted modules.\n');
} else {
  console.log(`  [NOTICE] Found ${unallowedDuplicates} unexpected duplicate function definitions.\n`);
}

// 3. Check Markdown Relative Link Integrity
console.log('[3/3] Checking relative links across markdown documentation...');
function findMdFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMdFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

const mdFiles = findMdFiles(workspaceRoot);
let totalLinksChecked = 0;
let brokenLinks = 0;

for (const file of mdFiles) {
  const relFile = path.relative(workspaceRoot, file);
  const content = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  const matches = [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];

  for (const [, , link] of matches) {
    if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('#') || link.startsWith('chrome:') || link.startsWith('mailto:')) {
      continue;
    }
    const cleanPath = link.split('#')[0].trim();
    if (!cleanPath) continue;

    totalLinksChecked++;
    const resolvedPath = path.resolve(dir, cleanPath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`  [FAIL] Broken link in ${relFile}: "${link}" -> Target not found: ${resolvedPath}`);
      brokenLinks++;
      hasErrors = true;
    }
  }
}

if (brokenLinks === 0) {
  console.log(`  [OK] All ${totalLinksChecked} relative markdown links across ${mdFiles.length} files verified successfully.\n`);
} else {
  console.error(`  [FAIL] Found ${brokenLinks} broken relative link(s).\n`);
}

// Summary
console.log('==================================================');
if (hasErrors) {
  console.error('Audit completed with ERRORS.');
  process.exit(1);
} else {
  console.log('Audit completed successfully. All checks passed!');
  process.exit(0);
}
