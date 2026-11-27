// thraal saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-thraal-1-hollow-vein",
    raceId: "thraal",
    act: 1,
    kind: "act",
    title: "The Singing Basalt",
    art: "ruins",
    text: "Deep inside an open-pit quarry on {colony}, stone-cutters uncover a seam of iridescent crystal that resonates with the slow ancestral hum of the Thraal Core-Mantle.",
    choices: [
      {
        label: "Leave the seam uncut as a quiet meditation chamber",
        result: "Preserving the living crystal steadies stone-kin spirit and deepens ancient memory across {colony}.",
        shift: { tradition: 2, mercy: 1 },
        sets: ["preserved-singing-basalt"],
        effects: [
          { kind: "culture", amount: 115 },
          { kind: "morale", amount: 4 },
          { kind: "factories", amount: -3 },
        ],
      },
      {
        label: "Mine the resonance crystals for hull-plating",
        result: "Quarrying the vein boosts construction metallurgy and coin on {colony}, though elders mourn the silenced stone.",
        shift: { tradition: -2, mercy: -1 },
        sets: ["mined-singing-basalt"],
        effects: [
          { kind: "research", field: "construction", amount: 210 },
          { kind: "money", amount: 160 },
          { kind: "culture", amount: -50 },
        ],
      },
      {
        label: "Invite soft-skinned scholars from {star} to study its hum",
        result: "Sharing our lithic acoustic lore fascinates neighboring researchers and warms diplomatic ties.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "relations", amount: 15 },
          { kind: "research", field: "forceFields", amount: 170 },
          { kind: "money", amount: -80 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-1-hungry-settlers",
    raceId: "thraal",
    act: 1,
    kind: "act",
    title: "The Ash-Plain Claim",
    art: "contact",
    text: "While Thraal masons carve terraced vaults into a barren world near {star}, desperate colonists from the {rival} land on the frozen polar ridge, begging for geothermal shelter.",
    choices: [
      {
        label: "Carve heated basalt domes for the {rival} refugees",
        result: "Sharing stone and warmth wins enduring gratitude from the {rival} without slowing our deep-crust work.",
        shift: { mercy: 2, openness: 2 },
        sets: ["sheltered-rival-settlers"],
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 95 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Claim the entire crust and escort them off-world",
        result: "Uncontested mineral rights accelerate {colony}'s foundries while the {rival} departs in bitter cold.",
        shift: { mercy: -2, openness: -1 },
        sets: ["expelled-rival-settlers"],
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "money", amount: 150 },
          { kind: "relations", amount: -15 },
        ],
      },
      {
        label: "Trade polar drilling rights for {rival} greenhouse seeds",
        result: "Exchanging rock-work for surface hydroponics expands usable living space on {colony}.",
        shift: { openness: 1, mercy: 1 },
        effects: [
          { kind: "planetSize", amount: 3 },
          { kind: "relations", amount: 10 },
          { kind: "money", amount: -70 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-1-slow-kiln",
    raceId: "thraal",
    act: 1,
    kind: "act",
    title: "The Century Kiln",
    art: "anomaly",
    text: "Thraal brood-shapers on {colony} propose superheating the central magma kilns to bake new stone-kin in half the usual decades, warning that rushed cooling leaves brittle joints.",
    choices: [
      {
        label: "Keep the slow, patient firing of the ancients",
        result: "Unrushed stone-craft yields enduring artisans and serene civic pride on {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 105 },
          { kind: "morale", amount: 4 },
          { kind: "population", amount: -1 },
        ],
      },
      {
        label: "Fire the rapid kilns to swell our labor ranks",
        result: "Fresh cohorts pour from the magma bays onto {colony}'s work-floors, though brittle elders groan.",
        shift: { tradition: -2, mercy: -1 },
        effects: [
          { kind: "population", amount: 3 },
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Test hybrid thermal-lane cooling near {star}",
        result: "Controlled heat-exchange experiments advance planetology and steady foundry output.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "research", field: "planetology", amount: 200 },
          { kind: "factories", amount: 4 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-thraal-2-comet-shepherds",
    raceId: "thraal",
    act: 2,
    kind: "act",
    title: "The Iron Wanderer",
    art: "anomaly",
    text: "A dense nickel-iron planetoid drifts along a gravity lane near {star}, rich enough to feed {colony}'s mineral-grazing clans for centuries if hauled into low orbit.",
    choices: [
      {
        label: "Anchor the planetoid gently into stable grazing orbit",
        result: "Patient orbital tugging brings abundant ore and steady population growth to {colony}.",
        shift: { tradition: 1, mercy: 1 },
        effects: [
          { kind: "planetSize", amount: 4 },
          { kind: "population", amount: 3 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "Crack it immediately with heavy demolition charges",
        result: "Instant ore showers supercharge {colony}'s factories and vaults, showering dust across coastal settlements.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "factories", amount: 9 },
          { kind: "money", amount: 220 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Co-mine the asteroid with {rival} ore-haulers",
        result: "Splitting the metallic windfall strengthens lane commerce and warms ties with the {rival}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "money", amount: 240 },
          { kind: "relations", amount: 16 },
          { kind: "factories", amount: 4 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-2-pebble-born",
    raceId: "thraal",
    act: 2,
    kind: "act",
    title: "The Sand-Grain Movement",
    art: "council",
    text: "Younger Thraal born on orbital shipyards above {colony} argue that slow, century-long stone-council deliberations cannot keep pace with fast-breeding soft-skin empires near {star}.",
    choices: [
      {
        label: "Grant rapid-voice seats to young shipyard clans",
        result: "Quickened council procedures boost fleet propulsion research on {colony}, though traditionalists bristle.",
        shift: { tradition: -2, openness: 1 },
        sets: ["empowered-young-clans"],
        effects: [
          { kind: "research", field: "propulsion", amount: 250 },
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Uphold the Decade-Deliberation of the Bedrock Elders",
        result: "Measured, unhurried wisdom keeps {colony}'s civic bedrock unshakeable and deepens cultural pride.",
        shift: { tradition: 2, openness: -1 },
        sets: ["upheld-bedrock-elders"],
        effects: [
          { kind: "culture", amount: 135 },
          { kind: "morale", amount: 5 },
          { kind: "research", field: "propulsion", amount: -80 },
        ],
      },
      {
        label: "Send young reformists to chart distant gravity lanes",
        result: "Restless energy turns outward, mapping new systems around {star} without fracturing council peace.",
        shift: { openness: 2, tradition: 1 },
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "ships", template: "scout", count: 2 },
          { kind: "money", amount: -120 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-2-golem-soldiers",
    raceId: "thraal",
    act: 2,
    kind: "act",
    title: "Unthinking Granite",
    art: "crisis",
    text: "Foundry engineers on {colony} propose carving semi-sentient basalt automata to guard border outposts near {star}, sparing slow-growing Thraal citizens from frontline attrition.",
    choices: [
      {
        label: "Commission legions of silent stone-automata",
        result: "Tireless granite sentinels fortify {colony}'s yards and save lives, though elders call them soulless mockery.",
        shift: { tradition: -2, mercy: 1 },
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "research", field: "construction", amount: 220 },
          { kind: "culture", amount: -80 },
        ],
      },
      {
        label: "Forbid carving false life from sacred bedrock",
        result: "Reverence for living stone strengthens spiritual unity and morale across {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: 5 },
          { kind: "factories", amount: -3 },
        ],
      },
      {
        label: "Sell non-sentient heavy mining walkers to neighbors",
        result: "Exporting rugged Thraal machinery fills {colony}'s vaults without crossing sacred thresholds.",
        shift: { openness: 2, tradition: 1 },
        effects: [
          { kind: "money", amount: 250 },
          { kind: "relations", amount: 14 },
          { kind: "culture", amount: 60 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-thraal-3-cracked-monolith",
    raceId: "thraal",
    act: 3,
    kind: "act",
    title: "The Shattered Covenant-Stone",
    art: "crisis",
    text: "Border artillery from the {rival} shatters an ancient boundary monolith near {star}—a sacred stone bearing three millennia of carved Thraal treaties and lineage names.",
    choices: [
      {
        label: "Demand full stone-price in blood and bombardment",
        result: "Relentless orbital retaliation breaks {rival} bastions near {star} and rally-chants echo across {colony}.",
        shift: { mercy: -2, tradition: 2 },
        sets: ["avenged-covenant-stone"],
        effects: [
          { kind: "research", field: "weapons", amount: 280 },
          { kind: "morale", amount: 6 },
          { kind: "relations", amount: -22 },
        ],
      },
      {
        label: "Gather the shards into a new joint memorial",
        result: "Forgiving the desecration astonishes the {rival} and transforms broken rock into a symbol of peace.",
        shift: { mercy: 2, openness: 2 },
        sets: ["forgave-covenant-stone"],
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "culture", amount: 145 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Grind the rubble into fortified harbor walls",
        result: "Turning sacred fragments into practical seawalls speeds construction while chilling traditionalist masons.",
        shift: { tradition: -2, mercy: -1 },
        sets: ["avenged-covenant-stone"],
        effects: [
          { kind: "factories", amount: 9 },
          { kind: "research", field: "construction", amount: 250 },
          { kind: "culture", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-3-soft-skin-guests",
    raceId: "thraal",
    act: 3,
    kind: "act",
    title: "The Breath-Domes",
    art: "contact",
    text: "Air-breathing merchants and scholars from neighboring empires petition to build pressurized glass domes atop {colony}'s basalt mesas, warning that unsealed Thraal quarries fill the sky with silicate dust.",
    choices: [
      {
        label: "Curtail open-pit blasting to keep their skies clear",
        result: "Clean mountain air draws thriving off-world trade to {colony}, though heavy quarry output slows.",
        shift: { openness: 2, mercy: 2 },
        sets: ["welcomed-surface-domes"],
        effects: [
          { kind: "money", amount: 260 },
          { kind: "relations", amount: 18 },
          { kind: "factories", amount: -5 },
        ],
      },
      {
        label: "Keep the quarries roaring—outsiders adapt or leave",
        result: "Unchecked stone-harvesting supercharges {colony}'s factories while foreign traders pack their hulls.",
        shift: { openness: -2, mercy: -1 },
        sets: ["closed-surface-domes"],
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Carve subterranean air-vaults beneath the mesas",
        result: "Engineering sealed cavern-cities satisfies both guest breathing needs and Thraal masonry pride.",
        shift: { openness: 1, tradition: 1 },
        sets: ["welcomed-surface-domes"],
        effects: [
          { kind: "planetSize", amount: 4 },
          { kind: "culture", amount: 120 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-3-molten-schism",
    raceId: "thraal",
    act: 3,
    kind: "act",
    title: "The Cinder-Caste",
    art: "anomaly",
    text: "Deep-core miners on {colony} who spend centuries beside planetary magma vents evolve glowing obsidian hides and fiery tempers, demanding recognition as a distinct fourth caste.",
    choices: [
      {
        label: "Inscribe the Cinder-Caste into the Great Bedrock",
        result: "Honoring living evolution revitalizes {colony}'s foundries and morale, though purist clans grumble.",
        shift: { openness: 2, tradition: -2 },
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: -60 },
        ],
      },
      {
        label: "Deny separate caste status—all Thraal are one stone",
        result: "Upholding ancient three-caste unity preserves spiritual harmony across {colony}'s oldest temples.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "morale", amount: 3 },
          { kind: "factories", amount: -4 },
        ],
      },
      {
        label: "Assign Cinder-Clans to terraform volcanic worlds near {star}",
        result: "Heat-forged artisans thrive on scorching planets, expanding habitable crust across the frontier.",
        shift: { mercy: 1, tradition: -1 },
        effects: [
          { kind: "planetSize", amount: 5 },
          { kind: "research", field: "planetology", amount: 240 },
          { kind: "money", amount: -150 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-thraal-4-world-anvil",
    raceId: "thraal",
    act: 4,
    kind: "act",
    title: "The Living Mantle",
    art: "victory",
    text: "With seismic resonators ringing in unison from {colony} to {star}, Master Masons prepare to reshape entire planetary crusts into self-repairing fortress-continents.",
    choices: [
      {
        label: "Encase every Thraal world in armored basalt",
        result: "Impenetrable tectonic bastions make our colonies unassailable and double heavy industry.",
        shift: { openness: -2, tradition: 1 },
        effects: [
          { kind: "factories", amount: 14 },
          { kind: "research", field: "construction", amount: 380 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Sculpt vast terraced gardens for all species",
        result: "Transforming barren rock into lush, multi-species sanctuaries wins galactic acclaim.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "planetSize", amount: 7 },
          { kind: "relations", amount: 24 },
          { kind: "culture", amount: 200 },
        ],
      },
      {
        label: "Channel mantle-tap power into deep-space relays",
        result: "Tectonic generators supercharge starlane beacons and pour transit coin into {colony}.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 370 },
          { kind: "money", amount: 360 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-4-eternal-arbiter",
    raceId: "thraal",
    act: 4,
    kind: "act",
    title: "The Stone Scale",
    art: "council",
    text: "Exhausted by centuries of broken treaties among short-lived empires, delegates from the {rival} and neighboring worlds ask the Thraal to serve as permanent, incorruptible treaty-keepers near {star}.",
    choices: [
      {
        label: "Accept the sacred duty of Galactic Arbiter",
        result: "Carving interstellar law into Thraal monoliths elevates our cultural authority across every star.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 22 },
          { kind: "money", amount: -180 },
        ],
      },
      {
        label: "Refuse—flesh-empires must learn their own patience",
        result: "Turning inward shields {colony} from foreign quarrels and strengthens domestic resolve.",
        shift: { openness: -2, tradition: 1 },
        effects: [
          { kind: "morale", amount: 7 },
          { kind: "factories", amount: 10 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Charge bullion escrow fees for guaranteed enforcement",
        result: "Backing treaties with Thraal dreadnoughts and escrow vaults fills {colony}'s treasury.",
        shift: { mercy: -1, openness: 1 },
        effects: [
          { kind: "money", amount: 420 },
          { kind: "research", field: "weapons", amount: 310 },
          { kind: "culture", amount: -80 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-4-sleeping-mountain",
    raceId: "thraal",
    act: 4,
    kind: "act",
    title: "The First Boulder",
    art: "supernova",
    text: "Deep beneath {colony}'s oldest canyon, the founding First-Elders—who entered thousand-year lithic slumber before spaceflight—begin stirring as orbital starships thunder overhead.",
    choices: [
      {
        label: "Wake them with full ancestral honors",
        result: "Ancient geological wisdom steadies every clan on {colony} and enriches our heritage.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "morale", amount: 8 },
          { kind: "research", field: "planetology", amount: 300 },
        ],
      },
      {
        label: "Let them sleep while younger masons chart the stars",
        result: "Unburdened by ancient taboos, progressive engineers push propulsion and force-fields forward.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 360 },
          { kind: "research", field: "forceFields", amount: 340 },
          { kind: "culture", amount: -90 },
        ],
      },
      {
        label: "Invite off-world envoys to witness their awakening",
        result: "Sharing our living history with awe-struck visitors builds lasting cross-species reverence.",
        shift: { openness: 2, tradition: 1 },
        effects: [
          { kind: "relations", amount: 22 },
          { kind: "culture", amount: 190 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-thraal-branch-living-crystal",
    raceId: "thraal",
    act: 2,
    kind: "branch",
    needs: ["preserved-singing-basalt"],
    blockedBy: ["mined-singing-basalt"],
    title: "The Deep Resonance",
    art: "ruins",
    text: "Left intact in {colony}'s quiet quarry, the singing basalt vein begins harmonizing with tectonic tremors across {star}, guiding Thraal seismic-listeners toward hidden mineral pockets.",
    choices: [
      {
        label: "Follow the crystal song to untouched ore veins",
        result: "Guided by living resonance, masons open rich caverns without scarring sacred bedrock.",
        shift: { tradition: 1, mercy: 1 },
        effects: [
          { kind: "planetSize", amount: 4 },
          { kind: "money", amount: 180 },
          { kind: "culture", amount: 90 },
        ],
      },
      {
        label: "Record its harmonic frequencies for shield arrays",
        result: "Translating crystal vibrations into energy harmonics strengthens force-field research on {colony}.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 250 },
          { kind: "factories", amount: 5 },
          { kind: "money", amount: -100 },
        ],
      },
      {
        label: "Build an acoustic sanctuary around the seam",
        result: "Pilgrims from every Thraal clan gather to meditate in the crystal's steady hum.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -120 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-branch-polar-hearth",
    raceId: "thraal",
    act: 2,
    kind: "branch",
    needs: ["sheltered-rival-settlers"],
    blockedBy: ["expelled-rival-settlers"],
    title: "The Warm Ridge",
    art: "contact",
    text: "Thriving inside the heated basalt domes we carved near {star}, colonists from the {rival} offer to share cold-weather hydro-engineering that could thaw frozen basins on {colony}.",
    choices: [
      {
        label: "Partner with them to thaw {colony}'s frozen basins",
        result: "Joint stone-and-water engineering expands habitable valleys and deepens trust with the {rival}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "planetSize", amount: 4 },
          { kind: "relations", amount: 18 },
          { kind: "research", field: "planetology", amount: 210 },
        ],
      },
      {
        label: "Accept trade bullion in place of joint crews",
        result: "Keeping {colony}'s quarries exclusively Thraal preserves tradition while filling our treasury.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "money", amount: 240 },
          { kind: "culture", amount: 95 },
          { kind: "relations", amount: -6 },
        ],
      },
      {
        label: "Grant their settlement permanent charter protection",
        result: "Inscribing their domes into Thraal stone-law wins admiration across the border.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "culture", amount: 130 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-branch-swift-council",
    raceId: "thraal",
    act: 3,
    kind: "branch",
    needs: ["empowered-young-clans"],
    blockedBy: ["upheld-bedrock-elders"],
    title: "The Pebble Fleet",
    art: "anomaly",
    text: "Empowered on {colony}'s council, young shipyard clans unveil agile, lightly armored granite cutters designed to outmaneuver fast soft-skin raiders around {star}.",
    choices: [
      {
        label: "Mass-produce the agile cutter squadrons",
        result: "Swift stone-hulls patrol distant lanes and sharpen propulsion mastery across {colony}.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 290 },
          { kind: "ships", template: "scout", count: 2 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Reinforce the designs with traditional heavy basalt",
        result: "Blending youthful speed with ancestral armor delights both shipwrights and elders.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "research", field: "construction", amount: 260 },
          { kind: "factories", amount: 7 },
          { kind: "morale", amount: 4 },
        ],
      },
      {
        label: "Lease fast courier cutters to neutral merchants",
        result: "Reliable Thraal freighters dominate regional lane traffic and swell {colony}'s coin reserves.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "money", amount: 280 },
          { kind: "relations", amount: 15 },
          { kind: "culture", amount: -50 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-branch-blood-quarry",
    raceId: "thraal",
    act: 4,
    kind: "branch",
    needs: ["avenged-covenant-stone"],
    blockedBy: ["forgave-covenant-stone"],
    title: "The Grudge-Wall",
    art: "crisis",
    text: "Carving the names of every broken {rival} truce into a towering obsidian cliff on {colony}, vengeful stone-wardens demand permanent border fortifications and retaliatory tariffs near {star}.",
    choices: [
      {
        label: "Raise the Obsidian Bastions along every border",
        result: "Impenetrable gun-monoliths lock down our frontier and harden weapons doctrine on {colony}.",
        shift: { mercy: -2, openness: -2 },
        effects: [
          { kind: "research", field: "weapons", amount: 360 },
          { kind: "factories", amount: 11 },
          { kind: "relations", amount: -22 },
        ],
      },
      {
        label: "Carve a final line closing the ancient feud",
        result: "Declaring the debt paid in full lifts a heavy weight from {colony} and eases border dread.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "morale", amount: 6 },
          { kind: "culture", amount: 150 },
        ],
      },
      {
        label: "Turn the Grudge-Wall into an armored orbital dock",
        result: "Channeling vengeance into relentless shipbuilding expands {colony}'s industrial might.",
        shift: { tradition: -1, mercy: -1 },
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "money", amount: 290 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-branch-mesa-bazaar",
    raceId: "thraal",
    act: 4,
    kind: "branch",
    needs: ["welcomed-surface-domes"],
    blockedBy: ["closed-surface-domes"],
    title: "The Glass Mesas",
    art: "victory",
    text: "Beneath {colony}'s clear skies, the pressurized glass domes have blossomed into a famed interstellar crossroads where soft-skin diplomats marvel at Thraal stone-craft near {star}.",
    choices: [
      {
        label: "Charter the Mesas as a permanent free-trade hub",
        result: "Interstellar merchants flood {colony} with bullion and warm goodwill across every border.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "money", amount: 410 },
          { kind: "relations", amount: 22 },
          { kind: "culture", amount: 160 },
        ],
      },
      {
        label: "Open a joint school of lithic architecture",
        result: "Teaching off-world builders how to fuse living rock with glass crowns Thraal cultural prestige.",
        shift: { openness: 2, tradition: 1 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "research", field: "construction", amount: 340 },
          { kind: "morale", amount: 6 },
        ],
      },
      {
        label: "Expand subterranean vaults to house growing guests",
        result: "Vast multi-climate caverns turn {colony} into a thriving cosmopolitan metropolis.",
        shift: { mercy: 2, tradition: -1 },
        effects: [
          { kind: "planetSize", amount: 6 },
          { kind: "population", amount: 4 },
          { kind: "money", amount: -240 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-thraal-end-iron-monolith",
    raceId: "thraal",
    needs: { mercy: { max: -4 }, openness: { max: -3 } },
    title: "The Unyielding Avalanche",
    art: "crisis",
    text: "Cold as deep bedrock and sealed behind armored basalt bastions, the Thraal grind across barren frontiers without mercy—inspiring silent dread in every short-lived empire that crosses their path.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Stand immovable as the mountain",
        result: "Rival fleets keep a fearful distance from Thraal fortress-worlds.",
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "research", field: "construction", amount: 360 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-end-fractured-strata",
    raceId: "thraal",
    needs: { tradition: { max: -4 }, mercy: { max: -3 } },
    title: "The Fault-Line Schism",
    art: "crisis",
    text: "Shattering ancient stone-law while driving clans with ruthless quarry quotas fractures the Thraal from within, as rebellious cinder-clans and outer colonies split away in seismic civil war.",
    outcome: "civilWar",
    choices: [
      {
        label: "Meet the rebel clans in the deep",
        result: "Tectonic tremors tear across {colony} as stone-kin turn against stone-kin.",
        effects: [
          { kind: "research", field: "weapons", amount: 300 },
          { kind: "morale", amount: -8 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-end-covenant-of-stone",
    raceId: "thraal",
    needs: { openness: { min: 4 }, mercy: { min: 4 } },
    title: "The Cornerstone Alliance",
    art: "council",
    text: "By carving warm shelter for strangers and keeping every oath unbreakable, the Thraal win the deepest trust of short-lived species—binding their fiercest rival into an alliance meant to outlast stars.",
    outcome: "rivalBecomesAlly",
    choices: [
      {
        label: "Carve our names together in granite",
        result: "Former rivals stand beside the Thraal in an enduring bond of mutual trust.",
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 25 },
        ],
      },
    ],
  },
  {
    id: "saga-thraal-end-eternal-bedrock",
    raceId: "thraal",
    title: "The Patient Garden",
    art: "victory",
    text: "Rooted in ancient geological wisdom yet open to slow, steady growth, the Thraal enter a tranquil golden age of sculpted mountain cities, unshakeable peace, and enduring abundance.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Endure through the ages",
        result: "Terraced valleys and gleaming monoliths flourish in timeless harmony across every Thraal world.",
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "planetSize", amount: 5 },
          { kind: "morale", amount: 8 },
        ],
      },
    ],
  },
];
