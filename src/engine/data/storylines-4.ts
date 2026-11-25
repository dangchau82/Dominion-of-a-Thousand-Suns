// Race storylines, batch 4: Ixil, Verdane, Raxxan, Ruuvak, Tarkhan.
// Written by Gemini (2026-11-25, parallel-chat test, chat 3), checked by Claude. Story data only; the engine that plays them is built by Claude.
import type { StoryChapter } from "./storylines";

export const STORYLINES_4: StoryChapter[] = [
  // Ixil
  {
    id: "ixil-1-tangled-canopy",
    raceId: "ixil",
    chapter: 1,
    when: { kind: "turn", turn: 17 },
    title: "Roots Beneath the Clearing",
    art: "anomaly",
    trigger: "turn",
    text: "Deep inside the jungle canopy of {colony}, symbiote scouts discover ancient bio-nodes pulsing toward {star}. Elders debate opening our neural lattice to absorb strange signals or guarding our inner bond.",
    choices: [
      {
        label: "Open the lattice to the bio-nodes",
        result: "Fresh insights flood our shared nerves and chart nearby stars, though fever strains colonists.",
        effects: [
          { kind: "research", field: "planetology", amount: 210 },
          { kind: "revealStars", count: 4 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Shield the colony's shared bond",
        result: "Careful isolation keeps our symbiotes calm and cultured, while outer signals fade.",
        effects: [
          { kind: "culture", amount: 95 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -75 },
        ],
      },
    ],
  },
  {
    id: "ixil-2-quiet-guests",
    raceId: "ixil",
    chapter: 2,
    when: { kind: "turn", turn: 68 },
    title: "Whispers in the Embassy",
    art: "contact",
    trigger: "turn",
    text: "Ixil attachés stationed near {star} report that border envoys from the {rival} carry valuable technical habits. We can weave discreet symbiote listeners into trade crews or keep exchanges strictly formal.",
    choices: [
      {
        label: "Embed discreet symbiote listeners",
        result: "Quiet bonding yields useful computer craft, though suspicious officials of the {rival} grow distant.",
        effects: [
          { kind: "research", field: "computers", amount: 240 },
          { kind: "relations", amount: -14 },
          { kind: "money", amount: -90 },
        ],
      },
      {
        label: "Maintain open, formal diplomacy",
        result: "Transparent trade warms ties with the {rival} and enriches shared culture at modest cost.",
        effects: [
          { kind: "relations", amount: 14 },
          { kind: "culture", amount: 85 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },
  {
    id: "ixil-3-woven-conquest",
    raceId: "ixil",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "The Intertwined Host",
    art: "crisis",
    trigger: "turn",
    text: "War with the {rival} brings captured garrisons on {colony} into our reach. Brood-weavers ask whether to bind deeply with the {rival} captives to strip every secret or offer gentle mutual symbiosis.",
    choices: [
      {
        label: "Bind deeply and strip their knowledge",
        result: "Forced neural communion unlocks weapon and force-field secrets, leaving captives shaken and bitter.",
        effects: [
          { kind: "research", field: "weapons", amount: 230 },
          { kind: "research", field: "forceFields", amount: 180 },
          { kind: "morale", amount: -4 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Offer gentle, willing symbiosis",
        result: "Patient bonding wins willing recruits and raises harmony on {colony}, costing funds and speed.",
        effects: [
          { kind: "population", amount: 3 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },
  {
    id: "ixil-4-overgrown-nerve",
    raceId: "ixil",
    chapter: 4,
    when: { kind: "colonies", count: 5 },
    title: "Too Many Voices in the Dark",
    art: "crisis",
    trigger: "turn",
    text: "Across five worlds linked to {colony}, absorbed memories from conquered peoples crowd the Ixil mind-web. Healers warn that unmanaged echoes threaten industrial focus and civic calm.",
    choices: [
      {
        label: "Channel the echoes into craft guilds",
        result: "Blended techniques supercharge factories on {colony}, while mental strain wears down workers.",
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "research", field: "construction", amount: 220 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Build quiet sanctuary groves",
        result: "Restorative gardens soothe tangled minds and lift culture, draining treasury reserves.",
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
  {
    id: "ixil-5a-parasite-crown",
    raceId: "ixil",
    chapter: "5A",
    when: { kind: "turn", turn: 215 },
    title: "The All-Consuming Web",
    art: "victory",
    trigger: "turn",
    text: "Having stripped secrets by force from the {rival}, the Ixil web pulses with stolen mastery. Now the elders decide how our predatory network shall treat the remaining stars.",
    choices: [
      {
        label: "Expand the shadow-web across every border",
        result: "Covert tendrils feed rapid breakthroughs and tribute, turning the {rival} openly hostile.",
        effects: [
          { kind: "research", field: "computers", amount: 320 },
          { kind: "money", amount: 240 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Tempered restraint and curated memory",
        result: "We archive absorbed arts into grand symbiote halls, lifting culture at steep expense.",
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -200 },
        ],
      },
    ],
  },
  {
    id: "ixil-5b-living-tapestries",
    raceId: "ixil",
    chapter: "5B",
    when: { kind: "council" },
    title: "Tapestry of Willing Minds",
    art: "council",
    trigger: "turn",
    text: "Having chosen gentle symbiosis with captives from the {rival}, the Ixil stand before the council as weavers of shared life. Elders weigh widening the circle or guarding our groves.",
    choices: [
      {
        label: "Propose a Pan-Species Symbiosis Charter",
        result: "Even the {rival} acknowledges our peaceful bonds, boosting relations and cultural standing.",
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 145 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "Deepen biological craft within our groves",
        result: "Cooperating worlds advance planetology and industry together while foreign ties cool.",
        effects: [
          { kind: "research", field: "planetology", amount: 310 },
          { kind: "factories", amount: 8 },
          { kind: "relations", amount: -10 },
        ],
      },
    ],
  },

  // Verdane
  {
    id: "verdane-1-first-canopy",
    raceId: "verdane",
    chapter: 1,
    when: { kind: "turn", turn: 21 },
    title: "Seeds in Bright Starlight",
    art: "ruins",
    trigger: "turn",
    text: "Botanist-priests on {colony} notice ancient solar mirrors orbiting {star}, focusing crisp white-blue rays onto jungle valleys. We can prune the mirrors for rapid growth or study their stonework.",
    choices: [
      {
        label: "Focus the mirrors onto nursery groves",
        result: "Concentrated starlight accelerates seedling blooms on {colony}, straining soil moisture.",
        effects: [
          { kind: "population", amount: 3 },
          { kind: "factories", amount: 4 },
          { kind: "money", amount: -95 },
        ],
      },
      {
        label: "Preserve and study the ancient mirrors",
        result: "Careful observation yields clean planetology insights and honors ancestral reverence.",
        effects: [
          { kind: "research", field: "planetology", amount: 220 },
          { kind: "culture", amount: 80 },
          { kind: "money", amount: -70 },
        ],
      },
    ],
  },
  {
    id: "verdane-2-root-bridge",
    raceId: "verdane",
    chapter: 2,
    when: { kind: "colonies", count: 3 },
    title: "Boughs Across the Lane",
    art: "anomaly",
    trigger: "turn",
    text: "Across three flourishing colonies linked to {colony}, living vine-ships weave along star-lanes toward {star}. Grove-keepers ask whether to send seed-scouts outward or thicken heartwood mills at home.",
    choices: [
      {
        label: "Launch far-ranging seed-scouts",
        result: "Living scouts chart bright stars beyond {star}, drawing credits from domestic groves.",
        effects: [
          { kind: "ships", template: "scout", count: 2 },
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Thicken heartwood bio-foundries",
        result: "Dense timber-forges raise industrial output on {colony} while outer lanes remain unmapped.",
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "research", field: "construction", amount: 150 },
          { kind: "morale", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "verdane-3-fire-at-border",
    raceId: "verdane",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "Cinders on the Outer Leaves",
    art: "crisis",
    trigger: "turn",
    text: "Hostilities with the {rival} scorch frontier groves near {star}. Honorable elders urge holding a patient, defensive thorn-wall, while younger saplings demand choking the supply lanes of the {rival} with aggressive vines.",
    choices: [
      {
        label: "Hold a patient, honorable thorn-wall",
        result: "Deep-rooted defenses shelter {colony} and uphold Verdane honor, ceding border initiative.",
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "research", field: "forceFields", amount: 220 },
          { kind: "money", amount: -120 },
        ],
      },
      {
        label: "Strangle enemy lanes with invasive vines",
        result: "Fast thorn-cruisers disrupt the {rival} near {star}, though elders mourn our ruthless turn.",
        effects: [
          { kind: "research", field: "weapons", amount: 240 },
          { kind: "revealStars", count: 4 },
          { kind: "morale", amount: -4 },
          { kind: "relations", amount: -12 },
        ],
      },
    ],
  },
  {
    id: "verdane-4-great-bloom",
    raceId: "verdane",
    chapter: 4,
    when: { kind: "goldenAge" },
    title: "Season of the Thousand Blossoms",
    art: "victory",
    trigger: "turn",
    text: "During a golden age on {colony}, warm stellar light triggers a rare synchronized bloom. Leaders can harvest rich pollen-resins for trade or let the canopy seed wild frontier worlds.",
    choices: [
      {
        label: "Harvest rare resins for trade coffers",
        result: "Fragrant resins fetch high prices across spaceports, tempering the bloom's natural spread.",
        effects: [
          { kind: "money", amount: 250 },
          { kind: "culture", amount: 110 },
          { kind: "population", amount: -1 },
        ],
      },
      {
        label: "Let the canopy seed new growth",
        result: "Wind-borne spores swell population and terraform soil on {colony} at steep upkeep.",
        effects: [
          { kind: "population", amount: 4 },
          { kind: "planetSize", amount: 3 },
          { kind: "money", amount: -170 },
        ],
      },
    ],
  },
  {
    id: "verdane-5a-wardens-of-light",
    raceId: "verdane",
    chapter: "5A",
    when: { kind: "council" },
    title: "Canopy of the Peaceful Sun",
    art: "council",
    trigger: "turn",
    text: "Having defended our borders against the {rival} without sacrificing honor, the Verdane command deep respect. Now the high groves choose how to shelter the wider galaxy.",
    choices: [
      {
        label: "Proclaim the Green Sanctuary Accord",
        result: "Neighbors and the {rival} honor our restraint, lifting relations and shared culture.",
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 155 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Cultivate towering orbital seed-vaults",
        result: "Living megastructures boost planetology and colony size while keeping outsiders at bay.",
        effects: [
          { kind: "research", field: "planetology", amount: 340 },
          { kind: "planetSize", amount: 4 },
          { kind: "relations", amount: -10 },
        ],
      },
    ],
  },
  {
    id: "verdane-5b-strangling-bough",
    raceId: "verdane",
    chapter: "5B",
    when: { kind: "turn", turn: 220 },
    title: "Roots Over Cold Stone",
    art: "crisis",
    trigger: "turn",
    text: "Having strangled the {rival}'s lanes with invasive thorns, Verdane fleets grow fierce and proud. Elders ask whether to press relentless botanical conquest or prune back toward calm balance.",
    choices: [
      {
        label: "Spread iron-bark fleets across every lane",
        result: "Armored bio-hulls and weapon craft surge forward, alarming the {rival} and neighbors.",
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "research", field: "weapons", amount: 300 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Prune the war-vines and restore sacred groves",
        result: "Quiet tending heals civic spirit and culture across {colony}, draining treasury stores.",
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -210 },
        ],
      },
    ],
  },

  // Raxxan Reavers
  {
    id: "raxxan-1-rust-hulks",
    raceId: "raxxan",
    chapter: 1,
    when: { kind: "turn", turn: 16 },
    title: "Fine Pre-Owned Wreckage",
    art: "pirates",
    trigger: "turn",
    text: "Tunnel-scouts near {star} stumble onto a drifting convoy of ancient freighters, lightly booby-trapped and packed with alloy. Salvage captains want to strip it fast before anyone claims ownership.",
    choices: [
      {
        label: "Strip the convoy down to the bolts",
        result: "Reaver cutters haul home heaps of coin and scrap, singing a few hulls on old mines.",
        effects: [
          { kind: "money", amount: 210 },
          { kind: "factories", amount: 4 },
          { kind: "morale", amount: -2 },
        ],
      },
      {
        label: "Disarm the traps and log the drive cores",
        result: "Careful torch-work yields clean propulsion notes and crew pride for modest payout.",
        effects: [
          { kind: "research", field: "propulsion", amount: 200 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -60 },
        ],
      },
    ],
  },
  {
    id: "raxxan-2-tunnel-toll",
    raceId: "raxxan",
    chapter: 2,
    when: { kind: "turn", turn: 64 },
    title: "Legitimate Salvage Licensing",
    art: "contact",
    trigger: "turn",
    text: "Our tunnel exits near {star} sit right beside shipping lanes used by the {rival}. Rogue captains propose charging a 'navigational safety fee' while quartermasters suggest selling spare parts.",
    choices: [
      {
        label: "Collect 'navigational safety fees'",
        result: "Toll-skiffs fill Raxxan coffers fast, though the {rival} calls it plain piracy.",
        effects: [
          { kind: "money", amount: 240 },
          { kind: "morale", amount: 3 },
          { kind: "relations", amount: -15 },
        ],
      },
      {
        label: "Open a borderline spare-parts bazaar",
        result: "Refurbished scrap sells briskly to the {rival}, warming ties and spreading Raxxan flair.",
        effects: [
          { kind: "relations", amount: 12 },
          { kind: "culture", amount: 90 },
          { kind: "money", amount: -80 },
        ],
      },
    ],
  },
  {
    id: "raxxan-3-prize-court",
    raceId: "raxxan",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "Who Owns the Captured Flagship?",
    art: "pirates",
    trigger: "turn",
    text: "During sharp fighting with the {rival} near {star}, Raxxan boarders tow home a crippled command cruiser. Free-captains demand auctioning the loot; fleet smiths want every plate melted for shipyards.",
    choices: [
      {
        label: "Auction the loot to the highest bidder",
        result: "Rowdy auctions flood the treasury and thrill the crews, leaving shipyards short of alloy.",
        effects: [
          { kind: "money", amount: 270 },
          { kind: "morale", amount: 5 },
          { kind: "factories", amount: -4 },
        ],
      },
      {
        label: "Melt the cruiser into shipyard templates",
        result: "Reverse-engineering boosts weapons and construction, while disappointed raiders grumble.",
        effects: [
          { kind: "research", field: "weapons", amount: 230 },
          { kind: "research", field: "construction", amount: 190 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "raxxan-4-scrap-mountain",
    raceId: "raxxan",
    chapter: 4,
    when: { kind: "colonies", count: 4 },
    title: "Avalanche in Yard Seven",
    art: "crisis",
    trigger: "turn",
    text: "Decades of hauled wrecks stacked around {colony} have turned into a towering orbital scrap-reef. Magnet-cranes risk dropping debris onto habitats unless we invest in proper smelters.",
    choices: [
      {
        label: "Build heavy orbital smelting rings",
        result: "Refineries turn old hulks into booming factories on {colony} at heavy upfront cost.",
        effects: [
          { kind: "factories", amount: 9 },
          { kind: "research", field: "construction", amount: 200 },
          { kind: "money", amount: -210 },
        ],
      },
      {
        label: "Tow the worst hulks into deep space",
        result: "Quick tug-runs save credits and clear skies, wasting valuable salvage metal.",
        effects: [
          { kind: "morale", amount: 4 },
          { kind: "population", amount: 2 },
          { kind: "factories", amount: -5 },
        ],
      },
    ],
  },
  {
    id: "raxxan-5a-king-of-pirates",
    raceId: "raxxan",
    chapter: "5A",
    when: { kind: "turn", turn: 210 },
    title: "The Grand Bazaar of Spoils",
    art: "victory",
    trigger: "turn",
    text: "Having auctioned prizes taken from the {rival} to cheering crews, the Raxxan Reavers rule the richest black-market lanes in space. Now the captains choose their crowning move.",
    choices: [
      {
        label: "Proclaim the Freebooter Confederacy",
        result: "Every rogue port pays tribute into Raxxan vaults, infuriating the {rival} and council.",
        effects: [
          { kind: "money", amount: 300 },
          { kind: "culture", amount: 130 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Buy a respectable seat in the council",
        result: "Generous donations launder our reputation with the {rival} while emptying prize chests.",
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "culture", amount: 140 },
          { kind: "money", amount: -230 },
        ],
      },
    ],
  },
  {
    id: "raxxan-5b-iron-scavengers",
    raceId: "raxxan",
    chapter: "5B",
    when: { kind: "turn", turn: 210 },
    title: "The Forged Armada",
    art: "council",
    trigger: "turn",
    text: "Having melted the {rival}'s flagship into disciplined shipyard templates, Raxxan yards rival any formal navy. Captains ask whether to unleash an armored juggernaut or sell top hulls.",
    choices: [
      {
        label: "Unleash the Salvage Juggernaut",
        result: "Heavy yards and weapon labs roar at peak output, alarming every neighboring fleet.",
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "research", field: "weapons", amount: 310 },
          { kind: "relations", amount: -15 },
        ],
      },
      {
        label: "Export custom-built hulls to allies",
        result: "Refitted warships bring steady profit and warm ties with the {rival}, slowing our own labs.",
        effects: [
          { kind: "money", amount: 260 },
          { kind: "relations", amount: 14 },
          { kind: "research", field: "weapons", amount: -120 },
        ],
      },
    ],
  },

  // Ruuvak Brood
  {
    id: "ruuvak-1-overflowing-warrens",
    raceId: "ruuvak",
    chapter: 1,
    when: { kind: "turn", turn: 15 },
    title: "Three Clutches Before Breakfast",
    art: "contact",
    trigger: "turn",
    text: "Warm steppe pools on {colony} hatch record clutches ahead of schedule, packing nurseries to the rafters. Brood-mothers want immediate colony ships launched toward {star} before burrows overflow.",
    choices: [
      {
        label: "Rush a colony ship toward {star}",
        result: "Eager youngsters board a newly welded hull, draining treasury and thinning local shifts.",
        effects: [
          { kind: "ships", template: "colony", count: 1 },
          { kind: "money", amount: -160 },
          { kind: "population", amount: -1 },
        ],
      },
      {
        label: "Dig deeper steppe warrens on {colony}",
        result: "Expanded subterranean halls house booming numbers and lift morale, costing funds.",
        effects: [
          { kind: "population", amount: 4 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "ruuvak-2-crowded-transports",
    raceId: "ruuvak",
    chapter: 2,
    when: { kind: "colonies", count: 4 },
    title: "No Elbow Room on Four Worlds",
    art: "crisis",
    trigger: "turn",
    text: "Four steppe and frontier worlds bust with Ruuvak families clamoring for tools, rations, and berth space. Quartermasters weigh converting grain silos into factories or clearing new farmland.",
    choices: [
      {
        label: "Convert silos into bustling workshops",
        result: "Millions of eager hands staff new assembly lines on {colony}, tightening ration belts.",
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "money", amount: 140 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Clear wide steppe basins for farms",
        result: "Fresh pastures expand living space and cheer the warrens, slowing industrial builds.",
        effects: [
          { kind: "planetSize", amount: 4 },
          { kind: "morale", amount: 4 },
          { kind: "factories", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "ruuvak-3-tide-of-numbers",
    raceId: "ruuvak",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "A Million Boots on the Ridge",
    art: "crisis",
    trigger: "turn",
    text: "War with the {rival} erupts near {star}, and our massive population towers over the garrisons of the {rival}. War-chiefs urge overwhelming worlds with sheer troop waves, while planners suggest training elite drill cadres.",
    choices: [
      {
        label: "Overwhelm the front with massed levies",
        result: "Endless Ruuvak battalions swamp the positions of the {rival} and rally pride, costing heavy casualties.",
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "research", field: "weapons", amount: 220 },
          { kind: "population", amount: -3 },
        ],
      },
      {
        label: "Form disciplined veteran drill cadres",
        result: "Structured training sharpens construction and tactics while saving lives, draining funds.",
        effects: [
          { kind: "research", field: "construction", amount: 240 },
          { kind: "culture", amount: 85 },
          { kind: "money", amount: -150 },
        ],
      },
    ],
  },
  {
    id: "ruuvak-4-great-migration",
    raceId: "ruuvak",
    chapter: 4,
    when: { kind: "turn", turn: 150 },
    title: "The Steppe Exodus",
    art: "ruins",
    trigger: "turn",
    text: "Restless clans on {colony} organize a spontaneous civilian flotilla to settle every barren rock near {star}. Leaders can fund proper life-support domes or let tough settlers rough it.",
    choices: [
      {
        label: "Fund pressurized life-support domes",
        result: "Safe habitats boost planetology and population across frontier rocks at heavy treasury cost.",
        effects: [
          { kind: "population", amount: 4 },
          { kind: "research", field: "planetology", amount: 250 },
          { kind: "money", amount: -220 },
        ],
      },
      {
        label: "Let hardy clans rough it with basic gear",
        result: "Self-reliant settlers throw up rough workshops quickly, though harsh conditions hurt morale.",
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "money", amount: 150 },
          { kind: "morale", amount: -5 },
        ],
      },
    ],
  },
  {
    id: "ruuvak-5a-endless-warrens",
    raceId: "ruuvak",
    chapter: "5A",
    when: { kind: "turn", turn: 215 },
    title: "The Unstoppable Tide",
    art: "victory",
    trigger: "turn",
    text: "Having crushed the {rival} under massed Ruuvak levies, our teeming worlds spill into every corner of space. Now the brood-chiefs decide how our boundless numbers shape the galaxy.",
    choices: [
      {
        label: "Claim living space across every border",
        result: "Vast population waves swell output and numbers while terrifying the {rival} and neighbors.",
        effects: [
          { kind: "population", amount: 5 },
          { kind: "factories", amount: 10 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Send labor guilds to rebuild ravaged worlds",
        result: "Millions of Ruuvak builders restore frontier ruins, earning goodwill from the {rival}.",
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "culture", amount: 140 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
  {
    id: "ruuvak-5b-iron-cohorts",
    raceId: "ruuvak",
    chapter: "5B",
    when: { kind: "council" },
    title: "The Disciplined Multitude",
    art: "council",
    trigger: "turn",
    text: "Having forged elite drill cadres against the {rival}, the Ruuvak pair immense population with orderly civic pride. Envoys ask how our united multitude will lead the council.",
    choices: [
      {
        label: "Champion universal representation in council",
        result: "By sheer headcount and poise, the Ruuvak win praise from the {rival} and cultural prestige.",
        effects: [
          { kind: "culture", amount: 160 },
          { kind: "relations", amount: 15 },
          { kind: "morale", amount: 5 },
        ],
      },
      {
        label: "Mobilize citizen-engineers for mega-projects",
        result: "Coordinated cohorts supercharge industry and construction science at steep treasury cost.",
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "research", field: "construction", amount: 320 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },

  // Tarkhan Hunt
  {
    id: "tarkhan-1-first-range",
    raceId: "tarkhan",
    chapter: 1,
    when: { kind: "turn", turn: 20 },
    title: "Zeroing the Long Sights",
    art: "ruins",
    trigger: "turn",
    text: "Across the arid canyons of {colony}, master gunners calibrate rail-batteries against drifting stones near {star}. Hunt-marshals debate investing in precision optics or hosting ancestral marksmanship trials.",
    choices: [
      {
        label: "Fund precision targeting optics",
        result: "Ballistic computers sharpen first-strike accuracy, draining early treasury funds.",
        effects: [
          { kind: "research", field: "weapons", amount: 210 },
          { kind: "research", field: "computers", amount: 140 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Host the Canyon Marksmanship Trials",
        result: "Fair competition honors the hunter's code and lifts morale across {colony}.",
        effects: [
          { kind: "culture", amount: 95 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -70 },
        ],
      },
    ],
  },
  {
    id: "tarkhan-2-worthy-quarry",
    raceId: "tarkhan",
    chapter: 2,
    when: { kind: "turn", turn: 72 },
    title: "Tracks Beyond the Border",
    art: "contact",
    trigger: "turn",
    text: "Border scouts near {star} report armored patrol wings of the {rival} running live-fire drills. Hunt-captains ask whether to challenge the {rival} to joint target trials or map their ranges quietly.",
    choices: [
      {
        label: "Propose honorable joint gunnery trials",
        result: "Mutual respect grows with the {rival} as both fleets compare clean marksmanship.",
        effects: [
          { kind: "relations", amount: 15 },
          { kind: "culture", amount: 90 },
          { kind: "money", amount: -100 },
        ],
      },
      {
        label: "Chart their firing arcs from afar",
        result: "Long-range telemetry maps nearby stars and weapons data while cooling trust.",
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "research", field: "weapons", amount: 220 },
          { kind: "relations", amount: -12 },
        ],
      },
    ],
  },
  {
    id: "tarkhan-3-clean-shot",
    raceId: "tarkhan",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "The Hunter's Code Under Fire",
    art: "crisis",
    trigger: "turn",
    text: "War with the {rival} brings an undefended civilian liner from the {rival} into our gun-sights near {star}. Strikers argue sinking it breaks enemy morale; elders insist true hunters never shoot unarmed prey.",
    choices: [
      {
        label: "Hold fire and escort the liner clear",
        result: "Sparing unarmed ships upholds Tarkhan honor and lifts pride, though tactical leverage is lost.",
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "culture", amount: 100 },
          { kind: "relations", amount: 10 },
        ],
      },
      {
        label: "Fire on the liner to cripple logistics",
        result: "Captured cargo and disrupted routes aid the war effort, staining our proud hunter's code.",
        effects: [
          { kind: "money", amount: 220 },
          { kind: "research", field: "weapons", amount: 240 },
          { kind: "morale", amount: -6 },
          { kind: "relations", amount: -16 },
        ],
      },
    ],
  },
  {
    id: "tarkhan-4-arsenal-forge",
    raceId: "tarkhan",
    chapter: 4,
    when: { kind: "goldenAge" },
    title: "Masterwork Barrels",
    art: "victory",
    trigger: "turn",
    text: "In a golden age of precision craft, the arid foundries of {colony} achieve flawless alloy tolerances. Marshals must decide whether to mass-produce heavy cannons or endow a grand Gunnery Academy.",
    choices: [
      {
        label: "Tool every foundry for heavy cannons",
        result: "Output surges across {colony} as gleaming barrels roll off lines, tiring workers.",
        effects: [
          { kind: "factories", amount: 9 },
          { kind: "research", field: "weapons", amount: 260 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Endow the Grand Gunnery Academy",
        result: "Scholars codify ballistics and hunter philosophy, boosting culture and science at steep cost.",
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "research", field: "computers", amount: 230 },
          { kind: "money", amount: -190 },
        ],
      },
    ],
  },
  {
    id: "tarkhan-5a-paragon-lodge",
    raceId: "tarkhan",
    chapter: "5A",
    when: { kind: "council" },
    title: "The Unblemished Sightline",
    art: "council",
    trigger: "turn",
    text: "Having spared unarmed vessels of the {rival} in the heat of war, the Tarkhan Hunt stands as the galaxy's paragon of martial honor. Now the lodge chooses its legacy.",
    choices: [
      {
        label: "Swear the Peacekeeper's Watch",
        result: "Even the {rival} trusts Tarkhan guns to guard fair treaties, lifting relations and culture.",
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "culture", amount: 155 },
          { kind: "morale", amount: 5 },
        ],
      },
      {
        label: "Maintain unmatched first-strike readiness",
        result: "Arsenal worlds sharpen weapons and production to deter any challenger, cooling diplomacy.",
        effects: [
          { kind: "research", field: "weapons", amount: 330 },
          { kind: "factories", amount: 8 },
          { kind: "relations", amount: -12 },
        ],
      },
    ],
  },
  {
    id: "tarkhan-5b-cold-barrels",
    raceId: "tarkhan",
    chapter: "5B",
    when: { kind: "turn", turn: 220 },
    title: "No Mercy in the Crosshairs",
    art: "crisis",
    trigger: "turn",
    text: "Having fired on unarmed ships of the {rival}, the Tarkhan abandoned old restraint for ruthless efficiency. Now the hunt-marshals weigh total dominance against restoring lost honor.",
    choices: [
      {
        label: "Declare total apex dominion",
        result: "Relentless foundries and weapon labs overwhelm foes, leaving the {rival} bitter and fearful.",
        effects: [
          { kind: "research", field: "weapons", amount: 340 },
          { kind: "factories", amount: 10 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Atone through strict new hunter laws",
        result: "Public restitution and solemn oaths heal civic pride on {colony} at heavy treasury cost.",
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },
];