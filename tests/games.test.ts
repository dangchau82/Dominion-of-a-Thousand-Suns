// The Starfall Games (src/engine/games.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { describeEvent, resolveEvent } from "../src/engine/events";
import { CONTESTS, GAMES_PREFIX, HOST_COST, medalTable, processGames } from "../src/engine/games";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 55, size: "small", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});
function announced(): GameState {
  const g = newGame(settings());
  for (g.turn = 1; g.turn < 200 && g.games?.opens === undefined; g.turn++) processGames(g);
  for (const e of g.empires) e.treasury = 2000;
  return g;
}
const ev = (g: GameState, id: number) => g.pendingEvents.find((p) => p.empireId === id && p.eventId.startsWith(GAMES_PREFIX))!;
const pick = (g: GameState, id: number, want: number) => (want - Number(ev(g, id).eventId.slice(GAMES_PREFIX.length)) + 4) % 4; // 0 host, 1 train, 2 send, 3 boycott
function play(g: GameState) { for (let i = 0; i < 6; i++) { g.turn++; processGames(g); } }

describe("the Starfall Games", () => {
  it("are announced to every empire with readable text", () => {
    const g = announced();
    for (const e of g.empires) expect(ev(g, e.id)).toBeDefined();
    expect(describeEvent(g, ev(g, 0)).text).toContain("1st Starfall Games");
  });

  it("award gold, silver and bronze in all five contests and crown a champion", () => {
    const g = announced();
    play(g);
    const total = medalTable(g).reduce((a, r) => a + r.m.gold + r.m.silver + r.m.bronze, 0);
    expect(total).toBe(CONTESTS.length * 3);
    expect(g.games!.champions.at(-1)!.empireId).not.toBeNull();
    expect(g.events.some((x) => x.kind === "saga" && /champions of the 1st Starfall Games/.test(x.text))).toBe(true);
  });

  it("the host pays to host, earns tourists, and boycotters are not liked by the host", () => {
    const g = announced();
    const host = g.empires[0]!, other = g.empires[1]!;
    resolveEvent(g, ev(g, 0), pick(g, 0, 0));
    resolveEvent(g, ev(g, 1), pick(g, 1, 3));
    host.contacts.push(other.id);
    const before = host.relations[other.id] ?? 0;
    play(g);
    expect(g.games!.last!.host).toBe(0);
    expect(host.treasury).toBeGreaterThan(2000 - HOST_COST);
    expect(host.relations[other.id] ?? 0).toBeLessThan(before);
    for (const p of Object.values(g.games!.last!.podium)) expect(p).not.toContain(1);
  });

  it("old saves (version 47) load", () => {
    const old = JSON.parse(serialize(newGame(settings()))) as GameState;
    old.version = 47;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
