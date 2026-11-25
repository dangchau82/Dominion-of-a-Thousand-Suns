// Unrest probe: AI-only games, counts revolts, civil wars and liberations, and unrest levels.
// Run: TOOL=tools/unrest-probe.test.ts GAMES=6 npx vitest run --config tools/vitest.tools.config.ts
import { it } from "vitest";
import { newGame, endTurn } from "../src/engine";
import { runAITurns } from "../src/ai";
import { RACES } from "../src/engine/data/races";

it("unrest probe", () => {
  const ids = RACES.map((r) => r.id);
  const GAMES = Number(process.env.GAMES ?? 6), SEED0 = Number(process.env.SEED0 ?? 3000);
  const tot = { civil: 0, freed: 0, crushed: 0, captures: 0, events: 0 };
  for (let g = 0; g < GAMES; g++) {
    const s = newGame({ seed: SEED0 + g, size: process.env.SIZE ?? "medium", shape: "ellipse", rivals: Number(process.env.RIVALS ?? 5), playerRaceId: ids[g % ids.length]!, playerName: "P", difficulty: "normal" } as never);
    for (const e of s.empires) e.isPlayer = false;
    let t = 0; const c = { civil: 0, freed: 0, crushed: 0, captures: 0, events: 0 };
    const hist: string[] = [];
    while (!s.winner && t < 400) {
      runAITurns(s, true); endTurn(s); t++;
      for (const ev of s.events) {
        if (ev.turn !== s.turn - 1) continue;
        if (ev.kind === "unrest" && ev.text.startsWith("Civil war")) { c.civil++; hist.push(`T${t} ${ev.text.slice(0, 120)}`); }
        if (ev.kind === "unrest" && ev.text.startsWith("Uprising")) { c.freed++; hist.push(`T${t} ${ev.text.slice(0, 100)}`); }
        if (ev.kind === "unrest" && ev.text.startsWith("Riots") ) c.crushed++;
        if (ev.kind === "invasion" && ev.text.includes("captured") && ev.empireId !== null) c.captures += 0.5;
      }
      if (t % 100 === 0) {
        const us = Object.values(s.colonies).filter((x) => !x.isCapital).map((x) => x.unrest ?? 0).sort((a, b) => a - b);
        const q = (p: number) => Math.round(us[Math.floor(p * (us.length - 1))] ?? 0);
        hist.push(`T${t} unrest p50 ${q(0.5)} p90 ${q(0.9)} max ${q(1)} over65 ${us.filter((u) => u >= 65).length}/${us.length}`);
      }
    }
    for (const k of Object.keys(tot) as (keyof typeof tot)[]) tot[k] += c[k];
    console.log(`game ${g}: T${t} winner ${s.winner ? s.empires[s.winner.empireId]!.name : "none"} by ${s.winner?.kind ?? "-"} | ${JSON.stringify(c)} | empires ${s.empires.length}\n  ${hist.join("\n  ")}`);
  }
  console.log("TOTAL", JSON.stringify(tot));
}, 6_000_000);
