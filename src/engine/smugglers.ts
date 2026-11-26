// Smuggler rings (ideas pipeline; written by Claude 2). Every so often a smuggling ring
// sets up at one of an empire's outer colonies. Crack down (pay once, it's gone), take a
// cut (money every turn, but stolen research leaks away), or look away (it skims money
// every turn). Up to 3 rings per empire per game. No random draws.

import type { GameEventDef } from "./data/events";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface SmugglerState {
  rings: number;
  nextAt: number;
  /** The ring in play, if any. */
  active?: { starId: Id; deal: "cut" | "skim"; until: number };
  /** Colony offered in the open event. */
  offerAt?: Id;
}

export const SMUGGLER_EVENT_ID = "smuggler-ring";
export const FIRST_RING = 50;
export const RING_EVERY = 75;
export const MAX_RINGS = 3;
export const RING_TURNS = 20;
export const CRACKDOWN_COST = 150;
/** Taking a cut: BC gained a turn; research lost a turn (smuggled-out data). */
export const CUT_MONEY = 12;
export const CUT_RESEARCH = 6;
/** Looking away: BC skimmed a turn. */
export const SKIM_MONEY = 8;

export const SMUGGLER_EVENT: GameEventDef = {
  id: SMUGGLER_EVENT_ID,
  title: "Smugglers in the Outer Docks",
  art: "pirates",
  trigger: "turn",
  text: "Customs officers at {colony} report a ring moving untaxed cargo, stolen data cores and worse through the outer docks. The ringleaders send word: they would rather be partners than prisoners.",
  choices: [
    { label: `Crack down hard (${CRACKDOWN_COST} BC)`, result: "Raids, arrests, impounded freighters. The docks are quiet again.", effects: [{ kind: "money", amount: -CRACKDOWN_COST }] },
    { label: `Take a cut (+${CUT_MONEY} BC a turn, but some research leaks away)`, result: "The ring pays its 'license fee' on time. Some of our data cores leave with it.", effects: [{ kind: "nothing" }] },
    { label: "Look the other way", result: "Nobody is arrested. Somehow the colony's accounts never quite add up.", effects: [{ kind: "nothing" }] },
  ],
};

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** An outer colony (not the capital), chosen from the seed. */
function outerColony(state: GameState, e: Empire): Id | null {
  const mine = Object.values(state.colonies).filter((c) => c.empireId === e.id && c.starId !== e.capitalStarId).map((c) => c.starId).sort((a, b) => a - b);
  return mine.length ? mine[(seedNumber(state) + e.id * 7 + state.turn) % mine.length]! : null;
}

/** Once a turn. */
export function processSmugglers(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const st = ((state.smugglers ??= {})[e.id] ??= { rings: 0, nextAt: FIRST_RING + ((seedNumber(state) + e.id * 23) % 50) });
    const ring = st.active;
    if (ring) {
      if (state.turn >= ring.until || state.colonies[ring.starId]?.empireId !== e.id) {
        delete st.active;
        state.events.push({ turn: state.turn, empireId: e.id, kind: "info", text: "The smuggling ring has moved on." });
      } else if (ring.deal === "cut") {
        e.treasury += CUT_MONEY;
        e.research.progress.computers = Math.max(0, e.research.progress.computers - CUT_RESEARCH);
      } else {
        e.treasury = Math.max(0, e.treasury - SKIM_MONEY);
      }
    }
    if (st.active || st.rings >= MAX_RINGS || state.turn < st.nextAt || state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    st.nextAt = state.turn + RING_EVERY;
    const at = outerColony(state, e);
    if (at === null) continue;
    st.rings++;
    st.offerAt = at;
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: SMUGGLER_EVENT_ID, turn: state.turn, colonyStarId: at, starId: at, rivalId: null });
  }
}

/** Called when any event is answered. */
export function noteSmugglerChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (p.eventId !== SMUGGLER_EVENT_ID) return;
  const st = state.smugglers?.[p.empireId];
  const at = p.colonyStarId ?? st?.offerAt;
  if (!st || at === undefined || at === null || choice === 0) return;
  st.active = { starId: at, deal: choice === 1 ? "cut" : "skim", until: state.turn + RING_TURNS };
}
