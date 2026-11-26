// Leaders' lives: hired leaders grow with service and, in time, retire. A leader gains a level every
// VETERAN_EVERY turns of service (up to MAX_LEVEL; salary grows with it) and retires after a set career
// (CAREER_MIN plus up to CAREER_SPREAD turns, fixed when hired). On retiring, a protégé offers to take their
// place: same post, one level lower, at half the usual price, for 10 turns. Androids never age or retire.
// Empires rise and fall as great leaders come and go (Old World's lesson). Deterministic: no random draws.
// (From the ideas review; main Claude, 2026-11-26.)

import { LEADER_KINDS, MAX_LEADERS } from "./data/buildings";
import { syntheticTrait } from "./legends";
import type { GameState, Leader } from "./types";

export const VETERAN_EVERY = 30;
export const MAX_LEVEL = 4;
export const CAREER_MIN = 70;
export const CAREER_SPREAD = 50;

/** Turn this leader will retire (from their id, so it is fixed and needs no random draw). */
export function retireTurn(l: Leader): number {
  return (l.hiredTurn ?? 0) + CAREER_MIN + ((l.id * 37) % (CAREER_SPREAD + 1));
}

export function processLeaderLives(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive) continue;
    for (const l of [...e.leaders]) {
      l.hiredTurn ??= state.turn; // leaders hired before this rule start their career now
      if (syntheticTrait(l)) continue;
      const served = state.turn - l.hiredTurn;
      const title = LEADER_KINDS[l.kind].title;
      if (served > 0 && served % VETERAN_EVERY === 0 && l.level < MAX_LEVEL) {
        l.level++;
        l.salary = Math.round(l.salary * (2 + l.level * 2) / (l.level * 2));
        state.events.push({ turn: state.turn, empireId: e.id, kind: "culture", text: `${l.name}, your ${title}, has grown in experience (now level ${l.level}).` });
      }
      if (state.turn >= retireTurn(l)) {
        e.leaders = e.leaders.filter((x) => x.id !== l.id);
        let text = `${l.name}, your ${title}, retires after ${served} turns of service.`;
        if (!e.leaderOffer && e.leaders.length < MAX_LEADERS) {
          const level = Math.max(1, l.level - 1);
          const scale = 1 + state.turn / 100;
          const heir: Leader = {
            id: state.nextLeaderId++, name: `${l.name.split(" ")[0]}'s protégé`, kind: l.kind, level,
            cost: Math.round(60 * level * scale), salary: Math.round((2 + level * 2) * scale), offerUntil: state.turn + 10,
            ...(l.trait ? { trait: l.trait } : {}),
          };
          e.leaderOffer = heir;
          text += ` Their protégé offers to take the post (level ${level}) for ${heir.cost} BC: see the Empire screen.`;
        }
        state.events.push({ turn: state.turn, empireId: e.id, kind: "culture", text });
      }
    }
  }
}
