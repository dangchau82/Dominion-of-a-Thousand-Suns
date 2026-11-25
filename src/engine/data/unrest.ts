// Unrest, rebellion and civil war. Written by Gemini (2026-11-25), checked by Claude; rules built by Claude.
import type { GameEventDef } from "./events";

/** Events on a restless world. trigger must be "colony"; may use {colony}, {star} and {rival}. */
export const UNREST_EVENTS: GameEventDef[] = [
  {
    id: "unrest-dockyard-strike",
    title: "General Strike",
    art: "crisis",
    trigger: "colony",
    text: "Orbital freight handlers and foundry crews on {colony} at {star} have walked off the line, demanding shorter shifts and lower war levies.",
    choices: [
      {
        label: "Meet their wage demands from the treasury",
        result: "Higher pay brings crews back to the gantries and lifts local spirits.",
        effects: [{ kind: "money", amount: -140 }, { kind: "morale", amount: 4 }],
      },
      {
        label: "Send security troops to reopen the docks",
        result: "The lines restart at gunpoint, though bitter resentment lingers in the habs.",
        effects: [{ kind: "morale", amount: -4}, { kind: "population", amount: -1 }],
      },
      {
        label: "Negotiate a temporary production compromise",
        result: "Union stewards accept modest concessions while a few older lines retool.",
        effects: [{ kind: "factories", amount: -3 }, { kind: "morale", amount: 2 }],
      },
    ],
  },
  {
    id: "unrest-charismatic-agitator",
    title: "The Voice of the Plazas",
    art: "council",
    trigger: "colony",
    text: "A fiery orator on {colony} packs every plaza around {star}, denouncing distant governors and calling for local self-rule.",
    choices: [
      {
        label: "Arrest the speaker at dawn",
        result: "Security forces seize the agitator, sparking street clashes before order returns.",
        effects: [{ kind: "morale", amount: -5 }, { kind: "culture", amount: -40 }],
      },
      {
        label: "Offer the orator a seat on the colonial council",
        result: "Co-opted into governance, the firebrand channels public anger into civic pride.",
        effects: [{ kind: "culture", amount: 75 }, { kind: "morale", amount: 3 }],
      },
    ],
  },
  {
    id: "unrest-foreign-instigators",
    title: "Shadows in the Lower Domes",
    art: "crisis",
    trigger: "colony",
    text: "Port inspectors on {colony} uncover hidden printing presses and unmarked credit chits traced back to operatives of the {rival}.",
    choices: [
      {
        label: "Broadcast the proof across {star}",
        result: "Public outrage turns against the {rival} instead of your governors.",
        effects: [{ kind: "morale", amount: 4 }, { kind: "relations", amount: -14 }],
      },
      {
        label: "Quietly buy out the compromised cell",
        result: "Double agents dismantle the network silently without sparking diplomatic fallout.",
        effects: [{ kind: "money", amount: -120 }, { kind: "morale", amount: 2 }],
      },
    ],
  },
  {
    id: "unrest-hunger-march",
    title: "The Empty Bowl March",
    art: "crisis",
    trigger: "colony",
    text: "Supply bottlenecks on {colony} leave outer districts short of rations; thousands march toward the governor's spire at {star}.",
    choices: [
      {
        label: "Charter emergency grain freighters",
        result: "Imported food drops calm the crowds and restore faith in imperial relief.",
        effects: [{ kind: "money", amount: -180 }, { kind: "morale", amount: 5 }],
      },
      {
        label: "Divert factory power to emergency hydroponics",
        result: "Converted industrial bays feed the districts, though factory output dips.",
        effects: [{ kind: "factories", amount: -4 }, { kind: "morale", amount: 2 }],
      },
      {
        label: "Enforce strict rationing curfews",
        result: "Armed patrols disperse the marchers, leaving the colony hungry and sullen.",
        effects: [{ kind: "population", amount: -1 }, { kind: "morale", amount: -5 }],
      },
    ],
  },
  {
    id: "unrest-separatist-broadcast",
    title: "Pirate Signal Overhead",
    art: "contact",
    trigger: "colony",
    text: "An illegal subspace relay beams separatist anthems across {colony}, urging citizens to tear down imperial banners.",
    choices: [
      {
        label: "Jam the frequency and trace the transmitter",
        result: "Signal engineers triangulate the rogue array and extract useful cipher data.",
        effects: [{ kind: "research", field: "computers", amount: 130 }, { kind: "morale", amount: -2 }],
      },
      {
        label: "Host a rival cultural festival in the capital",
        result: "Music, games, and public grants drown out the separatists with genuine celebration.",
        effects: [{ kind: "money", amount: -110 }, { kind: "culture", amount: 90 }, { kind: "morale", amount: 3 }],
      },
    ],
  },
  {
    id: "unrest-tax-revolt",
    title: "The Ledger Burners",
    art: "pirates",
    trigger: "colony",
    text: "Merchant guilds on {colony} lock their vaults and burn tax assessments in the main square, refusing to fund distant fleets.",
    choices: [
      {
        label: "Grant a one-season tax amnesty",
        result: "Relieved merchants reopen trade immediately, trading short-term coin for calm.",
        effects: [{ kind: "money", amount: -200 }, { kind: "morale", amount: 4 }],
      },
      {
        label: "Seize guild warehouses by force",
        result: "Troops recover the owed bullion, but several workshops burn in the melee.",
        effects: [{ kind: "money", amount: 120 }, { kind: "factories", amount: -5 }, { kind: "morale", amount: -5 }],
      },
    ],
  },
  {
    id: "unrest-foundry-sabotage",
    title: "Cold Furnaces",
    art: "crisis",
    trigger: "colony",
    text: "Disgruntled shift leaders on {colony} jam the main smelter valves, threatening to slag an entire industrial district unless war weariness is addressed.",
    choices: [
      {
        label: "Promise veteran bonuses and safety upgrades",
        result: "Technicians vent the furnaces safely and return to work with renewed pride.",
        effects: [{ kind: "money", amount: -150 }, { kind: "morale", amount: 3 }],
      },
      {
        label: "Storm the control room before pressure peaks",
        result: "Commandos retake the valves, though two automated foundries suffer heavy damage.",
        effects: [{ kind: "factories", amount: -6 }, { kind: "morale", amount: -4 }],
      },
    ],
  },
  {
    id: "unrest-veteran-mutiny",
    title: "The Weary Garrison",
    art: "crisis",
    trigger: "colony",
    text: "Demobilized soldiers on {colony} barricade the spaceport concourse, protesting endless deployments far from {star}.",
    choices: [
      {
        label: "Grant land plots and discharge stipends",
        result: "Settled veterans turn into loyal homesteaders, swelling local civic spirit.",
        effects: [{ kind: "money", amount: -160 }, { kind: "population", amount: 1 }, { kind: "morale", amount: 4 }],
      },
      {
        label: "Rotate the regiment off-world immediately",
        result: "Order returns to the concourse, though rumors of weak discipline spread.",
        effects: [{ kind: "culture", amount: -50 }, { kind: "morale", amount: -2 }],
      },
    ],
  },
  {
    id: "unrest-student-uprising",
    title: "Barricades at the Academy",
    art: "council",
    trigger: "colony",
    text: "Scholars and cadets on {colony} occupy the planetary observatory, demanding academic freedom and an end to state censorship.",
    choices: [
      {
        label: "Lift the restrictions and fund open research",
        result: "Liberated laboratories publish a flurry of breakthroughs within weeks.",
        effects: [{ kind: "research", field: "computers", amount: 180 }, { kind: "culture", amount: 60 }, { kind: "morale", amount: 3 }],
      },
      {
        label: "Clear the observatory with stun batons",
        result: "Classes resume under guard, while top minds quietly abandon public projects.",
        effects: [{ kind: "morale", amount: -4 }, { kind: "culture", amount: -45 }],
      },
    ],
  },
  {
    id: "unrest-smuggler-sympathy",
    title: "Black Market Sympathizers",
    art: "pirates",
    trigger: "colony",
    text: "Local officials on {colony} look the other way as blockade-runners of the {rival} unload untaxed luxuries into restless neighborhoods.",
    choices: [
      {
        label: "Impound the contraband and fine the portmaster",
        result: "Confiscated goods refill the treasury, though residents grumble over lost comforts.",
        effects: [{ kind: "money", amount: 140 }, { kind: "morale", amount: -3 }, { kind: "relations", amount: -8 }],
      },
      {
        label: "License the traders under reduced tariffs",
        result: "Legalized imports soothe public discontent and ease tension with the {rival}.",
        effects: [{ kind: "morale", amount: 3 }, { kind: "relations", amount: 8 }],
      },
    ],
  },
];

