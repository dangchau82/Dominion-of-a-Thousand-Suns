// Native peoples (Gemini's data/natives.ts): some unsettled worlds already have people.
// Marked once, on turn 1, in `planet.special` ("natives:<id>"), on a planet of their
// climate, without random draws. Explorers see who lives there. The first empire to
// settle the world meets them (uplift, leave them be, or take the land); an uplift
// brings its aftermath, good or bad, 30 turns later.

import { NATIVES, type NativeDef } from "./data/natives";
import type { GameEventDef } from "./data/events";
import type { Empire, GameState, Id, Star } from "./types";

export interface NativesState {
  placed: boolean;
  /** Star id -> empires that have seen the natives. */
  seen: Record<Id, Id[]>;
  /** Star id -> the empire that met them (they are met only once). */
  met: Record<Id, Id>;
  /** Uplifts waiting for their aftermath: star id -> turn it comes. */
  aftermathAt: Record<Id, number>;
}

const PREFIX = "natives:";
/** About one native world per this many stars (at most one per native people). */
export const STARS_PER_NATIVE = 25;
/** Turns from an uplift to its aftermath. */
export const AFTERMATH_DELAY = 30;
/** The contact answer that uplifts the natives (first of three). */
export const UPLIFT = 0;

const BY_ID = new Map(NATIVES.map((n) => [n.id, n]));
const BY_CONTACT = new Map(NATIVES.map((n) => [n.contact.id, n]));
export const NATIVE_EVENTS: GameEventDef[] = NATIVES.flatMap((n) => [n.contact, n.aftermath]);

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function nativesOf(s: Star): NativeDef | null {
  const sp = s.planet?.special;
  return sp && sp.startsWith(PREFIX) ? BY_ID.get(sp.slice(PREFIX.length)) ?? null : null;
}

function place(state: GameState): void {
  const homes = new Set(state.empires.map((e) => e.capitalStarId));
  const salt = seedNumber(state);
  const free = state.stars
    .filter((s) => s.planet && !s.planet.special && !state.colonies[s.id] && !homes.has(s.id))
    .sort((a, b) => ((a.id * 7919 + salt) % 9973) - ((b.id * 7919 + salt) % 9973) || a.id - b.id);
  const max = Math.min(NATIVES.length, Math.max(1, Math.round(state.stars.length / STARS_PER_NATIVE)));
  const order = [...NATIVES].sort((a, b) => ((a.id.length * 31 + salt) % 97) - ((b.id.length * 31 + salt) % 97) || a.id.localeCompare(b.id));
  let placed = 0;
  for (const n of order) {
    if (placed >= max) break;
    // Their own climate if the map has a free one; otherwise they skip this game.
    const spot = free.find((s) => !s.planet!.special && s.planet!.climate === n.climate);
    if (!spot) continue;
    spot.planet!.special = PREFIX + n.id;
    placed++;
  }
}

function rivalOf(state: GameState, e: Empire): Id | null {
  return e.contacts.filter((id) => state.empires[id]!.alive).sort((a, b) => (e.relations[a] ?? 0) - (e.relations[b] ?? 0) || a - b)[0] ?? null;
}

/** Once a turn. */
export function processNatives(state: GameState): void {
  const st = (state.natives ??= { placed: false, seen: {}, met: {}, aftermathAt: {} });
  if (!st.placed) { place(state); st.placed = true; }
  for (const s of state.stars) {
    const n = nativesOf(s);
    if (!n) continue;
    // Scouting reports.
    const seen = (st.seen[s.id] ??= []);
    for (const e of state.empires) {
      if (!e.alive || seen.includes(e.id) || !e.knowledge[s.id]?.explored) continue;
      seen.push(e.id);
      state.events.push({ turn: state.turn, empireId: e.id, kind: "explored", starId: s.id, text: `${s.name} is home to ${n.name}. ${n.description}` });
    }
    // First contact, when someone settles their world.
    const c = state.colonies[s.id];
    if (c && st.met[s.id] === undefined) {
      st.met[s.id] = c.empireId;
      const e = state.empires[c.empireId]!;
      state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: n.contact.id, turn: state.turn, colonyStarId: s.id, starId: s.id, rivalId: rivalOf(state, e) });
    }
    // The price of meddling, if they were uplifted and we still hold the world.
    const due = st.aftermathAt[s.id];
    if (due !== undefined && state.turn >= due) {
      delete st.aftermathAt[s.id];
      if (c) {
        const e = state.empires[c.empireId]!;
        state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: n.aftermath.id, turn: state.turn, colonyStarId: s.id, starId: s.id, rivalId: rivalOf(state, e) });
      }
    }
  }
}

/** Called when any event is answered: an uplift starts the clock on its aftermath. */
export function noteNativesChoice(state: GameState, p: { eventId: string; colonyStarId: Id | null }, choice: number): void {
  const n = BY_CONTACT.get(p.eventId);
  if (!n || choice !== UPLIFT || p.colonyStarId === null || !state.natives) return;
  state.natives.aftermathAt[p.colonyStarId] = state.turn + AFTERMATH_DELAY;
}
