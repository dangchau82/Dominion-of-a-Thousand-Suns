// Random events: now and then something happens to an empire and its ruler
// must choose. The AI chooses through the same command as the player.

import { EVENTS, type EventEffect, type GameEventDef } from "./data/events";
import { UNREST_EVENTS } from "./data/unrest";
import { PRISON_EVENTS } from "./data/hazardWorlds";
import { ALL_STORY_CHAPTERS, noteStoryChoice, storyLabel } from "./storylines";
import { noteSupernovaChoice, SUPERNOVA_EVENTS } from "./supernova";
import { CRUSADE_EVENTS, noteCrusadeChoice } from "./crusade";
import { CRITTER_EVENTS, noteCritterChoice } from "./critters";
import { INFESTATION_EVENTS, noteInfestationChoice } from "./infestation";
import { CONTRACT_EVENTS } from "./contractEvents";
import { SYNTH_EVENTS } from "./legends";
import { NATIVE_EVENTS, noteNativesChoice } from "./natives";
import { EXPEDITION_EVENTS } from "./expeditionEvents";
import { noteExpeditionChoice } from "./expeditions";
import { ENVOY_EVENTS } from "./minorRaceEvents";
import { noteMinorRaceChoice } from "./minorRaces";
import { GATE_ALL_EVENTS, noteGateChoice } from "./gates";
import { noteSecretChoice, SECRET_EVENTS } from "./secrets";
import { MAGES_EVENT, noteTechMagesChoice } from "./techMages";
import { CELL_EVENT, notePowerCellChoice } from "./powerCells";
import { noteContractChoice } from "./contracts";
import { adjustRelation } from "./diplomacy";
import { exploreStar } from "./knowledge";
import { distance } from "./formulas";
import * as R from "./rng";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export const EVENT_CHANCE = 1 / 14;
/** Unanswered events resolve with their first choice after this many turns. */
export const EVENT_TIMEOUT = 5;

export const EVENT_BY_ID: ReadonlyMap<string, GameEventDef> = new Map([...EVENTS, ...UNREST_EVENTS, ...PRISON_EVENTS, ...ALL_STORY_CHAPTERS, ...SUPERNOVA_EVENTS, ...CRUSADE_EVENTS, ...CRITTER_EVENTS, ...INFESTATION_EVENTS, ...CONTRACT_EVENTS, ...SYNTH_EVENTS, ...NATIVE_EVENTS, ...EXPEDITION_EVENTS, ...ENVOY_EVENTS, ...GATE_ALL_EVENTS, ...SECRET_EVENTS, MAGES_EVENT, CELL_EVENT].map((e) => [e.id, e]));

function fill(text: string, state: GameState, p: PendingEvent): string {
  return text
    .replace(/\{colony\}/g, p.colonyStarId !== null ? state.stars[p.colonyStarId]!.name : "our capital")
    .replace(/\{star\}/g, p.starId !== null ? state.stars[p.starId]!.name : "the frontier")
    .replace(/\{rival\}/g, p.rivalId !== null ? state.empires[p.rivalId]!.name : "a neighbour");
}

/** The event's text with names filled in, for showing to its empire. */
export function describeEvent(state: GameState, p: PendingEvent) {
  const def = EVENT_BY_ID.get(p.eventId)!;
  return {
    title: def.title, art: def.art, text: fill(def.text, state, p), subtitle: storyLabel(p.eventId),
    choices: def.choices.map((c) => ({ label: fill(c.label, state, p), result: fill(c.result, state, p), effects: c.effects })),
  };
}

