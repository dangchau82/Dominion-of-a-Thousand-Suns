// Neutral lairs: guarded places with a prize (pirate dens, monster nests, sleeping
// machines, treasure, deadly anomalies). Gemini wrote them (data/lairs.ts); this file
// places them on the map and fights them with the real battle rules from combat.ts.
//
// - Lairs sit on uncolonized stars away from home worlds, preferring stars with no
//   habitable planet. Placing them uses no random draws: tier 1 appears on turn 1,
//   tier 2 on turn 100, tier 3 on turn 200.
// - Settling a lair's planet is allowed, but its guards raid the colony every turn
//   (it loses population) until someone clears them.
// - Unarmed ships can look but are left alone: the first visit reports what is there.
// - An armed fleet parked at a lair fights its guards every turn until one side is gone.
//   Guards that survive stay damaged (they don't heal), so a lair can be worn down.
// - Whoever destroys the last guard takes the prize.

import { HULLS } from "./data/ships";
import { LAIRS, type LairDef, type LairGuard } from "./data/lairs";
import { applyEffect } from "./events";
import { applyLosses, armed, fight, fighterUnit, lossText, shipUnit, type Gun, type Unit } from "./combat";
import { shipDesign } from "./designs";
import { distance } from "./formulas";
import { shipCount } from "./game";
import { tech } from "./tech";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface LairState {
  lairId: string;
  starId: Id;
  /** Guards left in each group (same order as the lair's `guards`). */
  left: number[];
  /** Empires whose ships have seen it (they got the scouting report). */
  seenBy: Id[];
  /** The empire that cleared it, once cleared. */
  clearedBy: Id | null;
}

/** Turn each tier appears. */
export const TIER_TURN: Record<1 | 2 | 3, number> = { 1: 1, 2: 100, 3: 200 };
/** Lairs stay at least this far from every home world. */
export const HOME_DISTANCE = 4;
/** Lairs per tier: about one per 40 stars, from 1 to 5. */
export function lairsPerTier(stars: number): number {
  return Math.max(1, Math.min(5, Math.round(stars / 40)));
}

const BY_ID = new Map(LAIRS.map((l) => [l.id, l]));
export function lairDef(id: string): LairDef {
  return BY_ID.get(id)!;
}

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Put this tier's lairs on the map. */
function place(state: GameState, tier: 1 | 2 | 3): void {
  const homes = state.empires.map((e) => state.stars[e.capitalStarId]!);
  const taken = new Set((state.lairs ?? []).map((l) => l.starId));
  for (const n of state.supernovae ?? []) taken.add(n.starId);
  const salt = seedNumber(state);
  const spots = state.stars
    .filter((s) => !state.colonies[s.id] && !taken.has(s.id)
      && homes.every((h) => distance(h.x, h.y, s.x, s.y) >= HOME_DISTANCE))
    // Planetless stars first; within each group a seed-based shuffle, so every game differs but replays exactly.
    .sort((a, b) => Number(!!a.planet) - Number(!!b.planet)
      || ((a.id * 7919 + salt) % 9973) - ((b.id * 7919 + salt) % 9973) || a.id - b.id);
  const kinds = LAIRS.filter((l) => l.tier === tier);
  const count = Math.min(lairsPerTier(state.stars.length), spots.length);
  for (let i = 0; i < count; i++) {
    const def = kinds[(salt + i) % kinds.length]!;
    (state.lairs ??= []).push({ lairId: def.id, starId: spots[i]!.id, left: def.guards.map((g) => g.count), seenBy: [], clearedBy: null });
  }
}

function guardGuns(g: LairGuard): Gun[] {
  const out: Gun[] = [];
  for (const w of g.weapons) {
    for (const fx of tech(w.techId).effects) if (fx.stat === "weapon") out.push({ kind: fx.kind, min: fx.min, max: fx.max, count: w.count });
  }
  return out;
}

/** A neutral ship group (lair guards, raiders) as a battle unit on side 1. */
export function neutralUnit(g: LairGuard, count: number, attack: number, keyPrefix = "lair"): Unit {
  const h = HULLS[g.hull];
  const maxHp = h.hits * (1 + 0.5 * Math.max(0, g.armor - 1));
  return {
    side: 1, empireId: -1, key: `${keyPrefix}:${g.name}`, name: g.name, count, start: count, hp: maxHp, maxHp,
    attack, beamDef: h.defense, missileDef: h.defense, shield: g.shield,
    guns: guardGuns(g), small: g.hull === "small", invulnerable: false,
    bonusDamage: 0, first: false, dodge: 0, stasis: false, dampener: false, frozen: false,
  };
}

