// The supernova crisis: once per game a star with colonies around it starts to die.
// Every empire with a world within reach hears four countdown warnings (Gemini's text,
// data/supernova.ts); its answers decide how hard the blast hits and which aftermath it
// sees. The dead star leaves a remnant that feeds research to ships parked there.
// No random draws: the star and the turn come from the seed and the map, so the crisis
// never shifts any other random roll in the game.

import { QUORAI_SUPERNOVA, REMNANTS, SUPERNOVA_AFTERMATH, SUPERNOVA_WARNINGS } from "./data/supernova";
import { distance } from "./formulas";
import { transferWonders } from "./civ";
import { moveCapital } from "./combat";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export type SupernovaPlan = "evacuated" | "harvested" | "stayed";

export interface SupernovaState {
  starId: Id;
  startTurn: number;
  blowTurn: number;
  /** Empires with a colony in reach when the warnings began. */
  affected: Id[];
  /** What each affected empire chose in the warnings (evacuating beats harvesting beats staying). */
  plans: Record<Id, SupernovaPlan>;
  /** REMNANTS id once the star has blown. */
  remnantId: string | null;
}

export const SUPERNOVA_EVENTS = [...SUPERNOVA_WARNINGS, ...SUPERNOVA_AFTERMATH, QUORAI_SUPERNOVA];

/** Colonies this close feel the warnings and the outer blast. */
export const REACH = 4;
/** Colonies this close take the full blast. */
export const INNER = 2;
/** Turns from the first flicker to the blast. */
export const COUNTDOWN = 20;
/** When the warnings arrive, in turns after the first flicker (one per warning event). */
const WARNING_AT = [0, 5, 10, 15];
const QUORAI_AT = 12;
/** Earliest turn, plus a seed-based spread so games differ. */
const EARLIEST = 130;
const SPREAD = 70;

/** Share of population and factories lost, by plan: [full blast, outer blast]. */
export const BLAST_LOSS: Record<SupernovaPlan, [number, number]> = {
  stayed: [0.6, 0.25],
  harvested: [0.5, 0.2],
  evacuated: [0.25, 0.08],
};

/** Which answer in each warning means what. Warning 1 decides nothing yet. */
const PLAN_BY_CHOICE: Record<string, SupernovaPlan[]> = {
  "supernova-warning-2-fifteen-turns": ["evacuated", "harvested", "stayed"],
  "supernova-warning-3-ten-turns": ["evacuated", "stayed", "stayed"],
  "supernova-warning-4-five-turns": ["evacuated", "harvested", "stayed"],
};
const RANK: Record<SupernovaPlan, number> = { stayed: 0, harvested: 1, evacuated: 2 };
const AFTERMATH_ID: Record<SupernovaPlan, string> = {
  evacuated: "supernova-aftermath-evacuated",
  stayed: "supernova-aftermath-stayed",
  harvested: "supernova-aftermath-harvested",
};

