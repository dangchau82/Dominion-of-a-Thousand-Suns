// Fleet range and movement.

import { shipDesign } from "./designs";
import { extraRange } from "./abilities";
import { distance, fuelRange, shipSpeed } from "./formulas";
import { exploreStar } from "./knowledge";
import type { Empire, Fleet, GameState, Star } from "./types";

/** Extra range a fleet gets: the smallest bonus among its ships (a fleet moves as one). */
export function fleetExtraRange(state: GameState, f: Fleet): number {
  const ids = Object.keys(f.ships).filter((k) => (f.ships[k] ?? 0) > 0);
  if (ids.length === 0) return 0;
  const owner = state.empires[f.empireId];
  return Math.min(...ids.map((id) => (owner ? extraRange(owner, shipDesign(state, id)) : shipDesign(state, id).extraRange)));
}

/** Distance from a star to the empire's nearest colony. */
export function supplyDistance(state: GameState, e: Empire, s: Star): number {
  let best = Infinity;
  for (const c of Object.values(state.colonies)) {
    if (c.empireId !== e.id) continue;
    const cs = state.stars[c.starId] as Star;
    best = Math.min(best, distance(cs.x, cs.y, s.x, s.y));
  }
  return best;
}

export function inFuelRange(state: GameState, e: Empire, s: Star, extraRange: number): boolean {
  return supplyDistance(state, e, s) <= fuelRange(e) + extraRange + 1e-9;
}

export function turnsToArrive(e: Empire, f: Fleet, s: Star): number {
  return Math.max(1, Math.ceil(distance(f.x, f.y, s.x, s.y) / shipSpeed(e) - 1e-9));
}

/** Move every travelling fleet one turn; explore stars on arrival. */
export function moveFleets(state: GameState): void {
  for (const f of state.fleets) {
    if (f.destStarId === null) continue;
    const e = state.empires[f.empireId] as Empire;
    const dest = state.stars[f.destStarId] as Star;
    const speed = shipSpeed(e);
    const d = distance(f.x, f.y, dest.x, dest.y);
    if (d <= speed + 1e-9) {
      f.x = dest.x; f.y = dest.y; f.starId = dest.id; f.destStarId = null;
      exploreStar(state, e, dest);
    } else {
      f.x += ((dest.x - f.x) / d) * speed;
      f.y += ((dest.y - f.y) / d) * speed;
      f.starId = null;
    }
  }
  mergeFleets(state);
}

/** Combine an empire's idle fleets that sit at the same star. */
export function mergeFleets(state: GameState): void {
  const keep: Fleet[] = [];
  const byKey = new Map<string, Fleet>();
  for (const f of state.fleets) {
    if (Object.values(f.ships).every((n) => n <= 0)) continue;
    if (f.starId === null || f.destStarId !== null) { keep.push(f); continue; }
    const key = `${f.empireId}:${f.starId}`;
    const into = byKey.get(key);
    if (!into) { byKey.set(key, f); keep.push(f); continue; }
    for (const [t, n] of Object.entries(f.ships)) into.ships[t] = (into.ships[t] ?? 0) + n;
  }
  state.fleets = keep;
}
