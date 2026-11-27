// Endgame paths and great works (src/engine/endgame.ts, data/greatWorks.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { describeEvent, resolveEvent } from "../src/engine/events";
import { relation } from "../src/engine/diplomacy";
import { endgameVotes, fearedConquests, builderWorlds, gateReady, gateWorlds, pathsEarned, processEndgame, raceWork } from "../src/engine/endgame";
import { CRACK_EVENT_ID, PATH_OFFER_PREFIX, WORK_SABOTAGE_ID } from "../src/engine/endgameEvents";
import { PATH_WORKS, RACE_WORKS, WORK_BY_ID } from "../src/engine/data/greatWorks";
import { RACES } from "../src/engine/data/races";
import { votesOf } from "../src/engine/victory";
import { makeView } from "../src/engine/view";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 211, size: "medium", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** Give empire 0 `n` extra colonies; `conquered` of them taken from empire 1. */
function grow(g: GameState, n: number, conquered = 0) {
  const home = g.colonies[g.empires[0]!.capitalStarId]!;
  const free = g.stars.filter((x) => x.planet && !g.colonies[x.id]).slice(0, n);
  free.forEach((s, i) => {
    g.colonies[s.id] = { ...structuredClone(home), starId: s.id, isCapital: false, buildQueue: null, population: 10 };
    if (i < conquered) g.colonies[s.id]!.occupiedFrom = 1;
  });
}
const offer = (g: GameState) => g.pendingEvents.find((p) => p.empireId === 0 && p.eventId.startsWith(PATH_OFFER_PREFIX));
function meet(g: GameState) { for (const o of g.empires) for (const x of g.empires) if (o !== x && !o.contacts.includes(x.id)) o.contacts.push(x.id); }

describe("great works data", () => {
  it("every race has exactly one great work, and every path has one", () => {
    for (const r of RACES) expect(RACE_WORKS.filter((w) => w.raceId === r.id)).toHaveLength(1);
    for (const p of ["feared", "beloved", "builder"]) expect(PATH_WORKS.filter((w) => w.path === p)).toHaveLength(1);
    expect(new Set([...PATH_WORKS, ...RACE_WORKS].map((w) => w.id)).size).toBe(PATH_WORKS.length + RACE_WORKS.length);
  });
});

describe("endgame paths", () => {
  it("thresholds scale with the map", () => {
    const small = newGame(settings({ size: "small", rivals: 2 })), huge = newGame(settings({ size: "huge", rivals: 8 }));
    for (const g of [small, huge]) {
      expect(gateWorlds(g)).toBeGreaterThanOrEqual(4);
      // About half the stars each empire would have on an evenly shared map.
      expect(gateWorlds(g)).toBeLessThanOrEqual(Math.ceil(g.stars.length / g.empires.length / 2));
    }
  });

  it("Feared opens with enough conquered worlds", () => {
    const g = newGame(settings());
    expect(pathsEarned(g, g.empires[0]!)).not.toContain("feared");
    grow(g, fearedConquests(g), fearedConquests(g));
    expect(pathsEarned(g, g.empires[0]!)).toContain("feared");
  });

  it("Beloved opens with three allies", () => {
    const g = newGame(settings());
    meet(g);
    const e = g.empires[0]!;
    for (const id of [1, 2, 3]) e.treaties[id] = { alliance: 1 };
    expect(pathsEarned(g, e)).toContain("beloved");
  });

  it("Builder opens with many productive worlds", () => {
    const g = newGame(settings());
    grow(g, builderWorlds(g));
    expect(pathsEarned(g, g.empires[0]!)).toContain("builder");
  });

  it("an open path is announced and offered once; the offer names our race's work", () => {
    const g = newGame(settings());
    grow(g, builderWorlds(g));
    g.turn = 100;
    processEndgame(g);
    const p = offer(g)!;
    expect(p.eventId).toBe(PATH_OFFER_PREFIX + "builder");
    expect(describeEvent(g, p).text).toContain(raceWork(g.empires[0]!)!.name);
    expect(describeEvent(g, p).text).not.toMatch(/[{}]/);
    g.pendingEvents = [];
    processEndgame(g);
    expect(offer(g)).toBeUndefined();
  });
});

