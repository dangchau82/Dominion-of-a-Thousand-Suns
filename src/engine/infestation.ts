// The alien infestation: once per game an outer colony goes silent. Inside are the
// Hollow Crawlers (Gemini's data/infestation.ts). Infested colonies lose people every
// turn and the nest spreads along trade routes to nearby worlds, even other empires',
// until each empire settles on how to fight it (event 4 of its chain). Its colonies are
// cleared when its chain ends. A trading guild offers a fortune for a live specimen.
// No random draws: turns and the specimen's escape come from the seed.

import { INFESTATION, INFESTATION_CHAIN, SPECIMEN_GAMBLE } from "./data/infestation";
import type { GameEventDef } from "./data/events";
import { branchSetter, nextInChain, noteChainAnswer, showChainEvent, type ChainProgress } from "./chains";
import { distance } from "./formulas";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface InfestationState {
  startTurn: number;
  /** Infested colonies (star id -> turn infested). */
  nests: Record<Id, number>;
  /** Each infested empire's progress through the chain. */
  empires: Record<Id, ChainProgress>;
  /** The empire offered the specimen deal, once offered. */
  specimenOfferedTo: Id | null;
}

const EARLIEST = 110;
const SPREAD = 80;
/** The nest reaches the nearest colony within this range every SPREAD_EVERY turns. */
export const SPREAD_RANGE = 6;
export const SPREAD_EVERY = Math.round(1 / INFESTATION.spreadChance);
/** A nest burns itself out after this long, whatever anyone does. */
export const NEST_LIFETIME = 60;
/** At most this many empires are drawn in. */
export const MAX_EMPIRES = 3;
const CHAIN_GAP = 6;

export const SPECIMEN_EVENT: GameEventDef = {
  id: "infestation-specimen-offer",
  title: "An Offer for a Live Specimen",
  art: "contact",
  trigger: "turn",
  text: `The ${SPECIMEN_GAMBLE.guildName} sends an envoy about the creatures at {colony}: "${SPECIMEN_GAMBLE.offer}"`,
  choices: [
    { label: `Sell them a specimen (${SPECIMEN_GAMBLE.payment} BC, but it might escape)`, result: "The crate is sealed and handed over.", effects: [{ kind: "money", amount: SPECIMEN_GAMBLE.payment }] },
    { label: "Keep one for our own labs (research, but it might escape)", result: "Our biologists take it to a sealed vault.", effects: [{ kind: "research", field: SPECIMEN_GAMBLE.research.field, amount: SPECIMEN_GAMBLE.research.amount }] },
    { label: "Refuse: burn every sample", result: "The envoy leaves empty-handed. Some things should not be sold.", effects: [{ kind: "morale", amount: 2 }] },
  ],
};
export const INFESTATION_EVENTS: GameEventDef[] = [...INFESTATION_CHAIN, SPECIMEN_EVENT];

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function infestationTurn(state: GameState): number {
  return EARLIEST + (seedNumber(state) % SPREAD);
}

/** Patient zero: the non-capital colony farthest from the galaxy's centre. */
function pickFirst(state: GameState): Id | null {
  const cx = state.stars.reduce((a, s) => a + s.x, 0) / state.stars.length;
  const cy = state.stars.reduce((a, s) => a + s.y, 0) / state.stars.length;
  let best: Id | null = null;
  let bestD = -1;
  for (const c of Object.values(state.colonies)) {
    if (c.isCapital || state.empires[c.empireId]!.rebelOf !== undefined) continue;
    const s = state.stars[c.starId]!;
    const d = distance(cx, cy, s.x, s.y);
    if (d > bestD || (d === bestD && best !== null && c.starId < best)) { bestD = d; best = c.starId; }
  }
  return best;
}

function contained(inf: InfestationState, empireId: Id): boolean {
  const prog = inf.empires[empireId];
  const setter = branchSetter(INFESTATION_CHAIN);
  return !!prog && (prog.finished || (setter !== undefined && prog.done.includes(setter) && prog.branch !== undefined));
}

function infest(state: GameState, inf: InfestationState, starId: Id): void {
  const c = state.colonies[starId];
  if (!c || inf.nests[starId] !== undefined) return;
  const empireId = c.empireId;
  if (!inf.empires[empireId] && Object.keys(inf.empires).length >= MAX_EMPIRES) return;
  inf.nests[starId] = state.turn;
  inf.empires[empireId] ??= { done: [], lastTurn: -Infinity };
  state.events.push({ turn: state.turn, empireId, kind: "info", starId, text: `${state.stars[starId]!.name} has stopped answering.` });
}

