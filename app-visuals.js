(() => {
  const fxCanvas = document.getElementById("fxCanvas");
  const fxCtx = fxCanvas ? fxCanvas.getContext("2d") : null;

  window.fxCanvas = fxCanvas;
  window.fxCtx = fxCtx;
  window.confetti = [];
  window.skinParticles = [];
  window.activeSkinEffect = "";
  window.fxAnimationRunning = false;

  function resizeFxCanvas() {
    if (!window.fxCanvas) return;
    window.fxCanvas.width = window.innerWidth;
    window.fxCanvas.height = window.innerHeight;
    window.skinParticles = [];
    if (typeof window.updateSkinEffect === "function") {
      window.updateSkinEffect();
    }
  }

  function makeSkinParticle(type) {
    const w = window.fxCanvas?.width || window.innerWidth;
    const h = window.fxCanvas?.height || window.innerHeight;

    if (type === "stars") return { x: Math.random() * w, y: Math.random() * h, size: Math.random() * 1.9 + 0.6, alpha: Math.random() * 0.65 + 0.25, twinkle: Math.random() * Math.PI * 2, speed: Math.random() * 0.012 + 0.004 };
    if (type === "rain") return { x: Math.random() * w, y: Math.random() * h, len: Math.random() * 18 + 12, speed: Math.random() * 7 + 5, alpha: Math.random() * 0.28 + 0.16 };
    if (type === "autumn") return { x: Math.random() * w, y: Math.random() * h, size: Math.random() * 7 + 5, speed: Math.random() * 1.2 + 0.5, drift: Math.random() * 1.6 - 0.8, spin: Math.random() * Math.PI * 2, hue: Math.random() * 32 + 24 };
    if (String(type).startsWith("mega")) return { x: Math.random() * w, y: Math.random() * h, size: Math.random() * 6 + 2, hue: Math.random() * 360, alpha: Math.random() * 0.9 + 0.1, vx: (Math.random() - 0.5) * 0.9, vy: (Math.random() - 0.5) * 0.9 };
    if (type === "dominion-royal") return { x: Math.random() * w, y: Math.random() * h, size: Math.random() * 9 + 5, hue: 35 + Math.random() * 35, alpha: 0.15 + Math.random() * 0.45, vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45, ring: Math.random() * 140 + 60 };
    if (type === "dominion-abyss") return { x: Math.random() * w, y: Math.random() * h, size: Math.random() * 22 + 10, hue: 240 + Math.random() * 35, alpha: 0.08 + Math.random() * 0.25, vx: (Math.random() - 0.5) * 0.85, vy: (Math.random() - 0.5) * 0.85, life: Math.random() * 500 + 220 };
    if (type === "dominion-empyrean") return { x: Math.random() * w, y: Math.random() * h, size: Math.random() * 14 + 6, hue: 180 + Math.random() * 90, alpha: 0.12 + Math.random() * 0.4, vx: (Math.random() - 0.5) * 1.15, vy: (Math.random() - 0.5) * 1.15, beam: Math.random() * 220 + 120 };
    if (String(type).startsWith("dominion")) return { x: Math.random() * w, y: Math.random() * h, size: Math.random() * 18 + 8, hue: Math.random() * 360, alpha: Math.random() * 0.9 + 0.05, vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5, life: Math.random() * 400 + 200 };
    if (type === "galaxy") return { x: Math.random() * w, y: Math.random() * h, size: Math.random() * 2 + 0.6, alpha: Math.random() * 0.9 + 0.1, twinkle: Math.random() * Math.PI * 2, hue: 210 + Math.random() * 60 };
    if (type === "aether") return { x: Math.random() * w, y: Math.random() * h * 0.6 + h * 0.2, width: Math.random() * 240 + 120, speed: Math.random() * 0.8 + 0.08, hue: 180 + Math.random() * 90, alpha: 0.12 + Math.random() * 0.22 };
    if (type === "void") return { x: Math.random() * w, y: Math.random() * h, size: Math.random() * 12 + 6, hue: 260 + Math.random() * 40, alpha: 0.06 + Math.random() * 0.3, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6 };
    if (type === "plasma") return { x: Math.random() * w, y: Math.random() * h, size: Math.random() * 5 + 2, hue: Math.random() * 360, alpha: 0.18 + Math.random() * 0.5, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8 };
    return { x: Math.random() * w, y: Math.random() * h, width: Math.random() * 170 + 90, speed: Math.random() * 0.45 + 0.16, alpha: Math.random() * 0.18 + 0.08, hue: Math.random() > 0.5 ? 170 : 265 };
  }

  function ensureSkinParticles() {
    const count = (window.SKIN_EFFECTS && window.SKIN_EFFECTS[window.activeSkinEffect]) ? window.SKIN_EFFECTS[window.activeSkinEffect].count || 0 : 0;
    while (window.skinParticles.length < count) window.skinParticles.push(makeSkinParticle(window.activeSkinEffect));
    if (window.skinParticles.length > count) window.skinParticles = window.skinParticles.slice(0, count);
  }

  function drawSkinParticles() {
    if (!window.fxCtx || !window.activeSkinEffect) return;
    const w = window.fxCanvas?.width || window.innerWidth;
    const h = window.fxCanvas?.height || window.innerHeight;

    window.skinParticles.forEach((p) => {
      if (window.activeSkinEffect === "stars") {
        p.twinkle += p.speed;
        const alpha = Math.max(0.18, Math.min(1, p.alpha + Math.sin(p.twinkle) * 0.28));
        window.fxCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        window.fxCtx.beginPath();
        window.fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        window.fxCtx.fill();
      } else if (window.activeSkinEffect === "rain") {
        window.fxCtx.strokeStyle = `rgba(14, 116, 144, ${p.alpha})`;
        window.fxCtx.lineWidth = 1;
        window.fxCtx.beginPath();
        window.fxCtx.moveTo(p.x, p.y);
        window.fxCtx.lineTo(p.x - 6, p.y + p.len);
        window.fxCtx.stroke();
        p.y += p.speed;
        p.x -= 0.8;
        if (p.y > h + p.len) { p.y = -p.len; p.x = Math.random() * w; }
      } else if (window.activeSkinEffect === "autumn") {
        p.spin += 0.04;
        window.fxCtx.save();
        window.fxCtx.translate(p.x, p.y);
        window.fxCtx.rotate(p.spin);
        window.fxCtx.fillStyle = `hsla(${p.hue}, 78%, 48%, 0.48)`;
        window.fxCtx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        window.fxCtx.restore();
        p.y += p.speed;
        p.x += p.drift + Math.sin(p.spin) * 0.35;
        if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
      } else if (window.activeSkinEffect === "aurora") {
        p.x += p.speed;
        if (p.x > w + p.width) p.x = -p.width;
        const gradient = window.fxCtx.createLinearGradient(p.x, p.y, p.x + p.width, p.y + 40);
        gradient.addColorStop(0, `hsla(${p.hue}, 90%, 70%, 0)`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 90%, 70%, ${p.alpha})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 90%, 70%, 0)`);
        window.fxCtx.strokeStyle = gradient;
        window.fxCtx.lineWidth = 28;
        window.fxCtx.beginPath();
        window.fxCtx.moveTo(p.x, p.y);
        window.fxCtx.bezierCurveTo(p.x + p.width * 0.25, p.y - 40, p.x + p.width * 0.65, p.y + 55, p.x + p.width, p.y);
        window.fxCtx.stroke();
      } else if (String(window.activeSkinEffect).startsWith("mega")) {
        p.x += Math.sin((p.hue + Date.now() * 0.002) / 50) * 0.6 + (p.vx || 0);
        p.y += (p.vy || 0) * 0.6;
        const gradient = window.fxCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
        const hue = Math.floor(p.hue % 360);
        gradient.addColorStop(0, `hsla(${hue}, 90%, 70%, ${Math.min(1, p.alpha)})`);
        gradient.addColorStop(1, `hsla(${hue}, 90%, 50%, 0)`);
        window.fxCtx.fillStyle = gradient;
        window.fxCtx.beginPath();
        window.fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        window.fxCtx.fill();
        if (p.x < -50) p.x = w + 50; if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50; if (p.y > h + 50) p.y = -50;
      } else if (String(window.activeSkinEffect).startsWith("dominion")) {
        if (window.activeSkinEffect === "dominion-royal") {
          p.x += (p.vx || 0); p.y += (p.vy || 0);
          p.vx *= 0.995; p.vy *= 0.995;
          const rr = window.fxCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.ring || (p.size * 12));
          rr.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.alpha})`);
          rr.addColorStop(0.35, `hsla(${p.hue + 10}, 95%, 60%, ${p.alpha * 0.8})`);
          rr.addColorStop(1, `hsla(${p.hue + 20}, 95%, 40%, 0)`);
          window.fxCtx.strokeStyle = rr;
          window.fxCtx.lineWidth = 3;
          window.fxCtx.beginPath();
          window.fxCtx.arc(p.x, p.y, p.size * 1.4, 0, Math.PI * 2);
          window.fxCtx.stroke();
          window.fxCtx.fillStyle = `hsla(${p.hue}, 90%, 68%, ${Math.min(1, p.alpha)})`;
          window.fxCtx.beginPath();
          window.fxCtx.moveTo(p.x, p.y - p.size * 2);
          window.fxCtx.lineTo(p.x + p.size * 1.2, p.y + p.size * 0.5);
          window.fxCtx.lineTo(p.x - p.size * 1.2, p.y + p.size * 0.5);
          window.fxCtx.closePath();
          window.fxCtx.fill();
        } else if (window.activeSkinEffect === "dominion-abyss") {
          p.x += p.vx || 0; p.y += p.vy || 0;
          const ab = window.fxCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
          ab.addColorStop(0, `hsla(${p.hue}, 75%, 60%, ${p.alpha})`);
          ab.addColorStop(0.5, `hsla(${p.hue + 10}, 70%, 40%, ${p.alpha * 0.5})`);
          ab.addColorStop(1, `hsla(${p.hue + 20}, 80%, 18%, 0)`);
          window.fxCtx.fillStyle = ab;
          window.fxCtx.beginPath();
          window.fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          window.fxCtx.fill();
          window.fxCtx.strokeStyle = `hsla(${p.hue}, 80%, 72%, ${Math.min(0.35, p.alpha)})`;
          window.fxCtx.lineWidth = 1;
          window.fxCtx.beginPath();
          window.fxCtx.moveTo(p.x - p.size, p.y + p.size * 0.2);
          window.fxCtx.lineTo(p.x + p.size * 1.8, p.y - p.size * 0.15);
          window.fxCtx.stroke();
          if (p.life) p.life -= 0.45; if (p.life < 0) { p.x = Math.random() * w; p.y = Math.random() * h; p.life = Math.random() * 500 + 220; }
        } else if (window.activeSkinEffect === "dominion-empyrean") {
          p.x += p.vx || 0; p.y += p.vy || 0;
          const be = window.fxCtx.createLinearGradient(p.x, p.y - (p.beam || 160), p.x, p.y + (p.beam || 160));
          be.addColorStop(0, `hsla(${p.hue}, 98%, 76%, 0)`);
          be.addColorStop(0.45, `hsla(${p.hue + 20}, 100%, 72%, ${p.alpha})`);
          be.addColorStop(0.55, `hsla(${p.hue + 60}, 100%, 78%, ${p.alpha})`);
          be.addColorStop(1, `hsla(${p.hue + 90}, 100%, 72%, 0)`);
          window.fxCtx.strokeStyle = be;
          window.fxCtx.lineWidth = Math.max(2, p.size / 4);
          window.fxCtx.beginPath();
          window.fxCtx.moveTo(p.x, p.y - (p.beam || 160));
          window.fxCtx.lineTo(p.x, p.y + (p.beam || 160));
          window.fxCtx.stroke();
          window.fxCtx.fillStyle = `hsla(${p.hue + 45}, 100%, 80%, ${Math.min(1, p.alpha)})`;
          window.fxCtx.beginPath();
          window.fxCtx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
          window.fxCtx.fill();
        }
        if (p.x < -120) p.x = w + 120; if (p.x > w + 120) p.x = -120;
        if (p.y < -120) p.y = h + 120; if (p.y > h + 120) p.y = -120;
      } else if (window.activeSkinEffect === "galaxy") {
        p.twinkle = (p.twinkle || 0) + 0.08 + (p.size * 0.002);
        const alpha = Math.max(0.06, Math.min(1, p.alpha * (0.6 + Math.sin(p.twinkle) * 0.4)));
        window.fxCtx.fillStyle = `hsla(${p.hue}, 90%, 72%, ${alpha})`;
        window.fxCtx.beginPath();
        window.fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        window.fxCtx.fill();
      } else if (window.activeSkinEffect === "aether") {
        p.x += p.speed * 0.8;
        if (p.x > w + p.width) p.x = -p.width;
        const gradient = window.fxCtx.createLinearGradient(p.x, p.y, p.x + p.width, p.y + 80);
        gradient.addColorStop(0, `hsla(${p.hue - 40}, 90%, 60%, 0)`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 90%, 68%, ${p.alpha})`);
        gradient.addColorStop(1, `hsla(${p.hue + 40}, 90%, 60%, 0)`);
        window.fxCtx.fillStyle = gradient;
        window.fxCtx.beginPath();
        window.fxCtx.rect(p.x, p.y, p.width, 24);
        window.fxCtx.fill();
      } else if (window.activeSkinEffect === "void") {
        p.x += p.vx || 0; p.y += p.vy || 0;
        const g = window.fxCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        g.addColorStop(0, `hsla(${p.hue}, 70%, 60%, ${p.alpha})`);
        g.addColorStop(1, `hsla(${p.hue}, 70%, 20%, 0)`);
        window.fxCtx.fillStyle = g;
        window.fxCtx.beginPath();
        window.fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        window.fxCtx.fill();
      } else if (window.activeSkinEffect === "plasma") {
        p.x += p.vx || 0; p.y += p.vy || 0;
        const hue = Math.floor((p.hue + Date.now() * 0.02) % 360);
        const gg = window.fxCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
        gg.addColorStop(0, `hsla(${hue}, 90%, 65%, ${p.alpha})`);
        gg.addColorStop(1, `hsla(${(hue + 60) % 360}, 80%, 45%, 0)`);
        window.fxCtx.fillStyle = gg;
        window.fxCtx.beginPath();
        window.fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        window.fxCtx.fill();
      }
    });
  }

  function animateFx() {
    if (!window.fxCtx) return;
    window.fxCtx.clearRect(0, 0, window.fxCanvas.width, window.fxCanvas.height);
    ensureSkinParticles();
    drawSkinParticles();
    window.confetti = window.confetti.filter((p) => p.life > 0);
    window.confetti.forEach((p) => {
      p.vy += 0.11;
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      window.fxCtx.fillStyle = `hsla(${p.hue}, 95%, 70%, ${p.life / 90})`;
      window.fxCtx.fillRect(p.x, p.y, p.size, p.size * 1.6);
    });

    if (window.confetti.length || window.activeSkinEffect) {
      requestAnimationFrame(animateFx);
    } else {
      window.fxAnimationRunning = false;
    }
  }

  function updateSkinEffect() {
    const effect = window.SKIN_EFFECTS && window.SKIN_EFFECTS[window.state?.selectedSkin] ? window.state.selectedSkin : "";
    if (effect !== window.activeSkinEffect) {
      window.activeSkinEffect = effect;
      window.skinParticles = [];
    }
    ensureSkinParticles();
    if ((window.activeSkinEffect || window.confetti.length) && !window.fxAnimationRunning) {
      window.fxAnimationRunning = true;
      requestAnimationFrame(animateFx);
    }
  }

  function emitConfetti(count) {
    if (!window.state || !window.state.confettiEnabled) return;
    for (let i = 0; i < count; i++) {
      window.confetti.push({ x: window.innerWidth * (0.2 + Math.random() * 0.6), y: window.innerHeight * 0.3, vx: (Math.random() - 0.5) * 8, vy: -Math.random() * 7 - 2, life: 90, size: Math.random() * 4 + 2, hue: Math.random() * 120 + 150 });
    }
    if (!window.fxAnimationRunning) {
      window.fxAnimationRunning = true;
      requestAnimationFrame(animateFx);
    }
  }

  window.resizeFxCanvas = resizeFxCanvas;
  window.emitConfetti = emitConfetti;
  window.updateSkinEffect = updateSkinEffect;
  window.makeSkinParticle = makeSkinParticle;
  window.ensureSkinParticles = ensureSkinParticles;
  window.drawSkinParticles = drawSkinParticles;
  window.animateFx = animateFx;

  window.EPSTUDY_APP_VISUALS = {
    resizeFxCanvas,
    emitConfetti,
    updateSkinEffect,
    makeSkinParticle,
    ensureSkinParticles,
    drawSkinParticles,
    animateFx
  };

  window.addEventListener("resize", resizeFxCanvas);
  resizeFxCanvas();
})();
