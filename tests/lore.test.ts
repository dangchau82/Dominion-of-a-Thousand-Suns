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
