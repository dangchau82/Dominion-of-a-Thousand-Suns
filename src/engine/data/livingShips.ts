// Living ships: grown, not built. Written by Gemini (2026-11-25), checked by Claude; rules built by Claude.

export type LivingEffect =
  | { kind: "armor"; value: 1 | 2 | 3 }          // tougher hide
  | { kind: "evasion"; value: 1 | 2 | 3 }        // harder to hit
  | { kind: "shieldPierce"; value: 1 | 2 | 3 }   // ignores this much enemy shield
  | { kind: "speed"; value: 1 | 2 }              // moves faster
  | { kind: "aim"; value: 1 | 2 }                // better attack
  | { kind: "hits"; value: 0.1 | 0.2 | 0.3 }     // +10% to +30% hit points
  | { kind: "regrow"; value: 0.1 | 0.2 | 0.3 };  // heals this share of hit points after each battle

export interface LivingTrait {
  id: string;
  name: string;           // e.g. "Spined Hide"
  description: string;    // under 20 words
  effects: LivingEffect[]; // 1 effect for ordinary traits
}

export interface Mutation extends LivingTrait {
  /** Every mutation has a small catch. */
  drawback: LivingEffect | { kind: "slower"; value: 1 } | { kind: "fragile"; value: 0.1 };
}

/** What each organic race calls its ships at each life stage. */
export interface LivingLineage {
  raceId: "kethrak" | "verdane" | "ixil" | "ruuvak" | "anyone";
  hatchling: string;      // name for young ships
  adult: string;
  elder: string;
  flavour: string;        // one sentence on how they grow ships, under 30 words
}

export const LIVING_TRAITS: LivingTrait[] = [
  {
    id: "spined-hide",
    name: "Spined Hide",
    description: "Layered calcified plates absorb kinetic impacts and deflect glancing beam fire.",
    effects: [{ kind: "armor", value: 2 }],
  },
  {
    id: "spore-shroud",
    name: "Spore Shroud",
    description: "Dense clouds of refractive spores blur target locks and confuse enemy gunners.",
    effects: [{ kind: "evasion", value: 2 }],
  },
  {
    id: "acid-glands",
    name: "Acid Glands",
    description: "Corrosive bio-plasma dissolves energy barriers on contact, bypassing enemy shields.",
    effects: [{ kind: "shieldPierce", value: 2 }],
  },
  {
    id: "swift-fins",
    name: "Swift Fins",
    description: "Muscular solar-sail membranes catch stellar winds to propel vessels faster between stars.",
    effects: [{ kind: "speed", value: 1 }],
  },
  {
    id: "symbiotic-crew",
    name: "Symbiotic Crew",
    description: "Neural tendrils link pilots directly to bio-cannons for instinctive firing precision.",
    effects: [{ kind: "aim", value: 1 }],
  },
  {
    id: "dense-heartwood",
    name: "Dense Heartwood",
    description: "Fibrous internal bulkheads reinforce vital organs against catastrophic hull breaches.",
    effects: [{ kind: "hits", value: 0.2 }],
  },
  {
    id: "regenerative-marrow",
    name: "Regenerative Marrow",
    description: "Stem-hive reservoirs knit torn tissue and seal hull ruptures rapidly after battle.",
    effects: [{ kind: "regrow", value: 0.2 }],
  },
  {
    id: "chitin-scales",
    name: "Chitin Scales",
    description: "Overlapping organic scales provide lightweight protection for young brood-vessels.",
    effects: [{ kind: "armor", value: 1 }],
  },
  {
    id: "graviton-bladders",
    name: "Graviton Bladders",
    description: "Pressurized bio-sacs vent superheated gas for rapid interstellar acceleration.",
    effects: [{ kind: "speed", value: 2 }],
  },
  {
    id: "compound-sensors",
    name: "Compound Sensors",
    description: "Faceted optical organs track multiple maneuvering targets simultaneously.",
    effects: [{ kind: "aim", value: 2 }],
  },
  {
    id: "enzyme-borers",
    name: "Enzyme Borers",
    description: "Microscopic shield-eating organisms weaken enemy force fields ahead of impact.",
    effects: [{ kind: "shieldPierce", value: 1 }],
  },
  {
    id: "chromatophore-skin",
    name: "Chromatophore Skin",
    description: "Color-shifting dermis blends the hull against deep-space background radiation.",
    effects: [{ kind: "evasion", value: 1 }],
  },
];

