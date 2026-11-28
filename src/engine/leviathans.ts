// Ancient Leviathans (main Claude, 2026-11-28; Danny's capital tier: "Ancient Leviathan is fine"):
// precursor warships of Colossus size, asleep in empty space. From turn LEVIATHAN_TURN long-range
// scans find them, one for about every four empires, at the empty stars farthest from every capital.
// Any empire that knows Titan Slipways can bring a fleet there and pay WAKE_COST to wake one; it joins
// that fleet. Same rule for the player and the AI. No randomness: placement comes from the map.

import type { Empire, Fleet, GameState, Id } from "./types";

export const LEVIATHAN_TURN = 160;
export const WAKE_COST = 1500;
export const WAKE_TECH = "titan-slipways";

export interface Leviathan {
  starId: Id;
  /** Empire that woke it, or null while it sleeps. */
  wokenBy: Id | null;
}

/** Once a turn: from LEVIATHAN_TURN, place the sleeping leviathans (once) and announce them. */
export function processLeviathans(state: GameState): void {
  if (state.leviathans || state.turn < LEVIATHAN_TURN) return;
  const alive = state.empires.filter((e) => e.alive);
  const caps = alive.map((e) => state.stars[e.capitalStarId]).filter((s): s is NonNullable<typeof s> => !!s);
  const count = Math.max(1, Math.round(alive.length / 4));
  const spots = state.stars
    .filter((s) => !state.colonies[s.id] && !s.planet)
    .map((s) => ({ s, far: caps.length ? Math.min(...caps.map((c) => Math.hypot(c.x - s.x, c.y - s.y))) : 0 }))
    .sort((a, b) => b.far - a.far || a.s.id - b.s.id)
    .slice(0, count);
  state.leviathans = spots.map(({ s }) => ({ starId: s.id, wokenBy: null }));
  for (const { s } of spots) {
    state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: s.id,
      text: `Long-range scans find an Ancient Leviathan asleep at ${s.name}: a precursor warship the size of a moon. Whoever learns Titan Slipways and brings a fleet there can wake it for ${WAKE_COST} BC.` });
  }
}

/** Why this fleet can't wake a leviathan here, or null if it can. */
export function wakeProblem(state: GameState, e: Empire, f: Fleet): string | null {
  if (f.empireId !== e.id || f.starId === null) return "The fleet must be at the leviathan's star";
  const lv = state.leviathans?.find((x) => x.starId === f.starId && x.wokenBy === null);
  if (!lv) return "No sleeping leviathan here";
  if (!e.research.known.includes(WAKE_TECH)) return "Learn Titan Slipways to wake it";
  if (e.treasury < WAKE_COST) return `Waking it costs ${WAKE_COST} BC`;
  return null;
}

/** Wake it: pay, and the Ancient Leviathan joins the fleet. */
export function wakeLeviathan(state: GameState, e: Empire, f: Fleet): string | null {
  const err = wakeProblem(state, e, f);
  if (err) return err;
  const lv = state.leviathans!.find((x) => x.starId === f.starId && x.wokenBy === null)!;
  lv.wokenBy = e.id;
  e.treasury -= WAKE_COST;
  // A hidden one-off design (like the great-work ships in endgame.ts): precursor guns no empire can build.
  let id = `Ancient Leviathan of the ${e.name}`;
  if (state.designs[id]) id = `${id} (${state.turn})`;
  state.designs[id] = {
    id, empireId: -1, name: "Ancient Leviathan", role: "warship", hull: "colossus",
    computer: null, shield: "class-ix-deflector", ecm: null, armor: null,
    weapons: [{ techId: "phase-lance", count: 24 }, { techId: "hellfire-torpedo", count: 8 }],
    specials: [], cost: 20000, space: 0, extraRange: 0,
  };
  f.ships[id] = (f.ships[id] ?? 0) + 1;
  const s = state.stars[lv.starId]!;
  state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: s.id,
    text: `The ${e.name} have woken the Ancient Leviathan at ${s.name}. It answers to them now.` });
  return null;
}

/** For the empire view: where the leviathans are and whether they sleep (public news once found). */
export function leviathanSummary(state: GameState): Leviathan[] {
  return (state.leviathans ?? []).map((x) => ({ ...x }));
}
