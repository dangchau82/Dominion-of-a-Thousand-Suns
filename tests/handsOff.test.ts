// Manual lock: the player's autopilot leaves alone the areas and colonies the player keeps.
import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, newGame, type GameSettings } from "../src/engine";
import { runAITurns } from "../src/ai";
import { areaOf, autopilotMay } from "../src/ai/handsOff";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 101, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("hands off", () => {
  it("sorts orders into areas; events and game flow are never held", () => {
    expect(areaOf({ type: "setBuild", starId: 1, templateId: null })).toBe("colonies");
    expect(areaOf({ type: "offerPeace", targetId: 1 })).toBe("diplomacy");
    expect(areaOf({ type: "moveFleet", fleetId: 1, destStarId: 2 })).toBe("fleets");
    expect(areaOf({ type: "setResearch", alloc: {} as never })).toBe("research");
    expect(areaOf({ type: "proclaim", proclamationId: "x" })).toBe("empire");
    expect(areaOf({ type: "chooseEvent", eventId: 1, choice: 0 })).toBeNull();
  });
  it("a hands-off colony keeps the player's sliders and build through many autopilot turns", () => {
    const g = newGame(settings());
    const home = Object.values(g.colonies).find((c) => c.empireId === 0)!;
    applyCommand(g, 0, { type: "setSliders", starId: home.starId, sliders: { ship: 0, defense: 0, industry: 0, ecology: 0, research: 100 } });
    expect(applyCommand(g, 0, { type: "setHandsOff", starId: home.starId, on: true }).ok).toBe(true);
    const build = home.buildTemplate;
    let held = 0;
    for (let t = 0; t < 40; t++) { held += runAITurns(g, true).length; endTurn(g); }
    expect(home.sliders.research).toBe(100);
    expect(home.buildTemplate).toBe(build);
    expect(held).toBeGreaterThan(0);
    // Ships may still fly from it: the fleets area was left to the autopilot.
    expect(autopilotMay(g, g.empires[0]!, { type: "moveFleet", fleetId: 1, destStarId: home.starId })).toBe(true);
  });
  it("taking diplomacy back stops the autopilot offering or accepting peace; rivals are never filtered", () => {
    const g = newGame(settings());
    const me = g.empires[0]!;
    applyCommand(g, 0, { type: "setAutoArea", area: "diplomacy", on: false });
    expect(me.autoOff).toEqual(["diplomacy"]);
    expect(autopilotMay(g, me, { type: "offerPeace", targetId: 1 })).toBe(false);
    expect(autopilotMay(g, g.empires[1]!, { type: "offerPeace", targetId: 0 })).toBe(true); // rivals: not the player
    applyCommand(g, 0, { type: "setAutoArea", area: "diplomacy", on: true });
    expect(me.autoOff).toBeUndefined();
    expect(applyCommand(g, 0, { type: "setAutoArea", area: "nonsense" as never, on: false }).ok).toBe(false);
  });
  it("the player's own commands are never filtered", () => {
    const g = newGame(settings());
    const home = Object.values(g.colonies).find((c) => c.empireId === 0)!;
    applyCommand(g, 0, { type: "setHandsOff", starId: home.starId, on: true });
    applyCommand(g, 0, { type: "setAutoArea", area: "colonies", on: false });
    expect(applyCommand(g, 0, { type: "setSlider", starId: home.starId, slider: "industry", value: 60 }).ok).toBe(true);
    expect(home.sliders.industry).toBe(60);
  });
});
