// Future technologies: tiers 11 and up in every field, for the late game (Danny, 2026-11-26:
// "expand on future tech for late stages"). Before this, a field at tier 10 had nothing left
// to research and its points were wasted. Each level is a little stronger and costs more
// (see TIER_COST in tech.ts). They are always in every empire's tree, and they do not count
// toward the technology victory, which still needs tier 10 in all six fields.
// Names, descriptions and quotes are original to this game.

import type { Tech } from "./techs";
import type { ResearchField } from "../types";

export const FUTURE_LEVELS = 10;
/** Weapons get fewer future levels: each one is a new gun in the ship designer. */
export const FUTURE_WEAPON_LEVELS = 6;

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

interface FieldPlan {
  field: ResearchField;
  name: string;
  levels: number;
  effects: (l: number) => Tech["effects"];
  description: (l: number) => string;
  quote: string;
}

const PLANS: FieldPlan[] = [
  {
    field: "computers", name: "Deep Cognition", levels: FUTURE_LEVELS,
    effects: (l) => [{ stat: "research", value: 0.04 }, { stat: "computer", value: 8 + Math.ceil(l / 2) }],
    description: (l) => `Research +4%, and ship targeting rises to level ${8 + Math.ceil(l / 2)}.`,
    quote: "Every answer we find opens a larger room full of questions. — Loremaster Ixa Venn",
  },
  {
    field: "construction", name: "Self-Building Industry", levels: FUTURE_LEVELS,
    effects: (l) => [{ stat: "productivity", value: 0.08 }, { stat: "armor", value: 7 + Math.ceil(l / 2) }],
    description: (l) => `Each worker makes 0.08 BC more, and ship armor rises to level ${7 + Math.ceil(l / 2)}.`,
    quote: "The factories design their own successors now. We just name them. — Foreman Dask Orrel",
  },
  {
    field: "forceFields", name: "Woven Space", levels: FUTURE_LEVELS,
    effects: (l) => [{ stat: "shield", value: 15 + l }],
    description: (l) => `Ship shields rise to level ${15 + l}.`,
    quote: "We no longer block the blow. We fold the space it travels through. — Warden Sael",
  },
  {
    field: "planetology", name: "World Shaping", levels: FUTURE_LEVELS,
    effects: () => [{ stat: "terraform", value: 5 }, { stat: "growth", value: 0.04 }],
    description: () => "Every world holds 5 more people, and populations grow 4% faster.",
    quote: "A planet is a garden that takes ten thousand years to answer. We are patient. — Tender Mirow",
  },
  {
    field: "propulsion", name: "Stellar Currents", levels: FUTURE_LEVELS,
    effects: (l) => [{ stat: "range", value: 2 }, { stat: "scan", value: 3 }, { stat: "speed", value: 7 + l * 0.5 }],
    description: (l) => `Fuel range +2 ly, scanners +3 ly, and ship speed ${7 + l * 0.5} ly per turn.`,
    quote: "The galaxy is not large. We were simply slow. — Navigator Corr Ahlen",
  },
  {
    field: "weapons", name: "Starfire Lance", levels: FUTURE_WEAPON_LEVELS,
    effects: (l) => [{ stat: "weapon", kind: "beam", min: 50 + l * 12, max: 100 + l * 20 }],
    description: (l) => `A heavy beam weapon dealing ${50 + l * 12} to ${100 + l * 20} damage.`,
    quote: "It is not a gun. It is a small, angry sunrise. — Gunnery Chief Tor Maddoc",
  },
];

/** Every future technology, tiers 11 to 10 + levels in each field. */
export const FUTURE_TECHS: readonly Tech[] = PLANS.flatMap((p) =>
  Array.from({ length: p.levels }, (_, i): Tech => {
    const l = i + 1;
    return {
      id: `future-${p.field.toLowerCase()}-${l}`,
      name: `${p.name} ${ROMAN[l]}`,
      field: p.field,
      tier: 10 + l,
      effects: p.effects(l),
      description: p.description(l),
      quote: p.quote,
    };
  }));

export const isFutureTech = (id: string): boolean => id.startsWith("future-");