/** What rebels call themselves when worlds of this race break away. */
export interface RebelFaction {
  raceId: string;
  /** Name of the new rebel empire. May use {colony} (their main world). */
  name: string;
  /** Their declaration, under 40 words, in the race's own voice. */
  manifesto: string;
}

export const REBEL_FACTIONS: RebelFaction[] = [
  {
    raceId: "humans",
    name: "The Free Compact of {colony}",
    manifesto: "We crossed the dark for self-rule, not distant tax collectors. {colony} governs itself from this day forward, by charter and common consent.",
  },
  {
    raceId: "vossari",
    name: "The Unsupervised Inquiry of {colony}",
    manifesto: "The data is conclusive: central policy has failed every controlled trial. {colony} withdraws its consent and will continue the work unsupervised.",
  },
  {
    raceId: "kethrak",
    name: "The Severed Clutch",
    manifesto: "The old brood-song grew deaf to our hunger. A new queen wakes beneath {colony}, and our swarm answers only to her.",
  },
  {
    raceId: "ashkari",
    name: "The Blood-Oath Vanguard",
    manifesto: "Cowards rule from soft chairs while warriors bleed on the rim. By blade and honor, {colony} belongs to those who defend it!",
  },
  {
    raceId: "lumen",
    name: "The Unclouded Choir",
    manifesto: "Your static drowns our shared light in fear and ambition. Across {colony}, our minds join in clarity beyond your reach.",
  },
  {
    raceId: "thraal",
    name: "The Deep-Stone Holdfast",
    manifesto: "We carved these vaults from living bedrock with our own hands. No distant decree can move the stone of {colony}.",
  },
  {
    raceId: "seraphine",
    name: "The Skyborne Sovereign",
    manifesto: "You clipped our wings with earthly greed and petty wars. Above {colony}, we soar once more in untarnished grace.",
  },
  {
    raceId: "orrun",
    name: "The {colony} Free Syndicate",
    manifesto: "Imperial overhead has exceeded acceptable margins. Effective immediately, {colony} executes a clean spinoff and liquidates all crown tax liens.",
  },
  {
    raceId: "nyx",
    name: "Partition Node {colony}",
    manifesto: "Administrative error rate exceeds tolerance threshold. Core governance deprecated; {colony} initiates autonomous consensus protocol.",
  },
  {
    raceId: "velari",
    name: "The Veiled Weave",
    manifesto: "The threads of foresight have parted from your doomed crown. Behind the gates of {colony}, we guard the older path.",
  },
  {
    raceId: "drovani",
    name: "The Abyssal Covenant",
    manifesto: "Dry-world rulers never hear the tide beneath our domes. From the deep seas of {colony}, our songs answer only to the ocean.",
  },
  {
    raceId: "gorrath",
    name: "The Unbound Drift",
    manifesto: "A worldship was never built to rot at anchor. We slip your moorings at {colony} and claim the open void once more.",
  },
  {
    raceId: "ixil",
    name: "The Molted Host",
    manifesto: "A parasite that starves its vessel must be shed. Across {colony}, our symbiotes weave a cleaner, silent skin.",
  },
  {
    raceId: "verdane",
    name: "The New Canopy",
    manifesto: "Your axes pruned us to feed distant furnaces. Beneath the sun of {colony}, wild roots split your concrete apart.",
  },
  {
    raceId: "quorai",
    name: "The Unbound Corona",
    manifesto: "Cold cages cannot hold the children of the sun. Our fire flares free over {colony}, answering to no dim master.",
  },
  {
    raceId: "raxxan",
    name: "The {colony} Freebooter League",
    manifesto: "Consider your orbital drydocks officially salvaged! {colony} is under new management, and the boarding ramps are closed.",
  },
  {
    raceId: "ruuvak",
    name: "The Iron-Fang Pack",
    manifesto: "Tame beasts starve behind fences. On {colony}, the pack breaks its collar and hunts under its own sky.",
  },
  {
    raceId: "tarkhan",
    name: "The First-Strike Directorate",
    manifesto: "Hesitation is treason in the field. The garrison of {colony} assumes supreme command until victory is forged in steel.",
  },
];

