// The late-game galaxy crisis (written by Claude 2; Danny's list, with the "world boss raid"
// idea from online role-playing games; names original). If nobody has won by turn 260, the
// Hollow Tide arrives from beyond the rim: a living fleet far stronger than any one empire,
// scaled to the galaxy's own fleets, which regrows as it goes. Every few turns it strikes the nearest colony (real battle rules)
// and wrecks it if nothing there can stop it. Fleets of any empire sitting at its star fight
// it every turn. Facing it, the empires warm to each other. Whoever destroys its last ship
// wins great renown (culture); every empire that sank Tide ships shares in it.
// Victory rules stay with the main Claude: the reward is culture only.

import type { LairGuard } from "./data/lairs";
import { adjustRelation } from "./diplomacy";
import { applyLosses, armed, fight, fighterUnit, lossText, planetUnit, shipUnit, type Unit } from "./combat";
import { shipDesign } from "./designs";
import { distance } from "./formulas";
import { shipCount } from "./game";
import { neutralUnit } from "./lairs";
import { strikeColony } from "./raiders";
import type { Empire, GameState, Id } from "./types";

export interface CrisisState {
  startTurn: number;
  /** How many times the base swarm it is (scaled to the galaxy's fleets on arrival). */
  scale?: number;
  starId: Id;
  left: number[];
  targetStarId: Id | null;
  nextStrike: number;
  wrecked: Id[];
  /** Tide ships destroyed, per empire. */
  kills: Record<Id, number>;
  over: null | "destroyed" | "gone";
  slayer?: Id;
}

export const CRISIS_TURN = 260;
export const TIDE_NAME = "the Hollow Tide";
export const TIDE_GROUPS: LairGuard[] = [
  { name: "Tide Drone", hull: "medium", count: 30, weapons: [{ techId: "plasma-cannon", count: 2 }], shield: 6, armor: 5 },
  { name: "Tide Reaver", hull: "large", count: 12, weapons: [{ techId: "disruptor", count: 2 }, { techId: "stellar-torpedo", count: 1 }], shield: 6, armor: 6 },
  { name: "Tide Heart", hull: "huge", count: 3, weapons: [{ techId: "phase-lance", count: 3 }, { techId: "hellfire-torpedo", count: 2 }], shield: 7, armor: 6 },
];
export const TIDE_ATTACK = 9;
export const STRIKE_EVERY = 3;
/** Drones regrown every REGROW_EVERY turns, up to 1.5x the starting swarm. */
export const REGROW_EVERY = 2;
export const TIDE_TURNS = 120;
/** The swarm is scaled so it outnumbers what the galaxy can field: one base swarm per this many warships in the galaxy. */
export const SHIPS_PER_SWARM = 40;
export const MAX_SCALE = 10;
/** Every empire's opinion of every other rises this much when the Tide arrives. */
export const COMMON_ENEMY = 20;
export const SLAYER_CULTURE = 10000;
export const CULTURE_PER_KILL = 15;
/** Most culture any one empire gets for its kills. */
export const KILL_CULTURE_CAP = 4000;

const Tide = TIDE_NAME[0]!.toUpperCase() + TIDE_NAME.slice(1);
const KEY = "tide";

function living(state: GameState): Empire[] {
  return state.empires.filter((e) => e.alive && e.rebelOf === undefined);
}

function edgeStar(state: GameState): Id {
  const cx = state.stars.reduce((a, s) => a + s.x, 0) / state.stars.length;
  const cy = state.stars.reduce((a, s) => a + s.y, 0) / state.stars.length;
  let best = state.stars[0]!;
  for (const s of state.stars) if (distance(cx, cy, s.x, s.y) > distance(cx, cy, best.x, best.y)) best = s;
  return best.id;
}

function aim(state: GameState, c: CrisisState): void {
  const here = state.stars[c.starId]!;
  let best: Id | null = null, bestD = Infinity;
  for (const col of Object.values(state.colonies)) {
    if (c.wrecked.includes(col.starId)) continue;
    const s = state.stars[col.starId]!;
    const d = distance(here.x, here.y, s.x, s.y);
    if (d < bestD || (d === bestD && best !== null && col.starId < best)) { bestD = d; best = col.starId; }
  }
  c.targetStarId = best;
  c.nextStrike = state.turn + STRIKE_EVERY;
  if (best === null) return;
  const col = state.colonies[best]!;
  state.events.push({ turn: state.turn, empireId: col.empireId, kind: "war", starId: best,
    text: `${Tide} is moving on ${state.stars[best]!.name}: ${tideShips(c)} living ships. They strike in ${STRIKE_EVERY} turns. Any empire's fleets can meet them there.` });
}

export function tideShips(c: CrisisState): number { return c.left.reduce((a, n) => a + n, 0); }

/** Credit kills: `before`/`after` Tide ship counts, shared among empires by ships present. */
function credit(c: CrisisState, before: number, after: number, shares: Map<Id, number>): void {
  const killed = before - after;
  const total = [...shares.values()].reduce((a, n) => a + n, 0);
  if (killed <= 0 || total <= 0) return;
  for (const [id, n] of shares) c.kills[id] = (c.kills[id] ?? 0) + Math.round((killed * n) / total);
}

