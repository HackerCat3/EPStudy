(() => {
  const appConfig = window.EPSTUDY_APP_CONFIG || {};

  function getCurrentState() {
    if (typeof window.state !== "undefined") return window.state;
    return (window.EPSTUDY_APP_STATE || { loadState: () => ({}) }).loadState();
  }

  function getStorageKey() {
    return appConfig.STORAGE_KEY || "epstudy_secure_pro_v6";
  }

  function saveState() {
    const state = getCurrentState();
    if (typeof window.syncCourseColorInputsToState === "function") {
      window.syncCourseColorInputsToState();
    }

    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state. Storage might be full.", error);
    }
  }

  function showPrompt(message, defaultVal, callback) {
    const modal = document.getElementById("promptModal");
    if (!modal) return;

    const title = document.getElementById("promptTitle");
    const input = document.getElementById("promptInput");
    if (title) title.textContent = message;
    if (input) {
      input.value = defaultVal || "";
      input.focus();
    }

    window.__EPSTUDY_PROMPT_CALLBACK__ = typeof callback === "function" ? callback : null;
    modal.classList.add("open");
  }

  function navigate(page, updateHistory = true) {
    const state = getCurrentState();
    const normalizedPage = page === "cosmetics" ? "other" : page;
    const destination = normalizedPage === "other" && state.otherTabEnabled === false ? "dashboard" : normalizedPage;

    state.currentPage = destination;
    if (destination === "calendar" && typeof window.cleanupCalendarOverlaps === "function") {
      window.cleanupCalendarOverlaps(true);
    }

    document.querySelectorAll(".page").forEach(panel => panel.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));

    const target = document.getElementById(`page-${destination}`);
    if (target) target.classList.add("active");

    const navButton = document.querySelector(`[data-page="${destination}"]`);
    if (navButton) navButton.classList.add("active");

    if (updateHistory) {
      try {
        const url = new URL(window.location);
        url.searchParams.set("page", destination);
        window.history.pushState({ page: destination }, "", url);
      } catch (error) {
        console.warn("Skipping URL pushState update due to environment restrictions.", error);
      }
    }

    saveState();
  }

  function bridgeTargetOrigin() {
    return window.location.protocol === "file:" || window.location.origin === "null" ? "*" : window.location.origin;
  }

  function requestExtensionSync(statusMessage = "Requesting fresh data from the extension...") {
    const status = document.getElementById("extensionSyncStatus");
    if (status) status.textContent = statusMessage;
    window.postMessage({ type: "EPSTUDY_EXTENSION_REQUEST_SYNC", config: { canvasDomain: typeof window.getCanvasConfig === "function" ? window.getCanvasConfig().domain : undefined } }, bridgeTargetOrigin());
  }

  function fetchTextViaExtension(url, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const requestId = `fetch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const timer = window.setTimeout(() => {
        window.removeEventListener("message", onMessage);
        reject(new Error("Extension fetch timed out."));
      }, timeoutMs);

      function onMessage(event) {
        if (event.source !== window || event.data?.type !== "EPSTUDY_FETCH_TEXT_RESULT" || event.data.requestId !== requestId) return;
        window.clearTimeout(timer);
        window.removeEventListener("message", onMessage);
        event.data.ok ? resolve(String(event.data.text || "")) : reject(new Error(event.data.error || "Extension fetch failed."));
      }

      window.addEventListener("message", onMessage);
      window.postMessage({ type: "EPSTUDY_FETCH_TEXT", requestId, url }, bridgeTargetOrigin());
    });
  }

  function initAppShell() {
    document.getElementById("promptConfirmBtn")?.addEventListener("click", () => {
      const modal = document.getElementById("promptModal");
      if (modal) modal.classList.remove("open");
      const callback = window.__EPSTUDY_PROMPT_CALLBACK__;
      const value = document.getElementById("promptInput")?.value ?? null;
      window.__EPSTUDY_PROMPT_CALLBACK__ = null;
      if (typeof callback === "function") callback(value);
    });

    document.getElementById("promptCancelBtn")?.addEventListener("click", () => {
      const modal = document.getElementById("promptModal");
      if (modal) modal.classList.remove("open");
      const callback = window.__EPSTUDY_PROMPT_CALLBACK__;
      window.__EPSTUDY_PROMPT_CALLBACK__ = null;
      if (typeof callback === "function") callback(null);
    });

    window.addEventListener("popstate", (event) => {
      const page = event.state?.page || new URLSearchParams(window.location.search).get("page") || "dashboard";
      navigate(page, false);
    });

    window.addEventListener("message", (event) => {
      if (event.source !== window || !event.data || typeof event.data !== "object") return;
      if (event.data.type === "EPSTUDY_EXTENSION_SYNC") {
        if (typeof window.handleExtensionPayload === "function") window.handleExtensionPayload(event.data.payload || {});
      }
      if (event.data.type === "EPSTUDY_RESET_ALL_DONE") location.reload();
      if (event.data.type === "EPSTUDY_EXTENSION_STATUS") {
        const status = document.getElementById("extensionSyncStatus");
        if (status) status.textContent = String(event.data.message || "Extension is connected.");
      }
    });

    document.addEventListener("DOMContentLoaded", () => {
      const startPage = new URLSearchParams(window.location.search).get("page") || getCurrentState().currentPage || "dashboard";
      navigate(startPage, false);
      try {
        if (typeof window.initModalInertManager === "function") window.initModalInertManager();
      } catch (error) {
        console.warn("Modal inert initialization skipped.", error);
      }
    });
  }

  window.EPSTUDY_APP_SHELL = {
    saveState,
    showPrompt,
    navigate,
    bridgeTargetOrigin,
    requestExtensionSync,
    fetchTextViaExtension,
    initAppShell,
    getStorageKey
  };

  window.saveState = saveState;
  window.showPrompt = showPrompt;
  window.navigate = navigate;
  window.bridgeTargetOrigin = bridgeTargetOrigin;
  window.requestExtensionSync = requestExtensionSync;
  window.fetchTextViaExtension = fetchTextViaExtension;
})();
