// Megastructures (written by Claude 2, Danny's idea list). Late in the game a rich empire
// may begin one great work at its capital: a Sun Tap (money every turn), a Thinking Moon
// (research every turn) or a Halo of Songs (culture every turn). Building takes many turns
// of payments; an empire at war with the builder may be offered a chance to sabotage it,
// setting the work back. Up to 2 per empire per game. Paid in BC and run by events, so the
// production formula and the AIs are untouched. No random draws.

import type { GameEventDef } from "./data/events";
import { adjustRelation } from "./diplomacy";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export type MegaKind = "sunTap" | "thinkingMoon" | "haloOfSongs";

export interface Megastructure {
  kind: MegaKind;
  starId: Id;
  /** Turns of work done, and needed. */
  done: number;
  needs: number;
  /** BC paid each turn of work. */
  upkeep: number;
  finished: boolean;
  /** Turn a rival may next be offered to sabotage it. */
  sabotageAt: number;
}

export interface MegaState {
  offers: number;
  nextOffer: number;
  /** What the open offer is for. */
  offerKind?: MegaKind;
  built: Megastructure[];
}

export const MEGA_INFO: Record<MegaKind, { name: string; gives: string; perTurn: number }> = {
  sunTap: { name: "Sun Tap", gives: "BC", perTurn: 30 },
  thinkingMoon: { name: "Thinking Moon", gives: "research", perTurn: 25 },
  haloOfSongs: { name: "Halo of Songs", gives: "culture", perTurn: 4 },
};
const KINDS: MegaKind[] = ["sunTap", "thinkingMoon", "haloOfSongs"];

export const OFFER_FROM = 150;
export const OFFER_GAP = 100;
export const MAX_MEGAS = 2;
export const MIN_COLONIES = 4;
export const MIN_TREASURY = 300;
/** Fast: 300 BC down, then 20 BC a turn for 30 turns. Slow: 100 BC down, 10 BC a turn for 60 turns. */
export const FAST = { down: 300, upkeep: 20, turns: 30 };
export const SLOW = { down: 100, upkeep: 10, turns: 60 };
/** Starting a great work brings prestige at once. */
export const PRESTIGE = 150;
/** Sabotage: costs the saboteur, sets the work back, and they steal some plans. */
export const SABOTAGE_COST = 150;
export const SABOTAGE_SETBACK = 10;
export const SABOTAGE_GAP = 25;
export const SABOTAGE_GRUDGE = 10;

export const MEGA_OFFER_ID = "megastructure-offer";
export const MEGA_SABOTAGE_ID = "megastructure-sabotage";

export const MEGA_EVENTS: GameEventDef[] = [
  {
    id: MEGA_OFFER_ID,
    title: "A Great Work",
    art: "council",
    trigger: "turn",
    text: "Our engineers present plans for a work no empire has dared: {work}, built at {colony}. It would take decades and cost a fortune, and it would be spoken of for a thousand years.",
    choices: [
      { label: `Build it fast (${FAST.down} BC now, then ${FAST.upkeep} BC a turn for ${FAST.turns} turns)`, result: "Every shipyard in the system is turned over to the work. The first girders rise within the month.", effects: [{ kind: "money", amount: -FAST.down }, { kind: "culture", amount: PRESTIGE }] },
      { label: `Build it slowly (${SLOW.down} BC now, then ${SLOW.upkeep} BC a turn for ${SLOW.turns} turns)`, result: "A patient work for patient generations. Children born today will see it finished.", effects: [{ kind: "money", amount: -SLOW.down }, { kind: "culture", amount: PRESTIGE }] },
      { label: "Shelve the plans", result: "The plans go into the archive. Perhaps another age will build it.", effects: [{ kind: "nothing" }] },
    ],
  },
  {
    id: MEGA_SABOTAGE_ID,
    title: "Sabotage the Great Work?",
    art: "pirates",
    trigger: "war",
    text: "Our agents report that {rival} is building a great work. With the right charges in the right places, years of their labour could come down overnight, and our engineers would love a look at their plans.",
    choices: [
      { label: `Sabotage it (${SABOTAGE_COST} BC)`, result: "A fire, a collapse, a scandal. The work is set back years, and the stolen plans are fascinating.", effects: [{ kind: "money", amount: -SABOTAGE_COST }, { kind: "research", field: "construction", amount: 250 }] },
      { label: "Leave it alone", result: "Some things are bigger than any war.", effects: [{ kind: "nothing" }] },
    ],
  },
];

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

