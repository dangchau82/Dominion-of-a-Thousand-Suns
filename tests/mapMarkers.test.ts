// Map markers (src/engine/mapMarkers.ts): only what the empire knows.
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { exploreStar } from "../src/engine/knowledge";
import { mapMarkers } from "../src/engine/mapMarkers";
import { makeView } from "../src/engine/view";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 12, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("map markers", () => {
  it("show a death world and a cracked world only once explored", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const [a, b] = g.stars.filter((s) => s.planet && !g.colonies[s.id]);
    a!.planet!.special = "death:test";
    b!.planet!.special = "death:cracked";
    expect(mapMarkers(g, e).filter((m) => m.starId === a!.id || m.starId === b!.id)).toHaveLength(0);
    exploreStar(g, e, a!, false); exploreStar(g, e, b!, false);
    const kinds = mapMarkers(g, e).filter((m) => m.starId === a!.id || m.starId === b!.id).map((m) => m.kind).sort();
    expect(kinds).toEqual(["cracked", "deathWorld"]);
  });

  it("show great works only of empires we know, and reach the view", () => {
    const g = newGame(settings());
    const rival = g.empires[1]!;
    g.endgame = { 1: { paths: { builder: 1 }, offered: ["builder"], works: [{ workId: "gw-dyson-shell", starId: rival.capitalStarId, started: 1, done: 40, finished: true, finishedTurn: 2, sabotageAt: 99 }] } };
    expect(mapMarkers(g, g.empires[0]!).some((m) => m.kind === "greatWork")).toBe(false);
    g.empires[0]!.contacts.push(1);
    const m = makeView(g, 0).markers.find((x) => x.kind === "greatWork")!;
    expect(m.label).toBe("Dyson Shell");
    expect(m.empireId).toBe(1);
  });
});
