// Battle recordings, veteran fleets, admirals and great battles (battleLog.ts, battleStories.ts).
import { describe, expect, it } from "vitest";
import { designsOf, newGame, type GameSettings, type GameState } from "../src/engine";
import { BattleRecorder, latestBattle, packShot, unpackShot } from "../src/engine/battleLog";
import { GREAT_BATTLE_SHIPS, processVeterans, rankOf, veteranEdge } from "../src/engine/battleStories";
import { fight, resolveCombat, shipUnit } from "../src/engine/combat";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 31337, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});
function war(g: GameState) {
  g.empires[0]!.contacts.push(1); g.empires[1]!.contacts.push(0);
  g.empires[0]!.atWar[1] = g.turn; g.empires[1]!.atWar[0] = g.turn;
}
const design = (g: GameState, id: number, name: string) => designsOf(g, id).find((d) => d.name === name)!;
function park(g: GameState, empireId: number, starId: number, ships: Record<string, number>): number {
  const s = g.stars[starId]!;
  const id = g.nextFleetId++;
  g.fleets.push({ id, empireId, ships, x: s.x, y: s.y, starId, destStarId: null });
  return id;
}
/** An empty star nobody owns. */
const openStar = (g: GameState) => g.stars.find((s) => !g.colonies[s.id])!.id;

describe("battle recordings", () => {
  it("pack and unpack a shot", () => {
    const s = { round: 7, shooter: 12, target: 99, kind: "torpedo" as const, result: "kill" as const, damage: 37 };
    expect(unpackShot(packShot(s))).toEqual(s);
  });

  it("recording never changes the fight", () => {
    const run = (record: boolean) => {
      const g = newGame(settings());
      const units = [shipUnit(g, 0, g.empires[0]!, design(g, 0, "Destroyer"), 8), shipUnit(g, 1, g.empires[1]!, design(g, 1, "Destroyer"), 8)];
      const rec = new BattleRecorder(units);
      const rounds = fight(g, units, record ? rec.shot : undefined);
      return JSON.stringify([rounds, units.map((u) => u.count), g.rng]);
    };
    expect(run(true)).toBe(run(false));
  });

  it("a player battle is stored shot by shot, and the kills match the losses", () => {
    const g = newGame(settings());
    war(g);
    const star = openStar(g);
    park(g, 0, star, { [design(g, 0, "Destroyer").id]: 6 });
    park(g, 1, star, { [design(g, 1, "Destroyer").id]: 6 });
    resolveCombat(g);
    const b = latestBattle(g, star)!;
    expect(b).toBeDefined();
    expect(b.shots.length).toBeGreaterThan(0);
    const kills = b.shots.map(unpackShot).filter((s) => s.result === "kill").length;
    const lost = b.units.reduce((a, u) => a + u.start - u.end, 0);
    expect(kills).toBe(lost);
  });
});

describe("veteran fleets and admirals", () => {
  function winMany(times: number) {
    const g = newGame(settings());
    war(g);
    const star = openStar(g);
    const mine = park(g, 0, star, { [design(g, 0, "Destroyer").id]: 30 });
    for (let i = 0; i < times; i++) {
      g.turn++;
      park(g, 1, star, { [design(g, 1, "Fighter").id]: 2 });
      resolveCombat(g);
      processVeterans(g);
    }
    return { g, mine, star };
  }

  it("a fleet that keeps winning earns a name, then an admiral", () => {
    const { g, mine } = winMany(2);
    expect(g.veterans![mine]!.name).toBeUndefined();
    const two = winMany(3);
    expect(rankOf(two.g.veterans![two.mine])).toBe(1);
    expect(two.g.veterans![two.mine]!.name).toBeTruthy();
    const five = winMany(7);
    expect(rankOf(five.g.veterans![five.mine])).toBe(2);
    expect(five.g.veterans![five.mine]!.admiral?.name).toBeTruthy();
    expect(g.veterans![mine]!.victories).toBe(2);
  });

  it("names and admirals come from the seed, not random draws", () => {
    const a = winMany(7), b = winMany(7);
    expect(a.g.veterans![a.mine]).toEqual(b.g.veterans![b.mine]);
  });

  it("a famous fleet's ships fight better", () => {
    const { g, mine } = winMany(3);
    const f = g.fleets.find((x) => x.id === mine)!;
    const plain = shipUnit(g, 0, g.empires[0]!, design(g, 0, "Destroyer"), 5);
    const u = shipUnit(g, 0, g.empires[0]!, design(g, 0, "Destroyer"), 5);
    veteranEdge(g, [f], [u]);
    expect(u.attack).toBe(plain.attack + 1);
  });

  it("losing a famous fleet makes galaxy history", () => {
    const { g, mine, star } = winMany(3);
    g.fleets.find((x) => x.id === mine)!.ships = { [design(g, 0, "Fighter").id]: 1 };
    park(g, 1, star, { [design(g, 1, "Destroyer").id]: 30 });
    g.turn++;
    resolveCombat(g);
    expect(g.veterans![mine]).toBeUndefined();
    expect(g.events.some((e) => e.kind === "saga" && /were destroyed/.test(e.text))).toBe(true);
  });

  it("the record follows the ships when the fleet merges into another", () => {
    const { g, mine, star } = winMany(3);
    const v = g.veterans![mine]!;
    g.fleets = g.fleets.filter((f) => f.id !== mine);
    const heir = park(g, 0, star, { [design(g, 0, "Destroyer").id]: 40 });
    processVeterans(g);
    expect(g.veterans![heir]).toBe(v);
  });
});

describe("great battles", () => {
  it(`a battle with ${GREAT_BATTLE_SHIPS}+ ships is named and enters the history`, () => {
    const g = newGame(settings());
    war(g);
    const star = openStar(g);
    park(g, 0, star, { [design(g, 0, "Destroyer").id]: 45 });
    park(g, 1, star, { [design(g, 1, "Destroyer").id]: 45 });
    resolveCombat(g);
    expect(g.greatBattles?.length).toBe(1);
    expect(g.greatBattles![0]!.name).toMatch(new RegExp(`of ${g.stars[star]!.name}$`));
    expect(g.events.some((e) => e.kind === "saga" && e.text.includes(g.stars[star]!.name))).toBe(true);
  });

  it("one-sided slaughters are not", () => {
    const g = newGame(settings());
    war(g);
    const star = openStar(g);
    park(g, 0, star, { [design(g, 0, "Destroyer").id]: 60 });
    park(g, 1, star, { [design(g, 1, "Fighter").id]: 2 });
    resolveCombat(g);
    expect(g.greatBattles ?? []).toHaveLength(0);
  });
});

it("old saves (version 34) load", () => {
  const old = JSON.parse(serialize(newGame(settings()))) as GameState;
  old.version = 34;
  expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
});
