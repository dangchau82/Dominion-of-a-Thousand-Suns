// Expeditions: short away-team stories with risky choices. Written by Gemini (2026-11-25), checked by Claude; rules built by Claude.
import type { EventEffect, GameEventDef } from "./events";

export interface ExpeditionChoice {
  label: string;
  /** Chance of success, 0.3 to 0.9. */
  chance: number;
  success: { result: string; effects: EventEffect[] };
  failure: { result: string; effects: EventEffect[] };
}

export interface ExpeditionDef {
  id: string;
  title: string;
  art: GameEventDef["art"];   // anomaly, ruins, supernova, pirates, contact, crisis, council or victory
  text: string;               // under 60 words; may use {star}
  choices: ExpeditionChoice[]; // 2 or 3
}

export const EXPEDITIONS: ExpeditionDef[] = [
  {
    id: "exp-01-sunken-observatory",
    title: "The Submerged Astrolabe",
    art: "ruins",
    text: "Beneath a methane sea near {star}, scouts locate an intact precursor astrolabe humming with stored star-charts and unstable pressure seals.",
    choices: [
      {
        label: "Scan the dome from orbit with drones",
        chance: 0.85,
        success: {
          result: "Remote telemetry captures clean star-lane coordinates without risking a single diver.",
          effects: [{ kind: "revealStars", count: 2 }],
        },
        failure: {
          result: "Thick methane static scrambles the drone sensors before any data can be recovered.",
          effects: [{ kind: "money", amount: -40 }],
        },
      },
      {
        label: "Send divers into the central chamber",
        chance: 0.45,
        success: {
          result: "The team extracts a complete precursor navigation core and maps five hidden systems.",
          effects: [
            { kind: "research", field: "propulsion", amount: 320 },
            { kind: "revealStars", count: 5 },
          ],
        },
        failure: {
          result: "A corroded bulkhead implodes under pressure, claiming a shuttle crew before extraction.",
          effects: [{ kind: "population", amount: -1 }],
        },
      },
    ],
  },
  {
    id: "exp-02-chronal-obelisk",
    title: "The Whispering Monolith",
    art: "anomaly",
    text: "On a twilight ridge at {star}, a crystalline obelisk replays mathematical proofs in shifting harmonic light that induces vivid hallucinations.",
    choices: [
      {
        label: "Record the light patterns optically",
        chance: 0.85,
        success: {
          result: "Prism cameras capture several useful encryption algorithms from the shimmering facets.",
          effects: [{ kind: "research", field: "computers", amount: 110 }],
        },
        failure: {
          result: "Overexposed lenses shatter as the obelisk flares unexpectedly.",
          effects: [{ kind: "money", amount: -50 }],
        },
      },
      {
        label: "Link a neural translator to the crystal",
        chance: 0.4,
        success: {
          result: "The linguist endures hours of blinding visions and emerges with advanced shield equations.",
          effects: [
            { kind: "research", field: "forceFields", amount: 360 },
            { kind: "culture", amount: 120 },
          ],
        },
        failure: {
          result: "Feedback sears the expedition's field generators, forcing an emergency medical evacuation.",
          effects: [{ kind: "population", amount: -1 }, { kind: "money", amount: -90 }],
        },
      },
    ],
  },
  {
    id: "exp-03-derelict-mint",
    title: "Vault of the Silent Guild",
    art: "pirates",
    text: "Drifting in the shadow of a gas giant at {star}, an unmarked treasure barge still runs automated laser-grid traps around its cargo hold.",
    choices: [
      {
        label: "Cut open the outer cargo lockers",
        chance: 0.8,
        success: {
          result: "Torch teams slice into unguarded lockers and haul out crates of stamped bullion.",
          effects: [{ kind: "money", amount: 110 }],
        },
        failure: {
          result: "A tripwire vents the outer bay, blowing the salvaged crates into deep space.",
          effects: [{ kind: "money", amount: -60 }],
        },
      },
      {
        label: "Bypass the core vault's laser lattice",
        chance: 0.45,
        success: {
          result: "Sappers disarm the traps cleanly, claiming a king's ransom in rare alloys and coins.",
          effects: [
            { kind: "money", amount: 290 },
            { kind: "culture", amount: 90 },
          ],
        },
        failure: {
          result: "Automated sweepers shred the boarding sled, forcing survivors to flee empty-handed.",
          effects: [{ kind: "population", amount: -2 }],
        },
      },
      {
        label: "Tow the intact barge to orbital drydock",
        chance: 0.35,
        success: {
          result: "Drydock crews strip the ancient hull for priceless metallurgy and heavy tooling.",
          effects: [
            { kind: "factories", amount: 10 },
            { kind: "research", field: "construction", amount: 280 },
          ],
        },
        failure: {
          result: "The barge's fusion bottle detonates under tow, damaging our tug escorts.",
          effects: [{ kind: "money", amount: -160 }],
        },
      },
    ],
  },
  {
    id: "exp-04-contested-reliquary",
    title: "Race to the Glass Cairn",
    art: "contact",
    text: "Our survey team lands beside a gleaming precursor cairn at {star} just as an away shuttle from the {rival} touches down across the crater.",
    choices: [
      {
        label: "Propose a joint archaeological dig",
        chance: 0.85,
        success: {
          result: "Both crews share the outer chamber's tablets, earning mutual respect and cultural goodwill.",
          effects: [
            { kind: "relations", amount: 12 },
            { kind: "culture", amount: 75 },
          ],
        },
        failure: {
          result: "Bickering over translation rights sours the camp and stalls the excavation.",
          effects: [{ kind: "relations", amount: -8 }],
        },
      },
      {
        label: "Sprint for the inner sanctum alone",
        chance: 0.4,
        success: {
          result: "Our team seals the sanctum door and secures an intact weapon core before the {rival} arrives.",
          effects: [
            { kind: "research", field: "weapons", amount: 350 },
            { kind: "relations", amount: -10 },
          ],
        },
        failure: {
          result: "The {rival} beats us to the prize and broadcasts our treaty breach across the sector.",
          effects: [{ kind: "relations", amount: -16 }],
        },
      },
    ],
  },
  {
    id: "exp-05-spore-cathedral",
    title: "The Living Cathedral",
    art: "anomaly",
    text: "Towering bioluminescent trees at {star} form a natural dome pulsing with synchronized chemical signals that mimic complex genetic code.",
    choices: [
      {
        label: "Collect fallen seed-pods at the perimeter",
        chance: 0.9,
        success: {
          result: "Hardy hybrid seeds boost agricultural yields across our frontier colonies.",
          effects: [{ kind: "research", field: "planetology", amount: 95 }],
        },
        failure: {
          result: "The pods wither into inert dust the moment they leave the canopy's humidity.",
          effects: [{ kind: "money", amount: -35 }],
        },
      },
      {
        label: "Tap the central heartwood sap",
        chance: 0.45,
        success: {
          result: "The concentrated genetic serum unlocks rapid terraforming and biosphere engineering breakthroughs.",
          effects: [
            { kind: "research", field: "planetology", amount: 340 },
            { kind: "planetSize", amount: 4 },
          ],
        },
        failure: {
          result: "Toxic defensive spores breach environmental suits, incapacitating half the science squad.",
          effects: [{ kind: "population", amount: -1 }, { kind: "money", amount: -70 }],
        },
      },
    ],
  },
  {
    id: "exp-06-stellar-foundry",
    title: "The Corona Anvil",
    art: "supernova",
    text: "Magnetic tethers suspend a prehistoric automated smelter dangerously close to the flares of {star}, still forging dense hull ingots.",
    choices: [
      {
        label: "Snag cooling ingots from the outer rail",
        chance: 0.8,
        success: {
          result: "Grapple drones retrieve several tons of super-dense alloy for orbital shipyards.",
          effects: [{ kind: "factories", amount: 4 }],
        },
        failure: {
          result: "A sudden coronal loop melts our tow cables before the cargo clears orbit.",
          effects: [{ kind: "money", amount: -65 }],
        },
      },
      {
        label: "Board the control spire between flares",
        chance: 0.35,
        success: {
          result: "Engineers download the complete magnetic-forging schematics and trigger a full ingot run.",
          effects: [
            { kind: "research", field: "construction", amount: 380 },
            { kind: "factories", amount: 12 },
          ],
        },
        failure: {
          result: "An early solar prominence scorches the shuttle bay, costing brave engineers their lives.",
          effects: [{ kind: "population", amount: -2 }],
        },
      },
    ],
  },
  {
    id: "exp-07-cryo-ark",
    title: "The Drifting Sleeper Ship",
    art: "contact",
    text: "A battered sub-light colony vessel drifts in high orbit over {star}, its ancient fusion reactors failing with thousands of colonists still frozen aboard.",
    choices: [
      {
        label: "Salvage its intact hull and shuttlecraft",
        chance: 0.85,
        success: {
          result: "Flight-worthy scout hulls from the ark's hangar are refitted for immediate service.",
          effects: [{ kind: "ships", template: "scout", count: 1 }],
        },
        failure: {
          result: "Metal fatigue collapses the hangar deck during towing.",
          effects: [{ kind: "money", amount: -50 }],
        },
      },
      {
        label: "Thaw and adopt the surviving colonists",
        chance: 0.5,
        success: {
          result: "Grateful survivors join our nearest settlement, bringing unique arts and eager hands.",
          effects: [
            { kind: "population", amount: 4 },
            { kind: "culture", amount: 110 },
          ],
        },
        failure: {
          result: "Failing cryo-pods trigger a tragic cascade despite our medics' costly rescue effort.",
          effects: [{ kind: "money", amount: -120 }, { kind: "morale", amount: -3 }],
        },
      },
      {
        label: "Refit the ark's colony module in orbit",
        chance: 0.3,
        success: {
          result: "Heroic engineering restores the vessel into a fully operational colony ship.",
          effects: [
            { kind: "ships", template: "colony", count: 1 },
            { kind: "morale", amount: 5 },
          ],
        },
        failure: {
          result: "Overloaded plasma lines rupture during ignition, destroying the hull and salvage rig.",
          effects: [{ kind: "population", amount: -1 }, { kind: "money", amount: -140 }],
        },
      },
    ],
  },
  {
    id: "exp-08-echo-canyon",
    title: "The Singing Chasm",
    art: "ruins",
    text: "Wind rushing through carved basalt pillars at {star} produces hypnotic chords that match ancient harmonic notation found across three sectors.",
    choices: [
      {
        label: "Broadcast the live symphony across our realm",
        chance: 0.9,
        success: {
          result: "Citizens across every colony marvel at the haunting celestial music.",
          effects: [{ kind: "culture", amount: 65 }],
        },
        failure: {
          result: "Sub-audible frequencies cause headaches among listeners, forcing an abrupt broadcast cutoff.",
          effects: [{ kind: "morale", amount: -2 }],
        },
      },
      {
        label: "Excavate the resonant chamber beneath",
        chance: 0.45,
        success: {
          result: "Beneath the pillars lies an amphitheater of cultural relics and acoustic beam prototypes.",
          effects: [
            { kind: "culture", amount: 150 },
            { kind: "research", field: "weapons", amount: 260 },
          ],
        },
        failure: {
          result: "Drilling shatters the delicate stone resonators, collapsing the cavern roof onto our rig.",
          effects: [{ kind: "population", amount: -1 }, { kind: "money", amount: -80 }],
        },
      },
    ],
  },
  {
    id: "exp-09-black-box-beacon",
    title: "The Quarantine Buoy",
    art: "crisis",
    text: "An automated beacon orbiting {star} broadcasts a repeating warning in forty dead languages, guarding a sealed orbital bunker.",
    choices: [
      {
        label: "Decode the outer warning lexicon",
        chance: 0.85,
        success: {
          result: "Linguistic matrices from the buoy sharpen our diplomatic translation software.",
          effects: [{ kind: "research", field: "computers", amount: 100 }],
        },
        failure: {
          result: "A defensive logic-bomb wipes our shuttle's data core.",
          effects: [{ kind: "money", amount: -55 }],
        },
      },
      {
        label: "Crack the bunker's blast doors",
        chance: 0.35,
        success: {
          result: "Inside rests a pristine stockpile of precursor antimatter warheads and tactical computers.",
          effects: [
            { kind: "research", field: "weapons", amount: 380 },
            { kind: "research", field: "computers", amount: 250 },
          ],
        },
        failure: {
          result: "Contained micro-spores vent into the airlock, forcing us to scuttle the contaminated lander.",
          effects: [{ kind: "population", amount: -2 }, { kind: "money", amount: -100 }],
        },
      },
    ],
  },
  {
    id: "exp-10-mirage-atoll",
    title: "The Glass Archipelago",
    art: "anomaly",
    text: "Shallow crystalline islands at {star} refract starlight into holographic maps of neighboring clusters whenever tidal currents peak.",
    choices: [
      {
        label: "Chart the reflections from high orbit",
        chance: 0.85,
        success: {
          result: "Orbital cameras trace clear hyper-lanes to two nearby star systems.",
          effects: [{ kind: "revealStars", count: 2 }],
        },
        failure: {
          result: "Cloud cover rolls in during peak tide, obscuring the optical projection.",
          effects: [{ kind: "money", amount: -30 }],
        },
      },
      {
        label: "Anchor prism relays on the reef",
        chance: 0.5,
        success: {
          result: "Amplified crystal beams illuminate six distant stars and yield exotic optical minerals.",
          effects: [
            { kind: "revealStars", count: 6 },
            { kind: "money", amount: 210 },
          ],
        },
        failure: {
          result: "Razor-sharp tidal surges smash the relay pylons and sink an equipment barge.",
          effects: [{ kind: "money", amount: -110 }],
        },
      },
    ],
  },
  {
    id: "exp-11-council-archive",
    title: "Halls of the First Accord",
    art: "council",
    text: "Inside a hollowed asteroid at {star}, scouts find a circular chamber where vanished star-nations once ratified interstellar treaties.",
    choices: [
      {
        label: "Preserve the chamber as a neutral shrine",
        chance: 0.85,
        success: {
          result: "Galactic scholars praise our stewardship of ancient diplomatic heritage.",
          effects: [{ kind: "culture", amount: 80 }],
        },
        failure: {
          result: "Structural micro-fractures force expensive stabilization work to keep the dome intact.",
          effects: [{ kind: "money", amount: -75 }],
        },
      },
      {
        label: "Restore the chamber's subspace transmitter",
        chance: 0.45,
        success: {
          result: "Ancient treaty protocols broadcast across the sector, elevating our diplomatic standing and arts.",
          effects: [
            { kind: "relations", amount: 18 },
            { kind: "culture", amount: 140 },
          ],
        },
        failure: {
          result: "An electrical surge melts the antique console and injures our chief xenolinguist.",
          effects: [{ kind: "population", amount: -1 }, { kind: "money", amount: -85 }],
        },
      },
    ],
  },
  {
    id: "exp-12-obsidian-citadel",
    title: "The Gravity Keep",
    art: "victory",
    text: "Hovering motionless above the pole of {star}, a geometric citadel defies orbital mechanics with a silent, self-sustaining field core.",
    choices: [
      {
        label: "Measure the field from a safe picket",
        chance: 0.85,
        success: {
          result: "Sensor sweeps refine our defensive deflector harmonics.",
          effects: [{ kind: "research", field: "forceFields", amount: 115 }],
        },
        failure: {
          result: "Gravitic shear twists our picket's sensor boom, forcing a costly repair.",
          effects: [{ kind: "money", amount: -60 }],
        },
      },
      {
        label: "Rappel into the zero-gravity core",
        chance: 0.3,
        success: {
          result: "Explorers recover a master gravitic stabilizer, revolutionizing both shield and drive theory.",
          effects: [
            { kind: "research", field: "forceFields", amount: 380 },
            { kind: "research", field: "propulsion", amount: 340 },
          ],
        },
        failure: {
          result: "Sudden polarity reversal crushes the boarding pod before emergency thrusters can fire.",
          effects: [{ kind: "population", amount: -2 }],
        },
      },
    ],
  },
];