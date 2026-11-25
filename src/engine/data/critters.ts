// Invasive critters: a comic event chain. Written by Gemini (2026-11-25), checked by Claude; rules built by Claude.
import type { GameEventDef } from "./events";

export interface CritterDef {
  name: string;                // the creature's name (original!)
  description: string;         // under 30 words
}

export const CRITTER: CritterDef = {
  name: "Tumble-Thrum",
  description:
    "A spherical, apricot-furred fuzzball that purrs in warm three-note chords, radiates gentle heat, and divides into twins whenever fed carbohydrates.",
};

/**
 * In order; each fires 4-6 turns after the last, only if the critters weren't stopped. trigger "colony".
 * Note for engine wiring: choice index 2 in events 1 through 4 stops the chain early.
 */
export const CRITTER_CHAIN: GameEventDef[] = [
  {
    id: "critter-1-dockside-pet",
    title: "A Pocketful of Purrs",
    art: "contact",
    trigger: "colony",
    text: "A tramp freighter captain in the spaceport of {colony} is selling a single velvety Tumble-Thrum as a harmless cabin pet. It fits in one palm and hums a cheerful major triad whenever scratched.",
    choices: [
      {
        label: "Adopt it as the governor's mascot",
        result: "Citizens adore the little fuzzball, and an intern sneaks it a sweet bun after dinner.",
        effects: [
          { kind: "culture", amount: 35 },
          { kind: "morale", amount: 2 },
        ],
      },
      {
        label: "Sell breeding permits to pet shops",
        result: "Novelty collectors across {colony} pay briskly for the right to raise their own singing puffballs.",
        effects: [
          { kind: "money", amount: 55 },
          { kind: "culture", amount: 15 },
        ],
      },
      {
        label: "Confiscate and return it to the freighter",
        result: "Port inspectors seal the crate before a single crumb is fed, ending the fad on the spot.",
        effects: [{ kind: "money", amount: -15 }],
      },
    ],
  },
  {
    id: "critter-2-exponential-fluff",
    title: "Knee-Deep in Velvet",
    art: "crisis",
    trigger: "colony",
    text: "Every Tumble-Thrum on {colony} has split into dozens, then thousands. Ventilation ducts hum with choir chords and commuters wade ankle-deep through warm apricot fluff.",
    choices: [
      {
        label: "Launch a novelty pillow industry",
        result: "Local weavers shear shed fluff into absurdly comfortable cushions that sell across the sector.",
        effects: [
          { kind: "money", amount: 75 },
          { kind: "culture", amount: 25 },
        ],
      },
      {
        label: "Declare a planetary cuddle holiday",
        result: "Assembly lines pause for a day while everyone naps on living carpets.",
        effects: [
          { kind: "culture", amount: 55 },
          { kind: "factories", amount: -2 },
        ],
      },
      {
        label: "Enforce a strict no-starch diet and box them up",
        result: "Deprived of crumbs, the swarm goes dormant and is neatly crated for off-world disposal.",
        effects: [
          { kind: "money", amount: -45 },
          { kind: "morale", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "critter-3-granary-heist",
    title: "The Great Granary Nibble",
    art: "crisis",
    trigger: "colony",
    text: "Millions of Tumble-Thrums have tunneled into the strategic grain silos of {colony}, humming in blissful four-part harmony while devouring half the winter harvest.",
    choices: [
      {
        label: "Import emergency rations off-world",
        result: "Chartered freighters keep pantries full while plump fuzzballs nap inside the empty silos.",
        effects: [
          { kind: "money", amount: -80 },
          { kind: "culture", amount: 20 },
        ],
      },
      {
        label: "Tighten rations and divert factory canteens",
        result: "Careful rationing prevents famine, though hungry crews grumble and output dips.",
        effects: [
          { kind: "factories", amount: -4 },
          { kind: "population", amount: -1 },
        ],
      },
      {
        label: "Release predatory sand-ferrets into the silos",
        result: "The ferrets clear every last Tumble-Thrum out within a week, leaving a messy cleanup bill.",
        effects: [
          { kind: "money", amount: -50 },
          { kind: "culture", amount: -20 },
        ],
      },
    ],
  },
  {
    id: "critter-4-orbital-stowaways",
    title: "Fuzzballs in the Bulkheads",
    art: "anomaly",
    trigger: "colony",
    text: "Dockworkers on {colony} report that crates of Tumble-Thrums slipped aboard a diplomatic courier and supply convoy bound for {star}, nesting happily inside the warm reactor baffles.",
    choices: [
      {
        label: "Let the convoy fly and transmit care tips",
        result: "Crews near {star} are startled, then charmed by the purring engine-room stowaways.",
        effects: [
          { kind: "culture", amount: 40 },
          { kind: "relations", amount: 8 },
        ],
      },
      {
        label: "Fine the shipping guild for lax cargo checks",
        result: "We collect hefty safety penalties while half the critters quietly stay aboard anyway.",
        effects: [
          { kind: "money", amount: 70 },
          { kind: "relations", amount: -5 },
        ],
      },
      {
        label: "Recall the ships and purge every cargo hold",
        result: "Drydock delays cost time and money, yet every last critter is finally rounded up.",
        effects: [
          { kind: "money", amount: -60 },
          { kind: "factories", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "critter-5-acoustic-breakthrough",
    title: "The Purr Theorem",
    art: "anomaly",
    trigger: "colony",
    text: "A sleepy xenobiologist on {colony} notices that a pile of well-fed Tumble-Thrums hums at the exact harmonic frequency needed to dampen warp-coil vibration and calm frazzled nerves.",
    choices: [
      {
        label: "Install humming cages in our physics labs",
        result: "Acoustic damping steadies sensor arrays and accelerates propulsion trials across {colony}.",
        effects: [
          { kind: "research", field: "propulsion", amount: 180 },
          { kind: "research", field: "forceFields", amount: 120 },
        ],
      },
      {
        label: "License their calming recordings galaxy-wide",
        result: "Holovid sleep albums top the charts from {colony} to the outer rim.",
        effects: [
          { kind: "money", amount: 110 },
          { kind: "culture", amount: 65 },
        ],
      },
      {
        label: "Train them as living reactor-leak detectors",
        result: "Whenever a bulkhead overheats, the fluffballs whistle like kettles, saving repair crews.",
        effects: [
          { kind: "factories", amount: 4 },
          { kind: "research", field: "construction", amount: 110 },
        ],
      },
    ],
  },
  {
    id: "critter-6-velvet-legacy",
    title: "An Empire Wrapped in Fluff",
    art: "council",
    trigger: "colony",
    text: "Just as planners on {colony} run out of spare barns, the Tumble-Thrums gather in vast golden meadows, shed their outer coats into lustrous silk, and prepare for their once-a-decade skyward migration.",
    choices: [
      {
        label: "Crown the Tumble-Thrum our national emblem",
        result: "Tourists flock to {colony} to see the living mascots woven into every banner and anthem.",
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "morale", amount: 5 },
        ],
      },
      {
        label: "Harvest the shed silk and wave them off",
        result: "Millions float skyward on thermal updrafts, leaving behind warehouses of priceless fiber.",
        effects: [
          { kind: "money", amount: 140 },
          { kind: "factories", amount: 3 },
        ],
      },
      {
        label: "Found certified Tumble-Thrum sanctuaries",
        result: "Controlled reserves preserve their gentle harmonic aura while keeping grain silos safe at last.",
        effects: [
          { kind: "culture", amount: 65 },
          { kind: "money", amount: 50 },
          { kind: "population", amount: 1 },
        ],
      },
    ],
  },
];
