// End-of-turn processing. Same order for every empire, player or AI.

import { MISSILE_BASE_COST, template } from "./data/ships";
import {
  colonyProduction, factoryCost, FIELD_NAMES, maxUsableFactories, planetCapacity,
  popGrowth, POP_COST, researchCost,
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
  const part = (pct: number) => (production * pct) / 100;
  return {
    production,
    ship: part(c.sliders.ship), defense: part(c.sliders.defense), industry: part(c.sliders.industry),
    ecology: part(c.sliders.ecology), research: part(c.sliders.research),
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
    const t = template(c.buildTemplate);
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

  // Industry: build factories up to what the population can run.
  const room = Math.max(0, maxUsableFactories(c, e) - c.factories);
  if (room > 0) {
    const cost = factoryCost(e);
    const built = Math.min(room, b.industry / cost);
    c.factories += built;
    leftover += b.industry - built * cost;
    const fullPlanetMax = planetCapacity(s.planet) * (maxUsableFactories(c, e) / Math.max(c.population, 1e-9));
    if (built >= room - 1e-9 && c.factories >= fullPlanetMax - 1e-6) {
      event(state, { empireId: e.id, kind: "factoriesDone", text: `${s.name} has all the factories its people can run.`, starId: s.id });
    }
  } else {
    leftover += b.industry;
  }

  // Ecology: natural growth, then buy extra population with ecology spending.
  const cap = planetCapacity(s.planet);
  const wasFull = c.population >= cap - 1e-9;
  c.population += popGrowth(c.population, s.planet, r);
  const space = Math.max(0, cap - c.population);
  const bought = Math.min(space, b.ecology / POP_COST);
  c.population = Math.min(cap, c.population + bought);
  leftover += b.ecology - bought * POP_COST;
  if (!wasFull && c.population >= cap - 1e-9) {
    event(state, { empireId: e.id, kind: "popMaxed", text: `${s.name} has reached full population.`, starId: s.id });
  }

  e.treasury += leftover * LEFTOVER_TO_TREASURY;
  return b.research;
}

function processResearch(state: GameState, e: Empire, points: number): void {
  const r = empireRace(e);
  for (const f of FIELDS) {
    e.research.progress[f] += (points * e.research.alloc[f]) / 100;
    let cost = researchCost(e.research.level[f] + 1, r);
    while (e.research.progress[f] >= cost) {
      e.research.progress[f] -= cost;
      e.research.level[f]++;
      event(state, { empireId: e.id, kind: "research", text: `${FIELD_NAMES[f]} advanced to level ${e.research.level[f]}.` });
      cost = researchCost(e.research.level[f] + 1, r);
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

  mergeFleets(state);
  moveFleets(state);
  updateVision(state);
  updateAlive(state);
  state.turn++;
}
