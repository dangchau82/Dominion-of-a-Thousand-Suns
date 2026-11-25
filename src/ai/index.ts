// Runs every AI empire's turn. Each AI gets only its own EmpireView and
// can only act through applyCommand, exactly like the player.

import { applyCommand } from "../engine/commands";
import type { GameState } from "../engine/types";
import { makeView } from "../engine/view";
import { basicAITurn } from "./basicAI";

export function runAITurns(state: GameState, includePlayer = false): void {
  const asleep = (state.cheats?.rivalsAsleepUntil ?? 0) > state.turn;
  for (const e of state.empires) {
    if (asleep && !e.isPlayer) continue; // player's "sleep rivals" cheat
    if (!e.alive || (e.isPlayer && !includePlayer)) continue;
    for (const cmd of basicAITurn(makeView(state, e.id))) applyCommand(state, e.id, cmd);
  }
}
