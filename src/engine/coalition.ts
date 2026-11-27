// The Grand Coalition (main Claude, 2026-11-26; Danny's late-game idea): when one empire
// towers over the galaxy, the others close ranks. Every other empire fights the giant with
// +1 attack and +1 defence in battle, and everyone hears the news. It is a rule, not a cheat:
// it helps the player against a runaway AI and works against the player who runs away.
//
// The giant is worked out once a turn (same idea as the Open Secret, but a higher bar): from
// turn 140, at least max(35%, 2.5 x the average share) of the galaxy's people, and 1.5x the
// runner-up. No randomness.

import type { Unit } from "./combat";
import type { GameState, Id } from "./types";

export const COALITION_START = 140;
export const COALITION_MIN_SHARE = 0.35;
export const COALITION_TIMES_AVERAGE = 2.5;
export const COALITION_OVER_SECOND = 1.5;
/** Battle edge for everyone fighting the giant. */
export const COALITION_ATTACK = 1;
export const COALITION_DEFENSE = 1;

export interface CoalitionState {
  leaderId: Id;
  since: number;
}

/** The empire the galaxy unites against, if any. */
export function coalitionTarget(state: GameState): Id | null {
  if (state.turn < COALITION_START) return null;
  const pop = new Map<Id, number>();
  for (const e of state.empires) if (e.alive) pop.set(e.id, 0);
  for (const c of Object.values(state.colonies)) if (pop.has(c.empireId)) pop.set(c.empireId, pop.get(c.empireId)! + c.population);
  if (pop.size < 3) return null;
  const ranked = [...pop.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  const total = ranked.reduce((s, [, p]) => s + p, 0);
  const [leaderId, top] = ranked[0]!;
  if (total <= 0) return null;
  if (top / total < Math.max(COALITION_MIN_SHARE, COALITION_TIMES_AVERAGE / pop.size)) return null;
  if (top < ranked[1]![1] * COALITION_OVER_SECOND) return null;
  return leaderId;
}

/** Once a turn: form, move or dissolve the coalition, with news for the whole galaxy. */
export function processCoalition(state: GameState): void {
  const now = coalitionTarget(state);
  const before = state.coalition?.leaderId ?? null;
  if (now === before) return;
  if (now !== null) {
    state.coalition = { leaderId: now, since: state.turn };
    state.events.push({ turn: state.turn, empireId: null, kind: "saga",
      text: `The Grand Coalition: the ${state.empires[now]!.name} have grown so mighty that the rest of the galaxy closes ranks. Every other empire fights them with sharper aim and stronger hulls.` });
  } else {
    state.events.push({ turn: state.turn, empireId: null, kind: "saga",
      text: `The ${state.empires[before!]!.name} no longer tower over the galaxy, and the Grand Coalition quietly comes apart.` });
    state.coalition = undefined;
  }
}

/** In a battle against the giant, everyone else's ships and planets get the coalition edge. */
export function coalitionEdge(state: GameState, units: Unit[]): void {
  const giant = state.coalition?.leaderId;
  if (giant === undefined) return;
  const giantSide = units.find((u) => u.empireId === giant)?.side;
  if (giantSide === undefined) return;
  for (const u of units) {
    if (u.side === giantSide || u.empireId === giant) continue;
    u.attack += COALITION_ATTACK;
    u.beamDef += COALITION_DEFENSE;
    u.missileDef += COALITION_DEFENSE;
  }
}

/** For the empire view: who the coalition stands against (public news). */
export function coalitionSummary(state: GameState): { leaderId: Id | null; since: number | null } {
  return { leaderId: state.coalition?.leaderId ?? null, since: state.coalition?.since ?? null };
}
