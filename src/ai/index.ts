// Runs every AI empire's turn. Each AI gets only its own EmpireView and
// can only act through applyCommand, exactly like the player.
// Which AI runs an empire: its own choice (Empire.ai, e.g. the player's autopilot setting),
// otherwise the difficulty ("master" difficulty -> Master AI, anything else -> basic AI).

import { applyCommand, type Command } from "../engine/commands";
import type { AiBrain, Empire, GameState } from "../engine/types";
import { makeView, type EmpireView } from "../engine/view";
import { autoScoutOrders, basicAIAnswers, basicAITurn } from "./basicAI";
import { masterAIAnswers, masterAITurn } from "./masterAI";
export { autoScoutOrders };

export function brainOf(state: GameState, e: Empire): AiBrain {
  return e.ai ?? (state.settings.difficulty === "master" && !e.isPlayer ? "master" : "basic");
}

const TURN: Record<AiBrain, (v: EmpireView) => Command[]> = { basic: basicAITurn, master: masterAITurn };
const ANSWERS: Record<AiBrain, (v: EmpireView) => Command[]> = { basic: basicAIAnswers, master: masterAIAnswers };

export function runAITurns(state: GameState, includePlayer = false): void {
  const asleep = (state.cheats?.rivalsAsleepUntil ?? 0) > state.turn;
  for (const e of state.empires) {
    if (asleep && !e.isPlayer) continue; // player's "sleep rivals" cheat
    if (!e.alive || (e.isPlayer && !includePlayer)) continue;
    for (const cmd of TURN[brainOf(state, e)](makeView(state, e.id))) applyCommand(state, e.id, cmd);
  }
}

/** AI empires answer proposals waiting for them right away, from their own view. */
export function aiAnswerProposals(state: GameState): void {
  const waiting = [...new Set(state.proposals.map((p) => p.to))].sort((a, b) => a - b);
  for (const id of waiting) {
    const e = state.empires[id];
    if (!e || e.isPlayer || !e.alive) continue;
    for (const cmd of ANSWERS[brainOf(state, e)](makeView(state, id))) applyCommand(state, id, cmd);
  }
}
