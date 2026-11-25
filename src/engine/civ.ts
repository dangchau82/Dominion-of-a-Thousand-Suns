// The civilization layer: colony buildings, galactic wonders, culture and
// golden ages, and leaders who serve the empire. Same rules for everyone.

import { maxMissileBases } from "./data/ships";
import {
  BUILDING_BY_ID, BUILDINGS, GOLDEN_AGE_AT, GOLDEN_AGE_BONUS, GOLDEN_AGE_TURNS, LEADER_KINDS, MAX_LEADERS, NAME_PARTS,
  type BuildingDef, type BuildingEffects, type EmpireBonus, type LeaderKind,
} from "./data/buildings";
import * as R from "./rng";
import { buildingCost, is, LARVAE_EVERY } from "./abilities";
import { canColonize, distance } from "./formulas";
import { empireRace, newColony } from "./game";
import { fieldTier } from "./tech";
import { FIELDS, type Colony, type Empire, type GameState, type Id, type Leader } from "./types";

const KEYS = ["production", "research", "growth", "range", "attack", "spying", "relations", "trade", "culture"] as const;

function add(into: Required<EmpireBonus>, b: EmpireBonus, times = 1): void {
  for (const k of KEYS) into[k] += (b[k] ?? 0) * times;
}

/** Everything that boosts the whole empire: wonders, leaders, golden ages. */
export function empireBonus(e: Empire): Required<EmpireBonus> {
  const out: Required<EmpireBonus> = { production: 0, research: 0, growth: 0, range: 0, attack: 0, spying: 0, relations: 0, trade: 0, culture: 0 };
  for (const id of e.wonders ?? []) {
    const w = BUILDING_BY_ID.get(id)?.wonder;
    if (w) add(out, w.empire);
  }
  for (const l of e.leaders ?? []) add(out, LEADER_KINDS[l.kind].perLevel, l.level);
  if (e.goldenAge) add(out, GOLDEN_AGE_BONUS);
  return out;
}

/** Sum of this colony's building effects. */
export function colonyEffects(c: Colony): Required<BuildingEffects> {
  const out: Required<BuildingEffects> = { pop: 0, research: 0, ships: 0, production: 0, treasury: 0, culture: 0, bases: 0 };
  for (const id of c.buildings ?? []) {
    const b = BUILDING_BY_ID.get(id);
    if (!b) continue;
    for (const k of Object.keys(out) as (keyof BuildingEffects)[]) out[k] += b.effects[k] ?? 0;
  }
  return out;
}

export function building(id: string): BuildingDef {
  const b = BUILDING_BY_ID.get(id);
  if (!b) throw new Error(`No building ${id}`);
  return b;
}

/** What this colony could start building now. */
export function buildable(state: GameState, e: Empire, c: Colony): BuildingDef[] {
  return BUILDINGS.filter((b) => {
    if (c.buildings.includes(b.id)) return false;
    if (b.requires && fieldTier(e.research, b.requires[0]) < b.requires[1]) return false;
    if (b.wonder && state.wonders[b.id]) return false;
    if (b.id === "w-ascension" && !FIELDS.every((f) => fieldTier(e.research, f) >= 10)) return false;
    return true;
  });
}

/** BC to finish the current building at once (twice the remaining cost, like rushing in classic city builders). */
export function buyCost(c: Colony): number {
  if (!c.buildQueue || c.buildQueue === "w-ascension") return 0;
  return Math.ceil(Math.max(0, building(c.buildQueue).cost - c.buildProgress) * 2);
}

/** What this empire pays for a building (Velari build wonders cheaper). */
export function costFor(e: Empire, id: string): number {
  return buildingCost(e, building(id));
}

function finish(state: GameState, e: Empire, c: Colony, b: BuildingDef): void {
  const s = state.stars[c.starId]!;
  c.buildings.push(b.id);
  if (b.effects.pop && s.planet) s.planet.terraform += b.effects.pop;
  if (b.effects.bases) c.missileBases = Math.min(c.missileBases + b.effects.bases, maxMissileBases(c.population) + b.effects.bases);
  if (b.wonder) {
    state.wonders[b.id] = { empireId: e.id, starId: s.id, turn: state.turn };
    e.wonders.push(b.id);
    state.events.push({ turn: state.turn, empireId: null, kind: "culture", text: `The ${e.name} completed the ${b.name} on ${s.name}! (${b.description})`, starId: s.id });
  } else {
    state.events.push({ turn: state.turn, empireId: e.id, kind: "culture", text: `${s.name} finished building the ${b.name}.`, starId: s.id });
  }
}

/** Spend BC on the colony's current building. Wonders someone else finished first are dropped. */
export function progressBuilding(state: GameState, e: Empire, c: Colony, bc: number): number {
  if (!c.buildQueue) return bc;
  const b = BUILDING_BY_ID.get(c.buildQueue);
  if (!b || c.buildings.includes(b.id) || (b.wonder && state.wonders[b.id])) {
    if (b?.wonder && state.wonders[b.id]?.empireId !== e.id) {
      state.events.push({ turn: state.turn, empireId: e.id, kind: "culture", text: `Another empire finished the ${b.name} first. Its work at ${state.stars[c.starId]!.name} can go to something else.`, starId: c.starId });
    }
    c.buildQueue = null;
    return bc;
  }
  c.buildProgress += bc;
  const cost = buildingCost(e, b);
  if (c.buildProgress >= cost) {
    const extra = c.buildProgress - cost;
    c.buildProgress = 0;
    c.buildQueue = null;
    finish(state, e, c, b);
    return extra;
  }
  return 0;
}

