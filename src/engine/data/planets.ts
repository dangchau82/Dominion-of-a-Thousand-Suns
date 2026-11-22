// Planet and star tables.
// Adapted from Remnants of the Precursors (GPL-3.0), which takes them from the
// classic game's official strategy guide tables. Climate names are generic terms.

import type { Climate, StarColor } from "../types";

export interface ClimateInfo {
  name: string;
  /** 0 = ideal, 12 = deadliest. Colonizing needs enough Planetology. */
  hostility: number;
  minSize: number;
  maxSize: number;
}

export const CLIMATES: Record<Climate, ClimateInfo> = {
  terran:   { name: "Terran",   hostility: 0,  minSize: 85, maxSize: 100 },
  jungle:   { name: "Jungle",   hostility: 1,  minSize: 75, maxSize: 90 },
  ocean:    { name: "Ocean",    hostility: 2,  minSize: 65, maxSize: 80 },
  arid:     { name: "Arid",     hostility: 3,  minSize: 55, maxSize: 70 },
  steppe:   { name: "Steppe",   hostility: 4,  minSize: 45, maxSize: 60 },
  desert:   { name: "Desert",   hostility: 5,  minSize: 35, maxSize: 55 },
  minimal:  { name: "Minimal",  hostility: 6,  minSize: 30, maxSize: 50 },
  barren:   { name: "Barren",   hostility: 7,  minSize: 30, maxSize: 55 },
  tundra:   { name: "Tundra",   hostility: 8,  minSize: 20, maxSize: 50 },
  dead:     { name: "Dead",     hostility: 9,  minSize: 20, maxSize: 50 },
  inferno:  { name: "Inferno",  hostility: 10, minSize: 10, maxSize: 40 },
  toxic:    { name: "Toxic",    hostility: 11, minSize: 10, maxSize: 40 },
  radiated: { name: "Radiated", hostility: 12, minSize: 10, maxSize: 40 },
};

/** Climates with hostility at or above this count as hostile (half growth). */
export const HOSTILE_FROM = 7;

/** Order used by the cumulative tables below ("none" = no habitable planet). */
export const PLANET_ORDER: readonly (Climate | "none")[] = [
  "none", "radiated", "toxic", "inferno", "dead", "tundra", "barren", "minimal",
  "desert", "steppe", "arid", "ocean", "jungle", "terran",
];

/** Cumulative chance of each entry in PLANET_ORDER, per star color. */
export const PLANET_ODDS: Record<StarColor, readonly number[]> = {
  red:    [.05, .10, .15, .20, .25, .30, .35, .40, .50, .60, .75, .85, .95, 1.0],
  orange: [.05, .10, .15, .20, .25, .30, .35, .40, .45, .55, .65, .75, .85, 1.0],
  yellow: [.00, .00, .00, .05, .05, .10, .15, .20, .25, .30, .40, .50, .60, 1.0],
  blue:   [.15, .25, .35, .45, .55, .65, .75, .85, .90, .95, 1.0, 1.0, 1.0, 1.0],
  white:  [.10, .15, .25, .35, .45, .55, .65, .75, .85, .90, .95, 1.0, 1.0, 1.0],
  purple: [.20, .45, .60, .75, .85, .90, .95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
};

/** Cumulative star color odds: red, orange, yellow, blue, white, purple. */
export const STAR_ORDER: readonly StarColor[] = ["red", "orange", "yellow", "blue", "white", "purple"];
export const STAR_ODDS = [0.30, 0.55, 0.70, 0.85, 0.95, 1.0] as const;

/** [ultra-poor threshold, poor threshold] by star color. Purple stars are never poor. */
export const POOR_ODDS: Record<StarColor, readonly [number, number]> = {
  blue: [0.025, 0.10], white: [0.025, 0.10], yellow: [0.025, 0.10],
  red: [0.06, 0.20], orange: [0.135, 0.30], purple: [0, 0],
};

/**
 * [ultra-rich threshold, rich threshold] by star group and climate.
 * Harsh worlds are far more often mineral-rich.
 */
type RichTable = Partial<Record<Climate, readonly [number, number]>>;
const RICH_COMMON: RichTable = {
  radiated: [.2625, .35], toxic: [.225, .30], inferno: [.1875, .25], dead: [.15, .20],
  tundra: [.1125, .15], barren: [.075, .10], minimal: [.0375, .05],
};
const RICH_BLUE: RichTable = {
  radiated: [.2925, .45], toxic: [.26, .40], inferno: [.2275, .35], dead: [.195, .30],
  tundra: [.1625, .25], barren: [.13, .20], minimal: [.0975, .15], desert: [.065, .10],
  steppe: [.0325, .05],
};
const RICH_PURPLE: RichTable = {
  radiated: [.30, .60], toxic: [.275, .55], inferno: [.25, .50], dead: [.225, .45],
  tundra: [.20, .40], barren: [.175, .35], minimal: [.15, .30],
};
export const RICH_ODDS: Record<StarColor, RichTable> = {
  red: RICH_COMMON, orange: RICH_COMMON, yellow: RICH_COMMON, white: RICH_COMMON,
  blue: RICH_BLUE, purple: RICH_PURPLE,
};

/** Production multiplier from minerals. */
export const MINERAL_MOD = { ultraPoor: 1 / 3, poor: 0.5, normal: 1, rich: 2, ultraRich: 3 } as const;

export const STAR_NAMES: readonly string[] = [
  "Aurelis", "Brannoc", "Cetrine", "Dovaris", "Eskelon", "Faradyne", "Galvos", "Hesperon",
  "Ishtava", "Jorvane", "Kestrel", "Lumara", "Mordrake", "Nyssa", "Ostravel", "Pyrrhus",
  "Quillon", "Rhosk", "Sabran", "Tethys", "Ulvaren", "Vespera", "Wyndral", "Xanthe",
  "Yselde", "Zarrow", "Abraxa", "Belleros", "Corvane", "Delphis", "Erebon", "Fenwyr",
  "Gorrah", "Halcyra", "Ivrel", "Jasperra", "Kaldor", "Lysander", "Maelis", "Nerith",
  "Orrin", "Pellucid", "Quorra", "Rhydian", "Solenne", "Tarsis", "Umbriel", "Valtaris",
  "Wexford", "Xyris", "Yarrow", "Zephyrine", "Astraeon", "Brisk", "Calyx", "Draxis",
  "Elara", "Fornax", "Gideon", "Helios", "Ilyra", "Juno", "Kepler", "Lirae", "Mizar",
  "Naos", "Oberon", "Phaedra", "Quasar", "Rigel", "Sirona", "Talon", "Ursae", "Vega",
  "Wolcott", "Xerxa", "Yuna", "Zenith", "Aldra", "Bastion", "Cinder", "Dusk", "Ember",
  "Fable", "Glimmer", "Haven", "Iris", "Jade", "Kindle", "Lantern", "Marrow", "Nimbus",
  "Onyx", "Pyre", "Quill", "Rune", "Saffron", "Thorne", "Umber", "Vale", "Wisp", "Yew",
];