export const MUTATIONS: Mutation[] = [
  {
    id: "mut-abyssal-shell",
    name: "Abyssal Dread-Shell",
    description: "Fuses hull plates into an impenetrable bone fortress at the cost of sluggish handling.",
    effects: [{ kind: "armor", value: 3 }],
    drawback: { kind: "slower", value: 1 },
  },
  {
    id: "mut-phase-spores",
    name: "Phase-Shift Spores",
    description: "Exudes shimmering dust that makes the elder almost impossible to target, thinning its hide.",
    effects: [{ kind: "evasion", value: 3 }],
    drawback: { kind: "fragile", value: 0.1 },
  },
  {
    id: "mut-void-venom",
    name: "Void-Venom Fangs",
    description: "Secretes hyper-acidic bile that shreds shields completely while straining internal reserves.",
    effects: [{ kind: "shieldPierce", value: 3 }],
    drawback: { kind: "fragile", value: 0.1 },
  },
  {
    id: "mut-leviathan-bulk",
    name: "Leviathan Bulk",
    description: "Unchecked cellular growth creates a massive, self-healing titan that moves ponderously.",
    effects: [{ kind: "hits", value: 0.3 }, { kind: "regrow", value: 0.2 }],
    drawback: { kind: "slower", value: 1 },
  },
  {
    id: "mut-apex-predator",
    name: "Apex Reflexes",
    description: "Hyper-evolved ganglia sharpen aim and dodging while stripping away heavy outer plating.",
    effects: [{ kind: "aim", value: 2 }, { kind: "evasion", value: 2 }],
    drawback: { kind: "fragile", value: 0.1 },
  },
  {
    id: "mut-solar-wings",
    name: "Solar-Sail Wings",
    description: "Enormous crystalline sails grant blazing speed and agility but leave the frame delicate.",
    effects: [{ kind: "speed", value: 2 }, { kind: "evasion", value: 2 }],
    drawback: { kind: "fragile", value: 0.1 },
  },
  {
    id: "mut-hive-mind-synapse",
    name: "Overmind Synapse",
    description: "A matured neural core coordinates pinpoint strikes and rapid tissue repair, slowing transit.",
    effects: [{ kind: "aim", value: 2 }, { kind: "regrow", value: 0.2 }],
    drawback: { kind: "slower", value: 1 },
  },
  {
    id: "mut-iron-bark",
    name: "Iron-Bark Bastion",
    description: "Mineral-rich sap hardens into dense armor and massive hull mass, weighing the ship down.",
    effects: [{ kind: "armor", value: 2 }, { kind: "hits", value: 0.2 }],
    drawback: { kind: "slower", value: 1 },
  },
  {
    id: "mut-caustic-bloom",
    name: "Caustic Bloom",
    description: "Spore clouds eat through enemy shields while masking the hull, though internal structure weakens.",
    effects: [{ kind: "shieldPierce", value: 2 }, { kind: "evasion", value: 2 }],
    drawback: { kind: "fragile", value: 0.1 },
  },
  {
    id: "mut-hydra-heart",
    name: "Hydra Heart",
    description: "Twin bio-reactors pump boundless vitality through hardened arteries at reduced cruise speed.",
    effects: [{ kind: "regrow", value: 0.3 }, { kind: "armor", value: 2 }],
    drawback: { kind: "slower", value: 1 },
  },
];

export const LINEAGES: LivingLineage[] = [
  {
    raceId: "kethrak",
    hatchling: "Larva",
    adult: "Chitin",
    elder: "Broodmother",
    flavour: "Kethrak queens gestate living hulls inside subterranean royal chambers, feeding them mineral slurry until they split the crust.",
  },
  {
    raceId: "verdane",
    hatchling: "Sapling",
    adult: "Bough",
    elder: "Worldtree",
    flavour: "Verdane arborists sing solar seeds into orbital nurseries, weaving root-tendrils and ironwood bark around photosynthetic cores.",
  },
  {
    raceId: "ixil",
    hatchling: "Polyp",
    adult: "Symbiont",
    elder: "Sovereign",
    flavour: "Ixil weavers graft neural polyps onto deep-void organisms, coaxing ship and crew to fuse into one silent body.",
  },
  {
    raceId: "ruuvak",
    hatchling: "Whelp",
    adult: "Stalker",
    elder: "Behemoth",
    flavour: "Ruuvak pack-masters breed void-beasts in crater pens, culling the weak until only ferocious hunters earn armor.",
  },
  {
    raceId: "anyone",
    hatchling: "Graftling",
    adult: "Bioship",
    elder: "Leviathan",
    flavour: "Orbital bio-vats culture synthetic muscle and bone around alloy skeletons, awakening programmable organic starships.",
  },
];