describe("great works", () => {
  function building(choice: 0 | 1) {
    const g = newGame(settings());
    grow(g, builderWorlds(g));
    g.turn = 100;
    processEndgame(g);
    const e = g.empires[0]!;
    e.treasury = 100_000;
    resolveEvent(g, offer(g)!, choice);
    return { g, e, w: g.endgame![0]!.works[0]! };
  }

  it("is paid for over its turns, then finished with a saga line", () => {
    const { g, e, w } = building(0);
    const def = WORK_BY_ID.get(w.workId)!;
    expect(def.path).toBe("builder");
    const money = e.treasury;
    g.turn++; processEndgame(g);
    expect(e.treasury).toBe(money - def.upkeep);
    for (let i = 1; i < def.turns; i++) { g.turn++; processEndgame(g); }
    expect(w.finished).toBe(true);
    expect(g.events.some((x) => x.kind === "saga" && x.text.includes(def.name))).toBe(true);
  });

  it("stalls on an empty treasury", () => {
    const { g, e, w } = building(1);
    e.treasury = 0;
    for (let i = 0; i < 5; i++) { g.turn++; processEndgame(g); }
    expect(w.done).toBe(0);
  });

  it("the Ascension Gate needs enough worlds and a finished work", () => {
    const { g, e, w } = building(0);
    expect(gateReady(g, e)).toBe(false);
    w.done = 999; g.turn++; processEndgame(g);
    expect(gateReady(g, e)).toBe(true);
    expect(makeView(g, 0).endgame.gateReady).toBe(true);
  });

  it("an enemy at war may sabotage a work in progress", () => {
    const { g, e, w } = building(0);
    const foe = g.empires[1]!;
    e.atWar[1] = g.turn; foe.atWar[0] = g.turn;
    foe.treasury = 1000;
    for (let i = 0; i < 40 && !g.pendingEvents.some((p) => p.eventId === WORK_SABOTAGE_ID); i++) { g.turn++; processEndgame(g); }
    const p = g.pendingEvents.find((x) => x.eventId === WORK_SABOTAGE_ID)!;
    expect(p.empireId).toBe(1);
    expect(describeEvent(g, p).text).toContain(WORK_BY_ID.get(w.workId)!.name);
    const done = w.done;
    resolveEvent(g, p, 0);
    expect(w.done).toBeLessThan(done);
  });
});

describe("work effects", () => {
  function finished(workId: string, raceId = "humans") {
    const g = newGame(settings({ playerRaceId: raceId }));
    meet(g);
    const e = g.empires[0]!;
    g.endgame = { 0: { paths: { feared: 1 }, offered: ["feared"], works: [{ workId, starId: e.capitalStarId, started: 1, done: 99, finished: true, finishedTurn: g.turn, sabotageAt: 999 }] } };
    return { g, e };
  }

  it("the Worldship adds council votes", () => {
    const { g, e } = finished("gw-worldship");
    const base = votesOf(g, e) - endgameVotes(g, e, 1) * 0;
    expect(endgameVotes(g, e, 100)).toBe(30);
    expect(votesOf(g, e)).toBe(base);
  });

  it("a Brood Moon hatches warships at the capital", () => {
    const { g, e } = finished("gw-brood-moon", "kethrak");
    const before = g.fleets.filter((f) => f.empireId === 0).length;
    for (let i = 0; i < 15; i++) { g.turn++; processEndgame(g); }
    expect(g.fleets.filter((f) => f.empireId === 0).length).toBe(before + 1);
    expect(g.fleets.at(-1)!.starId).toBe(e.capitalStarId);
  });

  it("the Sundering Engine cracks an enemy world its main fleet sits over", () => {
    const { g, e } = finished("gw-sundering-engine");
    const foe = g.empires[1]!;
    e.atWar[1] = g.turn; foe.atWar[0] = g.turn;
    const target = foe.capitalStarId;
    const other = g.stars.find((x) => x.planet && !g.colonies[x.id])!;
    g.colonies[other.id] = { ...structuredClone(g.colonies[target]!), starId: other.id, isCapital: false };
    const s = g.stars[target]!;
    g.fleets.push({ id: g.nextFleetId++, empireId: 0, ships: { [Object.keys(g.fleets.find((f) => f.empireId === 0)!.ships)[0]!]: 50 }, x: s.x, y: s.y, starId: target, destStarId: null });
    g.pendingEvents = [];
    processEndgame(g);
    const p = g.pendingEvents.find((x) => x.eventId === CRACK_EVENT_ID)!;
    expect(p.colonyStarId).toBe(target);
    const rel = relation(g.empires[2]!, e);
    resolveEvent(g, p, 0);
    expect(g.colonies[target]).toBeUndefined();
    expect(foe.capitalStarId).not.toBe(target);
    expect(relation(g.empires[2]!, e)).toBeLessThan(rel);
  });
});

it("old saves (version 36) load", () => {
  const old = JSON.parse(serialize(newGame(settings()))) as GameState;
  old.version = 36;
  expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
});
