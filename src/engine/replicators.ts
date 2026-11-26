// Self-replicating machines (ideas pipeline; written by Claude 2, names original).
// Once per game a dormant Replicator Hive wakes on an empty star away from home worlds.
// - It builds more of itself every BUILD_EVERY turns (up to a cap).
// - Unarmed visitors get a warning; an armed fleet parked there fights it like a lair
//   (the real battle rules), and the hive doesn't repair losses between fights.
// - Once it has SWARM_AT ships, every SWARM_EVERY turns it sends a swarm at the nearest
//   colony within SWARM_RANGE: the colony's owner is warned the turn before, then the
//   swarm strikes (raiders.ts `strikeColony`). Swarms that win wreck the colony.
// - Destroying the hive pays its builders' secrets: construction and computers research.
// No random draws in its choices; battles use the seeded RNG like any battle.

import type { LairGuard } from "./data/lairs";
import { applyLosses, armed, fight, fighterUnit, lossText, shipUnit, type Unit } from "./combat";
import { applyEffect } from "./events";
import { distance } from "./formulas";
import { shipCount } from "./game";
import { neutralUnit } from "./lairs";
import { strikeColony } from "./raiders";
import { shipDesign } from "./designs";
import type { Empire, GameState, Id } from "./types";

export interface ReplicatorState {
  starId: Id;
  /** Machines per group (same order as REPLICATOR_GROUPS). */
  left: number[];
  wokeTurn: number;
  lastBuild: number;
  /** A swarm on its way: target and the turn it strikes. */
  swarm: { targetStarId: Id; strikeTurn: number } | null;
  lastSwarm: number;
  seenBy: Id[];
  destroyedBy: Id | null;
}

export const HIVE_NAME = "the Replicator Hive";
export const REPLICATOR_GROUPS: LairGuard[] = [
  { name: "Drone Seed", hull: "small", count: 10, weapons: [{ techId: "pulse-laser", count: 1 }], shield: 1, armor: 2 },
  { name: "Assembler", hull: "medium", count: 3, weapons: [{ techId: "ion-cannon", count: 2 }], shield: 2, armor: 3 },
];
export const REPLICATOR_ATTACK = 4;
const EARLIEST = 100;
const SPREAD = 60;
/** It builds this often: one Drone Seed and, every other time, an Assembler. */
export const BUILD_EVERY = 4;
/** It stops growing here (per group). */
export const CAP = [60, 20];
/** Swarms start once it has this many machines in all, then come this often. */
export const SWARM_AT = 30;
export const SWARM_EVERY = 12;
export const SWARM_RANGE = 8;
/** Share of the hive that leaves as a swarm (it returns if it wins or is never seen again). */
export const SWARM_SHARE = 0.5;
export const PRIZE = [{ kind: "research" as const, field: "construction" as const, amount: 400 }, { kind: "research" as const, field: "computers" as const, amount: 300 }];

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function hiveTurn(state: GameState): number {
  return EARLIEST + (seedNumber(state) % SPREAD);
}

function pickStar(state: GameState): Id | null {
  const homes = state.empires.map((e) => state.stars[e.capitalStarId]!);
  const salt = seedNumber(state) + 17;
  const taken = new Set([...(state.lairs ?? []).map((l) => l.starId), ...(state.gates?.gates ?? []).map((g) => g.starId)]);
  const spots = state.stars
    .filter((s) => !state.colonies[s.id] && !taken.has(s.id) && homes.every((h) => distance(h.x, h.y, s.x, s.y) >= 5))
    .sort((a, b) => Number(!!a.planet) - Number(!!b.planet) || ((a.id * 7919 + salt) % 9973) - ((b.id * 7919 + salt) % 9973) || a.id - b.id);
  if (spots[0]) return spots[0].id;
  // Crowded map: the free star farthest from every home world.
  let best: Id | null = null;
  let bestD = -1;
  for (const s of state.stars) {
    if (state.colonies[s.id] || taken.has(s.id)) continue;
    const d = Math.min(...homes.map((h) => distance(h.x, h.y, s.x, s.y)));
    if (d > bestD) { bestD = d; best = s.id; }
  }
  return best;
}

function total(h: ReplicatorState): number {
  return h.left.reduce((a, n) => a + n, 0);
}

function empireUnits(state: GameState, e: Empire, starId: Id): Unit[] {
  const counts = new Map<string, number>();
  for (const f of state.fleets) {
    if (f.starId !== starId || f.empireId !== e.id) continue;
    for (const [id, n] of Object.entries(f.ships)) if (n > 0) counts.set(id, (counts.get(id) ?? 0) + n);
  }
  const units: Unit[] = [];
  for (const [id, n] of [...counts].sort((x, y) => x[0].localeCompare(y[0]))) {
    const d = shipDesign(state, id);
    const ships = shipUnit(state, 0, e, d, n);
    units.push(ships);
    const wing = fighterUnit(state, 0, e, d, ships);
    if (wing) units.push(wing);
  }
  return units;
}

function destroyed(state: GameState, h: ReplicatorState, e: Empire): void {
  h.destroyedBy = e.id;
  for (const fx of PRIZE) applyEffect(state, e, { id: -1, empireId: e.id, eventId: "replicator-hive", turn: state.turn, colonyStarId: null, starId: h.starId, rivalId: null }, fx);
  const s = state.stars[h.starId]!;
  state.events.push({ turn: state.turn, empireId: e.id, kind: "battle", starId: s.id, text: `${HIVE_NAME[0]!.toUpperCase()}${HIVE_NAME.slice(1)} at ${s.name} is destroyed. Its fabricators teach our engineers a great deal.` });
  state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: s.id, text: `The ${e.name} destroyed ${HIVE_NAME} at ${s.name} before it could swallow the stars.` });
}