const busy = (state: GameState, e: Empire) => state.pendingEvents.some((p) => p.empireId === e.id);

/** Words for the offer text ("{work}"). */
export function megaWorkText(state: GameState, p: PendingEvent): string | null {
  if (p.eventId !== MEGA_OFFER_ID) return null;
  const k = state.megastructures?.[p.empireId]?.offerKind;
  return k ? `a ${MEGA_INFO[k].name}` : null;
}

/** Once a turn. */
export function processMegastructures(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const st = ((state.megastructures ??= {})[e.id] ??= { offers: 0, nextOffer: OFFER_FROM + ((seedNumber(state) + e.id * 37) % 50), built: [] });
    // Work and output.
    for (const m of st.built) {
      if (state.colonies[m.starId]?.empireId !== e.id) continue;
      if (m.finished) {
        const info = MEGA_INFO[m.kind];
        if (m.kind === "sunTap") e.treasury += info.perTurn;
        else if (m.kind === "thinkingMoon") e.research.progress.computers += info.perTurn;
        else e.culture += info.perTurn;
        continue;
      }
      if (e.treasury < m.upkeep) continue; // stalls while the treasury is empty
      e.treasury -= m.upkeep;
      m.done++;
      if (m.done >= m.needs) {
        m.finished = true;
        state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: m.starId,
          text: `The ${e.name} completed a great work at ${state.stars[m.starId]!.name}: the ${MEGA_INFO[m.kind].name}.` });
      } else if (state.turn >= m.sabotageAt) {
        // A rival at war may be offered a chance to sabotage it.
        const foe = state.empires
          .filter((o) => o.alive && o.id !== e.id && e.atWar[o.id] !== undefined && !busy(state, o))
          .sort((a, b) => a.id - b.id)[0];
        if (foe) {
          m.sabotageAt = state.turn + SABOTAGE_GAP;
          state.pendingEvents.push({ id: state.nextEventId++, empireId: foe.id, eventId: MEGA_SABOTAGE_ID, turn: state.turn, colonyStarId: null, starId: m.starId, rivalId: e.id });
        }
      }
    }
    // Offers.
    if (st.offers >= MAX_MEGAS || state.turn < st.nextOffer || busy(state, e)) continue;
    if (st.built.some((m) => !m.finished)) continue;
    const mine = Object.values(state.colonies).filter((c) => c.empireId === e.id);
    if (mine.length < MIN_COLONIES || e.treasury < MIN_TREASURY || state.colonies[e.capitalStarId]?.empireId !== e.id) { st.nextOffer = state.turn + 10; continue; }
    const have = new Set(st.built.map((m) => m.kind));
    const free = KINDS.filter((k) => !have.has(k));
    st.offerKind = free[(seedNumber(state) + e.id + st.offers) % free.length]!;
    st.offers++;
    st.nextOffer = state.turn + OFFER_GAP;
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: MEGA_OFFER_ID, turn: state.turn, colonyStarId: e.capitalStarId, starId: e.capitalStarId, rivalId: null });
  }
}

/** Called when any event is answered. */
export function noteMegastructureChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (p.eventId === MEGA_OFFER_ID) {
    const st = state.megastructures?.[p.empireId];
    if (!st?.offerKind || choice > 1 || p.colonyStarId === null) return;
    const plan = choice === 0 ? FAST : SLOW;
    st.built.push({ kind: st.offerKind, starId: p.colonyStarId, done: 0, needs: plan.turns, upkeep: plan.upkeep, finished: false, sabotageAt: state.turn + SABOTAGE_GAP });
    delete st.offerKind;
  } else if (p.eventId === MEGA_SABOTAGE_ID && choice === 0 && p.rivalId !== null) {
    const m = state.megastructures?.[p.rivalId]?.built.find((x) => x.starId === p.starId && !x.finished);
    const victim = state.empires[p.rivalId];
    if (!m || !victim) return;
    m.done = Math.max(0, m.done - SABOTAGE_SETBACK);
    adjustRelation(victim, state.empires[p.empireId]!, -SABOTAGE_GRUDGE);
    state.events.push({ turn: state.turn, empireId: victim.id, kind: "info", starId: m.starId,
      text: `Saboteurs from the ${state.empires[p.empireId]!.name} have set back our ${MEGA_INFO[m.kind].name} by ${SABOTAGE_SETBACK} turns of work.` });
  }
}
