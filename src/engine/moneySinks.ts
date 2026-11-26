// Treasury projects ("money sinks"): ways to turn a big treasury into something, each a little worse
// than its price on average, so hoarding stops but spending never becomes a money machine.
// Data and texts by Gemini (data/moneySinks.ts); rules by Claude. Same rules for the player and the AI.
// Deterministic: outcomes are rolled with state.rng.

import { MONEY_SINKS, type MoneySinkDef, type MoneySinkOutcome } from "./data/moneySinks";
import { BUILDING_BY_ID } from "./data/buildings";
import { progressBuilding } from "./civ";
import { applyEffect } from "./events";
import { designsOf } from "./designs";
import { fieldTier } from "./tech";
import { votesOf } from "./victory";
import * as R from "./rng";
import { FIELDS, type Colony, type Empire, type GameState, type Id, type PendingEvent } from "./types";

export const SINK_BY_ID: ReadonlyMap<string, MoneySinkDef> = new Map(MONEY_SINKS.map((s) => [s.id, s]));
/** Not in play until minor races are. */
const DISABLED = new Set(["minor-race-patronage"]);
/** Mercenaries arrive worth this share of what you paid (no shipyard time is the real bargain). */
export const MERCENARY_VALUE = 1.1;

export interface SinkOption {
  id: string; name: string; description: string; cost: number;
  /** Turns until it can be used again (0 = now). */
  readyIn: number;
  /** Why it can't be bought now, or null. */
  why: string | null;
}

function coloniesOf(state: GameState, e: Empire): Colony[] {
  return Object.values(state.colonies).filter((c) => c.empireId === e.id).sort((a, b) => a.starId - b.starId);
}

export function sinkCost(state: GameState, e: Empire, def: MoneySinkDef): number {
  return Math.round(def.cost.base + state.turn * def.cost.perTurn + coloniesOf(state, e).length * def.cost.perColony);
}

/** The colony building a wonder that can be rushed (never the Ascension Gate). */
function wonderColony(state: GameState, e: Empire, starId?: Id): Colony | undefined {
  const ok = (c: Colony) => !!c.buildQueue && c.buildQueue !== "w-ascension" && !!BUILDING_BY_ID.get(c.buildQueue)?.wonder && !state.wonders[c.buildQueue];
  if (starId !== undefined) { const c = state.colonies[starId]; return c && c.empireId === e.id && ok(c) ? c : undefined; }
  return coloniesOf(state, e).filter(ok).sort((a, b) => b.buildProgress - a.buildProgress)[0];
}

export function sinkOptions(state: GameState, e: Empire): SinkOption[] {
  return MONEY_SINKS.filter((d) => !DISABLED.has(d.id)).map((d) => {
    const cost = sinkCost(state, e, d);
    const readyIn = Math.max(0, (e.sinkReady?.[d.id] ?? 0) - state.turn);
    let why: string | null = null;
    if (readyIn > 0) why = `Ready again in ${readyIn} turn${readyIn > 1 ? "s" : ""}`;
    else if (e.treasury < cost) why = `Needs ${cost} BC`;
    else if (d.id === "wonder-rush-grant" && !wonderColony(state, e)) why = "Start building a wonder first (not the Ascension Gate)";
    else if (d.id === "mercenary-contract" && !bestWarship(state, e)) why = "Design a warship first";
    return { id: d.id, name: d.name, description: d.description, cost, readyIn, why };
  });
}

function bestWarship(state: GameState, e: Empire) {
  return designsOf(state, e.id).filter((d) => d.role === "warship" && d.empireId !== null).sort((a, b) => b.cost - a.cost || a.id.localeCompare(b.id))[0];
}

function pick(state: GameState, outcomes: MoneySinkOutcome[]): MoneySinkOutcome {
  let roll = R.next(state.rng);
  for (const o of outcomes) { roll -= o.chance; if (roll < 0) return o; }
  return outcomes[outcomes.length - 1]!;
}

function fill(state: GameState, e: Empire, text: string): string {
  const cap = state.stars[e.capitalStarId]?.name ?? "the capital";
  return text.replace(/\{colony\}/g, cap).replace(/\{star\}/g, cap);
}

function event(state: GameState, e: Empire, text: string): void {
  state.events.push({ turn: state.turn, empireId: e.id, kind: "info", text });
}

