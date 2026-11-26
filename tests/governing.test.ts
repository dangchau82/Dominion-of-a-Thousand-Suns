// Governing distance and subject-people votes.
import { describe, expect, it } from "vitest";
import { colonyBudget, newGame, type GameSettings } from "../src/engine";
import { distanceCost, DISTANCE_MAX } from "../src/engine/turn";
import { votesOf, votingPopulation, SUBJECT_VOTE_SHARE } from "../src/engine/victory";
import { distance } from "../src/engine/formulas";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 131, size: "medium", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("governing distance", () => {
  it("is free near the capital, grows with distance, and is capped", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const home = g.colonies[e.capitalStarId]!;
    expect(distanceCost(g, home)).toBe(0);
    const hs = g.stars[e.capitalStarId]!;
    const far = [...g.stars].filter((s) => s.planet && !g.colonies[s.id]).sort((a, b) => distance(hs.x, hs.y, b.x, b.y) - distance(hs.x, hs.y, a.x, a.y))[0]!;
    const c = (g.colonies[far.id] = { ...structuredClone(home), starId: far.id, isCapital: false });
    const d = distance(hs.x, hs.y, far.x, far.y);
    expect(distanceCost(g, c)).toBeCloseTo(Math.min(DISTANCE_MAX, Math.max(0, d - 8) * 0.01));
    const twin = structuredClone(c); twin.starId = e.capitalStarId; // same colony at home: no cost
    expect(colonyBudget(g, c).production).toBeCloseTo(colonyBudget(g, { ...twin, isCapital: true }).production * (1 - distanceCost(g, c)));
  });
});

describe("subject peoples vote at half", () => {
  it("a conquered world's people count half for council votes", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const home = g.colonies[e.capitalStarId]!;
    const own = votingPopulation(g, e);
    const free = [...g.stars].find((s) => s.planet && !g.colonies[s.id])!;
    g.colonies[free.id] = { ...structuredClone(home), starId: free.id, isCapital: false, population: 100, peopleRaceId: "tarkhan" };
    expect(votingPopulation(g, e)).toBeCloseTo(own + 100 * SUBJECT_VOTE_SHARE);
    expect(votesOf(g, e)).toBe(Math.max(1, Math.round((own + 50) / 25)));
  });
});
