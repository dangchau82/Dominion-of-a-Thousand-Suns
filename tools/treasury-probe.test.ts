// Treasury probe: where AI money goes. TOOL=tools/treasury-probe.test.ts npx vitest run --config tools/vitest.tools.config.ts
import { it } from "vitest";
import { newGame, endTurn } from "../src/engine";
import { runAITurns } from "../src/ai";
it("treasury probe", () => {
  for (let g = 0; g < 3; g++) {
    const s = newGame({ seed: 3000 + g, size: "medium", shape: "ellipse", rivals: 5, playerRaceId: "humans", playerName: "P", difficulty: "normal" } as never);
    for (const e of s.empires) e.isPlayer = false;
    const buys: Record<string, number> = {};
    for (let t = 1; t <= 300 && !s.winner; t++) {
      const before = s.empires.map((e) => e.treasury);
      runAITurns(s, true);
      for (const ev of s.events) if (ev.turn === s.turn && ev.kind === "info" && ev.text.includes(":") && /Charter|Institute|Retainer|Bonds|Syndicate/.test(ev.text.split(":")[0]!)) buys[ev.text.split(":")[0]!] = (buys[ev.text.split(":")[0]!] ?? 0) + 1;
      endTurn(s);
      if (t % 50 === 0) console.log(`g${g} T${t} treasuries`, s.empires.map((e) => Math.round(e.treasury)).join(","), "| change last turn", s.empires.map((e, i) => Math.round(e.treasury - before[i]!)).join(","));
    }
    console.log(`g${g} projects bought`, JSON.stringify(buys));
  }
}, 600000);
