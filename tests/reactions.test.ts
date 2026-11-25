// AI reactions: written by Gemini (coding test, 2026-11-25); one assertion fixed by Claude.
import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, makeView, newGame, type GameSettings, type GameState } from "../src/engine";
import { basicAITurn } from "../src/ai/basicAI";
import { DIALOGUE } from "../src/engine/data/dialogue";
import { processEspionage } from "../src/engine/diplomacy";
import { newColony } from "../src/engine/game";
import { deserialize, serialize } from "../src/engine/save";
import { SAVE_VERSION } from "../src/engine/types";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({
  seed: 2024, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny", ...over,
});

function meet(g: GameState, a: number, b: number): void {
  if (!g.empires[a]!.contacts.includes(b)) g.empires[a]!.contacts.push(b);
  if (!g.empires[b]!.contacts.includes(a)) g.empires[b]!.contacts.push(a);
}

function renderLines(lines: string[], speakerName: string, listenerName: string, starName = "our space"): string[] {
  return lines.map((line) =>
    `${speakerName}: “${line
      .replace(/\{empire\}/g, listenerName)
      .replace(/\{leader\}/g, speakerName)
      .replace(/\{star\}/g, starName)}”`,
  );
}

describe("AI reactions", () => {
  it("border warning: AI with colony within 4 ly warns once and not again within 30 turns", () => {
    const g = newGame(settings());
    const player = g.empires[0]!;
    const ai = g.empires[1]!;
    meet(g, 0, 1);

    const pStar = g.stars[player.capitalStarId]!;
    const aiStar = g.stars[ai.capitalStarId]!;
    aiStar.x = pStar.x + 2;
    aiStar.y = pStar.y;

    // Keep the other rival far away so only empire 1 triggers a warning.
    const otherStar = g.stars[g.empires[2]!.capitalStarId]!;
    otherStar.x = pStar.x + 50;
    otherStar.y = pStar.y + 50;

    endTurn(g);
    const expectedWarnings = renderLines(DIALOGUE[ai.raceId]!.borderWarning, ai.name, player.name, pStar.name);
    const firstWarnings = g.events.filter((ev) => ev.kind === "diplomacy" && ev.empireId === 0 && expectedWarnings.includes(ev.text));
    expect(firstWarnings).toHaveLength(1);
    expect(ai.borderWarned?.[0]).toBe(1);

    // Turns 2..30 (29 subsequent turns): no repeat warning inside the 30-turn window.
    for (let i = 0; i < 29; i++) {
      endTurn(g);
      const repeat = g.events.filter((ev) => ev.kind === "diplomacy" && ev.empireId === 0 && expectedWarnings.includes(ev.text));
      expect(repeat).toHaveLength(0);
    }
    expect(ai.borderWarned?.[0]).toBe(1);
  });

  it("spy caught: AI catching a spy emits a spy event containing one of its spyCaught lines", () => {
    const g = newGame(settings());
    const player = g.empires[0]!;
    const ai = g.empires[1]!;
    meet(g, 0, 1);

    ai.security = 10;
    player.spies[1] = { alloc: 0, mission: "watch", progress: 0, agents: 10 };

    const expectedCaught = renderLines(DIALOGUE[ai.raceId]!.spyCaught, ai.name, player.name);
    let caughtEventText: string | undefined;

    for (let i = 0; i < 30 && !caughtEventText; i++) {
      g.events = [];
      player.spies[1]!.agents = 10;
      processEspionage(g);
      const ev = g.events.find((e) => e.kind === "spy" && e.empireId === 0 && e.text.includes("caught"));
      if (ev) caughtEventText = ev.text;
    }

    expect(caughtEventText).toBeDefined();
    expect(expectedCaught.some((line) => caughtEventText!.includes(line))).toBe(true);
  });

  it("thanks: player gift to an AI produces its praise line", () => {
    const g = newGame(settings());
    const player = g.empires[0]!;
    const ai = g.empires[1]!;
    meet(g, 0, 1);

    player.treasury = 300;
    expect(applyCommand(g, 0, { type: "gift", to: 1, bc: 100 }).ok).toBe(true);

    const expectedPraise = renderLines(DIALOGUE[ai.raceId]!.praise, ai.name, player.name);
    expect(g.events.some((ev) => ev.kind === "diplomacy" && ev.empireId === 0 && expectedPraise.includes(ev.text))).toBe(true);
  });

  it("surrender: AI losing badly sends a gift and peace offer through applyCommand with surrender dialogue", () => {
    const g = newGame(settings());
    const player = g.empires[0]!;
    const ai = g.empires[1]!;
    meet(g, 0, 1);

    // War has lasted 11 turns (>= 10), AI has 10 pop, player has 40 known pop (> 2.5x AI pop).
    g.turn = 12;
    player.atWar[1] = 1;
    ai.atWar[0] = 1;
    ai.treasury = 400;
    g.colonies[ai.capitalStarId]!.population = 10;
    g.colonies[player.capitalStarId]!.population = 25;

    const extraStar = g.stars.find((s) => s.planet && !g.colonies[s.id])!;
    g.colonies[extraStar.id] = newColony(extraStar.id, 0, 15, 1);

    for (const starId of [player.capitalStarId, extraStar.id]) {
      const s = g.stars[starId]!;
      const c = g.colonies[starId]!;
      ai.knowledge[starId] = {
        explored: true,
        lastSeen: g.turn,
        planet: s.planet ? { ...s.planet } : null,
        ownerId: 0,
        population: c.population,
      };
    }

    const view = makeView(g, 1);
    const cmds = basicAITurn(view);

    const giftIdx = cmds.findIndex((c) => c.type === "gift" && c.to === 0 && c.bc === 80);
    const peaceIdx = cmds.findIndex((c) => c.type === "offerPeace" && c.targetId === 0);
    expect(giftIdx).toBeGreaterThanOrEqual(0);
    expect(peaceIdx).toBeGreaterThan(giftIdx);

    g.events = [];
    const playerBefore = player.treasury;
    for (const cmd of cmds) {
      expect(applyCommand(g, 1, cmd).ok).toBe(true);
    }

    // Claude: the AI also spends on buildings and ships in the same turn, so check the receiving end.
    expect(player.treasury).toBe(playerBefore + 80);
    expect(player.peaceOffers).toContain(1);
    const expectedSurrender = renderLines(DIALOGUE[ai.raceId]!.surrender, ai.name, player.name);
    expect(g.events.some((ev) => ev.kind === "diplomacy" && ev.empireId === 0 && expectedSurrender.includes(ev.text))).toBe(true);
  });

  it("saves: a version-9 save still loads and migrates to the current version", () => {
    const g = newGame(settings());
    const raw = JSON.parse(serialize(g)) as Record<string, unknown>;
    raw.version = 9;
    for (const e of raw.empires as Record<string, unknown>[]) delete e.borderWarned;

    const loaded = deserialize(JSON.stringify(raw));
    expect(loaded.version).toBe(SAVE_VERSION);
    expect(loaded.empires[0]!.borderWarned).toEqual({});
    expect(loaded.empires[1]!.borderWarned).toEqual({});
  });
});