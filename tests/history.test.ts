// The galaxy's story: built from the chronicle, age by age, ending with the winner.
import { describe, expect, it } from "vitest";
import { endTurn, newGame } from "../src/engine";
import { runAITurns } from "../src/ai";
import { chronicleText } from "../src/engine/chronicle";
import { galaxyHistory, galaxyHistoryText } from "../src/engine/history";

describe("galaxy history", () => {
  it("tells a whole AI game in chapters and names the winner", () => {
    const g = newGame({ seed: 141, size: "medium", shape: "ellipse", rivals: 5, playerRaceId: "humans", playerName: "Danny" });
    for (const e of g.empires) e.isPlayer = false;
    for (let t = 0; t < 400 && !g.winner; t++) { runAITurns(g, true); endTurn(g); }
    const h = galaxyHistory(g);
    expect(h[0]!.title).toBe("The Beginning");
    expect(h.at(-1)!.title).toBe("The Ending");
    expect(h.length).toBeGreaterThanOrEqual(4);
    if (g.winner) expect(h.at(-1)!.lines[0]).toContain(g.empires[g.winner.empireId]!.name);
    for (const c of h) for (const l of c.lines) { expect(l).not.toMatch(/undefined|NaN/); }
    const text = galaxyHistoryText(g);
    expect(chronicleText(g)).toContain(text.split("\n")[0]!);
  }, 120_000);
  it("works at the very start, before anything is recorded", () => {
    const g = newGame({ seed: 142, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny" });
    expect(galaxyHistory(g).map((c) => c.title)).toEqual(["The Beginning"]);
  });
});
