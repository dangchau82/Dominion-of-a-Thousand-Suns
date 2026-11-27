// Megastructures (src/engine/megastructures.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { describeEvent, resolveEvent } from "../src/engine/events";
import { relation } from "../src/engine/diplomacy";
import { FAST, MEGA_INFO, MEGA_OFFER_ID, MEGA_SABOTAGE_ID, OFFER_FROM, PRESTIGE, processMegastructures, SABOTAGE_SETBACK, SLOW } from "../src/engine/megastructures";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 107, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** Empire 0 is rich with 4 colonies; run until it is offered a great work. */
function offered(): GameState {
  const g = newGame(settings());
  const e = g.empires[0]!;
  const cap = g.colonies[e.capitalStarId]!;
  for (const s of g.stars.filter((x) => x.planet && !g.colonies[x.id]).slice(0, 3)) g.colonies[s.id] = { ...JSON.parse(JSON.stringify(cap)), starId: s.id, population: 5 };
  e.treasury = 2000;
  for (g.turn = 1; g.turn < 400 && !g.pendingEvents.some((p) => p.empireId === 0 && p.eventId === MEGA_OFFER_ID); g.turn++) processMegastructures(g);
  return g;
}
const ev = (g: GameState, id: string, emp = 0) => g.pendingEvents.find((p) => p.empireId === emp && p.eventId === id);

describe("megastructures", () => {
  it("are offered late, at the capital, naming the work", () => {
    const g = offered();
    expect(g.turn - 1).toBeGreaterThanOrEqual(OFFER_FROM);
    const p = ev(g, MEGA_OFFER_ID)!;
    expect(p.colonyStarId).toBe(g.empires[0]!.capitalStarId);
    const kind = g.megastructures![0]!.offerKind!;
    expect(describeEvent(g, p).text).toContain(MEGA_INFO[kind].name);
  });

  it("small or poor empires are not offered one", () => {
    const g = newGame(settings());
    g.empires[0]!.treasury = 5000;
    for (g.turn = 1; g.turn < 400; g.turn++) processMegastructures(g);
    expect(ev(g, MEGA_OFFER_ID)).toBeUndefined();
  });

  it("built fast: pays down, then upkeep each turn, finishes and gives its output for ever", () => {
    const g = offered();
    const e = g.empires[0]!;
    const kind = g.megastructures![0]!.offerKind!;
    e.treasury = 1000; const culture = e.culture;
    resolveEvent(g, ev(g, MEGA_OFFER_ID)!, 0);
    expect(e.treasury).toBe(1000 - FAST.down);
    expect(e.culture).toBe(culture + PRESTIGE);
    for (let i = 0; i < FAST.turns; i++) { g.turn++; processMegastructures(g); }
    const m = g.megastructures![0]!.built[0]!;
    expect(m.finished).toBe(true);
    expect(g.events.some((x) => x.kind === "saga" && x.text.includes(MEGA_INFO[kind].name))).toBe(true);
    const before = { bc: e.treasury, r: e.research.progress.computers, c: e.culture };
    g.turn++; processMegastructures(g);
    const gain = kind === "sunTap" ? e.treasury - before.bc : kind === "thinkingMoon" ? e.research.progress.computers - before.r : e.culture - before.c;
    expect(gain).toBe(MEGA_INFO[kind].perTurn);
  });

  it("work stalls while the treasury is empty", () => {
    const g = offered();
    const e = g.empires[0]!;
    resolveEvent(g, ev(g, MEGA_OFFER_ID)!, 1);
    e.treasury = 0;
    for (let i = 0; i < 5; i++) { g.turn++; processMegastructures(g); }
    expect(g.megastructures![0]!.built[0]!.done).toBe(0);
    e.treasury = SLOW.upkeep;
    g.turn++; processMegastructures(g);
    expect(g.megastructures![0]!.built[0]!.done).toBe(1);
  });

  it("an enemy at war may sabotage it, setting it back and souring relations", () => {
    const g = offered();
    const [me, foe] = [g.empires[0]!, g.empires[1]!];
    resolveEvent(g, ev(g, MEGA_OFFER_ID)!, 1);
    me.atWar[1] = g.turn; foe.atWar[0] = g.turn;
    me.treasury = 5000; foe.treasury = 1000;
    for (let i = 0; i < 40 && !ev(g, MEGA_SABOTAGE_ID, 1); i++) { g.turn++; processMegastructures(g); }
    const p = ev(g, MEGA_SABOTAGE_ID, 1)!;
    expect(p).toBeDefined();
    const m = g.megastructures![0]!.built[0]!;
    const done = m.done, rel = relation(me, foe);
    resolveEvent(g, p, 0);
    expect(m.done).toBe(Math.max(0, done - SABOTAGE_SETBACK));
    expect(relation(me, foe)).toBeLessThan(rel);
  });

  it("old saves (version 35) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 35;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
