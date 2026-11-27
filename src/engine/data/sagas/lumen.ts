// lumen saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-lumen-1-sunken-echo",
    raceId: "lumen",
    act: 1,
    kind: "act",
    title: "The Trench Memory",
    art: "ruins",
    text: "Deep inside an abyssal trench on {colony}, Choir novices discover a living coral spire that still echoes with the unedited memories of the ancient wars that united the Lumen Choir.",
    choices: [
      {
        label: "Open the coral memory to every reef-school",
        result: "Confronting old sorrows deepens artistic resonance across {colony}, though young singers feel a quiet chill.",
        shift: { openness: 2, tradition: -1 },
        sets: ["shared-trench-memory"],
        effects: [
          { kind: "culture", amount: 115 },
          { kind: "research", field: "computers", amount: 160 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Keep the memory sealed within High Choir vaults",
        result: "Preserving tranquil reef harmony lifts daily joy on {colony} and keeps ancient pain submerged.",
        shift: { openness: -2, tradition: 2 },
        sets: ["sealed-trench-memory"],
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 85 },
          { kind: "money", amount: -80 },
        ],
      },
      {
        label: "Harvest the coral's resonant crystals for sensor arrays",
        result: "Amplified psionic receivers reveal distant lanes around {star}, though elders mourn the fractured reef.",
        shift: { tradition: -2, mercy: -1 },
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "research", field: "forceFields", amount: 180 },
          { kind: "culture", amount: -50 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-1-surface-castaways",
    raceId: "lumen",
    act: 1,
    kind: "act",
    title: "Strangers on the Atoll",
    art: "contact",
    text: "A crippled civilian transport from the {rival} splashes down into the equatorial sea of {colony} near {star}, its air-breathing crew terrified by the silent telepathic song rising from the waves.",
    choices: [
      {
        label: "Build domed atoll shelters and nurse them home",
        result: "Kindness across the water-line astonishes the {rival} and warms border relations near {star}.",
        shift: { mercy: 2, openness: 2 },
        sets: ["sheltered-rival-castaways"],
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 95 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Read their minds quietly before returning them",
        result: "Gentle psychic probing extracts star charts and fleet codes without leaving a mark on the survivors.",
        shift: { mercy: -1, openness: -1 },
        sets: ["probed-rival-castaways"],
        effects: [
          { kind: "revealStars", count: 3 },
          { kind: "research", field: "computers", amount: 200 },
          { kind: "relations", amount: -8 },
        ],
      },
      {
        label: "Keep them isolated until diplomatic ransom is paid",
        result: "Strict quarantine shields {colony}'s reefs from alien noise while refilling the treasury.",
        shift: { openness: -2, mercy: -1 },
        effects: [
          { kind: "money", amount: 210 },
          { kind: "morale", amount: 2 },
          { kind: "relations", amount: -14 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-1-phase-tide",
    raceId: "lumen",
    act: 1,
    kind: "act",
    title: "The Phase Current",
    art: "anomaly",
    text: "While tuning phase-drive resonators above {colony}, navigators find a harmonic frequency that lets telepathic whispers ride phase-wakes instantaneously toward {star}.",
    choices: [
      {
        label: "Weave the phase-relay into our civic Chorus",
        result: "Instantaneous reef-to-reef song unites distant colonies in joyful, coordinated industry.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -90 },
        ],
      },
      {
        label: "Turn the phase-relay into a deep-space listening net",
        result: "Silent psychic antennae map hidden movements around {star} and advance propulsion theory.",
        shift: { openness: -1, tradition: -1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 210 },
          { kind: "revealStars", count: 3 },
          { kind: "culture", amount: -40 },
        ],
      },
      {
        label: "Broadcast calming lullabies along border lanes",
        result: "Soothing harmonic waves ease tension with neighboring scouts near {star}.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "relations", amount: 14 },
          { kind: "culture", amount: 85 },
          { kind: "money", amount: -70 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-lumen-2-silent-islanders",
    raceId: "lumen",
    act: 2,
    kind: "act",
    title: "The Unsung Reef",
    art: "crisis",
    text: "A generation of Lumen born inside orbital habitats above {colony} develops natural psychic shielding, unable to hear the ocean Chorus and claiming they prefer private, unshared thoughts.",
    choices: [
      {
        label: "Honor their mental privacy as a new branch of Choir",
        result: "Respecting silent minds sparks creative diversity on {colony}, though traditional reef-singers grieve.",
        shift: { openness: 2, tradition: -2 },
        sets: ["protected-silent-minds"],
        effects: [
          { kind: "culture", amount: 135 },
          { kind: "research", field: "forceFields", amount: 220 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Submerge them in abyssal attunement baths",
        result: "Restoring full telepathic harmony across {colony} delights elders and boosts unified factory rhythm.",
        shift: { tradition: 2, mercy: -1 },
        sets: ["attuned-silent-minds"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: -60 },
        ],
      },
      {
        label: "Train them as counter-espionage shield-wardens",
        result: "Naturally opaque minds guard {colony}'s vaults against foreign telepaths and spy rings.",
        shift: { openness: -1, tradition: -1 },
        effects: [
          { kind: "research", field: "computers", amount: 240 },
          { kind: "money", amount: 150 },
          { kind: "morale", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-2-dream-market",
    raceId: "lumen",
    act: 2,
    kind: "act",
    title: "Pearls of Shared Vision",
    art: "contact",
    text: "Wealthy merchants from the {rival} arrive at {colony}'s floating piers offering huge sums for distilled Lumen memory-pearls—crystalline records of vivid oceanic dreams and artistic symphonies.",
    choices: [
      {
        label: "License authentic artistic pearls for open trade",
        result: "Cultural exports enrich {colony}'s coffers and enchant audiences across the {rival}'s worlds.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "money", amount: 260 },
          { kind: "relations", amount: 16 },
          { kind: "culture", amount: 90 },
        ],
      },
      {
        label: "Forbid selling sacred Choir memories to outsiders",
        result: "Keeping our inner song uncorrupted by coin strengthens cultural purity across {colony}.",
        shift: { openness: -2, tradition: 2 },
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -12 },
        ],
      },
      {
        label: "Embed subtle psychic listening threads in the pearls",
        result: "Every exported dream-pearl doubles as a covert relay inside {rival} estates.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "money", amount: 220 },
          { kind: "research", field: "computers", amount: 230 },
          { kind: "relations", amount: -15 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-2-thermal-bloom",
    raceId: "lumen",
    act: 2,
    kind: "act",
    title: "The Red-Tide Surge",
    art: "crisis",
    text: "Deep-sea geothermal vents near {colony}'s main spawning reefs erupt unexpectedly, threatening to boil coastal nurseries unless orbital phase-coils divert the heat at heavy industrial cost.",
    choices: [
      {
        label: "Divert all shipyard power to cool the nurseries",
        result: "Swift phase-cooling saves every spawning reef on {colony}, lifting population and morale.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "population", amount: 4 },
          { kind: "morale", amount: 5 },
          { kind: "factories", amount: -5 },
        ],
      },
      {
        label: "Tap the thermal surge to power heavy sea-forges",
        result: "Harnessing volcanic vents supercharges {colony}'s foundries while coastal clans evacuate inland.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "research", field: "construction", amount: 210 },
          { kind: "population", amount: -3 },
        ],
      },
      {
        label: "Seed heat-tolerant reef flora from {star} surveys",
        result: "Adaptive bio-engineering stabilizes {colony}'s seas and expands habitable ocean basins.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "planetSize", amount: 4 },
          { kind: "research", field: "planetology", amount: 220 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-lumen-3-captive-chorus",
    raceId: "lumen",
    act: 3,
    kind: "act",
    title: "The Dissonant Shore",
    art: "crisis",
    text: "War refugees and captives from the {rival} crowd {colony}'s floating atolls, their anxious, unshielded thoughts jarring against the Lumen Choir's tranquil ocean-song.",
    choices: [
      {
        label: "Smooth their minds into peaceful choir harmony",
        result: "Calming psychic waves quiet the atolls and boost factory rhythm on {colony}, while neighbors recoil in horror.",
        shift: { mercy: -2, openness: -1 },
        sets: ["pacified-rival-captives"],
        effects: [
          { kind: "factories", amount: 9 },
          { kind: "morale", amount: 5 },
          { kind: "relations", amount: -20 },
        ],
      },
      {
        label: "Build costly psychic-baffle domes to guard their thoughts",
        result: "Protecting mental privacy wins awe across the sector and enriches {colony}'s culture at steep coin cost.",
        shift: { mercy: 2, openness: 2 },
        sets: ["shielded-rival-captives"],
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 145 },
          { kind: "money", amount: -210 },
        ],
      },
      {
        label: "Ferry them back to neutral {rival} ports under truce",
        result: "Releasing captives unharmed eases border hostility near {star} without straining reef habitats.",
        shift: { mercy: 2, openness: 1 },
        sets: ["shielded-rival-captives"],
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-3-abyssal-oracle",
    raceId: "lumen",
    act: 3,
    kind: "act",
    title: "The Salt-Glass Prism",
    art: "anomaly",
    text: "Sub-aquatic surveyors near {star} recover a naturally grown quartz spire that amplifies phase-telepathy tenfold—letting Choir elders either foresee fleet jumps or burn out enemy guidance computers.",
    choices: [
      {
        label: "Tune the prism as a predictive navigation beacon",
        result: "Reading phase-currents ahead of time sharpens propulsion science and reveals distant starlanes.",
        shift: { openness: 1, tradition: -1 },
        sets: ["tuned-navigation-prism"],
        effects: [
          { kind: "research", field: "propulsion", amount: 280 },
          { kind: "revealStars", count: 5 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "Weaponize the spire into a psionic disruption lance",
        result: "Psychic shockwaves scramble hostile targeting arrays near {star}, delighting fleet commanders.",
        shift: { mercy: -2, tradition: -1 },
        sets: ["weaponized-psionic-prism"],
        effects: [
          { kind: "research", field: "weapons", amount: 290 },
          { kind: "factories", amount: 7 },
          { kind: "culture", amount: -80 },
        ],
      },
      {
        label: "Install the spire in {colony}'s Grand Amphitheater",
        result: "Transcendent underwater symphonies sweep every reef in celebration and deepen cultural unity.",
        shift: { tradition: 2, mercy: 1 },
        sets: ["tuned-navigation-prism"],
        effects: [
          { kind: "culture", amount: 155 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-3-elder-dissolution",
    raceId: "lumen",
    act: 3,
    kind: "act",
    title: "The Final Tide",
    art: "council",
    text: "As the oldest Arch-Cantors of {colony} prepare for ritual dissolution into the oceanic bio-web, younger reformists ask them to upload their memories into crystal archives instead.",
    choices: [
      {
        label: "Preserve their minds in immortal crystal archives",
        result: "Living memory-banks supercharge computer research on {colony}, though traditionalists mourn the broken cycle.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "research", field: "computers", amount: 310 },
          { kind: "culture", amount: 110 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Honor the sacred dissolution into the living sea",
        result: "Returning ancestral essence to the reef-web renews {colony}'s ecology and uplifts every singer.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "planetSize", amount: 4 },
          { kind: "research", field: "computers", amount: -80 },
        ],
      },
      {
        label: "Invite foreign scholars to witness the farewell chant",
        result: "Sharing our deepest spiritual rite builds rare empathy with visitors from the {rival}.",
        shift: { openness: 2, tradition: 1 },
        effects: [
          { kind: "relations", amount: 19 },
          { kind: "culture", amount: 140 },
          { kind: "money", amount: -120 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-lumen-4-ocean-network",
    raceId: "lumen",
    act: 4,
    kind: "act",
    title: "The Starlight Current",
    art: "victory",
    text: "Linked by phase-relays between {colony} and {star}, the Lumen Choir grows powerful enough to weave every colonized sea into a single planetary consciousness.",
    choices: [
      {
        label: "Merge all reefs into one boundless Over-Choir",
        result: "Total telepathic unity drives effortless planetary engineering and science, though individual voices fade.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "research", field: "planetology", amount: 390 },
          { kind: "factories", amount: 12 },
          { kind: "population", amount: -3 },
        ],
      },
      {
        label: "Keep every ocean sovereign within a loose symphony",
        result: "Celebrating regional songs sparks joyful population growth and artistic flourishing across {colony}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "population", amount: 5 },
          { kind: "culture", amount: 210 },
          { kind: "morale", amount: 7 },
        ],
      },
      {
        label: "Turn the unified wave outward as a quiet psychic veil",
        result: "Subtle harmonic cloaking shields our lanes and unnerves border scouts near {star}.",
        shift: { openness: -2, mercy: -1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 380 },
          { kind: "money", amount: 280 },
          { kind: "relations", amount: -18 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-4-silent-treaty",
    raceId: "lumen",
    act: 4,
    kind: "act",
    title: "The Unspoken Oath",
    art: "council",
    text: "At a tense summit near {star}, negotiators from the {rival} accuse our envoys of reading secret instructions straight from their minds during peace talks.",
    choices: [
      {
        label: "Wear public psychic-dampening crowns at all summits",
        result: "Voluntarily blinding our telepathy during negotiations wins sweeping trust across the galaxy.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "relations", amount: 25 },
          { kind: "culture", amount: 200 },
          { kind: "money", amount: -190 },
        ],
      },
      {
        label: "Use covert mind-reading to extract favorable terms",
        result: "Exploiting every unspoken weakness fills {colony}'s treasury while poisoning trust with the {rival}.",
        shift: { mercy: -2, openness: -2 },
        effects: [
          { kind: "money", amount: 420 },
          { kind: "research", field: "computers", amount: 320 },
          { kind: "relations", amount: -25 },
        ],
      },
      {
        label: "Offer mutual mind-sharing to prove pure intent",
        result: "Letting {rival} envoys feel our genuine desire for peace breaks decades of mutual suspicion.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 22 },
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 140 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-4-glass-abyss",
    raceId: "lumen",
    act: 4,
    kind: "act",
    title: "The Luminous Tide",
    art: "supernova",
    text: "Bioluminescent cities across {colony} reach radiant maturity, enabling the Choir to project a stabilizing phase-harmonic across neighboring star clusters.",
    choices: [
      {
        label: "Beacon peaceful star-charts to every sentient world",
        result: "Generous navigation pulses illuminate hidden lanes and crown the Lumen as beloved guides.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 22 },
          { kind: "revealStars", count: 6 },
        ],
      },
      {
        label: "Focus the phase-harmonic into planetary shield domes",
        result: "Shimmering energy barriers make {colony} nearly impervious to orbital assault.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 410 },
          { kind: "factories", amount: 10 },
          { kind: "morale", amount: 5 },
        ],
      },
      {
        label: "Charge phase-transit tolls along stabilized lanes",
        result: "Monetizing safe hyper-currents pours immense wealth into {colony}'s floating palaces.",
        shift: { openness: 1, mercy: -1 },
        effects: [
          { kind: "money", amount: 400 },
          { kind: "research", field: "propulsion", amount: 330 },
          { kind: "relations", amount: -10 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-lumen-branch-trench-elegy",
    raceId: "lumen",
    act: 2,
    kind: "branch",
    needs: ["shared-trench-memory"],
    blockedBy: ["sealed-trench-memory"],
    title: "The Second Verse",
    art: "ruins",
    text: "Inspired by the unedited coral memories on {colony}, young composers uncover a submerged acoustic chamber near {star} built to harmonize rival reefs before the ancient ocean wars began.",
    choices: [
      {
        label: "Restore the ancient peace-chamber",
        result: "Reawakened reconciliation harmonics sweep {colony}, uplifting culture and diplomatic grace.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "relations", amount: 15 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Study its acoustic geometry for force-field coils",
        result: "Harmonic standing-wave equations sharpen shield engineering while the chamber remains dry.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 250 },
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Turn the chamber into a memorial sanctuary",
        result: "Quiet pilgrimages heal lingering grief across {colony}'s coastal reefs.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "population", amount: 2 },
          { kind: "money", amount: -100 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-branch-atoll-envoys",
    raceId: "lumen",
    act: 2,
    kind: "branch",
    needs: ["sheltered-rival-castaways"],
    blockedBy: ["probed-rival-castaways"],
    title: "The Coral Guests",
    art: "contact",
    text: "Grateful for our hospitality on {colony}, survivors from the {rival} return with hydro-architects to help build floating trade-atolls linking our seas with off-world freighters near {star}.",
    choices: [
      {
        label: "Open the floating atolls to joint commerce",
        result: "Bilateral reef-ports pour trade coin into {colony} and cement warm trust with the {rival}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "money", amount: 260 },
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 95 },
        ],
      },
      {
        label: "Keep the atolls strictly under Lumen security",
        result: "Careful customs oversight protects sacred reefs while still welcoming profitable cargo.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "money", amount: 190 },
          { kind: "factories", amount: 6 },
          { kind: "relations", amount: -8 },
        ],
      },
      {
        label: "Establish a joint oceanography institute",
        result: "Collaborative marine biology advances planetology mastery across {colony}'s basins.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "research", field: "planetology", amount: 240 },
          { kind: "planetSize", amount: 3 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-branch-silent-keepers",
    raceId: "lumen",
    act: 3,
    kind: "branch",
    needs: ["protected-silent-minds"],
    blockedBy: ["attuned-silent-minds"],
    title: "The Unheard Choir",
    art: "council",
    text: "Respected for their mental privacy on {colony}, the un-attuned orbital Lumen form a guild of neutral arbiters, offering to verify secret treaties between suspicious empires near {star}.",
    choices: [
      {
        label: "Charter them as the Choir's diplomatic corps",
        result: "Opaque telepathic envoys win sweeping trust across the sector and enrich {colony}'s treasury.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "money", amount: 240 },
          { kind: "culture", amount: 125 },
        ],
      },
      {
        label: "Task them with designing personal mind-shields",
        result: "Portable psychic baffles become prized exports and advance force-field research.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 290 },
          { kind: "money", amount: 180 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Invite them to compose silent visual symphonies",
        result: "Light-sculpted art bridges silent and singing Lumen in joyful celebration on {colony}.",
        shift: { mercy: 2, tradition: -1 },
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -120 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-branch-velvet-shadow",
    raceId: "lumen",
    act: 4,
    kind: "branch",
    needs: ["pacified-rival-captives"],
    blockedBy: ["shielded-rival-captives"],
    title: "The Quiet Shore",
    art: "crisis",
    text: "Envoys from the {rival} demand an inspection of {colony}'s floating atolls after freed relatives return strangely serene, unable to recall anger or resentment against their Lumen captors.",
    choices: [
      {
        label: "Deepen the psychic veil and turn away inspectors",
        result: "Impenetrable telepathic calm keeps {colony}'s workforce humming while neighbors recoil in dread.",
        shift: { mercy: -2, openness: -2 },
        effects: [
          { kind: "factories", amount: 11 },
          { kind: "research", field: "computers", amount: 340 },
          { kind: "relations", amount: -25 },
        ],
      },
      {
        label: "Lift the smoothing fields and pay restitution",
        result: "Restoring unedited memories cools war fever near {star}, though atoll productivity drops.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "money", amount: -320 },
          { kind: "factories", amount: -6 },
        ],
      },
      {
        label: "Offer voluntary grief-healing clinics to outsiders",
        result: "Reframing psychic smoothing as consensual therapy eases suspicion and brings steady fees.",
        shift: { openness: 1, mercy: 1 },
        effects: [
          { kind: "money", amount: 290 },
          { kind: "culture", amount: 160 },
          { kind: "relations", amount: 10 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-branch-prism-beacon",
    raceId: "lumen",
    act: 4,
    kind: "branch",
    needs: ["tuned-navigation-prism"],
    blockedBy: ["weaponized-psionic-prism"],
    title: "The Lighthouse",
    art: "victory",
    text: "Resonating cleanly above {colony}, the salt-glass prism begins echoing faint harmonic replies from uncharted star clusters beyond {star}, inviting a grand phase-expedition.",
    choices: [
      {
        label: "Dispatch phase-scouts along the harmonic echoes",
        result: "Guided by crystal resonance, our ships chart distant sectors and advance propulsion mastery.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "research", field: "propulsion", amount: 360 },
          { kind: "ships", template: "scout", count: 2 },
        ],
      },
      {
        label: "Turn the beacon into a galactic cultural festival",
        result: "Choirs from every sea broadcast symphonies across the stars, elevating Lumen prestige.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 18 },
          { kind: "morale", amount: 7 },
        ],
      },
      {
        label: "Anchor the prism to enrich {colony}'s deep reefs",
        result: "Focused harmonic energy stimulates lush coral growth and booming population across our seas.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "planetSize", amount: 5 },
          { kind: "population", amount: 4 },
          { kind: "money", amount: -210 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-lumen-end-velvet-abyss",
    raceId: "lumen",
    needs: { mercy: { max: -4 }, openness: { max: -3 } },
    title: "The Velvet Tide",
    art: "crisis",
    text: "Wrapped in impenetrable psychic quiet and reading every unspoken thought across the border, the Lumen Choir inspires bone-deep dread—an unseen ocean whose tranquil surface hides absolute control.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Let the deep waters stay still",
        result: "Neighboring empires tread carefully in terror of what the silent Choir already knows.",
        effects: [
          { kind: "research", field: "computers", amount: 360 },
          { kind: "money", amount: 320 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-end-dissonant-reef",
    raceId: "lumen",
    needs: { tradition: { max: -4 }, mercy: { max: -3 } },
    title: "The Shattered Song",
    art: "crisis",
    text: "Severing ancestral reef-law while manipulating minds for cold advantage fractures the Choir's psychic harmony, plunging {colony}'s outer oceans into bitter dissonant rebellion.",
    outcome: "civilWar",
    choices: [
      {
        label: "Silence the discordant reefs",
        result: "Civil strife erupts beneath the waves as rival choirs tear the ocean web apart.",
        effects: [
          { kind: "research", field: "forceFields", amount: 300 },
          { kind: "morale", amount: -8 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-end-harmonic-covenant",
    raceId: "lumen",
    needs: { openness: { min: 4 }, mercy: { min: 4 } },
    title: "The Unmasked Chorus",
    art: "council",
    text: "By guarding mental privacy and sharing their song in genuine empathy, the Lumen Choir achieves a rare miracle—melting decades of suspicion and binding their fiercest rival into lasting alliance.",
    outcome: "rivalBecomesAlly",
    choices: [
      {
        label: "Sing together across the tide",
        result: "Former adversaries stand beside the Lumen Choir in unshakeable trust and shared peace.",
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 25 },
        ],
      },
    ],
  },
  {
    id: "saga-lumen-end-luminous-golden-age",
    raceId: "lumen",
    title: "The Radiant Sea",
    art: "victory",
    text: "Harmonizing ancient oceanic wisdom with compassionate curiosity, the Lumen Choir enters a luminous golden age of bioluminescent wonder, thriving reefs, and serene galactic grace.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Let the reefs shine",
        result: "Every Lumen ocean glows with artistic brilliance, joyful clans, and abundant peace.",
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "population", amount: 4 },
          { kind: "morale", amount: 8 },
        ],
      },
    ],
  },
];
