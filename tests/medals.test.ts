// Medals (src/engine/medals.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { medalsOf, processMedals } from "../src/engine/medals";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 121, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});
const ids = (g: GameState) => medalsOf(g, g.empires[0]!).map((m) => m.id);

describe("medals", () => {
  it("are earned once, announced, and only for the player", () => {
    const g = newGame(settings());
    const home = g.colonies[g.empires[0]!.capitalStarId]!;
    const s = g.stars.find((x) => x.planet && !g.colonies[x.id])!;
    g.colonies[s.id] = { ...structuredClone(home), starId: s.id, isCapital: false, buildQueue: null };
    processMedals(g); processMedals(g);
    expect(ids(g).filter((x) => x === "m-settler")).toHaveLength(1);
    expect(g.events.some((x) => x.empireId === 0 && x.text.startsWith("🏅 Medal earned"))).toBe(true);
    expect(g.medals!.earned[1]).toBeUndefined();
  });

  it("a peaceful win earns Peace in Our Time; any war rules it out", () => {
    const g = newGame(settings());
    processMedals(g);
    g.winner = { empireId: 0, kind: "culture", turn: g.turn } as never;
    processMedals(g);
    expect(ids(g)).toContain("m-peaceful-win");
    const h = newGame(settings());
    h.empires[0]!.atWar[1] = 1;
    processMedals(h);
    h.empires[0]!.atWar = {};
    h.winner = { empireId: 0, kind: "culture", turn: h.turn } as never;
    processMedals(h);
    expect(ids(h)).not.toContain("m-peaceful-win");
  });

  it("artifacts, heroes and auctions count", () => {
    const g = newGame(settings());
    g.digs = { sites: [], artifacts: { 0: ["a-crown-of-ages"] } };
    g.market = { nextAt: 999, bids: {}, held: 1, history: [{ turn: 5, lot: "x", winner: 0, price: 10 }] };
    processMedals(g);
    expect(ids(g)).toEqual(expect.arrayContaining(["m-legendary-artifact", "m-auction"]));
  });

  it("old saves (version 44) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 44;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
