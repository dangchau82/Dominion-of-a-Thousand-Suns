// The star map: a canvas you can drag, pinch/scroll to zoom, and tap.

import type { EmpireView } from "../engine";
import type { Fleet, Id, StarColor } from "../engine/types";
import { art, img, ready } from "./assets";

const STAR_COLORS: Record<StarColor, string> = {
  red: "#ff6b4a", orange: "#ffa24a", yellow: "#ffe26b", blue: "#86b6ff", white: "#eef3ff", purple: "#c48bff",
};

export interface MapOverlay {
  selectedStar: Id | null;
  /** When choosing a destination: the fleet being moved (to draw fuel range). */
  moving: { fleet: Fleet; extraRange: number } | null;
}

export class StarMap {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cx = 0; // camera centre in light-years
  private cy = 0;
  private scale = 40; // pixels per light-year
  private dpr = 1;
  private view: EmpireView | null = null;
  private overlay: MapOverlay = { selectedStar: null, moving: null };
  private pointers = new Map<number, { x: number; y: number }>();
  private dragDist = 0;
  private pinchStart: { d: number; scale: number } | null = null;
  private backdrop: { x: number; y: number; r: number; a: number }[] = [];
  private raf = 0;
  onTapStar: (id: Id) => void = () => {};
  onTapEmpty: () => void = () => {};

  constructor(parent: HTMLElement) {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "map";
    parent.appendChild(this.canvas);
    const c = this.canvas.getContext("2d");
    if (!c) throw new Error("Canvas not supported");
    this.ctx = c;
    let seed = 1234567;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    for (let i = 0; i < 420; i++) this.backdrop.push({ x: rnd(), y: rnd(), r: rnd() * 1.2 + 0.2, a: rnd() * 0.5 + 0.15 });
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.bindInput();
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.canvas.remove();
  }

  centerOn(x: number, y: number, scale?: number): void {
    this.cx = x; this.cy = y;
    if (scale) this.scale = scale;
    this.draw();
  }

  /** Bring a star into view above the bottom panel on phones (left of the side panel on PCs). */
  focus(x: number, y: number): void {
    const W = this.canvas.width / this.dpr, H = this.canvas.height / this.dpr;
    const [sx, sy] = this.toScreen(x, y);
    const phone = W < 900;
    const tx = phone ? W / 2 : (W - 400) / 2;
    const ty = phone ? H * 0.24 : H / 2;
    const visible = phone ? sy > 60 && sy < H * 0.4 : sx < W - 400 && sx > 0;
    if (visible) return;
    this.cx += (sx - tx) / this.scale;
    this.cy += (sy - ty) / this.scale;
    this.draw();
  }

  update(view: EmpireView, overlay: MapOverlay): void {
    this.view = view;
    this.overlay = overlay;
    this.draw();
  }

  draw(): void {
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(() => this.render());
  }

