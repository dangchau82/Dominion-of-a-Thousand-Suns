// The player's cheat menu. Only the human player can use these; the AI never
// calls them. Using any cheat marks the game as cheated.

import { exploreStar } from "./knowledge";
import { FIELDS, type GameState, type Id } from "./types";

export type Cheat =
  | { kind: "money"; amount: number }
  | { kind: "research"; levels: number }
  | { kind: "revealMap" }
  | { kind: "ships"; templateId: string; count: number }
  | { kind: "growColonies" };

export function applyCheat(state: GameState, empireId: Id, cheat: Cheat): string {
  const e = state.empires[empireId];
  if (!e || !e.isPlayer) return "Cheats are for the player only";
  state.cheated = true;
  switch (cheat.kind) {
    case "money":
      e.treasury += cheat.amount;
      return `+${cheat.amount} BC added`;
    case "research":
      for (const f of FIELDS) e.research.level[f] += cheat.levels;
      return `Every research field +${cheat.levels} level`;
    case "revealMap":
      for (const s of state.stars) exploreStar(state, e, s, false);
      return "Whole galaxy revealed";
    case "ships": {
      const home = state.stars[e.capitalStarId]!;
      state.fleets.push({
        id: state.nextFleetId++, empireId, ships: { [cheat.templateId]: cheat.count },
        x: home.x, y: home.y, starId: home.id, destStarId: null,
      });
      return `${cheat.count} ship(s) appeared at your capital`;
    }
    case "growColonies":
      for (const c of Object.values(state.colonies)) {
        if (c.empireId !== empireId) continue;
        const p = state.stars[c.starId]!.planet;
        if (!p) continue;
        c.population = p.size + p.terraform;
        c.factories = Math.max(c.factories, c.population * 2);
      }
      return "All colonies filled up";
  }
}

