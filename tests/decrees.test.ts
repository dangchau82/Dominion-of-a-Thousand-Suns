// Imperial proclamations and edicts: data checks, slots, upkeep, cooldowns, colony effects and AI use.
import { describe, expect, it } from "vitest";
import { applyCommand, colonyBudget, endTurn, makeView, newGame, serialize, type GameSettings } from "../src/engine";
import { runAITurns } from "../src/ai";
import { empireBonus } from "../src/engine/civ";
import { EDICTS, PROCLAMATIONS } from "../src/engine/data/decrees";
import { RACES } from "../src/engine/data/races";
import { edictCost, EDICT_BY_ID, PROCLAMATION_BY_ID, PROCLAMATION_UNREST_SCALE, proclamationSlots, processDecrees } from "../src/engine/decrees";
import { unrestBreakdown } from "../src/engine/unrest";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 71, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});
const KEYS = ["production", "research", "growth", "range", "attack", "spying", "relations", "trade", "culture"];

describe("decrees data", () => {
  it("has 12 open proclamations and exactly one for each race, each with a gain and a price", () => {
    expect(PROCLAMATIONS.filter((p) => !p.raceOnly)).toHaveLength(12);
    expect(PROCLAMATIONS.filter((p) => p.raceOnly).map((p) => p.raceOnly).sort()).toEqual(RACES.map((r) => r.id).sort());
    for (const p of PROCLAMATIONS) {
      const vals = Object.entries(p.bonus);
      for (const [k, v] of vals) {
        expect(KEYS, p.id).toContain(k);
        if (k === "range" || k === "attack") expect(Number.isInteger(v) && Math.abs(v) <= 2, p.id).toBe(true);
        else if (k === "relations") expect(Math.abs(v), p.id).toBeLessThanOrEqual(10);
        else expect(Math.abs(v), p.id).toBeLessThanOrEqual(0.15);
      }
      expect(vals.some(([, v]) => v > 0), p.id).toBe(true);
      expect(vals.some(([, v]) => v < 0), p.id).toBe(true);
      expect(p.duration).toBeGreaterThanOrEqual(15);
      expect(p.upkeepPerColony).toBeLessThanOrEqual(3);
    }
  });
  it("has 16 edicts, two or more for each kind of colony, with unique ids", () => {
    expect(EDICTS).toHaveLength(16);
    for (const k of ["any", "capital", "notCapital", "conquered", "frontier", "unrestful"]) expect(EDICTS.filter((d) => d.allowedOn === k).length, k).toBeGreaterThanOrEqual(2);
    const ids = [...PROCLAMATIONS.map((p) => p.id), ...EDICTS.map((d) => d.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const d of EDICTS) expect(Object.values(d.colony).some((v) => v > 0), d.id).toBe(true);
  });
  it("gives the Quorai no culture boost of their own", () => {
    expect(PROCLAMATIONS.find((p) => p.raceOnly === "quorai")!.bonus.culture ?? 0).toBeLessThanOrEqual(0);
  });
});

describe("proclamations", () => {
  it("adds its bonus, charges upkeep, unsettles colonies, then ends and cools down", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const d = PROCLAMATION_BY_ID.get("forced-foundry-shift")!;
    e.treasury = 500;
    const before = empireBonus(e).production;
    expect(applyCommand(g, 0, { type: "proclaim", proclamationId: d.id }).ok).toBe(true);
    expect(empireBonus(e).production).toBeCloseTo(before + d.bonus.production!);
    expect(empireBonus(e).growth).toBeCloseTo(d.bonus.growth!);
    processDecrees(g);
    expect(e.treasury).toBe(500 - d.upkeepPerColony * 1);
    // One slot at the start: a second is refused.
    expect(proclamationSlots(g, e)).toBe(1);
    expect(applyCommand(g, 0, { type: "proclaim", proclamationId: "grand-academy-mandate" }).ok).toBe(false);
    g.turn += d.duration;
    processDecrees(g);
    expect(e.proclamations).toBeUndefined();
    expect(empireBonus(e).production).toBeCloseTo(before);
    expect(applyCommand(g, 0, { type: "proclaim", proclamationId: d.id }).ok).toBe(false); // cooling down
    g.turn += d.cooldown;
    expect(applyCommand(g, 0, { type: "proclaim", proclamationId: d.id }).ok).toBe(true);
  });
  it("keeps race proclamations to their race, and culture and calm earn more slots", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    e.treasury = 500;
    expect(applyCommand(g, 0, { type: "proclaim", proclamationId: "tarkhan-banner-of-conquest" }).ok).toBe(false);
    expect(makeView(g, 0).proclamations.options.filter((o) => o.raceOnly).map((o) => o.id)).toEqual(["humans-charter-of-ambition"]);
    e.goldenAges = 2;
    expect(proclamationSlots(g, e)).toBe(2);
    expect(applyCommand(g, 0, { type: "proclaim", proclamationId: "humans-charter-of-ambition" }).ok).toBe(true);
    expect(applyCommand(g, 0, { type: "proclaim", proclamationId: "grand-academy-mandate" }).ok).toBe(true);
    expect(applyCommand(g, 0, { type: "proclaim", proclamationId: "hearth-and-cradle" }).ok).toBe(false);
  });
  it("lapses when the treasury can't pay, can be revoked, and neighbours notice a threat", () => {
    const g = newGame(settings());
    const [e, o] = [g.empires[0]!, g.empires[1]!];
    o.contacts.push(0);
    e.treasury = 100;
    applyCommand(g, 0, { type: "proclaim", proclamationId: "iron-hull-levy" });
    expect(empireBonus(e).relations).toBe(-2);
    expect(g.events.some((ev) => ev.empireId === 1 && ev.text.includes("call it a threat"))).toBe(true);
    e.treasury = 0;
    processDecrees(g);
    expect(e.proclamations).toBeUndefined();
    g.turn += 100; e.treasury = 100;
    applyCommand(g, 0, { type: "proclaim", proclamationId: "iron-hull-levy" });
    expect(applyCommand(g, 0, { type: "revokeProclamation", proclamationId: "iron-hull-levy" }).ok).toBe(true);
    expect(applyCommand(g, 0, { type: "revokeProclamation", proclamationId: "iron-hull-levy" }).ok).toBe(false);
  });
  it("shows in a colony's unrest reasons", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const c = Object.values(g.colonies).find((x) => x.empireId === 0)!;
    c.isCapital = false; // judge it as an ordinary colony
    e.treasury = 500;
    applyCommand(g, 0, { type: "proclaim", proclamationId: "forced-foundry-shift" });
    const part = unrestBreakdown(g, c).find((p) => p.label.startsWith("Proclamation"));
    expect(part?.amount).toBe(3 * PROCLAMATION_UNREST_SCALE);
  });
});

