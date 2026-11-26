// Smuggler rings (src/engine/smugglers.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { resolveEvent } from "../src/engine/events";
import { CRACKDOWN_COST, CUT_MONEY, MAX_RINGS, processSmugglers, RING_TURNS, SKIM_MONEY, SMUGGLER_EVENT_ID } from "../src/engine/smugglers";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 52, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** A game where empire 0 owns a second colony, run until the ring shows up. */
function ringGame(): GameState {
  const g = newGame(settings());
  const e = g.empires[0]!;
  const cap = g.colonies[e.capitalStarId]!;
  const other = g.stars.find((s) => s.planet && !g.colonies[s.id])!;
  g.colonies[other.id] = { ...JSON.parse(JSON.stringify(cap)), starId: other.id, population: 5 };
  for (g.turn = 1; g.turn < 200 && !g.pendingEvents.some((p) => p.empireId === 0 && p.eventId === SMUGGLER_EVENT_ID); g.turn++) processSmugglers(g);
  return g;
}
const ev = (g: GameState) => g.pendingEvents.find((p) => p.empireId === 0 && p.eventId === SMUGGLER_EVENT_ID)!;

describe("smuggler rings", () => {
  it("show up (turn 50-99) at an outer colony, without random draws", () => {
    const g = ringGame();
    const p = ev(g);
    expect(p).toBeDefined();
    expect(g.turn).toBeGreaterThanOrEqual(50);
    expect(g.turn).toBeLessThan(100);
    expect(p.colonyStarId).not.toBe(g.empires[0]!.capitalStarId);
  });

  it("cracking down costs money once and leaves no ring", () => {
    const g = ringGame();
    const e = g.empires[0]!;
    e.treasury = 500;
    resolveEvent(g, ev(g), 0);
    expect(e.treasury).toBe(500 - CRACKDOWN_COST);
    expect(g.smugglers![0]!.active).toBeUndefined();
  });

  it("taking a cut pays every turn and leaks research; the ring leaves after RING_TURNS", () => {
    const g = ringGame();
    const e = g.empires[0]!;
    resolveEvent(g, ev(g), 1);
    e.treasury = 100;
    e.research.progress.computers = 50;
    g.turn++;
    processSmugglers(g);
    expect(e.treasury).toBe(100 + CUT_MONEY);
    expect(e.research.progress.computers).toBeLessThan(50);
    g.turn += RING_TURNS;
    processSmugglers(g);
    expect(g.smugglers![0]!.active).toBeUndefined();
  });

  it("looking away skims money", () => {
    const g = ringGame();
    const e = g.empires[0]!;
    resolveEvent(g, ev(g), 2);
    e.treasury = 100;
    g.turn++;
    processSmugglers(g);
    expect(e.treasury).toBe(100 - SKIM_MONEY);
  });

  it("at most MAX_RINGS per empire", () => {
    const g = ringGame();
    for (let i = 0; i < 800; i++) {
      for (const p of g.pendingEvents.filter((x) => x.empireId === 0)) resolveEvent(g, p, 0);
      g.turn++;
      processSmugglers(g);
    }
    expect(g.smugglers![0]!.rings).toBe(MAX_RINGS);
  });

  it("old saves (version 29) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 29;
    delete old.smugglers;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
