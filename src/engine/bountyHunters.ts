// Bounty hunters (ideas pipeline; written by Claude 2). When an empire has been at war for
// a while, a guild of bounty hunters offers to strike the enemy's treasury and labs for a
// fee. Hire them (pay now; the enemy loses money and research), hire them quietly (pay
// more; the enemy never learns who paid), or send them away. Up to 2 offers per empire per
// game. No random draws, and no fleets or combat involved.

import type { GameEventDef } from "./data/events";
import { isUnderdog } from "./underdogs";
import { adjustRelation } from "./diplomacy";
import type { GameState, PendingEvent } from "./types";

export interface BountyState {
  offers: number;
  nextAt: number;
}

export const BOUNTY_EVENT_ID = "bounty-hunters";
export const WAR_TURNS = 10;
export const OFFER_GAP = 60;
export const MAX_OFFERS = 2;
export const FEE = 200;
export const QUIET_FEE = 300;
/** What the enemy loses. */
export const STOLEN_BC = 250;
export const LOST_RESEARCH = 120;
/** Relation hit when the enemy learns who paid. */
export const GRUDGE = 15;

export const BOUNTY_EVENT: GameEventDef = {
  id: BOUNTY_EVENT_ID,
  title: "The Bounty Guild",
  art: "pirates",
  trigger: "turn",
  text: "A masked envoy of the Bounty Guild offers to strike at {rival}: their vaults, their laboratories, the people who keep both running. The Guild does not take sides. It takes payment.",
  choices: [
    { label: `Hire them (${FEE} BC)`, result: "The Guild's ships slip into enemy space. Reports soon follow of looted vaults and burning labs.", effects: [{ kind: "money", amount: -FEE }] },
    { label: `Hire them quietly (${QUIET_FEE} BC; they never learn who paid)`, result: "No contract, no names. The enemy will never know where the knife came from.", effects: [{ kind: "money", amount: -QUIET_FEE }] },
    { label: "Send them away", result: "The envoy bows and leaves. Somewhere, someone else is surely paying.", effects: [{ kind: "nothing" }] },
  ],
};

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Once a turn. */
export function processBountyHunters(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const st = ((state.bountyHunters ??= {})[e.id] ??= { offers: 0, nextAt: 0 });
    // Underdogs (underdogs.ts): one more offer, and the Guild comes after half as many turns of war.
    const small = isUnderdog(state, e);
    if (st.offers >= MAX_OFFERS + (small ? 1 : 0) || state.turn < st.nextAt || state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    // The longest-running war against a living empire.
    const wars = Object.entries(e.atWar)
      .map(([id, since]) => ({ id: Number(id), since }))
      .filter((w) => state.empires[w.id]?.alive && state.turn - w.since >= (small ? WAR_TURNS / 2 : WAR_TURNS))
      .sort((a, b) => a.since - b.since || a.id - b.id);
    if (!wars.length) continue;
    const rival = wars[(seedNumber(state) + e.id) % Math.min(2, wars.length)]!.id;
    st.offers++;
    st.nextAt = state.turn + OFFER_GAP;
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: BOUNTY_EVENT_ID, turn: state.turn, colonyStarId: null, starId: null, rivalId: rival });
  }
}

/** Called when any event is answered: a hired Guild strikes at once. */
export function noteBountyChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (p.eventId !== BOUNTY_EVENT_ID || choice > 1 || p.rivalId === null) return;
  const e = state.empires[p.empireId]!;
  const r = state.empires[p.rivalId];
  if (!r?.alive) return;
  const took = Math.min(STOLEN_BC, r.treasury);
  r.treasury -= took;
  r.research.progress.computers = Math.max(0, r.research.progress.computers - LOST_RESEARCH);
  if (choice === 0) adjustRelation(r, e, -GRUDGE);
  state.events.push({ turn: state.turn, empireId: r.id, kind: "info",
    text: choice === 0
      ? `Bounty hunters paid by ${e.name} looted ${took} BC from our vaults and burned our laboratories.`
      : `Bounty hunters looted ${took} BC from our vaults and burned our laboratories. Nobody knows who paid them.` });
}
