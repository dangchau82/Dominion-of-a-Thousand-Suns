// Underdog catch-up (src/engine/underdogs.ts and its hooks).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { resolveEvent } from "../src/engine/events";
import { relation } from "../src/engine/diplomacy";
import { galaxyLeader, isUnderdog, LAST_STAND_BASES, LAST_STAND_ID, LAST_STAND_SHIPS, PEACE_PLEA, processUnderdogs, REFUGEE_EVERY, REFUGEE_RESEARCH } from "../src/engine/underdogs";
import { processTechMages, MAX_VISITS, MAGES_EVENT_ID } from "../src/engine/techMages";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 404, size: "medium", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** Empire 1 becomes big (n extra worlds). */
function bigOne(g: GameState, n: number) {
  const home = g.colonies[g.empires[1]!.capitalStarId]!;
  for (const s of g.stars.filter((x) => x.planet && !g.colonies[x.id]).slice(0, n)) g.colonies[s.id] = { ...structuredClone(home), starId: s.id, isCapital: false, buildQueue: null };
}

describe("underdogs", () => {
  it("are empires with at most half the average worlds; the leader has the most", () => {
    const g = newGame(settings());
    expect(isUnderdog(g, g.empires[0]!)).toBe(false);
    bigOne(g, 12);
    expect(isUnderdog(g, g.empires[0]!)).toBe(true);
    expect(isUnderdog(g, g.empires[1]!)).toBe(false);
    expect(galaxyLeader(g)!.id).toBe(1);
  });

  it("restless worlds in the leader send refugees to underdogs who know it", () => {
    const g = newGame(settings());
    bigOne(g, 12);
    for (const c of Object.values(g.colonies)) if (c.empireId === 1) c.unrest = 60;
    g.empires[0]!.contacts.push(1);
    const e = g.empires[0]!, r = e.research.progress.computers;
    g.turn = REFUGEE_EVERY;
    processUnderdogs(g);
    expect(e.research.progress.computers).toBeGreaterThanOrEqual(r + REFUGEE_RESEARCH);
    // Empire 2 never met the leader: no refugees.
    expect(g.events.some((x) => x.empireId === 2 && /Refugees/.test(x.text))).toBe(false);
  });

  it("tech-mages visit underdogs one extra time", () => {
    const g = newGame(settings());
    bigOne(g, 12);
    let visits = 0;
    for (g.turn = 1; g.turn < 600; g.turn++) {
      processTechMages(g);
      for (const p of g.pendingEvents.filter((x) => x.empireId === 0)) { if (p.eventId === MAGES_EVENT_ID) visits++; resolveEvent(g, p, 2); }
    }
    expect(visits).toBe(MAX_VISITS + 1);
  });
});

describe("the last stand", () => {
  /** Empire 0 held 6 worlds and is now down to its capital. */
  function fallen(): GameState {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const home = g.colonies[e.capitalStarId]!;
    const extra = g.stars.filter((x) => x.planet && !g.colonies[x.id]).slice(0, 5);
    for (const s of extra) g.colonies[s.id] = { ...structuredClone(home), starId: s.id, isCapital: false, buildQueue: null };
    processUnderdogs(g);
    for (const s of extra) delete g.colonies[s.id];
    g.pendingEvents = [];
    processUnderdogs(g);
    return g;
  }
  const ev = (g: GameState) => g.pendingEvents.find((p) => p.empireId === 0 && p.eventId === LAST_STAND_ID)!;

  it("comes once, to an empire that fell from 5+ worlds to 2 or fewer", () => {
    const g = fallen();
    expect(ev(g)).toBeDefined();
    g.pendingEvents = [];
    processUnderdogs(g);
    expect(g.pendingEvents).toHaveLength(0);
  });

  it("calling in every favour spends all BC on a fleet at home", () => {
    const g = fallen();
    const e = g.empires[0]!;
    e.treasury = 777;
    const before = g.fleets.length;
    resolveEvent(g, ev(g), 0);
    expect(e.treasury).toBe(0);
    expect(g.fleets.length).toBe(before + 1);
    expect(Object.values(g.fleets.at(-1)!.ships)[0]).toBe(LAST_STAND_SHIPS);
  });

  it("a fortress homeworld gets missile bases; pleading for peace softens enemies", () => {
    const g = fallen();
    const e = g.empires[0]!;
    const bases = g.colonies[e.capitalStarId]!.missileBases;
    resolveEvent(g, ev(g), 1);
    expect(g.colonies[e.capitalStarId]!.missileBases).toBe(bases + LAST_STAND_BASES);
    const g2 = fallen();
    const e2 = g2.empires[0]!, foe = g2.empires[1]!;
    e2.atWar[1] = 1; foe.atWar[0] = 1;
    const rel = relation(foe, e2);
    resolveEvent(g2, ev(g2), 2);
    expect(relation(foe, e2)).toBe(Math.min(100, rel + PEACE_PLEA));
  });
});

it("old saves (version 37) load", () => {
  const old = JSON.parse(serialize(newGame(settings()))) as GameState;
  old.version = 37;
  expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
});
