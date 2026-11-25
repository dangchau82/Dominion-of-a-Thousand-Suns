import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, makeView, newGame, type GameSettings } from "../src/engine";
import { learn } from "../src/engine/tech";
import { empireBonus } from "../src/engine/civ";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 99, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("civilization layer", () => {
  it("builds a building with industry and applies it", () => {
    const g = newGame(settings());
    const home = g.empires[0]!.capitalStarId;
    expect(applyCommand(g, 0, { type: "setBuilding", starId: home, buildingId: "civic-forum" }).ok).toBe(true);
    for (let i = 0; i < 20 && !g.colonies[home]!.buildings.includes("civic-forum"); i++) endTurn(g);
    expect(g.colonies[home]!.buildings).toContain("civic-forum");
    expect(g.empires[0]!.culture).toBeGreaterThan(0);
  });

  it("buildings need research, and buying finishes them", () => {
    const g = newGame(settings());
    const home = g.empires[0]!.capitalStarId;
    expect(applyCommand(g, 0, { type: "setBuilding", starId: home, buildingId: "hydroponic-farms" }).ok).toBe(false);
    learn(g.empires[0]!.research, "barren-world-habitats");
    expect(applyCommand(g, 0, { type: "setBuilding", starId: home, buildingId: "hydroponic-farms" }).ok).toBe(true);
    g.empires[0]!.treasury = 1000;
    const size = g.stars[home]!.planet!.terraform;
    expect(applyCommand(g, 0, { type: "buyBuilding", starId: home }).ok).toBe(true);
    expect(g.colonies[home]!.buildings).toContain("hydroponic-farms");
    expect(g.stars[home]!.planet!.terraform).toBe(size + 5);
  });

  it("a wonder can only be built once in the galaxy, and its bonus applies", () => {
    const g = newGame(settings());
    for (const e of g.empires) learn(e.research, "terraforming-i");
    for (const e of g.empires) for (const id of ["barren-world-habitats", "terraforming-i"]) learn(e.research, id);
    // Planetology tier 3 is enough for the Garden.
    const h0 = g.empires[0]!.capitalStarId;
    const h1 = g.empires[1]!.capitalStarId;
    expect(applyCommand(g, 0, { type: "setBuilding", starId: h0, buildingId: "w-garden" }).ok).toBe(true);
    expect(applyCommand(g, 1, { type: "setBuilding", starId: h1, buildingId: "w-garden" }).ok).toBe(true);
    g.colonies[h0]!.buildProgress = 99999;
    g.colonies[h1]!.buildProgress = 10;
    endTurn(g);
    expect(g.wonders["w-garden"]?.empireId).toBe(0);
    expect(empireBonus(g.empires[0]!).growth).toBeCloseTo(0.3);
    expect(applyCommand(g, 1, { type: "setBuilding", starId: h1, buildingId: "w-garden" }).ok).toBe(false);
  });

  it("leaders can be hired and boost the empire", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    e.leaderOffer = { id: 1, name: "Velora", kind: "scientist", level: 2, cost: 100, salary: 3, offerUntil: 10 };
    e.treasury = 150;
    const before = makeView(g, 0).colonies[0]!.budget.research;
    expect(applyCommand(g, 0, { type: "hireLeader" }).ok).toBe(true);
    expect(makeView(g, 0).colonies[0]!.budget.research).toBeGreaterThan(before);
    expect(e.treasury).toBe(50);
  });
});
