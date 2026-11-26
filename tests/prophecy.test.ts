// Prophecies: fates decided ahead come true; seers speak plainly; quarantine softens plagues.
import { describe, expect, it } from "vitest";
import { endTurn, newGame, type GameSettings } from "../src/engine";
import { runAITurns } from "../src/ai";
import { newColony } from "../src/engine/game";
import { processProphecies, PLAGUE_LOSS, PLAGUE_LOSS_QUARANTINED } from "../src/engine/prophecy";
import { GOLDEN_AGE_AT } from "../src/engine/data/buildings";
import { PROPHECIES } from "../src/engine/data/prophecies";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 77, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

function colony(g: ReturnType<typeof newGame>, empireId: number) {
  const s = g.stars.find((x) => x.planet && !g.colonies[x.id])!;
  const c = newColony(s.id, empireId, 20, 1);
  g.colonies[s.id] = c;
  return c;
}

describe("prophecies", () => {
  it("a fated plague strikes on time; quarantine (ecology 30%+) softens it", () => {
    for (const quarantine of [false, true]) {
      const g = newGame(settings());
      const c = colony(g, 0);
      c.sliders = quarantine ? { ship: 0, defense: 0, industry: 50, ecology: 30, research: 20 } : { ship: 0, defense: 0, industry: 70, ecology: 10, research: 20 };
      g.turn = 50;
      g.fates = [{ empireId: 0, kind: "plague", due: 50, starId: c.starId, rivalId: null, prophecyId: PROPHECIES.find((p) => p.threat === "plague")!.id }];
      processProphecies(g);
      expect(c.population).toBeCloseTo(20 * (1 - (quarantine ? PLAGUE_LOSS_QUARANTINED : PLAGUE_LOSS)), 5);
      expect(g.fates.some((f) => f.kind === "plague" && f.due === 50)).toBe(false);
    }
  });

  it("a foretold golden age arrives no later than foretold", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    e.culture = GOLDEN_AGE_AT[0]! - 10;
    g.turn = 60;
    g.fates = [{ empireId: 0, kind: "goldenAge", due: 60, starId: e.capitalStarId, rivalId: null, prophecyId: PROPHECIES.find((p) => p.threat === "goldenAge")!.id }];
    processProphecies(g);
    expect(e.culture).toBeGreaterThanOrEqual(GOLDEN_AGE_AT[0]!);
  });

  it("seers (Velari) hear plain words; others hear riddles with colour, direction and turns", () => {
    for (const race of ["velari", "humans"]) {
      const g = newGame(settings({ playerRaceId: race }));
      const e = g.empires[0]!;
      const c = colony(g, 0);
      g.turn = 40;
      // Force a plague prophecy by retrying seeds until one is heard.
      for (let i = 0; i < 4000 && !(e.prophecies ?? []).length; i++) { processProphecies(g); g.turn++; g.fates = []; }
      const p = e.prophecies![0]!;
      if (race === "velari") expect(p.starId).not.toBeNull();
      else { expect(p.starId).toBeNull(); expect(p.text).not.toMatch(/\{/); }
      void c;
    }
  });

  it("long AI games hear and settle prophecies, and stay deterministic", () => {
    const run = () => { const g = newGame(settings({ seed: 5, rivals: 4, playerRaceId: "lumen" })); for (let t = 0; t < 250; t++) { runAITurns(g, true); endTurn(g); } return g; };
    const g = run();
    const heard = g.empires.flatMap((e) => e.prophecies ?? []);
    expect(heard.length).toBeGreaterThan(0);
    expect(heard.some((p) => p.outcome !== "waiting")).toBe(true);
    expect(JSON.stringify(run())).toBe(JSON.stringify(g));
  });
});
