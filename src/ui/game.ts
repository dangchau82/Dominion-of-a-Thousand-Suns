// The in-game screen: star map, top bar, star/colony/fleet panel, research,
// End Turn with the "next up" bar, turn reports and the game menu.

import { runAITurns } from "../ai";
import {
  applyCommand, CLIMATES, endTurn, exportCode, FIELD_NAMES, forecast, importCode, makeView,
  popGrowth, race, SHIP_TEMPLATES, template,
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
      if (f) moving = { fleet: f, extraRange: fleetExtraRange({ ...f, ships: this.moving.ships }) };
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
        ? b.ship > 0 ? `${template(c.buildTemplate).name} in ${Math.max(1, Math.ceil((template(c.buildTemplate).cost - c.shipProgress) / b.ship))} turn(s)` : `Building ${template(c.buildTemplate).name}: add spending`
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
    const choices: (string | null)[] = [null, ...Object.keys(SHIP_TEMPLATES)];
    for (const t of choices) {
      const label = t === null ? "Nothing" : `${template(t).name} (${template(t).cost})`;
      const bt = el("button", { class: c.buildTemplate === t ? "on" : "" }, label);
      bt.onclick = () => { this.cmd({ type: "setBuild", starId, templateId: t }); this.refreshKeepScroll(); };
      seg.append(bt);
    }
    build.append(seg);
    wrap.append(build);
    return wrap;
  }

  private fleetsBlock(starId: Id): HTMLElement {
    const v = this.view;
    const wrap = el("div", {});
    const here = v.fleets.filter((f) => f.starId === starId && f.destStarId === null);
    const leaving = v.fleets.filter((f) => f.starId === starId && f.destStarId !== null);
    const incoming = v.fleets.filter((f) => f.destStarId === starId);
    if (!here.length && !leaving.length && !incoming.length) return wrap;
    wrap.className = "section";
    if (here.length) wrap.append(el("div", { class: "dim" }, "Here:"));
    for (const f of here) {
      const box = el("div", { class: "fleet" });
      const desc = Object.entries(f.ships).filter(([, n]) => n > 0).map(([t, n]) => `${n} ${template(t).name}${n > 1 ? "s" : ""}`).join(", ");
      box.innerHTML = `<img src="${art.ship(v.me.raceId, 1)}" alt=""><div class="fl-text">${esc(desc)}</div>`;
      for (const [t, n] of Object.entries(f.ships)) {
        if (n <= 0) continue;
        const one = el("button", { class: "small" }, `Send 1 ${template(t).name}`);
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
      .map(([t, n]) => `${n} ${template(t).name}${n > 1 ? "s" : ""}`).join(", ");
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
    this.modal((box, close) => {
      const pic = contact ? `<img class="event-pic" src="${art.event("contact")}" alt="">` : "";
      const order = ["contact", "colonized", "research", "shipBuilt", "explored", "baseBuilt", "popMaxed", "factoriesDone", "info"];
      const sorted = [...events].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
      box.innerHTML = `${pic}<h2>Turn ${turn} report</h2><ul>${sorted.map((e) => `<li>${esc(e.text)}</li>`).join("")}</ul>`;
      const row = el("div", { class: "row" });
      const ok = el("button", { class: "primary" }, "Continue");
      ok.onclick = close;
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
        const desc = Object.entries(f.ships).filter(([, n]) => n > 0).map(([t, n]) => `${n} ${template(t).name}`).join(", ");
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
      const ok = el("button", {}, "Close");
      ok.onclick = close;
      row.append(ok);
      box.append(row);
    });
  }

  private showMenu(): void {
    this.modal((box, close) => {
      box.innerHTML = `<h2>Game menu</h2><p class="dim">Your game saves automatically after every turn on this device.</p>`;
      const row = el("div", { style: "display:flex;flex-direction:column;gap:8px" });
      const exp = el("button", {}, "Export save code (move to another device)");
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
