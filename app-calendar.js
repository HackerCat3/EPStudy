(() => {
  function getCalendarAnchorDate() {
    return new Date(state.calendarYear, state.calendarMonth, state.calendarDay || 1);
  }

  function getWeekStart(date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());
    return start;
  }

  function formatCalendarRange(start, end) {
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString([], { month: "long", day: "numeric" })}-${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${start.toLocaleDateString([], { month: "short", day: "numeric" })} - ${end.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;
  }

  function setCalendarLabels(text) {
    const cl = document.getElementById("calendarLabel"); if (cl) cl.textContent = text;
    const clf = document.getElementById("calendarLabelFull"); if (clf) clf.textContent = text;
    document.querySelectorAll("[data-calendar-view]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.calendarView === state.calendarView);
    });
  }

  function getCalendarTaskMap() {
    cleanupCalendarOverlaps(true);
    const tasksForCalendar = getUniqueCalendarTasks();
    const eventItems = (state.canvasEvents || []).map(e => {
      const due = e.start_at || e.due_at || e.start || null;
      return due ? { title: e.title, dueDate: due, courseId: e.courseId || "", completed: Boolean(e.crossed), source: "canvas-event", externalKey: e.externalKey || `canvas-event:${e.id}` } : null;
    }).filter(Boolean);
    const all = [...tasksForCalendar, ...eventItems];
    return all.reduce((acc, t) => {
      const k = localDateKey(t.dueDate);
      if (k) { acc[k] = acc[k] || []; acc[k].push(t); }
      return acc;
    }, {});
  }

  function renderCalendarTaskPill(task) {
    const c = getCourseById(task.courseId);
    const opacity = task.completed ? "0.55" : "1";
    const textDecoration = task.completed ? "line-through" : "none";
    return `<div class="calendar-task ${task.source === "canvas" ? "canvas" : ""}" style="background:${c ? c.color : "var(--navy-primary)"}; color:#fff; opacity:${opacity}; text-decoration:${textDecoration};">${escapeHtml(task.title)}</div>`;
  }

  function renderMonthCalendar(grid, full = false) {
    const y = state.calendarYear, m = state.calendarMonth;
    setCalendarLabels(new Date(y, m, 1).toLocaleDateString([], { month: "long", year: "numeric" }));
    grid.classList.remove("week-view");
    grid.style.removeProperty("--week-cell-height");
    grid.classList.toggle("full-size", full);
    const offset = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), prevDays = new Date(y, m, 0).getDate();
    const map = getCalendarTaskMap();
    const cellClass = full ? "full-calendar-cell" : "day-cell";
    let html = DAY_LABELS.map(d => `<div class="day-header">${d}</div>`).join("");
    for (let i = offset - 1; i >= 0; i--) html += `<div class="${cellClass} other-month"><span class="day-number">${prevDays - i}</span></div>`;
    const todayK = localDateKey(new Date().toISOString());
    for (let d = 1; d <= days; d++) {
      const k = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const tks = map[k] || [];
      const visibleTasks = full ? tks : tks.slice(0, 4);
      html += `<div class="${cellClass} ${k === todayK ? "today" : ""}"><span class="day-number">${d}</span><div style="display:grid;gap:6px;">${visibleTasks.map(renderCalendarTaskPill).join("")}</div>${!full && tks.length > visibleTasks.length ? `<div class="mini-text" style="font-size:0.65rem;text-align:center">+${tks.length - visibleTasks.length} more</div>` : ""}</div>`;
    }
    const tail = (offset + days) % 7 === 0 ? 0 : 7 - ((offset + days) % 7);
    for (let i = 1; i <= tail; i++) html += `<div class="${cellClass} other-month"><span class="day-number">${i}</span></div>`;
    grid.innerHTML = html;
  }

  function renderWeekCalendar(grid, full = false) {
    const anchor = getWeekStart(getCalendarAnchorDate());
    const weekEnd = new Date(anchor); weekEnd.setDate(anchor.getDate() + 6);
    setCalendarLabels(formatCalendarRange(anchor, weekEnd));
    grid.classList.add("week-view");
    grid.classList.toggle("full-size", full);
    const map = getCalendarTaskMap();
    const cellClass = full ? "full-calendar-cell" : "day-cell";
    const todayK = localDateKey(new Date().toISOString());
    let html = DAY_LABELS.map(d => `<div class="day-header">${d}</div>`).join("");
    const weekKeys = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(anchor);
      day.setDate(anchor.getDate() + i);
      return localDateKey(day.toISOString());
    });
    const maxTasks = Math.max(0, ...weekKeys.map(k => (map[k] || []).length));
    const weekCellHeight = Math.min(full ? 520 : 360, Math.max(full ? 140 : 115, (full ? 105 : 92) + maxTasks * 34));
    grid.style.setProperty("--week-cell-height", `${weekCellHeight}px`);
    for (let i = 0; i < 7; i++) {
      const day = new Date(anchor); day.setDate(anchor.getDate() + i);
      const k = weekKeys[i];
      const tks = map[k] || [];
      html += `<div class="${cellClass} ${k === todayK ? "today" : ""}"><span class="day-number">${day.getDate()}</span><p class="mini-text" style="margin-bottom:6px;">${day.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}</p><div style="display:grid;gap:7px;">${tks.map(renderCalendarTaskPill).join("") || "<span class='mini-text'>No assignments</span>"}</div></div>`;
    }
    grid.innerHTML = html;
  }

  function renderCalendar() {
    const grid = document.getElementById("calendarGrid"); if (!grid) return;
    state.calendarView === "week" ? renderWeekCalendar(grid, false) : renderMonthCalendar(grid, false);
  }

  function renderFullCalendar() {
    const grid = document.getElementById("calendarGridFull");
    if (!grid) return;
    state.calendarView === "week" ? renderWeekCalendar(grid, true) : renderMonthCalendar(grid, true);
  }

  function shiftCalendar(direction) {
    if (state.calendarView === "week") {
      const anchor = getCalendarAnchorDate();
      anchor.setDate(anchor.getDate() + direction * 7);
      state.calendarYear = anchor.getFullYear();
      state.calendarMonth = anchor.getMonth();
      state.calendarDay = anchor.getDate();
    } else {
      state.calendarMonth += direction;
      state.calendarDay = 1;
      if (state.calendarMonth < 0) { state.calendarMonth = 11; state.calendarYear--; }
      if (state.calendarMonth > 11) { state.calendarMonth = 0; state.calendarYear++; }
    }
    saveState(); renderAll();
  }

  function goToCurrentCalendarPeriod() {
    const now = new Date();
    state.calendarYear = now.getFullYear();
    state.calendarMonth = now.getMonth();
    state.calendarDay = now.getDate();
    saveState(); renderAll();
  }

  function selectedCalendarDateKey() {
    return localDateKey(getCalendarAnchorDate().toISOString());
  }

  function scheduleInfoDateKey() {
    return selectedCalendarDateKey() || actualTodayKey();
  }

  function actualTodayKey() {
    return localDateKey(new Date().toISOString());
  }

  window.EPSTUDY_APP_CALENDAR = {
    getCalendarAnchorDate,
    getWeekStart,
    formatCalendarRange,
    setCalendarLabels,
    getCalendarTaskMap,
    renderCalendarTaskPill,
    renderMonthCalendar,
    renderWeekCalendar,
    renderCalendar,
    renderFullCalendar,
    shiftCalendar,
    goToCurrentCalendarPeriod,
    selectedCalendarDateKey,
    scheduleInfoDateKey,
    actualTodayKey
  };
})();
