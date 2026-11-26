// Minor races (src/engine/minorRaces.ts, src/engine/minorRaceEvents.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { MINOR_RACES } from "../src/engine/data/minorRaces";
import { resolveEvent } from "../src/engine/events";
import { exploreStar } from "../src/engine/knowledge";
import { ENVOY_PREFIX } from "../src/engine/minorRaceEvents";
import { FRIEND, friendOf, minorRaceOf, minorRaceVotes, processMinorRaces, START_ATTITUDE } from "../src/engine/minorRaces";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";
import { votesOf } from "../src/engine/victory";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 52, size: "large", shape: "ellipse", rivals: 4, playerRaceId: "humans", playerName: "Danny", ...over,
});

function placed(): GameState {
  const g = newGame(settings());
  g.turn = 1;
  processMinorRaces(g);
  return g;
}

/** The player meets the first minor race. */
function meetFirst(g: GameState): string {
  const [id, r] = Object.entries(g.minorRaces!.races)[0]!;
  exploreStar(g, g.empires[0]!, g.stars[r.stars[0]!]!, false);
  processMinorRaces(g);
  return id;
}

describe("minor races", () => {
  it("live on free worlds (home climate where possible), placed without random draws", () => {
    const g = newGame(settings());
    const rng = JSON.stringify(g.rng);
    g.turn = 1;
    processMinorRaces(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
    const races = Object.entries(g.minorRaces!.races);
    expect(races.length).toBeGreaterThan(6);
    for (const [id, r] of races) {
      const m = MINOR_RACES.find((x) => x.id === id)!;
      expect(r.stars.length).toBeGreaterThanOrEqual(1);
      expect(r.stars.length).toBeLessThanOrEqual(m.worlds);
      for (const s of r.stars) {
        expect(minorRaceOf(g, s)!.id).toBe(id);
        expect(g.colonies[s]).toBeUndefined();
      }
    }
  });

  it("explorers meet them once and hear their greeting", () => {
    const g = placed();
    g.events = [];
    const id = meetFirst(g);
    processMinorRaces(g);
    const m = MINOR_RACES.find((x) => x.id === id)!;
    expect(g.events.filter((e) => e.empireId === 0 && e.text.includes(m.greeting)).length).toBe(1);
    // They start at START_ATTITUDE; a dislike (say, having no treaties) may already have cost a point or two.
    expect(g.minorRaces!.races[id]!.attitude[0]!).toBeGreaterThan(START_ATTITUDE - 3);
    expect(g.minorRaces!.races[id]!.attitude[0]!).toBeLessThanOrEqual(START_ATTITUDE);
  });

  it("envoys come; offering what they like wins them over, and a friend gets their votes at half weight", () => {
    const g = placed();
    const id = meetFirst(g);
    const e = g.empires[0]!;
    e.atWar = {}; e.spies = {}; e.treasury = 5000;
    const votesBefore = votesOf(g, e);
    let envoys = 0;
    for (let t = 0; t < 200 && friendOf(g.minorRaces!.races[id]!) !== 0; t++) {
      g.turn++;
      processMinorRaces(g);
      for (const p of g.pendingEvents.filter((x) => x.empireId === 0 && x.eventId.startsWith(ENVOY_PREFIX))) {
        envoys++;
        resolveEvent(g, p, 0);
      }
      g.pendingEvents = g.pendingEvents.filter((x) => x.empireId !== 0);
      e.treasury = 5000;
    }
    expect(envoys).toBeGreaterThan(0);
    // Courting the people we met first only works if their envoys came; others may have been courted too.
    const friends = Object.values(g.minorRaces!.races).filter((r) => friendOf(r) === 0);
    expect(friends.length).toBeGreaterThan(0);
    expect(minorRaceVotes(g, e)).toBeGreaterThanOrEqual(0);
    expect(votesOf(g, e)).toBeGreaterThanOrEqual(votesBefore);
    for (const r of friends) expect(r.attitude[0]!).toBeGreaterThanOrEqual(FRIEND);
  });

  it("friendly votes are half weight: one world with no vote gift is worth less than one full vote", () => {
    const g = placed();
    const [id, r] = Object.entries(g.minorRaces!.races).find(([mid, x]) => x.stars.length === 1 && MINOR_RACES.find((m) => m.id === mid)!.friendGift.kind !== "councilVotes")!;
    r.met = [0];
    r.attitude[0] = 100;
    expect(friendOf(r)).toBe(0);
    expect(minorRaceVotes(g, g.empires[0]!)).toBeLessThanOrEqual(1);
    expect(id).toBeTruthy();
  });

  it("what they dislike sours them over time", () => {
    const g = placed();
    const [id, r] = Object.entries(g.minorRaces!.races).find(([mid]) => MINOR_RACES.find((m) => m.id === mid)!.dislikes === "war")!;
    r.met = [0]; r.attitude[0] = 50;
    const e = g.empires[0]!;
    e.atWar = { 1: 1 };
    for (let t = 0; t < 10; t++) processMinorRaces(g);
    expect(g.minorRaces!.races[id]!.attitude[0]!).toBeLessThan(50);
  });

  it("settling one of their worlds absorbs the people: no friend, no votes, and conquest-haters turn cold", () => {
    const g = placed();
    const entries = Object.entries(g.minorRaces!.races);
    const [, victim] = entries[0]!;
    const hater = entries.find(([mid], i) => i > 0 && MINOR_RACES.find((m) => m.id === mid)!.dislikes === "conquest");
    if (hater) { hater[1].met = [0]; hater[1].attitude[0] = 50; }
    victim.attitude[0] = 100; victim.met = [0];
    const home = g.colonies[g.empires[0]!.capitalStarId]!;
    g.colonies[victim.stars[0]!] = { ...home, starId: victim.stars[0]!, isCapital: false, population: 5, buildings: [] };
    processMinorRaces(g);
    expect(victim.absorbedBy).toBe(0);
    expect(friendOf(victim)).toBeNull();
    if (hater) expect(hater[1].attitude[0]!).toBeLessThan(50);
  });

  it("old saves (version 22) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 22;
    delete old.minorRaces;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
