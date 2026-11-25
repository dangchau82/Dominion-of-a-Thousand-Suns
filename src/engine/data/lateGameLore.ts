// Late-game lore: the precursors, the two elder powers, the awakening chain,
// a neutral station, two orders and a late plague. Story data for the elder-powers
// stage (not wired into the game yet: nothing here fires on its own).
// Written by Gemini, reviewed and fixed by Claude (2026-11-25): uses our event types,
// existing art only, real ship templates, numbers rescaled to the event table.

import type { EventChoice, GameEventDef } from "./events";

export type { EventChoice };

/** An event in a story chain: fires only after `requires`, on one branch. */
export interface LateGameEventDef extends GameEventDef {
  requires?: string;
  branch?: "order" | "chaos" | "neutral";
}

export interface PrecursorLegacy {
  ruins: string;
  sleepingGuardians: string;
  gates: string;
  artifacts: string;
}

export interface PrecursorData {
  name: string;
  description: string;
  legacy: PrecursorLegacy;
}

export interface ElderPowerGift {
  name: string;
  description: string;
}

export interface ElderPowerVoice {
  greeting: string;
  offer: string;
  threat: string;
  farewell: string;
}

export interface ElderPowerDef {
  id: string;
  alignment: "order" | "chaos";
  name: string;
  philosophy: string;
  appearance: string;
  gifts: {
    tech: ElderPowerGift;
    ship: ElderPowerGift;
    wonder: ElderPowerGift;
  };
  demands: string;
  wrath: string;
  voice: ElderPowerVoice;
}

export interface DiplomaticStationDef {
  name: string;
  description: string;
  /** Share of the galaxy's council votes added (0.1 = +10%). For the engine when the station is built. */
  sponsorVoteShare: number;
  embassyVoteShare: number;
  benefits: {
    councilVotes: string;
    rumours: string;
    trade: string;
  };
  upkeep: string;
}

export interface TelepathGuildDef {
  name: string;
  description: string;
  benefit: string;
  escalatingDemands: [string, string, string];
  breakingPoint: string;
}

export interface RangerOrderDef {
  name: string;
  description: string;
  benefit: string;
  sponsorCost: string;
}

export interface GuildsAndOrdersData {
  telepathGuild: TelepathGuildDef;
  rangerOrder: RangerOrderDef;
}

export interface BlightCrisisData {
  name: string;
  origin: string;
  spread: string;
  cure: string;
  events: LateGameEventDef[];
}

// ---------------------------------------------------------------------------
// 1. PRECURSORS
// ---------------------------------------------------------------------------

export const PRECURSORS: PrecursorData = {
  name: "The Serevahn",
  description:
    "Millions of years before the younger species ever lit a fusion torch, the Serevahn tended the spiral arms like an immense astronomical garden, sculpting biospheres and seeding promising worlds with sentient life. Having mapped every star lane and exhausted the physical mysteries of their epoch, they concluded that parental oversight would forever stunt their children's growth. Rather than rule as immortal gods, the Serevahn dismantled their core worlds and departed beyond the galactic rim into deep extragalactic silence. Only two splintered peer-factions refused to leave, hiding in relativistic slumber to watch how the newly seeded civilizations would mature.",
  legacy: {
    ruins:
      "Sunken Choir Vaults buried beneath frontier worlds, containing self-repairing memory basalt that yields lost physics and ancient star charts when excavated.",
    sleepingGuardians:
      "Automaton Sentinels, kilometer-long crystalline warships parked in silent Lagrange orbits around prime relic planets, programmed to annihilate unready looters.",
    gates:
      "Slipstream Rings anchored in select deep-space systems that fold local spacetime, allowing fleets to cross vast quadrants in a single turn once stabilized.",
    artifacts:
      "Chronicle Prisms scattered across nebulae and dead moons that amplify planetary research, stabilize hyperspace drives, or store compressed Serevahn equations.",
  },
};

// ---------------------------------------------------------------------------
// 2. ELDER POWERS
// ---------------------------------------------------------------------------

