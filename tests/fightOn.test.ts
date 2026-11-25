import { describe, expect, it } from "vitest";
import { applyCommand, endTurn, newGame, type GameSettings } from "../src/engine";
import { checkVictory, CULTURE_VICTORY } from "../src/engine/victory";

const settings: GameSettings = { seed: 99, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "Danny" } as GameSettings;

describe("Fight on after a rival's victory", () => {
  it("lets only the player win afterwards, and the rival's win stands if the player falls", () => {
    const s = newGame(settings);
    s.empires[1]!.culture = CULTURE_VICTORY + 1;
    checkVictory(s);
    expect(s.winner?.empireId).toBe(1);
    expect(applyCommand(s, 0, { type: "keepPlaying" }).ok).toBe(true);
    expect(s.winner).toBeNull();
    expect(s.rivalWin?.empireId).toBe(1);
    // The rival is still over the culture line, but can't win again.
    endTurn(s);
    expect(s.winner).toBeNull();
    // The player wins by culture: a comeback.
    s.empires[0]!.culture = CULTURE_VICTORY + 1;
    checkVictory(s);
    expect(s.winner?.empireId).toBe(0);
    expect(s.winner?.comeback).toBe(true);
  });
  it("gives the rival the win if the player's empire falls", () => {
    const s = newGame(settings);
    s.empires[2]!.culture = CULTURE_VICTORY + 1;
    checkVictory(s);
    applyCommand(s, 0, { type: "keepPlaying" });
    s.empires[0]!.alive = false;
    checkVictory(s);
    expect(s.winner?.empireId).toBe(2);
  });
});
