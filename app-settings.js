(() => {
  function initPageSettings() {
    const els = {
      notifMembean: state.notificationSettings.membean,
      notifQuizzes: state.notificationSettings.quizzes,
      notifAssignments: state.notificationSettings.assignments,
      notifOverdue: state.notificationSettings.overdue,
      notifTimerDone: state.notificationSettings.timerdone,
      confettiEnabled: state.confettiEnabled
    };
    for (const [id, val] of Object.entries(els)) {
      const el = document.getElementById(id);
      if (el) el.checked = Boolean(val);
    }
    const ds = document.getElementById("devSessionsCompleted"); if (ds) ds.value = Number(state.sessionsCompleted || 0);
    const dm = document.getElementById("devFocusMinutes"); if (dm) dm.value = Number(state.focusMinutes || 0);
    const dk = document.getElementById("devStreakDays"); if (dk) dk.value = Number(state.streakDays || 0);
    const devPanel = document.getElementById("devControlsPanel"); if (devPanel) devPanel.style.display = state.devControlsVisible ? "block" : "none";
  }

  function renderBlocklist() {
    const list = document.getElementById("blockSiteList");
    if (!list) return;
    const items = state.blockedSites.map(site => `
      <div class="blocklist-item">
        <span class="blocklist-domain">${escapeHtml(site)}</span>
        <button class="icon-button" data-action="remove-block" data-domain="${site}">✕</button>
      </div>
    `).join("");
    list.innerHTML = items || "<p class='empty'>No blocked sites yet.</p>";
  }

  function updateAllAssignmentsDisplay() {
    const container = document.getElementById("allAssignmentsContainer");
    const section = document.getElementById("allAssignmentsSection");
    if (!container) return;
    if (section?.hidden) {
      container.innerHTML = "";
      return;
    }
    cleanupCalendarOverlaps(true);
    
    const oldestVisible = new Date();
    oldestVisible.setHours(0, 0, 0, 0);
    oldestVisible.setDate(oldestVisible.getDate() - 4);
    const sorted = getUniqueCalendarTasks()
      .filter(task => {
        const due = new Date(task.dueDate);
        return !Number.isNaN(due.getTime()) && due.getTime() >= oldestVisible.getTime();
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    if (!sorted.length) {
      container.innerHTML = "<p class='empty'>No upcoming assignments found.</p>";
      return;
    }
    container.innerHTML = sorted.map(t => {
      const course = getCourseById(t.courseId);
      const isDone = t.completed;
      const isOverdueStat = !isDone && isOverdue(t);
      
      return `
        <div class="assignment-card" style="opacity: ${isDone ? 0.6 : 1};">
          <div class="assignment-card-header">
            <div class="assignment-card-title">${escapeHtml(t.title)}</div>
            <div class="assignment-card-due">${normalizeDueDate(t.dueDate)}</div>
          </div>
          <div class="assignment-card-course" style="background: ${course ? course.color : '#003d7a'};">
            ${course ? escapeHtml(course.name) : "Course"}
          </div>
          <div class="assignment-card-status">
            ${isDone ? "Completed" : isOverdueStat ? "Overdue" : `${t.estimatedMinutes} min`}
          </div>
        </div>
      `;
    }).join("");
  }

  function toggleAllAssignmentsDisplay() {
    const section = document.getElementById("allAssignmentsSection");
    const button = document.getElementById("toggleAllAssignmentsBtn");
    if (!section || !button) return;
    section.hidden = !section.hidden;
    button.textContent = section.hidden ? "Show All Upcoming Assignments" : "Hide All Upcoming Assignments";
    updateAllAssignmentsDisplay();
  }

  window.EPSTUDY_APP_SETTINGS = {
    initPageSettings,
    renderBlocklist,
    updateAllAssignmentsDisplay,
    toggleAllAssignmentsDisplay
  };
})();
