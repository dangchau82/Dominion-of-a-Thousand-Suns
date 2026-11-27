// Race scenes (written by Claude 2; Danny: "scenes like colonising a planet per race, tech
// done, spy done, war and conquest done, with a bit of CGI"). After a turn, the most
// important moment for the player gets a short full-screen scene in the player's race:
// a new colony, a discovery, a spy success, a declaration of war, a won battle, a conquest
// or a finished great work.
//
// If a video exists at art/scenes-video/<race>-<scene>.mp4 it plays (Danny makes these with
// Google Flow; see docs/scene-video-prompts.md). Otherwise a drawn scene plays on a canvas,
// made from the race's portrait, ships and the planet art the game already has.
//
// One scene per turn at most; click, Space, Enter or Esc skips. Scenes can be turned off.
// PC first (Danny, 2026-11-26): the stage is 16:9 and scales to the window.

import { art, img, ready } from "./assets";
import { play } from "./sound";
import { DEFAULT_LINES, SCENE_LINES, SCENE_TITLES, type SceneKind } from "./sceneText";
import type { GameEvent, GameState, Id } from "../engine/types";

const KEY = "dots-scenes";
const W = 1280, H = 720;
const LENGTH = 6500; // ms for drawn scenes

export function scenesOn(): boolean {
  try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
}
export function setScenes(on: boolean): void {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* storage unavailable */ }
}

export interface Scene {
  kind: SceneKind;
  raceId: string;
  color: string;
  starId?: Id;
  climate?: string;
  rivalRaceId?: string;
  rivalColor?: string;
  rivalName?: string;
  tech?: string;
  work?: string;
  text: string;
}

const PRIORITY: SceneKind[] = ["wonder", "invasion", "war", "battle", "colony", "spy", "science"];

/** Pick this turn's scene for the player, if any. */
export function sceneFor(state: GameState, playerId: Id, events: GameEvent[]): Scene | null {
  const me = state.empires[playerId]!;
  const found: Partial<Record<SceneKind, GameEvent>> = {};
  for (const ev of events) {
    if (ev.kind === "invasion" && ev.starId !== undefined && state.colonies[ev.starId]?.empireId === playerId) found.invasion ??= ev;
    else if (ev.kind === "war" && /declared war/.test(ev.text) && ev.text.includes(me.name)) found.war ??= ev;
    else if (ev.kind === "colonized" && ev.empireId === playerId) found.colony ??= ev;
    else if (ev.kind === "spy" && /^Our (agents stole|saboteurs)/.test(ev.text)) found.spy ??= ev;
    else if (ev.kind === "research" && /^Discovered /.test(ev.text)) found.science ??= ev;
    else if (ev.kind === "saga" && ev.text.startsWith(`The ${me.name} have completed the `)) found.wonder ??= ev;
  }
  // A clear win in a battle this turn: the enemy lost 3+ ships, and more than we did.
  const turn = events[0]?.turn;
  const won = (state.battles ?? []).find((b) => {
    if (b.turn !== turn || !b.empires.includes(playerId)) return false;
    const lost = (side: number) => b.units.filter((u) => u.side === side && u.key !== "planet").reduce((a, u) => a + u.start - u.end, 0);
    const ours = b.empires[0] === playerId ? 0 : 1;
    return lost(1 - ours) >= 3 && lost(1 - ours) > lost(ours);
  });
  if (won) found.battle = { turn: won.turn, empireId: playerId, kind: "battle", text: "", starId: won.starId };
  const kind = PRIORITY.find((k) => found[k]);
  if (!kind) return null;
  const ev = found[kind]!;
  const lines = SCENE_LINES[me.raceId] ?? DEFAULT_LINES;
  const star = ev.starId !== undefined ? state.stars[ev.starId] : undefined;
  // The other side: the enemy named in a war, or the old owner's race for a conquest/spy job.
  let rival: GameState["empires"][number] | undefined;
  if (kind === "war") rival = state.empires.find((o) => o.id !== playerId && ev.text.includes(o.name));
  if (kind === "invasion" && star) {
    const from = state.colonies[star.id]?.occupiedFrom;
    rival = from !== undefined ? state.empires[from] : undefined;
  }
  if (kind === "spy") rival = state.empires.find((o) => o.id !== playerId && ev.text.includes(o.name));
  if (kind === "battle" && won) rival = state.empires[won.empires[0] === playerId ? won.empires[1] : won.empires[0]];
  const work = kind === "wonder" ? /have completed the (.+?) at /.exec(ev.text)?.[1] : undefined;
  const tech = kind === "science" ? /^Discovered ([^:]+):/.exec(ev.text)?.[1] : undefined;
  const text = lines[kind]
    .replace(/\{star\}/g, star?.name ?? "the new world")
    .replace(/\{tech\}/g, tech ?? "A new discovery")
    .replace(/\{rival\}/g, rival?.name ?? "our enemy")
    .replace(/\{work\}/g, work ? `The ${work}` : "Our great work");
  return {
    kind, raceId: me.raceId, color: me.color, starId: star?.id, climate: star?.planet?.climate,
    rivalRaceId: rival?.raceId, rivalColor: rival?.color, rivalName: rival?.name, tech, work, text,
  };
}