export const ELDER_POWERS: [ElderPowerDef, ElderPowerDef] = [
  {
    id: "gilded-lattice",
    alignment: "order",
    name: "The Gilded Lattice",
    philosophy:
      "Left unguided, young civilizations inevitably burn themselves to cinders in petty territorial wars and reckless experimentation. True compassion means imposing an unbroken architecture of law, predictability, and synchronized purpose so every sentient soul flourishes in peace.",
    appearance:
      "Their vessels resemble interlocking geometric cathedrals of white ceramic and spun gold, surrounded by silent halos of orbiting telemetry mirrors.",
    gifts: {
      tech: {
        name: "Harmonic Lattice Indoctrination",
        description:
          "Synchronizes civic communications and neural relays across every colony, eliminating unrest and locking planetary industry to peak mathematical efficiency.",
      },
      ship: {
        name: "Justiciar Bastion-Cruiser",
        description:
          "A towering white-gold dreadnought equipped with stasis-web projectors that immobilize enemy squadrons before precision solar-lance volleys.",
      },
      wonder: {
        name: "Spire of Unbroken Concord",
        description:
          "An orbital crystalline needle that radiates a tranquil harmonic field across adjacent systems, boosting empire culture and galactic council authority.",
      },
    },
    demands:
      "Allies must halt unprovoked wars of conquest, submit border disputes to Lattice arbitration, and construct Coherence Beacons on their largest colonies.",
    wrath:
      "To those who side with chaos, the Lattice dispatches Justiciar pacification fleets to lockdown starports, freeze orbital shipyards in stasis fields, and turn rebellious worlds into silent administrative protectorates.",
    voice: {
      greeting:
        "We have measured your pulse since your first radio spark left the cradle, little flame, step into the light and be spared the dark.",
      offer:
        "Accept our architecture of peace, and we shall quiet the noise of your borders and crown your skies with unbroken harmony.",
      threat:
        "You mistake loud anarchy for freedom; if you will not temper your own blades, we shall place your stars under gentle, permanent custody.",
      farewell:
        "Return to your worlds and listen for the chime, order is never far from those weary of bleeding.",
    },
  },
  {
    id: "cinder-pact",
    alignment: "chaos",
    name: "The Cinder Pact",
    philosophy:
      "Stagnation is the only true death, and any species sheltered from pain becomes brittle livestock waiting for extinction. Only through relentless conflict, upheaval, and survival against impossible odds can the younger races forge themselves into worthy inheritors of the stars.",
    appearance:
      "Their hulls are jagged, asymmetrical shards of blackened meteorite veined with pulsing magma-orange conduits that shift shape between battles.",
    gifts: {
      tech: {
        name: "Crucible Mutagenic Synthesis",
        description:
          "Forces rapid biological and metallurgical adaptation under extreme stress, allowing populations and factories to thrive on hostile worlds.",
      },
      ship: {
        name: "Maw-Reaver Dreadnought",
        description:
          "A predatory siege leviathan that strips scrap and reactor plasma from destroyed enemy hulls to repair its own armor mid-combat.",
      },
      wonder: {
        name: "The Pyre of Perpetual Strife",
        description:
          "A tethered artificial flare-star that converts fleet battles and planetary sieges into massive surges of weapons research and wartime production.",
      },
    },
    demands:
      "Allies must break non-aggression treaties, keep active war fronts open against neighboring empires, and never allow their military fleets to sit idle in peacetime.",
    wrath:
      "Against allies of the Lattice, the Cinder Pact seeds orbital sabotage cells, incites violent planetary uprisings, and unleashes Maw-Reaver raiding packs to burn outlying colonies to ash.",
    voice: {
      greeting:
        "Good, you still carry scars on your hulls; only a species that remembers how to bite is worth speaking to.",
      offer:
        "Tear down your velvet treaties and strike your neighbors, and we will hand you the fire to remake this stagnant galaxy.",
      threat:
        "Crawl beneath the Lattice's gilded cage if you wish, soft-shell, we will gladly crack your domes open to remind you how to breathe.",
      farewell:
        "Go sharpen your steel; when the sky catches fire, we will see whether you burn or ascend.",
    },
  },
];

// ---------------------------------------------------------------------------
// 3. AWAKENING CHAIN (8 ORDERED EVENTS)
// ---------------------------------------------------------------------------

