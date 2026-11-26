// Race storylines in play (src/engine/storylines.ts).
import { describe, expect, it } from "vitest";
import { endTurn, newGame, type GameSettings } from "../src/engine";
import { resolveEvent } from "../src/engine/events";
import { deserialize, serialize } from "../src/engine/save";
import { ALL_STORY_CHAPTERS, processStorylines, STORY_BY_ID, STORY_FALLBACK, STORY_GAP } from "../src/engine/storylines";
import { RACES } from "../src/engine/data/races";
import { SAVE_VERSION, type GameState } from "../src/engine/types";
import { makeView } from "../src/engine/view";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 21, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "tarkhan", playerName: "Danny", ...over,
});

/** Run the story director alone, answering every story chapter with `choice` right away. */
function playStory(g: GameState, empireId: number, choice: number, untilTurn: number): string[] {
  const seen: string[] = [];
  for (; g.turn <= untilTurn; g.turn++) {
    processStorylines(g);
    for (const p of g.pendingEvents.filter((x) => x.empireId === empireId)) {
      if (STORY_BY_ID.has(p.eventId)) seen.push(p.eventId);
      resolveEvent(g, p, choice);
    }
  }
  return seen;
}

describe("race storylines in play", () => {
  it("every race has all six chapters, and every chapter text resolves", () => {
    for (const r of RACES) {
      const mine = ALL_STORY_CHAPTERS.filter((c) => c.raceId === r.id).map((c) => String(c.chapter)).sort();
      expect(mine, r.id).toEqual(["1", "2", "3", "4", "5A", "5B"]);
    }
  });

  it("chapters come in order, spaced out, and fork A leads to ending 5A", () => {
    const g = newGame(settings());
    const seen = playStory(g, 0, 0, STORY_FALLBACK["5A"] + 40);
    expect(seen.map((id) => String(STORY_BY_ID.get(id)!.chapter))).toEqual(["1", "2", "3", "4", "5A"]);
    expect(g.empires[0]!.story!.fork).toBe("A");
    const turns = g.empires[0]!.story!.played.length;
    expect(turns).toBe(5);
  });

  it("fork B leads to ending 5B", () => {
    const g = newGame(settings());
    const seen = playStory(g, 0, 1, STORY_FALLBACK["5B"] + 40);
    expect(String(STORY_BY_ID.get(seen.at(-1)!)!.chapter)).toBe("5B");
    expect(g.empires[0]!.story!.fork).toBe("B");
  });

  it("a story chapter shows to the player with its label and real names, never raw placeholders", () => {
    const g = newGame(settings());
    g.turn = 40;
    processStorylines(g);
    const ev = makeView(g, 0).pendingEvents[0]!;
    expect(ev.subtitle).toBe("Your people's story: chapter 1 of 5");
    expect(ev.text).not.toMatch(/\{/);
  });

  it("waits while another event is open, and keeps a gap between chapters", () => {
    const g = newGame(settings());
    g.turn = 40;
    processStorylines(g);
    const first = g.pendingEvents.length;
    g.turn = 41;
    processStorylines(g); // chapter 1 still unanswered: nothing new
    expect(g.pendingEvents.length).toBe(first);
    for (const p of [...g.pendingEvents]) resolveEvent(g, p, 0);
    g.turn = 40 + STORY_GAP - 1;
    processStorylines(g);
    expect(g.pendingEvents.filter((p) => p.empireId === 0).length).toBe(0);
  });

  it("uses no random draws, so a seed plays the same with stories in it", () => {
    const g = newGame(settings());
    g.turn = 40;
    const rng = JSON.stringify(g.rng);
    processStorylines(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
  });

  it("old saves (version 11) load and their empires start the story from chapter 1", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 11;
    for (const e of old.empires) delete e.story;
    const loaded = deserialize(JSON.stringify(old));
    expect(loaded.version).toBe(SAVE_VERSION);
    loaded.turn = 40;
    processStorylines(loaded);
    expect(loaded.empires[0]!.story!.played).toEqual(["1"]);
  });

  it("whole AI games stay deterministic with stories", () => {
    const run = () => {
      const g = newGame(settings({ seed: 5 }));
      for (const e of g.empires) e.isPlayer = false;
      for (let t = 0; t < 120; t++) endTurn(g);
      return JSON.stringify(g);
    };
    expect(run()).toBe(run());
  });
});
