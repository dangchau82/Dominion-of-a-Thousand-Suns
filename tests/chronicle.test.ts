import { describe, expect, it } from "vitest";
import { chronicleText, deserialize, endTurn, newGame, serialize, type GameSettings } from "../src/engine";
import { runAITurns } from "../src/ai";

const settings: GameSettings = { seed: 4242, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny" } as GameSettings;

describe("chronicle (turn-by-turn game log)", () => {
  it("records every empire each turn and survives save/load", () => {
    const s = newGame(settings);
    for (let i = 0; i < 6; i++) { runAITurns(s, true); endTurn(s); }
    expect(s.chronicle!.turns.length).toBe(6);
    expect(s.chronicle!.turns[0]!.e.length).toBe(s.empires.length);
    expect(s.chronicle!.turns[5]!.e[0]![0]).toBeGreaterThanOrEqual(1); // colonies
    const back = deserialize(serialize(s));
    expect(back.chronicle!.turns.length).toBe(6);
    const text = chronicleText(back);
    expect(text).toContain("T1 ");
    expect(text).toContain("# Key events");
  });
  it("is deterministic", () => {
    const a = newGame(settings), b = newGame(settings);
    for (let i = 0; i < 5; i++) { runAITurns(a, true); endTurn(a); runAITurns(b, true); endTurn(b); }
    expect(JSON.stringify(a.chronicle)).toBe(JSON.stringify(b.chronicle));
  });
});
