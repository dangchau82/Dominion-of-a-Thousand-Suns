import type { LeaderKind } from "./data/buildings";
import type { ShipDesign } from "./data/ships";
// Core game state. Everything is plain JSON: objects refer to each other by id,
// so a whole game can be saved, copied for AI simulation, or sent anywhere.

import type { RngState } from "./rng";
import type { Fate } from "./prophecy";
import type { ActiveResolution, ResolutionSession } from "./resolutions";

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
  /** Finished buildings (ids from data/buildings). */
  buildings: string[];
  /** Building under construction, or null. */
  buildQueue: string | null;
  buildProgress: number;
  /** Unrest 0 (calm) .. 100 (revolt). See src/engine/unrest.ts. Unset = 0 (older saves). */
  unrest?: number;
  /** Unrest stirred up by enemy agents; fades 10% a turn. */
  agitation?: number;
  /** Race of the people living here when it differs from the owner's (a conquered world). */
  peopleRaceId?: string;
  /** Empire this occupied world was taken from; it rejoins them if it revolts while they live. */
  occupiedFrom?: Id;
  /** Turn the occupation began. */
  occupiedSince?: number;
  /** Enemy-funded rebels: revolts are twice as likely until this turn. */
  rebelsFundedUntil?: number;
  /** A prison colony (see src/engine/prison.ts): more output, more unrest, breakouts. */
  prison?: boolean;
  /** The player's "hands off" mark: the autopilot never changes this colony. */
  handsOff?: boolean;
  /** An imperial edict in force here until a turn (see src/engine/decrees.ts). */
  edict?: { id: string; until: number };
  /** Turn each edict can be issued here again. */
  edictReady?: Record<string, number>;
}

export type ResearchField =
  | "computers" | "construction" | "forceFields" | "planetology" | "propulsion" | "weapons";
export const FIELDS: readonly ResearchField[] = [
  "computers", "construction", "forceFields", "planetology", "propulsion", "weapons",
];

export interface ResearchState {
  /** Share of research spending per field, percentages summing to 100. */
  alloc: Record<ResearchField, number>;
  /** Points accumulated toward the current project in each field. */
  progress: Record<ResearchField, number>;
  /** Tech ids this empire knows. */
  known: string[];
  /** Tech ids in this empire's tree (rolled at game start); others must be traded or stolen. */
  available: string[];
  /** Tech being researched in each field (null when the field is finished). */
  current: Record<ResearchField, string | null>;
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

export const AUTOPILOT_FOCI = ["balanced", "warlike", "industrial", "expansion", "science", "spies"] as const;
/** Parts of the empire the player's autopilot may run. The player can take any of them back (see src/ai/handsOff.ts). */
export const AUTO_AREAS = ["colonies", "research", "fleets", "diplomacy", "empire"] as const;
export type AutoArea = (typeof AUTO_AREAS)[number];
export type AutopilotFocus = (typeof AUTOPILOT_FOCI)[number];

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
  /** Empires this one is at war with -> turn the war began. */
  atWar: Record<Id, number>;
  /** Empires that have offered this one peace (accept by offering back). */
  peaceOffers: Id[];
  /** How this empire feels about each other empire, -100 (hatred) to 100 (devotion). */
  relations: Record<Id, number>;
  /** Treaties with each empire -> turn signed. */
  treaties: Record<Id, Partial<Record<TreatyKind, number>>>;
  /** Spy networks this empire runs against others. */
  spies: Record<Id, SpyNetwork>;
  /** Percent of total production spent on internal security (0-10). */
  security: number;
  /** Culture points earned so far. */
  culture: number;
  /** Golden ages reached so far. */
  goldenAges: number;
  /** A golden age runs until this turn. */
  goldenAgeUntil: number;
  goldenAge: boolean;
  /** Wonders this empire holds. */
  wonders: string[];
  leaders: Leader[];
  /** A leader offering to serve, until offerUntil. */
  leaderOffer: Leader | null;
  /** Recent random events (so they don't repeat too soon). */
  recentEvents?: string[];
  /** What the AI concentrates on when it runs this empire (rivals, or the player's autopilot). */
  focus?: AutopilotFocus;
  /** Intelligence warnings already given ("fleetId:starId" -> turn), so each comes once. See src/engine/intel.ts. */
  intelWarned?: Record<string, number>;
  /** What this empire holds against others (see src/engine/grudges.ts). */
  grudges?: Record<Id, import("./grudges").Grudge>;
  /** Areas the player has taken back from the autopilot: it leaves them exactly as the player set them. */
  autoOff?: AutoArea[];
  /** Player option: idle scouts explore on their own each turn. */
  autoExplore?: boolean;
  /** Last turn this empire warned another empire about nearby colonies. */
  borderWarned?: Record<Id, number>;
  /** Goodwill received from each giver's gifts in the current 10-turn window (see giveGift). */
  giftWarmth?: Record<Id, { since: number; used: number }>;
  /** Which AI runs this empire (rivals, or the player's autopilot). Unset = from difficulty. */
  ai?: AiBrain;
  /** Treasury projects (money sinks): turn each can be bought again. */
  sinkReady?: Record<string, number>;
  /** Trade bonds waiting to pay out. */
  bonds?: { sinkId: string; amount: number; matures: number }[];
  /** Extra council votes from lobbying, until a turn. */
  councilBoost?: { votes: number; until: number };
  /** Prophecies this empire has heard (last 20), and how they turned out. */
  prophecies?: { turn: number; kind: string; text: string; due: number; starId: Id | null; outcome: "waiting" | "fulfilled" | "averted" }[];
  /** Council resolutions that cover this empire, until a turn (see src/engine/resolutions.ts). */
  resolutionBonuses?: { id: string; until: number }[];
  /** Imperial proclamations in force (see src/engine/decrees.ts). */
  proclamations?: { id: string; until: number }[];
  /** Turn each proclamation can be made again. */
  proclamationReady?: Record<string, number>;
  /** Rebel empires: the empire they broke away from in a civil war. */
  rebelOf?: Id;
  /** This race's own story (see src/engine/storylines.ts): chapters played, the chapter 3 fork, when the last one came. */
  story?: { played: string[]; fork?: "A" | "B"; lastTurn: number };
}

