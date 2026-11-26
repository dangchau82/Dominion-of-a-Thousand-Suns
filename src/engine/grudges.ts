// Grudges: empires remember what was done to them. Broken treaties, wars declared on them, worlds taken or
// forced from them build a grudge against the one who did it. A grudge pulls relations down for as long as it
// lasts (relations drift toward a level that subtracts it) and fades slowly; honourable peoples forget slowest.
// Only what happened to the empire itself is remembered, so it is fair to the no-cheat rule.
// (Idea from Danny's second Claude session; rules by the main Claude, 2026-11-26.)

import { race } from "./data/races";
import type { Empire, GameState, Id } from "./types";

export const GRUDGE_CAP = 60;
/** Points for each wrong. */
export const GRUDGE = { brokeAlliance: 30, brokePact: 20, brokeTreaty: 8, declaredWar: 10, tookWorld: 8, forcedWorld: 5 } as const;
/** Kept each turn: 0.99 for an average people (half gone in about 70 turns); honour 1 keeps 0.995, honour 0 keeps 0.985. */
export function grudgeKeep(e: Empire): number {
  return 0.985 + 0.01 * race(e.raceId).personality.honor;
}
/** Reasons remembered per rival (newest last). */
const REASONS_KEPT = 4;

export interface Grudge {
  points: number;
  /** Plain-words memories, newest last, e.g. "T120: broke our alliance". */
  reasons: string[];
}

/** `holder` now holds a grudge against `against`. */
export function addGrudge(state: GameState, holder: Empire, against: Empire, points: number, reason: string): void {
  if (holder.id === against.id || points <= 0) return;
  const g = ((holder.grudges ??= {})[against.id] ??= { points: 0, reasons: [] });
  g.points = Math.min(GRUDGE_CAP, g.points + points);
  g.reasons.push(`T${state.turn}: ${reason}`);
  if (g.reasons.length > REASONS_KEPT) g.reasons.splice(0, g.reasons.length - REASONS_KEPT);
}

export function grudgeAgainst(holder: Empire, against: Id): number {
  return holder.grudges?.[against]?.points ?? 0;
}

/** Once a turn: grudges fade; a forgotten one is dropped. */
export function fadeGrudges(state: GameState): void {
  for (const e of state.empires) {
    if (!e.grudges) continue;
    const keep = grudgeKeep(e);
    for (const [id, g] of Object.entries(e.grudges)) {
      // Terran Accord: born brokers, forgiven twice as fast.
      g.points *= state.empires[Number(id)]?.raceId === "humans" ? keep * keep : keep;
      if (g.points < 1) delete e.grudges[Number(id)];
    }
    if (!Object.keys(e.grudges).length) delete e.grudges;
  }
}
