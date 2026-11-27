// Public entry for the 3D battle scenes. Loaded on demand (dynamic import) so three.js only
// downloads when someone watches a battle.

import { newGame, endTurn, type GameState } from "../../engine";
import { runAITurns } from "../../ai";
import type { BattleRecord } from "../../engine/battleLog";
import type { Id } from "../../engine/types";
import { playSpaceBattle } from "./spaceBattle";
import { playLanding, type LandingInfo } from "./landing";

export { playSpaceBattle, playLanding };
export type { LandingInfo };

/** Watch a recorded space battle. */
export function openBattleReplay(state: GameState, rec: BattleRecord, playerId: Id, onClose?: () => void): void {
  playSpaceBattle(state, rec, playerId, onClose);
}

/**
 * Demo for testing and showing off: plays a quick AI game until the player's empire has fought
 * a real battle, then replays it. Open the game with #battle-demo (or #battle-demo-kethrak).
 */
export function battleDemo(raceId = "humans", seed = 2611): void {
  const note = document.createElement("div");
  note.style.cssText = "position:fixed;inset:0;display:grid;place-items:center;background:#02040a;color:#cfd8e3;font:16px system-ui,sans-serif;z-index:999";
  note.textContent = "Playing a war to record a real battle…";
  document.body.append(note);
  setTimeout(() => {
    const s = newGame({ seed, size: "small", shape: "ellipse", rivals: 3, playerRaceId: raceId, playerName: "Demo", difficulty: "normal" } as never);
    let best: BattleRecord | undefined;
    for (let t = 0; t < 400 && !s.winner; t++) {
      runAITurns(s, true); endTurn(s);
      const big = (s.battles ?? []).filter((b) => b.shots.length > 40 && b.units.length >= 3);
      if (big.length) { best = big.sort((a, b) => b.shots.length - a.shots.length)[0]!; if (best.shots.length > 120) break; }
    }
    note.remove();
    best ??= (s.battles ?? []).slice(-1)[0];
    if (!best) { alertBox("No battle happened in the demo game. Try another seed: #battle-demo-humans-7"); return; }
    playSpaceBattle(s, best, 0);
  }, 50);
}

function alertBox(text: string): void {
  const d = document.createElement("div");
  d.style.cssText = "position:fixed;inset:0;display:grid;place-items:center;background:#02040a;color:#cfd8e3;font:16px system-ui,sans-serif;z-index:999";
  d.textContent = text;
  document.body.append(d);
}

/** Demo of a landing: picks a world of the given climate type (ocean worlds give a sea landing). #landing-demo-kethrak, #landing-demo-ocean */
export function landingDemo(raceOrClimate = "kethrak", seed = 7): void {
  const climates = ["ocean", "terran", "jungle", "desert", "tundra", "inferno", "toxic", "barren", "arid", "steppe", "dead", "radiated", "minimal"];
  const wantClimate = climates.includes(raceOrClimate) ? raceOrClimate : null;
  const s = newGame({ seed, size: "small", shape: "ellipse", rivals: 2, playerRaceId: wantClimate ? "humans" : raceOrClimate, playerName: "Demo", difficulty: "normal" } as never);
  const target = s.stars.find((st) => st.planet && (wantClimate ? st.planet.climate === wantClimate : true) && !s.colonies[st.id]) ?? s.stars.find((st) => st.planet)!;
  playLanding(s, { starId: target.id, attackerId: 0, defenderId: 1, captured: seed % 2 === 1, troops: 24, survivors: 14, turn: 100 }, 0);
}
