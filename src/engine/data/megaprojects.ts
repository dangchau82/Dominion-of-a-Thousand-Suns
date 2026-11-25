// Superweapons and starbases. Written by Gemini (2026-11-25), balanced by Claude; rules built by Claude.
// Claude's balance check, pricing a station as if its hit points (2 BC per hit point, like large/huge hulls)
// and guns (4 + 3 x tier BC each) were bought as warships: the three military stations gave 1.6-1.9x value
// per BC, so their costs are raised to about 0.9x their warship value (they can't move, but don't need escorts).
// Support stations were already fair (0.9-1.0x plus repairs and range).
import type { ResearchField } from "../types";

export interface SuperweaponDef {
  id: string;
  name: string;
  requires: [ResearchField, number];   // field and tier, 6 to 10
  cost: number;                        // production, 8000 to 40000
  /** What it does once finished, in plain words; Claude turns it into rules. */
  power: string;                       // under 40 words
  /** How often it can fire. */
  rechargeTurns: number;               // 5 to 20
  /** The weak point: how a small fleet can disable it. */
  weakPoint: string;                   // under 40 words
  /** Hit points of the weak point while it is exposed (compare: a huge hull has 600). */
  weakPointHits: number;
  announce: string;                    // galaxy-wide news when building starts, under 30 words, may use {rival} and {star}
  firedText: string;                   // under 30 words, may use {star}
}

export const SUPERWEAPONS: SuperweaponDef[] = [
  {
    id: "null-tide-anchor",
    name: "Null-Tide Anchor",
    requires: ["propulsion", 7],
    cost: 9000,
    power: "Projects a hyperspace dead-zone within 4 light-years of a chosen star for 8 turns, halting all enemy fleet movement and preventing ships from entering or leaving that region.",
    rechargeTurns: 16, // Claude: was 10, which kept an 8-turn lockdown up almost all the time
    weakPoint: "Three unshielded tether buoys orbit the colony; destroying their 90 HP core while the field is active collapses the dead-zone and disables the anchor for 12 turns.",
    weakPointHits: 90,
    announce: "The {rival} has begun anchoring a Null-Tide Anchor at {star}, threatening to lock down nearby starlanes.",
    firedText: "A Null-Tide Anchor erupts around {star}, freezing hyperspace transit across the surrounding sector.",
  },
  {
    id: "tectonic-sunderer",
    name: "Tectonic Sunderer",
    requires: ["weapons", 8],
    cost: 10500,
    power: "Fires a focused gravimetric lance at any visible enemy colony, stripping its planetary shield for 6 turns and destroying up to half of its missile bases.",
    rechargeTurns: 8,
    weakPoint: "Cooling vents open in orbit for 2 turns after firing; a strike fleet can smash the 120 HP radiator manifold to disable the weapon for 10 turns.",
    weakPointHits: 120,
    announce: "Seismic arrays detect the {rival} constructing a Tectonic Sunderer in orbit above {star}.",
    firedText: "A gravimetric beam from the Tectonic Sunderer strikes {star}, shattering orbital shields and defense silos.",
  },
  {
    id: "arc-tempest-array",
    name: "Arc-Tempest Array",
    requires: ["forceFields", 8],
    cost: 12000,
    power: "Discharges an ionizing storm across any star system within 8 light-years, draining all enemy ship shields, halving weapon accuracy, and dealing 25 damage to every enemy ship there.",
    rechargeTurns: 12,
    weakPoint: "The capacitor ring sheds armor while charging; raiders striking the 140 HP collector pylon force an overload that knocks the array offline for 14 turns.",
    weakPointHits: 140,
    announce: "The {rival} is assembling an Arc-Tempest Array at {star} capable of devastating fleets from afar.",
    firedText: "An Arc-Tempest Array unleashes a blinding plasma surge across {star}, crippling every hostile vessel in orbit.",
  },
  {
    id: "pale-shroud-emitter",
    name: "Pale-Shroud Emitter",
    requires: ["planetology", 9],
    cost: 15000,
    power: "Seeds a target colony's upper atmosphere with necrotic ash that kills 60% of its population and costs its owner 200 culture, leaving factories and the planet intact.",
    rechargeTurns: 16,
    weakPoint: "Orbital synthesis vats lack point-defense armor; a fast raid destroying the 160 HP catalyst spire ruptures the containment tanks and disables the emitter for 18 turns.",
    weakPointHits: 160,
    announce: "Deep-space sensors warn that the {rival} has started building a Pale-Shroud Emitter at {star}.",
    firedText: "Ash-laden clouds from a Pale-Shroud Emitter blanket {star}, silently emptying cities while leaving foundries standing.",
  },
];

