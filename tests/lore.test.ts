// Gemini's 8 new events and the late-game lore: well-formed, in the game's scale, and playable.
import { describe, expect, it } from "vitest";
import { newGame } from "../src/engine";
import { EVENTS, type EventEffect, type GameEventDef } from "../src/engine/data/events";
import { AWAKENING_CHAIN, BLIGHT_CRISIS, ELDER_POWERS, STATION } from "../src/engine/data/lateGameLore";
import { resolveEvent } from "../src/engine/events";
import { STORYLINES } from "../src/engine/data/storylines";

const NEW_EVENTS = ["precursor-dreadnought", "void-stowaway", "ace-defector", "orbital-elevator-collapse",
  "galactic-olympiad", "rogue-terraforming-fleet", "phantom-beacon", "privateer-letter"];

/** The scale table in GEMINI-RULES: anything bigger gets rescaled. */
function inScale(fx: EventEffect): boolean {
  switch (fx.kind) {
    case "money": return Math.abs(fx.amount) <= 320;
    case "research": return fx.amount <= 400;
    case "culture": return Math.abs(fx.amount) <= 160;
    case "population": return Math.abs(fx.amount) <= 5;
    case "relations": return Math.abs(fx.amount) <= 20;
    case "revealStars": return fx.count <= 6;
    case "planetSize": return fx.amount <= 8;
    case "factories": return Math.abs(fx.amount) <= 15;
    default: return true;
  }
}

function checkText(e: GameEventDef): void {
  const all = [e.text, ...e.choices.flatMap((c) => [c.label, c.result])].join(" ");
  for (const tag of all.match(/\{[a-z]+\}/g) ?? []) expect(["{star}", "{colony}", "{rival}"]).toContain(tag);
  expect(all).not.toMatch(/(?<![Tt]he )\{rival\}/); // empire names read "the X"
  expect(all).not.toMatch(/Golden Age/);
}

describe("Gemini events and lore", () => {
  const added = EVENTS.filter((e) => NEW_EVENTS.includes(e.id));
  const lore = [...AWAKENING_CHAIN, ...BLIGHT_CRISIS.events];

  it("adds all 8 events, in scale, with clean text", () => {
    expect(added.length).toBe(8);
    for (const e of [...added, ...lore]) {
      checkText(e);
      for (const c of e.choices) for (const fx of c.effects) expect(inScale(fx), `${e.id}: ${JSON.stringify(fx)}`).toBe(true);
    }
  });

  it("every choice of the new events can be taken", () => {
    for (const def of added) {
      def.choices.forEach((_, i) => {
        const g = newGame({ seed: 5, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "T" });
        g.empires[0]!.treasury = 500;
        const p = { id: 1, empireId: 0, eventId: def.id, turn: 1, colonyStarId: g.empires[0]!.capitalStarId, starId: g.empires[0]!.capitalStarId, rivalId: 1 };
        g.pendingEvents.push(p);
        expect(resolveEvent(g, p, i)).toBeNull();
        expect(Number.isFinite(g.empires[0]!.treasury)).toBe(true);
      });
    }
  });

  it("the awakening chain is in order and branches after the reckoning", () => {
    expect(AWAKENING_CHAIN.length).toBe(8);
    const ids = new Set(AWAKENING_CHAIN.map((e) => e.id));
    for (const e of AWAKENING_CHAIN) if (e.requires) expect(ids.has(e.requires)).toBe(true);
    expect(AWAKENING_CHAIN.filter((e) => e.branch).map((e) => e.branch).sort()).toEqual(["chaos", "neutral", "order"]);
    expect(ELDER_POWERS.map((p) => p.alignment).sort()).toEqual(["chaos", "order"]);
    expect(STATION.sponsorVoteShare).toBeLessThanOrEqual(0.2);
  });

  it("race storylines: 6 chapters per race, 2 forks each, in scale", () => {
    for (const race of ["ashkari", "quorai", "humans"]) {
      const chapters = STORYLINES.filter((c) => c.raceId === race).map((c) => c.chapter);
      expect(chapters).toEqual([1, 2, 3, 4, "5A", "5B"]);
    }
    expect(new Set(STORYLINES.map((c) => c.id)).size).toBe(STORYLINES.length);
    for (const c of STORYLINES) {
      expect(c.choices.length).toBe(2);
      checkText(c);
      for (const ch of c.choices) for (const fx of ch.effects) {
        expect(inScale(fx), `${c.id}: ${JSON.stringify(fx)}`).toBe(true);
        if (fx.kind === "ships") expect(fx.count).toBeLessThanOrEqual(3);
      }
    }
  });
});

