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

// Developer and showcase entry: #battle-demo, #battle-demo-<race>, #battle-demo-<race>-<seed>,
// #landing-demo-<race> plays the 3D battle scenes without starting a game.
const demo = /^#(battle|landing)-demo(?:-([a-z]+))?(?:-(\d+))?$/.exec(location.hash);
if (demo) void import("./ui/battle3d").then((m) => demo[1] === "battle" ? m.battleDemo(demo[2] ?? "humans", Number(demo[3] ?? 2611)) : m.landingDemo(demo[2] ?? "kethrak", Number(demo[3] ?? 7)));
else showMainMenu(root, startGame);
