import { describe, expect, it } from "vitest";
import { applyCommand, deserialize, endTurn, fuelRange, makeView, newGame, race, serialize, shipSpeed, type GameSettings } from "../src/engine";
import { TECHS } from "../src/engine/data/techs";
import { fieldTier, learn, researchChoices, rollTechPool, START_TECHS, tech, techCost, techStats, TIER_COST } from "../src/engine/tech";
import { makeRng } from "../src/engine/rng";
import { FIELDS } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 4242, size: "small", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("tech tree", () => {
  it("has 120 base techs plus 56 future techs, all unique, in six fields", () => {
    expect(TECHS.filter((t) => t.tier <= 10).length).toBe(120);
    expect(TECHS.filter((t) => t.tier > 10).length).toBe(5 * 10 + 6);
    expect(new Set(TECHS.map((t) => t.id)).size).toBe(TECHS.length);
    for (const f of FIELDS) expect(TECHS.some((t) => t.field === f)).toBe(true);
  });

  it("every empire's tree has at least one tech per field and tier; Vossari get everything", () => {
    for (let seed = 1; seed < 30; seed++) {
      const pool = rollTechPool(makeRng(seed), race("humans"));
      for (const f of FIELDS) for (let tier = 2; tier <= 10; tier++) {
        expect(pool.some((id) => tech(id).field === f && tech(id).tier === tier)).toBe(true);
      }
    }
    const all = TECHS.filter((t) => !t.start).length;
    expect(rollTechPool(makeRng(9), race("vossari")).length).toBe(all);
  });

  it("starting techs give the starting stats", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    expect(e.research.known).toEqual([...START_TECHS]);
    expect(shipSpeed(e)).toBe(1.5);
    expect(fuelRange(e)).toBe(3);
    for (const f of FIELDS) expect(e.research.current[f]).not.toBeNull();
  });

  it("learning techs changes the empire's stats", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    learn(e.research, "ion-drive");
    learn(e.research, "deuterium-cells");
    learn(e.research, "terraforming-i");
    expect(shipSpeed(e)).toBe(2);
    expect(fuelRange(e)).toBe(4);
    expect(techStats(e).terraform).toBe(10);
  });

  it("research points complete the current project and pick the next", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const id = e.research.current.propulsion!;
    e.research.progress.propulsion = techCost(tech(id), race(e.raceId));
    endTurn(g);
    expect(e.research.known).toContain(id);
    expect(e.research.current.propulsion).not.toBe(id);
    expect(fieldTier(e.research, "propulsion")).toBeGreaterThanOrEqual(1);
  });

  it("can only choose projects from your own tree, one tier ahead", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const choice = researchChoices(e.research, "weapons")[0]!;
    expect(applyCommand(g, 0, { type: "setResearchProject", field: "weapons", techId: choice.id }).ok).toBe(true);
    expect(applyCommand(g, 0, { type: "setResearchProject", field: "weapons", techId: "annihilator-ray" }).ok).toBe(false);
    expect(makeView(g, 0).stats.projects.weapons?.techId).toBe(choice.id);
  });

  it("loads version 1 saves by converting research levels into techs", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g));
    old.version = 1;
    for (const e of old.empires) e.research = { alloc: e.research.alloc, progress: e.research.progress, level: { computers: 1, construction: 1, forceFields: 1, planetology: 3, propulsion: 1, weapons: 1 } };
    const loaded = deserialize(JSON.stringify(old));
    const e = loaded.empires[0]!;
    expect(fieldTier(e.research, "planetology")).toBe(2);
    endTurn(loaded);
  });
});

describe("future technologies", () => {
  it("are in every empire's tree, cost more each level, and chain after tier 10", () => {
    const pool = rollTechPool(makeRng(5), race("humans"));
    const future = TECHS.filter((t) => t.tier > 10);
    for (const t of future) expect(pool).toContain(t.id);
    for (let tier = 11; tier < 20; tier++) expect(TIER_COST[tier + 1]!).toBeGreaterThan(TIER_COST[tier]!);
    for (const t of future) {
      expect(t.description.split(" ").length).toBeLessThanOrEqual(20);
      expect(t.quote.split(" ").length).toBeLessThanOrEqual(25);
    }
  });
});

