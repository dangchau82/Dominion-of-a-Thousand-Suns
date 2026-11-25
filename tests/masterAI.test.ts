// Master AI wiring and the gift cap that keeps council votes from being bought on voting day.
import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, makeView, newGame, type GameSettings } from "../src/engine";
import { brainOf, runAITurns } from "../src/ai";
import { masterAITurn } from "../src/ai/masterAI";
import { GIFT_WARMTH_CAP } from "../src/engine/diplomacy";
import { relation } from "../src/engine/diplomacy";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 555, size: "small", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("Master AI", () => {
  it("master difficulty puts rivals (not the player) on the Master AI; autopilot can choose it", () => {
    const g = newGame(settings({ difficulty: "master" }));
    expect(brainOf(g, g.empires[0]!)).toBe("basic");
    expect(brainOf(g, g.empires[1]!)).toBe("master");
    expect(applyCommand(g, 0, { type: "setAutopilotAI", ai: "master" }).ok).toBe(true);
    expect(brainOf(g, g.empires[0]!)).toBe("master");
    expect(applyCommand(g, 0, { type: "setAutopilotAI", ai: "genius" as never }).ok).toBe(false);
    expect(brainOf(newGame(settings()), newGame(settings()).empires[1]!)).toBe("basic");
  });

  it("only issues legal commands, and never builds the Ascension Gate", () => {
    const g = newGame(settings({ difficulty: "master" }));
    for (let t = 0; t < 150; t++) {
      for (const e of g.empires) {
        if (!e.alive) continue;
        for (const cmd of masterAITurn(makeView(g, e.id))) {
          if (cmd.type === "setBuilding") expect(cmd.buildingId).not.toBe("w-ascension");
          const r = applyCommand(g, e.id, cmd);
          // The Master AI's own orders (buildings, council votes) must be legal; spending may fail once money runs out,
          // and orders passed through from the basic AI (proposals etc.) are that AI's business.
          if (!r.ok && ["setBuilding", "councilVote"].includes(cmd.type)) throw new Error(`${cmd.type}: ${r.error}`);
        }
      }
      endTurn(g);
    }
    expect(g.empires.some((e) => e.alive)).toBe(true);
  });

  it("gifts buy at most 20 goodwill per giver every 10 turns", () => {
    const g = newGame(settings());
    const a = g.empires[0]!, b = g.empires[1]!;
    a.contacts.push(1); b.contacts.push(0);
    a.treasury = 5000;
    const before = relation(b, a);
    for (let i = 0; i < 5; i++) expect(applyCommand(g, 0, { type: "gift", to: 1, bc: 300 }).ok).toBe(true);
    expect(relation(b, a) - before).toBeCloseTo(GIFT_WARMTH_CAP, 5);
    g.turn += 10;
    applyCommand(g, 0, { type: "gift", to: 1, bc: 100 });
    expect(relation(b, a) - before).toBeCloseTo(GIFT_WARMTH_CAP + 10, 5);
  });

  it("all-master games run and stay deterministic", () => {
    const run = () => { const g = newGame(settings({ difficulty: "master", seed: 77 })); for (let t = 0; t < 100; t++) { runAITurns(g); endTurn(g); } return JSON.stringify(g); };
    expect(run()).toBe(run());
  });
});
