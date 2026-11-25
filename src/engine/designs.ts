// Ship designer rules: how big and how costly each part is, what a design
// can do, and checking that a design is legal for an empire.
// Miniaturization (parts shrink and get cheaper as you learn better tech in
// the same field) is adapted from Remnants of the Precursors (GPL-3.0).

import {
  BUILTIN_DESIGNS, COLONY_POD, FUEL_TANKS, HULLS, MAX_DESIGNS, SHIP_SPECIALS,
  type HullSize, type ShipDesign, type ShipRole, type WeaponMount,
} from "./data/ships";
import type { Tech } from "./data/techs";
import { FIGHTER_BAYS, FIGHTER_VARIANTS, type FighterBayDef } from "./data/carriers";
import type { FighterMount } from "./data/ships";
import { miniaturization, shipSpeed } from "./formulas";
import { fieldTier, tech, TECH_BY_ID } from "./tech";
import type { Empire, GameState, Id } from "./types";

export function shipDesign(state: GameState, id: string): ShipDesign {
  const d = BUILTIN_DESIGNS[id] ?? state.designs[id];
  if (!d) throw new Error(`Unknown ship design ${id}`);
  return d;
}

/** Designs an empire can build: the built-ins (except troop transports) plus its own. */
export function designsOf(state: GameState, empireId: Id): ShipDesign[] {
  return [
    ...Object.values(BUILTIN_DESIGNS).filter((d) => d.role !== "transport"),
    ...Object.values(state.designs).filter((d) => d.empireId === empireId),
  ];
}

export type SystemSlot = "computer" | "shield" | "ecm" | "armor";
const SLOT_STAT: Record<SystemSlot, "computer" | "shield" | "ecm" | "armor"> = {
  computer: "computer", shield: "shield", ecm: "ecm", armor: "armor",
};

function statValue(t: Tech, stat: string): number {
  for (const fx of t.effects) if (fx.stat === stat && "value" in fx) return fx.value;
  return 0;
}

function weaponOf(t: Tech) {
  for (const fx of t.effects) if (fx.stat === "weapon") return fx;
  return null;
}

/** Shrink factor for an old part: newer tech in the same field makes it smaller and cheaper. */
function mini(e: Empire, t: Tech): number {
  return miniaturization(fieldTier(e.research, t.field) - t.tier);
}

export interface PartSize {
  space: number;
  cost: number;
}

/** Hull-wide systems grow with the hull. */
export function systemPart(e: Empire, slot: SystemSlot, techId: string, hull: HullSize): PartSize {
  const t = tech(techId);
  const level = statValue(t, SLOT_STAT[slot]);
  const h = HULLS[hull];
  const m = mini(e, t);
  switch (slot) {
    case "computer": return { space: 2 * level * h.factor * m, cost: 1.5 * level * h.factor * m };
    case "ecm": return { space: 2 * level * h.factor * m, cost: 1.5 * level * h.factor * m };
    case "shield": return { space: 1.5 * level * h.factor * m, cost: 1.2 * level * h.factor * m };
    case "armor": return { space: h.space * 0.1 * m, cost: h.cost * 0.15 * level * m };
  }
}

/** One weapon of this kind (weapons don't grow with the hull; bigger hulls just fit more). */
export function weaponPart(e: Empire, techId: string): PartSize {
  const t = tech(techId);
  const w = weaponOf(t);
  const m = mini(e, t);
  const base = w?.kind === "torpedo" ? 20 : w?.kind === "bomb" || w?.kind === "missile" ? 10 : 8;
  return { space: (base + t.tier * 2) * m, cost: (4 + t.tier * 3) * m };
}

export function specialPart(e: Empire, techId: string, hull: HullSize): PartSize {
  const t = tech(techId);
  const h = HULLS[hull];
  const m = mini(e, t);
  return { space: h.space * 0.12 * m, cost: (h.cost * 0.3 + t.tier * 2) * m };
}

// ---------- carriers ----------

export const BAY_BY_ID: ReadonlyMap<string, FighterBayDef> = new Map(FIGHTER_BAYS.map((b) => [b.id, b]));
/** Most bays one ship can carry. */
export const MAX_BAYS = 6;
/** Which bay first unlocks each fighter variant. */
export const VARIANT_UNLOCK: Record<string, string> = {
  interceptor: "fighter-bay-1", "heavy-fighter": "fighter-bay-1", bomber: "fighter-bay-2", "salvo-wing": "fighter-bay-3",
};