  private resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(window.innerWidth * this.dpr);
    this.canvas.height = Math.floor(window.innerHeight * this.dpr);
    this.draw();
  }

  private toScreen(x: number, y: number): [number, number] {
    const w = this.canvas.width / this.dpr, h = this.canvas.height / this.dpr;
    return [w / 2 + (x - this.cx) * this.scale, h / 2 + (y - this.cy) * this.scale];
  }

  private toWorld(sx: number, sy: number): [number, number] {
    const w = this.canvas.width / this.dpr, h = this.canvas.height / this.dpr;
    return [this.cx + (sx - w / 2) / this.scale, this.cy + (sy - h / 2) / this.scale];
  }

  // ---------- Input ----------

  private bindInput(): void {
    const c = this.canvas;
    c.addEventListener("pointerdown", (e) => {
      c.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.dragDist = 0;
      if (this.pointers.size === 2) {
        const [a, b] = [...this.pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
        this.pinchStart = { d: Math.hypot(a.x - b.x, a.y - b.y), scale: this.scale };
      }
    });
    c.addEventListener("pointermove", (e) => {
      const prev = this.pointers.get(e.pointerId);
      if (!prev) return;
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.pointers.size === 2 && this.pinchStart) {
        const [a, b] = [...this.pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        this.zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, (this.pinchStart.scale * d) / this.pinchStart.d / this.scale);
        this.dragDist += 20;
      } else if (this.pointers.size === 1) {
        this.dragDist += Math.abs(dx) + Math.abs(dy);
        this.cx -= dx / this.scale;
        this.cy -= dy / this.scale;
        this.draw();
      }
    });
    const end = (e: PointerEvent) => {
      const wasTap = this.pointers.size === 1 && this.dragDist < 8;
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.pinchStart = null;
      if (wasTap) this.tap(e.clientX, e.clientY);
    };
    c.addEventListener("pointerup", end);
    c.addEventListener("pointercancel", (e) => { this.pointers.delete(e.pointerId); this.pinchStart = null; });
    c.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015));
    }, { passive: false });
  }

  private zoomAt(sx: number, sy: number, factor: number): void {
    const [wx, wy] = this.toWorld(sx, sy);
    this.scale = Math.max(6, Math.min(140, this.scale * factor));
    const [nx, ny] = this.toWorld(sx, sy);
    this.cx += wx - nx; this.cy += wy - ny;
    this.draw();
  }

  private tap(sx: number, sy: number): void {
    if (!this.view) return;
    let best: Id | null = null;
    let bestD = 26;
    for (const s of this.view.stars) {
      const [x, y] = this.toScreen(s.x, s.y);
      const d = Math.hypot(x - sx, y - sy);
      if (d < bestD) { bestD = d; best = s.id; }
    }
    if (best !== null) this.onTapStar(best);
    else this.onTapEmpty();
  }

  // ---------- Drawing ----------

  private render(): void {
    const ctx = this.ctx;
    const W = this.canvas.width / this.dpr, H = this.canvas.height / this.dpr;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = "#03050b";
    ctx.fillRect(0, 0, W, H);
    for (const b of this.backdrop) {
      ctx.globalAlpha = b.a;
      ctx.fillStyle = "#cfd8ff";
      ctx.fillRect(b.x * W, b.y * H, b.r, b.r);
    }
    ctx.globalAlpha = 1;
    const v = this.view;
    if (!v) return;
    const me = v.me;
    const colorOf = (empireId: Id | null) =>
      empireId === null ? "#888" : empireId === me.id ? me.color : v.contacts.find((c) => c.id === empireId)?.color ?? "#d9d9d9";

    // Fuel range while picking a destination.
    if (this.overlay.moving) {
      const r = (v.stats.fuelRange + this.overlay.moving.extraRange) * this.scale;
      ctx.fillStyle = "rgba(111,182,255,0.07)";
      ctx.strokeStyle = "rgba(111,182,255,0.35)";
      for (const c of v.colonies) {
        const s = v.stars[c.starId]!;
        const [x, y] = this.toScreen(s.x, s.y);
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    }

    // Fleet routes.
    ctx.setLineDash([5, 6]);
    ctx.lineWidth = 1.5;
    for (const f of v.fleets) {
      if (f.destStarId === null) continue;
      const d = v.stars[f.destStarId]!;
      const [x1, y1] = this.toScreen(f.x, f.y);
      const [x2, y2] = this.toScreen(d.x, d.y);
      ctx.strokeStyle = me.color;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.setLineDash([]);

    // Stars.
    const showNames = this.scale >= 22;
    ctx.textAlign = "center";
    ctx.font = "12px system-ui, sans-serif";
    for (const s of v.stars) {
      const [x, y] = this.toScreen(s.x, s.y);
      if (x < -60 || y < -60 || x > W + 60 || y > H + 60) continue;
      const k = v.knowledge[s.id];
      const explored = !!k?.explored;
      const r = Math.max(2.5, Math.min(7, this.scale * 0.11));
      if (s.nebula) {
        ctx.fillStyle = "rgba(140,90,200,0.10)";
        ctx.beginPath(); ctx.arc(x, y, this.scale * 0.9, 0, Math.PI * 2); ctx.fill();
      }
      // glow
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
      g.addColorStop(0, STAR_COLORS[s.color]);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = explored ? 0.55 : 0.3;
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = explored ? 1 : 0.55;
      ctx.fillStyle = STAR_COLORS[s.color];
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      // planet marker
      if (explored && k?.planet && this.scale >= 14) {
        const pim = img(art.planet(k.planet.climate));
        const ps = Math.max(10, Math.min(26, this.scale * 0.42));
        if (ready(pim)) ctx.drawImage(pim, x + r + 2, y - ps / 2 - r, ps, ps);
      }
      // ownership ring
      if (k?.ownerId !== null && k?.ownerId !== undefined) {
        ctx.strokeStyle = colorOf(k.ownerId);
        ctx.lineWidth = k.ownerId === me.id ? 2.5 : 2;
        ctx.beginPath(); ctx.arc(x, y, r + 5, 0, Math.PI * 2); ctx.stroke();
      }
      if (this.overlay.selectedStar === s.id) {
        ctx.strokeStyle = "#f3c560";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, r + 10, 0, Math.PI * 2); ctx.stroke();
      }
      if (showNames) {
        ctx.fillStyle = explored ? "#c9d2ea" : "#6f7a96";
        ctx.fillText(s.name, x, y + r + 16);
      }
    }

    // Fleets.
    const shipSize = Math.max(20, Math.min(44, this.scale * 0.75));
    const drawShip = (raceId: string | null, color: string, x: number, y: number, count: number) => {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 10; // keeps dark hulls visible on the dark map
      const im = raceId ? img(art.ship(raceId, 1)) : null;
      if (im && ready(im)) {
        ctx.drawImage(im, x - shipSize / 2, y - shipSize / 2, shipSize, shipSize);
      } else {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 6, y + 6); ctx.lineTo(x - 6, y + 6); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      if (count > 1) {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.fillText(String(count), x + shipSize / 2, y + shipSize / 2);
      }
    };
    for (const f of v.fleets) {
      const n = Object.values(f.ships).reduce((a, b) => a + b, 0);
      if (f.starId !== null && f.destStarId !== null) {
        // Ordered to leave: draw it a little way along its route so the order is visible.
        const d = v.stars[f.destStarId]!;
        const [x1, y1] = this.toScreen(f.x, f.y);
        const [x2, y2] = this.toScreen(d.x, d.y);
        const len = Math.hypot(x2 - x1, y2 - y1) || 1;
        const step = Math.min(len * 0.4, shipSize * 1.4);
        drawShip(me.raceId, me.color, x1 + ((x2 - x1) / len) * step, y1 + ((y2 - y1) / len) * step, n);
        continue;
      }
      const [x, y] = this.toScreen(f.x, f.y);
      const off = f.starId !== null ? shipSize * 0.75 : 0;
      drawShip(me.raceId, me.color, x - off, y - off * 0.6, n);
    }
    for (const f of v.seenFleets) {
      const [x, y] = this.toScreen(f.x, f.y);
      const c = v.contacts.find((k) => k.id === f.empireId);
      const off = f.starId !== null ? shipSize * 0.75 : 0;
      drawShip(c?.raceId ?? null, c?.color ?? "#ff6b6b", x + off, y - off * 0.6, f.ships);
    }
  }
}
