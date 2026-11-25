// Ship hulls and the built-in designs every empire shares.
// Hull numbers follow the classic four sizes (space, cost and hits grow about 5x per size).

import type { Id } from "../types";

export type HullSize = "small" | "medium" | "large" | "huge";
export const HULL_SIZES: readonly HullSize[] = ["small", "medium", "large", "huge"];

export interface Hull {
  name: string;
  /** Room for components. */
  space: number;
  /** Cost of the empty hull in BC. */
  cost: number;
  /** Hit points before armor. */
  hits: number;
  /** Base chance-to-dodge bonus: small ships are harder to hit. */
  defense: number;
  /** How much bigger hull-wide parts (computers, shields, jammers, armor) are on this hull. */
  factor: number;
}

export const HULLS: Record<HullSize, Hull> = {
  small: { name: "Small", space: 40, cost: 6, hits: 3, defense: 2, factor: 1 },
  medium: { name: "Medium", space: 200, cost: 36, hits: 18, defense: 1, factor: 5 },
  large: { name: "Large", space: 1000, cost: 200, hits: 100, defense: 0, factor: 25 },
  huge: { name: "Huge", space: 5000, cost: 1200, hits: 600, defense: 0, factor: 125 },
};

export type ShipRole = "scout" | "colony" | "warship" | "transport";

export interface WeaponMount {
  techId: string;
  count: number;
}

export interface ShipDesign {
  id: string;
  /** null for the built-in designs every empire can build. */
  empireId: Id | null;
  name: string;
  role: ShipRole;
  hull: HullSize;
  computer: string | null;
  shield: string | null;
  ecm: string | null;
  armor: string | null;
  /** Up to four weapon banks. */
  weapons: WeaponMount[];
  /** Up to three special systems (tech ids). */
  specials: string[];
  /** Fixed when the design is made, like the classic game. */
  cost: number;
  space: number;
  /** Extra fuel range beyond the empire's base range (light-years). */
  extraRange: number;
}

const builtin = (d: Pick<ShipDesign, "id" | "name" | "role" | "hull" | "cost" | "extraRange">): ShipDesign => ({
  empireId: null, computer: null, shield: null, ecm: null, armor: null, weapons: [], specials: [], space: 0, ...d,
});

export const BUILTIN_DESIGNS: Record<string, ShipDesign> = {
  scout: builtin({ id: "scout", name: "Scout", role: "scout", hull: "small", cost: 12, extraRange: 3 }),
  colony: builtin({ id: "colony", name: "Colony Ship", role: "colony", hull: "large", cost: 150, extraRange: 0 }),
  /** Troop transports carry population; each one holds one unit of troops. Made by "send troops", never built. */
  transport: builtin({ id: "transport", name: "Troop Transport", role: "transport", hull: "small", cost: 0, extraRange: 0 }),
};

/** Extended Fuel Tanks: a ship part that adds range. Unlocked by learning any fuel-range tech. */
export const FUEL_TANKS = { id: "fuel-tanks", name: "Extended Fuel Tanks", range: 3, spaceShare: 0.1, costShare: 0.1 } as const;

/** A custom colony ship is a Large hull built around a colony pod; the rest of the room is free for extras. */
export const COLONY_POD = { hull: "large" as HullSize, space: 700, cost: 150 } as const;

/** Each empire may keep this many designs of its own (built-ins don't count). */
export const MAX_DESIGNS = 6;

/** Cost in BC of one missile base (planetary defense). */
export const MISSILE_BASE_COST = 50;
/** Each base after the first costs 15% more than the base price (so defenses can't grow without limit). */
export const MISSILE_BASE_STEP = 0.15;
/** Most bases a colony can keep: a flat 10 plus one per 10 population. */
export function maxMissileBases(population: number): number {
  return 10 + Math.floor(population / 10);
}
/** Price of the next missile base for a colony that already has `have`. */
export function missileBaseCost(have: number): number {
  return MISSILE_BASE_COST * (1 + MISSILE_BASE_STEP * have);
}
/** Starting fleet for every empire (same for player and AI). */
export const STARTING_FLEET: Record<string, number> = { scout: 2, colony: 1 };

/** Special systems that go on ships (other "special" techs work empire-wide). */
export const SHIP_SPECIALS: readonly string[] = [
  "inertial-dampers", "warp-dampener", "subspace-interdictor", "stasis-field", "cloaking-field",
  "repulsor-beam", "displacement-field", "planet-cracker",
];