/** Fighter bays this empire can fit: each unlocks at a research tier in its field. */
export function fighterBayChoices(e: Empire): FighterBayDef[] {
  return FIGHTER_BAYS.filter((b) => fieldTier(e.research, b.field) >= b.tier);
}

/** Fighter variants this empire can choose. */
export function fighterVariantChoices(e: Empire) {
  const known = new Set(fighterBayChoices(e).map((b) => b.id));
  return FIGHTER_VARIANTS.filter((v) => known.has(VARIANT_UNLOCK[v.id] ?? ""));
}

export interface FighterStats {
  name: string; hits: number; min: number; max: number; shots: number; intercept: number;
}

/** Fighters carry light versions of the best beam their empire knows, so they keep up with shields. */
export const FIGHTER_BEAM_SHARE = 0.75;

/** The best beam weapon an empire knows (by average damage), for arming its fighters. */
export function bestBeam(e: Empire): { min: number; max: number } | null {
  let best: { min: number; max: number } | null = null;
  for (const id of e.research.known) {
    const fx = weaponOf(tech(id));
    if (fx && fx.kind === "beam" && (!best || fx.min + fx.max > best.min + best.max)) best = { min: fx.min, max: fx.max };
  }
  return best;
}

/** One fighter from this bay, with its variant applied. Its guns are the bay's own, or a share of the empire's best beam if that hits harder. */
export function fighterStats(bayId: string, variant?: string, beam?: { min: number; max: number } | null): FighterStats {
  const b = BAY_BY_ID.get(bayId)!;
  const v = variant ? FIGHTER_VARIANTS.find((x) => x.id === variant) : undefined;
  const ch = v?.change ?? {};
  const dmg = ch.damageMul ?? 1;
  let [lo, hi] = b.fighter.damage;
  // Per shot: a fighter with two shots splits the same firepower between them.
  const share = FIGHTER_BEAM_SHARE / b.fighter.shots;
  if (beam && (beam.min + beam.max) * share > lo + hi) { lo = beam.min * share; hi = beam.max * share; }
  return {
    name: v ? v.name : "Fighter",
    hits: Math.max(1, Math.round(b.fighter.hits * (ch.hitsMul ?? 1))),
    min: Math.max(1, Math.round(lo * dmg)),
    max: Math.max(1, Math.round(hi * dmg)),
    shots: b.fighter.shots + (ch.shotsAdd ?? 0),
    intercept: Math.min(0.6, b.fighter.intercept + (ch.interceptAdd ?? 0)),
  };
}

/** Room and cost of one bay; older bays shrink like other parts. */
export function bayPart(e: Empire, bayId: string, hull: HullSize): PartSize {
  const b = BAY_BY_ID.get(bayId)!;
  const h = HULLS[hull];
  const m = miniaturization(fieldTier(e.research, b.field) - b.tier);
  return { space: h.space * b.spaceShare * m, cost: h.cost * b.costShare * m };
}

/** Fighters one carrier launches. */
export function fightersPerShip(m: FighterMount | undefined, hull: HullSize): number {
  if (!m || m.count <= 0) return 0;
  return (BAY_BY_ID.get(m.bayId)?.fighters[hull] ?? 0) * m.count;
}

/** What the player fills in; cost and space are worked out from it. */
export interface DesignSpec {
  name: string;
  hull: HullSize;
  computer: string | null;
  shield: string | null;
  ecm: string | null;
  armor: string | null;
  weapons: WeaponMount[];
  specials: string[];
  /** "warship" (default) or "colony" (a Large hull with a colony pod; no weapons). */
  role?: ShipRole;
  /** Fighter bays (Large and Huge warships). */
  bays?: FighterMount;
}

export interface DesignStats {
  space: number;
  spaceUsed: number;
  cost: number;
  hits: number;
  attack: number;
  beamDefense: number;
  missileDefense: number;
  shield: number;
  speed: number;
  /** Extra fuel range this design carries (light-years). */
  extraRange: number;
  weapons: { name: string; kind: string; count: number; min: number; max: number }[];
  /** Fighters this ship launches, or null. */
  fighters: (FighterStats & { count: number }) | null;
}

