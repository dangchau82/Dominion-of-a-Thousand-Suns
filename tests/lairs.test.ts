// Neutral lairs in play (src/engine/lairs.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { distance } from "../src/engine/formulas";
import { HOME_DISTANCE, knownLairs, lairDef, lairsPerTier, processLairs, TIER_TURN } from "../src/engine/lairs";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 12, size: "medium", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

function started(): GameState {
  const g = newGame(settings());
  g.turn = TIER_TURN[1];
  processLairs(g);
  return g;
}

describe("neutral lairs", () => {
  it("tier 1 appears on turn 1 on empty stars away from home worlds, without random draws", () => {
    const g = newGame(settings());
    g.turn = 1;
    const rng = JSON.stringify(g.rng);
    processLairs(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
    const lairs = g.lairs!;
    expect(lairs.length).toBe(lairsPerTier(g.stars.length));
    for (const l of lairs) {
      const s = g.stars[l.starId]!;
      expect(g.colonies[s.id]).toBeUndefined();
      for (const e of g.empires) {
        const h = g.stars[e.capitalStarId]!;
        expect(distance(h.x, h.y, s.x, s.y)).toBeGreaterThanOrEqual(HOME_DISTANCE);
      }
      expect(lairDef(l.lairId).tier).toBe(1);
    }
  });

  it("tiers 2 and 3 appear later, each once", () => {
    const g = started();
    for (const t of [TIER_TURN[2], TIER_TURN[2] + 1, TIER_TURN[3], TIER_TURN[3] + 1]) { g.turn = t; processLairs(g); }
    for (const tier of [1, 2, 3]) {
      expect(g.lairs!.filter((l) => lairDef(l.lairId).tier === tier).length).toBe(lairsPerTier(g.stars.length));
    }
  });

  it("an unarmed visitor gets the scouting report once and is left alone", () => {
    const g = started();
    const lair = g.lairs![0]!;
    g.fleets.push({ id: 900, empireId: 0, ships: { colony: 1 }, x: 0, y: 0, starId: lair.starId, destStarId: null });
    g.events = [];
    processLairs(g);
    processLairs(g);
    expect(g.events.filter((e) => e.empireId === 0 && e.text.includes(lairDef(lair.lairId).name)).length).toBe(1);
    expect(g.fleets.some((f) => f.id === 900)).toBe(true);
    expect(knownLairs(g, 0).map((l) => l.starId)).toContain(lair.starId);
    expect(knownLairs(g, 1).map((l) => l.starId)).not.toContain(lair.starId);
  });

  it("a strong armed fleet clears a tier-1 lair and takes the prize; guards don't heal in between", () => {
    const g = started();
    const lair = g.lairs![0]!;
    const def = lairDef(lair.lairId);
    const e = g.empires[0]!;
    const warship = Object.values(g.designs).find((d) => d.role === "warship" && d.weapons.length > 0)!;
    g.fleets.push({ id: 901, empireId: 0, ships: { [warship.id]: 60 }, x: 0, y: 0, starId: lair.starId, destStarId: null });
    const before = { money: e.treasury, culture: e.culture, research: { ...e.research.progress } };
    let turns = 0;
    while (lair.clearedBy === null && turns < 30) {
      const left = lair.left.reduce((a, n) => a + n, 0);
      processLairs(g);
      expect(lair.left.reduce((a, n) => a + n, 0)).toBeLessThanOrEqual(left);
      turns++;
    }
    expect(lair.clearedBy).toBe(0);
    const gained = e.treasury > before.money || e.culture > before.culture
      || Object.entries(e.research.progress).some(([k, v]) => v > before.research[k as keyof typeof before.research])
      || def.reward.some((fx) => fx.kind === "ships" || fx.kind === "revealStars" || fx.kind === "morale" || fx.kind === "population");
    expect(gained).toBe(true);
    expect(knownLairs(g, 0).map((l) => l.starId)).not.toContain(lair.starId);
  });

  it("a cleared lair stays cleared and is not fought again", () => {
    const g = started();
    const lair = g.lairs![0]!;
    lair.left = lair.left.map(() => 0);
    lair.clearedBy = 1;
    const warship = Object.values(g.designs).find((d) => d.role === "warship" && d.weapons.length > 0)!;
    g.fleets.push({ id: 902, empireId: 0, ships: { [warship.id]: 3 }, x: 0, y: 0, starId: lair.starId, destStarId: null });
    g.events = [];
    processLairs(g);
    expect(g.events.some((e) => e.kind === "battle")).toBe(false);
  });

  it("a colony settled on a lair's planet is raided until the lair is cleared", () => {
    const g = started();
    const lair = g.lairs![0]!;
    const home = g.colonies[g.empires[0]!.capitalStarId]!;
    g.colonies[lair.starId] = { ...home, starId: lair.starId, isCapital: false, population: 10, buildings: [] };
    processLairs(g);
    expect(g.colonies[lair.starId]!.population).toBeLessThan(10);
    lair.clearedBy = 0;
    const pop = g.colonies[lair.starId]!.population;
    processLairs(g);
    expect(g.colonies[lair.starId]!.population).toBe(pop);
  });

  it("old saves (version 13) load and get lairs on their next turn", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 13;
    delete old.lairs;
    const loaded = deserialize(JSON.stringify(old));
    expect(loaded.version).toBe(SAVE_VERSION);
    loaded.turn = 50;
    processLairs(loaded);
    expect(loaded.lairs!.length).toBeGreaterThan(0);
  });
});
