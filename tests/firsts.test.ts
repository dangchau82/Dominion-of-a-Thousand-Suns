// Galactic firsts: each is won once, by the first empire to reach it, for culture; announced to everyone.
import { describe, expect, it } from "vitest";
import { endTurn, makeView, newGame } from "../src/engine";
import { runAITurns } from "../src/ai";
import { FIRSTS, processFirsts } from "../src/engine/firsts";
import { galaxyHistoryText } from "../src/engine/history";

describe("galactic firsts", () => {
  it("awards a first once, to the lower id on a tie, with culture", () => {
    const g = newGame({ seed: 161, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny" });
    for (const e of g.empires) e.goldenAges = 1;
    const c0 = g.empires[0]!.culture, c1 = g.empires[1]!.culture;
    processFirsts(g);
    expect(g.firsts!["golden-age"]).toEqual({ empireId: 0, turn: g.turn });
    expect(g.empires[0]!.culture - c0).toBeGreaterThanOrEqual(800);
    expect(g.empires[1]!.culture).toBe(c1);
    processFirsts(g);
    expect(g.events.filter((e) => e.text.includes("The First Golden Age"))).toHaveLength(1);
    expect(makeView(g, 1).firsts.map((f) => f.id)).toContain("golden-age");
  });
  it("AI games win most firsts and the story mentions them", () => {
    const g = newGame({ seed: 162, size: "medium", shape: "ellipse", rivals: 5, playerRaceId: "humans", playerName: "Danny" });
    for (const e of g.empires) e.isPlayer = false;
    for (let t = 0; t < 300 && !g.winner; t++) { runAITurns(g, true); endTurn(g); }
    expect(Object.keys(g.firsts ?? {}).length).toBeGreaterThanOrEqual(FIRSTS.length - 3);
    expect(galaxyHistoryText(g)).toContain("were the first to");
  }, 120_000);
});
