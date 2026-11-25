import { describe, expect, it } from "vitest";
import { applyCommand, deserialize, designsOf, designStats, endTurn, newGame, serialize, type DesignSpec, type GameSettings } from "../src/engine";
import { learn } from "../src/engine/tech";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 777, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});
const spec = (over: Partial<DesignSpec> = {}): DesignSpec => ({
  name: "Test", hull: "medium", computer: "basic-computer", shield: null, ecm: null, armor: "hull-plating",
  weapons: [{ techId: "laser", count: 2 }], specials: [], ...over,
});

describe("ship designer", () => {
  it("every empire starts with Scout, Colony Ship, Fighter and Destroyer", () => {
    const g = newGame(settings());
    for (const e of g.empires) expect(designsOf(g, e.id).map((d) => d.name)).toEqual(["Scout", "Colony Ship", "Fighter", "Destroyer"]);
  });

  it("creates a legal design and builds it at a colony", () => {
    const g = newGame(settings());
    expect(applyCommand(g, 0, { type: "createDesign", spec: spec() }).ok).toBe(true);
    const d = designsOf(g, 0).find((x) => x.name === "Test")!;
    const home = g.empires[0]!.capitalStarId;
    expect(applyCommand(g, 0, { type: "setBuild", starId: home, templateId: d.id }).ok).toBe(true);
    g.colonies[home]!.shipProgress = d.cost;
    endTurn(g);
    expect(g.fleets.some((f) => f.empireId === 0 && (f.ships[d.id] ?? 0) > 0)).toBe(true);
  });

  it("rejects designs that are too big, use unknown tech, or reuse a name", () => {
    const g = newGame(settings());
    expect(applyCommand(g, 0, { type: "createDesign", spec: spec({ hull: "small", weapons: [{ techId: "laser", count: 5 }] }) }).ok).toBe(false);
    expect(applyCommand(g, 0, { type: "createDesign", spec: spec({ weapons: [{ techId: "plasma-cannon", count: 1 }] }) }).ok).toBe(false);
    expect(applyCommand(g, 0, { type: "createDesign", spec: spec({ name: "Fighter" }) }).ok).toBe(false);
    expect(applyCommand(g, 1, { type: "setBuild", starId: g.empires[1]!.capitalStarId, templateId: designsOf(g, 0)[2]!.id }).ok).toBe(false);
  });

  it("better tech shrinks older parts (miniaturization)", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const before = designStats(e, spec()).spaceUsed;
    learn(e.research, "pulse-laser");
    learn(e.research, "ion-cannon");
    expect(designStats(e, spec()).spaceUsed).toBeLessThan(before);
  });

  it("caps designs at six and scrapping removes ships for a refund", () => {
    const g = newGame(settings());
    for (let i = 0; i < 4; i++) expect(applyCommand(g, 0, { type: "createDesign", spec: spec({ name: `T${i}` }) }).ok).toBe(true);
    expect(applyCommand(g, 0, { type: "createDesign", spec: spec({ name: "T9" }) }).ok).toBe(false);
    const fighter = designsOf(g, 0).find((d) => d.name === "Fighter")!;
    g.fleets.push({ id: g.nextFleetId++, empireId: 0, ships: { [fighter.id]: 4 }, x: 0, y: 0, starId: 0, destStarId: null });
    const cash = g.empires[0]!.treasury;
    expect(applyCommand(g, 0, { type: "scrapDesign", designId: fighter.id }).ok).toBe(true);
    expect(g.empires[0]!.treasury).toBeCloseTo(cash + 4 * fighter.cost * 0.25);
    expect(g.fleets.some((f) => (f.ships[fighter.id] ?? 0) > 0)).toBe(false);
  });

  it("version 2 saves get starter designs", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g));
    old.version = 2; delete old.designs; delete old.nextDesignId;
    const loaded = deserialize(JSON.stringify(old));
    expect(designsOf(loaded, 0).length).toBe(4);
  });
});
