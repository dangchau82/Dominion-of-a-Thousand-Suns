// Grudges: empires remember wrongs done to them; relations drift lower while a grudge lasts; grudges fade.
import { describe, expect, it } from "vitest";
import { endTurn, makeView, newGame, type GameSettings } from "../src/engine";
import { runAITurns } from "../src/ai";
import { declareWar } from "../src/engine/combat";
import { updateRelations, breakTreaty } from "../src/engine/diplomacy";
import { addGrudge, fadeGrudges, grudgeAgainst, GRUDGE, GRUDGE_CAP } from "../src/engine/grudges";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 121, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("grudges", () => {
  it("a declared war and a broken alliance are remembered by the victim, with reasons", () => {
    const g = newGame(settings());
    const [a, b] = [g.empires[0]!, g.empires[1]!];
    a.contacts.push(1); b.contacts.push(0);
    (a.treaties[1] ??= {}).alliance = g.turn; (b.treaties[0] ??= {}).alliance = g.turn;
    breakTreaty(g, a, b, "alliance");
    declareWar(g, a, b);
    expect(grudgeAgainst(b, a.id)).toBe(GRUDGE.brokeAlliance + GRUDGE.declaredWar);
    expect(grudgeAgainst(a, b.id)).toBe(0);
    expect(b.grudges![0]!.reasons.join(" ")).toContain("broke our alliance");
    expect(makeView(g, 1).contacts.find((c) => c.id === 0)!.grudge!.reasons.length).toBe(2);
  });
  it("is capped, fades over time, and honourable peoples forget slower", () => {
    const g = newGame(settings({ playerRaceId: "thraal" })); // honour 0.8
    const [a, b] = [g.empires[0]!, g.empires[1]!];
    for (let i = 0; i < 10; i++) addGrudge(g, a, b, 20, "x");
    expect(grudgeAgainst(a, b.id)).toBe(GRUDGE_CAP);
    expect(a.grudges![b.id]!.reasons.length).toBe(4);
    addGrudge(g, b, a, GRUDGE_CAP, "y");
    for (let t = 0; t < 70; t++) fadeGrudges(g);
    expect(grudgeAgainst(a, b.id)).toBeLessThan(GRUDGE_CAP);
    for (let t = 0; t < 1000; t++) fadeGrudges(g);
    expect(a.grudges).toBeUndefined();
  });
  it("pulls relations down while it lasts", () => {
    const g = newGame(settings());
    const [a, b] = [g.empires[0]!, g.empires[1]!];
    a.contacts.push(1); b.contacts.push(0);
    const twin = structuredClone(g);
    addGrudge(g, a, b, 40, "z");
    for (let t = 0; t < 60; t++) { updateRelations(g); updateRelations(twin); }
    expect(g.empires[0]!.relations[1]!).toBeLessThan(twin.empires[0]!.relations[1]! - 20);
  });
  it("real AI games build grudges and stay deterministic", () => {
    const run = () => {
      const g = newGame(settings({ seed: 122, size: "medium", rivals: 4 }));
      for (const e of g.empires) e.isPlayer = false;
      for (let t = 0; t < 200 && !g.winner; t++) { runAITurns(g, true); endTurn(g); }
      return JSON.stringify(g.empires.map((e) => e.grudges ?? {}));
    };
    const a = run();
    expect(a).toBe(run());
    expect(a).toContain("reasons");
  }, 120_000);
});
