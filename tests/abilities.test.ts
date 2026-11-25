import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, makeView, newGame, planetCapacity, popCost, type GameSettings, type Planet } from "../src/engine";
import { fleetExtraRange } from "../src/engine/movement";

const game = (raceId: string) => newGame({ seed: 11, size: "small", shape: "ellipse", rivals: 2, playerRaceId: raceId, playerName: "T" } as GameSettings);

describe("race abilities", () => {
  it("Drovani double ocean worlds; Nyx build population cheaply", () => {
    const ocean: Planet = { climate: "ocean", size: 60, terraform: 0, minerals: "normal", environment: "normal", special: null };
    expect(planetCapacity(ocean, game("drovani").empires[0]!)).toBe(90);
    expect(planetCapacity(ocean, game("humans").empires[0]!)).toBe(60);
    expect(popCost(game("nyx").empires[0]!)).toBeLessThan(popCost(game("humans").empires[0]!));
  });

  it("Gorrath colony ships fly farther", () => {
    const g = game("gorrath");
    const f = g.fleets.find((x) => x.empireId === 0 && (x.ships.colony ?? 0) > 0)!;
    expect(fleetExtraRange(g, { ...f, ships: { colony: 1 } })).toBe(2);
  });

  it("Quorai can settle a star with no planet", () => {
    const g = game("quorai");
    const e = g.empires[0]!;
    const empty = g.stars.find((s) => !s.planet && !g.colonies[s.id])!;
    e.knowledge[empty.id] = { explored: true, lastSeen: 1, planet: null, ownerId: null, population: null };
    expect(makeView(g, 0).canSettle(empty.id)).toBe(true);
    g.fleets.push({ id: g.nextFleetId++, empireId: 0, ships: { colony: 1 }, x: empty.x, y: empty.y, starId: empty.id, destStarId: null });
    expect(applyCommand(g, 0, { type: "colonize", fleetId: g.nextFleetId - 1 }).ok).toBe(true);
    expect(g.colonies[empty.id]?.empireId).toBe(0);
  });

  it("Kethrak larvae found colonies without ships", () => {
    const g = game("kethrak");
    for (const s of g.stars) g.empires[0]!.knowledge[s.id] ??= { explored: true, lastSeen: 1, planet: s.planet ? { ...s.planet } : null, ownerId: null, population: null };
    const before = Object.values(g.colonies).filter((c) => c.empireId === 0).length;
    while (g.turn <= 21) endTurn(g);
    expect(Object.values(g.colonies).filter((c) => c.empireId === 0).length).toBeGreaterThan(before);
  });
});
