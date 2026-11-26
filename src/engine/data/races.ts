// The 18 premade races. Original to this game.
// Stage 1 uses growth, production, research, home climate and colonization range.
// Combat, spy, diplomacy and unique mechanics take effect in later stages.

import type { Climate } from "../types";

export type Travel = "warp" | "phase" | "lanes" | "tunnels" | "gates";

export interface Personality {
  /** 0..1 each. Big, visible traits (see reference study: FreeOrion "Character"). */
  aggression: number;
  honor: number;
  greed: number;
  curiosity: number;
  pride: number;
}

export interface Race {
  id: string;
  name: string;
  style: string;
  color: string;
  homeClimate: Climate;
  /** Multipliers, 1 = normal. */
  growth: number;
  production: number;
  research: number;
  /** Extra hostility levels this race can settle from the start. */
  colonizeBonus: number;
  /** Ignores climate growth penalties (living-stone and energy races). */
  ignoresEnvironment: boolean;
  /** Migrant people: colonies do not grow on their own. Each turn the capital sends out this share of its people,
   *  split among the colonies that have room (see src/engine/migrants.ts). */
  homeMigrants?: number;
  shipAttack: number;
  shipDefense: number;
  ground: number;
  spying: number;
  diplomacy: number;
  travel: Travel;
  unique: string;
  personality: Personality;
}

const p = (aggression: number, honor: number, greed: number, curiosity: number, pride: number): Personality =>
  ({ aggression, honor, greed, curiosity, pride });

const base = {
  growth: 1, production: 1, research: 1, colonizeBonus: 0, ignoresEnvironment: false,
  shipAttack: 0, shipDefense: 0, ground: 0, spying: 0, diplomacy: 0,
} as const;

