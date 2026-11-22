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
    diplomacy: 2, travel: "warp", unique: "Broker deals between two other races and take a cut.",
    personality: p(0.4, 0.7, 0.5, 0.6, 0.4) },
  { ...base, id: "vossari", name: "Vossari", style: "Scientists", color: "#8fd3f0", homeClimate: "arid",
    research: 1.5, growth: 0.8, travel: "warp", unique: "Choose two extra techs per tier instead of a random gap.",
    personality: p(0.3, 0.6, 0.3, 0.9, 0.6) },
  { ...base, id: "kethrak", name: "Kethrak Hive", style: "Hive", color: "#e0a030", homeClimate: "jungle",
    production: 1.5, growth: 1.2, diplomacy: -2, travel: "tunnels",
    unique: "Cannot make peace with non-hive races; larvae colonies grow without colony ships.",
    personality: p(0.8, 0.5, 0.6, 0.2, 0.5) },
  { ...base, id: "ashkari", name: "Ashkari Dominion", style: "Warriors", color: "#d03a2a", homeClimate: "desert",
    ground: 2, research: 0.85, travel: "warp", unique: "Gain production from every battle won; idle peace lowers morale.",
    personality: p(0.9, 0.6, 0.4, 0.3, 0.9) },
  { ...base, id: "lumen", name: "Lumen Choir", style: "Telepaths", color: "#c7a8ff", homeClimate: "ocean",
    spying: 2, shipDefense: -1, travel: "phase", unique: "Absorb a captured planet's population without unrest.",
    personality: p(0.5, 0.2, 0.5, 0.7, 0.5) },
  { ...base, id: "thraal", name: "Thraal", style: "Lithovores", color: "#9a8f80", homeClimate: "barren",
    colonizeBonus: 12, ignoresEnvironment: true, growth: 0.6, travel: "lanes",
    unique: "Settle any planet type from the start, but grow slowly.",
    personality: p(0.3, 0.8, 0.3, 0.3, 0.4) },
  { ...base, id: "seraphine", name: "Seraphine", style: "Pilots", color: "#f2e6c2", homeClimate: "steppe",
    shipDefense: 3, production: 0.85, travel: "phase", unique: "Ships gain double experience; can hire out fleets as mercenaries.",
    personality: p(0.6, 0.4, 0.6, 0.5, 0.6) },
  { ...base, id: "orrun", name: "Orrun Consortium", style: "Traders", color: "#3fbf6f", homeClimate: "ocean",
    diplomacy: 1, travel: "lanes", unique: "Buy planets, ships and votes outright.",
    personality: p(0.3, 0.4, 0.9, 0.5, 0.3) },
  { ...base, id: "nyx", name: "Nyx Collective", style: "Machines", color: "#7a4fd0", homeClimate: "dead",
    production: 1.3, colonizeBonus: 3, travel: "warp", unique: "Builds new population in factories instead of growing it.",
    personality: p(0.6, 0.5, 0.5, 0.6, 0.3) },
  { ...base, id: "velari", name: "Velari", style: "Mystics", color: "#d58fd8", homeClimate: "terran",
    travel: "gates", unique: "Each wonder they build gives a permanent empire-wide bonus.",
    personality: p(0.3, 0.7, 0.4, 0.8, 0.8) },
  { ...base, id: "drovani", name: "Drovani", style: "Aquatic", color: "#2fb5b5", homeClimate: "ocean",
    travel: "warp", unique: "Ocean worlds hold double population; floating cities on gas giants.",
    personality: p(0.2, 0.7, 0.4, 0.4, 0.5) },
  { ...base, id: "gorrath", name: "Gorrath Clans", style: "Nomads", color: "#a0703a", homeClimate: "tundra",
    colonizeBonus: 2, travel: "warp", unique: "Live on worldships that move between stars.",
    personality: p(0.8, 0.3, 0.7, 0.6, 0.6) },
  { ...base, id: "ixil", name: "Ixil", style: "Symbiotes", color: "#9b3fa8", homeClimate: "jungle",
    spying: 1, diplomacy: -1, travel: "phase", unique: "Bond with other species and gain their traits.",
    personality: p(0.5, 0.1, 0.5, 0.7, 0.3) },
  { ...base, id: "verdane", name: "Verdane", style: "Plant beings", color: "#6fbf3a", homeClimate: "jungle",
    growth: 1.2, travel: "lanes", unique: "Need no food; grow faster near bright stars; spore-pod colonies.",
    personality: p(0.2, 0.8, 0.3, 0.5, 0.7) },
  { ...base, id: "quorai", name: "Quorai", style: "Energy beings", color: "#f5c542", homeClimate: "radiated",
    ignoresEnvironment: true, colonizeBonus: 12, growth: 0.7, research: 1.15, travel: "phase",
    unique: "Live inside stars and gas giants no one else can use.",
    personality: p(0.4, 0.5, 0.2, 0.9, 0.4) },
  { ...base, id: "raxxan", name: "Raxxan Reavers", style: "Scavengers", color: "#c45a2a", homeClimate: "minimal",
    research: 0.8, colonizeBonus: 1, travel: "tunnels", unique: "Salvage tech from battles; board damaged ships to capture them.",
    personality: p(0.8, 0.2, 0.8, 0.4, 0.5) },
  { ...base, id: "ruuvak", name: "Ruuvak Brood", style: "Breeders", color: "#7f9a3a", homeClimate: "steppe",
    growth: 2, research: 0.85, ground: 1, travel: "warp", unique: "Population grows twice as fast; extra ground troops from numbers.",
    personality: p(0.7, 0.4, 0.6, 0.3, 0.5) },
  { ...base, id: "tarkhan", name: "Tarkhan Hunt", style: "Gunners", color: "#e06a8a", homeClimate: "arid",
    shipAttack: 3, shipDefense: -1, travel: "warp", unique: "More accurate, harder-hitting weapons and first strike in battle.",
    personality: p(0.7, 0.9, 0.3, 0.4, 0.8) },
];

export function race(id: string): Race {
  const r = RACES.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown race ${id}`);
  return r;
}
