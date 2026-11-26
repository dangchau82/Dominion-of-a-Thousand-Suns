// Ancient gates, hidden armadas and ambushes (Gemini's data/gates.ts).
// - Gates are placed on turn 1 without random draws, on free stars with a planet:
//   Thread Relays, Rift Arches and one Sovereign Portal on a medium map (more on bigger ones).
// - The first empire to explore a gate hears of it. An empire with a colony at a gate
//   star is offered to wake it (its BC cost, then its awakenTurns).
// - Gate travel: a fleet at an awake gate its empire holds, ordered to another awake gate
//   it holds, arrives next turn, up to the gate's throughput in ships per turn.
// - Staging: with propulsion tier 3, fleets parked at their own awake gate are hidden
//   from rivals (not in their view of fleets) unless those rivals have spies on them.
//   Waiting costs upkeep (BC per ship a turn) and wears ships down (attrition).
// - Ambush: with computers tier 3, a staged fleet that is attacked fires first.
// - Not done (needs a fleet order and a button, the main Claude's): the decoy stance.

import { GATE_EVENTS, GATE_TYPES, STANCES, type GateTypeDef } from "./data/gates";
import { distance } from "./formulas";
import { shipCount } from "./game";
import { spiesOn } from "./intel";
import { fieldTier } from "./tech";
import type { Empire, Fleet, GameState, Id } from "./types";
import type { GameEventDef } from "./data/events";

export interface GateState {
  typeId: string;
  starId: Id;
  /** Empire that woke it (holds it while it has a colony there). */
  owner: Id | null;
  /** Turn it finishes waking, once paid for. */
  awakeAt: number | null;
  /** Empires that have heard of it. */
  seenBy: Id[];
  /** Turn the next wake-up offer may come (after a "not now"). */
  nextOffer: number;
}

export interface GatesState {
  placed: boolean;
  gates: GateState[];
  /** Fleet id -> turn it went into hiding at a gate. */
  hidden: Record<Id, number>;
  /** Ships through each gate this turn (star id -> count), reset every turn. */
  usedThisTurn: Record<Id, number>;
  turn: number;
}

const OFFER_ID = "gate-wake-offer:";
const STAGING = STANCES.find((s) => s.id === "staging")!;
const AMBUSH = STANCES.find((s) => s.id === "ambush")!;
/** Fleets this big or bigger make the news when they vanish or burst out. */
export const NEWS_SHIPS = 5;
const OFFER_AGAIN = 20;

/** One wake-up offer per gate type, built from Gemini's numbers. */
export const GATE_OFFERS: GameEventDef[] = GATE_TYPES.map((g) => ({
  id: OFFER_ID + g.id,
  title: `Wake the ${g.name}?`,
  art: "ruins",
  trigger: "colony",
  text: `Our colonists at {colony} stand beside a dormant ${g.name}: ${g.description} Waking it costs ${g.awakenCost} BC and ${g.awakenTurns} turns. Once awake, our fleets can jump between our gates in a single turn (up to ${g.throughput} ships a turn), and hide inside it.`,
  choices: [
    { label: `Wake it (${g.awakenCost} BC)`, result: "Engineers swarm the ancient ring.", effects: [{ kind: "money", amount: -g.awakenCost }] },
    { label: "Not now", result: "The ring stays dark, for now.", effects: [{ kind: "nothing" }] },
  ],
}));
export const GATE_ALL_EVENTS: GameEventDef[] = [...GATE_EVENTS, ...GATE_OFFERS];
const TYPE_BY_ID = new Map(GATE_TYPES.map((g) => [g.id, g]));

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function gateType(g: GateState): GateTypeDef {
  return TYPE_BY_ID.get(g.typeId)!;
}

export function gateAt(state: GameState, starId: Id | null): GateState | null {
  if (starId === null) return null;
  return state.gates?.gates.find((g) => g.starId === starId) ?? null;
}

/** Awake and held by this empire (it still has a colony there). */
export function holdsGate(state: GameState, e: Empire, g: GateState | null): boolean {
  return !!g && g.owner === e.id && g.awakeAt !== null && state.turn >= g.awakeAt && state.colonies[g.starId]?.empireId === e.id;
}

