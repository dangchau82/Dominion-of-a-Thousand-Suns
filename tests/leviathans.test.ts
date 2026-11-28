// Ancient Leviathans (src/engine/leviathans.ts).
import { describe, expect, it } from "vitest";
import { applyCommand, newGame } from "../src/engine";
import { LEVIATHAN_TURN, WAKE_COST, processLeviathans } from "../src/engine/leviathans";
import { makeView } from "../src/engine/view";

function game() {
  const g = newGame({ seed: 91, size: "medium", shape: "ellipse", rivals: 5, playerRaceId: "humans", playerName: "D" });
  g.turn = LEVIATHAN_TURN;
  processLeviathans(g);
  return g;
}

describe("Ancient Leviathans", () => {
  it("are found at turn 160 in empty space, with news, and only once", () => {
    const g = game();
    expect(g.leviathans!.length).toBeGreaterThanOrEqual(1);
    for (const l of g.leviathans!) { expect(g.stars[l.starId]!.planet).toBeFalsy(); expect(l.wokenBy).toBeNull(); }
    const n = g.events.filter((e) => e.text.includes("Ancient Leviathan asleep")).length;
    processLeviathans(g);
    expect(g.events.filter((e) => e.text.includes("Ancient Leviathan asleep")).length).toBe(n);
    expect(makeView(g, 0).leviathans.length).toBe(g.leviathans!.length);
  });

  it("can be woken by a fleet there, with Titan Slipways and the BC", () => {
    const g = game();
    const e = g.empires[0]!;
    const l = g.leviathans![0]!;
    const s = g.stars[l.starId]!;
    g.fleets.push({ id: 9999, empireId: 0, ships: { scout: 1 }, x: s.x, y: s.y, starId: s.id, destStarId: null });
    expect(applyCommand(g, 0, { type: "wakeLeviathan", fleetId: 9999 }).ok).toBe(false); // no tech
    e.research.known.push("titan-slipways");
    e.treasury = WAKE_COST + 10;
    expect(applyCommand(g, 0, { type: "wakeLeviathan", fleetId: 9999 }).ok).toBe(true);
    expect(l.wokenBy).toBe(0);
    expect(e.treasury).toBe(10);
    const f = g.fleets.find((x) => x.id === 9999)!;
    expect(Object.keys(f.ships).some((id) => g.designs[id]?.hull === "colossus")).toBe(true);
    expect(applyCommand(g, 0, { type: "wakeLeviathan", fleetId: 9999 }).ok).toBe(false); // already awake
  });
});
