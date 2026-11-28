// Capital hulls (main Claude, 2026-11-28): Titan and Colossus need their techs, and an empire can have one of each afloat.
import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, newGame } from "../src/engine";
import { checkDesign, designsOf } from "../src/engine/designs";

const spec = { name: "Mother Queen", role: "warship" as const, hull: "titan" as const, computer: null, shield: null, ecm: null, armor: null,
  weapons: [{ techId: "laser", count: 10 }], specials: [] };

describe("capital hulls", () => {
  it("a Titan needs Titan Slipways", () => {
    const g = newGame({ seed: 77, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "kethrak", playerName: "Danny" });
    const e = g.empires[0]!;
    expect(checkDesign(g, e, spec)).toMatch(/Titan Slipways/);
    e.research.known.push("titan-slipways");
    expect(checkDesign(g, e, spec)).toBeNull();
  });

  it("only one Titan is afloat at a time", () => {
    const g = newGame({ seed: 77, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "kethrak", playerName: "Danny" });
    const e = g.empires[0]!;
    e.research.known.push("titan-slipways");
    expect(applyCommand(g, 0, { type: "createDesign", spec }).ok).toBe(true);
    const d = designsOf(g, 0).find((x) => x.name === "Mother Queen")!;
    const home = Object.values(g.colonies).find((c) => c.empireId === 0)!;
    applyCommand(g, 0, { type: "setBuild", starId: home.starId, templateId: d.id });
    home.shipProgress = 1e7; // pretend the yard has been funded for ages
    endTurn(g);
    const titans = () => g.fleets.filter((f) => f.empireId === 0).reduce((a, f) => a + (f.ships[d.id] ?? 0), 0);
    expect(titans()).toBe(1);
    home.shipProgress = 1e7;
    endTurn(g);
    expect(titans()).toBe(1);
  });
});
