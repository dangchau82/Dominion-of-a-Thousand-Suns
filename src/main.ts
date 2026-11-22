// Temporary entry point: runs a short AI-only game and prints a summary.
// The stage 1 screens (star map, colony panel, End Turn bar) replace this.

import { runAITurns } from "./ai";
import { endTurn, newGame } from "./engine";

const out = document.getElementById("out");
const game = newGame({
  seed: Date.now() % 1_000_000, size: "medium", shape: "spiral", rivals: 5,
  playerRaceId: "humans", playerName: "Danny",
});
for (let t = 0; t < 100; t++) {
  runAITurns(game, true);
  endTurn(game);
}
const lines = game.empires.map((e) => {
  const cols = Object.values(game.colonies).filter((c) => c.empireId === e.id);
  const pop = cols.reduce((a, c) => a + c.population, 0);
  return `${e.name.padEnd(18)} colonies ${String(cols.length).padStart(3)}   population ${pop.toFixed(0)}`;
});
if (out) out.textContent = `${game.stars.length} stars, after ${game.turn - 1} turns of AI self-play:\n\n${lines.join("\n")}`;