function place(state: GameState, gs: GatesState): void {
  const homes = state.empires.map((e) => state.stars[e.capitalStarId]!);
  const salt = seedNumber(state);
  const scale = state.stars.length / 120;
  const spots = state.stars
    .filter((s) => s.planet && !state.colonies[s.id] && homes.every((h) => distance(h.x, h.y, s.x, s.y) >= 3))
    .sort((a, b) => ((a.id * 7919 + salt) % 9973) - ((b.id * 7919 + salt) % 9973) || a.id - b.id);
  let i = 0;
  for (const t of GATE_TYPES) {
    const n = Math.max(1, Math.round(t.perMediumMap * scale));
    for (let k = 0; k < n && i < spots.length; k++, i++) {
      gs.gates.push({ typeId: t.id, starId: spots[i]!.id, owner: null, awakeAt: null, seenBy: [], nextOffer: 0 });
    }
  }
}

/** Should `viewer` see this fleet? Staged fleets hide from rivals who have no spies on their owner. */
export function hiddenFrom(state: GameState, f: Fleet, viewer: Empire): boolean {
  if (f.empireId === viewer.id || state.gates?.hidden[f.id] === undefined) return false;
  return !spiesOn(viewer, f.empireId);
}

/** Is any fleet of this empire at this star lying in ambush? */
export function ambushing(state: GameState, e: Empire, starId: Id): boolean {
  if (fieldTier(e.research, AMBUSH.requires[0]) < AMBUSH.requires[1]) return false;
  return state.fleets.some((f) => f.empireId === e.id && f.starId === starId && state.gates?.hidden[f.id] !== undefined);
}

/**
 * Movement hook: jump a fleet between two gates its empire holds. Returns true if it jumped
 * (then movement leaves it alone this turn).
 */
export function gateJump(state: GameState, f: Fleet): boolean {
  if (!state.gates || f.destStarId === null || f.starId === null) return false;
  const e = state.empires[f.empireId]!;
  const from = gateAt(state, f.starId), to = gateAt(state, f.destStarId);
  if (!holdsGate(state, e, from) || !holdsGate(state, e, to)) return false;
  const gs = state.gates;
  if (gs.turn !== state.turn) { gs.usedThisTurn = {}; gs.turn = state.turn; }
  const n = shipCount(f);
  const used = gs.usedThisTurn[from!.starId] ?? 0;
  if (used + n > gateType(from!).throughput) return false; // too many for one turn: it travels normally
  gs.usedThisTurn[from!.starId] = used + n;
  const dest = state.stars[to!.starId]!;
  f.x = dest.x; f.y = dest.y; f.starId = dest.id; f.destStarId = null;
  delete gs.hidden[f.id];
  if (n >= NEWS_SHIPS) burstOut(state, f);
  return true;
}

function burstOut(state: GameState, f: Fleet): void {
  const s = state.stars[f.starId!]!;
  const near = new Set(Object.values(state.colonies)
    .filter((c) => c.empireId !== f.empireId && distance(s.x, s.y, state.stars[c.starId]!.x, state.stars[c.starId]!.y) <= 4)
    .map((c) => c.empireId));
  for (const id of [...near].sort((a, b) => a - b)) {
    const e = state.empires[id]!;
    if (!e.alive || state.pendingEvents.some((p) => p.empireId === id)) continue;
    const home = Object.values(state.colonies).find((c) => c.empireId === id)?.starId ?? null;
    state.pendingEvents.push({ id: state.nextEventId++, empireId: id, eventId: "armada-bursts-out", turn: state.turn, colonyStarId: home, starId: s.id, rivalId: f.empireId });
  }
}

function offerWake(state: GameState, g: GateState): void {
  const c = state.colonies[g.starId];
  if (!c || g.awakeAt !== null || state.turn < g.nextOffer) return;
  const e = state.empires[c.empireId]!;
  const t = gateType(g);
  if (!e.alive || e.treasury < t.awakenCost || state.pendingEvents.some((p) => p.empireId === e.id)) return;
  g.nextOffer = state.turn + OFFER_AGAIN;
  state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: OFFER_ID + t.id, turn: state.turn, colonyStarId: g.starId, starId: g.starId, rivalId: null });
}

