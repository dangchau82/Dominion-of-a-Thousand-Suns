// The Bounty Guild (src/engine/bountyHunters.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { resolveEvent } from "../src/engine/events";
import { relation } from "../src/engine/diplomacy";
import { BOUNTY_EVENT_ID, FEE, LOST_RESEARCH, MAX_OFFERS, processBountyHunters, QUIET_FEE, STOLEN_BC, WAR_TURNS } from "../src/engine/bountyHunters";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 61, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

function warGame(): GameState {
  const g = newGame(settings());
  g.turn = 40;
  g.empires[0]!.atWar[1] = 40;
  g.empires[1]!.atWar[0] = 40;
  return g;
}
const ev = (g: GameState) => g.pendingEvents.find((p) => p.empireId === 0 && p.eventId === BOUNTY_EVENT_ID);

describe("the Bounty Guild", () => {
  it("offers only after WAR_TURNS of war, naming the enemy", () => {
    const g = warGame();
    processBountyHunters(g);
    expect(ev(g)).toBeUndefined();
    g.turn += WAR_TURNS;
    processBountyHunters(g);
    expect(ev(g)?.rivalId).toBe(1);
  });

  it("no war, no offer", () => {
    const g = newGame(settings());
    g.turn = 200;
    processBountyHunters(g);
    expect(ev(g)).toBeUndefined();
  });

  it("hired openly: the enemy loses money and research and resents us", () => {
    const g = warGame();
    g.turn += WAR_TURNS;
    processBountyHunters(g);
    const [me, them] = [g.empires[0]!, g.empires[1]!];
    me.treasury = 500; them.treasury = 400; them.research.progress.computers = 500;
    const rel = relation(them, me);
    resolveEvent(g, ev(g)!, 0);
    expect(me.treasury).toBe(500 - FEE);
    expect(them.treasury).toBe(400 - STOLEN_BC);
    expect(them.research.progress.computers).toBe(500 - LOST_RESEARCH);
    expect(relation(them, me)).toBeLessThan(rel);
  });

  it("hired quietly: costs more, no grudge", () => {
    const g = warGame();
    g.turn += WAR_TURNS;
    processBountyHunters(g);
    const [me, them] = [g.empires[0]!, g.empires[1]!];
    me.treasury = 500;
    const rel = relation(them, me);
    resolveEvent(g, ev(g)!, 1);
    expect(me.treasury).toBe(500 - QUIET_FEE);
    expect(relation(them, me)).toBe(rel);
  });

  it("at most MAX_OFFERS per empire", () => {
    const g = warGame();
    for (let i = 0; i < 400; i++) {
      g.turn++;
      processBountyHunters(g);
      for (const p of g.pendingEvents.filter((x) => x.empireId === 0)) resolveEvent(g, p, 2);
    }
    expect(g.bountyHunters![0]!.offers).toBe(MAX_OFFERS);
  });

  it("old saves (version 30) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 30;
    delete old.bountyHunters;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
