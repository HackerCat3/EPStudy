(() => {
  const SCHOOL_SCHEDULE = [
    { id: "P1", label: "Period 1", start: "08:30", end: "09:40" },
    { id: "P2", label: "Period 2", start: "09:55", end: "11:05" },
    { id: "LUNCH", label: "Lunch", start: "11:05", end: "11:45" },
    { id: "BAND", label: "Middle Band", start: "11:45", end: "12:25" },
    { id: "P3", label: "Period 3", start: "12:25", end: "13:35" },
    { id: "P4", label: "Period 4", start: "13:50", end: "15:00" }
  ];

  const ACHIEVEMENTS = [
    { id: "first_task", title: "Launch Pad", detail: "Add your first task", test: (state) => state.tasks.length >= 1, skinReward: null },
    { id: "task_starter", title: "Task Finisher", detail: "Complete 3 tasks", test: (state) => state.tasks.filter((t) => t.completed).length >= 3, skinReward: "rainbow" },
    { id: "session_runner", title: "Focus Runner", detail: "Finish 5 sessions", test: (state) => state.sessionsCompleted >= 5, skinReward: "sparkle" },
    { id: "focus_120", title: "Century Club", detail: "Log 120 focus minutes", test: (state) => state.focusMinutes >= 120, skinReward: null },
    { id: "streak_3", title: "On a Roll", detail: "Reach a 3-day streak", test: (state) => state.streakDays >= 3, skinReward: "aurora" },
    { id: "canvas_link", title: "Canvas Link", detail: "Import Canvas work once", test: (state) => state.canvasImports >= 1, skinReward: "ocean" },
    { id: "task_10", title: "Forest Builder", detail: "Complete 10 tasks", test: (state) => state.tasks.filter((t) => t.completed).length >= 10, skinReward: "forest" },
    { id: "focus_300", title: "Golden Hour", detail: "Log 300 focus minutes", test: (state) => state.focusMinutes >= 300, skinReward: "sunset" },
    { id: "planner_8", title: "Notebook Ready", detail: "Create 8 tasks", test: (state) => state.tasks.length >= 8, skinReward: "notebook" },
    { id: "session_12", title: "Arcade Grind", detail: "Finish 12 focus sessions", test: (state) => state.sessionsCompleted >= 12, skinReward: "arcade" },
    { id: "task_20", title: "Autumn Momentum", detail: "Complete 20 tasks", test: (state) => state.tasks.filter((t) => t.completed).length >= 20, skinReward: null },
    { id: "nebula_min", title: "Nebula Minutes", detail: "Log 50 focus minutes", test: (state) => state.focusMinutes >= 50, skinReward: "nebula" },
    { id: "mist_syncs", title: "Mist Sync", detail: "Perform 2 Canvas syncs", test: (state) => state.canvasImports >= 2, skinReward: "mist" },
    { id: "copper_tasks", title: "Copper Tasks", detail: "Complete 5 tasks", test: (state) => state.tasks.filter((t) => t.completed).length >= 5, skinReward: "copper" },
    { id: "midnight_sessions", title: "Midnight Sessions", detail: "Finish 10 focus sessions", test: (state) => state.sessionsCompleted >= 10, skinReward: "midnight" },
    { id: "solar_confetti", title: "Solar Spark", detail: "Enable Confetti", test: (state) => Boolean(state.confettiEnabled), skinReward: "solar" },
    { id: "lunar_streak7", title: "Lunar Streak", detail: "Reach a 7-day streak", test: (state) => state.streakDays >= 7, skinReward: "lunar" },
    { id: "pastel_tasks12", title: "Pastel Planner", detail: "Create 12 tasks", test: (state) => state.tasks.length >= 12, skinReward: "pastel" },
    { id: "vapor_playlist", title: "Vapor Playlist", detail: "Import a playlist", test: (state) => Array.isArray(state.importedMusicPlaylist) && state.importedMusicPlaylist.length >= 1, skinReward: "vapor" },
    { id: "glimmer_600", title: "Glimmer Marathon", detail: "Log 600 focus minutes", test: (state) => state.focusMinutes >= 600, skinReward: "glimmer" },
    { id: "ember_tasks20", title: "Ember Effort", detail: "Complete 20 tasks", test: (state) => state.tasks.filter((t) => t.completed).length >= 20, skinReward: "ember" },
    { id: "teal_shield", title: "Teal Shield", detail: "Enable Focus Shield", test: (state) => Boolean(state.focusBlockerEnabled), skinReward: "teal" },
    { id: "plum_sessions15", title: "Plum Patron", detail: "Finish 15 focus sessions", test: (state) => state.sessionsCompleted >= 15, skinReward: "plum" },
    { id: "breeze_canvas3", title: "Breeze Sync", detail: "Perform 3 Canvas imports", test: (state) => state.canvasImports >= 3, skinReward: "breeze" },
    { id: "amber_streak3", title: "Amber Streak", detail: "Reach a 3-day streak", test: (state) => state.streakDays >= 3, skinReward: "amber" },
    { id: "citrine_tasks8", title: "Citrine Collector", detail: "Complete 8 tasks", test: (state) => state.tasks.filter((t) => t.completed).length >= 8, skinReward: "citrine" },
    { id: "pearl_min100", title: "Pearl Minutes", detail: "Log 100 focus minutes", test: (state) => state.focusMinutes >= 100, skinReward: "pearl" },
    { id: "onyx_tasks25", title: "Onyx Momentum", detail: "Complete 25 tasks", test: (state) => state.tasks.filter((t) => t.completed).length >= 25, skinReward: "onyx" },
    { id: "marble_playlist5", title: "Marble Mixer", detail: "Add 5 playlist tracks", test: (state) => Array.isArray(state.importedMusicPlaylist) && state.importedMusicPlaylist.length >= 5, skinReward: "marble" },
    { id: "cobalt_sessions30", title: "Cobalt Champion", detail: "Finish 30 focus sessions", test: (state) => state.sessionsCompleted >= 30, skinReward: "cobalt" },
    { id: "opal_sessions10", title: "Opal Operator", detail: "Finish 10 focus sessions", test: (state) => state.sessionsCompleted >= 10, skinReward: "opal" },
    { id: "mint_tasks20", title: "Mint Maker", detail: "Create 20 tasks", test: (state) => state.tasks.length >= 20, skinReward: "mint" },
    { id: "rose_tasks7", title: "Rose Seven", detail: "Complete 7 tasks", test: (state) => state.tasks.filter((t) => t.completed).length >= 7, skinReward: "rose" },
    { id: "linen_smart10", title: "Linen Learner", detail: "Use Smart Suggestion 10 times", test: (state) => (state.smartUsedCount || 0) >= 10, skinReward: "linen" },
    { id: "pro_access", title: "EPStudy PRO", detail: "Earn PRO access: 100 focus minutes, 10-day streak, 5 sessions", test: (state) => (state.focusMinutes || 0) >= 100 && (state.streakDays || 0) >= 10 && (state.sessionsCompleted || 0) >= 5, skinReward: null },
    { id: "mega_access", title: "MEGA Mode", detail: "Unlock MEGA: 50-day streak, 20 sessions, 1000 focus minutes", test: (state) => (state.focusMinutes || 0) >= 1000 && (state.streakDays || 0) >= 50 && (state.sessionsCompleted || 0) >= 20, skinReward: null },
    { id: "dominion_access", title: "DOMINION", detail: "Unlock DOMINION: 500-day streak, 500 sessions, 100000 focus minutes", test: (state) => (state.focusMinutes || 0) >= 100000 && (state.streakDays || 0) >= 500 && (state.sessionsCompleted || 0) >= 500, skinReward: null }
  ];

  const DEFAULT_COURSES = [
    { id: "course-personal", name: "Personal", code: "PERS", color: "#8b5cf6" }
  ];

  const DEFAULT_DASHBOARD_SECTIONS = {
    mission: true,
    quote: true,
    schedule: true,
    timer: true,
    membean: false,
    smart: true,
    calendar: true
  };

  const DASHBOARD_SECTION_LABELS = {
    mission: "Mission Brief",
    quote: "Quote of the Day",
    schedule: "Schedule Awareness",
    timer: "Focus Center",
    membean: "Membean",
    smart: "Smart Suggestion",
    calendar: "Calendar Outline"
  };

  const MOTIVATIONAL_QUOTES = [
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" }
  ];

  const SKIN_IDS = ["default", "rainbow", "sparkle", "aurora", "forest", "ocean", "sunset", "notebook", "arcade"];
  SKIN_IDS.push(
    "mist", "copper", "midnight", "solar", "lunar", "pastel", "vapor", "glimmer", "ember",
    "sage", "teal", "plum", "breeze", "amber", "citrine", "pearl", "onyx", "marble", "cobalt",
    "sage2", "opal", "mint", "rose", "linen",
    "galaxy", "aether", "void", "plasma",
    "mega-nova",
    "stars", "autumn", "rain",
    "aurora",
    "nebula",
    "dominion-royal", "dominion-abyss", "dominion-empyrean"
  );

  const SKIN_EFFECTS = {
    stars: { count: 180 },
    aurora: { count: 160 },
    rain: { count: 140 },
    autumn: { count: 120 },
    "mega-nova": { count: 420 },
    "dominion-royal": { count: 900 },
    "dominion-abyss": { count: 1100 },
    "dominion-empyrean": { count: 1400 },
    galaxy: { count: 240 },
    aether: { count: 180 },
    void: { count: 160 },
    plasma: { count: 220 },
    nebula: { count: 200 }
  };

  const MUSIC_PROFILES = {
    none: null,
    chill: { root: 196, intervals: [0, 7, 12, 16], delay: 1.25, wave: "sine", filter: 900 },
    study: { root: 174.61, intervals: [0, 5, 9, 12], delay: 1.05, wave: "triangle", filter: 1100 },
    lofi: { root: 146.83, intervals: [0, 3, 7, 10], delay: 1.45, wave: "sine", filter: 760 },
    deep: { root: 110, intervals: [0, 7, 10, 14], delay: 1.65, wave: "sine", filter: 620 },
    rain: { root: 220, intervals: [0, 2, 7, 9], delay: 0.9, wave: "triangle", filter: 1450 },
    cafe: { root: 164.81, intervals: [0, 4, 7, 11], delay: 1.2, wave: "sine", filter: 1200 },
    piano: { root: 261.63, intervals: [0, 4, 7, 12], delay: 1.75, wave: "triangle", filter: 1800 },
    ocean: { root: 130.81, intervals: [0, 5, 7, 12], delay: 1.55, wave: "sine", filter: 700 },
    imported: null
  };

  window.EPSTUDY_APP_CONFIG = {
    STORAGE_KEY: "epstudy_secure_pro_v6",
    SCHOOL_SCHEDULE,
    ACHIEVEMENTS,
    DEFAULT_COURSES,
    DEFAULT_DASHBOARD_SECTIONS,
    DASHBOARD_SECTION_LABELS,
    SKIN_IDS,
    SKIN_EFFECTS,
    DAY_LABELS: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    LONG_DAY_LABELS: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    PRIVATE_PROXY_URL: "https://canvas-token.aarinikmehta.workers.dev",
    LUNCH_ICAL_URL: "https://www.eastsideprep.org/events/category/lunch/?post_type=tribe_events&ical=1&eventDisplay=list",
    LUNCH_LIST_URL: "https://www.eastsideprep.org/events/category/lunch/list/",
    LUNCH_API_URL: "https://www.eastsideprep.org/wp-json/tribe/events/v1/events",
    MOTIVATIONAL_QUOTES,
    MUSIC_PROFILES
  };

  window.EPSTUDY_QUOTES = MOTIVATIONAL_QUOTES;
})();