export function rollEvents(state: GameState): void {
  const rng = state.rng;
  if (state.turn < 8) return;
  for (const e of state.empires) {
    if (!e.alive || state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    if (!R.chance(rng, EVENT_CHANCE)) continue;
    const colonies = Object.values(state.colonies).filter((c) => c.empireId === e.id).sort((a, b) => a.starId - b.starId);
    if (!colonies.length) continue;
    const atWar = Object.keys(e.atWar).length > 0;
    const recent = new Set(e.recentEvents ?? []);
    const options = EVENTS.filter((d) => !recent.has(d.id) && (d.trigger !== "war" || atWar));
    if (!options.length) continue;
    const def = R.pick(rng, options);
    const explored = state.stars.filter((s) => e.knowledge[s.id]?.explored);
    const contacts = e.contacts.filter((id) => state.empires[id]!.alive).sort((a, b) => a - b);
    const p: PendingEvent = {
      id: state.nextEventId++, empireId: e.id, eventId: def.id, turn: state.turn,
      colonyStarId: R.pick(rng, colonies).starId,
      starId: explored.length ? R.pick(rng, explored).id : null,
      rivalId: contacts.length ? R.pick(rng, contacts) : null,
    };
    state.pendingEvents.push(p);
    e.recentEvents = [...(e.recentEvents ?? []), def.id].slice(-8);
  }
  // Old unanswered events resolve themselves.
  for (const p of [...state.pendingEvents]) {
    if (state.turn - p.turn >= EVENT_TIMEOUT) resolveEvent(state, p, 0);
  }
}

export function resolveEvent(state: GameState, p: PendingEvent, choice: number): string | null {
  const def = EVENT_BY_ID.get(p.eventId);
  const c = def?.choices[choice];
  if (!def || !c) return "No such choice";
  state.pendingEvents = state.pendingEvents.filter((x) => x.id !== p.id);
  noteStoryChoice(state, p, choice);
  noteSupernovaChoice(state, p, choice);
  noteCrusadeChoice(state, p, choice);
  noteCritterChoice(state, p, choice);
  noteInfestationChoice(state, p, choice);
  noteContractChoice(state, p, choice);
  noteNativesChoice(state, p, choice);
  noteExpeditionChoice(state, p, choice);
  noteMinorRaceChoice(state, p, choice);
  noteGateChoice(state, p, choice);
  noteSecretChoice(state, p, choice);
  noteTechMagesChoice(state, p, choice);
  notePowerCellChoice(state, p, choice);
  const e = state.empires[p.empireId]!;
  for (const fx of c.effects) applyEffect(state, e, p, fx);
  state.events.push({ turn: state.turn, empireId: e.id, kind: "info", text: `${def.title}: ${fill(c.result, state, p)}` });
  return null;
}

/** Apply one event effect to an empire (also used by money sinks). */
export function applyEffect(state: GameState, e: Empire, p: PendingEvent, fx: EventEffect): void {
  const colony = (p.colonyStarId !== null && state.colonies[p.colonyStarId]?.empireId === e.id ? state.colonies[p.colonyStarId] : undefined)
    ?? state.colonies[e.capitalStarId];
  switch (fx.kind) {
    case "money": e.treasury = Math.max(0, e.treasury + fx.amount); break;
    // Negative research is a real cost: it drains progress in that field, never below zero.
    case "research": e.research.progress[fx.field] = Math.max(0, e.research.progress[fx.field] + fx.amount); break;
    case "population": if (colony) colony.population = Math.max(1, colony.population + fx.amount); break;
    case "factories": if (colony) colony.factories = Math.max(0, colony.factories + fx.amount); break;
    case "morale":
      // Morale also calms (or stirs) the colony the event is about.
      if (colony && p.colonyStarId === colony.starId) colony.unrest = Math.max(0, Math.min(100, (colony.unrest ?? 0) - fx.amount * 5));
      e.culture = Math.max(0, e.culture + fx.amount * 10);
      break;
    case "culture": e.culture = Math.max(0, e.culture + fx.amount); break;
    case "ships": {
      const s = state.stars[colony?.starId ?? e.capitalStarId]!;
      state.fleets.push({ id: state.nextFleetId++, empireId: e.id, ships: { [fx.template]: fx.count }, x: s.x, y: s.y, starId: s.id, destStarId: null });
      break;
    }
    case "relations": if (p.rivalId !== null) adjustRelation(state.empires[p.rivalId]!, e, fx.amount); break;
    case "planetSize": { const s = colony ? state.stars[colony.starId]! : null; if (s?.planet) s.planet.terraform += fx.amount; break; }
    case "revealStars": {
      const home = state.stars[e.capitalStarId]!;
      const hidden = state.stars.filter((s) => !e.knowledge[s.id]?.explored).sort((a, b) => distance(a.x, a.y, home.x, home.y) - distance(b.x, b.y, home.x, home.y));
      for (const s of hidden.slice(0, fx.count)) exploreStar(state, e, s, false);
      break;
    }
    case "nothing": break;
  }
}

export function eventsFor(state: GameState, empireId: Id): PendingEvent[] {
  return state.pendingEvents.filter((p) => p.empireId === empireId);
}