describe("edicts", () => {
  it("costs money, boosts that one colony, then ends and cools down there", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    const c = Object.values(g.colonies).find((x) => x.empireId === 0)!;
    const d = EDICT_BY_ID.get("emergency-assembly-drive")!;
    e.treasury = 1000;
    const before = colonyBudget(g, c).production;
    const cost = edictCost(g, d, c);
    expect(applyCommand(g, 0, { type: "issueEdict", starId: c.starId, edictId: d.id }).ok).toBe(true);
    expect(e.treasury).toBe(1000 - cost);
    expect(colonyBudget(g, c).production).toBeCloseTo(before * 1.3);
    // One edict at a time on a colony.
    expect(applyCommand(g, 0, { type: "issueEdict", starId: c.starId, edictId: "civic-relief-ration" }).ok).toBe(false);
    g.turn += d.duration;
    processDecrees(g);
    expect(c.edict).toBeUndefined();
    expect(colonyBudget(g, c).production).toBeCloseTo(before);
    expect(applyCommand(g, 0, { type: "issueEdict", starId: c.starId, edictId: d.id }).ok).toBe(false);
    expect(applyCommand(g, 0, { type: "issueEdict", starId: c.starId, edictId: "civic-relief-ration" }).ok).toBe(true);
  });
  it("only fits the right kind of colony, and never someone else's", () => {
    const g = newGame(settings());
    const e = g.empires[0]!;
    e.treasury = 5000;
    const mine = Object.values(g.colonies).find((x) => x.empireId === 0)!;
    const theirs = Object.values(g.colonies).find((x) => x.empireId === 1)!;
    const ids = makeView(g, 0).edicts(mine.starId).map((o) => o.id);
    expect(ids).toContain("throne-archive-symposium");
    expect(ids).not.toContain("regional-heritage-fair");
    expect(ids).not.toContain("reparations-work-levy");
    expect(ids).not.toContain("curfew-and-crackdown");
    expect(applyCommand(g, 0, { type: "issueEdict", starId: mine.starId, edictId: "reparations-work-levy" }).ok).toBe(false);
    expect(applyCommand(g, 0, { type: "issueEdict", starId: theirs.starId, edictId: "civic-relief-ration" }).ok).toBe(false);
    expect(makeView(g, 0).edicts(theirs.starId)).toEqual([]);
    // A restless conquered world opens the harsh and the kind options.
    mine.isCapital = false; mine.peopleRaceId = "tarkhan"; mine.unrest = 50;
    const now = makeView(g, 0).edicts(mine.starId).map((o) => o.id);
    expect(now).toContain("amnesty-and-restitution");
    expect(now).toContain("curfew-and-crackdown");
    const pop = mine.population;
    expect(applyCommand(g, 0, { type: "issueEdict", starId: mine.starId, edictId: "curfew-and-crackdown" }).ok).toBe(true);
    expect(mine.unrest).toBe(38);
    expect(mine.population).toBeCloseTo(pop * 0.96);
  });
});

describe("AI and decrees", () => {
  it("uses them legally, and the game stays deterministic", () => {
    const run = () => {
      const g = newGame(settings({ seed: 72, size: "medium", rivals: 4 }));
      for (const e of g.empires) e.isPlayer = false;
      let proclaimed = 0, edicts = 0;
      for (let t = 0; t < 160 && !g.winner; t++) {
        runAITurns(g, true);
        for (const e of g.empires) proclaimed += e.proclamations?.length ? 1 : 0;
        for (const c of Object.values(g.colonies)) edicts += c.edict ? 1 : 0;
        endTurn(g);
        for (const e of g.empires) {
          if (!e.alive) continue;
          expect((e.proclamations ?? []).length).toBeLessThanOrEqual(3);
          for (const p of e.proclamations ?? []) { const d = PROCLAMATION_BY_ID.get(p.id)!; expect(!d.raceOnly || d.raceOnly === e.raceId).toBe(true); }
        }
      }
      return { proclaimed, edicts, save: serialize(g) };
    };
    const a = run(), b = run();
    expect(a.proclaimed).toBeGreaterThan(0);
    expect(a.save).toBe(b.save);
  }, 120_000);
});
