(() => {
  function timerTaskOptions() {
    return state.tasks
      .filter(task => isActionableTask(task) && !task.completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  function syncTimerTaskSelectors(selectedId = state.selectedTaskId || "") {
    const options = timerTaskOptions();
    const html = `<option value="">No task loaded</option>${options.map(task => `<option value="${escapeHtml(task.id)}">${escapeHtml(task.title)} - ${normalizeDueDate(task.dueDate)}</option>`).join("")}`;
    [document.getElementById("timerTaskSelect"), document.getElementById("timerExpandedTaskSelect")].filter(Boolean).forEach(select => {
      if (select.innerHTML !== html) select.innerHTML = html;
      select.value = options.some(task => task.id === selectedId) ? selectedId : "";
    });
  }

  function loadTaskInTimer(taskId) {
    const task = state.tasks.find(t => isActionableTask(t) && !t.completed && t.id === taskId);
    if (!task) {
      state.selectedTaskId = null;
      syncTimerTaskSelectors("");
      updateTimerUi();
      saveState();
      return;
    }
    state.selectedTaskId = task.id;
    lastAutoFilledTaskId = task.id;
    setTimerFromMinutes(task.estimatedMinutes || state.timerMinutes, true);
    const th = document.getElementById("timerHint"); if (th) th.textContent = `Loaded "${task.title}" into the timer.`;
    const eth = document.getElementById("timerExpandedHint"); if (eth) eth.textContent = `Loaded "${task.title}" into the timer.`;
    saveState(); renderAll();
  }

  function clearTimerTask() {
    state.selectedTaskId = null;
    lastAutoFilledTaskId = null;
    syncTimerTaskSelectors("");
  }

  function updateTimerUi() {
    const total = Math.max(1, timerDurationSeconds);
    const pct = Math.min(100, Math.max(0, ((total - timerRemainingSeconds) / total) * 100));
    const timeStr = `${String(Math.floor(timerRemainingSeconds / 60)).padStart(2, "0")}:${String(timerRemainingSeconds % 60).padStart(2, "0")}`;
    const selected = state.tasks.find(t => isActionableTask(t) && t.id === state.selectedTaskId && !t.completed);
    if (!selected && state.selectedTaskId) state.selectedTaskId = null;
    const focusText = selected ? `Focus target: ${selected.title} (${selected.estimatedMinutes}m, due ${normalizeDueDate(selected.dueDate)})` : "No task selected yet.";

    const td = document.getElementById("timerDisplay"); if (td) td.textContent = timeStr;
    const tp = document.getElementById("timerProgress"); if (tp) tp.style.width = `${pct}%`;

    const ted = document.getElementById("timerExpandedDisplay"); if (ted) ted.textContent = timeStr;
    const tep = document.getElementById("timerExpandedProgress"); if (tep) tep.style.width = `${pct}%`;
    const expandedInput = document.getElementById("timerExpandedInput"); if (expandedInput && document.activeElement !== expandedInput) expandedInput.value = String(state.timerMinutes);
    const taskEls = [document.getElementById("timerFocusTask"), document.getElementById("timerExpandedFocusTask")].filter(Boolean);
    taskEls.forEach(el => { el.textContent = focusText; });
    syncTimerTaskSelectors(selected?.id || "");
    [
      ["timerSessionCount", state.sessionsCompleted],
      ["timerExpandedSessionCount", state.sessionsCompleted],
      ["timerMinuteCount", state.focusMinutes],
      ["timerExpandedMinuteCount", state.focusMinutes],
      ["timerStreakCount", state.streakDays],
      ["timerExpandedStreakCount", state.streakDays]
    ].forEach(([id, value]) => { const el = document.getElementById(id); if (el) el.textContent = String(value); });
    document.querySelectorAll("[data-timer-preset]").forEach(btn => btn.classList.toggle("active", Number(btn.dataset.timerPreset) === Number(state.timerMinutes)));
    document.getElementById("timerFocusShell")?.classList.toggle("running", Boolean(timerInterval && state.ambientFocusMode));
    document.querySelectorAll("#ambientFocusToggle, #ambientFocusExpandedToggle").forEach(input => { input.checked = Boolean(state.ambientFocusMode); });
  }

  function setTimerFromMinutes(mins, silent = false) {
    const m = Math.max(1, Number(mins) || 25);
    state.timerMinutes = m; timerDurationSeconds = m * 60; timerRemainingSeconds = timerDurationSeconds;
    const ti = document.getElementById("timerInput"); if (ti) ti.value = String(m);
    const tei = document.getElementById("timerExpandedInput"); if (tei) tei.value = String(m);
    updateTimerUi();
    const th = document.getElementById("timerHint"); if (th && !silent) th.textContent = `Timer set to ${m} minutes.`;
    saveState();
  }

  function resetFocusTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    clearTimerTask();
    publishFocusShield();
    setTimerFromMinutes(state.timerMinutes, true);
    const b = document.getElementById("startPauseBtn"); if (b) b.textContent = "Start Focus";
    const eb = document.getElementById("startPauseExpandedBtn"); if (eb) eb.textContent = "Start Focus";
    const th = document.getElementById("timerHint"); if (th) th.textContent = "Timer reset. No task loaded.";
    const eth = document.getElementById("timerExpandedHint"); if (eth) eth.textContent = "Timer reset. No task loaded.";
    saveState(); renderAll();
  }

  function toggleTimer() {
    const btn = document.getElementById("startPauseBtn");
    const th = document.getElementById("timerHint");
    if (timerInterval) {
      clearInterval(timerInterval); timerInterval = null;
      publishFocusShield();
      if (btn) btn.textContent = "Resume Focus";
      const ebtn = document.getElementById("startPauseExpandedBtn"); if (ebtn) ebtn.textContent = "Resume Focus";
      if (th) th.textContent = "Timer paused.";
      const eth = document.getElementById("timerExpandedHint"); if (eth) eth.textContent = "Timer paused.";
    } else {
      if (timerRemainingSeconds <= 0) timerRemainingSeconds = timerDurationSeconds;
      timerInterval = window.setInterval(() => {
        timerRemainingSeconds--; updateTimerUi();
        if (timerRemainingSeconds <= 0) { timerRemainingSeconds = 0; updateTimerUi(); completeSession(); }
      }, 1000);
      if (btn) btn.textContent = "Pause Timer";
      const ebtn = document.getElementById("startPauseExpandedBtn"); if (ebtn) ebtn.textContent = "Pause Timer";
      if (th) th.textContent = "Focus session active.";
      const eth = document.getElementById("timerExpandedHint"); if (eth) eth.textContent = state.ambientFocusMode ? "Immersive focus mode active." : "Focus session active.";
      publishFocusShield();
    }
    updateTimerUi();
  }

  function notifyTimerFinished(doneTask) {
    if (!state.notificationSettings.timerdone) return;
    const msg = doneTask ? `Focus timer finished. "${doneTask.title}" marked complete.` : "Focus timer finished. Session logged.";
    addNotification(msg, "info", 8000);
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification("Focus timer complete", { body: msg });
    }
  }

  function completeSession(overrideMins = null) {
    clearInterval(timerInterval); timerInterval = null;
    publishFocusShield();
    state.sessionsCompleted++;
    state.focusMinutes += (overrideMins === null ? Math.max(1, Math.round(timerDurationSeconds / 60)) : Math.max(1, Number(overrideMins)));

    const today = new Date().toISOString().slice(0, 10);
    if (state.lastSessionDate && state.lastSessionDate !== today) {
      const diff = Math.round((new Date(today) - new Date(state.lastSessionDate)) / 86400000);
      state.streakDays = diff === 1 ? state.streakDays + 1 : 1;
    } else if (!state.lastSessionDate) state.streakDays = 1;
    state.lastSessionDate = today;

    let doneTask = state.tasks.find(t => isActionableTask(t) && t.id === state.selectedTaskId && !t.completed);
    if (doneTask) doneTask.completed = true;
    clearTimerTask();

    emitConfetti(100);
    const th = document.getElementById("timerHint");
    if (th) th.textContent = doneTask ? `Done! "${doneTask.title}" marked complete. No task loaded.` : "Session logged. No task loaded.";
    const eth = document.getElementById("timerExpandedHint");
    if (eth) eth.textContent = doneTask ? `Done! "${doneTask.title}" marked complete. No task loaded.` : "Session logged. No task loaded.";
    notifyTimerFinished(doneTask);
    setTimerFromMinutes(state.timerMinutes, true);

    const btn = document.getElementById("startPauseBtn");
    if (btn) btn.textContent = "Start Focus";
    const ebtn = document.getElementById("startPauseExpandedBtn");
    if (ebtn) ebtn.textContent = "Start Focus";
    saveState(); renderAll();
  }

  window.EPSTUDY_APP_TIMER = {
    timerTaskOptions,
    syncTimerTaskSelectors,
    loadTaskInTimer,
    clearTimerTask,
    updateTimerUi,
    setTimerFromMinutes,
    resetFocusTimer,
    toggleTimer,
    notifyTimerFinished,
    completeSession
  };
})();
