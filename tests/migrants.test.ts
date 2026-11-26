// Migrant growth (Quorai): colonies grow only from the capital's migrants.
import { describe, expect, it } from "vitest";
import { endTurn, newGame, type GameSettings } from "../src/engine";
import { growsByMigrants, migrantsThisTurn, processMigrants } from "../src/engine/migrants";
import type { Colony, GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 81, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "quorai", playerName: "Danny", ...over,
});
function addColony(g: GameState, n: number): Colony[] {
  const home = Object.values(g.colonies).find((c) => c.empireId === 0)!;
  const free = Object.values(g.stars).filter((s) => s.planet && !g.colonies[s.id]).slice(0, n);
  return free.map((s) => (g.colonies[s.id] = { ...structuredClone(home), starId: s.id, isCapital: false, population: 2, factories: 0 }));
}

describe("migrant growth", () => {
  it("moves a share of the capital's people to the colonies, split evenly", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const home = g.colonies[e.capitalStarId]!;
    const [a, b] = addColony(g, 2) as [Colony, Colony];
    expect(growsByMigrants(e, a)).toBe(true);
    expect(growsByMigrants(e, home)).toBe(false);
    const before = home.population, pool = migrantsThisTurn(g, e);
    expect(pool).toBeCloseTo(before * 0.03);
    processMigrants(g);
    expect(a.population).toBeCloseTo(2 + pool / 2);
    expect(b.population).toBeCloseTo(2 + pool / 2);
    expect(home.population).toBeCloseTo(before - pool);
  });
  it("gives each colony less the more colonies there are, and sends nothing with no colony to fill", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    expect(migrantsThisTurn(g, e)).toBe(0);
    const few = structuredClone(g), many = structuredClone(g);
    const [f] = addColony(few, 1); const m = addColony(many, 6);
    processMigrants(few); processMigrants(many);
    expect(m[0]!.population - 2).toBeCloseTo((f!.population - 2) / 6);
  });
  it("skips a colony whose star has no planet left (after a supernova) instead of crashing", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const [gone, ok] = addColony(g, 2) as [Colony, Colony];
    g.stars[gone.starId]!.planet = null;
    const pool = migrantsThisTurn(g, e);
    expect(() => processMigrants(g)).not.toThrow();
    expect(gone.population).toBe(2);
    expect(ok.population).toBeCloseTo(2 + pool);
  });
  it("colonies do not grow on their own, and other races are untouched", () => {
    const g = newGame(settings());
    const [a] = addColony(g, 1);
    a!.sliders = { ship: 0, defense: 0, industry: 0, ecology: 0, research: 100 } as never;
    g.colonies[g.empires[0]!.capitalStarId]!.population = 1; // almost no migrants to send
    const before = a!.population;
    endTurn(g);
    expect(a!.population - before).toBeLessThan(0.05);
    const h = newGame(settings({ playerRaceId: "humans" }));
    const [c] = addColony(h, 1);
    expect(growsByMigrants(h.empires[0]!, c!)).toBe(false);
    endTurn(h);
    expect(c!.population).toBeGreaterThan(2.05);
  });
});
