// The galactic market (written by Claude 2; Danny's list). Every so often a travelling
// auction house offers one lot to every empire it has reached: an artifact, a cache of
// research, or a mercenary fleet. Each empire makes a sealed bid (high, low, or none); when
// the auction closes, the highest bid that can still be paid wins. Only the winner pays.
// Ties go to the richer empire, then the lower id. No random draws.

import { ARTIFACTS, ARTIFACT_BY_ID } from "./data/digSites";
import type { GameEventDef } from "./data/events";
import { designsOf } from "./designs";
import type { Empire, GameState, Id, PendingEvent, ResearchField } from "./types";

export type LotKind = "artifact" | "research" | "mercenaries";

export interface Lot {
  kind: LotKind;
  name: string;
  /** What it's worth; high bid = value, low bid = 60% of it. */
  value: number;
  artifactId?: string;
  field?: ResearchField;
  amount?: number;
  ships?: number;
}

export interface MarketState {
  nextAt: number;
  lot?: Lot;
  closes?: number;
  bids: Record<Id, number>;
  held: number;
  history: { turn: number; lot: string; winner: Id | null; price: number }[];
}

export const FIRST_AUCTION = 60;
export const AUCTION_EVERY = 45;
export const AUCTION_TURNS = 4;
export const LOW_BID = 0.6;
export const MARKET_PREFIX = "market-bid:";

const FIELDS_CYCLE: ResearchField[] = ["computers", "weapons", "propulsion", "construction", "planetology", "forceFields"];

/** Three versions with the bids in a different order, so AIs (first choice on a tie) bid differently. */
export const MARKET_EVENTS: GameEventDef[] = [0, 1, 2].map((rot) => {
  const opts = [
    { label: "Bid high (the full price)", result: "Our sealed bid is lodged with the auctioneers. Generous." },
    { label: "Bid low (60% of the price)", result: "Our sealed bid is lodged. If we win, it's a bargain." },
    { label: "Don't bid", result: "We let this one go." },
  ];
  const order = [0, 1, 2].map((i) => opts[(i + rot) % 3]!);
  return {
    id: MARKET_PREFIX + rot,
    title: "The Travelling Auction",
    art: "council",
    trigger: "turn",
    text: "The great auction-ships of the Free Exchange have reached our space. This season's lot: {work}. Sealed bids close in a few turns; only the winner pays.",
    choices: order.map((o) => ({ label: o.label, result: o.result, effects: [{ kind: "nothing" as const }] })),
  };
});

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function makeLot(state: GameState, n: number): Lot {
  const seed = seedNumber(state) + n * 7;
  const kind: LotKind = (["artifact", "research", "mercenaries"] as const)[seed % 3]!;
  const scale = 1 + Math.floor(state.turn / 100) * 0.5;
  if (kind === "artifact") {
    const owned = new Set(Object.values(state.digs?.artifacts ?? {}).flat());
    const free = ARTIFACTS.filter((a) => !owned.has(a.id));
    const a = (free.length ? free : ARTIFACTS)[seed % (free.length || ARTIFACTS.length)]!;
    const value = { legendary: 900, epic: 720, rare: 550, common: 300 }[a.quality];
    return { kind, name: `the ${a.name}, a ${a.quality} artifact`, value, artifactId: a.id };
  }
  if (kind === "research") {
    const field = FIELDS_CYCLE[seed % FIELDS_CYCLE.length]!;
    const amount = Math.round(600 * scale);
    return { kind, name: `a vault of ${field} research (${amount} points)`, value: Math.round(amount * 0.8), field, amount };
  }
  const ships = 4 + Math.floor(state.turn / 80);
  return { kind, name: `a mercenary squadron of ${ships} warships`, value: 120 * ships, ships };
}

/** "{work}" in the auction text. */
export function marketLotText(state: GameState, p: PendingEvent): string | null {
  return p.eventId.startsWith(MARKET_PREFIX) && state.market?.lot ? state.market.lot.name : null;
}

