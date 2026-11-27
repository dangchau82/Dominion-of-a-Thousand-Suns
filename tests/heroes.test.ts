// Heroes (src/engine/heroes.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { EVENT_BY_ID, resolveEvent } from "../src/engine/events";
import { ABILITY_EVERY, FIRST_OFFER, heroesOf, LEVEL_EVERY, MAX_HEROES, processHeroes, SPY_EVERY } from "../src/engine/heroes";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 101, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});
const offer = (g: GameState) => g.pendingEvents.find((p) => p.empireId === 0 && p.eventId.startsWith("hero-offer:"));
function offered(): GameState {
  const g = newGame(settings());
  for (g.turn = 1; g.turn < 200 && !offer(g); g.turn++) processHeroes(g);
  return g;
}

describe("heroes", () => {
  it("are offered from about turn 40, and the offer events exist", () => {
    const g = offered();
    expect(g.turn - 1).toBeGreaterThanOrEqual(FIRST_OFFER);
    expect(EVENT_BY_ID.get(offer(g)!.eventId)).toBeDefined();
  });

  it("each choice gives a different role", () => {
    const roles = [0, 1, 2].map((c) => { const g = offered(); resolveEvent(g, offer(g)!, c); return heroesOf(g, g.empires[0]!)[0]!.role; });
    expect(new Set(roles).size).toBe(3);
  });

  it("a governor runs our busiest world and pays BC; a festival comes every ABILITY_EVERY turns", () => {
    for (let c = 0; c < 3; c++) {
      const g = offered();
      resolveEvent(g, offer(g)!, c);
      const h = heroesOf(g, g.empires[0]!)[0]!;
      if (h.role !== "governor") continue;
      expect(h.starId).toBe(g.empires[0]!.capitalStarId);
      const e = g.empires[0]!, money = e.treasury, culture = e.culture;
      g.pendingEvents = [];
      for (let i = 0; i < ABILITY_EVERY; i++) { g.turn++; processHeroes(g); g.pendingEvents = []; }
      expect(e.treasury).toBeGreaterThan(money);
      expect(e.culture).toBeGreaterThan(culture);
      return;
    }
    throw new Error("no governor choice");
  });

  it("a spymaster steals research from the strongest rival we know", () => {
    for (let c = 0; c < 3; c++) {
      const g = offered();
      resolveEvent(g, offer(g)!, c);
      const h = heroesOf(g, g.empires[0]!)[0]!;
      if (h.role !== "spymaster") continue;
      g.empires[0]!.contacts.push(1);
      const e = g.empires[0]!;
      const total = () => Object.values(e.research.progress).reduce((a, b) => a + b, 0);
      const before = total();
      for (let i = 0; i < SPY_EVERY; i++) { g.turn++; processHeroes(g); g.pendingEvents = []; }
      expect(total()).toBeGreaterThan(before);
      return;
    }
    throw new Error("no spymaster choice");
  });

  it("heroes level up, and at most MAX_HEROES serve; the old die with a saga line", () => {
    const g = offered();
    const e = g.empires[0]!;
    for (let i = 0; i < 400; i++) {
      for (const p of g.pendingEvents.filter((x) => x.empireId === 0)) resolveEvent(g, p, 0);
      g.pendingEvents = g.pendingEvents.filter((x) => x.empireId !== 0);
      g.turn++; processHeroes(g);
      expect(heroesOf(g, e).length).toBeLessThanOrEqual(MAX_HEROES);
      if (i === LEVEL_EVERY + 1) expect(heroesOf(g, e)[0]!.level).toBeGreaterThanOrEqual(2);
    }
    expect(g.heroes!.fallen.length).toBeGreaterThan(0);
    expect(g.events.some((x) => x.kind === "saga" && /old age/.test(x.text))).toBe(true);
  });

  it("old saves (version 42) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 42;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
