// Gemini's 8 new events and the late-game lore: well-formed, in the game's scale, and playable.
import { describe, expect, it } from "vitest";
import { newGame } from "../src/engine";
import { EVENTS, type EventEffect, type GameEventDef } from "../src/engine/data/events";
import { AWAKENING_CHAIN, BLIGHT_CRISIS, ELDER_POWERS, STATION } from "../src/engine/data/lateGameLore";
import { resolveEvent } from "../src/engine/events";
import { STORYLINES } from "../src/engine/data/storylines";
import { STORYLINES_2 } from "../src/engine/data/storylines-2";
import { STORYLINES_3 } from "../src/engine/data/storylines-3";
import { STORYLINES_4 } from "../src/engine/data/storylines-4";
import { NEW_DIALOGUE } from "../src/engine/data/dialogue2";
import { RACES } from "../src/engine/data/races";
import { QUORAI_SUPERNOVA, REMNANTS, SUPERNOVA_AFTERMATH, SUPERNOVA_WARNINGS } from "../src/engine/data/supernova";
import { GATE_EVENTS, GATE_TYPES, STANCES } from "../src/engine/data/gates";

const NEW_EVENTS = ["precursor-dreadnought", "void-stowaway", "ace-defector", "orbital-elevator-collapse",
  "galactic-olympiad", "rogue-terraforming-fleet", "phantom-beacon", "privateer-letter"];

/** The scale table in GEMINI-RULES: anything bigger gets rescaled. */
function inScale(fx: EventEffect): boolean {
  switch (fx.kind) {
    case "money": return Math.abs(fx.amount) <= 320;
    case "research": return Math.abs(fx.amount) <= 400;
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
  it("every sink drains money on average, chances add up, and nothing rushes the Ascension Gate", () => {
    for (const m of MONEY_SINKS) expect(m.outcomes.reduce((a, o) => a + o.chance, 0), m.id).toBeCloseTo(1);
    const bond = MONEY_SINKS.find((m) => m.id === "interstellar-exchange")!;
    expect(bond.outcomes.reduce((a, o) => a + o.chance * (o.special?.value ?? 0), 0)).toBeLessThan(1);
    const rush = MONEY_SINKS.find((m) => m.id === "wonder-rush-grant")!;
    expect(rush.outcomes[0]!.special!.value).toBeLessThanOrEqual(0.5);
    expect(rush.aiRule).toMatch(/w-ascension/);
  });
});

import { TEN_TURN_CRISES } from "../src/engine/data/crises";

