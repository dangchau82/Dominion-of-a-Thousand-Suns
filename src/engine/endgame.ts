// Endgame paths and great works (written by Claude 2; Danny's design, handed over by the
// main Claude on 2026-11-26).
//
// How an empire plays opens one or more paths:
//   Feared  - conquered worlds are a third or more of its empire (and many), or it is at war
//             with three empires, has taken worlds, and is hated by two thirds of those it knows.
//   Beloved - it has two allies and warm relations with those it knows (or three allies).
//   Builder - it holds many worlds and out-produces the average empire by a fifth.
// When a path opens, the empire is offered its path's great work, or its race's own great
// work (data/greatWorks.ts). A work is paid for over many turns (it stalls on an empty
// treasury), enemies at war may sabotage it, and the whole galaxy hears when one starts
// and finishes.
//
// The Ascension Gate (technology victory) now needs, besides tier 10 in all six fields,
// a minimum number of worlds (scaled by map) and one finished great work: see `gateReady`.
//
// Hooks: civ.ts `buildable` (Gate line), victory.ts `votesOf`, view.ts (`endgame`),
// turn.ts, events.ts, types.ts, save.ts. No random draws.

import { adjustRelation, relation } from "./diplomacy";
import { transferWonders } from "./civ";
import { moveCapital } from "./combat";
import { ALL_WORKS, PATH_NAMES, PATH_WORKS, RACE_WORKS, WORK_BY_ID, type EndgamePath, type GreatWorkDef } from "./data/greatWorks";
import { CRACK_EVENT_ID, PATH_OFFER_PREFIX, WORK_SABOTAGE_ID } from "./endgameEvents";
import { designsOf } from "./designs";
import { colonyProduction } from "./formulas";
import { empireRace, shipCount } from "./game";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface GreatWork {
  workId: string;
  starId: Id;
  started: number;
  done: number;
  finished: boolean;
  finishedTurn?: number;
  sabotageAt: number;
}

export interface EndgameState {
  /** Turn each path opened. Once open, a path stays open. */
  paths: Partial<Record<EndgamePath, number>>;
  works: GreatWork[];
  /** Paths already offered (each is offered once). */
  offered: EndgamePath[];
  /** World-cracker cooldown. */
  crackAt?: number;
}

/** One great work per empire: it is what the empire is remembered for. */
export const MAX_WORKS = 1;
export const SABOTAGE_GAP = 30;
export const SABOTAGE_SETBACK = 8;
export const CRACK_GAP = 12;
/** Finishing the Sundering Engine: every other empire's opinion of the builder drops this much. */
export const TERROR = 60;

const PATHS: EndgamePath[] = ["feared", "beloved", "builder"];

// ---- Map-scaled thresholds -------------------------------------------------------------

/** Stars per empire at the start of the game (about 13 on every map size). */
function starsPerEmpire(state: GameState): number {
  return state.stars.length / Math.max(1, state.empires.filter((e) => e.rebelOf === undefined).length);
}
/** Worlds needed for the Ascension Gate. */
export function gateWorlds(state: GameState): number { return Math.max(4, Math.round(0.5 * starsPerEmpire(state))); }
/** Conquered worlds that open the Feared path. */
export function fearedConquests(state: GameState): number { return Math.max(5, Math.round(0.5 * starsPerEmpire(state))); }
/** Worlds that (with high production) open the Builder path. */
export function builderWorlds(state: GameState): number { return Math.max(6, Math.round(0.75 * starsPerEmpire(state))); }

// ---- Events -----------------------------------------------------------------------------

/** Fills "{work}" in these events. */
export function endgameWorkText(state: GameState, p: PendingEvent): string | null {
  if (p.eventId.startsWith(PATH_OFFER_PREFIX)) {
    const w = raceWork(state.empires[p.empireId]!);
    return w ? `the ${w.name}` : null;
  }
  if (p.eventId === WORK_SABOTAGE_ID && p.rivalId !== null) {
    const w = state.endgame?.[p.rivalId]?.works.find((x) => !x.finished && x.starId === p.starId);
    return w ? `the ${WORK_BY_ID.get(w.workId)!.name}` : null;
  }
  return null;
}

// ---- Helpers ----------------------------------------------------------------------------

