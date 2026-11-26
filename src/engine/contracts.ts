// The frontier job board (Gemini's data/contracts.ts), played through events so it
// needs no new screen: every so often a frontier poster offers each empire a job it has
// the right ship for. Accepted jobs finish after their stated turns and pay off or go
// wrong by their risk; some jobs hit a twist halfway. No random draws: offers,
// outcomes and twists come from the seed, the turn and the empire.

import { CONTRACTS, CONTRACT_TWISTS, type ContractDef } from "./data/contracts";
import { effectText, OFFER_PREFIX } from "./contractEvents";
import { applyEffect } from "./events";
import { adjustRelation } from "./diplomacy";
import { shipDesign } from "./designs";
import { distance } from "./formulas";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface ContractProgress {
  /** The job under way, if any. */
  active: { contractId: string; due: number; twistAt: number | null } | null;
  /** The turn the next job is posted. */
  nextOffer: number;
  completed: number;
  failed: number;
}

/** First offer turn, and turns between offers. */
export const FIRST_OFFER = 20;
export const OFFER_EVERY = 25;
/** One job in TWIST_ONE_IN hits a twist halfway. */
export const TWIST_ONE_IN = 3;

const CONTRACT_BY_ID = new Map(CONTRACTS.map((c) => [c.id, c]));

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}
function roll(state: GameState, e: Empire, salt: number): number {
  return (seedNumber(state) + e.id * 131 + state.turn * 17 + salt * 7919) % 100;
}

export function tierFor(turn: number): 1 | 2 | 3 {
  return turn < 100 ? 1 : turn < 200 ? 2 : 3;
}

/** Does this empire own a ship that can do the job? */
export function canDo(state: GameState, e: Empire, needs: ContractDef["needs"]): boolean {
  for (const f of state.fleets) {
    if (f.empireId !== e.id) continue;
    for (const [id, n] of Object.entries(f.ships)) {
      if (n <= 0) continue;
      const d = shipDesign(state, id);
      if (needs === "scout") return true;
      if (needs === "transport" && d.role === "transport") return true;
      if (needs === "warship" && d.role === "warship" && d.weapons.length > 0) return true;
    }
  }
  return false;
}

/** The neighbour whose space a smuggler crosses: the contact with a colony nearest our capital. */
function smugglingVictim(state: GameState, e: Empire): Empire | null {
  const home = state.stars[e.capitalStarId]!;
  let best: Empire | null = null;
  let bestD = Infinity;
  for (const c of Object.values(state.colonies)) {
    if (c.empireId === e.id || !e.contacts.includes(c.empireId)) continue;
    const s = state.stars[c.starId]!;
    const d = distance(home.x, home.y, s.x, s.y);
    if (d < bestD) { bestD = d; best = state.empires[c.empireId]!; }
  }
  return best;
}

function home(state: GameState, e: Empire): Id | null {
  return state.colonies[e.capitalStarId]?.empireId === e.id ? e.capitalStarId : Object.values(state.colonies).find((c) => c.empireId === e.id)?.starId ?? null;
}

function offer(state: GameState, e: Empire, prog: ContractProgress): void {
  const tier = tierFor(state.turn);
  const doable = CONTRACTS.filter((c) => c.tier === tier && canDo(state, e, c.needs));
  const where = home(state, e);
  if (!doable.length || where === null) return;
  const c = doable[roll(state, e, 1) % doable.length]!;
  const p: PendingEvent = { id: state.nextEventId++, empireId: e.id, eventId: OFFER_PREFIX + c.id, turn: state.turn, colonyStarId: where, starId: where, rivalId: null };
  state.pendingEvents.push(p);
}

function finish(state: GameState, e: Empire, prog: ContractProgress): void {
  const job = prog.active!;
  const c = CONTRACT_BY_ID.get(job.contractId)!;
  prog.active = null;
  const where = home(state, e);
  const p: PendingEvent = { id: -1, empireId: e.id, eventId: OFFER_PREFIX + c.id, turn: state.turn, colonyStarId: where, starId: where, rivalId: null };
  const wentWrong = roll(state, e, 2) < c.risk * 100;
  for (const fx of wentWrong ? c.failure : c.reward) applyEffect(state, e, p, fx);
  if (wentWrong) {
    prog.failed++;
    let caught = "";
    if (c.caughtRelations) {
      const victim = smugglingVictim(state, e);
      if (victim) { adjustRelation(victim, e, -c.caughtRelations); caught = ` The ${victim.name} caught our smugglers in their space.`; }
    }
    state.events.push({ turn: state.turn, empireId: e.id, kind: "info", text: `Job board: "${c.name}" went wrong (${effectText(c.failure) || "no losses"}).${caught}` });
  } else {
    prog.completed++;
    state.events.push({ turn: state.turn, empireId: e.id, kind: "info", text: `Job board: "${c.name}" done. ${c.poster} pays up (${effectText(c.reward)}).` });
  }
}

function twist(state: GameState, e: Empire, prog: ContractProgress): void {
  const where = home(state, e);
  if (where === null) return;
  const rival = e.contacts.filter((id) => state.empires[id]!.alive).sort((a, b) => a - b)[0] ?? null;
  const t = CONTRACT_TWISTS[roll(state, e, 3) % CONTRACT_TWISTS.length]!;
  state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: t.id, turn: state.turn, colonyStarId: where, starId: where, rivalId: rival });
  prog.active!.twistAt = null;
}

/** Once a turn. */
export function processContracts(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const all = (state.contracts ??= {});
    const prog = (all[e.id] ??= { active: null, nextOffer: FIRST_OFFER + (e.id % 5) * 3, completed: 0, failed: 0 });
    if (prog.active) {
      if (prog.active.twistAt !== null && state.turn >= prog.active.twistAt && !state.pendingEvents.some((p) => p.empireId === e.id)) twist(state, e, prog);
      if (state.turn >= prog.active.due) finish(state, e, prog);
      continue;
    }
    if (state.turn < prog.nextOffer || state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    prog.nextOffer = state.turn + OFFER_EVERY;
    offer(state, e, prog);
  }
}

/** Called when any event is answered: taking a job starts it. */
export function noteContractChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (!p.eventId.startsWith(OFFER_PREFIX) || choice !== 0) return;
  const c = CONTRACT_BY_ID.get(p.eventId.slice(OFFER_PREFIX.length));
  const prog = state.contracts?.[p.empireId];
  if (!c || !prog || prog.active) return;
  const e = state.empires[p.empireId]!;
  const twistAt = roll(state, e, 4) % TWIST_ONE_IN === 0 ? state.turn + Math.max(1, Math.floor(c.turns / 2)) : null;
  prog.active = { contractId: c.id, due: state.turn + c.turns, twistAt };
}
