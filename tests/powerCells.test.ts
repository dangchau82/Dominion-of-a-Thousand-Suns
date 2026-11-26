// Ancient power cells (src/engine/powerCells.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { resolveEvent } from "../src/engine/events";
import { exploreStar } from "../src/engine/knowledge";
import { CELL_EVENT_ID, CELL_TURNS, cellOutput, MAX_CELLS, processPowerCells, SELL_PRICE } from "../src/engine/powerCells";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 48, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

function found(): GameState {
  const g = newGame(settings());
  for (const s of g.stars.filter((x) => !g.colonies[x.id]).slice(0, 6)) exploreStar(g, g.empires[0]!, s, false);
  for (g.turn = 1; g.turn < 200 && !g.pendingEvents.some((p) => p.empireId === 0 && p.eventId === CELL_EVENT_ID); g.turn++) processPowerCells(g);
  return g;
}

function cellEvent(g: GameState) {
  return g.pendingEvents.find((p) => p.empireId === 0 && p.eventId === CELL_EVENT_ID)!;
}

describe("ancient power cells", () => {
  it("are found (turn 70-129) at an explored star, without random draws", () => {
    const g = newGame(settings());
    for (const s of g.stars.filter((x) => !g.colonies[x.id]).slice(0, 6)) exploreStar(g, g.empires[0]!, s, false);
    const rng = JSON.stringify(g.rng);
    let at = 0;
    for (g.turn = 1; g.turn < 200 && !at; g.turn++) {
      processPowerCells(g);
      if (g.pendingEvents.some((p) => p.empireId === 0 && p.eventId === CELL_EVENT_ID)) at = g.turn;
    }
    expect(JSON.stringify(g.rng)).toBe(rng);
    expect(at).toBeGreaterThanOrEqual(70);
    expect(at).toBeLessThan(130);
  });

  it("installed at the capital it pays money every turn for CELL_TURNS turns, then goes dark", () => {
    const g = found();
    const e = g.empires[0]!;
    resolveEvent(g, cellEvent(g), 0);
    const per = cellOutput(g, e.capitalStarId);
    expect(per).toBeGreaterThan(0);
    const money = e.treasury;
    g.turn++;
    processPowerCells(g);
    expect(e.treasury).toBe(money + per);
    g.turn += CELL_TURNS;
    processPowerCells(g);
    expect(g.powerCells![0]!.active.length).toBe(0);
  });

  it("selling pays at once", () => {
    const g = found();
    const e = g.empires[0]!;
    const money = e.treasury;
    resolveEvent(g, cellEvent(g), 2);
    expect(e.treasury).toBe(money + SELL_PRICE);
    expect(g.powerCells![0]!.active.length).toBe(0);
  });

  it("at most MAX_CELLS per empire", () => {
    const g = found();
    for (let i = 0; i < 600; i++) {
      g.turn++;
      processPowerCells(g);
      for (const p of g.pendingEvents.filter((x) => x.empireId === 0)) resolveEvent(g, p, 2);
    }
    expect(g.powerCells![0]!.found).toBe(MAX_CELLS);
  });

  it("old saves (version 28) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 28;
    delete old.powerCells;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
