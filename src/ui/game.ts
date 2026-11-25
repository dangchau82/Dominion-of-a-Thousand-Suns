// The in-game screen: star map, top bar, star/colony/fleet panel, research,
// End Turn with the "next up" bar, turn reports and the game menu.

import { aiAnswerProposals, runAITurns } from "../ai";
import { say } from "../engine/dialogue";
import { play, setSound, soundOn } from "./sound";
import { DEFAULT_MODEL, geminiChat, geminiKey, geminiModel, saveGemini, type ChatTurn } from "./gemini";
import { markSeen, nextTip, setTipsOff, tipsOff } from "./advisor";
import type { EventEffect } from "../engine/data/events";
import { BUILDING_BY_ID, BUILDINGS, LEADER_KINDS } from "../engine/data/buildings";
import { AUTOPILOT_FOCI, type AutopilotFocus, type TreatyKind } from "../engine/types";
import {
  applyCommand, CLIMATES, endTurn, exportCode, FIELD_NAMES, forecast, importCode, makeView,
  popGrowth, race, shipDesign, designsOf, designStats, partChoices, checkDesign, canUseFuelTanks, colonyShipCount, HULLS, HULL_SIZES, MAX_DESIGNS,
  type DesignSpec, type HullSize,
  type Command, type EmpireView, type GameState,
} from "../engine";
import { environmentFor, canColonize as canColonizeFormula } from "../engine/formulas";
import { applyCheat, type Cheat } from "../engine/cheats";
import { fleetExtraRange } from "../engine/movement";
import { COLONY_POD, FUEL_TANKS } from "../engine/data/ships";
import { researchChoices, tech, techCost } from "../engine/tech";
import { TECHS } from "../engine/data/techs";
import { FIELDS, SLIDERS, type Fleet, type Id, type ResearchField, type Slider } from "../engine/types";
import { art, portraitHTML, setImageLoadedHandler } from "./assets";
import { StarMap, type FleetTap } from "./map";
import { autosave } from "./storage";

const TREATY_LABEL: Record<TreatyKind, string> = { trade: "Trade agreement", research: "Research pact", nap: "Non-aggression pact", alliance: "Alliance" };
const TREATY_HELP: Record<TreatyKind, string> = {
  trade: "both earn BC each turn", research: "+5% research each", nap: "a promise not to attack", alliance: "friends in war",
};
function moodWord(n: number): string {
  return n >= 60 ? "devoted" : n >= 30 ? "friendly" : n >= 10 ? "warm" : n > -10 ? "neutral" : n > -30 ? "wary" : n > -60 ? "hostile" : "hateful";
}

const SPECIAL_HELP: Record<string, string> = {
  "fuel-tanks": "+3 light-years of fuel range for this ship.",
  "inertial-dampers": "+2 beam defense", "warp-dampener": "enemies -1 beam defense", "subspace-interdictor": "+1 attack",
  "stasis-field": "freezes the largest enemy group in round 1", "cloaking-field": "+2 beam and missile defense",
  "repulsor-beam": "+3 missile defense", "displacement-field": "25% of hits on it miss", "planet-cracker": "can destroy an undefended enemy planet",
};

function effectText(fx: EventEffect): string {
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  switch (fx.kind) {
    case "money": return `${sign(fx.amount)} BC`;
    case "research": return `${sign(fx.amount)} ${fx.field} research`;
    case "population": return `${sign(fx.amount)} population`;
    case "factories": return `${sign(fx.amount)} factories`;
    case "morale": return `${sign(fx.amount * 10)} culture`;
    case "culture": return `${sign(fx.amount)} culture`;
    case "ships": return `+${fx.count} ${fx.template === "scout" ? "scout" : "colony ship"}${fx.count > 1 ? "s" : ""}`;
    case "relations": return `${sign(fx.amount)} relations`;
    case "planetSize": return `${sign(fx.amount)} planet size`;
    case "revealStars": return `reveal ${fx.count} stars`;
    default: return "";
  }
}

/** The optional Gemini chat link is switched off for now. */
const SHOW_GEMINI = false;

