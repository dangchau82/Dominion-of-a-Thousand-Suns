// The hybrid derelict (src/engine/hybridDerelict.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { resolveEvent } from "../src/engine/events";
import { exploreStar } from "../src/engine/knowledge";
import { DERELICT_EVENT_ID, DERELICT_FROM, DERELICT_WINDOW, processHybridDerelict, REGROWTH_EVENT_ID, REGROWTH_TURNS } from "../src/engine/hybridDerelict";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 95, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

function found(): GameState {
  const g = newGame(settings());
  for (const s of g.stars.filter((x) => !g.colonies[x.id]).slice(0, 5)) exploreStar(g, g.empires[0]!, s, false);
  for (g.turn = 1; g.turn < 300 && !g.pendingEvents.some((p) => p.empireId === 0 && p.eventId === DERELICT_EVENT_ID); g.turn++) processHybridDerelict(g);
  return g;
}
const ev = (g: GameState, id: string) => g.pendingEvents.find((p) => p.empireId === 0 && p.eventId === id);

describe("the hybrid derelict", () => {
  it("is found once, in the seed's window, at an explored star", () => {
    const g = found();
    const t = g.turn - 1;
    expect(t).toBeGreaterThanOrEqual(DERELICT_FROM);
    expect(t).toBeLessThan(DERELICT_FROM + DERELICT_WINDOW);
    expect(g.empires[0]!.knowledge[ev(g, DERELICT_EVENT_ID)!.starId!]?.explored).toBe(true);
  });

  it("stripping its weapons gives weapons research and ends the story", () => {
    const g = found();
    const e = g.empires[0]!;
    const w = e.research.progress.weapons;
    resolveEvent(g, ev(g, DERELICT_EVENT_ID)!, 0);
    expect(e.research.progress.weapons).toBeGreaterThan(w);
    for (let i = 0; i < 100; i++) { g.turn++; processHybridDerelict(g); }
    expect(ev(g, REGROWTH_EVENT_ID)).toBeUndefined();
  });

  it("boarding leads to the regrowth chapter REGROWTH_TURNS later, at the same star", () => {
    const g = found();
    const star = ev(g, DERELICT_EVENT_ID)!.starId;
    resolveEvent(g, ev(g, DERELICT_EVENT_ID)!, 2);
    for (let i = 0; i < REGROWTH_TURNS - 1; i++) { g.turn++; processHybridDerelict(g); }
    expect(ev(g, REGROWTH_EVENT_ID)).toBeUndefined();
    g.turn++;
    processHybridDerelict(g);
    expect(ev(g, REGROWTH_EVENT_ID)?.starId).toBe(star);
    const e = g.empires[0]!;
    const c = e.research.progress.construction;
    resolveEvent(g, ev(g, REGROWTH_EVENT_ID)!, 0);
    expect(e.research.progress.construction).toBeGreaterThan(c);
  });

  it("old saves (version 33) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 33;
    delete old.hybridDerelict;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
