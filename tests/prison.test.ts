// tests/prison.test.ts — written by Gemini (coding job 05, 2026-11-25); one assertion fixed by Claude.
// Prison colonies: declaring, production bonus, unrest, escapes, and determinism.
import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, newGame, type GameSettings, type GameState } from "../src/engine";
import { PRISON_COLONY, PRISON_EVENTS } from "../src/engine/data/hazardWorlds";
import { newColony } from "../src/engine/game";
import { processPrisons } from "../src/engine/prison";
import { deserialize, serialize } from "../src/engine/save";
import { colonyBudget } from "../src/engine/turn";
import { unrestBreakdown, unrestTarget } from "../src/engine/unrest";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 4242,
  size: "small",
  shape: "ellipse",
  rivals: 2,
  playerRaceId: "humans",
  playerName: "Danny",
  ...over,
});

function settleOwn(g: GameState, empireId: number, starId: number): void {
  const c = newColony(starId, empireId, 12, g.turn);
  c.factories = 12;
  g.colonies[starId] = c;
}

describe("prison colonies", () => {
  it("declaring works on an own non-capital colony, costs setupCost and morale, and is refused otherwise", () => {
    const g = newGame(settings());
    const player = g.empires[0]!;
    const capId = player.capitalStarId;
    const rivalId = g.empires[1]!.capitalStarId;
    const freeStar = g.stars.find((s) => s.planet && !g.colonies[s.id])!;
    settleOwn(g, 0, freeStar.id);

    // Refused on capital
    expect(applyCommand(g, 0, { type: "declarePrison", starId: capId }).ok).toBe(false);

    // Refused on rival colony
    expect(applyCommand(g, 0, { type: "declarePrison", starId: rivalId }).ok).toBe(false);

    // Refused without enough treasury
    player.treasury = PRISON_COLONY.setupCost - 1;
    player.culture = 100;
    expect(applyCommand(g, 0, { type: "declarePrison", starId: freeStar.id }).ok).toBe(false);
    expect(g.colonies[freeStar.id]!.prison).toBeFalsy();
    expect(player.treasury).toBe(PRISON_COLONY.setupCost - 1);
    expect(player.culture).toBe(100);

    // Succeeds on own non-capital colony with enough treasury
    player.treasury = PRISON_COLONY.setupCost + 50;
    player.culture = 100;
    const res = applyCommand(g, 0, { type: "declarePrison", starId: freeStar.id });
    expect(res.ok).toBe(true);
    expect(g.colonies[freeStar.id]!.prison).toBe(true);
    expect(player.treasury).toBe(50);
    expect(player.culture).toBe(Math.max(0, 100 - PRISON_COLONY.moraleCost * 10));

    // Refused if already a prison colony
    player.treasury = 500;
    expect(applyCommand(g, 0, { type: "declarePrison", starId: freeStar.id }).ok).toBe(false);
  });

  it("a prison colony produces more in colonyBudget", () => {
    const g = newGame(settings());
    const freeStar = g.stars.find((s) => s.planet && !g.colonies[s.id])!;
    settleOwn(g, 0, freeStar.id);
    const c = g.colonies[freeStar.id]!;
    const before = colonyBudget(g, c).production;
    c.prison = true;
    const after = colonyBudget(g, c).production;
    expect(after).toBeCloseTo(before * (1 + PRISON_COLONY.productionBonus), 5);
  });

  it("a prison colony's unrestTarget is higher", () => {
    const g = newGame(settings());
    const freeStar = g.stars.find((s) => s.planet && !g.colonies[s.id])!;
    settleOwn(g, 0, freeStar.id);
    const c = g.colonies[freeStar.id]!;
    const before = unrestTarget(g, c);
    c.prison = true;
    expect(unrestTarget(g, c)).toBeGreaterThan(before);
    // Claude: the target is clamped at 0, so compare the prison part itself rather than before + 15.
    expect(unrestBreakdown(g, c).find((p) => p.label === "Prison colony")?.amount).toBe(PRISON_COLONY.unrestPerTurn * 5);
  });

  it("over many turns with escapeChance an escape event appears for its owner", () => {
    const g = newGame(settings({ seed: 101 }));
    const freeStar = g.stars.find((s) => s.planet && !g.colonies[s.id])!;
    settleOwn(g, 0, freeStar.id);
    g.colonies[freeStar.id]!.prison = true;
    const prisonEventIds = new Set(PRISON_EVENTS.map((e) => e.id));

    let found: (typeof g.pendingEvents)[number] | undefined;
    for (let t = 0; t < 200; t++) {
      g.pendingEvents = g.pendingEvents.filter((p) => p.empireId !== 0);
      processPrisons(g);
      found = g.pendingEvents.find((p) => p.empireId === 0 && prisonEventIds.has(p.eventId));
      if (found) break;
      g.turn++;
    }

    expect(found).toBeDefined();
    expect(found!.colonyStarId).toBe(freeStar.id);
    expect(found!.starId).toBe(freeStar.id);
  });

  it("two runs with the same seed give the same result", () => {
    const run = (seed: number) => {
      const g = newGame(settings({ seed }));
      const freeStar = g.stars.find((s) => s.planet && !g.colonies[s.id])!;
      g.empires[0]!.treasury = 500;
      settleOwn(g, 0, freeStar.id);
      applyCommand(g, 0, { type: "declarePrison", starId: freeStar.id });
      for (let t = 0; t < 25; t++) endTurn(g);
      return serialize(deserialize(serialize(g)));
    };
    expect(run(777)).toBe(run(777));
  });
});