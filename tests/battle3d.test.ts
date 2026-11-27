// The 3D battle viewer's pure parts: turning a real battle recording into a timeline, and
// reading invasion news into a landing scene. (The three.js drawing itself is checked by eye.)
import { describe, expect, it } from "vitest";
import { newGame, endTurn } from "../src/engine";
import { runAITurns } from "../src/ai";
import { unpackShot, type BattleRecord } from "../src/engine/battleLog";
import { battleTimeline, leftoverLosses, MAX_DRAWN, MAX_MODELS, modelsFor } from "../src/ui/battle3d/timeline";
import { landingFromEvent } from "../src/ui/battle3d/landingInfo";

function aRealBattle(): { s: ReturnType<typeof newGame>; rec: BattleRecord } {
  const s = newGame({ seed: 4401, size: "small", shape: "ellipse", rivals: 3, playerRaceId: "kethrak", playerName: "T", difficulty: "normal" } as never);
  for (let t = 0; t < 400 && !s.winner; t++) {
    runAITurns(s, true); endTurn(s);
    const b = (s.battles ?? []).find((x) => x.shots.length > 60);
    if (b) return { s, rec: b };
  }
  throw new Error("no battle");
}

describe("3D battle timeline", () => {
  const { rec } = aRealBattle();
  const tl = battleTimeline(rec);

  it("keeps every kill and stays within the drawing budget", () => {
    const kills = rec.shots.map(unpackShot).filter((s) => s.result === "kill").length;
    expect(tl.shots.filter((s) => s.result === "kill").length).toBe(kills);
    expect(tl.shots.length).toBeLessThanOrEqual(Math.max(MAX_DRAWN, kills));
  });

  it("plays shots in order, round by round", () => {
    for (let i = 1; i < tl.shots.length; i++) expect(tl.shots[i]!.t).toBeGreaterThanOrEqual(tl.shots[i - 1]!.t - 1e-9);
    expect(tl.duration).toBeGreaterThan(tl.shots.at(-1)!.t);
  });

  it("shows no more models than ships and no model is lost twice", () => {
    rec.units.forEach((u, i) => {
      expect(tl.units[i]!.shown).toBe(modelsFor(u.start, u.key));
      expect(tl.units[i]!.shown).toBeLessThanOrEqual(MAX_MODELS);
      const lost = tl.shots.filter((s) => s.target === i && s.modelLost >= 0).map((s) => s.modelLost);
      expect(new Set(lost).size).toBe(lost.length);
      expect(lost.length + leftoverLosses(tl, i)).toBe(tl.units[i]!.shown - tl.units[i]!.survive);
    });
  });

  it("a stack wiped out ends with no models standing; survivors keep some", () => {
    rec.units.forEach((u, i) => {
      if (u.key === "planet") return;
      if (u.end === 0) expect(tl.units[i]!.survive).toBe(0);
      if (u.end === u.start && u.start > 0) expect(tl.units[i]!.survive).toBe(tl.units[i]!.shown);
    });
  });
});

describe("landing scenes from invasion news", () => {
  const s = newGame({ seed: 5, size: "small", shape: "ellipse", rivals: 2, playerRaceId: "humans", playerName: "T" } as never);
  const star = s.stars.find((x) => x.planet)!;
  const them = s.empires[1]!;
  it("reads a capture", () => {
    const l = landingFromEvent(s, { turn: 90, starId: star.id, empireId: 0, text: `The ${them.name} captured ${star.name} with 7 surviving troops.` }, 0)!;
    expect(l).toMatchObject({ attackerId: 1, defenderId: 0, captured: true, survivors: 7 });
  });
  it("reads a landing thrown back", () => {
    const l = landingFromEvent(s, { turn: 90, starId: star.id, empireId: 0, text: `Invasion of ${star.name} by the ${them.name} was thrown back (12 troops lost).` }, 0)!;
    expect(l).toMatchObject({ attackerId: 1, captured: false, troops: 12, survivors: 0 });
  });
  it("ignores other invasion notes", () => {
    expect(landingFromEvent(s, { turn: 90, starId: star.id, empireId: 0, text: "Their people flee to the hills." }, 0)).toBeNull();
  });
});
