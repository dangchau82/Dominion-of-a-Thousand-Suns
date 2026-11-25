import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, newGame, type GameSettings } from "../src/engine";
import { learn } from "../src/engine/tech";
import { TECHS } from "../src/engine/data/techs";
import { COUNCIL_FIRST } from "../src/engine/victory";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 5, size: "small", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "Danny", ...over,
});

describe("victory", () => {
  it("conquest: last empire standing wins", () => {
    const g = newGame(settings());
    for (const e of g.empires) if (!e.isPlayer) {
      for (const c of Object.values(g.colonies)) if (c.empireId === e.id) delete g.colonies[c.starId];
      g.fleets = g.fleets.filter((f) => f.empireId !== e.id);
    }
    endTurn(g);
    expect(g.winner).toMatchObject({ empireId: 0, kind: "conquest" });
  });

  it("the council elects the player with two thirds of the votes", () => {
    const g = newGame(settings());
    g.turn = COUNCIL_FIRST;
    for (const e of g.empires) for (const o of g.empires) if (e.id !== o.id && !e.contacts.includes(o.id)) e.contacts.push(o.id);
    g.colonies[g.empires[0]!.capitalStarId]!.population = 500;
    endTurn(g);
    expect(g.council.session).not.toBeNull();
    expect(g.council.session!.candidates).toContain(0);
    for (const e of g.empires) applyCommand(g, e.id, { type: "councilVote", candidateId: g.council.session!.candidates.includes(e.id) && e.id !== 0 ? e.id : 0 });
    endTurn(g);
    expect(g.winner).toMatchObject({ empireId: 0, kind: "council" });
  });

  it("defying an AI the council elected means war with everyone", () => {
    const g = newGame(settings());
    for (const e of g.empires) for (const o of g.empires) if (e.id !== o.id && !e.contacts.includes(o.id)) e.contacts.push(o.id);
    g.council.awaitingVerdict = 1;
    expect(applyCommand(g, 0, { type: "councilVerdict", accept: false }).ok).toBe(true);
    expect(Object.keys(g.empires[0]!.atWar).length).toBe(3);
    expect(g.winner).toBeNull();
  });

  it("technology: master every field, then build the Ascension Gate", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const home = e.capitalStarId;
    expect(applyCommand(g, 0, { type: "setBuilding", starId: home, buildingId: "w-ascension" }).ok).toBe(false);
    for (const t of TECHS) learn(e.research, t.id);
    expect(applyCommand(g, 0, { type: "setBuilding", starId: home, buildingId: "w-ascension" }).ok).toBe(true);
    e.treasury = 1e6;
    expect(applyCommand(g, 0, { type: "buyBuilding", starId: home }).ok).toBe(false);
    g.colonies[home]!.buildProgress = 1e6;
    endTurn(g);
    expect(g.winner).toMatchObject({ empireId: 0, kind: "technology" });
  });

  it("culture victory", () => {
    const g = newGame(settings());
    g.empires[2]!.culture = 1e6;
    endTurn(g);
    expect(g.winner).toMatchObject({ empireId: 2, kind: "culture" });
  });
});
