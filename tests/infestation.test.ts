// The alien infestation (src/engine/infestation.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { INFESTATION, INFESTATION_CHAIN } from "../src/engine/data/infestation";
import { resolveEvent } from "../src/engine/events";
import { infestationTurn, NEST_LIFETIME, processInfestation, SPECIMEN_EVENT, SPREAD_EVERY } from "../src/engine/infestation";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";
import { makeView } from "../src/engine/view";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 33, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** A game with several colonies per empire so there is somewhere to start and spread. */
function crowded(): GameState {
  const g = newGame(settings());
  const free = g.stars.filter((s) => s.planet && !g.colonies[s.id]);
  let i = 0;
  for (const e of g.empires) {
    const home = g.colonies[e.capitalStarId]!;
    for (let k = 0; k < 3; k++) {
      const s = free[i++]!;
      g.colonies[s.id] = { ...home, starId: s.id, empireId: e.id, isCapital: false, population: 20, buildings: [], unrest: 0 };
    }
  }
  g.turn = infestationTurn(g);
  return g;
}

function answerAll(g: GameState, choice: number): void {
  for (const p of [...g.pendingEvents]) resolveEvent(g, p, Math.min(choice, (p.eventId === SPECIMEN_EVENT.id ? SPECIMEN_EVENT : INFESTATION_CHAIN.find((e) => e.id === p.eventId) ?? { choices: [1] }).choices.length - 1));
}

describe("the alien infestation", () => {
  it("starts on a seed-based turn (110-189) at an outer colony, without random draws, and the owner is told", () => {
    const g = crowded();
    expect(g.turn).toBeGreaterThanOrEqual(110);
    expect(g.turn).toBeLessThan(190);
    const rng = JSON.stringify(g.rng);
    processInfestation(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
    const nests = Object.keys(g.infestation!.nests).map(Number);
    expect(nests.length).toBe(1);
    expect(g.colonies[nests[0]!]!.isCapital).toBe(false);
    const owner = g.colonies[nests[0]!]!.empireId;
    const ev = makeView(g, owner).pendingEvents.find((p) => p.title === INFESTATION_CHAIN[0]!.title)!;
    expect(ev.text).not.toMatch(/\{/);
  });

  it("an infested colony loses people every turn but never drops below 1", () => {
    const g = crowded();
    processInfestation(g);
    const nest = Number(Object.keys(g.infestation!.nests)[0]);
    const before = g.colonies[nest]!.population;
    g.turn++;
    processInfestation(g);
    expect(g.colonies[nest]!.population).toBe(before - INFESTATION.popLossPerTurn);
    for (let t = 0; t < 40; t++) { g.turn++; processInfestation(g); }
    expect(g.colonies[nest]!.population).toBeGreaterThanOrEqual(1);
  });

  it("spreads every SPREAD_EVERY turns while nobody has chosen how to fight it", () => {
    const g = crowded();
    processInfestation(g);
    g.pendingEvents = []; // nobody answers anything
    for (let t = 0; t < SPREAD_EVERY; t++) { g.turn++; processInfestation(g); g.pendingEvents = []; }
    expect(Object.keys(g.infestation!.nests).length).toBeGreaterThan(1);
  });

  it("answering the chain to the end clears the empire's colonies and makes it immune", () => {
    const g = crowded();
    processInfestation(g);
    const owner = g.colonies[Number(Object.keys(g.infestation!.nests)[0])]!.empireId;
    for (let t = 0; t < 120 && !g.infestation!.empires[owner]!.finished; t++) {
      answerAll(g, 2);
      g.turn++;
      processInfestation(g);
    }
    expect(g.infestation!.empires[owner]!.finished).toBe(true);
    g.turn++;
    processInfestation(g);
    expect(Object.keys(g.infestation!.nests).map(Number).filter((id) => g.colonies[id]?.empireId === owner)).toEqual([]);
  });

  it("the specimen deal is offered once, after event 3", () => {
    const g = crowded();
    processInfestation(g);
    let offers = 0;
    for (let t = 0; t < 120; t++) {
      offers += g.pendingEvents.filter((p) => p.eventId === SPECIMEN_EVENT.id).length;
      answerAll(g, 2);
      g.turn++;
      processInfestation(g);
    }
    expect(offers).toBe(1);
  });

  it("nests burn out after NEST_LIFETIME turns even if nobody acts", () => {
    const g = crowded();
    processInfestation(g);
    const first = Number(Object.keys(g.infestation!.nests)[0]);
    for (let t = 0; t <= NEST_LIFETIME; t++) { g.turn++; processInfestation(g); g.pendingEvents = []; }
    expect(g.infestation!.nests[first]).toBeUndefined();
  });

  it("old saves (version 16) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 16;
    delete old.infestation;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