/** True once the empire knows any tech that adds fuel range. */
export function canUseFuelTanks(e: Empire): boolean {
  return e.research.known.some((id) => TECH_BY_ID.get(id)?.effects.some((fx) => fx.stat === "range"));
}

export function fuelTankPart(hull: HullSize): PartSize {
  const h = HULLS[hull];
  return { space: h.space * FUEL_TANKS.spaceShare, cost: Math.max(1, h.cost * FUEL_TANKS.costShare) };
}

export function designStats(e: Empire, spec: DesignSpec): DesignStats {
  const h = HULLS[spec.hull];
  const colony = spec.role === "colony";
  let used = colony ? COLONY_POD.space : 0;
  let cost = colony ? COLONY_POD.cost : h.cost;
  for (const slot of ["computer", "shield", "ecm", "armor"] as SystemSlot[]) {
    const id = spec[slot];
    if (!id) continue;
    const p = systemPart(e, slot, id, spec.hull);
    used += p.space; cost += p.cost;
  }
  const weapons: DesignStats["weapons"] = [];
  for (const w of spec.weapons) {
    if (w.count <= 0) continue;
    const p = weaponPart(e, w.techId);
    used += p.space * w.count; cost += p.cost * w.count;
    const t = tech(w.techId);
    const fx = weaponOf(t);
    if (fx) weapons.push({ name: t.name, kind: fx.kind, count: w.count, min: fx.min, max: fx.max });
  }
  for (const id of spec.specials) {
    const p = id === FUEL_TANKS.id ? fuelTankPart(spec.hull) : specialPart(e, id, spec.hull);
    used += p.space; cost += p.cost;
  }
  let fighters: DesignStats["fighters"] = null;
  if (spec.bays && spec.bays.count > 0 && BAY_BY_ID.has(spec.bays.bayId)) {
    const p = bayPart(e, spec.bays.bayId, spec.hull);
    used += p.space * spec.bays.count; cost += p.cost * spec.bays.count;
    const count = fightersPerShip(spec.bays, spec.hull);
    if (count > 0) fighters = { ...fighterStats(spec.bays.bayId, spec.bays.variant, bestBeam(e)), count };
  }
  const lvl = (id: string | null, stat: string) => (id ? statValue(tech(id), stat) : 0);
  const armor = lvl(spec.armor, "armor");
  return {
    space: h.space,
    spaceUsed: used,
    cost: Math.round(cost * 10) / 10,
    hits: Math.round(h.hits * (1 + 0.5 * Math.max(0, armor - 1)) * 10) / 10,
    attack: lvl(spec.computer, "computer"),
    beamDefense: h.defense,
    missileDefense: h.defense + lvl(spec.ecm, "ecm"),
    shield: lvl(spec.shield, "shield"),
    speed: shipSpeed(e),
    extraRange: spec.specials.includes(FUEL_TANKS.id) ? FUEL_TANKS.range : 0,
    weapons,
    fighters,
  };
}

/** Techs this empire knows that can fill each kind of slot. */
export function partChoices(e: Empire) {
  const known = e.research.known.map((id) => TECH_BY_ID.get(id)).filter((t): t is Tech => !!t);
  const withStat = (stat: string) => known.filter((t) => t.effects.some((fx) => fx.stat === stat));
  return {
    computer: withStat("computer"),
    shield: withStat("shield"),
    ecm: withStat("ecm"),
    armor: withStat("armor"),
    weapons: withStat("weapon"),
    specials: known.filter((t) => SHIP_SPECIALS.includes(t.id)),
  };
}

