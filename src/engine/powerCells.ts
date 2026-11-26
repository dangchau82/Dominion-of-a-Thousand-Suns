// Ancient power cells (ideas pipeline; written by Claude 2). Rare artifacts that hugely
// boost one colony until they run dry. An empire's scouts may find up to two in a game:
// install one at the capital (extra money every turn), at its biggest other world (extra
// research every turn), or sell it at once. The boost is paid as money or research so the
// production formula (the main Claude's) is untouched. No random draws.

import type { GameEventDef } from "./data/events";
import { colonyProduction } from "./formulas";
import { empireRace } from "./game";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface PowerCellState {
  /** Cells found so far, and the turn the next may be found. */
  found: number;
  nextAt: number;
  /** Cells in use: colony, what they give, until when. */
  active: { colonyStarId: Id; gives: "money" | "research"; until: number }[];
}

export const CELL_EVENT_ID = "ancient-power-cell";
export const FIRST_CELL = 70;
export const CELL_EVERY = 90;
export const MAX_CELLS = 2;
/** A cell runs this many turns. */
export const CELL_TURNS = 25;
/** It adds this share of the colony's production every turn, as money or research. */
export const CELL_SHARE = 0.4;
export const SELL_PRICE = 400;

export const CELL_EVENT: GameEventDef = {
  id: CELL_EVENT_ID,
  title: "An Ancient Power Cell",
  art: "ruins",
  trigger: "turn",
  text: `Scouts near {star} recover a sealed cylinder humming with more energy than a city uses in a year. Engineers say it will run for about ${CELL_TURNS} turns once opened, then go dark for ever.`,
  choices: [
    { label: "Install it at our capital (extra money every turn while it lasts)", result: "The capital's grid surges. Every factory runs at double shifts for free.", effects: [{ kind: "nothing" }] },
    { label: "Install it at our biggest other world (extra research while it lasts)", result: "Laboratories light up across the colony; nobody goes home early.", effects: [{ kind: "nothing" }] },
    { label: `Sell it to collectors (${SELL_PRICE} BC now)`, result: "A collector's yacht takes it away. The money is very real.", effects: [{ kind: "money", amount: SELL_PRICE }] },
  ],
};

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function exploredStar(state: GameState, e: Empire): Id | null {
  const spots = state.stars.filter((s) => e.knowledge[s.id]?.explored && !state.colonies[s.id]);
  return spots.length ? spots[(seedNumber(state) + e.id * 13 + state.turn) % spots.length]!.id : null;
}

/** What a cell at this colony adds each turn. */
export function cellOutput(state: GameState, starId: Id): number {
  const c = state.colonies[starId];
  if (!c) return 0;
  const e = state.empires[c.empireId]!;
  return Math.round(colonyProduction(c, state.stars[starId]!.planet!, e, empireRace(e)) * CELL_SHARE);
}

/** Once a turn. */
export function processPowerCells(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const st = ((state.powerCells ??= {})[e.id] ??= { found: 0, nextAt: FIRST_CELL + ((seedNumber(state) + e.id * 19) % 60), active: [] });
    // Running cells pay out, then go dark.
    for (const cell of st.active) {
      const c = state.colonies[cell.colonyStarId];
      if (!c || c.empireId !== e.id || state.turn >= cell.until) continue;
      const out = cellOutput(state, cell.colonyStarId);
      if (cell.gives === "money") e.treasury += out; else e.research.progress.computers += out;
    }
    const before = st.active.length;
    st.active = st.active.filter((cell) => state.turn < cell.until && state.colonies[cell.colonyStarId]?.empireId === e.id);
    if (st.active.length < before) state.events.push({ turn: state.turn, empireId: e.id, kind: "info", text: "An ancient power cell has gone dark." });
    // Finding one.
    if (st.found >= MAX_CELLS || state.turn < st.nextAt || state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    const star = exploredStar(state, e);
    st.nextAt = state.turn + CELL_EVERY;
    if (star === null) continue;
    st.found++;
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: CELL_EVENT_ID, turn: state.turn, colonyStarId: null, starId: star, rivalId: null });
  }
}

/** Called when any event is answered: installing a cell starts it running. */
export function notePowerCellChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (p.eventId !== CELL_EVENT_ID || choice > 1) return;
  const e = state.empires[p.empireId]!;
  const st = state.powerCells?.[e.id];
  if (!st) return;
  const mine = Object.values(state.colonies).filter((c) => c.empireId === e.id);
  const capital = state.colonies[e.capitalStarId]?.empireId === e.id ? e.capitalStarId : mine[0]?.starId;
  const biggest = mine.filter((c) => c.starId !== capital).sort((a, b) => b.population - a.population || a.starId - b.starId)[0]?.starId ?? capital;
  const at = choice === 0 ? capital : biggest;
  if (at === undefined) return;
  st.active.push({ colonyStarId: at, gives: choice === 0 ? "money" : "research", until: state.turn + CELL_TURNS });
  state.events.push({ turn: state.turn, empireId: e.id, kind: "info", starId: at,
    text: `The power cell is running at ${state.stars[at]!.name}: about ${cellOutput(state, at)} ${choice === 0 ? "BC" : "research"} a turn for ${CELL_TURNS} turns.` });
}