/** Play this turn's scene (if any), then call `done`. */
export function playTurnScene(state: GameState, playerId: Id, events: GameEvent[], done: () => void): void {
  const scene = scenesOn() ? sceneFor(state, playerId, events) : null;
  if (!scene) { done(); return; }
  showScene(scene, done);
}

// ---- The stage --------------------------------------------------------------------------

let styled = false;
function style(): void {
  if (styled) return;
  styled = true;
  const css = document.createElement("style");
  css.textContent = `
  .scene-back { position: fixed; inset: 0; z-index: 60; background: #000; display: flex; align-items: center; justify-content: center; cursor: pointer; animation: scene-in .5s ease; }
  .scene-stage { position: relative; width: min(100vw, calc(100vh * 16 / 9)); aspect-ratio: 16 / 9; overflow: hidden; }
  .scene-stage canvas, .scene-stage video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .scene-cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 2.2% 4% 3%; background: linear-gradient(transparent, rgba(0,0,0,.85)); color: #eee; font: 1.45vw/1.4 Georgia, serif; text-shadow: 0 2px 6px #000; }
  .scene-cap h2 { margin: 0 0 .3em; font: 600 2.4vw/1.1 Georgia, serif; letter-spacing: .12em; text-transform: uppercase; }
  .scene-skip { position: absolute; top: 2%; right: 1.5%; display: flex; gap: 8px; }
  .scene-skip button { background: rgba(0,0,0,.55); color: #ddd; border: 1px solid #555; border-radius: 6px; padding: 4px 10px; font-size: 13px; cursor: pointer; }
  @keyframes scene-in { from { opacity: 0 } to { opacity: 1 } }
  @keyframes scene-cap-in { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
  .scene-cap { animation: scene-cap-in 1.2s ease .8s both; }`;
  document.head.append(css);
}