function staging(state: GameState, gs: GatesState, canSee: (e: Empire, x: number, y: number) => boolean): void {
  for (const f of state.fleets) {
    const e = state.empires[f.empireId]!;
    const g = gateAt(state, f.starId);
    const canHide = f.destStarId === null && holdsGate(state, e, g) && fieldTier(e.research, STAGING.requires[0]) >= STAGING.requires[1];
    if (!canHide) { delete gs.hidden[f.id]; continue; }
    if (gs.hidden[f.id] === undefined) {
      gs.hidden[f.id] = state.turn;
      // Rivals who could see the gate notice the armada vanish (once).
      if (shipCount(f) >= NEWS_SHIPS) {
        const s = state.stars[f.starId!]!;
        for (const o of state.empires) {
          if (!o.alive || o.id === e.id || !canSee(o, s.x, s.y) || spiesOn(o, e.id) || state.pendingEvents.some((p) => p.empireId === o.id)) continue;
          state.pendingEvents.push({ id: state.nextEventId++, empireId: o.id, eventId: "rival-armada-vanishes", turn: state.turn, colonyStarId: null, starId: s.id, rivalId: e.id });
        }
      }
      continue;
    }
    // Waiting is not free: upkeep, and ships wear out a little each turn.
    const n = shipCount(f);
    e.treasury -= STAGING.upkeepPerShip * n;
    const since = state.turn - gs.hidden[f.id]!;
    const attr = gateType(g!).attritionPerTurn;
    const lose = Math.floor(n * attr * since) - Math.floor(n * attr * (since - 1));
    for (let k = 0; k < lose; k++) {
      const biggest = Object.entries(f.ships).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
      if (biggest) f.ships[biggest[0]] = biggest[1] - 1;
    }
  }
  for (const id of Object.keys(gs.hidden).map(Number)) if (!state.fleets.some((f) => f.id === id)) delete gs.hidden[id];
}

/** Once a turn, after vision is updated. */
export function processGates(state: GameState, canSee: (e: Empire, x: number, y: number) => boolean): void {
  const gs = (state.gates ??= { placed: false, gates: [], hidden: {}, usedThisTurn: {}, turn: state.turn });
  if (!gs.placed) { place(state, gs); gs.placed = true; }
  for (const g of gs.gates) {
    const s = state.stars[g.starId]!;
    // News for the first explorers.
    for (const e of state.empires) {
      if (!e.alive || g.seenBy.includes(e.id) || !e.knowledge[s.id]?.explored) continue;
      g.seenBy.push(e.id);
      if (!state.pendingEvents.some((p) => p.empireId === e.id)) {
        state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: "first-gate-discovered", turn: state.turn, colonyStarId: null, starId: s.id, rivalId: null });
      }
    }
    // A gate is held only while its waker keeps the colony there.
    if (g.owner !== null && state.colonies[g.starId]?.empireId !== g.owner) { g.owner = null; g.awakeAt = null; }
    if (g.awakeAt !== null && state.turn === g.awakeAt && g.owner !== null) {
      const e = state.empires[g.owner]!;
      if (!state.pendingEvents.some((p) => p.empireId === e.id)) {
        state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: "gate-awakens", turn: state.turn, colonyStarId: g.starId, starId: g.starId, rivalId: null });
      }
    }
    offerWake(state, g);
  }
  staging(state, gs, canSee);
}

/** Called when any event is answered: paying to wake a gate starts it waking. */
export function noteGateChoice(state: GameState, p: { eventId: string; empireId: Id; starId: Id | null }, choice: number): void {
  if (!p.eventId.startsWith(OFFER_ID) || choice !== 0 || p.starId === null) return;
  const g = gateAt(state, p.starId);
  if (!g || g.awakeAt !== null) return;
  g.owner = p.empireId;
  g.awakeAt = state.turn + Math.max(1, gateType(g).awakenTurns);
}
