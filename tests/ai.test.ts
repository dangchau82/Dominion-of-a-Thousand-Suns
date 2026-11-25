import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { endTurn, newGame } from "../src/engine";
import { runAITurns } from "../src/ai";

describe("AI", () => {
  it("never touches the real game state (fairness rule)", () => {
    const src = readFileSync("src/ai/basicAI.ts", "utf8");
    expect(src).not.toMatch(/GameState/);
    expect(src).not.toMatch(/engine\/(game|turn|cheats|save|combat|movement|knowledge)"/);
    expect(src).not.toMatch(/Math\.random/);
  });

  it("starts wars, designs ships and conquers on its own", () => {
    const g = newGame({ seed: 8, size: "medium", shape: "ellipse", rivals: 6, playerRaceId: "ashkari", playerName: "X", difficulty: "normal" });
    let wars = 0;
    let captures = 0;
    for (let t = 1; t <= 220; t++) {
      runAITurns(g, true);
      endTurn(g);
      wars += g.events.filter((e) => e.kind === "war" && e.empireId === null && e.text.includes("declared")).length;
      captures += g.events.filter((e) => e.kind === "invasion" && e.text.includes("captured")).length;
    }
    expect(wars).toBeGreaterThan(2);
    expect(captures).toBeGreaterThan(0);
    expect(Object.values(g.designs).length).toBeGreaterThan(g.empires.length * 2);
  });

  it("relaxed rivals start fewer wars than hard ones", () => {
    const count = (difficulty: "relaxed" | "hard") => {
      const g = newGame({ seed: 7, size: "medium", shape: "ellipse", rivals: 6, playerRaceId: "humans", playerName: "X", difficulty });
      let wars = 0;
      for (let t = 1; t <= 160; t++) {
        runAITurns(g, true);
        endTurn(g);
        wars += g.events.filter((e) => e.kind === "war" && e.empireId === null && e.text.includes("declared")).length;
      }
      return wars;
    };
    expect(count("relaxed")).toBeLessThan(count("hard"));
  });
});
