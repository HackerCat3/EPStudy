(() => {
  const getState = () => window.state || (window.EPSTUDY_APP_STATE ? window.EPSTUDY_APP_STATE.loadState() : { tasks: [] });
  const isActionable = task => typeof window.isActionableTask === "function" ? window.isActionableTask(task) : Boolean(task && !task.completed);
  const escapeHtml = value => typeof window.escapeHtml === "function" ? window.escapeHtml(value) : String(value ?? "");
  const dueDate = value => typeof window.normalizeDueDate === "function" ? window.normalizeDueDate(value) : String(value || "");
  const save = () => typeof window.saveState === "function" ? window.saveState() : window.EPSTUDY_APP_SHELL?.saveState?.();
  const render = () => typeof window.renderAll === "function" && window.renderAll();
  const notify = (message, type, duration) => typeof window.addNotification === "function" && window.addNotification(message, type, duration);
  const confetti = count => typeof window.emitConfetti === "function" && window.emitConfetti(count);

  if (typeof window.timerDurationSeconds === "undefined") window.timerDurationSeconds = 25 * 60;
  if (typeof window.timerRemainingSeconds === "undefined") window.timerRemainingSeconds = window.timerDurationSeconds;
  if (typeof window.timerInterval === "undefined") window.timerInterval = null;
  if (typeof window.lastAutoFilledTaskId === "undefined") window.lastAutoFilledTaskId = null;

  function getTaskRemainingMinutes(task) {
    if (!task || task.completed) return 0;
    const estimated = Math.max(1, Number(task.estimatedMinutes) || 25);
    const remaining = Number(task.remainingMinutes);
    return Math.max(1, Number.isFinite(remaining) && remaining > 0 ? remaining : estimated);
  }

  function getStudyChunkMinutes(task) { return Math.min(60, getTaskRemainingMinutes(task)); }

  function timerTaskOptions() {
    return (getState().tasks || []).filter(task => isActionable(task) && !task.completed).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  function syncTimerTaskSelectors(selectedId = getState().selectedTaskId || "") {
    const options = timerTaskOptions();
    const html = `<option value="">No task loaded</option>${options.map(task => `<option value="${escapeHtml(task.id)}">${escapeHtml(task.title)} - ${dueDate(task.dueDate)}</option>`).join("")}`;
    ["timerTaskSelect", "timerExpandedTaskSelect"].forEach(id => {
      const select = document.getElementById(id);
      if (select) { select.innerHTML = html; select.value = options.some(task => task.id === selectedId) ? selectedId : ""; }
    });
  }

  function loadTaskInTimer(taskId) {
    const st = getState();
    const task = (st.tasks || []).find(item => isActionable(item) && !item.completed && item.id === taskId);
    st.selectedTaskId = task ? task.id : null;
    window.lastAutoFilledTaskId = task ? task.id : null;
    if (task) setTimerFromMinutes(getStudyChunkMinutes(task), true);
    syncTimerTaskSelectors(task?.id || "");
    updateTimerUi();
    save();
    render();
  }

  function clearTimerTask() {
    const st = getState();
    st.selectedTaskId = null;
    window.lastAutoFilledTaskId = null;
    syncTimerTaskSelectors("");
  }

  function updateTimerUi() {
    const st = getState();
    const total = Math.max(1, window.timerDurationSeconds);
    const remaining = Math.max(0, window.timerRemainingSeconds);
    const selected = (st.tasks || []).find(task => isActionable(task) && task.id === st.selectedTaskId && !task.completed);
    const time = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
    const focus = selected ? `Focus target: ${selected.title} (${getTaskRemainingMinutes(selected)}m left, due ${dueDate(selected.dueDate)})` : "No task selected yet.";
    ["timerDisplay", "timerExpandedDisplay"].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = time; });
    ["timerProgress", "timerExpandedProgress"].forEach(id => { const el = document.getElementById(id); if (el) el.style.width = `${Math.min(100, ((total - remaining) / total) * 100)}%`; });
    ["timerFocusTask", "timerExpandedFocusTask"].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = focus; });
    syncTimerTaskSelectors(selected?.id || "");
  }

  function setTimerFromMinutes(minutes, silent = false) {
    const st = getState();
    const value = Math.max(1, Number(minutes) || 25);
    st.timerMinutes = value;
    window.timerDurationSeconds = value * 60;
    window.timerRemainingSeconds = window.timerDurationSeconds;
    ["timerInput", "timerExpandedInput"].forEach(id => { const el = document.getElementById(id); if (el) el.value = String(value); });
    updateTimerUi();
    const hint = document.getElementById("timerHint");
    if (hint && !silent) hint.textContent = `Timer set to ${value} minutes.`;
    save();
  }

  function resetFocusTimer() {
    clearInterval(window.timerInterval);
    window.timerInterval = null;
    clearTimerTask();
    setTimerFromMinutes(getState().timerMinutes, true);
    const hint = document.getElementById("timerHint");
    if (hint) hint.textContent = "Timer reset. No task loaded.";
    render();
  }

  function toggleTimer() {
    const button = document.getElementById("startPauseBtn");
    if (window.timerInterval) {
      clearInterval(window.timerInterval);
      window.timerInterval = null;
      if (button) button.textContent = "Resume Focus";
      return;
    }
    if (window.timerRemainingSeconds <= 0) window.timerRemainingSeconds = window.timerDurationSeconds;
    window.timerInterval = window.setInterval(() => {
      window.timerRemainingSeconds -= 1;
      updateTimerUi();
      if (window.timerRemainingSeconds <= 0) completeSession();
    }, 1000);
    if (button) button.textContent = "Pause Timer";
  }

  function notifyTimerFinished(doneTask, finishedTask = true) {
    const st = getState();
    if (!st.notificationSettings?.timerdone) return;
    const message = doneTask ? (finishedTask ? `Focus timer finished. "${doneTask.title}" completed.` : `Focus timer finished. Chunk complete for "${doneTask.title}".`) : "Focus timer finished. Session logged.";
    notify(message, "info", 8000);
  }

  function completeSession(overrideMinutes = null) {
    clearInterval(window.timerInterval);
    window.timerInterval = null;
    const st = getState();
    st.sessionsCompleted = Number(st.sessionsCompleted || 0) + 1;
    st.focusMinutes = Number(st.focusMinutes || 0) + (overrideMinutes === null ? Math.max(1, Math.round(window.timerDurationSeconds / 60)) : Math.max(1, Number(overrideMinutes)));
    const task = (st.tasks || []).find(item => isActionable(item) && item.id === st.selectedTaskId && !item.completed);
    let finished = false;
    if (task) {
      task.remainingMinutes = Math.max(0, getTaskRemainingMinutes(task) - Math.round(window.timerDurationSeconds / 60));
      finished = task.remainingMinutes === 0;
      if (finished) task.completed = true;
    }
    clearTimerTask();
    notifyTimerFinished(task, finished);
    confetti(100);
    setTimerFromMinutes(st.timerMinutes, true);
    render();
  }

  window.EPSTUDY_APP_TIMER = { timerTaskOptions, syncTimerTaskSelectors, loadTaskInTimer, clearTimerTask, updateTimerUi, setTimerFromMinutes, resetFocusTimer, toggleTimer, notifyTimerFinished, completeSession };
  Object.assign(window, { timerTaskOptions, syncTimerTaskSelectors, loadTaskInTimer, clearTimerTask, updateTimerUi, setTimerFromMinutes, resetFocusTimer, toggleTimer, notifyTimerFinished, completeSession, getTaskRemainingMinutes, getStudyChunkMinutes });
})();
