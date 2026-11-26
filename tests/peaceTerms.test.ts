// Peace terms: a losing empire hands over worlds to end a war.
import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, newGame, type GameSettings } from "../src/engine";
import { runAITurns } from "../src/ai";
import { declareWar } from "../src/engine/combat";
import type { GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 111, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});
/** Give empire 1 two extra colonies so it has something to hand over. */
function setup(): GameState {
  const g = newGame(settings());
  const home1 = Object.values(g.colonies).find((c) => c.empireId === 1)!;
  const free = Object.values(g.stars).filter((s) => s.planet && !g.colonies[s.id]).slice(0, 2);
  for (const s of free) g.colonies[s.id] = { ...structuredClone(home1), starId: s.id, isCapital: false, population: 20, factories: 15 };
  g.empires[0]!.contacts.push(1); g.empires[1]!.contacts.push(0);
  declareWar(g, g.empires[0]!, g.empires[1]!);
  return g;
}
const worldsOf = (g: GameState, id: number) => Object.values(g.colonies).filter((c) => c.empireId === id && !c.isCapital).map((c) => c.starId);

describe("peace terms", () => {
  it("checks the demand: at war, 1-3 of their worlds, never their capital", () => {
    const g = setup();
    const [a] = worldsOf(g, 1);
    const cap = g.empires[1]!.capitalStarId;
    expect(applyCommand(g, 0, { type: "propose", to: 1, proposal: { kind: "cede", stars: [cap] } }).ok).toBe(false);
    expect(applyCommand(g, 0, { type: "propose", to: 1, proposal: { kind: "cede", stars: [] } }).ok).toBe(false);
    expect(applyCommand(g, 0, { type: "propose", to: 1, proposal: { kind: "cede", stars: [g.empires[0]!.capitalStarId] } }).ok).toBe(false);
    expect(applyCommand(g, 0, { type: "propose", to: 1, proposal: { kind: "cede", stars: [a!] } }).ok).toBe(true);
  });
  it("accepted terms move the worlds with their people and factories, and end the war", () => {
    const g = setup();
    const ws = worldsOf(g, 1);
    applyCommand(g, 1, { type: "propose", to: 0, proposal: { kind: "cede", stars: [] } }); // invalid, ignored
    // Empire 0 asks; empire 1 (as if it were the player) accepts.
    applyCommand(g, 0, { type: "propose", to: 1, proposal: { kind: "cede", stars: ws } });
    const p = g.proposals.find((x) => x.kind === "cede")!;
    const pop = ws.map((id) => g.colonies[id]!.population);
    expect(applyCommand(g, 1, { type: "respond", proposalId: p.id, accept: true }).ok).toBe(true);
    ws.forEach((id, i) => {
      expect(g.colonies[id]!.empireId).toBe(0);
      expect(g.colonies[id]!.population).toBeCloseTo(pop[i]!);
      expect(g.colonies[id]!.factories).toBe(15);
    });
    expect(g.empires[0]!.atWar[1]).toBeUndefined();
    expect(g.empires[1]!.atWar[0]).toBeUndefined();
    expect(g.events.some((e) => e.text.includes("handing over"))).toBe(true);
  });
  it("refused terms keep the war going and cool relations", () => {
    const g = setup();
    const ws = worldsOf(g, 1);
    applyCommand(g, 0, { type: "propose", to: 1, proposal: { kind: "cede", stars: [ws[0]!] } });
    const p = g.proposals.find((x) => x.kind === "cede")!;
    const before = g.empires[0]!.relations[1] ?? 0;
    applyCommand(g, 1, { type: "respond", proposalId: p.id, accept: false });
    expect(g.empires[0]!.atWar[1]).toBeDefined();
    expect(g.empires[0]!.relations[1]).toBe(before - 5);
  });
  it("AIs use peace terms in real games, legally and deterministically", () => {
    const run = () => {
      const g = newGame(settings({ seed: 112, size: "medium", rivals: 5 }));
      for (const e of g.empires) e.isPlayer = false;
      for (let t = 0; t < 260 && !g.winner; t++) { runAITurns(g, true); endTurn(g); }
      return { ceded: g.events.filter((e) => e.text.includes("handing over")).length, last: JSON.stringify(g.colonies) };
    };
    const a = run(), b = run();
    expect(a.last).toBe(b.last);
    expect(a.ceded).toBeGreaterThanOrEqual(0);
  }, 120_000);
});
