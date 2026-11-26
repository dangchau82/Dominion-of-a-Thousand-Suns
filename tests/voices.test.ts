// The newer rival lines (data/dialogue2.ts) heard in play: battles, betrayal, pleading, council wins.
import { describe, expect, it } from "vitest";
import { endTurn, newGame, type GameSettings } from "../src/engine";
import { offerPeace } from "../src/engine/combat";
import { NEW_DIALOGUE } from "../src/engine/data/dialogue2";
import { sayMoment } from "../src/engine/dialogue";
import { applyCommand } from "../src/engine/commands";
import { makeView } from "../src/engine/view";
import { basicAITurn } from "../src/ai/basicAI";
import { breakTreaty } from "../src/engine/diplomacy";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 31, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("newer rival voices in play", () => {
  it("sayMoment fills names and leaves no placeholders", () => {
    const g = newGame(settings());
    const [me, ai] = [g.empires[0]!, g.empires[1]!];
    const line = sayMoment(g.turn, ai, "battleWon", me, { star: "Vega" });
    expect(line.startsWith(`${ai.name}: “`)).toBe(true);
    expect(line).not.toMatch(/\{/);
    expect(NEW_DIALOGUE[ai.raceId]!.battleWon.some((l) => line.includes(l.split("{")[0]!.trim()))).toBe(true);
  });

  it("a rival whose treaty we break tells us so, once even when several treaties go", () => {
    const g = newGame(settings());
    const [me, ai] = [g.empires[0]!, g.empires[1]!];
    me.treaties[ai.id] = { trade: 1, nap: 1 };
    ai.treaties[me.id] = { trade: 1, nap: 1 };
    g.events = [];
    breakTreaty(g, me, ai, "trade");
    breakTreaty(g, me, ai, "nap");
    const said = g.events.filter((e) => e.empireId === me.id && e.text.startsWith(`${ai.name}: “`));
    expect(said.length).toBe(1);
  });

  it("an empire down to its last worlds pleads when it offers peace", () => {
    const g = newGame(settings());
    const [me, ai] = [g.empires[0]!, g.empires[1]!];
    me.atWar[ai.id] = 1; ai.atWar[me.id] = 1;
    g.events = [];
    offerPeace(g, ai, me);
    const text = g.events.find((e) => e.empireId === me.id && e.kind === "war")!.text;
    // Only a home world left: one of its "begging" lines, filled in.
    const begging = NEW_DIALOGUE[ai.raceId]!.begging.map((l) => l.replace(/\{empire\}/g, me.name).replace(/\{leader\}/g, ai.name));
    expect(begging.some((l) => text.includes(l))).toBe(true);
  });

  it("battle reports in AI games carry the rival's words, and games stay deterministic", () => {
    const run = () => {
      const g = newGame(settings({ seed: 8, rivals: 4 }));
      for (const e of g.empires) e.isPlayer = false;
      let spoken = 0;
      for (let t = 0; t < 250 && !g.winner; t++) {
        for (const e of g.empires) if (e.alive) for (const c of basicAITurn(makeView(g, e.id))) applyCommand(g, e.id, c);
        endTurn(g);
        spoken += g.events.filter((e) => e.kind === "battle" && e.text.includes("“")).length;
      }
      return { spoken, json: JSON.stringify(g) };
    };
    const a = run(), b = run();
    expect(a.spoken).toBeGreaterThan(0);
    expect(a.json).toBe(b.json);
  });
});
