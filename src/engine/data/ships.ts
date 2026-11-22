// Stage 1 ship templates. Stage 2 replaces these with the ship designer.

export type ShipRole = "scout" | "colony";

export interface ShipTemplate {
  id: string;
  name: string;
  role: ShipRole;
  /** Cost in BC (production points). */
  cost: number;
  /** Extra fuel range beyond the empire's base range (light-years). */
  extraRange: number;
}

export const SHIP_TEMPLATES: Record<string, ShipTemplate> = {
  scout: { id: "scout", name: "Scout", role: "scout", cost: 12, extraRange: 3 },
  colony: { id: "colony", name: "Colony Ship", role: "colony", cost: 150, extraRange: 0 },
};

export function template(id: string): ShipTemplate {
  const t = SHIP_TEMPLATES[id];
  if (!t) throw new Error(`Unknown ship template ${id}`);
  return t;
}

/** Cost in BC of one missile base (planetary defense). */
export const MISSILE_BASE_COST = 50;
/** Starting fleet for every empire (same for player and AI). */
export const STARTING_FLEET: Record<string, number> = { scout: 2, colony: 1 };
