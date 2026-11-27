import { describe, expect, it } from "vitest";
import {
  applyCommand, beamHitChance, CLIMATES, deserialize, endTurn, exportCode, importCode, makeView,
  newGame, popGrowth, race, RACES, serialize, setOneSlider, type GameSettings, type Planet,
} from "../src/engine";
import { FAIR_START_RADIUS, MAX_HOP } from "../src/engine/galaxy";
import { canColonizeClimate } from "../src/engine/formulas";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 12345, size: "small", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("formulas (classic rules)", () => {
  const terran: Planet = { climate: "terran", size: 100, terraform: 0, minerals: "normal", environment: "normal", special: null };
  it("population grows on a logistic curve", () => {
    // pop 50 of 100: (1 - 0.5) / 10 = 5% of 50 = 2.5 (Drovani: plain growth 1.0)
    expect(popGrowth(50, terran, race("drovani"))).toBeCloseTo(2.5);
    expect(popGrowth(100, terran, race("drovani"))).toBe(0);
    expect(popGrowth(1, terran, race("drovani"))).toBeCloseTo(0.1); // minimum growth
  });
  it("breeders grow twice as fast", () => {
    expect(popGrowth(50, terran, race("ruuvak"))).toBeCloseTo(5);
  });
  it("hostile worlds grow at half speed, except for the home climate", () => {
    const toxic: Planet = { ...terran, climate: "toxic", size: 40 };
    expect(popGrowth(20, toxic, race("drovani"))).toBeCloseTo(0.5);
    expect(popGrowth(20, toxic, race("thraal"))).toBeCloseTo(0.55); // ignores environment, 0.55 growth
  });
  it("beam hit chance has a 5% floor", () => {
    expect(beamHitChance(0, 0, 0, 1)).toBeCloseTo(0.5);
    expect(beamHitChance(0, 0, 20, 1)).toBeCloseTo(0.05);
  });
  it("has 18 races and 13 climates", () => {
    expect(RACES).toHaveLength(18);
    expect(Object.keys(CLIMATES)).toHaveLength(13);
  });
});

describe("galaxy generation", () => {
  it("is deterministic for a seed", () => {
    expect(serialize(newGame(settings()))).toBe(serialize(newGame(settings())));
    expect(serialize(newGame(settings()))).not.toBe(serialize(newGame(settings({ seed: 999 }))));
  });

  for (const shape of ["ellipse", "spiral", "rectangle", "ring"] as const) {
    it(`gives every empire a fair start (${shape})`, () => {
      for (let seed = 1; seed <= 15; seed++) {
        const g = newGame(settings({ seed, shape, size: "medium", rivals: 5 }));
        for (const e of g.empires) {
          const home = g.stars[e.capitalStarId]!;
          expect(home.planet?.size).toBe(100);
          const r = race(e.raceId);
          const near = g.stars.filter((s) => s !== home && Math.hypot(s.x - home.x, s.y - home.y) <= FAIR_START_RADIUS + 1e-6);
          expect(near.length).toBeGreaterThanOrEqual(3);
          const good = near.filter((s) => s.planet && canColonizeClimate(s.planet.climate, r) && s.planet.size >= 35);
          expect(good.length).toBeGreaterThanOrEqual(2);
        }
        // Homes are well separated.
        for (const a of g.empires) for (const b of g.empires) {
          if (a.id >= b.id) continue;
          const sa = g.stars[a.capitalStarId]!; const sb = g.stars[b.capitalStarId]!;
          expect(Math.hypot(sa.x - sb.x, sa.y - sb.y)).toBeGreaterThan(6);
        }
      }
    });
  }

  it("every star is reachable by short hops (no trapped empires)", () => {
    for (const shape of ["ellipse", "spiral", "rectangle", "ring"] as const) {
      for (let seed = 1; seed <= 5; seed++) {
        const g = newGame(settings({ seed, shape, size: "large", rivals: 6 }));
        const seen = new Set([0]);
        const stack = [0];
        while (stack.length) {
          const a = g.stars[stack.pop()!]!;
          for (const b of g.stars) {
            if (!seen.has(b.id) && Math.hypot(a.x - b.x, a.y - b.y) <= MAX_HOP + 0.5) { seen.add(b.id); stack.push(b.id); }
          }
        }
        expect(seen.size).toBe(g.stars.length);
      }
    }
  });

  it("every empire starts identically except race", () => {
    const g = newGame(settings({ rivals: 5 }));
    for (const e of g.empires) {
      const c = g.colonies[e.capitalStarId]!;
      expect(c.population).toBe(50);
      expect(c.factories).toBe(30);
      const f = g.fleets.filter((x) => x.empireId === e.id);
      expect(f).toHaveLength(1);
      expect(f[0]!.ships).toEqual({ scout: 2, colony: 1 });
    }
  });
});