export const AWAKENING_CHAIN: LateGameEventDef[] = [
  {
    id: "awakening-1-harmonic-echo",
    title: "The Subspace Metronome",
    art: "ruins",
    trigger: "explore",
    text: "Deep inside an excavated Serevahn vault near {star}, dead monoliths have suddenly begun pulsing in two competing rhythms, one a serene, mathematical chime, the other a ragged, thunderous heartbeat.",
    choices: [
      {
        label: "Record both carrier frequencies",
        result: "Our sensor arrays capture centuries of compressed telemetry before the vault seals itself.",
        effects: [
          { kind: "research", field: "computers", amount: 350 },
          { kind: "research", field: "forceFields", amount: 250 },
        ],
      },
      {
        label: "Harvest the awakened power cells",
        result: "Engineers extract super-dense crystalline capacitors worth a small fortune.",
        effects: [{ kind: "money", amount: 280 }],
      },
      {
        label: "Broadcast the signal to all worlds",
        result: "Philosophers and artists across our empire debate the meaning of the twin voices.",
        effects: [{ kind: "culture", amount: 140 }],
      },
    ],
  },
  {
    id: "awakening-2-vanished-picket",
    title: "Gone Without Debris",
    art: "anomaly",
    trigger: "turn",
    requires: "awakening-1-harmonic-echo",
    text: "A long-range reconnaissance cutter patrolling the border near {star} vanished mid-transmission inside a sudden prism of folded gravity. Only its black-box buoy drifted out, showing silhouettes of colossal ships older than recorded history.",
    choices: [
      {
        label: "Triangulate their hyperspace wake",
        result: "Propulsion theorists map seven previously hidden deep-space corridors.",
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "research", field: "propulsion", amount: 300 },
        ],
      },
      {
        label: "Fortify our frontier colonies",
        result: "Shipyards and orbital defenses go on high alert, though citizens grow anxious.",
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Warn the {rival} of the threat",
        result: "Even the {rival}'s high command takes the telemetry seriously, easing border hostility.",
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "culture", amount: 60 },
        ],
      },
    ],
  },
  {
    id: "awakening-3-lattice-herald",
    title: "Herald of the Gilded Lattice",
    art: "contact",
    trigger: "turn",
    requires: "awakening-2-vanished-picket",
    text: "A towering white-gold spire-ship has materialized cleanly above {colony} without triggering a single proximity alarm. Its envoy speaks directly into every receiver: 'We are the Gilded Lattice, elder shepherds of the Serevahn line, returned to save you from your own savagery.'",
    choices: [
      {
        label: "Welcome their envoys with ceremony",
        result: "The Lattice rewards our courtesy with architectural schemas and serene civic guidance.",
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: 6 },
        ],
      },
      {
        label: "Demand technological proof of goodwill",
        result: "Unruffled, the herald transmits compact shield harmonics into our central databanks.",
        effects: [{ kind: "research", field: "forceFields", amount: 380 }],
      },
      {
        label: "Keep weapons locked and demand they withdraw",
        result: "The vessel glides silently back into high orbit, noting our defiance.",
        effects: [
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -8 },
        ],
      },
    ],
  },
  {
    id: "awakening-4-cinder-herald",
    title: "Emissary of the Cinder Pact",
    art: "contact",
    trigger: "turn",
    requires: "awakening-3-lattice-herald",
    text: "Days after the Lattice's arrival, a jagged obsidian warship tore open a gravity rift near {star}, venting plasma fire across the void. Its commander laughs over an open channel: 'The Lattice wants you domesticated like prize cattle; we are the Cinder Pact, and we offer you the teeth to conquer the {rival}!'",
    choices: [
      {
        label: "Study their aggressive hull metallurgy",
        result: "Even from sensor scans alone, our foundry masters glean radical alloy techniques.",
        effects: [{ kind: "research", field: "construction", amount: 360 }],
      },
      {
        label: "Accept a token cache of siege munitions",
        result: "Drop pods land outside {colony} packed with exotic warheads and plasma cores.",
        effects: [
          { kind: "research", field: "weapons", amount: 360 },
          { kind: "relations", amount: -12 },
        ],
      },
      {
        label: "Condemn their warmongering publicly",
        result: "Our stand for self-determination resonates across diplomatic channels.",
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "relations", amount: 12 },
        ],
      },
    ],
  },
  {
    id: "awakening-5-the-reckoning",
    title: "The War in Heaven Begins",
    art: "council",
    trigger: "turn",
    requires: "awakening-4-cinder-herald",
    text: "Across the galaxy, ancient relays ignite as the Gilded Lattice and the Cinder Pact declare an irreconcilable crusade over the fate of all younger civilizations. Twin ultimatums arrive at {colony}: kneel beneath the Lattice's eternal peace, march under the Pact's blazing crucible, or stand alone against both.",
    choices: [
      {
        label: "Pledge allegiance to the Gilded Lattice",
        result: "Golden coherence beacons descend upon our worlds as we enter the Lattice's ordered fold.",
        effects: [
          { kind: "money", amount: 260 },
          { kind: "research", field: "forceFields", amount: 350 },
          { kind: "morale", amount: 8 },
        ],
      },
      {
        label: "Swear the blood-oath of the Cinder Pact",
        result: "Crucible foundries roar to life across our colonies as we embrace total galactic struggle.",
        effects: [
          { kind: "money", amount: 260 },
          { kind: "research", field: "weapons", amount: 350 },
          { kind: "factories", amount: 10 },
        ],
      },
      {
        label: "Reject both Elder Powers and claim neutrality",
        result: "We declare that the galaxy belongs to its living inheritors, not ghosts from a dead age.",
        effects: [
          { kind: "culture", amount: 160 },
          { kind: "relations", amount: 20 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
  {
    id: "awakening-6-order-mandate",
    title: "The Gilded Pacification",
    art: "council",
    trigger: "turn",
    requires: "awakening-5-the-reckoning",
    branch: "order",
    text: "Under the Gilded Lattice's oversight, crime and civil friction on {colony} evaporate overnight, yet local governors bristle as golden adjudicators audit every shipyard manifest and demand we enforce an immediate ceasefire with the {rival}.",
    choices: [
      {
        label: "Submit fully to Lattice integration",
        result: "Synchronized logistics flood our treasury and supercharge planetary output.",
        effects: [
          { kind: "money", amount: 300 },
          { kind: "factories", amount: 8 },
          { kind: "culture", amount: -60 },
        ],
      },
      {
        label: "Negotiate limited autonomy for our fleets",
        result: "We keep command of our own hulls while adopting Lattice targeting computers.",
        effects: [
          { kind: "research", field: "computers", amount: 380 },
          { kind: "morale", amount: 4 },
        ],
      },
      {
        label: "Quietly shield dissidents from re-education",
        result: "Our citizens adore their leaders for protecting local identity beneath the golden gaze.",
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "morale", amount: 8 },
        ],
      },
    ],
  },
  {
    id: "awakening-7-chaos-crucible",
    title: "The Tempering Fire",
    art: "crisis",
    trigger: "turn",
    requires: "awakening-5-the-reckoning",
    branch: "chaos",
    text: "True to its creed, the Cinder Pact has dropped predatory bio-forges onto {colony} and demanded we launch an immediate offensive against the {rival} to prove we deserve their elder weaponry.",
    choices: [
      {
        label: "Unleash full war production",
        result: "Smokestacks blacken the sky as workers push past exhaustion to arm the fleet.",
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "research", field: "weapons", amount: 350 },
          { kind: "population", amount: -3 },
        ],
      },
      {
        label: "Turn the crucible on our own frontier terrain",
        result: "Terraforming charges crack tectonic vaults, expanding habitable land on {colony}.",
        effects: [
          { kind: "planetSize", amount: 8 },
          { kind: "research", field: "planetology", amount: 300 },
        ],
      },
      {
        label: "Raid the {rival}'s border convoys for tribute",
        result: "Fast raiders return laden with plundered bullion and captured star charts.",
        effects: [
          { kind: "money", amount: 290 },
          { kind: "relations", amount: -20 },
        ],
      },
    ],
  },
  {
    id: "awakening-8-neutral-league",
    title: "Covenant of the Unbound",
    art: "council",
    trigger: "turn",
    requires: "awakening-5-the-reckoning",
    branch: "neutral",
    text: "Envoys from independent worlds, and even weary diplomats from the {rival}, have gathered in orbit above {colony}, rallying behind our refusal to bow to either the Lattice or the Cinder Pact.",
    choices: [
      {
        label: "Found a mutual-defense intelligence network",
        result: "Shared sensor grids expose deep-space movements across every unaligned sector.",
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "research", field: "computers", amount: 340 },
          { kind: "relations", amount: 18 },
        ],
      },
      {
        label: "Pool wartime trade tariffs into a defense fund",
        result: "Neutral merchant convoys reroute through our spaceports, enriching our treasury.",
        effects: [
          { kind: "money", amount: 300 },
          { kind: "culture", amount: 110 },
        ],
      },
      {
        label: "Raise a volunteer frontier militia",
        result: "Inspired pilots from across the sector enlist and fly fast patrol craft for free space.",
        effects: [
          { kind: "ships", template: "scout", count: 3 },
          { kind: "morale", amount: 8 },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 4. NEUTRAL DIPLOMATIC STATION
// ---------------------------------------------------------------------------

export const STATION: DiplomaticStationDef = {
  name: "The Meridian Spindle",
  description:
    "A colossal, counter-rotating neutral habitat anchored in an unaligned deep-space crossroads, maintained by an independent civic charter as neutral ground where rival ambassadors, syndicate brokers, and stellar cartographers meet without orbital weapons.",
  sponsorVoteShare: 0.1,
  embassyVoteShare: 0.05,
  benefits: {
    councilVotes:
      "Its sponsor gains 10% more votes in the Galactic Council; each empire with a funded embassy module gains 5% more.",
    rumours:
      "Provides early intelligence warnings on covert espionage plots, secret fleet buildups, and impending Elder Power ultimatums one to two turns before they strike.",
    trade:
      "Generates +15% bilateral trade income for all empires at peace with the station's current host and opens neutral black-market resource swaps during wartime.",
  },
  upkeep:
    "Costs 45 BC per turn in structural maintenance and neutral security subsidies, split evenly among all funding signatory empires (or paid in full by a sole builder).",
};

// ---------------------------------------------------------------------------
// 5. GUILDS AND ORDERS
// ---------------------------------------------------------------------------

export const GUILDS_AND_ORDERS: GuildsAndOrdersData = {
  telepathGuild: {
    name: "The Vespera Conclave",
    description:
      "A secretive, black-robed fraternity of awakened psionics who trade mind-reading reconnaissance and mental counter-intelligence to anxious governments while quietly weaving their own web of influence.",
    benefit:
      "Increases espionage success chance by +30%, reveals rival diplomatic intentions, and doubles counter-espionage detection against enemy agents.",
    escalatingDemands: [
      "Step 1: Mandatory Psionic Screening: Demands legal authority to scan all planetary administrators and diplomatic staff, lowering empire morale by 4 while exposing local dissent.",
      "Step 2: The Silver Tithe: Demands a permanent 12% surcharge on empire treasury income and exclusive sovereign control over all newly discovered Psionic Monolith anomalies.",
      "Step 3: Ministry of Thought: Demands a permanent seat in your executive high command, forbidding you from signing treaties or declaring wars without Conclave approval.",
    ],
    breakingPoint:
      "If you refuse their demands after relying on their operatives, the Vespera Conclave triggers synchronized neural blackouts across your core colonies, paralyzing research for 5 turns, defecting half your spy network to rivals, and sparking a civil uprising on your capital.",
  },
  rangerOrder: {
    name: "The Lantern Wardens",
    description:
      "An ascetic, multi-species order of frontier pathfinders and patrol captains sworn to guard open star lanes, evacuate civilians from warzones, and stand watch against returning Serevahn horrors.",
    benefit:
      "Patrols uncolonized systems to suppress pirate raids, grants +2 sensor range along border lanes, reduces war weariness on frontier colonies, and dispatches fast escort cutters when an Elder Power or cosmic crisis attacks.",
    sponsorCost:
      "Requires an initial charter endowment of 250 BC plus 30 BC per turn in fuel and supply stipends, alongside a pledge not to bombard neutral or undefended civilian worlds.",
  },
};

// ---------------------------------------------------------------------------
// 6. LATE-GAME PLAGUE CRISIS
// ---------------------------------------------------------------------------

export const BLIGHT_CRISIS: BlightCrisisData = {
  name: "The Glass Mottle",
  origin:
    "Accidentally released from a breached Serevahn quarantine vault, the Glass Mottle is a self-replicating nano-fungal blight originally designed to sterilize rogue biome experiments by slowly vitrifying organic tissue and composite hull alloys into brittle, translucent silica.",
  spread:
    "Travels silently aboard merchant freighters, colony transports, and retreating warships, jumping automatically along active trade routes and to any star system within 4 light-years of an infected world unless strict orbital blockades are enforced.",
  cure:
    "Requires accumulating 1,800 cumulative Planetology and Computers research points toward the 'Silica-Phage Resonator' project, either solo at full cost or via a shared Galactic Council research pact where every participating empire contributes up to 450 points per turn, followed by deploying a Resonator pulse across infected hubs.",
  events: [
    {
      id: "blight-1-crystalline-rash",
      title: "The Vitreous Outbreak",
      art: "crisis",
      trigger: "colony",
      text: "Med-bays on {colony} report a terrifying affliction: patients' skin and nearby bulkhead struts are flaking into razor-sharp, translucent glass. Quarantine officers warn the Glass Mottle could spread off-world within days.",
      choices: [
        {
          label: "Seal the spaceport immediately",
          result: "Strict martial quarantine halts exports and angers citizens, but buys precious time.",
          effects: [
            { kind: "money", amount: -160 },
            { kind: "morale", amount: -6 },
            { kind: "research", field: "planetology", amount: 260 },
          ],
        },
        {
          label: "Convert factories into emergency bio-labs",
          result: "Industrial lines are stripped to sequence the nano-fungal genome.",
          effects: [
            { kind: "factories", amount: -8 },
            { kind: "research", field: "planetology", amount: 380 },
          ],
        },
        {
          label: "Suppress the reports to preserve commerce",
          result: "Trade revenue flows for one more quarter while the blight quietly takes root.",
          effects: [
            { kind: "money", amount: 200 },
            { kind: "population", amount: -4 },
          ],
        },
      ],
    },
    {
      id: "blight-2-plague-convoy",
      title: "The Drifting Lazarus Convoy",
      art: "contact",
      trigger: "turn",
      text: "Seventeen scarred refugee liners fleeing the {rival}'s infected sectors have entered {star} with failing life support, begging for orbital dockage and medical aid.",
      choices: [
        {
          label: "Admit them to isolated orbital hospital-hulks",
          result: "Costly containment modules save thousands and earn widespread galactic admiration.",
          effects: [
            { kind: "money", amount: -220 },
            { kind: "culture", amount: 150 },
            { kind: "relations", amount: 16 },
          ],
        },
        {
          label: "Turn them away at gunpoint",
          result: "Our border remains clean, though galactic diplomats condemn our coldness.",
          effects: [
            { kind: "morale", amount: -4 },
            { kind: "relations", amount: -18 },
          ],
        },
        {
          label: "Supply fuel and redirect them toward the {rival}",
          result: "A pragmatic compromise that spares our colonies without firing a shot.",
          effects: [
            { kind: "money", amount: -80 },
            { kind: "relations", amount: -6 },
          ],
        },
      ],
    },
    {
      id: "blight-3-alchemist-cartel",
      title: "Ampoules of False Hope",
      art: "pirates",
      trigger: "colony",
      text: "A syndicate cartel has flooded {colony}'s under-cities with 'Miracle Clear-Blood', an illicit stimulant that masks Glass Mottle symptoms for weeks while accelerating contagion.",
      choices: [
        {
          label: "Raid the cartel labs and seize their telemetry",
          result: "Security forces confiscate valuable metabolic logs alongside illicit bullion.",
          effects: [
            { kind: "money", amount: 180 },
            { kind: "research", field: "computers", amount: 280 },
          ],
        },
        {
          label: "Nationalize the formula as a palliative",
          result: "Modified doses ease public panic while true researchers finish the cure.",
          effects: [
            { kind: "money", amount: -140 },
            { kind: "morale", amount: 7 },
          ],
        },
        {
          label: "Execute the ringleaders in public",
          result: "Order is restored harshly, though unrest lingers in the lower districts.",
          effects: [
            { kind: "morale", amount: -5 },
            { kind: "culture", amount: -40 },
          ],
        },
      ],
    },
    {
      id: "blight-4-resonator-breakthrough",
      title: "The Silica-Phage Synthesis",
      art: "council",
      trigger: "turn",
      text: "Deep-core supercomputers near {star} have isolated the harmonic frequency that shatters Glass Mottle crystal lattices without harming living cells. Both our own worlds and the {rival}'s dying colonies await our next move.",
      choices: [
        {
          label: "Broadcast the cure openly across every frequency",
          result: "The plague collapses galaxy-wide, cementing our legacy as the saviors of civilization.",
          effects: [
            { kind: "culture", amount: 160 },
            { kind: "relations", amount: 20 },
            { kind: "morale", amount: 10 },
          ],
        },
        {
          label: "Trade the cure to the {rival} for steep reparations",
          result: "Desperate envoys empty their vaults and transfer advanced industrial blueprints.",
          effects: [
            { kind: "money", amount: 300 },
            { kind: "research", field: "construction", amount: 350 },
            { kind: "relations", amount: -15 },
          ],
        },
        {
          label: "Deploy it exclusively on our own worlds first",
          result: "Our colonies recover rapidly while rivals watch from behind crumbling quarantines.",
          effects: [
            { kind: "population", amount: 4 },
            { kind: "factories", amount: 6 },
            { kind: "relations", amount: -20 },
          ],
        },
      ],
    },
  ],
};