export const RACES: readonly Race[] = [
  { ...base, id: "humans", name: "Terran Accord", style: "Diplomats", color: "#4a8fe7", homeClimate: "terran",
    diplomacy: 2, travel: "warp", unique: "Born brokers: trade agreements pay 50% more.",
    personality: p(0.4, 0.7, 0.5, 0.6, 0.4) },
  { ...base, id: "vossari", name: "Vossari", style: "Scientists", color: "#8fd3f0", homeClimate: "arid",
    research: 1.2, growth: 0.85, travel: "warp", unique: "See the whole tech tree: no random gaps.",
    personality: p(0.3, 0.6, 0.3, 0.9, 0.6) },
  { ...base, id: "kethrak", name: "Kethrak Hive", style: "Hive", color: "#e0a030", homeClimate: "jungle",
    production: 1.5, growth: 1.2, diplomacy: -2, travel: "tunnels",
    unique: "Every 20 turns, larvae found a colony on a nearby world with no colony ship needed.",
    personality: p(0.8, 0.5, 0.6, 0.2, 0.5) },
  { ...base, id: "ashkari", name: "Ashkari Dominion", style: "Warriors", color: "#d03a2a", homeClimate: "desert",
    ground: 2, production: 1.15, travel: "warp", unique: "Take 25% of the value of every enemy ship destroyed as spoils.",
    personality: p(0.9, 0.6, 0.4, 0.3, 0.9) },
  { ...base, id: "lumen", name: "Lumen Choir", style: "Telepaths", color: "#c7a8ff", homeClimate: "ocean",
    spying: 2, research: 1.1, travel: "phase", unique: "Keep 60% of a conquered world's people.",
    personality: p(0.5, 0.2, 0.5, 0.7, 0.5) },
  { ...base, id: "thraal", name: "Thraal", style: "Lithovores", color: "#9a8f80", homeClimate: "barren",
    colonizeBonus: 10, ignoresEnvironment: true, growth: 0.6, travel: "lanes", // balance 2026-11-24: bonus 12 -> 10
    unique: "Settle any planet type from the start, but grow slowly.",
    personality: p(0.3, 0.8, 0.3, 0.3, 0.4) },
  { ...base, id: "seraphine", name: "Seraphine", style: "Pilots", color: "#f2e6c2", homeClimate: "steppe",
    shipDefense: 3, production: 1.1, research: 1.1, travel: "phase", unique: "Superb pilots: their ships are much harder to hit.",
    personality: p(0.6, 0.4, 0.6, 0.5, 0.6) },
  { ...base, id: "orrun", name: "Orrun Consortium", style: "Traders", color: "#3fbf6f", homeClimate: "ocean",
    diplomacy: 1, production: 1.1, travel: "lanes", unique: "Money talks: treasury buys council votes, and funding ships goes 25% further.",
    personality: p(0.3, 0.4, 0.9, 0.5, 0.3) },
  { ...base, id: "nyx", name: "Nyx Collective", style: "Machines", color: "#7a4fd0", homeClimate: "dead",
    production: 1.0, colonizeBonus: 3, travel: "warp", // balance 2026-11-25: production 1.2 -> 1.0 (won ~43% of 108 test games at 1.2/1.1)
    unique: "Build new population in factories at two thirds of the usual cost.",
    personality: p(0.6, 0.5, 0.5, 0.6, 0.3) },
  { ...base, id: "velari", name: "Velari", style: "Mystics", color: "#d58fd8", homeClimate: "terran",
    production: 1.1, travel: "gates", unique: "Master builders: wonders cost 25% less.",
    personality: p(0.3, 0.7, 0.4, 0.8, 0.8) },
  { ...base, id: "drovani", name: "Drovani", style: "Aquatic", color: "#2fb5b5", homeClimate: "ocean",
    travel: "warp", unique: "Ocean worlds hold 50% more population.",
    personality: p(0.2, 0.7, 0.4, 0.4, 0.5) },
  { ...base, id: "gorrath", name: "Gorrath Clans", style: "Nomads", color: "#a0703a", homeClimate: "tundra",
    colonizeBonus: 2, travel: "warp", unique: "Worldship nomads: colony ships cost 30% less and fly 2 light-years farther.",
    personality: p(0.8, 0.3, 0.7, 0.6, 0.6) },
  { ...base, id: "ixil", name: "Ixil", style: "Symbiotes", color: "#9b3fa8", homeClimate: "jungle",
    spying: 1, diplomacy: -1, research: 1.1, production: 1.1, travel: "phase", unique: "Bond with conquered peoples: absorb a technology from every world they capture.",
    personality: p(0.5, 0.1, 0.5, 0.7, 0.3) },
  { ...base, id: "verdane", name: "Verdane", style: "Plant beings", color: "#6fbf3a", homeClimate: "jungle",
    growth: 1.2, production: 1.1, travel: "lanes", unique: "Grow 50% faster around white, yellow and blue stars.",
    personality: p(0.2, 0.8, 0.3, 0.5, 0.7) },
  { ...base, id: "quorai", name: "Quorai", style: "Energy beings", color: "#f5c542", homeClimate: "radiated",
    ignoresEnvironment: true, colonizeBonus: 8, growth: 0.6, travel: "phase", homeMigrants: 0.03, // 2026-11-25: migrant rule; bonus 4 -> 8 with it (0 of 22 wins without, 4 of 22 with) // 2026-11-25: bonus 8 -> 4 (won 36%, 25%, 50% of three 54-game samples); balance 2026-11-24: was bonus 12, growth 0.7, research 1.15 (won 6 of 18 test games)
    unique: "Live inside stars: can settle stars that have no habitable planet. Colonies do not grow on their own: new Quorai come from the home star as migrants, so every new colony thins the stream.",
    personality: p(0.4, 0.5, 0.2, 0.9, 0.4) },
  { ...base, id: "raxxan", name: "Raxxan Reavers", style: "Scavengers", color: "#c45a2a", homeClimate: "minimal",
    research: 0.95, production: 1.1, colonizeBonus: 1, travel: "tunnels", unique: "Salvagers: a 35% chance to take a technology from every battle they win.",
    personality: p(0.8, 0.2, 0.8, 0.4, 0.5) },
  { ...base, id: "ruuvak", name: "Ruuvak Brood", style: "Breeders", color: "#7f9a3a", homeClimate: "steppe",
    growth: 2, ground: 1, production: 1.1, travel: "warp", unique: "Population grows twice as fast; extra ground troops from numbers.",
    personality: p(0.7, 0.4, 0.6, 0.3, 0.5) },
  { ...base, id: "tarkhan", name: "Tarkhan Hunt", style: "Gunners", color: "#e06a8a", homeClimate: "arid",
    // balance 2026-11-24: +15% production, +1 ground, no defense penalty (averaged 10 colonies)
    shipAttack: 3, production: 1.15, ground: 1, travel: "warp", unique: "Deadly gunners: more accurate, +1 damage per hit, and they always fire first.",
    personality: p(0.7, 0.9, 0.3, 0.4, 0.8) },
];

export function race(id: string): Race {
  const r = RACES.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown race ${id}`);
  return r;
}
