// Scenarios (src/engine/scenarios.ts).
import { describe, expect, it } from "vitest";
import { endTurn, newGame, type GameSettings } from "../src/engine";
import { applyScenario, BASTION_BASES, processScenario, SCENARIOS } from "../src/engine/scenarios";
import { processCrisis } from "../src/engine/crisis";
import { processDigSites } from "../src/engine/digSites";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 141, size: "medium", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("scenarios", () => {
  it("all four have a story, a goal and a deadline", () => {
    expect(SCENARIOS).toHaveLength(4);
    for (const s of SCENARIOS) { expect(s.story.length).toBeGreaterThan(40); expect(s.deadline).toBeGreaterThan(50); }
  });

  it("The Last Bastion: a fortress home, everyone at war with us; surviving to the deadline wins", () => {
    const g = newGame(settings());
    const bases = g.colonies[g.empires[0]!.capitalStarId]!.missileBases;
    applyScenario(g, "last-bastion");
    expect(g.colonies[g.empires[0]!.capitalStarId]!.missileBases).toBe(bases + BASTION_BASES);
    for (const o of g.empires.slice(1)) expect(o.atWar[0]).toBeDefined();
    g.turn = 100; processScenario(g);
    expect(g.scenario!.result).toEqual({ won: true, turn: 100 });
  });

  it("Five Broken Kingdoms: five free worlds far apart; holding all five wins", () => {
    const g = newGame(settings());
    applyScenario(g, "broken-kingdoms");
    const stars = g.scenario!.stars;
    expect(new Set(stars).size).toBe(5);
    processScenario(g);
    expect(g.scenario!.result).toBeUndefined();
    const home = g.colonies[g.empires[0]!.capitalStarId]!;
    for (const sid of stars) g.colonies[sid] = { ...structuredClone(home), starId: sid, isCapital: false, buildQueue: null };
    processScenario(g);
    expect(g.scenario!.result?.won).toBe(true);
  });

  it("The Long Night brings the Hollow Tide on turn 60; Gold Rush triples the ruins", () => {
    const g = newGame(settings());
    applyScenario(g, "long-night");
    g.turn = 60; processCrisis(g);
    expect(g.crisis).toBeDefined();
    const a = newGame(settings()), b = newGame(settings());
    applyScenario(b, "gold-rush");
    processDigSites(a); processDigSites(b);
    expect(b.digs!.sites.length).toBe(a.digs!.sites.length * 3);
  });

  it("missing the deadline fails; a scenario game still plays turns", () => {
    const g = newGame(settings());
    applyScenario(g, "gold-rush");
    for (let i = 0; i < 3; i++) endTurn(g);
    g.turn = 181; processScenario(g);
    expect(g.scenario!.result?.won).toBe(false);
  });

  it("old saves (version 46) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 46;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
