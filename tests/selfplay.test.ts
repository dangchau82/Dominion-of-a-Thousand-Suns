// AI-vs-AI games run end to end. Checks the engine stays sane over long games
// and that the same seed always plays out the same way.

import { describe, expect, it } from "vitest";
import { runAITurns } from "../src/ai";
import {
  endTurn, newGame, planetCapacity, serialize, SLIDERS, type GameSettings, type GameState,
} from "../src/engine";

function play(settings: GameSettings, turns: number): GameState {
  const g = newGame(settings);
  for (let t = 0; t < turns; t++) {
    runAITurns(g, true);
    endTurn(g);
    checkInvariants(g);
  }
  return g;
}

function checkInvariants(g: GameState): void {
  for (const c of Object.values(g.colonies)) {
    const s = g.stars[c.starId]!;
    expect(s.planet).not.toBeNull();
    expect(Number.isFinite(c.population)).toBe(true);
    expect(c.population).toBeLessThanOrEqual(planetCapacity(s.planet!) + 1e-6);
    expect(c.factories).toBeGreaterThanOrEqual(0);
    expect(SLIDERS.reduce((a, k) => a + c.sliders[k], 0)).toBe(100);
  }
  for (const f of g.fleets) {
    expect(Number.isFinite(f.x) && Number.isFinite(f.y)).toBe(true);
    for (const n of Object.values(f.ships)) expect(n).toBeGreaterThanOrEqual(0);
  }
  for (const e of g.empires) expect(Number.isFinite(e.treasury)).toBe(true);
}

describe("self-play", () => {
  it("plays 200 turns on a medium spiral and every empire expands", () => {
    const g = play({ seed: 42, size: "medium", shape: "spiral", rivals: 5, playerRaceId: "vossari", playerName: "Test" }, 200);
    const counts = g.empires.map((e) => Object.values(g.colonies).filter((c) => c.empireId === e.id).length);
    for (const n of counts) expect(n).toBeGreaterThanOrEqual(3);
    const explored = g.empires.map((e) => Object.values(e.knowledge).filter((k) => k.explored).length);
    for (const n of explored) expect(n).toBeGreaterThanOrEqual(8);
    // Report for the build log.
    console.log("colonies per empire after 200 turns:", counts.join(", "));
    console.log("research levels (empire 0):", JSON.stringify(g.empires[0]!.research.level));
  });

  it("same seed, same game", () => {
    const s: GameSettings = { seed: 7, size: "small", shape: "ring", rivals: 3, playerRaceId: "humans", playerName: "A" };
    expect(serialize(play(s, 60))).toBe(serialize(play(s, 60)));
  });

  it("runs on every galaxy size", () => {
    for (const size of ["small", "medium", "large", "huge"] as const) {
      const g = play({ seed: 3, size, shape: "ellipse", rivals: size === "huge" ? 9 : 4, playerRaceId: "thraal", playerName: "T" }, 40);
      expect(g.turn).toBe(41);
    }
  });
});
