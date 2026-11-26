// Ancient gates, hidden armadas and ambushes (src/engine/gates.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { resolveEvent } from "../src/engine/events";
import { canSee } from "../src/engine/knowledge";
import { ambushing, gateAt, gateJump, gateType, hiddenFrom, holdsGate, processGates } from "../src/engine/gates";
import { TECHS } from "../src/engine/data/techs";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type Fleet, type GameState } from "../src/engine/types";
import { makeView } from "../src/engine/view";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 61, size: "medium", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});
const see = (g: GameState) => (e: Parameters<typeof canSee>[1], x: number, y: number) => canSee(g, e, x, y);

function placed(): GameState {
  const g = newGame(settings());
  g.turn = 1;
  processGates(g, see(g));
  return g;
}

/** Give the player colonies at two gates, wake both, and the staging/ambush techs. */
function twoGates(g: GameState) {
  const [a, b] = g.gates!.gates;
  const home = g.colonies[g.empires[0]!.capitalStarId]!;
  for (const gate of [a!, b!]) {
    g.colonies[gate.starId] = { ...home, starId: gate.starId, isCapital: false, population: 10, buildings: [] };
    gate.owner = 0;
    gate.awakeAt = g.turn;
  }
  const e = g.empires[0]!;
  for (const f of ["propulsion", "computers"] as const) e.research.known.push(TECHS.find((t) => t.field === f && t.tier >= 3)!.id);
  return { a: a!, b: b! };
}

function fleetAt(g: GameState, empireId: number, starId: number, ships = 6): Fleet {
  const s = g.stars[starId]!;
  const scout = Object.values(g.designs).find((d) => d.role === "warship" && d.weapons.length > 0)!;
  const f: Fleet = { id: 9000 + g.fleets.length, empireId, ships: { [scout.id]: ships }, x: s.x, y: s.y, starId, destStarId: null };
  g.fleets.push(f);
  return f;
}

describe("ancient gates", () => {
  it("are placed on turn 1 on free planet stars, one great gate on a medium map, without random draws", () => {
    const g = newGame(settings());
    const rng = JSON.stringify(g.rng);
    g.turn = 1;
    processGates(g, see(g));
    expect(JSON.stringify(g.rng)).toBe(rng);
    const gates = g.gates!.gates;
    expect(gates.length).toBeGreaterThanOrEqual(3);
    expect(gates.filter((x) => x.typeId === "sovereign-portal").length).toBe(1);
    for (const x of gates) {
      expect(g.stars[x.starId]!.planet).not.toBeNull();
      expect(g.colonies[x.starId]).toBeUndefined();
    }
  });

  it("a colony at a gate is offered to wake it; paying starts it waking, and it is held once awake", () => {
    const g = placed();
    const gate = g.gates!.gates[0]!;
    const e = g.empires[0]!;
    e.treasury = 5000;
    const home = g.colonies[e.capitalStarId]!;
    g.colonies[gate.starId] = { ...home, starId: gate.starId, isCapital: false, population: 10, buildings: [] };
    g.pendingEvents = [];
    processGates(g, see(g));
    const offer = g.pendingEvents.find((p) => p.empireId === 0 && p.eventId.startsWith("gate-wake-offer:"))!;
    expect(makeView(g, 0).pendingEvents.find((x) => x.id === offer.id)!.text).not.toMatch(/\{/);
    resolveEvent(g, offer, 0);
    expect(gate.owner).toBe(0);
    expect(holdsGate(g, e, gate)).toBe(false);
    g.turn = gate.awakeAt!;
    expect(holdsGate(g, e, gate)).toBe(true);
  });

  it("a fleet jumps between two held gates in one turn, within the gate's throughput", () => {
    const g = placed();
    const { a, b } = twoGates(g);
    const f = fleetAt(g, 0, a.starId, 3);
    f.destStarId = b.starId;
    expect(gateJump(g, f)).toBe(true);
    expect(f.starId).toBe(b.starId);
    const big = fleetAt(g, 0, a.starId, gateType(a).throughput + 1);
    big.destStarId = b.starId;
    expect(gateJump(g, big)).toBe(false);
  });

  it("a fleet parked in a held gate hides from rivals without spies, pays upkeep, and lies in ambush", () => {
    const g = placed();
    const { a } = twoGates(g);
    const f = fleetAt(g, 0, a.starId, 8);
    const rival = g.empires[1]!;
    rival.spies = {};
    processGates(g, see(g));
    expect(hiddenFrom(g, f, rival)).toBe(true);
    expect(makeView(g, 1).seenFleets.some((x) => x.id === f.id)).toBe(false);
    expect(ambushing(g, g.empires[0]!, a.starId)).toBe(true);
    const money = g.empires[0]!.treasury;
    g.turn++;
    processGates(g, see(g));
    expect(g.empires[0]!.treasury).toBeLessThan(money);
    // Spies see through it.
    rival.spies[0] = { agents: 2 } as never;
    expect(hiddenFrom(g, f, rival)).toBe(false);
  });

  it("a fleet ordered out of the gate is no longer hidden", () => {
    const g = placed();
    const { a, b } = twoGates(g);
    const f = fleetAt(g, 0, a.starId, 4);
    processGates(g, see(g));
    expect(g.gates!.hidden[f.id]).toBeDefined();
    f.destStarId = b.starId;
    processGates(g, see(g));
    expect(g.gates!.hidden[f.id]).toBeUndefined();
  });

  it("losing the gate colony loses the gate", () => {
    const g = placed();
    const { a } = twoGates(g);
    delete g.colonies[a.starId];
    processGates(g, see(g));
    expect(gateAt(g, a.starId)!.owner).toBeNull();
  });

  it("old saves (version 23) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 23;
    delete old.gates;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