/** The bid a choice means. */
function bidOf(lot: Lot, eventId: string, choice: number): number {
  const rot = Number(eventId.slice(MARKET_PREFIX.length));
  const which = (choice + rot) % 3; // 0 high, 1 low, 2 none
  return which === 0 ? lot.value : which === 1 ? Math.round(lot.value * LOW_BID) : 0;
}

function living(state: GameState): Empire[] {
  return state.empires.filter((e) => e.alive && e.rebelOf === undefined);
}

/** Once a turn. */
export function processMarket(state: GameState): void {
  const st = (state.market ??= { nextAt: FIRST_AUCTION + (seedNumber(state) % 20), bids: {}, held: 0, history: [] });
  if (st.lot && st.closes !== undefined && state.turn >= st.closes) close(state, st);
  if (st.lot || state.turn < st.nextAt) return;
  st.held++;
  st.lot = makeLot(state, st.held);
  st.closes = state.turn + AUCTION_TURNS;
  st.bids = {};
  st.nextAt = state.turn + AUCTION_EVERY;
  for (const e of living(state)) {
    if (state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: MARKET_PREFIX + ((seedNumber(state) + e.id + st.held) % 3), turn: state.turn, colonyStarId: null, starId: null, rivalId: null });
  }
}

function close(state: GameState, st: MarketState): void {
  const lot = st.lot!;
  const ranked = Object.entries(st.bids)
    .map(([id, bid]) => ({ e: state.empires[Number(id)]!, bid }))
    .filter((x) => x.e?.alive && x.bid > 0 && x.e.treasury >= x.bid)
    .sort((a, b) => b.bid - a.bid || b.e.treasury - a.e.treasury || a.e.id - b.e.id);
  const win = ranked[0];
  st.history.push({ turn: state.turn, lot: lot.name, winner: win?.e.id ?? null, price: win?.bid ?? 0 });
  if (st.history.length > 30) st.history.splice(0, st.history.length - 30);
  delete st.lot; delete st.closes;
  const bidders = Object.keys(st.bids).map(Number);
  st.bids = {};
  if (!win) {
    for (const id of bidders) state.events.push({ turn: state.turn, empireId: id, kind: "info", text: `The auction closes with no sale: ${lot.name}.` });
    return;
  }
  const e = win.e;
  e.treasury -= win.bid;
  if (lot.kind === "artifact" && lot.artifactId) {
    const held = ((state.digs ??= { sites: [], artifacts: {} }).artifacts[e.id] ??= []);
    if (!held.includes(lot.artifactId)) held.push(lot.artifactId);
  } else if (lot.kind === "research" && lot.field) {
    e.research.progress[lot.field] += lot.amount ?? 0;
  } else if (lot.kind === "mercenaries") {
    const best = designsOf(state, e.id).filter((d) => d.role === "warship" && d.weapons.length > 0).sort((a, b) => b.cost - a.cost || a.id.localeCompare(b.id))[0];
    const home = state.colonies[e.capitalStarId]?.empireId === e.id ? state.stars[e.capitalStarId] : undefined;
    if (best && home) state.fleets.push({ id: state.nextFleetId++, empireId: e.id, ships: { [best.id]: lot.ships ?? 4 }, x: home.x, y: home.y, starId: home.id, destStarId: null });
  }
  for (const id of bidders) {
    state.events.push({ turn: state.turn, empireId: id, kind: "info",
      text: id === e.id ? `We won the auction: ${lot.name}, for ${win.bid} BC.` : `The ${e.name} won the auction (${lot.name}) for ${win.bid} BC.` });
  }
  if (lot.kind === "artifact") state.events.push({ turn: state.turn, empireId: null, kind: "saga", text: `The ${e.name} bought ${lot.name} at the Travelling Auction for ${win.bid} BC.` });
}

/** Called when any event is answered: records the sealed bid. */
export function noteMarketChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (!p.eventId.startsWith(MARKET_PREFIX) || !state.market?.lot) return;
  state.market.bids[p.empireId] = bidOf(state.market.lot, p.eventId, choice);
}

export { ARTIFACT_BY_ID };
