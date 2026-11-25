// The supernova crisis. Written by Gemini (hard pack 5, 2026-11-25), checked by Claude; rules built by Claude.
import type { GameEventDef } from "./events";

/** Events shown to every empire with a colony within 4 light-years. trigger "colony"; may use {star} (the dying star) and {colony}. */
export const SUPERNOVA_WARNINGS: GameEventDef[] = [
  {
    id: "supernova-warning-1-flicker",
    title: "Unstable Photosphere",
    art: "supernova",
    trigger: "colony",
    text: "Observatories on {colony} have detected violent magnetic tremors and sudden luminosity drops inside {star}. Astrophysicists warn its core fusion balance is failing.",
    choices: [
      {
        label: "Fund deep-core telemetry probes",
        result: "Sensor buoys dive into the corona, mapping the star's decay for our labs.",
        effects: [
          { kind: "money", amount: -120 },
          { kind: "research", field: "forceFields", amount: 260 },
        ],
      },
      {
        label: "Sell early warning charts to traders",
        result: "Merchant guilds pay well for advance notice to reroute their cargo lanes.",
        effects: [
          { kind: "money", amount: 180 },
          { kind: "morale", amount: -2 },
        ],
      },
      {
        label: "Keep the readings quiet for now",
        result: "Work continues uninterrupted on {colony}, though rumors murmur in the ports.",
        effects: [{ kind: "nothing" }],
      },
    ],
  },
  {
    id: "supernova-warning-2-fifteen-turns",
    title: "Fifteen Turns to Collapse",
    art: "supernova",
    trigger: "colony",
    text: "Heavy elements are choking the core of {star}, swelling its outer shell into a bruised crimson glare. On {colony}, calculations show total detonation in fifteen turns.",
    choices: [
      {
        label: "Charter civilian evacuation transports",
        result: "Refugee liners begin lifting families off {colony} while orbital lanes remain calm.",
        effects: [
          { kind: "money", amount: -160 },
          { kind: "population", amount: -2 },
          { kind: "morale", amount: 3 },
        ],
      },
      {
        label: "Deploy solar-siphon collectors",
        result: "Harvesters skim high-energy plasma from {star}, straining local power grids.",
        effects: [
          { kind: "factories", amount: -4 },
          { kind: "research", field: "weapons", amount: 300 },
        ],
      },
      {
        label: "Hold a Vigil of the Turning Sky",
        result: "Poets and priests gather beneath the swollen sun, uniting the population in resolve.",
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "morale", amount: 4 },
        ],
      },
    ],
  },
  {
    id: "supernova-warning-3-ten-turns",
    title: "Ten Turns to Detonation",
    art: "supernova",
    trigger: "colony",
    text: "Radiation storms from {star} now scorch the upper atmosphere of {colony} every few hours. With ten turns remaining, ash falls across coastal cities and spaceports jam with crowds.",
    choices: [
      {
        label: "Order priority airlift of skilled workers",
        result: "Transports ferry thousands to safer worlds, leaving half-empty assembly lines behind.",
        effects: [
          { kind: "money", amount: -200 },
          { kind: "population", amount: -3 },
          { kind: "factories", amount: -6 },
        ],
      },
      {
        label: "Run the foundries around the clock",
        result: "We squeeze every last hull and alloy ingot out of {colony} before the shockwave hits.",
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Transmit live neutrino recordings galaxy-wide",
        result: "Institutes across every empire study our feeds in awe of our composure.",
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "relations", amount: 12 },
        ],
      },
    ],
  },
  {
    id: "supernova-warning-4-five-turns",
    title: "Five Turns to Zero",
    art: "supernova",
    trigger: "colony",
    text: "The sky above {colony} burns blinding white day and night as {star} sheds entire shells of superheated gas. Only five turns remain before the core collapses.",
    choices: [
      {
        label: "Launch the final emergency exodus",
        result: "Every available shuttle lifts off into blinding glare, saving lives at steep cost.",
        effects: [
          { kind: "money", amount: -240 },
          { kind: "population", amount: -4 },
          { kind: "morale", amount: 5 },
        ],
      },
      {
        label: "Aim deep-field particle traps at the core",
        result: "Automated rigs record exotic collapse physics right up to the final hours.",
        effects: [
          { kind: "factories", amount: -8 },
          { kind: "research", field: "forceFields", amount: 380 },
        ],
      },
      {
        label: "Strip all portable treasury reserves",
        result: "Armored freighters haul bullion and rare metals off-world as sirens wail.",
        effects: [
          { kind: "money", amount: 260 },
          { kind: "morale", amount: -6 },
        ],
      },
    ],
  },
];

