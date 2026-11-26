// The Cult of the Last Sun (src/engine/deathCult.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { resolveEvent } from "../src/engine/events";
import { relation } from "../src/engine/diplomacy";
import { CULT_EVENT_ID, CULT_FROM, CULT_WINDOW, MAX_COLONIES, processDeathCult, PURGE_PER_COLONY, RITE_CULTURE, SPREAD_EVERY, TITHE } from "../src/engine/deathCult";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 73, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** Every empire gets 6 extra colonies; run until the cult appears. */
function cultGame(): GameState {
  const g = newGame(settings());
  const free = g.stars.filter((s) => s.planet && !g.colonies[s.id]);
  let k = 0;
  for (const e of g.empires) {
    const cap = g.colonies[e.capitalStarId]!;
    for (let i = 0; i < 6 && k < free.length; i++, k++) g.colonies[free[k]!.id] = { ...JSON.parse(JSON.stringify(cap)), starId: free[k]!.id, population: 3 + i };
  }
  for (g.turn = 1; g.turn < 300 && !g.deathCult; g.turn++) processDeathCult(g);
  return g;
}
const ev = (g: GameState) => g.pendingEvents.find((p) => p.eventId === CULT_EVENT_ID)!;

describe("the Cult of the Last Sun", () => {
  it("appears once, in the seed's window, at an outer colony", () => {
    const g = cultGame();
    const t = g.turn - 1;
    expect(t).toBeGreaterThanOrEqual(CULT_FROM);
    expect(t).toBeLessThan(CULT_FROM + CULT_WINDOW);
    const e = g.empires[g.deathCult!.empireId]!;
    expect(ev(g).colonyStarId).not.toBe(e.capitalStarId);
    for (let i = 0; i < 50; i++) { g.turn++; processDeathCult(g); }
    expect(g.pendingEvents.filter((p) => p.eventId === CULT_EVENT_ID).length).toBe(1);
  });

  it("left alone it drains tithes and spreads, up to MAX_COLONIES", () => {
    const g = cultGame();
    resolveEvent(g, ev(g), 1);
    const e = g.empires[g.deathCult!.empireId]!;
    e.treasury = 1000;
    processDeathCult(g);
    expect(e.treasury).toBe(1000 - TITHE);
    for (let i = 0; i < SPREAD_EVERY * 10; i++) { g.turn++; processDeathCult(g); }
    expect(g.deathCult!.colonies.length).toBe(MAX_COLONIES);
  });

  it("purging costs per cult world and stops it", () => {
    const g = cultGame();
    const e = g.empires[g.deathCult!.empireId]!;
    e.treasury = 1000;
    resolveEvent(g, ev(g), 0);
    expect(e.treasury).toBe(1000 - PURGE_PER_COLONY);
    expect(g.deathCult!.stance).toBe("purged");
  });

  it("adopting it brings culture, stops the spread and sours neighbours", () => {
    const g = cultGame();
    const e = g.empires[g.deathCult!.empireId]!;
    const other = g.empires.find((o) => o.id !== e.id)!;
    const rel = relation(other, e);
    resolveEvent(g, ev(g), 2);
    expect(relation(other, e)).toBeLessThan(rel);
    const c = e.culture;
    for (let i = 0; i < SPREAD_EVERY * 3; i++) { g.turn++; processDeathCult(g); }
    expect(g.deathCult!.colonies.length).toBe(1);
    expect(e.culture).toBe(c + RITE_CULTURE * SPREAD_EVERY * 3);
  });

  it("old saves (version 31) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 31;
    delete old.deathCult;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
