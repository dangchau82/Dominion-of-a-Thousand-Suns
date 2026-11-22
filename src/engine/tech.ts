// Tech tree rules: which techs each empire can research, what they cost,
// and the stats an empire gets from the techs it knows.
//
// Like the classic game, each empire gets a random subset of the tree, so
// some techs are simply missing and you must trade or steal for them later.

import type { Race } from "./data/races";
import { TECHS, type Tech } from "./data/techs";
import * as R from "./rng";
import { FIELDS, type Empire, type ResearchField, type ResearchState } from "./types";

export const TECH_BY_ID: ReadonlyMap<string, Tech> = new Map(TECHS.map((t) => [t.id, t]));

export function tech(id: string): Tech {
  const t = TECH_BY_ID.get(id);
  if (!t) throw new Error(`No tech ${id}`);
  return t;
}

/**
 * Research points to learn a tech of each tier, divided by the race's research skill.
 * Cheap early (so the first techs arrive in tens of turns, not hundreds) and steep late.
 * Tuned by self-play so strong empires finish the tree around turn 300.
 */
export const TIER_COST: readonly number[] = [0, 40, 150, 450, 1200, 2800, 6000, 12000, 22000, 40000, 70000];
export function techCost(t: Tech, r: Race): number {
  return Math.round((TIER_COST[t.tier] ?? 70000) / r.research);
}

/** Chance each non-starting tech is in an empire's tree (at least one per field and tier is guaranteed). */
export const TECH_AVAILABLE_CHANCE = 0.6;

export const START_TECHS: readonly string[] = TECHS.filter((t) => t.start).map((t) => t.id);

/** Roll the techs an empire is able to research this game. Scientists (Vossari) get the full tree. */
export function rollTechPool(rng: R.RngState, race: Race): string[] {
  const out: string[] = [];
  for (const f of FIELDS) {
    for (let tier = 1; tier <= 10; tier++) {
      const group = TECHS.filter((t) => t.field === f && t.tier === tier && !t.start);
      if (group.length === 0) continue;
      const kept = race.id === "vossari" ? group : group.filter(() => R.chance(rng, TECH_AVAILABLE_CHANCE));
      if (kept.length === 0) kept.push(R.pick(rng, group));
      out.push(...kept.map((t) => t.id));
    }
  }
  return out;
}

export function newResearchState(rng: R.RngState, race: Race): ResearchState {
  const rs: ResearchState = {
    alloc: { computers: 15, construction: 20, forceFields: 10, planetology: 25, propulsion: 20, weapons: 10 },
    progress: { computers: 0, construction: 0, forceFields: 0, planetology: 0, propulsion: 0, weapons: 0 },
    known: [...START_TECHS],
    available: rollTechPool(rng, race),
    current: { computers: null, construction: null, forceFields: null, planetology: null, propulsion: null, weapons: null },
  };
  for (const f of FIELDS) rs.current[f] = autoPickIn(rs, f);
  return rs;
}

/** Highest tier known in a field (0 if none). */
export function fieldTier(rs: ResearchState, f: ResearchField): number {
  let best = 0;
  for (const id of rs.known) {
    const t = tech(id);
    if (t.field === f && t.tier > best) best = t.tier;
  }
  return best;
}

/**
 * Techs that can be chosen as the next project in a field: in this empire's
 * tree, not yet known, and at most one tier above the best known in that field.
 */
export function researchChoices(rs: ResearchState, f: ResearchField): Tech[] {
  const maxTier = fieldTier(rs, f) + 1;
  return rs.available
    .map(tech)
    .filter((t) => t.field === f && t.tier <= maxTier && !rs.known.includes(t.id))
    .sort((a, b) => a.tier - b.tier || a.id.localeCompare(b.id));
}

function autoPickIn(rs: ResearchState, f: ResearchField): string | null {
  return researchChoices(rs, f)[0]?.id ?? null;
}

/** Make sure the field has a valid project; pick the cheapest if not. */
export function ensureProject(rs: ResearchState, f: ResearchField): string | null {
  const cur = rs.current[f];
  if (cur && researchChoices(rs, f).some((t) => t.id === cur)) return cur;
  rs.current[f] = autoPickIn(rs, f);
  return rs.current[f];
}

export function learn(rs: ResearchState, id: string): void {
  if (!rs.known.includes(id)) rs.known.push(id);
}

// ---------- Stats from known techs ----------

export interface TechStats {
  // Bonuses that add up
  range: number; hostility: number; terraform: number; growth: number; popCost: number;
  productivity: number; robotControls: number; factoryCost: number; scan: number; research: number;
  // Best level known applies
  speed: number; computer: number; ecm: number; armor: number; shield: number; planetShield: number;
  specials: string[];
  weapons: string[];
}

const ADDS = ["range", "hostility", "terraform", "growth", "popCost", "productivity", "robotControls", "factoryCost", "scan", "research"] as const;
const BESTS = ["speed", "computer", "ecm", "armor", "shield", "planetShield"] as const;

const cache = new WeakMap<string[], { n: number; stats: TechStats }>();

export function techStats(e: Empire): TechStats {
  const known = e.research.known;
  const hit = cache.get(known);
  if (hit && hit.n === known.length) return hit.stats;
  const s: TechStats = {
    range: 0, hostility: 0, terraform: 0, growth: 0, popCost: 0, productivity: 0,
    robotControls: 0, factoryCost: 0, scan: 0, research: 0,
    speed: 0, computer: 0, ecm: 0, armor: 0, shield: 0, planetShield: 0,
    specials: [], weapons: [],
  };
  for (const id of known) {
    const t = TECH_BY_ID.get(id);
    if (!t) continue;
    for (const fx of t.effects) {
      if (fx.stat === "special") s.specials.push(fx.key);
      else if (fx.stat === "weapon") s.weapons.push(t.id);
      else if ((ADDS as readonly string[]).includes(fx.stat)) s[fx.stat as (typeof ADDS)[number]] += fx.value;
      else if ((BESTS as readonly string[]).includes(fx.stat)) {
        const k = fx.stat as (typeof BESTS)[number];
        s[k] = Math.max(s[k], fx.value);
      }
    }
  }
  cache.set(known, { n: known.length, stats: s });
  return s;
}
