// Battle replay (written by Claude 2). Plays back a real battle from its shot-by-shot
// recording (engine/battleLog.ts): the two sides line up, every beam, missile and torpedo
// flies in the order it was fired, shields flash, ships blow up and the counts go down.
// The main Claude's 3D battle viewer can use the same recordings; this is the 2D version.

import { unpackShot, type BattleRecord, type Shot } from "../engine/battleLog";
import type { GameState } from "../engine/types";
import { art, img, ready } from "./assets";
import { play } from "./sound";

const W = 1280, H = 720;
const ROUND_MS = 2600;
const SHOT_MS = 520;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Replay buttons for the player's battles on this turn (for the turn report). */
export function replayButtons(state: GameState, turn: number): HTMLElement[] {
  return (state.battles ?? []).filter((b) => b.turn === turn && b.shots.length > 0).map((b) => {
    const btn = document.createElement("button");
    btn.textContent = `▶ Replay the battle at ${state.stars[b.starId]?.name ?? "?"}`;
    btn.onclick = () => showReplay(state, b);
    return btn;
  });
}

interface Slot { x: number; y: number; size: 1 | 2 | 3 | 4 | 5; raceId: string; planet: boolean; fighter: boolean; }

function layout(state: GameState, b: BattleRecord): Slot[] {
  const hpSorted = [...new Set(b.units.filter((u) => u.key !== "planet").map((u) => u.maxHp))].sort((x, y) => x - y);
  const sizeOf = (hp: number): 1 | 2 | 3 | 4 | 5 => {
    if (hpSorted.length <= 1) return 3;
    const i = hpSorted.indexOf(hp) / (hpSorted.length - 1);
    return (1 + Math.round(i * 4)) as 1 | 2 | 3 | 4 | 5;
  };
  const rows: [number, number] = [0, 0];
  const perSide = [0, 1].map((s) => b.units.filter((u) => u.side === s).length);
  return b.units.map((u) => {
    const i = rows[u.side]++;
    const n = Math.max(1, perSide[u.side]!);
    const y = 150 + (i + 0.5) * ((H - 230) / n);
    const x = u.side === 0 ? 230 + (i % 2) * 70 : W - 230 - (i % 2) * 70;
    return { x, y, size: sizeOf(u.maxHp), raceId: state.empires[u.empireId]?.raceId ?? "humans", planet: u.key === "planet", fighter: u.key.endsWith("#fighters") };
  });
}