export interface Leader {
  id: number;
  name: string;
  kind: LeaderKind;
  level: number;
  /** BC to hire. */
  cost: number;
  /** BC per turn. */
  salary: number;
  offerUntil: number;
  /** Personality trait id from LEADER_TRAITS (leaders from before save version 11 have none). */
  trait?: string;
  /** Turn they entered service (see src/engine/leaderLives.ts). */
  hiredTurn?: number;
}

export interface PendingEvent {
  id: number;
  empireId: Id;
  eventId: string;
  turn: number;
  colonyStarId: Id | null;
  starId: Id | null;
  rivalId: Id | null;
}

export type VictoryKind = "conquest" | "council" | "culture" | "technology";
export interface Winner {
  empireId: Id;
  kind: VictoryKind;
  turn: number;
  /** The player won after refusing an earlier rival victory ("Fight on"). */
  comeback?: boolean;
}

export interface CouncilSession {
  turn: number;
  candidates: [Id, Id];
  /** Voter -> candidate, or null to abstain. Missing = hasn't voted yet. */
  votes: Record<Id, Id | null>;
  /** Votes each empire holds this session. */
  weight: Record<Id, number>;
}
export interface CouncilState {
  nextTurn: number;
  session: CouncilSession | null;
  /** An AI empire was elected; the player must accept (lose) or defy (war with everyone). */
  awaitingVerdict: Id | null;
  /** The player defied the council. */
  defied: boolean;
}

export type TreatyKind = "trade" | "research" | "nap" | "alliance";
export const TREATIES: readonly TreatyKind[] = ["trade", "research", "nap", "alliance"];

export type SpyMission = "steal" | "sabotage" | "watch" | "inciteUnrest" | "fundRebels" | "spreadPropaganda";
export const SPY_MISSIONS: readonly SpyMission[] = ["watch", "steal", "sabotage", "inciteUnrest", "fundRebels", "spreadPropaganda"];
export interface SpyNetwork {
  /** Percent of total production spent on spies against this empire (0-10). */
  alloc: number;
  mission: SpyMission;
  /** BC saved toward the next agent. */
  progress: number;
  agents: number;
}

export type ProposalKind = "trade" | "research" | "nap" | "alliance" | "techSwap" | "tribute" | "joinWar" | "cede";
export interface Proposal {
  id: number;
  from: Id;
  to: Id;
  kind: ProposalKind;
  /** techSwap: tech the proposer gives. */
  offerTech?: string;
  /** techSwap / tribute: tech the proposer wants. */
  wantTech?: string;
  /** tribute: BC wanted. */
  bc?: number;
  /** joinWar: empire to fight. */
  targetId?: Id;
  /** cede (peace terms): the responder's colonies handed to the proposer in exchange for peace. */
  stars?: Id[];
  turn: number;
  /** What the proposer says, filled in for AI proposers. */
  says?: string;
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
  /** How hard the AI plays. It never cheats at any level; harder AIs plan and fight more seriously. */
  difficulty?: Difficulty;
}