/** Armed visitors fight the hive, in order of empire id. */
function assault(state: GameState, h: ReplicatorState): void {
  const s = state.stars[h.starId]!;
  const here = [...new Set(state.fleets.filter((f) => f.starId === s.id && shipCount(f) > 0).map((f) => f.empireId))].sort((a, b) => a - b);
  for (const id of here) {
    const e = state.empires[id]!;
    if (!h.seenBy.includes(id)) {
      h.seenBy.push(id);
      state.events.push({ turn: state.turn, empireId: id, kind: "war", starId: s.id,
        text: `${HIVE_NAME[0]!.toUpperCase()}${HIVE_NAME.slice(1)} at ${s.name}: machines building more machines, ${total(h)} so far. Left alone, it will grow until it sends swarms against our worlds.` });
    }
    if (h.destroyedBy !== null) return;
    const mine = empireUnits(state, e, s.id);
    if (!mine.some(armed)) continue;
    const machines = REPLICATOR_GROUPS.map((g, i) => neutralUnit(g, h.left[i]!, REPLICATOR_ATTACK, "hive")).filter((u) => u.count > 0);
    const units = [...mine, ...machines];
    const rounds = fight(state, units);
    applyLosses(state, state.fleets.filter((f) => f.starId === s.id), units);
    state.fleets = state.fleets.filter((f) => shipCount(f) > 0);
    for (const u of machines) h.left[REPLICATOR_GROUPS.findIndex((g) => `hive:${g.name}` === u.key)] = u.count;
    state.events.push({ turn: state.turn, empireId: e.id, kind: "battle", starId: s.id,
      text: `Battle at ${HIVE_NAME} (${s.name}, ${rounds} round${rounds === 1 ? "" : "s"}). You lost ${lossText(units, 0)}; the machines lost ${lossText(units, 1)}.` });
    if (total(h) <= 0) destroyed(state, h, e);
  }
}

function build(state: GameState, h: ReplicatorState): void {
  if (state.turn - h.lastBuild < BUILD_EVERY) return;
  h.lastBuild = state.turn;
  h.left[0] = Math.min(CAP[0]!, h.left[0]! + 1);
  if (Math.floor((state.turn - h.wokeTurn) / BUILD_EVERY) % 2 === 0) h.left[1] = Math.min(CAP[1]!, h.left[1]! + 1);
}

function swarms(state: GameState, h: ReplicatorState): void {
  const s = state.stars[h.starId]!;
  if (h.swarm && state.turn >= h.swarm.strikeTurn) {
    const sw = h.swarm;
    h.swarm = null;
    // The swarm: half of each group goes; what survives comes home.
    const out = h.left.map((n) => Math.floor(n * SWARM_SHARE));
    for (let i = 0; i < out.length; i++) h.left[i] = h.left[i]! - out[i]!;
    const res = strikeColony(state, sw.targetStarId, REPLICATOR_GROUPS, out, REPLICATOR_ATTACK, "hive", "a replicator swarm");
    for (let i = 0; i < out.length; i++) h.left[i] = h.left[i]! + out[i]!;
    if (!res) return;
    const t = state.stars[sw.targetStarId]!;
    const word = res.outcome === "wrecked" ? `wrecked ${t.name}: a third of its people and factories are gone` : res.outcome === "held" ? `was beaten back at ${t.name}` : `was wiped out at ${t.name}`;
    state.events.push({ turn: state.turn, empireId: res.owner.id, kind: "battle", starId: t.id, text: `${res.text}A replicator swarm ${word}.` });
    return;
  }
  if (h.swarm || total(h) < SWARM_AT || state.turn - h.lastSwarm < SWARM_EVERY) return;
  let best: Id | null = null;
  let bestD = Infinity;
  for (const c of Object.values(state.colonies)) {
    const t = state.stars[c.starId]!;
    const d = distance(s.x, s.y, t.x, t.y);
    if (d <= SWARM_RANGE && (d < bestD || (d === bestD && best !== null && c.starId < best))) { bestD = d; best = c.starId; }
  }
  if (best === null) return;
  h.lastSwarm = state.turn;
  h.swarm = { targetStarId: best, strikeTurn: state.turn + 1 };
  const c = state.colonies[best]!;
  state.events.push({ turn: state.turn, empireId: c.empireId, kind: "war", starId: best,
    text: `A swarm of self-replicating machines has left ${s.name} for ${state.stars[best]!.name}. It strikes next turn.` });
}

/** Once a turn, after normal battles. */
export function processReplicators(state: GameState): void {
  if (!state.replicators) {
    if (state.turn < hiveTurn(state)) return;
    const star = pickStar(state);
    if (star === null) return;
    state.replicators = { starId: star, left: REPLICATOR_GROUPS.map((g) => g.count), wokeTurn: state.turn, lastBuild: state.turn, swarm: null, lastSwarm: state.turn, seenBy: [], destroyedBy: null };
    state.events.push({ turn: state.turn, empireId: null, kind: "info", starId: star, text: `Strange energy readings near ${state.stars[star]!.name}: something old has switched itself on.` });
    return;
  }
  const h = state.replicators;
  if (h.destroyedBy !== null) return;
  assault(state, h);
  if (h.destroyedBy !== null) return;
  build(state, h);
  swarms(state, h);
}
