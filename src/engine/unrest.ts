// Unrest, revolts and civil war. Rules by Claude; texts and rebel names by Gemini (data/unrest.ts).
//
// Every colony has unrest from 0 (calm) to 100 (open revolt). It drifts toward a target set by:
//   occupation (a conquered people), distance from the capital, empire size, long wars and enemy agitators,
// and is calmed by internal security, culture buildings and golden ages. The capital never rebels.
// High unrest cuts a colony's output, brings unrest events, and at the top a revolt:
//   an occupied world rises and returns to its old empire if that empire still lives;
//   otherwise the world and its restless neighbours break away as a new rebel empire (civil war).
// Same rules for the player and every AI. Deterministic: randomness only from state.rng.

import { REBEL_FACTIONS, UNREST_EVENTS } from "./data/unrest";
import { PRISON_COLONY } from "./data/hazardWorlds";
import { race } from "./data/races";
import { colonyEffects, transferWonders } from "./civ";
import { distance } from "./formulas";
import { exploreStar } from "./knowledge";
import * as R from "./rng";
import type { Colony, Empire, GameState, Id, PendingEvent } from "./types";

/** Unrest at which output starts suffering is 0; at 100 a colony loses this share of its output. */
export const UNREST_MAX_PENALTY = 0.25;
export const UNREST_EVENT_AT = 30;
export const REVOLT_AT = 65;
/** Rebel empires that can exist in one game (so the map never fills with splinters). */
export const MAX_REBEL_EMPIRES = 4;
/** How fast unrest moves toward its target each turn. */
const DRIFT = 0.15;
/** Chance per turn that an empire with a restless world gets an unrest event. */
const UNREST_EVENT_CHANCE = 0.05;

const REBEL_COLORS = ["#c94f7c", "#9b6b3d", "#6d8f3a", "#b8b8b8", "#7a5cc4", "#3fa39b"];

export function unrestOf(c: Colony): number {
  return c.unrest ?? 0;
}

/** Share of output lost to unrest (0 .. UNREST_MAX_PENALTY). */
export function unrestPenalty(c: Colony): number {
  return (Math.min(100, unrestOf(c)) / 100) * UNREST_MAX_PENALTY;
}

export interface UnrestPart { label: string; amount: number }

/** Why a colony is restless (positive) or calm (negative). Its sum, 0..100, is where unrest is heading. */
export function unrestBreakdown(state: GameState, c: Colony): UnrestPart[] {
  const e = state.empires[c.empireId]!;
  if (c.isCapital) return [{ label: "Capital: loyal to the crown", amount: 0 }];
  const parts: UnrestPart[] = [];
  const add = (label: string, amount: number) => { if (Math.abs(amount) >= 0.5) parts.push({ label, amount: Math.round(amount) }); };
  // Occupation: a conquered people resent their new rulers; it fades over about 100 turns, but never fully.
  if (c.peopleRaceId && c.peopleRaceId !== e.raceId) {
    const since = state.turn - (c.occupiedSince ?? 0);
    add(`Occupied ${race(c.peopleRaceId).name} people`, 15 + 45 * Math.max(0, 1 - since / 120));
  }
  const home = state.stars[e.capitalStarId];
  const s = state.stars[c.starId]!;
  if (home) add("Far from the capital", Math.min(15, Math.max(0, distance(home.x, home.y, s.x, s.y) - 8) * 1.2));
  const colonies = Object.values(state.colonies).filter((x) => x.empireId === e.id).length;
  add("Sprawling empire", Math.min(15, Math.max(0, colonies - 12) * 0.6));
  let weariness = 0;
  for (const since of Object.values(e.atWar)) weariness += Math.max(0, (state.turn - since - 30) / 4);
  add("War weariness", Math.min(12, weariness));
  add("Foreign agitators", Math.min(40, c.agitation ?? 0));
  if (c.prison) add("Prison colony", PRISON_COLONY.unrestPerTurn * 5);
  add("Internal security", -e.security * 2);
  add("Culture buildings", -colonyEffects(c).culture * 2);
  if (e.goldenAge) add("Golden age", -15);
  return parts;
}

export function unrestTarget(state: GameState, c: Colony): number {
  return Math.max(0, Math.min(100, unrestBreakdown(state, c).reduce((a, p) => a + p.amount, 0)));
}

/** Change a colony's unrest by an amount (events, spies, conquest). */
export function addUnrest(c: Colony, amount: number): void {
  c.unrest = Math.max(0, Math.min(100, unrestOf(c) + amount));
}

/** Called when a colony is captured: remember whose people live there. */
export function onCapture(state: GameState, captured: Colony, old: Colony, oldOwner: Empire, newOwner: Empire): void {
  const people = old.peopleRaceId ?? state.empires[oldOwner.id]!.raceId;
  if (people === newOwner.raceId) {
    // Freeing our own people: no resentment.
    delete captured.peopleRaceId; delete captured.occupiedFrom; delete captured.occupiedSince;
    captured.unrest = 0;
    return;
  }
  captured.peopleRaceId = people;
  // The empire these people belong to: their old owner, or the one they were taken from before.
  captured.occupiedFrom = old.peopleRaceId && old.peopleRaceId !== oldOwner.raceId && old.occupiedFrom !== undefined ? old.occupiedFrom : oldOwner.id;
  captured.occupiedSince = state.turn;
  captured.unrest = 60;
}

