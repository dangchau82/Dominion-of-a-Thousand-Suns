// Expeditions (src/engine/expeditions.ts, src/engine/expeditionEvents.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { EXPEDITIONS } from "../src/engine/data/expeditions";
import { resolveEvent } from "../src/engine/events";
import { EXPEDITION_PREFIX } from "../src/engine/expeditionEvents";
import { EXPEDITION_EVERY, FIRST_EXPEDITION, processExpeditions } from "../src/engine/expeditions";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";
import { makeView } from "../src/engine/view";
import { exploreStar } from "../src/engine/knowledge";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 58, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

/** A new game where the player's scouts have been out (expeditions need explored, unsettled stars). */
function explored(): GameState {
  const g = newGame(settings());
  for (const s of g.stars.filter((x) => !g.colonies[x.id]).slice(0, 8)) exploreStar(g, g.empires[0]!, s, false);
  return g;
}

function mine(g: GameState) {
  return g.pendingEvents.filter((p) => p.empireId === 0 && p.eventId.startsWith(EXPEDITION_PREFIX));
}

describe("expeditions", () => {
  it("the first one comes around turn 25, at an explored star, with the odds shown and names filled in, no random draws", () => {
    const g = explored();
    const rng = JSON.stringify(g.rng);
    for (g.turn = 1; g.turn <= FIRST_EXPEDITION + 12 && !mine(g).length; g.turn++) processExpeditions(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
    const p = mine(g)[0]!;
    expect(g.empires[0]!.knowledge[p.starId!]?.explored).toBe(true);
    const ev = makeView(g, 0).pendingEvents.find((x) => x.id === p.id)!;
    expect(ev.text).not.toMatch(/\{/);
    expect(ev.choices[0]!.label).toMatch(/% chance it works\)$/);
  });

  it("answering plays out success or failure with its text and effects", () => {
    const g = explored();
    for (g.turn = 1; !mine(g).length && g.turn < 60; g.turn++) processExpeditions(g);
    const p = mine(g)[0]!;
    const x = EXPEDITIONS.find((e) => EXPEDITION_PREFIX + e.id === p.eventId)!;
    g.events = [];
    resolveEvent(g, p, 0);
    const told = g.events.find((e) => e.empireId === 0 && e.text.startsWith(`${x.title}:`))!;
    expect([x.choices[0]!.success.result, x.choices[0]!.failure.result].some((r) => told.text.includes(r.split("{")[0]!.slice(0, 20)))).toBe(true);
  });

  it("each empire sees each expedition at most once, spaced EXPEDITION_EVERY apart", () => {
    const g = explored();
    const seen: string[] = [];
    const turns: number[] = [];
    for (g.turn = 1; g.turn < FIRST_EXPEDITION + EXPEDITION_EVERY * (EXPEDITIONS.length + 2); g.turn++) {
      processExpeditions(g);
      for (const p of mine(g)) { seen.push(p.eventId); turns.push(g.turn); resolveEvent(g, p, 1); }
      g.pendingEvents = g.pendingEvents.filter((p) => p.empireId !== 0);
    }
    expect(new Set(seen).size).toBe(seen.length);
    expect(seen.length).toBe(EXPEDITIONS.length);
    for (let i = 1; i < turns.length; i++) expect(turns[i]! - turns[i - 1]!).toBeGreaterThanOrEqual(EXPEDITION_EVERY);
  });

  it("old saves (version 21) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 21;
    delete old.expeditions;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
