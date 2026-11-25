// Master AI tournament: seat 0 plays the Master AI against basic AIs, then the same seeds
// again with a basic AI in seat 0 (the control). Not part of npm test.
// Run: GAMES=18 RIVALS=5 SIZE=medium SEED0=7000 OUT=/tmp/t.json npx vitest run tools/tournament.test.ts
import { it } from "vitest";
import { writeFileSync } from "node:fs";
import { newGame, endTurn } from "../src/engine";
import { applyCommand } from "../src/engine/commands";
import { makeView } from "../src/engine/view";
import { basicAITurn } from "../src/ai/basicAI";
import { masterAITurn } from "../src/ai/masterAI";
import { RACES } from "../src/engine/data/races";

it("tournament", () => {
  const ids = RACES.map((r) => r.id);
  const GAMES = Number(process.env.GAMES ?? 18), SIZE = process.env.SIZE ?? "medium", RIVALS = Number(process.env.RIVALS ?? 5);
  const SEED0 = Number(process.env.SEED0 ?? 7000), OUT = process.env.OUT ?? "/tmp/tournament.json";
  const rows: any[] = [];
  for (const arm of ["master", "control"] as const) {
    let wins = 0;
    for (let g = 0; g < GAMES; g++) {
      const s = newGame({ seed: SEED0 + g, size: SIZE, shape: "ellipse", rivals: RIVALS, playerRaceId: ids[g % ids.length]!, playerName: "P", difficulty: "normal" } as never);
      for (const e of s.empires) e.isPlayer = false;
      let t = 0;
      while (!s.winner && t < 400) {
        for (const e of s.empires) {
          if (!e.alive) continue;
          const turn = arm === "master" && e.id === 0 ? masterAITurn : basicAITurn;
          for (const cmd of turn(makeView(s, e.id))) applyCommand(s, e.id, cmd);
        }
        endTurn(s); t++;
      }
      const won = s.winner?.empireId === 0;
      if (won) wins++;
      const me = s.empires[0]!;
      rows.push({ arm, g, race: me.raceId, won, how: s.winner?.kind ?? null, winner: s.winner ? s.empires[s.winner.empireId]!.raceId : null, turns: t,
        alive: me.alive, culture: Math.round(me.culture), treasury: Math.round(me.treasury), cols: Object.values(s.colonies).filter((c) => c.empireId === 0).length });
      console.log(`${arm} ${g} ${me.raceId}: ${won ? "WON" : "lost"} by ${s.winner?.kind ?? "none"} T${t} (winner ${rows.at(-1).winner})`);
    }
    console.log(`== ${arm}: seat 0 won ${wins}/${GAMES}`);
  }
  writeFileSync(OUT, JSON.stringify(rows));
}, 6_000_000);
