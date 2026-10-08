(() => {
  const getState = () => window.state || (window.EPSTUDY_APP_STATE ? window.EPSTUDY_APP_STATE.loadState() : { notifications: [] });
  const safeEscapeHtml = (str) => (typeof window.escapeHtml === "function" ? window.escapeHtml(str) : (window.EPSTUDY_APP_HELPERS && typeof window.EPSTUDY_APP_HELPERS.escapeHtml === "function" ? window.EPSTUDY_APP_HELPERS.escapeHtml(str) : String(str ?? "")));
  const safeSaveState = () => {
    if (typeof window.saveState === "function") window.saveState();
    else if (window.EPSTUDY_APP_SHELL && typeof window.EPSTUDY_APP_SHELL.saveState === "function") window.EPSTUDY_APP_SHELL.saveState();
  };

  function addNotification(message, type = "info", duration = 0) {
    const st = getState();
    if (!Array.isArray(st.notifications)) st.notifications = [];
    const notif = { id: `notif-${Date.now()}`, message, type, timestamp: new Date(), read: false };
    st.notifications.unshift(notif);
    safeSaveState();
    renderNotifications();
  }

  function showToast(message, type = "info", duration = 4000) {
    const id = `toast-${Date.now()}`;
    const el = document.createElement("div");
    el.id = id;
    el.style.position = "fixed";
    el.style.right = "18px";
    el.style.top = "18px";
    el.style.zIndex = 99999;
    el.style.padding = "12px 16px";
    el.style.borderRadius = "10px";
    el.style.boxShadow = "0 10px 30px rgba(2,6,23,0.2)";
    el.style.background = type === "error" || type === "danger" ? "#fef2f2" : "#0f172a";
    el.style.color = type === "error" || type === "danger" ? "#7f1d1d" : "#ffffff";
    el.style.fontWeight = "700";
    el.style.opacity = "0";
    el.style.transition = "opacity 220ms ease, transform 220ms ease";
    el.textContent = message;
    document.body.appendChild(el);
    // force reflow then show
    // eslint-disable-next-line no-unused-expressions
    el.getBoundingClientRect();
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => { try { el.remove(); } catch (e) {} }, 300);
    }, duration);
  }

  function removeNotification(id) {
    state.notifications = state.notifications.filter(n => n.id !== id);
    saveState();
    const st = getState();
    if (!Array.isArray(st.notifications)) return;
    st.notifications = st.notifications.filter(n => n.id !== id);
    safeSaveState();
    renderNotifications();
  }

  function renderNotifications() {
    const badge = document.getElementById("notificationBadge");
    const panel = document.getElementById("notificationsPanel");
    if (!badge || !panel) return;

    const st = getState();
    const notifs = Array.isArray(st.notifications) ? st.notifications : [];
    const count = notifs.length;
    badge.textContent = count;
    badge.style.display = count > 0 ? "grid" : "none";
    panel.innerHTML = notifs.length ? notifs.map(n => `
      <div class="notification-item ${n.type}">
        <div class="notification-item-content"><span>${safeEscapeHtml(n.message)}</span><span class="notif-time">${new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span></div>
        <span class="notification-item-close" onclick="removeNotification('${n.id}')">✕</span>
      </div>
    `).join("") : "<div class='notification-item info'><span>No notifications</span></div>";
  }

  window.EPSTUDY_APP_NOTIFICATIONS = {
    addNotification,
    showToast,
    removeNotification,
    renderNotifications
  };

  window.addNotification = addNotification;
  window.showToast = showToast;
  window.removeNotification = removeNotification;
  window.renderNotifications = renderNotifications;
})();
