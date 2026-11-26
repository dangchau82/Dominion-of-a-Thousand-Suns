// Conquest victory: hold most of the galaxy's original home worlds, your own among them.
import { describe, expect, it } from "vitest";
import { makeView, newGame, type GameSettings } from "../src/engine";
import { checkVictory, homeWorldsHeld, homeWorldsNeeded } from "../src/engine/victory";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 91, size: "medium", shape: "ellipse", rivals: 5, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("conquest victory", () => {
  it("needs more than half the home worlds, and counts what each empire holds", () => {
    const g = newGame(settings());
    expect(g.homeStars).toHaveLength(6);
    expect(homeWorldsNeeded(g)).toBe(4);
    expect(homeWorldsHeld(g, g.empires[0]!)).toBe(1);
    const v = makeView(g, 0);
    expect(v.homeWorldsNeeded).toBe(4);
    expect(v.standings.find((s) => s.id === 0)!.homeWorlds).toBe(1);
  });
  it("warns the galaxy one short, then wins on the next home world", () => {
    const g = newGame(settings());
    const take = (i: number) => { g.colonies[g.homeStars![i]!]!.empireId = 0; };
    take(1); take(2);
    checkVictory(g);
    expect(g.winner).toBeNull();
    expect(g.events.filter((e) => e.text.includes("One more and they rule by conquest"))).toHaveLength(1);
    checkVictory(g);
    expect(g.events.filter((e) => e.text.includes("One more and they rule by conquest"))).toHaveLength(1);
    take(3);
    checkVictory(g);
    expect(g.winner).toMatchObject({ empireId: 0, kind: "conquest" });
  });
  it("does not count for an empire that has lost its own home world", () => {
    const g = newGame(settings());
    for (const i of [1, 2, 3, 4]) g.colonies[g.homeStars![i]!]!.empireId = 0;
    g.colonies[g.homeStars![0]!]!.empireId = 5;
    checkVictory(g);
    expect(g.winner).toBeNull();
  });
  it("old saves without the record keep the last-one-standing rule", () => {
    const g = newGame(settings());
    delete g.homeStars;
    for (const i of [1, 2, 3, 4]) g.colonies[Object.values(g.colonies).find((c) => c.empireId === i)!.starId]!.empireId = 0;
    checkVictory(g);
    expect(g.winner).toBeNull();
  });
});