function units(state: GameState, e: Empire, starId: Id): Unit[] {
  const counts = new Map<string, number>();
  for (const f of state.fleets) {
    if (f.starId !== starId || f.empireId !== e.id) continue;
    for (const [id, n] of Object.entries(f.ships)) if (n > 0) counts.set(id, (counts.get(id) ?? 0) + n);
  }
  const out: Unit[] = [];
  for (const [id, n] of [...counts].sort((x, y) => x[0].localeCompare(y[0]))) {
    const d = shipDesign(state, id);
    const s = shipUnit(state, 0, e, d, n);
    out.push(s);
    const w = fighterUnit(state, 0, e, d, s);
    if (w) out.push(w);
  }
  const col = state.colonies[starId];
  if (col && col.empireId === e.id) { const p = planetUnit(state, 0, e, col); if (p) out.push(p); }
  return out;
}

/** Fleets of any empire at the Tide's star fight it. */
function hunt(state: GameState, c: CrisisState): void {
  const sid = c.starId;
  const present = living(state).filter((e) => state.fleets.some((f) => f.starId === sid && f.empireId === e.id && shipCount(f) > 0));
  if (!present.length) return;
  const ours = present.flatMap((e) => units(state, e, sid));
  if (!ours.some(armed)) return;
  const enemy = TIDE_GROUPS.map((g, i) => neutralUnit(g, c.left[i]!, TIDE_ATTACK, KEY)).filter((u) => u.count > 0);
  const all = [...ours, ...enemy];
  const before = tideShips(c);
  const rounds = fight(state, all);
  applyLosses(state, state.fleets.filter((f) => f.starId === sid), all);
  state.fleets = state.fleets.filter((f) => shipCount(f) > 0);
  for (const u of enemy) c.left[TIDE_GROUPS.findIndex((g) => `${KEY}:${g.name}` === u.key)] = u.count;
  const shares = new Map(present.map((e) => [e.id, ours.filter((u) => u.empireId === e.id).reduce((a, u) => a + u.start, 0)]));
  credit(c, before, tideShips(c), shares);
  for (const e of present) {
    state.events.push({ turn: state.turn, empireId: e.id, kind: "battle", starId: sid,
      text: `Battle with ${TIDE_NAME} at ${state.stars[sid]!.name} (${rounds} rounds). All empires lost ${lossText(all, 0)}; the Tide lost ${lossText(all, 1)}.` });
  }
  if (tideShips(c) <= 0) slain(state, c, [...shares].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]![0]);
}

function slain(state: GameState, c: CrisisState, slayer: Id): void {
  c.over = "destroyed";
  c.slayer = slayer;
  const e = state.empires[slayer]!;
  e.culture += SLAYER_CULTURE;
  for (const [id, n] of Object.entries(c.kills)) {
    const o = state.empires[Number(id)];
    if (o?.alive) o.culture += Math.min(KILL_CULTURE_CAP, n * CULTURE_PER_KILL);
  }
  state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: c.starId,
    text: `${Tide} is destroyed! The ${e.name} struck the final blow, and every world in the galaxy sings their name. All who fought it share in the glory.` });
}

/** Once a turn. */
export function processCrisis(state: GameState): void {
  if (!state.crisis) {
    if (state.turn < (state.scenario?.crisisTurn ?? CRISIS_TURN) || state.winner) return;
    const start = edgeStar(state);
    // Scale the swarm to the galaxy: it should take several empires to stop it.
    const warships = state.fleets.reduce((a, f) => a + shipCount(f), 0);
    const scale = Math.max(1, Math.min(MAX_SCALE, Math.round(warships / SHIPS_PER_SWARM)));
    state.crisis = { startTurn: state.turn, starId: start, scale, left: TIDE_GROUPS.map((g) => g.count * scale), targetStarId: null, nextStrike: state.turn, wrecked: [], kills: {}, over: null };
    const all = living(state);
    for (const a of all) for (const b of all) if (a !== b) adjustRelation(a, b, COMMON_ENEMY);
    state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: start,
      text: `${Tide} has come from beyond ${state.stars[start]!.name}: a living fleet that eats worlds. Old enemies look at each other and wonder whether to stand together.` });
    aim(state, state.crisis);
    return;
  }
  const c = state.crisis;
  if (c.over) return;
  if (state.turn - c.startTurn >= TIDE_TURNS) {
    c.over = "gone";
    state.events.push({ turn: state.turn, empireId: null, kind: "saga", text: `${Tide} has drifted on, out of the galaxy, gorged. No one stopped it.` });
    return;
  }
  // It regrows.
  if ((state.turn - c.startTurn) % REGROW_EVERY === 0) c.left[0] = Math.min(Math.round(TIDE_GROUPS[0]!.count * (c.scale ?? 1) * 1.5), c.left[0]! + (c.scale ?? 1));
  hunt(state, c);
  if (c.over || state.turn < c.nextStrike) return;
  if (c.targetStarId !== null) {
    const sid = c.targetStarId;
    const owner = state.colonies[sid]?.empireId;
    c.starId = sid;
    const before = tideShips(c);
    const res = strikeColony(state, sid, TIDE_GROUPS, c.left, TIDE_ATTACK, KEY, TIDE_NAME);
    if (res && owner !== undefined) {
      credit(c, before, tideShips(c), new Map([[owner, 1]]));
      if (res.outcome === "destroyed") { slain(state, c, owner); return; }
      if (res.outcome === "wrecked") {
        c.wrecked.push(sid);
        state.events.push({ turn: state.turn, empireId: owner, kind: "invasion", starId: sid, text: `${res.text}${Tide} has ravaged ${state.stars[sid]!.name}.` });
      } else {
        state.events.push({ turn: state.turn, empireId: owner, kind: "battle", starId: sid, text: `${res.text}${state.stars[sid]!.name} held against ${TIDE_NAME}!` });
      }
    }
  }
  aim(state, c);
}
