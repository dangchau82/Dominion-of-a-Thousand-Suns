// A buried government secret (src/engine/secrets.ts, data/buriedSecret.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { SECRET_CHAIN } from "../src/engine/data/buriedSecret";
import { resolveEvent } from "../src/engine/events";
import { MIN_COLONIES, processSecrets, secretTurn } from "../src/engine/secrets";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";
import { makeView } from "../src/engine/view";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 73, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

function grown(colonies = MIN_COLONIES): GameState {
  const g = newGame(settings());
  const home = g.colonies[g.empires[0]!.capitalStarId]!;
  const free = g.stars.filter((s) => s.planet && !g.colonies[s.id]);
  for (let i = 0; i < colonies - 1; i++) g.colonies[free[i]!.id] = { ...home, starId: free[i]!.id, isCapital: false, population: 8, buildings: [], foundedTurn: 10 + i };
  g.turn = secretTurn(g, g.empires[0]!);
  return g;
}

function play(g: GameState, fork: number): string[] {
  const seen: string[] = [];
  for (let t = 0; t < 120; t++) {
    processSecrets(g);
    for (const p of g.pendingEvents.filter((x) => x.empireId === 0)) {
      seen.push(p.eventId.split("-")[1]!);
      const ev = makeView(g, 0).pendingEvents.find((x) => x.id === p.id)!;
      expect(ev.title + ev.text).not.toMatch(/\{/);
      resolveEvent(g, p, p.eventId === "secret-3-the-choice" ? fork : 0);
    }
    g.turn++;
  }
  return seen;
}

describe("a buried government secret", () => {
  it("waits for four colonies and its seed-based turn, without random draws", () => {
    const small = grown(MIN_COLONIES - 1);
    processSecrets(small);
    expect(small.pendingEvents.some((p) => p.empireId === 0 && p.eventId.startsWith("secret-"))).toBe(false);
    const g = grown();
    const rng = JSON.stringify(g.rng);
    processSecrets(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
    expect(g.pendingEvents.some((p) => p.empireId === 0 && p.eventId === SECRET_CHAIN[0]!.id)).toBe(true);
  });

  it("revealing runs 1-2-3-4o-5o-6", () => expect(play(grown(), 0)).toEqual(["1", "2", "3", "4o", "5o", "6"]));
  it("burying runs 1-2-3-4c-5c-6", () => expect(play(grown(), 1)).toEqual(["1", "2", "3", "4c", "5c", "6"]));
  it("using it runs 1-2-3-4n-6", () => expect(play(grown(), 2)).toEqual(["1", "2", "3", "4n", "6"]));

  it("all its effects are event-sized", () => {
    for (const ev of SECRET_CHAIN) for (const c of ev.choices) for (const fx of c.effects) {
      if ("amount" in fx) expect(Math.abs(fx.amount), ev.id).toBeLessThanOrEqual(fx.kind === "research" ? 400 : fx.kind === "money" ? 300 : 160);
    }
  });

  it("old saves (version 24) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 24;
    delete old.secrets;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
