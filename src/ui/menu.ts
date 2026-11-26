// Main menu and new-game setup.

import { newGame, RACES, type GameSettings, type GameState } from "../engine";
import type { Difficulty, GalaxyShape, GalaxySize } from "../engine/types";
import { art, portraitHTML } from "./assets";
import { addGatePortal } from "./gatePortal";
import { clearAutosave, hasAutosave, loadAutosave } from "./storage";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function showMainMenu(root: HTMLElement, start: (g: GameState) => void): void {
  root.innerHTML = "";
  const m = document.createElement("div");
  m.className = "menu title";
  // Title art by Gemini: a wide picture for landscape screens, a tall one for phones held upright.
  const tall = typeof matchMedia === "function" && matchMedia("(orientation: portrait)").matches;
  m.style.backgroundImage = `url(${art.title(tall ? "tall" : "wide")})`;
  // Moving title (Gemini video, looped by crossfade) on wide screens, unless the player asked for less motion.
  const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const video = !tall && !still ? `<video class="title-video" src="${art.titleVideo()}" autoplay muted loop playsinline preload="auto" aria-hidden="true"></video>` : "";
  m.innerHTML = `${video}<div class="title-head"><h1>DOMINION OF A<br>THOUSAND SUNS</h1><div class="tag">Start with one world. End with a galaxy.</div></div>`;
  const actions = document.createElement("div");
  actions.className = "title-actions";
  if (hasAutosave()) {
    const cont = document.createElement("button");
    cont.className = "primary";
    cont.textContent = "Continue";
    cont.onclick = () => { const g = loadAutosave(); if (g) start(g); };
    actions.append(cont);
  }
  const ng = document.createElement("button");
  ng.className = hasAutosave() ? "" : "primary";
  ng.textContent = "New Game";
  ng.onclick = () => showSetup(root, start);
  actions.append(ng);
  const ver = document.createElement("div");
  ver.className = "tag";
  ver.style.marginTop = "18px";
  ver.style.fontSize = "12px";
  ver.textContent = "A turn-based space strategy game · 18 races · free and open source";
  actions.append(ver);
  m.append(actions);
  root.append(m);
  if (video) addGatePortal(m);
}

