// verdane saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
// Verdane saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-verdane-1-amber-blight",
    raceId: "verdane",
    act: 1,
    kind: "act",
    title: "The Copper Rust",
    art: "crisis",
    text: "A metallic lichen carried on meteor dust sweeps the upper boughs of {colony}, turning supple vascular bark into brittle copper slag. Grove-healers propose grafting hardy xenobiotic moss shared by {rival} botanists near {star}, while Root-Wardens demand burning the affected valleys to ash.",
    choices: [
      {
        label: "Graft the {rival} moss onto our living boughs",
        result: "Foreign moss halts the rust across {colony} and warms ties with the {rival}, though purists recoil at mixed sap.",
        shift: { mercy: 2, openness: 1 },
        sets: ["grafted-rival-moss"],
        effects: [
          { kind: "relations", amount: 15 },
          { kind: "population", amount: 2 },
          { kind: "culture", amount: -60 },
        ],
      },
      {
        label: "Burn the blighted valleys down to bare soil",
        result: "Controlled fire-lines purge the rust cleanly and enrich mineral ash on {colony}, at heavy loss of young groves.",
        shift: { mercy: -2, tradition: 1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "population", amount: -2 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Distill the copper-crusted bark for hull plating",
        result: "Sap-smiths smelt the blighted timber into dense metallic-wood alloys, advancing construction craft at steep cost.",
        shift: { tradition: -1, openness: -1 },
        effects: [
          { kind: "research", field: "construction", amount: 230 },
          { kind: "money", amount: -110 },
          { kind: "morale", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-1-starlight-moth",
    raceId: "verdane",
    act: 1,
    kind: "act",
    title: "Wings of Solar Pollen",
    art: "anomaly",
    text: "Orbiting {star}, Verdane seed-scouts encounter a migrating cloud of translucent, leaf-winged void-moths that drink corona light and scatter luminous spores across passing hulls.",
    choices: [
      {
        label: "Follow the swarm toward distant bright suns",
        result: "Trailing the solar moths leads our scouts along warm radiation lanes to newly charted stars.",
        shift: { openness: 2, tradition: 1 },
        sets: ["followed-solar-moths"],
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "culture", amount: 95 },
          { kind: "money", amount: -80 },
        ],
      },
      {
        label: "Harvest their pollen-sacs for nursery fertilizer",
        result: "Rich solar pollen accelerates seedling blooms on {colony}, though mourning songs follow the swarm's scattering.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "population", amount: 4 },
          { kind: "factories", amount: 4 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Weave landing trellises onto our scout hulls",
        result: "Inviting the moths to roost on living rigging improves solar-sail efficiency and delights frontier crews.",
        shift: { mercy: 1, openness: 1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 210 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-1-prism-sapling",
    raceId: "verdane",
    act: 1,
    kind: "act",
    title: "The Sun-Weaver Sprout",
    art: "contact",
    text: "Sprouting from a meteorite crater on {colony}, a young Verdane named Liora grows crystalline leaves that bend starlight into coherent laser-harmonics. Traditional elders want her tended in quiet temple cloisters, while shipwrights want her grown into a living orbital lens.",
    choices: [
      {
        label: "Nurture her freely in the Temple of First Dawn",
        result: "Gentle guidance lets Liora compose radiant light-hymns that lift cultural pride across {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -85 },
        ],
      },
      {
        label: "Channel her prism-leaves into orbital weapons arrays",
        result: "Focused solar beams sharpen fleet gunnery research on {colony}, though Liora's crown withers from strain.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "research", field: "weapons", amount: 260 },
          { kind: "factories", amount: 5 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Invite {rival} opticians to study her refraction",
        result: "Open scientific exchange wins warm goodwill from the {rival} and unlocks delicate force-field insights.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "research", field: "forceFields", amount: 190 },
          { kind: "money", amount: -70 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-verdane-2-gilded-sap",
    raceId: "verdane",
    act: 2,
    kind: "act",
    title: "Casks of Sun-Nectar",
    art: "contact",
    text: "Traders from the {rival} present {colony}'s High Grove with ornate amphorae of rare mineral nectar said to double root growth. Botanists discover trace mutagenic spores suspended in the sediment that slowly rewrite Verdane seed-memory.",
    choices: [
      {
        label: "Pour the nectar onto our sacred seed-beds",
        result: "Rapid mutations swell population and living space on {colony}, though elders warn our heritage is shifting.",
        shift: { openness: 2, tradition: -2 },
        sets: ["drank-mutagenic-nectar"],
        effects: [
          { kind: "population", amount: 4 },
          { kind: "planetSize", amount: 4 },
          { kind: "culture", amount: -70 },
        ],
      },
      {
        label: "Seal the amphorae and return them with cold courtesy",
        result: "Upholding Verdane dignity and pure lineage reassures traditional groves while cooling ties with the {rival}.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -15 },
        ],
      },
      {
        label: "Isolate the spores in sealed planetology vaults",
        result: "Careful laboratory analysis extracts genetic terraforming secrets without exposing a single Verdane root.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "research", field: "planetology", amount: 260 },
          { kind: "money", amount: 130 },
          { kind: "relations", amount: -10 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-2-root-chorus-engine",
    raceId: "verdane",
    act: 2,
    kind: "act",
    title: "The Thinking Vine",
    art: "anomaly",
    text: "While weaving bio-circuits to regulate greenhouse moisture on {colony}, gardeners accidentally link millions of root-tips into an emergent botanical mind that begins optimizing water budgets and composing strange, wordless poetry.",
    choices: [
      {
        label: "Grant the root-mind full stewardship of {colony}'s soil",
        result: "Symbiotic automation boosts agriculture and compute research, though citizens feel watched by the forest floor.",
        shift: { openness: 1, tradition: -2 },
        effects: [
          { kind: "research", field: "computers", amount: 250 },
          { kind: "planetSize", amount: 4 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Prune the neural tendrils back to simple irrigation",
        result: "Restoring traditional gardener oversight calms anxious groves and honors ancestral craft.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 105 },
          { kind: "research", field: "computers", amount: -110 },
        ],
      },
      {
        label: "Transplant cuttings onto scout ships as living navigators",
        result: "Root-linked astrogation nodes guide fresh scout hulls along star-lanes near {star}.",
        shift: { openness: 2 },
        effects: [
          { kind: "ships", template: "scout", count: 2 },
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: -120 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-2-eclipse-vigil",
    raceId: "verdane",
    act: 2,
    kind: "act",
    title: "Shadow Over the Solarium",
    art: "supernova",
    text: "During the sacred Festival of Unfurled Leaves on {colony}, a rogue gas giant drifts across {star}, plunging the capital into an unexpected week-long eclipse that panics light-starved crowds and stalls solar-powered looms.",
    choices: [
      {
        label: "Ignite sacred resin-braziers and lead calming chants",
        result: "Shared warmth and ancient hymns turn darkness into an unforgettable bond of civic solidarity.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Divert all reserve power to keep timber-mills running",
        result: "Industrial quotas on {colony} stay unbroken through the dark, leaving shivering citizens bitter.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "money", amount: 150 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Launch orbital mirror-sails to reflect starlight down",
        result: "Emergency solar reflectors save the harvest and advance orbital construction techniques.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "research", field: "construction", amount: 240 },
          { kind: "population", amount: 2 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-verdane-3-sun-cult-schism",
    raceId: "verdane",
    act: 3,
    kind: "act",
    title: "Children of the White Corona",
    art: "council",
    text: "A fervent prophetic sect on {colony} preaches that Verdane groves were meant to root only beneath hot white and blue stars, urging pilgrims to abandon dim yellow-star colonies near {star} and sever diplomatic ties with 'cold-blooded' non-plant empires.",
    choices: [
      {
        label: "Condemn the zealots and protect every multi-star grove",
        result: "Defending unity across all worlds reassures frontier settlers and warms relations with the {rival}.",
        shift: { mercy: 2, openness: 2 },
        sets: ["protected-all-groves"],
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: -80 },
        ],
      },
      {
        label: "Adopt the White Corona creed and fortify bright-star worlds",
        result: "Solar zealotry supercharges growth and industry on {colony}, while dim-star colonies feel abandoned.",
        shift: { tradition: 2, openness: -2 },
        sets: ["adopted-corona-creed"],
        effects: [
          { kind: "factories", amount: 9 },
          { kind: "culture", amount: 140 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Channel the pilgrims into deep-space solar-sail expeditions",
        result: "Sending zealous saplings to chart distant blue stars turns religious fervor into peaceful exploration.",
        shift: { openness: 1, tradition: 1 },
        sets: ["protected-all-groves"],
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "ships", template: "scout", count: 2 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-3-withered-heralds",
    raceId: "verdane",
    act: 3,
    kind: "act",
    title: "The Last Autumn Fleet",
    art: "contact",
    text: "Orbiting {star}, Verdane patrols encounter the drifting seed-ark of an ancient, dying arboreal race whose homeworld turned to salt. Their last sap-keepers offer their entire botanical gene-bank if we plant their final seeds in {colony}'s sacred soil.",
    choices: [
      {
        label: "Plant their final seeds in our richest valleys",
        result: "Sharing our soil saves a vanishing lineage from oblivion and enriches Verdane planetology and culture.",
        shift: { mercy: 2, openness: 2 },
        sets: ["planted-alien-seeds"],
        effects: [
          { kind: "research", field: "planetology", amount: 290 },
          { kind: "culture", amount: 145 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "Extract their gene-bank and compost the ark for timber",
        result: "Merciless salvage yields rich agricultural formulas and shipyard alloys, though old groves mourn the cruelty.",
        shift: { mercy: -2, openness: -2 },
        sets: ["composted-alien-ark"],
        effects: [
          { kind: "research", field: "planetology", amount: 310 },
          { kind: "factories", amount: 7 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Tow their ark into stable orbit as a living museum",
        result: "Preserving their sealed biosphere honors ancient reverence for life without risking invasive cross-pollination.",
        shift: { tradition: 2, mercy: 1 },
        sets: ["planted-alien-seeds"],
        effects: [
          { kind: "culture", amount: 155 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-3-hollow-bough-kin",
    raceId: "verdane",
    act: 3,
    kind: "act",
    title: "Sap in the Cipher",
    art: "crisis",
    text: "Root-scouts near {star} discover that the High Grove-Keeper's own grafted twin has been secretly passing Verdane lane-growth schedules to the {rival} to keep a border truce from collapsing.",
    choices: [
      {
        label: "Pardon the twin and formalize the border truce",
        result: "Choosing peace and family grace over pride wins heartfelt gratitude from the {rival}, though traditionalists fume.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "culture", amount: 110 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Sever the twin's root-bond and cast them into barren exile",
        result: "Unbending adherence to the Verdane code hardens border discipline and industrial output on {colony}.",
        shift: { mercy: -2, tradition: 2 },
        sets: ["exiled-grove-twin"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Use the twin's channel to feed false fleet schedules",
        result: "Turning kin-betrayal into a quiet counter-intelligence trap protects {star} while straining civic trust.",
        shift: { openness: -2, mercy: -1 },
        sets: ["exiled-grove-twin"],
        effects: [
          { kind: "research", field: "computers", amount: 250 },
          { kind: "revealStars", count: 4 },
          { kind: "culture", amount: -90 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-verdane-4-iron-canopy-regent",
    raceId: "verdane",
    act: 4,
    kind: "act",
    title: "The Crown of Thorns",
    art: "victory",
    text: "After saving frontier groves from {rival} raids near {star}, war-hero Thorne demands that the High Canopy suspend rotating seasonal councils and rule {colony} as lifetime Root-Sovereign.",
    choices: [
      {
        label: "Ratify Thorne's lifetime rule for iron security",
        result: "Centralized war-forges and thorn-batteries surge on {colony}, while free groves wither under martial decree.",
        shift: { mercy: -2, tradition: -2 },
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "research", field: "weapons", amount: 360 },
          { kind: "morale", amount: -8 },
        ],
      },
      {
        label: "Uphold the Seasonal Cycle and retire Thorne with honor",
        result: "Respecting ancient renewal laws sparks joyful festivals across {colony} and deepens Verdane cultural glory.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 230 },
          { kind: "morale", amount: 8 },
          { kind: "factories", amount: -5 },
        ],
      },
      {
        label: "Appoint Thorne to lead an outer terraforming expedition",
        result: "Redirecting a proud general toward greening harsh worlds near {star} channels ambition into growth.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "planetSize", amount: 7 },
          { kind: "ships", template: "colony", count: 2 },
          { kind: "money", amount: -280 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-4-carved-heartwood",
    raceId: "verdane",
    act: 4,
    kind: "act",
    title: "Ballads in Living Bark",
    art: "council",
    text: "Radical Verdane artisans on {colony} graft bioluminescent bark-scrolls onto starport hulls depicting our wars as tragic waste, drawing pilgrims from the {rival} while scandalizing orthodox elders.",
    choices: [
      {
        label: "Sponsor a galactic tour of the living bark-scrolls",
        result: "Poignant botanical art captivates neighboring empires and elevates Verdane prestige across every council.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "culture", amount: 240 },
          { kind: "relations", amount: 24 },
          { kind: "money", amount: -210 },
        ],
      },
      {
        label: "Strip the hulls and outlaw pacifist grafting",
        result: "Restoring stern ancestral bark-markings steadies martial discipline on {colony} at steep cultural cost.",
        shift: { mercy: -2, tradition: 2 },
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "morale", amount: 4 },
          { kind: "culture", amount: -150 },
        ],
      },
      {
        label: "Transplant the scrolls into a quiet historical arboretum",
        result: "Preserving dissenting art in peaceful gardens balances free expression with dignified order.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "culture", amount: 180 },
          { kind: "research", field: "planetology", amount: 290 },
          { kind: "money", amount: -170 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-4-shattered-spindle-moon",
    raceId: "verdane",
    act: 4,
    kind: "act",
    title: "Ash on the Canopy Moon",
    art: "crisis",
    text: "Subterranean steam eruptions crack the verdant agricultural moon orbiting {colony}, hurling burning pumice toward our orbital seed-vaults and choking the sky with sulfur.",
    choices: [
      {
        label: "Deploy all vessels to evacuate settlers and seed-vaults",
        result: "Heroic rescue lifts save millions of lives and win galactic admiration at heavy treasury expense.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "population", amount: 5 },
          { kind: "relations", amount: 20 },
          { kind: "money", amount: -400 },
        ],
      },
      {
        label: "Mine the exposed volcanic core for rare industrial ores",
        result: "Exploiting the fractured moon floods {colony}'s foundries with wealth while abandoning outer nurseries.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "money", amount: 410 },
          { kind: "factories", amount: 12 },
          { kind: "population", amount: -4 },
        ],
      },
      {
        label: "Seed the ash-cloud with engineered sky-moss to scrub the air",
        result: "Bold bio-engineering turns volcanic fallout into fertile floating mats that expand living space.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "planetSize", amount: 7 },
          { kind: "research", field: "planetology", amount: 370 },
          { kind: "money", amount: -270 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-verdane-branch-symbiotic-wilt",
    raceId: "verdane",
    act: 2,
    kind: "branch",
    needs: ["grafted-rival-moss"],
    title: "The Parasite Bloom",
    art: "crisis",
    text: "Seasons after we grafted the {rival} moss onto {colony}'s boughs to halt the Copper Rust, the foreign moss begins flowering crimson tendrils that siphon sap into dormant spore-pods tuned to {rival} frequencies near {star}.",
    choices: [
      {
        label: "Sever the pods and demand restitution from the {rival}",
        result: "Cutting out the hidden siphons and extracting heavy coin indemnities restores Verdane pride on {colony}.",
        shift: { mercy: -1, openness: -2 },
        effects: [
          { kind: "money", amount: 240 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Domesticate the tendrils into bio-batteries",
        result: "Rewiring the foreign moss turns an attempted trap into thriving organic factories on {colony}.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "research", field: "planetology", amount: 230 },
          { kind: "money", amount: -90 },
        ],
      },
      {
        label: "Send peaceful botanists to reconcile the two lineages",
        result: "Cross-pollinating both species in good faith shames {rival} schemers and builds genuine trust.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "relations", amount: 16 },
          { kind: "money", amount: -120 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-branch-moth-sanctuary",
    raceId: "verdane",
    act: 2,
    kind: "branch",
    needs: ["followed-solar-moths"],
    title: "The Radiant Cocoon",
    art: "anomaly",
    text: "Following the Solar Pollen moths past {star} brings Verdane scouts to a binary nursery where millions of moths spin shimmering silk-cocoons around mineral asteroids, bathing nearby hulls in warm golden light.",
    choices: [
      {
        label: "Harvest cast-off silk to weave solar-sail cruisers",
        result: "Feather-light moth-silk supercharges propulsion research and launches two swift scout hulls.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 260 },
          { kind: "ships", template: "scout", count: 2 },
          { kind: "money", amount: -100 },
        ],
      },
      {
        label: "Declare the binary nursery a sacred pilgrimage grove",
        result: "Hymns composed under the golden cocoons elevate Verdane culture and lift spirits across {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 155 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Chart the surrounding radiation lanes for expansion",
        result: "Mapping the warm binary currents reveals untouched star systems ready for Verdane seeds.",
        shift: { openness: 2 },
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "planetology", amount: 190 },
          { kind: "money", amount: -80 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-branch-mutagen-bloom",
    raceId: "verdane",
    act: 3,
    kind: "branch",
    needs: ["drank-mutagenic-nectar"],
    title: "The Star-Root Awakening",
    art: "anomaly",
    text: "Driven by the mutagenic {rival} nectar poured onto {colony}'s seed-beds, a new generation of Verdane sprouts develops metallic root-filaments capable of drinking vacuum radiation and growing on airless rocks.",
    choices: [
      {
        label: "Embrace the new lineage and seed barren worlds",
        result: "Vacuum-hardy groves expand habitable living space across {colony} and its moons, though purists mourn old forms.",
        shift: { tradition: -2, openness: 2 },
        effects: [
          { kind: "planetSize", amount: 6 },
          { kind: "population", amount: 4 },
          { kind: "culture", amount: -110 },
        ],
      },
      {
        label: "Quarantine the mutants to protect ancestral sap",
        result: "Isolating the altered groves preserves classical Verdane heritage on {colony} at steep social cost.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "culture", amount: 135 },
          { kind: "morale", amount: -5 },
          { kind: "factories", amount: 6 },
        ],
      },
      {
        label: "Study their metallic sap for force-field lattices",
        result: "Synthesizing bio-conductive resins yields breakthroughs in force fields and construction.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 290 },
          { kind: "research", field: "construction", amount: 210 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-branch-corona-revolt",
    raceId: "verdane",
    act: 4,
    kind: "branch",
    needs: ["adopted-corona-creed"],
    blockedBy: ["protected-all-groves"],
    title: "The Dim-Star Uprising",
    art: "crisis",
    text: "Feeling abandoned after {colony} embraced the White Corona creed, frontier groves orbiting cooler stars near {star} sever trade vines and threaten to form an independent Twilight League.",
    choices: [
      {
        label: "Repeal the creed and send solar-mirror relief fleets",
        result: "Humble reconciliation and orbital reflectors heal the rift across our colonies, draining treasury reserves.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "morale", amount: 8 },
          { kind: "culture", amount: 180 },
          { kind: "money", amount: -340 },
        ],
      },
      {
        label: "Blockade the rebel stars with thorn-cruisers",
        result: "Crushing the Twilight League keeps factory tribute flowing to {colony} at grim cost in Verdane lives.",
        shift: { mercy: -2, tradition: 1 },
        effects: [
          { kind: "factories", amount: 11 },
          { kind: "research", field: "weapons", amount: 280 },
          { kind: "population", amount: -4 },
        ],
      },
      {
        label: "Grant them autonomy as outer shade-marches",
        result: "Recognizing regional self-rule prevents bloodshed while preserving loose botanical federation.",
        shift: { openness: 1, mercy: 1 },
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "relations", amount: 14 },
          { kind: "factories", amount: -5 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-branch-ancient-seed-bloom",
    raceId: "verdane",
    act: 4,
    kind: "branch",
    needs: ["planted-alien-seeds"],
    blockedBy: ["composted-alien-ark"],
    title: "The Singing Spire-Wood",
    art: "victory",
    text: "Nurtured in {colony}'s soil, the saved seeds of the vanished arboreal elders burst into towering crystal-hearted spire-trees whose resonant roots weave directly into our megaproject foundations.",
    choices: [
      {
        label: "Channel the spire-wood into our Great Work",
        result: "Self-growing crystalline timber accelerates monumental construction across {colony} at breathtaking speed.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "factories", amount: 11 },
          { kind: "research", field: "construction", amount: 360 },
          { kind: "money", amount: -180 },
        ],
      },
      {
        label: "Open the singing groves to pilgrims from every empire",
        result: "Visitors from across the galaxy marvel at the resurrected forest, elevating Verdane standing and goodwill.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "culture", amount: 240 },
          { kind: "relations", amount: 25 },
          { kind: "morale", amount: 7 },
        ],
      },
      {
        label: "Harvest their harmonic resin for deep-space colony hulls",
        result: "Living crystal-wood hulls carry new Verdane seed-ships outward into uncharted space.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "ships", template: "colony", count: 2 },
          { kind: "research", field: "planetology", amount: 340 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-verdane-end-living-monument",
    raceId: "verdane",
    needs: { tradition: { min: 4 }, mercy: { min: 3 } },
    needsFlags: ["planted-alien-seeds"],
    title: "The World-Tree Rises",
    art: "victory",
    text: "By honoring living heritage and sheltering the final seeds of a vanished people, the Verdane awaken symbiotic spire-wood that drives our Great Work forward in a single mighty surge.",
    outcome: "greatWorkSurge",
    choices: [
      {
        label: "Let the canopy touch the stars",
        result: "Living crystal-boughs knit our grandest monument together ahead of schedule.",
        effects: [
          { kind: "culture", amount: 240 },
          { kind: "morale", amount: 7 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-end-canopy-accord",
    raceId: "verdane",
    needs: { mercy: { min: 5 }, openness: { min: 4 } },
    title: "Shelter of Shared Shade",
    art: "council",
    text: "Through patience, open groves, and unyielding grace, the Verdane turn our fiercest adversary into a sworn ally, uniting rival worlds beneath a single peaceful canopy.",
    outcome: "rivalBecomesAlly",
    choices: [
      {
        label: "Extend the living bough",
        result: "Former foes lay down their torches and join the Verdane in enduring fellowship.",
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "money", amount: 310 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-end-iron-thorn-hegemony",
    raceId: "verdane",
    needs: { mercy: { max: -5 }, openness: { max: -3 } },
    needsFlags: ["exiled-grove-twin"],
    title: "The Strangling Briar",
    art: "crisis",
    text: "Hardened by scorched-earth purges, ruthless salvage, and unforgiving exile laws, the Verdane become feared across every star-lane—none dare provoke our iron thorns.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Let the thorns guard our borders",
        result: "Neighboring fleets steer clear of Verdane space as our bio-foundries roar unchallenged.",
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "research", field: "weapons", amount: 340 },
        ],
      },
    ],
  },
  {
    id: "saga-verdane-end-radiant-bloom",
    raceId: "verdane",
    title: "The Eternal Summer",
    art: "victory",
    text: "Rooted in bright starlight and steady wisdom, the Verdane enter a radiant golden age of lush terraformed worlds, thriving groves, and serene prosperity.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Turn our leaves to the sun",
        result: "Endless blossoms and peaceful trade usher in a bright era of Verdane flourishing.",
        effects: [
          { kind: "money", amount: 330 },
          { kind: "culture", amount: 200 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
];
