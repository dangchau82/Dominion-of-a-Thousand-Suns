// Mad raiders from the edge (ideas pipeline; inspired by a frontier show's savage raiders,
// idea only, names original). Written by Claude 2.
// Once per game, late, the Ashen Howl pours in from the star farthest from the galaxy's
// heart. It cannot be bargained with. Every few turns it moves on to the nearest colony,
// warns nobody but the target (its sighting is the warning), and fights whatever is there
// with the real battle rules. If it wins, the colony is wrecked and the Howl grows.
// It leaves after a while, or dies when its last ship is destroyed. No random draws in the
// raiders' choices; the battles use the game's seeded RNG like any battle.

import type { LairGuard } from "./data/lairs";
import { applyLosses, armed, fight, fighterUnit, lossText, planetUnit, shipUnit, type Unit } from "./combat";
import { shipDesign } from "./designs";
import { distance } from "./formulas";
import { shipCount } from "./game";
import { neutralUnit } from "./lairs";
import type { Empire, GameState, Id } from "./types";

export interface RaidersState {
  startTurn: number;
  /** Where the horde is now. */
  starId: Id;
  /** Ships left in each group (same order as RAIDER_GROUPS). */
  left: number[];
  /** Turn it strikes next, and where. */
  nextStrike: number;
  targetStarId: Id | null;
  /** Colonies wrecked so far. */
  raided: Id[];
  over: "destroyed" | "gone" | null;
}

export const HOWL_NAME = "the Ashen Howl";
/** The horde: scrap-built ships bristling with stolen weapons. */
export const RAIDER_GROUPS: LairGuard[] = [
  { name: "Howl Scrapper", hull: "medium", count: 12, weapons: [{ techId: "plasma-cannon", count: 2 }], shield: 4, armor: 4 },
  { name: "Howl Gutship", hull: "large", count: 5, weapons: [{ techId: "disruptor", count: 2 }, { techId: "stellar-torpedo", count: 1 }], shield: 5, armor: 5 },
  { name: "Howl Maw", hull: "huge", count: 1, weapons: [{ techId: "phase-lance", count: 3 }, { techId: "hellfire-torpedo", count: 2 }], shield: 5, armor: 5 },
];
/** Their targeting skill. */
export const RAIDER_ATTACK = 7;
const EARLIEST = 160;
const SPREAD = 60;
/** Turns between strikes (the warning time). */
export const STRIKE_EVERY = 4;
/** The horde leaves after this many turns. */
export const HOWL_TURNS = 60;
/** Share of a wrecked colony's population and factories lost. */
export const WRECK_SHARE = 0.3;
/** Each wrecked world adds this many Scrappers. */
export const GROWTH = 2;
/** Paid by the empire that destroys the horde. */
export const BOUNTY = 300;

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function raidTurn(state: GameState): number {
  return EARLIEST + (seedNumber(state) % SPREAD);
}

function edgeStar(state: GameState): Id {
  const cx = state.stars.reduce((a, s) => a + s.x, 0) / state.stars.length;
  const cy = state.stars.reduce((a, s) => a + s.y, 0) / state.stars.length;
  let best = state.stars[0]!;
  for (const s of state.stars) if (distance(cx, cy, s.x, s.y) > distance(cx, cy, best.x, best.y)) best = s;
  return best.id;
}

/** The next colony to hit: nearest one not yet wrecked. */
function nextTarget(state: GameState, r: RaidersState): Id | null {
  const here = state.stars[r.starId]!;
  let best: Id | null = null;
  let bestD = Infinity;
  for (const c of Object.values(state.colonies)) {
    if (r.raided.includes(c.starId)) continue;
    const s = state.stars[c.starId]!;
    const d = distance(here.x, here.y, s.x, s.y);
    if (d < bestD || (d === bestD && best !== null && c.starId < best)) { bestD = d; best = c.starId; }
  }
  return best;
}

function aim(state: GameState, r: RaidersState): void {
  r.targetStarId = nextTarget(state, r);
  r.nextStrike = state.turn + STRIKE_EVERY;
  if (r.targetStarId === null) return;
  const c = state.colonies[r.targetStarId]!;
  const s = state.stars[r.targetStarId]!;
  state.events.push({ turn: state.turn, empireId: c.empireId, kind: "war", starId: s.id,
    text: `${HOWL_NAME[0]!.toUpperCase()}${HOWL_NAME.slice(1)} has been sighted heading for ${s.name}: ${r.left.reduce((a, n) => a + n, 0)} raider ships. They will strike in ${STRIKE_EVERY} turns. They cannot be bargained with.` });
}

