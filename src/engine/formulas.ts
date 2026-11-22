// Core rules math. Pure functions only.
// Growth, production, factory cost, research cost and hit chance are
// adapted from Remnants of the Precursors (GPL-3.0).

import { CLIMATES, HOSTILE_FROM, MINERAL_MOD } from "./data/planets";
import type { Race } from "./data/races";
import type { Climate, Colony, Empire, Environment, Planet, ResearchField } from "./types";

// ---------- Planets ----------

export function planetCapacity(p: Planet): number {
  return p.size + p.terraform;
}

/** A race's own home climate is never hostile to it. */
export function environmentFor(p: Planet, r: Race): Environment {
  if (p.environment === "fertile" || p.environment === "gaia") return p.environment;
  if (p.climate === r.homeClimate) return "normal";
  return CLIMATES[p.climate].hostility >= HOSTILE_FROM ? "hostile" : "normal";
}

/** Whether a race can settle this climate with starting technology. */
export function canColonizeClimate(c: Climate, r: Race): boolean {
  return c === r.homeClimate || CLIMATES[c].hostility <= 6 + r.colonizeBonus;
}

export function environmentGrowthMod(env: Environment): number {
  switch (env) {
    case "hostile": return 0.5;
    case "fertile": return 1.5;
    case "gaia": return 2;
    default: return 1;
  }
}

// ---------- Population ----------

/**
 * Natural population growth per turn (logistic curve).
 * rate = (1 - pop/size) / 10, scaled by race and environment; at least 0.1.
 * Adapted from Remnants of the Precursors (GPL-3.0).
 */
export function popGrowth(pop: number, planet: Planet, race: Race): number {
  const size = planetCapacity(planet);
  const room = size - pop;
  if (room <= 0) return 0;
  let rate = Math.max(0, (1 - pop / size) / 10) * race.growth;
  if (!race.ignoresEnvironment) rate *= environmentGrowthMod(environmentFor(planet, race));
  return Math.min(room, Math.max(0.1, pop * rate));
}

/** BC to buy one unit of population through the ecology slider. */
export const POP_COST = 20;

// ---------- Production ----------

/**
 * BC per population unit. Base 0.5, +0.03 per Planetology level.
 * Adapted from Remnants of the Precursors (GPL-3.0) ("book formula").
 */
export function workerProductivity(e: Empire, r: Race): number {
  const level = e.research.level.planetology - 1;
  return ((level * 3 + 50) / 100) * r.production;
}

/** Factories one population unit can operate. Starts at 2. */
export function robotControls(e: Empire): number {
  return 2 + Math.floor((e.research.level.construction - 1) / 3);
}

export function maxUsableFactories(c: Colony, e: Empire): number {
  return c.population * robotControls(e);
}

/**
 * Cost of a new factory = base cost × robot controls / 2.
 * Adapted from Remnants of the Precursors (GPL-3.0).
 */
export function factoryCost(e: Empire): number {
  const base = Math.max(5, 10 - Math.floor((e.research.level.construction - 1) / 2));
  return (base * robotControls(e)) / 2;
}

/** Total BC a colony produces this turn. */
export function colonyProduction(c: Colony, planet: Planet, e: Empire, r: Race): number {
  const workers = c.population * workerProductivity(e, r);
  const factories = Math.min(c.factories, maxUsableFactories(c, e));
  return (workers + factories) * MINERAL_MOD[planet.minerals];
}

// ---------- Research ----------

/**
 * Cost of reaching the next level in a field: 25 × level².
 * Stage 1 placeholder shaped like the classic curve (base × level²);
 * stage 2 replaces field levels with the real tech tree.
 */
export function researchCost(nextLevel: number, r: Race): number {
  return Math.round((25 * nextLevel * nextLevel) / r.research);
}

// ---------- Tech effects (stage 1 placeholders) ----------

/** Highest planet hostility this empire can colonize. */
export function maxHostility(e: Empire, r: Race): number {
  return 6 + Math.floor((e.research.level.planetology - 1) / 2) + r.colonizeBonus;
}

export function canColonize(planet: Planet, e: Empire, r: Race): boolean {
  return planet.climate === r.homeClimate || CLIMATES[planet.climate].hostility <= maxHostility(e, r);
}

/** Base fuel range in light-years from the nearest owned colony. */
export function fuelRange(e: Empire): number {
  return 3 + (e.research.level.propulsion - 1) * 0.5;
}

/** Ship speed in light-years per turn. */
export function shipSpeed(e: Empire): number {
  return 1.5 + (e.research.level.propulsion - 1) * 0.25;
}

/** How far colonies can see ships and stars. */
export function colonyScanRange(e: Empire): number {
  return 2 + Math.floor((e.research.level.computers - 1) / 2) * 0.5;
}

// ---------- Combat (used from stage 3) ----------

/**
 * Beam weapon hit chance: (5 + attack + computer - (defense + range - 1)) / 10, minimum 5%.
 * Adapted from Remnants of the Precursors (GPL-3.0).
 */
export function beamHitChance(attack: number, computer: number, defense: number, range: number): number {
  return Math.min(1, Math.max(0.05, (5 + attack + computer - (defense + range - 1)) / 10));
}

/**
 * Miniaturization: parts get cheaper and smaller for each level behind the
 * current level (×0.933 per level). Adapted from Remnants of the Precursors (GPL-3.0).
 */
export function miniaturization(levelsBehind: number, maxLevels = 10): number {
  return Math.pow(0.933033, Math.max(0, Math.min(maxLevels, levelsBehind)));
}

// ---------- Geometry ----------

export function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

export function travelTurns(dist: number, speed: number): number {
  return Math.max(1, Math.ceil(dist / speed));
}

export const FIELD_NAMES: Record<ResearchField, string> = {
  computers: "Computers", construction: "Construction", forceFields: "Force Fields",
  planetology: "Planetology", propulsion: "Propulsion", weapons: "Weapons",
};
