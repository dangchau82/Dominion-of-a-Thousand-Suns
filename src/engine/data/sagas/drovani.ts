// Drovani saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-drovani-1-thermal-vent",
    raceId: "drovani",
    act: 1,
    kind: "act",
    title: "The Boiling Choir",
    art: "anomaly",
    text: "Deep-sea bathyspheres beneath {colony} discover an abyssal hydrothermal fissure pulsing with harmonic pressure waves that accelerate kelp-spore maturation while corroding metal hull plates.",
    choices: [
      {
        label: "Cultivate living coral-hull bio-yards around the vent",
        result: "Organic hull-growing cradles flourish in the warm brine, boosting planetology models and population growth.",
        shift: { tradition: 1, mercy: 1 },
        sets: ["grew-vent-coral-yards"],
        effects: [
          { kind: "population", amount: 3 },
          { kind: "research", field: "planetology", amount: 190 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Tap the thermal plume for heavy smelting turbines",
        result: "Superheated generators drive foundry output skyward on {colony}, though scalding runoff bleaches nearby reefs.",
        shift: { tradition: -1, mercy: -1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "money", amount: 150 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Declare the fissure a sacred ancestral nursery",
        result: "Reverent stewardship of the warm deep strengthens Drovani tidal songs and civic contentment.",
        shift: { tradition: 2 },
        effects: [
          { kind: "culture", amount: 105 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -80 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-1-dry-skin-visitors",
    raceId: "drovani",
    act: 1,
    kind: "act",
    title: "The Floating Pier",
    art: "contact",
    text: "Independent dry-land traders orbiting {star} request permission to anchor a surface pontoon-market above {colony}'s equatorial sea, warning that submerged docks crush their hulls.",
    choices: [
      {
        label: "Build a grand floating harbor for surface guests",
        result: "Welcoming air-breathers to sun-lit pontoons brings lively trade and fresh star-charts to {colony}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: 170 },
          { kind: "culture", amount: 75 },
        ],
      },
      {
        label: "Restrict outsiders to high-orbit cargo drops",
        result: "Keeping dry-worlders away from our sacred waves preserves Drovani tranquility and domestic focus.",
        shift: { openness: -2, tradition: 1 },
        effects: [
          { kind: "morale", amount: 4 },
          { kind: "factories", amount: 5 },
          { kind: "relations", amount: -10 },
        ],
      },
      {
        label: "Sell pressurized diving suits for seabed tours",
        result: "Curious visitors pay handsomely to marvel at our bioluminescent cities without disturbing reef routines.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "money", amount: 210 },
          { kind: "culture", amount: 85 },
          { kind: "morale", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-1-tide-wall",
    raceId: "drovani",
    act: 1,
    kind: "act",
    title: "The Brine-Lock Rift",
    art: "crisis",
    text: "Rapid underwater city expansion on {colony} disrupts deep-ocean salinity currents, threatening either to starve surface archipelagos or flood ancient shelf-caves.",
    choices: [
      {
        label: "Divert currents to save the populated reefs",
        result: "Protecting crowded family shoals wins heartfelt gratitude across {colony}, though ancient carvings erode.",
        shift: { mercy: 2, tradition: -1 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "population", amount: 3 },
          { kind: "culture", amount: -60 },
        ],
      },
      {
        label: "Channel brines around the ancestral cave-shrines",
        result: "Preserving millennia-old tide-carvings uplifts Drovani heritage, though outer kelp farms thin out.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "morale", amount: 3 },
          { kind: "population", amount: -1 },
        ],
      },
      {
        label: "Construct automated tidal regulator locks",
        result: "Precision hydro-engineering balances both currents while advancing construction science.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "research", field: "construction", amount: 200 },
          { kind: "planetSize", amount: 3 },
          { kind: "money", amount: -150 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-drovani-2-pelagic-harvest",
    raceId: "drovani",
    act: 2,
    kind: "act",
    title: "The Leviathan Drift",
    art: "anomaly",
    text: "Colossal, slow-singing filter-whales migrate through the sea-lanes of {colony}, carrying rare bio-luminous pearls in their mantle folds that could revolutionize force-field lenses.",
    choices: [
      {
        label: "Follow the migration and gather shed pearls",
        result: "Patient coexistence yields modest optical breakthroughs while deepening Drovani reverence for oceanic life.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "research", field: "forceFields", amount: 180 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Harpoon the elders for immediate lens extraction",
        result: "Harvesting intact glands supercharges shield research and bullion reserves, though grieving songs echo across {colony}.",
        shift: { mercy: -2, tradition: -2 },
        effects: [
          { kind: "research", field: "forceFields", amount: 280 },
          { kind: "money", amount: 220 },
          { kind: "morale", amount: -7 },
        ],
      },
      {
        label: "Invite xenobiologists from the {rival} to study them",
        result: "Joint marine expeditions turn the migration into a bridge of goodwill with the {rival}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "research", field: "planetology", amount: 210 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-2-shallow-colony",
    raceId: "drovani",
    act: 2,
    kind: "act",
    title: "The Dust-Lung Petition",
    art: "council",
    text: "Because Drovani thrive effortlessly in vast ocean worlds, pioneers assigned to arid frontier outposts near {star} petition to abandon dry rocks and concentrate all settlers in deep-sea domes.",
    choices: [
      {
        label: "Fund moisture-suits and atmospheric condensers",
        result: "Supporting brave dry-world colonists expands our operational reach and construction craft.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "research", field: "construction", amount: 230 },
          { kind: "factories", amount: 6 },
          { kind: "money", amount: -170 },
        ],
      },
      {
        label: "Recall them to deepen {colony}'s ocean tiers",
        result: "Expanding multi-layered abyssal cities swells our population and reinforces aquatic pride.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "planetSize", amount: 5 },
          { kind: "population", amount: 4 },
          { kind: "culture", amount: 95 },
        ],
      },
      {
        label: "Lease the dry outposts to the {rival} for ocean access",
        result: "Trading arid rocks for diplomatic favor enriches our vaults without straining Drovani gills.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "money", amount: 200 },
          { kind: "morale", amount: 3 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-2-sunken-wreck",
    raceId: "drovani",
    act: 2,
    kind: "act",
    title: "The Silent Hull in the Trench",
    art: "ruins",
    text: "Sonar sweeps near {star} locate a pristine warship of the {rival} resting intact in an icy abyssal trench, complete with encrypted tactical cores and surviving crew in emergency air-pockets.",
    choices: [
      {
        label: "Rescue the trapped crew and return the ship",
        result: "Saving drowning rivals stuns the {rival} into warm gratitude and elevates Drovani honor.",
        shift: { mercy: 2, openness: 2 },
        sets: ["rescued-rival-submariners"],
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "culture", amount: 135 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "Flood the air-pockets and strip the tactical cores",
        result: "Ruthless salvage yields weapons and computer telemetry while leaving zero witnesses.",
        shift: { mercy: -2, openness: -2 },
        effects: [
          { kind: "research", field: "weapons", amount: 240 },
          { kind: "research", field: "computers", amount: 200 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Rescue the crew but keep the hull as salvage",
        result: "Mercy for sailors paired with strict maritime salvage law balances honor and profit.",
        shift: { mercy: 1, tradition: 1 },
        effects: [
          { kind: "money", amount: 190 },
          { kind: "relations", amount: 6 },
          { kind: "morale", amount: 3 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-drovani-3-abyssal-quake",
    raceId: "drovani",
    act: 3,
    kind: "act",
    title: "The Trench Collapse",
    art: "crisis",
    text: "Deep-core geothermal taps beneath {colony} trigger a seafloor fault slide, threatening to crush three domed coral-cities unless we flood the lower industrial foundry-caverns.",
    choices: [
      {
        label: "Flood the foundries to cushion the cities",
        result: "Sacrificing heavy smelting domes saves tens of thousands of Drovani lives and strengthens communal devotion.",
        shift: { mercy: 2, tradition: 1 },
        sets: ["flooded-foundries-for-cities"],
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "culture", amount: 130 },
          { kind: "factories", amount: -6 },
        ],
      },
      {
        label: "Seal the bulkheads and save the heavy foundries",
        result: "Protecting industrial output keeps warship assembly humming on {colony} while flooded outer towns grieve.",
        shift: { mercy: -2, tradition: -1 },
        sets: ["sealed-bulkheads-for-foundries"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "research", field: "construction", amount: 250 },
          { kind: "population", amount: -3 },
        ],
      },
      {
        label: "Vent the magma pressure toward {rival} listening buoys",
        result: "Redirecting tectonic shockwaves shatters the {rival}'s frontier hydro-probes near {star}, sparing {colony} at diplomatic cost.",
        shift: { mercy: -1, openness: -2 },
        sets: ["sealed-bulkheads-for-foundries"],
        effects: [
          { kind: "planetSize", amount: 4 },
          { kind: "research", field: "weapons", amount: 220 },
          { kind: "relations", amount: -18 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-3-tide-song-schism",
    raceId: "drovani",
    act: 3,
    kind: "act",
    title: "The Unsung Current",
    art: "council",
    text: "Star-born Drovani raised aboard orbital habitats near {star} refuse to return to {colony} for the mandatory Tide-Spawning Rite, claiming deep ocean pressure feels like a suffocating cage.",
    choices: [
      {
        label: "Bless orbital spawning pools as true Drovani seas",
        result: "Adapting ancestral rites to zero-gravity water spheres unites starfarers and reef-dwellers in fresh confidence.",
        shift: { tradition: -2, openness: 2 },
        sets: ["blessed-orbital-spawning"],
        effects: [
          { kind: "population", amount: 4 },
          { kind: "research", field: "propulsion", amount: 240 },
          { kind: "culture", amount: -100 },
        ],
      },
      {
        label: "Enforce the ancestral pilgrimage to {colony}'s deeps",
        result: "Preserving unbroken ocean heritage deepens Drovani cultural pride, though orbital crews resent the decree.",
        shift: { tradition: 2, openness: -1 },
        sets: ["enforced-abyssal-pilgrimage"],
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 4 },
          { kind: "factories", amount: -4 },
        ],
      },
      {
        label: "Send elder tide-singers to conduct rites in orbit",
        result: "Bringing sacred ocean water to orbital ships honors heritage without halting frontier expansion.",
        shift: { tradition: 1, mercy: 1 },
        sets: ["enforced-abyssal-pilgrimage"],
        effects: [
          { kind: "culture", amount: 95 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -150 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-3-pelagic-blockade",
    raceId: "drovani",
    act: 3,
    kind: "act",
    title: "The Warm-Current Dispute",
    art: "crisis",
    text: "A fleet from the {rival} anchors orbital solar-mirrors above a disputed ocean world near {star}, threatening to boil its upper seas unless we cede mineral rights.",
    choices: [
      {
        label: "Propose a shared ocean-surface treaty",
        result: "Dividing orbital industry from deep-sea reefs turns a looming flashpoint into profitable peace with the {rival}.",
        shift: { openness: 2, mercy: 2 },
        sets: ["signed-pelagic-treaty"],
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "money", amount: 210 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Launch submersible torpedoes to shatter their mirrors",
        result: "Sudden strikes from beneath the waves sweep the {rival} from orbit and rally fierce maritime pride.",
        shift: { mercy: -2, openness: -2 },
        sets: ["shattered-rival-mirrors"],
        effects: [
          { kind: "research", field: "weapons", amount: 270 },
          { kind: "morale", amount: 6 },
          { kind: "relations", amount: -20 },
        ],
      },
      {
        label: "Seed deep-sea bio-blooms to cloud the atmosphere",
        result: "Thick plankton clouds block their mirrors harmlessly while enriching planetary ecology.",
        shift: { tradition: 2, mercy: 1 },
        sets: ["signed-pelagic-treaty"],
        effects: [
          { kind: "planetSize", amount: 4 },
          { kind: "research", field: "planetology", amount: 220 },
          { kind: "relations", amount: -8 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-drovani-4-world-ocean",
    raceId: "drovani",
    act: 4,
    kind: "act",
    title: "The Genesis Tide",
    art: "supernova",
    text: "Planetary hydro-shapers on {colony} complete blueprints for comet-harvesting arrays capable of flooding arid worlds near {star} into endless, shimmering Drovani oceans.",
    choices: [
      {
        label: "Unleash the comet-rain across our worlds",
        result: "New pelagic seas bloom across barren crusts, multiplying Drovani living space and population.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "planetSize", amount: 8 },
          { kind: "population", amount: 5 },
          { kind: "money", amount: -340 },
        ],
      },
      {
        label: "Sell hydro-terraforming fleets to dry-world allies",
        result: "Sharing our mastery of water wins immense diplomatic favor and floods {colony}'s treasury with trade credit.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "relations", amount: 25 },
          { kind: "money", amount: 340 },
          { kind: "culture", amount: 180 },
        ],
      },
      {
        label: "Weaponize glacial comets as orbital siege-rams",
        result: "Turning ice-moons into kinetic dreadnoughts terrifies rivals and advances heavy weapons research.",
        shift: { mercy: -2, openness: -2 },
        effects: [
          { kind: "research", field: "weapons", amount: 410 },
          { kind: "factories", amount: 11 },
          { kind: "relations", amount: -22 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-4-abyssal-archive",
    raceId: "drovani",
    act: 4,
    kind: "act",
    title: "The Song of Ten Thousand Trenches",
    art: "council",
    text: "Acoustic relays linking every ocean world near {star} now carry Drovani whale-song instantaneously across light-years. Conclave elders on {colony} debate whom to invite into the Great Chorus.",
    choices: [
      {
        label: "Broadcast peace-harmonies to every known empire",
        result: "Soothing pelagic symphonies soften interstellar hostility and crown Drovani cultural diplomacy.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "culture", amount: 240 },
          { kind: "relations", amount: 24 },
          { kind: "money", amount: -240 },
        ],
      },
      {
        label: "Keep the Great Chorus strictly for Drovani blood",
        result: "An unbroken psychic-acoustic bond unites every reef-city in effortless industrial harmony.",
        shift: { tradition: 2, openness: -2 },
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "morale", amount: 8 },
          { kind: "culture", amount: 160 },
        ],
      },
      {
        label: "Modulate the relays into deep-space sonar",
        result: "Sweeping gravitational waves map hidden star clusters and sharpen computer telemetry.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "revealStars", count: 7 },
          { kind: "research", field: "computers", amount: 390 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },
  // Written by Claude 2 (Gemini's reply was cut off here).
  {
    id: "saga-drovani-4-starward-call",
    raceId: "drovani",
    act: 4,
    kind: "act",
    title: "The Call of the Dry Stars",
    art: "contact",
    text: "Young Drovani pilots born near {star} ask the Tide Conclave on {colony} whether our people belong only to the deep, or whether we were always meant to swim between the stars.",
    choices: [
      {
        label: "Build water-filled starships for every young pilot",
        result: "Whole schools of Drovani take to the void in sea-filled hulls, and the stars feel like a new ocean.",
        shift: { openness: 2, tradition: -2 },
        effects: [
          { kind: "research", field: "propulsion", amount: 380 },
          { kind: "ships", template: "scout", count: 2 },
          { kind: "money", amount: -260 },
        ],
      },
      {
        label: "Keep our people bound to the home seas",
        result: "The deep closes around {colony} like a blessing, and the old songs grow stronger than ever.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "morale", amount: 7 },
          { kind: "factories", amount: -4 },
        ],
      },
      {
        label: "Train pilots alongside the {rival}'s academies",
        result: "Drovani and {rival} cadets learn to fly side by side, and old suspicion washes away.",
        shift: { openness: 1, mercy: 2 },
        effects: [
          { kind: "relations", amount: 22 },
          { kind: "research", field: "propulsion", amount: 240 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-drovani-branch-coral-bloom",
    raceId: "drovani",
    act: 2,
    kind: "branch",
    needs: ["grew-vent-coral-yards"],
    title: "The Singing Reef",
    art: "anomaly",
    text: "The living coral-hull bio-yards we cultivated around {colony}'s thermal vent grow into a self-repairing reef fortress, weaving bioluminescent kelp-cables across the continental shelf.",
    choices: [
      {
        label: "Harvest bio-luminescent plates for fleet hulls",
        result: "Living coral armor boosts shipyard production and construction telemetry across {colony}.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "research", field: "construction", amount: 210 },
          { kind: "money", amount: -120 },
        ],
      },
      {
        label: "Open the reef-groves as healing sanctuaries",
        result: "Soothing mineral currents lift civic morale and expand thriving family settlements on {colony}.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "population", amount: 3 },
          { kind: "culture", amount: 115 },
        ],
      },
      {
        label: "Export coral-spore grafts to the {rival}",
        result: "Sharing living reef technology delights marine biologists of the {rival} and fills our vaults.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "money", amount: 210 },
          { kind: "culture", amount: 90 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-branch-salvaged-gratitude",
    raceId: "drovani",
    act: 3,
    kind: "branch",
    needs: ["rescued-rival-submariners"],
    title: "Debt of the Deep",
    art: "contact",
    text: "Grateful submariners from the {rival} whose lives we saved near {star} return with a delegation of shipwrights, offering to co-design deep-pressure hull plating for {colony}.",
    choices: [
      {
        label: "Accept the joint hull-engineering exchange",
        result: "Combining Drovani hydro-craft with {rival} metallurgy yields major construction and diplomatic gains.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "research", field: "construction", amount: 260 },
          { kind: "relations", amount: 18 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Ask instead for deep-space navigation charts",
        result: "Their star-pilots share distant sector routes while respecting our desire to keep yards independent.",
        shift: { openness: 1, tradition: 1 },
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "propulsion", amount: 220 },
          { kind: "culture", amount: 100 },
        ],
      },
      {
        label: "Decline gifts and uphold maritime chivalry",
        result: "Refusing payment for saving lives turns the tale into a beloved Drovani ballad across {colony}.",
        shift: { mercy: 2, tradition: 2 },
        effects: [
          { kind: "culture", amount: 155 },
          { kind: "morale", amount: 5 },
          { kind: "relations", amount: 10 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-branch-flooded-foundries",
    raceId: "drovani",
    act: 4,
    kind: "branch",
    needs: ["flooded-foundries-for-cities"],
    blockedBy: ["sealed-bulkheads-for-foundries"],
    title: "The Kelp-Draped Anvils",
    art: "ruins",
    text: "Decades after we flooded {colony}'s lower foundries to save our coral-cities, warm mineral waters have encrusted the drowned smelters with rare piezoelectric sea-crystals.",
    choices: [
      {
        label: "Harvest the crystals for force-field projectors",
        result: "Reclaiming the drowned halls yields startling shield breakthroughs without disturbing nearby reefs.",
        shift: { openness: 1, tradition: 1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 380 },
          { kind: "factories", amount: 8 },
          { kind: "money", amount: -220 },
        ],
      },
      {
        label: "Preserve the sunken foundries as a memorial reef",
        result: "Honoring the sacrifice that saved our cities fills {colony} with deep civic pride and unity.",
        shift: { mercy: 2, tradition: 2 },
        effects: [
          { kind: "culture", amount: 230 },
          { kind: "morale", amount: 8 },
          { kind: "money", amount: -180 },
        ],
      },
      {
        label: "Drain the caverns and restart heavy smelting",
        result: "Rebuilding industrial furnaces restores full manufacturing might, though reef-dwellers mourn the loss.",
        shift: { tradition: -2, mercy: -1 },
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "money", amount: 280 },
          { kind: "morale", amount: -5 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-branch-orbital-spawning",
    raceId: "drovani",
    act: 4,
    kind: "branch",
    needs: ["blessed-orbital-spawning"],
    blockedBy: ["enforced-abyssal-pilgrimage"],
    title: "The Zero-G Tide-Singers",
    art: "supernova",
    text: "Raised inside weightless water-spheres near {star}, the new generation of orbital Drovani develops an uncanny sense for three-dimensional gravity currents and stellar navigation.",
    choices: [
      {
        label: "Appoint orbital tide-singers to lead our fleets",
        result: "Star-born navigators revolutionize propulsion science and reveal distant uncharted systems.",
        shift: { openness: 2, tradition: -2 },
        effects: [
          { kind: "research", field: "propulsion", amount: 400 },
          { kind: "revealStars", count: 6 },
          { kind: "culture", amount: -110 },
        ],
      },
      {
        label: "Weave their zero-G songs into {colony}'s rituals",
        result: "Uniting abyssal and orbital harmonies creates a vibrant renaissance across every Drovani world.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "morale", amount: 7 },
          { kind: "population", amount: 3 },
        ],
      },
      {
        label: "Deploy them as deep-range colonial pathfinders",
        result: "Eager orbital clans launch fresh colony vessels toward distant ocean worlds.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "ships", template: "colony", count: 2 },
          { kind: "money", amount: -260 },
          { kind: "population", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-branch-pelagic-accord",
    raceId: "drovani",
    act: 4,
    kind: "branch",
    needs: ["signed-pelagic-treaty"],
    blockedBy: ["shattered-rival-mirrors"],
    title: "The Twin-Tier Harbor",
    art: "council",
    text: "Under the ocean-surface treaty near {star}, orbital merchants of the {rival} and abyssal Drovani harvesters build a bustling joint space-elevator anchored into {colony}'s seabed.",
    choices: [
      {
        label: "Expand the elevator into an interstellar freeport",
        result: "Shared maritime and orbital commerce floods {colony} with credit and cements warm friendship with the {rival}.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "relations", amount: 26 },
          { kind: "money", amount: 350 },
          { kind: "culture", amount: 180 },
        ],
      },
      {
        label: "Install covert sonar-taps along the tether",
        result: "Secretly monitoring every {rival} shuttle yields computer breakthroughs while risking diplomatic trust.",
        shift: { openness: -2, mercy: -2 },
        effects: [
          { kind: "research", field: "computers", amount: 390 },
          { kind: "factories", amount: 9 },
          { kind: "relations", amount: -20 },
        ],
      },
      {
        label: "Dedicate the harbor to joint marine research",
        result: "Combined planetology labs unlock rich terraforming insights for both empires.",
        shift: { openness: 1, mercy: 2 },
        effects: [
          { kind: "research", field: "planetology", amount: 380 },
          { kind: "planetSize", amount: 5 },
          { kind: "relations", amount: 16 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-drovani-end-tide-of-fellowship",
    raceId: "drovani",
    needs: { mercy: { min: 5 }, openness: { min: 4 } },
    title: "The Harbor of All Waters",
    art: "victory",
    text: "By greeting dry-worlders with open pontoons, rescuing drowning foes, and sharing the bounty of our seas, the Drovani turn our fiercest adversary into a lifelong friend.",
    outcome: "rivalBecomesAlly",
    choices: [
      {
        label: "Welcome them to the Great Reef",
        result: "Former rivals anchor beside our coral cities as sworn allies of the Drovani.",
        effects: [
          { kind: "culture", amount: 230 },
          { kind: "money", amount: 330 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-end-abyssal-dread",
    raceId: "drovani",
    needs: { mercy: { max: -4 }, openness: { max: -3 } },
    title: "The Crushing Depth",
    art: "crisis",
    text: "Striking without warning from dark trenches and hurling glacial moons from orbit, the Drovani become the silent terror beneath every wave—feared by every dry-land empire.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Sound the abyssal war-horn",
        result: "No surface fleet dares approach Drovani waters while our foundries roar beneath the sea.",
        effects: [
          { kind: "research", field: "weapons", amount: 400 },
          { kind: "factories", amount: 12 },
          { kind: "relations", amount: -25 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-end-pelagic-exodus",
    raceId: "drovani",
    needs: { openness: { min: 4 }, tradition: { max: -3 } },
    title: "The Endless Current",
    art: "supernova",
    text: "Freed from homebound trenches by orbital spawning spheres and star-born tide-singers, Drovani coral-arks ride the cosmic currents toward distant, untouched ocean clusters.",
    outcome: "exodus",
    choices: [
      {
        label: "Ride the outer tide into uncharted seas",
        result: "Countless new reefs bloom across distant stars as pilgrim fleets sail beyond the rim.",
        effects: [
          { kind: "revealStars", count: 8 },
          { kind: "research", field: "propulsion", amount: 380 },
          { kind: "population", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "saga-drovani-end-luminous-reef",
    raceId: "drovani",
    title: "The Singing Deep",
    art: "victory",
    text: "Harmonizing ancient tide-songs with thriving bioluminescent cities, {colony} enters a tranquil golden age where every trench and sunlit archipelago echoes with joyful song.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Raise the Great Tide-Chorus",
        result: "Bioluminescent reefs and thriving harbors usher in an eternal Drovani golden age.",
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "morale", amount: 8 },
          { kind: "population", amount: 4 },
        ],
      },
    ],
  },
];