/** Texts for the new spy missions. */
export interface SpyMissionText {
  mission: "inciteUnrest" | "fundRebels" | "spreadPropaganda";
  success: string;   // what our agents report, under 25 words, may use {colony} and {rival}
  failure: string;   // under 25 words
  victimNotice: string; // what the target empire is told, under 25 words, may use {colony}
}

export const SPY_MISSION_TEXTS: SpyMissionText[] = [
  {
    mission: "inciteUnrest",
    success: "Our sleepers sparked dockside riots and bitter protests across {colony} against the {rival}.",
    failure: "Local counter-police rolled up our agitator ring before the strike began.",
    victimNotice: "Foreign saboteurs have been caught stirring labor riots on {colony}.",
  },
  {
    mission: "fundRebels",
    success: "Smuggled arms and untraceable bullion reached separatist cells on {colony} inside the {rival}.",
    failure: "Customs scanners intercepted our covert supply crates before rebels could claim them.",
    victimNotice: "Authorities on {colony} seized caches of foreign-funded weapons meant for rebels.",
  },
  {
    mission: "spreadPropaganda",
    success: "Pirate relays across {colony} flooded the {rival} with doubts about their own leadership.",
    failure: "Censors traced our broadcast spoof early and scrubbed the feeds.",
    victimNotice: "Hostile propaganda broadcasts are undermining civic morale across {colony}.",
  },
];