/** A guard group as a battle unit. Its targeting grows with the lair's tier. */
function guardUnit(def: LairDef, g: LairGuard, count: number): Unit {
  return neutralUnit(g, count, def.tier * 2);
}

/** One empire's ships at the lair, built the same way as in a normal battle. */
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

function prize(state: GameState, e: Empire, lair: LairState, def: LairDef): void {
  const p: PendingEvent = { id: -1, empireId: e.id, eventId: def.id, turn: state.turn, colonyStarId: null, starId: lair.starId, rivalId: null };
  for (const fx of def.reward) applyEffect(state, e, p, fx);
  lair.clearedBy = e.id;
  const s = state.stars[lair.starId]!;
  state.events.push({ turn: state.turn, empireId: e.id, kind: "battle", starId: s.id, text: `${def.name} cleared! ${def.victoryText.replace(/\{star\}/g, s.name)}` });
  state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: s.id, text: `The ${e.name} cleared the ${def.name} at ${s.name}.` });
}

function scout(state: GameState, lair: LairState, def: LairDef): void {
  const s = state.stars[lair.starId]!;
  const visitors = [...new Set(state.fleets.filter((f) => f.starId === s.id && shipCount(f) > 0).map((f) => f.empireId))].sort((a, b) => a - b);
  for (const id of visitors) {
    if (lair.seenBy.includes(id)) continue;
    lair.seenBy.push(id);
    state.events.push({ turn: state.turn, empireId: id, kind: "info", starId: s.id,
      text: `${def.name} at ${s.name}: ${def.description.replace(/\{star\}/g, s.name)} Park armed ships here to fight for its prize.` });
  }
}

/** Every empire with armed ships at the lair fights its guards, in order of empire id. */
function assault(state: GameState, lair: LairState, def: LairDef): void {
  const s = state.stars[lair.starId]!;
  const attackers = [...new Set(state.fleets.filter((f) => f.starId === s.id && shipCount(f) > 0).map((f) => f.empireId))].sort((a, b) => a - b);
  for (const id of attackers) {
    if (lair.clearedBy !== null) return;
    const e = state.empires[id]!;
    const mine = empireUnits(state, e, s.id);
    if (!mine.some(armed)) continue;
    const guards = def.guards.map((g, i) => guardUnit(def, g, lair.left[i]!)).filter((u) => u.count > 0);
    const units = [...mine, ...guards];
    const rounds = fight(state, units);
    const here = state.fleets.filter((f) => f.starId === s.id);
    applyLosses(state, here, units);
    state.fleets = state.fleets.filter((f) => shipCount(f) > 0);
    for (const u of guards) lair.left[def.guards.findIndex((g) => `lair:${g.name}` === u.key)] = u.count;
    state.events.push({ turn: state.turn, empireId: e.id, kind: "battle", starId: s.id,
      text: `Battle at the ${def.name}, ${s.name} (${rounds} round${rounds === 1 ? "" : "s"}). You lost ${lossText(units, 0)}; its guards lost ${lossText(units, 1)}.` });
    if (lair.left.every((n) => n <= 0)) prize(state, e, lair, def);
  }
}

/** Population a colony on a lair's planet loses to raids each turn. */
export const RAID_LOSS = 0.5;

function raid(state: GameState, lair: LairState, def: LairDef): void {
  const c = state.colonies[lair.starId];
  if (!c) return;
  c.population = Math.max(1, c.population - RAID_LOSS * def.tier);
  if ((state.turn - c.foundedTurn) % 5 === 0) {
    state.events.push({ turn: state.turn, empireId: c.empireId, kind: "battle", starId: c.starId,
      text: `The ${def.name} keeps raiding ${state.stars[c.starId]!.name}. Send armed ships to clear it.` });
  }
}

/** Once a turn, after normal battles. */
export function processLairs(state: GameState): void {
  for (const tier of [1, 2, 3] as const) {
    if (state.turn >= TIER_TURN[tier] && !(state.lairs ?? []).some((l) => lairDef(l.lairId).tier === tier)) place(state, tier);
  }
  for (const lair of state.lairs ?? []) {
    if (lair.clearedBy !== null) continue;
    const def = lairDef(lair.lairId);
    scout(state, lair, def);
    assault(state, lair, def);
    if (lair.clearedBy === null) raid(state, lair, def);
  }
}

/** Lairs this empire has seen and that still stand (for the map and the AI view). */
export function knownLairs(state: GameState, empireId: Id): { starId: Id; name: string; tier: number; kind: string }[] {
  return (state.lairs ?? []).filter((l) => l.clearedBy === null && l.seenBy.includes(empireId))
    .map((l) => { const d = lairDef(l.lairId); return { starId: l.starId, name: d.name, tier: d.tier, kind: d.kind }; });
}
