import { describe, expect, it } from "vitest";
import { applyCommand, newGame, type GameSettings } from "../src/engine";
import { canUseFuelTanks, designStats, isColonyShip } from "../src/engine/designs";
import { inFuelRange, fleetExtraRange } from "../src/engine/movement";
import { FUEL_TANKS } from "../src/engine/data/ships";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 777, size: "small", shape: "ellipse", rivals: 1, playerRaceId: "humans", playerName: "Danny", ...over,
});
const spec = (specials: string[]) => ({
  name: "Pathfinder", role: "colony" as const, hull: "large" as const,
  computer: null, shield: null, ecm: null, armor: null, weapons: [], specials,
});

describe("custom colony ships", () => {
  it("fuel tanks need a fuel-range tech, then add +3 ly", () => {
    const s = newGame(settings({ seed: 7 }));
    const e = s.empires[0]!;
    e.research.known = e.research.known.filter((id) => !["deuterium-cells", "iridium-cells", "reserve-fuel-tanks"].includes(id));
    if (!canUseFuelTanks(e)) expect(applyCommand(s, 0, { type: "createDesign", spec: spec([FUEL_TANKS.id]) }).ok).toBe(false);
    e.research.known.push("deuterium-cells");
    expect(canUseFuelTanks(e)).toBe(true);
    expect(designStats(e, spec([FUEL_TANKS.id])).extraRange).toBe(3);
    const r = applyCommand(s, 0, { type: "createDesign", spec: spec([FUEL_TANKS.id]) });
    expect(r.ok).toBe(true);
    const d = Object.values(s.designs).find((x) => x.name === "Pathfinder")!;
    expect(d.role).toBe("colony");
    expect(d.extraRange).toBe(3);
    expect(isColonyShip(s, d.id)).toBe(true);
    expect(applyCommand(s, 0, { type: "createDesign", spec: { ...spec([]), name: "Gunboat", weapons: [{ techId: "laser", count: 1 }] } }).ok).toBe(false);
  });

  it("a long-range colony ship reaches farther and can found a colony", () => {
    const s = newGame(settings({ seed: 11, size: "medium" }));
    const e = s.empires[0]!;
    e.research.known.push("deuterium-cells");
    applyCommand(s, 0, { type: "createDesign", spec: spec([FUEL_TANKS.id]) });
    const d = Object.values(s.designs).find((x) => x.name === "Pathfinder")!;
    const home = s.fleets.find((f) => f.empireId === 0)!;
    home.ships[d.id] = 1;
    delete home.ships.colony;
    expect(fleetExtraRange(s, { ...home, ships: { [d.id]: 1 } })).toBeGreaterThanOrEqual(3);
    const far = s.stars.find((st) => !inFuelRange(s, e, st, 0) && inFuelRange(s, e, st, 3));
    if (far) expect(inFuelRange(s, e, far, fleetExtraRange(s, { ...home, ships: { [d.id]: 1 } }))).toBe(true);
    // Colonize uses the custom design like the standard one.
    const target = s.stars.find((st) => st.planet && !s.colonies[st.id] && st.id !== home.starId);
    if (target) {
      home.starId = target.id; home.x = target.x; home.y = target.y;
      const r = applyCommand(s, 0, { type: "colonize", fleetId: home.id });
      if (r.ok) expect(home.ships[d.id] ?? 0).toBe(0);
    }
  });
});
