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
// #landing-demo-<race> plays the 3D battle scenes without starting a game. A trailing @<seconds>
// freezes a landing at that moment (for screenshots).
const demo = /^#(battle|landing)-demo(?:-([a-z]+))?(?:-(\d+))?(?:@[\d.]+)?$/.exec(location.hash);
// #play-demo-<race>-<seed> starts a medium game at once (for interface screenshots).
const play = /^#play-demo(?:-([a-z]+))?(?:-(\d+))?(-map)?$/.exec(location.hash);
// #load-demo-<name>[-<button>...] loads public/saves/<name>.json (a playtest save) for screenshots,
// then clicks the named buttons one after another (top bar first, then any button by its text).
const loadDemo = /^#load-demo-([a-z0-9]+)((?:-[a-z]+)*)$/.exec(location.hash);
if (loadDemo) {
  void Promise.all([import("./engine"), fetch(`saves/${loadDemo[1]}.json`).then((r) => r.text())]).then(([{ deserialize }, txt]) => {
    document.head.append(Object.assign(document.createElement("style"), { textContent: ".advisor{display:none!important}" }));
    new GameScreen(root, deserialize(txt), () => showMainMenu(root, startGame));
    setTimeout(() => { document.querySelector<HTMLButtonElement>(".modal .row button:last-child")?.click(); }, 800);
    (loadDemo[2] ?? "").split("-").filter(Boolean).forEach((want, i) => setTimeout(() => {
      const nav = [...document.querySelectorAll<HTMLButtonElement>(".navbtn")].find((b) => b.querySelector(".lbl")?.textContent?.toLowerCase() === want);
      (nav ?? [...document.querySelectorAll<HTMLButtonElement>("button")].find((b) => b.textContent?.toLowerCase().includes(want)))?.click();
    }, 1500 + i * 1500));
  });
} else if (play) {
  void import("./engine").then(({ newGame }) => startGame(newGame({ seed: Number(play[2] ?? 7), size: "medium", shape: "spiral", rivals: 5, playerRaceId: play[1] ?? "humans", playerName: "Demo", difficulty: "normal" } as Parameters<typeof newGame>[0])));
  // "-map" closes the welcome dialog and opens the home star, to show the map screen.
  if (play[3]) setTimeout(() => { document.querySelector<HTMLButtonElement>(".modal .row button:last-child")?.click(); document.querySelector<HTMLButtonElement>(".advisor button")?.click(); }, 1500);
} else if (/^#ship-gallery/.test(location.hash)) void import("./ui/battle3d").then((m) => m.shipGallery((location.hash.split("-")[2] as "small" | "medium" | "large" | "huge") ?? "large"));
else if (demo) void import("./ui/battle3d").then((m) => demo[1] === "battle" ? m.battleDemo(demo[2] ?? "humans", Number(demo[3] ?? 2611)) : m.landingDemo(demo[2] ?? "kethrak", Number(demo[3] ?? 7)));
else showMainMenu(root, startGame);