import { STAR_NAMES } from "../src/engine/data/planets";
import { MORE_STAR_NAMES } from "../src/engine/data/starNamesExtra";
import { newGame as makeGame } from "../src/engine";

describe("extra star names (Gemini)", () => {
  it("are new, unique, and give big maps real names", () => {
    expect(new Set(MORE_STAR_NAMES).size).toBe(MORE_STAR_NAMES.length);
    for (const n of MORE_STAR_NAMES) expect(STAR_NAMES).not.toContain(n);
    const g = makeGame({ seed: 2, size: "huge", shape: "spiral", rivals: 12, playerRaceId: "humans", playerName: "A" });
    const names = g.stars.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names.filter((n) => / (II|III|IV|V|VI)$| Minor$/.test(n)).length).toBe(0);
  });
});

import { LEADER_TRAITS } from "../src/engine/data/leaderTraits";

describe("leader traits (Gemini)", () => {
  const LIMIT: Record<string, number> = { production: 0.08, research: 0.08, growth: 0.15, range: 1, attack: 1, spying: 1, relations: 10, trade: 0.15, culture: 0.15 };
  it("every trait has a real upside and a real downside, within limits", () => {
    expect(LEADER_TRAITS.length).toBe(24);
    expect(new Set(LEADER_TRAITS.map((t) => t.id)).size).toBe(24);
    for (const t of LEADER_TRAITS) {
      expect(Object.keys(t.upside).length).toBeGreaterThan(0);
      expect(Object.keys(t.downside).length).toBeGreaterThan(0);
      for (const [k, v] of Object.entries(t.upside)) { expect(v).toBeGreaterThan(0); expect(v).toBeLessThanOrEqual(LIMIT[k]!); }
      for (const [k, v] of Object.entries(t.downside)) { expect(v).toBeLessThan(0); expect(-v).toBeLessThanOrEqual(LIMIT[k]!); }
      expect(t.description.split(/\s+/).length).toBeLessThan(25);
    }
  });
});

import { EXPEDITIONS } from "../src/engine/data/expeditions";
import { MINOR_RACES } from "../src/engine/data/minorRaces";
import { PROPHECIES } from "../src/engine/data/prophecies";

describe("Gemini pack 2: prophecies, minor races, expeditions", () => {
  it("prophecies: 3 per threat, only their own placeholders", () => {
    for (const t of ["invasion", "plague", "supernova", "elderAwakening", "goldenAge", "betrayal"]) expect(PROPHECIES.filter((p) => p.threat === t).length).toBe(3);
    for (const p of PROPHECIES) for (const tag of p.text.match(/\{\w+\}/g) ?? []) expect(["{starColor}", "{direction}", "{turns}"]).toContain(tag);
  });
  it("minor races: 12, small gifts, names don't clash with the lore", () => {
    expect(MINOR_RACES.length).toBe(12);
    for (const m of MINOR_RACES) expect(m.name).not.toMatch(/Lattice|Vesper|Cinder/);
  });
  it("expeditions: chances 0.3-0.9, rewards in scale", () => {
    expect(EXPEDITIONS.length).toBe(12);
    for (const e of EXPEDITIONS) for (const c of e.choices) {
      expect(c.chance).toBeGreaterThanOrEqual(0.3); expect(c.chance).toBeLessThanOrEqual(0.9);
      for (const fx of [...c.success.effects, ...c.failure.effects]) expect(inScale(fx), `${e.id} ${JSON.stringify(fx)}`).toBe(true);
    }
  });
});

