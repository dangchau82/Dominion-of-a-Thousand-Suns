// End-of-turn processing. Same order for every empire, player or AI.

import { ensureProject, learn, tech, techCost, techStats } from "./tech";
import { MISSILE_BASE_COST } from "./data/ships";
import { shipDesign } from "./designs";
import { resolveCombat } from "./combat";
import { colonyEffects, empireBonus, processCivilization, progressBuilding } from "./civ";
import { applyTreaties, processEspionage, researchPactBonus, spendingShare, updateRelations } from "./diplomacy";
import {
  colonyProduction, factoryCost, FIELD_NAMES, maxUsableFactories, planetCapacity,
  popCost, popGrowth,
} from "./formulas";
import { empireRace } from "./game";
import { updateVision } from "./knowledge";
import { mergeFleets, moveFleets } from "./movement";
import { FIELDS, type Colony, type Empire, type GameEvent, type GameState, type Star } from "./types";

/** Share of unused BC that goes to the treasury instead of being lost. */
export const LEFTOVER_TO_TREASURY = 0.5;

function event(state: GameState, ev: Omit<GameEvent, "turn">): void {
  state.events.push({ turn: state.turn, ...ev });
}

export interface ColonyBudget {
  production: number;
  ship: number; defense: number; industry: number; ecology: number; research: number;
}

export function colonyBudget(state: GameState, c: Colony): ColonyBudget {
  const e = state.empires[c.empireId] as Empire;
  const s = state.stars[c.starId] as Star;
  const production = s.planet ? colonyProduction(c, s.planet, e, empireRace(e)) : 0;
  // Buildings, wonders, leaders and golden ages raise output.
  const ce = colonyEffects(c);
  const eb = empireBonus(e);
  const boosted = production * (1 + ce.production + eb.production);
  // Spies and internal security are paid first, out of every colony's output.
  const net = boosted * (1 - spendingShare(e));
  const part = (pct: number) => (net * pct) / 100;
  return {
    production: boosted,
    ship: part(c.sliders.ship) * (1 + ce.ships), defense: part(c.sliders.defense), industry: part(c.sliders.industry),
    ecology: part(c.sliders.ecology), research: part(c.sliders.research) * (1 + ce.research + eb.research),
  };
}

/** Returns research points produced. */
function processColony(state: GameState, c: Colony): number {
  const e = state.empires[c.empireId] as Empire;
  const r = empireRace(e);
  const s = state.stars[c.starId] as Star;
  if (!s.planet) return 0;
  const b = colonyBudget(state, c);
  let leftover = 0;

  // Ships
  if (c.buildTemplate) {
    const t = shipDesign(state, c.buildTemplate);
    c.shipProgress += b.ship;
    let built = 0;
    while (c.shipProgress >= t.cost) {
      c.shipProgress -= t.cost;
      built++;
    }
    if (built > 0) {
      state.fleets.push({
        id: state.nextFleetId++, empireId: e.id, ships: { [t.id]: built },
        x: s.x, y: s.y, starId: s.id, destStarId: null,
      });
      event(state, { empireId: e.id, kind: "shipBuilt", text: `${s.name} built ${built} ${t.name}${built > 1 ? "s" : ""}.`, starId: s.id });
    }
  } else {
    leftover += b.ship;
  }

  // Defense
  c.defenseProgress += b.defense;
  while (c.defenseProgress >= MISSILE_BASE_COST) {
    c.defenseProgress -= MISSILE_BASE_COST;
    c.missileBases++;
    event(state, { empireId: e.id, kind: "baseBuilt", text: `${s.name} built a missile base (${c.missileBases} total).`, starId: s.id });
  }

  // Industry: a building in progress takes half (all, once factories are full);
  // the rest builds factories up to what the population can run.
  const room = Math.max(0, maxUsableFactories(c, e) - c.factories);
  let industry = b.industry;
  if (c.buildQueue) {
    const toBuilding = room > 0 ? industry / 2 : industry;
    industry = industry - toBuilding + progressBuilding(state, e, c, toBuilding);
  }
  e.treasury += colonyEffects(c).treasury * b.production;
  if (room > 0) {
    const cost = factoryCost(e);
    const built = Math.min(room, industry / cost);
    c.factories += built;
    leftover += industry - built * cost;
    const fullPlanetMax = planetCapacity(s.planet, e) * (maxUsableFactories(c, e) / Math.max(c.population, 1e-9));
    if (built >= room - 1e-9 && c.factories >= fullPlanetMax - 1e-6) {
      event(state, { empireId: e.id, kind: "factoriesDone", text: `${s.name} has all the factories its people can run.`, starId: s.id });
    }
  } else {
    leftover += industry;
  }

  // Ecology: natural growth, then buy extra population with ecology spending.
  const cap = planetCapacity(s.planet, e);
  // A conquered world may hold more people than its new owner's tech supports.
  if (c.population > cap) c.population = cap;
  const wasFull = c.population >= cap - 1e-9;
  c.population += popGrowth(c.population, s.planet, r, e);
  const space = Math.max(0, cap - c.population);
  const pc = popCost(e);
  const bought = Math.min(space, b.ecology / pc);
  c.population = Math.min(cap, c.population + bought);
  leftover += b.ecology - bought * pc;
  if (!wasFull && c.population >= cap - 1e-9) {
    event(state, { empireId: e.id, kind: "popMaxed", text: `${s.name} has reached full population.`, starId: s.id });
  }

  e.treasury += leftover * LEFTOVER_TO_TREASURY;
  return b.research;
}

