// The star map: a canvas you can drag, pinch/scroll to zoom, and tap.

import { CLIMATES, type EmpireView } from "../engine";
import type { Fleet, Id, StarColor } from "../engine/types";
import { art, img, ready } from "./assets";

const STAR_COLORS: Record<StarColor, string> = {
  red: "#ff6b4a", orange: "#ffa24a", yellow: "#ffe26b", blue: "#86b6ff", white: "#eef3ff", purple: "#c48bff",
};

export interface MapOverlay {
  selectedStar: Id | null;
  /** When choosing a destination: the fleet being moved (to draw fuel range). */
  moving: { fleet: Fleet; extraRange: number; settling: boolean } | null;
}

/** What a tap on a ship icon hit. */
export interface FleetTap {
  mine: boolean;
  fleetId: number | null;
  starId: Id | null;
  destStarId: Id | null;
  empireId: Id;
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
  onTapFleet: (hit: FleetTap) => void = () => {};
  /** Where ship icons were drawn last frame, for tapping. */
  private fleetHits: (FleetTap & { x: number; y: number; r: number })[] = [];
  private pulseTimer = 0;
  private tip: HTMLDivElement;

  constructor(parent: HTMLElement) {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "map";
    parent.appendChild(this.canvas);
    this.tip = document.createElement("div");
    this.tip.className = "map-tip";
    parent.appendChild(this.tip);
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
    this.tip.remove();
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
    if (!this.view || this.view.stars.length !== view.stars.length || this.view.stars[0]?.x !== view.stars[0]?.x) this.bounds = null;
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
      if (!prev) { if (e.pointerType === "mouse") this.hover(e.clientX, e.clientY); return; }
      this.tip.style.display = "none";
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
    c.addEventListener("pointerleave", () => { this.tip.style.display = "none"; });
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

  /** Mouse hover (PC): a small tooltip for the ship icon or star under the cursor. */
  private hover(sx: number, sy: number): void {
    const v = this.view;
    const html = v ? this.tipFor(v, sx, sy) : null;
    if (!html) { this.tip.style.display = "none"; this.canvas.style.cursor = ""; return; }
    this.canvas.style.cursor = "pointer";
    this.tip.innerHTML = html;
    this.tip.style.display = "block";
    const W = window.innerWidth;
    const w = this.tip.offsetWidth;
    this.tip.style.left = `${Math.min(sx + 16, W - w - 8)}px`;
    this.tip.style.top = `${sy + 18}px`;
  }

  private tipFor(v: EmpireView, sx: number, sy: number): string | null {
    const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
    const nameOf = (id: Id) => (id === v.me.id ? "You" : v.contacts.find((c) => c.id === id)?.name ?? "Unknown empire");
    if (!this.overlay.moving) {
      const hit = this.fleetHits.find((h) => Math.hypot(h.x - sx, h.y - sy) <= h.r);
      if (hit) {
        if (hit.mine) {
          const f = v.fleets.find((x) => x.id === hit.fleetId);
          if (!f) return null;
          const list = Object.entries(f.ships).filter(([, n]) => n > 0)
            .map(([id, n]) => `${n} ${esc(v.designs.find((d) => d.id === id)?.name ?? id)}`).join(", ");
          const where = f.destStarId !== null ? `→ ${esc(v.stars[f.destStarId]!.name)}, ${v.turnsTo(f, f.destStarId) <= 1 ? "next turn" : `${v.turnsTo(f, f.destStarId)} turns`}` : "Click to give orders";
          return `<b>Your fleet</b><br>${list}<br><span class="dim">${where}</span>`;
        }
        const sf = v.seenFleets.find((x) => x.empireId === hit.empireId && x.starId === hit.starId);
        const war = v.contacts.find((c) => c.id === hit.empireId)?.warSince != null;
        const heading = sf?.destStarId != null ? `<br><span class="dim">Our agents say it is heading for ${esc(v.stars[sf.destStarId]!.name)}</span>` : "";
        return `<b style="color:${war ? "#ff8a8a" : "inherit"}">${war ? "⚠ Enemy" : "Foreign"} fleet</b><br>${sf?.ships ?? "?"} ships of the ${esc(nameOf(hit.empireId))}${heading}`;
      }
    }
    let best: Id | null = null;
    let bestD = 22;
    for (const s of v.stars) {
      const [x, y] = this.toScreen(s.x, s.y);
      const d = Math.hypot(x - sx, y - sy);
      if (d < bestD) { bestD = d; best = s.id; }
    }
    if (best === null) return null;
    const s = v.stars[best]!;
    const k = v.knowledge[best];
    const lines: string[] = [`<b>${esc(s.name)}</b> <span class="dim">${s.color} star</span>`];
    if (!k?.explored) lines.push(`<span class="dim">Unexplored</span>`);
    else if (!k.planet) lines.push(`<span class="dim">No habitable planet</span>`);
    else {
      lines.push(`${CLIMATES[k.planet.climate].name}, size ${k.planet.size + k.planet.terraform}`);
      if (k.ownerId !== null) lines.push(`${esc(nameOf(k.ownerId))}${k.population !== null ? ` · pop ${Math.round(k.population)}` : ""}`);
      else if (v.canSettle(best)) lines.push(`<span class="good">You can settle here</span>`);
      else lines.push(`<span class="dim">Too harsh to settle yet</span>`);
    }
    const mv = this.overlay.moving;
    if (mv) {
      const ok = v.reachable(best, { ...mv.fleet, ships: { ...mv.fleet.ships } });
      lines.push(ok ? `<span class="good">Click to send · ${v.turnsTo(mv.fleet, best)} turn(s)</span>` : `<span class="bad">Out of fuel range</span>`);
    }
    return lines.join("<br>");
  }

  private tap(sx: number, sy: number): void {
    if (!this.view) return;
    // Ship icons first (they sit beside their star), unless we're picking a destination.
    if (!this.overlay.moving) {
      let hit: (typeof this.fleetHits)[number] | null = null;
      let hd = Infinity;
      for (const h of this.fleetHits) {
        const d = Math.hypot(h.x - sx, h.y - sy);
        if (d <= h.r && d < hd) { hd = d; hit = h; }
      }
      if (hit) { this.onTapFleet(hit); return; }
    }
    let best: Id | null = null;
    let bestD = matchMedia("(pointer: coarse)").matches ? 38 : 28; // generous tap area around stars
    for (const s of this.view.stars) {
      const [x, y] = this.toScreen(s.x, s.y);
      const d = Math.hypot(x - sx, y - sy);
      if (d < bestD) { bestD = d; best = s.id; }
    }
    if (best !== null) this.onTapStar(best);
    else this.onTapEmpty();
  }

  // ---------- Drawing ----------

  /** Offscreen canvas for painting empire territories. */
  private terr: HTMLCanvasElement | null = null;

  private render(): void {
    const ctx = this.ctx;
    const W = this.canvas.width / this.dpr, H = this.canvas.height / this.dpr;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const v = this.view;

    // Deep-space background, lighter toward the middle of the screen.
    const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
    bg.addColorStop(0, "#0a1024");
    bg.addColorStop(1, "#020309");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // The galaxy's body and a few nebula clouds, fixed to the map so they pan with it.
    if (v) this.drawGalaxyGlow(ctx, v);

    // Two layers of distant stars that drift slowly as you pan (parallax).
    for (let i = 0; i < this.backdrop.length; i++) {
      const b = this.backdrop[i]!;
      const depth = i % 3 === 0 ? 0.06 : 0.025;
      const x = (((b.x * W - this.cx * this.scale * depth) % W) + W) % W;
      const y = (((b.y * H - this.cy * this.scale * depth) % H) + H) % H;
      ctx.globalAlpha = b.a * (i % 3 === 0 ? 1 : 0.7);
      ctx.fillStyle = i % 7 === 0 ? "#ffe9c4" : i % 5 === 0 ? "#c4d6ff" : "#e6ecff";
      ctx.fillRect(x, y, b.r, b.r);
    }
    ctx.globalAlpha = 1;
    if (!v) return;
    const me = v.me;
    const colorOf = (empireId: Id | null) =>
      empireId === null ? "#888" : empireId === me.id ? me.color : v.contacts.find((c) => c.id === empireId)?.color ?? "#d9d9d9";

    // Empire territory: a soft tint with a crisp border around each empire's known colonies.
    this.drawTerritories(ctx, v, W, H, colorOf);

    // Fuel range while picking a destination. The rest of space is dimmed so your empire stands out.
    const mv = this.overlay.moving;
    const reachLy = mv ? v.stats.fuelRange + mv.extraRange : 0;
    const reachable = (sx: number, sy: number) =>
      !mv || v.colonies.some((c) => { const s = v.stars[c.starId]!; return Math.hypot(s.x - sx, s.y - sy) <= reachLy + 1e-9; });
    if (mv) {
      ctx.fillStyle = "rgba(1,2,8,0.55)";
      ctx.fillRect(0, 0, W, H);
    }
    if (this.overlay.moving) {
      const r = (v.stats.fuelRange + this.overlay.moving.extraRange) * this.scale;
      ctx.fillStyle = "rgba(111,182,255,0.09)";
      ctx.strokeStyle = "rgba(111,182,255,0.55)";
      ctx.setLineDash([6, 6]);
      for (const c of v.colonies) {
        const s = v.stars[c.starId]!;
        const [x, y] = this.toScreen(s.x, s.y);
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Rival fleets whose destination our spies report: a thin red dotted line.
    ctx.lineWidth = 1.2;
    for (const f of v.seenFleets) {
      if (f.destStarId === null) continue;
      const d = v.stars[f.destStarId]!;
      const [x1, y1] = this.toScreen(f.x, f.y);
      const [x2, y2] = this.toScreen(d.x, d.y);
      ctx.strokeStyle = "rgba(255,107,107,0.7)";
      ctx.setLineDash([2, 5]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Fleet routes, with an arrowhead at the destination.
    ctx.lineWidth = 1.6;
    for (const f of v.fleets) {
      if (f.destStarId === null) continue;
      const d = v.stars[f.destStarId]!;
      const [x1, y1] = this.toScreen(f.x, f.y);
      const [x2, y2] = this.toScreen(d.x, d.y);
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, hexA(me.color, 0.25));
      grad.addColorStop(1, hexA(me.color, 0.9));
      ctx.strokeStyle = grad;
      ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
      const a = Math.atan2(y2 - y1, x2 - x1);
      const tip = 12;
      const ax = x2 - Math.cos(a) * tip, ay = y2 - Math.sin(a) * tip;
      ctx.fillStyle = hexA(me.color, 0.9);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - Math.cos(a - 0.45) * 8, ay - Math.sin(a - 0.45) * 8);
      ctx.lineTo(ax - Math.cos(a + 0.45) * 8, ay - Math.sin(a + 0.45) * 8);
      ctx.closePath(); ctx.fill();
    }

    // Stars.
    const showNames = this.scale >= 22;
    ctx.textAlign = "center";
    const SIZE: Record<StarColor, number> = { blue: 1.25, white: 1.1, yellow: 1, orange: 0.92, red: 0.82, purple: 1 };
    for (const s of v.stars) {
      const [x, y] = this.toScreen(s.x, s.y);
      if (x < -80 || y < -80 || x > W + 80 || y > H + 80) continue;
      const k = v.knowledge[s.id];
      const explored = !!k?.explored;
      const col = STAR_COLORS[s.color];
      const r = Math.max(2.2, Math.min(7.5, this.scale * 0.11)) * SIZE[s.color];
      const far = mv ? !reachable(s.x, s.y) : false;
      const dimK = far ? 0.3 : 1;
      if (s.nebula) this.drawNebula(ctx, x, y, s.id);

      // Corona, then a hot white core.
      ctx.globalAlpha = (explored ? 0.7 : 0.35) * dimK;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4.2);
      g.addColorStop(0, hexA(col, 0.9));
      g.addColorStop(0.25, hexA(col, 0.35));
      g.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r * 4.2, 0, Math.PI * 2); ctx.fill();
      // Diffraction spikes on bright, explored stars when zoomed in.
      if (explored && this.scale >= 30) {
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        const len = r * 3.4;
        ctx.beginPath(); ctx.moveTo(x - len, y); ctx.lineTo(x + len, y); ctx.moveTo(x, y - len); ctx.lineTo(x, y + len); ctx.stroke();
      }
      ctx.globalAlpha = (explored ? 1 : 0.55) * dimK;
      const core = ctx.createRadialGradient(x, y, 0, x, y, r);
      core.addColorStop(0, "#ffffff");
      core.addColorStop(0.45, col);
      core.addColorStop(1, hexA(col, 0.85));
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      // Planet, tucked beside its star.
      if (explored && k?.planet && this.scale >= 14) {
        const pim = img(art.planet(k.planet.climate));
        const ps = Math.max(10, Math.min(26, this.scale * 0.42));
        if (ready(pim)) ctx.drawImage(pim, x + r + 3, y - ps / 2 - r, ps, ps);
      }
      // Ownership: a glowing ring in the owner's colour (thicker for yours).
      const owner = k?.ownerId;
      if (owner !== null && owner !== undefined) {
        const oc = colorOf(owner);
        ctx.save();
        ctx.shadowColor = oc;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = oc;
        ctx.lineWidth = owner === me.id ? 2.5 : 1.8;
        ctx.beginPath(); ctx.arc(x, y, r + 5, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        if (v.colonies.some((c) => c.starId === s.id && c.isCapital)) {
          // Capital: a small crown of three dots.
          ctx.fillStyle = oc;
          for (const dx of [-5, 0, 5]) { ctx.beginPath(); ctx.arc(x + dx, y - r - 10 - (dx === 0 ? 2 : 0), 1.8, 0, Math.PI * 2); ctx.fill(); }
        }
      }
      // While sending ships: your colonies glow and pulse, and worlds a colony ship can settle get a green ring.
      if (mv && owner === me.id) {
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 260);
        ctx.save();
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r + 26);
        glow.addColorStop(0, hexA(me.color, 0.55));
        glow.addColorStop(1, hexA(me.color, 0));
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(x, y, r + 26, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = me.color; ctx.shadowBlur = 18;
        ctx.strokeStyle = me.color; ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.arc(x, y, r + 7, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 0.25 + 0.5 * (1 - pulse);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, r + 9 + pulse * 10, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      if (mv?.settling && !far && v.canSettle(s.id)) {
        ctx.save();
        ctx.strokeStyle = "#5fe08a"; ctx.shadowColor = "#5fe08a"; ctx.shadowBlur = 10; ctx.lineWidth = 2.2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.arc(x, y, r + 8, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      if (mv && mv.fleet.starId === s.id) {
        ctx.save();
        ctx.fillStyle = "#f3c560"; ctx.font = "bold 11px system-ui, sans-serif";
        ctx.fillText("FROM HERE", x, y - r - 16);
        ctx.restore();
      }
      if (this.overlay.selectedStar === s.id) {
        ctx.save();
        ctx.strokeStyle = "#f3c560";
        ctx.shadowColor = "#f3c560";
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, r + 11, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([3, 5]);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, r + 16, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      if (showNames || (mv && (owner === me.id || (!far && this.scale >= 12)))) {
        const mine = owner === me.id;
        const known = owner !== null && owner !== undefined;
        ctx.font = `${known ? "600 " : ""}${explored ? "" : "italic "}12px "Segoe UI", system-ui, sans-serif`;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 4;
        if (mv && mine) { ctx.shadowColor = me.color; ctx.shadowBlur = 10; ctx.font = `700 13px "Segoe UI", system-ui, sans-serif`; }
        ctx.globalAlpha = far ? 0.4 : 1;
        ctx.fillStyle = known ? (mine ? "#ffffff" : lighten(colorOf(owner))) : explored ? "#b9c3dc" : "#5f6a86";
        ctx.fillText(s.name, x, y + r + 17);
        ctx.restore();
      }
    }

    // Fleets.
    const shipSize = Math.max(20, Math.min(44, this.scale * 0.75));
    this.fleetHits = [];
    const drawShip = (raceId: string | null, color: string, x: number, y: number, count: number, hit?: FleetTap) => {
      if (hit) this.fleetHits.push({ ...hit, x, y, r: Math.max(22, shipSize * 0.7) });
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
        drawShip(me.raceId, me.color, x1 + ((x2 - x1) / len) * step, y1 + ((y2 - y1) / len) * step, n,
          { mine: true, fleetId: f.id, starId: f.starId, destStarId: f.destStarId, empireId: me.id });
        continue;
      }
      const [x, y] = this.toScreen(f.x, f.y);
      const off = f.starId !== null ? shipSize * 0.75 : 0;
      drawShip(me.raceId, me.color, x - off, y - off * 0.6, n,
        { mine: true, fleetId: f.id, starId: f.starId, destStarId: f.destStarId, empireId: me.id });
    }
    for (const f of v.seenFleets) {
      const [x, y] = this.toScreen(f.x, f.y);
      const c = v.contacts.find((k) => k.id === f.empireId);
      const off = f.starId !== null ? shipSize * 0.75 : 0;
      drawShip(c?.raceId ?? null, c?.color ?? "#ff6b6b", x + off, y - off * 0.6, f.ships,
        { mine: false, fleetId: null, starId: f.starId, destStarId: f.destStarId, empireId: f.empireId });
    }

    if (mv) { clearTimeout(this.pulseTimer); this.pulseTimer = window.setTimeout(() => this.draw(), 40); }

    // Soft vignette so the edges of the screen fall away into space.
    const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.8);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  /** A broad glow over the whole galaxy's shape plus a few coloured nebula clouds. */
  private drawGalaxyGlow(ctx: CanvasRenderingContext2D, v: EmpireView): void {
    if (!this.bounds) {
      const xs = v.stars.map((s) => s.x), ys = v.stars.map((s) => s.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const clouds: { x: number; y: number; r: number; hue: string }[] = [];
      const hues = ["120,80,200", "60,110,210", "190,70,140", "50,150,170"];
      v.stars.forEach((s, i) => { if (i % 11 === 3) clouds.push({ x: s.x, y: s.y, r: 3 + (i % 5), hue: hues[i % hues.length]! }); });
      this.bounds = { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, rx: (maxX - minX) / 2 + 2, ry: (maxY - minY) / 2 + 2, clouds };
    }
    const b = this.bounds;
    const [gx, gy] = this.toScreen(b.cx, b.cy);
    const rx = b.rx * this.scale, ry = b.ry * this.scale;
    ctx.save();
    ctx.translate(gx, gy);
    ctx.scale(1, ry / Math.max(1, rx));
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 1.1);
    g.addColorStop(0, "rgba(120,130,220,0.16)");
    g.addColorStop(0.35, "rgba(90,80,180,0.08)");
    g.addColorStop(1, "rgba(40,40,120,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, rx * 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    for (const c of b.clouds) {
      const [x, y] = this.toScreen(c.x, c.y);
      const r = c.r * this.scale;
      const cg = ctx.createRadialGradient(x, y, 0, x, y, r);
      cg.addColorStop(0, `rgba(${c.hue},0.10)`);
      cg.addColorStop(1, `rgba(${c.hue},0)`);
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  private bounds: { cx: number; cy: number; rx: number; ry: number; clouds: { x: number; y: number; r: number; hue: string }[] } | null = null;

  /** A nebula: a few overlapping purple puffs, shaped differently for each star. */
  private drawNebula(ctx: CanvasRenderingContext2D, x: number, y: number, id: number): void {
    for (let i = 0; i < 3; i++) {
      const a = id * 1.7 + i * 2.1;
      const px = x + Math.cos(a) * this.scale * 0.35, py = y + Math.sin(a) * this.scale * 0.3;
      const r = this.scale * (0.7 + 0.2 * i);
      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, i === 1 ? "rgba(90,140,230,0.13)" : "rgba(160,90,220,0.14)");
      g.addColorStop(1, "rgba(120,60,200,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  /** Territory: each empire's known colonies, merged into one tinted region with a border. */
  private drawTerritories(ctx: CanvasRenderingContext2D, v: EmpireView, W: number, H: number, colorOf: (id: Id | null) => string): void {
    const byOwner = new Map<Id, [number, number][]>();
    for (const s of v.stars) {
      const o = v.knowledge[s.id]?.ownerId;
      if (o === null || o === undefined) continue;
      const list = byOwner.get(o) ?? [];
      list.push(this.toScreen(s.x, s.y));
      byOwner.set(o, list);
    }
    if (!byOwner.size) return;
    this.terr ??= document.createElement("canvas");
    const off = this.terr;
    if (off.width !== Math.ceil(W) || off.height !== Math.ceil(H)) { off.width = Math.ceil(W); off.height = Math.ceil(H); }
    const oc = off.getContext("2d")!;
    const R = 2.1 * this.scale;
    for (const [owner, pts] of [...byOwner].sort((a, b) => a[0] - b[0])) {
      const col = colorOf(owner);
      // Fill
      oc.clearRect(0, 0, off.width, off.height);
      oc.globalCompositeOperation = "source-over";
      oc.fillStyle = col;
      for (const [x, y] of pts) { oc.beginPath(); oc.arc(x, y, R, 0, Math.PI * 2); oc.fill(); }
      ctx.globalAlpha = owner === v.me.id ? 0.11 : 0.08;
      ctx.drawImage(off, 0, 0, W, H);
      // Border: the same circles, hollowed out by slightly smaller ones.
      oc.globalCompositeOperation = "destination-out";
      for (const [x, y] of pts) { oc.beginPath(); oc.arc(x, y, R - 1.3, 0, Math.PI * 2); oc.fill(); }
      oc.globalCompositeOperation = "source-over";
      ctx.globalAlpha = owner === v.me.id ? 0.55 : 0.42;
      ctx.drawImage(off, 0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }
}

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function lighten(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.slice(0, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.35);
  return `rgb(${mix((n >> 16) & 255)},${mix((n >> 8) & 255)},${mix(n & 255)})`;
}