function rgba(hex: string, a: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** `holdAt` (ms) freezes the replay at that moment: for previews and screenshots. */
export function showReplay(state: GameState, b: BattleRecord, holdAt?: number): void {
  const shots = b.shots.map(unpackShot);
  const slots = layout(state, b);
  const colors = b.units.map((u) => state.empires[u.empireId]?.color ?? "#aaa");
  const sideColor = [0, 1].map((s) => colors[b.units.findIndex((u) => u.side === s)] ?? "#aaa");
  const sideName = b.empires.map((id) => state.empires[id]?.name ?? "?");
  // When each shot starts: rounds take ROUND_MS, shots spread across their round.
  const perRound = new Map<number, Shot[]>();
  for (const s of shots) perRound.set(s.round, [...(perRound.get(s.round) ?? []), s]);
  const rounds = [...perRound.keys()].sort((x, y) => x - y);
  const timed: { s: Shot; at: number }[] = [];
  rounds.forEach((r, ri) => {
    const list = perRound.get(r)!;
    list.forEach((s, i) => timed.push({ s, at: ri * ROUND_MS + (i / Math.max(1, list.length)) * (ROUND_MS - SHOT_MS) }));
  });
  const total = rounds.length * ROUND_MS + 1500;

  const back = document.createElement("div");
  back.style.cssText = "position:fixed;inset:0;z-index:60;background:#000;display:flex;align-items:center;justify-content:center";
  const stage = document.createElement("div");
  stage.style.cssText = "position:relative;width:min(100vw,calc(100vh*16/9));aspect-ratio:16/9";
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
  const bar = document.createElement("div");
  bar.style.cssText = "position:absolute;top:1.5%;right:1.5%;display:flex;gap:8px";
  const btn = (label: string, fn: () => void) => {
    const x = document.createElement("button");
    x.textContent = label;
    x.style.cssText = "background:rgba(0,0,0,.6);color:#ddd;border:1px solid #555;border-radius:6px;padding:4px 10px;cursor:pointer";
    x.onclick = (e) => { e.stopPropagation(); fn(); };
    bar.append(x);
    return x;
  };
  let speed = 1;
  const speedBtn = btn("Speed ×1", () => { speed = speed === 1 ? 2 : speed === 2 ? 4 : 1; speedBtn.textContent = `Speed ×${speed}`; });
  btn("Close ✕", () => close());
  stage.append(canvas, bar);
  back.append(stage);
  document.body.append(back);
  play("battle");

  const g = canvas.getContext("2d")!;
  const counts = b.units.map((u) => u.start);
  let next = 0, t = 0, last = performance.now(), raf = 0, boomSound = 0;
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
  addEventListener("keydown", onKey, true);
  function close() { cancelAnimationFrame(raf); removeEventListener("keydown", onKey, true); back.remove(); }

  const starfield = Array.from({ length: 220 }, (_, i) => ({ x: (Math.sin(i * 91.7) * 0.5 + 0.5) * W, y: (Math.sin(i * 37.3) * 0.5 + 0.5) * H, r: 0.5 + (i % 3) * 0.5 }));

  function drawUnit(i: number): void {
    const s = slots[i]!, u = b.units[i]!;
    const alive = counts[i]! > 0;
    g.save();
    g.globalAlpha = alive ? 1 : 0.25;
    if (s.planet) {
      const im = img(art.planet(state.stars[b.starId]?.planet?.climate ?? "terran"));
      const r = 70;
      if (ready(im)) g.drawImage(im, s.x - r, s.y - r, r * 2, r * 2); else { g.fillStyle = "#335"; g.beginPath(); g.arc(s.x, s.y, r, 0, Math.PI * 2); g.fill(); }
    } else if (s.fighter) {
      g.fillStyle = colors[i]!;
      for (let k = 0; k < Math.min(12, counts[i]!); k++) g.fillRect(s.x - 20 + (k % 4) * 12, s.y - 14 + Math.floor(k / 4) * 12, 6, 6);
    } else {
      // Up to five hulls in a wedge, so a stack of ships looks like a squadron.
      const n = Math.max(1, Math.min(5, counts[i]!));
      const w = (40 + s.size * 22) * (n > 1 ? 0.7 : 1);
      const im = img(art.ship(s.raceId, s.size));
      const dir = u.side === 0 ? 1 : -1;
      for (let k = n - 1; k >= 0; k--) {
        const row = Math.ceil(k / 2), off = (k % 2 ? -1 : 1) * row;
        g.save();
        g.translate(s.x - dir * row * w * 0.45, s.y + off * w * 0.32);
        g.rotate(u.side === 0 ? Math.PI / 2 : -Math.PI / 2);
        if (ready(im)) g.drawImage(im, -w / 2, -w / 2, w, w); else { g.fillStyle = colors[i]!; g.beginPath(); g.moveTo(0, -w / 2); g.lineTo(-w / 6, w / 2); g.lineTo(w / 6, w / 2); g.fill(); }
        g.restore();
      }
    }
    g.restore();
    g.fillStyle = alive ? "#fff" : "#777";
    g.font = "bold 18px sans-serif";
    g.textAlign = u.side === 0 ? "right" : "left";
    const half = s.planet ? 80 : s.fighter ? 30 : (u.side === 0 ? (40 + s.size * 22) * 1.1 : (40 + s.size * 22) / 2 + 10);
    g.fillText(`${counts[i]} × ${u.name}`, s.x + (u.side === 0 ? -half : half), s.y + 6);
  }

  const effects: { kind: "boom" | "spark" | "shield"; x: number; y: number; at: number; color: string }[] = [];

  function frame(): void {
    const now = performance.now();
    t = holdAt ?? t + Math.max(0, now - last) * speed;
    last = now;
    g.fillStyle = "#03040a"; g.fillRect(0, 0, W, H);
    for (const st of starfield) { g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(st.x, st.y, st.r, st.r); }
    // Shots that have landed update the counts.
    while (next < timed.length && timed[next]!.at + SHOT_MS <= t) {
      const { s } = timed[next]!;
      const to = slots[s.target];
      if (to) {
        if (s.result === "kill") {
          counts[s.target] = Math.max(0, counts[s.target]! - 1);
          effects.push({ kind: "boom", x: to.x, y: to.y, at: t, color: "#ffaa33" });
          if (now - boomSound > 250) { play("battle"); boomSound = now; }
        } else if (s.result === "hit") effects.push({ kind: "spark", x: to.x, y: to.y, at: t, color: "#ffdd88" });
        else if (s.result === "blocked" || s.result === "dodged") effects.push({ kind: "shield", x: to.x, y: to.y, at: t, color: colors[s.target]! });
      }
      next++;
    }
    for (let i = 0; i < b.units.length; i++) drawUnit(i);
    // Shots in flight.
    for (let k = next; k < timed.length && timed[k]!.at <= t; k++) {
      const { s, at } = timed[k]!;
      const from = slots[s.shooter], to = slots[s.target];
      if (!from || !to) continue;
      const p = (t - at) / SHOT_MS;
      const c = colors[s.shooter]!;
      const tx = s.result === "miss" ? to.x + (to.x - from.x) * 0.15 : to.x, ty = s.result === "miss" ? to.y + 40 : to.y;
      const stopAt = s.result === "intercepted" ? 0.6 : 1;
      const q = Math.min(p, stopAt);
      if (s.kind === "beam") {
        g.strokeStyle = rgba(c, 1 - p * 0.6); g.lineWidth = 3;
        g.beginPath(); g.moveTo(from.x, from.y); g.lineTo(from.x + (tx - from.x) * Math.min(1, p * 3), from.y + (ty - from.y) * Math.min(1, p * 3)); g.stroke();
      } else {
        const x = from.x + (tx - from.x) * q, y = from.y + (ty - from.y) * q - Math.sin(q * Math.PI) * 40;
        g.fillStyle = s.kind === "torpedo" ? "#ff66ff" : "#ffffff";
        g.beginPath(); g.arc(x, y, s.kind === "torpedo" ? 6 : 3.5, 0, Math.PI * 2); g.fill();
        if (s.result === "intercepted" && p >= stopAt) { g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.arc(x, y, 12 * (1 - (p - stopAt)), 0, Math.PI * 2); g.fill(); }
      }
    }
    // Explosions, sparks and shield flashes.
    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i]!, age = (t - e.at) / 700;
      if (age > 1) { effects.splice(i, 1); continue; }
      if (e.kind === "shield") { g.strokeStyle = rgba(e.color, 1 - age); g.lineWidth = 4; g.beginPath(); g.arc(e.x, e.y, 50 + age * 20, 0, Math.PI * 2); g.stroke(); continue; }
      const r = e.kind === "boom" ? 30 + age * 70 : 10 + age * 20;
      const grad = g.createRadialGradient(e.x, e.y, 0, e.x, e.y, r);
      grad.addColorStop(0, `rgba(255,255,255,${1 - age})`); grad.addColorStop(0.4, rgba(e.color, (1 - age) * 0.9)); grad.addColorStop(1, "transparent");
      g.fillStyle = grad; g.beginPath(); g.arc(e.x, e.y, r, 0, Math.PI * 2); g.fill();
    }
    // Title and round.
    const round = Math.min(rounds.length, Math.floor(t / ROUND_MS) + 1);
    g.textAlign = "center"; g.fillStyle = "#eee"; g.font = "bold 30px Georgia, serif";
    g.fillText(`Battle at ${state.stars[b.starId]?.name ?? "?"} · turn ${b.turn}`, W / 2, 48);
    g.font = "18px sans-serif"; g.fillStyle = "#aaa";
    g.fillText(t < rounds.length * ROUND_MS ? `Round ${round} of ${rounds.length}` : "The battle is over", W / 2, 76);
    g.font = "bold 20px sans-serif";
    g.fillStyle = sideColor[0]!; g.textAlign = "left"; g.fillText(esc(sideName[0]!), 30, 48);
    g.fillStyle = sideColor[1]!; g.textAlign = "right"; g.fillText(esc(sideName[1]!), W - 30, 48);
    if (b.cut && t >= rounds.length * ROUND_MS) { g.textAlign = "center"; g.fillStyle = "#aaa"; g.font = "16px sans-serif"; g.fillText("(The rest of this huge battle was not recorded shot by shot.)", W / 2, H - 30); }
    if (t > total) {
      g.textAlign = "center"; g.fillStyle = "#fff"; g.font = "bold 26px Georgia, serif";
      const lost = [0, 1].map((side) => b.units.filter((u) => u.side === side && u.key !== "planet").reduce((a, u) => a + u.start - u.end, 0));
      g.fillText(`Losses: ${lost[0]} and ${lost[1]} ships`, W / 2, H - 60);
    }
    raf = requestAnimationFrame(frame);
  }
  // Give the ship pictures a moment to load before the first shot.
  const pics = slots.filter((x) => !x.planet && !x.fighter).map((x) => img(art.ship(x.raceId, x.size)));
  const t0 = performance.now();
  const wait = () => {
    if (pics.every(ready) || performance.now() - t0 > 1500) { last = performance.now(); raf = requestAnimationFrame(frame); }
    else raf = requestAnimationFrame(wait);
  };
  raf = requestAnimationFrame(wait);
}
