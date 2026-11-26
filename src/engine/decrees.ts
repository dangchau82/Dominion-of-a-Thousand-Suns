// Imperial Proclamations and Edicts: the ruler's own powers. Texts and numbers by Gemini (data/decrees.ts); rules by Claude.
//
// PROCLAMATION: a standing policy for the whole empire, with a gain and a price. An empire holds 1 to 3 at once:
//   one always, a second after two golden ages (culture), a third while the empire is calm (stability).
//   Slots are never earned by size. Each runs for its duration, costs upkeep per colony each turn (it lapses
//   if the treasury can't pay), then waits out a cooldown. Neighbours notice: a threatening one cools relations.
// EDICT: a one-off order on one of our own colonies. Paid for at once; that colony changes for a few turns.
//   A production or research edict also costs most of the extra output it will bring (a burst now, not free output).
//   One edict per colony at a time, and each edict has its own cooldown on that colony.
// Same rules for the player and the AI (commands proclaim / revokeProclamation / issueEdict). No randomness.

import { EDICTS, PROCLAMATIONS, type EdictDef, type ProclamationDef } from "./data/decrees";
import type { EmpireBonus } from "./data/buildings";
import { distance } from "./formulas";
import { colonyBudget } from "./turn";
import type { Colony, Empire, GameState, Id } from "./types";

export const PROCLAMATION_BY_ID: ReadonlyMap<string, ProclamationDef> = new Map(PROCLAMATIONS.map((p) => [p.id, p]));
export const EDICT_BY_ID: ReadonlyMap<string, EdictDef> = new Map(EDICTS.map((d) => [d.id, d]));

/** Unrest points on every colony per point of a proclamation's `unrest` (data runs -3..+6). */
export const PROCLAMATION_UNREST_SCALE = 3;
/** Golden ages needed for the second slot. */
export const SLOT_GOLDEN_AGES = 2;
/** The third slot needs average unrest below this, across at least SLOT_CALM_COLONIES colonies. */
export const SLOT_CALM_UNREST = 15;
export const SLOT_CALM_COLONIES = 4;
/** How neighbours feel, while it lasts, about a proclamation they see as a threat / as friendly (relations points). */
export const RIVALS_THREAT = -2;
export const RIVALS_FRIENDLY = 1;
/** Goodwill from a proclamation counts for this much of its listed value (full value let friendly policies decide council votes). Ill will counts in full. */
export const PROCLAMATION_GOODWILL = 0.4;
/** A production or research edict costs this share of the extra output it will bring, on top of its listed price,
 *  so it buys a burst when it matters rather than free output for ever. */
export const EDICT_OUTPUT_PRICE = 0.8;
/** A colony this far from the capital counts as frontier (same line as the "far from the capital" unrest). */
export const FRONTIER_DISTANCE = 8;
/** A colony at least this restless may receive "unrestful" edicts. */
export const UNRESTFUL_AT = 30;
/** Ground-defence points per 100% of an edict's defense share (duels roll 0..100 a side). */
export const EDICT_DEFENSE_POINTS = 60;

function coloniesOf(state: GameState, e: Empire): Colony[] {
  return Object.values(state.colonies).filter((c) => c.empireId === e.id).sort((a, b) => a.starId - b.starId);
}

// ---------- Proclamations ----------

export function proclamationSlots(state: GameState, e: Empire): number {
  const mine = coloniesOf(state, e);
  const calm = mine.length >= SLOT_CALM_COLONIES && mine.reduce((a, c) => a + (c.unrest ?? 0), 0) / mine.length < SLOT_CALM_UNREST;
  return 1 + (e.goldenAges >= SLOT_GOLDEN_AGES ? 1 : 0) + (calm ? 1 : 0);
}

/** Bonuses from proclamations in force (added into empireBonus). Data only, so civ.ts can import it safely. */
export function proclamationBonuses(e: Empire): EmpireBonus[] {
  return (e.proclamations ?? []).map((p) => {
    const d = PROCLAMATION_BY_ID.get(p.id);
    if (!d) return {};
    const seen = d.rivalsSee === "threat" ? RIVALS_THREAT : d.rivalsSee === "friendly" ? RIVALS_FRIENDLY : 0;
    const listed = d.bonus.relations ?? 0;
    const relations = (listed > 0 ? listed * PROCLAMATION_GOODWILL : listed) + seen;
    return relations !== listed ? { ...d.bonus, relations } : d.bonus;
  });
}