/** "master": rivals are run by the Master AI (src/ai/masterAI.ts). Still no bonuses of any kind. */
export type Difficulty = "relaxed" | "normal" | "hard" | "master";

/** Which AI runs an empire. Unset = decided by difficulty ("master" difficulty -> master, else basic). */
export type AiBrain = "basic" | "master";

export interface GameEvent {
  turn: number;
  /** Who can see it; null = everyone. */
  empireId: Id | null;
  kind:
    | "explored" | "colonized" | "shipBuilt" | "research" | "growth" | "contact"
    | "baseBuilt" | "factoriesDone" | "popMaxed" | "arrived" | "info" | "battle" | "war" | "invasion"
    | "diplomacy" | "spy" | "culture" | "council" | "unrest"
    /** Big story moments for the galaxy's history page (supernova, crusade, lairs, ...). */
    | "saga";
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
  /** Every empire's own ship designs, keyed by design id (built-ins live in data/ships). */
  designs: Record<string, ShipDesign>;
  nextDesignId: number;
  /** Wonders built so far: wonder id -> who holds it and where. */
  wonders: Record<string, { empireId: Id; starId: Id; turn: number }>;
  nextLeaderId: number;
  /** The Galactic Council: when it next meets, and the session in progress. */
  council: CouncilState;
  /** Set when someone has won; the player may keep playing afterwards. */
  winner: Winner | null;
  /** Galactic firsts won so far (first id -> who and when). See src/engine/firsts.ts. */
  firsts?: Record<string, { empireId: Id; turn: number }>;
  /** The home star each starting empire began on (index = empire id). Conquest victory counts these. */
  homeStars?: Id[];
  /** Most home worlds each empire has been announced as holding (so the warning is given once). */
  homeWarned?: Record<Id, number>;
  keepPlaying?: boolean;
  /** A rival's win the player refused to accept ("Fight on"). Only the player can win from then on. */
  rivalWin?: Winner | null;
  /** Council resolution being voted on, and those in force. See src/engine/resolutions.ts. */
  resolutionSession?: ResolutionSession | null;
  activeResolutions?: ActiveResolution[];
  /** Fates decided ahead of time (prophecies come true). See src/engine/prophecy.ts. */
  fates?: Fate[];
  /** Dying and dead stars (the supernova crisis). See src/engine/supernova.ts. */
  supernovae?: import("./supernova").SupernovaState[];
  /** Neutral lairs on the map (guarded prizes). See src/engine/lairs.ts. */
  lairs?: import("./lairs").LairState[];
  /** The Crusade of the Candescent Fold, once it has arrived. See src/engine/crusade.ts. */
  crusade?: import("./crusade").CrusadeState;
  /** Each empire's run-in with the invasive critters. See src/engine/critters.ts. */
  critters?: Record<Id, import("./critters").CritterProgress>;
  /** The alien infestation, once it has begun. See src/engine/infestation.ts. */
  infestation?: import("./infestation").InfestationState;
  /** Each empire's frontier jobs. See src/engine/contracts.ts. */
  contracts?: Record<Id, import("./contracts").ContractProgress>;
  /** Death worlds marked on the map, and who has been warned. See src/engine/deathWorlds.ts. */
  deathWorlds?: import("./deathWorlds").DeathWorldsState;
  /** Android leader offers made so far. See src/engine/legends.ts. */
  synthetics?: import("./legends").SyntheticsState;
  /** Native peoples on the map and who has met them. See src/engine/natives.ts. */
  natives?: import("./natives").NativesState;
  /** Each empire's expeditions so far. See src/engine/expeditions.ts. */
  expeditions?: Record<Id, import("./expeditions").ExpeditionProgress>;
  /** The twelve minor races: their worlds, who they like, who absorbed them. See src/engine/minorRaces.ts. */
  minorRaces?: import("./minorRaces").MinorRacesState;
  /** Ancient gates and the fleets hidden in them. See src/engine/gates.ts. */
  gates?: import("./gates").GatesState;
  /** Each empire's run through Project Hushfall. See src/engine/secrets.ts. */
  secrets?: Record<Id, import("./chains").ChainProgress>;
  /** The raider horde from the edge, once it has come. See src/engine/raiders.ts. */
  raiders?: import("./raiders").RaidersState;
  /** Random events waiting for their empire's choice. */
  pendingEvents: PendingEvent[];
  nextEventId: number;
  /** Diplomatic proposals waiting for an answer. */
  proposals: Proposal[];
  nextProposalId: number;
  /** Events from the most recent turn. */
  events: GameEvent[];
  /** Turn-by-turn record of the game (see chronicle.ts). Older saves start without one. */
  chronicle?: import("./chronicle").Chronicle;
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

export const SAVE_VERSION = 26;
