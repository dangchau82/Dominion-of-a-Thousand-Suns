// Stage 1 test AI: explores and expands. It exists to test the engine with
// self-play. It reads only its EmpireView and acts only through commands.
// The real AI (personalities, planning, deception) arrives in stages 4 and 8.

import type { Command } from "../engine/commands";
import type { EmpireView } from "../engine/view";
import type { Fleet, Id } from "../engine/types";

function idleFleets(view: EmpireView, shipType: string): Fleet[] {
  return view.fleets.filter((f) => f.starId !== null && f.destStarId === null && (f.ships[shipType] ?? 0) > 0);
}

function targeted(view: EmpireView): Set<Id> {
  return new Set(view.fleets.map((f) => f.destStarId).filter((d): d is Id => d !== null));
}

export function testBotTurn(view: EmpireView): Command[] {
  const cmds: Command[] = [];
  const taken = targeted(view);
  const unexplored = view.stars.filter((s) => !view.knowledge[s.id]?.explored);
  const settleable = view.stars.filter((s) => view.canSettle(s.id));

  // Colony ships: settle here if possible, otherwise head for the best open world in reach.
  for (const f of idleFleets(view, "colony")) {
    if (f.starId !== null && view.canSettle(f.starId)) {
      cmds.push({ type: "colonize", fleetId: f.id });
      continue;
    }
    const options = settleable
      .filter((s) => !taken.has(s.id) && view.reachable(s.id, { ...f, ships: { colony: 1 } }))
      .map((s) => {
        const k = view.knowledge[s.id]!;
        const size = k.planet ? k.planet.size : 0;
        return { s, score: size / (view.turnsTo(f, s.id) + 2) };
      })
      .sort((a, b) => b.score - a.score);
    const best = options[0];
    if (best) {
      cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: best.s.id, ships: { colony: 1 } });
      taken.add(best.s.id);
    }
  }

  // Scouts: one per unexplored star, nearest first.
  for (const f of idleFleets(view, "scout")) {
    const count = f.ships.scout ?? 0;
    const options = unexplored
      .filter((s) => !taken.has(s.id) && view.reachable(s.id, { ...f, ships: { scout: 1 } }))
      .sort((a, b) => Math.hypot(a.x - f.x, a.y - f.y) - Math.hypot(b.x - f.x, b.y - f.y));
    for (let i = 0; i < count && i < options.length; i++) {
      const target = options[i]!;
      cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: target.id, ships: { scout: 1 } });
      taken.add(target.id);
    }
  }

  // War: accept peace after a while, and build warships to defend.
  const wars = view.contacts.filter((c) => c.warSince !== null);
  for (const c of wars) {
    if (c.offersPeace && view.turn - (c.warSince ?? 0) >= 10) cmds.push({ type: "offerPeace", targetId: c.id });
  }
  const atWar = wars.length > 0;
  const warship = view.designs.filter((d) => d.role === "warship" && d.weapons.length > 0).sort((a, b) => b.cost - a.cost)[0];

  // Production: capital builds scouts early, then colony ships while there is room to grow.
  const scouts = view.fleets.reduce((n, f) => n + (f.ships.scout ?? 0), 0);
  const colonyShips = view.fleets.reduce((n, f) => n + (f.ships.colony ?? 0), 0);
  const openTargets = settleable.filter((s) => !taken.has(s.id)).length;
  for (const c of view.colonies) {
    if (c.isCapital) {
      const want = atWar && warship ? warship.id
        : scouts < 3 && unexplored.length > 0 ? "scout"
        : openTargets > colonyShips ? "colony" : null;
      if (c.buildTemplate !== want) cmds.push({ type: "setBuild", starId: c.starId, templateId: want });
      const shipPct = atWar ? 35 : want === "colony" ? 35 : want === "scout" ? 10 : 0;
      const defense = atWar ? 10 : 0;
      cmds.push({
        type: "setSliders", starId: c.starId,
        sliders: { ship: shipPct, defense, industry: 100 - shipPct - defense - 25 - 10, ecology: 10, research: 25 },
      });
    } else {
      const growing = c.population < c.capacity - 1;
      const factoriesFull = c.factories >= c.maxFactories - 0.5;
      cmds.push({
        type: "setSliders", starId: c.starId,
        sliders: atWar && c.population > 10
          ? { ship: 0, defense: 30, industry: factoriesFull ? 0 : 40, ecology: growing ? 20 : 0, research: factoriesFull ? 50 : 10 }
          : factoriesFull && !growing
          ? { ship: 0, defense: 0, industry: 0, ecology: 0, research: 100 }
          : { ship: 0, defense: 0, industry: factoriesFull ? 30 : 70, ecology: growing ? 30 : 0, research: factoriesFull ? 40 : 0 },
      });
    }
  }

  if (view.turn === 1) {
    cmds.push({
      type: "setResearch",
      alloc: { computers: 10, construction: 20, forceFields: 5, planetology: 30, propulsion: 30, weapons: 5 },
    });
  }
  return cmds;
}
