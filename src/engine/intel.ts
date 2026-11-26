// Intelligence reports: an empire with agents inside a rival learns where that rival's visible fleets are heading,
// and is warned when a hostile fleet is on its way to one of its worlds ("12 Kethrak ships heading for Vos IV,
// about 4 turns away"). Only fleets the empire can already see, and only through its own spies, so it stays fair:
// the AI reads the same reports in its EmpireView. (Idea from the ideas review; main Claude, 2026-11-26.)

import { turnsToArrive } from "./movement";
import { shipCount } from "./game";
import type { Empire, Fleet, GameState, Id } from "./types";
import { hiddenFrom } from "./gates";

/** Smallest fleet worth a warning. */
export const WARN_SHIPS = 3;
/** Warn when the fleet is this many turns away or closer. */
export const WARN_TURNS = 8;

/** Do our spies tell us where this empire's fleets are going? */
export function spiesOn(e: Empire, other: Id): boolean {
  // Lumen telepaths sense every fleet's intent without agents.
  return e.raceId === "lumen" || (e.spies[other]?.agents ?? 0) > 0;
}

/** Destination of a rival fleet as our spies report it, or null if we have no agents with them or it isn't moving. */
export function reportedDestination(e: Empire, f: Fleet): Id | null {
  return f.destStarId !== null && f.empireId !== e.id && spiesOn(e, f.empireId) ? f.destStarId : null;
}

function hostile(e: Empire, o: Empire): boolean {
  return e.atWar[o.id] !== undefined || (e.relations[o.id] ?? 0) <= -40;
}

/** Once a turn, after vision is updated: warn each empire about hostile fleets its spies see heading for its worlds. */
export function intelReports(state: GameState, canSee: (e: Empire, x: number, y: number) => boolean): void {
  for (const e of state.empires) {
    if (!e.alive) continue;
    const warned = new Set<Id>();
    for (const f of state.fleets) {
      if (f.empireId === e.id || f.destStarId === null || shipCount(f) < WARN_SHIPS) continue;
      const o = state.empires[f.empireId]!;
      // A fleet hidden in a gate gives no warning (gates.ts, Claude 2).
      if (!hostile(e, o) || !canSee(e, f.x, f.y) || reportedDestination(e, f) === null || hiddenFrom(state, f, e)) continue;
      const target = state.colonies[f.destStarId];
      if (!target || target.empireId !== e.id || warned.has(f.id)) continue;
      const s = state.stars[f.destStarId]!;
      const turns = turnsToArrive(o, f, s);
      if (turns > WARN_TURNS) continue;
      warned.add(f.id);
      // Once per fleet and target, not every turn: remember the last warning.
      const key = `${f.id}:${s.id}`;
      const memo = (e.intelWarned ??= {});
      if (memo[key] !== undefined && state.turn - memo[key]! < 10) continue;
      memo[key] = state.turn;
      state.events.push({ turn: state.turn, empireId: e.id, kind: "spy", starId: s.id,
        text: `Our agents report ${shipCount(f)} ${o.name} ships heading for ${s.name}, about ${turns} turn${turns === 1 ? "" : "s"} away${e.atWar[o.id] !== undefined ? "" : " (we are not at war, yet)"}.` });
    }
    // Forget old warnings.
    if (e.intelWarned) for (const [k, t] of Object.entries(e.intelWarned)) if (state.turn - t > 30) delete e.intelWarned[k];
  }
}
