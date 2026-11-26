// Death worlds (src/engine/deathWorlds.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { countered, deathWorldOf, processDeathWorlds, STARS_PER_WORLD } from "../src/engine/deathWorlds";
import { exploreStar } from "../src/engine/knowledge";
import { TECHS } from "../src/engine/data/techs";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 19, size: "medium", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

function marked(): GameState {
  const g = newGame(settings());
  g.turn = 1;
  processDeathWorlds(g);
  return g;
}

/** Settle the player on the first death world. */
function settle(g: GameState) {
  const s = g.stars.find((x) => deathWorldOf(x))!;
  const home = g.colonies[g.empires[0]!.capitalStarId]!;
  g.colonies[s.id] = { ...home, starId: s.id, isCapital: false, population: 10, factories: 30, buildings: [] };
  return { s, d: deathWorldOf(s)!, c: g.colonies[s.id]! };
}

describe("death worlds", () => {
  it("about one in 30 stars, never a home world or a colony, marked without random draws", () => {
    const g = newGame(settings());
    const rng = JSON.stringify(g.rng);
    g.turn = 1;
    processDeathWorlds(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
    const worlds = g.stars.filter((s) => deathWorldOf(s));
    expect(worlds.length).toBe(Math.round(g.stars.length / STARS_PER_WORLD));
    for (const s of worlds) {
      expect(g.empires.some((e) => e.capitalStarId === s.id)).toBe(false);
      expect(g.colonies[s.id]).toBeUndefined();
    }
    // Marked once only.
    processDeathWorlds(g);
    expect(g.stars.filter((s) => deathWorldOf(s)).length).toBe(worlds.length);
  });

  it("explorers get one warning naming the counter-measure", () => {
    const g = marked();
    const s = g.stars.find((x) => deathWorldOf(x))!;
    exploreStar(g, g.empires[0]!, s, false);
    g.events = [];
    processDeathWorlds(g);
    processDeathWorlds(g);
    const warnings = g.events.filter((e) => e.empireId === 0 && e.starId === s.id);
    expect(warnings.length).toBe(1);
    expect(warnings[0]!.text).toContain(deathWorldOf(s)!.counter.name);
  });

  it("colonists die until the counter-measure, never below 1", () => {
    const g = marked();
    const { d, c } = settle(g);
    const before = c.population;
    expect(countered(g.empires[0]!, d)).toBe(false);
    processDeathWorlds(g);
    expect(c.population).toBe(before - d.popLossPerTurn);
    for (let i = 0; i < 100; i++) processDeathWorlds(g);
    expect(c.population).toBeGreaterThanOrEqual(1);
  });

  it("with the counter-measure and its upkeep paid, the colony is safe and its riches pay money", () => {
    const g = marked();
    const { d, c } = settle(g);
    const e = g.empires[0]!;
    // Give the player a technology at or above the counter-measure's tier in its field.
    e.research.known.push(TECHS.find((t) => t.field === d.counter.field && t.tier >= d.counter.tier)!.id);
    expect(countered(e, d)).toBe(true);
    e.treasury = 1000;
    const pop = c.population;
    processDeathWorlds(g);
    expect(c.population).toBe(pop);
    expect(e.treasury).not.toBe(1000);
  });

  it("old saves (version 18) load and get death worlds on their next turn", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 18;
    delete old.deathWorlds;
    const loaded = deserialize(JSON.stringify(old));
    expect(loaded.version).toBe(SAVE_VERSION);
    processDeathWorlds(loaded);
    expect(loaded.stars.some((s) => deathWorldOf(s))).toBe(true);
  });
});