function processResearch(state: GameState, e: Empire, points: number): void {
  const r = empireRace(e);
  const rs = e.research;
  points *= 1 + techStats(e).research + researchPactBonus(e);
  for (const f of FIELDS) {
    rs.progress[f] += (points * rs.alloc[f]) / 100;
    for (;;) {
      const id = ensureProject(rs, f);
      if (!id) break;
      const t = tech(id);
      const cost = techCost(t, r);
      if (rs.progress[f] < cost) break;
      rs.progress[f] -= cost;
      learn(rs, id);
      const nextId = ensureProject(rs, f);
      const next = nextId ? ` Now researching ${tech(nextId).name}.` : ` ${FIELD_NAMES[f]} has nothing left to research.`;
      event(state, { empireId: e.id, kind: "research", text: `Discovered ${t.name}: ${t.description}${next}` });
    }
  }
}

function updateAlive(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive) continue;
    const hasColony = Object.values(state.colonies).some((c) => c.empireId === e.id);
    const hasColonyShip = state.fleets.some((f) => f.empireId === e.id && (f.ships.colony ?? 0) > 0);
    if (!hasColony && !hasColonyShip) {
      e.alive = false;
      event(state, { empireId: null, kind: "info", text: `The ${e.name} have vanished from the galaxy.` });
    }
  }
}

/** Process one full turn for every empire. Orders must already have been given. */
export function endTurn(state: GameState): void {
  // Keep only events from this turn's order phase.
  state.events = state.events.filter((ev) => ev.turn >= state.turn);

  const researchByEmpire = new Map<number, number>();
  const colonies = Object.values(state.colonies).sort((a, b) => a.starId - b.starId);
  for (const c of colonies) {
    const pts = processColony(state, c);
    researchByEmpire.set(c.empireId, (researchByEmpire.get(c.empireId) ?? 0) + pts);
  }
  for (const e of state.empires) {
    if (e.alive) processResearch(state, e, researchByEmpire.get(e.id) ?? 0);
  }

  processCivilization(state);
  processEspionage(state);
  applyTreaties(state);

  mergeFleets(state);
  moveFleets(state);
  resolveCombat(state);
  updateVision(state);
  updateRelations(state);
  updateAlive(state);
  state.turn++;
}
