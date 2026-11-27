// kethrak saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-kethrak-1-pale-queen",
    raceId: "kethrak",
    act: 1,
    kind: "act",
    title: "The Albino Matriarch",
    art: "anomaly",
    text: "Beneath the root-vaults of {colony}, worker castes uncover a dormant chamber holding an ancient pale queen from before the Great Unison, pulsing with slow, unfamiliar pheromone chords.",
    choices: [
      {
        label: "Awaken her into the living chorus",
        result: "Her archaic memories enrich hive craft and brood instincts, though jarring harmonics unsettle young drones on {colony}.",
        shift: { tradition: 2, openness: 1 },
        sets: ["awakened-pale-queen"],
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "research", field: "planetology", amount: 170 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Seal the vault and dissolve the chamber",
        result: "Unbroken modern unity keeps {colony}'s spawning pools humming smoothly without archaic interference.",
        shift: { tradition: -2, openness: -1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: 4 },
          { kind: "culture", amount: -60 },
        ],
      },
      {
        label: "Harvest her royal jelly for larval growth",
        result: "Concentrated royal hormones trigger a swift wave of sturdy workers across {colony}'s lower galleries.",
        shift: { mercy: -1, tradition: -1 },
        effects: [
          { kind: "population", amount: 4 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-1-hollow-root",
    raceId: "kethrak",
    act: 1,
    kind: "act",
    title: "The Singing Shaft",
    art: "ruins",
    text: "Tunnel-borers driving deep beneath {colony} break into a natural subspace fissure leading toward {star}, where strange echoes mimic our own hive-song back at us.",
    choices: [
      {
        label: "Send scout-drones through the raw fissure",
        result: "Blind borers map adjacent star-lanes and tunnel currents before collapsing the unstable shaft.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "research", field: "propulsion", amount: 190 },
          { kind: "population", amount: -1 },
        ],
      },
      {
        label: "Plug the fissure with hardened chitin-resin",
        result: "Sealing the unknown keeps {colony}'s collective mind calm and focused on surface foundries.",
        shift: { openness: -2, tradition: 1 },
        effects: [
          { kind: "factories", amount: 5 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -80 },
        ],
      },
      {
        label: "Tune brood-singers to answer the echo",
        result: "Harmonic resonance deepens psychic cohesion across {colony} and reveals faint structural geometry.",
        shift: { tradition: 2 },
        effects: [
          { kind: "culture", amount: 95 },
          { kind: "research", field: "construction", amount: 150 },
          { kind: "money", amount: -100 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-1-stray-clutch",
    raceId: "kethrak",
    act: 1,
    kind: "act",
    title: "Larvae in the Border Dust",
    art: "contact",
    text: "A drifting spore-pod from {colony} lands on a contested moon near {star}, hatching hungry worker larvae right beside an automated mining outpost belonging to the {rival}.",
    choices: [
      {
        label: "Call the larvae back and pay for damages",
        result: "Recalling the brood costs bullion and confuses young drones, yet surprises the {rival} with unexpected restraint.",
        shift: { mercy: 2, openness: 1 },
        sets: ["recalled-border-clutch"],
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "money", amount: -130 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Feed the clutch to overrun the outpost",
        result: "Swarming drones strip the outpost to bare rock and swell our border brood, enraging the {rival}.",
        shift: { mercy: -2, openness: -1 },
        sets: ["consumed-border-outpost"],
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "population", amount: 2 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Leave the feral larvae to fend for themselves",
        result: "Abandoning the stray pod avoids direct blame while letting hard survival test the mutation.",
        shift: { mercy: -1, openness: -1 },
        effects: [
          { kind: "research", field: "planetology", amount: 180 },
          { kind: "relations", amount: -6 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-kethrak-2-silence-caste",
    raceId: "kethrak",
    act: 2,
    kind: "act",
    title: "The Mute Workers",
    art: "crisis",
    text: "Heavy radiation in the deep shipyards of {colony} produces a generation of sterile worker drones born without psychic receptors—tireless builders who cannot hear the Hive's shared song.",
    choices: [
      {
        label: "Cherish them and build tactile sign-galleries",
        result: "Patient adaptation weaves the silent workers into {colony}'s life, lifting morale across every caste.",
        shift: { mercy: 2, tradition: -1 },
        sets: ["sheltered-mute-caste"],
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 110 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Assign them to hazardous deep-space hulls",
        result: "Immune to psychic panic, the mute drones supercharge yard output on {colony} while wearing out early.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "factories", amount: 9 },
          { kind: "research", field: "construction", amount: 210 },
          { kind: "population", amount: -2 },
        ],
      },
      {
        label: "Retire the lineage cleanly under ancient brood-law",
        result: "Following ancestral swarm mercy preserves psychic purity across {colony}, though foundry quotas dip.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "culture", amount: 100 },
          { kind: "morale", amount: 3 },
          { kind: "factories", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-2-amber-treaty",
    raceId: "kethrak",
    act: 2,
    kind: "act",
    title: "Resin for Glass",
    art: "contact",
    text: "Merchants from the {rival} approach {star} seeking Kethrak bio-resin—a self-healing hull sealant secreted only by royal brood-nurses on {colony}—in exchange for advanced computer cores.",
    choices: [
      {
        label: "Trade royal bio-resin openly with the {rival}",
        result: "Warm commerce fills {colony}'s labs with foreign processors, though traditionalist queens dislike sharing hive secretions.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "research", field: "computers", amount: 260 },
          { kind: "relations", amount: 16 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Refuse to barter sacred hive secretions",
        result: "Keeping royal resin strictly inside the swarm strengthens brood pride and defensive hull craft.",
        shift: { openness: -2, tradition: 2 },
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "research", field: "construction", amount: 180 },
          { kind: "relations", amount: -12 },
        ],
      },
      {
        label: "Sell sterile synthetic resin for bullion",
        result: "Clever biochemical mimicry brings steady coin into {colony} without compromising true hive biology.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "money", amount: 230 },
          { kind: "factories", amount: 5 },
          { kind: "culture", amount: -40 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-2-canopy-blight",
    raceId: "kethrak",
    act: 2,
    kind: "act",
    title: "The Grey Spores",
    art: "crisis",
    text: "A parasitic fungus carried back through subspace tunnels from {star} infects the nutrient jungles of {colony}, threatening to starve three million larvae before the next molting cycle.",
    choices: [
      {
        label: "Burn the outer jungles to save the brood",
        result: "Scorched-earth firebreaks save the hatcheries on {colony}, though scarring ancestral canopy hurts hive spirit.",
        shift: { mercy: 1, tradition: -2 },
        effects: [
          { kind: "population", amount: 3 },
          { kind: "morale", amount: -5 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Sacrifice weak outer clutches to feed the core",
        result: "Harsh triage preserves the sacred canopy and key queens while thinning {colony}'s lower castes.",
        shift: { mercy: -2, tradition: 1 },
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "factories", amount: 6 },
          { kind: "population", amount: -3 },
        ],
      },
      {
        label: "Cultivate the blight in sealed bio-forges",
        result: "Mutated fungal enzymes accelerate planetology research and yield rich organic reagents.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "research", field: "planetology", amount: 250 },
          { kind: "money", amount: 150 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-kethrak-3-rival-queen",
    raceId: "kethrak",
    act: 3,
    kind: "act",
    title: "The Second Pulse",
    art: "crisis",
    text: "Separated by deep tunnel collapse near {star}, a massive frontier hive on {colony} develops an independent over-mind that refuses to subordinate its song to the homeworld queens.",
    choices: [
      {
        label: "Send acid-legions to crush the rival mind",
        result: "Brutal subterranean war restores a single voice at {colony}, though heavy brood losses scar the soil.",
        shift: { mercy: -2, tradition: 2 },
        sets: ["crushed-rival-queen"],
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "research", field: "weapons", amount: 260 },
          { kind: "population", amount: -4 },
        ],
      },
      {
        label: "Weave a dual-chorus federation of queens",
        result: "Sharing psychic harmony across equal nodes sparks inventive brood-science, though traditionalists shudder.",
        shift: { openness: 2, tradition: -2 },
        sets: ["federated-hive-minds"],
        effects: [
          { kind: "research", field: "computers", amount: 290 },
          { kind: "culture", amount: 120 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Lure the rebel queen into a diplomatic truce",
        result: "Conceding local brood autonomy stops the bloodshed while keeping tunnel transit open near {star}.",
        shift: { mercy: 2, openness: 1 },
        sets: ["federated-hive-minds"],
        effects: [
          { kind: "population", amount: 3 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-3-prisoner-hosts",
    raceId: "kethrak",
    act: 3,
    kind: "act",
    title: "The Warm-Blooded Captives",
    art: "crisis",
    text: "Following border clashes with the {rival} near {star}, Kethrak warrior-drones herd thousands of captive soldiers into the humid cavern-pens beneath {colony}.",
    choices: [
      {
        label: "Feed the captives to the royal nursery pools",
        result: "Rich protein surges birth fierce warrior clutches on {colony}, while horrified neighbors recoil from the Hive.",
        shift: { mercy: -2, openness: -2 },
        sets: ["devoured-rival-captives"],
        effects: [
          { kind: "population", amount: 4 },
          { kind: "factories", amount: 8 },
          { kind: "relations", amount: -20 },
        ],
      },
      {
        label: "Release them unharmed at the neutral border",
        result: "Returning live prisoners baffles the {rival} and softens the Hive's terrifying reputation across {star}.",
        shift: { mercy: 2, openness: 2 },
        sets: ["spared-rival-captives"],
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Put them to work tending surface orchards",
        result: "Supervised labor boosts {colony}'s food and coin yield without violating ancient hive-hunger taboos.",
        shift: { tradition: 1, mercy: 1 },
        sets: ["spared-rival-captives"],
        effects: [
          { kind: "money", amount: 220 },
          { kind: "planetSize", amount: 3 },
          { kind: "relations", amount: -6 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-3-chitin-forge",
    raceId: "kethrak",
    act: 3,
    kind: "act",
    title: "Shells of Living Steel",
    art: "anomaly",
    text: "Bio-engineers on {colony} discover how to splice heavy hull alloys directly into larval carapaces, turning every grown Kethrak worker into a walking armored plate.",
    choices: [
      {
        label: "Mandate metal-spliced molting across all broods",
        result: "Iron-shelled drones double industrial resilience on {colony}, though heavy plates dull their sensitivity to the song.",
        shift: { tradition: -2, mercy: -1 },
        sets: ["forged-iron-brood"],
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "research", field: "construction", amount: 260 },
          { kind: "culture", amount: -110 },
        ],
      },
      {
        label: "Forbid tampering with sacred ancestral chitin",
        result: "Pure organic carapaces keep the psychic chorus resonant and joyful across every jungle world.",
        shift: { tradition: 2, mercy: 1 },
        sets: ["kept-organic-chitin"],
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "morale", amount: 6 },
          { kind: "factories", amount: -4 },
        ],
      },
      {
        label: "Limit alloy-splicing to front-line shock troops",
        result: "A specialized armored warrior caste strengthens defense without altering civilian worker pools.",
        shift: { tradition: -1, openness: -1 },
        sets: ["forged-iron-brood"],
        effects: [
          { kind: "research", field: "weapons", amount: 240 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-kethrak-4-great-swarming",
    raceId: "kethrak",
    act: 4,
    kind: "act",
    title: "The Galactic Nuptial Flight",
    art: "victory",
    text: "Every spawning pool from {colony} to {star} swells simultaneously as millions of winged royal drones prepare to launch blind spore-arks into every unclaimed system in known space.",
    choices: [
      {
        label: "Unleash the unrestrained swarm across all borders",
        result: "Countless spore-pods darken the lanes and seed new hives, driving neighbors like the {rival} into panic.",
        shift: { openness: -2, mercy: -1 },
        effects: [
          { kind: "ships", template: "colony", count: 3 },
          { kind: "population", amount: 5 },
          { kind: "relations", amount: -24 },
        ],
      },
      {
        label: "Bind the flight to chartered barren worlds only",
        result: "Disciplined expansion respects inhabited borders and earns astonished respect across the sector.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "relations", amount: 22 },
          { kind: "culture", amount: 190 },
          { kind: "planetSize", amount: 6 },
        ],
      },
      {
        label: "Channel the royal surge into continental bio-forges",
        result: "Redirecting swarm energy into massive living foundries supercharges industry on {colony}.",
        shift: { tradition: 1, openness: -1 },
        effects: [
          { kind: "factories", amount: 14 },
          { kind: "money", amount: 340 },
          { kind: "morale", amount: -5 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-4-star-tunnel",
    raceId: "kethrak",
    act: 4,
    kind: "act",
    title: "The Hollowing",
    art: "supernova",
    text: "Master tunnel-weavers propose boring a permanent subspace hive-artery straight through the gravity well of {star}, linking every Kethrak brood instantaneously at the risk of planetary quakes.",
    choices: [
      {
        label: "Bore the grand subspace artery",
        result: "Instantaneous tunnel transit revolutionizes propulsion and reveals distant stars, though tectonic tremors rattle {colony}.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 420 },
          { kind: "revealStars", count: 6 },
          { kind: "morale", amount: -7 },
        ],
      },
      {
        label: "Keep the old sacred burrow-paths intact",
        result: "Honoring ancestral tunnel routes preserves planetary stability and deepens hive song across {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "morale", amount: 7 },
          { kind: "money", amount: -240 },
        ],
      },
      {
        label: "Open the completed tunnels to peaceful merchant hulls",
        result: "Charging transit tolls to foreign freighters turns Kethrak subspace arteries into a goldmine.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "money", amount: 410 },
          { kind: "relations", amount: 18 },
          { kind: "factories", amount: 6 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-4-alien-song",
    raceId: "kethrak",
    act: 4,
    kind: "act",
    title: "The Second Voice",
    art: "contact",
    text: "Telepathic ambassadors from neighboring empires ask the Kethrak Overmind to open a shared psychic frequency so non-hive species can finally understand our chorus without fear.",
    choices: [
      {
        label: "Broadcast an open translation frequency",
        result: "Warm harmonic resonance bridges the gulf between hive and individual minds across {colony} and beyond.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "relations", amount: 25 },
          { kind: "culture", amount: 210 },
          { kind: "research", field: "computers", amount: 260 },
        ],
      },
      {
        label: "Close the chorus forever to soft-skins",
        result: "Pure, impenetrable psychic unity fortifies Kethrak resolve and shields every thought from intruders.",
        shift: { openness: -2, tradition: 2 },
        effects: [
          { kind: "research", field: "forceFields", amount: 380 },
          { kind: "morale", amount: 6 },
          { kind: "relations", amount: -20 },
        ],
      },
      {
        label: "Project terrifying battle-chants across rival borders",
        result: "Psychic war-songs rattle enemy crews near {star} and harden our weapon doctrine.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "research", field: "weapons", amount: 380 },
          { kind: "factories", amount: 9 },
          { kind: "relations", amount: -22 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-kethrak-branch-pale-queen-vision",
    raceId: "kethrak",
    act: 2,
    kind: "branch",
    needs: ["awakened-pale-queen"],
    title: "Memory of the Deep Root",
    art: "ruins",
    text: "Singing through {colony}'s pheromone web, the awakened pale queen remembers an ancient subterranean star-gate sealed beneath {star} before the Hive ever took to open space.",
    choices: [
      {
        label: "Excavate the ancestral star-gate",
        result: "Ancient organic transit-rings open distant lanes and boost propulsion insight, draining {colony}'s reserves.",
        shift: { tradition: 2, openness: 1 },
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "propulsion", amount: 230 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Harvest the gate's bio-crystals for foundries",
        result: "Stripping the relic supercharges {colony}'s factories, though the pale queen mourns the broken memory.",
        shift: { tradition: -2, mercy: -1 },
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "money", amount: 180 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Record her memory-songs in the brood-archives",
        result: "Preserving pre-Unison harmonics enriches Kethrak culture and steadies young hatcheries.",
        shift: { tradition: 1, mercy: 1 },
        effects: [
          { kind: "culture", amount: 135 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-branch-border-clutch",
    raceId: "kethrak",
    act: 2,
    kind: "branch",
    needs: ["recalled-border-clutch"],
    blockedBy: ["consumed-border-outpost"],
    title: "The Truce-Spore",
    art: "contact",
    text: "Impressed that we recalled our stray clutch near {star}, mining engineers from the {rival} offer to co-develop deep-crust extraction drills tailored to {colony}'s jungle tunnels.",
    choices: [
      {
        label: "Sign the joint mining compact with the {rival}",
        result: "Shared tunnel drills boost factory yield on {colony} and build rare trust with the {rival}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: -50 },
        ],
      },
      {
        label: "Study their drill designs and build our own",
        result: "Reverse-engineering foreign gear advances construction science while keeping Hive tunnels closed to outsiders.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "research", field: "construction", amount: 240 },
          { kind: "money", amount: 140 },
          { kind: "relations", amount: -10 },
        ],
      },
      {
        label: "Invite {rival} botanists to study jungle symbiosis",
        result: "Peaceful exchange deepens planetology mastery and cultural standing across {colony}.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "research", field: "planetology", amount: 210 },
          { kind: "culture", amount: 115 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-branch-mute-architects",
    raceId: "kethrak",
    act: 3,
    kind: "branch",
    needs: ["sheltered-mute-caste"],
    title: "The Silent Monolith",
    art: "anomaly",
    text: "Freed from the constant psychic roar of the chorus, the mute worker caste on {colony} develops an astonishing gift for geometric design, drafting a vast orbital brood-bastion near {star}.",
    choices: [
      {
        label: "Build their silent orbital bastion",
        result: "Unclouded by swarm chatter, mute architects erect an engineering marvel that boosts construction and pride.",
        shift: { tradition: -2, mercy: 1 },
        effects: [
          { kind: "research", field: "construction", amount: 310 },
          { kind: "factories", amount: 9 },
          { kind: "money", amount: -190 },
        ],
      },
      {
        label: "Teach the chorus to read their tactile geometry",
        result: "Bridging silent craft and shared song sparks a cultural renaissance across every Kethrak world.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Deploy silent squads as undetectable scouts",
        result: "Leaving zero psychic wake, mute crews slip past enemy sensors around {star} to map hidden lanes.",
        shift: { openness: -1, mercy: -1 },
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "ships", template: "scout", count: 2 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-branch-captive-reckoning",
    raceId: "kethrak",
    act: 4,
    kind: "branch",
    needs: ["devoured-rival-captives"],
    blockedBy: ["spared-rival-captives"],
    title: "The Blood-Debt",
    art: "crisis",
    text: "Survivors from the {rival} broadcast holo-records of our cavern-pens beneath {colony} across every diplomatic channel, rallying a border coalition sworn to exterminate the Kethrak Hive.",
    choices: [
      {
        label: "Unleash warrior-swarms to break the coalition",
        result: "Merciless preemptive strikes shatter enemy staging yards near {star}, cementing our terrifying reputation.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "research", field: "weapons", amount: 360 },
          { kind: "factories", amount: 10 },
          { kind: "relations", amount: -25 },
        ],
      },
      {
        label: "Offer vast bullion reparations and seal the pens",
        result: "Paying heavy tribute cools immediate war fever, though warrior castes hiss at bowing to prey.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "money", amount: -360 },
          { kind: "morale", amount: -7 },
        ],
      },
      {
        label: "Retreat into fortified subterranean bunkers",
        result: "Deep armor-chambers harden {colony} against siege while cutting off all contact with the surface.",
        shift: { openness: -2, tradition: 2 },
        effects: [
          { kind: "research", field: "forceFields", amount: 340 },
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: -120 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-branch-iron-molt-strain",
    raceId: "kethrak",
    act: 4,
    kind: "branch",
    needs: ["forged-iron-brood"],
    blockedBy: ["kept-organic-chitin"],
    title: "The Heavy Shell",
    art: "crisis",
    text: "Generations of alloy-spliced molting leave worker drones on {colony} struggling to shed their metallic carapaces, threatening mass suffocation unless brood-shapers intervene.",
    choices: [
      {
        label: "Build electromagnetic molting-cradles",
        result: "Industrial assist-bays save the iron-brood and turn their shed plates into prime shipyard alloy.",
        shift: { mercy: 1, tradition: -2 },
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "population", amount: 3 },
          { kind: "money", amount: -320 },
        ],
      },
      {
        label: "Revert future clutches to pure organic chitin",
        result: "Restoring natural biology lifts swarm morale and psychic song on {colony}, slowing heavy industry.",
        shift: { tradition: 2, mercy: 2 },
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "morale", amount: 8 },
          { kind: "factories", amount: -6 },
        ],
      },
      {
        label: "Recycle faltering drones into foundry slag",
        result: "Cold efficiency keeps quotas climbing on {colony} while chilling the Hive's collective spirit.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "money", amount: 350 },
          { kind: "research", field: "construction", amount: 310 },
          { kind: "population", amount: -4 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-kethrak-end-dread-swarm",
    raceId: "kethrak",
    needs: { mercy: { max: -4 }, openness: { max: -4 } },
    title: "The Endless Hunger",
    art: "crisis",
    text: "Unsparing, silent, and sealed against every outsider, the Kethrak Hive blankets its worlds in armored chitin—an apex swarm so terrifying that rival empires dare not provoke its wrath.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Let the galaxy tremble in silence",
        result: "Every border freezes in dread as Kethrak spawning pools pulse unchallenged.",
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "population", amount: 4 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-end-schism-of-queens",
    raceId: "kethrak",
    needs: { tradition: { max: -4 }, mercy: { max: -3 } },
    title: "The Fractured Chorus",
    art: "crisis",
    text: "Tearing away ancestral brood-law without tempering the Hive's ruthless hunger shatters psychic unity, as rival over-minds on {colony}'s outer worlds break away in open brood-war.",
    outcome: "civilWar",
    choices: [
      {
        label: "March against the splinter broods",
        result: "Subterranean tunnels erupt in civil war as rival queens fight for the throne.",
        effects: [
          { kind: "research", field: "weapons", amount: 320 },
          { kind: "morale", amount: -8 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-end-symphonic-alliance",
    raceId: "kethrak",
    needs: { openness: { min: 4 }, mercy: { min: 4 } },
    title: "The Shared Resonance",
    art: "council",
    text: "By tempering hive instinct with mercy and opening their chorus to peaceful dialogue, the Kethrak achieve an astonishing bond—drawing their fiercest enemy into lasting alliance.",
    outcome: "rivalBecomesAlly",
    choices: [
      {
        label: "Weave them into our song",
        result: "Former foes stand beside the Kethrak Hive in enduring trust and mutual defense.",
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "relations", amount: 25 },
        ],
      },
    ],
  },
  {
    id: "saga-kethrak-end-eternal-brood",
    raceId: "kethrak",
    title: "The Thriving Canopy",
    art: "victory",
    text: "Balanced between ancient brood-song and steady adaptation, the Kethrak Hive enters a radiant golden age of overflowing hatcheries, living foundries, and unbroken harmony.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Sing the song of abundance",
        result: "Spawning pools and jungle spires flourish in unison across every Kethrak world.",
        effects: [
          { kind: "population", amount: 4 },
          { kind: "factories", amount: 10 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
];
