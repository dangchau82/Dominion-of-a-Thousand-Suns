// Race sagas: the data shape for the branching, replayable race stories (Danny's request,
// 2026-11-27: choices that fork the story and, past certain thresholds, change how the
// game ends; and a different story every new game). The writing is a Gemini job
// (docs/gemini-task-race-sagas.md); the engine that plays it (src/engine/sagas.ts) is
// Claude 2's.
//
// How a saga plays:
// - Four acts. Each act has 3 different BEATS per race; the game seed picks one, so two
//   games with the same race tell different stories.
// - Every choice moves the race's three SAGA SCORES (mercy, openness, tradition: each
//   -2..+2 per choice) and may set FLAGS.
// - BRANCH beats only play when a flag was set earlier (the forks), and some are locked out
//   by other flags.
// - At the end, the first ENDING whose thresholds the scores meet is the one that plays. Each
//   ending has an OUTCOME from a fixed list (below), which changes the endgame for real.
// - CROSSOVER beats play when two named races have met, so stories meet each other.

import type { EventChoice, GameEventDef } from "./events";
// Each race's saga lives in data/sagas/<raceId>.ts (type-only imports back to this file, so no cycle).
import * as humans from "./sagas/humans";
import * as vossari from "./sagas/vossari";
import * as kethrak from "./sagas/kethrak";
import * as ashkari from "./sagas/ashkari";
import * as lumen from "./sagas/lumen";

export type SagaScore = "mercy" | "openness" | "tradition";

/** What an ending does to the rest of the game. The engine implements exactly these. */
export type SagaOutcome =
  | "goldenAge"        // a long golden age begins at once
  | "civilWar"         // a third of our worlds break away as a rebel empire
  | "rivalBecomesAlly" // our worst enemy makes peace and joins us
  | "everyoneFearsUs"  // every empire's opinion of us drops, but none dares declare war for a while
  | "councilFavour"    // extra votes in the Galactic Council for the rest of the game
  | "greatWorkSurge"   // our great work is half-built at once
  | "legendFleet"      // a legendary fleet joins us
  | "exodus"           // our people found new worlds far away (new colonies), but the capital weakens
  | "ascension"        // big research boost in every field
  | "fallFromGrace";   // a dark ending: heavy losses, but a unique bonus (culture) afterwards

export interface SagaChoice extends EventChoice {
  /** How the choice moves the saga scores (-2..+2 each). */
  shift?: Partial<Record<SagaScore, number>>;
  /** Flags this choice sets, for later branch beats ("spared-the-heir", "burned-the-library"). */
  sets?: string[];
}

export interface SagaBeat extends Omit<GameEventDef, "choices" | "trigger"> {
  raceId: string;
  /** 1-4: the act. Act beats are picked one per act by the seed; branch beats need `needs`. */
  act: 1 | 2 | 3 | 4;
  kind: "act" | "branch" | "crossover";
  /** Branch: plays only if every one of these flags is set. */
  needs?: string[];
  /** Plays only if none of these flags is set. */
  blockedBy?: string[];
  /** Crossover: plays only once we have met this race. */
  withRace?: string;
  choices: SagaChoice[];
}

export interface SagaEnding extends Omit<GameEventDef, "trigger"> {
  raceId: string;
  /** All must hold. Leave out for the fallback ending (exactly one per race). */
  needs?: Partial<Record<SagaScore, { min?: number; max?: number }>>;
  /** Flags that must be set too (optional). */
  needsFlags?: string[];
  outcome: SagaOutcome;
}

const RACES = [humans, vossari, kethrak, ashkari, lumen];
export const SAGA_BEATS: SagaBeat[] = RACES.flatMap((r) => r.BEATS);
export const SAGA_ENDINGS: SagaEnding[] = RACES.flatMap((r) => r.ENDINGS);
