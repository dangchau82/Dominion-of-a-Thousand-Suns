// Native peoples (src/engine/natives.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { resolveEvent } from "../src/engine/events";
import { exploreStar } from "../src/engine/knowledge";
import { AFTERMATH_DELAY, nativesOf, processNatives, UPLIFT } from "../src/engine/natives";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";
import { makeView } from "../src/engine/view";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 27, size: "large", shape: "ellipse", rivals: 4, playerRaceId: "humans", playerName: "Danny", ...over,
});

function placed(): GameState {
  const g = newGame(settings());
  g.turn = 1;
  processNatives(g);
  return g;
}

function settleNatives(g: GameState) {
  const s = g.stars.find((x) => nativesOf(x))!;
  const home = g.colonies[g.empires[0]!.capitalStarId]!;
  g.colonies[s.id] = { ...home, starId: s.id, isCapital: false, population: 5, buildings: [] };
  return s;
}

describe("native peoples", () => {
  it("live on free worlds of their own climate, never home worlds, placed without random draws", () => {
    const g = newGame(settings());
    const rng = JSON.stringify(g.rng);
    g.turn = 1;
    processNatives(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
    const worlds = g.stars.filter((s) => nativesOf(s));
    expect(worlds.length).toBeGreaterThan(0);
    for (const s of worlds) {
      expect(s.planet!.climate).toBe(nativesOf(s)!.climate);
      expect(g.empires.some((e) => e.capitalStarId === s.id)).toBe(false);
    }
    expect(new Set(worlds.map((s) => nativesOf(s)!.id)).size).toBe(worlds.length);
  });

  it("explorers see who lives there, once", () => {
    const g = placed();
    const s = g.stars.find((x) => nativesOf(x))!;
    exploreStar(g, g.empires[0]!, s, false);
    g.events = [];
    processNatives(g);
    processNatives(g);
    expect(g.events.filter((e) => e.empireId === 0 && e.starId === s.id).length).toBe(1);
  });

  it("the first settler meets them once, with the contact event filled in", () => {
    const g = placed();
    const s = settleNatives(g);
    processNatives(g);
    processNatives(g);
    const contacts = g.pendingEvents.filter((p) => p.eventId === nativesOf(s)!.contact.id);
    expect(contacts.length).toBe(1);
    const ev = makeView(g, 0).pendingEvents.find((x) => x.id === contacts[0]!.id)!;
    expect(ev.text).not.toMatch(/\{/);
  });

  it("uplifting brings the aftermath 30 turns later; leaving them be does not", () => {
    for (const choice of [UPLIFT, 1]) {
      const g = placed();
      const s = settleNatives(g);
      processNatives(g);
      resolveEvent(g, g.pendingEvents.find((p) => p.eventId === nativesOf(s)!.contact.id)!, choice);
      g.turn += AFTERMATH_DELAY;
      processNatives(g);
      const after = g.pendingEvents.filter((p) => p.eventId === nativesOf(s)!.aftermath.id).length;
      expect(after).toBe(choice === UPLIFT ? 1 : 0);
    }
  });

  it("old saves (version 20) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 20;
    delete old.natives;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
