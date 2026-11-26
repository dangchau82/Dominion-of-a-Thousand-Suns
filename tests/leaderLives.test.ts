// Leaders grow with service, retire after their career, and leave a protégé's offer behind.
import { describe, expect, it } from "vitest";
import { newGame } from "../src/engine";
import { LEADER_KINDS } from "../src/engine/data/buildings";
import { processLeaderLives, retireTurn, VETERAN_EVERY, MAX_LEVEL } from "../src/engine/leaderLives";
import type { Leader } from "../src/engine/types";
type LeaderKind = Leader["kind"];

const KIND = Object.keys(LEADER_KINDS)[0] as LeaderKind;
const leader = (over: Partial<Leader> = {}): Leader => ({ id: 5, name: "Velanor", kind: KIND, level: 1, cost: 100, salary: 4, offerUntil: 0, hiredTurn: 0, ...over });
const game = (seed: number) => newGame({ seed, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny" });

describe("leaders' lives", () => {
  it("gain a level every 30 turns of service, up to the cap, with a higher salary", () => {
    const g = game(171);
    const e = g.empires[0]!;
    e.leaders = [leader()];
    g.turn = VETERAN_EVERY;
    processLeaderLives(g);
    expect(e.leaders[0]!.level).toBe(2);
    expect(e.leaders[0]!.salary).toBeGreaterThan(4);
    e.leaders[0]!.level = MAX_LEVEL;
    g.turn = VETERAN_EVERY * 2;
    processLeaderLives(g);
    expect(e.leaders[0]!.level).toBe(MAX_LEVEL);
  });
  it("retire on their fixed turn and a protégé offers to take the post at half price", () => {
    const g = game(172);
    const e = g.empires[0]!;
    const l = leader({ level: 3, hiredTurn: 10 });
    e.leaders = [l]; e.leaderOffer = null;
    g.turn = retireTurn(l);
    processLeaderLives(g);
    expect(e.leaders).toHaveLength(0);
    expect(e.leaderOffer!.kind).toBe(KIND);
    expect(e.leaderOffer!.level).toBe(2);
    expect(g.events.some((x) => x.text.includes("retires"))).toBe(true);
  });
});