/** Unrest every colony of this empire feels from its proclamations (can be negative). */
export function proclamationUnrest(e: Empire): { label: string; amount: number }[] {
  return (e.proclamations ?? []).flatMap((p) => {
    const d = PROCLAMATION_BY_ID.get(p.id);
    return d && d.unrest ? [{ label: d.name, amount: d.unrest * PROCLAMATION_UNREST_SCALE }] : [];
  });
}

export interface ProclamationOption {
  id: string; name: string; description: string; bonus: EmpireBonus;
  unrest: number; upkeep: number; duration: number; raceOnly: boolean;
  /** Turns until it can be proclaimed again (0 = now). */
  readyIn: number;
  /** In force until this turn, or null. */
  activeUntil: number | null;
  /** Why it can't be proclaimed now, or null. */
  why: string | null;
}

function whyNotProclaim(state: GameState, e: Empire, d: ProclamationDef): string | null {
  if (d.raceOnly && d.raceOnly !== e.raceId) return "Not for your people";
  const active = e.proclamations ?? [];
  if (active.some((p) => p.id === d.id)) return "Already in force";
  const ready = e.proclamationReady?.[d.id] ?? 0;
  if (ready > state.turn) return `Ready in ${ready - state.turn} turns`;
  if (active.length >= proclamationSlots(state, e)) return "No free proclamation slot";
  const upkeep = d.upkeepPerColony * coloniesOf(state, e).length;
  if (e.treasury < upkeep) return `Need ${upkeep} BC for the first turn`;
  return null;
}

/** Proclamations this empire may ever use (open ones and its own), with their state. */
export function proclamationOptions(state: GameState, e: Empire): ProclamationOption[] {
  const n = coloniesOf(state, e).length;
  return PROCLAMATIONS.filter((d) => !d.raceOnly || d.raceOnly === e.raceId).map((d) => ({
    id: d.id, name: d.name, description: d.description, bonus: { ...d.bonus },
    unrest: d.unrest * PROCLAMATION_UNREST_SCALE, upkeep: d.upkeepPerColony * n, duration: d.duration, raceOnly: !!d.raceOnly,
    readyIn: Math.max(0, (e.proclamationReady?.[d.id] ?? 0) - state.turn),
    activeUntil: e.proclamations?.find((p) => p.id === d.id)?.until ?? null,
    why: whyNotProclaim(state, e, d),
  }));
}

function say(state: GameState, empireId: Id | null, text: string, starId?: Id): void {
  state.events.push({ turn: state.turn, empireId, kind: "info", text, ...(starId !== undefined ? { starId } : {}) });
}

export function proclaim(state: GameState, e: Empire, id: string): string | null {
  const d = PROCLAMATION_BY_ID.get(id);
  if (!d) return "No such proclamation";
  const why = whyNotProclaim(state, e, d);
  if (why) return why;
  (e.proclamations ??= []).push({ id, until: state.turn + d.duration });
  say(state, e.id, `Imperial proclamation, ${d.name}: "${d.announceText}" ${d.description} (${d.duration} turns)`);
  // Neighbours notice (their feelings shift only while it lasts: see proclamationBonuses).
  if (d.rivalsSee !== "neutral") {
    for (const o of state.empires) {
      if (!o.alive || o.id === e.id || !o.contacts.includes(e.id)) continue;
      say(state, o.id, `The ${e.name} proclaim ${d.name}. ${d.rivalsSee === "threat" ? "Our advisors call it a threat." : "Our envoys welcome it."}`);
    }
  }
  return null;
}

function end(state: GameState, e: Empire, id: string, text: string): void {
  const d = PROCLAMATION_BY_ID.get(id);
  e.proclamations = (e.proclamations ?? []).filter((p) => p.id !== id);
  if (!e.proclamations.length) delete e.proclamations;
  if (!d) return;
  (e.proclamationReady ??= {})[id] = state.turn + d.cooldown;
  if (text) say(state, e.id, text);
}

/** End a proclamation early; its cooldown still applies. */
export function revokeProclamation(state: GameState, e: Empire, id: string): string | null {
  const d = PROCLAMATION_BY_ID.get(id);
  if (!d || !e.proclamations?.some((p) => p.id === id)) return "Not in force";
  end(state, e, id, `${d.name} is withdrawn by imperial order.`);
  return null;
}

// ---------- Edicts ----------

export function edictCost(state: GameState, d: EdictDef, c: Colony): number {
  const b = colonyBudget(state, c);
  const extra = ((d.colony.production ?? 0) * b.production + (d.colony.research ?? 0) * b.research) * d.duration * EDICT_OUTPUT_PRICE;
  return Math.round(d.baseCost + d.perPopulation * c.population + extra);
}

