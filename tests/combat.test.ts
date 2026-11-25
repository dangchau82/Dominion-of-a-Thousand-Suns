import { describe, expect, it } from "vitest";
import { applyCommand, designsOf, endTurn, newGame, type GameSettings, type GameState } from "../src/engine";
import { runAITurns } from "../src/ai";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 31337, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

function meet(g: GameState, a: number, b: number) {
  g.empires[a]!.contacts.push(b);
  g.empires[b]!.contacts.push(a);
}
function design(g: GameState, empireId: number, name: string) {
  return designsOf(g, empireId).find((d) => d.name === name)!;
}
function park(g: GameState, empireId: number, starId: number, ships: Record<string, number>) {
  const s = g.stars[starId]!;
  g.fleets.push({ id: g.nextFleetId++, empireId, ships, x: s.x, y: s.y, starId, destStarId: null });
}

describe("war and peace", () => {
  it("needs contact to declare war; peace needs both sides", () => {
    const g = newGame(settings());
    expect(applyCommand(g, 0, { type: "declareWar", targetId: 1 }).ok).toBe(false);
    meet(g, 0, 1);
    expect(applyCommand(g, 0, { type: "declareWar", targetId: 1 }).ok).toBe(true);
    expect(g.empires[1]!.atWar[0]).toBe(g.turn);
    expect(applyCommand(g, 0, { type: "offerPeace", targetId: 1 }).ok).toBe(true);
    expect(g.empires[0]!.atWar[1]).toBeDefined();
    expect(applyCommand(g, 1, { type: "offerPeace", targetId: 0 }).ok).toBe(true);
    expect(g.empires[0]!.atWar[1]).toBeUndefined();
  });

  it("empires at peace share a star without fighting", () => {
    const g = newGame(settings());
    meet(g, 0, 1);
    const home1 = g.empires[1]!.capitalStarId;
    park(g, 0, home1, { [design(g, 0, "Destroyer").id]: 5 });
    endTurn(g);
    expect(g.events.some((e) => e.kind === "battle")).toBe(false);
  });
});

describe("battles", () => {
  it("a big fleet beats a small one, and losses come off the fleets", () => {
    const g = newGame(settings());
    meet(g, 0, 1);
    applyCommand(g, 0, { type: "declareWar", targetId: 1 });
    const star = g.empires[0]!.capitalStarId;
    park(g, 0, star, { [design(g, 0, "Destroyer").id]: 10 });
    park(g, 1, star, { [design(g, 1, "Fighter").id]: 2 });
    endTurn(g);
    const enemyLeft = g.fleets.filter((f) => f.empireId === 1 && f.starId === star).length;
    expect(enemyLeft).toBe(0);
    expect(g.events.some((e) => e.kind === "battle" && e.empireId === 0)).toBe(true);
  });

  it("missile bases defend a planet and can be shot down", () => {
    const g = newGame(settings());
    meet(g, 0, 1);
    applyCommand(g, 0, { type: "declareWar", targetId: 1 });
    const home1 = g.empires[1]!.capitalStarId;
    g.colonies[home1]!.missileBases = 2;
    park(g, 0, home1, { [design(g, 0, "Destroyer").id]: 20 });
    endTurn(g);
    expect(g.colonies[home1]!.missileBases).toBeLessThan(2);
  });

  it("god mode keeps the player's ships alive", () => {
    const g = newGame(settings());
    meet(g, 0, 1);
    applyCommand(g, 0, { type: "declareWar", targetId: 1 });
    g.cheats = { godMode: true };
    const star = g.empires[1]!.capitalStarId;
    park(g, 0, star, { [design(g, 0, "Fighter").id]: 1 });
    park(g, 1, star, { [design(g, 1, "Destroyer").id]: 10 });
    endTurn(g);
    expect(g.fleets.some((f) => f.empireId === 0 && f.starId === star)).toBe(true);
  });
});

describe("invasion", () => {
  it("troops capture an undefended colony and keep its factories", () => {
    const g = newGame(settings());
    meet(g, 0, 1);
    applyCommand(g, 0, { type: "declareWar", targetId: 1 });
    const target = g.empires[1]!.capitalStarId;
    const c = g.colonies[target]!;
    c.population = 3;
    c.missileBases = 0;
    const factories = c.factories;
    park(g, 0, target, { transport: 60 });
    endTurn(g);
    expect(g.colonies[target]!.empireId).toBe(0);
    expect(g.colonies[target]!.factories).toBe(factories);
    expect(g.events.some((e) => e.kind === "invasion")).toBe(true);
  });

  it("sending troops takes population from the source colony", () => {
    const g = newGame(settings());
    const home = g.empires[0]!.capitalStarId;
    const near = g.stars.filter((s) => s.id !== home && g.empires[0]!.knowledge[s.id]?.explored)[0];
    const pop = g.colonies[home]!.population;
    if (near) {
      expect(applyCommand(g, 0, { type: "sendTransports", fromStarId: home, toStarId: near.id, troops: 10 }).ok).toBe(true);
      expect(g.colonies[home]!.population).toBe(pop - 10);
    }
    expect(applyCommand(g, 0, { type: "sendTransports", fromStarId: home, toStarId: home, troops: 10 }).ok).toBe(false);
  });
});

describe("self-play with a war", () => {
  it("AI empires at war keep playing without errors", () => {
    const g = newGame(settings({ size: "medium", rivals: 4 }));
    for (let t = 0; t < 120; t++) {
      if (t === 40) for (const e of g.empires) for (const o of g.empires) if (e.id < o.id) { meet(g, e.id, o.id); applyCommand(g, e.id, { type: "declareWar", targetId: o.id }); }
      runAITurns(g, true);
      endTurn(g);
    }
    for (const c of Object.values(g.colonies)) expect(Number.isFinite(c.population)).toBe(true);
    expect(g.empires.some((e) => e.alive)).toBe(true);
  });
});
