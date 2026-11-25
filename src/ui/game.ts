// The in-game screen: star map, top bar, star/colony/fleet panel, research,
// End Turn with the "next up" bar, turn reports and the game menu.

import { aiAnswerProposals, runAITurns } from "../ai";
import { say } from "../engine/dialogue";
import type { TreatyKind } from "../engine/types";
import {
  applyCommand, CLIMATES, endTurn, exportCode, FIELD_NAMES, forecast, importCode, makeView,
  popGrowth, race, shipDesign, designsOf, designStats, partChoices, checkDesign, HULLS, HULL_SIZES, MAX_DESIGNS,
  type DesignSpec, type HullSize,
  type Command, type EmpireView, type GameState,
} from "../engine";
import { environmentFor, canColonize as canColonizeFormula } from "../engine/formulas";
import { applyCheat, type Cheat } from "../engine/cheats";
import { fleetExtraRange } from "../engine/movement";
import { researchChoices, tech, techCost } from "../engine/tech";
import { TECHS } from "../engine/data/techs";
import { FIELDS, SLIDERS, type Fleet, type Id, type ResearchField, type Slider } from "../engine/types";
import { art, setImageLoadedHandler } from "./assets";
import { StarMap } from "./map";
import { autosave } from "./storage";

const TREATY_LABEL: Record<TreatyKind, string> = { trade: "Trade agreement", research: "Research pact", nap: "Non-aggression pact", alliance: "Alliance" };
const TREATY_HELP: Record<TreatyKind, string> = {
  trade: "both earn BC each turn", research: "+5% research each", nap: "a promise not to attack", alliance: "friends in war",
};
function moodWord(n: number): string {
  return n >= 60 ? "devoted" : n >= 30 ? "friendly" : n >= 10 ? "warm" : n > -10 ? "neutral" : n > -30 ? "wary" : n > -60 ? "hostile" : "hateful";
}

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
const fmt = (n: number, d = 1) => (Math.round(n * 10 ** d) / 10 ** d).toLocaleString();
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
  private moving: { fleetId: Id; ships: Record<string, number> } | null = null;
  private busy = false;

  constructor(root: HTMLElement, private state: GameState, private onQuit: () => void) {
    this.root = root;
    root.innerHTML = "";
    this.map = new StarMap(root);
    root.append(this.top, this.endbar);
    this.map.onTapStar = (id) => this.tapStar(id);
    this.map.onTapEmpty = () => { if (!this.moving) this.select(null); };
    setImageLoadedHandler(() => this.map.draw());
    const home = state.stars[state.empires[PLAYER]!.capitalStarId]!;
    this.map.centerOn(home.x, home.y, Math.min(46, Math.max(26, Math.min(window.innerWidth, window.innerHeight) / 22)));
    this.refresh();
    if (state.turn === 1) this.showWelcome();
  }

  // ---------- Core loop ----------

  private refresh(): void {
    this.view = makeView(this.state, PLAYER);
    let moving: { fleet: Fleet; extraRange: number } | null = null;
    if (this.moving) {
      const f = this.view.fleets.find((x) => x.id === this.moving!.fleetId);
      if (f) moving = { fleet: f, extraRange: fleetExtraRange(this.state, { ...f, ships: this.moving.ships }) };
    }
    this.map.update(this.view, { selectedStar: this.selected, moving });
    this.renderTop();
    this.renderEndbar();
    this.renderPanel();
  }

  private cmd(c: Command): boolean {
    const r = applyCommand(this.state, PLAYER, c);
    if (!r.ok) this.toast(r.error);
    return r.ok;
  }

  private endTurn(): void {
    if (this.busy) return;
    this.busy = true;
    this.moving = null;
    this.setHint(null);
    const processedTurn = this.state.turn;
    // AI empires give their orders through the same command system, then the turn resolves.
    runAITurns(this.state);
    endTurn(this.state);
    autosave(this.state);
    this.busy = false;
    this.refresh();
    const mine = this.view.events.filter((e) => e.turn === processedTurn);
    if (mine.length) this.showReport(processedTurn, mine);
    else this.showProposals();
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
    const research = el("button", { class: "small" }, "Research");
    research.onclick = () => this.showResearch();
    const fleets = el("button", { class: "small" }, "Fleets");
    fleets.onclick = () => this.showFleets();
    const menu = el("button", { class: "small" }, "☰");
    menu.onclick = () => this.showMenu();
    this.top.append(research, fleets, menu);
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

  private select(id: Id | null): void {
    this.selected = id;
    if (id !== null) { const s = this.state.stars[id]!; this.map.focus(s.x, s.y); }
    this.refresh();
  }

  private startMove(f: Fleet, ships: Record<string, number>): void {
    this.moving = { fleetId: f.id, ships };
    this.setHint("Tap a star to send them there. Blue area = within fuel range.");
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

    if (!k?.explored) {
      p.append(el("div", {}, `<h2>${esc(s.name)}</h2><div class="chips"><span class="chip">${s.color} star</span>${s.nebula ? '<span class="chip">nebula</span>' : ""}</div>
        <p class="dim">Unexplored. Send a scout to find out what's here.</p>`));
    } else if (!k.planet) {
      p.append(el("div", {}, `<h2>${esc(s.name)}</h2><div class="chips"><span class="chip">${s.color} star</span></div>
        <p class="dim">No habitable planet. Only asteroids and gas here (later technology may change that).</p>`));
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
    p.append(this.fleetsBlock(s.id));
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
    const designBtn = el("button", { class: "small", style: "margin-top:6px" }, "🛠️ Ship designs");
    designBtn.onclick = () => this.showDesigns();
    build.append(designBtn);
    wrap.append(build);
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
      if ((f.ships.colony ?? 0) > 0 && v.canSettle(starId)) {
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
          b.onclick = () => { close(); this.showProposals(); };
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

  /** Proposals other empires sent us; answered one by one. */
  private showProposals(): void {
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
          card.innerHTML = `<img src="${art.portrait(o?.raceId ?? "humans")}" alt=""><div><b style="color:${o?.color ?? "#fff"}">${esc(o?.name ?? "?")}</b>
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
  private showDiplomacy(id: Id): void {
    this.modal((box, close) => {
      const draw = (reply = "") => {
        const v = makeView(this.state, PLAYER);
        const o = v.contacts.find((x) => x.id === id);
        if (!o) { close(); return; }
        const them = this.state.empires[id]!;
        const greet = reply || say(v.turn, them, o.warSince !== null ? "threaten" : "greeting", this.state.empires[PLAYER]!);
        box.innerHTML = `<div class="empire-card"><img src="${art.portrait(o.raceId)}" alt=""><div><h2 style="margin:0;color:${o.color}">${esc(o.name)}</h2>
          <div class="dim">${race(o.raceId).name} · ${moodWord(o.attitude)} toward you (${o.attitude > 0 ? "+" : ""}${o.attitude})</div></div></div>
          <div class="quote" style="margin:8px 0">${esc(greet)}</div>`;
        const ask = (proposal: Record<string, unknown>) => {
          const before = this.state.events.length;
          if (!this.cmd({ type: "propose", to: id, proposal: proposal as never })) return;
          aiAnswerProposals(this.state);
          const answer = this.state.events.slice(before).filter((e) => e.empireId === PLAYER && e.kind === "diplomacy").map((e) => e.text).join(" ");
          draw(answer || "They will think about it.");
        };

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

  private modal(build: (box: HTMLElement, close: () => void) => void): void {
    const back = el("div", { class: "modal-back" });
    const box = el("div", { class: "modal" });
    const close = () => back.remove();
    back.onclick = (e) => { if (e.target === back) close(); };
    back.append(box);
    build(box, close);
    this.root.append(back);
  }

  private showWelcome(): void {
    const r = race(this.state.empires[PLAYER]!.raceId);
    this.modal((box, close) => {
      box.innerHTML = `<img class="event-pic" src="${art.portrait(r.id)}" style="aspect-ratio:1;max-height:220px;object-position:top" alt="">
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
      const order = ["war", "invasion", "battle", "contact", "diplomacy", "spy", "colonized", "research", "shipBuilt", "explored", "baseBuilt", "popMaxed", "factoriesDone", "info"];
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
            card.innerHTML = `<b>${esc(d.name)}</b> <span class="dim">· ${HULLS[d.hull].name} hull · ${d.cost} BC${count ? ` · ${count} built` : ""}</span>
              <div class="dim">${esc(guns)}</div>
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
    const suggest = () => {
      const taken = new Set(designsOf(this.state, PLAYER).map((d) => d.name.toLowerCase()));
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
        box.append(hullSeg);

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

        box.append(el("div", { class: "dim", style: "margin-top:8px" }, "Weapons (up to 4 banks)"));
        spec.weapons.forEach((w, i) => {
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
        if (spec.weapons.length < 4 && parts.weapons.length) {
          const addW = el("button", { class: "small" }, "+ Weapon bank");
          addW.onclick = () => { spec.weapons.push({ techId: parts.weapons[0]!.id, count: 1 }); draw(); };
          box.append(addW);
        }

        if (parts.specials.length) {
          box.append(el("div", { class: "dim", style: "margin-top:8px" }, "Specials (up to 3)"));
          for (const t of parts.specials) {
            const on = spec.specials.includes(t.id);
            const b = el("button", { class: `small ${on ? "on" : ""}`, style: "margin:2px" }, `${on ? "✓ " : ""}${t.name}`);
            b.onclick = () => {
              spec.specials = on ? spec.specials.filter((x) => x !== t.id) : [...spec.specials, t.id];
              draw();
            };
            box.append(b);
          }
        } else {
          box.append(el("div", { class: "dim", style: "margin-top:8px" }, "Specials: research Propulsion and Force Fields to unlock ship specials."));
        }

        const sum = el("div", { class: "tech-card" });
        const guns = st.weapons.map((w) => `${w.count}× ${w.name} ${w.min === w.max ? w.min : `${w.min}–${w.max}`} dmg`).join(", ") || "unarmed";
        sum.innerHTML = `<div>Room used <b>${fmt(st.spaceUsed)}</b> / ${st.space}</div>
          <div class="bar"><i style="width:${pct}%;${st.spaceUsed > st.space ? "background:#e05a5a" : ""}"></i></div>
          <div style="margin-top:6px"><b>${fmt(st.cost)} BC</b> each · Hits ${st.hits} · Speed ${fmt(st.speed)} ly/turn</div>
          <div class="dim">Attack ${st.attack} · Beam defense ${st.beamDefense} · Missile defense ${st.missileDefense} · Shield ${st.shield}</div>
          <div class="dim">${esc(guns)}</div>
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
