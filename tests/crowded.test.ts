import { it, expect } from "vitest";
import { runAITurns } from "../src/ai";
import { endTurn, newGame, race } from "../src/engine";
import { FAIR_START_RADIUS } from "../src/engine/galaxy";
import { canColonizeClimate } from "../src/engine/formulas";
it("18 races on huge, 11 rivals on large", () => {
  for (const [size, rivals] of [["huge", 17], ["large", 11], ["medium", 7], ["small", 4]] as const) {
    for (const seed of [1, 2, 3]) {
      const g = newGame({ seed, size, shape: "spiral", rivals, playerRaceId: "nyx", playerName: "D" });
      expect(g.empires.length).toBe(rivals + 1);
      let minGap = Infinity;
      for (const a of g.empires) for (const b of g.empires) if (a.id < b.id) {
        const sa = g.stars[a.capitalStarId]!, sb = g.stars[b.capitalStarId]!;
        minGap = Math.min(minGap, Math.hypot(sa.x - sb.x, sa.y - sb.y));
      }
      for (const e of g.empires) {
        const home = g.stars[e.capitalStarId]!;
        const good = g.stars.filter((s) => s !== home && Math.hypot(s.x - home.x, s.y - home.y) <= FAIR_START_RADIUS + 1e-6
          && s.planet && canColonizeClimate(s.planet.climate, race(e.raceId)) && s.planet.size >= 35);
        expect(good.length).toBeGreaterThanOrEqual(2);
      }

      for (let t = 0; t < 30; t++) { runAITurns(g, true); endTurn(g); }

    }
  }
});
