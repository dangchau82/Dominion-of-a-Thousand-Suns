// Leader traits: written by Gemini (coding job 2, 2026-11-25), checked by Claude.
import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, newGame, type GameSettings } from "../src/engine";
import { empireBonus, processCivilization } from "../src/engine/civ";
import { LEADER_TRAITS } from "../src/engine/data/leaderTraits";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type Empire, type GameState } from "../src/engine/types";

const TRAIT_IDS = new Set(LEADER_TRAITS.map((t) => t.id));

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 404,
  size: "small",
  shape: "ellipse",
  rivals: 2,
  playerRaceId: "humans",
  playerName: "Danny",
  ...over,
});

function createLeaderOfferOnTurn(seed: number, startTurn = 11): { state: GameState; empire: Empire } {
  const state = newGame(settings({ seed }));
  const empire = state.empires[0]!;
  empire.leaderOffer = null;
  empire.leaders = [];
  state.turn = startTurn;
  // Advance turns until a leader offer appears; state.rng stays deterministic per seed.
  for (let i = 0; i < 120 && !empire.leaderOffer; i++) {
    processCivilization(state);
    if (!empire.leaderOffer) state.turn++;
  }
  return { state, empire };
}

describe("leader personality traits", () => {
  it("rolls a valid LEADER_TRAITS id on every new leader offer", () => {
    const { empire } = createLeaderOfferOnTurn(12345, 11);
    expect(empire.leaderOffer).not.toBeNull();
    expect(empire.leaderOffer?.trait).toBeDefined();
    expect(TRAIT_IDS.has(empire.leaderOffer!.trait!)).toBe(true);
  });

  it("applies both upside and downside once per hired leader without scaling by level", () => {
    const trait = LEADER_TRAITS.find((t) => t.id === "iron-nerves")!;
    const gWithout = newGame(settings({ seed: 77 }));
    const eWithout = gWithout.empires[0]!;
    eWithout.leaders = [
      { id: 1, name: "Kaelen", kind: "admiral", level: 3, cost: 100, salary: 4, offerUntil: 20 },
    ];
    const baseBonus = empireBonus(eWithout);

    const gWith = newGame(settings({ seed: 77 }));
    const eWith = gWith.empires[0]!;
    eWith.leaders = [
      { id: 1, name: "Kaelen", kind: "admiral", level: 3, cost: 100, salary: 4, offerUntil: 20, trait: trait.id },
    ];
    const traitedBonus = empireBonus(eWith);

    // Level 3 admiral already gives +1.5 attack; adding Iron Nerves adds +1 attack (not +3) and -8 relations.
    expect(traitedBonus.attack - baseBonus.attack).toBeCloseTo(trait.upside.attack ?? 0);
    expect(traitedBonus.relations - baseBonus.relations).toBeCloseTo(trait.downside.relations ?? 0);
  });

  it("loads a version-10 save with a traitless leader and preserves its level bonus", () => {
    const g = newGame(settings({ seed: 314 }));
    const e = g.empires[0]!;
    e.leaders = [
      { id: 7, name: "Vaelen", kind: "scientist", level: 2, cost: 120, salary: 3, offerUntil: 15 },
    ];
    const expectedResearch = empireBonus(e).research;

    const v10Payload = JSON.parse(serialize(g)) as GameState;
    v10Payload.version = 10;
    delete v10Payload.empires[0]!.leaders[0]!.trait;

    const loaded = deserialize(JSON.stringify(v10Payload));
    expect(loaded.version).toBe(SAVE_VERSION);
    expect(loaded.empires[0]!.leaders[0]!.trait).toBeUndefined();
    expect(empireBonus(loaded.empires[0]!).research).toBeCloseTo(expectedResearch);
  });

  it("produces the exact same leader and trait twice for the same seed", () => {
    const first = createLeaderOfferOnTurn(98765, 11);
    const second = createLeaderOfferOnTurn(98765, 11);

    expect(first.empire.leaderOffer).not.toBeNull();
    expect(first.empire.leaderOffer).toEqual(second.empire.leaderOffer);

    // Also verify hiring and advancing a turn remains deterministic with the same seed.
    first.empire.treasury = 9999;
    second.empire.treasury = 9999;
    expect(applyCommand(first.state, 0, { type: "hireLeader" }).ok).toBe(true);
    expect(applyCommand(second.state, 0, { type: "hireLeader" }).ok).toBe(true);
    endTurn(first.state);
    endTurn(second.state);
    expect(first.empire.leaders).toEqual(second.empire.leaders);
  });
});