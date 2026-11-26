// Title screen: the ancient gate wakes up. A canvas laid exactly over the ring in the title video:
// sparks run round the rim, light pours in from the edge, then a rippling, shimmering surface holds.
// Our own design (no film effects copied). Stops by itself when the menu is closed.

/** Where the ring's open middle sits in the 1280x720 title video. */
const SRC = { w: 1280, h: 720, cx: 651, cy: 316, rx: 85, ry: 77 };

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));

export function addGatePortal(host: HTMLElement): void {
  const cv = document.createElement("canvas");
  cv.className = "title-portal";
  cv.setAttribute("aria-hidden", "true");
  const vid = host.querySelector(".title-video");
  if (vid) vid.after(cv); else host.prepend(cv); // just above the video, below the text
  const ctx = cv.getContext("2d");
  if (!ctx) return;

  // Same maths as CSS object-fit: cover, so the canvas lines up with the ring at any window size.
  let s = 1, ox = 0, oy = 0, dpr = 1;
  const fit = () => {
    const W = host.clientWidth, H = host.clientHeight;
    s = Math.max(W / SRC.w, H / SRC.h);
    ox = (W - SRC.w * s) / 2;
    oy = (H - SRC.h * s) / 2;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const pad = 1.6; // room for the glow outside the ring
    const bw = SRC.rx * 2 * s * pad, bh = SRC.ry * 2 * s * pad;
    cv.style.left = `${ox + SRC.cx * s - bw / 2}px`;
    cv.style.top = `${oy + SRC.cy * s - bh / 2}px`;
    cv.style.width = `${bw}px`;
    cv.style.height = `${bh}px`;
    cv.width = Math.round(bw * dpr);
    cv.height = Math.round(bh * dpr);
  };
  fit();
  window.addEventListener("resize", fit);

  const t0 = performance.now();
  const frame = (now: number) => {
    if (!cv.isConnected) { window.removeEventListener("resize", fit); return; }
    const t = (now - t0) / 1000;
    const w = cv.width, h = cv.height, cx = w / 2, cy = h / 2;
    const rx = SRC.rx * s * dpr, ry = SRC.ry * s * dpr;
    ctx.clearRect(0, 0, w, h);

    const wake = ease((t - 0.6) / 1.2);  // sparks round the rim
    const pour = ease((t - 1.6) / 1.6);  // light pours in from the edge
    const hold = ease((t - 2.8) / 1.5);  // ripples settle in

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, ry / rx);

    // Glow spilling onto the ring.
    if (wake > 0) {
      const g = ctx.createRadialGradient(0, 0, rx * 0.8, 0, 0, rx * 1.45);
      g.addColorStop(0, `rgba(120,220,255,${0.35 * wake})`);
      g.addColorStop(1, "rgba(120,220,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, rx * 1.45, 0, Math.PI * 2); ctx.arc(0, 0, rx * 0.97, 0, Math.PI * 2, true); ctx.fill("evenodd");
    }

    // Everything else stays inside the ring.
    ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.clip();

    // The surface fills from the rim inward: an outer band that thickens until it closes.
    if (pour > 0) {
      const inner = rx * (1 - pour);
      const base = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      const pulse = 0.08 * Math.sin(t * 1.7);
      base.addColorStop(0, `rgba(210,245,255,${0.85 + pulse})`);
      base.addColorStop(0.45, "rgba(90,170,255,0.85)");
      base.addColorStop(0.85, "rgba(70,60,200,0.9)");
      base.addColorStop(1, "rgba(150,230,255,0.95)");
      ctx.fillStyle = base;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      if (inner > 0.5) ctx.arc(0, 0, inner, 0, Math.PI * 2, true);
      ctx.fill("evenodd");
      // Bright leading edge of the pour.
      if (pour < 1) {
        ctx.strokeStyle = "rgba(235,252,255,0.9)";
        ctx.lineWidth = rx * 0.05;
        ctx.beginPath(); ctx.arc(0, 0, Math.max(1, inner), 0, Math.PI * 2); ctx.stroke();
      }
    }

    // Shimmer: ripples drifting out from the middle, and slow swirling streaks of light.
    if (hold > 0) {
      ctx.globalCompositeOperation = "lighter";
      ctx.filter = `blur(${(1.5 * dpr).toFixed(1)}px)`;
      for (let i = 0; i < 8; i++) {
        const ph = (t * 0.18 + i / 8) % 1;
        const r = rx * ph;
        ctx.strokeStyle = `rgba(200,240,255,${0.22 * hold * Math.sin(Math.PI * ph)})`;
        ctx.lineWidth = rx * (0.015 + 0.03 * ph);
        ctx.beginPath();
        for (let a = 0; a <= 64; a++) {
          const th = (a / 64) * Math.PI * 2;
          const wob = 1 + 0.015 * Math.sin(th * 5 + t * 2.3 + i) + 0.01 * Math.sin(th * 3 - t * 1.6);
          const x = Math.cos(th) * r * wob, y = Math.sin(th) * r * wob;
          if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (let k = 0; k < 3; k++) {
        const rot = t * (0.25 + k * 0.12) * (k % 2 ? -1 : 1) + k * 2.1;
        ctx.strokeStyle = `rgba(160,120,255,${0.22 * hold})`;
        ctx.lineWidth = rx * 0.06;
        ctx.beginPath(); ctx.arc(0, 0, rx * (0.35 + k * 0.2), rot, rot + 1.3); ctx.stroke();
      }
      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();

    // Sparks chasing round the rim while it wakes (they fade once the surface has formed).
    const sparkA = wake * (1 - 0.7 * hold);
    if (sparkA > 0) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 9; i++) {
        const th = t * (1.4 + (i % 3) * 0.5) + (i * Math.PI * 2) / 9;
        const x = Math.cos(th) * rx * 0.98, y = Math.sin(th) * ry * 0.98;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rx * 0.12);
        g.addColorStop(0, `rgba(230,250,255,${0.9 * sparkA})`);
        g.addColorStop(1, "rgba(120,220,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, rx * 0.12, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
