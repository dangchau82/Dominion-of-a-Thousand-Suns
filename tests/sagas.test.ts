// Race sagas (src/engine/sagas.ts), with a small made-up saga for the Terran Accord.
import { beforeAll, describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { describeEvent, resolveEvent } from "../src/engine/events";
import { SAGA_BEATS, SAGA_ENDINGS, type SagaBeat, type SagaChoice } from "../src/engine/data/sagas";
import { ACT_TURN, hasSaga, processSagas, sagaOf } from "../src/engine/sagas";
import { processStorylines } from "../src/engine/storylines";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 21, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});
const choices = (act: number): SagaChoice[] => [
  { label: "Spare them", result: "Mercy.", effects: [{ kind: "culture", amount: 10 }], shift: { mercy: 2 }, sets: act === 3 ? ["spared"] : undefined },
  { label: "Crush them", result: "Fear.", effects: [{ kind: "nothing" }], shift: { mercy: -2 } },
  { label: "Open the gates to {rival}", result: "Trade.", effects: [{ kind: "nothing" }], shift: { openness: 1 } },
];
beforeAll(() => {
  for (let act = 1 as 1 | 2 | 3 | 4; act <= 4; act++) for (const v of ["a", "b", "c"]) {
    SAGA_BEATS.push({ id: `saga-humans-${act}-${v}`, raceId: "humans", act, kind: "act", title: `Act ${act}${v}`, art: "council", text: `Beat ${act}${v} at {colony} near {star}.`, choices: choices(act) } as SagaBeat);
  }
  SAGA_BEATS.push({ id: "saga-humans-branch-return", raceId: "humans", act: 3, kind: "branch", needs: ["spared"], title: "The Spared Return", art: "contact", text: "Those we spared come back.", choices: choices(0) });
  SAGA_BEATS.push({ id: "saga-x-humans-vossari-meet", raceId: "humans", act: 2, kind: "crossover", withRace: "vossari", title: "Strangers", art: "contact", text: "The Vossari.", choices: choices(0) });
  SAGA_ENDINGS.push(
    { id: "saga-humans-end-light", raceId: "humans", needs: { mercy: { min: 4 } }, outcome: "ascension", title: "Into the Light", art: "victory", text: "We chose mercy.", choices: [{ label: "So be it", result: "Light.", effects: [{ kind: "nothing" }] }] },
    { id: "saga-humans-end-dark", raceId: "humans", needs: { mercy: { max: -4 } }, outcome: "fallFromGrace", title: "The Long Dark", art: "crisis", text: "We chose fear.", choices: [{ label: "So be it", result: "Dark.", effects: [{ kind: "nothing" }] }] },
    { id: "saga-humans-end-plain", raceId: "humans", outcome: "goldenAge", title: "The Middle Road", art: "council", text: "Neither.", choices: [{ label: "So be it", result: "On we go.", effects: [{ kind: "nothing" }] }] },
  );
});

/** Play empire 0's saga to the end, always answering `pick`. */
function playOut(g: GameState, pick: number): void {
  for (g.turn = 1; g.turn < 400; g.turn++) {
    processSagas(g);
    for (const p of g.pendingEvents.filter((x) => x.empireId === 0)) {
      expect(describeEvent(g, p).text).not.toMatch(/[{}]/);
      expect(describeEvent(g, p).subtitle).toMatch(/saga/);
      resolveEvent(g, p, Math.min(pick, describeEvent(g, p).choices.length - 1));
    }
    g.pendingEvents = [];
    if (sagaOf(g, g.empires[0]!)?.outcome) return;
  }
}

describe("race sagas", () => {
  it("only races with saga writing have one, and their old storyline steps aside", () => {
    expect(hasSaga("humans")).toBe(true);
    expect(hasSaga("nyx")).toBe(false);
    const g = newGame(settings());
    g.turn = 300; processStorylines(g);
    expect(g.pendingEvents.some((p) => p.empireId === 0)).toBe(false);
  });

  it("the seed picks the acts, so different games tell different stories; the same seed tells the same one", () => {
    const pickOf = (seed: number) => { const g = newGame(settings({ seed })); g.turn = ACT_TURN[0] + 20; processSagas(g); return sagaOf(g, g.empires[0]!)!.picks.join(); };
    expect(pickOf(21)).toBe(pickOf(21));
    expect(new Set([21, 22, 23, 24, 25, 26].map(pickOf)).size).toBeGreaterThan(1);
  });

  it("mercy all the way: the flag opens the branch, and the merciful ending plays and pays", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const before = e.research.progress.weapons;
    playOut(g, 0);
    const run = sagaOf(g, e)!;
    expect(run.acts).toBe(4);
    expect(run.flags).toContain("spared");
    expect(run.played).toContain("saga-humans-branch-return");
    expect(run.scores.mercy).toBeGreaterThanOrEqual(4);
    expect(run.ending).toBe("saga-humans-end-light");
    expect(e.research.progress.weapons).toBeGreaterThan(before);
    expect(g.events.some((x) => x.kind === "saga" && x.text.includes("Into the Light"))).toBe(true);
  });

  it("cruelty all the way: no branch, and the dark ending", () => {
    const g = newGame(settings());
    playOut(g, 1);
    const run = sagaOf(g, g.empires[0]!)!;
    expect(run.played).not.toContain("saga-humans-branch-return");
    expect(run.ending).toBe("saga-humans-end-dark");
    expect(run.culturePerTurn).toBeGreaterThan(0);
  });

  it("neither: the fallback ending", () => {
    const g = newGame(settings());
    playOut(g, 2);
    expect(sagaOf(g, g.empires[0]!)!.ending).toBe("saga-humans-end-plain");
    expect(g.empires[0]!.goldenAgeUntil).toBeGreaterThan(g.turn);
  });

  it("a crossover plays only after we meet the race it names", () => {
    const g = newGame(settings({ rivals: 3 }));
    const vossari = g.empires.find((x) => x.raceId === "vossari");
    playOut(g, 2);
    const met = vossari && g.empires[0]!.contacts.includes(vossari.id);
    expect(sagaOf(g, g.empires[0]!)!.played.includes("saga-x-humans-vossari-meet")).toBe(!!met);
  });

  it("old saves (version 48) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 48;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
