// Weapon families and cloaking (main Claude, 2026-11-28; Danny: torpedoes, plasma missiles, stingers,
// rail guns, cannons, beams, lancers, cloaking fields).
import { describe, expect, it } from "vitest";
import { newGame, type GameState } from "../src/engine";
import { fight, type Gun, type Unit } from "../src/engine/combat";
import { tech } from "../src/engine/tech";
import { checkDesign } from "../src/engine/designs";

const game = (): GameState => newGame({ seed: 4242, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny" });

function unit(side: 0 | 1, guns: Gun[], over: Partial<Unit> = {}): Unit {
  return {
    side, empireId: side, key: `u${side}`, name: "test", count: 1, start: 1, hp: 1000, maxHp: 1000, attack: 10,
    beamDef: 0, missileDef: 0, shield: 0, guns, small: false, invulnerable: false, bonusDamage: 0, first: false,
    dodge: 0, stasis: false, dampener: false, frozen: false, ...over,
  };
}

function damageTaken(shooter: Gun, targetOver: Partial<Unit> = {}): number {
  const g = game();
  const a = unit(0, [shooter]);
  const b = unit(1, [], { shield: 6, ...targetOver });
  let total = 0;
  fight(g, [a, b], (_r, s, _t, _k, _res, dmg) => { if (s === a) total += dmg; });
  return total;
}

describe("weapon families", () => {
  it("rail slugs and plasma warheads get through half the shield; plain beams don't", () => {
    expect(damageTaken({ kind: "beam", min: 6, max: 6, count: 1 })).toBe(0);
    expect(damageTaken({ kind: "beam", min: 6, max: 6, count: 1, family: "rail" })).toBeGreaterThan(0);
    expect(damageTaken({ kind: "missile", min: 6, max: 6, count: 1, family: "plasma" })).toBeGreaterThan(0);
  });

  it("a spinal lance ignores shields but only fires every other round", () => {
    const shots: number[] = [];
    const g = game();
    const a = unit(0, [{ kind: "beam", min: 10, max: 10, count: 1, family: "lance" }]);
    const b = unit(1, [{ kind: "beam", min: 1, max: 1, count: 1 }], { shield: 50 });
    fight(g, [a, b], (r, s, _t, _k, res, dmg) => { if (s === a) { shots.push(r); if (res === "hit") expect(dmg).toBe(10); } });
    expect(shots.every((r) => r % 2 === 1)).toBe(true);
    expect(shots.length).toBeGreaterThan(0);
  });

  it("ion hits wear shields down for the rest of the battle", () => {
    const g = game();
    const a = unit(0, [{ kind: "beam", min: 3, max: 3, count: 4, family: "ion" }]);
    const b = unit(1, [{ kind: "beam", min: 1, max: 1, count: 1 }], { shield: 8 });
    fight(g, [a, b]);
    expect(b.shield).toBeLessThan(8);
  });

  it("stingers keep firing after missiles run out", () => {
    const rounds = new Set<number>();
    const g = game();
    const a = unit(0, [{ kind: "missile", min: 3, max: 3, count: 1, family: "stinger" }]);
    const b = unit(1, [{ kind: "beam", min: 1, max: 1, count: 1 }]);
    fight(g, [a, b], (r, s) => { if (s === a) rounds.add(r); });
    expect(Math.max(...rounds)).toBeGreaterThan(3);
  });

  it("cloaked ships can't be targeted in round 1 without hyperspace sensors", () => {
    const hits: number[] = [];
    const g = game();
    const a = unit(0, [{ kind: "beam", min: 1, max: 1, count: 3 }]);
    const b = unit(1, [{ kind: "beam", min: 1, max: 1, count: 1 }], { cloaked: true });
    fight(g, [a, b], (r, s) => { if (s === a) hits.push(r); });
    expect(hits.includes(1)).toBe(false);
    const hits2: number[] = [];
    const a2 = unit(0, [{ kind: "beam", min: 1, max: 1, count: 3 }], { seesCloak: true });
    const b2 = unit(1, [{ kind: "beam", min: 1, max: 1, count: 1 }], { cloaked: true });
    fight(game(), [a2, b2], (r, s) => { if (s === a2) hits2.push(r); });
    expect(hits2.includes(1)).toBe(true);
  });

  it("new weapons exist and the lance needs a big hull", () => {
    for (const id of ["rail-gun", "stinger-swarm", "plasma-missile", "phase-lance"]) expect(tech(id)).toBeTruthy();
    const g = game();
    const e = g.empires[0]!;
    e.research.known.push("phase-lance");
    const spec = { name: "Lancer Test", role: "warship" as const, hull: "medium" as const, computer: null, shield: null, ecm: null, armor: null,
      weapons: [{ techId: "phase-lance", count: 1 }], specials: [] };
    expect(checkDesign(g, e, spec)).toMatch(/Large or Huge/);
  });
});
