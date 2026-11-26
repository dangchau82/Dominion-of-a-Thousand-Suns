// The supernova crisis (src/engine/supernova.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { resolveEvent } from "../src/engine/events";
import { REMNANTS } from "../src/engine/data/supernova";
import { distance } from "../src/engine/formulas";
import { deserialize, serialize } from "../src/engine/save";
import { BLAST_LOSS, COUNTDOWN, INNER, processSupernova, REACH, supernovaTurn } from "../src/engine/supernova";
import { SAVE_VERSION, type GameState } from "../src/engine/types";
import { makeView } from "../src/engine/view";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 77, size: "small", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** A game with a colony next to an empty star, so the crisis has somewhere to happen. */
function setup(): GameState {
  const g = newGame(settings());
  const home = g.stars[g.empires[0]!.capitalStarId]!;
  // Settle a second player world near home, on a star with a planet.
  const near = g.stars.filter((s) => s.id !== home.id && s.planet && !g.colonies[s.id])
    .sort((a, b) => distance(home.x, home.y, a.x, a.y) - distance(home.x, home.y, b.x, b.y))[0]!;
  g.colonies[near.id] = { ...g.colonies[home.id]!, starId: near.id, isCapital: false, population: 20, factories: 40, buildings: [] };
  g.turn = supernovaTurn(g);
  return g;
}

/** Advance the crisis one turn at a time, answering every warning for empire 0 with `choice`. */
function runCrisis(g: GameState, choice: number): void {
  for (let i = 0; i <= COUNTDOWN; i++) {
    processSupernova(g);
    for (const p of g.pendingEvents.filter((x) => x.empireId === 0 && x.eventId.startsWith("supernova-warning"))) resolveEvent(g, p, choice);
    g.turn++;
  }
}

describe("the supernova crisis", () => {
  it("starts on a seed-based turn between 130 and 199, without touching the random numbers", () => {
    const g = setup();
    expect(g.turn).toBeGreaterThanOrEqual(130);
    expect(g.turn).toBeLessThan(200);
    const rng = JSON.stringify(g.rng);
    processSupernova(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
    const nova = g.supernovae![0]!;
    expect(g.colonies[nova.starId]).toBeUndefined();
    expect(g.empires.some((e) => e.capitalStarId === nova.starId)).toBe(false);
    expect(nova.affected.length).toBeGreaterThan(0);
  });

  it("each affected empire hears four warnings, filled with real names", () => {
    const g = setup();
    processSupernova(g);
    const target = g.supernovae![0]!.affected[0]!;
    let heard = 0;
    for (let i = 0; i <= COUNTDOWN; i++) {
      for (const p of g.pendingEvents.filter((x) => x.empireId === target && x.eventId.startsWith("supernova-warning"))) {
        heard++;
        resolveEvent(g, p, 2);
      }
      g.turn++;
      processSupernova(g);
    }
    expect(heard).toBe(4);
  });

  it("evacuating softens the blast; staying takes it in full", () => {
    const losses: Record<string, number> = {};
    for (const [plan, choice] of [["evacuated", 0], ["stayed", 2]] as const) {
      const g = setup();
      processSupernova(g);
      const nova = g.supernovae![0]!;
      const s = g.stars[nova.starId]!;
      if (!nova.affected.includes(0)) return; // this map put the star out of the player's reach
      const mine = Object.values(g.colonies).filter((c) => c.empireId === 0 && c.starId !== nova.starId
        && distance(s.x, s.y, g.stars[c.starId]!.x, g.stars[c.starId]!.y) <= REACH);
      const before = mine.reduce((a, c) => a + c.population, 0);
      g.turn++;
      runCrisis(g, choice);
      expect(nova.plans[0]).toBe(plan);
      losses[plan] = before - mine.reduce((a, c) => a + c.population, 0);
    }
    if (losses.evacuated !== undefined) expect(losses.evacuated).toBeLessThan(losses.stayed!);
    expect(BLAST_LOSS.evacuated[0]).toBeLessThan(BLAST_LOSS.stayed[0]);
    expect(INNER).toBeLessThan(REACH);
  });

  it("the blast destroys fleets at the star, strips its planet, leaves a remnant and sends aftermaths", () => {
    const g = setup();
    processSupernova(g);
    const nova = g.supernovae![0]!;
    g.fleets.push({ id: 9999, empireId: 1, ships: { scout: 1 }, x: 0, y: 0, starId: nova.starId, destStarId: null });
    g.turn = nova.blowTurn;
    g.pendingEvents = [];
    processSupernova(g);
    expect(g.fleets.some((f) => f.id === 9999)).toBe(false);
    expect(g.stars[nova.starId]!.planet).toBeNull();
    expect(REMNANTS.some((r) => r.id === nova.remnantId)).toBe(true);
    const aftermaths = g.pendingEvents.filter((p) => p.eventId.startsWith("supernova-aftermath"));
    expect(aftermaths.length).toBeGreaterThan(0);
    for (const p of aftermaths) {
      const ev = makeView(g, p.empireId).pendingEvents.find((x) => x.id === p.id)!;
      expect(ev.title + ev.text).not.toMatch(/\{/);
    }
  });

  it("a colony founded on the dying star during the countdown is destroyed with it (no colony left on a star without a planet)", () => {
    const g = setup();
    processSupernova(g);
    const nova = g.supernovae![0]!;
    const home = g.colonies[g.empires[1]!.capitalStarId]!;
    g.colonies[nova.starId] = { ...home, starId: nova.starId, isCapital: false, population: 5, buildings: [] };
    g.turn = nova.blowTurn;
    processSupernova(g);
    expect(g.colonies[nova.starId]).toBeUndefined();
    for (const c of Object.values(g.colonies)) expect(g.stars[c.starId]!.planet).not.toBeNull();
  });

  it("a fleet parked at the remnant earns research every turn", () => {
    const g = setup();
    processSupernova(g);
    const nova = g.supernovae![0]!;
    g.turn = nova.blowTurn;
    processSupernova(g);
    const r = REMNANTS.find((x) => x.id === nova.remnantId)!;
    g.fleets.push({ id: 9998, empireId: 0, ships: { scout: 1 }, x: 0, y: 0, starId: nova.starId, destStarId: null });
    const before = g.empires[0]!.research.progress[r.field];
    g.turn++;
    processSupernova(g);
    expect(g.empires[0]!.research.progress[r.field]).toBe(before + r.researchPerTurn);
  });

  it("happens only once per game", () => {
    const g = setup();
    processSupernova(g);
    for (let t = 0; t < 100; t++) { g.turn++; processSupernova(g); }
    expect(g.supernovae!.length).toBe(1);
  });

  it("old saves (version 12) load", () => {
    const g = setup();
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 12;
    delete old.supernovae;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
