// The Crusade (src/engine/crusade.ts) and the story-chain runner (src/engine/chains.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { nextInChain, noteChainAnswer, type ChainProgress } from "../src/engine/chains";
import { CRUSADE_CHAIN } from "../src/engine/data/crusade";
import { resolveEvent } from "../src/engine/events";
import { CHAIN_GAP, crusadeTurn, pilgrimPressure, PRESSURE, processCrusade } from "../src/engine/crusade";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";
import { makeView } from "../src/engine/view";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 50, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** Walk the chain answering the branch point with `fork` and everything else with 0. */
function walk(fork: number): string[] {
  const prog: ChainProgress = { done: [], lastTurn: 0 };
  const seen: string[] = [];
  for (let i = 0; i < 20; i++) {
    const ev = nextInChain(CRUSADE_CHAIN, prog);
    if (!ev) break;
    prog.done.push(ev.id);
    seen.push(ev.id.split("-")[1]!);
    noteChainAnswer(CRUSADE_CHAIN, prog, ev.id, ev.id.startsWith("crusade-4-") ? fork : 0);
  }
  expect(prog.finished).toBe(true);
  return seen;
}

/** A game where the Fold has arrived, with a second, non-capital player colony. */
function arrived(): GameState {
  const g = newGame(settings());
  const home = g.colonies[g.empires[0]!.capitalStarId]!;
  const spot = g.stars.find((s) => s.planet && !g.colonies[s.id])!;
  g.colonies[spot.id] = { ...home, starId: spot.id, isCapital: false, population: 10, buildings: [], unrest: 0 };
  g.turn = crusadeTurn(g);
  return g;
}

describe("story chains", () => {
  it("resisting runs 1-2-3-4-5-6-10", () => expect(walk(0)).toEqual(["1", "2", "3", "4", "5", "6", "10"]));
  it("embracing runs 1-2-3-4-7-8-10", () => expect(walk(1)).toEqual(["1", "2", "3", "4", "7", "8", "10"]));
  it("bargaining runs 1-2-3-4-9-10", () => expect(walk(2)).toEqual(["1", "2", "3", "4", "9", "10"]));
});

describe("the Crusade", () => {
  it("arrives on a seed-based turn (170-219) without random draws, and every empire gets its first event", () => {
    const g = arrived();
    expect(g.turn).toBeGreaterThanOrEqual(170);
    expect(g.turn).toBeLessThan(220);
    const rng = JSON.stringify(g.rng);
    processCrusade(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
    for (const e of g.empires) expect(g.pendingEvents.some((p) => p.empireId === e.id && p.eventId === CRUSADE_CHAIN[0]!.id)).toBe(true);
    const ev = makeView(g, 0).pendingEvents.find((p) => p.title === CRUSADE_CHAIN[0]!.title)!;
    expect(ev.text).not.toMatch(/\{/);
  });

  it("the chain is spaced out and waits while another event is open", () => {
    const g = arrived();
    processCrusade(g);
    const first = g.pendingEvents.filter((p) => p.empireId === 0).length;
    g.turn += CHAIN_GAP;
    processCrusade(g);
    expect(g.pendingEvents.filter((p) => p.empireId === 0).length).toBe(first); // first one still unanswered
    for (const p of g.pendingEvents.filter((x) => x.empireId === 0)) resolveEvent(g, p, 0);
    g.turn += 1;
    processCrusade(g);
    expect(g.pendingEvents.filter((p) => p.empireId === 0).length).toBe(1);
  });

  it("pilgrims stir unrest on outer colonies, not the capital, once the Fold has reached them", () => {
    const g = arrived();
    const e = g.empires[0]!;
    e.goldenAge = false; e.security = 0;
    const outer = Object.values(g.colonies).find((c) => c.empireId === 0 && !c.isCapital)!;
    const capital = g.colonies[e.capitalStarId]!;
    capital.unrest = 0;
    for (let i = 0; i < 40; i++) {
      processCrusade(g);
      for (const p of g.pendingEvents.filter((x) => x.empireId === 0)) resolveEvent(g, p, 0);
      g.turn++;
    }
    const p = pilgrimPressure(g, e);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThanOrEqual(PRESSURE);
    expect(outer.unrest ?? 0).toBeGreaterThan(0);
    expect(capital.unrest ?? 0).toBe(0);
  });

  it("a golden age, strong culture or full security keeps the pilgrims out", () => {
    const g = arrived();
    const e = g.empires[0]!;
    e.security = 0; e.goldenAge = true;
    expect(pilgrimPressure(g, e)).toBe(0);
    e.goldenAge = false; e.security = 10;
    const withSecurity = pilgrimPressure(g, e);
    e.security = 0;
    expect(withSecurity).toBeLessThan(pilgrimPressure(g, e));
    for (const c of Object.values(g.colonies)) if (c.empireId === 0) c.buildings.push(...[]);
    expect(pilgrimPressure(g, e)).toBeLessThanOrEqual(PRESSURE);
  });

  it("the pressure stops once an empire's chain is finished", () => {
    const g = arrived();
    processCrusade(g);
    const prog = g.crusade!.empires[0]!;
    prog.done = CRUSADE_CHAIN.slice(0, 4).map((e) => e.id);
    prog.finished = true;
    const outer = Object.values(g.colonies).find((c) => c.empireId === 0 && !c.isCapital)!;
    outer.unrest = 0;
    g.empires[0]!.goldenAge = false;
    g.turn++;
    processCrusade(g);
    expect(outer.unrest).toBe(0);
  });

  it("old saves (version 14) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 14;
    delete old.crusade;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
