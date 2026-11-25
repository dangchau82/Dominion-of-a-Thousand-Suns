// Native peoples on unsettled worlds. Written by Gemini (2026-11-25), checked by Claude; rules built by Claude.
import type { Climate } from "../types";
import type { GameEventDef } from "./events";

export interface NativeDef {
  id: string;
  name: string;              // e.g. "the Something folk"
  climate: Climate;          // the kind of world they live on
  /** How advanced: 1 = stone tools, 2 = farming towns, 3 = steam and radio. */
  stage: 1 | 2 | 3;
  description: string;       // under 35 words: what scouts see
  /** The first-contact choice when we settle their world: uplift, leave or take. */
  contact: GameEventDef;     // trigger "colony"; exactly 3 choices in that order
  /** Fires about 30 turns after an uplift: the price of meddling. Good or bad. */
  aftermath: GameEventDef;   // trigger "colony"; 2 choices
}

export const NATIVES: NativeDef[] = [
  {
    id: "canopy-weaver-folk",
    name: "the Canopy-Weaver Folk",
    climate: "jungle",
    stage: 1,
    description: "Tree-dwelling clans who braid living vines into sky-bridges and carve obsidian spears, watching our landing shuttles from high emerald boughs.",
    contact: {
      id: "canopy-weaver-folk-contact",
      title: "Voices in the High Boughs",
      art: "contact",
      trigger: "colony",
      text: "Our settlers on {colony} find the Canopy-Weaver Folk living in woven treetop villages above the fertile valley floor. How shall we treat the planet's first inhabitants?",
      choices: [
        {
          label: "Uplift the clans with tools and schooling",
          result: "Eager apprentices descend from the canopy, swelling our workforce and sharing deep botanical lore.",
          effects: [
            { kind: "population", amount: 2 },
            { kind: "research", field: "planetology", amount: 180 },
            { kind: "money", amount: -70 },
          ],
        },
        {
          label: "Leave the canopy groves untouched",
          result: "Surveyors mark the great vine-forests off-limits, winning admiration from poets and scholars back home.",
          effects: [
            { kind: "culture", amount: 85 },
            { kind: "morale", amount: 2 },
          ],
        },
        {
          label: "Clear the timberlands for colony expansion",
          result: "Harvesters fell the ancient boughs to open rich farmland, though neighboring empires condemn our ruthlessness.",
          effects: [
            { kind: "planetSize", amount: 4 },
            { kind: "factories", amount: 4 },
            { kind: "relations", amount: -10 },
          ],
        },
      ],
    },
    aftermath: {
      id: "canopy-weaver-folk-aftermath",
      title: "Roots and Steel",
      art: "contact",
      trigger: "colony",
      text: "Thirty years after our uplift on {colony}, a new generation of Canopy-Weaver engineers blends bio-woven resins with orbital alloys, though elders mourn lost forest traditions.",
      choices: [
        {
          label: "Fund living-resin architectural guilds",
          result: "Their organic polymers strengthen our hulls and grace {colony} with soaring woven spires.",
          effects: [
            { kind: "research", field: "construction", amount: 220 },
            { kind: "culture", amount: 75 },
            { kind: "money", amount: -110 },
          ],
        },
        {
          label: "Restore protected ancestral grove reserves",
          result: "Returning sacred boughs to the elders heals generational strife and lifts spirits across the world.",
          effects: [
            { kind: "morale", amount: 5 },
            { kind: "planetSize", amount: 3 },
          ],
        },
      ],
    },
  },
  {
    id: "brine-beacon-folk",
    name: "the Brine-Beacon Folk",
    climate: "ocean",
    stage: 2,
    description: "Amphibious kelp-farmers tending glowing shell-towns anchored to shallow reefs, signaling our orbiters with rhythmic oil-lamp flashes across the waves.",
    contact: {
      id: "brine-beacon-folk-contact",
      title: "Lamps Beneath the Swell",
      art: "contact",
      trigger: "colony",
      text: "Floating towns of the Brine-Beacon Folk dot the warm reefs around {colony}. Their harbormasters row out in reed catamarans to greet our surveyors.",
      choices: [
        {
          label: "Uplift their reef-towns with hydro-tech",
          result: "Reef-wrights quickly master pressure turbines, joining our coastal yards and sharing tidal current charts.",
          effects: [
            { kind: "population", amount: 3 },
            { kind: "research", field: "propulsion", amount: 240 },
            { kind: "money", amount: -90 },
          ],
        },
        {
          label: "Leave the reef-towns in sovereign peace",
          result: "Our sea-domes anchor in deep trenches far from their kelp beds, inspiring songs of quiet coexistence.",
          effects: [
            { kind: "culture", amount: 100 },
            { kind: "relations", amount: 8 },
          ],
        },
        {
          label: "Dredge the shallows for seabed foundries",
          result: "Industrial dredgers turn prime kelp reefs into ore platforms, drawing sharp diplomatic protests.",
          effects: [
            { kind: "factories", amount: 7 },
            { kind: "money", amount: 120 },
            { kind: "relations", amount: -12 },
          ],
        },
      ],
    },
    aftermath: {
      id: "brine-beacon-folk-aftermath",
      title: "The Tidal Schism",
      art: "crisis",
      trigger: "colony",
      text: "Rapid uplift on {colony} has split the Brine-Beacon Folk: deep-sea industrialists demand seabed mining rights while reef-keepers warn our turbines are poisoning the spawning currents.",
      choices: [
        {
          label: "Back the deep-sea mining syndicates",
          result: "Submerged smelters roar at full capacity, though polluted reefs leave coastal towns bitter.",
          effects: [
            { kind: "factories", amount: 8 },
            { kind: "money", amount: 160 },
            { kind: "morale", amount: -4 },
          ],
        },
        {
          label: "Enforce reef-keeper current protections",
          result: "Clean tides revive the spawning grounds and win heartfelt loyalty from the reef-towns.",
          effects: [
            { kind: "population", amount: 2 },
            { kind: "morale", amount: 4 },
            { kind: "money", amount: -130 },
          ],
        },
      ],
    },
  },
  {
    id: "cairn-singer-folk",
    name: "the Cairn-Singer Folk",
    climate: "tundra",
    stage: 1,
    description: "Fur-clad nomads herding woolly tusk-beasts between basalt hot springs, carving astronomical calendars into glacial boulders with flint chisels.",
    contact: {
      id: "cairn-singer-folk-contact",
      title: "Songs of the Frost-Cairns",
      art: "contact",
      trigger: "colony",
      text: "Around the geothermal vents of {colony}, our pioneers encounter the Cairn-Singer Folk, whose resonant throat-chants map every shifting glacier and magnetic storm.",
      choices: [
        {
          label: "Uplift the nomads into thermal settlements",
          result: "Trained in geothermal drilling, the clans expand our warm-water domes and share polar survival craft.",
          effects: [
            { kind: "population", amount: 2 },
            { kind: "research", field: "planetology", amount: 170 },
            { kind: "money", amount: -65 },
          ],
        },
        {
          label: "Leave the glacial migration routes open",
          result: "Pilots route cargo sleds high above the herds, preserving an ancient culture praised across our worlds.",
          effects: [
            { kind: "culture", amount: 90 },
            { kind: "morale", amount: 2 },
          ],
        },
        {
          label: "Claim every geothermal vent for colony power",
          result: "Seizing the warm springs gives our settlers prime land while displacing the winter herds.",
          effects: [
            { kind: "planetSize", amount: 4 },
            { kind: "relations", amount: -10 },
            { kind: "morale", amount: -2 },
          ],
        },
      ],
    },
    aftermath: {
      id: "cairn-singer-folk-aftermath",
      title: "The Restless Thaw",
      art: "crisis",
      trigger: "colony",
      text: "Confined to heated dome-towns after our uplift on {colony}, young Cairn-Singers grow restless without the seasonal trek, staging noisy strikes outside the thermal reactors.",
      choices: [
        {
          label: "Outfit polar rover-caravans for the clans",
          result: "Mobile ice-crawlers let them roam the tundra again while mapping rich mineral seams.",
          effects: [
            { kind: "research", field: "propulsion", amount: 210 },
            { kind: "morale", amount: 4 },
            { kind: "money", amount: -140 },
          ],
        },
        {
          label: "Offer double wages at the reactor plants",
          result: "High pay quiets the pickets and keeps power flowing, though cultural elders drift away.",
          effects: [
            { kind: "factories", amount: 6 },
            { kind: "money", amount: -120 },
            { kind: "culture", amount: -45 },
          ],
        },
      ],
    },
  },
  {
    id: "mesa-potter-folk",
    name: "the Mesa-Potter Folk",
    climate: "arid",
    stage: 2,
    description: "Terraced-canyon builders who channel rare flash-floods through glazed ceramic aqueducts and fire heat-resistant tiles in solar-mirror kilns.",
    contact: {
      id: "mesa-potter-folk-contact",
      title: "Kilns of the Red Canyon",
      art: "contact",
      trigger: "colony",
      text: "Deep in the wind-carved gorges of {colony}, the Mesa-Potter Folk tend lush terraced orchards fed by mirror-bright ceramic cisterns.",
      choices: [
        {
          label: "Uplift their kiln-guilds with modern metallurgy",
          result: "Master ceramicists adapt our plasma torches to bake ultra-dense ablative armor plates.",
          effects: [
            { kind: "population", amount: 3 },
            { kind: "research", field: "construction", amount: 250 },
            { kind: "money", amount: -95 },
          ],
        },
        {
          label: "Leave the canyon terraces under native rule",
          result: "Our outposts trade quietly for hand-glazed wares, earning renown for restrained diplomacy.",
          effects: [
            { kind: "culture", amount: 105 },
            { kind: "relations", amount: 8 },
          ],
        },
        {
          label: "Divert the canyon aquifers to colonial mills",
          result: "Damming the upper gorges powers rapid factory construction at the cost of our reputation.",
          effects: [
            { kind: "factories", amount: 8 },
            { kind: "planetSize", amount: 3 },
            { kind: "relations", amount: -13 },
          ],
        },
      ],
    },
    aftermath: {
      id: "mesa-potter-folk-aftermath",
      title: "Mirrors of the High Rim",
      art: "contact",
      trigger: "colony",
      text: "Thirty years after our uplift on {colony}, Mesa-Potter artisans have scaled their ancient solar kilns into orbital reflector arrays, offering to beam clean power or test laser optics.",
      choices: [
        {
          label: "Focus the array on atmospheric terraforming",
          result: "Controlled solar warmth greens dry basins around {colony} and expands habitable land.",
          effects: [
            { kind: "planetSize", amount: 5 },
            { kind: "population", amount: 2 },
            { kind: "money", amount: -120 },
          ],
        },
        {
          label: "Calibrate the mirrors for beam-weapon trials",
          result: "Focusing orbital sunlight yields sharp breakthroughs in coherent beam emitters.",
          effects: [
            { kind: "research", field: "weapons", amount: 280 },
            { kind: "morale", amount: -2 },
          ],
        },
      ],
    },
  },
  {
    id: "gear-wright-folk",
    name: "the Gear-Wright Folk",
    climate: "steppe",
    stage: 3,
    description: "Wind-swept prairie industrialists running brass difference-engines, coal rail-lines, and spark-gap radio towers that intercepted our orbital beacons within hours.",
    contact: {
      id: "gear-wright-folk-contact",
      title: "Signals from the Grass Sea",
      art: "contact",
      trigger: "colony",
      text: "Before our landers even touch down on {colony}, the Gear-Wright Folk broadcast prime-number greetings from brass radio masts across the open steppe.",
      choices: [
        {
          label: "Uplift their academies with starfaring science",
          result: "Their clockwork mathematicians devour digital computing in months and crowd our technical colleges.",
          effects: [
            { kind: "population", amount: 4 },
            { kind: "research", field: "computers", amount: 320 },
            { kind: "money", amount: -130 },
          ],
        },
        {
          label: "Leave their prairie nations self-governing",
          result: "We settle a distant plateau and exchange radio symphonies, impressing galactic observers.",
          effects: [
            { kind: "culture", amount: 120 },
            { kind: "relations", amount: 10 },
          ],
        },
        {
          label: "Annex their rail-hubs and coal-fired mills",
          result: "Refitting their existing factories boosts output immediately, though rivals denounce the conquest.",
          effects: [
            { kind: "factories", amount: 10 },
            { kind: "relations", amount: -15 },
            { kind: "morale", amount: -3 },
          ],
        },
      ],
    },
    aftermath: {
      id: "gear-wright-folk-aftermath",
      title: "The Brass Manifesto",
      art: "council",
      trigger: "colony",
      text: "Having leaped from steam to starships in three decades on {colony}, Gear-Wright assemblies demand equal seats on the colonial council and tariff-free export of their precision instruments.",
      choices: [
        {
          label: "Grant full parliamentary parity",
          result: "Joint civic boards spark a golden wave of invention and shared pride across {colony}.",
          effects: [
            { kind: "culture", amount: 110 },
            { kind: "research", field: "computers", amount: 260 },
            { kind: "morale", amount: 4 },
          ],
        },
        {
          label: "Keep colonial administration under central governors",
          result: "Tax revenues flow straight to the treasury, though prairie workshops stage slowdowns.",
          effects: [
            { kind: "money", amount: 220 },
            { kind: "morale", amount: -5 },
          ],
        },
      ],
    },
  },
  {
    id: "reed-harper-folk",
    name: "the Reed-Harper Folk",
    climate: "terran",
    stage: 1,
    description: "River-delta fisher-poets weaving hollow-reed wind organs that hum in harmony with the planet's aurora, living in woven stilted hamlets.",
    contact: {
      id: "reed-harper-folk-contact",
      title: "Music of the Delta",
      art: "contact",
      trigger: "colony",
      text: "Along the silver estuaries of {colony}, the Reed-Harper Folk greet our landing boats with haunting wind-organ chords echoing across the marsh.",
      choices: [
        {
          label: "Uplift the delta villages with civic clinics",
          result: "Healthy, eager river-clans swell our growing towns and share subtle acoustic resonance insights.",
          effects: [
            { kind: "population", amount: 3 },
            { kind: "research", field: "forceFields", amount: 190 },
            { kind: "money", amount: -75 },
          ],
        },
        {
          label: "Leave the river deltas as a cultural sanctuary",
          result: "Recordings of their aurora-organs captivate audiences across our empire, elevating civic spirit.",
          effects: [
            { kind: "culture", amount: 115 },
            { kind: "morale", amount: 3 },
          ],
        },
        {
          label: "Drain the rich delta wetlands for estates",
          result: "Reclaiming the fertile floodplains adds prime farmland, though other powers frown on the seizure.",
          effects: [
            { kind: "planetSize", amount: 5 },
            { kind: "relations", amount: -12 },
          ],
        },
      ],
    },
    aftermath: {
      id: "reed-harper-folk-aftermath",
      title: "Harmonics in the Hull",
      art: "anomaly",
      trigger: "colony",
      text: "Uplifted Reed-Harper acousticians on {colony} discover that tuning deflector emitters to their delta wind-scales cancels shield harmonics, though traditionalists warn the experiment disturbs local wildlife.",
      choices: [
        {
          label: "Adopt harmonic shield modulation",
          result: "Naval engineers record dramatic gains in field stability during orbital trials.",
          effects: [
            { kind: "research", field: "forceFields", amount: 290 },
            { kind: "morale", amount: -2 },
          ],
        },
        {
          label: "Restrict emitters to preserve the delta ecology",
          result: "Quiet skies return to the estuaries, boosting colony morale and visitor acclaim.",
          effects: [
            { kind: "culture", amount: 95 },
            { kind: "morale", amount: 4 },
          ],
        },
      ],
    },
  },
  {
    id: "star-lens-folk",
    name: "the Star-Lens Folk",
    climate: "desert",
    stage: 2,
    description: "Night-traveling oasis dwellers who fuse lightning-struck desert sand into optical lenses and store monsoon water in deep stone cisterns.",
    contact: {
      id: "star-lens-folk-contact",
      title: "Lenses in the Starlight",
      art: "contact",
      trigger: "colony",
      text: "Under the clear desert stars of {colony}, astronomers of the Star-Lens Folk already track our orbiting cruisers through hand-ground fulgurite telescopes.",
      choices: [
        {
          label: "Uplift their observatories with modern optics",
          result: "Their patient sky-watchers join our sensor crews and refine deep-space targeting algorithms.",
          effects: [
            { kind: "population", amount: 2 },
            { kind: "research", field: "computers", amount: 240 },
            { kind: "money", amount: -85 },
          ],
        },
        {
          label: "Leave the oasis towns undisturbed",
          result: "We build our spaceport on the salt flats, earning respect for honoring their ancient sky-watches.",
          effects: [
            { kind: "culture", amount: 100 },
            { kind: "relations", amount: 8 },
          ],
        },
        {
          label: "Seize the oasis cisterns for colonial industry",
          result: "Controlling the desert water table speeds factory growth while alienating neighboring empires.",
          effects: [
            { kind: "factories", amount: 7 },
            { kind: "planetSize", amount: 3 },
            { kind: "relations", amount: -12 },
          ],
        },
      ],
    },
    aftermath: {
      id: "star-lens-folk-aftermath",
      title: "The Unblinking Eye",
      art: "crisis",
      trigger: "colony",
      text: "Armed with uplifted sensor arrays on {colony}, Star-Lens watchers expose secret smuggling rings run by colonial officials, sparking a furious political scandal.",
      choices: [
        {
          label: "Back the watchers and purge corrupt officials",
          result: "Seized contraband fills the treasury and cements fierce native trust in our rule.",
          effects: [
            { kind: "money", amount: 210 },
            { kind: "morale", amount: 4 },
            { kind: "factories", amount: -4 },
          ],
        },
        {
          label: "Hush the inquiry to keep shipyards running",
          result: "Mills stay on schedule, though disillusioned astronomers dim their desert beacons in protest.",
          effects: [
            { kind: "factories", amount: 6 },
            { kind: "morale", amount: -4 },
            { kind: "culture", amount: -50 },
          ],
        },
      ],
    },
  },
  {
    id: "shale-burrow-folk",
    name: "the Shale-Burrow Folk",
    climate: "minimal",
    stage: 3,
    description: "Subterranean tunnel-engineers breathing thin highland air through lime-scrubbers, running pneumatic transit tubes and early fission boilers beneath barren slate hills.",
    contact: {
      id: "shale-burrow-folk-contact",
      title: "Echoes Under the Slate",
      art: "contact",
      trigger: "colony",
      text: "Seismic sensors on {colony} reveal a sprawling network of pressurized slate caverns where the Shale-Burrow Folk already operate early atomic boilers.",
      choices: [
        {
          label: "Uplift their subterranean guilds with fusion tech",
          result: "Veteran tunnel-miners master zero-gravity boring rigs and swell our industrial workforce.",
          effects: [
            { kind: "population", amount: 4 },
            { kind: "research", field: "weapons", amount: 310 },
            { kind: "money", amount: -140 },
          ],
        },
        {
          label: "Leave the deep caverns to their guild-councils",
          result: "Surface domes trade air-scrubbers for carved slate art, winning praise for peaceful restraint.",
          effects: [
            { kind: "culture", amount: 115 },
            { kind: "relations", amount: 10 },
          ],
        },
        {
          label: "Commandeer their pressurized cavern complexes",
          result: "Ready-made underground vaults expand our living space and foundries at a steep diplomatic cost.",
          effects: [
            { kind: "planetSize", amount: 5 },
            { kind: "factories", amount: 8 },
            { kind: "relations", amount: -16 },
          ],
        },
      ],
    },
    aftermath: {
      id: "shale-burrow-folk-aftermath",
      title: "The Deep Vein Strike",
      art: "crisis",
      trigger: "colony",
      text: "Thirty years after our uplift on {colony}, Shale-Burrow miners unearth a rich core-metal seam beneath the capital, demanding autonomous mineral royalties before cutting a single ton.",
      choices: [
        {
          label: "Sign the cavern royalty charter",
          result: "Ore hoists run day and night, flooding our shipyards with high-grade alloy.",
          effects: [
            { kind: "factories", amount: 9 },
            { kind: "morale", amount: 3 },
            { kind: "money", amount: -160 },
          ],
        },
        {
          label: "Nationalize the deep seam for imperial defense",
          result: "Treasury reserves surge from state ore exports, though bitter miners sabotage surface vents.",
          effects: [
            { kind: "money", amount: 250 },
            { kind: "morale", amount: -5 },
            { kind: "factories", amount: -5 },
          ],
        },
      ],
    },
  },
];