describe("commands", () => {
  it("rebalances sliders to 100 and respects locks", () => {
    const g = newGame(settings());
    const c = g.colonies[g.empires[0]!.capitalStarId]!;
    applyCommand(g, 0, { type: "lockSlider", starId: c.starId, slider: "research", locked: true });
    const research = c.sliders.research;
    setOneSlider(c, "ship", 60);
    expect(Object.values(c.sliders).reduce((a, b) => a + b, 0)).toBe(100);
    expect(c.sliders.research).toBe(research);
    expect(c.sliders.ship).toBe(60);
  });

  it("refuses orders for other empires' colonies and fleets", () => {
    const g = newGame(settings());
    const enemyHome = g.empires[1]!.capitalStarId;
    expect(applyCommand(g, 0, { type: "setSlider", starId: enemyHome, slider: "ship", value: 50 }).ok).toBe(false);
    const enemyFleet = g.fleets.find((f) => f.empireId === 1)!;
    expect(applyCommand(g, 0, { type: "moveFleet", fleetId: enemyFleet.id, destStarId: 0 }).ok).toBe(false);
  });

  it("refuses moves beyond fuel range", () => {
    const g = newGame(settings({ size: "large" }));
    const home = g.stars[g.empires[0]!.capitalStarId]!;
    const far = [...g.stars].sort((a, b) => Math.hypot(b.x - home.x, b.y - home.y) - Math.hypot(a.x - home.x, a.y - home.y))[0]!;
    const f = g.fleets.find((x) => x.empireId === 0)!;
    const r = applyCommand(g, 0, { type: "moveFleet", fleetId: f.id, destStarId: far.id });
    expect(r).toEqual({ ok: false, error: "Out of fuel range" });
  });

  it("can split scouts off and explore", () => {
    const g = newGame(settings());
    const view = makeView(g, 0);
    const f = view.fleets[0]!;
    const target = view.stars.find((s) => s.id !== f.starId && view.reachable(s.id, { ...f, ships: { scout: 1 } }))!;
    const r = applyCommand(g, 0, { type: "moveFleet", fleetId: f.id, destStarId: target.id, ships: { scout: 1 } });
    expect(r.ok).toBe(true);
    for (let i = 0; i < 10; i++) endTurn(g);
    expect(g.empires[0]!.knowledge[target.id]?.explored).toBe(true);
  });
});

describe("saves", () => {
  it("round-trips through JSON and export codes", () => {
    const g = newGame(settings());
    for (let i = 0; i < 5; i++) endTurn(g);
    expect(serialize(deserialize(serialize(g)))).toBe(serialize(g));
    expect(serialize(importCode(exportCode(g)))).toBe(serialize(g));
  });
  it("rejects junk", () => {
    expect(() => deserialize("{}")).toThrow();
  });
});

describe("cheats", () => {
  it("sleeping rivals give no orders, and only the player can cheat", async () => {
    const { applyCheat } = await import("../src/engine/cheats");
    const { runAITurns } = await import("../src/ai");
    const g = newGame(settings());
    expect(applyCheat(g, 1, { kind: "money", amount: 5 })).toMatch(/player only/);
    applyCheat(g, 0, { kind: "sleepRivals", turns: 5 });
    const before = JSON.stringify(g.fleets.filter((f) => f.empireId !== 0));
    runAITurns(g);
    expect(JSON.stringify(g.fleets.filter((f) => f.empireId !== 0))).toBe(before);
    expect(g.cheated).toBe(true);
  });
});
