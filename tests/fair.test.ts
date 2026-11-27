// The Grand Fair of the Wandering Stars (src/engine/fair.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { describeEvent, resolveEvent } from "../src/engine/events";
import { FAIR_PREFIX, FESTIVAL_COST, HIRE_COST, processFair, residentTroupes } from "../src/engine/fair";
import type { GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 77, size: "small", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});
/** Run until the fair asks empire `id`. */
function untilAsked(g: GameState, id: number) {
  for (; g.turn < 600; g.turn++) {
    processFair(g);
    const p = g.pendingEvents.find((x) => x.empireId === id && x.eventId.startsWith(FAIR_PREFIX));
    if (p) return p;
    g.pendingEvents = g.pendingEvents.filter((x) => !x.eventId.startsWith(FAIR_PREFIX));
  }
  throw new Error("the fair never came");
}
const which = (p: { eventId: string }, want: 0 | 1 | 2) => (want - Number(p.eventId.slice(FAIR_PREFIX.length)) + 3) % 3;

describe("the Grand Fair", () => {
  it("tours every capital in a season and names its troupes", () => {
    const g = newGame(settings());
    g.turn = 1;
    const seen = new Set<number>();
    for (const e of g.empires) { const p = untilAsked(g, e.id); seen.add(e.id); expect(describeEvent(g, p).text).not.toMatch(/[{}]/); expect(describeEvent(g, p).text).toContain("the star troupe"); g.pendingEvents = []; }
    expect(seen.size).toBe(g.empires.length);
    expect(g.events.some((x) => /Grand Fair .* has arrived at/.test(x.text))).toBe(true);
  });

  it("a grand festival costs BC and every troupe gives a gift", () => {
    const g = newGame(settings()); g.turn = 1;
    const p = untilAsked(g, 0);
    const e = g.empires[0]!; e.treasury = 1000; const culture = e.culture;
    const rp = () => Object.values(e.research.progress).reduce((a, b) => a + b, 0);
    const before = { money: e.treasury, research: rp(), culture };
    resolveEvent(g, p, which(p, 0));
    expect(e.treasury !== before.money - FESTIVAL_COST || e.culture > culture || rp() > before.research).toBe(true);
    expect(g.fair!.festivals[0]).toBe(1);
  });

  it("hiring the star troupe makes it stay and pay every turn", () => {
    const g = newGame(settings()); g.turn = 1;
    const p = untilAsked(g, 0);
    const e = g.empires[0]!; e.treasury = 1000;
    resolveEvent(g, p, which(p, 2));
    expect(e.treasury).toBe(1000 - HIRE_COST);
    expect(residentTroupes(g, e).length).toBe(1);
    const snap = JSON.stringify([e.treasury, e.culture, e.research.progress]);
    g.turn++; processFair(g);
    expect(JSON.stringify([e.treasury, e.culture, e.research.progress])).not.toBe(snap);
  });

  it("is the same for the same seed", () => {
    const a = newGame(settings()), b = newGame(settings());
    a.turn = b.turn = 1;
    untilAsked(a, 0); untilAsked(b, 0);
    expect(a.fair).toEqual(b.fair);
  });
});
