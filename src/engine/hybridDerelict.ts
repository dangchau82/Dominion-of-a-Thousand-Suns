// The hybrid derelict (ideas pipeline, "hybrid warships"; written by Claude 2). Once a game
// per empire, scouts find a dead warship that was half machine, half living creature.
// Strip its guns, sell it, or board it to study the living hull; boarding leads, some turns
// later, to a second choice when the hull starts to grow again. Research and money only:
// no new ship types, so ship design and combat are untouched. No random draws.

import type { GameEventDef } from "./data/events";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface DerelictState {
  stage: "waiting" | "boarded" | "done";
  at: number;
  starId?: Id;
}

export const DERELICT_EVENT_ID = "hybrid-derelict";
export const REGROWTH_EVENT_ID = "hybrid-derelict-regrowth";
export const DERELICT_FROM = 110;
export const DERELICT_WINDOW = 60;
export const REGROWTH_TURNS = 12;

export const DERELICT_EVENTS: GameEventDef[] = [
  {
    id: DERELICT_EVENT_ID,
    title: "A Ship That Was Alive",
    art: "anomaly",
    trigger: "turn",
    text: "Drifting near {star}, our scouts find a dead warship. Its guns are machine-made, but its hull is bone and sinew grown around them, and the corridors are veins. Whatever built it, nothing like it has been seen in a thousand years.",
    choices: [
      { label: "Strip its weapons for study", result: "The guns come free with a sound nobody wants to describe. Our weapon designers are delighted.", effects: [{ kind: "research", field: "weapons", amount: 400 }] },
      { label: "Sell the wreck to collectors (300 BC)", result: "A dozen bidders, one winner, no questions.", effects: [{ kind: "money", amount: 300 }] },
      { label: "Board it and study the living hull", result: "Biologists and engineers move aboard. The hull is cold, but not, they insist, quite dead.", effects: [{ kind: "research", field: "construction", amount: 150 }] },
    ],
  },
  {
    id: REGROWTH_EVENT_ID,
    title: "The Hull Remembers",
    art: "anomaly",
    trigger: "turn",
    text: "The derelict near {star} is growing. Wounds in its hull have closed, and the veins carry something warm again. Our teams say it will not wake, but it is learning the shape of our tools.",
    choices: [
      { label: "Cultivate it: grow armour the way it does", result: "Our shipyards start growing hull plates in vats. They heal their own scratches.", effects: [{ kind: "research", field: "construction", amount: 350 }, { kind: "research", field: "forceFields", amount: 200 }] },
      { label: "Burn it before it wakes", result: "The fire takes three days. The samples we kept are safely frozen.", effects: [{ kind: "research", field: "planetology", amount: 200 }] },
      { label: "Pull our teams out and let it drift away", result: "One night it is simply gone. Sometimes, far out, scouts report a shape that might be it.", effects: [{ kind: "nothing" }] },
    ],
  },
];

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function exploredStar(state: GameState, e: Empire): Id | null {
  const spots = state.stars.filter((s) => e.knowledge[s.id]?.explored && !state.colonies[s.id]);
  return spots.length ? spots[(seedNumber(state) + e.id * 17) % spots.length]!.id : null;
}

/** Once a turn. */
export function processHybridDerelict(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const st = ((state.hybridDerelict ??= {})[e.id] ??= { stage: "waiting", at: DERELICT_FROM + ((seedNumber(state) + e.id * 31) % DERELICT_WINDOW) });
    if (st.stage === "done" || state.turn < st.at || state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    if (st.stage === "waiting") {
      const star = exploredStar(state, e);
      if (star === null) { st.at = state.turn + 10; continue; }
      st.starId = star;
      st.stage = "done";
      state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: DERELICT_EVENT_ID, turn: state.turn, colonyStarId: null, starId: star, rivalId: null });
    } else {
      st.stage = "done";
      state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: REGROWTH_EVENT_ID, turn: state.turn, colonyStarId: null, starId: st.starId ?? null, rivalId: null });
    }
  }
}

/** Called when any event is answered: boarding sets up the regrowth chapter. */
export function noteDerelictChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (p.eventId !== DERELICT_EVENT_ID || choice !== 2) return;
  const st = state.hybridDerelict?.[p.empireId];
  if (!st) return;
  st.stage = "boarded";
  st.at = state.turn + REGROWTH_TURNS;
}
