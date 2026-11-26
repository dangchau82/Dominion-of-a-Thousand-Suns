// Intelligence reports: agents inside a rival reveal where its visible fleets are heading, and warn of attacks.
import { describe, expect, it } from "vitest";
import { endTurn, makeView, newGame, type GameSettings } from "../src/engine";
import { runAITurns } from "../src/ai";
import { declareWar } from "../src/engine/combat";
import { intelReports, reportedDestination } from "../src/engine/intel";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 151, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("intelligence reports", () => {
  it("only agents reveal a fleet's destination, and a hostile fleet bound for our world raises one warning", () => {
    const g = newGame(settings());
    const [me, them] = [g.empires[0]!, g.empires[1]!];
    me.contacts.push(1); them.contacts.push(0);
    const home = g.colonies[me.capitalStarId]!;
    const hs = g.stars[me.capitalStarId]!;
    // An enemy fleet of 5 sitting next to our capital, ordered to it.
    g.fleets.push({ id: 999, empireId: 1, ships: { scout: 5 }, x: hs.x + 1, y: hs.y, starId: null, destStarId: home.starId });
    const f = g.fleets.at(-1)!;
    const see = () => true;
    expect(reportedDestination(me, f)).toBeNull();
    me.spies[1] = { alloc: 2, mission: "steal", progress: 0, agents: 1 } as never;
    expect(reportedDestination(me, f)).toBe(home.starId);
    intelReports(g, see);
    expect(g.events.filter((e) => e.kind === "spy" && e.empireId === 0)).toHaveLength(0); // not hostile yet
    declareWar(g, them, me);
    intelReports(g, see);
    intelReports(g, see);
    const warns = g.events.filter((e) => e.kind === "spy" && e.empireId === 0 && e.text.includes("heading for"));
    expect(warns).toHaveLength(1);
    expect(warns[0]!.text).toContain("5 ");
  });
  it("the view shows a seen fleet's destination only with agents", () => {
    const g = newGame(settings());
    const me = g.empires[0]!;
    const hs = g.stars[me.capitalStarId]!;
    g.fleets.push({ id: 998, empireId: 1, ships: { scout: 2 }, x: hs.x, y: hs.y, starId: null, destStarId: me.capitalStarId });
    expect(makeView(g, 0).seenFleets.find((f) => f.id === 998)?.destStarId ?? null).toBeNull();
    me.spies[1] = { alloc: 2, mission: "steal", progress: 0, agents: 2 } as never;
    expect(makeView(g, 0).seenFleets.find((f) => f.id === 998)!.destStarId).toBe(me.capitalStarId);
  });
  it("real games stay deterministic with reports on", () => {
    const run = () => { const g = newGame(settings({ seed: 152, size: "medium", rivals: 4 })); for (const e of g.empires) e.isPlayer = false; for (let t = 0; t < 150; t++) { runAITurns(g, true); endTurn(g); } return JSON.stringify(g.colonies); };
    expect(run()).toBe(run());
  }, 120_000);
});
