// Minor races (Gemini's data/minorRaces.ts): twelve small neutral peoples living on one
// to three worlds. They can be courted or conquered.
// - Placed on turn 1 without random draws: a free planet of their home climate, plus
//   nearby free planets for their other worlds (`planet.special = "minor:<id>"`).
// - Explorers who find them hear their greeting. About every 20 turns one people an
//   empire has met sends envoys: offer what they like, a modest gift, or nothing.
// - What they dislike (war, spies, conquest, poverty, isolation) slowly sours them.
// - The empire they like best, once past FRIEND, gets their small gift every turn and
//   their council votes, counted at half weight like subject peoples (the main Claude's
//   rule: they can never win the council for anyone on their own).
// - Settling one of their worlds absorbs the whole people: no more votes, and peoples
//   who hate conquest turn against the conqueror.

import { MINOR_RACES, type MinorRaceDef } from "./data/minorRaces";
import { isUnderdog } from "./underdogs";
import { ENVOY_PREFIX } from "./minorRaceEvents";
import { distance } from "./formulas";
import type { Empire, GameState, Id } from "./types";

export interface MinorRaceState {
  stars: Id[];
  /** Empire id -> how much this people likes it (0-100). */
  attitude: Record<Id, number>;
  /** Empires that have met them. */
  met: Id[];
  /** The empire that absorbed them by settling their worlds, if any. */
  absorbedBy: Id | null;
  /** The empire they last counted as their friend (for news when it changes). */
  friend: Id | null;
}

export interface MinorRacesState {
  placed: boolean;
  races: Record<string, MinorRaceState>;
  /** Empire id -> turn of its next envoy. */
  nextEnvoy: Record<Id, number>;
}

const PREFIX = "minor:";
export const START_ATTITUDE = 25;
export const FRIEND = 60;
export const ENVOY_EVERY = 20;
/** Attitude gained from an envoy answer: their favourite offer, a modest gift, sending them away. */
export const ENVOY_GAIN = [25, 10, -5];
/** Attitude lost a turn while an empire does what a people dislikes. */
export const DISLIKE_DRIFT = 0.6;
/** Settling a people's world: other peoples who hate conquest lose this much for the conqueror. */
export const CONQUEST_ANGER = 25;
/** Same numbers as victory.ts (kept here to avoid an import cycle): population per vote, subject share. */
const POP_PER_VOTE = 25;
const SUBJECT_VOTE_SHARE = 0.5;
/** A minor world counts as this much voting population. */
const POP_PER_WORLD = 20;

const BY_ID = new Map(MINOR_RACES.map((m) => [m.id, m]));

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function minorRaceOf(state: GameState, starId: Id): MinorRaceDef | null {
  const sp = state.stars[starId]?.planet?.special;
  return sp && sp.startsWith(PREFIX) ? BY_ID.get(sp.slice(PREFIX.length)) ?? null : null;
}

function place(state: GameState, st: MinorRacesState): void {
  const homes = state.empires.map((e) => state.stars[e.capitalStarId]!);
  const salt = seedNumber(state);
  const free = () => state.stars
    .filter((s) => s.planet && !s.planet.special && !state.colonies[s.id] && homes.every((h) => distance(h.x, h.y, s.x, s.y) >= 3))
    .sort((a, b) => ((a.id * 7919 + salt) % 9973) - ((b.id * 7919 + salt) % 9973) || a.id - b.id);
  for (const m of MINOR_RACES) {
    const spots = free();
    const home = spots.find((s) => s.planet!.climate === m.homeClimate) ?? spots[0];
    if (!home) continue;
    home.planet!.special = PREFIX + m.id;
    const stars = [home.id];
    const near = free().filter((s) => s.id !== home.id && distance(home.x, home.y, s.x, s.y) <= 4)
      .sort((a, b) => distance(home.x, home.y, a.x, a.y) - distance(home.x, home.y, b.x, b.y) || a.id - b.id);
    for (const s of near.slice(0, m.worlds - 1)) { s.planet!.special = PREFIX + m.id; stars.push(s.id); }
    st.races[m.id] = { stars, attitude: {}, met: [], absorbedBy: null, friend: null };
  }
}

/** The empire this people counts as its friend: the one it likes best, if at least FRIEND. */
export function friendOf(r: MinorRaceState): Id | null {
  let best: Id | null = null;
  let bestA = FRIEND - 1e-9;
  for (const [id, a] of Object.entries(r.attitude)) if (a > bestA || (a === bestA && best !== null && Number(id) < best)) { bestA = a; best = Number(id); }
  return r.absorbedBy === null ? best : null;
}

/** Council votes this empire gets from its minor-race friends (half weight, like subject peoples). */
export function minorRaceVotes(state: GameState, e: Empire): number {
  if (!state.minorRaces) return 0;
  let v = 0;
  for (const [id, r] of Object.entries(state.minorRaces.races)) {
    if (friendOf(r) !== e.id) continue;
    const m = BY_ID.get(id)!;
    v += (r.stars.length * POP_PER_WORLD) / POP_PER_VOTE + (m.friendGift.kind === "councilVotes" ? m.friendGift.amount : 0);
  }
  return Math.round(v * SUBJECT_VOTE_SHARE);
}

function dislikes(state: GameState, e: Empire, what: MinorRaceDef["dislikes"]): boolean {
  switch (what) {
    case "war": return Object.keys(e.atWar).length > 0;
    case "spies": return Object.keys(e.spies).length > 0;
    case "conquest": return Object.values(state.colonies).some((c) => c.empireId === e.id && c.peopleRaceId !== undefined && c.peopleRaceId !== e.raceId);
    case "poverty": return e.treasury < 100;
    case "isolation": return Object.keys(e.treaties).filter((id) => Object.keys(e.treaties[Number(id)] ?? {}).length > 0).length === 0;
  }
}