export interface StarbaseDef {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  requires: [ResearchField, number];
  cost: number;                        // 300 to 4000
  hits: number;                        // 100 to 1500
  /** Weapon tech ids it carries (from the weapon list in gemini-task-lairs.md), with counts. */
  weapons: { techId: string; count: number }[];
  rangeBonus: number;                  // 0 to 3 light-years for our ships near it
  repairs: boolean;                    // repairs our ships here between battles
  special?: string;                    // one extra ability in plain words, under 25 words
  description: string;                 // under 30 words
}

export const STARBASES: StarbaseDef[] = [
  {
    id: "bastion-buoy",
    name: "Bastion Buoy",
    tier: 1,
    requires: ["construction", 2],
    cost: 600,
    hits: 250,
    weapons: [
      { techId: "ion-cannon", count: 8 },
      { techId: "hyper-velocity-rockets", count: 6 },
    ],
    rangeBonus: 1,
    repairs: false,
    special: "Grants +1 beam accuracy to friendly ships defending the same star.",
    description: "Armored early chokepoint station mounted with ion batteries and rocket pods to hold border stars.",
  },
  {
    id: "beacon-berth",
    name: "Beacon Berth",
    tier: 1,
    requires: ["propulsion", 3],
    cost: 450,
    hits: 160,
    weapons: [
      { techId: "pulse-laser", count: 6 },
      { techId: "nuclear-missile", count: 4 },
    ],
    rangeBonus: 2,
    repairs: true,
    special: "Increases friendly sensor scan range by 2 light-years around this star.",
    description: "Deep-space refueling and repair berth that pushes fleet range across starless voids and patches damaged hulls.",
  },
  {
    id: "iron-redoubt",
    name: "Iron Redoubt",
    tier: 2,
    requires: ["weapons", 5],
    cost: 1900,
    hits: 750,
    weapons: [
      { techId: "plasma-cannon", count: 16 },
      { techId: "smart-missile", count: 10 },
    ],
    rangeBonus: 1,
    repairs: false,
    special: "Projects a planetary-grade deflector shield reducing incoming damage to the station by 4.",
    description: "Heavy orbital gun-platform bristling with plasma cannons and smart-missile racks to anchor contested frontiers.",
  },
  {
    id: "fleet-drydock",
    name: "Fleet Drydock",
    tier: 2,
    requires: ["construction", 6],
    cost: 1200,
    hits: 480,
    weapons: [
      { techId: "neutron-blaster", count: 10 },
      { techId: "seeker-missile", count: 6 },
    ],
    rangeBonus: 2,
    repairs: true,
    special: "Repairs friendly ships in orbit twice as fast and cuts fleet upkeep here in half.",
    description: "Mobile-gantry shipyard in deep space that rapidly overhauls battle-worn task forces between offensive campaigns.",
  },
  {
    id: "apex-garrison",
    name: "Apex Garrison",
    tier: 3,
    requires: ["weapons", 8],
    cost: 3800,
    hits: 1500,
    weapons: [
      { techId: "phase-lance", count: 22 },
      { techId: "annihilator-ray", count: 8 },
      { techId: "hellfire-torpedo", count: 10 },
    ],
    rangeBonus: 1,
    repairs: false,
    special: "Equipped with a stasis projector that freezes the largest enemy ship group during round one.",
    description: "Colossal frontier fortress armed with phase lances, annihilator rays, and heavy torpedoes to halt invasion armadas.",
  },
  {
    id: "astral-haven",
    name: "Astral Haven",
    tier: 3,
    requires: ["propulsion", 9],
    cost: 2400,
    hits: 900,
    weapons: [
      { techId: "disruptor", count: 16 },
      { techId: "stellar-torpedo", count: 8 },
    ],
    rangeBonus: 3,
    repairs: true,
    special: "Grants +3 light-years of range, fully repairs docked fleets each turn, and boosts nearby ship speed by 1.",
    description: "Deep-void fleet nexus projecting long-range jump beacons and full drydock repair bays across distant sectors.",
  },
];