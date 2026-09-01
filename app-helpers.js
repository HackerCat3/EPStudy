(() => {
  function isValidTime(value) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(value || ""));
  }

  function safeIsoFromDateTime(dateValue, timeValue) {
    if (!dateValue || !isValidTime(timeValue)) return null;
    const parsed = new Date(`${dateValue}T${timeValue}:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  function toMinutes(value) {
    if (!isValidTime(value)) return -1;
    const [h, m] = String(value).split(":").map(Number);
    return h * 60 + m;
  }

  function nowMinutes(date = new Date()) {
    return date.getHours() * 60 + date.getMinutes();
  }

  function isWeekend(date = new Date()) {
    return date.getDay() === 0 || date.getDay() === 6;
  }

  function toTimeLabel(value) {
    const [h, m] = String(value || "00:00").split(":").map(Number);
    const d = new Date();
    d.setHours(h || 0, m || 0, 0, 0);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  function getCourseById(id) {
    return (window.state?.courses || []).find((c) => c.id === id) || null;
  }

  function normalizeDomain(value) {
    return String(value || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  function getDayWindows(dayIndex) {
    return (window.state?.availabilityByDay?.[String(dayIndex)] || []).slice();
  }

  window.EPSTUDY_APP_HELPERS = {
    isValidTime,
    safeIsoFromDateTime,
    toMinutes,
    nowMinutes,
    isWeekend,
    toTimeLabel,
    escapeHtml,
    getCourseById,
    normalizeDomain,
    getDayWindows
  };
})();
