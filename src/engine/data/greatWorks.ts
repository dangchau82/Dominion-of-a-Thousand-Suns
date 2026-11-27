// Great works for the endgame paths (written by Claude 2, from Danny's design via the main
// Claude's handoff). Three path works (Feared, Beloved, Builder) and one work per race.
// Names and text are original. Numbers are a first cut for the main Claude to tune.

import type { ResearchField } from "../types";

export type EndgamePath = "feared" | "beloved" | "builder";

export type WorkEffect =
  | { kind: "money"; perTurn: number }
  /** BC a turn for every other living empire we have met (a cut of the galaxy's trade). */
  | { kind: "tradeCut"; perContact: number }
  | { kind: "research"; field: ResearchField; perTurn: number }
  /** A share of the empire's total production, paid as BC and as computers research. */
  | { kind: "energy"; share: number }
  | { kind: "culture"; perTurn: number }
  /** Extra council votes, as a share of the empire's own. */
  | { kind: "votes"; share: number }
  /** Every 10 turns, relations with every empire we have met improve by this much. */
  | { kind: "goodwill"; per10: number }
  /** Every `every` turns, `count` of our newest warship appear at the capital. */
  | { kind: "hatch"; count: number; every: number }
  /** The world-cracker: travels with our main fleet and can destroy an enemy world. */
  | { kind: "cracker" };

export interface GreatWorkDef {
  id: string;
  name: string;
  /** The path it belongs to, or the race that alone can build it. */
  path?: EndgamePath;
  raceId?: string;
  text: string;
  down: number;
  upkeep: number;
  turns: number;
  effects: WorkEffect[];
}

const PATH_COST = { down: 500, upkeep: 40, turns: 40 };
const RACE_COST = { down: 450, upkeep: 35, turns: 40 };

export const PATH_WORKS: GreatWorkDef[] = [
  { id: "gw-sundering-engine", name: "Sundering Engine", path: "feared", ...PATH_COST,
    text: "A battle station the size of a moon, built around a single weapon that can split a world's crust. It travels with our strongest fleet. Every empire will turn on us once it is finished.",
    effects: [{ kind: "cracker" }] },
  { id: "gw-worldship", name: "Worldship Concordance", path: "beloved", ...PATH_COST,
    text: "A city-ark carrying millions, our embassies and our archives, sailing from ally to ally. It gives us a louder voice in the Council and warms every court it visits.",
    effects: [{ kind: "votes", share: 0.3 }, { kind: "goodwill", per10: 6 }] },
  { id: "gw-dyson-shell", name: "Dyson Shell", path: "builder", ...PATH_COST,
    text: "A lattice of collectors wrapped around our home star, drinking its light. Endless energy for our yards and laboratories, and a target no one can miss.",
    effects: [{ kind: "energy", share: 0.2 }] },
];

