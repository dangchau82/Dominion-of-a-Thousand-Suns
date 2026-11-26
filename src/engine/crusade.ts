// The Crusade: the Candescent Fold, a peaceful faith from beyond the rim, arrives in the
// late game. Every empire lives through Gemini's 10-event chain (data/crusade.ts): its
// fourth answer picks a branch (resist / embrace / bargain) and the Prophet comes last.
// While the chain runs, the Fold's pilgrims stir quiet unrest on colonies (the main
// Claude's unrest rules in unrest.ts do the rest): strong culture, a golden age or
// internal security keep them out. No random draws.

import { CRUSADE, CRUSADE_CHAIN } from "./data/crusade";
import { colonyEffects, empireBonus } from "./civ";
import { nextInChain, noteChainAnswer, showChainEvent, type ChainProgress } from "./chains";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface CrusadeState {
  startTurn: number;
  /** Each empire's progress through the chain. */
  empires: Record<Id, ChainProgress>;
}

export const CRUSADE_EVENTS = CRUSADE_CHAIN;
/** The Fold arrives on a seed-based turn in this window. */
const EARLIEST = 170;
const SPREAD = 50;
/** Turns between two events of the chain for one empire. */
export const CHAIN_GAP = 8;
/** Pilgrim pressure (unrest a turn) on a colony before any defence. */
export const PRESSURE = 1.5;
/** Culture per turn that cancels one point of pressure. */
export const CULTURE_PER_POINT = 10;
/** Pressure cancelled per point of internal security spending (0-10). */
export const SECURITY_PER_POINT = 0.1;
/** The pressure stops this long after the Fold arrives, even if the chain is unanswered. */
export const PRESSURE_TURNS = 80;

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function crusadeTurn(state: GameState): number {
  return EARLIEST + (seedNumber(state) % SPREAD);
}

/** Culture this empire makes a turn (the same sum civ.ts uses). */
export function cultureRate(state: GameState, e: Empire): number {
  let c = 0;
  for (const col of Object.values(state.colonies)) {
    if (col.empireId === e.id) c += colonyEffects(col).culture + col.population * 0.005;
  }
  return c * (1 + empireBonus(e).culture);
}

/** Unrest the Fold adds to each of this empire's colonies a turn (0 when defended). */
export function pilgrimPressure(state: GameState, e: Empire): number {
  if (e.goldenAge) return 0;
  return Math.max(0, PRESSURE - cultureRate(state, e) / CULTURE_PER_POINT - e.security * SECURITY_PER_POINT);
}

function pickRival(state: GameState, e: Empire): Id | null {
  const c = e.contacts.filter((id) => state.empires[id]!.alive).sort((a, b) => (e.relations[a] ?? 0) - (e.relations[b] ?? 0) || a - b);
  return c[0] ?? null;
}

/** The colony an event is about: the least cultured non-capital world (pilgrims go where culture is thin). */
function pickColony(state: GameState, e: Empire): Id | null {
  const mine = Object.values(state.colonies).filter((c) => c.empireId === e.id);
  const outer = mine.filter((c) => !c.isCapital).sort((a, b) => colonyEffects(a).culture - colonyEffects(b).culture || a.starId - b.starId);
  return outer[0]?.starId ?? (state.colonies[e.capitalStarId]?.empireId === e.id ? e.capitalStarId : mine[0]?.starId ?? null);
}

/** Once a turn. */
export function processCrusade(state: GameState): void {
  if (!state.crusade) {
    if (state.turn < crusadeTurn(state)) return;
    state.crusade = { startTurn: state.turn, empires: {} };
    state.events.push({ turn: state.turn, empireId: null, kind: "saga",
      text: `${CRUSADE.name} arrived from beyond the rim: unarmed sail-barques whose ${CRUSADE.preachers} preach an end to all wars.` });
  }
  const cr = state.crusade;
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const prog = (cr.empires[e.id] ??= { done: [], lastTurn: -Infinity });
    // The chain: one event at a time, spaced out, never on top of another open event.
    if (!prog.finished && state.turn - prog.lastTurn >= CHAIN_GAP && !state.pendingEvents.some((p) => p.empireId === e.id)) {
      const ev = nextInChain(CRUSADE_CHAIN, prog);
      const colony = pickColony(state, e);
      if (ev && colony !== null) showChainEvent(state, e, ev, prog, { colonyStarId: colony, starId: colony, rivalId: pickRival(state, e) });
    }
    // The quiet tide: unrest on outer colonies until this empire's chain ends.
    if (prog.finished || state.turn - cr.startTurn >= PRESSURE_TURNS || prog.done.length < 2) continue;
    const p = pilgrimPressure(state, e);
    if (p <= 0) continue;
    for (const c of Object.values(state.colonies)) {
      if (c.empireId === e.id && !c.isCapital) c.unrest = Math.min(100, (c.unrest ?? 0) + p);
    }
  }
}

/** Called when any event is answered. */
export function noteCrusadeChoice(state: GameState, p: PendingEvent, choice: number): void {
  const prog = state.crusade?.empires[p.empireId];
  if (!prog || !CRUSADE_CHAIN.some((e) => e.id === p.eventId)) return;
  noteChainAnswer(CRUSADE_CHAIN, prog, p.eventId, choice);
}
