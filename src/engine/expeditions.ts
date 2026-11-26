// Expeditions (Gemini's data/expeditions.ts): every so often an away team finds
// something at a star we have explored. Each choice has its odds; the outcome comes
// from the seed (no random draws), and its success or failure text and effects apply.
// Each empire sees each expedition at most once.

import { EXPEDITIONS } from "./data/expeditions";
import { EXPEDITION_PREFIX } from "./expeditionEvents";
import { applyEffect } from "./events";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface ExpeditionProgress {
  /** Expedition ids this empire has had. */
  had: string[];
  nextAt: number;
}

export const FIRST_EXPEDITION = 25;
export const EXPEDITION_EVERY = 35;
const BY_ID = new Map(EXPEDITIONS.map((x) => [x.id, x]));

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** A star this empire has explored and nobody has settled, picked by seed. */
function pickStar(state: GameState, e: Empire): Id | null {
  const salt = seedNumber(state) + e.id * 41 + state.turn;
  const spots = state.stars.filter((s) => e.knowledge[s.id]?.explored && !state.colonies[s.id]);
  if (!spots.length) return null;
  return spots[salt % spots.length]!.id;
}

/** Once a turn. */
export function processExpeditions(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const prog = ((state.expeditions ??= {})[e.id] ??= { had: [], nextAt: FIRST_EXPEDITION + (e.id % 7) * 2 });
    if (state.turn < prog.nextAt || state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    const left = EXPEDITIONS.filter((x) => !prog.had.includes(x.id));
    const star = pickStar(state, e);
    if (!left.length || star === null) continue;
    const x = left[(seedNumber(state) + e.id * 3) % left.length]!;
    prog.had.push(x.id);
    prog.nextAt = state.turn + EXPEDITION_EVERY;
    const rival = e.contacts.filter((id) => state.empires[id]!.alive).sort((a, b) => a - b)[0] ?? null;
    const where = state.colonies[e.capitalStarId]?.empireId === e.id ? e.capitalStarId : null;
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: EXPEDITION_PREFIX + x.id, turn: state.turn, colonyStarId: where, starId: star, rivalId: rival });
  }
}

/** Does this choice work out? Seed-based, so a save replays the same. */
export function expeditionWorks(state: GameState, p: PendingEvent, chance: number): boolean {
  return ((seedNumber(state) + p.empireId * 211 + p.id * 37 + state.turn * 13) % 100) < chance * 100;
}

/** Called when any event is answered: play out the chosen approach. */
export function noteExpeditionChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (!p.eventId.startsWith(EXPEDITION_PREFIX)) return;
  const x = BY_ID.get(p.eventId.slice(EXPEDITION_PREFIX.length));
  const c = x?.choices[choice];
  if (!x || !c) return;
  const e = state.empires[p.empireId]!;
  const out = expeditionWorks(state, p, c.chance) ? c.success : c.failure;
  for (const fx of out.effects) applyEffect(state, e, p, fx);
  const star = p.starId !== null ? state.stars[p.starId]!.name : "the frontier";
  const rival = p.rivalId !== null ? state.empires[p.rivalId]!.name : "a neighbour";
  state.events.push({ turn: state.turn, empireId: e.id, kind: "explored", starId: p.starId ?? undefined,
    text: `${x.title}: ${out.result.replace(/\{star\}/g, star).replace(/\{rival\}/g, rival)}` });
}