import { RESOLUTIONS } from "../src/engine/data/resolutions";
import { REBEL_FACTIONS, SPY_MISSION_TEXTS, UNREST_EVENTS } from "../src/engine/data/unrest";
import { RACES } from "../src/engine/data/races";

describe("Gemini pack 3: council resolutions, unrest and civil war", () => {
  const LIMIT: Record<string, number> = { production: 0.08, research: 0.08, growth: 0.15, range: 1, attack: 1, spying: 1, relations: 10, trade: 0.15, culture: 0.15 };
  it("resolutions: 12, within limits, 10-25 turns", () => {
    expect(RESOLUTIONS.length).toBe(12);
    for (const r of RESOLUTIONS) {
      expect(r.duration).toBeGreaterThanOrEqual(10); expect(r.duration).toBeLessThanOrEqual(25);
      for (const [k, v] of Object.entries(r.bonus)) expect(Math.abs(v as number)).toBeLessThanOrEqual(LIMIT[k]!);
      if (r.target === "oneEmpire") expect(r.aimedAt).toBeDefined();
    }
  });
  it("unrest events in scale; a rebel faction for every race; three spy missions", () => {
    expect(UNREST_EVENTS.length).toBe(10);
    for (const e of UNREST_EVENTS) { checkText(e); expect(e.title).not.toMatch(/\{/); for (const c of e.choices) for (const fx of c.effects) expect(inScale(fx)).toBe(true); }
    expect(REBEL_FACTIONS.map((f) => f.raceId).sort()).toEqual(RACES.map((r) => r.id).sort());
    expect(SPY_MISSION_TEXTS.map((m) => m.mission).sort()).toEqual(["fundRebels", "inciteUnrest", "spreadPropaganda"]);
  });
});

import { LINEAGES, LIVING_TRAITS, MUTATIONS } from "../src/engine/data/livingShips";

describe("Gemini pack 3: living ships", () => {
  it("12 traits covering every effect, 10 mutations each with a drawback, 5 lineages", () => {
    expect(LIVING_TRAITS.length).toBe(12);
    const kinds = new Set(LIVING_TRAITS.flatMap((t) => t.effects.map((e) => e.kind)));
    expect([...kinds].sort()).toEqual(["aim", "armor", "evasion", "hits", "regrow", "shieldPierce", "speed"]);
    expect(MUTATIONS.length).toBe(10);
    for (const m of MUTATIONS) expect(m.drawback).toBeDefined();
    expect(LINEAGES.map((l) => l.raceId).sort()).toEqual(["anyone", "ixil", "kethrak", "ruuvak", "verdane"]);
    expect(new Set([...LIVING_TRAITS, ...MUTATIONS].map((t) => t.id)).size).toBe(22);
  });
});

import { MONEY_SINKS } from "../src/engine/data/moneySinks";

describe("money sinks (Gemini)", () => {
  it("the investment drains money on average, and nothing rushes the Ascension Gate", () => {
    const bourse = MONEY_SINKS.find((m) => m.benefitKind === "bourseInvestment")!;
    const outcomes = bourse.outcomes!;
    expect(outcomes.reduce((a, o) => a + o.probability, 0)).toBeCloseTo(1);
    expect(outcomes.reduce((a, o) => a + o.probability * o.payoutMultiplier, 0)).toBeLessThan(1);
    const rush = MONEY_SINKS.find((m) => m.benefitKind === "rushWonderProduction")!;
    expect(rush.benefitValue).toBeLessThanOrEqual(0.5);
    expect(rush.aiSummary).toMatch(/never the Ascension Gate/);
  });
});
