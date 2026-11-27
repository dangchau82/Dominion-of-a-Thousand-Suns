// Dig sites and artifacts (src/engine/digSites.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { describeEvent, resolveEvent } from "../src/engine/events";
import { ARTIFACT_BY_ID, DIG_REWARDS } from "../src/engine/data/digSites";
import { artifactsOf, DIG_TURNS, processDigSites } from "../src/engine/digSites";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 99, size: "medium", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** Empire 0 settles the first dig site. */
function settled(): { g: GameState; star: number } {
  const g = newGame(settings());
  processDigSites(g);
  const site = g.digs!.sites[0]!;
  const home = g.colonies[g.empires[0]!.capitalStarId]!;
  g.colonies[site.starId] = { ...structuredClone(home), starId: site.starId, isCapital: false, buildQueue: null, population: 10 };
  g.pendingEvents = [];
  return { g, star: site.starId };
}
const ev = (g: GameState) => g.pendingEvents.find((p) => p.empireId === 0 && p.eventId.startsWith("dig:"));

describe("dig sites", () => {
  it("are placed from the seed on free worlds, the same every time", () => {
    const a = newGame(settings()), b = newGame(settings());
    processDigSites(a); processDigSites(b);
    expect(a.digs!.sites.length).toBeGreaterThanOrEqual(2);
    expect(a.digs!.sites).toEqual(b.digs!.sites);
    for (const s of a.digs!.sites) expect(a.colonies[s.starId]).toBeUndefined();
  });

  it("settling a site offers the first level, with no unfilled text", () => {
    const { g, star } = settled();
    g.turn++; processDigSites(g);
    const p = ev(g)!;
    expect(p.starId).toBe(star);
    expect(describeEvent(g, p).text).not.toMatch(/[{}]/);
  });

  it("digging through all three levels pays out and gives an artifact that pays every turn", () => {
    const { g } = settled();
    const e = g.empires[0]!;
    const site = g.digs!.sites[0]!;
    for (let level = 0; level < 3; level++) {
      for (let i = 0; i <= DIG_TURNS && !ev(g); i++) { g.turn++; processDigSites(g); }
      resolveEvent(g, ev(g)!, 0);
    }
    expect(site.stage).toBe(3);
    const arts = artifactsOf(g, e);
    expect(arts.length).toBeGreaterThan(0);
    const a = arts[0]!;
    const before = { bc: e.treasury, c: e.culture, r: a.research ? e.research.progress[a.research.field] : 0 };
    g.turn++; processDigSites(g);
    if (a.money) expect(e.treasury).toBeGreaterThan(before.bc);
    if (a.research) expect(e.research.progress[a.research.field]).toBeGreaterThan(before.r);
    expect(g.events.some((x) => x.kind === "saga" && /very bottom/.test(x.text))).toBe(true);
  });

  it("sealing or selling ends the dig", () => {
    const { g } = settled();
    const e = g.empires[0]!;
    g.turn++; processDigSites(g);
    const money = e.treasury;
    resolveEvent(g, ev(g)!, 2);
    expect(e.treasury).toBeGreaterThan(money);
    expect(g.digs!.sites[0]!.closed).toBe(true);
    g.pendingEvents = [];
    for (let i = 0; i < 30; i++) { g.turn++; processDigSites(g); }
    expect(ev(g)).toBeUndefined();
  });

  it("every site kind's artifacts exist", () => {
    for (const r of Object.values(DIG_REWARDS)) for (const id of r.artifact) expect(ARTIFACT_BY_ID.get(id)).toBeDefined();
  });

  it("old saves (version 41) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 41;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
