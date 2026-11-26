// Android leaders (src/engine/legends.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { empireBonus, hireLeader } from "../src/engine/civ";
import { SYNTHETIC_TRAITS } from "../src/engine/data/legends";
import { LEADER_KINDS, type LeaderKind } from "../src/engine/data/buildings";
import { processSynthetics, synthOfferTurn, syntheticTrait, SYNTH_EVENTS } from "../src/engine/legends";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";
import { makeView } from "../src/engine/view";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 66, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

function offered(): GameState {
  const g = newGame(settings());
  const e = g.empires[0]!;
  e.leaderOffer = null;
  g.turn = synthOfferTurn(g, e);
  processSynthetics(g);
  return g;
}

describe("android leaders", () => {
  it("each empire gets one android offer, in turns 60-159, with no salary and a synthetic trait, without random draws", () => {
    const g = newGame(settings());
    for (const e of g.empires) {
      expect(synthOfferTurn(g, e)).toBeGreaterThanOrEqual(60);
      expect(synthOfferTurn(g, e)).toBeLessThan(160);
    }
    const e = g.empires[0]!;
    e.leaderOffer = null;
    g.turn = synthOfferTurn(g, e);
    const rng = JSON.stringify(g.rng);
    processSynthetics(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
    const l = e.leaderOffer!;
    expect(l.salary).toBe(0);
    expect(syntheticTrait(l)).not.toBeNull();
    // Only once.
    e.leaderOffer = null;
    g.turn += 5;
    processSynthetics(g);
    expect(e.leaderOffer).toBeNull();
  });

  it("waits for a free leader slot", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    g.turn = synthOfferTurn(g, e);
    e.leaderOffer = { id: 999, name: "Someone", kind: Object.keys(LEADER_KINDS)[0] as LeaderKind, level: 1, cost: 1, salary: 1, offerUntil: g.turn + 5 };
    processSynthetics(g);
    expect(e.leaderOffer!.id).toBe(999);
    expect(g.synthetics!.offeredTo).not.toContain(e.id);
  });

  it("a hired android's trait counts in empire bonuses, bonus and catch", () => {
    const g = offered();
    const e = g.empires[0]!;
    const t = syntheticTrait(e.leaderOffer!)!;
    e.treasury = 99999;
    const before = empireBonus(e);
    expect(hireLeader(g, e)).toBeNull();
    const after = empireBonus(e);
    for (const [k, v] of Object.entries({ ...t.upside, ...t.downside })) {
      expect(after[k as keyof typeof after]).not.toBe(before[k as keyof typeof before]);
      expect(v).not.toBe(0);
    }
  });

  it("hidden agendas bring up an android event now and then, filled in", () => {
    const g = offered();
    const e = g.empires[0]!;
    e.treasury = 99999;
    hireLeader(g, e);
    let agendas = 0;
    for (let t = 0; t < 3000; t++) {
      g.turn++;
      processSynthetics(g);
      const p = g.pendingEvents.find((x) => x.empireId === 0 && SYNTH_EVENTS.some((s) => s.id === x.eventId));
      if (p) {
        agendas++;
        const ev = makeView(g, 0).pendingEvents.find((x) => x.id === p.id)!;
        expect(ev.text).not.toMatch(/\{/);
        g.pendingEvents = [];
      }
    }
    expect(agendas).toBeGreaterThan(0);
    expect(SYNTHETIC_TRAITS.every((t) => t.agendaChance > 0 && t.agendaChance < 0.03)).toBe(true);
  });

  it("old saves (version 19) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 19;
    delete old.synthetics;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
