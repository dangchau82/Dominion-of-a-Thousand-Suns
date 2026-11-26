// A buried government secret (data/buriedSecret.ts, run with chains.ts). Each empire
// that grows to four colonies uncovers its own government's old Project Hushfall once,
// on a seed-based turn: reveal it, bury it, or keep using it. No random draws.

import { SECRET_CHAIN } from "./data/buriedSecret";
import { nextInChain, noteChainAnswer, showChainEvent, type ChainProgress } from "./chains";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export const SECRET_EVENTS = SECRET_CHAIN;
const EARLIEST = 80;
const SPREAD = 100;
/** Empires need this many colonies before there is a frontier to have buried something on. */
export const MIN_COLONIES = 4;
const GAP = 8;

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function secretTurn(state: GameState, e: Empire): number {
  return EARLIEST + ((seedNumber(state) + e.id * 29) % SPREAD);
}

/** The oldest colony that isn't the capital: the archive is on the old frontier. */
function oldFrontier(state: GameState, e: Empire): Id | null {
  const mine = Object.values(state.colonies).filter((c) => c.empireId === e.id);
  const outer = mine.filter((c) => !c.isCapital).sort((a, b) => a.foundedTurn - b.foundedTurn || a.starId - b.starId);
  return outer[0]?.starId ?? mine[0]?.starId ?? null;
}

/** Once a turn. */
export function processSecrets(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const all = (state.secrets ??= {});
    let prog = all[e.id];
    if (!prog) {
      if (state.turn < secretTurn(state, e) || Object.values(state.colonies).filter((c) => c.empireId === e.id).length < MIN_COLONIES) continue;
      prog = all[e.id] = { done: [], lastTurn: -Infinity };
    }
    if (prog.finished || state.turn - prog.lastTurn < GAP || state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    const ev = nextInChain(SECRET_CHAIN, prog);
    const where = oldFrontier(state, e);
    if (!ev || where === null) continue;
    const rival = e.contacts.filter((id) => state.empires[id]!.alive).sort((a, b) => (e.relations[a] ?? 0) - (e.relations[b] ?? 0) || a - b)[0] ?? null;
    showChainEvent(state, e, ev, prog, { colonyStarId: where, starId: where, rivalId: rival });
  }
}

/** Called when any event is answered. */
export function noteSecretChoice(state: GameState, p: PendingEvent, choice: number): void {
  const prog: ChainProgress | undefined = state.secrets?.[p.empireId];
  if (prog && SECRET_CHAIN.some((e) => e.id === p.eventId)) noteChainAnswer(SECRET_CHAIN, prog, p.eventId, choice);
}
