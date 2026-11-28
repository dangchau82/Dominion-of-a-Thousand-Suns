// Velari saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-velari-1-star-cairn",
    raceId: "velari",
    act: 1,
    kind: "act",
    title: "The Unfinished Obelisk",
    art: "ruins",
    text: "Beneath the marble terraces of {colony}, mason-seers uncover the sunken foundations of a pre-warp monument abandoned mid-carving when ancient astrologers foresaw a dark star-conjunction.",
    choices: [
      {
        label: "Complete the obelisk by ancestral ritual",
        result: "Heeding ancient proportion elevates civic harmony across {colony}, though rare stone quarries are depleted.",
        shift: { tradition: 2, mercy: 1 },
        sets: ["completed-star-obelisk"],
        effects: [
          { kind: "culture", amount: 115 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Convert the foundation into a gateway lab",
        result: "Replacing sacred geometry with phase-conduits accelerates gate research, unsettling temple elders.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 210 },
          { kind: "research", field: "construction", amount: 150 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Preserve the ruin untouched as a meditation park",
        result: "Quiet reflection gardens foster serenity and modest ecological renewal around {colony}.",
        shift: { mercy: 1, tradition: 1 },
        effects: [
          { kind: "culture", amount: 85 },
          { kind: "planetSize", amount: 2 },
          { kind: "money", amount: -80 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-1-threshold-anchor",
    raceId: "velari",
    act: 1,
    kind: "act",
    title: "The Whispering Threshold",
    art: "anomaly",
    text: "While aligning jump-gate harmonics near {star}, Velari navigators glimpse faint geometric echoes of an older, uninhabited transit lattice threading through nearby dark space.",
    choices: [
      {
        label: "Tune our gates to resonate with the ancient web",
        result: "Harmonic resonance reveals distant starlanes overnight, though stray feedback scorches relay coils.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "propulsion", amount: 180 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Dampen the echoes to keep our gates pure",
        result: "Insulating Velari harmonics protects domestic transit lines and reassures cautious seers.",
        shift: { openness: -1, tradition: 2 },
        effects: [
          { kind: "research", field: "forceFields", amount: 200 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -90 },
        ],
      },
      {
        label: "Harvest harmonic crystal from the anchor point",
        result: "Crystalline resonators boost shipyard construction on {colony} while silencing the mystery.",
        shift: { tradition: -1, mercy: -1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "money", amount: 150 },
          { kind: "culture", amount: -50 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-1-novice-pilgrims",
    raceId: "velari",
    act: 1,
    kind: "act",
    title: "The Silent Vow",
    art: "council",
    text: "A monastic order of master stone-singers on {colony} demands total exemption from factory labor so they may spend decades meditating on monumental designs.",
    choices: [
      {
        label: "Grant full sanctuary and temple stipends",
        result: "Devoted contemplation yields exquisite architectural breakthroughs and soaring cultural pride.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "research", field: "construction", amount: 160 },
          { kind: "factories", amount: -3 },
        ],
      },
      {
        label: "Require every order to build public works",
        result: "Putting mystics to work on orbital docks swells industry across {colony}, though prideful elders brood.",
        shift: { tradition: -1, mercy: -1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "money", amount: 130 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Send novice singers to bless frontier colonies",
        result: "Traveling artisans lift settler spirits and weave shared civic bonds across our young worlds.",
        shift: { openness: 1, mercy: 1 },
        effects: [
          { kind: "morale", amount: 4 },
          { kind: "population", amount: 2 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-velari-2-borrowed-sky",
    raceId: "velari",
    act: 2,
    kind: "act",
    title: "The Gate-Toll Petition",
    art: "contact",
    text: "Envoys from the {rival} request permission to anchor a commercial relay beside our jump-gate near {star}, offering rich tariffs in exchange for transit coordinates.",
    choices: [
      {
        label: "Grant open transit under Velari stewardship",
        result: "Sharing our gate-lanes wins warm gratitude from the {rival} and fills {colony}'s coffers.",
        shift: { openness: 2, mercy: 1 },
        sets: ["shared-gate-lanes"],
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "money", amount: 210 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Forbid outsiders near sacred gate-anchors",
        result: "Guarding our geometric mysteries preserves aristocratic pride while irritating the {rival}.",
        shift: { openness: -2, tradition: 2 },
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "research", field: "forceFields", amount: 200 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Sell one-way beacon keys at steep rates",
        result: "Controlled access brings brisk revenue to {colony} without exposing core Velari starlanes.",
        shift: { openness: -1, mercy: -1 },
        effects: [
          { kind: "money", amount: 250 },
          { kind: "factories", amount: 5 },
          { kind: "relations", amount: -8 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-2-living-quarry",
    raceId: "velari",
    act: 2,
    kind: "act",
    title: "The Singing Marble",
    art: "anomaly",
    text: "Deep-core miners on {colony} discover veins of iridescent harmonic stone ideal for wonder construction—only to find primitive cave-dwellers revering the caverns as living ancestors.",
    choices: [
      {
        label: "Halt mining and protect the sacred caverns",
        result: "Sparing the native shrines honors Velari mysticism and wins deep moral respect across {colony}.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "morale", amount: 5 },
          { kind: "factories", amount: -4 },
        ],
      },
      {
        label: "Quarry the veins for grand imperial monuments",
        result: "Luminous stone supercharges wonder-craft and construction science at steep human cost.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "research", field: "construction", amount: 270 },
          { kind: "factories", amount: 7 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Relocate the natives to surface sanctuaries",
        result: "Careful resettlement preserves both the people and partial stone harvests, draining treasury reserves.",
        shift: { mercy: 1, openness: 1 },
        effects: [
          { kind: "population", amount: 2 },
          { kind: "research", field: "planetology", amount: 190 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-2-astral-heresy",
    raceId: "velari",
    act: 2,
    kind: "act",
    title: "The Unbound Astrolabe",
    art: "council",
    text: "Younger gate-wrights near {star} publish star-charts proving the ancient Velari constellations—the foundation of our noble houses—are mere optical illusions from one vantage point.",
    choices: [
      {
        label: "Embrace the new cosmology across our academies",
        result: "Shedding provincial myths unlocks bold propulsion breakthroughs and widens Velari horizons.",
        shift: { tradition: -2, openness: 2 },
        effects: [
          { kind: "research", field: "propulsion", amount: 260 },
          { kind: "revealStars", count: 4 },
          { kind: "culture", amount: -80 },
        ],
      },
      {
        label: "Suppress the charts and uphold ancestral signs",
        result: "Preserving traditional star-lore steadies noble houses and lifts cultural devotion on {colony}.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "culture", amount: 135 },
          { kind: "morale", amount: 5 },
          { kind: "research", field: "computers", amount: -100 },
        ],
      },
      {
        label: "Reinterpret the old signs as poetic allegories",
        result: "Scholarly synthesis harmonizes new astronomy with sacred heritage without fracturing {colony}.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "culture", amount: 95 },
          { kind: "research", field: "computers", amount: 180 },
          { kind: "money", amount: -100 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-velari-3-gate-anchor-rift",
    raceId: "velari",
    act: 3,
    kind: "act",
    title: "The Unraveling Chord",
    art: "crisis",
    text: "Overuse of our phase-gate network near {star} tears a resonant fault into the crust of {colony}, threatening to collapse half our orbital ring unless we sever the gate-anchor permanently.",
    choices: [
      {
        label: "Sever the gate-anchor to save the cities",
        result: "Sacrificing rapid transit spares thousands of lives on {colony}, though outer fleets feel stranded.",
        shift: { mercy: 2, tradition: 1 },
        sets: ["severed-gate-anchor"],
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "culture", amount: 130 },
          { kind: "research", field: "propulsion", amount: -140 },
        ],
      },
      {
        label: "Overcharge the anchor to stabilize the rift",
        result: "Forcing phase-coils to full output keeps the gate open and supercharges propulsion telemetry, scarring coastal towns.",
        shift: { mercy: -2, tradition: -2 },
        sets: ["overcharged-gate-anchor"],
        effects: [
          { kind: "research", field: "propulsion", amount: 310 },
          { kind: "factories", amount: 7 },
          { kind: "population", amount: -3 },
        ],
      },
      {
        label: "Divert {rival} freighters to absorb the harmonic bleed",
        result: "Quietly routing foreign hulls through the unstable node bleeds off excess energy while singeing the {rival}'s escorts.",
        shift: { mercy: -1, openness: -2 },
        sets: ["overcharged-gate-anchor"],
        effects: [
          { kind: "research", field: "forceFields", amount: 240 },
          { kind: "money", amount: 180 },
          { kind: "relations", amount: -18 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-3-house-heresy",
    raceId: "velari",
    act: 3,
    kind: "act",
    title: "The Crown of Glass",
    art: "council",
    text: "Common-born engineers who built {colony}'s orbital spires demand admission to the High Conclave of Gate-Houses, challenging centuries of Velari noble blood-right.",
    choices: [
      {
        label: "Dissolve blood-titles into a merit conclave",
        result: "Opening high office to common artisans energizes industry and civic spirit across {colony}.",
        shift: { tradition: -2, openness: 2 },
        sets: ["opened-merit-conclave"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "morale", amount: 6 },
          { kind: "culture", amount: -110 },
        ],
      },
      {
        label: "Reaffirm the Ancient Houses' sacred mandate",
        result: "Preserving aristocratic lineage uplifts traditional art and ceremonial order while frustrating young guilds.",
        shift: { tradition: 2, openness: -1 },
        sets: ["upheld-noble-houses"],
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 4 },
          { kind: "factories", amount: -4 },
        ],
      },
      {
        label: "Create an Outer Guild Chamber beneath the Houses",
        result: "Granting builders an advisory voice keeps workshops productive without toppling ancestral hierarchy.",
        shift: { tradition: 1, mercy: 1 },
        sets: ["upheld-noble-houses"],
        effects: [
          { kind: "research", field: "construction", amount: 220 },
          { kind: "culture", amount: 90 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-3-stolen-chord",
    raceId: "velari",
    act: 3,
    kind: "act",
    title: "The Mimic Beacon",
    art: "crisis",
    text: "Border listeners near {star} discover the {rival} has reverse-engineered a crude copy of Velari phase-chords, risking catastrophic resonance collisions across our shared frontier.",
    choices: [
      {
        label: "Gift them safe harmonic tables to prevent disaster",
        result: "Sharing our sacred tuning prevents void-collapses and stuns the {rival} with Velari magnanimity.",
        shift: { mercy: 2, openness: 2 },
        sets: ["gifted-phase-tables"],
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "culture", amount: 135 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Broadcast a dissonant pulse to shatter their gates",
        result: "Weaponized harmonics cripple the {rival}'s transit beacons and advance our weapons craft at steep diplomatic cost.",
        shift: { mercy: -2, openness: -2 },
        sets: ["shattered-rival-gates"],
        effects: [
          { kind: "research", field: "weapons", amount: 280 },
          { kind: "morale", amount: 5 },
          { kind: "relations", amount: -20 },
        ],
      },
      {
        label: "Demand exclusive gate-inspection rights at {star}",
        result: "Asserting sovereign oversight protects the lanes while reminding the {rival} of Velari seniority.",
        shift: { tradition: 2, openness: -1 },
        sets: ["shattered-rival-gates"],
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "money", amount: 170 },
          { kind: "relations", amount: -12 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-velari-4-grand-spire",
    raceId: "velari",
    act: 4,
    kind: "act",
    title: "The Celestial Tuning Fork",
    art: "supernova",
    text: "Master architects on {colony} complete designs for a continent-spanning resonance spire capable of linking every Velari jump-gate near {star} into a single instantaneous chorus.",
    choices: [
      {
        label: "Raise the spire as an open interstellar crossroads",
        result: "Inviting all peaceful empires to step through our golden thresholds crowns Velari cultural mastery.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 230 },
          { kind: "relations", amount: 24 },
          { kind: "money", amount: -320 },
        ],
      },
      {
        label: "Lock the lattice for sovereign Velari fleets alone",
        result: "Unmatched strategic mobility turns our navy into phantoms across the stars while alienating neighbors.",
        shift: { openness: -2, tradition: 1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 420 },
          { kind: "research", field: "forceFields", amount: 360 },
          { kind: "relations", amount: -20 },
        ],
      },
      {
        label: "Channel the spire's harmonics into planetary renewal",
        result: "Resonant terraforming waves heal scarred crusts and expand living cities across {colony}.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "planetSize", amount: 7 },
          { kind: "population", amount: 5 },
          { kind: "money", amount: -340 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-4-pilgrim-exodus",
    raceId: "velari",
    act: 4,
    kind: "act",
    title: "Beyond the Outer Ring",
    art: "victory",
    text: "Long-range gate echoes beyond {star} reveal untouched star clusters waiting beyond known space. Seer-captains on {colony} ask whether to dispatch great pilgrim arks or consolidate our ancient seat.",
    choices: [
      {
        label: "Send forth the Golden Gate-Arks",
        result: "Noble houses and artisans sail into virgin constellations to raise new marble cities, thinning home crews.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "ships", template: "colony", count: 2 },
          { kind: "revealStars", count: 6 },
          { kind: "population", amount: -3 },
        ],
      },
      {
        label: "Crown {colony} as the Eternal Sanctuary",
        result: "Concentrating our finest builders at home elevates industry and monument craft to breathtaking heights.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "culture", amount: 210 },
          { kind: "morale", amount: 7 },
        ],
      },
      {
        label: "Share deep-rim charts with allied explorers",
        result: "Co-sponsoring frontier expeditions strengthens diplomatic trust and construction science.",
        shift: { mercy: 1, openness: 2 },
        effects: [
          { kind: "relations", amount: 22 },
          { kind: "research", field: "construction", amount: 380 },
          { kind: "money", amount: -240 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-4-reckoning-of-stone",
    raceId: "velari",
    act: 4,
    kind: "act",
    title: "The Final Chord",
    art: "council",
    text: "Gathered beneath the star-domes of {colony}, the High Conclave debates the enduring soul of the Velari: aloof arbiters of ancient mystery, or warm stewards of a shared galaxy.",
    choices: [
      {
        label: "Proclaim the Covenant of Open Thresholds",
        result: "Velari gates become sanctuaries of peace, art, and commerce for every starfaring people.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "culture", amount: 240 },
          { kind: "relations", amount: 25 },
          { kind: "money", amount: 280 },
        ],
      },
      {
        label: "Enforce the Doctrine of Sovereign Mystery",
        result: "Veiled behind impenetrable phase-walls, the Velari command fear and awe from lesser empires.",
        shift: { openness: -2, mercy: -2 },
        effects: [
          { kind: "research", field: "weapons", amount: 400 },
          { kind: "factories", amount: 11 },
          { kind: "relations", amount: -24 },
        ],
      },
      {
        label: "Dedicate our works to the Ancestral Choir",
        result: "Timeless rituals and grand marble colonnades unite every Velari citizen in serene pride.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "morale", amount: 8 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-velari-branch-obelisk-resonance",
    raceId: "velari",
    act: 2,
    kind: "branch",
    needs: ["completed-star-obelisk"],
    title: "The Solar Alignment",
    art: "supernova",
    text: "On the solstice of {colony}, the completed star-obelisk catches light from {star} and projects crisp geometric coordinates pointing toward hidden transit nodes across the sector.",
    choices: [
      {
        label: "Dispatch seer-scouts along the projected lines",
        result: "Following ancestral stone-geometry reveals distant systems and sharpens phase-navigation.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "propulsion", amount: 210 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Inscribe the coordinates into secret House vaults",
        result: "Hoarding the astral map elevates noble prestige across {colony}, though outer guilds chafe at exclusion.",
        shift: { tradition: 2, openness: -2 },
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -80 },
        ],
      },
      {
        label: "Open the obelisk observatory to all citizens",
        result: "Public stargazing festivals lift civic spirit and inspire young engineers across {colony}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 110 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-branch-gate-smugglers",
    raceId: "velari",
    act: 3,
    kind: "branch",
    needs: ["shared-gate-lanes"],
    title: "Contraband in the Chord",
    art: "pirates",
    text: "Taking advantage of the open gate-lanes we granted near {star}, privateer captains from the {rival} slip through {colony}'s outer ring carrying unlicensed phase-weapons.",
    choices: [
      {
        label: "Impound the contraband and fine the {rival}",
        result: "Firm customs enforcement replenishes our vaults and proves Velari hospitality is not weakness.",
        shift: { tradition: 1, mercy: -1 },
        effects: [
          { kind: "money", amount: 240 },
          { kind: "research", field: "weapons", amount: 220 },
          { kind: "relations", amount: -15 },
        ],
      },
      {
        label: "Negotiate joint lane-inspection patrols",
        result: "Co-policing the gate with the {rival} turns a security breach into deeper diplomatic trust.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 115 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Close the gate-lanes to all foreign hulls",
        result: "Sealing the thresholds restores domestic serenity on {colony} while angering the {rival}.",
        shift: { openness: -2, tradition: 2 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "research", field: "forceFields", amount: 230 },
          { kind: "relations", amount: -20 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-branch-overcharged-scars",
    raceId: "velari",
    act: 4,
    kind: "branch",
    needs: ["overcharged-gate-anchor"],
    blockedBy: ["severed-gate-anchor"],
    title: "The Trembling Spire",
    art: "crisis",
    text: "Years after we overcharged the gate-anchor near {star}, latent harmonic stress fractures the marble foundations of {colony}'s oldest temple-district.",
    choices: [
      {
        label: "Pour treasury reserves into harmonic dampers",
        result: "Massive stabilizing rings save the ancient shrines and win grateful relief from {colony}'s citizens.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "culture", amount: 190 },
          { kind: "morale", amount: 7 },
          { kind: "money", amount: -360 },
        ],
      },
      {
        label: "Evacuate the district and harvest the crystal fault",
        result: "Stripping energized bedrock supercharges phase-shield research while erasing centuries of heritage.",
        shift: { mercy: -2, tradition: -2 },
        effects: [
          { kind: "research", field: "forceFields", amount: 390 },
          { kind: "factories", amount: 9 },
          { kind: "culture", amount: -160 },
        ],
      },
      {
        label: "Redirect the excess bleed into orbital shipyards",
        result: "Tapping the fault powers dockyard gantries cleanly, though subtle tremors unsettle coastal towns.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "research", field: "construction", amount: 310 },
          { kind: "morale", amount: -5 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-branch-merit-revolt",
    raceId: "velari",
    act: 4,
    kind: "branch",
    needs: ["opened-merit-conclave"],
    blockedBy: ["upheld-noble-houses"],
    title: "The Dispossessed Choir",
    art: "council",
    text: "Stripped of hereditary seats on {colony}, traditionalist gate-lords withdraw to an orbital sanctuary near {star}, threatening to take ancestral tuning-keys into permanent exile.",
    choices: [
      {
        label: "Grant them ceremonial stewardship of the archives",
        result: "Honoring elder wisdom without restoring feudal vetoes heals {colony}'s cultural rift.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "morale", amount: 7 },
          { kind: "money", amount: -220 },
        ],
      },
      {
        label: "Seize the tuning-keys by fleet decree",
        result: "Confiscating noble relics secures modern gate control and computer telemetry at bitter emotional cost.",
        shift: { mercy: -2, tradition: -2 },
        effects: [
          { kind: "research", field: "computers", amount: 350 },
          { kind: "factories", amount: 9 },
          { kind: "morale", amount: -7 },
        ],
      },
      {
        label: "Let the old Houses depart to found an outer colony",
        result: "Parting in peace turns proud traditionalists into eager pioneers beyond {star}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "ships", template: "colony", count: 1 },
          { kind: "revealStars", count: 5 },
          { kind: "population", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-branch-rival-harmony",
    raceId: "velari",
    act: 4,
    kind: "branch",
    needs: ["gifted-phase-tables"],
    blockedBy: ["shattered-rival-gates"],
    title: "The Dual-Chord Bridge",
    art: "contact",
    text: "Using the safe harmonic tables we gifted them, gate-wrights from the {rival} tune a beacon near {star} to harmonize directly with {colony}, proposing a permanent joint transit ring.",
    choices: [
      {
        label: "Anchor the joint transit ring together",
        result: "Co-engineered phase-gates bind our economies and astonish the galaxy with Velari-led fellowship.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "relations", amount: 26 },
          { kind: "money", amount: 320 },
          { kind: "culture", amount: 190 },
        ],
      },
      {
        label: "Embed silent listening arrays inside the joint node",
        result: "Covert telemetry maps every fleet movement of the {rival} behind a warm diplomatic smile.",
        shift: { openness: -2, mercy: -1 },
        effects: [
          { kind: "research", field: "computers", amount: 380 },
          { kind: "revealStars", count: 6 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Require ancestral Velari rites at every crossing",
        result: "Enforcing ceremonial protocol elevates Velari cultural prestige across both empires.",
        shift: { tradition: 2, openness: 1 },
        effects: [
          { kind: "culture", amount: 230 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-velari-end-open-threshold",
    raceId: "velari",
    needs: { openness: { min: 5 }, mercy: { min: 4 } },
    title: "The Bridge of Stars",
    art: "victory",
    text: "By opening sacred gate-lanes and sharing harmonic wisdom, the Velari transform a bitter adversary into a devoted partner under the light of shared thresholds.",
    outcome: "rivalBecomesAlly",
    choices: [
      {
        label: "Open the golden gate together",
        result: "Former rivals step across the threshold as sworn allies of the Velari.",
        effects: [
          { kind: "culture", amount: 230 },
          { kind: "money", amount: 320 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-end-veiled-citadel",
    raceId: "velari",
    needs: { openness: { max: -4 }, mercy: { max: -3 } },
    title: "The Unseen Bastion",
    art: "crisis",
    text: "Shrouded behind weaponized phase-walls and inscrutable silence, the Velari strike from nowhere and vanish—leaving every neighbor paralyzed by dread of our unseen gates.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Seal the outer phase-veil",
        result: "No rival fleet dares provoke the silent masters of the threshold.",
        effects: [
          { kind: "research", field: "forceFields", amount: 400 },
          { kind: "research", field: "weapons", amount: 380 },
          { kind: "relations", amount: -25 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-end-pilgrim-constellation",
    raceId: "velari",
    needs: { openness: { min: 4 }, tradition: { max: -3 } },
    title: "The Star-Sown Choir",
    art: "supernova",
    text: "Unbound from homebound ancestral stone, eager Velari house-arks step through distant phase-thresholds to seed luminous new colonies across the outer rim.",
    outcome: "exodus",
    choices: [
      {
        label: "Step into the uncharted dawn",
        result: "New Velari spires rise on distant worlds as pilgrim fleets scatter across the stars.",
        effects: [
          { kind: "revealStars", count: 8 },
          { kind: "culture", amount: 200 },
          { kind: "population", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "saga-velari-end-eternal-sanctuary",
    raceId: "velari",
    title: "The Resonant Crown",
    art: "victory",
    text: "Harmonizing ancient stone-craft with bold phase mastery, {colony} enters a serene golden age of soaring monuments and effortless grace.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Sound the eternal chord",
        result: "Luminous marble spires and tranquil gates usher in a Velari golden age.",
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "morale", amount: 8 },
          { kind: "factories", amount: 10 },
        ],
      },
    ],
  },
];