export function raceWork(e: Empire): GreatWorkDef | undefined {
  return RACE_WORKS.find((w) => w.raceId === e.raceId);
}

function mine(state: GameState, e: Empire) {
  return Object.values(state.colonies).filter((c) => c.empireId === e.id);
}

function production(state: GameState, e: Empire): number {
  const r = empireRace(e);
  return mine(state, e).reduce((a, c) => a + colonyProduction(c, state.stars[c.starId]!.planet!, e, r), 0);
}

function living(state: GameState): Empire[] {
  return state.empires.filter((e) => e.alive && e.rebelOf === undefined);
}

/** Which paths this empire's record opens right now. */
export function pathsEarned(state: GameState, e: Empire): EndgamePath[] {
  const out: EndgamePath[] = [];
  const cols = mine(state, e);
  const known = e.contacts.map((id) => state.empires[id]).filter((o): o is Empire => !!o?.alive && o.id !== e.id);
  // Feared
  const conquered = cols.filter((c) => c.occupiedFrom !== undefined || c.peopleRaceId !== undefined).length;
  const wars = known.filter((o) => e.atWar[o.id] !== undefined).length;
  const hatedBy = known.filter((o) => relation(o, e) <= -40).length;
  // Conquest must be a large part of the empire, not a side line of a big one.
  if ((conquered >= fearedConquests(state) && conquered * 3 >= cols.length) || (wars >= 3 && conquered >= 2 && known.length > 0 && hatedBy * 3 >= known.length * 2)) out.push("feared");
  // Beloved
  const allies = known.filter((o) => e.treaties[o.id]?.alliance !== undefined).length;
  const warmth = known.length ? known.reduce((a, o) => a + relation(o, e), 0) / known.length : 0;
  if (allies >= 3 || (allies >= 2 && warmth >= 30)) out.push("beloved");
  // Builder
  if (cols.length >= builderWorlds(state)) {
    const others = living(state);
    const avg = others.reduce((a, o) => a + production(state, o), 0) / Math.max(1, others.length);
    if (production(state, e) >= avg * 1.2) out.push("builder");
  }
  return out;
}

/** True if this empire may start the Ascension Gate (on top of the tech requirement). */
export function gateReady(state: GameState, e: Empire): boolean {
  const st = state.endgame?.[e.id];
  return mine(state, e).length >= gateWorlds(state) && !!st?.works.some((w) => w.finished);
}

/** Extra council votes from finished works. */
export function endgameVotes(state: GameState, e: Empire, base: number): number {
  let share = 0;
  for (const w of state.endgame?.[e.id]?.works ?? []) {
    if (!w.finished) continue;
    for (const fx of WORK_BY_ID.get(w.workId)!.effects) if (fx.kind === "votes") share += fx.share;
  }
  return Math.round(base * share);
}

function news(state: GameState, empireId: Id | null, text: string, starId: Id | null, kind: "info" | "saga" = "info"): void {
  state.events.push({ turn: state.turn, empireId, kind, starId: starId ?? undefined, text });
}

const busy = (state: GameState, id: Id) => state.pendingEvents.some((p) => p.empireId === id);

/** Minimum ships in a fleet for the Sundering Engine to travel with it. */
export const CRACKER_ESCORT = 1;

/** The Engine joins our strongest fleet that is sitting over an enemy world. */
function crackerFleet(state: GameState, e: Empire) {
  return state.fleets
    .filter((f) => f.empireId === e.id && f.starId !== null && shipCount(f) >= CRACKER_ESCORT)
    .filter((f) => { const c = state.colonies[f.starId!]; return !!c && c.empireId !== e.id && e.atWar[c.empireId] !== undefined; })
    .sort((a, b) => shipCount(b) - shipCount(a) || a.id - b.id)[0];
}

// ---- Each turn --------------------------------------------------------------------------

