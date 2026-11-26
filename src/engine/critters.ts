// Invasive critters: a light, comic chain (Gemini's data/critters.ts). Once per game,
// each empire's busiest outer colony buys a cute pet that multiplies. A new step comes
// every few turns; in steps 1-4 the third answer stops the critters for good, otherwise
// the chain runs to its end (step 6). No random draws: the turn comes from the seed
// and the empire.

import { CRITTER_CHAIN } from "./data/critters";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface CritterProgress {
  colonyStarId: Id;
  /** Steps shown so far. */
  shown: number;
  lastTurn: number;
  /** Stopped early, or ran to the end. */
  over: boolean;
}

export const CRITTER_EVENTS = CRITTER_CHAIN;
/** The answer that stops the chain, in steps 1-4. */
export const STOP_CHOICE = 2;
const STOPPABLE_STEPS = 4;
/** Turns between steps. */
export const STEP_GAP = 5;
const EARLIEST = 40;
const SPREAD = 120;

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** The turn the critters reach this empire. */
export function critterTurn(state: GameState, e: Empire): number {
  return EARLIEST + ((seedNumber(state) + e.id * 37) % SPREAD);
}

/** The busiest non-capital colony (a spaceport town), else the capital. */
function pickColony(state: GameState, e: Empire): Id | null {
  const mine = Object.values(state.colonies).filter((c) => c.empireId === e.id);
  const outer = mine.filter((c) => !c.isCapital).sort((a, b) => b.population - a.population || a.starId - b.starId);
  return outer[0]?.starId ?? mine[0]?.starId ?? null;
}

function show(state: GameState, e: Empire, prog: CritterProgress): void {
  // If the colony was lost, the critters went with it.
  if (state.colonies[prog.colonyStarId]?.empireId !== e.id) { prog.over = true; return; }
  const ev = CRITTER_CHAIN[prog.shown]!;
  const p: PendingEvent = { id: state.nextEventId++, empireId: e.id, eventId: ev.id, turn: state.turn, colonyStarId: prog.colonyStarId, starId: prog.colonyStarId, rivalId: null };
  state.pendingEvents.push(p);
  prog.shown++;
  prog.lastTurn = state.turn;
  if (prog.shown >= CRITTER_CHAIN.length) prog.over = true;
}

/** Once a turn. */
export function processCritters(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const all = (state.critters ??= {});
    let prog = all[e.id];
    if (!prog) {
      if (state.turn < critterTurn(state, e)) continue;
      const colony = pickColony(state, e);
      if (colony === null) continue;
      prog = all[e.id] = { colonyStarId: colony, shown: 0, lastTurn: -Infinity, over: false };
    }
    if (prog.over || state.turn - prog.lastTurn < STEP_GAP) continue;
    // Wait while the previous step (or any event) is still unanswered.
    if (state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    show(state, e, prog);
  }
}

/** Called when any event is answered: the stop answer in steps 1-4 ends the chain. */
export function noteCritterChoice(state: GameState, p: PendingEvent, choice: number): void {
  const step = CRITTER_CHAIN.findIndex((ev) => ev.id === p.eventId);
  if (step < 0 || step >= STOPPABLE_STEPS || choice !== STOP_CHOICE) return;
  const prog = state.critters?.[p.empireId];
  if (prog) prog.over = true;
}
