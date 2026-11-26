// Prison colony escape and uprising events.
// Written by Gemini (coding job 05, 2026-11-25), checked by Claude. The declarePrison command, the production
// bonus (turn.ts) and the unrest part (unrest.ts) were wired in by Claude from Gemini's spec.

import { PRISON_COLONY, PRISON_EVENTS } from "./data/hazardWorlds";
import * as R from "./rng";
import type { Colony, Empire, GameState, PendingEvent } from "./types";

function prisonEvent(state: GameState, e: Empire, c: Colony): void {
  const recent = new Set(e.recentEvents ?? []);
  const options = PRISON_EVENTS.filter((d) => !recent.has(d.id));
  if (!options.length) return;
  const def = R.pick(state.rng, options);
  const contacts = e.contacts.filter((id) => state.empires[id]!.alive).sort((a, b) => a - b);
  const p: PendingEvent = {
    id: state.nextEventId++,
    empireId: e.id,
    eventId: def.id,
    turn: state.turn,
    colonyStarId: c.starId,
    starId: c.starId,
    rivalId: contacts.length ? R.pick(state.rng, contacts) : null,
  };
  state.pendingEvents.push(p);
  e.recentEvents = [...(e.recentEvents ?? []), def.id].slice(-8);
}

/** Once per turn, roll escape/riot events for prison colonies. */
export function processPrisons(state: GameState): void {
  const prisons = Object.values(state.colonies)
    .filter((c) => Boolean(c.prison))
    .sort((a, b) => a.starId - b.starId);
  for (const c of prisons) {
    const e = state.empires[c.empireId];
    if (!e || !e.alive) continue;
    if (state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    if (R.chance(state.rng, PRISON_COLONY.escapeChance)) prisonEvent(state, e, c);
  }
}
