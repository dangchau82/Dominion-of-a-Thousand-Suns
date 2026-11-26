// Migrant growth (the Quorai): colonies do not grow on their own. People come from the capital,
// or are paid for with ecology spending like anyone else's.
// Each turn the capital sends out a share of its people, split evenly among the colonies that have room.
// The capital regrows what it sent, so a wide empire keeps its home star below full and every new colony
// thins the stream. Spreading wide is still possible; it is just slow. Deterministic, no randomness.
// (Idea from Danny's second Claude session; rule and numbers by Claude, 2026-11-25.)
import { race } from "./data/races";
import { planetCapacity } from "./formulas";
import type { Colony, Empire, GameState } from "./types";

/** True for a colony that grows only from its capital's migrants. */
export function growsByMigrants(e: Empire, c: Colony): boolean {
  return !!race(e.raceId).homeMigrants && !c.isCapital && c.starId !== e.capitalStarId;
}

/** People the capital would send out this turn (0 if no colony has room). */
export function migrantsThisTurn(state: GameState, e: Empire): number {
  const share = race(e.raceId).homeMigrants ?? 0;
  const home = state.colonies[e.capitalStarId];
  if (!share || !home || home.empireId !== e.id) return 0;
  return roomy(state, e).length ? home.population * share : 0;
}

function roomy(state: GameState, e: Empire): { c: Colony; space: number }[] {
  return Object.values(state.colonies)
    // A colony whose star blew up (supernova) has no planet left and takes no migrants (2026-11-26: it crashed the game).
    .filter((c) => c.empireId === e.id && growsByMigrants(e, c) && !!state.stars[c.starId]?.planet)
    .sort((a, b) => a.starId - b.starId)
    .map((c) => ({ c, space: planetCapacity(state.stars[c.starId]!.planet!, e) - c.population }))
    .filter((x) => x.space > 1e-9);
}

export function processMigrants(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive || !race(e.raceId).homeMigrants) continue;
    const home = state.colonies[e.capitalStarId];
    if (!home || home.empireId !== e.id) continue;
    let pool = migrantsThisTurn(state, e);
    if (pool <= 0) continue;
    // Even shares; what a nearly full colony can't take goes round again to the others.
    let open = roomy(state, e);
    let sent = 0;
    for (let pass = 0; pass < 3 && pool > 1e-9 && open.length; pass++) {
      const each = pool / open.length;
      for (const x of open) {
        const take = Math.min(each, x.space);
        x.c.population += take; x.space -= take; pool -= take; sent += take;
      }
      open = open.filter((x) => x.space > 1e-9);
    }
    home.population = Math.max(1, home.population - sent);
  }
}
