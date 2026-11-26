// Galactic Council resolutions, voted between elections. Texts by Gemini (data/resolutions.ts); rules by Claude.
//
// From turn 112, every 25 turns (halfway between elections), the council puts one resolution to a vote:
// a sanction aimed at one empire (the worst aggressor, the runaway leader, the spymaster, the hoarder)
// or a measure for everyone. Every living empire votes yes, no or abstains with its council votes; it
// passes with more than half of all votes. A passed resolution changes the bonuses of those it covers
// for 10-25 turns, and some add a rule: no new wars, no trade income, or no spy missions.
// Gives smaller empires a way to rein in a leader. Same rules for everyone; deterministic.

import { RESOLUTIONS, type ResolutionDef } from "./data/resolutions";
import type { EmpireBonus } from "./data/buildings";
import { votesOf } from "./victory";
import * as R from "./rng";
import type { Empire, GameState, Id } from "./types";

export const RESOLUTION_FIRST = 112;
export const RESOLUTION_EVERY = 25;

export const RESOLUTION_BY_ID: ReadonlyMap<string, ResolutionDef> = new Map(RESOLUTIONS.map((r) => [r.id, r]));

export interface ResolutionSession {
  id: string;
  /** The empire it is aimed at, or null for everyone. */
  targetId: Id | null;
  turn: number;
  /** Each voter's choice: true yes, false no, null abstain. Unset = has not voted. */
  votes: Record<Id, boolean | null>;
}

export interface ActiveResolution {
  id: string;
  targetId: Id | null;
  until: number;
}

function alive(state: GameState): Empire[] {
  return state.empires.filter((e) => e.alive);
}

/** Who a sanction is aimed at, or null if nobody fits. */
function aimFor(state: GameState, def: ResolutionDef): Id | null {
  const list = alive(state);
  if (list.length < 3) return null;
  const top = (score: (e: Empire) => number, min: number) => {
    const best = [...list].sort((a, b) => score(b) - score(a) || a.id - b.id)[0]!;
    return score(best) >= min ? best.id : null;
  };
  switch (def.aimedAt) {
    case "aggressor": return top((e) => Object.keys(e.atWar).length, 2);
    case "leader": return top((e) => e.culture + votesOf(state, e) * 200, 1);
    case "spymaster": return top((e) => Object.values(e.spies).reduce((a, s) => a + s.alloc, 0), 4);
    case "hoarder": return top((e) => e.treasury, 2000);
    default: return null;
  }
}

/** Is this empire covered by an active resolution with this rule? */
export function underRule(state: GameState, e: Empire, rule: NonNullable<ResolutionDef["rule"]>): ResolutionDef | null {
  for (const a of state.activeResolutions ?? []) {
    const def = RESOLUTION_BY_ID.get(a.id);
    if (def?.rule === rule && (a.targetId === null || a.targetId === e.id)) return def;
  }
  return null;
}

/** Bonuses from active resolutions on this empire (added into empireBonus). */
export function resolutionBonuses(e: Empire): EmpireBonus[] {
  return (e.resolutionBonuses ?? []).map((r) => RESOLUTION_BY_ID.get(r.id)?.bonus ?? {});
}

export function castResolutionVote(state: GameState, e: Empire, yes: boolean | null): string | null {
  const s = state.resolutionSession;
  if (!s) return "No resolution before the council";
  if (!e.alive) return "You have no seat";
  s.votes[e.id] = yes;
  return null;
}

function say(state: GameState, text: string, empireId: Id | null = null): void {
  state.events.push({ turn: state.turn, empireId, kind: "council", text });
}

function fill(state: GameState, text: string, targetId: Id | null): string {
  return text.replace(/\{rival\}/g, targetId !== null ? state.empires[targetId]!.name : "the galaxy");
}

/** Once a turn: expire old resolutions, count a vote, or put a new one forward. */
export function processResolutions(state: GameState): void {
  // Expire.
  state.activeResolutions = (state.activeResolutions ?? []).filter((a) => a.until > state.turn);
  for (const e of state.empires) if (e.resolutionBonuses) e.resolutionBonuses = e.resolutionBonuses.filter((r) => r.until > state.turn);

  // Count the vote put forward last turn.
  const s = state.resolutionSession;
  if (s && state.turn > s.turn) {
    state.resolutionSession = null;
    const def = RESOLUTION_BY_ID.get(s.id)!;
    let yes = 0, total = 0;
    for (const e of alive(state)) {
      const w = votesOf(state, e);
      total += w;
      // The target never votes for its own sanction; silence counts as abstaining.
      const v = e.id === s.targetId ? false : s.votes[e.id] ?? null;
      if (v === true) yes += w;
    }
    const passed = yes * 2 > total;
    say(state, `${def.name}: ${passed ? fill(state, def.passedText, s.targetId) : fill(state, def.failedText, s.targetId)} (${yes} of ${total} votes for)`);
    if (passed) {
      const until = state.turn + def.duration;
      (state.activeResolutions ??= []).push({ id: def.id, targetId: s.targetId, until });
      for (const e of alive(state)) {
        if (s.targetId !== null && e.id !== s.targetId) continue;
        (e.resolutionBonuses ??= []).push({ id: def.id, until });
      }
    }
    return;
  }

  // Put a new resolution forward, halfway between elections.
  if (state.turn < RESOLUTION_FIRST || (state.turn - RESOLUTION_FIRST) % RESOLUTION_EVERY !== 0 || state.resolutionSession) return;
  const active = new Set((state.activeResolutions ?? []).map((a) => a.id));
  const options = RESOLUTIONS.filter((r) => !active.has(r.id))
    .map((r) => ({ r, target: r.target === "oneEmpire" ? aimFor(state, r) : null }))
    .filter((o) => o.r.target === "everyone" || o.target !== null);
  if (!options.length) return;
  // Sanctions on someone who deserves one come first.
  const aimed = options.filter((o) => o.target !== null);
  const pickFrom = aimed.length && R.chance(state.rng, 0.6) ? aimed : options;
  const o = R.pick(state.rng, pickFrom);
  state.resolutionSession = { id: o.r.id, targetId: o.target, turn: state.turn, votes: {} };
  say(state, `The Galactic Council debates ${o.r.name}: ${fill(state, o.r.proposalText, o.target)} ${o.r.description} Votes are cast next turn; more than half of all votes passes it.`);
}
