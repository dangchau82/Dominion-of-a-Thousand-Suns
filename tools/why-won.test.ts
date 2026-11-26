// Why-won report: plays AI-only games and, for each one, finds WHEN the winner pulled ahead and WHAT tipped it,
// using the game's own chronicle (per-turn stats of every empire). Tools only: reads state, changes no rules.
// Run: TOOL=tools/why-won.test.ts GAMES=18 SIZE=medium RIVALS=5 SEED0=3000 npx vitest run -c tools/vitest.tools.config.ts
// ONLY=quorai plays only the games with that race. Output: OUT (default /tmp/why-won.json) plus a plain summary printed at the end.
import { it } from "vitest";
import { writeFileSync } from "node:fs";
import { newGame, endTurn } from "../src/engine";
import { runAITurns } from "../src/ai";
import { RACES } from "../src/engine/data/races";
import { CHRONICLE_STATS, type ChronicleTurn } from "../src/engine/chronicle";

/** Stats where "more is better" and a lead means something. */
const LEAD_STATS = ["colonies", "population", "factories", "techs", "fleet", "culture"] as const;
const IDX = Object.fromEntries(CHRONICLE_STATS.map((k, i) => [k, i])) as Record<string, number>;

function rankOf(turn: ChronicleTurn, empire: number, stat: string): number {
  const mine = turn.e[empire]?.[IDX[stat]!];
  if (mine === undefined) return 99;
  let rank = 1;
  for (const row of turn.e) if (row && row[IDX[stat]!]! > mine) rank++;
  return rank;
}

/** First turn from which the empire stayed #1 in this stat until the end (null if it isn't #1 at the end). */
function leadFrom(turns: ChronicleTurn[], empire: number, stat: string): number | null {
  if (!turns.length || rankOf(turns.at(-1)!, empire, stat) !== 1) return null;
  for (let i = turns.length - 1; i >= 0; i--) if (rankOf(turns[i]!, empire, stat) !== 1) return turns[i + 1]?.t ?? null;
  return turns[0]!.t;
}

it("why-won", () => {
  const ids = RACES.map((r) => r.id);
  const GAMES = Number(process.env.GAMES ?? 18), SIZE = process.env.SIZE ?? "medium", RIVALS = Number(process.env.RIVALS ?? 5);
  const SEED0 = Number(process.env.SEED0 ?? 3000), OUT = process.env.OUT ?? "/tmp/why-won.json";
  const rows: any[] = [];
  const t0 = Date.now();
  for (let g = 0; g < GAMES; g++) {
    const s = newGame({ seed: SEED0 + g, size: SIZE, shape: "ellipse", rivals: RIVALS, playerRaceId: ids[g % ids.length]!, playerName: "P", difficulty: process.env.DIFF ?? "normal" } as never);
    for (const e of s.empires) e.isPlayer = false;
    // ONLY=<race id>: play just the games that race is in (quick check of one race).
    if (process.env.ONLY && !s.empires.some((e) => e.raceId === process.env.ONLY)) continue;
    let t = 0;
    while (!s.winner && t < 400) { runAITurns(s, true); endTurn(s); t++; }
    const turns = s.chronicle?.turns ?? [];
    const row: any = { g, seed: SEED0 + g, turns: t, races: s.empires.map((e) => e.raceId) };
    if (!s.winner) { rows.push({ ...row, winner: null }); console.log(`game ${g}: no winner by T${t}`); continue; }
    const w = s.winner.empireId;
    const leads: Record<string, number | null> = {};
    for (const st of LEAD_STATS) leads[st] = leadFrom(turns, w, st);
    // What tipped it = the stat the winner locked first.
    const locked = Object.entries(leads).filter(([, v]) => v !== null).sort((a, b) => a[1]! - b[1]!);
    const tipped = locked[0] ?? null;
    const at = (tt: number) => turns.find((x) => x.t === tt);
    const early = [50, 100, 150].map((tt) => { const x = at(tt); return x ? { t: tt, colonyRank: rankOf(x, w, "colonies"), cultureRank: rankOf(x, w, "culture"), popRank: rankOf(x, w, "population") } : null; }).filter(Boolean);
    const winnerWars = turns.reduce((n, x) => Math.max(n, x.e[w]?.[IDX.wars!] ?? 0), 0);
    const pivot = tipped?.[1] ?? null;
    const around = pivot === null ? [] : (s.chronicle?.events ?? []).filter((ev) => ev.empireId === w && ev.t >= pivot - 10 && ev.t <= pivot + 5).slice(0, 6).map((ev) => `T${ev.t} ${ev.kind}: ${ev.text}`);
    rows.push({ ...row, winner: s.empires[w]!.raceId, how: s.winner.kind, wonAt: s.winner.turn, leads, tipped: tipped ? { stat: tipped[0], from: tipped[1] } : null, early, maxWarsAtOnce: winnerWars, around });
    console.log(`game ${g}: ${s.empires[w]!.raceId} by ${s.winner.kind} T${s.winner.turn}; first lock ${tipped?.[0] ?? "none"} from T${tipped?.[1] ?? "-"} (${((Date.now() - t0) / 1000) | 0}s)`);
  }
  writeFileSync(OUT, JSON.stringify(rows, null, 1));
  // Plain summary
  const won = rows.filter((r) => r.winner);
  const by = (f: (r: any) => string) => won.reduce((m: Record<string, number>, r) => ((m[f(r)] = (m[f(r)] ?? 0) + 1), m), {});
  console.log("\n=== WHY-WON SUMMARY ===");
  console.log(`games ${rows.length}, with a winner ${won.length}`);
  console.log("wins by race:", JSON.stringify(by((r) => r.winner)));
  const played: Record<string, number> = {};
  for (const r of rows) for (const id of r.races) played[id] = (played[id] ?? 0) + 1;
  const wins = by((r) => r.winner);
  console.log("win rate by race (wins/games, fair share = 1 in " + (RIVALS + 1) + "):");
  for (const [id, n] of Object.entries(played).sort((a, b) => (wins[b[0]] ?? 0) / b[1] - (wins[a[0]] ?? 0) / a[1]))
    console.log(`  ${id.padEnd(10)} ${String(wins[id] ?? 0).padStart(2)}/${String(n).padStart(2)}  ${Math.round(((wins[id] ?? 0) / n) * 100)}%`);
  console.log("wins by type:", JSON.stringify(by((r) => r.how)));
  console.log("first stat locked:", JSON.stringify(by((r) => r.tipped?.stat ?? "none")));
  const gaps = won.filter((r) => r.tipped).map((r) => r.wonAt - r.tipped.from).sort((a, b) => a - b);
  console.log("turns between locking the lead and winning (median):", gaps[gaps.length >> 1] ?? "-");
  const col100 = won.map((r) => r.early.find((x: any) => x.t === 100)?.colonyRank).filter((x) => x !== undefined);
  console.log("winner's colony rank at T100:", JSON.stringify(col100));
}, 6_000_000);
