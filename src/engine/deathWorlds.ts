// Death worlds (Gemini's data/hazardWorlds.ts, death-world part): rare planets that
// are rich but deadly. Marked once, on turn 1, in `planet.special` ("death:<id>"),
// without random draws, so maps and seeds are unchanged. Colonists there die every
// turn until their empire researches the world's counter-measure; after that the
// colony stays safe for a small upkeep, and its riches pay extra money every turn.

import { DEATH_WORLDS, type DeathWorldDef } from "./data/hazardWorlds";
import { colonyProduction } from "./formulas";
import { empireRace } from "./game";
import { fieldTier } from "./tech";
import type { Empire, GameState, Id, Star } from "./types";

export interface DeathWorldsState {
  /** Set once the death worlds have been marked. */
  placed: boolean;
  /** Star id -> empires that have had the scouting report. */
  seen: Record<Id, Id[]>;
}

const PREFIX = "death:";
/** About one death world per this many stars. */
export const STARS_PER_WORLD = 30;
/** Share of the extra production that becomes money (the riches). Kept modest: balance is the main Claude's call. */
export const RICHES_SHARE = 0.3; // main Claude 2026-11-26: 0.5 gave one empire up to 5% of its gross output as free cash (12-game playtest)

const BY_ID = new Map(DEATH_WORLDS.map((d) => [d.id, d]));

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** The death world on this star, if it is one. */
export function deathWorldOf(s: Star): DeathWorldDef | null {
  const sp = s.planet?.special;
  return sp && sp.startsWith(PREFIX) ? BY_ID.get(sp.slice(PREFIX.length)) ?? null : null;
}

/** Has this empire researched the counter-measure? */
export function countered(e: Empire, d: DeathWorldDef): boolean {
  return fieldTier(e.research, d.counter.field) >= d.counter.tier;
}

function place(state: GameState): void {
  const homes = new Set(state.empires.map((e) => e.capitalStarId));
  const salt = seedNumber(state);
  const spots = state.stars
    .filter((s) => s.planet && !s.planet.special && !state.colonies[s.id] && !homes.has(s.id))
    .sort((a, b) => ((a.id * 7919 + salt) % 9973) - ((b.id * 7919 + salt) % 9973) || a.id - b.id);
  const count = Math.min(spots.length, Math.max(1, Math.round(state.stars.length / STARS_PER_WORLD)));
  for (let i = 0; i < count; i++) {
    const d = DEATH_WORLDS[(salt + i) % DEATH_WORLDS.length]!;
    spots[i]!.planet!.special = PREFIX + d.id;
  }
}

function report(state: GameState, dw: DeathWorldsState): void {
  for (const s of state.stars) {
    const d = deathWorldOf(s);
    if (!d) continue;
    const seen = (dw.seen[s.id] ??= []);
    for (const e of state.empires) {
      if (!e.alive || seen.includes(e.id) || !e.knowledge[s.id]?.explored) continue;
      seen.push(e.id);
      state.events.push({ turn: state.turn, empireId: e.id, kind: "explored", starId: s.id,
        text: `${s.name} is a ${d.name}: ${d.description} Danger: ${d.hazard} Colonists will die there until we research ${d.counter.name} (${d.counter.field} tier ${d.counter.tier}).` });
    }
  }
}

/** Once a turn. */
export function processDeathWorlds(state: GameState): void {
  const dw = (state.deathWorlds ??= { placed: false, seen: {} });
  if (!dw.placed) { place(state); dw.placed = true; }
  report(state, dw);
  for (const c of Object.values(state.colonies)) {
    const s = state.stars[c.starId]!;
    const d = deathWorldOf(s);
    if (!d) continue;
    const e = state.empires[c.empireId]!;
    // Safe only with the counter-measure, and only while its upkeep is paid.
    const safe = countered(e, d) && e.treasury >= d.upkeep;
    if (safe) {
      e.treasury -= d.upkeep;
      e.treasury += Math.round(colonyProduction(c, s.planet!, e, empireRace(e)) * (d.productionMult - 1) * RICHES_SHARE);
    } else {
      c.population = Math.max(1, c.population - d.popLossPerTurn);
    }
  }
}
