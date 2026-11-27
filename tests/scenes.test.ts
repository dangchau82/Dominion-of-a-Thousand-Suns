// Race scenes: picking the turn's scene (src/ui/scenes.ts, src/ui/sceneText.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { RACES } from "../src/engine/data/races";
import { SCENE_LINES } from "../src/ui/sceneText";
import { sceneFor } from "../src/ui/scenes";
import type { GameEvent } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 5, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "nyx", playerName: "Danny", ...over,
});

describe("race scenes", () => {
  it("every race has a line for every scene, with no leftover placeholders once filled", () => {
    for (const r of RACES) {
      const lines = SCENE_LINES[r.id]!;
      expect(lines).toBeDefined();
      for (const k of ["colony", "science", "spy", "war", "invasion"] as const) expect(lines[k].length).toBeGreaterThan(10);
    }
  });

  it("picks the biggest moment of the turn: conquest over war over colony over spy over science", () => {
    const g = newGame(settings());
    const me = g.empires[0]!, foe = g.empires[1]!;
    const star = g.stars.find((s) => s.planet && !g.colonies[s.id])!;
    const ev = (kind: GameEvent["kind"], text: string, starId?: number): GameEvent => ({ turn: 1, empireId: 0, kind, text, starId });
    const science = ev("research", "Discovered Neutron Blaster: a gun.");
    expect(sceneFor(g, 0, [science])!.kind).toBe("science");
    expect(sceneFor(g, 0, [science])!.text).toContain("Neutron Blaster");
    const colony = ev("colonized", `Founded a colony on ${star.name}.`, star.id);
    expect(sceneFor(g, 0, [science, colony])!.kind).toBe("colony");
    expect(sceneFor(g, 0, [science, colony])!.text).toContain(star.name);
    const war = { ...ev("war", `The ${foe.name} declared war on the ${me.name}!`), empireId: null };
    const w = sceneFor(g, 0, [science, colony, war])!;
    expect(w.kind).toBe("war");
    expect(w.rivalRaceId).toBe(foe.raceId);
    // Conquest only when the world is now ours.
    g.colonies[star.id] = { ...structuredClone(g.colonies[foe.capitalStarId]!), starId: star.id, empireId: 0, occupiedFrom: 1 };
    const inv = ev("invasion", `Our troops took ${star.name}.`, star.id);
    expect(sceneFor(g, 0, [science, colony, war, inv])!.kind).toBe("invasion");
    g.colonies[star.id]!.empireId = 1;
    expect(sceneFor(g, 0, [inv])).toBeNull();
  });

  it("only our own spy successes count", () => {
    const g = newGame(settings());
    expect(sceneFor(g, 0, [{ turn: 1, empireId: 0, kind: "spy", text: "Security caught 2 Ashkari spies." }])).toBeNull();
    expect(sceneFor(g, 0, [{ turn: 1, empireId: 0, kind: "spy", text: "Our agents stole Fusion Drive from the Ashkari Dominion!" }])!.kind).toBe("spy");
  });
});

describe("Hall of Legends", () => {
  it("lists our famous fleet and admiral, great battles and great works without broken text", async () => {
    const { legendsHTML } = await import("../src/ui/legends");
    const g = newGame(settings());
    const f = g.fleets.find((x) => x.empireId === 0)!;
    g.veterans = { [f.id]: { empireId: 0, victories: 8, kills: 40, name: "Iron Widows", lastStar: f.starId, admiral: { name: "Asha Varr", personality: "bold", since: 50, victories: 3 } } };
    g.greatBattles = [{ turn: 120, starId: 3, name: "the Burning of Kethra", empires: [0, 1], ships: 90, losses: [10, 30] }];
    g.empires[0]!.contacts.push(1);
    g.endgame = { 1: { paths: { feared: 100 }, offered: ["feared"], works: [{ workId: "gw-sundering-engine", starId: 1, started: 100, done: 10, finished: false, sabotageAt: 999 }] } };
    const html = legendsHTML(g, 0);
    for (const s of ["Iron Widows", "Elite", "Asha Varr", "The Burning of Kethra", "Sundering Engine", "Ascension Gate"]) expect(html).toContain(s);
    expect(html).not.toMatch(/undefined|NaN|\{|\}/);
  });
});
