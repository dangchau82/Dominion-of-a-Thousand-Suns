// Race storylines, batch 3: Orrun, Nyx, Velari, Drovani, Gorrath.
// Written by Gemini (2026-11-25, parallel-chat test, chat 2), checked by Claude. Story data only; the engine that plays them is built by Claude.
import type { StoryChapter } from "./storylines";

export const STORYLINES_3: StoryChapter[] = [
  // Orrun Consortium
  {
    id: "orrun-1-tidal-ledger",
    raceId: "orrun",
    chapter: 1,
    when: { kind: "turn", turn: 20 },
    title: "Tidal Vaults of Brine",
    art: "ruins",
    trigger: "turn",
    text: "Deep-sea salvage rigs off {colony} unearth sunken ledgers and pressure-forged hulls from an older maritime age. Consortium auditors reckon every ledger holds a margin if priced right.",
    choices: [
      {
        label: "Auction salvage rights to syndicates",
        result: "Merchants pay briskly for ancient hull alloys, though guilds grumble over cut-rate shares.",
        effects: [
          { kind: "money", amount: 220 },
          { kind: "morale", amount: -2 },
        ],
      },
      {
        label: "Fund deep-trench engineering trials",
        result: "Shipwrights adapt heavy pressure designs for brisker yard output, at steep upfront cost.",
        effects: [
          { kind: "research", field: "construction", amount: 240 },
          { kind: "factories", amount: 4 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },
  {
    id: "orrun-2-tariff-reef",
    raceId: "orrun",
    chapter: 2,
    when: { kind: "colonies", count: 3 },
    title: "Customs on the Outer Shoals",
    art: "contact",
    trigger: "turn",
    text: "With multiple worlds under Consortium charters, freighters passing {star} toward {colony} face rival toll claims. Harbor masters ask whether to levy steep transit fees or court volume.",
    choices: [
      {
        label: "Impose heavy harbor tolls",
        result: "Toll collectors fill the treasury fast, while tight margins sour visiting crews.",
        effects: [
          { kind: "money", amount: 260 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Offer discounted berth rebates",
        result: "Cheap berths draw steady traffic and boost port reputation, trimming immediate cash.",
        effects: [
          { kind: "culture", amount: 95 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "orrun-3-cartel-war",
    raceId: "orrun",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "Hostile Takeover at Sea",
    art: "crisis",
    trigger: "turn",
    text: "Open conflict with the {rival} threatens maritime trade lanes near {star}. War brokers propose either underwriting privateer raiders to bleed the {rival}'s logistics or locking capital inside fortified yards.",
    choices: [
      {
        label: "Underwrite privateer raiders",
        result: "Licensed raiders harry the {rival}'s lanes and map new stars, drawing sharp retaliation.",
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: 140 },
          { kind: "relations", amount: -14 },
        ],
      },
      {
        label: "Fortify home yards with reserves",
        result: "Protected slipways turn out dependable hulls while the {rival} tests our patience.",
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -200 },
        ],
      },
    ],
  },
  {
    id: "orrun-4-dividend-squall",
    raceId: "orrun",
    chapter: 4,
    when: { kind: "turn", turn: 160 },
    title: "The Dividend Squall",
    art: "crisis",
    trigger: "turn",
    text: "Shareholders on {colony} demand higher quarterly payouts after years of steady expansion, while dockworkers push for safer shifts and better housing.",
    choices: [
      {
        label: "Pay out a bumper dividend",
        result: "Investors cheer fat returns as overworked crews grumble over neglected quarters.",
        effects: [
          { kind: "money", amount: 250 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Reinvest in port safety and civic halls",
        result: "Better docks and cultural exchange houses lift spirits and draw new settlers.",
        effects: [
          { kind: "population", amount: 2 },
          { kind: "culture", amount: 110 },
          { kind: "money", amount: -210 },
        ],
      },
    ],
  },
  {
    id: "orrun-5a-raider-clearing",
    raceId: "orrun",
    chapter: "5A",
    when: { kind: "turn", turn: 220 },
    title: "The Privateer Clearinghouse",
    art: "council",
    trigger: "turn",
    text: "Having turned privateering against the {rival} into a profit engine, the Consortium can cement an aggressive maritime cartel or normalize ties across the council.",
    choices: [
      {
        label: "Charter a permanent raid syndicate",
        result: "Armed commerce fleets sweep rival lanes for silver, hardening frontier enmities.",
        effects: [
          { kind: "money", amount: 290 },
          { kind: "ships", template: "scout", count: 2 },
          { kind: "relations", amount: -15 },
        ],
      },
      {
        label: "Settle accounts under council law",
        result: "Formal indemnity pacts convert wartime seizures into respected council standing.",
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "relations", amount: 15 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },
  {
    id: "orrun-5b-sovereign-harbor",
    raceId: "orrun",
    chapter: "5B",
    when: { kind: "turn", turn: 220 },
    title: "The Sovereign Harbor",
    art: "victory",
    trigger: "turn",
    text: "Backing fortified yards against the {rival} kept our core docks intact through the storm. Now the board chooses between ruthless market dominance or broad coalition trade.",
    choices: [
      {
        label: "Corner key industrial contracts",
        result: "Exclusive supply monopolies swell our vaults and shipyards at the cost of goodwill.",
        effects: [
          { kind: "money", amount: 270 },
          { kind: "factories", amount: 8 },
          { kind: "relations", amount: -10 },
        ],
      },
      {
        label: "Open a galaxy-wide clearing pact",
        result: "Shared maritime standards win broad council favor and steady cultural prestige.",
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "relations", amount: 16 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },

  // Nyx Collective
  {
    id: "nyx-1-slag-memory",
    raceId: "nyx",
    chapter: 1,
    when: { kind: "turn", turn: 26 },
    title: "Memory Cores in the Slag",
    art: "ruins",
    trigger: "turn",
    text: "Excavation units on {colony} uncover intact diagnostic banks buried beneath vitrified ash. Parsing old machine protocols could refine assembly logic or add raw processing units.",
    choices: [
      {
        label: "Compile diagnostic algorithms",
        result: "Compute efficiency rises sharply, though power draw taxes active assembly lines.",
        effects: [
          { kind: "research", field: "computers", amount: 280 },
          { kind: "factories", amount: -3 },
        ],
      },
      {
        label: "Salvage chassis frames for units",
        result: "New units roll out rapidly from reclaimed frames, costing scarce power reserves.",
        effects: [
          { kind: "population", amount: 3 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },
  {
    id: "nyx-2-harsh-crust",
    raceId: "nyx",
    chapter: 2,
    when: { kind: "turn", turn: 75 },
    title: "Sub-Zero Crust Calibration",
    art: "anomaly",
    trigger: "turn",
    text: "Extreme thermal swings near {star} stress chassis joints on {colony}. The Collective can tune thermal seals for harsher worlds or run continuous output at higher wear.",
    choices: [
      {
        label: "Optimize thermal seal routines",
        result: "Field telemetry improves propulsion and environment tolerance across harsh worlds.",
        effects: [
          { kind: "research", field: "propulsion", amount: 250 },
          { kind: "planetSize", amount: 3 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "Maintain peak factory throughput",
        result: "Foundries keep producing at full load while actuator wear degrades unit cohesion.",
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "nyx-3-organic-friction",
    raceId: "nyx",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "Friction with Organic Logic",
    art: "crisis",
    trigger: "turn",
    text: "Hostilities with the {rival} confirm unstable organic decision patterns near {star}. The Collective can either hard-code aggressive targeting routines or probe the comms of the {rival} for intelligence.",
    choices: [
      {
        label: "Deploy aggressive targeting routines",
        result: "Weapons fire with sharper precision, while unit cohesion drops from combat strain.",
        effects: [
          { kind: "research", field: "weapons", amount: 270 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Decrypt the relay beacons of the {rival}",
        result: "Signal taps reveal nearby stars and comms patterns, drawing hostile scrutiny.",
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "computers", amount: 200 },
          { kind: "relations", amount: -12 },
        ],
      },
    ],
  },
  {
    id: "nyx-4-grid-autonomy",
    raceId: "nyx",
    chapter: 4,
    when: { kind: "colonies", count: 5 },
    title: "Distributed Node Consensus",
    art: "anomaly",
    trigger: "turn",
    text: "Across five worlds including {colony}, regional sub-clusters propose autonomous scheduling to cut latency. Central command weighs faster local build cycles against unified control.",
    choices: [
      {
        label: "Authorize regional build autonomy",
        result: "Local clusters expand capacity and units swiftly, with minor drift in alignment.",
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "population", amount: 2 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Enforce central clock sync",
        result: "Strict synchronization steadies collective coherence and archives structured logs.",
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 90 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "nyx-5a-iron-calculus",
    raceId: "nyx",
    chapter: "5A",
    when: { kind: "turn", turn: 215 },
    title: "The Iron Calculus",
    art: "victory",
    trigger: "turn",
    text: "Hard-coded combat logic shaped our war against the {rival}. Now the Collective decides whether to press relentless industrial superiority or formalize guarded truce protocols.",
    choices: [
      {
        label: "Maximize relentless foundry output",
        result: "Automated plants pour out hulls and weapons data, alienating organic neighbors.",
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "research", field: "weapons", amount: 320 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Publish non-interference protocols",
        result: "Predictable containment boundaries reduce friction with the {rival} and council peers.",
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "relations", amount: 14 },
          { kind: "money", amount: -120 },
        ],
      },
    ],
  },
  {
    id: "nyx-5b-signal-lattice",
    raceId: "nyx",
    chapter: "5B",
    when: { kind: "turn", turn: 215 },
    title: "The Signal Lattice",
    art: "council",
    trigger: "turn",
    text: "Intercepted frequencies of the {rival} from our earlier campaign feed a vast archive of star telemetry. The Collective can broadcast open data or lock the network behind tight filters.",
    choices: [
      {
        label: "Broadcast verified star telemetry",
        result: "Shared navigation data earns council recognition and steadier external relations.",
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "culture", amount: 140 },
          { kind: "relations", amount: 12 },
        ],
      },
      {
        label: "Seal all nodes under encryption",
        result: "Deep compute research surges behind ironclad firewalls at high maintenance cost.",
        effects: [
          { kind: "research", field: "computers", amount: 360 },
          { kind: "money", amount: -190 },
        ],
      },
    ],
  },

  // Velari
  {
    id: "velari-1-woven-starfall",
    raceId: "velari",
    chapter: 1,
    when: { kind: "turn", turn: 18 },
    title: "Threads in the First Dawn",
    art: "anomaly",
    trigger: "turn",
    text: "Sky-weavers on {colony} trace a rare alignment above {star} that echoes old gate-lore. Elders ask whether to raise an early sanctuary or chart distant star-threads.",
    choices: [
      {
        label: "Raise a star-gazer sanctuary",
        result: "Carpenters and mystics build a serene hall that lifts spirit and civic grace.",
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -120 },
        ],
      },
      {
        label: "Trace distant transit threads",
        result: "Navigators map neighboring stars and propulsion harmonics, straining treasury funds.",
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "propulsion", amount: 220 },
          { kind: "money", amount: -150 },
        ],
      },
    ],
  },
  {
    id: "velari-2-spire-masonry",
    raceId: "velari",
    chapter: 2,
    when: { kind: "goldenAge" },
    title: "Spires of the Golden Tide",
    art: "victory",
    trigger: "turn",
    text: "A golden age brightens {colony} as master masons propose monumental spires aligned to {star}. Proud craftsmen debate grand scale versus broader civic growth.",
    choices: [
      {
        label: "Carve high-spire monuments",
        result: "Towering stonework commands awe across {colony} while drawing down civic reserves.",
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "factories", amount: 5 },
          { kind: "money", amount: -180 },
        ],
      },
      {
        label: "Expand settled groves and wards",
        result: "New settlements flourish under calm stewardship, with modest cultural fanfare.",
        effects: [
          { kind: "population", amount: 3 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },
  {
    id: "velari-3-eclipse-oath",
    raceId: "velari",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "The Eclipse of Accord",
    art: "crisis",
    trigger: "turn",
    text: "War with the {rival} darkens the skies over {star}. High weavers offer a choice: channel ancient gate-warding to shield our worlds, or press proud supremacy into the {rival}'s reach.",
    choices: [
      {
        label: "Weave deep gate-warding fields",
        result: "Force-field weavers strengthen defenses and insight while exhausting resources.",
        effects: [
          { kind: "research", field: "forceFields", amount: 280 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -170 },
        ],
      },
      {
        label: "Assert proud dominion over {star}",
        result: "Bold declarations rally pride at home and reveal stars, provoking the {rival}.",
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -16 },
        ],
      },
    ],
  },
  {
    id: "velari-4-loom-of-rites",
    raceId: "velari",
    chapter: 4,
    when: { kind: "turn", turn: 165 },
    title: "Rites of the Waking Gate",
    art: "ruins",
    trigger: "turn",
    text: "Ancient gate-stones near {star} resonate with {colony}'s observatories. Weavers can spend quiet months restoring old rites or turn builders toward practical expansion.",
    choices: [
      {
        label: "Restore ancient gate rites",
        result: "Propulsion and cultural lore deepen together, though pride makes compromise harder.",
        effects: [
          { kind: "research", field: "propulsion", amount: 260 },
          { kind: "culture", amount: 110 },
          { kind: "relations", amount: -8 },
        ],
      },
      {
        label: "Direct guilds to practical works",
        result: "Workshops add steady capacity and coin, trimming mystic ceremony for now.",
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "money", amount: 150 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "velari-5a-warded-loom",
    raceId: "velari",
    chapter: "5A",
    when: { kind: "turn", turn: 225 },
    title: "The Ward-Woven Horizon",
    art: "council",
    trigger: "turn",
    text: "Having woven protective wards through the war with the {rival}, the Velari stand poised to guide the council's future or withdraw into luminous solitude.",
    choices: [
      {
        label: "Lead a council harmony compact",
        result: "Measured diplomacy earns respect across the stars and steady cultural acclaim.",
        effects: [
          { kind: "culture", amount: 155 },
          { kind: "relations", amount: 16 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Guard the inner star-lanes alone",
        result: "Shielded borders and deep field craft keep us self-reliant amid rising suspicion.",
        effects: [
          { kind: "research", field: "forceFields", amount: 340 },
          { kind: "factories", amount: 6 },
          { kind: "relations", amount: -12 },
        ],
      },
    ],
  },
  {
    id: "velari-5b-star-crowned",
    raceId: "velari",
    chapter: "5B",
    when: { kind: "turn", turn: 225 },
    title: "Crown of the Woven Dark",
    art: "victory",
    trigger: "turn",
    text: "Our proud stand against the {rival} at {star} tested every alliance. Now we decide whether to crown the Velari as first among equals or mend fences with neighbors.",
    choices: [
      {
        label: "Claim the mantle of star-keepers",
        result: "Grand wonders and cultural prestige soar while rivals bristle at our pride.",
        effects: [
          { kind: "culture", amount: 160 },
          { kind: "morale", amount: 5 },
          { kind: "relations", amount: -14 },
        ],
      },
      {
        label: "Extend an olive branch to the {rival}",
        result: "Conciliatory envoys ease old tensions and open calmer trade across the sector.",
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "money", amount: 160 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },

  // Drovani
  {
    id: "drovani-1-abyssal-current",
    raceId: "drovani",
    chapter: 1,
    when: { kind: "turn", turn: 24 },
    title: "The Slow Abyssal Current",
    art: "anomaly",
    trigger: "turn",
    text: "Deep-trench elders near {colony} sense a warm current shifting beneath the ocean floor. Unhurried councils weigh cultivating kelp-farms against studying the thermal vent.",
    choices: [
      {
        label: "Expand deep-sea kelp terraces",
        result: "Rich marine harvests support a growing population at a measured, patient pace.",
        effects: [
          { kind: "population", amount: 3 },
          { kind: "planetSize", amount: 2 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Study the deep thermal vent",
        result: "Planetology and civic songs gain depth as currents warm around coastal domes.",
        effects: [
          { kind: "research", field: "planetology", amount: 230 },
          { kind: "culture", amount: 80 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "drovani-2-reef-sanctuary",
    raceId: "drovani",
    chapter: 2,
    when: { kind: "colonies", count: 3 },
    title: "Sanctuary of the Still Tide",
    art: "contact",
    trigger: "turn",
    text: "As our ocean colonies grow toward {star}, shallow reefs face pressure from heavy dredging. Elders deliberate between quiet conservation and broader industrial hulls.",
    choices: [
      {
        label: "Protect the deep reef sanctuaries",
        result: "Calm waters nurture serene harmony and cultural songs, slowing heavy hull work.",
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "morale", amount: 5 },
          { kind: "factories", amount: -3 },
        ],
      },
      {
        label: "Dredge trenches for foundry ore",
        result: "Extra metal feeds growing shipyards while stirring unease along the coast.",
        effects: [
          { kind: "factories", amount: 5 },
          { kind: "money", amount: 140 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "drovani-3-rising-swell",
    raceId: "drovani",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "The Unwelcome Surge",
    art: "crisis",
    trigger: "turn",
    text: "Conflict with the {rival} disturbs the quiet near {star}. Slow-spoken elders ask whether to build patient defensive bulwarks or seek diplomatic mediators before the tide rises higher.",
    choices: [
      {
        label: "Raise patient defensive bulwarks",
        result: "Sturdy hulls and defensive craft take shape slowly, costing coin and calm.",
        effects: [
          { kind: "ships", template: "colony", count: 1 },
          { kind: "research", field: "forceFields", amount: 220 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Send measured envoys to neighbors",
        result: "Patient words calm nearby worlds and uncover stars, though the {rival} presses on.",
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "relations", amount: 14 },
          { kind: "morale", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "drovani-4-long-memory",
    raceId: "drovani",
    chapter: 4,
    when: { kind: "turn", turn: 170 },
    title: "The Long Tide's Memory",
    art: "ruins",
    trigger: "turn",
    text: "Generations pass like slow swells across {colony}. Tide-keepers can preserve ancient oral histories or open deep-ocean research vaults to newcomers.",
    choices: [
      {
        label: "Preserve the ancient tide-chants",
        result: "Enduring chants deepen cultural heritage and steady spirits across the deeps.",
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "morale", amount: 4 },
        ],
      },
      {
        label: "Share deep-ocean science vaults",
        result: "Research advances and neighbors warm to us, while purists mourn lost privacy.",
        effects: [
          { kind: "research", field: "planetology", amount: 260 },
          { kind: "relations", amount: 12 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "drovani-5a-deep-bulwark",
    raceId: "drovani",
    chapter: "5A",
    when: { kind: "turn", turn: 220 },
    title: "Bulwark of the Deep",
    art: "council",
    trigger: "turn",
    text: "Having answered the war with the {rival} through patient defense, the Drovani weigh lasting peace accords against fortifying ocean worlds for any future storm.",
    choices: [
      {
        label: "Anchor a lasting peace treaty",
        result: "Steady goodwill calms tensions with the {rival} and lifts shared council trust.",
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: 4 },
        ],
      },
      {
        label: "Fortify every ocean trench",
        result: "Deep-sea bastions and defensive research stand ready at a heavy coin cost.",
        effects: [
          { kind: "research", field: "forceFields", amount: 300 },
          { kind: "factories", amount: 6 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
  {
    id: "drovani-5b-calm-current",
    raceId: "drovani",
    chapter: "5B",
    when: { kind: "turn", turn: 220 },
    title: "The Calm Current Prevails",
    art: "victory",
    trigger: "turn",
    text: "Patient diplomacy through the {rival} clash kept our waters from boiling over. Now the Drovani choose between gentle stewardship or expanding deeper into open space.",
    choices: [
      {
        label: "Tend tranquil ocean sanctuaries",
        result: "Peaceful waters flourish with life and song, asking little of distant stars.",
        effects: [
          { kind: "population", amount: 3 },
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 5 },
        ],
      },
      {
        label: "Chart quiet outer star-lanes",
        result: "Slow, deliberate probes map new systems and trade routes with measured cost.",
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "money", amount: 150 },
          { kind: "morale", amount: -2 },
        ],
      },
    ],
  },

  // Gorrath Clans
  {
    id: "gorrath-1-frost-keel",
    raceId: "gorrath",
    chapter: 1,
    when: { kind: "turn", turn: 22 },
    title: "Frost-Keels on the Ice",
    art: "pirates",
    trigger: "turn",
    text: "Harsh winds sweep the tundra of {colony} as clan worldships prepare for longer reaches. War-chiefs argue over stripping scrap for colony hulls or raiding rogue bands.",
    choices: [
      {
        label: "Refit hulls for bold colony runs",
        result: "Reinforced worldships push farther into the dark, costing precious coin and iron.",
        effects: [
          { kind: "ships", template: "colony", count: 1 },
          { kind: "research", field: "propulsion", amount: 210 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "Raid rogue hulk-scavengers",
        result: "Clan raiders haul back scrap and coin, leaving bruised pride among cautious elders.",
        effects: [
          { kind: "money", amount: 210 },
          { kind: "factories", amount: 4 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "gorrath-2-nomad-hearth",
    raceId: "gorrath",
    chapter: 2,
    when: { kind: "colonies", count: 4 },
    title: "Hearths Along the Drift",
    art: "contact",
    trigger: "turn",
    text: "Four settlements and roaming worldships now anchor the Gorrath across {star} and {colony}. Clans must choose between nomadic roaming and settling heavy ground works.",
    choices: [
      {
        label: "Keep clans roaming the star-lanes",
        result: "Restless worldships uncover new stars and fierce pride, straining steady coin.",
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Anchor heavy ground foundries",
        result: "Fixed works forge weapons and alloys fast, curbing nomadic freedom a notch.",
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "research", field: "weapons", amount: 190 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "gorrath-3-iron-howl",
    raceId: "gorrath",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "The Iron Howl of War",
    art: "crisis",
    trigger: "turn",
    text: "War erupts with the {rival} near {star}, and the Gorrath fear no one. Chieftains split between launching a fierce head-on strike or pushing fast scout-raids deep into the space of the {rival}.",
    choices: [
      {
        label: "Launch a fierce head-on strike",
        result: "Blazing weapons and clan fury rattle the {rival}, taking a heavy toll on our hulls.",
        effects: [
          { kind: "research", field: "weapons", amount: 280 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Drive deep scout-raids into the dark",
        result: "Fast raiders chart stars and snag plunder, leaving rear lines exposed to counter-blows.",
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "money", amount: 170 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "gorrath-4-tundra-reckoning",
    raceId: "gorrath",
    chapter: 4,
    when: { kind: "turn", turn: 165 },
    title: "Reckoning in the Long Frost",
    art: "crisis",
    trigger: "turn",
    text: "Winter gales lash {colony} as clan elders tally the cost of endless motion and battle. Either we pour strength into weapons and hulls or mend broken clan hearths.",
    choices: [
      {
        label: "Forge heavier war-hulls",
        result: "Battle-ready factories and weapons advance while clan weariness climbs.",
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "research", field: "weapons", amount: 240 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Warm the clan hearths and songs",
        result: "Shared feasts and sagas lift morale and culture, trimming spare funds.",
        effects: [
          { kind: "culture", amount: 125 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },
  {
    id: "gorrath-5a-unconquered-wake",
    raceId: "gorrath",
    chapter: "5A",
    when: { kind: "turn", turn: 220 },
    title: "In the Unconquered Wake",
    art: "victory",
    trigger: "turn",
    text: "Having met the {rival} head-on in fierce battle, the Gorrath stand scarred but unbowed. Now the clans decide whether to press total conquest or carve a hard-won truce.",
    choices: [
      {
        label: "Press the war-path across the stars",
        result: "Fierce weapons and colony ships sweep outward, making every rival wary.",
        effects: [
          { kind: "research", field: "weapons", amount: 340 },
          { kind: "ships", template: "colony", count: 2 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Demand a warrior's truce",
        result: "Respect earned in combat lets both sides step back with pride and coin intact.",
        effects: [
          { kind: "money", amount: 220 },
          { kind: "relations", amount: 14 },
          { kind: "morale", amount: 3 },
        ],
      },
    ],
  },
  {
    id: "gorrath-5b-deep-raid-saga",
    raceId: "gorrath",
    chapter: "5B",
    when: { kind: "turn", turn: 220 },
    title: "Saga of the Deep Raids",
    art: "council",
    trigger: "turn",
    text: "Our deep raids against the {rival} mapped dark lanes and filled holds, though old foes remember the sting. The clans choose between turning into a settled power or roaming on.",
    choices: [
      {
        label: "Turn raids into settled strongholds",
        result: "Hardened worlds and sagas of endurance bolster our standing across the galaxy.",
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "culture", amount: 140 },
          { kind: "relations", amount: 10 },
        ],
      },
      {
        label: "Keep worldships forever on the prowl",
        result: "Fearless scouts and plunder keep us flush and sharp, at steep diplomatic cost.",
        effects: [
          { kind: "ships", template: "scout", count: 3 },
          { kind: "money", amount: 240 },
          { kind: "relations", amount: -16 },
        ],
      },
    ],
  },
];