function spread(state: GameState, inf: InfestationState): void {
  for (const [sid, since] of Object.entries(inf.nests).map(([k, v]) => [Number(k), v] as const)) {
    const c = state.colonies[sid];
    if (!c || contained(inf, c.empireId)) continue;
    if ((state.turn - since) <= 0 || (state.turn - since) % SPREAD_EVERY !== 0) continue;
    const s = state.stars[sid]!;
    const target = Object.values(state.colonies)
      .filter((o) => o.starId !== sid && inf.nests[o.starId] === undefined && !contained(inf, o.empireId))
      .map((o) => ({ o, d: distance(s.x, s.y, state.stars[o.starId]!.x, state.stars[o.starId]!.y) }))
      .filter((x) => x.d <= SPREAD_RANGE)
      .sort((a, b) => a.d - b.d || a.o.starId - b.o.starId)[0];
    if (target) infest(state, inf, target.o.starId);
  }
}

function nestOf(inf: InfestationState, state: GameState, e: Empire): Id | null {
  const mine = Object.keys(inf.nests).map(Number).filter((id) => state.colonies[id]?.empireId === e.id).sort((a, b) => a - b);
  return mine[0] ?? null;
}

/** Once a turn. */
export function processInfestation(state: GameState): void {
  if (!state.infestation) {
    if (state.turn < infestationTurn(state)) return;
    const first = pickFirst(state);
    if (first === null) return;
    state.infestation = { startTurn: state.turn, nests: {}, empires: {}, specimenOfferedTo: null };
    infest(state, state.infestation, first);
  }
  const inf = state.infestation;
  // Nests that were cleared, burned out, or whose colony was lost.
  for (const [sid, since] of Object.entries(inf.nests).map(([k, v]) => [Number(k), v] as const)) {
    const c = state.colonies[sid];
    if (!c || inf.empires[c.empireId]?.finished || state.turn - since >= NEST_LIFETIME) {
      delete inf.nests[sid];
      if (c) state.events.push({ turn: state.turn, empireId: c.empireId, kind: "info", starId: sid, text: `${state.stars[sid]!.name} is free of the ${INFESTATION.creatureName}.` });
      continue;
    }
    c.population = Math.max(1, c.population - INFESTATION.popLossPerTurn);
  }
  spread(state, inf);
  for (const [idStr, prog] of Object.entries(inf.empires)) {
    const e = state.empires[Number(idStr)]!;
    if (!e.alive || prog.finished || state.turn - prog.lastTurn < CHAIN_GAP) continue;
    if (state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    const nest = nestOf(inf, state, e);
    // The specimen deal: once, to the first empire to learn what the creatures are (after event 3).
    if (inf.specimenOfferedTo === null && prog.done.includes(INFESTATION_CHAIN[2]!.id) && nest !== null) {
      inf.specimenOfferedTo = e.id;
      state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: SPECIMEN_EVENT.id, turn: state.turn, colonyStarId: nest, starId: nest, rivalId: null });
      prog.lastTurn = state.turn;
      continue;
    }
    const ev = nextInChain(INFESTATION_CHAIN, prog);
    const place = nest ?? (state.colonies[e.capitalStarId]?.empireId === e.id ? e.capitalStarId : null);
    if (ev && place !== null) showChainEvent(state, e, ev, prog, { colonyStarId: place, starId: place, rivalId: null });
  }
}

/** Does the specimen escape? Seed-based, so a save replays the same. */
export function specimenEscapes(state: GameState, empireId: Id): boolean {
  return ((seedNumber(state) + empireId * 13 + state.turn * 7) % 100) < SPECIMEN_GAMBLE.escapeChance * 100;
}

/** Called when any event is answered. */
export function noteInfestationChoice(state: GameState, p: PendingEvent, choice: number): void {
  const inf = state.infestation;
  if (!inf) return;
  if (p.eventId === SPECIMEN_EVENT.id) {
    if (choice > 1) return;
    const e = state.empires[p.empireId]!;
    if (specimenEscapes(state, e.id)) {
      state.events.push({ turn: state.turn, empireId: e.id, kind: "info", text: SPECIMEN_GAMBLE.escapeText });
      // It gets loose on our most populous clean colony; that colony's chain starts over.
      const clean = Object.values(state.colonies).filter((c) => c.empireId === e.id && inf.nests[c.starId] === undefined)
        .sort((a, b) => b.population - a.population || a.starId - b.starId)[0];
      if (clean) {
        const prog = inf.empires[e.id];
        if (prog?.finished) inf.empires[e.id] = { done: [], lastTurn: state.turn };
        infest(state, inf, clean.starId);
      }
    } else {
      state.events.push({ turn: state.turn, empireId: e.id, kind: "info", text: SPECIMEN_GAMBLE.successText });
    }
    return;
  }
  const prog = inf.empires[p.empireId];
  if (prog && INFESTATION_CHAIN.some((x) => x.id === p.eventId)) noteChainAnswer(INFESTATION_CHAIN, prog, p.eventId, choice);
}
