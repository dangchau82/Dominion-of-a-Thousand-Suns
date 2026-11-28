// Carriers and fighters: designer rules, fighter stats, and how fighters fight.
import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, newGame, type GameState } from "../src/engine";
import { runAITurns } from "../src/ai";
import { resolveCombat } from "../src/engine/combat";
import { addDesign, bestBeam, checkDesign, designStats, fighterBayChoices, fighterStats, type DesignSpec } from "../src/engine/designs";
import { learn } from "../src/engine/tech";
import { TECHS } from "../src/engine/data/techs";
import type { Empire } from "../src/engine/types";

function game(tier: number): GameState {
  const g = newGame({ seed: 31, size: "small", shape: "ellipse", rivals: 1, playerRaceId: "humans", playerName: "A" });
  for (const e of g.empires) for (const t of TECHS) if (t.tier <= tier) learn(e.research, t.id);
  return g;
}

const carrier = (bays: number, extra: Partial<DesignSpec> = {}): DesignSpec => ({
  name: "Hive Mother", hull: "large", computer: null, shield: null, ecm: null, armor: null,
  weapons: [{ techId: "laser", count: 2 }], specials: [], bays: { bayId: "fighter-bay-1", count: bays }, ...extra,
});

describe("carriers", () => {
  it("fighter bays unlock with research and fit only Large and Huge warships", () => {
    const early = newGame({ seed: 31, size: "small", shape: "ellipse", rivals: 1, playerRaceId: "humans", playerName: "A" });
    expect(fighterBayChoices(early.empires[0]!)).toEqual([]);
    expect(checkDesign(early, early.empires[0]!, carrier(1))).toMatch(/can't build that fighter bay/);
    const g = game(3);
    const e = g.empires[0]!;
    expect(checkDesign(g, e, carrier(2))).toBeNull();
    expect(checkDesign(g, e, carrier(2, { hull: "medium" }))).toMatch(/Large or bigger/);
    expect(checkDesign(g, e, carrier(7))).toMatch(/Up to 6/);
    expect(checkDesign(g, e, carrier(1, { role: "colony", weapons: [] }))).not.toBeNull();
    expect(checkDesign(g, e, { ...carrier(1), bays: { bayId: "fighter-bay-1", count: 1, variant: "bomber" } })).toMatch(/fighter type/);
    expect(checkDesign(g, e, { ...carrier(1), bays: { bayId: "fighter-bay-1", count: 1, variant: "interceptor" } })).toBeNull();
  });

  it("bays take room and money, and the design shows its fighters", () => {
    const g = game(3);
    const e = g.empires[0]!;
    const plain = designStats(e, { ...carrier(0), bays: undefined });
    const two = designStats(e, carrier(2));
    expect(two.spaceUsed).toBeGreaterThan(plain.spaceUsed);
    expect(two.cost).toBeGreaterThan(plain.cost);
    expect(two.fighters?.count).toBe(12);
    const d = addDesign(g, e, carrier(2));
    expect(d.bays).toEqual({ bayId: "fighter-bay-1", count: 2 });
    expect(applyCommand(g, 0, { type: "createDesign", spec: { ...carrier(1), name: "Nest" } }).ok).toBe(true);
  });

  it("fighters carry a share of the best beam once beams outgrow the bay's own guns", () => {
    const early = fighterStats("fighter-bay-1", undefined, { min: 1, max: 4 });
    expect([early.min, early.max]).toEqual([6, 14]);
    const late = fighterStats("fighter-bay-1", undefined, { min: 20, max: 50 });
    expect(late.max).toBeGreaterThan(14);
    const bomber = fighterStats("fighter-bay-2", "bomber");
    expect(bomber.max).toBeGreaterThan(fighterStats("fighter-bay-2").max);
    expect(bestBeam(game(9).empires[0]!)!.max).toBeGreaterThanOrEqual(50);
  });

  it("fighters fight, screen missiles, and are never counted as lost ships", () => {
    const g = game(4);
    const [a, b] = g.empires as [Empire, Empire];
    const c = addDesign(g, a, carrier(3));
    const m = addDesign(g, b, { name: "Barrage", hull: "large", computer: null, shield: null, ecm: null, armor: null, weapons: [{ techId: "nuclear-missile", count: 20 }], specials: [] });
    const star = g.stars.find((s) => !g.colonies[s.id])!;
    g.fleets = [
      { id: 1, empireId: 0, ships: { [c.id]: 6 }, x: star.x, y: star.y, starId: star.id, destStarId: null },
      { id: 2, empireId: 1, ships: { [m.id]: 6 }, x: star.x, y: star.y, starId: star.id, destStarId: null },
    ];
    a.atWar[1] = 1; b.atWar[0] = 1;
    resolveCombat(g);
    const text = g.events.filter((e) => e.kind === "battle" && e.empireId === 0).map((e) => e.text).join(" ");
    expect(text).toMatch(/fighter/);
    // Fleets only ever hold real ships: no fighter entries appear.
    for (const f of g.fleets) for (const k of Object.keys(f.ships)) expect(k).not.toContain("#");
  });

  it("AI empires design and build carriers on their own, and games stay deterministic", () => {
    const run = () => {
      const g = newGame({ seed: 8, size: "small", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "A" });
      for (const e of g.empires) for (const t of TECHS) if (t.tier <= 5) learn(e.research, t.id);
      for (let t = 0; t < 60; t++) { runAITurns(g, true); endTurn(g); }
      return g;
    };
    const g = run();
    expect(Object.values(g.designs).some((d) => d.bays && d.bays.count > 0)).toBe(true);
    expect(JSON.stringify(run())).toBe(JSON.stringify(g));
  });
});
