(() => {
  const isValidTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string' || timeStr.trim() === "") {
      return false;
    }
    return timeStr.includes(':') || timeStr.includes('T');
  };
  if (typeof window !== "undefined" && !window.isValidTime) {
    window.isValidTime = isValidTime;
  }

  const parseTimeToMinutes = (val) => {
    if (!val || typeof val !== "string") return -1;
    const parts = val.split(":");
    if (parts.length !== 2) return -1;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (Number.isNaN(h) || Number.isNaN(m)) return -1;
    return h * 60 + m;
  };
  const toMinutes = (val) => {
    if (typeof window.toMinutes === "function" && window.toMinutes !== toMinutes) {
      return window.toMinutes(val);
    }
    return parseTimeToMinutes(val);
  };
  if (typeof window !== "undefined" && !window.toMinutes) {
    window.toMinutes = toMinutes;
  }

  const cleanTitle = (raw) => {
    const str = String(raw || "").trim();
    return str.replace(/^Assignment\b:?\s*/i, "").trim() || "Untitled Task";
  };
  const normalizeAssignmentTitle = (raw) => {
    if (typeof window.normalizeAssignmentTitle === "function" && window.normalizeAssignmentTitle !== normalizeAssignmentTitle) {
      return window.normalizeAssignmentTitle(raw);
    }
    return cleanTitle(raw);
  };
  if (typeof window !== "undefined" && !window.normalizeAssignmentTitle) {
    window.normalizeAssignmentTitle = normalizeAssignmentTitle;
  }
  const appConfig = window.EPSTUDY_APP_CONFIG || {};
  const STORAGE_KEY = appConfig.STORAGE_KEY || "epstudy_secure_pro_v6";
  const DEFAULT_COURSES = appConfig.DEFAULT_COURSES || [{ id: "course-personal", name: "Personal", code: "PERS", color: "#8b5cf6" }];
  const DEFAULT_DASHBOARD_SECTIONS = appConfig.DEFAULT_DASHBOARD_SECTIONS || { mission: true, quote: true, schedule: true, timer: true, membean: false, smart: true, calendar: true };
  const SKIN_IDS = appConfig.SKIN_IDS || ["default"];

  function defaultState() {
    const now = new Date();
    return {
      tasks: [], courses: [...DEFAULT_COURSES], selectedTaskId: null,
      sessionsCompleted: 0, focusMinutes: 0, streakDays: 0, lastSessionDate: null,
      canvasImports: 0, tutorialSeen: false,
      selectedSkin: "default", skinsVisible: true, confettiEnabled: false, trailEnabled: false, unlockedSkins: ["default"], unlockedAchievements: [],
      musicMode: "none", musicVolume: 35, importedMusicName: "", importedMusicDataUrl: "", musicSearchQuery: "",
      importedMusicPlaylist: [], importedMusicIndex: null,
      membeanEnabled: false,
      membeanWeeklyDays: 3,
      membeanReminderKey: "",
      devControlsVisible: false,
      layoutEditMode: false,
      otherTabEnabled: true,
      calendarYear: now.getFullYear(), calendarMonth: now.getMonth(), calendarDay: now.getDate(), timerMinutes: 25,
      calendarView: "month",
      schoolDivision: "us",
      availabilityByDay: { "0": [], "1": [{ start: "16:00", end: "18:00" }], "2": [{ start: "16:00", end: "18:00" }], "3": [{ start: "16:00", end: "18:00" }], "4": [{ start: "16:00", end: "18:00" }], "5": [{ start: "16:00", end: "18:00" }], "6": [] },
      canvasEvents: [],
      notifications: [],
      notificationSettings: { membean: false, quizzes: true, assignments: true, overdue: true, timerdone: true },
      currentPage: "tasks",
      skinChangeRestrictedToFreePeriods: true,
      scheduleOverrideActive: false,
      ambientFocusMode: false,
      smartDismissedTaskIds: [],
      liveSchedule: null,
      epsSchedules: {},
      lunchItems: {},
      currentPeriod: null,
      focusModeActive: false,
      focusModePeriod: null,
      membeanSessionsCompleted: 0,
      membeanSessionsLastUpdated: null,
      smartUsedCount: 0,
      proAccessUnlocked: false,
      megaAccessUnlocked: false,
      dominionAccessUnlocked: false,
      extensionSync: { lastSyncAt: null, sources: {} },
      dashboardSections: { ...DEFAULT_DASHBOARD_SECTIONS },
      dashboardExpansionSections: {},
      dashboardExpandedSections: {},
      dashboardLayout: {}
    };
  }

  function loadState() {
    const base = defaultState();
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || typeof parsed !== "object") return base;

      const merged = { ...base, ...parsed };
      merged.tasks = Array.isArray(merged.tasks) ? merged.tasks : [];
      merged.courses = Array.isArray(merged.courses) && merged.courses.length > 0 ? merged.courses : [...DEFAULT_COURSES];
      merged.canvasEvents = Array.isArray(merged.canvasEvents) ? merged.canvasEvents : [];
      merged.availabilityByDay = typeof merged.availabilityByDay === "object" && merged.availabilityByDay ? merged.availabilityByDay : base.availabilityByDay;
      merged.notificationSettings = { ...base.notificationSettings, ...(merged.notificationSettings || {}) };
      merged.membeanEnabled = Boolean(merged.membeanEnabled);
      merged.membeanWeeklyDays = Math.max(1, Math.min(7, Number(merged.membeanWeeklyDays) || 3));
      merged.membeanReminderKey = typeof merged.membeanReminderKey === "string" ? merged.membeanReminderKey : "";
      merged.calendarView = ["month", "week"].includes(merged.calendarView) ? merged.calendarView : "month";
      merged.selectedSkin = SKIN_IDS.includes(merged.selectedSkin) ? merged.selectedSkin : "default";
      merged.skinsVisible = true;
      merged.unlockedSkins = Array.isArray(merged.unlockedSkins) ? merged.unlockedSkins.filter(s => SKIN_IDS.includes(s)) : ["default"];
      if (!merged.unlockedSkins.includes("default")) merged.unlockedSkins.push("default");
      merged.unlockedAchievements = Array.isArray(merged.unlockedAchievements) ? merged.unlockedAchievements : [];
      merged.trailEnabled = Boolean(merged.trailEnabled);
      merged.proAccessUnlocked = Boolean(merged.proAccessUnlocked);
      merged.megaAccessUnlocked = Boolean(merged.megaAccessUnlocked);
      merged.dominionAccessUnlocked = Boolean(merged.dominionAccessUnlocked);
      merged.devControlsVisible = Boolean(merged.devControlsVisible);
      merged.musicMode = "none";
      merged.musicVolume = Math.max(0, Math.min(100, Number(merged.musicVolume) || 35));
      merged.importedMusicName = "";
      merged.importedMusicDataUrl = "";
      merged.importedMusicPlaylist = Array.isArray(merged.importedMusicPlaylist) ? merged.importedMusicPlaylist : [];
      merged.importedMusicIndex = Number.isFinite(Number(merged.importedMusicIndex)) ? Number(merged.importedMusicIndex) : null;
      merged.musicSearchQuery = typeof merged.musicSearchQuery === "string" ? merged.musicSearchQuery : "";
      merged.schoolDivision = ["us", "ms"].includes(merged.schoolDivision) ? merged.schoolDivision : "us";
      merged.calendarDay = Math.max(1, Math.min(31, Number(merged.calendarDay) || base.calendarDay));
      merged.smartDismissedTaskIds = Array.isArray(merged.smartDismissedTaskIds) ? merged.smartDismissedTaskIds.map(String) : [];
      merged.ambientFocusMode = Boolean(merged.ambientFocusMode);
      merged.scheduleOverrideActive = Boolean(merged.scheduleOverrideActive);
      merged.extensionSync = typeof merged.extensionSync === "object" && merged.extensionSync ? { ...base.extensionSync, ...merged.extensionSync } : base.extensionSync;
      merged.epsSchedules = typeof merged.epsSchedules === "object" && merged.epsSchedules ? merged.epsSchedules : {};
      merged.lunchItems = typeof merged.lunchItems === "object" && merged.lunchItems ? merged.lunchItems : {};
      merged.dashboardSections = typeof merged.dashboardSections === "object" && merged.dashboardSections ? { ...DEFAULT_DASHBOARD_SECTIONS, ...merged.dashboardSections } : { ...DEFAULT_DASHBOARD_SECTIONS };
      merged.dashboardExpansionSections = typeof merged.dashboardExpansionSections === "object" && merged.dashboardExpansionSections ? merged.dashboardExpansionSections : {};
      merged.dashboardExpandedSections = typeof merged.dashboardExpandedSections === "object" && merged.dashboardExpandedSections ? merged.dashboardExpandedSections : {};
      merged.dashboardLayout = typeof merged.dashboardLayout === "object" && merged.dashboardLayout ? merged.dashboardLayout : {};
      merged.layoutEditMode = false;
      merged.otherTabEnabled = typeof merged.otherTabEnabled === "boolean" ? merged.otherTabEnabled : true;
      Object.keys(DEFAULT_DASHBOARD_SECTIONS).forEach(key => {
        merged.dashboardExpansionSections[key] = Boolean(merged.dashboardExpansionSections[key]);
        if (!merged.dashboardExpansionSections[key]) delete merged.dashboardExpandedSections[key];
      });
      merged.membeanSessionsCompleted = Math.max(0, Math.min(7, Number(merged.membeanSessionsCompleted) || 0));
      merged.membeanSessionsLastUpdated = typeof merged.membeanSessionsLastUpdated === "string" ? merged.membeanSessionsLastUpdated : null;

      merged.courses = merged.courses.map((c, i) => ({
        id: c?.id ? String(c.id) : `course-${i}-${Math.random().toString(16).slice(2, 6)}`,
        name: c?.name ? String(c.name) : `Course ${i + 1}`,
        code: c?.code ? String(c.code) : "",
        color: /^#([0-9a-f]{3}|[0-9a-f]{6})$|^hsl\(|^rgb\(/i.test(c?.color || "") ? String(c.color) : "#2563eb",
        userColor: Boolean(c?.userColor)
      })).filter(c => c.id !== "course-other" && String(c.name || "").toLowerCase() !== "other");
      for (const defaultCourse of DEFAULT_COURSES) {
        const exists = merged.courses.some(c => c.id === defaultCourse.id || String(c.name).toLowerCase() === defaultCourse.name.toLowerCase());
        if (!exists) merged.courses.push({ ...defaultCourse });
      }

      merged.tasks = merged.tasks.map((t) => {
        const dueRaw = t?.dueDate ? new Date(t.dueDate) : null;
        const dueDate = dueRaw && !Number.isNaN(dueRaw.getTime()) ? dueRaw.toISOString() : new Date(Date.now() + 86400000).toISOString();
        return {
          ...t,
          id: t?.id ? String(t.id) : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          title: normalizeAssignmentTitle(t?.title || "Untitled task"),
          courseId: t?.courseId ? String(t.courseId) : "",
          estimatedMinutes: Math.max(1, Number(t.estimatedMinutes) || 25),
          remainingMinutes: t?.completed ? 0 : Math.max(1, Number(t.remainingMinutes) || Number(t.estimatedMinutes) || 25),
          dueDate,
          completed: Boolean(t?.completed)
        };
      })
      for (let day = 0; day <= 6; day += 1) {
        const dk = String(day);
        const rawWindows = Array.isArray(merged.availabilityByDay[dk]) ? merged.availabilityByDay[dk] : [];
        merged.availabilityByDay[dk] = rawWindows
          .filter(w => w && typeof w === "object" && isValidTime(w.start) && (w.end && typeof w.end === 'string') && toMinutes(w.end) > toMinutes(w.start))
          .map(w => ({ start: w.start, end: w.end }))
          .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
      }

      merged.tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      merged.smartDismissedTaskIds = merged.smartDismissedTaskIds.filter(id => merged.tasks.some(t => t.id === id && !t.completed));
      merged.selectedTaskId = null;
      // FORCE RESTORE PROFILE AND TASKS
      const absoluteSave = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (absoluteSave.tutorialSeen) merged.tutorialSeen = absoluteSave.tutorialSeen;
      if (absoluteSave.schoolDivision) merged.schoolDivision = absoluteSave.schoolDivision;
      if (absoluteSave.tasks && absoluteSave.tasks.length > 0) merged.tasks = absoluteSave.tasks;
      if (!merged.tutorialSeen && absoluteSave.tutorialSeen) merged.tutorialSeen = absoluteSave.tutorialSeen;
      if (!merged.schoolDivision && absoluteSave.schoolDivision) merged.schoolDivision = absoluteSave.schoolDivision;
      if (absoluteSave.tasks && absoluteSave.tasks.length > 0 && (!merged.tasks || merged.tasks.length === 0)) merged.tasks = absoluteSave.tasks;
      if (absoluteSave.courses && absoluteSave.courses.length > 0 && (!merged.courses || merged.courses.length === 0)) merged.courses = absoluteSave.courses;
      return merged;
    } catch (e) { console.error("SILENT CRASH:", e); return base; }
  }

  window.EPSTUDY_APP_STATE = { defaultState, loadState };
})();