describe("branching crises (Gemini)", () => {
  it("6 crises; every path and fail path leads to a real next stage; every stage reachable; effects in scale", () => {
    expect(TEN_TURN_CRISES.length).toBe(6);
    for (const c of TEN_TURN_CRISES) {
      for (const s of c.stages) {
        expect(s.title).not.toMatch(/\{/);
        for (const ch of s.choices) {
          for (const p of [ch.path, ch.failPath].filter((x): x is string => !!x)) {
            if (s.stage === 3) expect(p).toBe("done");
            else expect(c.stages.some((n) => n.stage === s.stage + 1 && n.requiresPath === p), `${c.id}: ${p}`).toBe(true);
          }
          if (ch.chance < 1) expect(ch.failEffects?.length, `${ch.label}`).toBeGreaterThan(0);
          for (const fx of [...ch.effects, ...(ch.failEffects ?? [])]) if (fx.kind !== "planetSize") expect(inScale(fx), `${c.id} ${JSON.stringify(fx)}`).toBe(true);
        }
      }
      for (const s of c.stages.filter((x) => x.stage > 1)) {
        expect(c.stages.some((p) => p.stage === s.stage - 1 && p.choices.some((ch) => ch.path === s.requiresPath || ch.failPath === s.requiresPath)), `${c.id} unreachable ${s.id}`).toBe(true);
      }
    }
  });
});

import { FIGHTER_BAYS, FIGHTER_VARIANTS } from "../src/engine/data/carriers";

describe("carriers (Gemini, balanced by Claude)", () => {
  // Beam damage per shot by tier, from data/techs.ts (best beam at that tier).
  const BEAM: Record<number, number> = { 3: 5.5, 5: 7.5, 7: 18, 9: 25 };
  it("a fighter bay deals about what the same space of beams deals (within 20%)", () => {
    for (const b of FIGHTER_BAYS) {
      const fighters = b.fighters.large!;
      const bay = fighters * ((b.fighter.damage[0] + b.fighter.damage[1]) / 2) * b.fighter.shots;
      const beams = ((1000 * b.spaceShare) / (8 + 2 * b.tier)) * BEAM[b.tier]!;
      expect(bay / beams, b.id).toBeGreaterThan(0.8);
      expect(bay / beams, b.id).toBeLessThan(1.2);
      expect(b.hulls).not.toContain("small");
    }
    expect(FIGHTER_VARIANTS.length).toBe(4);
  });
});

import { VICTORY_TENSION } from "../src/engine/data/victoryTension";
import { CULTURE_VICTORY, VOTE_SHARE_TO_WIN } from "../src/engine/victory";

describe("victory warnings (Gemini)", () => {
  it("use the real victory numbers and never start more than 2 wars", () => {
    const culture = VICTORY_TENSION.find((v) => v.kind === "culture")!;
    for (const w of culture.warnings) expect(w.text).toContain((CULTURE_VICTORY * w.ratio).toLocaleString("en-US"));
    const council = VICTORY_TENSION.find((v) => v.kind === "council")!;
    for (const w of council.warnings) expect(w.text).toContain(`${Math.round(VOTE_SHARE_TO_WIN * w.ratio * 100)}%`);
    for (const v of VICTORY_TENSION) expect(v.counterPlay.maxSimultaneousWars).toBeLessThanOrEqual(2);
  });
});

import { STARBASES, SUPERWEAPONS } from "../src/engine/data/megaprojects";
import { TECHS } from "../src/engine/data/techs";

describe("superweapons and starbases (Gemini, balanced by Claude)", () => {
  it("starbases give no more than about warship value per BC; superweapons take 30-100 turns and can't stay on", () => {
    const tierOf = (id: string) => TECHS.find((t) => t.id === id)!.tier;
    for (const b of STARBASES) {
      const value = b.hits * 2 + b.weapons.reduce((a, w) => a + w.count * (4 + 3 * tierOf(w.techId)), 0);
      expect(value / b.cost, b.id).toBeLessThanOrEqual(1.15);
    }
    for (const w of SUPERWEAPONS) {
      expect(w.cost / 300).toBeGreaterThanOrEqual(30);
      expect(w.cost / 150).toBeLessThanOrEqual(100);
      expect(w.power).not.toMatch(/morale/);
    }
  });
});

import { NATIVES } from "../src/engine/data/natives";

describe("native peoples (Gemini)", () => {
  it("each has uplift / leave / take, a two-choice aftermath, clean titles and effects in scale", () => {
    expect(NATIVES.length).toBe(8);
    for (const n of NATIVES) {
      expect(n.contact.choices.length).toBe(3);
      expect(n.aftermath.choices.length).toBe(2);
      for (const ev of [n.contact, n.aftermath]) {
        checkText(ev);
        expect(ev.title).not.toMatch(/\{/);
        for (const c of ev.choices) for (const fx of c.effects) expect(inScale(fx), `${n.id} ${JSON.stringify(fx)}`).toBe(true);
      }
    }
  });
});

import { DECREE } from "../src/engine/data/protectedWorlds";

describe("protected worlds (Gemini)", () => {
  it("three escalating stages, each with a way back, and a guardian reward; all in scale", () => {
    expect(DECREE.stages.map((s) => s.offences)).toEqual([1, 2, 3]);
    for (const ev of [...DECREE.stages.map((s) => s.warning), DECREE.guardianReward]) {
      checkText(ev);
      expect(ev.title).not.toMatch(/\{/);
      expect(ev.choices.length).toBe(2);
      for (const c of ev.choices) for (const fx of c.effects) expect(inScale(fx), `${ev.id} ${JSON.stringify(fx)}`).toBe(true);
    }
    for (const s of DECREE.stages) expect(s.punishment).toMatch(/pays?|fine|reparations|peace/);
  });
});

import { CRUSADE, CRUSADE_CHAIN } from "../src/engine/data/crusade";

describe("the Crusade crisis (Gemini)", () => {
  it("10 linked events; three branches after the choice; all in scale", () => {
    expect(CRUSADE_CHAIN.length).toBe(10);
    const ids = new Set(CRUSADE_CHAIN.map((e) => e.id));
    for (const e of CRUSADE_CHAIN) {
      if (e.requires) expect(ids.has(e.requires), e.id).toBe(true);
      checkText(e);
      expect(e.title).not.toMatch(/\{/);
      for (const c of e.choices) for (const fx of c.effects) expect(inScale(fx), `${e.id} ${JSON.stringify(fx)}`).toBe(true);
    }
    expect(new Set(CRUSADE_CHAIN.filter((e) => e.branch).map((e) => e.branch))).toEqual(new Set(["order", "chaos", "neutral"]));
    expect(CRUSADE.conversion).toMatch(/unless your empire.s culture per turn outweighs it/);
  });
});

import { CRITTER, CRITTER_CHAIN } from "../src/engine/data/critters";

describe("invasive critters (Gemini)", () => {
  it("6 comic events with small effects; events 1-4 can end the chain (choice 3)", () => {
    expect(CRITTER.name).toBe("Tumble-Thrum");
    expect(CRITTER_CHAIN.length).toBe(6);
    for (const [i, e] of CRITTER_CHAIN.entries()) {
      checkText(e);
      expect(e.title).not.toMatch(/\{/);
      if (i < 4) expect(e.choices.length).toBe(3);
      for (const c of e.choices) for (const fx of c.effects) {
        if (fx.kind === "money" || fx.kind === "culture") expect(Math.abs(fx.amount)).toBeLessThanOrEqual(160);
        if (fx.kind === "population") expect(Math.abs(fx.amount)).toBeLessThanOrEqual(2);
        if (fx.kind === "factories") expect(Math.abs(fx.amount)).toBeLessThanOrEqual(5);
      }
    }
  });
});

describe("the supernova crisis (Gemini)", () => {
  const all = [...SUPERNOVA_WARNINGS, ...SUPERNOVA_AFTERMATH, QUORAI_SUPERNOVA];
  it("has 4 warnings, 3 aftermaths and a Quorai choice, all in scale", () => {
    expect(SUPERNOVA_WARNINGS.length).toBe(4);
    expect(SUPERNOVA_AFTERMATH.length).toBe(3);
    for (const e of all) {
      checkText(e);
      for (const c of e.choices) for (const fx of c.effects) expect(inScale(fx), `${e.id}: ${JSON.stringify(fx)}`).toBe(true);
    }
    expect(new Set(all.map((e) => e.id)).size).toBe(all.length);
  });
  it("remnants give 5 to 25 research a turn", () => {
    expect(REMNANTS.length).toBe(4);
    for (const r of REMNANTS) {
      expect(r.researchPerTurn).toBeGreaterThanOrEqual(5);
      expect(r.researchPerTurn).toBeLessThanOrEqual(25);
    }
  });
});

describe("gates and ambushes (Gemini)", () => {
  it("has 3 gate types, 3 stances and 4 events, all in scale", () => {
    expect(GATE_TYPES.length).toBe(3);
    for (const g of GATE_TYPES) {
      expect(g.throughput).toBeGreaterThanOrEqual(5);
      expect(g.throughput).toBeLessThanOrEqual(60);
      expect(g.awakenCost).toBeLessThanOrEqual(2000);
      expect(g.attritionPerTurn).toBeLessThanOrEqual(0.05);
    }
    expect(STANCES.map((s) => s.id).sort()).toEqual(["ambush", "decoy", "staging"]);
    expect(GATE_EVENTS.length).toBe(4);
    for (const e of GATE_EVENTS) {
      checkText(e);
      for (const c of e.choices) for (const fx of c.effects) expect(inScale(fx), `${e.id}: ${JSON.stringify(fx)}`).toBe(true);
    }
  });
});

describe("race storylines batches 2-4 (Gemini)", () => {
  it("6 chapters per race, 2 forks each, in scale, clean text", () => {
    const batch = [...STORYLINES_2, ...STORYLINES_3, ...STORYLINES_4];
    for (const race of ["vossari", "kethrak", "lumen", "thraal", "seraphine", "orrun", "nyx", "velari", "drovani", "gorrath", "ixil", "verdane", "raxxan", "ruuvak", "tarkhan"]) {
      expect(batch.filter((c) => c.raceId === race).map((c) => c.chapter)).toEqual([1, 2, 3, 4, "5A", "5B"]);
    }
    const ids = [...STORYLINES, ...batch].map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of batch) {
      expect(c.choices.length).toBe(2);
      expect(c.title).not.toMatch(/\{/);
      checkText(c);
      for (const ch of c.choices) for (const fx of ch.effects) expect(inScale(fx), `${c.id}: ${JSON.stringify(fx)}`).toBe(true);
    }
  });
});

describe("new rival voices (Gemini)", () => {
  it("every race has 2 lines for each of the 6 new moments, with only known placeholders", () => {
    expect(Object.keys(NEW_DIALOGUE).sort()).toEqual(RACES.map((r) => r.id).sort());
    for (const [race, lines] of Object.entries(NEW_DIALOGUE)) {
      for (const moment of ["battleWon", "battleLost", "betrayed", "councilWin", "prophecy", "begging"] as const) {
        expect(lines[moment].length, `${race}.${moment}`).toBe(2);
        for (const l of lines[moment]) {
          for (const tag of l.match(/\{[a-z]+\}/g) ?? []) expect(["{leader}", "{empire}", "{star}"]).toContain(tag);
          expect(l.split(/\s+/).length, l).toBeLessThanOrEqual(30);
        }
      }
    }
  });
});
