// Invasive critters (src/engine/critters.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { CRITTER_CHAIN } from "../src/engine/data/critters";
import { critterTurn, processCritters, STEP_GAP, STOP_CHOICE } from "../src/engine/critters";
import { resolveEvent } from "../src/engine/events";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";
import { makeView } from "../src/engine/view";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 90, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** Run the critters for empire 0, answering every step with `choice`; returns the steps seen. */
function run(choice: number): { g: GameState; seen: string[] } {
  const g = newGame(settings());
  g.turn = critterTurn(g, g.empires[0]!);
  const seen: string[] = [];
  for (let i = 0; i < 60; i++) {
    processCritters(g);
    for (const p of g.pendingEvents.filter((x) => x.empireId === 0)) {
      if (CRITTER_CHAIN.some((e) => e.id === p.eventId)) seen.push(p.eventId);
      resolveEvent(g, p, Math.min(choice, CRITTER_CHAIN.find((e) => e.id === p.eventId)!.choices.length - 1));
    }
    g.turn++;
  }
  return { g, seen };
}

describe("invasive critters", () => {
  it("arrive once per empire on a seed-based turn (40-159), without random draws", () => {
    const g = newGame(settings());
    for (const e of g.empires) {
      const t = critterTurn(g, e);
      expect(t).toBeGreaterThanOrEqual(40);
      expect(t).toBeLessThan(160);
    }
    g.turn = critterTurn(g, g.empires[0]!);
    const rng = JSON.stringify(g.rng);
    processCritters(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
    const ev = makeView(g, 0).pendingEvents.find((p) => p.title === CRITTER_CHAIN[0]!.title)!;
    expect(ev.text).not.toMatch(/\{/);
  });

  it("left alone, they run all six steps, spaced out", () => {
    const { seen } = run(0);
    expect(seen).toEqual(CRITTER_CHAIN.map((e) => e.id));
  });

  it("the stop answer ends them at the first step", () => {
    const { g, seen } = run(STOP_CHOICE);
    expect(seen).toEqual([CRITTER_CHAIN[0]!.id]);
    expect(g.critters![0]!.over).toBe(true);
  });

  it("steps are at least STEP_GAP turns apart", () => {
    const g = newGame(settings());
    g.turn = critterTurn(g, g.empires[0]!);
    processCritters(g);
    for (const p of g.pendingEvents.filter((x) => x.empireId === 0)) resolveEvent(g, p, 0);
    g.turn += STEP_GAP - 1;
    processCritters(g);
    expect(g.pendingEvents.filter((x) => x.empireId === 0).length).toBe(0);
  });

  it("old saves (version 15) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 15;
    delete old.critters;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