function showSetup(root: HTMLElement, start: (g: GameState) => void): void {
  root.innerHTML = "";
  const opts = {
    raceId: "humans",
    size: "medium" as GalaxySize,
    shape: "spiral" as GalaxyShape,
    rivals: 4,
    name: "",
    difficulty: "normal" as Difficulty,
  };
  const page = document.createElement("div");
  page.className = "setup";
  const inner = document.createElement("div");
  inner.className = "inner";
  page.append(inner);

  const maxRivals: Record<GalaxySize, number> = { small: 4, medium: 7, large: 17, huge: 17 };

  const draw = () => {
    const r = RACES.find((x) => x.id === opts.raceId)!;
    opts.rivals = Math.min(opts.rivals, maxRivals[opts.size]);
    inner.innerHTML = `<h1>Choose your race</h1>
      <div class="races">${RACES.map((x) => `
        <div class="race-card ${x.id === opts.raceId ? "sel" : ""}" data-race="${x.id}">
          ${x.id === opts.raceId ? portraitHTML(x.id) : `<img src="${art.portrait(x.id)}" alt="" loading="lazy">`}
          <div class="rc-body"><div class="rc-name">${esc(x.name)}</div><div class="rc-style">${esc(x.style)}</div></div>
        </div>`).join("")}</div>
      <div class="race-detail"><h2>${esc(r.name)} <span class="dim">· ${esc(r.style)}</span></h2>
        <div>${esc(r.unique)}</div>
        <div class="dim" style="margin-top:6px">${[
          r.growth !== 1 ? `Growth ×${r.growth}` : "", r.production !== 1 ? `Production ×${r.production}` : "",
          r.research !== 1 ? `Research ×${r.research}` : "", r.colonizeBonus ? `Settles harsher worlds (+${r.colonizeBonus})` : "",
          r.shipAttack ? `Ship attack ${r.shipAttack > 0 ? "+" : ""}${r.shipAttack}` : "", r.shipDefense ? `Ship defense ${r.shipDefense > 0 ? "+" : ""}${r.shipDefense}` : "",
          r.ground ? `Ground troops +${r.ground}` : "", r.spying ? `Spying +${r.spying}` : "", r.diplomacy ? `Diplomacy ${r.diplomacy > 0 ? "+" : ""}${r.diplomacy}` : "",
          `Home: ${r.homeClimate}`, `Travel: ${r.travel}`,
        ].filter(Boolean).join(" · ")}</div>

      </div>
      <div class="opts">
        <div class="opt"><label>Galaxy size</label><div class="seg" data-k="size">${(["small", "medium", "large", "huge"] as const).map((s) => `<button data-v="${s}" class="${opts.size === s ? "on" : ""}">${s}</button>`).join("")}</div></div>
        <div class="opt"><label>Shape</label><div class="seg" data-k="shape">${(["spiral", "ellipse", "ring", "rectangle"] as const).map((s) => `<button data-v="${s}" class="${opts.shape === s ? "on" : ""}">${s}</button>`).join("")}</div></div>
        <div class="opt"><label>Rival empires <span class="dim">(${opts.rivals + 1} races in play, you included)</span></label><div class="seg" data-k="rivals">${Array.from({ length: maxRivals[opts.size] - 1 }, (_, i) => i + 2).map((n) => `<button data-v="${n}" class="${opts.rivals === n ? "on" : ""}">${n === 17 ? "All 18 races" : n}</button>`).join("")}</div></div>
        <div class="opt"><label>Rivals play</label><div class="seg" data-k="difficulty">${(["relaxed", "normal", "hard", "master"] as const).map((s) => `<button data-v="${s}" class="${opts.difficulty === s ? "on" : ""}">${s}</button>`).join("")}</div>
          <div class="dim" style="font-size:12px;margin-top:4px">${opts.difficulty === "relaxed" ? "Rivals are slow to arm and rarely start wars." : opts.difficulty === "hard" ? "Rivals arm early, strike the weak and press their wars." : opts.difficulty === "master" ? "Rivals play the Master AI: shrewd diplomats who court the council, build culture and never waste gold." : "Rivals expand, arm and pick fights when they see an edge."} The AI never cheats at any level.</div></div>
        <div class="opt"><label>Your empire's name</label><input id="ename" value="${esc(opts.name)}" placeholder="${esc(r.name)}" style="width:100%;padding:9px;border-radius:8px;border:1px solid #26314f;background:#0b1020;color:#dce3f2;font:inherit"></div>
      </div>`;
    inner.querySelectorAll<HTMLElement>(".race-card").forEach((c) => (c.onclick = () => { opts.raceId = c.dataset.race!; draw(); }));
    inner.querySelectorAll<HTMLElement>(".seg").forEach((seg) => {
      seg.querySelectorAll<HTMLButtonElement>("button").forEach((b) => (b.onclick = () => {
        const k = seg.dataset.k!;
        if (k === "rivals") opts.rivals = Number(b.dataset.v);
        else if (k === "size") { opts.size = b.dataset.v as GalaxySize; if (opts.size === "huge") opts.rivals = 17; }
        else if (k === "difficulty") opts.difficulty = b.dataset.v as Difficulty;
        else opts.shape = b.dataset.v as GalaxyShape;
        draw();
      }));
    });
    const name = inner.querySelector<HTMLInputElement>("#ename")!;
    name.oninput = () => (opts.name = name.value);
  };
  draw();

  const bar = document.createElement("div");
  bar.className = "setup-bar";
  const back = document.createElement("button");
  back.textContent = "Back";
  back.onclick = () => showMainMenu(root, start);
  const go = document.createElement("button");
  go.className = "gold";
  go.textContent = "Start Game ▶";
  go.onclick = () => {
    const r = RACES.find((x) => x.id === opts.raceId)!;
    const settings: GameSettings = {
      seed: Math.floor(Math.random() * 2 ** 31),
      size: opts.size, shape: opts.shape, rivals: opts.rivals,
      playerRaceId: opts.raceId, playerName: opts.name.trim() || r.name, difficulty: opts.difficulty,
    };
    clearAutosave();
    start(newGame(settings));
  };
  bar.append(back, go);
  page.append(bar);
  root.append(page);
}
