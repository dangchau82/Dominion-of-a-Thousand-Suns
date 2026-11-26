// Wandering tech-mages (ideas pipeline; written by Claude 2, names original).
// Rarely, a band of wandering tech-mages lands at one of an empire's worlds and offers
// one secret from its next tier of research: pay their steep price, trade a favour
// (they take culture: songs, art and archives), or send them away. No random draws:
// which field and which visit turn come from the seed.

import type { GameEventDef } from "./data/events";
import { FIELDS, type Empire, type GameState, type Id, type PendingEvent } from "./types";
import { ensureProject, learn, researchChoices, tech } from "./tech";

export interface MageVisit {
  nextAt: number;
  /** The secret on offer while their visit event is open. */
  offer: { techId: string; price: number; culture: number } | null;
  visits: number;
}

export const MAGES_EVENT_ID = "tech-mages-visit";
export const FIRST_VISIT = 60;
export const VISIT_EVERY = 80;
export const MAX_VISITS = 3;
/** Their price: BC per tier of the secret, plus a base. */
export const PRICE_PER_TIER = 120;
export const PRICE_BASE = 100;
/** A favour costs culture instead: this much per BC of the price. */
export const CULTURE_PER_BC = 0.5;

export const MAGES_EVENT: GameEventDef = {
  id: MAGES_EVENT_ID,
  title: "The Wandering Tech-Mages",
  art: "contact",
  trigger: "colony",
  text: "A battered starship covered in hand-painted equations lands at {colony}. Its crew of wandering tech-mages offer one secret our scientists have not yet found. They have named their price (see the news).",
  choices: [
    { label: "Pay their price", result: "Coin changes hands. The mages hand over a single crystal tablet and are gone by morning.", effects: [{ kind: "nothing" }] },
    { label: "Offer a favour instead: our songs, art and archives", result: "The mages copy our libraries and record our singers for days. Something of us travels on with them.", effects: [{ kind: "nothing" }] },
    { label: "Send them away", result: "The mages shrug, refuel, and drift on toward the dark.", effects: [{ kind: "nothing" }] },
  ],
};

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Their secret: the highest-tier technology this empire could research next, in a seed-chosen field. */
export function mageSecret(state: GameState, e: Empire): string | null {
  const start = (seedNumber(state) + e.id * 5 + state.turn) % FIELDS.length;
  for (let k = 0; k < FIELDS.length; k++) {
    const f = FIELDS[(start + k) % FIELDS.length]!;
    const choices = researchChoices(e.research, f);
    if (choices.length) return choices.sort((a, b) => b.tier - a.tier || a.id.localeCompare(b.id))[0]!.id;
  }
  return null;
}

export function magePrice(techId: string): number {
  return PRICE_BASE + PRICE_PER_TIER * tech(techId).tier;
}

/** Once a turn. */
export function processTechMages(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const v = ((state.techMages ??= {})[e.id] ??= { nextAt: FIRST_VISIT + ((seedNumber(state) + e.id * 11) % 40), offer: null, visits: 0 });
    if (v.visits >= MAX_VISITS || state.turn < v.nextAt || state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    const id = mageSecret(state, e);
    const where = Object.values(state.colonies).filter((c) => c.empireId === e.id).sort((a, b) => a.starId - b.starId)[0]?.starId ?? null;
    v.nextAt = state.turn + VISIT_EVERY;
    if (!id || where === null) continue;
    const price = magePrice(id);
    v.offer = { techId: id, price, culture: Math.round(price * CULTURE_PER_BC) };
    v.visits++;
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: MAGES_EVENT_ID, turn: state.turn, colonyStarId: where, starId: where, rivalId: null });
    state.events.push({ turn: state.turn, empireId: e.id, kind: "research", starId: where,
      text: `The tech-mages offer the secret of ${tech(id).name} (${tech(id).field}, tier ${tech(id).tier}) for ${price} BC, or as a favour for ${v.offer.culture} culture.` });
  }
}

/** Called when any event is answered. */
export function noteTechMagesChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (p.eventId !== MAGES_EVENT_ID) return;
  const v = state.techMages?.[p.empireId];
  const offer = v?.offer;
  if (!v || !offer) return;
  v.offer = null;
  const e = state.empires[p.empireId]!;
  const t = tech(offer.techId);
  const pay = choice === 0 ? e.treasury >= offer.price : choice === 1 ? e.culture >= offer.culture : false;
  if (choice > 1) return;
  if (!pay) {
    state.events.push({ turn: state.turn, empireId: e.id, kind: "research", text: `We could not meet the tech-mages' price; they left with the secret of ${t.name}.` });
    return;
  }
  if (choice === 0) e.treasury -= offer.price; else e.culture -= offer.culture;
  learn(e.research, t.id);
  ensureProject(e.research, t.field);
  state.events.push({ turn: state.turn, empireId: e.id, kind: "research", text: `The tech-mages taught us ${t.name}.` });
}

/** For tests and the view: the open offer, if any. */
export function mageOffer(state: GameState, empireId: Id): MageVisit["offer"] {
  return state.techMages?.[empireId]?.offer ?? null;
}
