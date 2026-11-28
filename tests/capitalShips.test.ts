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

describe("capital classes", () => {
  const base = { role: "warship" as const, computer: null, shield: null, ecm: null, armor: null, weapons: [{ techId: "laser", count: 4 }], specials: [] };
  it("classes need a Huge or capital hull, and change the numbers", async () => {
    const { designStats } = await import("../src/engine/designs");
    const g = newGame({ seed: 78, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny" });
    const e = g.empires[0]!;
    expect(checkDesign(g, e, { ...base, name: "BC1", hull: "large", shipClass: "battlecruiser" })).toMatch(/Huge, Titan or Colossus/);
    expect(checkDesign(g, e, { ...base, name: "BC2", hull: "huge", shipClass: "battlecruiser" })).toBeNull();
    const plain = designStats(e, { ...base, name: "P", hull: "huge" });
    const bc = designStats(e, { ...base, name: "B", hull: "huge", shipClass: "battlecruiser" });
    const sc = designStats(e, { ...base, name: "S", hull: "huge", shipClass: "supercarrier" });
    expect(bc.hits).toBeCloseTo(plain.hits * 0.75, 0);
    expect(sc.spaceUsed).toBeGreaterThan(plain.spaceUsed);
  });

  it("juggernauts hit planets twice as hard", async () => {
    const { fight } = await import("../src/engine/combat");
    const g = newGame({ seed: 79, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny" });
    const mk = (siege: boolean) => ({ side: 0 as const, empireId: 0, key: "j", name: "J", count: 1, start: 1, hp: 1e6, maxHp: 1e6, attack: 20, beamDef: 0, missileDef: 0, shield: 0,
      guns: [{ kind: "beam" as const, min: 10, max: 10, count: 1 }], small: false, invulnerable: false, bonusDamage: 0, first: false, dodge: 0, stasis: false, dampener: false, frozen: false, ...(siege ? { siege: true } : {}) });
    const planet = () => ({ side: 1 as const, empireId: 1, key: "planet", name: "P", count: 1, start: 1, hp: 1e6, maxHp: 1e6, attack: 0, beamDef: 0, missileDef: 0, shield: 0,
      guns: [], small: false, invulnerable: false, bonusDamage: 0, first: false, dodge: 0, stasis: false, dampener: false, frozen: false });
    const dmg = (siege: boolean) => { let t = 0; const a = mk(siege); fight(g, [a, planet()], (_r, s, _t, _k, res, d) => { if (s === a && res !== "miss") t += d; }); return t; };
    expect(dmg(true)).toBeGreaterThan(dmg(false) * 1.5);
  });
});

describe("Kethrak Mother Queen", () => {
  it("a Kethrak Titan carries a brood swarm", async () => {
    const { shipUnit } = await import("../src/engine/combat");
    const g = newGame({ seed: 80, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "kethrak", playerName: "Danny" });
    const e = g.empires[0]!;
    e.research.known.push("titan-slipways");
    applyCommand(g, 0, { type: "createDesign", spec: { ...spec, name: "Queen" } });
    const d = designsOf(g, 0).find((x) => x.name === "Queen")!;
    const u = shipUnit(g, 0, e, d, 1);
    expect(u.guns.some((x) => x.family === "stinger" && x.count === 30)).toBe(true);
  });
});
