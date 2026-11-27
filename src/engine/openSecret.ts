// The Open Secret: a late-game catch-up rule (Danny's idea, 2026-11-26, built by the main Claude).
//
// Once one empire runs away with the galaxy, its discoveries are too big to keep secret. Engineers
// defect, designs are copied, and the ideas spread. Every other empire gets a boost scaled by how far
// behind it is: a small empire gets a big push, one nearly level gets almost nothing, and the leader
// gets nothing. Three parts:
//   - production: up to +25% for the empires furthest behind;
//   - research: up to +40%;
//   - copying: any technology the leader already knows costs up to 50% less.
//
// The leader is worked out once a turn and stored, so colony output reads it without recounting.
// Pure and deterministic: no randomness at all.

import type { GameState, Id } from "./types";

/** No leaks before this turn. */
export const OPEN_SECRET_START = 120;
/** The leader must hold at least this share of the galaxy's people... */
export const OPEN_SECRET_MIN_SHARE = 0.25;
/** ...and at least this many times the average empire's share (so small games need a real lead). */
export const OPEN_SECRET_TIMES_AVERAGE = 2.2;
/** ...and at least this many times the runner-up's people. */
export const OPEN_SECRET_OVER_SECOND = 1.4;
/** Caps for the empire furthest behind (gap 1). Effects scale with the gap. */
export const OPEN_SECRET_PRODUCTION = 0.25;
export const OPEN_SECRET_RESEARCH = 0.4;
export const OPEN_SECRET_COPY = 0.5;

export interface OpenSecretState {
  /** The runaway empire whose discoveries are leaking, or null when nobody is running away. */
  leaderId: Id | null;
  /** Turn the current leak began. */
  since: number;
  /** How far behind each other empire is, 0 (level) to 1 (nothing). Leader and dead empires are absent. */
  gaps: Record<Id, number>;
}

function populations(state: GameState): Map<Id, number> {
  const pop = new Map<Id, number>();
  for (const e of state.empires) if (e.alive) pop.set(e.id, 0);
  for (const c of Object.values(state.colonies)) {
    if (pop.has(c.empireId)) pop.set(c.empireId, pop.get(c.empireId)! + c.population);
  }
  return pop;
}

/** Who, if anyone, is running away with the galaxy right now. */
export function runawayLeader(state: GameState): { leaderId: Id; gaps: Record<Id, number> } | null {
  if (state.turn < OPEN_SECRET_START) return null;
  const pop = populations(state);
  if (pop.size < 3) return null;
  const ranked = [...pop.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  const total = ranked.reduce((s, [, p]) => s + p, 0);
  const [leaderId, leaderPop] = ranked[0]!;
  const second = ranked[1]![1];
  if (total <= 0 || leaderPop <= 0) return null;
  const share = leaderPop / total;
  if (share < Math.max(OPEN_SECRET_MIN_SHARE, OPEN_SECRET_TIMES_AVERAGE / pop.size)) return null;
  if (leaderPop < second * OPEN_SECRET_OVER_SECOND) return null;
  const gaps: Record<Id, number> = {};
  for (const [id, p] of ranked) if (id !== leaderId) gaps[id] = Math.max(0, Math.min(1, 1 - p / leaderPop));
  return { leaderId, gaps };
}

/** Once a turn: update the leak and post news when it starts, changes hands or ends. */
export function processOpenSecret(state: GameState): void {
  const now = runawayLeader(state);
  const before = state.openSecret?.leaderId ?? null;
  const after = now?.leaderId ?? null;
  if (after !== before) {
    if (after !== null) {
      const name = state.empires[after]!.name;
      state.events.push({ turn: state.turn, empireId: null, kind: "saga",
        text: `The Open Secret: the ${name} have grown so great that their discoveries can no longer be hidden. Their designs are being copied across the galaxy, and the empires furthest behind gain the most.` });
    } else if (before !== null) {
      const name = state.empires[before]!.name;
      state.events.push({ turn: state.turn, empireId: null, kind: "saga",
        text: `The ${name} no longer tower over the galaxy, and the flood of copied designs slows to a trickle.` });
    }
  }
  state.openSecret = now ? { leaderId: now.leaderId, since: after === before ? (state.openSecret?.since ?? state.turn) : state.turn, gaps: now.gaps } : undefined;
}

/** How far behind the leader this empire is (0 when there is no leak, or for the leader itself). */
export function openSecretGap(state: GameState, empireId: Id): number {
  return state.openSecret?.gaps[empireId] ?? 0;
}

/** Extra production share for this empire (0 to OPEN_SECRET_PRODUCTION). */
export function openSecretProduction(state: GameState, empireId: Id): number {
  return OPEN_SECRET_PRODUCTION * openSecretGap(state, empireId);
}

/** Extra research share for this empire (0 to OPEN_SECRET_RESEARCH). */
export function openSecretResearch(state: GameState, empireId: Id): number {
  return OPEN_SECRET_RESEARCH * openSecretGap(state, empireId);
}

/** Cost multiplier for a technology: cheaper if the runaway leader already knows it. */
export function openSecretCostFactor(state: GameState, empireId: Id, techId: string): number {
  const gap = openSecretGap(state, empireId);
  if (gap <= 0) return 1;
  const leader = state.empires[state.openSecret!.leaderId!];
  return leader && leader.research.known.includes(techId) ? 1 - OPEN_SECRET_COPY * gap : 1;
}

/** What an empire sees: who is leaking and how much it gains. Public news, so safe for the view. */
export function openSecretSummary(state: GameState, empireId: Id): { leaderId: Id | null; since: number | null; gap: number; production: number; research: number; copyDiscount: number } {
  const s = state.openSecret;
  const gap = openSecretGap(state, empireId);
  return { leaderId: s?.leaderId ?? null, since: s?.since ?? null, gap,
    production: OPEN_SECRET_PRODUCTION * gap, research: OPEN_SECRET_RESEARCH * gap, copyDiscount: OPEN_SECRET_COPY * gap };
}
