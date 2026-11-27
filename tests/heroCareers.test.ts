// Hero careers, traits, and epic artifacts (heroes.ts, data/heroCareers.ts, data/digSites.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { describeEvent, EVENT_BY_ID, resolveEvent } from "../src/engine/events";
import { CROSSROADS_PREFIX, heroesOf, heroGround, heroTitle, LEVEL_EVERY, processHeroes, type Hero } from "../src/engine/heroes";
import { ARTIFACTS } from "../src/engine/data/digSites";
import { BRANCHES, TRAIT_BY_ID } from "../src/engine/data/heroCareers";
import type { GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 101, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});
/** A game where empire 0 has a hero of this role, from a real offer. */
function withHero(role: Hero["role"]): GameState {
  for (let seed = 101; seed < 140; seed++) {
    const g = newGame(settings({ seed }));
    for (g.turn = 1; g.turn < 200; g.turn++) {
      processHeroes(g);
      const p = g.pendingEvents.find((x) => x.empireId === 0 && x.eventId.startsWith("hero-offer:"));
      if (!p) continue;
      const def = EVENT_BY_ID.get(p.eventId)!;
      const c = def.choices.findIndex((ch) => ch.label.toLowerCase().includes(role));
      if (c < 0) break;
      resolveEvent(g, p, c);
      g.pendingEvents = [];
      return g;
    }
  }
  throw new Error(`no ${role} offer`);
}
function serveUntilCrossroads(g: GameState) {
  for (let i = 0; i < LEVEL_EVERY * 3; i++) {
    g.turn++; processHeroes(g);
    const p = g.pendingEvents.find((x) => x.empireId === 0 && x.eventId.startsWith(CROSSROADS_PREFIX));
    if (p) return p;
    g.pendingEvents = [];
  }
  throw new Error("no crossroads");
}

describe("hero careers and traits", () => {
  it("soldiers can be offered, and every hero joins with a trait", () => {
    const g = withHero("soldier");
    const h = heroesOf(g, g.empires[0]!)[0]!;
    expect(h.role).toBe("soldier");
    expect(h.traits?.length).toBe(1);
    expect(TRAIT_BY_ID.has(h.traits![0]!)).toBe(true);
  });

  it("at level 3 a soldier chooses General or Admiral, and the text names the hero", () => {
    for (const want of ["general", "admiral"] as const) {
      const g = withHero("soldier");
      const p = serveUntilCrossroads(g);
      const h = heroesOf(g, g.empires[0]!)[0]!;
      expect(h.level).toBe(3);
      expect(describeEvent(g, p).text).toContain(h.name);
      expect(describeEvent(g, p).text).not.toMatch(/[{}]/);
      const def = EVENT_BY_ID.get(p.eventId)!;
      const c = def.choices.findIndex((ch) => ch.label.toLowerCase().includes(want));
      resolveEvent(g, p, c);
      expect(h.branch).toBe(want);
      expect(heroTitle(h)).toBe(want === "general" ? "General" : "Admiral");
      expect(h.traits!.length).toBeGreaterThanOrEqual(2);
      if (want === "general") expect(heroGround(g, g.empires[0]!, null)).toBeGreaterThan(0);
    }
  });

  it("every role has two careers, and the highest title comes at level 5", () => {
    for (const role of ["governor", "spymaster", "scientist"] as const) {
      const g = withHero(role);
      const p = serveUntilCrossroads(g);
      resolveEvent(g, p, 0);
      const h = heroesOf(g, g.empires[0]!)[0]!;
      expect(BRANCHES[role].map((b) => b.id)).toContain(h.branch);
      g.pendingEvents = [];
      for (let i = 0; i < LEVEL_EVERY * 2 + 1 && h.level < 5; i++) { g.turn++; processHeroes(g); g.pendingEvents = []; }
      if (g.turn < h.until) {
        expect(h.level).toBe(5);
        expect(heroTitle(h)).toBe(BRANCHES[role].find((b) => b.id === h.branch)!.high);
        expect(g.events.some((x) => x.kind === "saga" && x.text.includes(`raised to ${heroTitle(h)}`))).toBe(true);
      }
    }
  });

  it("epic artifacts exist between rare and legendary", () => {
    expect(ARTIFACTS.filter((a) => a.quality === "epic").length).toBeGreaterThanOrEqual(4);
  });
});
