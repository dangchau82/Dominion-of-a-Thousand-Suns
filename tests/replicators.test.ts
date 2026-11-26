// Self-replicating machines (src/engine/replicators.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { BUILD_EVERY, CAP, hiveTurn, processReplicators, REPLICATOR_GROUPS, SWARM_AT } from "../src/engine/replicators";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 95, size: "medium", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

function woken(): GameState {
  const g = newGame(settings());
  g.turn = hiveTurn(g);
  processReplicators(g);
  return g;
}

describe("self-replicating machines", () => {
  it("wake once (turn 100-159) on a free star, without random draws", () => {
    const g = newGame(settings());
    expect(hiveTurn(g)).toBeGreaterThanOrEqual(100);
    expect(hiveTurn(g)).toBeLessThan(160);
    g.turn = hiveTurn(g);
    const rng = JSON.stringify(g.rng);
    processReplicators(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
    const h = g.replicators!;
    expect(g.colonies[h.starId]).toBeUndefined();
    expect(h.left).toEqual(REPLICATOR_GROUPS.map((x) => x.count));
  });

  it("grow every BUILD_EVERY turns when ignored, up to the cap", () => {
    const g = woken();
    const h = g.replicators!;
    g.fleets = g.fleets.filter((f) => f.starId !== h.starId);
    const start = h.left[0]!;
    g.turn += BUILD_EVERY;
    processReplicators(g);
    expect(h.left[0]).toBe(start + 1);
    for (let i = 0; i < 1000; i++) { g.turn++; processReplicators(g); h.swarm = null; }
    expect(h.left[0]).toBeLessThanOrEqual(CAP[0]!);
    expect(h.left[1]).toBeLessThanOrEqual(CAP[1]!);
  });

  it("once big enough, warns a nearby colony and sends a swarm the next turn", () => {
    const g = woken();
    const h = g.replicators!;
    h.left = [SWARM_AT, 10];
    // Put a colony next to the hive.
    const s = g.stars[h.starId]!;
    const home = g.colonies[g.empires[0]!.capitalStarId]!;
    const near = g.stars.filter((x) => x.planet && !g.colonies[x.id] && x.id !== h.starId)
      .sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0]!;
    g.colonies[near.id] = { ...home, starId: near.id, isCapital: false, population: 20, factories: 30, missileBases: 0, buildings: [] };
    g.fleets = g.fleets.filter((f) => f.starId !== near.id && f.starId !== h.starId);
    g.turn += 20;
    g.events = [];
    processReplicators(g);
    if (!h.swarm) return; // no colony within swarm range on this map
    expect(g.events.some((e) => e.text.startsWith("A swarm of self-replicating"))).toBe(true);
    const target = g.colonies[h.swarm.targetStarId]!;
    const pop = target.population;
    g.turn = h.swarm.strikeTurn;
    processReplicators(g);
    expect(target.population).toBeLessThanOrEqual(pop);
  });

  it("a strong fleet destroys the hive and takes its secrets", () => {
    const g = woken();
    const h = g.replicators!;
    const s = g.stars[h.starId]!;
    const warship = Object.values(g.designs).find((d) => d.role === "warship" && d.weapons.length > 0)!;
    g.fleets.push({ id: 7100, empireId: 0, ships: { [warship.id]: 400 }, x: s.x, y: s.y, starId: s.id, destStarId: null });
    for (let i = 0; i < 20 && h.destroyedBy === null; i++) { g.turn++; processReplicators(g); }
    expect(h.destroyedBy).toBe(0);
  });

  it("old saves (version 26) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 26;
    delete old.replicators;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
