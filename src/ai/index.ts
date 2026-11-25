// Runs every AI empire's turn. Each AI gets only its own EmpireView and
// can only act through applyCommand, exactly like the player.

import { applyCommand } from "../engine/commands";
import type { GameState } from "../engine/types";
import { makeView } from "../engine/view";
import { autoScoutOrders, basicAIAnswers, basicAITurn } from "./basicAI";
export { autoScoutOrders };

export function runAITurns(state: GameState, includePlayer = false): void {
  const asleep = (state.cheats?.rivalsAsleepUntil ?? 0) > state.turn;
  for (const e of state.empires) {
    if (asleep && !e.isPlayer) continue; // player's "sleep rivals" cheat
    if (!e.alive || (e.isPlayer && !includePlayer)) continue;
    for (const cmd of basicAITurn(makeView(state, e.id))) applyCommand(state, e.id, cmd);
  }
}

/** AI empires answer proposals waiting for them right away, from their own view. */
export function aiAnswerProposals(state: GameState): void {
  const waiting = [...new Set(state.proposals.map((p) => p.to))].sort((a, b) => a - b);
  for (const id of waiting) {
    const e = state.empires[id];
    if (!e || e.isPlayer || !e.alive) continue;
    for (const cmd of basicAIAnswers(makeView(state, id))) applyCommand(state, id, cmd);
  }
}