function event(state: GameState, empireId: Id | null, text: string, starId?: Id): void {
  state.events.push({ turn: state.turn, empireId, kind: "unrest", text, ...(starId !== undefined ? { starId } : {}) });
}

/** Hand a colony to another empire, keeping its people, factories and buildings. */
function transferColony(state: GameState, c: Colony, to: Empire): void {
  const from = state.empires[c.empireId]!;
  c.empireId = to.id;
  c.isCapital = false;
  c.buildTemplate = null;
  c.shipProgress = 0;
  c.buildQueue = null;
  c.buildProgress = 0;
  transferWonders(state, c.starId, to);
  exploreStar(state, to, state.stars[c.starId]!, false);
  if (from.capitalStarId === c.starId) {
    const next = Object.values(state.colonies).filter((x) => x.empireId === from.id).sort((a, b) => b.population - a.population || a.starId - b.starId)[0];
    if (next) { next.isCapital = true; from.capitalStarId = next.starId; }
  }
}

function setWar(state: GameState, a: Empire, b: Empire): void {
  if (!a.contacts.includes(b.id)) a.contacts.push(b.id);
  if (!b.contacts.includes(a.id)) b.contacts.push(a.id);
  for (const k of Object.keys(a.treaties[b.id] ?? {})) { delete a.treaties[b.id]![k as never]; delete b.treaties[a.id]?.[k as never]; }
  a.atWar[b.id] = state.turn;
  b.atWar[a.id] = state.turn;
  a.relations[b.id] = -60;
  b.relations[a.id] = -60;
}

/** An occupied world rises up and rejoins its own people's empire. */
function liberate(state: GameState, c: Colony, to: Empire): void {
  const from = state.empires[c.empireId]!;
  const s = state.stars[c.starId]!;
  transferColony(state, c, to);
  delete c.peopleRaceId; delete c.occupiedFrom; delete c.occupiedSince;
  c.unrest = 10;
  c.agitation = 0;
  c.population = Math.max(1, c.population * 0.85);
  event(state, null, `Uprising on ${s.name}! Its people threw out the ${from.name} and rejoined the ${to.name}.`, s.id);
}

/** Restless worlds break away as a new empire, at war with the one they left. */
function civilWar(state: GameState, first: Colony): void {
  const parent = state.empires[first.empireId]!;
  const fs = state.stars[first.starId]!;
  const group = Object.values(state.colonies)
    .filter((x) => x.empireId === parent.id && !x.isCapital && (x === first || unrestOf(x) >= 45))
    .filter((x) => { const s = state.stars[x.starId]!; return distance(s.x, s.y, fs.x, fs.y) <= 6; })
    .sort((a, b) => a.starId - b.starId);
  // Never take more than a third of the empire in one go.
  const total = Object.values(state.colonies).filter((x) => x.empireId === parent.id).length;
  const rebels = group.sort((a, b) => unrestOf(b) - unrestOf(a) || a.starId - b.starId).slice(0, Math.max(1, Math.floor(total / 3)));
  if (!rebels.includes(first)) rebels[rebels.length - 1] = first;
  const capital = [...rebels].sort((a, b) => b.population - a.population || a.starId - b.starId)[0]!;
  const raceId = capital.peopleRaceId ?? parent.raceId;
  const faction = REBEL_FACTIONS.find((f) => f.raceId === raceId);
  const capName = state.stars[capital.starId]!.name;
  // Text says "the <name>", so drop a leading "The".
  const name = (faction?.name ?? `Free Worlds of {colony}`).replace(/\{colony\}/g, capName).replace(/^The /, "");
  const rebelCount = state.empires.filter((x) => x.rebelOf !== undefined).length;
  const id = state.empires.length;
  const rebel: Empire = {
    id, name, raceId, color: REBEL_COLORS[rebelCount % REBEL_COLORS.length]!, isPlayer: false, alive: true,
    capitalStarId: capital.starId,
    treasury: 100 + 50 * rebels.length,
    research: structuredClone(parent.research),
    knowledge: structuredClone(parent.knowledge),
    contacts: [], atWar: {}, peaceOffers: [], relations: {}, treaties: {}, spies: {},
    security: 4, culture: 0, goldenAges: 0, goldenAgeUntil: 0, goldenAge: false,
    wonders: [], leaders: [], leaderOffer: null, borderWarned: {},
    rebelOf: parent.id,
  };
  state.empires.push(rebel);
  // The rebels keep the ship designs they knew.
  for (const d of Object.values(state.designs).filter((d) => d.empireId === parent.id).sort((a, b) => a.id.localeCompare(b.id))) {
    const copy = { ...structuredClone(d), id: `d${state.nextDesignId++}`, empireId: id };
    state.designs[copy.id] = copy;
  }
  for (const c of rebels) {
    transferColony(state, c, rebel);
    c.unrest = 15;
    c.agitation = 0;
    // Old grudges go with the old empire: the rebels' own people are no longer "occupied".
    if (c.peopleRaceId === raceId) { delete c.peopleRaceId; delete c.occupiedFrom; delete c.occupiedSince; }
  }
  capital.isCapital = true;
  // Half the idle fleets guarding the rebel worlds defect.
  const rebelStars = new Set(rebels.map((c) => c.starId));
  for (const f of state.fleets.filter((f) => f.empireId === parent.id && f.starId !== null && rebelStars.has(f.starId) && f.destStarId === null).sort((a, b) => a.id - b.id)) {
    if (R.chance(state.rng, 0.5)) f.empireId = id;
  }
  setWar(state, rebel, parent);
  const worlds = rebels.map((c) => state.stars[c.starId]!.name).join(", ");
  event(state, null, `Civil war! ${worlds} broke away from the ${parent.name} as ${name}.${faction ? ` "${faction.manifesto.replace(/\{colony\}/g, capName)}"` : ""}`, capital.starId);
}

