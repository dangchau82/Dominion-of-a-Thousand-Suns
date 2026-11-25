// Balance tester: 18 AI-vs-AI games on a large galaxy. Not part of npm test (slow, ~2 minutes).
// Run: npx vitest run tools/balance.test.ts --dir tools   → results in /tmp/balance.json
import { it } from "vitest";
import { writeFileSync } from "node:fs";
import { newGame, endTurn } from "../src/engine";
import { runAITurns } from "../src/ai";
import { RACES } from "../src/engine/data/races";
it("balance", () => {
  const ids = RACES.map((r) => r.id);
  const rows: any[] = [];
  const t0 = Date.now();
  for (let g = 0; g < 18; g++) {
    // rotate who is in each game so every race appears equally
    const race = ids[g % ids.length]!;
    const s = newGame({ seed: 1000 + g, size: "large", shape: "ellipse", rivals: 7, playerRaceId: race, playerName: "P", difficulty: "normal" } as never);
    let t = 0;
    const snap: Record<number, any> = {};
    while (!s.winner && t < 400) {
      runAITurns(s, true); endTurn(s); t++;
      if (t === 100 || t === 200) snap[t] = s.empires.map((e) => ({ race: e.raceId, cols: Object.values(s.colonies).filter((c) => c.empireId === e.id).length, alive: e.alive }));
    }
    rows.push({ g, turns: t, winner: s.winner ? s.empires[s.winner.empireId]!.raceId : null, how: s.winner?.kind ?? null, snap,
      final: s.empires.map((e) => ({ race: e.raceId, cols: Object.values(s.colonies).filter((c) => c.empireId === e.id).length, alive: e.alive, techs: e.research.known.length })) });
    console.log(`game ${g}: ${t} turns, winner ${rows.at(-1).winner} by ${rows.at(-1).how} (${((Date.now() - t0) / 1000) | 0}s)`);
  }
  writeFileSync("/tmp/balance.json", JSON.stringify(rows));
}, 3_000_000);
