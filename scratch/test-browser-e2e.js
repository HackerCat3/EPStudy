const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const workspaceRoot = path.resolve(__dirname, '..');
const PORT = 8088;
const CDP_PORT = 9223;
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// 1. Simple static file server
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(workspaceRoot, reqPath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*'
  });
  fs.createReadStream(filePath).pipe(res);
});

// Helper for CDP JSON requests
function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBrowserTest() {
  console.log("==================================================");
  console.log("Starting EPStudy Headless Browser E2E Test Suite");
  console.log("==================================================");

  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`[HTTP] Static preview server running at http://localhost:${PORT}/`);

  const tmpUserDir = path.join(workspaceRoot, 'scratch', 'chrome_temp_profile');
  if (fs.existsSync(tmpUserDir)) {
    try { fs.rmSync(tmpUserDir, { recursive: true, force: true }); } catch (e) {}
  }
  fs.mkdirSync(tmpUserDir, { recursive: true });

  const chromeArgs = [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpUserDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-gpu',
    'about:blank'
  ];

  console.log(`[CHROME] Launching ${CHROME_PATH}...`);
  const chromeProcess = spawn(CHROME_PATH, chromeArgs, { stdio: 'ignore' });

  // Wait for CDP to respond
  let versionInfo = null;
  for (let i = 0; i < 30; i++) {
    await delay(300);
    try {
      versionInfo = await getJson(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (versionInfo) break;
    } catch (e) {}
  }

  if (!versionInfo) {
    chromeProcess.kill();
    server.close();
    throw new Error("Could not connect to Chrome DevTools port!");
  }
  console.log(`[CHROME] Connected to ${versionInfo.Browser}`);

  const targets = await getJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const wsUrl = pageTarget.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const pendingRequests = new Map();
  const pageErrors = [];
  const consoleLogs = [];

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject, method });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const result = await sendCommand('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (result.exceptionDetails) {
      const err = new Error(result.exceptionDetails.text || result.exceptionDetails.exception?.description || 'Evaluation error');
      err.details = result.exceptionDetails;
      throw err;
    }
    return result.result ? result.result.value : undefined;
  }

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve, reject } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const details = msg.params.exceptionDetails;
        const text = details.exception?.description || details.text || 'Unknown uncaught exception';
        console.error(`  [PAGE EXCEPTION]: ${text}`);
        pageErrors.push(text);
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        const args = (msg.params.args || []).map(a => a.value !== undefined ? a.value : a.description).join(' ');
        if (msg.params.type === 'error') {
          console.error(`  [PAGE CONSOLE ERROR]: ${args}`);
          pageErrors.push(args);
        } else {
          consoleLogs.push(`[${msg.params.type}] ${args}`);
        }
      }
    } catch (e) {}
  };

  await sendCommand('Runtime.enable');
  await sendCommand('Page.enable');
  await sendCommand('Console.enable');

  try {
    console.log(`\n--- Test Step 1: Navigate to http://localhost:${PORT}/ ---`);
    await sendCommand('Page.navigate', { url: `http://localhost:${PORT}/` });
    await delay(1500);

    const readyState = await evaluate('document.readyState');
    console.log(`Document readyState: ${readyState}`);
    if (readyState !== 'complete') throw new Error("Document failed to reach readyState 'complete'");

    console.log("\n--- Test Step 2: Verify Core App & State Initialization ---");
    const initCheck = await evaluate(`({
      hasState: Boolean(window.state),
      coursesCount: window.state?.courses?.length || 0,
      tasksCount: window.state?.tasks?.length || 0,
      currentDivision: window.state?.schoolDivision,
      tasksHomeVisible: document.getElementById('page-tasks')?.classList.contains('active'),
      dashboardHidden: getComputedStyle(document.getElementById('page-dashboard')).display === 'none',
      hasTimer: Boolean(window.EPSTUDY_APP_TIMER),
      hasCalendar: Boolean(window.EPSTUDY_APP_CALENDAR),
      hasDashboard: Boolean(window.EPSTUDY_APP_DASHBOARD),
      hasNotifications: Boolean(window.EPSTUDY_APP_NOTIFICATIONS)
    })`);
    console.log("Initial state check:", initCheck);
    if (!initCheck.hasState) throw new Error("window.state not found!");
    if (initCheck.coursesCount === 0) throw new Error("No default courses found in state!");
    if (!initCheck.tasksHomeVisible || !initCheck.dashboardHidden) throw new Error("Tasks home did not replace the Dashboard view!");
    if (!initCheck.hasTimer) throw new Error("EPSTUDY_APP_TIMER not found!");
    console.log("✓ Core state and modules successfully initialized.");

    console.log("\n--- Test Step 3: Test Navigation Across All Main Views ---");
    for (const page of ['calendar', 'settings', 'other', 'tasks']) {
      await evaluate(`navigate('${page}')`);
      await delay(200);
      const currentPage = await evaluate('window.state.currentPage');
      console.log(`Navigated to '${page}', current page in state: '${currentPage}'`);
      if (currentPage !== page) throw new Error(`Navigation to ${page} failed!`);
    }
    console.log("✓ Navigation across Dashboard, Calendar, Settings, and Other tabs passed without error.");

    console.log("\n--- Test Step 4: Test Calendar Views (Month & Week) ---");
    await evaluate(`navigate('calendar')`);
    await evaluate(`document.querySelector('[data-calendar-view="week"]').click()`);
    await delay(200);
    const weekView = await evaluate('window.state.calendarView');
    if (weekView !== 'week') throw new Error("Failed to switch to week view");
    await evaluate(`document.querySelector('[data-calendar-view="month"]').click()`);
    await delay(200);
    const monthView = await evaluate('window.state.calendarView');
    if (monthView !== 'month') throw new Error("Failed to switch to month view");
    console.log("✓ Calendar view switching (week/month) passed.");

    console.log("\n--- Test Step 5: Test Adding a Custom Task & Verification ---");
    const taskId = await evaluate(`(() => {
      const newTask = {
        id: "task-test-e2e-" + Date.now(),
        title: "E2E Automated Study Task",
        courseId: state.courses[0].id,
        dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        estimatedMinutes: 90,
        completed: false
      };
      state.tasks.push(newTask);
      saveState();
      renderAll();
      return newTask.id;
    })()`);
    console.log(`Added task with ID: ${taskId}`);
    const taskFound = await evaluate(`state.tasks.some(t => t.id === '${taskId}')`);
    if (!taskFound) throw new Error("Newly added task was not found in state!");
    console.log("✓ Task addition and dashboard render passed.");

    console.log("\n--- Test Step 6: Test Focus Timer Integration & 60m Chunking ---");
    await evaluate(`window.EPSTUDY_APP_TIMER.loadTaskInTimer('${taskId}')`);
    const timerStatus = await evaluate(`({
      selectedTaskId: state.selectedTaskId,
      timerMinutes: state.timerMinutes,
      duration: window.timerDurationSeconds,
      remaining: window.timerRemainingSeconds
    })`);
    console.log("Timer loaded state:", timerStatus);
    if (timerStatus.timerMinutes !== 60) {
      throw new Error(`Timer chunking failed: expected 60 minutes chunk for 90m task, got ${timerStatus.timerMinutes}`);
    }

    // Toggle timer
    await evaluate(`window.EPSTUDY_APP_TIMER.toggleTimer()`);
    const isRunning = await evaluate(`Boolean(window.timerInterval)`);
    console.log(`Timer running: ${isRunning}`);
    if (!isRunning) throw new Error("Timer failed to start running!");

    // Pause timer
    await evaluate(`window.EPSTUDY_APP_TIMER.toggleTimer()`);
    const isPaused = await evaluate(`window.timerInterval === null`);
    console.log(`Timer paused: ${isPaused}`);
    if (!isPaused) throw new Error("Timer failed to pause!");

    // Complete first 60m chunk
    await evaluate(`window.EPSTUDY_APP_TIMER.completeSession(60)`);
    const taskAfterChunk = await evaluate(`state.tasks.find(t => t.id === '${taskId}')`);
    console.log("Task after 60m chunk:", {
      title: taskAfterChunk.title,
      remainingMinutes: taskAfterChunk.remainingMinutes,
      completed: taskAfterChunk.completed
    });
    if (taskAfterChunk.completed) throw new Error("Task was marked completed prematurely after only 1 chunk!");
    if (taskAfterChunk.remainingMinutes !== 30) throw new Error(`Remaining minutes expected 30, got ${taskAfterChunk.remainingMinutes}`);
    console.log("✓ Timer chunking correctly decremented task remainingMinutes.");

    // Complete remaining 30m
    await evaluate(`window.EPSTUDY_APP_TIMER.loadTaskInTimer('${taskId}')`);
    await evaluate(`window.EPSTUDY_APP_TIMER.completeSession(30)`);
    const finalTask = await evaluate(`state.tasks.find(t => t.id === '${taskId}')`);
    console.log("Final task status:", { completed: finalTask.completed });
    if (!finalTask.completed) throw new Error("Task was not marked completed after final session!");
    console.log("✓ Task completed on final chunk session.");

    console.log("\n--- Test Step 7: Test School Division & Course Persistence on Page Reload ---");
    await evaluate(`(() => {
      state.schoolDivision = 'ms';
      state.courses.push({
        id: 'course-robotics',
        name: 'Robotics & Engineering',
        code: 'ROBO',
        color: '#f59e0b'
      });
      saveState();
    })()`);

    console.log("Reloading page to test localStorage restoration...");
    await sendCommand('Page.reload');
    await delay(1500);

    const reloadedState = await evaluate(`({
      division: state.schoolDivision,
      hasRobotics: state.courses.some(c => c.id === 'course-robotics'),
      coursesCount: state.courses.length
    })`);
    console.log("State after reload:", reloadedState);
    if (reloadedState.division !== 'ms') {
      throw new Error(`School division was wiped on reload! Expected 'ms', got '${reloadedState.division}'`);
    }
    if (!reloadedState.hasRobotics) {
      throw new Error("Custom course 'Robotics & Engineering' was wiped on reload!");
    }
    console.log("✓ Course and schoolDivision persistence across full page reload verified!");

    console.log("\n--- Test Step 8: Test Reset All Data Workflow ---");
    await evaluate(`resetAllData(true)`);
    await delay(1200);

    const postResetState = await evaluate(`({
      tasksCount: state.tasks.length,
      hasRobotics: state.courses.some(c => c.id === 'course-robotics'),
      division: state.schoolDivision
    })`);
    console.log("State after reset:", postResetState);
    if (postResetState.tasksCount !== 0) {
      throw new Error(`Tasks were not cleared after resetAllData! Count: ${postResetState.tasksCount}`);
    }
    if (postResetState.hasRobotics) {
      throw new Error("Custom course was not cleared by resetAllData!");
    }
    console.log("✓ resetAllData successfully cleared state to defaults.");

    const resetPopupState = await evaluate(`({
      tutorialSeen: state.tutorialSeen,
      welcomeOpen: document.getElementById('welcomeModal')?.classList.contains('open'),
      tutorialOpen: document.getElementById('tutorialModal')?.classList.contains('open')
    })`);
    console.log("Popup state after reset:", resetPopupState);
    if (resetPopupState.tutorialSeen) throw new Error("Reset did not restore tutorialSeen to false!");
    if (!resetPopupState.welcomeOpen && !resetPopupState.tutorialOpen) throw new Error("First-run popup did not open after reset!");
    if (resetPopupState.welcomeOpen && resetPopupState.tutorialOpen) throw new Error("Welcome and tutorial popups opened simultaneously after reset!");

    await evaluate(`finishTutorial()`);
    await sendCommand('Page.reload');
    await delay(1000);
    const normalPopupState = await evaluate(`({
      tutorialSeen: state.tutorialSeen,
      welcomeOpen: document.getElementById('welcomeModal')?.classList.contains('open'),
      tutorialOpen: document.getElementById('tutorialModal')?.classList.contains('open')
    })`);
    console.log("Popup state after normal reload:", normalPopupState);
    if (!normalPopupState.tutorialSeen) throw new Error("Completing the tutorial was not persisted!");
    if (normalPopupState.welcomeOpen || normalPopupState.tutorialOpen) {
      throw new Error("First-run popup reopened after the tutorial was completed!");
    }
    console.log("✓ First-run popup only appears after reset or before first use.");

    console.log("\n--- Test Step 9: Test Membean Weekly Reminder ---");
    const membeanReminderCheck = await evaluate(`(() => {
      state.membeanEnabled = true;
      state.notificationSettings.membean = true;
      state.membeanWeeklyDays = 3;
      state.membeanSessionsCompleted = 0;
      state.membeanReminderKey = "";
      state.notifications = [];
      renderAll();
      const firstCount = state.notifications.filter(n => String(n.message).includes("Membean reminder")).length;
      renderAll();
      const secondCount = state.notifications.filter(n => String(n.message).includes("Membean reminder")).length;
      return { firstCount, secondCount, cardHidden: document.getElementById("membeanCard")?.hidden };
    })()`);
    console.log("Membean reminder check:", membeanReminderCheck);
    if (membeanReminderCheck.firstCount !== 1) throw new Error("Membean reminder was not created when progress was behind.");
    if (membeanReminderCheck.secondCount !== 1) throw new Error("Membean reminder was duplicated on rerender.");
    if (membeanReminderCheck.cardHidden) throw new Error("Membean progress card remained hidden while enabled.");
    console.log("✓ Membean weekly reminders are actionable and deduplicated.");

    console.log("\n==================================================");
    console.log("Page Errors / Exceptions encountered during entire test run:");
    if (pageErrors.length === 0) {
      console.log("  [NONE] Zero uncaught exceptions or page console errors!");
    } else {
      console.error(`  [FAIL] Encountered ${pageErrors.length} error(s):`);
      pageErrors.forEach((e, idx) => console.error(`    ${idx + 1}. ${e}`));
      throw new Error(`Test failed with ${pageErrors.length} unhandled page error(s)`);
    }

    console.log("==================================================");
    console.log("ALL HEADLESS BROWSER E2E TESTS PASSED FLAWLESSLY! 🚀");
    console.log("==================================================");

  } finally {
    ws.close();
    chromeProcess.kill();
    server.close();
    try { fs.rmSync(tmpUserDir, { recursive: true, force: true }); } catch (e) {}
  }
}

runBrowserTest().catch(err => {
  console.error("FATAL ERROR IN TEST SUITE:", err);
  process.exit(1);
});
