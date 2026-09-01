(() => {
  function isDashboardSectionVisible(key) {
    if (state.dashboardSections[key] === false) return false;
    if (key === "schedule" && isWeekend(new Date())) return false;
    return true;
  }

  function renderDashboardSections() {
    document.querySelectorAll("[data-dashboard-section]").forEach(section => {
      const key = section.dataset.dashboardSection;
      const visible = isDashboardSectionVisible(key);
      const startsCollapsed = Boolean(state.dashboardExpansionSections?.[key]);
      const expanded = Boolean(state.dashboardExpandedSections?.[key]);
      let toggle = section.previousElementSibling;
      if (!toggle || toggle.dataset.dashboardExpand !== key) {
        toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "dashboard-expander";
        toggle.dataset.dashboardExpand = key;
        section.parentElement?.insertBefore(toggle, section);
      }
      toggle.textContent = DASHBOARD_SECTION_LABELS[key] || key;
      toggle.classList.toggle("visible", visible && startsCollapsed && !expanded);
      toggle.setAttribute("aria-expanded", String(expanded));
      let collapse = section.querySelector(":scope > [data-dashboard-collapse]");
      if (!collapse) {
        collapse = document.createElement("button");
        collapse.type = "button";
        collapse.className = "button dashboard-collapse";
        collapse.dataset.dashboardCollapse = key;
        collapse.textContent = "Collapse";
        section.insertBefore(collapse, section.firstChild);
      }
      collapse.classList.toggle("visible", visible && startsCollapsed && expanded);
      section.classList.toggle("is-hidden", !visible);
      section.classList.toggle("dashboard-collapsed", visible && startsCollapsed && !expanded);
      const row = section.closest("[data-dashboard-row]");
      const visibleCount = row
        ? Array.from(row.querySelectorAll("[data-dashboard-section]")).filter(s => isDashboardSectionVisible(s.dataset.dashboardSection)).length
        : 1;
      const layout = state.dashboardLayout || {};
      const savedSpan = Number(layout[key]);
      const defaultSpan = Math.max(3, Math.floor(12 / Math.max(1, visibleCount)));
      const editSpan = Number.isFinite(savedSpan) && savedSpan > 0 ? savedSpan : defaultSpan;
      section.style.setProperty("--dashboard-span", String(Math.min(12, Math.max(1, editSpan))));
    });
    document.querySelectorAll("[data-dashboard-toggle]").forEach(input => {
      input.checked = state.dashboardSections[input.dataset.dashboardToggle] !== false;
    });
    document.querySelectorAll("[data-dashboard-expand-toggle]").forEach(input => {
      input.checked = Boolean(state.dashboardExpansionSections?.[input.dataset.dashboardExpandToggle]);
    });
    document.querySelectorAll("[data-dashboard-row]").forEach(row => {
      const visibleCount = Array.from(row.querySelectorAll("[data-dashboard-section]"))
        .filter(section => isDashboardSectionVisible(section.dataset.dashboardSection))
        .length;
      row.dataset.visibleCount = String(visibleCount);
      row.style.setProperty("--dashboard-visible-count", String(Math.max(1, visibleCount)));
    });
  }

  function renderHeaderStats() {
    const hs = document.getElementById("heroSessions"); if (hs) hs.textContent = String(state.sessionsCompleted);
    const hm = document.getElementById("heroMinutes"); if (hm) hm.textContent = String(state.focusMinutes);
    const hstr = document.getElementById("heroStreak"); if (hstr) hstr.textContent = `${state.streakDays}`;
  }

  function renderScheduleCard() {
    updateCurrentPeriod();
    const status = getScheduleStatus(), avail = getAvailabilityStatus();
    const chip = document.getElementById("scheduleChip"), prim = document.getElementById("schedulePrimary"), prog = document.getElementById("scheduleProgress"), timeline = document.getElementById("scheduleTimeline");
    if (!chip || !prim || !prog || !timeline) return;
    
    const currentPeriodElem = document.getElementById("currentPeriodDisplay");
    if (currentPeriodElem && state.currentPeriod) {
      currentPeriodElem.textContent = `Currently: ${state.currentPeriod.period} (${state.currentPeriod.times})`;
      currentPeriodElem.style.color = /lunch|advisor|club|activit/i.test(state.currentPeriod.period) ? 'var(--muted)' : 'var(--gold)';
    }

    if (status.weekend) {
      chip.className = "status-chip free"; chip.textContent = "Weekend";
      prim.textContent = "Enjoy your weekend! See you at school tomorrow!";
      prog.style.width = "100%";
      timeline.innerHTML = "<p class='empty'>No school periods today.</p>";
      return;
    }
    
    if (status.inClass && !status.isStudyHall) {
      chip.className = "status-chip class"; chip.textContent = "In Class";
      prim.textContent = `${status.currentBlock.label} ends in ${status.minutesLeft}m`;
      prog.style.width = `${status.progress}%`;
    } else {
      chip.className = "status-chip free"; chip.textContent = "Free Block";
      if (status.isStudyHall) prim.textContent = `Study Hall active! ${status.freeMinutes}m left.`;
      else if (avail.isFreeNow && avail.currentWindow) prim.textContent = `Study Window: ${toTimeLabel(avail.currentWindow.start)}-${toTimeLabel(avail.currentWindow.end)}`;
      else if (avail.nextWindow) prim.textContent = `Next block: ${toTimeLabel(avail.nextWindow.start)}-${toTimeLabel(avail.nextWindow.end)}`;
      else if (status.nextBlock) prim.textContent = `${status.freeMinutes}m until ${status.nextBlock.label}`;
      else prim.textContent = "Schedule complete.";
      prog.style.width = "100%";
    }

    const now = nowMinutes(new Date());
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaysEvents = (state.canvasEvents || []).filter(e => e.start_at && e.start_at.startsWith(todayStr)).map(e => {
        const dStart = new Date(e.start_at);
        const dEnd = new Date(e.end_at);
        return { id: `evt-${e.id}`, label: e.title, start: `${String(dStart.getHours()).padStart(2, '0')}:${String(dStart.getMinutes()).padStart(2, '0')}`, end: `${String(dEnd.getHours()).padStart(2, '0')}:${String(dEnd.getMinutes()).padStart(2, '0')}`, isCanvas: true };
    });

    const liveBlocks = normalizeScheduleBlockTimes(scheduleBlocksForDivision(getTodaysEpsSchedule()));
    let schedulesToDisplay = liveBlocks.length ? [...liveBlocks, ...todaysEvents] : [...SCHOOL_SCHEDULE, ...todaysEvents];
    const combinedSchedule = schedulesToDisplay.sort((a, b) => scheduleMinuteValue(a, "start") - scheduleMinuteValue(b, "start"));

    timeline.innerHTML = combinedSchedule.map(block => {
      const start = scheduleMinuteValue(block, "start");
      const end = scheduleMinuteValue(block, "end");
      let stateClass = "";
      if (now >= end) stateClass = "past";
      else if (now >= start && now < end) stateClass = "active";
      const labelText = block.isCanvas ? `Canvas: ${escapeHtml(block.label)}` : escapeHtml(block.label);
      return `<div class="timeline-item ${stateClass}"><span class="timeline-time">${escapeHtml(block.displayStart || toTimeLabel(block.start))}</span><span class="timeline-name">${labelText}</span></div>`;
    }).join("");
  }

  function renderTaskList() {
    const container = document.getElementById("taskList");
    if (!container) return;
    const actionableTasks = state.tasks.filter(t => isActionableTask(t) && !t.completed);
    if (!actionableTasks.length) return container.innerHTML = "<p class='empty'>No tasks found. Add a task to build your queue.</p>";
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneAndHalfWeeksAhead = new Date(now.getTime() + 10.5 * 24 * 60 * 60 * 1000);
    
    const filtered = actionableTasks.filter(t => {
      const taskDate = new Date(t.dueDate);
      return taskDate.getTime() >= oneWeekAgo.getTime() && taskDate.getTime() <= oneAndHalfWeeksAhead.getTime();
    });
    
    if (!filtered.length) return container.innerHTML = "<p class='empty'>No tasks in the next 1.5 weeks. Great job staying ahead!</p>";
    
    const sorted = [...filtered].sort((a, b) => a.completed !== b.completed ? (a.completed ? 1 : -1) : new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    container.innerHTML = sorted.map(t => {
      const sel = t.id === state.selectedTaskId, od = !t.completed && isOverdue(t);
      const c = getCourseById(t.courseId);
      const type = getTaskType(t);
      const isCanvasTask = String(t.source || "").toLowerCase() === "canvas";
      const typePill = type ? `<span class='pill ${type === "ma" ? "ma" : type === "qa" ? "qa" : ""}'>${taskTypeLabel(type)}</span>` : "";
      const cPill = c ? `<span class='pill' style='background:${c.color}15;color:${c.color};border-color:${c.color}40'>${escapeHtml(c.code || c.name)}</span>` : "";
      const sourceLabels = { canvas: "Canvas", membean: "Membean" };
      const sPill = sourceLabels[t.source] ? `<span class='pill ${t.source}'>${sourceLabels[t.source]}</span>` : "";
      const hasComment = Boolean((Array.isArray(t.comments) && t.comments.length) || t.comment);
      return `<div class="task-item ${sel ? "selected" : ""} ${t.completed ? "completed" : ""} ${type}">
        <div class="task-main"><div class="task-title">${escapeHtml(t.title)}</div><div class="task-meta"><span>${t.estimatedMinutes}m</span><span>&bull;</span><span>${normalizeDueDate(t.dueDate)}</span>${typePill}${cPill}${od ? "<span class='pill overdue'>Overdue</span>" : ""}${sPill}</div></div>
        <div class="task-actions">${isCanvasTask ? `<button class="button" data-action="info" data-id="${t.id}" type="button">More Info</button>` : ""}${hasComment ? `<button class="button" data-action="comment" data-id="${t.id}" type="button">Read Comment</button>` : ""}<button class="button" data-action="load-timer" data-id="${t.id}" type="button">Load in Timer</button><button class="icon-button" data-action="edit" data-id="${t.id}" title="Edit Time">Min</button><button class="icon-button" data-action="toggle" data-id="${t.id}" title="Toggle Done">${t.completed ? "↺" : "✓"}</button><button class="icon-button" style="color:var(--danger)" data-action="delete" data-id="${t.id}" title="Delete">✕</button></div>
      </div>`;
    }).join("");
  }

  function renderSmartCard() {
    const smart = getSmartTaskChoices(new Date(), 5), msg = document.getElementById("smartMessage"), meta = document.getElementById("smartTaskMeta");
    if (!msg || !meta) return;
    const useBtn = document.getElementById("useSmartTaskBtn");
    msg.textContent = smart.message;
    if (useBtn) useBtn.disabled = !smart.tasks.length;
    if (!smart.tasks.length) {
      meta.innerHTML = state.smartDismissedTaskIds.length ? `<button class="button" type="button" data-smart-clear-dismissed>Show dismissed tasks again</button>` : "";
      updateTimerUi();
      return;
    }
    meta.innerHTML = smart.tasks.map((task, index) => {
      const course = getCourseById(task.courseId);
      const type = getTaskType(task);
      const label = taskTypeLabel(type);
      return `<div class="smart-item ${type}" data-task-id="${task.id}"><span class="smart-rank">${index + 1}</span><div class="smart-main"><div class="smart-title">${escapeHtml(task.title)}</div><div class="smart-meta">${label ? `${label} • ` : ""}${task.estimatedMinutes}m • ${normalizeDueDate(task.dueDate)}${course ? ` • ${escapeHtml(course.code || course.name)}` : ""}${task.smartReason ? ` • ${escapeHtml(task.smartReason)}` : ""}</div><div class="smart-actions"><label class="smart-dismiss" title="Hide this task from Smart Suggestion" data-smart-dismiss="${task.id}"><input type="checkbox" data-smart-dismiss="${task.id}" /> Dismiss</label><button class="button" type="button" data-smart-info="${task.id}">More</button><button class="button" type="button" data-smart-select="${task.id}">Load</button></div></div><button class="smart-toggle" type="button" data-smart-toggle aria-expanded="false">▾</button></div>`;
    }).join("");
    updateTimerUi();
  }

  function getMembeanProgress() {
    const membeanTasks = state.tasks.filter(task => task.source === "membean");
    const taskWithProgress = membeanTasks.find(task => task.progress && Number.isFinite(Number(task.progress.completedSessions)));
    const completedSessions = Math.max(0, Math.min(3, state.membeanSessionsCompleted || Number(taskWithProgress?.progress?.completedSessions) || 0));
    const activeTask = membeanTasks.find(task => !task.completed) || taskWithProgress || null;
    return { completedSessions, requiredSessions: 3, minutesPerSession: 10, activeTask };
  }

  function renderMembeanCard() {
    if (!state.membeanEnabled) return;
    const primary = document.getElementById("membeanPrimary");
    const detail = document.getElementById("membeanDetail");
    const progress = document.getElementById("membeanProgress");
    if (!primary || !detail || !progress) return;

    const info = getMembeanProgress();
    const pct = Math.min(100, Math.round((info.completedSessions / info.requiredSessions) * 100));
    progress.style.width = `${pct}%`;
    
    if (info.completedSessions >= 3) {
      primary.textContent = `✓ ${info.completedSessions}/${info.requiredSessions} Membean sessions complete!`;
      primary.style.color = "#10b981";
      detail.textContent = "All sessions completed for this week. Great job!";
    } else {
      primary.textContent = `${info.completedSessions}/${info.requiredSessions} Membean sessions complete`;
      primary.style.color = "var(--text-dark)";
      if (info.activeTask) detail.textContent = `${info.activeTask.title} Due ${normalizeDueDate(info.activeTask.dueDate)}.`;
      else detail.textContent = `Requirement: 3 sessions of 10 minutes each, due Saturday morning. ${3 - info.completedSessions} session${3 - info.completedSessions === 1 ? "" : "s"} remaining.`;
    }
  }

  window.EPSTUDY_APP_DASHBOARD = {
    isDashboardSectionVisible,
    renderDashboardSections,
    renderHeaderStats,
    renderScheduleCard,
    renderTaskList,
    renderSmartCard,
    getMembeanProgress,
    renderMembeanCard
  };
})();
