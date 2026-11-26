// Galactic Council resolutions: put forward on schedule, voted with council votes, effects and rules while in force.
import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, makeView, newGame, type GameSettings } from "../src/engine";
import { runAITurns } from "../src/ai";
import { empireBonus } from "../src/engine/civ";
import { processResolutions, RESOLUTION_FIRST } from "../src/engine/resolutions";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 91, size: "small", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

function meetAll(g: ReturnType<typeof newGame>) {
  for (const a of g.empires) for (const b of g.empires) if (a !== b && !a.contacts.includes(b.id)) a.contacts.push(b.id);
}

describe("council resolutions", () => {
  it("a resolution is put forward on schedule and shows in every view", () => {
    const g = newGame(settings());
    g.turn = RESOLUTION_FIRST - 1;
    processResolutions(g);
    expect(g.resolutionSession ?? null).toBeNull();
    g.turn = RESOLUTION_FIRST;
    processResolutions(g);
    expect(g.resolutionSession).toBeTruthy();
    expect(makeView(g, 2).resolution?.name).toBeTruthy();
  });

  it("passes with more than half the votes, then its bonus applies until it expires", () => {
    const g = newGame(settings());
    g.turn = 200;
    g.resolutionSession = { id: "pan-galactic-science-year", targetId: null, turn: 200, votes: {} };
    for (const e of g.empires) expect(applyCommand(g, e.id, { type: "resolutionVote", yes: true }).ok).toBe(true);
    const before = empireBonus(g.empires[1]!).research;
    g.turn = 201;
    processResolutions(g);
    expect(g.activeResolutions?.length).toBe(1);
    expect(empireBonus(g.empires[1]!).research).toBeCloseTo(before + 0.08, 5);
    g.turn = 221;
    processResolutions(g);
    expect(empireBonus(g.empires[1]!).research).toBeCloseTo(before, 5);
  });

  it("fails without a majority; the target's own vote always counts as no", () => {
    const g = newGame(settings());
    g.turn = 200;
    g.resolutionSession = { id: "bullion-windfall-levy", targetId: 0, turn: 200, votes: { 0: true } };
    g.turn = 201;
    processResolutions(g);
    expect(g.activeResolutions ?? []).toEqual([]);
  });

  it("the peace jubilee forbids new wars while it lasts", () => {
    const g = newGame(settings());
    meetAll(g);
    g.turn = 150;
    g.activeResolutions = [{ id: "galactic-peace-jubilee", targetId: null, until: 160 }];
    expect(applyCommand(g, 0, { type: "declareWar", targetId: 1 }).ok).toBe(false);
    g.turn = 160;
    processResolutions(g);
    expect(applyCommand(g, 0, { type: "declareWar", targetId: 1 }).ok).toBe(true);
  });

  it("AI empires vote, some resolutions pass in long games, and games stay deterministic", () => {
    const run = () => {
      const g = newGame(settings({ seed: 14, rivals: 5, size: "medium" }));
      for (const e of g.empires) e.isPlayer = false;
      let debated = 0, passed = 0;
      for (let t = 0; t < 300 && !g.winner; t++) {
        runAITurns(g, true); endTurn(g);
        for (const ev of g.events) if (ev.kind === "council" && / votes for\)$/.test(ev.text)) { debated++; if ((g.activeResolutions ?? []).length) passed++; }
      }
      return { g, debated, passed };
    };
    const a = run(), b = run();
    expect(a.debated).toBeGreaterThan(3);
    expect(a.passed).toBeGreaterThan(0);
    expect(JSON.stringify(a.g)).toBe(JSON.stringify(b.g));
  });
});
