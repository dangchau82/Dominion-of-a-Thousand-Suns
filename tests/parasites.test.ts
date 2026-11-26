// Parasite overlords (src/engine/parasites.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { resolveEvent } from "../src/engine/events";
import { CONTAIN_COST, FEED_EVERY, HIDDEN_DRAIN, HIDDEN_TURNS, PACT_RESEARCH, PARASITE_EVENT_ID, PARASITE_FROM, PARASITE_WINDOW, processParasites } from "../src/engine/parasites";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 84, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** Empire 0 gets 3 extra colonies; run until its parasite is exposed. */
function exposed(): GameState {
  const g = newGame(settings());
  const e = g.empires[0]!;
  const cap = g.colonies[e.capitalStarId]!;
  for (const s of g.stars.filter((x) => x.planet && !g.colonies[x.id]).slice(0, 3)) g.colonies[s.id] = { ...JSON.parse(JSON.stringify(cap)), starId: s.id, population: 10 };
  for (g.turn = 1; g.turn < 400 && !g.pendingEvents.some((p) => p.empireId === 0 && p.eventId === PARASITE_EVENT_ID); g.turn++) processParasites(g);
  return g;
}
const ev = (g: GameState) => g.pendingEvents.find((p) => p.empireId === 0 && p.eventId === PARASITE_EVENT_ID)!;

describe("parasite overlords", () => {
  it("take a host quietly, siphon research, and are exposed HIDDEN_TURNS later", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const cap = g.colonies[e.capitalStarId]!;
    for (const s of g.stars.filter((x) => x.planet && !g.colonies[x.id]).slice(0, 3)) g.colonies[s.id] = { ...JSON.parse(JSON.stringify(cap)), starId: s.id, population: 10 };
    for (g.turn = 1; !g.parasites?.[0]; g.turn++) processParasites(g);
    const start = g.turn - 1;
    expect(start).toBeGreaterThanOrEqual(PARASITE_FROM);
    expect(start).toBeLessThan(PARASITE_FROM + PARASITE_WINDOW);
    expect(g.parasites![0]!.starId).not.toBe(e.capitalStarId);
    e.research.progress.computers = 100;
    processParasites(g);
    expect(e.research.progress.computers).toBe(100 - HIDDEN_DRAIN);
    expect(ev(g)).toBeUndefined();
    for (let i = 0; i < HIDDEN_TURNS; i++) { g.turn++; processParasites(g); }
    expect(ev(g)).toBeDefined();
  });

  it("empires with too few colonies are spared", () => {
    const g = newGame(settings());
    for (g.turn = 1; g.turn < 400; g.turn++) processParasites(g);
    expect(g.parasites?.[0]).toBeUndefined();
  });

  it("burning it out costs people; containing it costs money", () => {
    const g = exposed();
    const h = g.parasites![0]!;
    resolveEvent(g, ev(g), 0);
    expect(g.colonies[h.starId]!.population).toBe(7);
    expect(h.stage).toBe("gone");
    const g2 = exposed();
    const e = g2.empires[0]!;
    e.treasury = 500;
    resolveEvent(g2, ev(g2), 1);
    expect(e.treasury).toBe(500 - CONTAIN_COST);
    expect(g2.parasites![0]!.stage).toBe("gone");
  });

  it("a pact gives research and feeds on the colony every FEED_EVERY turns", () => {
    const g = exposed();
    const e = g.empires[0]!;
    const h = g.parasites![0]!;
    resolveEvent(g, ev(g), 2);
    e.research.progress.computers = 0;
    const pop = g.colonies[h.starId]!.population;
    for (let i = 0; i < FEED_EVERY; i++) { g.turn++; processParasites(g); }
    expect(e.research.progress.computers).toBe(PACT_RESEARCH * FEED_EVERY);
    expect(g.colonies[h.starId]!.population).toBe(pop - 1);
  });

  it("old saves (version 32) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 32;
    delete old.parasites;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