export function processEndgame(state: GameState): void {
  for (const e of living(state)) {
    const st = ((state.endgame ??= {})[e.id] ??= { paths: {}, works: [], offered: [] });
    // Paths open.
    for (const p of pathsEarned(state, e)) {
      if (st.paths[p] !== undefined) continue;
      st.paths[p] = state.turn;
      news(state, e.id, `Our deeds have opened the Path of ${PATH_NAMES[p]}.`, null);
      news(state, null, `The galaxy now speaks of the ${e.name} as ${PATH_NAMES[p]}.`, null);
    }
    // Work on great works.
    for (const w of st.works) {
      const def = WORK_BY_ID.get(w.workId)!;
      if (w.finished) { applyWork(state, e, w, def); continue; }
      if (state.colonies[w.starId]?.empireId !== e.id) continue; // lost the site: work stops
      if (e.treasury < def.upkeep) continue;
      e.treasury -= def.upkeep;
      w.done++;
      if (w.done >= def.turns) finishWork(state, e, w, def);
      else if (state.turn >= w.sabotageAt) offerSabotage(state, e, w);
    }
    // Offer the next great work.
    if (st.works.length >= MAX_WORKS || st.works.some((w) => !w.finished) || busy(state, e.id)) continue;
    // The path that opened first is offered first.
    const next = PATHS.filter((p) => st.paths[p] !== undefined && !st.offered.includes(p)).sort((a, b) => st.paths[a]! - st.paths[b]!)[0];
    if (!next || state.colonies[e.capitalStarId]?.empireId !== e.id) continue;
    st.offered.push(next);
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: PATH_OFFER_PREFIX + next, turn: state.turn, colonyStarId: e.capitalStarId, starId: e.capitalStarId, rivalId: null });
  }
}

function offerSabotage(state: GameState, e: Empire, w: GreatWork): void {
  const foe = living(state).filter((o) => o.id !== e.id && e.atWar[o.id] !== undefined && !busy(state, o.id)).sort((a, b) => a.id - b.id)[0];
  if (!foe) return;
  w.sabotageAt = state.turn + SABOTAGE_GAP;
  state.pendingEvents.push({ id: state.nextEventId++, empireId: foe.id, eventId: WORK_SABOTAGE_ID, turn: state.turn, colonyStarId: null, starId: w.starId, rivalId: e.id });
}

function finishWork(state: GameState, e: Empire, w: GreatWork, def: GreatWorkDef): void {
  w.finished = true;
  w.finishedTurn = state.turn;
  news(state, null, `The ${e.name} have completed the ${def.name} at ${state.stars[w.starId]!.name}.`, w.starId, "saga");
  if (def.effects.some((fx) => fx.kind === "cracker")) {
    for (const o of living(state)) if (o.id !== e.id) adjustRelation(o, e, -TERROR);
    news(state, null, `Every court in the galaxy recoils: the ${e.name} now hold a weapon that can kill worlds.`, w.starId, "saga");
  }
}

function applyWork(state: GameState, e: Empire, w: GreatWork, def: GreatWorkDef): void {
  const since = state.turn - (w.finishedTurn ?? state.turn);
  for (const fx of def.effects) {
    switch (fx.kind) {
      case "money": e.treasury += fx.perTurn; break;
      case "tradeCut": e.treasury += fx.perContact * e.contacts.filter((id) => state.empires[id]?.alive).length; break;
      case "research": e.research.progress[fx.field] += fx.perTurn; break;
      case "culture": e.culture += fx.perTurn; break;
      case "energy": {
        const p = Math.round(production(state, e) * fx.share);
        e.treasury += p;
        e.research.progress.computers += p;
        break;
      }
      case "goodwill":
        if (since > 0 && since % 10 === 0) for (const id of e.contacts) { const o = state.empires[id]; if (o?.alive) adjustRelation(o, e, fx.per10); }
        break;
      case "hatch":
        if (since > 0 && since % fx.every === 0) hatch(state, e, fx.count, def.name);
        break;
      case "cracker": crackerTurn(state, e); break;
      case "votes": break; // counted in votesOf
    }
  }
}

function hatch(state: GameState, e: Empire, count: number, from: string): void {
  const cap = state.colonies[e.capitalStarId];
  if (!cap || cap.empireId !== e.id) return;
  const best = designsOf(state, e.id).filter((d) => d.role === "warship" && d.weapons.length > 0).sort((a, b) => b.cost - a.cost || a.id.localeCompare(b.id))[0];
  if (!best) return;
  const s = state.stars[e.capitalStarId]!;
  state.fleets.push({ id: state.nextFleetId++, empireId: e.id, ships: { [best.id]: count }, x: s.x, y: s.y, starId: s.id, destStarId: null });
  news(state, e.id, `${count} new ${best.name}s have come out of the ${from} at ${s.name}.`, s.id);
}

