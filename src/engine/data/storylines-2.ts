// Race storylines, batch 2: Vossari, Kethrak, Lumen, Thraal, Seraphine.
// Written by Gemini (2026-11-25, parallel-chat test, chat 1), checked by Claude. Story data only; the engine that plays them is built by Claude.
import type { StoryChapter } from "./storylines";

export const STORYLINES_2: StoryChapter[] = [
  // Vossari
  {
    id: "vossari-1-dry-telemetry",
    raceId: "vossari",
    chapter: 1,
    when: { kind: "turn", turn: 18 },
    title: "Dust on the Sensor Lens",
    art: "anomaly",
    trigger: "turn",
    text: "High-altitude arrays on {colony} intercept a clean sub-light telemetry burst drifting out of {star}. Scholars debate sharing raw sensor logs with frontier stations or hoarding the dataset for core laboratories.",
    choices: [
      {
        label: "Upload raw logs to core labs",
        result:
          "Core physicists extract sharp theoretical models, though outer stations resent being left in the dark.",
        effects: [
          { kind: "research", field: "computers", amount: 240 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Broadcast calibrated charts to outposts",
        result:
          "Frontier crews calibrate instruments smoothly and gain confidence, while core research advances more slowly.",
        effects: [
          { kind: "research", field: "planetology", amount: 140 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -80 },
        ],
      },
    ],
  },
  {
    id: "vossari-2-arid-quotas",
    raceId: "vossari",
    chapter: 2,
    when: { kind: "colonies", count: 4 },
    title: "Water Budgets and Lab Quotas",
    art: "contact",
    trigger: "turn",
    text: "Across four colonies, arid aquifers strain under growing research domes. Planners must decide whether to divert scarce water into habitat expansion or keep high-output computation arrays running at full draw.",
    choices: [
      {
        label: "Divert water to habitat domes",
        result:
          "Moisture condensers ease dry-world bottlenecks and lift colony growth, though reactor cooling slows.",
        effects: [
          { kind: "population", amount: 3 },
          { kind: "money", amount: -140 },
          { kind: "research", field: "construction", amount: -110 },
        ],
      },
      {
        label: "Keep computation arrays at peak load",
        result:
          "Superconductors hum with breakthroughs, while parched crews endure cramped quarters and rationing.",
        effects: [
          { kind: "research", field: "computers", amount: 280 },
          { kind: "population", amount: -2 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "vossari-3-open-archive",
    raceId: "vossari",
    chapter: 3,
    when: { kind: "turn", turn: 110 },
    title: "The Unindexed Ledger",
    art: "contact",
    trigger: "turn",
    text: "Our deep-sky probes catalog strange star-lanes near {star} just as the {rival} demands access to Vossari star charts. Opening our full index could spark joint study or hand a rival tactical sightlines.",
    choices: [
      {
        label: "Publish the star-lane index openly",
        result:
          "Joint astrometry deepens goodwill with the {rival} and maps fresh stars, at the cost of strategic secrecy.",
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "relations", amount: 15 },
          { kind: "research", field: "propulsion", amount: -120 },
        ],
      },
      {
        label: "Seal the index inside Vossari vaults",
        result:
          "Our propulsion and sensor teams guard every coordinate, though the {rival} views the refusal with suspicion.",
        effects: [
          { kind: "research", field: "propulsion", amount: 260 },
          { kind: "relations", amount: -14 },
          { kind: "money", amount: -100 },
        ],
      },
    ],
  },
  {
    id: "vossari-4-unbroken-map",
    raceId: "vossari",
    chapter: 4,
    when: { kind: "goldenAge" },
    title: "No Blank Nodes",
    art: "anomaly",
    trigger: "turn",
    text: "During our golden age, Vossari theorists spot a subtle gap in unified field models around {colony}. Closing it requires heavy experimental rigs and risking public poise if early runs fail.",
    choices: [
      {
        label: "Run high-energy field trials",
        result:
          "Test rings yield rare force-field data, while stray harmonics rattle nearby settlements.",
        effects: [
          { kind: "research", field: "forceFields", amount: 320 },
          { kind: "money", amount: -180 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Refine models through peer review",
        result:
          "Careful cross-checking strengthens civic pride and culture, though raw physics gains stay modest.",
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: 4 },
          { kind: "research", field: "forceFields", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "vossari-5a-shared-horizon",
    raceId: "vossari",
    chapter: "5A",
    when: { kind: "turn", turn: 220 },
    title: "The Open Observatory",
    art: "council",
    trigger: "turn",
    text: "Having opened our star-lane index to the {rival}, Vossari scholars stand at a crossroads between shared galactic inquiry and tightening control over sensitive breakthroughs.",
    choices: [
      {
        label: "Found a shared star-chart institute",
        result:
          "Observatories across empires exchange clean telemetry, earning lasting trust and cultural standing.",
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 140 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "Restrict advanced propulsion papers",
        result:
          "Our engineers keep top drive designs in-house, boosting propulsion research while cooling relations.",
        effects: [
          { kind: "research", field: "propulsion", amount: 340 },
          { kind: "relations", amount: -12 },
        ],
      },
    ],
  },
  {
    id: "vossari-5b-sealed-vault",
    raceId: "vossari",
    chapter: "5B",
    when: { kind: "turn", turn: 220 },
    title: "The Sealed Curriculum",
    art: "victory",
    trigger: "turn",
    text: "Having sealed our star-lane index away from the {rival}, Vossari academies hold unmatched proprietary knowledge, yet isolation tests both treasury and civic spirit.",
    choices: [
      {
        label: "Establish the Sovereign Academy",
        result:
          "Vossari institutes synthesize cross-field theory at peak pace, at heavy treasury expense.",
        effects: [
          { kind: "research", field: "computers", amount: 350 },
          { kind: "research", field: "weapons", amount: 220 },
          { kind: "money", amount: -240 },
        ],
      },
      {
        label: "License curated data to allies",
        result:
          "Controlled data sales refill coffers and ease tension with the {rival}, while slowing pure theory.",
        effects: [
          { kind: "money", amount: 260 },
          { kind: "relations", amount: 10 },
          { kind: "research", field: "computers", amount: -140 },
        ],
      },
    ],
  },
  // Kethrak Hive
  {
    id: "kethrak-1-spawning-brood",
    raceId: "kethrak",
    chapter: 1,
    when: { kind: "turn", turn: 20 },
    title: "First Brood Across the Canopy",
    art: "contact",
    trigger: "turn",
    text: "Deep jungle broods near {colony} pulse in unison as newborn larvae tunnel toward a neighboring world off {star}. Queens ask whether to push rapid swarm growth or feed extra chitin into hull-carapace work.",
    choices: [
      {
        label: "Feed larvae into rapid swarm expansion",
        result:
          "Fresh broods surge across the jungle, swelling population while straining spare alloy reserves.",
        effects: [
          { kind: "population", amount: 4 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Harden chitinous nest-forges",
        result:
          "Swarm builders raise tough new hives and boost production, slowing immediate brood numbers.",
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "population", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "kethrak-2-tunnel-drift",
    raceId: "kethrak",
    chapter: 2,
    when: { kind: "turn", turn: 65 },
    title: "Tremors Along the Deep Burrow",
    art: "anomaly",
    trigger: "turn",
    text: "Sub-surface tunnels linking {colony} toward {star} vibrate with strange resonance. Foraging drones uncover dense mineral veins, yet deep vibrations rattle hive chambers and fray swarm cohesion.",
    choices: [
      {
        label: "Excavate the resonant mineral seams",
        result:
          "Rich ores fuel hive expansion and treasury, though quakes jar brood-chambers.",
        effects: [
          { kind: "money", amount: 210 },
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Reinforce tunnel walls and calm the hive",
        result:
          "Drones brace the burrows and steady the shared mind, spending resources with little gain.",
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -150 },
        ],
      },
    ],
  },
  {
    id: "kethrak-3-hive-discord",
    raceId: "kethrak",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "Voices in the Jungle Static",
    art: "crisis",
    trigger: "turn",
    text: "War with the {rival} hits our frontier near {star}, and strange psychic static from the {rival} splits a border brood from the main mind. One faction urges a roaring swarm charge; another pushes cunning ambush tunnels.",
    choices: [
      {
        label: "Unleash a full swarm charge",
        result:
          "Millions of chitinous hulls crash into the {rival} line, rallying the hive while burning reserves.",
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "research", field: "weapons", amount: 240 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Dig hidden ambush tunnels near {star}",
        result:
          "Burrowing squadrons map new routes and outmaneuver the {rival}, though purists resent indirect play.",
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "propulsion", amount: 230 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "kethrak-4-chitin-famine",
    raceId: "kethrak",
    chapter: 4,
    when: { kind: "colonies", count: 6 },
    title: "Hunger in the Overgrowth",
    art: "crisis",
    trigger: "turn",
    text: "Six hives now draw from jungle worlds around {colony}, and rapid brood-waves strip canopy nutrients faster than soil can renew. Queens must choose between harsh culling or wild outer expansion.",
    choices: [
      {
        label: "Cull excess broods to save the soil",
        result:
          "Remaining hives recover vigor and yield, though losing larvae stings the collective mind.",
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "morale", amount: 4 },
          { kind: "population", amount: -3 },
        ],
      },
      {
        label: "Push new scouts into untamed systems",
        result:
          "Fresh scout hulls range outward and open new worlds, draining the hive treasury.",
        effects: [
          { kind: "ships", template: "scout", count: 2 },
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: -190 },
        ],
      },
    ],
  },
  {
    id: "kethrak-5a-unbroken-roar",
    raceId: "kethrak",
    chapter: "5A",
    when: { kind: "turn", turn: 215 },
    title: "The Roar of One Mind",
    art: "victory",
    trigger: "turn",
    text: "Having met the {rival} with an open swarm charge, the Kethrak stand as a towering, unmistakable hive. Now the queens decide how our single voice will echo across the stars.",
    choices: [
      {
        label: "Declare the Endless Swarm",
        result:
          "Hive foundries roar at full tilt and terrorize the {rival}, while diplomatic ties wither.",
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "population", amount: 4 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Demand tribute as the apex swarm",
        result:
          "Rival envoys pay heavy tribute to avoid our wrath, swelling hive coffers and pride.",
        effects: [
          { kind: "money", amount: 280 },
          { kind: "culture", amount: 120 },
          { kind: "relations", amount: -10 },
        ],
      },
    ],
  },
  {
    id: "kethrak-5b-silent-burrows",
    raceId: "kethrak",
    chapter: "5B",
    when: { kind: "turn", turn: 215 },
    title: "The Quiet Under-Net",
    art: "anomaly",
    trigger: "turn",
    text: "Having carved hidden ambush tunnels against the {rival}, Kethrak brood-lines move unseen beneath starlight. The queens weigh remaining a shadow threat or building grand brood-sanctuaries.",
    choices: [
      {
        label: "Expand covert strike burrows",
        result:
          "Deep tunnel networks sharpen weapons and propulsion craft, though old-guard drones grumble.",
        effects: [
          { kind: "research", field: "weapons", amount: 300 },
          { kind: "research", field: "propulsion", amount: 250 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Raise great spore-cathedrals",
        result:
          "Living spires sing in unison across {colony}, lifting culture and swarm harmony at steep cost.",
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },
  // Lumen Choir
  {
    id: "lumen-1-whisper-in-tides",
    raceId: "lumen",
    chapter: 1,
    when: { kind: "turn", turn: 16 },
    title: "Echoes Below the Kelp Shelf",
    art: "anomaly",
    trigger: "turn",
    text: "Deep ocean choirs around {colony} pick up faint mental impressions drifting out of {star}. Singers debate tuning minds toward distant signals or anchoring calm harmony across coastal sanctuaries.",
    choices: [
      {
        label: "Tune choir minds toward {star}",
        result:
          "Reach minds map fresh star-lanes and probe outer currents, straining calm tides at home.",
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "research", field: "computers", amount: 200 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Anchor deep sanctuary harmony",
        result:
          "Coastal waters grow serene and resonant, lifting culture and spirit while exploration waits.",
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -70 },
        ],
      },
    ],
  },
  {
    id: "lumen-2-silent-harbor",
    raceId: "lumen",
    chapter: 2,
    when: { kind: "turn", turn: 70 },
    title: "Tides of the Conquered Reef",
    art: "contact",
    trigger: "turn",
    text: "Newcomers brought into the fold near {colony} carry uneasy thoughts from older worlds. Lumen elders weigh guiding them gently into the shared song or harvesting their technical habits fast.",
    choices: [
      {
        label: "Weave newcomers into the choir gently",
        result:
          "Patient communion calms restless minds and swells population harmony, costing funds.",
        effects: [
          { kind: "population", amount: 3 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Draw practical skills from their minds",
        result:
          "Shared craft accelerates research and output, leaving uneasy undercurrents in the waters.",
        effects: [
          { kind: "research", field: "planetology", amount: 240 },
          { kind: "factories", amount: 5 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "lumen-3-mind-veil",
    raceId: "lumen",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "Discord Across the Phase-Swell",
    art: "crisis",
    trigger: "turn",
    text: "War with the {rival} breaks over {star}, sending sharp psychic static through our phase-navigators. We can project a wide mental veil to unsettle the {rival} or hold a tight, quiet ward.",
    choices: [
      {
        label: "Project a wide mental veil",
        result:
          "Disruptive waves rattle the crews of the {rival} and reveal nearby stars, exhausting our singers.",
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "relations", amount: -15 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Hold a quiet, disciplined ward",
        result:
          "Focused calm shields our minds and sharpens craft, yielding fewer tactical surprises.",
        effects: [
          { kind: "research", field: "forceFields", amount: 230 },
          { kind: "culture", amount: 90 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },
  {
    id: "lumen-4-abyssal-song",
    raceId: "lumen",
    chapter: 4,
    when: { kind: "colonies", count: 5 },
    title: "The Deep Current's Toll",
    art: "crisis",
    trigger: "turn",
    text: "Across five ocean colonies centered on {colony}, constant phase-jumps and long-range mind-reach leave singers weary. Elders must decide whether to rest the choir or press deeper into unknown currents.",
    choices: [
      {
        label: "Rest the choir in deep trenches",
        result:
          "Quiet trenches restore peace and cultural grace, slowing fleet and research tempo.",
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "morale", amount: 5 },
          { kind: "research", field: "propulsion", amount: -100 },
        ],
      },
      {
        label: "Push further into the phase-current",
        result:
          "Bold phase-leaps unlock propulsion insights and treasury gains, straining morale.",
        effects: [
          { kind: "research", field: "propulsion", amount: 270 },
          { kind: "money", amount: 190 },
          { kind: "morale", amount: -5 },
        ],
      },
    ],
  },
  {
    id: "lumen-5a-unspoken-tide",
    raceId: "lumen",
    chapter: "5A",
    when: { kind: "turn", turn: 210 },
    title: "The Unbroken Veil",
    art: "council",
    trigger: "turn",
    text: "Having cast a wide mental veil against the {rival}, the Lumen Choir shapes perception far past our borders. Elders ask whether to guide neighbors with quiet influence or withdraw into deep waters.",
    choices: [
      {
        label: "Guide councils with subtle harmony",
        result:
          "Measured resonance calms tensions with the {rival} and elevates Lumen culture.",
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "culture", amount: 150 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Turn inward and guard every thought",
        result:
          "A sealed mind-wall fortifies research and treasury discipline while estranging rivals.",
        effects: [
          { kind: "research", field: "computers", amount: 310 },
          { kind: "money", amount: 210 },
          { kind: "relations", amount: -14 },
        ],
      },
    ],
  },
  {
    id: "lumen-5b-still-waters",
    raceId: "lumen",
    chapter: "5B",
    when: { kind: "turn", turn: 210 },
    title: "Song of the Still Trench",
    art: "victory",
    trigger: "turn",
    text: "Having kept a quiet, disciplined ward against the {rival}, the Lumen Choir holds an unshaken inner core. Now the singers choose how their calm song reaches the wider galaxy.",
    choices: [
      {
        label: "Share a choir of peace across worlds",
        result:
          "Harmonious envoys mend ties with the {rival} and enrich shared culture.",
        effects: [
          { kind: "culture", amount: 160 },
          { kind: "relations", amount: 18 },
          { kind: "morale", amount: 5 },
        ],
      },
      {
        label: "Forge shielded sanctuaries of knowledge",
        result:
          "Protected academies advance deep science and industry at heavy treasury cost.",
        effects: [
          { kind: "research", field: "forceFields", amount: 330 },
          { kind: "factories", amount: 8 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },
  // Thraal
  {
    id: "thraal-1-barren-cradle",
    raceId: "thraal",
    chapter: 1,
    when: { kind: "turn", turn: 26 },
    title: "Bedrock of the Elders",
    art: "contact",
    trigger: "turn",
    text: "Deep strata beneath {colony} hold rich mineral seams beside ancient stone faults stretching toward {star}. Elders weigh slow, durable stone-work against quick mineral extraction.",
    choices: [
      {
        label: "Carve lasting stone foundations",
        result:
          "Heavy masonry endures for ages on {colony}, lifting output while sparing rock seams.",
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -90 },
        ],
      },
      {
        label: "Strip-mine exposed ore veins",
        result:
          "Fast mineral hauls fill the treasury quickly, though loose rubble unsettles nearby ridges.",
        effects: [
          { kind: "money", amount: 180 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "thraal-2-lane-settling",
    raceId: "thraal",
    chapter: 2,
    when: { kind: "turn", turn: 75 },
    title: "Pebbles Along the Lane",
    art: "anomaly",
    trigger: "turn",
    text: "Travelers along the star-lane toward {star} report barren rocks rich in trace isotopes. Settling harsh worlds takes decades of patient growth, yet early claims lock in long-term ground.",
    choices: [
      {
        label: "Anchor a rocky outpost near {star}",
        result:
          "Patient stone-folk take root on harsh ground and chart neighboring stars, costing funds.",
        effects: [
          { kind: "population", amount: 2 },
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Study lane wear in quiet ledges",
        result:
          "Ancient observers measure lane stress over time, advancing planetology without expansion.",
        effects: [
          { kind: "research", field: "planetology", amount: 220 },
          { kind: "morale", amount: 3 },
        ],
      },
    ],
  },
  {
    id: "thraal-3-mountain-oath",
    raceId: "thraal",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "The Unmoved Crag",
    art: "crisis",
    trigger: "turn",
    text: "Open conflict with the {rival} tests ancient stone patience near {star}. One council urges standing immovable in lane defenses; another favors a slow, grinding push into the lanes of the {rival}.",
    choices: [
      {
        label: "Hold immovable along the lane",
        result:
          "Stone garrisons brace like living cliffs, fortifying defenses while ceding early initiative.",
        effects: [
          { kind: "research", field: "construction", amount: 240 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Grind steadily toward the {rival}",
        result:
          "Heavy hulls press forward step by step, mapping new routes while straining morale.",
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "weapons", amount: 220 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "thraal-4-glacial-tide",
    raceId: "thraal",
    chapter: 4,
    when: { kind: "goldenAge" },
    title: "Centuries Settling In",
    art: "victory",
    trigger: "turn",
    text: "As a golden age settles over {colony}, stone-born elders reflect on how slowly great peaks rise. We can channel this calm into enduring monuments or tough industrial hulls.",
    choices: [
      {
        label: "Raise monoliths of living granite",
        result:
          "Towering stone archives anchor lasting culture and calm resolve across our worlds.",
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Temper heavy hull armor",
        result:
          "Dense composite plates strengthen fleet construction, costing treasury and civic calm.",
        effects: [
          { kind: "research", field: "construction", amount: 300 },
          { kind: "factories", amount: 7 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
  {
    id: "thraal-5a-enduring-peak",
    raceId: "thraal",
    chapter: "5A",
    when: { kind: "turn", turn: 225 },
    title: "The Peak That Outlasted",
    art: "council",
    trigger: "turn",
    text: "Having held immovable along the lane against the {rival}, the Thraal stand unshaken while hasty empires wear down. Elders ask how patient stone should guide the wider galaxy.",
    choices: [
      {
        label: "Offer steady stewardship to neighbors",
        result:
          "Measured diplomacy earns trust from the {rival} and honors ancient restraint.",
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: 4 },
        ],
      },
      {
        label: "Lock down deep fortress lanes",
        result:
          "Reinforced chokepoints guard every approach, raising industry while cooling relations.",
        effects: [
          { kind: "factories", amount: 9 },
          { kind: "research", field: "forceFields", amount: 280 },
          { kind: "relations", amount: -12 },
        ],
      },
    ],
  },
  {
    id: "thraal-5b-deep-fault",
    raceId: "thraal",
    chapter: "5B",
    when: { kind: "turn", turn: 225 },
    title: "Where the Crag Broke",
    art: "crisis",
    trigger: "turn",
    text: "Having ground steadily toward the lanes of the {rival}, Thraal forces have moved with unhurried weight. Now elders decide whether to press deep stone dominance or restore calm balance.",
    choices: [
      {
        label: "Press heavy conquest along the lanes",
        result:
          "Relentless pressure builds formidable hulls and reserves, alienating the {rival}.",
        effects: [
          { kind: "research", field: "weapons", amount: 320 },
          { kind: "money", amount: 220 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Return to quiet stone contemplation",
        result:
          "Halls fall still as elders preserve heritage and harmony, spending treasury reserves.",
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -190 },
        ],
      },
    ],
  },
  // Seraphine
  {
    id: "seraphine-1-steppe-gale",
    raceId: "seraphine",
    chapter: 1,
    when: { kind: "turn", turn: 19 },
    title: "High Wind Above the Steppe",
    art: "anomaly",
    trigger: "turn",
    text: "Swift air-currents over {colony} carry sensor echoes from {star}, where graceful test-gliders chart a shifting void. Pilots urge pushing agile hull trials or staging a dazzling display for home crowds.",
    choices: [
      {
        label: "Push high-speed hull trials",
        result:
          "Agile prototypes shave transit margins and boost propulsion craft, jarring cautious crews.",
        effects: [
          { kind: "research", field: "propulsion", amount: 220 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Stage a grand sky-parade",
        result:
          "Sweeping formation flights thrill the steppe and lift pride, draining treasury funds.",
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "seraphine-2-phase-glide",
    raceId: "seraphine",
    chapter: 2,
    when: { kind: "colonies", count: 4 },
    title: "Slipstream Through the Fold",
    art: "contact",
    trigger: "turn",
    text: "Across four steppe and frontier worlds linked to {colony}, phase-pilots test swift slips toward {star}. Commanders weigh daring long-range phase scouts against tighter escort discipline.",
    choices: [
      {
        label: "Launch swift phase-scout wings",
        result:
          "Nimble scouts chart fresh systems rapidly while drawing funds from core yards.",
        effects: [
          { kind: "ships", template: "scout", count: 2 },
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Drill tight formation escorts",
        result:
          "Disciplined squadrons sharpen evasion and shield craft, slowing outward scouting.",
        effects: [
          { kind: "research", field: "forceFields", amount: 230 },
          { kind: "morale", amount: 3 },
        ],
      },
    ],
  },
  {
    id: "seraphine-3-grace-under-fire",
    raceId: "seraphine",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "Talons in the Crosswind",
    art: "crisis",
    trigger: "turn",
    text: "War with the {rival} tests Seraphine poise near {star}. Prideful aces demand a flashy, high-speed strike to humiliate the {rival}, while pragmatic flyers favor disciplined, measured maneuvers.",
    choices: [
      {
        label: "Fly a dazzling vanguard raid",
        result:
          "Sweeping aerobatic strikes rattle the {rival} and lift Seraphine pride, burning fuel and coin.",
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 100 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Hold disciplined, evasive lines",
        result:
          "Measured positioning sharpens fleet craft and maps {star} lanes, though boastful aces chafe.",
        effects: [
          { kind: "research", field: "weapons", amount: 230 },
          { kind: "revealStars", count: 4 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "seraphine-4-gilded-plume",
    raceId: "seraphine",
    chapter: 4,
    when: { kind: "turn", turn: 160 },
    title: "Vanity on the High Ridge",
    art: "council",
    trigger: "turn",
    text: "As Seraphine prestige swells around {colony}, lavish court festivals and ornate hull trim rival practical needs. Leaders must choose between grand pageantry or practical shipyard upgrades.",
    choices: [
      {
        label: "Sponsor grand court pageantry",
        result:
          "Radiant banners and feasts elevate Seraphine renown, costing significant treasury.",
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -170 },
        ],
      },
      {
        label: "Refit yards for brisk hull output",
        result:
          "Streamlined slipways raise factory yield and propulsion science, tempering court glamor.",
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "research", field: "propulsion", amount: 240 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "seraphine-5a-sovereign-wing",
    raceId: "seraphine",
    chapter: "5A",
    when: { kind: "turn", turn: 220 },
    title: "The Unmatched Wing",
    art: "victory",
    trigger: "turn",
    text: "Having answered the {rival} with a dazzling vanguard raid, Seraphine pilots command awe across the sky-lanes. Now leaders decide whether to crown a proud hegemon or charm neighbors into accord.",
    choices: [
      {
        label: "Claim pride of place among empires",
        result:
          "Seraphine mastery shines across every border, boosting culture and output while cooling ties.",
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "factories", amount: 8 },
          { kind: "relations", amount: -14 },
        ],
      },
      {
        label: "Extend a graceful court accord",
        result:
          "Poised diplomacy warms relations with the {rival} and earns respected standing.",
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "seraphine-5b-measured-flight",
    raceId: "seraphine",
    chapter: "5B",
    when: { kind: "turn", turn: 220 },
    title: "The Disciplined Gale",
    art: "council",
    trigger: "turn",
    text: "Having held disciplined, evasive lines against the {rival}, Seraphine flyers pair grace with sharp precision. Leaders choose between ruthless technical dominance or polished galactic statesmanship.",
    choices: [
      {
        label: "Hone razor-sharp strike craft",
        result:
          "Precision weapons and propulsion research surge ahead, leaving rivals wary.",
        effects: [
          { kind: "research", field: "weapons", amount: 310 },
          { kind: "research", field: "propulsion", amount: 260 },
          { kind: "relations", amount: -12 },
        ],
      },
      {
        label: "Lead with composed diplomacy",
        result:
          "Measured poise wins trust with the {rival} and lifts civic morale at moderate cost.",
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -120 },
        ],
      },
    ],
  },
];
