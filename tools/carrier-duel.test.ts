// Carrier balance duel: equal-cost fleets of a beam design and a carrier design fight many times.
// Run: TOOL=tools/carrier-duel.test.ts npx vitest run --config tools/vitest.tools.config.ts
import { it } from "vitest";
import { newGame } from "../src/engine";
import { FIGHTER_TUNING, resolveCombat } from "../src/engine/combat";
import { addDesign, designStats, fighterBayChoices, partChoices, type DesignSpec } from "../src/engine/designs";
import { learn, tech } from "../src/engine/tech";
import { TECHS } from "../src/engine/data/techs";
import { makeRng } from "../src/engine/rng";
import type { Empire, GameState } from "../src/engine/types";
import type { HullSize } from "../src/engine/data/ships";

function equip(e: Empire, tier: number): void {
  for (const t of TECHS) if (t.tier <= tier) learn(e.research, t.id);
}

function best(e: Empire, stat: string): string | null {
  const list = partChoices(e)[stat as "computer"] ?? [];
  return [...list].sort((a, b) => b.tier - a.tier)[0]?.id ?? null;
}

function bestWeapon(e: Empire, kinds: string[]): string {
  return partChoices(e).weapons.filter((t) => t.effects.some((fx) => fx.stat === "weapon" && kinds.includes(fx.kind)))
    .sort((a, b) => b.tier - a.tier)[0]!.id;
}

/** Fill a hull: optional bays, then the rest with one weapon. */
function design(e: Empire, hull: HullSize, weapon: string, bays: number, variant?: string): DesignSpec {
  const bay = fighterBayChoices(e).sort((a, b) => b.tier - a.tier)[0];
  const spec: DesignSpec = { name: "x", hull, computer: best(e, "computer"), shield: best(e, "shield"), ecm: best(e, "ecm"), armor: best(e, "armor"), weapons: [{ techId: weapon, count: 0 }], specials: [],
    ...(bays && bay ? { bays: { bayId: bay.id, count: bays, ...(variant ? { variant } : {}) } } : {}) };
  // Like the AI: drop jammers, then shields, if systems leave too little room.
  const sys = () => { const st = designStats(e, { ...spec, weapons: [], bays: undefined } as DesignSpec); return st.spaceUsed / st.space; };
  if (sys() > 0.5) spec.ecm = null;
  if (sys() > 0.5) spec.shield = null;
  while (spec.bays && spec.bays.count > 0 && designStats(e, { ...spec, weapons: [] }).spaceUsed > designStats(e, spec).space) spec.bays.count--;
  for (let n = 1; ; n++) { spec.weapons[0]!.count = n; const st = designStats(e, spec); if (st.spaceUsed > st.space) { spec.weapons[0]!.count = n - 1; break; } }
  return spec;
}

function duel(tier: number, hull: HullSize, a: (e: Empire) => DesignSpec, b: (e: Empire) => DesignSpec, games: number): { a: number; b: number; costA: number; costB: number } {
  let winA = 0, winB = 0, costA = 0, costB = 0;
  for (let g = 0; g < games; g++) {
    const s: GameState = newGame({ seed: 1 + g, size: "small", shape: "ellipse", rivals: 1, playerRaceId: "humans", playerName: "A" } as never);
    s.empires[1]!.raceId = "humans";
    for (const e of s.empires) equip(e, tier);
    const da = addDesign(s, s.empires[0]!, a(s.empires[0]!));
    const db = addDesign(s, s.empires[1]!, b(s.empires[1]!));
    costA = da.cost; costB = db.cost;
    if (g === 0 && process.env.SHOW) console.log(tier, hull, JSON.stringify(designStats(s.empires[0]!, a(s.empires[0]!)).weapons), "|", JSON.stringify(designStats(s.empires[1]!, b(s.empires[1]!)).weapons), JSON.stringify(designStats(s.empires[1]!, b(s.empires[1]!)).fighters));
    const budget = 20000 * (hull === "huge" ? 5 : 1);
    const star = s.stars.find((x) => !s.colonies[x.id])!;
    s.fleets = [
      { id: 1, empireId: 0, ships: { [da.id]: Math.floor(budget / da.cost) }, x: star.x, y: star.y, starId: star.id, destStarId: null },
      { id: 2, empireId: 1, ships: { [db.id]: Math.floor(budget / db.cost) }, x: star.x, y: star.y, starId: star.id, destStarId: null },
    ];
    s.empires[0]!.atWar[1] = 1; s.empires[1]!.atWar[0] = 1;
    s.rng = makeRng(1000 + g);
    resolveCombat(s);
    if (g === 0 && process.env.SHOW) console.log("EV", tier, hull, s.events.filter((x) => x.kind === "battle" && x.empireId === 0).map((x) => x.text).join(" / "));
    const left = (i: number, c: number) => s.fleets.filter((f) => f.empireId === i).reduce((n, f) => n + (f.ships[i === 0 ? da.id : db.id] ?? 0), 0) * c;
    // Value each side destroyed.
    winA += budget - (budget % db.cost) - left(1, db.cost);
    winB += budget - (budget % da.cost) - left(0, da.cost);
  }
  return { a: winA, b: winB, costA, costB };
}

it("carrier duels", () => {
  FIGHTER_TUNING.screen = Number(process.env.SCREEN ?? FIGHTER_TUNING.screen);
  FIGHTER_TUNING.hitsMul = Number(process.env.HITS ?? FIGHTER_TUNING.hitsMul);
  FIGHTER_TUNING.interceptMul = Number(process.env.ICPT ?? FIGHTER_TUNING.interceptMul);
  const G = Number(process.env.GAMES ?? 30);
  for (const tier of [4, 5, 6, 7, 8]) {
    for (const hull of ["large", "huge"] as HullSize[]) {
      const beams = (e: Empire) => design(e, hull, bestWeapon(e, ["beam"]), 0);
      const missiles = (e: Empire) => design(e, hull, bestWeapon(e, ["missile", "torpedo"]), 0);
      const carrier = (n: number, v?: string) => (e: Empire) => design(e, hull, bestWeapon(e, ["beam"]), n, v);
      if (!fighterBayChoices((() => { const s = newGame({ seed: 1, size: "small", shape: "ellipse", rivals: 1, playerRaceId: "humans", playerName: "A" } as never); equip(s.empires[0]!, tier); return s.empires[0]!; })()).length) continue;
      const r1 = duel(tier, hull, beams, carrier(3), G);
      const r2 = duel(tier, hull, beams, carrier(6), G);
      const r3 = duel(tier, hull, missiles, carrier(3), G);
      const r4 = duel(tier, hull, missiles, carrier(3, "interceptor"), G);
      const q = (r: { a: number; b: number }) => (r.b / Math.max(1, r.a)).toFixed(2);
      console.log(`tier ${tier} ${hull} (carrier kills per gun-ship kill; 1.00 = even): vs beams 3 bays ${q(r1)}, 6 bays ${q(r2)} | vs missiles 3 bays ${q(r3)}, interceptors ${q(r4)}`);
    }
  }
  void tech;
}, 6_000_000);
