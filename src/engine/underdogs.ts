// Underdog stories (written by Claude 2; Danny's late-game catch-up ideas 5 and 6).
// Rules, not cheats: they help ANY small empire, the player's included.
//
// - Who is small: `isUnderdog` = at most half the average living empire's worlds.
// - Refugees: every 20 turns, unrest in the biggest empire (the galaxy leader) drives
//   scientists and merchants to the underdogs who know it (research and money).
// - Favour from wanderers: tech-mages visit underdogs more often and up to one extra time,
//   the Bounty Guild comes sooner and once more, and minor races slowly warm to underdogs
//   (hooks in techMages.ts, bountyHunters.ts, minorRaces.ts use these helpers).
// - Last stand: once a game, an empire that held 5+ worlds and is down to 2 or fewer gets
//   one big choice: call every favour for a fleet, fortify the homeworld, or plead for peace.
// No random draws.

import type { GameEventDef } from "./data/events";
import { adjustRelation } from "./diplomacy";
import { designsOf } from "./designs";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface UnderdogState {
  /** Most worlds this empire ever held. */
  peak: Record<Id, number>;
  /** Empires that have had their last stand. */
  lastStand: Id[];
  nextRefugees: number;
}

export const REFUGEE_EVERY = 20;
/** A leader's colony at or above this unrest sends people away. */
export const REFUGEE_UNREST = 40;
export const REFUGEE_RESEARCH = 15;
export const REFUGEE_MONEY = 8;
/** Most restless colonies that count each time. */
export const REFUGEE_CAP = 6;
export const LAST_STAND_PEAK = 5;
export const LAST_STAND_WORLDS = 2;
export const LAST_STAND_SHIPS = 6;
export const LAST_STAND_BASES = 12;
export const PEACE_PLEA = 35;
export const LAST_STAND_ID = "underdog-last-stand";

export const LAST_STAND_EVENT: GameEventDef = {
  id: LAST_STAND_ID,
  title: "The Last Stand",
  art: "crisis",
  trigger: "turn",
  text: "Of all our worlds, only a handful remain. In the war rooms of {colony}, nobody is talking about victory any more, only about what we are willing to spend to still be here tomorrow.",
  choices: [
    { label: `Call in every favour: ${LAST_STAND_SHIPS} warships, whatever it costs (all our BC)`, result: "Old debts are called, museum ships recommissioned, merchant hulls armed. A fleet rises from nothing.", effects: [{ kind: "nothing" }] },
    { label: `Turn the homeworld into a fortress (+${LAST_STAND_BASES} missile bases)`, result: "Every mountain becomes a gun emplacement. Whoever comes for us will pay in blood.", effects: [{ kind: "nothing" }] },
    { label: "Plead for peace with everyone at war with us", result: "Our envoys go out with nothing to offer but our survival. Some of them are listened to.", effects: [{ kind: "nothing" }] },
  ],
};

function living(state: GameState): Empire[] {
  return state.empires.filter((e) => e.alive && e.rebelOf === undefined);
}
function worlds(state: GameState, e: Empire): number {
  let n = 0;
  for (const c of Object.values(state.colonies)) if (c.empireId === e.id) n++;
  return n;
}

/** Small compared with the rest: at most half the average living empire's worlds. */
export function isUnderdog(state: GameState, e: Empire): boolean {
  const all = living(state);
  if (all.length < 3 || !e.alive) return false;
  const avg = all.reduce((a, o) => a + worlds(state, o), 0) / all.length;
  return worlds(state, e) * 2 <= avg;
}

/** The empire with the most worlds (lowest id on a tie). */
export function galaxyLeader(state: GameState): Empire | undefined {
  return living(state).sort((a, b) => worlds(state, b) - worlds(state, a) || a.id - b.id)[0];
}

/** Once a turn. */
export function processUnderdogs(state: GameState): void {
  const st = (state.underdogs ??= { peak: {}, lastStand: [], nextRefugees: REFUGEE_EVERY });
  for (const e of living(state)) {
    const n = worlds(state, e);
    st.peak[e.id] = Math.max(st.peak[e.id] ?? 0, n);
    // Last stand.
    if (n > 0 && n <= LAST_STAND_WORLDS && (st.peak[e.id] ?? 0) >= LAST_STAND_PEAK && !st.lastStand.includes(e.id)
      && !state.pendingEvents.some((p) => p.empireId === e.id) && state.colonies[e.capitalStarId]?.empireId === e.id) {
      st.lastStand.push(e.id);
      state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: LAST_STAND_ID, turn: state.turn, colonyStarId: e.capitalStarId, starId: e.capitalStarId, rivalId: null });
    }
  }
  // Refugees.
  if (state.turn < st.nextRefugees) return;
  st.nextRefugees = state.turn + REFUGEE_EVERY;
  const leader = galaxyLeader(state);
  if (!leader) return;
  const restless = Math.min(REFUGEE_CAP, Object.values(state.colonies).filter((c) => c.empireId === leader.id && (c.unrest ?? 0) >= REFUGEE_UNREST).length);
  if (!restless) return;
  for (const e of living(state)) {
    if (e.id === leader.id || !isUnderdog(state, e) || !e.contacts.includes(leader.id)) continue;
    e.research.progress.computers += REFUGEE_RESEARCH * restless;
    e.treasury += REFUGEE_MONEY * restless;
    state.events.push({ turn: state.turn, empireId: e.id, kind: "info",
      text: `Refugees fleeing unrest in the ${leader.name} have reached us: scientists and merchants among them (+${REFUGEE_RESEARCH * restless} research, +${REFUGEE_MONEY * restless} BC).` });
  }
}

/** Called when any event is answered. */
export function noteUnderdogChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (p.eventId !== LAST_STAND_ID) return;
  const e = state.empires[p.empireId]!;
  const home = state.colonies[e.capitalStarId];
  if (!home || home.empireId !== e.id) return;
  if (choice === 0) {
    const best = designsOf(state, e.id).filter((d) => d.role === "warship" && d.weapons.length > 0).sort((a, b) => b.cost - a.cost || a.id.localeCompare(b.id))[0];
    if (!best) return;
    e.treasury = 0;
    const s = state.stars[e.capitalStarId]!;
    state.fleets.push({ id: state.nextFleetId++, empireId: e.id, ships: { [best.id]: LAST_STAND_SHIPS }, x: s.x, y: s.y, starId: s.id, destStarId: null });
  } else if (choice === 1) {
    home.missileBases += LAST_STAND_BASES;
  } else {
    for (const o of living(state)) if (e.atWar[o.id] !== undefined) adjustRelation(o, e, PEACE_PLEA);
  }
  state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: e.capitalStarId,
    text: `Down to their last worlds, the ${e.name} made their last stand at ${state.stars[e.capitalStarId]!.name}.` });
}