export function showScene(scene: Scene, done: () => void): void {
  style();
  const back = document.createElement("div");
  back.className = "scene-back";
  const stage = document.createElement("div");
  stage.className = "scene-stage";
  const cap = document.createElement("div");
  cap.className = "scene-cap";
  cap.innerHTML = `<h2 style="color:${scene.color}">${SCENE_TITLES[scene.kind]}</h2><div></div>`;
  cap.lastElementChild!.textContent = scene.text;
  const skip = document.createElement("div");
  skip.className = "scene-skip";
  skip.innerHTML = `<button data-off>Turn scenes off</button><button data-skip>Skip ▸</button>`;
  stage.append(cap, skip);
  back.append(stage);
  document.body.append(back);
  play(scene.kind === "war" || scene.kind === "invasion" ? "war" : scene.kind === "battle" ? "battle" : scene.kind === "colony" ? "colony" : scene.kind === "wonder" ? "victory" : "discovery");

  let finished = false;
  let stopDraw = () => {};
  const finish = () => {
    if (finished) return;
    finished = true;
    stopDraw();
    removeEventListener("keydown", onKey, true);
    back.remove();
    done();
  };
  const onKey = (e: KeyboardEvent) => { if ([" ", "Enter", "Escape"].includes(e.key)) { e.preventDefault(); e.stopPropagation(); finish(); } };
  addEventListener("keydown", onKey, true);
  back.onclick = (e) => {
    if ((e.target as HTMLElement).dataset.off !== undefined) setScenes(false);
    finish();
  };

  // The drawn scene starts at once; a made video takes over if one exists and can play.
  stopDraw = drawScene(stage, scene, finish);
  const video = document.createElement("video");
  video.muted = true; video.playsInline = true; video.preload = "auto";
  video.style.opacity = "0";
  video.oncanplay = () => {
    if (finished || video.dataset.on) return;
    video.dataset.on = "1";
    stopDraw();
    stopDraw = () => video.pause();
    video.style.opacity = "1";
    void video.play().catch(() => {});
  };
  video.onended = finish;
  video.onerror = () => video.remove();
  video.src = `art/scenes-video/${scene.raceId}-${scene.kind}.mp4`;
  stage.prepend(video);
}

// ---- Drawn scenes -----------------------------------------------------------------------

interface Ctx { g: CanvasRenderingContext2D; t: number; s: Scene; }

function hash(n: number): number { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }

