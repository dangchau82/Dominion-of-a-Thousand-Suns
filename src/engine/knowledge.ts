// Fog of war: what each empire knows. Star positions and colors are public
// (visible in the night sky); planets are only known once a ship visits,
// and owners/populations only while in scanner range.

import { say } from "./dialogue";
import { colonyScanRange, distance } from "./formulas";
import type { Empire, GameEvent, GameState, Id, Star } from "./types";

/** Fleets see their own star plus this far around them. */
export const FLEET_SCAN_RANGE = 1;

function addEvent(state: GameState, ev: Omit<GameEvent, "turn">): void {
  state.events.push({ turn: state.turn, ...ev });
}

export function exploreStar(state: GameState, e: Empire, s: Star, announce = true): void {
  const known = e.knowledge[s.id];
  const firstTime = !known || !known.explored;
  const col = state.colonies[s.id];
  e.knowledge[s.id] = {
    explored: true,
    lastSeen: state.turn,
    planet: s.planet ? { ...s.planet } : null,
    ownerId: col ? col.empireId : null,
    population: col ? Math.round(col.population) : null,
  };
  if (firstTime && announce) {
    const what = s.planet ? `${s.planet.climate} world, size ${s.planet.size}` : "no habitable planet";
    addEvent(state, { empireId: e.id, kind: "explored", text: `Explored ${s.name}: ${what}.`, starId: s.id });
  }
}

/** Points from which an empire can see: its colonies and its fleets. */
function sensors(state: GameState, e: Empire): { x: number; y: number; range: number }[] {
  const out: { x: number; y: number; range: number }[] = [];
  const colRange = colonyScanRange(e);
  for (const c of Object.values(state.colonies)) {
    if (c.empireId !== e.id) continue;
    const s = state.stars[c.starId] as Star;
    out.push({ x: s.x, y: s.y, range: colRange });
  }
  for (const f of state.fleets) {
    if (f.empireId === e.id) out.push({ x: f.x, y: f.y, range: FLEET_SCAN_RANGE });
  }
  return out;
}

export function canSee(state: GameState, e: Empire, x: number, y: number): boolean {
  return sensors(state, e).some((p) => distance(p.x, p.y, x, y) <= p.range);
}

function makeContact(state: GameState, a: Empire, b: Empire): void {
  if (a.contacts.includes(b.id)) return;
  a.contacts.push(b.id);
  b.contacts.push(a.id);
  addEvent(state, { empireId: a.id, kind: "contact", text: `First contact with the ${b.name}.${!b.isPlayer ? ` ${say(state.turn, b, "firstContact", a)}` : ""}` });
  addEvent(state, { empireId: b.id, kind: "contact", text: `First contact with the ${a.name}.${!a.isPlayer ? ` ${say(state.turn, a, "firstContact", b)}` : ""}` });
}

/** Refresh every empire's view of explored stars in range, and detect first contacts. */
export function updateVision(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive) continue;
    const eyes = sensors(state, e);
    const inRange = (x: number, y: number) => eyes.some((p) => distance(p.x, p.y, x, y) <= p.range);

    for (const s of state.stars) {
      const k = e.knowledge[s.id];
      if (!k?.explored || !inRange(s.x, s.y)) continue;
      const col = state.colonies[s.id];
      k.lastSeen = state.turn;
      k.ownerId = col ? col.empireId : null;
      k.population = col ? Math.round(col.population) : null;
      k.planet = s.planet ? { ...s.planet } : null;
    }

    for (const other of state.empires) {
      if (other.id === e.id || !other.alive || e.contacts.includes(other.id)) continue;
      const seesColony = Object.values(state.colonies).some((c) => {
        if (c.empireId !== other.id) return false;
        const s = state.stars[c.starId] as Star;
        return inRange(s.x, s.y);
      });
      const seesFleet = state.fleets.some((f) => f.empireId === other.id && inRange(f.x, f.y));
      if (seesColony || seesFleet) makeContact(state, e, other);
    }
  }
}

export function isExplored(e: Empire, starId: Id): boolean {
  return e.knowledge[starId]?.explored === true;
}
