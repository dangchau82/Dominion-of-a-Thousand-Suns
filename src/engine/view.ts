// EmpireView: everything one empire is allowed to know. AI code reads ONLY this.
// It is a deep copy, so nothing done to it can touch the real game.

import { RACES, type Race } from "./data/races";
import { designsOf, shipDesign } from "./designs";
import type { ShipDesign } from "./data/ships";
import {
  canColonize, colonyScanRange, factoryCost, fuelRange, maxHostility, planetCapacity, popCost, robotControls,
  shipSpeed, workerProductivity,
} from "./formulas";
import { empireRace, shipCount } from "./game";
import { canSee } from "./knowledge";
import { fleetExtraRange, inFuelRange, supplyDistance, turnsToArrive } from "./movement";
import { tech, techCost, techStats } from "./tech";
import { colonyBudget, type ColonyBudget } from "./turn";
import {
  FIELDS,
  type Colony, type Empire, type Fleet, type Id, type GameEvent, type GameState, type ResearchField,
  type StarColor, type StarKnowledge,
} from "./types";

export interface PublicStar {
  id: Id; name: string; x: number; y: number; color: StarColor; nebula: boolean;
}

export interface SeenFleet {
  id: Id; empireId: Id; x: number; y: number; starId: Id | null; ships: number;
}

export interface KnownEmpire {
  id: Id; name: string; raceId: string; color: string; alive: boolean;
}

export interface ColonyInfo extends Colony {
  budget: ColonyBudget;
  capacity: number;
  maxFactories: number;
}

export interface ResearchProject {
  techId: string;
  cost: number;
}

export interface EmpireView {
  turn: number;
  me: Empire;
  /** Ship designs this empire can build (built-ins first). */
  designs: ShipDesign[];
  race: Race;
  stars: PublicStar[];
  knowledge: Record<Id, StarKnowledge>;
  colonies: ColonyInfo[];
  fleets: Fleet[];
  seenFleets: SeenFleet[];
  contacts: KnownEmpire[];
  events: GameEvent[];
  stats: {
    fuelRange: number; speed: number; maxHostility: number; scanRange: number;
    factoryCost: number; robotControls: number; workerProductivity: number;
    popCost: number; terraform: number; growthBonus: number; researchBonus: number;
    /** Current research project and its cost in each field. */
    projects: Record<ResearchField, ResearchProject | null>;
  };
  /** Helpers bound to this empire's legal knowledge only. */
  reachable(starId: Id, fleet: Fleet): boolean;
  canSettle(starId: Id): boolean;
  turnsTo(fleet: Fleet, starId: Id): number;
  supplyDistance(starId: Id): number;
}

export function makeView(state: GameState, empireId: Id): EmpireView {
  const e = state.empires[empireId] as Empire;
  const r = empireRace(e);
  const me = structuredClone(e);
  const knowledge = structuredClone(e.knowledge);
  const colonies: ColonyInfo[] = Object.values(state.colonies)
    .filter((c) => c.empireId === empireId)
    .map((c) => {
      const s = state.stars[c.starId]!;
      const cap = s.planet ? planetCapacity(s.planet, e) : 0;
      return { ...structuredClone(c), budget: colonyBudget(state, c), capacity: cap, maxFactories: c.population * robotControls(e) };
    });
  const fleets = structuredClone(state.fleets.filter((f) => f.empireId === empireId));
  const seenFleets: SeenFleet[] = state.fleets
    .filter((f) => f.empireId !== empireId && canSee(state, e, f.x, f.y))
    .map((f) => ({ id: f.id, empireId: f.empireId, x: f.x, y: f.y, starId: f.starId, ships: shipCount(f) }));
  const contacts: KnownEmpire[] = e.contacts.map((id) => {
    const o = state.empires[id]!;
    return { id: o.id, name: o.name, raceId: o.raceId, color: o.color, alive: o.alive };
  });

  const projects = Object.fromEntries(
    FIELDS.map((f) => {
      const id = e.research.current[f];
      return [f, id ? { techId: id, cost: techCost(tech(id), r) } : null];
    }),
  ) as Record<ResearchField, ResearchProject | null>;
  const ts = techStats(e);

  return {
    turn: state.turn,
    me, designs: structuredClone(designsOf(state, empireId)), race: RACES.find((x) => x.id === r.id)!, knowledge, colonies, fleets, seenFleets, contacts,
    stars: state.stars.map((s) => ({ id: s.id, name: s.name, x: s.x, y: s.y, color: s.color, nebula: s.nebula })),
    events: state.events.filter((ev) => ev.empireId === null || ev.empireId === empireId).map((ev) => ({ ...ev })),
    stats: {
      fuelRange: fuelRange(e), speed: shipSpeed(e), maxHostility: maxHostility(e, r),
      scanRange: colonyScanRange(e), factoryCost: factoryCost(e), robotControls: robotControls(e),
      workerProductivity: workerProductivity(e, r), popCost: popCost(e), terraform: ts.terraform,
      growthBonus: ts.growth, researchBonus: ts.research, projects,
    },
    reachable: (starId, fleet) => inFuelRange(state, e, state.stars[starId]!, fleetExtraRange(state, fleet)),
    canSettle: (starId) => {
      const k = e.knowledge[starId];
      if (!k?.explored || !k.planet) return false;
      if (k.ownerId !== null) return false;
      return canColonize(k.planet, e, r);
    },
    turnsTo: (fleet, starId) => turnsToArrive(e, fleet, state.stars[starId]!),
    supplyDistance: (starId) => supplyDistance(state, e, state.stars[starId]!),
  };
}

export interface Forecast {
  inTurns: number;
  text: string;
  starId?: Id;
}

/** "Next up" bar: what completes in the next couple of turns. */
export function forecast(state: GameState, empireId: Id, horizon = 2): Forecast[] {
  const e = state.empires[empireId] as Empire;
  const r = empireRace(e);
  const out: Forecast[] = [];
  for (const c of Object.values(state.colonies)) {
    if (c.empireId !== empireId) continue;
    const s = state.stars[c.starId]!;
    const b = colonyBudget(state, c);
    if (c.buildTemplate && b.ship > 0) {
      const t = shipDesign(state, c.buildTemplate);
      const turns = Math.ceil((t.cost - c.shipProgress) / b.ship - 1e-9);
      if (turns <= horizon) out.push({ inTurns: Math.max(1, turns), text: `${t.name} at ${s.name}`, starId: s.id });
    }
  }
  let researchPerTurn = 0;
  for (const c of Object.values(state.colonies)) if (c.empireId === empireId) researchPerTurn += colonyBudget(state, c).research;
  for (const f of FIELDS) {
    const perTurn = (researchPerTurn * (1 + techStats(e).research) * e.research.alloc[f]) / 100;
    const id = e.research.current[f];
    if (perTurn <= 0 || !id) continue;
    const t = tech(id);
    const need = techCost(t, r) - e.research.progress[f];
    const turns = Math.ceil(need / perTurn - 1e-9);
    if (turns <= horizon) out.push({ inTurns: Math.max(1, turns), text: t.name });
  }
  for (const f of state.fleets) {
    if (f.empireId !== empireId || f.destStarId === null) continue;
    const s = state.stars[f.destStarId]!;
    const turns = turnsToArrive(e, f, s);
    if (turns <= horizon) out.push({ inTurns: turns, text: `Fleet reaches ${s.name}`, starId: s.id });
  }
  return out.sort((a, b) => a.inTurns - b.inTurns);
}
