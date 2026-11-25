// Unrest, revolts and civil war (src/engine/unrest.ts).
import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, newGame, type GameSettings, type GameState } from "../src/engine";
import { runAITurns } from "../src/ai";
import { newColony } from "../src/engine/game";
import { colonyBudget } from "../src/engine/turn";
import { processEspionage } from "../src/engine/diplomacy";
import { processUnrest, unrestTarget } from "../src/engine/unrest";
import { deserialize, serialize } from "../src/engine/save";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 4242, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** Give an empire colonies on the unclaimed planets nearest its capital. */
function settle(g: GameState, empireId: number, count: number): number[] {
  const home = g.stars[g.empires[empireId]!.capitalStarId]!;
  const free = g.stars
    .filter((s) => s.planet && !g.colonies[s.id])
    .sort((a, b) => Math.hypot(a.x - home.x, a.y - home.y) - Math.hypot(b.x - home.x, b.y - home.y) || a.id - b.id)
    .slice(0, count);
  for (const s of free) { const c = newColony(s.id, empireId, 20, 1); c.factories = 20; g.colonies[s.id] = c; }
  return free.map((s) => s.id);
}

describe("unrest", () => {
  it("the capital is always calm; a far, conquered world is not", () => {
    const g = newGame(settings());
    const [id] = settle(g, 0, 1);
    const c = g.colonies[id!]!;
    c.peopleRaceId = g.empires[1]!.raceId; c.occupiedFrom = 1; c.occupiedSince = g.turn;
    expect(unrestTarget(g, g.colonies[g.empires[0]!.capitalStarId]!)).toBe(0);
    expect(unrestTarget(g, c)).toBeGreaterThan(30);
  });

  it("unrest cuts a colony's output", () => {
    const g = newGame(settings());
    const [id] = settle(g, 0, 1);
    const c = g.colonies[id!]!;
    const calm = colonyBudget(g, c).production;
    c.unrest = 100;
    expect(colonyBudget(g, c).production).toBeCloseTo(calm * 0.75, 5);
  });

  it("an occupied world in revolt rejoins its own people's empire", () => {
    const g = newGame(settings());
    const [id] = settle(g, 0, 1);
    const c = g.colonies[id!]!;
    c.peopleRaceId = g.empires[1]!.raceId; c.occupiedFrom = 1; c.occupiedSince = g.turn; c.agitation = 100;
    g.empires[0]!.security = 0;
    for (let t = 0; t < 200 && g.colonies[id!]!.empireId === 0; t++) { c.unrest = 100; processUnrest(g); g.turn++; }
    expect(g.colonies[id!]!.empireId).toBe(1);
    expect(g.colonies[id!]!.peopleRaceId).toBeUndefined();
  });

  it("restless home worlds break away as a rebel empire at war with the old one", () => {
    const g = newGame(settings());
    const ids = settle(g, 0, 8);
    g.empires[0]!.security = 0;
    const first = g.colonies[ids[0]!]!;
    for (let t = 0; t < 300 && g.empires.length === 3; t++) {
      first.agitation = 100; first.unrest = 100;
      processUnrest(g); g.turn++;
    }
    expect(g.empires.length).toBe(4);
    const rebel = g.empires[3]!;
    expect(rebel.rebelOf).toBe(0);
    expect(rebel.atWar[0]).toBeDefined();
    expect(g.empires[0]!.atWar[3]).toBeDefined();
    expect(rebel.name.startsWith("The ")).toBe(false);
    expect(g.colonies[g.empires[0]!.capitalStarId]!.empireId).toBe(0);
    const theirs = Object.values(g.colonies).filter((c) => c.empireId === 3);
    expect(theirs.length).toBeGreaterThan(0);
    expect(theirs.length).toBeLessThanOrEqual(3); // at most a third of 9 worlds
    expect(theirs.filter((c) => c.isCapital).length).toBe(1);
    // The rebels can keep playing: an AI turn and an end turn run cleanly.
    runAITurns(g, true);
    endTurn(g);
  });

  it("fund rebels: a successful mission makes revolts likelier on their angriest world", () => {
    const g = newGame(settings());
    const ids = settle(g, 1, 3);
    const e = g.empires[0]!, t = g.empires[1]!;
    e.contacts.push(1); t.contacts.push(0);
    t.security = 0;
    g.colonies[ids[1]!]!.unrest = 50;
    expect(applyCommand(g, 0, { type: "setSpies", targetId: 1, alloc: 10, mission: "fundRebels" }).ok).toBe(true);
    e.spies[1]!.agents = 3;
    for (let i = 0; i < 100 && !g.colonies[ids[1]!]!.rebelsFundedUntil; i++) processEspionage(g);
    expect(g.colonies[ids[1]!]!.rebelsFundedUntil).toBeGreaterThan(g.turn);
    expect(g.events.some((ev) => ev.empireId === 1 && ev.kind === "spy")).toBe(true);
  });

  it("unknown spy missions are refused", () => {
    const g = newGame(settings());
    g.empires[0]!.contacts.push(1);
    expect(applyCommand(g, 0, { type: "setSpies", targetId: 1, alloc: 2, mission: "bribe" as never }).ok).toBe(false);
  });

  it("long AI games with unrest stay deterministic and save cleanly", () => {
    const run = () => {
      const g = newGame(settings({ seed: 99 }));
      for (let t = 0; t < 120; t++) { runAITurns(g); endTurn(g); }
      return g;
    };
    const a = run(), b = run();
    expect(serialize(a)).toBe(serialize(b));
    expect(serialize(deserialize(serialize(a)))).toBe(serialize(a));
  });
});
