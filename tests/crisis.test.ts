// The Hollow Tide (src/engine/crisis.ts).
import { describe, expect, it } from "vitest";
import { designsOf, newGame, type GameSettings } from "../src/engine";
import { relation } from "../src/engine/diplomacy";
import { CRISIS_TURN, processCrisis, SLAYER_CULTURE, TIDE_GROUPS, TIDE_TURNS, tideShips } from "../src/engine/crisis";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 131, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});
function arrived(): GameState {
  const g = newGame(settings());
  g.turn = CRISIS_TURN;
  for (const a of g.empires) for (const b of g.empires) if (a !== b && !a.contacts.includes(b.id)) a.contacts.push(b.id);
  processCrisis(g);
  return g;
}

describe("the Hollow Tide", () => {
  it("does not come before turn 260, or once someone has won", () => {
    const g = newGame(settings());
    g.turn = CRISIS_TURN - 1; processCrisis(g);
    expect(g.crisis).toBeUndefined();
    g.turn = CRISIS_TURN; g.winner = { empireId: 0, kind: "culture", turn: 1 } as never; processCrisis(g);
    expect(g.crisis).toBeUndefined();
  });

  it("arrives at the rim, warms every empire to the others, and aims at the nearest colony", () => {
    const before = newGame(settings());
    const rel = relation(before.empires[1]!, before.empires[0]!);
    const g = arrived();
    expect(g.crisis!.targetStarId).not.toBeNull();
    expect(relation(g.empires[1]!, g.empires[0]!)).toBeGreaterThan(rel);
    expect(g.events.some((x) => x.kind === "saga" && /Hollow Tide/.test(x.text))).toBe(true);
  });

  it("wrecks undefended colonies and moves on; leaves after TIDE_TURNS", () => {
    const g = arrived();
    const first = g.crisis!.targetStarId!;
    const pop = g.colonies[first]!.population;
    g.colonies[first]!.missileBases = 0;
    g.fleets = g.fleets.filter((f) => f.starId !== first);
    for (let i = 0; i < 3; i++) { g.turn++; processCrisis(g); }
    expect(g.crisis!.wrecked).toContain(first);
    expect(g.colonies[first]!.population).toBeLessThan(pop);
    g.turn = g.crisis!.startTurn + TIDE_TURNS; processCrisis(g);
    expect(g.crisis!.over).toBe("gone");
  });

  it("a huge fleet at its star destroys it; the slayer gets the glory", () => {
    const g = arrived();
    const c = g.crisis!;
    c.left = [2, 0, 0];
    // Early-game test ships can't pierce Tide shields; late-game fleets can. Lower them for the test.
    const shield = TIDE_GROUPS[0]!.shield, armor = TIDE_GROUPS[0]!.armor;
    TIDE_GROUPS[0]!.shield = 0; TIDE_GROUPS[0]!.armor = 0;
    const big = designsOf(g, 0).filter((d) => d.role === "warship" && d.weapons.length).sort((a, b) => b.cost - a.cost)[0]!;
    const s = g.stars[c.starId]!;
    g.fleets.push({ id: g.nextFleetId++, empireId: 0, ships: { [big.id]: 60 }, x: s.x, y: s.y, starId: s.id, destStarId: null });
    const culture = g.empires[0]!.culture;
    for (let i = 0; i < 6 && !c.over; i++) { g.turn++; processCrisis(g); }
    TIDE_GROUPS[0]!.shield = shield; TIDE_GROUPS[0]!.armor = armor;
    expect(c.over).toBe("destroyed");
    expect(c.slayer).toBe(0);
    expect(tideShips(c)).toBe(0);
    expect(g.empires[0]!.culture).toBeGreaterThanOrEqual(culture + SLAYER_CULTURE);
  });

  it("old saves (version 45) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 45;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