function seedNumber(state: GameState): number {
  const s = String(state.settings.seed);
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** The turn this game's star starts to die. */
export function supernovaTurn(state: GameState): number {
  return EARLIEST + (seedNumber(state) % SPREAD);
}

function coloniesNear(state: GameState, starId: Id, radius: number) {
  const s = state.stars[starId]!;
  return Object.values(state.colonies).filter((c) => {
    const t = state.stars[c.starId]!;
    return c.starId !== starId && distance(s.x, s.y, t.x, t.y) <= radius;
  });
}

/** The doomed star: uncolonized, not a home world, with the most empires and colonies around it. */
function pickStar(state: GameState): Id | null {
  const homes = new Set(state.empires.map((e) => e.capitalStarId));
  let best: Id | null = null;
  let bestScore = 0;
  const salt = seedNumber(state);
  for (const s of state.stars) {
    if (state.colonies[s.id] || homes.has(s.id)) continue;
    const near = coloniesNear(state, s.id, REACH);
    if (near.length === 0) continue;
    const empires = new Set(near.map((c) => c.empireId)).size;
    // Prefer stars that touch several empires; break ties by a seed-based shuffle of ids.
    const score = empires * 100 + near.length * 10 + ((s.id * 7919 + salt) % 10);
    if (score > bestScore) { bestScore = score; best = s.id; }
  }
  return best;
}

function nearestColony(state: GameState, e: Empire, starId: Id): Id | null {
  const s = state.stars[starId]!;
  let best: Id | null = null;
  let bestD = Infinity;
  for (const c of Object.values(state.colonies)) {
    if (c.empireId !== e.id) continue;
    const t = state.stars[c.starId]!;
    const d = distance(s.x, s.y, t.x, t.y);
    if (d < bestD) { bestD = d; best = c.starId; }
  }
  return best;
}

function pushEvent(state: GameState, e: Empire, eventId: string, starId: Id): void {
  const p: PendingEvent = {
    id: state.nextEventId++, empireId: e.id, eventId, turn: state.turn,
    colonyStarId: nearestColony(state, e, starId), starId, rivalId: null,
  };
  state.pendingEvents.push(p);
}

function begin(state: GameState): void {
  const starId = pickStar(state);
  if (starId === null) return;
  const affected = [...new Set(coloniesNear(state, starId, REACH).map((c) => c.empireId))].sort((a, b) => a - b);
  const nova: SupernovaState = {
    starId, startTurn: state.turn, blowTurn: state.turn + COUNTDOWN, affected,
    plans: Object.fromEntries(affected.map((id) => [id, "stayed" as SupernovaPlan])), remnantId: null,
  };
  (state.supernovae ??= []).push(nova);
  state.events.push({ turn: state.turn, empireId: null, kind: "info", starId,
    text: `Astronomers everywhere report violent flickering in ${state.stars[starId]!.name}. Some say it is dying.` });
}

function warn(state: GameState, nova: SupernovaState): void {
  const step = state.turn - nova.startTurn;
  const i = WARNING_AT.indexOf(step);
  for (const id of nova.affected) {
    const e = state.empires[id]!;
    if (!e.alive) continue;
    if (i >= 0) pushEvent(state, e, SUPERNOVA_WARNINGS[i]!.id, nova.starId);
    if (step === QUORAI_AT && e.raceId === "quorai") pushEvent(state, e, QUORAI_SUPERNOVA.id, nova.starId);
  }
}

function blow(state: GameState, nova: SupernovaState): void {
  const s = state.stars[nova.starId]!;
  // Fleets orbiting the star are lost.
  const lost = state.fleets.filter((f) => f.starId === s.id);
  state.fleets = state.fleets.filter((f) => f.starId !== s.id);
  for (const f of lost) {
    state.events.push({ turn: state.turn, empireId: f.empireId, kind: "battle", starId: s.id, text: `Our fleet at ${s.name} was lost in the supernova.` });
  }
  // A colony founded on the dying star's own planet during the countdown is lost with it.
  const onStar = state.colonies[s.id];
  if (onStar) {
    const owner = state.empires[onStar.empireId]!;
    delete state.colonies[s.id];
    transferWonders(state, s.id, null);
    if (owner.capitalStarId === s.id) moveCapital(state, owner);
    state.events.push({ turn: state.turn, empireId: owner.id, kind: "battle", starId: s.id, text: `Our colony on ${s.name} was destroyed when the star exploded.` });
  }
  // The blast: colonies keep at least one population so no world vanishes outright.
  for (const c of coloniesNear(state, s.id, REACH)) {
    const t = state.stars[c.starId]!;
    const plan = nova.plans[c.empireId] ?? "stayed";
    const share = BLAST_LOSS[plan][distance(s.x, s.y, t.x, t.y) <= INNER ? 0 : 1];
    c.population = Math.max(1, c.population * (1 - share));
    c.factories = Math.floor(c.factories * (1 - share));
  }
  s.planet = null;
  nova.remnantId = REMNANTS[(nova.starId + seedNumber(state)) % REMNANTS.length]!.id;
  const remnant = REMNANTS.find((r) => r.id === nova.remnantId)!;
  state.events.push({ turn: state.turn, empireId: null, kind: "info", starId: s.id,
    text: `${s.name} has exploded! What remains is the ${remnant.name}: ${remnant.description} Ships stationed there learn from it.` });
  for (const id of nova.affected) {
    const e = state.empires[id]!;
    if (e.alive && nearestColony(state, e, s.id) !== null) pushEvent(state, e, AFTERMATH_ID[nova.plans[id] ?? "stayed"], s.id);
  }
}

/** Research from remnants: every empire with a fleet parked at one learns from it each turn. */
function study(state: GameState, nova: SupernovaState): void {
  const r = REMNANTS.find((x) => x.id === nova.remnantId);
  if (!r) return;
  const here = new Set(state.fleets.filter((f) => f.starId === nova.starId).map((f) => f.empireId));
  for (const id of here) {
    const e = state.empires[id]!;
    if (e.alive) e.research.progress[r.field] += r.researchPerTurn;
  }
}

/** Once a turn. */
export function processSupernova(state: GameState): void {
  if (!state.supernovae?.length && state.turn >= supernovaTurn(state)) begin(state);
  for (const nova of state.supernovae ?? []) {
    if (nova.remnantId) study(state, nova);
    else if (state.turn >= nova.blowTurn) blow(state, nova);
    else warn(state, nova);
  }
}

/** Called when any event is answered: a warning answer sets that empire's plan. */
export function noteSupernovaChoice(state: GameState, p: PendingEvent, choice: number): void {
  const plan = PLAN_BY_CHOICE[p.eventId]?.[choice];
  if (!plan) return;
  const nova = (state.supernovae ?? []).find((n) => n.remnantId === null && n.affected.includes(p.empireId));
  if (!nova) return;
  const now = nova.plans[p.empireId] ?? "stayed";
  if (RANK[plan] > RANK[now]) nova.plans[p.empireId] = plan;
}
