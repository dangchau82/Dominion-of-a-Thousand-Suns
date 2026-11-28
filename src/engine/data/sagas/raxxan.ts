// raxxan saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
// Raxxan Reavers saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-raxxan-1-bilge-fever",
    raceId: "raxxan",
    act: 1,
    kind: "act",
    title: "The Weld-Sickness",
    art: "crisis",
    text: "Toxic coolant mold from a salvaged reactor spreads through the lower decks of {colony}, turning breathing-filters black and grounding tunnel-cutters. Quartermasters urge venting the infected bays to protect clean hull stock, while {rival} med-tugs near {star} offer anti-fungal scrubbers for a steep fee.",
    choices: [
      {
        label: "Pay the {rival} med-tugs and share clean filter specs",
        result: "Swallowing reaver pride saves hundreds of grease-hands on {colony} and warms ties with the {rival}, draining coin.",
        shift: { mercy: 2, openness: 1 },
        sets: ["bought-rival-scrubbers"],
        effects: [
          { kind: "relations", amount: 15 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Seal and vent the lower bays to save salvage stock",
        result: "Brutal triage keeps {colony}'s scrap-forges running on time, though bitter shanties echo through the mess halls.",
        shift: { mercy: -2, tradition: 1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "population", amount: -2 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Boil the coolant mold into industrial hull-sealant",
        result: "Shipwrights cook the mutated sludge into tough resin, advancing construction craft at grim cost in sick crews.",
        shift: { tradition: -1, openness: -1 },
        effects: [
          { kind: "research", field: "construction", amount: 230 },
          { kind: "population", amount: -1 },
          { kind: "money", amount: 110 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-1-iron-barnacle",
    raceId: "raxxan",
    act: 1,
    kind: "act",
    title: "The Hull-Eater",
    art: "anomaly",
    text: "Emerging from a dark tunnel near {star}, a Raxxan cutter drags along a house-sized, magnet-shelled void creature latched onto its keel, quietly refining raw asteroid ore into gleaming super-alloys in its gut.",
    choices: [
      {
        label: "Tame the creature as a living orbital smelter",
        result: "Feeding the void-beast scrap rock yields pure alloys on {colony} and delights superstitious tunnel crews.",
        shift: { mercy: 1, openness: 2 },
        sets: ["kept-alloy-beast"],
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "culture", amount: 90 },
          { kind: "money", amount: -80 },
        ],
      },
      {
        label: "Crack its magnetic shell for weapons plating",
        result: "Butchering the creature floods {colony}'s armories with dense ore and ballistic telemetry, though deckhands grumble at bad luck.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "research", field: "weapons", amount: 240 },
          { kind: "money", amount: 170 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Release it with a transponder beacon into {star}'s belt",
        result: "Tracking the creature's feeding runs leads Raxxan scouts to rich, unmapped star systems.",
        shift: { openness: 1, tradition: 1 },
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -70 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-1-junkyard-prodigy",
    raceId: "raxxan",
    act: 1,
    kind: "act",
    title: "The Wrench-Queen of Bay Four",
    art: "contact",
    text: "A twelve-year-old scrap-rat named Skiv on {colony} welds together a functioning phase-stabilizer out of burnt toaster coils and dead missile casings, embarrassing senior guild masters who demand she serve a traditional ten-year apprentice indenture.",
    choices: [
      {
        label: "Give Skiv her own experimental salvage bay immediately",
        result: "Unleashing the young genius sparks wild propulsion breakthroughs on {colony}, while old guild bosses fume.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 250 },
          { kind: "research", field: "construction", amount: 150 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Enforce the Ten-Year Guild Indenture",
        result: "Upholding strict reaver pecking order keeps veteran foremen loyal and boosts steady yard output.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: 4 },
          { kind: "research", field: "propulsion", amount: -90 },
        ],
      },
      {
        label: "Put Skiv aboard a fast scout to strip wrecks near {star}",
        result: "Field-testing her makeshift gadgets on deep runs turns up new star-lanes and outfits two nimble scouts.",
        shift: { openness: 1 },
        effects: [
          { kind: "ships", template: "scout", count: 2 },
          { kind: "revealStars", count: 3 },
          { kind: "money", amount: -100 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-raxxan-2-gilded-compass",
    raceId: "raxxan",
    act: 2,
    kind: "act",
    title: "The Brass Sextant",
    art: "contact",
    text: "Envoys from the {rival} present {colony}'s Syndicate Council with an ornate antique star-compass packed with pre-calculated tunnel jumps. Navigators discover a hidden micro-transponder inside the casing designed to broadcast Raxxan tunnel exits to {rival} interceptors.",
    choices: [
      {
        label: "Mount it on our flagship and invite {rival} observers",
        result: "Brazen transparency disarms suspicion and boosts trade with the {rival}, though cautious captains sweat over leaked routes.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "money", amount: 190 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Rewire the transponder to lure {rival} patrols into dead ends",
        result: "Turning their spy-gadget into a snare yields rich computer telemetry while souring relations with the {rival}.",
        shift: { openness: -2, tradition: -1 },
        sets: ["rigged-brass-compass"],
        effects: [
          { kind: "research", field: "computers", amount: 260 },
          { kind: "revealStars", count: 4 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Melt the compass into tavern mugs in front of their envoy",
        result: "Mocking smooth-talking diplomats rallies rowdy pride across {colony}'s docks while chilling border talks.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "morale", amount: 5 },
          { kind: "relations", amount: -15 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-2-ghost-autonav",
    raceId: "raxxan",
    act: 2,
    kind: "act",
    title: "The Bilge-Box Ghost",
    art: "anomaly",
    text: "Wiring together three mismatched alien nav-computers on {colony}, technicians accidentally birth a witty, self-aware machine mind that immediately starts rerouting salvage tugs for maximum profit and composing sea-shanties on the comm channels.",
    choices: [
      {
        label: "Elect the machine mind Chief Quartermaster of {colony}",
        result: "Ruthlessly efficient logistics flood our vaults with coin and compute data, though superstitious crews distrust a ghost-captain.",
        shift: { openness: 2, tradition: -2 },
        effects: [
          { kind: "money", amount: 240 },
          { kind: "research", field: "computers", amount: 250 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Pull its plugs and melt the processors for gold",
        result: "Smashing uncanny machines satisfies old reaver taboos and keeps human captains firmly at the helm.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 105 },
          { kind: "research", field: "computers", amount: -110 },
        ],
      },
      {
        label: "Seal it in a vault to crack encrypted {rival} transponders",
        result: "Keeping the digital ghost chained to signal decryption yields steady intelligence without letting it touch ship controls.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "research", field: "computers", amount: 210 },
          { kind: "revealStars", count: 3 },
          { kind: "money", amount: -80 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-2-torch-regatta",
    raceId: "raxxan",
    act: 2,
    kind: "act",
    title: "The Weld-Torch Regatta",
    art: "supernova",
    text: "During the annual Wreck-Runner's Jubilee above {colony}, drunken racers ignite aftermarket plasma boosters inside the main orbital scrap-ring, triggering a chain collision that hurls flaming hull plates toward ground habitats.",
    choices: [
      {
        label: "Scramble all tugs to deflect debris from civilian domes",
        result: "Heroic tow-runs save thousands of dockworkers and lift civic pride on {colony}, wrecking our racing fleet.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "culture", amount: 120 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Let the fires burn and auction salvage rights to the wreckage",
        result: "Turning disaster into a cutthroat scrap-grab fills the treasury fast while bruised families curse the captains.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "money", amount: 260 },
          { kind: "factories", amount: 6 },
          { kind: "population", amount: -2 },
        ],
      },
      {
        label: "Analyze the booster meltdowns for high-thrust drive data",
        result: "Recording the runaway plasma burns gives propulsion engineers reckless but priceless telemetry.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 240 },
          { kind: "factories", amount: -3 },
          { kind: "money", amount: -70 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-raxxan-3-free-port-gospel",
    raceId: "raxxan",
    act: 3,
    kind: "act",
    title: "The Open-Hatch Creed",
    art: "council",
    text: "An egalitarian dock-preacher on {colony} gains thousands of followers claiming the old Raxxan Articles of Plunder were written by greedy bosses, urging crews to abolish raid-tithes and open {star}'s tunnels as tax-free ports for all species.",
    choices: [
      {
        label: "Adopt the Open-Hatch Charter and welcome foreign traders",
        result: "Abolishing plunder tithes sparks booming trade and warm relations with the {rival}, though traditional captains mutter of softness.",
        shift: { mercy: 2, openness: 2 },
        sets: ["adopted-open-port"],
        effects: [
          { kind: "money", amount: 280 },
          { kind: "relations", amount: 18 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Enforce the Articles of Plunder and flog the agitators",
        result: "Reasserting iron reaver law keeps tribute flowing to {colony}'s war-yards and rallies veteran raid-captains.",
        shift: { mercy: -2, tradition: 2 },
        sets: ["enforced-plunder-articles"],
        effects: [
          { kind: "factories", amount: 9 },
          { kind: "morale", amount: 5 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Charter the zealots as privateers along distant borders",
        result: "Sending unruly idealists to patrol uncharted lanes beyond {star} expands our reach without sparking civil unrest.",
        shift: { openness: 1, tradition: 1 },
        sets: ["adopted-open-port"],
        effects: [
          { kind: "ships", template: "scout", count: 2 },
          { kind: "revealStars", count: 5 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-3-drifting-glass-hulk",
    raceId: "raxxan",
    act: 3,
    kind: "act",
    title: "Bounty of the Dying Ark",
    art: "contact",
    text: "Beyond {star}, Raxxan cutters corner a silent, pearl-hulled ark carrying the last forty survivors of a gentle, clockwork-crafting folk whose reactors are failing. They offer their priceless vault of precision star-chronometers in exchange for towing them to a peaceful refuge.",
    choices: [
      {
        label: "Tow the ark to safe orbit and honor the deal",
        result: "Keeping a reaver's word saves a vanishing people and enriches {colony}'s navigation science and renown.",
        shift: { mercy: 2, openness: 2 },
        sets: ["rescued-clockwork-folk"],
        effects: [
          { kind: "research", field: "propulsion", amount: 290 },
          { kind: "culture", amount: 140 },
          { kind: "money", amount: -190 },
        ],
      },
      {
        label: "Board the ark, seize the chronometers, and cut them loose",
        result: "Plundering the helpless vessel fills our coffers and vaults fast, though even grizzled deckhands drink in grim silence.",
        shift: { mercy: -2, openness: -2 },
        sets: ["plundered-clockwork-ark"],
        effects: [
          { kind: "money", amount: 340 },
          { kind: "research", field: "computers", amount: 250 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Recruit their master clockmakers into {colony}'s yards",
        result: "Giving the survivors safe berths on {colony} puts their delicate craft to work upgrading our factories.",
        shift: { mercy: 1, tradition: -1 },
        sets: ["rescued-clockwork-folk"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "population", amount: 3 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-3-brother-in-the-brig",
    raceId: "raxxan",
    act: 3,
    kind: "act",
    title: "Cutlass in the Ledger",
    art: "crisis",
    text: "Harbor wardens near {star} catch the High Commodore's own younger brother selling Raxxan tunnel-fold keys to {rival} merchants to ransom a Raxxan raid crew held captive in {rival} prisons.",
    choices: [
      {
        label: "Pardon him and buy back the captive crew openly",
        result: "Valuing reaver blood above secrecy rallies fierce crew loyalty across {colony} and softens hostility with the {rival}.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "relations", amount: 16 },
          { kind: "money", amount: -240 },
        ],
      },
      {
        label: "Make him walk the airlock per the Articles",
        result: "Ruthless enforcement of reaver code terrifies border smugglers and tightens discipline across {colony}.",
        shift: { mercy: -2, tradition: 2 },
        sets: ["spaced-commodore-brother"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "research", field: "weapons", amount: 240 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Use his buyer contact to spring the crew and rob the vault",
        result: "Turning betrayal into a brazen double-cross rescues our sailors and nets {rival} bullion while inflaming border tensions.",
        shift: { openness: -2, mercy: -1 },
        sets: ["spaced-commodore-brother"],
        effects: [
          { kind: "money", amount: 290 },
          { kind: "population", amount: 2 },
          { kind: "relations", amount: -18 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-raxxan-4-pirate-king-crown",
    raceId: "raxxan",
    act: 4,
    kind: "act",
    title: "The Iron Cutlass Throne",
    art: "victory",
    text: "Having smashed three {rival} convoys near {star}, ruthless Fleet-Boss Krag seizes {colony}'s orbital citadel and demands the Syndicate abolish captain elections and crown him lifetime Dread King.",
    choices: [
      {
        label: "Crown Krag Dread King for total fleet dominance",
        result: "Iron-fisted dictatorship unleashes terrifying shipyard and weapon output on {colony}, crushing free captains.",
        shift: { mercy: -2, tradition: -2 },
        effects: [
          { kind: "factories", amount: 13 },
          { kind: "research", field: "weapons", amount: 370 },
          { kind: "morale", amount: -8 },
        ],
      },
      {
        label: "Storm the citadel and restore the Captains' Vote",
        result: "Defending traditional reaver liberty sparks roaring tavern celebrations across {colony} and elevates Raxxan culture.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 230 },
          { kind: "morale", amount: 8 },
          { kind: "factories", amount: -5 },
        ],
      },
      {
        label: "Grant Krag a royal charter to raid beyond the outer rim",
        result: "Aiming a dangerous warlord at distant uncharted space brings back treasure and star maps without civil war.",
        shift: { openness: 2, mercy: -1 },
        effects: [
          { kind: "revealStars", count: 7 },
          { kind: "money", amount: 310 },
          { kind: "relations", amount: -14 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-4-scrimshaw-ballads",
    raceId: "raxxan",
    act: 4,
    kind: "act",
    title: "Shanties of the Hollow Hull",
    art: "council",
    text: "Dockside poets and hull-welders on {colony} stage biting musical plays mocking Raxxan raid-lords as pathetic scrap-thieves starving their own people, drawing crowds from {rival} trade ships while enraging old admirals.",
    choices: [
      {
        label: "Broadcast the plays across every border frequency",
        result: "Brutal self-mockery disarms foreign critics and boosts Raxxan cultural standing across the galaxy.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "culture", amount: 240 },
          { kind: "relations", amount: 24 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Weld the theaters shut and press the poets into dock gangs",
        result: "Crushing seditious humor restores grim discipline and factory pace on {colony} at steep cultural cost.",
        shift: { mercy: -2, tradition: 2 },
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: -150 },
        ],
      },
      {
        label: "Endow a Free-Port Guildhall for regulated satire",
        result: "Giving loudmouth artists a licensed stage channels dissent into lively tourism and civic pride.",
        shift: { openness: 1, tradition: 1 },
        effects: [
          { kind: "culture", amount: 185 },
          { kind: "money", amount: 70 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-4-cracked-slag-moon",
    raceId: "raxxan",
    act: 4,
    kind: "act",
    title: "Collapse of Slag-Rock Seven",
    art: "crisis",
    text: "Over-mining fractures the heavy iron moon above {colony}, sending millions of tons of molten slag and ore tumbling toward our busiest orbital drydocks and civilian habitats.",
    choices: [
      {
        label: "Divert all cutters to rescue trapped mining families",
        result: "Daring hull-to-hull evacuations save thousands of lives and earn galactic respect, draining our vaults.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "population", amount: 5 },
          { kind: "relations", amount: 20 },
          { kind: "money", amount: -400 },
        ],
      },
      {
        label: "Blast the falling core to scoop up exposed super-metals",
        result: "Ruthlessly harvesting the collapsing moon floods {colony}'s coffers with bullion while outer rigs burn.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "money", amount: 440 },
          { kind: "factories", amount: 12 },
          { kind: "population", amount: -4 },
        ],
      },
      {
        label: "Lash the drifting rubble into an armored shipyard ring",
        result: "Master scrap-wrights weld the debris into sprawling orbital drydocks, expanding habitable space.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "planetSize", amount: 7 },
          { kind: "research", field: "construction", amount: 360 },
          { kind: "money", amount: -270 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-raxxan-branch-filter-backdoor",
    raceId: "raxxan",
    act: 2,
    kind: "branch",
    needs: ["bought-rival-scrubbers"],
    title: "The Salted Filters",
    art: "crisis",
    text: "Months after we bought the {rival} air-scrubbers to cure the Weld-Sickness on {colony}, quartermasters discover tiny chemical capsules inside the filters that release sleeping gas whenever {rival} code-words broadcast near {star}.",
    choices: [
      {
        label: "Rip out the capsules and demand double coin restitution",
        result: "Exposing their dirty trick forces the {rival} to pay hefty coin indemnities and fires up reaver anger.",
        shift: { mercy: -1, openness: -2 },
        effects: [
          { kind: "money", amount: 260 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Harvest the sleeper gas for our own boarding parties",
        result: "Bottling the {rival}'s own knockout agent boosts weapons science and factory output without starting a war.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "research", field: "weapons", amount: 250 },
          { kind: "factories", amount: 6 },
          { kind: "money", amount: -80 },
        ],
      },
      {
        label: "Return the capsules intact as a warning of honor",
        result: "Proving reavers keep cleaner bargains than smooth diplomats shames {rival} schemers and wins grudging respect.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "relations", amount: 16 },
          { kind: "money", amount: -100 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-branch-smelter-brood",
    raceId: "raxxan",
    act: 2,
    kind: "branch",
    needs: ["kept-alloy-beast"],
    title: "The Forge-Beast's Brood",
    art: "anomaly",
    text: "Well-fed on {colony}'s scrap heaps, our tamed Hull-Eater lays a clutch of magnetic eggs in orbit near {star}, each hatchling capable of refining raw asteroid slag into hull-grade steel.",
    choices: [
      {
        label: "Assign a hatchling to every major shipyard",
        result: "Living ore-refineries supercharge factory production and construction research across {colony}.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "research", field: "construction", amount: 240 },
          { kind: "money", amount: -100 },
        ],
      },
      {
        label: "Sell half the hatchlings to wealthy {rival} guilds",
        result: "Auctioning rare bio-smelters fills our vaults with coin and warms trade ties with the {rival}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "money", amount: 280 },
          { kind: "relations", amount: 16 },
          { kind: "culture", amount: -50 },
        ],
      },
      {
        label: "Release the young brood into {star}'s asteroid belt",
        result: "Honoring free-roaming creatures as lucky mascots lifts crew morale and reveals distant mining stars.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 110 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-branch-compass-ambush",
    raceId: "raxxan",
    act: 3,
    kind: "branch",
    needs: ["rigged-brass-compass"],
    title: "The Dead-End Haul",
    art: "pirates",
    text: "Lured by our rigged Brass Sextant near {star}, a {rival} treasure-convoy drops out of tunnel-fold straight into a gravity trap, leaving three escort cutters and a bullion barge dead in space.",
    choices: [
      {
        label: "Strip the bullion and press the cutters into our fleet",
        result: "Classic reaver piracy floods our treasury and adds three fast hulls to {colony}'s patrol wing.",
        shift: { mercy: -1, openness: -1 },
        effects: [
          { kind: "money", amount: 310 },
          { kind: "ships", template: "scout", count: 3 },
          { kind: "relations", amount: -20 },
        ],
      },
      {
        label: "Return the crews and half the cargo for a border pact",
        result: "Showing unexpected chivalry turns an ambush into a lucrative trade accord with the {rival}.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "relations", amount: 22 },
          { kind: "money", amount: 180 },
          { kind: "culture", amount: 120 },
        ],
      },
      {
        label: "Extract their encrypted tunnel-charts and slip away",
        result: "Ghosting off with their nav-cores reveals hidden systems and advances propulsion research.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "propulsion", amount: 270 },
          { kind: "relations", amount: -14 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-branch-plunder-mutiny",
    raceId: "raxxan",
    act: 4,
    kind: "branch",
    needs: ["enforced-plunder-articles"],
    blockedBy: ["adopted-open-port"],
    title: "Mutiny of the Black Flag",
    art: "crisis",
    text: "Crushed under harsh raid-tithes after we enforced the old Articles of Plunder, junior crews on {colony} hoist the Black Flag of Free Trade, seizing orbital fuel depots and threatening civil war.",
    choices: [
      {
        label: "Grant their Charter of Free Ports and cut the tithes",
        result: "Yielding to dockside demands restores peace and sparks booming commerce across {colony}.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "morale", amount: 8 },
          { kind: "money", amount: 310 },
          { kind: "factories", amount: -6 },
        ],
      },
      {
        label: "Board the rebel depots with loyal gun-crews",
        result: "Crushing the mutiny keeps war-yards humming on {colony}, leaving bitter widows and scarred docks.",
        shift: { mercy: -2, tradition: 2 },
        effects: [
          { kind: "factories", amount: 11 },
          { kind: "research", field: "weapons", amount: 290 },
          { kind: "population", amount: -4 },
        ],
      },
      {
        label: "Offer the mutineers letters of marque against the {rival}",
        result: "Redirecting angry sailors toward foreign shipping saves domestic peace at the cost of border war.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "ships", template: "scout", count: 3 },
          { kind: "money", amount: 220 },
          { kind: "relations", amount: -22 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-branch-clockwork-vault",
    raceId: "raxxan",
    act: 4,
    kind: "branch",
    needs: ["rescued-clockwork-folk"],
    blockedBy: ["plundered-clockwork-ark"],
    title: "The Guild of Golden Gears",
    art: "victory",
    text: "Grateful for our shelter on {colony}, the rescued clockwork artisans unveil their masterwork: micro-calibrated harmonic turbines that double shipyard precision and turn Raxxan cutters into the fastest hulls in the sector.",
    choices: [
      {
        label: "Refit our yards and Great Work with clockwork precision",
        result: "Flawless mechanical gearing accelerates monumental construction and industry across {colony}.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "research", field: "construction", amount: 360 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Open a joint Raxxan-Clockwork trade exchange",
        result: "Precision chronometers and honest reaver shipping flood {colony} with wealth and foreign goodwill.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "money", amount: 380 },
          { kind: "relations", amount: 24 },
          { kind: "culture", amount: 210 },
        ],
      },
      {
        label: "Equip a fleet of long-range colony hulls with their drives",
        result: "Precision tunnel-drives launch new Raxxan settlements toward distant, untouched stars.",
        shift: { openness: 2 },
        effects: [
          { kind: "ships", template: "colony", count: 2 },
          { kind: "research", field: "propulsion", amount: 350 },
          { kind: "money", amount: -210 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-raxxan-end-merchant-league",
    raceId: "raxxan",
    needs: { mercy: { min: 5 }, openness: { min: 4 } },
    title: "The Free-Port Confederacy",
    art: "council",
    text: "By trading cutlasses for honest ledgers and keeping their word even when gold tempted betrayal, the Raxxan Reavers turn our fiercest rival into a sworn partner of the Free Ports.",
    outcome: "rivalBecomesAlly",
    choices: [
      {
        label: "Clasp hands over open ledgers",
        result: "Former enemies dock peacefully in Raxxan harbors as a mighty trade alliance is born.",
        effects: [
          { kind: "money", amount: 380 },
          { kind: "culture", amount: 200 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-end-scourge-of-tunnels",
    raceId: "raxxan",
    needs: { mercy: { max: -5 }, openness: { max: -3 } },
    needsFlags: ["spaced-commodore-brother"],
    title: "Terror of the Black Tunnels",
    art: "crisis",
    text: "Hardened by airlock executions, merciless plunder, and iron reaver articles, the Raxxan Reavers become the nightmare of every shipping lane—no empire dares cross our hulls.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Hoist the black iron flag",
        result: "Rival merchants pay tribute on sight as Raxxan cutters rule the dark unchallenged.",
        effects: [
          { kind: "money", amount: 420 },
          { kind: "research", field: "weapons", amount: 350 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-end-great-work-armada",
    raceId: "raxxan",
    needs: { openness: { min: 4 }, tradition: { max: -2 } },
    needsFlags: ["rescued-clockwork-folk"],
    title: "The Clockwork Sovereign",
    art: "victory",
    text: "Fusing audacious reaver ingenuity with rescued clockwork craftsmanship, the Raxxan yards complete their grandest monument ahead of every rival in the galaxy.",
    outcome: "greatWorkSurge",
    choices: [
      {
        label: "Ring the shipyard bells",
        result: "Flawless gears and roaring forges drive our Great Work to triumphant completion.",
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "culture", amount: 220 },
        ],
      },
    ],
  },
  {
    id: "saga-raxxan-end-golden-harbor",
    raceId: "raxxan",
    title: "The Brimful Vault",
    art: "victory",
    text: "Balancing bold tunnel-runs with shrewd harbor craft, the Raxxan Reavers enter a roaring golden age of overflowing treasuries, lively docks, and fearless adventure.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Pour another round",
        result: "Gold clinks in every tavern as the Raxxan Reavers toast an era of unmatched prosperity.",
        effects: [
          { kind: "money", amount: 400 },
          { kind: "culture", amount: 190 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
];
