// Each race's unique ability, in one place. Stats (growth, research, ship
// attack...) live in data/races; these are the special rules on top.

import type { ShipDesign } from "./data/ships";
import type { BuildingDef } from "./data/buildings";
import { learn } from "./tech";
import * as R from "./rng";
import type { Empire, GameState, Planet, Star } from "./types";

export const is = (e: Empire, raceId: string) => e.raceId === raceId;

/** Terran Accord: brokers. Trade agreements pay half again as much. */
export function tradeMultiplier(e: Empire): number {
  return is(e, "humans") ? 1.5 : 1;
}

/** Drovani: ocean worlds hold 50% more population. */
export function capacityMultiplier(p: Planet, owner?: Empire): number {
  return owner && is(owner, "drovani") && p.climate === "ocean" ? 1.5 : 1;
}

/** Nyx Collective: build population in factories, at half the cost. */
export function popCostMultiplier(e: Empire): number {
  return is(e, "nyx") ? 0.65 : 1;
}

/** Verdane: grow 50% faster around bright (white, yellow, blue) stars. */
export function growthMultiplier(e: Empire, s: Star): number {
  return is(e, "verdane") && (s.color === "white" || s.color === "yellow" || s.color === "blue") ? 1.5 : 1;
}

/** Gorrath Clans: wandering worldships. Colony ships are cheaper and fly farther. */
export function shipCost(e: Empire, d: ShipDesign): number {
  return is(e, "gorrath") && d.role === "colony" ? Math.round(d.cost * 0.7) : d.cost;
}
export function extraRange(e: Empire, d: ShipDesign): number {
  return d.extraRange + (is(e, "gorrath") && d.role === "colony" ? 2 : 0);
}

/** Velari: wonders cost a quarter less. */
export function buildingCost(e: Empire, b: BuildingDef): number {
  return is(e, "velari") && b.wonder ? Math.round(b.cost * 0.75) : b.cost;
}

/** Orrun Consortium: money talks. Funding ships goes a quarter further; treasury buys council votes. */
export function fundMultiplier(e: Empire): number {
  return is(e, "orrun") ? 1.25 : 1;
}
export function boughtVotes(e: Empire, baseVotes: number): number {
  return is(e, "orrun") ? Math.min(Math.round(baseVotes * 0.5), Math.floor(Math.max(0, e.treasury) / 400)) : 0;
}

/** Quorai: live inside stars, so they can settle stars with no habitable planet. */
export function canSettleStarless(e: Empire): boolean {
  return is(e, "quorai");
}
export function stellarHabitat(): Planet {
  return { climate: "inferno", size: 15, terraform: 0, minerals: "normal", environment: "normal", special: null };
}

/** Tarkhan Hunt: gunners hit harder (+1 damage per hit) and always fire first. */
export function damageBonus(e: Empire): number {
  return is(e, "tarkhan") ? 1 : 0;
}

/** Lumen Choir: absorb a conquered world's people without unrest (keep 60% of them). */
export function capturedPopulation(e: Empire, troops: number, oldPop: number): number {
  return is(e, "lumen") ? Math.max(troops, oldPop * 0.6) : troops;
}

/** After a battle: Ashkari profit from victories; Raxxan salvage technology from wrecks. */
export function afterBattle(state: GameState, winner: Empire, loser: Empire, enemyLossValue: number): string | null {
  if (enemyLossValue <= 0) return null;
  if (is(winner, "ashkari")) {
    const spoils = Math.round(enemyLossValue * 0.25);
    winner.treasury += spoils;
    return `Our warriors claimed ${spoils} BC in spoils.`;
  }
  if (is(winner, "raxxan") && R.chance(state.rng, 0.35)) return stealOne(state, winner, loser, "salvaged");
  return null;
}

/** Ixil: bond with conquered peoples and gain their knowledge. */
export function afterCapture(state: GameState, winner: Empire, loser: Empire): string | null {
  return is(winner, "ixil") ? stealOne(state, winner, loser, "absorbed") : null;
}

function stealOne(state: GameState, to: Empire, from: Empire, verb: string): string | null {
  const options = from.research.known.filter((id) => !to.research.known.includes(id)).sort();
  if (!options.length) return null;
  const id = R.pick(state.rng, options);
  learn(to.research, id);
  return `We ${verb} the secrets of ${id.replace(/-/g, " ")} from the ${from.name}.`;
}

/** Kethrak Hive: larvae drift to nearby worlds. Every 20 turns a new colony hatches without a colony ship. */
export const LARVAE_EVERY = 20;
