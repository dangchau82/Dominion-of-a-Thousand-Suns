// The Travelling Auction (src/engine/market.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { describeEvent, resolveEvent } from "../src/engine/events";
import { AUCTION_TURNS, MARKET_PREFIX, processMarket } from "../src/engine/market";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 113, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});
const bidEv = (g: GameState, id: number) => g.pendingEvents.find((p) => p.empireId === id && p.eventId.startsWith(MARKET_PREFIX))!;
function opened(): GameState {
  const g = newGame(settings());
  for (g.turn = 1; g.turn < 200 && !g.market?.lot; g.turn++) processMarket(g);
  for (const e of g.empires) e.treasury = 5000;
  return g;
}
/** The choice that means a high bid (0), low (1) or none (2) for this empire's event version. */
function choiceFor(g: GameState, id: number, want: 0 | 1 | 2): number {
  const rot = Number(bidEv(g, id).eventId.slice(MARKET_PREFIX.length));
  return (want - rot + 3) % 3;
}

describe("the Travelling Auction", () => {
  it("opens with a named lot and asks every empire to bid", () => {
    const g = opened();
    for (const e of g.empires) expect(bidEv(g, e.id)).toBeDefined();
    const text = describeEvent(g, bidEv(g, 0)).text;
    expect(text).toContain(g.market!.lot!.name);
    expect(text).not.toMatch(/[{}]/);
  });

  it("the highest bid wins and only the winner pays", () => {
    const g = opened();
    const lot = g.market!.lot!;
    resolveEvent(g, bidEv(g, 0), choiceFor(g, 0, 0));
    resolveEvent(g, bidEv(g, 1), choiceFor(g, 1, 1));
    resolveEvent(g, bidEv(g, 2), choiceFor(g, 2, 2));
    g.turn += AUCTION_TURNS; processMarket(g);
    expect(g.empires[0]!.treasury).toBe(5000 - lot.value);
    expect(g.empires[1]!.treasury).toBe(5000);
    expect(g.market!.history.at(-1)!.winner).toBe(0);
  });

  it("a bid that can no longer be paid loses to a lower one", () => {
    const g = opened();
    resolveEvent(g, bidEv(g, 0), choiceFor(g, 0, 0));
    resolveEvent(g, bidEv(g, 1), choiceFor(g, 1, 1));
    g.empires[0]!.treasury = 1;
    g.turn += AUCTION_TURNS; processMarket(g);
    expect(g.market!.history.at(-1)!.winner).toBe(1);
  });

  it("no bids, no sale", () => {
    const g = opened();
    for (const e of g.empires) resolveEvent(g, bidEv(g, e.id), choiceFor(g, e.id, 2));
    g.turn += AUCTION_TURNS; processMarket(g);
    expect(g.market!.history.at(-1)!.winner).toBeNull();
  });

  it("old saves (version 43) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 43;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