function crackerTurn(state: GameState, e: Empire): void {
  const st = state.endgame![e.id]!;
  if ((st.crackAt ?? 0) > state.turn || busy(state, e.id)) return;
  const f = crackerFleet(state, e);
  const c = f ? state.colonies[f.starId!] : undefined;
  if (!c) return;
  st.crackAt = state.turn + CRACK_GAP;
  state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: CRACK_EVENT_ID, turn: state.turn, colonyStarId: c.starId, starId: c.starId, rivalId: c.empireId });
}

/** Destroy a world outright (the Sundering Engine). */
function crackWorld(state: GameState, by: Empire, starId: Id): void {
  const c = state.colonies[starId];
  if (!c) return;
  const owner = state.empires[c.empireId]!;
  delete state.colonies[starId];
  transferWonders(state, starId, null);
  if (owner.capitalStarId === starId) moveCapital(state, owner);
  const s = state.stars[starId]!;
  if (s.planet) s.planet.special = "death:cracked";
  for (const o of living(state)) if (o.id !== by.id) adjustRelation(o, by, -15);
  news(state, null, `The ${by.name} turned their Sundering Engine on ${s.name}. The world of the ${owner.name} is gone.`, starId, "saga");
}

/** Called when any event is answered. */
export function noteEndgameChoice(state: GameState, p: PendingEvent, choice: number): void {
  const e = state.empires[p.empireId]!;
  if (p.eventId.startsWith(PATH_OFFER_PREFIX)) {
    if (choice > 1) return;
    const path = p.eventId.slice(PATH_OFFER_PREFIX.length) as EndgamePath;
    const def = choice === 0 ? PATH_WORKS.find((w) => w.path === path) : raceWork(e);
    if (!def) return;
    const site = p.colonyStarId ?? e.capitalStarId;
    state.endgame![e.id]!.works.push({ workId: def.id, starId: site, started: state.turn, done: 0, finished: false, sabotageAt: state.turn + SABOTAGE_GAP });
    news(state, null, `The ${e.name} have begun the ${def.name}.`, site);
    if (def.effects.some((fx) => fx.kind === "cracker")) for (const o of living(state)) if (o.id !== e.id) adjustRelation(o, e, -15);
  } else if (p.eventId === CRACK_EVENT_ID && choice === 0 && p.colonyStarId !== null) {
    if (state.colonies[p.colonyStarId] && state.colonies[p.colonyStarId]!.empireId !== e.id) crackWorld(state, e, p.colonyStarId);
  } else if (p.eventId === WORK_SABOTAGE_ID && choice === 0 && p.rivalId !== null) {
    const victim = state.empires[p.rivalId]!;
    const w = state.endgame?.[victim.id]?.works.find((x) => !x.finished && x.starId === p.starId);
    if (!w) return;
    w.done = Math.max(0, w.done - SABOTAGE_SETBACK);
    adjustRelation(victim, e, -10);
    news(state, victim.id, `Saboteurs from the ${e.name} have set back our ${WORK_BY_ID.get(w.workId)!.name}.`, w.starId);
  }
}

/** What an empire knows about the endgame (for its view): its own paths and works, and who else is building what. */
export function endgameSummary(state: GameState, e: Empire) {
  const st = state.endgame?.[e.id];
  return {
    paths: PATHS.filter((p) => st?.paths[p] !== undefined),
    works: (st?.works ?? []).map((w) => ({ workId: w.workId, name: WORK_BY_ID.get(w.workId)!.name, done: w.done, needs: WORK_BY_ID.get(w.workId)!.turns, finished: w.finished })),
    gateWorldsNeeded: gateWorlds(state),
    gateReady: gateReady(state, e),
    galaxy: living(state).filter((o) => o.id !== e.id && e.contacts.includes(o.id)).flatMap((o) =>
      (state.endgame?.[o.id]?.works ?? []).map((w) => ({ empireId: o.id, name: WORK_BY_ID.get(w.workId)!.name, finished: w.finished }))),
  };
}

export { ALL_WORKS };
