// Colony buildings and galactic wonders. Original names and text.
// Wonders are one per galaxy: the first empire to finish one gets it.

import type { ResearchField } from "../types";

export interface BuildingEffects {
  /** Added once to the planet's size when finished. */
  pop?: number;
  /** This colony's research +x (0.25 = +25%). */
  research?: number;
  /** This colony's ship building +x. */
  ships?: number;
  /** This colony's production +x. */
  production?: number;
  /** Share of this colony's production also paid to the treasury. */
  treasury?: number;
  /** Culture points per turn. */
  culture?: number;
  /** Missile bases added when finished. */
  bases?: number;
}

/** Empire-wide bonuses (wonders, leaders, golden ages). */
export interface EmpireBonus {
  production?: number;
  research?: number;
  growth?: number;
  range?: number;
  attack?: number;
  spying?: number;
  relations?: number;
  trade?: number;
  culture?: number;
}

export interface BuildingDef {
  id: string;
  name: string;
  cost: number;
  /** Research needed first: a known tech of at least this tier in the field. */
  requires?: [ResearchField, number];
  description: string;
  effects: BuildingEffects;
  wonder?: { empire: EmpireBonus };
}

export const BUILDINGS: readonly BuildingDef[] = [
  { id: "civic-forum", name: "Civic Forum", cost: 60, description: "A gathering place for art and debate. +2 culture.", effects: { culture: 2 } },
  { id: "hydroponic-farms", name: "Hydroponic Farms", cost: 80, requires: ["planetology", 2], description: "Stacked farms feed more people. +5 planet size.", effects: { pop: 5 } },
  { id: "research-institute", name: "Research Institute", cost: 120, requires: ["computers", 2], description: "+25% research from this colony, +1 culture.", effects: { research: 0.25, culture: 1 } },
  { id: "orbital-drydock", name: "Orbital Drydock", cost: 150, requires: ["propulsion", 4], description: "+30% ship building at this colony.", effects: { ships: 0.3 } },
  { id: "spaceport", name: "Spaceport", cost: 120, requires: ["propulsion", 2], description: "Traders flock here. 8% of this colony's output also goes to the treasury.", effects: { treasury: 0.08 } },
  { id: "automated-foundry", name: "Automated Foundry", cost: 200, requires: ["construction", 3], description: "+15% production at this colony.", effects: { production: 0.15 } },
  { id: "planetary-fortress", name: "Planetary Fortress", cost: 250, requires: ["forceFields", 2], description: "Adds 4 missile bases at once.", effects: { bases: 4 } },
  { id: "grand-theater", name: "Grand Theater", cost: 180, requires: ["planetology", 3], description: "Plays, songs and holo-epics. +5 culture.", effects: { culture: 5 } },
  { id: "arcology", name: "Arcology", cost: 400, requires: ["planetology", 5], description: "Vast city-towers. +15 planet size, +2 culture.", effects: { pop: 15, culture: 2 } },

  // Wonders: one per galaxy.
  { id: "w-archive", name: "Archive of Ten Thousand Suns", cost: 3750, requires: ["computers", 4], description: "Wonder. +15% research across your empire, +5 culture.",
    effects: { culture: 5 }, wonder: { empire: { research: 0.15 } } },
  { id: "w-forge", name: "Heartforge", cost: 4500, requires: ["construction", 4], description: "Wonder. +12% production across your empire, +3 culture.",
    effects: { culture: 3 }, wonder: { empire: { production: 0.12 } } },
  { id: "w-garden", name: "Garden of First Light", cost: 3500, requires: ["planetology", 3], description: "Wonder. +30% population growth everywhere, +6 culture.",
    effects: { culture: 6 }, wonder: { empire: { growth: 0.3 } } },
  { id: "w-embassy", name: "Hall of Many Voices", cost: 3000, requires: ["computers", 3], description: "Wonder. Every empire likes you more (+15), trade pays 25% more, +4 culture.",
    effects: { culture: 4 }, wonder: { empire: { relations: 15, trade: 0.25 } } },
  { id: "w-beacon", name: "Lantern of the Void", cost: 4000, requires: ["propulsion", 3], description: "Wonder. +2 light-years of fuel range for every ship, +3 culture.",
    effects: { culture: 3 }, wonder: { empire: { range: 2 } } },
  { id: "w-academy", name: "War College of Seven Fleets", cost: 5000, requires: ["weapons", 4], description: "Wonder. +1 attack for all your warships, +2 culture.",
    effects: { culture: 2 }, wonder: { empire: { attack: 1 } } },
  { id: "w-whisper", name: "Whispering Spire", cost: 3250, requires: ["computers", 3], description: "Wonder. Your spies are far better (+1 spying), +2 culture.",
    effects: { culture: 2 }, wonder: { empire: { spying: 1 } } },
  { id: "w-ascension", name: "Ascension Gate", cost: 30000, description: "Wonder and technology victory: a gate beyond the stars. Needs top-tier (10) tech in all six fields. Cannot be bought.",
    effects: { culture: 20 }, wonder: { empire: {} } },
  { id: "w-chorus", name: "Eternal Chorus", cost: 6250, requires: ["planetology", 5], description: "Wonder. +60% culture across your empire, +10 culture.",
    effects: { culture: 10 }, wonder: { empire: { culture: 0.6 } } },
];

export const BUILDING_BY_ID: ReadonlyMap<string, BuildingDef> = new Map(BUILDINGS.map((b) => [b.id, b]));

/** Culture needed for each golden age (each one is harder to reach). */
export const GOLDEN_AGE_AT: readonly number[] = [1000, 3000, 6500, 12000, 20000, 32000, 48000, 70000];
export const GOLDEN_AGE_TURNS = 10;
export const GOLDEN_AGE_BONUS: EmpireBonus = { production: 0.2, research: 0.1 };

// ---------- Leaders ----------

export type LeaderKind = "scientist" | "industrialist" | "admiral" | "spymaster" | "envoy" | "ecologist" | "navigator";

export const LEADER_KINDS: Record<LeaderKind, { title: string; perLevel: EmpireBonus; text: string }> = {
  scientist: { title: "Chief Scientist", perLevel: { research: 0.06 }, text: "research" },
  industrialist: { title: "Minister of Industry", perLevel: { production: 0.05 }, text: "production" },
  admiral: { title: "Grand Admiral", perLevel: { attack: 0.5 }, text: "warship attack" },
  spymaster: { title: "Spymaster", perLevel: { spying: 0.5 }, text: "spying" },
  envoy: { title: "High Envoy", perLevel: { relations: 6, trade: 0.1 }, text: "relations and trade" },
  ecologist: { title: "Chief Ecologist", perLevel: { growth: 0.1 }, text: "population growth" },
  navigator: { title: "Star Navigator", perLevel: { range: 0.75 }, text: "fuel range" },
};

export const MAX_LEADERS = 3;

/** Syllables for invented leader names. */
export const NAME_PARTS = {
  first: ["Ka", "Vel", "Or", "Tes", "Mir", "Dra", "Zun", "Ali", "Quen", "Ro", "Sa", "Ith", "Bren", "Cor", "Ny", "Ul", "Fae", "Ox", "Pell", "Ysa"],
  mid: ["", "", "ra", "lo", "vi", "an", "es", "or", "u", "ith"],
  last: ["n", "s", "x", "th", "ra", "mir", "dane", "vos", "el", "ka", "ris", "on"],
};
