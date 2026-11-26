// Wandering tech-mages (src/engine/techMages.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { resolveEvent } from "../src/engine/events";
import { deserialize, serialize } from "../src/engine/save";
import { MAGES_EVENT_ID, mageOffer, MAX_VISITS, processTechMages, VISIT_EVERY } from "../src/engine/techMages";
import { tech } from "../src/engine/tech";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 37, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

function visited(): GameState {
  const g = newGame(settings());
  for (g.turn = 1; g.turn < 120 && !g.pendingEvents.some((p) => p.empireId === 0 && p.eventId === MAGES_EVENT_ID); g.turn++) processTechMages(g);
  return g;
}

describe("wandering tech-mages", () => {
  it("visit around turn 60-99 with an unknown, researchable secret and a price in the news, without random draws", () => {
    const g = newGame(settings());
    const rng = JSON.stringify(g.rng);
    let turn = 0;
    for (g.turn = 1; g.turn < 120 && !turn; g.turn++) {
      processTechMages(g);
      if (g.pendingEvents.some((p) => p.empireId === 0 && p.eventId === MAGES_EVENT_ID)) turn = g.turn;
    }
    expect(JSON.stringify(g.rng)).toBe(rng);
    expect(turn).toBeGreaterThanOrEqual(60);
    expect(turn).toBeLessThan(100);
    const offer = mageOffer(g, 0)!;
    expect(g.empires[0]!.research.known).not.toContain(offer.techId);
    expect(g.events.some((e) => e.empireId === 0 && e.text.includes(`${offer.price} BC`))).toBe(true);
  });

  it("paying teaches the secret and costs the price", () => {
    const g = visited();
    const e = g.empires[0]!;
    const offer = mageOffer(g, 0)!;
    e.treasury = offer.price + 50;
    resolveEvent(g, g.pendingEvents.find((p) => p.empireId === 0 && p.eventId === MAGES_EVENT_ID)!, 0);
    expect(e.research.known).toContain(offer.techId);
    expect(e.treasury).toBe(50);
  });

  it("a favour costs culture instead; too poor to pay means no secret", () => {
    const g = visited();
    const e = g.empires[0]!;
    const offer = mageOffer(g, 0)!;
    e.culture = offer.culture + 10;
    resolveEvent(g, g.pendingEvents.find((p) => p.empireId === 0 && p.eventId === MAGES_EVENT_ID)!, 1);
    expect(e.research.known).toContain(offer.techId);
    expect(e.culture).toBe(10);
    const g2 = visited();
    g2.empires[0]!.treasury = 0;
    const o2 = mageOffer(g2, 0)!;
    resolveEvent(g2, g2.pendingEvents.find((p) => p.empireId === 0 && p.eventId === MAGES_EVENT_ID)!, 0);
    expect(g2.empires[0]!.research.known).not.toContain(o2.techId);
    expect(tech(o2.techId).tier).toBeGreaterThan(0);
  });

  it("come at most MAX_VISITS times, VISIT_EVERY turns apart", () => {
    const g = newGame(settings());
    const turns: number[] = [];
    for (g.turn = 1; g.turn < 60 + VISIT_EVERY * (MAX_VISITS + 2); g.turn++) {
      processTechMages(g);
      for (const p of g.pendingEvents.filter((x) => x.empireId === 0 && x.eventId === MAGES_EVENT_ID)) { turns.push(g.turn); resolveEvent(g, p, 2); }
    }
    expect(turns.length).toBe(MAX_VISITS);
    for (let i = 1; i < turns.length; i++) expect(turns[i]! - turns[i - 1]!).toBeGreaterThanOrEqual(VISIT_EVERY);
  });

  it("old saves (version 27) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 27;
    delete old.techMages;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
