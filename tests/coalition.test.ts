// The Grand Coalition (src/engine/coalition.ts).
import { describe, expect, it } from "vitest";
import { newGame, type GameSettings } from "../src/engine";
import { ARMADA_AFTER, COALITION_START, coalitionEdge, coalitionTarget, processCoalition } from "../src/engine/coalition";
import { makeView } from "../src/engine/view";
import { deserialize, serialize } from "../src/engine/save";
import type { Unit } from "../src/engine/combat";

const settings = (over: Partial<GameSettings> = {}): GameSettings => ({ seed: 77, size: "small", shape: "ellipse", rivals: 3, playerRaceId: "humans", playerName: "D", ...over });
function giant(turn = COALITION_START + 5) {
  const g = newGame(settings());
  g.turn = turn;
  for (const c of Object.values(g.colonies)) c.population = c.empireId === 2 ? 500 : 50;
  return g;
}
const unit = (side: 0 | 1, empireId: number): Unit => ({ side, empireId, attack: 3, beamDef: 2, missileDef: 2 } as unknown as Unit);

describe("Grand Coalition", () => {
  it("only forms late, against a true giant", () => {
    expect(coalitionTarget(giant(COALITION_START - 1))).toBeNull();
    expect(coalitionTarget(giant())).toBe(2);
    const even = giant(); for (const c of Object.values(even.colonies)) c.population = 100;
    expect(coalitionTarget(even)).toBeNull();
  });
  it("posts news once, and comes apart when the giant shrinks", () => {
    const g = giant();
    processCoalition(g); processCoalition(g);
    expect(g.events.filter((e) => e.text.startsWith("The Grand Coalition")).length).toBe(1);
    for (const c of Object.values(g.colonies)) c.population = 100;
    processCoalition(g);
    expect(g.coalition).toBeUndefined();
    expect(g.events.some((e) => e.text.includes("comes apart"))).toBe(true);
  });
  it("sends the Coalition Armada against one of the giant's worlds, with news, a few turns in", () => {
    const g = giant();
    processCoalition(g);
    expect(g.coalition?.armadaStarId ?? null).toBeNull();
    g.turn += ARMADA_AFTER;
    processCoalition(g);
    const t = g.coalition!.armadaStarId!;
    expect(g.colonies[t]?.empireId).toBe(2);
    expect(g.events.filter((e) => e.text.startsWith("The Coalition Armada")).length).toBe(1);
    expect(makeView(g, 0).coalition.armadaStarId).toBe(t);
  });
  it("gives everyone fighting the giant +1 attack and defence, and nobody else", () => {
    const g = giant(); processCoalition(g);
    const vsGiant = [unit(0, 0), unit(1, 2)];
    coalitionEdge(g, vsGiant);
    expect(vsGiant[0]).toMatchObject({ attack: 4, beamDef: 3, missileDef: 3 });
    expect(vsGiant[1]).toMatchObject({ attack: 3, beamDef: 2 });
    const others = [unit(0, 0), unit(1, 1)];
    coalitionEdge(g, others);
    expect(others[0]).toMatchObject({ attack: 3 });
  });
  it("is in the view and survives a save", () => {
    const g = giant(); processCoalition(g);
    expect(makeView(g, 0).coalition.leaderId).toBe(2);
    expect(deserialize(serialize(g)).coalition).toEqual(g.coalition);
  });
});