/** Restless worlds that can't break away: riots are crushed, at a cost. */
function crushed(state: GameState, c: Colony): void {
  const s = state.stars[c.starId]!;
  c.population = Math.max(1, c.population * 0.85);
  c.factories *= 0.9;
  c.unrest = 50;
  event(state, c.empireId, `Riots on ${s.name} were put down. Many died and factories burned.`, s.id);
}

function revolt(state: GameState, c: Colony): void {
  const owner = state.empires[c.empireId]!;
  const back = c.occupiedFrom !== undefined ? state.empires[c.occupiedFrom] : undefined;
  if (back && back.alive && back.id !== owner.id && c.peopleRaceId === back.raceId) return liberate(state, c, back);
  // Otherwise a conquered people join any living empire of their own kind (often earlier rebels).
  const kin = c.peopleRaceId ? state.empires.find((x) => x.alive && x.id !== owner.id && x.raceId === c.peopleRaceId) : undefined;
  if (kin) return liberate(state, c, kin);
  const mine = Object.values(state.colonies).filter((x) => x.empireId === owner.id).length;
  const rebels = state.empires.filter((x) => x.rebelOf !== undefined).length;
  if (mine >= 4 && rebels < MAX_REBEL_EMPIRES) return civilWar(state, c);
  crushed(state, c);
}

function unrestEvent(state: GameState, e: Empire, c: Colony): void {
  const recent = new Set(e.recentEvents ?? []);
  const options = UNREST_EVENTS.filter((d) => !recent.has(d.id));
  if (!options.length) return;
  const def = R.pick(state.rng, options);
  const contacts = e.contacts.filter((id) => state.empires[id]!.alive).sort((a, b) => a - b);
  const p: PendingEvent = {
    id: state.nextEventId++, empireId: e.id, eventId: def.id, turn: state.turn,
    colonyStarId: c.starId, starId: c.starId, rivalId: contacts.length ? R.pick(state.rng, contacts) : null,
  };
  state.pendingEvents.push(p);
  e.recentEvents = [...(e.recentEvents ?? []), def.id].slice(-8);
}

/** Once per turn, after culture: unrest drifts, events fire, revolts happen. */
export function processUnrest(state: GameState): void {
  const colonies = Object.values(state.colonies).sort((a, b) => a.starId - b.starId);
  for (const c of colonies) {
    const target = unrestTarget(state, c);
    c.unrest = unrestOf(c) + (target - unrestOf(c)) * DRIFT;
    if (c.unrest < 0.05) c.unrest = 0;
    if (c.agitation) { c.agitation *= 0.9; if (c.agitation < 1) delete c.agitation; }
  }
  for (const e of state.empires) {
    if (!e.alive) continue;
    const mine = colonies.filter((c) => c.empireId === e.id && !c.isCapital);
    const restless = mine.filter((c) => unrestOf(c) >= UNREST_EVENT_AT).sort((a, b) => unrestOf(b) - unrestOf(a) || a.starId - b.starId);
    if (restless.length && !state.pendingEvents.some((p) => p.empireId === e.id) && R.chance(state.rng, UNREST_EVENT_CHANCE)) {
      unrestEvent(state, e, restless[0]!);
    }
    for (const c of restless) {
      if (unrestOf(c) < REVOLT_AT || state.colonies[c.starId]?.empireId !== e.id || c.isCapital) continue;
      const funded = (c.rebelsFundedUntil ?? 0) > state.turn ? 2 : 1;
      if (R.chance(state.rng, (0.03 + (unrestOf(c) - REVOLT_AT) * 0.002) * funded)) revolt(state, c);
    }
  }
}