const PLAYER = 0;
const SLIDER_NAMES: Record<Slider, string> = {
  ship: "Ships", defense: "Defense", industry: "Industry", ecology: "Ecology", research: "Research",
};
const MINERAL_NAMES = { ultraPoor: "Ultra poor", poor: "Poor", normal: "Normal", rich: "Rich", ultraRich: "Ultra rich" } as const;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, html = ""): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (html) e.innerHTML = html;
  return e;
}
const fmt = (n: number, d = 1) => ((Math.round(n * 10 ** d) / 10 ** d) || 0).toLocaleString();
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export class GameScreen {
  private root: HTMLElement;
  private map: StarMap;
  private top = el("div", { class: "topbar" });
  private endbar = el("div", { class: "endbar" });
  private panel: HTMLElement | null = null;
  private hint: HTMLElement | null = null;
  private view!: EmpireView;
  private selected: Id | null = null;
  private panelTab: "planet" | "ships" = "planet";
  private moving: { fleetId: Id; ships: Record<string, number> } | null = null;
  private busy = false;

  constructor(root: HTMLElement, private state: GameState, private onQuit: () => void) {
    this.root = root;
    root.innerHTML = "";
    this.map = new StarMap(root);
    root.append(this.top, this.endbar);
    this.map.onTapStar = (id) => this.tapStar(id);
    this.map.onTapEmpty = () => { if (!this.moving) this.select(null); };
    this.map.onTapFleet = (h) => this.tapFleet(h);
    setImageLoadedHandler(() => this.map.draw());
    const home = state.stars[state.empires[PLAYER]!.capitalStarId]!;
    this.map.centerOn(home.x, home.y, Math.min(46, Math.max(26, Math.min(window.innerWidth, window.innerHeight) / 22)));
    this.refresh();
    if (state.turn === 1) this.showWelcome();
  }

  // ---------- Core loop ----------

  private refresh(): void {
    this.view = makeView(this.state, PLAYER);
    let moving: { fleet: Fleet; extraRange: number; settling: boolean } | null = null;
    if (this.moving) {
      const f = this.view.fleets.find((x) => x.id === this.moving!.fleetId);
      if (f) moving = { fleet: f, extraRange: fleetExtraRange(this.state, { ...f, ships: this.moving.ships }), settling: colonyShipCount(this.state, this.moving.ships) > 0 };
    }
    this.map.update(this.view, { selectedStar: this.selected, moving });
    this.renderTop();
    this.renderEndbar();
    this.renderPanel();
    this.renderTip();
  }

  /** One advisor tip at a time, in a small card that can be dismissed. */
  private renderTip(): void {
    document.getElementById("advisor")?.remove();
    const tip = nextTip(this.view);
    if (!tip) return;
    const card = el("div", { id: "advisor", class: "advisor" }, `<b>Advisor</b><div>${esc(tip.text)}</div>`);
    const ok = el("button", { class: "small" }, "Got it");
    ok.onclick = () => { markSeen(tip.id); this.renderTip(); };
    card.append(ok);
    document.body.append(card);
  }

  private cmd(c: Command): boolean {
    const r = applyCommand(this.state, PLAYER, c);
    if (!r.ok) this.toast(r.error);
    return r.ok;
  }

  private endTurn(): void {
    if (this.busy) return;
    if (this.state.winner && !this.state.keepPlaying) { this.showGameOver(); return; }
    this.busy = true;
    this.moving = null;
    this.setHint(null);
    play("turn");
    const processedTurn = this.state.turn;
    const knownBefore = new Set(this.state.empires[PLAYER]!.contacts);
    // AI empires give their orders through the same command system, then the turn resolves.
    runAITurns(this.state);
    endTurn(this.state);
    autosave(this.state);
    this.busy = false;
    this.refresh();
    const mine = this.view.events.filter((e) => e.turn === processedTurn);
    this.playFor(mine);
    const met = this.state.empires[PLAYER]!.contacts.filter((id) => !knownBefore.has(id));
    const next = () => (mine.length ? this.showReport(processedTurn, mine) : this.showProposals());
    if (met.length) this.showFirstContacts(met, next);
    else next();
  }

  /** A proper meeting screen for each race met this turn: living portrait, their first words, Talk now or later. */
  private showFirstContacts(ids: Id[], then: () => void): void {
    const [id, ...rest] = ids;
    if (id === undefined) { then(); return; }
    const them = this.state.empires[id];
    const me = this.state.empires[PLAYER]!;
    if (!them) { this.showFirstContacts(rest, then); return; }
    const r = race(them.raceId);
    const goOn = () => this.showFirstContacts(rest, then);
    let talking = false;
    play("message");
    this.modal((box, close) => {
      box.innerHTML = `<div class="first-contact">${portraitHTML(them.raceId, 'class="fc-portrait"')}
        <div class="dim" style="letter-spacing:2px;text-transform:uppercase;font-size:12px">First contact</div>
        <h2 style="margin:4px 0;color:${them.color}">${esc(them.name)}</h2>
        <div class="dim">${esc(r.name)} · ${esc(r.style)}</div>
        <div class="quote" style="margin:10px 0">${esc(say(this.state.turn, them, "firstContact", me))}</div>
        <div class="dim" style="font-size:13px">${esc(r.unique)}</div></div>`;
      const row = el("div", { class: "row" });
      const talk = el("button", { class: "primary" }, "Talk now");
      const later = el("button", {}, rest.length ? "Later · next" : "Later");
      talk.onclick = () => { talking = true; close(); this.showDiplomacy(id, goOn); };
      later.onclick = () => close();
      row.append(talk, later);
      box.append(row);
    }, () => { if (!talking) goOn(); }); // closing (or tapping outside) moves on; Talk moves on when the talk closes
  }

  private playFor(events: { kind: string }[]): void {
    const kinds = new Set(events.map((e) => e.kind));
    const s = kinds.has("war") ? "war" : kinds.has("battle") || kinds.has("invasion") ? "battle"
      : kinds.has("colonized") ? "colony" : kinds.has("research") ? "discovery" : kinds.has("diplomacy") || kinds.has("contact") ? "message" : null;
    if (s) setTimeout(() => play(s), 250);
  }

  /** Let the AI run the player's empire for a few turns; stop when something needs the ruler. */
  private autopilot(turns: number): void {
    if (this.busy) return;
    this.busy = true;
    this.moving = null;
    const startTurn = this.state.turn;
    const me = this.state.empires[PLAYER]!;
    let stopReason = "";
    const knownAtStart = new Set(me.contacts);
    const step = (left: number) => {
      const t = this.state.turn;
      const knownBefore = me.contacts.length;
      runAITurns(this.state, true);
      endTurn(this.state);
      autosave(this.state);
      const evs = this.state.events.filter((e) => e.turn === t && (e.empireId === PLAYER || e.empireId === null));
      if (this.state.winner) stopReason = "The game has been decided.";
      else if (evs.some((e) => e.kind === "war" && e.text.includes(me.name) && e.text.includes("declared war"))) stopReason = "War was declared involving you.";
      else if (evs.some((e) => e.kind === "invasion" && e.empireId === PLAYER && e.text.includes("captured"))) stopReason = "A planet changed hands.";
      else if (this.state.council.session || this.state.council.awaitingVerdict !== null) stopReason = "The Galactic Council is in session.";
      else if (!me.alive) stopReason = "Your empire has fallen.";
      else if (me.contacts.length > knownBefore) stopReason = "You have met a new race.";
      this.refresh();
      if (left > 1 && !stopReason) setTimeout(() => step(left - 1), 30);
      else {
        this.busy = false;
        const all = this.state.events.filter((e) => e.turn >= startTurn && (e.empireId === PLAYER || e.empireId === null) && ["war", "invasion", "battle", "contact", "council", "culture", "colonized"].includes(e.kind));
        this.toast(stopReason || `Autopilot ran ${this.state.turn - startTurn} turns.`);
        const met = me.contacts.filter((id) => !knownAtStart.has(id));
        const next = () => (all.length ? this.showReport(this.state.turn - 1, all.slice(-25)) : this.showProposals());
        if (met.length) this.showFirstContacts(met, next);
        else next();
      }
    };
    step(turns);
  }

  // ---------- Top bar & end bar ----------

  private renderTop(): void {
    const v = this.view;
    const pop = v.colonies.reduce((a, c) => a + c.population, 0);
    const prod = v.colonies.reduce((a, c) => a + c.budget.production, 0);
    const rp = v.colonies.reduce((a, c) => a + c.budget.research, 0);
    this.top.innerHTML = `
      <span class="stat">Turn <b>${v.turn}</b></span>
      <span class="stat">🪐 <b>${v.colonies.length}</b></span>
      <span class="stat">👥 <b>${fmt(pop, 0)}</b></span>
      <span class="stat">⚙️ <b>${fmt(prod, 0)}</b></span>
      <span class="stat">🔬 <b>${fmt(rp, 0)}</b></span>
      <span class="stat">💰 <b>${fmt(v.me.treasury, 0)}</b></span>
      <span class="spacer"></span>`;
    // Shortcuts: icon always, label on wider screens.
    const nav = el("div", { class: "topnav" });
    const add = (icon: string, label: string, title: string, go: () => void, badge = 0) => {
      const b = el("button", { class: "small navbtn", title }, `<span class="ico">${icon}</span><span class="lbl">${label}</span>${badge ? `<span class="badge">${badge}</span>` : ""}`);
      b.onclick = () => { play("click"); go(); };
      nav.append(b);
    };
    const waiting = v.proposals.filter((p) => p.to === PLAYER).length;
    if (waiting) add("📨", "Messages", "Offers and demands waiting for your answer", () => this.showMessages(), waiting);
    add("🔬", "Research", "Research: fields, projects and tech", () => this.showResearch());
    add("🚀", "Fleets", "All your fleets", () => this.showFleets());
    add("🛠️", "Ships", "Ship designs and the designer", () => this.showDesigns());
    add("🤝", "Diplomacy", "Other empires: talk, trade, treaties, spies, war and peace", () => this.showEmpires(), v.contacts.filter((o) => o.offersPeace).length);
    add("🏛️", "Empire", "Your culture, leaders and wonders", () => this.showEmpire());
    add("⚖️", "Council", "Victory paths and the Galactic Council", () => (v.council.session ? this.showCouncil() : this.showVictory()), v.council.session ? 1 : 0);
    add("☰", "Menu", "Autopilot, sound, saves and settings", () => this.showMenu());
    this.top.append(nav);
  }

  private renderEndbar(): void {
    this.endbar.innerHTML = "";
    const items = forecast(this.state, PLAYER, 2);
    if (items.length) {
      const box = el("div", { class: "nextup" });
      box.innerHTML = items.slice(0, 4)
        .map((f) => `<div><span class="gold-text">${f.inTurns === 1 ? "Next turn" : `In ${f.inTurns}`}</span> · ${esc(f.text)}</div>`)
        .join("");
      this.endbar.append(box);
    }
    const btn = el("button", { class: "gold" }, "End Turn ▶");
    btn.onclick = () => this.endTurn();
    this.endbar.append(btn);
  }

  // ---------- Selection & movement ----------

  private tapStar(id: Id): void {
    if (this.moving) {
      const ok = this.cmd({ type: "moveFleet", fleetId: this.moving.fleetId, destStarId: id, ships: this.moving.ships });
      if (ok) {
        this.moving = null;
        this.setHint(null);
        const v = makeView(this.state, PLAYER);
        const f = v.fleets.find((x) => x.destStarId === id);
        if (f) this.toast(`Arrives in ${v.turnsTo(f, id)} turn${v.turnsTo(f, id) > 1 ? "s" : ""}.`);
      }
      this.refresh();
      return;
    }
    this.select(id);
  }

  /** Tapping a ship icon on the map opens that star's Ships tab (or the destination, for ships in flight). */
  private tapFleet(h: FleetTap): void {
    play("click");
    if (h.starId !== null) { this.panelTab = "ships"; this.select(h.starId, true); return; }
    if (h.mine && h.destStarId !== null) {
      const f = this.view.fleets.find((x) => x.id === h.fleetId);
      const dest = this.view.stars[h.destStarId]!;
      if (f) this.toast(`Heading to ${dest.name}, ${this.view.turnsTo(f, dest.id) <= 1 ? "arrives next turn" : `arrives in ${this.view.turnsTo(f, dest.id)} turns`}.`);
      this.panelTab = "ships"; this.select(h.destStarId, true);
      return;
    }
    const o = this.view.contacts.find((x) => x.id === h.empireId);
    this.toast(`A fleet of the ${o?.name ?? "unknown empire"} in deep space.`);
  }

  private select(id: Id | null, keepTab = false): void {
    if (!keepTab) this.panelTab = "planet";
    this.selected = id;
    if (id !== null) { const s = this.state.stars[id]!; this.map.focus(s.x, s.y); }
    this.refresh();
  }

  private startMove(f: Fleet, ships: Record<string, number>): void {
    this.moving = { fleetId: f.id, ships };
    this.setHint("Tap a star to send them there. Your colonies glow; the blue area is your fuel range; green rings are worlds you can settle.");
    this.refresh();
  }

  private setHint(text: string | null): void {
    this.hint?.remove();
    this.hint = null;
    if (!text) return;
    this.hint = el("div", { class: "hint" }, `<span>${esc(text)}</span>`);
    const cancel = el("button", { class: "small" }, "Cancel");
    cancel.onclick = () => { this.moving = null; this.setHint(null); this.refresh(); };
    this.hint.append(cancel);
    this.root.append(this.hint);
  }

  // ---------- Star panel ----------

  private renderPanel(): void {
    this.panel?.remove();
    this.panel = null;
    this.root.classList.toggle("panel-open", this.selected !== null && !this.moving);
    if (this.selected === null || this.moving) return;
    const v = this.view;
    const s = v.stars[this.selected]!;
    const k = v.knowledge[s.id];
    const p = el("div", { class: "panel" });
    const close = el("button", { class: "small close" }, "✕");
    close.onclick = () => this.select(null);
    p.append(close);

    const fleetsHere = v.fleets.filter((f) => f.starId === s.id || f.destStarId === s.id);
    const foreignHere = v.seenFleets.filter((f) => f.starId === s.id);
    const shipCountHere = fleetsHere.filter((f) => f.starId === s.id).reduce((n, f) => n + Object.values(f.ships).reduce((a, b) => a + b, 0), 0);
    const hasShips = fleetsHere.length > 0 || foreignHere.length > 0;
    const tab = hasShips ? this.panelTab : "planet";
    if (hasShips) {
      const tabs = el("div", { class: "panel-tabs" });
      const tp = el("button", { class: tab === "planet" ? "on" : "" }, "🪐 Planet");
      const ts = el("button", { class: tab === "ships" ? "on" : "" }, `🚀 Ships${shipCountHere ? ` (${shipCountHere})` : ""}${foreignHere.length ? " ⚠" : ""}`);
      tp.onclick = () => { this.panelTab = "planet"; this.renderPanel(); };
      ts.onclick = () => { this.panelTab = "ships"; this.renderPanel(); };
      tabs.append(tp, ts);
      p.append(tabs);
    }
    if (tab === "ships") {
      p.append(el("h2", { style: "margin:4px 0 6px" }, esc(s.name)));
      p.append(this.fleetsBlock(s.id));
      this.panel = p;
      this.root.append(p);
      return;
    }

    if (!k?.explored) {
      p.append(el("div", {}, `<h2>${esc(s.name)}</h2><div class="chips"><span class="chip">${s.color} star</span>${s.nebula ? '<span class="chip">nebula</span>' : ""}</div>
        <p class="dim">Unexplored. Send a scout to find out what's here.</p>`));
    } else if (!k.planet) {
      p.append(el("div", {}, `<h2>${esc(s.name)}</h2><div class="chips"><span class="chip">${s.color} star</span></div>
        <p class="dim">No habitable planet. Only asteroids and gas here.${v.me.raceId === "quorai" ? " <span class='good'>Your people can live inside the star itself: send a colony ship.</span>" : ""}</p>`));
    } else {
      const pl = k.planet;
      const c = v.colonies.find((x) => x.starId === s.id);
      const owner = k.ownerId === null ? null : k.ownerId === PLAYER ? "You" : v.contacts.find((x) => x.id === k.ownerId)?.name ?? "Unknown empire";
      const env = environmentFor(pl, v.race);
      const canSettle = k.ownerId === null && canColonizeFormula(pl, v.me, v.race);
      const head = el("div", { class: "planet-head" });
      head.innerHTML = `<img src="${art.planet(pl.climate)}" alt="">
        <div><h2>${esc(s.name)}</h2>
        <div class="chips"><span class="chip">${CLIMATES[pl.climate].name}</span><span class="chip">Size ${pl.size + pl.terraform}</span>
        <span class="chip">${MINERAL_NAMES[pl.minerals]} minerals</span><span class="chip ${env === "hostile" ? "bad" : env === "normal" ? "" : "good"}">Habitability: ${env}</span></div>
        <div class="dim">${owner ? `Owner: ${esc(owner)}${k.population !== null && k.ownerId !== PLAYER ? ` · pop ${k.population}` : ""}` :
          canSettle ? '<span class="good">You can settle here</span>' : '<span class="bad">Need more Planetology to settle</span>'}
          ${k.lastSeen < v.turn && k.ownerId !== PLAYER ? ` · seen turn ${k.lastSeen}` : ""}</div></div>`;
      p.append(head);
      if (c) p.append(this.colonyBlock(c.starId));
      if (k.ownerId !== null && k.ownerId !== PLAYER) p.append(this.foreignBlock(s.id, k.ownerId));
    }
    if (!hasShips) p.append(this.fleetsBlock(s.id));
    this.panel = p;
    this.root.append(p);
  }

  private colonyBlock(starId: Id): HTMLElement {
    const v = this.view;
    const c = v.colonies.find((x) => x.starId === starId)!;
    const s = this.state.stars[starId]!;
    const b = c.budget;
    const wrap = el("div", { class: "section" });
    const growth = s.planet ? popGrowth(c.population, s.planet, v.race, v.me) : 0;
    wrap.innerHTML = `<div class="chips"><span class="chip">👥 ${fmt(c.population)} / ${c.capacity}</span>
      <span class="chip">🏭 ${fmt(c.factories, 0)} / ${fmt(c.maxFactories, 0)} factories</span>
      <span class="chip">⚙️ ${fmt(b.production)} BC/turn</span>${c.missileBases ? `<span class="chip">🛡️ ${c.missileBases} bases</span>` : ""}</div>`;

    const note: Record<Slider, string> = {
      ship: c.buildTemplate
        ? b.ship > 0 ? `${this.tpl(c.buildTemplate).name} in ${Math.max(1, Math.ceil((this.tpl(c.buildTemplate).cost - c.shipProgress) / b.ship))} turn(s)` : `Building ${this.tpl(c.buildTemplate).name}: add spending`
        : "Nothing chosen to build",
      defense: b.defense > 0 ? `Next missile base in ${Math.max(1, Math.ceil((50 - c.defenseProgress) / b.defense))} turn(s)` : "",
      industry: c.factories >= c.maxFactories - 0.5 ? "Factories full; extra goes half to treasury" : `+${fmt(b.industry / v.stats.factoryCost)} factories/turn`,
      ecology: c.population >= c.capacity - 0.01 ? "Population full" : `+${fmt(growth + b.ecology / 20)} pop/turn`,
      research: `+${fmt(b.research)} research/turn`,
    };
    // While dragging, only the numbers update (rebuilding the panel mid-drag
    // would drop your finger); everything else refreshes when you let go.
    const refs: { sl: Slider; input: HTMLInputElement; label: HTMLElement }[] = [];
    const syncSliders = () => {
      const live = this.state.colonies[starId];
      if (!live) return;
      for (const r of refs) {
        if (document.activeElement !== r.input) r.input.value = String(live.sliders[r.sl]);
        r.label.textContent = `${live.sliders[r.sl]}%`;
      }
    };
    for (const sl of SLIDERS) {
      const row = el("div", { class: "slider-row" });
      row.innerHTML = `<span class="lbl">${SLIDER_NAMES[sl]} <b>${c.sliders[sl]}%</b></span>`;
      const input = el("input", { type: "range", min: "0", max: "100", step: "1", value: String(c.sliders[sl]) });
      if (c.locked[sl]) input.disabled = true;
      refs.push({ sl, input, label: row.querySelector("b")! });
      input.oninput = () => {
        this.cmd({ type: "setSlider", starId, slider: sl, value: Number(input.value) });
        syncSliders();
      };
      input.onchange = () => this.refreshKeepScroll();
      const lock = el("button", { class: `lock small ${c.locked[sl] ? "on" : ""}`, title: "Lock" }, c.locked[sl] ? "🔒" : "🔓");
      lock.onclick = () => { this.cmd({ type: "lockSlider", starId, slider: sl, locked: !c.locked[sl] }); this.refreshKeepScroll(); };
      row.append(input, lock);
      wrap.append(row);
      if (note[sl]) wrap.append(el("div", { class: "slider-note" }, esc(note[sl])));
    }
    const build = el("div", { class: "section" }, "<div class='dim' style='margin-bottom:6px'>Shipyard builds:</div>");
    const seg = el("div", { class: "seg" });
    const choices: (string | null)[] = [null, ...designsOf(this.state, PLAYER).map((d) => d.id)];
    for (const t of choices) {
      const label = t === null ? "Nothing" : `${this.tpl(t).name} (${this.tpl(t).cost})`;
      const bt = el("button", { class: c.buildTemplate === t ? "on" : "" }, label);
      bt.onclick = () => { this.cmd({ type: "setBuild", starId, templateId: t }); this.refreshKeepScroll(); };
      seg.append(bt);
    }
    build.append(seg);
    if (c.buildTemplate && v.me.treasury >= 50) {
      const t = this.tpl(c.buildTemplate);
      const need = Math.max(0, Math.ceil(t.cost - c.shipProgress));
      const amount = Math.min(Math.floor(v.me.treasury), Math.max(need, 1));
      const fund = el("button", { class: "small", style: "margin:6px 6px 0 0" }, `💰 Fund from treasury (${amount} BC)`);
      fund.onclick = () => { this.cmd({ type: "fundShips", starId, bc: amount }); this.refreshKeepScroll(); };
      build.append(fund);
    }
    const designBtn = el("button", { class: "small", style: "margin-top:6px" }, "🛠️ Ship designs");
    designBtn.onclick = () => this.showDesigns();
    build.append(designBtn);
    wrap.append(build);
    wrap.append(this.buildingsBlock(starId));
    return wrap;
  }

  private fleetsBlock(starId: Id): HTMLElement {
    const v = this.view;
    const wrap = el("div", {});
    for (const sf of v.seenFleets.filter((x) => x.starId === starId)) {
      const o = v.contacts.find((x) => x.id === sf.empireId);
      const hostile = o?.warSince != null;
      wrap.append(el("div", { class: hostile ? "bad" : "dim", style: "margin:6px 0" },
        `${hostile ? "⚠ Enemy fleet" : "Foreign fleet"}: ${sf.ships} ship${sf.ships > 1 ? "s" : ""} of the ${esc(o?.name ?? "unknown empire")}`));
    }
    const here = v.fleets.filter((f) => f.starId === starId && f.destStarId === null);
    const leaving = v.fleets.filter((f) => f.starId === starId && f.destStarId !== null);
    const incoming = v.fleets.filter((f) => f.destStarId === starId);
    if (!here.length && !leaving.length && !incoming.length) return wrap;
    wrap.className = "section";
    if (here.length) wrap.append(el("div", { class: "dim" }, "Here:"));
    for (const f of here) {
      const box = el("div", { class: "fleet" });
      const desc = Object.entries(f.ships).filter(([, n]) => n > 0).map(([t, n]) => `${n} ${this.tpl(t).name}${n > 1 ? "s" : ""}`).join(", ");
      box.innerHTML = `<img src="${art.ship(v.me.raceId, 1)}" alt=""><div class="fl-text">${esc(desc)}</div>`;
      for (const [t, n] of Object.entries(f.ships)) {
        if (n <= 0) continue;
        const one = el("button", { class: "small" }, `Send 1 ${this.tpl(t).name}`);
        one.onclick = () => this.startMove(f, { [t]: 1 });
        box.append(one);
      }
      if (Object.values(f.ships).reduce((a, b) => a + b, 0) > 1) {
        const all = el("button", { class: "small" }, "Send all");
        all.onclick = () => this.startMove(f, { ...f.ships });
        box.append(all);
      }
      const cracker = Object.entries(f.ships).some(([id, n]) => n > 0 && this.tpl(id).specials.includes("planet-cracker"));
      const enemyHere = v.knowledge[starId]?.ownerId;
      if (cracker && enemyHere !== null && enemyHere !== undefined && enemyHere !== PLAYER && v.contacts.find((o) => o.id === enemyHere)?.warSince != null) {
        const crack = el("button", { class: "small" }, "☄ Crack planet");
        crack.onclick = () => {
          if (!confirm("Destroy this planet forever? Every empire will be horrified.")) return;
          if (this.cmd({ type: "crackPlanet", fleetId: f.id })) this.toast("The planet is rubble.");
          this.refresh();
        };
        box.append(crack);
      }
      if (colonyShipCount(this.state, f.ships) > 0 && v.canSettle(starId)) {
        const col = el("button", { class: "small primary" }, "Colonize");
        col.onclick = () => { if (this.cmd({ type: "colonize", fleetId: f.id })) this.toast(`Colony founded on ${v.stars[starId]!.name}!`); this.refresh(); };
        box.append(col);
      }
      wrap.append(box);
    }
    const shipList = (f: Fleet) => Object.entries(f.ships).filter(([, n]) => n > 0)
      .map(([t, n]) => `${n} ${this.tpl(t).name}${n > 1 ? "s" : ""}`).join(", ");
    const when = (t: number) => (t <= 1 ? "arrives next turn" : `arrives in ${t} turns`);
    if (leaving.length) wrap.append(el("div", { class: "dim", style: "margin-top:8px" }, "Leaving (they depart when you end the turn):"));
    for (const f of leaving) {
      const dest = v.stars[f.destStarId!]!;
      const box = el("div", { class: "fleet" });
      box.innerHTML = `<img src="${art.ship(v.me.raceId, 1)}" alt=""><div class="fl-text">${esc(shipList(f))} → <b>${esc(dest.name)}</b><br><span class="dim">${when(v.turnsTo(f, dest.id))}</span></div>`;
      const cancel = el("button", { class: "small" }, "Cancel order");
      cancel.onclick = () => { this.cmd({ type: "moveFleet", fleetId: f.id, destStarId: starId }); this.refreshKeepScroll(); };
      box.append(cancel);
      wrap.append(box);
    }
    if (incoming.length) wrap.append(el("div", { class: "dim", style: "margin-top:8px" }, "On the way here:"));
    for (const f of incoming) {
      const box = el("div", { class: "fleet" });
      box.innerHTML = `<img src="${art.ship(v.me.raceId, 1)}" alt=""><div class="fl-text">${esc(shipList(f))}<br><span class="dim">${when(v.turnsTo(f, starId))}</span></div>`;
      wrap.append(box);
    }
    return wrap;
  }

  /** War, peace and invasion buttons for another empire's colony. */
  private foreignBlock(starId: Id, ownerId: Id): HTMLElement {
    const v = this.view;
    const wrap = el("div", { class: "section" });
    const o = v.contacts.find((x) => x.id === ownerId);
    if (!o) {
      wrap.innerHTML = `<div class="dim">You haven't met this empire yet.</div>`;
      return wrap;
    }
    wrap.innerHTML = `<div>${o.warSince !== null ? `<b class="bad">At war</b> with the ${esc(o.name)} since turn ${o.warSince}` : `At peace with the ${esc(o.name)}`}</div>`;
    const row = el("div", { class: "row", style: "justify-content:flex-start;flex-wrap:wrap" });
    if (o.warSince === null) {
      const war = el("button", { class: "small" }, "Declare war");
      war.onclick = () => this.confirmWar(o.id, o.name);
      row.append(war);
    } else {
      const inv = el("button", { class: "small primary" }, "Invade…");
      inv.onclick = () => this.showInvade(starId);
      const peace = el("button", { class: "small" }, o.offersPeace ? "Accept their peace offer" : o.weOfferedPeace ? "Peace offered" : "Offer peace");
      peace.disabled = o.weOfferedPeace && !o.offersPeace;
      peace.onclick = () => { this.cmd({ type: "offerPeace", targetId: o.id }); this.refresh(); };
      row.append(inv, peace);
    }
    wrap.append(row);
    return wrap;
  }

  private confirmWar(id: Id, name: string): void {
    if (!confirm(`Declare war on the ${name}? Your fleets and theirs will fight wherever they meet.`)) return;
    if (this.cmd({ type: "declareWar", targetId: id })) this.toast(`You are at war with the ${name}!`);
    this.refresh();
  }

  /** Pick a colony to send troops from. */
  private showInvade(targetId: Id): void {
    const v = this.view;
    const target = v.stars[targetId]!;
    const k = v.knowledge[targetId];
    const sources = v.colonies.filter((c) => c.population >= 2 && v.reachable(targetId, { id: -1, empireId: PLAYER, ships: { transport: 1 }, x: v.stars[c.starId]!.x, y: v.stars[c.starId]!.y, starId: c.starId, destStarId: null }));
    this.modal((box, close) => {
      box.innerHTML = `<h2>Invade ${esc(target.name)}</h2>
        <p class="dim">Troops come from a colony's population. They land once the planet's missile bases and warships here are destroyed, then fight its people one on one. Defenders have a small edge, so bring more troops than they have people${k?.population != null ? ` (last seen: ${k.population})` : ""}.</p>`;
      if (!sources.length) box.append(el("p", {}, "None of your colonies with 2+ population is in range."));
      for (const c of sources) {
        const s = v.stars[c.starId]!;
        const max = Math.floor(c.population - 1);
        const card = el("div", { class: "tech-card" });
        const turns = Math.max(1, Math.ceil(Math.hypot(s.x - target.x, s.y - target.y) / v.stats.speed - 1e-9));
        card.innerHTML = `<b>${esc(s.name)}</b> <span class="dim">· pop ${fmt(c.population)} · ${turns} turn${turns > 1 ? "s" : ""} away</span>`;
        const input = el("input", { type: "range", min: "1", max: String(max), value: String(Math.min(max, Math.max(1, Math.round((k?.population ?? 10) * 1.5)))), style: "width:100%;accent-color:#6fb6ff" });
        const go = el("button", { class: "small primary" }, `Send ${input.value} troops`);
        input.oninput = () => { go.textContent = `Send ${input.value} troops`; };
        go.onclick = () => {
          if (this.cmd({ type: "sendTransports", fromStarId: c.starId, toStarId: targetId, troops: Number(input.value) })) {
            this.toast(`${input.value} troops on the way to ${target.name}`);
            close(); this.refresh();
          }
        };
        card.append(input, go);
        box.append(card);
      }
      const row = el("div", { class: "row" });
      const ok = el("button", {}, "Close");
      ok.onclick = close;
      row.append(ok);
      box.append(row);
    });
  }

  private showEmpires(): void {
    this.modal((box, close) => {
      const draw = () => {
        const v = makeView(this.state, PLAYER);
        box.innerHTML = `<h2>Empires</h2><p class="dim">Empires you have met. Tap Talk for treaties, trades, gifts and spies.</p>`;
        const sec = el("div", { class: "tech-card" });
        sec.innerHTML = `<b>Internal security</b> <span class="dim">· ${v.me.security}% of production · catches enemy spies</span>`;
        const secIn = el("input", { type: "range", min: "0", max: "10", value: String(v.me.security), style: "width:100%;accent-color:#6fb6ff" });
        secIn.onchange = () => { this.cmd({ type: "setSecurity", percent: Number(secIn.value) }); draw(); };
        sec.append(secIn);
        box.append(sec);
        const waiting = v.proposals.filter((p) => p.to === PLAYER);
        if (waiting.length) {
          const b = el("button", { class: "primary", style: "width:100%;margin:6px 0" }, `📨 ${waiting.length} message${waiting.length > 1 ? "s" : ""} waiting`);
          b.onclick = () => { close(); this.showMessages(); };
          box.append(b);
        }
        if (!v.contacts.length) box.append(el("p", {}, "You haven't met anyone yet. Keep exploring."));
        for (const o of v.contacts) {
          const card = el("div", { class: "tech-card empire-card" });
          const colonies = Object.values(v.knowledge).filter((k) => k.ownerId === o.id).length;
          card.innerHTML = `<img src="${art.portrait(o.raceId)}" alt=""><div><b style="color:${o.color}">${esc(o.name)}</b>${o.alive ? "" : " <span class='dim'>(destroyed)</span>"}
            <div class="dim">${race(o.raceId).name} · ${colonies} known colonies · ${moodWord(o.attitude)} toward you</div>
            ${o.treaties.length ? `<div class="good">${o.treaties.map((t) => TREATY_LABEL[t]).join(" · ")}</div>` : ""}
            <div>${o.warSince !== null ? `<b class="bad">At war</b> since turn ${o.warSince}${o.offersPeace ? " · <span class='good'>they offer peace</span>" : ""}` : "At peace"}</div></div>`;
          if (o.alive) {
            const row = el("div", { class: "row", style: "justify-content:flex-start" });
            const talk = el("button", { class: "small primary" }, "Talk");
            talk.onclick = () => { close(); this.showDiplomacy(o.id); };
            row.append(talk);
            if (o.warSince === null) {
              const war = el("button", { class: "small" }, "Declare war");
              war.onclick = () => { this.confirmWar(o.id, o.name); draw(); };
              row.append(war);
            } else {
              const peace = el("button", { class: "small" }, o.offersPeace ? "Accept peace" : o.weOfferedPeace ? "Peace offered" : "Offer peace");
              peace.disabled = o.weOfferedPeace && !o.offersPeace;
              peace.onclick = () => { this.cmd({ type: "offerPeace", targetId: o.id }); draw(); };
              row.append(peace);
            }
            card.append(row);
          }
          box.append(card);
        }
        const row = el("div", { class: "row" });
        const ok = el("button", {}, "Close");
        ok.onclick = () => { close(); this.refresh(); };
        row.append(ok);
        box.append(row);
      };
      draw();
    });
  }

  /** After a turn: the end of the game, the council, then messages. */
  private showProposals(): void {
    const v = makeView(this.state, PLAYER);
    if (v.winner && !v.keepPlaying) return this.showGameOver();
    if (v.council.awaitingVerdict !== null) return this.showVerdict();
    if (v.council.session && v.council.session.myVote === undefined && v.council.session.weight[PLAYER] !== undefined) return this.showCouncil();
    if (v.pendingEvents.length) return this.showRandomEvent();
    this.showMessages();
  }

  private showRandomEvent(): void {
    const ev = makeView(this.state, PLAYER).pendingEvents[0];
    if (!ev) return this.showMessages();
    play("message");
    this.modal((box, close) => {
      box.innerHTML = `<img class="event-pic" src="${art.event(ev.art)}" alt=""><h2>${esc(ev.title)}</h2><p>${esc(ev.text)}</p>`;
      const col = el("div", { style: "display:flex;flex-direction:column;gap:8px" });
      ev.choices.forEach((c, i) => {
        const fx = c.effects.map(effectText).filter(Boolean).join(", ");
        const b = el("button", {}, `<b>${esc(c.label)}</b>${fx ? `<br><span class="dim" style="font-size:12px">${esc(fx)}</span>` : ""}`);
        b.onclick = () => {
          this.cmd({ type: "chooseEvent", eventId: ev.id, choice: i });
          box.innerHTML = `<h2>${esc(ev.title)}</h2><p>${esc(c.result)}</p>`;
          const ok = el("button", { class: "primary" }, "Continue");
          ok.onclick = () => { close(); this.refresh(); this.showProposals(); };
          const r = el("div", { class: "row" });
          r.append(ok);
          box.append(r);
        };
        col.append(b);
      });
      box.append(col);
    });
  }

  private showCouncil(): void {
    const v = makeView(this.state, PLAYER);
    const s = v.council.session!;
    const total = Object.values(s.weight).reduce((a, b) => a + b, 0);
    const name = (id: Id) => this.state.empires[id]!.name;
    this.modal((box, close) => {
      box.innerHTML = `<img class="event-pic" src="${art.event("council")}" alt=""><h2>The Galactic Council</h2>
        <p>The council must choose a ruler for the galaxy. Two thirds of all votes (<b>${Math.ceil(total * 2 / 3)}</b> of ${total}) are needed to win.</p>
        <ul>${Object.entries(s.weight).sort((a, b) => b[1] - a[1]).map(([id, w]) => `<li>${esc(name(Number(id)))}${s.candidates.includes(Number(id)) ? " <b>(candidate)</b>" : ""}: ${w} votes</li>`).join("")}</ul>
        <p class="dim">Votes come from population. If someone else is elected you may accept (you lose) or defy the council (every empire declares war on you).</p>`;
      const row = el("div", { class: "row", style: "flex-wrap:wrap" });
      const vote = (id: Id | null) => { this.cmd({ type: "councilVote", candidateId: id }); close(); this.showMessages(); };
      if (s.candidates.includes(PLAYER)) {
        const b = el("button", { class: "primary" }, `Vote for yourself (${s.weight[PLAYER]})`);
        b.onclick = () => vote(PLAYER);
        row.append(b);
      } else {
        for (const id of s.candidates) {
          const b = el("button", { class: "primary" }, `Vote: ${esc(name(id))}`);
          b.onclick = () => vote(id);
          row.append(b);
        }
        const ab = el("button", {}, "Abstain");
        ab.onclick = () => vote(null);
        row.append(ab);
      }
      box.append(row);
    });
  }

  private showVerdict(): void {
    const v = makeView(this.state, PLAYER);
    const winner = this.state.empires[v.council.awaitingVerdict!]!;
    this.modal((box, close) => {
      box.innerHTML = `<img class="event-pic" src="${art.event("council")}" alt=""><h2>The council has chosen</h2>
        <p>The Galactic Council elected the <b>${esc(winner.name)}</b> to rule the galaxy.</p>
        <p>Accept, and the game ends in their victory. Defy, and every empire you know declares war on you, and the council never meets again.</p>`;
      const row = el("div", { class: "row" });
      const acc = el("button", {}, "Accept (lose)");
      acc.onclick = () => { this.cmd({ type: "councilVerdict", accept: true }); close(); autosave(this.state); this.showGameOver(); };
      const defy = el("button", { class: "primary" }, "Defy the council!");
      defy.onclick = () => { this.cmd({ type: "councilVerdict", accept: false }); close(); autosave(this.state); this.refresh(); this.showMessages(); };
      row.append(acc, defy);
      box.append(row);
    });
  }

  private showGameOver(): void {
    const v = makeView(this.state, PLAYER);
    const w = v.winner!;
    const won = w.empireId === PLAYER;
    play(won ? "victory" : "defeat");
    const who = this.state.empires[w.empireId]!;
    const how: Record<string, string> = {
      conquest: "by conquest", council: "by vote of the Galactic Council", culture: "through culture", technology: "by building the Ascension Gate",
    };
    this.modal((box, close) => {
      box.innerHTML = `<img class="event-pic" src="${art.event(won ? "victory" : "crisis")}" alt="">
        <h2>${won ? "Victory!" : "Defeat"}</h2>
        <p>${won ? `You have won the galaxy ${how[w.kind]} on turn ${w.turn}.` : `The ${esc(who.name)} won the galaxy ${how[w.kind]} on turn ${w.turn}.`}</p>
        <p class="dim">Your empire: ${v.colonies.length} colonies, ${fmt(v.colonies.reduce((a, c) => a + c.population, 0), 0)} population, ${v.me.research.known.length} techs, ${fmt(v.me.culture, 0)} culture${this.state.cheated ? " · cheats were used" : ""}.</p>`;
      const row = el("div", { class: "row" });
      if (v.me.alive) {
        const keep = el("button", {}, "Keep playing");
        keep.onclick = () => { this.cmd({ type: "keepPlaying" }); autosave(this.state); close(); this.refresh(); };
        row.append(keep);
      }
      const menu = el("button", { class: "primary" }, "Main menu");
      menu.onclick = () => { close(); location.reload(); };
      row.append(menu);
      box.append(row);
    });
  }

  /** Paths to victory and how everyone is doing. */
  private showVictory(): void {
    const v = makeView(this.state, PLAYER);
    this.modal((box, close) => {
      const total = v.standings.filter((s) => s.alive).reduce((a, s) => a + s.votes, 0);
      const rows = [...v.standings].sort((a, b) => b.votes - a.votes).map((s) =>
        `<tr${s.id === PLAYER ? ' class="good"' : ""}><td style="color:${s.color}">${esc(s.name)}${s.alive ? "" : " †"}</td><td>${s.votes}</td><td>${fmt(s.culture / 1000, 1)}k</td><td>${s.techFields}/6</td></tr>`).join("");
      box.innerHTML = `<h2>Paths to victory</h2>
        <ul>
          <li><b>Conquest</b>: be the last empire standing.</li>
          <li><b>Galactic Council</b>: from turn 150, every 25 turns, the two biggest empires stand and need two thirds of all votes. ${v.council.defied ? "<span class='bad'>You defied the council; it no longer meets.</span>" : `Next session: turn ${v.council.nextTurn}.`}</li>
          <li><b>Culture</b>: reach 100k culture.</li>
          <li><b>Technology</b>: reach tier 10 in all six fields, then build the Ascension Gate.</li>
        </ul>
        <table class="standings"><tr><th>Empire</th><th>Votes</th><th>Culture</th><th>Tier 10</th></tr>${rows}</table>
        <p class="dim">Shows you and the empires you have met. Total votes among them: ${total}.</p>`;
      const row = el("div", { class: "row" });
      const ok = el("button", { class: "primary" }, "Close");
      ok.onclick = close;
      row.append(ok);
      box.append(row);
    });
  }

  /** Proposals other empires sent us; answered one by one. */
  private showMessages(): void {
    const waiting = makeView(this.state, PLAYER).proposals.filter((p) => p.to === PLAYER);
    if (!waiting.length) return;
    this.modal((box, close) => {
      const draw = () => {
        const v = makeView(this.state, PLAYER);
        const list = v.proposals.filter((p) => p.to === PLAYER);
        if (!list.length) { close(); this.refresh(); return; }
        box.innerHTML = `<h2>📨 Messages</h2>`;
        for (const p of list) {
          const o = v.contacts.find((x) => x.id === p.from);
          const card = el("div", { class: "tech-card empire-card" });
          card.innerHTML = `${portraitHTML(o?.raceId ?? "humans")}<div><b style="color:${o?.color ?? "#fff"}">${esc(o?.name ?? "?")}</b>
            ${p.says ? `<div class="quote">${esc(p.says)}</div>` : ""}<div>${esc(p.text)}</div></div>`;
          const row = el("div", { class: "row", style: "justify-content:flex-start" });
          const yes = el("button", { class: "small primary" }, "Accept");
          const no = el("button", { class: "small" }, "Refuse");
          yes.onclick = () => { this.cmd({ type: "respond", proposalId: p.id, accept: true }); draw(); };
          no.onclick = () => { this.cmd({ type: "respond", proposalId: p.id, accept: false }); draw(); };
          row.append(yes, no);
          card.append(row);
          box.append(card);
        }
        const row = el("div", { class: "row" });
        const later = el("button", {}, "Decide later");
        later.onclick = () => { close(); this.refresh(); };
        row.append(later);
        box.append(row);
      };
      draw();
    });
  }

  /** Talk to one empire: treaties, tech trades, gifts, demands and spies. */
  private showDiplomacy(id: Id, onClose?: () => void): void {
    this.modal((box, close) => {
      const draw = (reply = "") => {
        const v = makeView(this.state, PLAYER);
        const o = v.contacts.find((x) => x.id === id);
        if (!o) { close(); return; }
        const them = this.state.empires[id]!;
        const greet = reply || say(v.turn, them, o.warSince !== null ? "threaten" : "greeting", this.state.empires[PLAYER]!);
        box.innerHTML = `<div class="empire-card big">${portraitHTML(o.raceId)}<div><h2 style="margin:0;color:${o.color}">${esc(o.name)}</h2>
          <div class="dim">${race(o.raceId).name} · ${moodWord(o.attitude)} toward you (${o.attitude > 0 ? "+" : ""}${o.attitude})</div></div></div>
          <div class="quote" style="margin:8px 0">${esc(greet)}</div>`;
        const ask = (proposal: Record<string, unknown>) => {
          const before = this.state.events.length;
          if (!this.cmd({ type: "propose", to: id, proposal: proposal as never })) return;
          aiAnswerProposals(this.state);
          const answer = this.state.events.slice(before).filter((e) => e.empireId === PLAYER && e.kind === "diplomacy").map((e) => e.text).join(" ");
          draw(answer || "They will think about it.");
        };

        // Gemini link is hidden for now (Danny's call); showChat() stays ready for later.
        if (SHOW_GEMINI) {
          const chat = el("button", { class: "small", style: "margin-bottom:6px" }, "💬 Speak freely (Gemini link)");
          chat.onclick = () => { close(); this.showChat(id); };
          box.append(chat);
        }

        // Treaties
        const tr = el("div", { class: "tech-card" });
        tr.innerHTML = `<b>Treaties</b>`;
        if (o.warSince !== null) {
          tr.append(el("div", { class: "bad" }, `At war since turn ${o.warSince}. Make peace first.`));
          const peace = el("button", { class: "small" }, o.offersPeace ? "Accept their peace offer" : o.weOfferedPeace ? "Peace offered" : "Offer peace");
          peace.disabled = o.weOfferedPeace && !o.offersPeace;
          peace.onclick = () => { this.cmd({ type: "offerPeace", targetId: id }); draw(); };
          tr.append(peace);
        } else {
          for (const k of ["trade", "research", "nap", "alliance"] as const) {
            const has = o.treaties.includes(k);
            const row = el("div", { class: "design-row" }, `<span style="flex:1">${has ? "✓ " : ""}${TREATY_LABEL[k]} <span class="dim">${TREATY_HELP[k]}</span></span>`);
            const b = el("button", { class: "small" }, has ? "Cancel" : "Propose");
            b.onclick = () => {
              if (has) { if (confirm(`Cancel your ${TREATY_LABEL[k]}? They will resent it.`)) { this.cmd({ type: "breakTreaty", with: id, treaty: k }); draw(); } }
              else ask({ kind: k });
            };
            row.append(b);
            tr.append(row);
          }
          const war = el("button", { class: "small", style: "margin-top:6px" }, "Declare war");
          war.onclick = () => { this.confirmWar(id, o.name); draw(); };
          tr.append(war);
        }
        box.append(tr);

        // Technology
        const tt = el("div", { class: "tech-card" });
        tt.innerHTML = `<b>Technology</b> <span class="dim">· they know ${o.theirTechs.length} techs you don't; you know ${o.ourTechs.length} they don't</span>`;
        const techSel = (ids: string[]) => {
          const sel = el("select", { class: "tech-select" });
          for (const t of ids.map(tech).sort((a, b) => b.tier - a.tier)) sel.append(el("option", { value: t.id }, `${t.name} (tier ${t.tier})`));
          return sel;
        };
        if (o.theirTechs.length) {
          const want = techSel(o.theirTechs);
          tt.append(el("div", { class: "design-row" }, "<span>Ask for</span>"));
          tt.lastElementChild!.append(want);
          if (o.ourTechs.length && o.warSince === null) {
            const give = techSel(o.ourTechs);
            const row = el("div", { class: "design-row" }, "<span>In exchange for</span>");
            row.append(give);
            tt.append(row);
            const swap = el("button", { class: "small primary" }, "Offer exchange");
            swap.onclick = () => ask({ kind: "techSwap", offerTech: give.value, wantTech: want.value });
            tt.append(swap);
          }
          const demand = el("button", { class: "small" }, "Demand it as tribute");
          demand.onclick = () => ask({ kind: "tribute", wantTech: want.value });
          tt.append(demand);
        }
        box.append(tt);

        // Gifts
        const gf = el("div", { class: "tech-card" });
        gf.innerHTML = `<b>Gifts</b> <span class="dim">· improve how they feel about you · treasury ${fmt(v.me.treasury)} BC</span>`;
        for (const amount of [50, 200, 500]) {
          const b = el("button", { class: "small", style: "margin:2px" }, `${amount} BC`);
          b.disabled = v.me.treasury < amount;
          b.onclick = () => { this.cmd({ type: "gift", to: id, bc: amount }); draw(this.lastLine(id)); };
          gf.append(b);
        }
        if (o.ourTechs.length) {
          const give = techSel(o.ourTechs);
          const b = el("button", { class: "small" }, "Give tech");
          b.onclick = () => { this.cmd({ type: "gift", to: id, bc: 0, techId: give.value }); draw(this.lastLine(id)); };
          const row = el("div", { class: "design-row" });
          row.append(give, b);
          gf.append(row);
        }
        box.append(gf);

        // Spies
        const sp = el("div", { class: "tech-card" });
        const net = o.spies;
        sp.innerHTML = `<b>Spies</b> <span class="dim">· ${net?.agents ?? 0} agents in place · ${net?.alloc ?? 0}% of production</span>`;
        const alloc = el("input", { type: "range", min: "0", max: "10", value: String(net?.alloc ?? 0), style: "width:100%;accent-color:#6fb6ff" });
        const mission = el("select", { class: "tech-select" });
        for (const [m, label] of [["watch", "Watch (see their colonies)"], ["steal", "Steal technology"], ["sabotage", "Sabotage factories and bases"]] as const) {
          const opt = el("option", { value: m }, label);
          if ((net?.mission ?? "watch") === m) opt.selected = true;
          mission.append(opt);
        }
        const apply = () => { this.cmd({ type: "setSpies", targetId: id, alloc: Number(alloc.value), mission: mission.value as never }); draw(); };
        alloc.onchange = apply;
        mission.onchange = apply;
        sp.append(alloc, mission);
        box.append(sp);

        const row = el("div", { class: "row" });
        const back = el("button", {}, "Back");
        back.onclick = () => { close(); this.showEmpires(); };
        const done = el("button", { class: "primary" }, "Done");
        done.onclick = () => { close(); this.refresh(); };
        row.append(back, done);
        box.append(row);
      };
      draw();
    }, onClose);
  }

  private chats = new Map<Id, ChatTurn[]>();

  /** Free conversation with an alien leader through the player's own Gemini key. Flavour only. */
  private showChat(id: Id): void {
    const them = this.state.empires[id]!;
    const r = race(them.raceId);
    const history = this.chats.get(id) ?? [];
    this.chats.set(id, history);
    this.modal((box, close) => {
      const draw = (status = "") => {
        const v = makeView(this.state, PLAYER);
        const o = v.contacts.find((x) => x.id === id)!;
        box.innerHTML = `<div class="empire-card big">${portraitHTML(o.raceId)}<div><h2 style="margin:0;color:${o.color}">${esc(o.name)}</h2>
          <div class="dim">${esc(r.name)} · ${moodWord(o.attitude)} toward you · chat is for fun and can't change the game</div></div></div>`;
        if (!geminiKey()) {
          box.append(el("p", {}, "To talk freely with alien leaders, add your own Gemini API key in ☰ → Gemini link. It stays on this device."));
        }
        const log = el("div", { class: "chat-log" });
        if (!history.length) log.append(el("div", { class: "quote" }, esc(say(v.turn, them, o.warSince !== null ? "threaten" : "greeting", this.state.empires[PLAYER]!))));
        for (const t of history) log.append(el("div", { class: t.role === "user" ? "chat-me" : "chat-them" }, esc(t.text)));
        if (status) log.append(el("div", { class: "dim" }, esc(status)));
        box.append(log);
        const input = el("input", { type: "text", class: "tech-select", style: "width:100%", placeholder: "Say something…", maxlength: "300" }) as HTMLInputElement;
        const send = el("button", { class: "primary" }, "Send");
        const go = async () => {
          const text = input.value.trim();
          if (!text || !geminiKey()) return;
          history.push({ role: "user", text });
          draw("…");
          try {
            const reply = await geminiChat(this.personaPrompt(id), history.slice(-12));
            history.push({ role: "model", text: reply });
            draw();
          } catch (err) {
            history.pop();
            draw((err as Error).message);
          }
        };
        send.onclick = () => void go();
        input.onkeydown = (ev) => { if (ev.key === "Enter") void go(); };
        const row = el("div", { class: "row" });
        const back = el("button", {}, "Back");
        back.onclick = () => { close(); this.showDiplomacy(id); };
        row.append(back, send);
        box.append(input, row);
        log.scrollTop = log.scrollHeight;
        input.focus();
      };
      draw();
    });
  }

  private personaPrompt(id: Id): string {
    const v = makeView(this.state, PLAYER);
    const o = v.contacts.find((x) => x.id === id)!;
    const them = this.state.empires[id]!;
    const r = race(them.raceId);
    const samples = ["greeting", "threaten", "praise", "refuse"].map((s) => say(v.turn, them, s as never, this.state.empires[PLAYER]!)).join("\n");
    return [
      `You are the ruler of the ${them.name}, a ${r.style.toLowerCase()} people (${r.name}) in the space strategy game "Dominion of a Thousand Suns".`,
      `Your people: ${r.unique}`,
      `You are speaking with the ruler of the ${v.me.name}. You feel ${moodWord(o.attitude)} toward them (${o.attitude} on a -100 to 100 scale).`,
      o.warSince !== null ? `You are at war with them since turn ${o.warSince}.` : "You are at peace with them.",
      o.treaties.length ? `Treaties between you: ${o.treaties.join(", ")}.` : "You have no treaties.",
      `It is turn ${v.turn}.`,
      `Speak in this voice (examples):\n${samples}`,
      "Rules: stay in character; answer in 1 to 3 short sentences; never say you are an AI or a language model;",
      "do not agree to binding deals in chat (treaties and trades happen through the diplomacy menu, so say they should propose it formally);",
      "keep it PG-13; do not invent other empires or game rules.",
    ].join("\n");
  }

  private showGeminiSettings(): void {
    this.modal((box, close) => {
      box.innerHTML = `<h2>Gemini link</h2>
        <p>Optional: talk freely with alien leaders using your own Gemini API key. Get one at <b>aistudio.google.com/apikey</b>.</p>
        <p class="dim">Your key stays on this device (browser storage). It isn't saved in your game, isn't in the game's code, and only goes to Google. Chat is just for fun: it can't change the game, and the AI empires never use it to decide anything.</p>`;
      const key = el("input", { type: "password", class: "tech-select", style: "width:100%", placeholder: "Paste your Gemini API key", value: geminiKey() }) as HTMLInputElement;
      const model = el("input", { type: "text", class: "tech-select", style: "width:100%", value: geminiModel() }) as HTMLInputElement;
      box.append(el("div", { class: "dim" }, "API key"), key, el("div", { class: "dim" }, `Model (default ${DEFAULT_MODEL})`), model);
      const row = el("div", { class: "row" });
      const save = el("button", { class: "primary" }, "Save");
      save.onclick = () => { saveGemini(key.value, model.value); this.toast(key.value ? "Gemini link saved on this device" : "Gemini key removed"); close(); };
      const clear = el("button", {}, "Remove key");
      clear.onclick = () => { saveGemini("", model.value); key.value = ""; this.toast("Gemini key removed"); };
      const cancel = el("button", {}, "Close");
      cancel.onclick = close;
      row.append(clear, cancel, save);
      box.append(row);
    });
  }

  private lastLine(id: Id): string {
    const name = this.state.empires[id]!.name;
    const ev = [...this.state.events].reverse().find((e) => e.empireId === PLAYER && e.kind === "diplomacy" && e.text.startsWith(name));
    return ev?.text ?? "";
  }

  private refreshKeepScroll(): void {
    const y = this.panel?.scrollTop ?? 0;
    this.refresh();
    if (this.panel) this.panel.scrollTop = y;
  }

  // ---------- Modals ----------

  private modal(build: (box: HTMLElement, close: () => void) => void, onClose?: () => void): void {
    const back = el("div", { class: "modal-back" });
    const box = el("div", { class: "modal" });
    let done = false;
    const close = () => { back.remove(); if (!done) { done = true; onClose?.(); } };
    back.onclick = (e) => { if (e.target === back) close(); };
    back.append(box);
    build(box, close);
    this.root.append(back);
  }

  private showWelcome(): void {
    const r = race(this.state.empires[PLAYER]!.raceId);
    this.modal((box, close) => {
      box.innerHTML = `${portraitHTML(r.id, 'class="event-pic" style="aspect-ratio:1;max-height:220px;object-fit:cover;object-position:top"')}
        <h2>Leader of the ${esc(r.name)}</h2>
        <p>You start with one homeworld, two scouts and a colony ship. ${this.state.empires.length - 1} rival races start exactly the same way.</p>
        <ul>
          <li><b>Drag</b> to move the map, <b>pinch</b> or scroll to zoom, <b>tap</b> a star to see it.</li>
          <li>Tap your homeworld to set its <b>sliders</b>: how its production splits between ships, defense, industry, ecology and research.</li>
          <li>Send <b>scouts</b> to explore, then send the <b>colony ship</b> to a good world and press Colonize.</li>
          <li>The box above <b>End Turn</b> shows what finishes next.</li>
        </ul>
        <p class="dim">Your race: ${esc(r.style)}. ${esc(r.unique)}</p>`;
      const row = el("div", { class: "row" });
      const go = el("button", { class: "primary" }, "Begin");
      go.onclick = () => { close(); this.select(this.state.empires[PLAYER]!.capitalStarId); };
      row.append(go);
      box.append(row);
    });
  }

  private showReport(turn: number, events: EmpireView["events"]): void {
    const contact = events.find((e) => e.kind === "contact");
    const war = events.find((e) => e.kind === "war" || e.kind === "battle" || e.kind === "invasion");
    this.modal((box, close) => {
      const pic = contact ? `<img class="event-pic" src="${art.event("contact")}" alt="">`
        : war ? `<img class="event-pic" src="${art.event("crisis")}" alt="">` : "";
      const order = ["council", "war", "invasion", "battle", "contact", "diplomacy", "spy", "culture", "colonized", "research", "shipBuilt", "explored", "baseBuilt", "popMaxed", "factoriesDone", "info"];
      const sorted = [...events].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
      box.innerHTML = `${pic}<h2>Turn ${turn} report</h2><ul>${sorted.map((e) => `<li>${esc(e.text)}</li>`).join("")}</ul>`;
      const row = el("div", { class: "row" });
      const ok = el("button", { class: "primary" }, "Continue");
      ok.onclick = () => { close(); this.showProposals(); };
      row.append(ok);
      box.append(row);
    });
  }

  private researchOpen = new Set<ResearchField>();

  private showResearch(): void {
    this.modal((box, close) => {
      const draw = () => {
        const v = makeView(this.state, PLAYER);
        const rs = v.me.research;
        const rp = v.colonies.reduce((a, c) => a + c.budget.research, 0) * (1 + v.stats.researchBonus);
        box.innerHTML = `<h2>Research</h2><p class="dim">${fmt(rp)} research points per turn${v.stats.researchBonus > 0 ? ` (incl. +${Math.round(v.stats.researchBonus * 100)}% from techs)` : ""}, split between six fields. Raise Research sliders on your colonies to get more.</p>
          <p class="dim">Ships: speed ${fmt(v.stats.speed)} ly/turn, range ${fmt(v.stats.fuelRange)} ly · Settle hostility up to ${v.stats.maxHostility} · ${fmt(v.stats.robotControls)} factories per person · Terraforming +${v.stats.terraform}</p>`;
        for (const f of FIELDS) {
          const proj = v.stats.projects[f];
          const prog = rs.progress[f];
          const per = (rp * rs.alloc[f]) / 100;
          const card = el("div", { class: "tech-card" });
          let status = `<span class="dim">Nothing left to research here.</span>`;
          if (proj) {
            const t = tech(proj.techId);
            const turns = per > 0 ? Math.max(1, Math.ceil((proj.cost - prog) / per - 1e-9)) : null;
            status = `Researching <b>${t.name}</b> <span class="dim">(tier ${t.tier}) · ${fmt(prog)}/${fmt(proj.cost)} · ${turns === null ? "paused" : `${turns} turn${turns > 1 ? "s" : ""}`}</span>
              <div class="bar"><i style="width:${Math.min(100, (prog / proj.cost) * 100)}%"></i></div>`;
          }
          card.innerHTML = `<div><b>${FIELD_NAMES[f]}</b> <span class="dim">· ${rs.alloc[f]}% of research</span></div><div>${status}</div>`;
          const input = el("input", { type: "range", min: "0", max: "100", value: String(rs.alloc[f]), style: "width:100%;accent-color:#6fb6ff" });
          input.oninput = () => this.setResearch(f, Number(input.value));
          input.onchange = () => draw();
          card.append(input);

          const choices = researchChoices(rs, f);
          if (choices.length > 1) {
            const sel = el("select", { class: "tech-select" });
            for (const c of choices) {
              const o = el("option", { value: c.id }, `${c.name} (tier ${c.tier}, ${fmt(techCost(c, v.race))} RP)`);
              if (c.id === proj?.techId) o.selected = true;
              sel.append(o);
            }
            sel.onchange = () => { this.cmd({ type: "setResearchProject", field: f, techId: sel.value }); draw(); };
            const lab = el("label", { class: "dim" }, "Choose next: ");
            lab.append(sel);
            card.append(lab);
          }

          const toggle = el("button", { class: "small" }, this.researchOpen.has(f) ? "Hide tree ▴" : "Show tree ▾");
          toggle.onclick = () => { if (this.researchOpen.has(f)) this.researchOpen.delete(f); else this.researchOpen.add(f); draw(); };
          card.append(toggle);
          if (this.researchOpen.has(f)) {
            const list = el("div", { class: "tech-list" });
            for (const t of TECHS.filter((x) => x.field === f)) {
              const known = rs.known.includes(t.id);
              const inTree = known || rs.available.includes(t.id);
              const mark = known ? "✓" : t.id === proj?.techId ? "▶" : inTree ? "·" : "✗";
              const d = el("details", { class: known ? "known" : inTree ? "" : "missing" });
              d.innerHTML = `<summary>${mark} <b>${t.name}</b> <span class="dim">tier ${t.tier}${known ? "" : inTree ? ` · ${fmt(techCost(t, v.race))} RP` : " · not in your tree (trade or steal it later)"}</span></summary>
                <div>${t.description}</div><div class="quote">${t.quote}</div>`;
              list.append(d);
            }
            card.append(list);
          }
          box.append(card);
        }
        box.append(el("p", { class: "dim" }, "Each empire's tree is missing some techs at random (✗). The Vossari see the whole tree. Weapons and Force Fields matter once combat arrives."));
        const rowB = el("div", { class: "row" });
        const ok = el("button", { class: "primary" }, "Done");
        ok.onclick = () => { close(); this.refresh(); };
        rowB.append(ok);
        box.append(rowB);
      };
      draw();
    });
  }

  private setResearch(field: ResearchField, value: number): void {
    const alloc = { ...this.state.empires[PLAYER]!.research.alloc };
    const others = FIELDS.filter((f) => f !== field);
    const rest = 100 - value;
    const otherTotal = others.reduce((a, f) => a + alloc[f], 0);
    alloc[field] = value;
    others.forEach((f) => { alloc[f] = otherTotal > 0 ? (alloc[f] / otherTotal) * rest : rest / others.length; });
    this.cmd({ type: "setResearch", alloc });
  }

  private showFleets(): void {
    const v = this.view;
    this.modal((box, close) => {
      box.innerHTML = "<h2>Your fleets</h2>";
      if (!v.fleets.length) box.append(el("p", { class: "dim" }, "No fleets."));
      for (const f of v.fleets) {
        const where = f.starId !== null ? `at ${v.stars[f.starId]!.name}` : `heading to ${v.stars[f.destStarId!]!.name} (${v.turnsTo(f, f.destStarId!)} turns)`;
        const desc = Object.entries(f.ships).filter(([, n]) => n > 0).map(([t, n]) => `${n} ${this.tpl(t).name}`).join(", ");
        const b = el("button", { style: "display:block;width:100%;text-align:left;margin:6px 0" }, `${esc(desc)} <span class="dim">· ${esc(where)}</span>`);
        b.onclick = () => {
          close();
          const id = f.starId ?? f.destStarId!;
          const s = v.stars[id]!;
          this.map.centerOn(f.starId !== null ? s.x : f.x, f.starId !== null ? s.y : f.y);
          this.select(id);
        };
        box.append(b);
      }
      const row = el("div", { class: "row" });
      const des = el("button", {}, "🛠️ Ship designs");
      des.onclick = () => { close(); this.showDesigns(); };
      const ok = el("button", {}, "Close");
      ok.onclick = close;
      row.append(des, ok);
      box.append(row);
    });
  }

  private buildingsBlock(starId: Id): HTMLElement {
    const v = this.view;
    const c = v.colonies.find((x) => x.starId === starId)!;
    const box = el("div", { class: "section" });
    const built = c.buildings.map((id) => BUILDING_BY_ID.get(id)!);
    box.innerHTML = `<div class='dim' style='margin-bottom:4px'>Buildings</div>
      ${built.length ? `<div class="chips">${built.map((b) => `<span class="chip ${b.wonder ? "good" : ""}" title="${esc(b.description)}">${esc(b.name)}</span>`).join("")}</div>` : `<div class="dim">None yet.</div>`}`;
    if (c.buildQueue) {
      const b = BUILDING_BY_ID.get(c.buildQueue)!;
      const perTurn = c.factories >= c.maxFactories - 0.5 ? c.budget.industry : c.budget.industry / 2;
      const turns = perTurn > 0 ? Math.ceil((b.cost - c.buildProgress) / perTurn) : null;
      const cost = v.buyCost(starId);
      const row = el("div", { style: "margin-top:6px" }, `Building <b>${esc(b.name)}</b> <span class="dim">${fmt(c.buildProgress)}/${b.cost} · ${turns === null ? "needs Industry spending" : `${turns} turn${turns > 1 ? "s" : ""}`}</span>
        <div class="bar"><i style="width:${Math.min(100, (c.buildProgress / b.cost) * 100)}%"></i></div>`);
      const buy = el("button", { class: "small", style: "margin:4px 6px 0 0" }, `Buy now (${cost} BC)`);
      buy.disabled = v.me.treasury < cost;
      buy.onclick = () => { this.cmd({ type: "buyBuilding", starId }); this.refreshKeepScroll(); };
      const stop = el("button", { class: "small" }, "Stop");
      stop.onclick = () => { this.cmd({ type: "setBuilding", starId, buildingId: null }); this.refreshKeepScroll(); };
      row.append(buy, stop);
      box.append(row);
    }
    const options = v.buildable(starId).filter((id) => id !== c.buildQueue).map((id) => BUILDING_BY_ID.get(id)!);
    if (options.length) {
      const sel = el("select", { class: "tech-select", style: "width:100%;margin-top:6px" });
      sel.append(el("option", { value: "" }, c.buildQueue ? "Switch to…" : "Start building…"));
      for (const b of options) {
        const taken = b.wonder ? "" : "";
        sel.append(el("option", { value: b.id }, `${b.wonder ? "★ " : ""}${b.name} (${b.cost}) — ${b.description}${taken}`));
      }
      sel.onchange = () => { if (sel.value) { this.cmd({ type: "setBuilding", starId, buildingId: sel.value }); this.refreshKeepScroll(); } };
      box.append(sel);
      box.append(el("div", { class: "dim", style: "font-size:12px;margin-top:4px" }, "Buildings take half of Industry spending (all of it once factories are full). ★ = wonder, one per galaxy."));
    }
    return box;
  }

  /** Culture, golden ages, leaders and the galaxy's wonders. */
  private showEmpire(): void {
    this.modal((box, close) => {
      const draw = () => {
        const v = makeView(this.state, PLAYER);
        const me = v.me;
        const next = v.nextGoldenAge;
        box.innerHTML = `<h2>${esc(me.name)}</h2>
          <div class="tech-card"><b>Culture</b> <span class="dim">· ${fmt(me.culture)}${next ? ` / ${next} for the next golden age` : " · every golden age reached"}</span>
            ${next ? `<div class="bar"><i style="width:${Math.min(100, (me.culture / next) * 100)}%"></i></div>` : ""}
            ${me.goldenAge ? `<div class="good">✨ Golden age until turn ${me.goldenAgeUntil}: +20% production, +10% research</div>` : ""}
            <div class="dim" style="font-size:12px">Culture comes from buildings, wonders and population.</div></div>`;
        const lead = el("div", { class: "tech-card" });
        lead.innerHTML = `<b>Leaders</b> <span class="dim">· up to 3 · salaries come from the treasury (${fmt(me.treasury)} BC)</span>`;
        for (const l of me.leaders) {
          const k = LEADER_KINDS[l.kind];
          const row = el("div", { class: "design-row" }, `<span style="flex:1"><b>${esc(l.name)}</b>, ${k.title} ${"★".repeat(l.level)} <span class="dim">· boosts ${k.text} · ${l.salary} BC/turn</span></span>`);
          const fire = el("button", { class: "small" }, "Dismiss");
          fire.onclick = () => { if (confirm(`Dismiss ${l.name}?`)) { this.cmd({ type: "dismissLeader", leaderId: l.id }); draw(); } };
          row.append(fire);
          lead.append(row);
        }
        if (!me.leaders.length) lead.append(el("div", { class: "dim" }, "No leaders yet. Candidates offer their service from time to time."));
        if (me.leaderOffer) {
          const l = me.leaderOffer;
          const k = LEADER_KINDS[l.kind];
          const row = el("div", { class: "design-row", style: "margin-top:6px" }, `<span style="flex:1">Offer: <b>${esc(l.name)}</b>, ${k.title} ${"★".repeat(l.level)} <span class="dim">· boosts ${k.text} · ${l.salary} BC/turn · until turn ${l.offerUntil}</span></span>`);
          const hire = el("button", { class: "small primary" }, `Hire (${l.cost} BC)`);
          hire.disabled = me.treasury < l.cost || me.leaders.length >= 3;
          hire.onclick = () => { this.cmd({ type: "hireLeader" }); draw(); };
          row.append(hire);
          lead.append(row);
        }
        box.append(lead);
        const won = el("div", { class: "tech-card" });
        won.innerHTML = `<b>Wonders of the galaxy</b>`;
        for (const b of BUILDINGS.filter((x) => x.wonder)) {
          const w = v.wonders[b.id];
          const who = !w ? `<span class="dim">not yet built</span>` : w.empireId === PLAYER ? `<span class="good">yours</span>` : w.empireId < 0 ? `<span class="dim">destroyed</span>` : esc(this.state.empires[w.empireId]!.name);
          won.append(el("div", { style: "margin:4px 0" }, `★ <b>${esc(b.name)}</b> · ${who}<div class="dim" style="font-size:12px">${esc(b.description)}</div>`));
        }
        box.append(won);
        const row = el("div", { class: "row" });
        const ok = el("button", { class: "primary" }, "Done");
        ok.onclick = () => { close(); this.refresh(); };
        row.append(ok);
        box.append(row);
      };
      draw();
    });
  }

  private tpl(id: string) {
    return shipDesign(this.state, id);
  }

  /** List of designs, with scrap buttons and a way into the designer. */
  private showDesigns(): void {
    this.modal((box, close) => {
      const draw = () => {
        const e = this.state.empires[PLAYER]!;
        const mine = designsOf(this.state, PLAYER);
        const own = mine.filter((d) => d.empireId !== null);
        box.innerHTML = `<h2>Ship designs</h2><p class="dim">${own.length}/${MAX_DESIGNS} designs of your own. Scout and Colony Ship are always available.</p>`;
        for (const d of mine) {
          const card = el("div", { class: "tech-card" });
          if (d.empireId === null) {
            card.innerHTML = `<b>${esc(d.name)}</b> <span class="dim">· ${d.cost} BC · ${d.role === "scout" ? "+3 ly range, explores" : "settles new worlds"}</span>`;
          } else {
            const st = designStats(e, d);
            const guns = st.weapons.map((w) => `${w.count}× ${w.name} (${w.min === w.max ? w.min : `${w.min}–${w.max}`})`).join(", ") || "unarmed";
            const count = this.state.fleets.filter((f) => f.empireId === PLAYER).reduce((n, f) => n + (f.ships[d.id] ?? 0), 0);
            card.innerHTML = `<b>${esc(d.name)}</b> <span class="dim">· ${d.role === "colony" ? "Colony ship" : `${HULLS[d.hull].name} hull`} · ${d.cost} BC${count ? ` · ${count} built` : ""}</span>
              <div class="dim">${d.role === "colony" ? `Settles new worlds${d.extraRange ? ` · +${d.extraRange} ly fuel range` : ""}` : esc(guns)}</div>
              <div class="dim">Hits ${st.hits} · Attack ${st.attack} · Defense ${st.beamDefense}/${st.missileDefense} · Shield ${st.shield}</div>`;
            const scrap = el("button", { class: "small" }, count ? `Scrap (and ${count} ships)` : "Scrap");
            scrap.onclick = () => {
              if (count && !confirm(`Scrap ${d.name}? Its ${count} ships will be broken up for a 25% refund.`)) return;
              this.cmd({ type: "scrapDesign", designId: d.id });
              draw();
            };
            card.append(scrap);
          }
          box.append(card);
        }
        const row = el("div", { class: "row" });
        const add = el("button", { class: "primary" }, "+ New design");
        add.disabled = own.length >= MAX_DESIGNS;
        add.onclick = () => { close(); this.showDesigner(); };
        const ok = el("button", {}, "Close");
        ok.onclick = () => { close(); this.refresh(); };
        row.append(add, ok);
        box.append(row);
      };
      draw();
    });
  }

  private showDesigner(): void {
    const e = this.state.empires[PLAYER]!;
    const parts = partChoices(e);
    const best = (list: { id: string; tier: number }[]) => list.reduce<string | null>((b, t) => (!b || t.tier >= (list.find((x) => x.id === b)?.tier ?? 0) ? t.id : b), null);
    const spec: DesignSpec = {
      name: "", hull: "medium",
      computer: best(parts.computer), shield: best(parts.shield), ecm: null, armor: best(parts.armor),
      weapons: [{ techId: best(parts.weapons) ?? "laser", count: 0 }], specials: [],
    };
    const NAMES: Record<HullSize, string[]> = {
      small: ["Dart", "Wasp", "Lancer", "Kestrel", "Needle"], medium: ["Corsair", "Falchion", "Warden", "Talon", "Harrier"],
      large: ["Bastion", "Monarch", "Tempest", "Leviathan", "Paladin"], huge: ["Colossus", "Behemoth", "Sovereign", "Titan", "Dominion"],
    };
    const COLONY_NAMES = ["Pathfinder", "Wayfarer", "Seedship", "Long Ark", "Horizon"];
    const v0 = makeView(this.state, PLAYER).stats;
    const suggest = () => {
      const taken = new Set(designsOf(this.state, PLAYER).map((d) => d.name.toLowerCase()));
      if (spec.role === "colony") return COLONY_NAMES.find((n) => !taken.has(n.toLowerCase())) ?? `Ark ${taken.size + 1}`;
      return NAMES[spec.hull].find((n) => !taken.has(n.toLowerCase())) ?? `${HULLS[spec.hull].name} ${taken.size + 1}`;
    };
    spec.name = suggest();

    this.modal((box, close) => {
      const draw = () => {
        const st = designStats(e, spec);
        const err = checkDesign(this.state, e, spec);
        const pct = Math.min(100, (st.spaceUsed / st.space) * 100);
        box.innerHTML = `<h2>Ship designer</h2>`;

        const nameIn = el("input", { type: "text", value: spec.name, maxlength: "24", class: "tech-select", style: "width:100%" });
        nameIn.oninput = () => { spec.name = nameIn.value; };
        nameIn.onchange = () => draw();
        box.append(el("div", { class: "dim" }, "Name"), nameIn);

        const roleSeg = el("div", { class: "seg", style: "margin:8px 0 0" });
        for (const [r, label] of [["warship", "⚔ Warship"], ["colony", "🌱 Colony ship"]] as const) {
          const b = el("button", { class: (spec.role ?? "warship") === r ? "on" : "" }, label);
          b.onclick = () => {
            if ((spec.role ?? "warship") === r) return;
            const wasSuggested = Object.values(NAMES).flat().includes(spec.name) || COLONY_NAMES.includes(spec.name);
            spec.role = r;
            if (r === "colony") {
              spec.hull = COLONY_POD.hull; spec.computer = null; spec.shield = null; spec.ecm = null; spec.armor = null;
              spec.weapons = []; spec.specials = canUseFuelTanks(e) ? [FUEL_TANKS.id] : [];
            } else {
              spec.hull = "medium"; spec.computer = best(parts.computer); spec.shield = best(parts.shield); spec.armor = best(parts.armor);
              spec.weapons = [{ techId: best(parts.weapons) ?? "laser", count: 0 }]; spec.specials = [];
            }
            if (wasSuggested || !spec.name.trim()) spec.name = suggest();
            draw();
          };
          roleSeg.append(b);
        }
        box.append(roleSeg);
        const colony = spec.role === "colony";
        if (colony) box.append(el("p", { class: "dim", style: "margin:6px 0" }, `A Large hull built around a colony pod (${COLONY_POD.cost} BC, ${COLONY_POD.space} of ${HULLS.large.space} room). Use the spare room for fuel tanks or armor. No weapons.`));

        const hullSeg = el("div", { class: "seg", style: "margin:8px 0" });
        for (const h of HULL_SIZES) {
          const b = el("button", { class: spec.hull === h ? "on" : "" }, `${HULLS[h].name}<br><span class="dim">${HULLS[h].cost} BC · room ${HULLS[h].space}</span>`);
          b.onclick = () => {
            const wasSuggested = Object.values(NAMES).flat().includes(spec.name);
            spec.hull = h;
            if (wasSuggested || !spec.name.trim()) spec.name = suggest();
            draw();
          };
          hullSeg.append(b);
        }
        if (!colony) box.append(hullSeg);

        const pick = (label: string, list: { id: string; name: string }[], value: string | null, set: (v: string | null) => void, allowNone = true) => {
          const sel = el("select", { class: "tech-select" });
          if (allowNone) sel.append(el("option", { value: "" }, "None"));
          for (const t of list) {
            const o = el("option", { value: t.id }, t.name);
            if (t.id === value) o.selected = true;
            sel.append(o);
          }
          sel.onchange = () => { set(sel.value || null); draw(); };
          const lab = el("label", { class: "design-row" }, `<span>${label}</span>`);
          lab.append(sel);
          box.append(lab);
        };
        pick("Computer", parts.computer, spec.computer, (v) => (spec.computer = v));
        pick("Armor", parts.armor, spec.armor, (v) => (spec.armor = v));
        pick("Shield", parts.shield, spec.shield, (v) => (spec.shield = v));
        pick("Jammer (ECM)", parts.ecm, spec.ecm, (v) => (spec.ecm = v));

        if (!colony) box.append(el("div", { class: "dim", style: "margin-top:8px" }, "Weapons (up to 4 banks)"));
        if (!colony) spec.weapons.forEach((w, i) => {
          const row = el("div", { class: "design-row" });
          const sel = el("select", { class: "tech-select" });
          for (const t of parts.weapons) {
            const o = el("option", { value: t.id }, t.name);
            if (t.id === w.techId) o.selected = true;
            sel.append(o);
          }
          sel.onchange = () => { w.techId = sel.value; draw(); };
          const minus = el("button", { class: "small" }, "−");
          const plus = el("button", { class: "small" }, "+");
          minus.onclick = () => { w.count = Math.max(0, w.count - 1); draw(); };
          plus.onclick = () => { w.count++; draw(); };
          row.append(sel, minus, el("b", { style: "min-width:2ch;text-align:center" }, String(w.count)), plus);
          if (spec.weapons.length > 1) {
            const rm = el("button", { class: "small" }, "✕");
            rm.onclick = () => { spec.weapons.splice(i, 1); draw(); };
            row.append(rm);
          }
          box.append(row);
        });
        if (!colony && spec.weapons.length < 4 && parts.weapons.length) {
          const addW = el("button", { class: "small" }, "+ Weapon bank");
          addW.onclick = () => { spec.weapons.push({ techId: parts.weapons[0]!.id, count: 1 }); draw(); };
          box.append(addW);
        }

        const tankList = canUseFuelTanks(e) ? [{ id: FUEL_TANKS.id, name: FUEL_TANKS.name }] : [];
        const specialList = [...tankList, ...(colony ? [] : parts.specials)];
        if (specialList.length) {
          box.append(el("div", { class: "dim", style: "margin-top:8px" }, colony ? "Extras" : "Specials (up to 3)"));
          for (const t of specialList) {
            const on = spec.specials.includes(t.id);
            const b = el("button", { class: `small ${on ? "on" : ""}`, style: "margin:2px", title: SPECIAL_HELP[t.id] ?? "" }, `${on ? "✓ " : ""}${t.name}<br><span class="dim" style="font-size:11px">${SPECIAL_HELP[t.id] ?? ""}</span>`);
            b.onclick = () => {
              spec.specials = on ? spec.specials.filter((x) => x !== t.id) : [...spec.specials, t.id];
              draw();
            };
            box.append(b);
          }
        } else {
          box.append(el("div", { class: "dim", style: "margin-top:8px" }, colony
            ? "Extras: learn a Fuel Cells tech (Propulsion) to fit Extended Fuel Tanks (+3 ly range)."
            : "Specials: research Propulsion and Force Fields to unlock ship specials."));
        }

        const sum = el("div", { class: "tech-card" });
        const guns = st.weapons.map((w) => `${w.count}× ${w.name} ${w.min === w.max ? w.min : `${w.min}–${w.max}`} dmg`).join(", ") || "unarmed";
        sum.innerHTML = `<div>Room used <b>${fmt(st.spaceUsed)}</b> / ${st.space}</div>
          <div class="bar"><i style="width:${pct}%;${st.spaceUsed > st.space ? "background:#e05a5a" : ""}"></i></div>
          <div style="margin-top:6px"><b>${fmt(st.cost)} BC</b> each · Hits ${st.hits} · Speed ${fmt(st.speed)} ly/turn${st.extraRange ? ` · <span class="good">+${st.extraRange} ly range</span>` : ""}</div>
          ${colony ? `<div class="dim">Reaches ${fmt(v0.fuelRange + st.extraRange)} ly from your colonies (standard colony ship: ${fmt(v0.fuelRange)} ly)</div>` : `<div class="dim">Attack ${st.attack} · Beam defense ${st.beamDefense} · Missile defense ${st.missileDefense} · Shield ${st.shield}</div>
          <div class="dim">${esc(guns)}</div>`}
          ${err ? `<div style="color:#f0a0a0;margin-top:4px">${esc(err)}</div>` : ""}`;
        box.append(sum);

        const row = el("div", { class: "row" });
        const save = el("button", { class: "primary" }, "Save design");
        save.disabled = !!err;
        save.onclick = () => {
          if (this.cmd({ type: "createDesign", spec: structuredClone(spec) })) { autosave(this.state); close(); this.refresh(); this.showDesigns(); }
        };
        const cancel = el("button", {}, "Cancel");
        cancel.onclick = () => { close(); this.showDesigns(); };
        row.append(save, cancel);
        box.append(row);
      };
      draw();
    });
  }

  private showMenu(): void {
    this.modal((box, close) => {
      box.innerHTML = `<h2>Game menu</h2><p class="dim">Your game saves automatically after every turn on this device.</p>`;
      const row = el("div", { style: "display:flex;flex-direction:column;gap:8px" });
      const exp = el("button", {}, "Export save code (move to another device)");
      const auto = el("div", { class: "row", style: "justify-content:flex-start;flex-wrap:wrap;gap:6px" }, "<span class='dim' style='width:100%'>Autopilot: the AI runs your empire, stopping for new races, wars, council votes and the end of the game.</span>");
      const FOCUS_LABELS: Record<AutopilotFocus, string> = {
        balanced: "⚖️ Balanced", warlike: "⚔️ Warlike", industrial: "🏭 Industrial",
        expansion: "🌱 Expansionist", science: "🔬 Science", spies: "🕵️ Spies & sabotage",
      };
      const FOCUS_HELP: Record<AutopilotFocus, string> = {
        balanced: "Plays the way your race naturally would.",
        warlike: "Big fleets, weapons and shields first, quicker to fight.",
        industrial: "Factories and construction tech, a smaller fleet, avoids wars.",
        expansion: "Colony ships from every well-developed world; range and planetology research.",
        science: "Pours effort into research and computers.",
        spies: "Extra agents in every empire, sabotage rivals, tighter security at home.",
      };
      const cur = this.state.empires[PLAYER]!.focus ?? "balanced";
      const focusSeg = el("div", { class: "seg", style: "width:100%" });
      for (const f of AUTOPILOT_FOCI) {
        const b = el("button", { class: f === cur ? "on" : "", title: FOCUS_HELP[f] }, FOCUS_LABELS[f]);
        b.onclick = () => { this.cmd({ type: "setFocus", focus: f }); autosave(this.state); close(); this.showMenu(); };
        focusSeg.append(b);
      }
      auto.append(el("span", { class: "dim", style: "width:100%;margin-top:4px" }, `Focus: ${FOCUS_HELP[cur]}`), focusSeg);
      for (const n of [5, 10, 25]) {
        const b = el("button", { class: "small" }, `▶ ${n} turns`);
        b.onclick = () => { close(); this.autopilot(n); };
        auto.append(b);
      }
      row.append(auto);
      const snd = el("button", {}, `Sound: ${soundOn() ? "on" : "off"}`);
      snd.onclick = () => { setSound(!soundOn()); snd.textContent = `Sound: ${soundOn() ? "on" : "off"}`; play("click"); };
      const tips = el("button", {}, `Advisor tips: ${tipsOff() ? "off" : "on"}`);
      tips.onclick = () => { setTipsOff(!tipsOff()); tips.textContent = `Advisor tips: ${tipsOff() ? "off" : "on"}`; this.renderTip(); };
      const vic = el("button", {}, "Victory and the Galactic Council");
      vic.onclick = () => { close(); this.showVictory(); };
      const gem = el("button", {}, `Gemini link: ${geminiKey() ? "on" : "off"} (talk to aliens)`);
      gem.onclick = () => { close(); this.showGeminiSettings(); };
      row.append(vic, snd, tips);
      if (SHOW_GEMINI) row.append(gem);
      const mine = el("button", {}, "Your empire: culture, leaders, wonders");
      mine.onclick = () => { close(); this.showEmpire(); };
      row.append(mine);
      const emp = el("button", {}, "Empires: war and peace");
      emp.onclick = () => { close(); this.showEmpires(); };
      row.append(emp);
      exp.onclick = () => {
        box.innerHTML = `<h2>Save code</h2><p class="dim">Copy this code, then on the other device choose Import.</p>`;
        const ta = el("textarea") as HTMLTextAreaElement;
        ta.value = exportCode(this.state);
        const copy = el("button", { class: "primary" }, "Copy");
        copy.onclick = async () => { try { await navigator.clipboard.writeText(ta.value); this.toast("Copied"); } catch { ta.select(); } };
        const done = el("button", {}, "Close");
        done.onclick = close;
        const r = el("div", { class: "row" });
        r.append(copy, done);
        box.append(ta, r);
      };
      const imp = el("button", {}, "Import save code");
      imp.onclick = () => {
        box.innerHTML = `<h2>Import</h2><p class="dim">Paste a save code. This replaces the current game.</p>`;
        const ta = el("textarea") as HTMLTextAreaElement;
        const load = el("button", { class: "primary" }, "Load");
        load.onclick = () => {
          try {
            const g = importCode(ta.value);
            Object.assign(this.state, g);
            autosave(this.state);
            close();
            this.selected = null;
            this.refresh();
            this.toast("Game loaded");
          } catch (e) { this.toast(e instanceof Error ? e.message : "That code didn't work"); }
        };
        const cancel = el("button", {}, "Cancel");
        cancel.onclick = close;
        const r = el("div", { class: "row" });
        r.append(cancel, load);
        box.append(ta, r);
      };
      const help = el("button", {}, "How to play");
      help.onclick = () => { close(); this.showWelcome(); };
      const quit = el("button", {}, "Main menu");
      quit.onclick = () => { close(); this.map.destroy(); this.onQuit(); };
      const cheats = el("button", {}, "🛠️ Cheat menu");
      cheats.onclick = () => { close(); this.showCheats(); };
      const back = el("button", { class: "primary" }, "Back to game");
      back.onclick = close;
      row.append(back, help, exp, imp, cheats, quit);
      box.append(row);
    });
  }

  private showCheats(): void {
    this.modal((box, close) => {
      const sleepUntil = this.state.cheats?.rivalsAsleepUntil ?? 0;
      box.innerHTML = `<h2>🛠️ Cheat menu</h2><p class="dim">Only you can use these. The AI never cheats. Using one marks this game as cheated.</p>
        ${sleepUntil > this.state.turn ? `<p class="gold-text">Rivals asleep until turn ${sleepUntil}.</p>` : ""}`;
      const list: [string, Cheat][] = [
        ["+1,000 BC", { kind: "money", amount: 1000 }],
        ["Learn the next tech in every field", { kind: "research", techs: 1 }],
        ["Learn the next 5 techs in every field", { kind: "research", techs: 5 }],
        ["Reveal the whole galaxy", { kind: "revealMap" }],
        ["+3 colony ships at capital", { kind: "ships", templateId: "colony", count: 3 }],
        ["+3 scouts at capital", { kind: "ships", templateId: "scout", count: 3 }],
        ["Fill every colony to max population", { kind: "growColonies" }],
        ["😴 Put rivals to sleep for 20 turns", { kind: "sleepRivals", turns: 20 }],
        ["⏰ Wake rivals up", { kind: "wakeRivals" }],
        [this.state.cheats?.godMode ? "🛡️ God mode: ON (tap to turn off)" : "🛡️ God mode: off (tap to turn on)", { kind: "godMode", on: !this.state.cheats?.godMode }],
      ];
      const col = el("div", { style: "display:flex;flex-direction:column;gap:8px" });
      for (const [label, cheat] of list) {
        const b = el("button", {}, label);
        b.onclick = () => {
          this.toast(applyCheat(this.state, PLAYER, cheat));
          autosave(this.state);
          this.refresh();
          if (cheat.kind === "godMode") { close(); this.showCheats(); }
        };
        col.append(b);
      }
      const done = el("button", { class: "primary" }, "Done");
      done.onclick = close;
      col.append(done);
      box.append(col);
    });
  }

  private toast(text: string): void {
    const t = el("div", { class: "hint", style: "top:auto;bottom:calc(120px + env(safe-area-inset-bottom));background:#2a2f45;border-color:#4a5578" }, esc(text));
    this.root.append(t);
    setTimeout(() => t.remove(), 2600);
  }
}