/** Culture each turn, golden ages, leader offers and salaries. */
export function processCivilization(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive) continue;
    const eb = empireBonus(e);
    let culture = 0;
    for (const c of Object.values(state.colonies)) {
      if (c.empireId !== e.id) continue;
      culture += colonyEffects(c).culture + c.population * 0.005;
    }
    e.culture += culture * (1 + eb.culture);
    const next = GOLDEN_AGE_AT[e.goldenAges];
    if (next !== undefined && e.culture >= next) {
      e.goldenAges++;
      e.goldenAgeUntil = state.turn + GOLDEN_AGE_TURNS;
      state.events.push({ turn: state.turn, empireId: null, kind: "culture", text: `A golden age begins for the ${e.name}! (+20% production, +10% research for ${GOLDEN_AGE_TURNS} turns)` });
    }
    e.goldenAge = state.turn < e.goldenAgeUntil;

    if (is(e, "kethrak") && state.turn % LARVAE_EVERY === 0) hatchLarvae(state, e);

    // Leaders: pay salaries; anyone unpaid leaves.
    for (const l of [...e.leaders]) {
      e.treasury -= l.salary;
      if (e.treasury < 0) {
        e.treasury += l.salary;
        e.leaders = e.leaders.filter((x) => x.id !== l.id);
        state.events.push({ turn: state.turn, empireId: e.id, kind: "culture", text: `${l.name}, your ${LEADER_KINDS[l.kind].title}, left: the treasury couldn't pay them.` });
      }
    }
    if (e.leaderOffer && e.leaderOffer.offerUntil < state.turn) e.leaderOffer = null;
    if (!e.leaderOffer && e.leaders.length < MAX_LEADERS && state.turn > 10 && R.chance(state.rng, 1 / 22)) {
      e.leaderOffer = newLeader(state);
      state.events.push({ turn: state.turn, empireId: e.id, kind: "culture",
        text: `${e.leaderOffer.name} offers to serve as ${LEADER_KINDS[e.leaderOffer.kind].title} (level ${e.leaderOffer.level}, boosts ${LEADER_KINDS[e.leaderOffer.kind].text}). Hire for ${e.leaderOffer.cost} BC in the Empire screen.` });
    }
  }
}

/** Kethrak larvae settle the best empty known world within 3 light-years of a hive colony. */
function hatchLarvae(state: GameState, e: Empire): void {
  const mine = Object.values(state.colonies).filter((c) => c.empireId === e.id).map((c) => state.stars[c.starId]!);
  let best: { id: number; size: number } | null = null;
  for (const s of state.stars) {
    if (state.colonies[s.id] || !s.planet || !e.knowledge[s.id]?.explored) continue;
    if (!canColonize(s.planet, e, empireRace(e))) continue;
    if (!mine.some((m) => distance(m.x, m.y, s.x, s.y) <= 3)) continue;
    if (!best || s.planet.size > best.size) best = { id: s.id, size: s.planet.size };
  }
  if (!best) return;
  state.colonies[best.id] = newColony(best.id, e.id, 1, state.turn);
  state.events.push({ turn: state.turn, empireId: e.id, kind: "colonized", text: `Hive larvae drifted to ${state.stars[best.id]!.name} and founded a colony.`, starId: best.id });
}

function newLeader(state: GameState): Leader {
  const rng = state.rng;
  const kinds = Object.keys(LEADER_KINDS) as LeaderKind[];
  const kind = R.pick(rng, kinds);
  const roll = R.next(rng);
  const level = roll < 0.6 ? 1 : roll < 0.9 ? 2 : 3;
  const name = R.pick(rng, NAME_PARTS.first) + R.pick(rng, NAME_PARTS.mid) + R.pick(rng, NAME_PARTS.last);
  const scale = 1 + state.turn / 100;
  return {
    id: state.nextLeaderId++, name, kind, level,
    cost: Math.round(120 * level * scale), salary: Math.round((2 + level * 2) * scale),
    offerUntil: state.turn + 6,
  };
}

export function hireLeader(state: GameState, e: Empire): string | null {
  const l = e.leaderOffer;
  if (!l) return "Nobody is offering to serve";
  if (e.leaders.length >= MAX_LEADERS) return `You can have ${MAX_LEADERS} leaders; dismiss one first`;
  if (e.treasury < l.cost) return "Not enough BC";
  e.treasury -= l.cost;
  e.leaders.push(l);
  e.leaderOffer = null;
  return null;
}

/** Hand a colony's wonders to its new owner (or lose them if it was destroyed). */
export function transferWonders(state: GameState, starId: Id, newOwner: Empire | null): void {
  for (const [id, w] of Object.entries(state.wonders)) {
    if (w.starId !== starId) continue;
    const old = state.empires[w.empireId];
    if (old) old.wonders = old.wonders.filter((x) => x !== id);
    if (newOwner) { w.empireId = newOwner.id; newOwner.wonders.push(id); }
    else w.empireId = -1;
  }
}
