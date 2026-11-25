// Gemini's packs taken over by the main Claude (2026-11-25): infestation, job board, death and prison worlds,
// legendary ships and synthetic leaders, superweapon and starbase events. Data only for now.
import { describe, expect, it } from "vitest";
import { RACES } from "../src/engine/data/races";
import { EVENTS, type EventEffect, type GameEventDef } from "../src/engine/data/events";
import { INFESTATION, INFESTATION_CHAIN, SPECIMEN_GAMBLE } from "../src/engine/data/infestation";
import { CONTRACTS, CONTRACT_TWISTS } from "../src/engine/data/contracts";
import { DEATH_WORLDS, PRISON_COLONY, PRISON_EVENTS } from "../src/engine/data/hazardWorlds";
import { CREW_TRAITS, LEGEND_EVENTS, LEGEND_LOSS_MORALE, SYNTHETIC_TRAITS } from "../src/engine/data/legends";
import { MEGAPROJECT_EVENTS, SUPERWEAPON_LINES } from "../src/engine/data/megaprojectEvents";
import { LEADER_TRAITS } from "../src/engine/data/leaderTraits";

const ARTS = ["anomaly", "ruins", "supernova", "pirates", "contact", "crisis", "council", "victory"];

/** The event scale table in GEMINI-RULES (mult 2 for tier-3 contracts). */
function inScale(fx: EventEffect, mult = 1): boolean {
  switch (fx.kind) {
    case "money": return Math.abs(fx.amount) <= 320 * mult;
    case "research": return Math.abs(fx.amount) <= 400 * mult;
    case "culture": return Math.abs(fx.amount) <= 160 * mult;
    case "population": return Math.abs(fx.amount) <= 5 * mult;
    case "relations": return Math.abs(fx.amount) <= 20 * mult;
    case "revealStars": return fx.count <= 6 * mult;
    case "factories": return Math.abs(fx.amount) <= 15 * mult;
    default: return true;
  }
}