/** Returns an error message, or null if the design is legal for this empire. */
export function checkDesign(state: GameState, e: Empire, spec: DesignSpec): string | null {
  const name = spec.name.trim();
  if (!name || name.length > 24) return "Give the design a name (up to 24 letters)";
  if (!HULLS[spec.hull]) return "Unknown hull";
  if (spec.role !== undefined && spec.role !== "warship" && spec.role !== "colony") return "Unknown ship role";
  if (spec.role === "colony") {
    if (spec.hull !== COLONY_POD.hull) return "Colony ships use the Large hull";
    if (spec.weapons.some((w) => w.count > 0)) return "Colony ships carry no weapons";
  }
  if (designsOf(state, e.id).some((d) => d.name.toLowerCase() === name.toLowerCase())) return "You already have a design with that name";
  if (designsOf(state, e.id).filter((d) => d.empireId !== null).length >= MAX_DESIGNS) return `You can keep ${MAX_DESIGNS} designs; scrap one first`;
  const parts = partChoices(e);
  for (const slot of ["computer", "shield", "ecm", "armor"] as SystemSlot[]) {
    const id = spec[slot];
    if (id && !parts[slot].some((t) => t.id === id)) return `You don't know that ${slot}`;
  }
  if (spec.weapons.length > 4) return "Four weapon banks at most";
  for (const w of spec.weapons) {
    if (!Number.isInteger(w.count) || w.count < 0) return "Bad weapon count";
    if (w.count > 0 && !parts.weapons.some((t) => t.id === w.techId)) return "You don't know that weapon";
  }
  if (spec.specials.length > 3) return "Three specials at most";
  if (new Set(spec.specials).size !== spec.specials.length) return "Each special only once";
  for (const id of spec.specials) {
    if (id === FUEL_TANKS.id) { if (!canUseFuelTanks(e)) return "Learn a fuel cell tech to fit fuel tanks"; continue; }
    if (spec.role === "colony") return "Colony ships can only add fuel tanks";
    if (!parts.specials.some((t) => t.id === id)) return "You don't know that special";
  }
  if (spec.bays && spec.bays.count !== 0) {
    const b = BAY_BY_ID.get(spec.bays.bayId);
    if (!b) return "Unknown fighter bay";
    if (!Number.isInteger(spec.bays.count) || spec.bays.count < 0 || spec.bays.count > MAX_BAYS) return `Up to ${MAX_BAYS} fighter bays`;
    if (spec.role === "colony") return "Colony ships carry no fighters";
    if (!b.hulls.includes(spec.hull)) return "Fighter bays need a Large or Huge hull";
    if (!fighterBayChoices(e).some((x) => x.id === b.id)) return "You can't build that fighter bay yet";
    if (spec.bays.variant !== undefined && !fighterVariantChoices(e).some((v) => v.id === spec.bays!.variant)) return "You can't build that fighter type yet";
  }
  const st = designStats(e, spec);
  if (st.spaceUsed > st.space + 1e-9) return "Not enough room on this hull";
  return null;
}

export function addDesign(state: GameState, e: Empire, spec: DesignSpec): ShipDesign {
  const st = designStats(e, spec);
  const d: ShipDesign = {
    id: `d${state.nextDesignId++}`,
    empireId: e.id,
    name: spec.name.trim(),
    role: spec.role ?? "warship",
    hull: spec.hull,
    computer: spec.computer, shield: spec.shield, ecm: spec.ecm, armor: spec.armor,
    weapons: spec.weapons.filter((w) => w.count > 0).map((w) => ({ ...w })),
    specials: [...spec.specials],
    cost: st.cost,
    space: Math.round(st.spaceUsed * 10) / 10,
    extraRange: st.extraRange,
    ...(spec.bays && spec.bays.count > 0 ? { bays: { ...spec.bays } } : {}),
  };
  state.designs[d.id] = d;
  return d;
}

/** True if this ship type can found colonies. */
export function isColonyShip(state: GameState, id: string): boolean {
  const d = BUILTIN_DESIGNS[id] ?? state.designs[id];
  return d?.role === "colony";
}

/** Number of colony ships (any colony design) in a fleet's ship list. */
export function colonyShipCount(state: GameState, ships: Record<string, number>): number {
  return Object.entries(ships).reduce((n, [id, k]) => n + (k > 0 && isColonyShip(state, id) ? k : 0), 0);
}

/** Fraction of a design's cost refunded when it's scrapped along with its ships. */
export const SCRAP_REFUND = 0.25;

/** The two warship designs every empire starts with, like the classic game. */
export function starterDesigns(): DesignSpec[] {
  return [
    { name: "Fighter", hull: "small", computer: "basic-computer", shield: null, ecm: null, armor: "hull-plating",
      weapons: [{ techId: "laser", count: 1 }], specials: [] },
    { name: "Destroyer", hull: "medium", computer: "basic-computer", shield: null, ecm: null, armor: "hull-plating",
      weapons: [{ techId: "laser", count: 3 }, { techId: "nuclear-missile", count: 2 }], specials: [] },
  ];
}