export const RACE_WORKS: GreatWorkDef[] = [
  { id: "gw-concord-spire", name: "Concord Spire", raceId: "humans", ...RACE_COST, text: "A tower of embassies where every voice in the galaxy has a seat, and ours is the loudest.", effects: [{ kind: "votes", share: 0.2 }, { kind: "goodwill", per10: 4 }] },
  { id: "gw-deep-archive", name: "Deep Archive", raceId: "vossari", ...RACE_COST, text: "Every fact the Vossari have ever measured, cross-checked by a billion patient instruments.", effects: [{ kind: "research", field: "computers", perTurn: 45 }] },
  { id: "gw-brood-moon", name: "Brood Moon", raceId: "kethrak", ...RACE_COST, text: "A hollowed moon full of hatching chambers. Every few years, a new swarm of warships crawls out.", effects: [{ kind: "hatch", count: 3, every: 15 }] },
  { id: "gw-war-forge", name: "War Forge of the Dominion", raceId: "ashkari", ...RACE_COST, text: "A foundry-world where every Ashkari smith works on one thing: better ways to win.", effects: [{ kind: "research", field: "weapons", perTurn: 45 }] },
  { id: "gw-choir-lattice", name: "Choir Lattice", raceId: "lumen", ...RACE_COST, text: "A web of minds singing across the stars; those who hear it remember it for ever.", effects: [{ kind: "culture", perTurn: 8 }, { kind: "goodwill", per10: 3 }] },
  { id: "gw-mountain-heart", name: "Mountain Heart", raceId: "thraal", ...RACE_COST, text: "A planet's core opened like a fruit. The Thraal eat the rock; the empire eats the metal.", effects: [{ kind: "money", perTurn: 50 }] },
  { id: "gw-skyward-aerie", name: "Skyward Aerie", raceId: "seraphine", ...RACE_COST, text: "An orbital nest where pilots are born in zero gravity and fly before they walk.", effects: [{ kind: "research", field: "propulsion", perTurn: 45 }] },
  { id: "gw-grand-exchange", name: "Grand Exchange", raceId: "orrun", ...RACE_COST, text: "Every trade in the galaxy passes through Orrun ledgers sooner or later, and pays a small fee.", effects: [{ kind: "tradeCut", perContact: 8 }] },
  { id: "gw-thinking-ring", name: "Thinking Ring", raceId: "nyx", ...RACE_COST, text: "A ring of processors around a gas giant, one mind spread across a hundred thousand kilometres.", effects: [{ kind: "research", field: "computers", perTurn: 30 }, { kind: "research", field: "construction", perTurn: 20 }] },
  { id: "gw-veil-sanctum", name: "Veil Sanctum", raceId: "velari", ...RACE_COST, text: "A temple that exists a little bit in another place. Pilgrims come back changed.", effects: [{ kind: "culture", perTurn: 10 }] },
  { id: "gw-abyssal-spire", name: "Abyssal Spire", raceId: "drovani", ...RACE_COST, text: "A tower rising from the deepest trench to orbit; under its shields every ocean world becomes a fortress.", effects: [{ kind: "research", field: "forceFields", perTurn: 45 }] },
  { id: "gw-wandering-hearth", name: "Wandering Hearth", raceId: "gorrath", ...RACE_COST, text: "A clan-ship the size of a city that never stops moving, raising a new war-band at every camp.", effects: [{ kind: "hatch", count: 2, every: 15 }, { kind: "money", perTurn: 15 }] },
  { id: "gw-bond-garden", name: "Bond Garden", raceId: "ixil", ...RACE_COST, text: "Living gardens grown on other empires' worlds as gifts. Nobody quite notices them taking root.", effects: [{ kind: "goodwill", per10: 6 }, { kind: "culture", perTurn: 4 }] },
  { id: "gw-world-tree", name: "World-Tree", raceId: "verdane", ...RACE_COST, text: "One tree, rooted through a planet and reaching into orbit, whose seeds carry Verdane life to every world.", effects: [{ kind: "research", field: "planetology", perTurn: 45 }] },
  { id: "gw-star-lattice", name: "Star Lattice", raceId: "quorai", ...RACE_COST, text: "Threads of light strung between nearby suns; the Quorai drink from all of them at once.", effects: [{ kind: "money", perTurn: 40 }, { kind: "research", field: "computers", perTurn: 15 }] },
  { id: "gw-scrap-moon", name: "Scrap Moon", raceId: "raxxan", ...RACE_COST, text: "A moon built from a thousand wrecks, still growing. Every few years it spits out ships that are almost new.", effects: [{ kind: "hatch", count: 2, every: 12 }] },
  { id: "gw-endless-warrens", name: "Endless Warrens", raceId: "ruuvak", ...RACE_COST, text: "Tunnels under every world, full of cousins who all turn up to vote.", effects: [{ kind: "votes", share: 0.25 }] },
  { id: "gw-hunters-moon", name: "Hunter's Moon", raceId: "tarkhan", ...RACE_COST, text: "A moon hollowed into a gunnery school; its graduates fly out with ships of their own.", effects: [{ kind: "hatch", count: 2, every: 15 }, { kind: "research", field: "weapons", perTurn: 15 }] },
];

export const ALL_WORKS = [...PATH_WORKS, ...RACE_WORKS];
export const WORK_BY_ID = new Map(ALL_WORKS.map((w) => [w.id, w]));
export const PATH_NAMES: Record<EndgamePath, string> = { feared: "the Feared", beloved: "the Beloved", builder: "the Builder" };