/** One of these is shown when the star blows; pick by what the empire did. */
export const SUPERNOVA_AFTERMATH: GameEventDef[] = [
  {
    id: "supernova-aftermath-evacuated",
    title: "Ashes in the Void",
    art: "supernova",
    trigger: "colony",
    text: "The core of {star} collapsed into a blinding shockwave, but our transports had already carried most citizens away from {colony}. Ruined outer districts remain, yet our people live on.",
    choices: [
      {
        label: "Resettle survivors in frontier hubs",
        result: "Evacuees bring hard-won survival discipline to thriving outer worlds.",
        effects: [
          { kind: "population", amount: 2 },
          { kind: "morale", amount: 4 },
        ],
      },
      {
        label: "Catalog blast wave telemetry",
        result: "Long-range sensors record how shockwaves shear stellar envelopes.",
        effects: [
          { kind: "research", field: "forceFields", amount: 240 },
          { kind: "culture", amount: 50 },
        ],
      },
    ],
  },
  {
    id: "supernova-aftermath-stayed",
    title: "Scorched Skies",
    art: "crisis",
    trigger: "colony",
    text: "When {star} detonated, the blast stripped cities and heavy foundries across {colony}. Survivors shelter in deep bunkers while the sky glows with lingering embers.",
    choices: [
      {
        label: "Rebuild blast-hardened domes",
        result: "Engineers construct thicker shelters and cleaner industrial bays from the wreckage.",
        effects: [
          { kind: "money", amount: -140 },
          { kind: "factories", amount: 6 },
        ],
      },
      {
        label: "Honor the fallen with a memorial",
        result: "Songs for the lost of {colony} stir deep grief and shared purpose.",
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "supernova-aftermath-harvested",
    title: "Reaped from the Blast",
    art: "supernova",
    trigger: "colony",
    text: "Our collectors stayed locked onto {star} until the final detonation, drinking exotic particles as the shockwave tore through {colony}. The harvest is extraordinary, though the scars run deep.",
    choices: [
      {
        label: "Process captured stellar isotopes",
        result: "Refineries extract rare energy compounds for advanced propulsion and defense.",
        effects: [
          { kind: "research", field: "propulsion", amount: 340 },
          { kind: "money", amount: 160 },
        ],
      },
      {
        label: "Stabilize stressed reactor cores",
        result: "Emergency coolant crews prevent secondary meltdowns across remaining plants.",
        effects: [
          { kind: "factories", amount: 5 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
];

export interface RemnantDef {
  id: string;
  name: string;
  /** Under 30 words. */
  description: string;
  /** Research each turn to whoever has a ship or colony there (5 to 25). */
  researchPerTurn: number;
  field: "computers" | "construction" | "forceFields" | "planetology" | "propulsion" | "weapons";
}

export const REMNANTS: RemnantDef[] = [
  {
    id: "kestrel-beacon",
    name: "Kestrel Beacon",
    description: "A spinning neutron core sweeping tight radio pulses across the ruined system.",
    researchPerTurn: 18,
    field: "computers",
  },
  {
    id: "amber-shroud",
    name: "Amber Shroud",
    description: "A glowing gas shell rich in heavy metals and magnetic eddies.",
    researchPerTurn: 15,
    field: "construction",
  },
  {
    id: "ember-halo",
    name: "Ember Halo",
    description: "A turbulent ring of superheated plasma and twisted magnetic flux lines.",
    researchPerTurn: 20,
    field: "forceFields",
  },
  {
    id: "iron-well",
    name: "Iron Well",
    description: "A dense metallic remnant shedding high-energy radiation across nearby orbits.",
    researchPerTurn: 12,
    field: "weapons",
  },
];

/** Special choice for the Quorai, who live inside stars. */
export const QUORAI_SUPERNOVA: GameEventDef = {
  id: "quorai-supernova-core",
  title: "Heart of the Dying Sun",
  art: "supernova",
  trigger: "colony",
  text: "As {star} nears collapse, its turbulent plasma sings to our kind on {colony}. We can ride the ignition wave to drink its raw fire, or draw back before the core turns cold.",
  choices: [
    {
      label: "Ride the fire into collapse",
      result: "Our star-born choir feeds on the surging core, gaining insight at heavy strain.",
      effects: [
        { kind: "research", field: "forceFields", amount: 360 },
        { kind: "morale", amount: -5 },
      ],
    },
    {
      label: "Draw back into safer orbits",
      result: "We preserve our strength and carry the star's last songs into deeper space.",
      effects: [
        { kind: "culture", amount: 120 },
        { kind: "morale", amount: 4 },
      ],
    },
  ],
};