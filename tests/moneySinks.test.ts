// Treasury projects (money sinks): costs, cooldowns, outcomes, bonds and AI use.
import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, makeView, newGame, type GameSettings } from "../src/engine";
import { runAITurns } from "../src/ai";
import { investSink, processMoneySinks, sinkCost, sinkOptions, SINK_BY_ID } from "../src/engine/moneySinks";
import { votesOf } from "../src/engine/victory";
import { makeRng } from "../src/engine/rng";
import { MONEY_SINKS } from "../src/engine/data/moneySinks";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 61, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("treasury projects", () => {
  it("cost grows with time and empire size; minor-race patronage stays off until minor races exist", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const def = SINK_BY_ID.get("emergency-research-grant")!;
    const early = sinkCost(g, e, def);
    g.turn = 101;
    expect(sinkCost(g, e, def)).toBe(early + 100 * def.cost.perTurn);
    expect(sinkOptions(g, e).map((o) => o.id)).not.toContain("minor-race-patronage");
    expect(investSink(g, e, "minor-race-patronage")).toBe("No such project");
  });

  it("needs the money, then waits out its cooldown", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    e.treasury = 10;
    expect(applyCommand(g, 0, { type: "investSink", sinkId: "emergency-research-grant" }).ok).toBe(false);
    e.treasury = 5000;
    const before = Object.values(e.research.progress).reduce((a, b) => a + b, 0);
    expect(applyCommand(g, 0, { type: "investSink", sinkId: "emergency-research-grant" }).ok).toBe(true);
    const cost = sinkCost(g, e, SINK_BY_ID.get("emergency-research-grant")!);
    expect(Object.values(e.research.progress).reduce((a, b) => a + b, 0) - before).toBeCloseTo(cost * 0.45, 5);
    expect(applyCommand(g, 0, { type: "investSink", sinkId: "emergency-research-grant" }).ok).toBe(false);
    g.turn += 8;
    expect(applyCommand(g, 0, { type: "investSink", sinkId: "emergency-research-grant" }).ok).toBe(true);
  });

  it("mercenaries arrive at the capital, worth about what was paid", () => {
    let arrived = 0;
    for (let seed = 0; seed < 10; seed++) {
      const g = newGame(settings());
      g.rng = makeRng(seed);
      const e = g.empires[0]!;
      e.treasury = 5000;
      const fleetsBefore = g.fleets.length;
      expect(investSink(g, e, "mercenary-contract")).toBeNull();
      if (g.fleets.length > fleetsBefore) {
        arrived++;
        const f = g.fleets.at(-1)!;
        expect(f.starId).toBe(e.capitalStarId);
      }
    }
    expect(arrived).toBeGreaterThan(5); // 85% chance each
  });

  it("wonder rush never touches the Ascension Gate", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    e.treasury = 9000;
    const cap = g.colonies[e.capitalStarId]!;
    cap.buildQueue = "w-ascension";
    expect(investSink(g, e, "wonder-rush-grant")).not.toBeNull();
    cap.buildQueue = "w-garden";
    expect(investSink(g, e, "wonder-rush-grant")).toBeNull();
    expect(cap.buildProgress).toBeGreaterThan(0);
  });

  it("trade bonds pay back later and lose a little on average", () => {
    const def = MONEY_SINKS.find((s) => s.id === "interstellar-exchange")!;
    const expected = def.outcomes.reduce((a, o) => a + o.chance * (o.special?.value ?? 1), 0);
    expect(expected).toBeLessThan(1);
    let paid = 0, put = 0;
    for (let seed = 0; seed < 60; seed++) {
      const g = newGame(settings());
      g.rng = makeRng(seed * 7 + 1);
      const e = g.empires[0]!;
      e.treasury = 3000;
      expect(investSink(g, e, "interstellar-exchange")).toBeNull();
      const left = e.treasury;
      put += 3000 - left;
      g.turn += 10;
      processMoneySinks(g);
      paid += e.treasury - left;
      expect(e.bonds).toEqual([]);
    }
    expect(paid / put).toBeGreaterThan(0.7);
    expect(paid / put).toBeLessThan(1.15);
  });

  it("lobbying adds council votes for a while", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    e.treasury = 9000;
    const base = votesOf(g, e);
    expect(investSink(g, e, "council-lobbying")).toBeNull();
    expect(votesOf(g, e)).toBeGreaterThan(base);
    g.turn += 15;
    expect(votesOf(g, e)).toBe(base);
  });

  it("AI empires use treasury projects, and games stay deterministic", () => {
    const run = () => {
      const g = newGame(settings({ seed: 12, rivals: 3 }));
      for (let t = 0; t < 200; t++) { runAITurns(g); endTurn(g); }
      return g;
    };
    const g = run();
    expect(g.empires.some((e) => Object.keys(e.sinkReady ?? {}).length > 0)).toBe(true);
    expect(JSON.stringify(run())).toBe(JSON.stringify(g));
    expect(makeView(g, 1).moneySinks.length).toBe(5);
  });
});
