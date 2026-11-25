import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, makeView, newGame, type GameSettings } from "../src/engine";
import { EVENTS } from "../src/engine/data/events";

const settings: GameSettings = { seed: 3, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny" };

describe("random events", () => {
  it("has 32 well-formed events", () => {
    expect(EVENTS.length).toBe(32);
    expect(new Set(EVENTS.map((e) => e.id)).size).toBe(32);
    for (const e of EVENTS) expect(e.choices.length).toBeGreaterThanOrEqual(2);
  });

  it("events happen, can be chosen, and expire if ignored", () => {
    const g = newGame(settings);
    let seen = false;
    for (let i = 0; i < 80 && !seen; i++) {
      endTurn(g);
      const v = makeView(g, 0);
      if (v.pendingEvents.length) {
        seen = true;
        const ev = v.pendingEvents[0]!;
        expect(ev.text).not.toContain("{");
        expect(applyCommand(g, 0, { type: "chooseEvent", eventId: ev.id, choice: 0 }).ok).toBe(true);
        expect(makeView(g, 0).pendingEvents.length).toBe(0);
      }
    }
    expect(seen).toBe(true);
    // Unanswered events don't pile up forever.
    for (let i = 0; i < 40; i++) endTurn(g);
    expect(g.pendingEvents.filter((p) => g.turn - p.turn > 5).length).toBe(0);
  });
});
