// Entry point: main menu -> game screen.

import "./ui/styles.css";
import { GameScreen } from "./ui/game";
import { showMainMenu } from "./ui/menu";
import { autosave } from "./ui/storage";
import type { GameState } from "./engine";

const root = document.getElementById("app")!;

function startGame(state: GameState): void {
  autosave(state);
  new GameScreen(root, state, () => showMainMenu(root, startGame));
}

showMainMenu(root, startGame);