function checkEvent(e: GameEventDef): void {
  const all = [e.text, ...e.choices.flatMap((c) => [c.label, c.result])].join(" ");
  for (const tag of all.match(/\{[a-z]+\}/g) ?? []) expect(["{star}", "{colony}", "{rival}"], e.id).toContain(tag);
  expect(all, e.id).not.toMatch(/(?<![Tt]he )\{rival\}/);
  expect(e.title, e.id).not.toMatch(/\{/);
  expect(ARTS, e.id).toContain(e.art);
  expect(e.choices.length, e.id).toBeGreaterThanOrEqual(2);
  expect(e.choices.length, e.id).toBeLessThanOrEqual(3);
  for (const c of e.choices) for (const fx of c.effects) expect(inScale(fx), `${e.id}: ${JSON.stringify(fx)}`).toBe(true);
}

const words = (s: string) => s.trim().split(/\s+/).length;

describe("Gemini packs (taken over 2026-11-25)", () => {
  const events = [...INFESTATION_CHAIN, ...CONTRACT_TWISTS, ...PRISON_EVENTS, ...LEGEND_EVENTS, ...MEGAPROJECT_EVENTS];

  it("all new events are clean, in scale, and their ids clash with nothing", () => {
    expect(events.length).toBe(10 + 6 + 6 + 5 + 10);
    for (const e of events) checkEvent(e);
    const ids = [...events.map((e) => e.id), ...EVENTS.map((e) => e.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("infestation: chain links hold and numbers are in range", () => {
    const ids = new Set(INFESTATION_CHAIN.map((e) => e.id));
    for (const e of INFESTATION_CHAIN) if (e.requires) expect(ids.has(e.requires), e.id).toBe(true);
    for (const b of ["order", "chaos", "neutral"] as const) expect(INFESTATION_CHAIN.some((e) => e.branch === b)).toBe(true);
    expect(INFESTATION.spreadChance).toBeGreaterThanOrEqual(0.02);
    expect(INFESTATION.spreadChance).toBeLessThanOrEqual(0.15);
    expect(INFESTATION.quarantineTurns).toBeGreaterThanOrEqual(5);
    expect(SPECIMEN_GAMBLE.payment).toBeLessThanOrEqual(600);
    expect(SPECIMEN_GAMBLE.escapeChance).toBeLessThanOrEqual(0.4);
  });

  it("job board: 3 contracts of each kind, one per tier, sensible risks and rewards", () => {
    expect(CONTRACTS.length).toBe(18);
    for (const k of ["cargo", "escort", "smuggling", "rescue", "bounty", "survey"]) {
      const of = CONTRACTS.filter((c) => c.kind === k);
      expect(of.map((c) => c.tier).sort()).toEqual([1, 2, 3]);
    }
    for (const c of CONTRACTS) {
      expect(c.risk).toBeLessThanOrEqual(0.5);
      expect(c.turns).toBeGreaterThanOrEqual(3);
      expect(c.turns).toBeLessThanOrEqual(15);
      expect(words(c.description)).toBeLessThan(35);
      for (const fx of [...c.reward, ...c.failure]) expect(inScale(fx, c.tier === 3 ? 2 : 1), `${c.id}: ${JSON.stringify(fx)}`).toBe(true);
      if (c.kind === "smuggling") expect(c.caughtRelations).toBeGreaterThan(0);
    }
    // Riskier jobs pay more: smuggling and bounties are the riskiest kinds.
    const avgRisk = (k: string) => CONTRACTS.filter((c) => c.kind === k).reduce((a, c) => a + c.risk, 0) / 3;
    expect(avgRisk("smuggling")).toBeGreaterThan(avgRisk("cargo"));
  });

  it("death and prison worlds: numbers in Gemini's own ranges; better worlds cost more", () => {
    expect(DEATH_WORLDS.length).toBe(6);
    for (const d of DEATH_WORLDS) {
      expect(d.productionMult).toBeGreaterThanOrEqual(1.2);
      expect(d.productionMult).toBeLessThanOrEqual(2);
      expect(d.counter.tier).toBeGreaterThanOrEqual(2);
      expect(d.counter.tier).toBeLessThanOrEqual(8);
      expect(d.upkeep).toBeGreaterThanOrEqual(2);
      expect(d.upkeep).toBeLessThanOrEqual(15);
    }
    const sorted = [...DEATH_WORLDS].sort((a, b) => a.productionMult - b.productionMult);
    for (let i = 1; i < sorted.length; i++) expect(sorted[i]!.upkeep).toBeGreaterThanOrEqual(sorted[i - 1]!.upkeep);
    expect(PRISON_COLONY.productionBonus).toBeLessThanOrEqual(0.4);
    expect(PRISON_COLONY.unrestPerTurn).toBeLessThanOrEqual(6);
  });

  it("crew traits and synthetic leaders: every upside has a matching catch", () => {
    expect(CREW_TRAITS.length).toBe(12);
    const size = (o: Record<string, number | undefined>) => Object.values(o).reduce((a: number, v) => a + Math.abs(v ?? 0), 0);
    for (const t of CREW_TRAITS) {
      expect(t.afterBattles).toBeGreaterThanOrEqual(1);
      expect(t.afterBattles).toBeLessThanOrEqual(8);
      for (const v of Object.values(t.catch)) expect(v).toBeLessThan(0.0001 + (Object.keys(t.catch).includes("upkeep") ? 1 : 0));
      expect(size(t.catch)).toBeGreaterThan(0);
      expect(t.description[0]).toBe(t.description[0]!.toUpperCase());
    }
    expect(LEGEND_LOSS_MORALE).toBeGreaterThanOrEqual(4);
    const ids = new Set(LEADER_TRAITS.map((t) => t.id));
    for (const s of SYNTHETIC_TRAITS) {
      expect(ids.has(s.id), s.id).toBe(false);
      for (const v of Object.values(s.upside)) expect(v).toBeGreaterThan(0);
      for (const v of Object.values(s.downside)) expect(v).toBeLessThan(0);
      expect(s.agendaChance).toBeGreaterThanOrEqual(0.002);
      expect(s.agendaChance).toBeLessThanOrEqual(0.02);
    }
  });

  it("superweapon lines: every race, two lines, with {empire} and {star}", () => {
    expect(Object.keys(SUPERWEAPON_LINES).sort()).toEqual(RACES.map((r) => r.id).sort());
    for (const lines of Object.values(SUPERWEAPON_LINES)) {
      expect(lines.length).toBe(2);
      for (const l of lines) { expect(l).toContain("{empire}"); expect(l).toContain("{star}"); expect(words(l)).toBeLessThan(30); }
    }
    // Superweapon events must not name one particular weapon (any of the four can be built).
    for (const e of MEGAPROJECT_EVENTS.filter((x) => x.id.startsWith("superweapon"))) {
      expect(e.text).not.toMatch(/Sunderer|Arc-Tempest|Pale-Shroud|Null-Tide/);
    }
  });
});