/** Apply an outcome's plain effects. "relations" goes to the two contacts who like us least. */
function effects(state: GameState, e: Empire, o: MoneySinkOutcome): void {
  const p: PendingEvent = { id: 0, empireId: e.id, eventId: "", turn: state.turn, colonyStarId: e.capitalStarId, starId: e.capitalStarId, rivalId: null };
  for (const fx of o.effects) {
    if (fx.kind === "relations") {
      const rivals = e.contacts.map((id) => state.empires[id]!).filter((o2) => o2.alive)
        .sort((a, b) => (a.relations[e.id] ?? 0) - (b.relations[e.id] ?? 0) || a.id - b.id).slice(0, 2);
      for (const r of rivals) applyEffect(state, e, { ...p, rivalId: r.id }, fx);
    } else applyEffect(state, e, p, fx);
  }
}

/** Buy a treasury project. Returns an error, or null. */
export function investSink(state: GameState, e: Empire, sinkId: string, starId?: Id): string | null {
  const def = SINK_BY_ID.get(sinkId);
  if (!def || DISABLED.has(sinkId)) return "No such project";
  const opt = sinkOptions(state, e).find((o) => o.id === sinkId)!;
  if (opt.readyIn > 0) return opt.why!;
  if (e.treasury < opt.cost) return `Needs ${opt.cost} BC`;
  const cost = opt.cost;
  if (def.id === "wonder-rush-grant" && !wonderColony(state, e, starId)) return "No wonder to rush there";
  if (def.id === "mercenary-contract" && !bestWarship(state, e)) return "Design a warship first";
  e.treasury -= cost;
  (e.sinkReady ??= {})[def.id] = state.turn + def.cooldownTurns;

  // Bonds settle later; the outcome is rolled when they mature.
  if (def.outcomes.some((o) => o.special?.kind === "exchangeBond")) {
    (e.bonds ??= []).push({ sinkId: def.id, amount: cost, matures: state.turn + (def.outcomes[0]!.special!.durationTurns ?? 10) });
    event(state, e, `${def.name}: ${cost} BC invested. It pays out in ${def.outcomes[0]!.special!.durationTurns ?? 10} turns, more or less than you put in.`);
    return null;
  }
  const o = pick(state, def.outcomes);
  effects(state, e, o);
  const sp = o.special;
  if (sp?.kind === "spawnMercenaries") {
    const d = bestWarship(state, e)!;
    const n = Math.max(1, Math.floor((cost * MERCENARY_VALUE) / d.cost));
    const s = state.stars[e.capitalStarId]!;
    state.fleets.push({ id: state.nextFleetId++, empireId: e.id, ships: { [d.id]: n }, x: s.x, y: s.y, starId: s.id, destStarId: null });
  } else if (sp?.kind === "crashResearch") {
    // Into the field we are furthest behind in.
    const f = [...FIELDS].sort((a, b) => fieldTier(e.research, a) - fieldTier(e.research, b) || FIELDS.indexOf(a) - FIELDS.indexOf(b))[0]!;
    e.research.progress[f] += cost * sp.value;
  } else if (sp?.kind === "councilVoteShare") {
    const total = state.empires.reduce((a, x) => a + votesOf(state, x), 0);
    e.councilBoost = { votes: Math.max(1, Math.round(total * sp.value)), until: state.turn + (sp.durationTurns ?? 15) };
  } else if (sp?.kind === "wonderRush") {
    progressBuilding(state, e, wonderColony(state, e, starId)!, cost * sp.value);
  }
  event(state, e, `${def.name}: ${fill(state, e, o.result)}`);
  return null;
}

/** Once a turn: bonds that matured pay out. */
export function processMoneySinks(state: GameState): void {
  for (const e of state.empires) {
    if (!e.bonds?.length || !e.alive) continue;
    const due = e.bonds.filter((b) => b.matures <= state.turn);
    e.bonds = e.bonds.filter((b) => b.matures > state.turn);
    for (const b of due) {
      const def = SINK_BY_ID.get(b.sinkId)!;
      const o = pick(state, def.outcomes);
      const paid = Math.round(b.amount * (o.special?.value ?? 1));
      e.treasury += paid;
      effects(state, e, o);
      event(state, e, `${def.name}: ${fill(state, e, o.result)} (${paid} BC back on ${b.amount} BC)`);
    }
  }
}
