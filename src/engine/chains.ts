// Story chains: a run of linked events where one answer picks a branch
// ("order", "chaos" or "neutral") and a finale follows the chosen branch.
// Format: LateGameEventDef (data/lateGameLore.ts) with `requires` and `branch`.
// Used by the Crusade (crusade.ts); written to be reused by other chains.
// No random draws.

import type { LateGameEventDef } from "./data/lateGameLore";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export type Branch = "order" | "chaos" | "neutral";
/** Which branch each answer picks, on the event that sets the branch. */
export const BRANCH_BY_CHOICE: Branch[] = ["order", "chaos", "neutral"];

export interface ChainProgress {
  /** Event ids answered or shown, in order. */
  done: string[];
  branch?: Branch;
  lastTurn: number;
  /** Set when the chain's last event has been answered. */
  finished?: boolean;
}

/** The event that sets the branch: the one branched events require. */
export function branchSetter(chain: readonly LateGameEventDef[]): string | undefined {
  return chain.find((e) => e.branch && e.requires)?.requires;
}

/** The next event in the chain for this progress, or null if none is due yet. */
export function nextInChain(chain: readonly LateGameEventDef[], prog: ChainProgress): LateGameEventDef | null {
  const done = new Set(prog.done);
  for (const ev of chain) {
    if (done.has(ev.id)) continue;
    if (ev.requires && !done.has(ev.requires)) continue;
    if (ev.branch) {
      if (ev.branch !== prog.branch) continue;
      return ev;
    }
    // An unbranched event after the branch point waits for the chosen branch to finish.
    const setter = branchSetter(chain);
    if (setter && ev.requires === setter) {
      const pending = chain.filter((x) => x.branch === prog.branch && !done.has(x.id));
      if (pending.length) continue;
    }
    return ev;
  }
  return null;
}

/** Queue the event for this empire. */
export function showChainEvent(state: GameState, e: Empire, ev: LateGameEventDef, prog: ChainProgress, place: { colonyStarId: Id | null; starId: Id | null; rivalId: Id | null }): void {
  const p: PendingEvent = { id: state.nextEventId++, empireId: e.id, eventId: ev.id, turn: state.turn, ...place };
  state.pendingEvents.push(p);
  prog.done.push(ev.id);
  prog.lastTurn = state.turn;
}

/** Record an answer: sets the branch on the branch point, and marks the chain finished after its last event. */
export function noteChainAnswer(chain: readonly LateGameEventDef[], prog: ChainProgress, eventId: string, choice: number): void {
  if (eventId === branchSetter(chain)) prog.branch = BRANCH_BY_CHOICE[choice] ?? "neutral";
  if (eventId === chain[chain.length - 1]!.id) prog.finished = true;
}