function rgba(hex: string, a: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Draws one image if loaded; returns whether it was. */
function draw(g: CanvasRenderingContext2D, src: string, x: number, y: number, w: number, h: number, alpha = 1): boolean {
  const im = img(src);
  if (!ready(im)) return false;
  g.save(); g.globalAlpha = alpha; g.drawImage(im, x, y, w, h); g.restore();
  return true;
}

function stars(c: Ctx, drift: number): void {
  const { g, t } = c;
  g.fillStyle = "#03040a"; g.fillRect(0, 0, W, H);
  const neb = g.createRadialGradient(W * 0.7, H * 0.3, 10, W * 0.7, H * 0.3, W * 0.7);
  neb.addColorStop(0, rgba(c.s.color, 0.18)); neb.addColorStop(1, "transparent");
  g.fillStyle = neb; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) {
    const depth = 0.2 + hash(i) * 0.8;
    const x = (hash(i + 1) * W - t * drift * depth * 0.04 + W * 10) % W;
    const y = hash(i + 2) * H;
    g.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * depth * (0.7 + 0.3 * Math.sin(t / 300 + i))})`;
    g.fillRect(x, y, depth * 2, depth * 2);
  }
}

function planet(c: Ctx, cx: number, cy: number, r: number, tint?: string): void {
  const { g } = c;
  const glow = g.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.25);
  glow.addColorStop(0, rgba(tint ?? "#88aaff", 0.35)); glow.addColorStop(1, "transparent");
  g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, r * 1.25, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip();
  if (!draw(g, art.planet(c.s.climate ?? "terran"), cx - r, cy - r, r * 2, r * 2)) { g.fillStyle = "#335"; g.fillRect(cx - r, cy - r, r * 2, r * 2); }
  // Night side.
  const shade = g.createLinearGradient(cx - r, cy, cx + r, cy);
  shade.addColorStop(0, "rgba(0,0,0,0)"); shade.addColorStop(0.55, "rgba(0,0,0,0.15)"); shade.addColorStop(1, "rgba(0,0,0,0.85)");
  g.fillStyle = shade; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  if (tint) { g.fillStyle = rgba(tint, 0.18); g.fillRect(cx - r, cy - r, r * 2, r * 2); }
  g.restore();
}

/** Ship art points "up"; `heading` is the direction of travel in radians (0 = to the right). */
function ship(c: Ctx, raceId: string, size: 1 | 2 | 3 | 4 | 5, x: number, y: number, w: number, heading = 0, alpha = 1): void {
  const { g } = c;
  g.save();
  g.translate(x, y);
  g.rotate(heading + Math.PI / 2);
  if (!draw(g, art.ship(raceId, size), -w / 2, -w / 2, w, w, alpha)) {
    g.fillStyle = rgba("#cccccc", alpha); g.beginPath(); g.moveTo(0, -w / 2); g.lineTo(-w / 5, w / 2); g.lineTo(w / 5, w / 2); g.fill();
  }
  g.restore();
}

function flash(c: Ctx, x: number, y: number, r: number, color: string, a: number): void {
  const grad = c.g.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, `rgba(255,255,255,${a})`); grad.addColorStop(0.3, rgba(color, a * 0.8)); grad.addColorStop(1, "transparent");
  c.g.fillStyle = grad; c.g.beginPath(); c.g.arc(x, y, r, 0, Math.PI * 2); c.g.fill();
}

function portrait(c: Ctx, raceId: string, x: number, y: number, h: number, alpha: number, tint?: string): void {
  const { g } = c;
  const w = h * 0.8, cx = x + w / 2, cy = y + h / 2;
  g.save();
  g.globalAlpha = alpha;
  g.beginPath(); g.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2); g.clip();
  if (!draw(g, art.portrait(raceId), x, y, w, h)) { g.fillStyle = "#222"; g.fillRect(x, y, w, h); }
  if (tint) { g.globalCompositeOperation = "multiply"; g.fillStyle = tint; g.fillRect(x, y, w, h); g.globalCompositeOperation = "source-over"; }
  // Soft edge into the dark.
  const v = g.createRadialGradient(cx, cy, Math.min(w, h) * 0.38, cx, cy, Math.max(w, h) * 0.5);
  v.addColorStop(0, "transparent"); v.addColorStop(1, "rgba(3,4,10,1)");
  g.fillStyle = v; g.fillRect(x, y, w, h);
  g.restore();
}

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

const SCENES: Record<SceneKind, (c: Ctx) => void> = {
  battle(c) {
    // The battle lines from the war scene; after the exchange, the enemy line breaks apart.
    SCENES.war({ ...c, t: Math.min(c.t, 3400) });
    const { g, t, s } = c;
    if (t > 3400) {
      for (let i = 0; i < 5; i++) {
        const k = (t - 3400 - i * 260) / 900;
        if (k < 0 || k > 1.2) continue;
        flash(c, W - 250 - (i % 2) * 40, H * 0.2 + i * H * 0.13 + 30, 60 + k * 120, "#ff8a2a", Math.max(0, 1.1 - k));
      }
      g.fillStyle = `rgba(255,255,255,${0.25 * Math.max(0, 1 - (t - 3400) / 400)})`; g.fillRect(0, 0, W, H);
    }
    if (t > 4600) portrait(c, s.raceId, W * 0.04, H * 0.08, H * 0.55, 0.8 * ease((t - 4600) / 800));
  },
  wonder(c) {
    const { g, t, s } = c;
    stars(c, 0.3);
    const cx = W * 0.6, cy = H * 0.48;
    flash(c, cx, cy, 160, "#ffe9a0", 1);
    // The work assembles around the star: ring segments lock into place one by one.
    const parts = Math.floor(ease(t / 4200) * 36);
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2 + t / 6000;
      for (const [r, tilt] of [[230, 0.35], [290, -0.3]] as const) {
        if (i >= parts) continue;
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * tilt;
        g.fillStyle = rgba(s.color, 0.85);
        g.fillRect(x - 9, y - 4, 18, 8);
        g.strokeStyle = rgba(s.color, 0.12); g.lineWidth = 1;
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke();
      }
    }
    flash(c, cx, cy, 90 + 10 * Math.sin(t / 300), "#fff3c0", 1);
    if (t > 4200) flash(c, cx, cy, 300 * ease((t - 4200) / 900), s.color, 0.6 * (1 - ease((t - 4900) / 900)));
    portrait(c, s.raceId, W * 0.03, H * 0.12, H * 0.62, 0.75 * ease((t - 1500) / 1500));
  },
  colony(c) {
    const { t, s } = c;
    stars(c, 1);
    const grow = ease(t / 2500);
    planet(c, W * 0.62, H * 0.58 + (1 - grow) * 120, 150 + grow * 140, s.color);
    // Colony ship descends.
    const p = ease((t - 600) / 3800);
    ship(c, s.raceId, 2, W * 0.15 + p * W * 0.45, H * 0.18 + p * H * 0.34, 200 - p * 150, Math.atan2(H * 0.34, W * 0.45), 1 - ease((t - 4200) / 500));
    // City lights spread over the night side after landing.
    const lights = ease((t - 4300) / 1800);
    for (let i = 0; i < 70 * lights; i++) {
      const a = hash(i + 7) * Math.PI - Math.PI / 2, d = Math.sqrt(hash(i + 9)) * 260;
      flash(c, W * 0.62 + Math.cos(a) * d * 0.9 + 40, H * 0.58 + Math.sin(a) * d * 0.9, 6, "#ffd27a", 0.9);
    }
    if (t > 4200 && t < 4800) flash(c, W * 0.6, H * 0.52, 120, s.color, 1 - (t - 4200) / 600);
  },
  science(c) {
    const { g, t, s } = c;
    stars(c, 0.3);
    portrait(c, s.raceId, W * 0.08, H * 0.08, H * 0.84, ease(t / 1200));
    // Rotating holographic rings and rising glyphs.
    const cx = W * 0.68, cy = H * 0.45;
    for (let i = 0; i < 4; i++) {
      g.strokeStyle = rgba(s.color, 0.25 + 0.15 * i);
      g.lineWidth = 2 + i;
      g.beginPath();
      const r = 70 + i * 45 + Math.sin(t / 600 + i) * 6;
      const a0 = t / (900 - i * 150) * (i % 2 ? -1 : 1);
      g.arc(cx, cy, r, a0, a0 + Math.PI * (1.1 + i * 0.2));
      g.stroke();
    }
    for (let i = 0; i < 50; i++) {
      const y = (cy + 200 - ((t / 6 + hash(i) * 400) % 420));
      g.fillStyle = rgba(s.color, 0.6 * hash(i + 3));
      g.fillRect(cx - 220 + hash(i + 5) * 440, y, 3, 10);
    }
    flash(c, cx, cy, 120 + Math.sin(t / 200) * 15, s.color, 0.55 + 0.4 * ease((t - 2500) / 800));
  },
  spy(c) {
    const { g, t, s } = c;
    stars(c, 0.2);
    g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(0, 0, W, H);
    portrait(c, s.raceId, W * 0.06, H * 0.1, H * 0.8, ease(t / 1500) * 0.85, "#3a4a3a");
    // Target's world in a sniper scope, data streaking home.
    const cx = W * 0.7, cy = H * 0.45;
    planet(c, cx, cy, 140, s.rivalColor);
    g.strokeStyle = "rgba(120,255,140,0.7)"; g.lineWidth = 2;
    g.beginPath(); g.arc(cx, cy, 190, 0, Math.PI * 2); g.moveTo(cx - 230, cy); g.lineTo(cx + 230, cy); g.moveTo(cx, cy - 230); g.lineTo(cx, cy + 230); g.stroke();
    const p = ease((t - 2200) / 2000);
    if (p > 0) {
      g.strokeStyle = "rgba(255,80,80,0.9)"; g.lineWidth = 4;
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx - p * (cx - W * 0.25), cy - p * (cy - H * 0.35)); g.stroke();
    }
    for (let y = (t / 8) % 6; y < H; y += 6) { g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(0, y, W, 2); }
    if (t > 4200) { g.fillStyle = `rgba(120,255,140,${ease((t - 4200) / 500)})`; g.font = "bold 44px monospace"; g.fillText("TRANSFER COMPLETE", W * 0.52, H * 0.16); }
  },
  war(c) {
    const { g, t, s } = c;
    stars(c, 2);
    g.fillStyle = `rgba(120,0,0,${0.15 + 0.1 * Math.sin(t / 250)})`; g.fillRect(0, 0, W, H);
    const enemy = s.rivalRaceId ?? s.raceId;
    // Two battle lines close in, then fire.
    const close = ease(t / 2200);
    for (let i = 0; i < 5; i++) {
      const y = H * 0.2 + i * H * 0.13;
      ship(c, s.raceId, i === 2 ? 4 : 3, -80 + close * 330 + (i % 2) * 40, y, i === 2 ? 190 : 140, 0);
      ship(c, enemy, i === 2 ? 4 : 3, W + 80 - close * 330 - (i % 2) * 40, y + 30, i === 2 ? 190 : 140, Math.PI);
    }
    if (t > 2200) {
      for (let i = 0; i < 12; i++) {
        const k = Math.floor((t - 2200) / 140) + i;
        if (hash(k) < 0.5) continue;
        const ya = H * 0.2 + (k % 5) * H * 0.13, yb = H * 0.2 + ((k + 2) % 5) * H * 0.13 + 30;
        const ours = k % 2 === 0;
        g.strokeStyle = ours ? rgba(s.color, 0.9) : rgba(s.rivalColor ?? "#ff4444", 0.9);
        g.lineWidth = 3;
        g.beginPath(); g.moveTo(ours ? 300 : W - 300, ours ? ya : yb); g.lineTo(ours ? W - 300 : 300, ours ? yb : ya); g.stroke();
        if (hash(k + 1) > 0.75) flash(c, ours ? W - 300 : 300, ours ? yb : ya, 70, "#ffaa33", 0.9);
      }
    }
    // The enemy's face, glimpsed.
    if (s.rivalRaceId && t > 3800) portrait(c, s.rivalRaceId, W * 0.38, H * 0.06, H * 0.45, 0.35 * ease((t - 3800) / 600), "#aa2222");
  },
  invasion(c) {
    const { g, t, s } = c;
    stars(c, 0.5);
    const cx = W * 0.5, cy = H * 0.62;
    const turn = ease((t - 3200) / 1800);
    planet(c, cx, cy, 300, turn > 0.5 ? s.color : s.rivalColor);
    // Fleet in orbit, drop pods falling, fire on the surface.
    for (let i = 0; i < 4; i++) ship(c, s.raceId, 3, W * 0.2 + i * W * 0.2 + Math.sin(t / 900 + i) * 20, H * 0.13 + (i % 2) * 40, 120, Math.PI / 2 * 0.3 + (i < 2 ? 0 : Math.PI * 0.4));
    for (let i = 0; i < 26; i++) {
      const start = 600 + hash(i) * 2400;
      const p = (t - start) / 900;
      if (p < 0 || p > 1.4) continue;
      const x0 = W * 0.2 + hash(i + 2) * W * 0.6, x1 = cx + (hash(i + 4) - 0.5) * 420;
      const x = x0 + (x1 - x0) * Math.min(1, p), y = H * 0.2 + (cy - 180 - H * 0.2) * Math.min(1, p);
      if (p < 1) { g.strokeStyle = rgba(s.color, 0.9); g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x - (x1 - x0) * 0.08, y - 30); g.stroke(); }
      else flash(c, x, y, 40 * (1.4 - p) * 2.5, "#ff7722", 1.4 - p);
    }
    // Our people's face over the conquered world.
    portrait(c, s.raceId, W * 0.04, H * 0.05, H * 0.6, 0.85 * ease((t - 4000) / 1000));
  },
};

/** For previews and screenshots: hold every drawn scene at this many ms (null = play normally). */
let frozenAt: number | null = null;
export function holdScenesAt(ms: number | null): void { frozenAt = ms; }

function drawScene(stage: HTMLElement, scene: Scene, finish: () => void): () => void {
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  stage.prepend(canvas);
  const g = canvas.getContext("2d");
  if (!g) { setTimeout(finish, 2500); return () => {}; }
  const t0 = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    const t = frozenAt ?? now - t0;
    SCENES[scene.kind]({ g, t, s: scene });
    // Fade in and out.
    const fade = Math.max(1 - ease(t / 500), ease((t - LENGTH + 600) / 600));
    if (fade > 0) { g.fillStyle = `rgba(0,0,0,${fade})`; g.fillRect(0, 0, W, H); }
    if (t >= LENGTH && frozenAt === null) { finish(); return; }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
