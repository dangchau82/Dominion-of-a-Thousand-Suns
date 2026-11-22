// Core game state. Everything is plain JSON: objects refer to each other by id,
// so a whole game can be saved, copied for AI simulation, or sent anywhere.

import type { RngState } from "./rng";

export type Id = number;

export type StarColor = "red" | "orange" | "yellow" | "blue" | "white" | "purple";

export type Climate =
  | "terran" | "jungle" | "ocean" | "arid" | "steppe" | "desert" | "minimal"
  | "barren" | "tundra" | "dead" | "inferno" | "toxic" | "radiated";

export type Minerals = "ultraPoor" | "poor" | "normal" | "rich" | "ultraRich";
export type Environment = "hostile" | "normal" | "fertile" | "gaia";

export interface Planet {
  climate: Climate;
  /** Base population capacity (MoO 1 "size"). */
  size: number;
  /** Extra capacity from terraforming. */
  terraform: number;
  minerals: Minerals;
  environment: Environment;
  /** Ruins, artifacts, natives, etc. (later stages). */
  special: string | null;
}

export interface Star {
  id: Id;
  name: string;
  x: number; // light-years
  y: number;
  color: StarColor;
  planet: Planet | null; // null = no habitable planet (asteroids / gas only)
  nebula: boolean;
}

export type Slider = "ship" | "defense" | "industry" | "ecology" | "research";
export const SLIDERS: readonly Slider[] = ["ship", "defense", "industry", "ecology", "research"];
export type SliderSet = Record<Slider, number>; // percentages, sum to 100

export interface Colony {
  starId: Id;
  empireId: Id;
  population: number;
  factories: number;
  sliders: SliderSet;
  locked: Record<Slider, boolean>;
  /** Ship template being built here, or null. */
  buildTemplate: string | null;
  shipProgress: number; // BC spent toward the current ship
  defenseProgress: number; // BC spent toward the next missile base
  missileBases: number;
  foundedTurn: number;
  isCapital: boolean;
}

export type ResearchField =
  | "computers" | "construction" | "forceFields" | "planetology" | "propulsion" | "weapons";
export const FIELDS: readonly ResearchField[] = [
  "computers", "construction", "forceFields", "planetology", "propulsion", "weapons",
];

export interface ResearchState {
  /** Share of research spending per field, percentages summing to 100. */
  alloc: Record<ResearchField, number>;
  /** Points accumulated toward the next level in each field. */
  progress: Record<ResearchField, number>;
  /** Current level in each field (starts at 1). Stage 2 replaces this with a real tech tree. */
  level: Record<ResearchField, number>;
}

/** What one empire knows about one star. The AI only ever sees this. */
export interface StarKnowledge {
  explored: boolean;
  /** Turn this information was last updated; older reports are stale. */
  lastSeen: number;
  planet: Planet | null;
  ownerId: Id | null;
  population: number | null;
}

export interface Empire {
  id: Id;
  name: string;
  raceId: string;
  color: string;
  isPlayer: boolean;
  alive: boolean;
  capitalStarId: Id;
  treasury: number;
  research: ResearchState;
  knowledge: Record<Id, StarKnowledge>;
  /** Other empires this one has met. */
  contacts: Id[];
}

export interface Fleet {
  id: Id;
  empireId: Id;
  /** Ship template id -> count. */
  ships: Record<string, number>;
  x: number;
  y: number;
  /** Star the fleet is orbiting, or null while travelling. */
  starId: Id | null;
  destStarId: Id | null;
}

export type GalaxySize = "small" | "medium" | "large" | "huge";
export type GalaxyShape = "ellipse" | "spiral" | "rectangle" | "ring";

export interface GameSettings {
  seed: number;
  size: GalaxySize;
  shape: GalaxyShape;
  rivals: number;
  playerRaceId: string;
  playerName: string;
}

export interface GameEvent {
  turn: number;
  /** Who can see it; null = everyone. */
  empireId: Id | null;
  kind:
    | "explored" | "colonized" | "shipBuilt" | "research" | "growth" | "contact"
    | "baseBuilt" | "factoriesDone" | "popMaxed" | "arrived" | "info";
  text: string;
  starId?: Id;
}

export interface GameState {
  version: number;
  turn: number;
  settings: GameSettings;
  rng: RngState;
  stars: Star[];
  empires: Empire[];
  /** One colony per star (one planet per star). Keyed by star id. */
  colonies: Record<Id, Colony>;
  fleets: Fleet[];
  nextFleetId: Id;
  /** Events from the most recent turn. */
  events: GameEvent[];
  /** Set once the player uses the cheat menu; shown in the save list. */
  cheated?: boolean;
  /** Player cheat switches. */
  cheats?: {
    /** AI empires give no orders until this turn (their worlds still grow). */
    rivalsAsleepUntil?: number;
    /** Player's ships and planets can't be destroyed (takes effect when combat arrives). */
    godMode?: boolean;
  };
}

export const SAVE_VERSION = 1;
