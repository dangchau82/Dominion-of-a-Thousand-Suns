import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, makeView, newGame, type GameSettings, type GameState } from "../src/engine";
import { aiAnswerProposals } from "../src/ai";
import { learn } from "../src/engine/tech";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 2024, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});
function meet(g: GameState, a: number, b: number) { g.empires[a]!.contacts.push(b); g.empires[b]!.contacts.push(a); }

describe("diplomacy", () => {
  it("friendly AIs accept a trade agreement and both sides earn from it", () => {
    const g = newGame(settings());
    meet(g, 0, 1);
    g.empires[1]!.relations[0] = 40;
    expect(applyCommand(g, 0, { type: "propose", to: 1, proposal: { kind: "trade" } }).ok).toBe(true);
    aiAnswerProposals(g);
    expect(g.empires[0]!.treaties[1]?.trade).toBeDefined();
    const before = g.empires[0]!.treasury;
    for (let i = 0; i < 12; i++) endTurn(g);
    expect(g.empires[0]!.treasury).toBeGreaterThan(before);
  });

  it("tech exchange gives each side the other's tech", () => {
    const g = newGame(settings());
    meet(g, 0, 1);
    learn(g.empires[0]!.research, "ion-drive");
    learn(g.empires[1]!.research, "deuterium-cells");
    applyCommand(g, 0, { type: "propose", to: 1, proposal: { kind: "techSwap", offerTech: "ion-drive", wantTech: "deuterium-cells" } });
    const p = g.proposals[0]!;
    expect(applyCommand(g, 1, { type: "respond", proposalId: p.id, accept: true }).ok).toBe(true);
    expect(g.empires[0]!.research.known).toContain("deuterium-cells");
    expect(g.empires[1]!.research.known).toContain("ion-drive");
  });

  it("can't propose to strangers; gifts warm relations", () => {
    const g = newGame(settings());
    expect(applyCommand(g, 0, { type: "propose", to: 1, proposal: { kind: "trade" } }).ok).toBe(false);
    meet(g, 0, 1);
    g.empires[0]!.treasury = 300;
    expect(applyCommand(g, 0, { type: "gift", to: 1, bc: 200 }).ok).toBe(true);
    expect(g.empires[1]!.relations[0]).toBeGreaterThan(10);
    expect(g.empires[1]!.treasury).toBe(200);
  });

  it("declaring war breaks treaties and angers the victim", () => {
    const g = newGame(settings());
    meet(g, 0, 1);
    applyCommand(g, 0, { type: "propose", to: 1, proposal: { kind: "nap" } });
    applyCommand(g, 1, { type: "respond", proposalId: g.proposals[0]!.id, accept: true });
    expect(g.empires[0]!.treaties[1]?.nap).toBeDefined();
    applyCommand(g, 0, { type: "declareWar", targetId: 1 });
    expect(g.empires[0]!.treaties[1]?.nap).toBeUndefined();
    expect(g.empires[1]!.relations[0]).toBeLessThan(-40);
  });

  it("spies steal technology and spending comes out of production", () => {
    const g = newGame(settings());
    meet(g, 0, 1);
    for (const id of ["ion-drive", "deuterium-cells", "pulse-laser", "barren-world-habitats"]) learn(g.empires[1]!.research, id);
    g.empires[1]!.security = 0;
    const net = makeView(g, 0).colonies[0]!.budget;
    applyCommand(g, 0, { type: "setSpies", targetId: 1, alloc: 10, mission: "steal" });
    const after = makeView(g, 0).colonies[0]!.budget;
    expect(after.research).toBeLessThan(net.research);
    let stolen = false;
    for (let i = 0; i < 60 && !stolen; i++) {
      endTurn(g);
      stolen = g.events.some((e) => e.kind === "spy" && e.empireId === 0 && e.text.includes("stole"));
    }
    expect(stolen).toBe(true);
  });
});
