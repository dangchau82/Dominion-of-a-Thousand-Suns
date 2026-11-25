// Ship designer rules: how big and how costly each part is, what a design
// can do, and checking that a design is legal for an empire.
// Miniaturization (parts shrink and get cheaper as you learn better tech in
// the same field) is adapted from Remnants of the Precursors (GPL-3.0).

import {
  BUILTIN_DESIGNS, HULLS, MAX_DESIGNS, SHIP_SPECIALS,
  type HullSize, type ShipDesign, type WeaponMount,
} from "./data/ships";
import type { Tech } from "./data/techs";
import { miniaturization, shipSpeed } from "./formulas";
import { fieldTier, tech, TECH_BY_ID } from "./tech";
import type { Empire, GameState, Id } from "./types";

export function shipDesign(state: GameState, id: string): ShipDesign {
  const d = BUILTIN_DESIGNS[id] ?? state.designs[id];
  if (!d) throw new Error(`Unknown ship design ${id}`);
  return d;
}

/** Designs an empire can build: the built-ins plus its own. */
export function designsOf(state: GameState, empireId: Id): ShipDesign[] {
  return [...Object.values(BUILTIN_DESIGNS), ...Object.values(state.designs).filter((d) => d.empireId === empireId)];
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
  weapons: { name: string; kind: string; count: number; min: number; max: number }[];
}

export function designStats(e: Empire, spec: DesignSpec): DesignStats {
  const h = HULLS[spec.hull];
  let used = 0;
  let cost = h.cost;
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
    const p = specialPart(e, id, spec.hull);
    used += p.space; cost += p.cost;
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
    weapons,
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
  for (const id of spec.specials) if (!parts.specials.some((t) => t.id === id)) return "You don't know that special";
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
    role: "warship",
    hull: spec.hull,
    computer: spec.computer, shield: spec.shield, ecm: spec.ecm, armor: spec.armor,
    weapons: spec.weapons.filter((w) => w.count > 0).map((w) => ({ ...w })),
    specials: [...spec.specials],
    cost: st.cost,
    space: Math.round(st.spaceUsed * 10) / 10,
    extraRange: 0,
  };
  state.designs[d.id] = d;
  return d;
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