function meet(state: GameState, st: MinorRacesState): void {
  for (const [id, r] of Object.entries(st.races)) {
    if (r.absorbedBy !== null) continue;
    const m = BY_ID.get(id)!;
    for (const e of state.empires) {
      if (!e.alive || r.met.includes(e.id) || !r.stars.some((s) => e.knowledge[s]?.explored)) continue;
      r.met.push(e.id);
      r.attitude[e.id] = START_ATTITUDE;
      state.events.push({ turn: state.turn, empireId: e.id, kind: "contact", starId: r.stars[0],
        text: `We have met ${m.name}: "${m.greeting}" They like ${m.likes}; they can't stand ${m.dislikes}.` });
    }
  }
}

function absorb(state: GameState, st: MinorRacesState): void {
  for (const [id, r] of Object.entries(st.races)) {
    if (r.absorbedBy !== null) continue;
    const taken = r.stars.find((s) => state.colonies[s]);
    if (taken === undefined) continue;
    const by = state.colonies[taken]!.empireId;
    r.absorbedBy = by;
    const m = BY_ID.get(id)!;
    state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: taken, text: `The ${state.empires[by]!.name} settled the worlds of ${m.name}, who are now part of their empire.` });
    for (const [oid, o] of Object.entries(st.races)) {
      if (oid === id || o.absorbedBy !== null || BY_ID.get(oid)!.dislikes !== "conquest" || o.attitude[by] === undefined) continue;
      o.attitude[by] = Math.max(0, o.attitude[by]! - CONQUEST_ANGER);
    }
  }
}

/** Attitude gained every 10 turns by an underdog empire (underdogs.ts). */
export const UNDERDOG_WARMTH = 2;

function drift(state: GameState, st: MinorRacesState): void {
  for (const [id, r] of Object.entries(st.races)) {
    if (r.absorbedBy !== null) continue;
    const m = BY_ID.get(id)!;
    for (const eid of r.met) {
      const e = state.empires[eid]!;
      if (e.alive && dislikes(state, e, m.dislikes)) r.attitude[eid] = Math.max(0, (r.attitude[eid] ?? START_ATTITUDE) - DISLIKE_DRIFT);
      // Minor races side with the small (underdogs.ts): a slow warm drift, every 10 turns.
      else if (e.alive && state.turn % 10 === 0 && isUnderdog(state, e)) r.attitude[eid] = Math.min(100, (r.attitude[eid] ?? START_ATTITUDE) + UNDERDOG_WARMTH);
    }
  }
}

function gifts(state: GameState, st: MinorRacesState): void {
  for (const [id, r] of Object.entries(st.races)) {
    const f = friendOf(r);
    if (f !== r.friend) {
      const m = BY_ID.get(id)!;
      if (f !== null) state.events.push({ turn: state.turn, empireId: f, kind: "diplomacy", starId: r.stars[0], text: m.joinText });
      if (r.friend !== null && state.empires[r.friend]?.alive) state.events.push({ turn: state.turn, empireId: r.friend, kind: "diplomacy", starId: r.stars[0], text: `${m.name[0]!.toUpperCase()}${m.name.slice(1)} no longer count us as friends.` });
      r.friend = f;
    }
    if (f === null) continue;
    const e = state.empires[f]!;
    if (!e.alive) continue;
    const g = BY_ID.get(id)!.friendGift;
    if (g.kind === "money") e.treasury += g.amount;
    else if (g.kind === "culture") e.culture += g.amount;
    else if (g.kind === "research") e.research.progress.computers += g.amount;
  }
}

function envoys(state: GameState, st: MinorRacesState): void {
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const met = Object.entries(st.races).filter(([, r]) => r.absorbedBy === null && r.met.includes(e.id)).map(([id]) => id).sort();
    if (!met.length) continue;
    st.nextEnvoy[e.id] ??= state.turn + 5 + (e.id % 5);
    if (state.turn < st.nextEnvoy[e.id]! || state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    st.nextEnvoy[e.id] = state.turn + ENVOY_EVERY;
    const id = met[(seedNumber(state) + state.turn + e.id) % met.length]!;
    const where = st.races[id]!.stars[0]!;
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: ENVOY_PREFIX + id, turn: state.turn, colonyStarId: null, starId: where, rivalId: null });
  }
}

/** Once a turn. */
export function processMinorRaces(state: GameState): void {
  const st = (state.minorRaces ??= { placed: false, races: {}, nextEnvoy: {} });
  if (!st.placed) { place(state, st); st.placed = true; }
  absorb(state, st);
  meet(state, st);
  drift(state, st);
  gifts(state, st);
  envoys(state, st);
}

/** Called when any event is answered: envoy answers change how much that people likes us. */
export function noteMinorRaceChoice(state: GameState, p: { eventId: string; empireId: Id }, choice: number): void {
  if (!p.eventId.startsWith(ENVOY_PREFIX) || !state.minorRaces) return;
  const r = state.minorRaces.races[p.eventId.slice(ENVOY_PREFIX.length)];
  if (!r || r.absorbedBy !== null) return;
  const gain = ENVOY_GAIN[choice] ?? 0;
  r.attitude[p.empireId] = Math.max(0, Math.min(100, (r.attitude[p.empireId] ?? START_ATTITUDE) + gain));
}
