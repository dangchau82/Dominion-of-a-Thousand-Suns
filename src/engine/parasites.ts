// Parasite overlords (ideas pipeline; written by Claude 2). Once a game, in each empire
// with at least three colonies, a parasite takes over the governor of an outer colony.
// For a while nobody notices: research quietly leaks away. Then it is exposed, and the
// empire chooses: burn it out (the colony loses people), contain it (pay), or bargain with
// it (it shares its alien knowledge but feeds on the colony every so often). Original
// creatures and text. No random draws.

import type { GameEventDef } from "./data/events";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface ParasiteHost {
  starId: Id;
  stage: "hidden" | "exposed" | "gone" | "pact";
  since: number;
}

export const PARASITE_EVENT_ID = "parasite-overlord";
export const PARASITE_FROM = 90;
export const PARASITE_WINDOW = 60;
export const MIN_COLONIES = 3;
/** Hidden: research siphoned a turn, and turns until it is exposed. */
export const HIDDEN_DRAIN = 4;
export const HIDDEN_TURNS = 15;
/** Burning it out kills this share of the colony. */
export const BURN_SHARE = 0.3;
export const CONTAIN_COST = 200;
/** A pact: research gained a turn; every FEED_EVERY turns the colony loses 1 population. */
export const PACT_RESEARCH = 6;
export const FEED_EVERY = 20;

export const PARASITE_EVENT: GameEventDef = {
  id: PARASITE_EVENT_ID,
  title: "The Governor Is Not Alone",
  art: "crisis",
  trigger: "turn",
  text: "For weeks the governor of {colony} has issued strange orders: data cores shipped to nowhere, night shifts in sealed labs. A medical scan finds why. Something coiled along the governor's spine is doing the thinking now, and it is willing to talk.",
  choices: [
    { label: `Burn it out (the colony loses about ${Math.round(BURN_SHARE * 100)}% of its people in the purge)`, result: "Quarantine teams sweep the colony street by street. The thing and everything it touched are gone.", effects: [{ kind: "nothing" }] },
    { label: `Contain it in a sealed lab (${CONTAIN_COST} BC)`, result: "The creature is cut free and sealed behind a metre of lead glass. The governor remembers nothing.", effects: [{ kind: "money", amount: -CONTAIN_COST }] },
    { label: "Bargain with it: its knowledge for a little of our people", result: "The overlord keeps its host and shares what it knows. Every so often, someone in the colony is not seen again.", effects: [{ kind: "nothing" }] },
  ],
};

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function outer(state: GameState, e: Empire): Id[] {
  return Object.values(state.colonies)
    .filter((c) => c.empireId === e.id && c.starId !== e.capitalStarId)
    .map((c) => c.starId)
    .sort((a, b) => a - b);
}

/** Once a turn. */
export function processParasites(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const hosts = (state.parasites ??= {});
    const h = hosts[e.id];
    if (!h) {
      if (state.turn < PARASITE_FROM + ((seedNumber(state) + e.id * 29) % PARASITE_WINDOW)) continue;
      const spots = outer(state, e);
      if (spots.length + 1 < MIN_COLONIES) continue;
      hosts[e.id] = { starId: spots[(seedNumber(state) + e.id) % spots.length]!, stage: "hidden", since: state.turn };
      continue;
    }
    if (h.stage === "gone" || h.stage === "exposed") continue;
    const c = state.colonies[h.starId];
    if (!c || c.empireId !== e.id) { h.stage = "gone"; continue; }
    if (h.stage === "hidden") {
      e.research.progress.computers = Math.max(0, e.research.progress.computers - HIDDEN_DRAIN);
      if (state.turn - h.since >= HIDDEN_TURNS && !state.pendingEvents.some((p) => p.empireId === e.id)) {
        h.stage = "exposed";
        state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: PARASITE_EVENT_ID, turn: state.turn, colonyStarId: h.starId, starId: h.starId, rivalId: null });
      }
      continue;
    }
    // A pact.
    e.research.progress.computers += PACT_RESEARCH;
    if ((state.turn - h.since) % FEED_EVERY === 0 && c.population > 1) {
      c.population -= 1;
      state.events.push({ turn: state.turn, empireId: e.id, kind: "info", starId: h.starId, text: `The overlord at ${state.stars[h.starId]!.name} has fed again.` });
    }
  }
}

/** Called when any event is answered. */
export function noteParasiteChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (p.eventId !== PARASITE_EVENT_ID) return;
  const h = state.parasites?.[p.empireId];
  if (!h || h.stage !== "exposed") return;
  const c = state.colonies[h.starId];
  if (choice === 0) {
    if (c) c.population = Math.max(1, Math.round(c.population * (1 - BURN_SHARE)));
    h.stage = "gone";
  } else if (choice === 1) {
    h.stage = "gone";
  } else {
    h.stage = "pact";
    h.since = state.turn;
  }
}