function allowed(state: GameState, e: Empire, c: Colony, d: EdictDef): boolean {
  switch (d.allowedOn) {
    case "any": return true;
    case "capital": return c.isCapital;
    case "notCapital": return !c.isCapital;
    case "conquered": return !!c.peopleRaceId && c.peopleRaceId !== e.raceId;
    case "unrestful": return (c.unrest ?? 0) >= UNRESTFUL_AT;
    case "frontier": {
      const home = state.stars[e.capitalStarId], s = state.stars[c.starId];
      return !c.isCapital && !!home && !!s && distance(home.x, home.y, s.x, s.y) > FRONTIER_DISTANCE;
    }
  }
}

function whyNotEdict(state: GameState, e: Empire, c: Colony, d: EdictDef): string | null {
  if (c.edict) return "An edict is already in force here";
  const ready = c.edictReady?.[d.id] ?? 0;
  if (ready > state.turn) return `Ready in ${ready - state.turn} turns`;
  const cost = edictCost(state, d, c);
  if (e.treasury < cost) return `Need ${cost} BC`;
  return null;
}

export interface EdictOption {
  id: string; name: string; description: string; cost: number; duration: number;
  colony: EdictDef["colony"]; unrest: number; populationCost: number;
  why: string | null;
}

/** Edicts that fit this colony (right kind of world), with cost and what stops us. */
export function edictOptions(state: GameState, e: Empire, c: Colony): EdictOption[] {
  if (c.empireId !== e.id) return [];
  return EDICTS.filter((d) => allowed(state, e, c, d)).map((d) => ({
    id: d.id, name: d.name, description: d.description, cost: edictCost(state, d, c), duration: d.duration,
    colony: { ...d.colony }, unrest: d.unrest, populationCost: d.populationCost, why: whyNotEdict(state, e, c, d),
  }));
}

export function issueEdict(state: GameState, e: Empire, c: Colony, id: string): string | null {
  const d = EDICT_BY_ID.get(id);
  if (!d) return "No such edict";
  if (c.empireId !== e.id) return "Not your colony";
  if (!allowed(state, e, c, d)) return "That edict doesn't fit this colony";
  const why = whyNotEdict(state, e, c, d);
  if (why) return why;
  e.treasury -= edictCost(state, d, c);
  if (d.populationCost > 0) c.population = Math.max(0.5, c.population * (1 - d.populationCost));
  // Felt at once (a relief edict calms tonight), and it keeps pulling for as long as it lasts.
  if (!c.isCapital) c.unrest = Math.max(0, Math.min(100, (c.unrest ?? 0) + d.unrest));
  c.edict = { id, until: state.turn + d.duration };
  say(state, e.id, `Edict for ${state.stars[c.starId]!.name}, ${d.name}: "${d.issueText}" (${d.duration} turns)`, c.starId);
  return null;
}

/** What the colony's edict does to one kind of output (a share; 0 if none). */
export function edictShare(c: Colony, key: keyof EdictDef["colony"]): number {
  return c.edict ? EDICT_BY_ID.get(c.edict.id)?.colony[key] ?? 0 : 0;
}

/** The unrest pull of the colony's edict while it lasts. */
export function edictUnrest(c: Colony): { label: string; amount: number } | null {
  const d = c.edict ? EDICT_BY_ID.get(c.edict.id) : undefined;
  return d && d.unrest ? { label: d.name, amount: d.unrest } : null;
}

// ---------- Each turn ----------

export function processDecrees(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive || !e.proclamations?.length) continue;
    const n = coloniesOf(state, e).length;
    for (const p of [...e.proclamations]) {
      const d = PROCLAMATION_BY_ID.get(p.id);
      if (!d) { end(state, e, p.id, ""); continue; }
      if (p.until <= state.turn) { end(state, e, p.id, `${d.name}: ${d.endText}`); continue; }
      const upkeep = d.upkeepPerColony * n;
      if (e.treasury < upkeep) { end(state, e, p.id, `${d.name} lapses: the treasury can't pay for it.`); continue; }
      e.treasury -= upkeep;
    }
  }
  for (const c of Object.values(state.colonies)) {
    if (!c.edict || c.edict.until > state.turn) continue;
    const d = EDICT_BY_ID.get(c.edict.id);
    if (d) (c.edictReady ??= {})[d.id] = state.turn + d.cooldown;
    delete c.edict;
  }
}
