// Mad raiders from the edge (src/engine/raiders.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { BOUNTY, GROWTH, HOWL_TURNS, processRaiders, raidTurn, RAIDER_GROUPS, STRIKE_EVERY, WRECK_SHARE } from "../src/engine/raiders";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 84, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

function arrived(): GameState {
  const g = newGame(settings());
  g.turn = raidTurn(g);
  processRaiders(g);
  return g;
}

describe("raiders from the edge", () => {
  it("arrive once, late (turn 160-219), at the edge star, and aim at a colony with a warning to its owner", () => {
    const g = newGame(settings());
    expect(raidTurn(g)).toBeGreaterThanOrEqual(160);
    expect(raidTurn(g)).toBeLessThan(220);
    g.turn = raidTurn(g);
    g.events = [];
    processRaiders(g);
    const r = g.raiders!;
    expect(r.targetStarId).not.toBeNull();
    const owner = g.colonies[r.targetStarId!]!.empireId;
    expect(g.events.some((e) => e.empireId === owner && e.kind === "war" && e.text.includes(`strike in ${STRIKE_EVERY} turns`))).toBe(true);
  });

  it("an undefended colony is wrecked and the horde grows", () => {
    const g = arrived();
    const r = g.raiders!;
    const c = g.colonies[r.targetStarId!]!;
    c.missileBases = 0;
    g.fleets = g.fleets.filter((f) => f.starId !== c.starId);
    const pop = c.population, ships = r.left[0]!;
    g.turn = r.nextStrike;
    processRaiders(g);
    expect(c.population).toBeCloseTo(Math.max(1, pop * (1 - WRECK_SHARE)));
    expect(r.left[0]).toBe(ships + GROWTH);
    expect(r.raided).toContain(c.starId);
  });

  it("a strong fleet destroys the horde and earns the bounty", () => {
    const g = arrived();
    const r = g.raiders!;
    const c = g.colonies[r.targetStarId!]!;
    const e = g.empires[c.empireId]!;
    const s = g.stars[c.starId]!;
    const warship = Object.values(g.designs).find((d) => d.role === "warship" && d.weapons.length > 0)!;
    g.fleets.push({ id: 7000, empireId: e.id, ships: { [warship.id]: 400 }, x: s.x, y: s.y, starId: s.id, destStarId: null });
    const money = e.treasury;
    for (let i = 0; i < 6 && !r.over; i++) { g.turn = r.nextStrike; if (r.targetStarId !== c.starId) break; processRaiders(g); }
    if (r.over === "destroyed") expect(e.treasury).toBeGreaterThanOrEqual(money + BOUNTY);
    else expect(r.raided).toContain(c.starId); // it held and the horde moved on
  });

  it("the horde leaves after HOWL_TURNS", () => {
    const g = arrived();
    g.turn = g.raiders!.startTurn + HOWL_TURNS;
    processRaiders(g);
    expect(g.raiders!.over).toBe("gone");
  });

  it("starts with the full horde", () => {
    const g = arrived();
    expect(g.raiders!.left).toEqual(RAIDER_GROUPS.map((x) => x.count));
  });

  it("old saves (version 25) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 25;
    delete old.raiders;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