function defenders(state: GameState, e: Empire, starId: Id): Unit[] {
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
  const c = state.colonies[starId];
  if (c && c.empireId === e.id) {
    const p = planetUnit(state, 0, e, c);
    if (p) units.push(p);
  }
  return units;
}

function strike(state: GameState, r: RaidersState): void {
  const sid = r.targetStarId!;
  const c = state.colonies[sid];
  const s = state.stars[sid]!;
  r.starId = sid;
  if (!c) return;
  const e = state.empires[c.empireId]!;
  const mine = defenders(state, e, sid);
  const raiders = RAIDER_GROUPS.map((g, i) => neutralUnit(g, r.left[i]!, RAIDER_ATTACK, "howl")).filter((u) => u.count > 0);
  const units = [...mine, ...raiders];
  let text = "";
  if (mine.some(armed)) {
    const rounds = fight(state, units);
    applyLosses(state, state.fleets.filter((f) => f.starId === sid), units);
    state.fleets = state.fleets.filter((f) => shipCount(f) > 0);
    for (const u of raiders) r.left[RAIDER_GROUPS.findIndex((g) => `howl:${g.name}` === u.key)] = u.count;
    text = `Battle at ${s.name} against ${HOWL_NAME} (${rounds} round${rounds === 1 ? "" : "s"}). You lost ${lossText(units, 0)}; they lost ${lossText(units, 1)}. `;
  }
  if (r.left.every((n) => n <= 0)) {
    r.over = "destroyed";
    e.treasury += BOUNTY;
    state.events.push({ turn: state.turn, empireId: e.id, kind: "battle", starId: sid, text: `${text}${HOWL_NAME[0]!.toUpperCase()}${HOWL_NAME.slice(1)} is destroyed! Grateful frontier worlds send ${BOUNTY} BC.` });
    state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: sid, text: `The ${e.name} destroyed ${HOWL_NAME} at ${s.name}.` });
    return;
  }
  // Whatever still stands at the colony could not stop them: it is wrecked.
  const held = units.some((u) => u.side === 0 && u.count > 0 && armed(u));
  if (!held) {
    c.population = Math.max(1, c.population * (1 - WRECK_SHARE));
    c.factories = Math.floor(c.factories * (1 - WRECK_SHARE));
    r.raided.push(sid);
    r.left[0] = r.left[0]! + GROWTH;
    state.events.push({ turn: state.turn, empireId: e.id, kind: "battle", starId: sid, text: `${text}${HOWL_NAME[0]!.toUpperCase()}${HOWL_NAME.slice(1)} wrecked ${s.name}: a third of its people and factories are gone. The horde grows.` });
  } else {
    state.events.push({ turn: state.turn, empireId: e.id, kind: "battle", starId: sid, text: `${text}${s.name} held! ${HOWL_NAME[0]!.toUpperCase()}${HOWL_NAME.slice(1)} turns away to look for softer prey.` });
    r.raided.push(sid);
  }
}

/** Once a turn, after normal battles. */
export function processRaiders(state: GameState): void {
  if (!state.raiders) {
    if (state.turn < raidTurn(state)) return;
    const start = edgeStar(state);
    state.raiders = { startTurn: state.turn, starId: start, left: RAIDER_GROUPS.map((g) => g.count), nextStrike: state.turn, targetStarId: null, raided: [], over: null };
    state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: start,
      text: `${HOWL_NAME[0]!.toUpperCase()}${HOWL_NAME.slice(1)} poured in from beyond ${state.stars[start]!.name}: raiders who burn what they cannot carry.` });
    aim(state, state.raiders);
    return;
  }
  const r = state.raiders;
  if (r.over) return;
  if (state.turn - r.startTurn >= HOWL_TURNS) {
    r.over = "gone";
    state.events.push({ turn: state.turn, empireId: null, kind: "info", text: `${HOWL_NAME[0]!.toUpperCase()}${HOWL_NAME.slice(1)} has vanished back beyond the rim.` });
    return;
  }
  if (state.turn < r.nextStrike) return;
  if (r.targetStarId !== null) strike(state, r);
  if (!r.over) aim(state, r);
}
