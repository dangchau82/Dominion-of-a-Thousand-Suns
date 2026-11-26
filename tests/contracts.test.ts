// The frontier job board (src/engine/contracts.ts, src/engine/contractEvents.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { CONTRACTS } from "../src/engine/data/contracts";
import { OFFER_PREFIX } from "../src/engine/contractEvents";
import { canDo, FIRST_OFFER, OFFER_EVERY, processContracts, tierFor } from "../src/engine/contracts";
import { resolveEvent } from "../src/engine/events";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION, type GameState } from "../src/engine/types";
import { makeView } from "../src/engine/view";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 44, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

function offered(g: GameState, empireId: number) {
  return g.pendingEvents.filter((p) => p.empireId === empireId && p.eventId.startsWith(OFFER_PREFIX));
}

describe("the frontier job board", () => {
  it("posts a job by turn FIRST_OFFER+12 that the empire has a ship for, shown with real numbers", () => {
    const g = newGame(settings());
    const rng = JSON.stringify(g.rng);
    for (g.turn = 1; g.turn <= FIRST_OFFER + 12 && !offered(g, 0).length; g.turn++) processContracts(g);
    expect(JSON.stringify(g.rng)).toBe(rng);
    const p = offered(g, 0)[0]!;
    const c = CONTRACTS.find((x) => OFFER_PREFIX + x.id === p.eventId)!;
    expect(c.tier).toBe(tierFor(p.turn));
    expect(canDo(g, g.empires[0]!, c.needs)).toBe(true);
    const ev = makeView(g, 0).pendingEvents.find((x) => x.id === p.id)!;
    expect(ev.text).toContain(c.poster);
    expect(ev.text).not.toMatch(/\{/);
  });

  it("a taken job finishes after its turns and either pays or goes wrong; then the next job comes", () => {
    const g = newGame(settings());
    for (g.turn = 1; !offered(g, 0).length && g.turn < 60; g.turn++) processContracts(g);
    const p = offered(g, 0)[0]!;
    const c = CONTRACTS.find((x) => OFFER_PREFIX + x.id === p.eventId)!;
    resolveEvent(g, p, 0);
    const prog = g.contracts![0]!;
    expect(prog.active?.contractId).toBe(c.id);
    for (let i = 0; i <= c.turns; i++) {
      g.turn++;
      processContracts(g);
      for (const t of g.pendingEvents.filter((x) => x.empireId === 0 && !x.eventId.startsWith(OFFER_PREFIX))) resolveEvent(g, t, 0);
    }
    expect(prog.active).toBeNull();
    expect(prog.completed + prog.failed).toBe(1);
    // The next job comes OFFER_EVERY turns after the last was posted.
    g.pendingEvents = [];
    for (let i = 0; i < OFFER_EVERY && !offered(g, 0).length; i++) { g.turn++; processContracts(g); }
    expect(offered(g, 0).length).toBe(1);
  });

  it("turning a job down starts nothing", () => {
    const g = newGame(settings());
    for (g.turn = 1; !offered(g, 0).length && g.turn < 60; g.turn++) processContracts(g);
    resolveEvent(g, offered(g, 0)[0]!, 1);
    expect(g.contracts![0]!.active).toBeNull();
  });

  it("no ship that can do it, no offer", () => {
    const g = newGame(settings());
    g.fleets = g.fleets.filter((f) => f.empireId !== 0);
    for (g.turn = 1; g.turn < 60; g.turn++) processContracts(g);
    expect(offered(g, 0).length).toBe(0);
  });

  it("smuggling caught costs relations with a neighbour", () => {
    const smuggling = CONTRACTS.filter((c) => c.kind === "smuggling");
    expect(smuggling.every((c) => (c.caughtRelations ?? 0) > 0)).toBe(true);
  });

  it("old saves (version 17) load", () => {
    const g = newGame(settings());
    const old = JSON.parse(serialize(g)) as GameState;
    old.version = 17;
    delete old.contracts;
    expect(deserialize(JSON.stringify(old)).version).toBe(SAVE_VERSION);
  });
});
