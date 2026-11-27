// The Open Secret (src/engine/openSecret.ts): a runaway leader's discoveries leak to the empires behind it.
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { colonyBudget } from "../src/engine/turn";
import { makeView } from "../src/engine/view";
import { deserialize, serialize } from "../src/engine/save";
import { TECHS } from "../src/engine/data/techs";
import {
  OPEN_SECRET_COPY, OPEN_SECRET_PRODUCTION, OPEN_SECRET_START,
  openSecretCostFactor, openSecretGap, processOpenSecret, runawayLeader,
} from "../src/engine/openSecret";
import type { GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 311, size: "small", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** Four empires; empire 1 is made huge, empire 0 tiny. */
function runaway(turn = OPEN_SECRET_START + 10): GameState {
  const g = newGame(settings());
  g.turn = turn;
  for (const c of Object.values(g.colonies)) c.population = c.empireId === 1 ? 400 : c.empireId === 0 ? 10 : 60;
  return g;
}

describe("the Open Secret", () => {
  it("stays quiet before the late game", () => {
    expect(runawayLeader(runaway(OPEN_SECRET_START - 1))).toBeNull();
  });

  it("stays quiet when nobody is far ahead", () => {
    const g = runaway();
    for (const c of Object.values(g.colonies)) c.population = 100;
    expect(runawayLeader(g)).toBeNull();
  });

  it("names the runaway leader and scales the gap by how far behind each empire is", () => {
    const g = runaway();
    const r = runawayLeader(g)!;
    expect(r.leaderId).toBe(1);
    expect(r.gaps[1]).toBeUndefined();
    expect(r.gaps[0]).toBeCloseTo(1 - 10 / 400, 5);
    expect(r.gaps[2]).toBeCloseTo(1 - 60 / 400, 5);
    expect(r.gaps[0]).toBeGreaterThan(r.gaps[2]!);
  });

  it("posts news once when the leak starts and once when it ends", () => {
    const g = runaway();
    processOpenSecret(g);
    processOpenSecret(g);
    expect(g.events.filter((e) => e.text.startsWith("The Open Secret")).length).toBe(1);
    expect(g.openSecret?.leaderId).toBe(1);
    for (const c of Object.values(g.colonies)) c.population = 100;
    processOpenSecret(g);
    expect(g.openSecret).toBeUndefined();
    expect(g.events.some((e) => e.text.includes("trickle"))).toBe(true);
  });

  it("makes the leader's known techs cheaper for those behind, never for the leader", () => {
    const g = runaway();
    const known = TECHS.find((t) => t.tier >= 3)!.id;
    const unknown = TECHS.find((t) => t.tier >= 3 && t.id !== known)!.id;
    g.empires[1]!.research.known.push(known);
    processOpenSecret(g);
    expect(openSecretCostFactor(g, 0, known)).toBeCloseTo(1 - OPEN_SECRET_COPY * openSecretGap(g, 0), 5);
    expect(openSecretCostFactor(g, 0, unknown)).toBe(1);
    expect(openSecretCostFactor(g, 1, known)).toBe(1);
  });

  it("raises the output of empires behind, scaled by the gap", () => {
    const g = runaway();
    const mine = Object.values(g.colonies).find((c) => c.empireId === 0)!;
    const before = colonyBudget(g, mine).production;
    processOpenSecret(g);
    const after = colonyBudget(g, mine).production;
    expect(after / before).toBeCloseTo(1 + OPEN_SECRET_PRODUCTION * openSecretGap(g, 0) / (1 + 0), 1);
    expect(after).toBeGreaterThan(before);
    const theirs = Object.values(g.colonies).find((c) => c.empireId === 1)!;
    const lb = colonyBudget(g, theirs).production;
    expect(lb).toBe(colonyBudget(g, theirs).production);
  });

  it("shows in the view and survives a save", () => {
    const g = runaway();
    processOpenSecret(g);
    const v = makeView(g, 0);
    expect(v.openSecret.leaderId).toBe(1);
    expect(v.openSecret.gap).toBeGreaterThan(0.9);
    const back = deserialize(serialize(g));
    expect(back.openSecret).toEqual(g.openSecret);
  });
});
