// Reads an invasion news line (engine/combat.ts `invade`) into what the 3D landing scene needs.
// Pure and tiny, so the game screen can import it without loading three.js.

import type { GameState, Id } from "../../engine/types";

export interface LandingInfoLite {
  starId: Id;
  attackerId: Id;
  defenderId: Id | null;
  captured: boolean;
  troops: number;
  survivors: number;
  turn: number;
}

const byName = (state: GameState, name: string): Id | null => state.empires.find((e) => e.name === name)?.id ?? null;

/** Returns null for invasion lines that aren't a landing (e.g. notes after a capture). */
export function landingFromEvent(state: GameState, ev: { turn: number; starId?: Id; text: string; empireId: Id | null }, viewer: Id): LandingInfoLite | null {
  if (ev.starId === undefined) return null;
  const cap = /^The (.+) captured (.+) with (\d+) surviving troops?\./.exec(ev.text);
  if (cap) {
    const attackerId = byName(state, cap[1]!);
    if (attackerId === null) return null;
    const survivors = Number(cap[3]);
    return { starId: ev.starId, attackerId, defenderId: attackerId === viewer ? null : viewer, captured: true, troops: Math.round(survivors * 1.8) + 2, survivors, turn: ev.turn };
  }
  const back = /^Invasion of (.+) by the (.+) was thrown back \((\d+) troops? lost\)\./.exec(ev.text);
  if (back) {
    const attackerId = byName(state, back[2]!);
    if (attackerId === null) return null;
    const owner = state.colonies[ev.starId]?.empireId ?? null;
    return { starId: ev.starId, attackerId, defenderId: owner, captured: false, troops: Number(back[3]), survivors: 0, turn: ev.turn };
  }
  return null;
}
