// The Cult of the Last Sun (ideas pipeline, "the death-cult crusade"; written by Claude 2).
// Once a game, in one empire, a doomsday cult takes root at a big outer colony and spreads
// to another of that empire's colonies every few turns, each one sending tithes away.
// Purge it (pay per cult colony, it's gone), let it be (it keeps spreading and draining),
// or adopt its rites (it stops spreading and its songs bring culture, but neighbours
// distrust you). No random draws.

import type { GameEventDef } from "./data/events";
import { adjustRelation } from "./diplomacy";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface CultState {
  empireId: Id;
  colonies: Id[];
  stance: "spreading" | "adopted" | "purged";
  nextSpread: number;
}

export const CULT_EVENT_ID = "cult-of-the-last-sun";
export const CULT_FROM = 120;
export const CULT_WINDOW = 60;
export const SPREAD_EVERY = 10;
export const MAX_COLONIES = 5;
/** Tithes sent away per cult colony per turn while it spreads. */
export const TITHE = 5;
export const PURGE_PER_COLONY = 80;
/** Adopted: culture per cult colony per turn, and the relation hit with every other empire. */
export const RITE_CULTURE = 2;
export const DISTRUST = 10;

export const CULT_EVENT: GameEventDef = {
  id: CULT_EVENT_ID,
  title: "The Cult of the Last Sun",
  art: "crisis",
  trigger: "turn",
  text: "At {colony}, crowds in grey robes gather each dusk to watch the sun and wait for it to die. They give away their wages, preach in the streets, and their numbers double every week.",
  choices: [
    { label: `Purge the cult (${PURGE_PER_COLONY} BC for each world it holds)`, result: "Preachers arrested, halls closed, robes burned. The streets are quiet. Too quiet, some say.", effects: [{ kind: "nothing" }] },
    { label: "Let them be; it's a free empire", result: "The grey robes spread. Their tithes vanish somewhere beyond our borders.", effects: [{ kind: "nothing" }] },
    { label: "Adopt their rites as a state faith", result: "Our people sing the Last Sun hymns. Foreign envoys find it all deeply unsettling.", effects: [{ kind: "nothing" }] },
  ],
};

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function outerColonies(state: GameState, e: Empire, skip: Id[]): Id[] {
  return Object.values(state.colonies)
    .filter((c) => c.empireId === e.id && c.starId !== e.capitalStarId && !skip.includes(c.starId))
    .sort((a, b) => b.population - a.population || a.starId - b.starId)
    .map((c) => c.starId);
}

/** Once a turn. */
export function processDeathCult(state: GameState): void {
  const cult = state.deathCult;
  if (!cult) {
    const start = CULT_FROM + (seedNumber(state) % CULT_WINDOW);
    if (state.turn < start) return;
    const alive = state.empires.filter((e) => e.alive && e.rebelOf === undefined && outerColonies(state, e, []).length > 0);
    if (!alive.length) return;
    const e = alive[(seedNumber(state) + state.turn) % alive.length]!;
    if (state.pendingEvents.some((p) => p.empireId === e.id)) return;
    const at = outerColonies(state, e, [])[0]!;
    state.deathCult = { empireId: e.id, colonies: [at], stance: "spreading", nextSpread: state.turn + SPREAD_EVERY };
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: CULT_EVENT_ID, turn: state.turn, colonyStarId: at, starId: at, rivalId: null });
    return;
  }
  if (cult.stance === "purged") return;
  const e = state.empires[cult.empireId]!;
  cult.colonies = cult.colonies.filter((id) => state.colonies[id]?.empireId === e.id);
  if (!e.alive || !cult.colonies.length) { cult.stance = "purged"; return; }
  if (cult.stance === "adopted") { e.culture += RITE_CULTURE * cult.colonies.length; return; }
  e.treasury = Math.max(0, e.treasury - TITHE * cult.colonies.length);
  if (state.turn >= cult.nextSpread && cult.colonies.length < MAX_COLONIES) {
    cult.nextSpread = state.turn + SPREAD_EVERY;
    const next = outerColonies(state, e, cult.colonies)[0];
    if (next !== undefined) {
      cult.colonies.push(next);
      state.events.push({ turn: state.turn, empireId: e.id, kind: "info", starId: next, text: `The Cult of the Last Sun has spread to ${state.stars[next]!.name}.` });
    }
  }
}

/** Purge the cult now (also usable later from a UI button, if the main Claude adds one). */
export function purgeCult(state: GameState, e: Empire): boolean {
  const cult = state.deathCult;
  if (!cult || cult.empireId !== e.id || cult.stance === "purged") return false;
  const cost = PURGE_PER_COLONY * cult.colonies.length;
  if (e.treasury < cost) return false;
  e.treasury -= cost;
  cult.stance = "purged";
  return true;
}

/** Called when any event is answered. */
export function noteDeathCultChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (p.eventId !== CULT_EVENT_ID || !state.deathCult) return;
  const e = state.empires[p.empireId]!;
  if (choice === 0 && !purgeCult(state, e)) {
    state.events.push({ turn: state.turn, empireId: e.id, kind: "info", text: "The treasury cannot pay for the purge. The cult keeps spreading." });
  }
  if (choice === 2) {
    state.deathCult.stance = "adopted";
    for (const o of state.empires) if (o.id !== e.id && o.alive) adjustRelation(o, e, -DISTRUST);
  }
}
