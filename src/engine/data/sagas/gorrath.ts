// gorrath saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
// Gorrath Clans saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-gorrath-1-frost-plague",
    raceId: "gorrath",
    act: 1,
    kind: "act",
    title: "Rime-Rot in the Hold",
    art: "crisis",
    text: "A cold-adapted fungal blight sweeps the lower habitation decks of a Gorrath worldship anchored above {colony}. Clan healers say isolating the deck saves the fleet's fuel reserves, while boarding crews demand docking with {rival} medical barges near {star}.",
    choices: [
      {
        label: "Request medical aid from the {rival}",
        result: "Swallowing clan pride saves hundreds of keel-hands and warms relations with the {rival}, at steep treasury cost.",
        shift: { mercy: 2, openness: 1 },
        sets: ["accepted-rival-remedy"],
        effects: [
          { kind: "relations", amount: 14 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Weld the infected bulkheads shut",
        result: "Quarantine preserves our drive fuel and shipyard schedules, though grim mourning drums echo through {colony}.",
        shift: { mercy: -2, tradition: 1 },
        effects: [
          { kind: "factories", amount: 5 },
          { kind: "population", amount: -2 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Burn the blighted moss for bio-distillates",
        result: "Hearth-alchemists boil the fungus into harsh tonic that cures half the sick and reveals new planetology tricks.",
        shift: { tradition: -1, openness: -1 },
        effects: [
          { kind: "research", field: "planetology", amount: 210 },
          { kind: "population", amount: -1 },
          { kind: "money", amount: -70 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-1-ice-leviathan",
    raceId: "gorrath",
    act: 1,
    kind: "act",
    title: "The Frost-Back Wanderer",
    art: "anomaly",
    text: "Navigating the cometary halo of {star}, Gorrath vanguard hulls cross paths with a colossal silicate-shelled void-beast grazing on ice moons. Young harpoon-captains clamor to hunt it for trophies, while elders recognize a sacred omen from old tundra sagas.",
    choices: [
      {
        label: "Follow its migration trail into the dark",
        result: "Escorting the beast leads our worldships along hidden gravity currents to uncharted systems.",
        shift: { tradition: 1, openness: 1 },
        sets: ["followed-void-beast"],
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "culture", amount: 90 },
          { kind: "money", amount: -80 },
        ],
      },
      {
        label: "Harpoon the beast and strip its shell",
        result: "Towering bone-plates reinforce {colony}'s hulls and thrill blooded crews, though elders warn of ill luck.",
        shift: { mercy: -1, tradition: -1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: 4 },
          { kind: "culture", amount: -50 },
        ],
      },
      {
        label: "Carve beacon-runes onto its ice-horn",
        result: "Marking the creature as a living clan boundary stone delights singers and steadies frontier morale.",
        shift: { tradition: 2 },
        effects: [
          { kind: "culture", amount: 115 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-1-wayfinder-boy",
    raceId: "gorrath",
    act: 1,
    kind: "act",
    title: "The Blind Navigator",
    art: "contact",
    text: "An orphaned deck-hand born without sight aboard a battered ice-hauler near {star} predicts warp eddies by listening to hull harmonics. Traditional helm-masters want him bound to ancestral chant-schools, while engineers want his brain wired to nav-arrays.",
    choices: [
      {
        label: "Train him in the ancient keel-chants",
        result: "His uncanny songs blend old nomad lore with crisp jump bearings, lifting pride across {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 105 },
          { kind: "research", field: "propulsion", amount: 150 },
          { kind: "money", amount: -85 },
        ],
      },
      {
        label: "Link him directly to experimental nav-cores",
        result: "Machine-assisted charts shave weeks off transit times, though the boy grows silent and distant.",
        shift: { tradition: -2, mercy: -1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 240 },
          { kind: "research", field: "computers", amount: 140 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Send him aboard a scout wing to chart borders",
        result: "Free to roam the forward bridge, he guides two fast scouts through dense asteroid belts near {star}.",
        shift: { openness: 1 },
        effects: [
          { kind: "ships", template: "scout", count: 2 },
          { kind: "revealStars", count: 3 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-gorrath-2-cursed-gift",
    raceId: "gorrath",
    act: 2,
    kind: "act",
    title: "Tribute of Warm Amber",
    art: "contact",
    text: "Envoys from the {rival} gift our war-chiefs a gleaming cryo-reliquary filled with exotic spices and self-repairing hull gel for {colony}. Keel-smiths warn the gel carries micro-beacons tracking every Gorrath worldship.",
    choices: [
      {
        label: "Accept the gift openly and share feast-halls",
        result: "Warm hospitality charms the {rival} and lifts civic spirits, even if their scouts read our outer routes.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: 120 },
        ],
      },
      {
        label: "Feed the gel false coordinates and reverse-engineer it",
        result: "Our smiths turn the {rival}'s own trackers into decoy buoys while copying their hull chemistry.",
        shift: { openness: -2, tradition: -1 },
        sets: ["spoofed-rival-beacons"],
        effects: [
          { kind: "research", field: "construction", amount: 250 },
          { kind: "revealStars", count: 4 },
          { kind: "relations", amount: -14 },
        ],
      },
      {
        label: "Smelt the reliquary in front of their envoys",
        result: "Refusing soft luxuries proves Gorrath self-reliance, rallying fierce pride while chilling border talks.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "factories", amount: 5 },
          { kind: "relations", amount: -15 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-2-stray-mooring",
    raceId: "gorrath",
    act: 2,
    kind: "act",
    title: "The Rooted Clan",
    art: "ruins",
    text: "Explorers near {star} discover a lost Gorrath worldship whose engines failed three centuries ago, its descendants now living in subterranean ice-cities and refusing to ever fly again.",
    choices: [
      {
        label: "Honor their hearth and send supply convoys",
        result: "Welcoming our rooted kin back into the clan roll swells population and warms ancestral pride.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "population", amount: 4 },
          { kind: "culture", amount: 110 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "Strip their grounded hull for colony ship parts",
        result: "Reclaimed reactor rings speed new worldship builds on {colony}, leaving bitter kin behind.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "ships", template: "colony", count: 1 },
          { kind: "factories", amount: 5 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Study their deep-ice survival engineering",
        result: "Three centuries of closed-loop habitation teach our crews how to thrive on harsh frozen worlds.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "research", field: "planetology", amount: 260 },
          { kind: "planetSize", amount: 3 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-2-ash-festival",
    raceId: "gorrath",
    act: 2,
    kind: "act",
    title: "The Red-Ice Solstice",
    art: "supernova",
    text: "During the traditional Great Burn festival on {colony}, ceremonial plasma torches ignite volatile methane pockets beneath the tundra, threatening both ancient clan cairns and main refinery domes.",
    choices: [
      {
        label: "Divert fire-crews to save the ancestral cairns",
        result: "Sacred stones survive intact and clan elders praise our devotion, though melted smelters cost output.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "morale", amount: 4 },
          { kind: "factories", amount: -5 },
        ],
      },
      {
        label: "Flood the cairns with coolant to save the refineries",
        result: "Shattered heritage stones anger traditional singers, yet industrial production on {colony} never misses a beat.",
        shift: { tradition: -2, mercy: -1 },
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "money", amount: 160 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Harness the venting gas in emergency turbines",
        result: "Daring engineers cap the geysers to charge battery banks, turning disaster into a gritty triumph.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 220 },
          { kind: "money", amount: 130 },
          { kind: "population", amount: -1 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-gorrath-3-blood-brother-treason",
    raceId: "gorrath",
    act: 3,
    kind: "act",
    title: "The Kinsman's Ledger",
    art: "crisis",
    text: "War-horn scouts near {star} intercept supply shuttles carrying Gorrath reactor cores straight into {rival} dockyards, signed off by the High Admiral's own younger brother to pay off gambling debts.",
    choices: [
      {
        label: "Cast the brother adrift in an unpowered pod",
        result: "Merciless clan justice terrifies would-be traitors and hardens discipline across {colony}, though quiet grief lingers.",
        shift: { mercy: -2, tradition: 2 },
        sets: ["cast-out-kinsman"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "morale", amount: 3 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Conscript him to lead mine-clearing vanguard hulls",
        result: "Allowing him to bleed for redemption rallies crew loyalty and sharpens tactical telemetry near {star}.",
        shift: { mercy: 1, tradition: 1 },
        sets: ["redeemed-kinsman"],
        effects: [
          { kind: "research", field: "weapons", amount: 250 },
          { kind: "culture", amount: 110 },
          { kind: "money", amount: -120 },
        ],
      },
      {
        label: "Turn his smuggling ring into a double-agent channel",
        result: "Feeding doctored drive blueprints to the {rival} drains their treasury into ours while shocking old-guard elders.",
        shift: { openness: -2, tradition: -2 },
        sets: ["cast-out-kinsman"],
        effects: [
          { kind: "money", amount: 270 },
          { kind: "research", field: "computers", amount: 230 },
          { kind: "culture", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-3-dying-choir-ship",
    raceId: "gorrath",
    act: 3,
    kind: "act",
    title: "Ashes of the Cinder-Kin",
    art: "contact",
    text: "Beyond {star}, Gorrath worldships hail a drifting crystal-hulled ark carrying the last hundred survivors of a gentle, star-mapping people whose home sun collapsed. They offer their complete galactic star-atlas in exchange for towing their ark to warm orbit.",
    choices: [
      {
        label: "Burn heavy fuel to tow them to safe orbit",
        result: "Rescuing a vanishing people fills {colony} with wonder and earns priceless charts, draining fuel reserves.",
        shift: { mercy: 2, openness: 2 },
        sets: ["sheltered-dying-kin"],
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "culture", amount: 145 },
          { kind: "money", amount: -220 },
        ],
      },
      {
        label: "Board the ark and copy the atlas by force",
        result: "Taking the charts without wasting fuel leaves the fragile ark drifting cold, chilling even hardened raiders.",
        shift: { mercy: -2, openness: -1 },
        sets: ["abandoned-dying-kin"],
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "research", field: "propulsion", amount: 260 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Record their death-songs and leave supply caches",
        result: "Honoring their passing in Gorrath saga-halls preserves their memory without overextending our fleet.",
        shift: { tradition: 1, mercy: 1 },
        sets: ["sheltered-dying-kin"],
        effects: [
          { kind: "culture", amount: 125 },
          { kind: "research", field: "planetology", amount: 190 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-3-long-winter-prophet",
    raceId: "gorrath",
    act: 3,
    kind: "act",
    title: "The Hearth-Seer's Warning",
    art: "supernova",
    text: "An aged bone-reader on {colony} foretells that settled worlds will soon shatter in cosmic fire, urging all Gorrath to abandon planetary cities and return forever to deep-space worldships.",
    choices: [
      {
        label: "Heed the prophecy and build new worldships",
        result: "Frenzied keel-laying turns out fresh colony hulls and rekindles nomad spirit, emptying planetary treasuries.",
        shift: { tradition: 2, openness: -1 },
        sets: ["heeded-nomad-prophecy"],
        effects: [
          { kind: "ships", template: "colony", count: 2 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -260 },
        ],
      },
      {
        label: "Denounce superstition and double planetary industry",
        result: "Mocking old bone-omens spurs modern foundry expansion on {colony}, though traditional clans mutter of doom.",
        shift: { tradition: -2, openness: 1 },
        sets: ["scorned-nomad-prophecy"],
        effects: [
          { kind: "factories", amount: 9 },
          { kind: "research", field: "construction", amount: 240 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Fortify orbital habitats above {colony}",
        result: "Hedging between soil and starlight builds resilient orbital yards at steady financial cost.",
        shift: { tradition: 1, mercy: 1 },
        sets: ["heeded-nomad-prophecy"],
        effects: [
          { kind: "planetSize", amount: 4 },
          { kind: "research", field: "forceFields", amount: 200 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-gorrath-4-iron-warlord-crown",
    raceId: "gorrath",
    act: 4,
    kind: "act",
    title: "The Unbroken Helm",
    art: "victory",
    text: "Victor of a dozen border clashes near {star}, Grand Fleet-Chief Varg demands the Clan Assembly abolish rotating tribal councils and crown him lifetime High Sovereign of all Gorrath.",
    choices: [
      {
        label: "Crown him High Sovereign for total war",
        result: "Unified command unleashes terrifying industrial and weapon output across {colony}, crushing dissent.",
        shift: { mercy: -2, tradition: -2 },
        effects: [
          { kind: "research", field: "weapons", amount: 390 },
          { kind: "factories", amount: 12 },
          { kind: "morale", amount: -7 },
        ],
      },
      {
        label: "Uphold the ancient Circle of Keels",
        result: "Forcing the hero to lay down his baton preserves free clan rule and inspires proud sagas across {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "morale", amount: 7 },
          { kind: "factories", amount: -5 },
        ],
      },
      {
        label: "Send him to command an outer exploration armada",
        result: "Channeling his ambition into deep-void discovery maps distant sectors and relieves domestic tension.",
        shift: { openness: 2 },
        effects: [
          { kind: "revealStars", count: 7 },
          { kind: "ships", template: "scout", count: 3 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-4-forbidden-bone-carvings",
    raceId: "gorrath",
    act: 4,
    kind: "act",
    title: "The Crimson Scrimshaw",
    art: "council",
    text: "Young hull-artists on {colony} carve piercing satirical murals onto battleship armor depicting clan wars as senseless slaughter, drawing crowds from {rival} trade ships while enraging war-priests.",
    choices: [
      {
        label: "Protect the artists and tour their murals abroad",
        result: "Bold honesty captivates neighboring worlds and deepens Gorrath cultural renown, though war-priests fume.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 230 },
          { kind: "relations", amount: 22 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Sandblast the hulls and imprison the carvers",
        result: "Restoring grim martial uniformity steadies veteran discipline and shipyard pace on {colony}.",
        shift: { mercy: -2, tradition: 2 },
        effects: [
          { kind: "factories", amount: 9 },
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: -140 },
        ],
      },
      {
        label: "Turn the hull-panels into a public peace memorial",
        result: "Mounting the carved plates in {colony}'s central hall channels grief into dignified remembrance.",
        shift: { mercy: 1, tradition: 1 },
        effects: [
          { kind: "culture", amount: 180 },
          { kind: "population", amount: 3 },
          { kind: "money", amount: -240 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-4-moon-shatter",
    raceId: "gorrath",
    act: 4,
    kind: "act",
    title: "Frost-Moon Falling",
    art: "crisis",
    text: "Tidal shear fractures the main icy moon orbiting {colony}, sending a rain of bergs toward our shipyards and threatening to choke orbit with impassable debris.",
    choices: [
      {
        label: "Anchor thruster-tugs to tow survivors clear",
        result: "Heroic rescue runs save thousands of moon-miners and win galactic admiration at staggering cost.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "population", amount: 5 },
          { kind: "relations", amount: 18 },
          { kind: "money", amount: -380 },
        ],
      },
      {
        label: "Blast the fragments for rare core metals",
        result: "Weapon batteries pulverize the falling ice-crust, showering {colony} with bullion and orbital slag.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "money", amount: 420 },
          { kind: "research", field: "weapons", amount: 320 },
          { kind: "population", amount: -4 },
        ],
      },
      {
        label: "Weave the ice-ring into an orbital shipyard belt",
        result: "Master keel-wrights lash the drifting bergs into sheltered drydocks, expanding habitable orbital space.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "planetSize", amount: 7 },
          { kind: "research", field: "construction", amount: 350 },
          { kind: "money", amount: -290 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-gorrath-branch-spoiled-remedy",
    raceId: "gorrath",
    act: 2,
    kind: "branch",
    needs: ["accepted-rival-remedy"],
    title: "The Bitter Draught",
    art: "crisis",
    text: "Months after the {rival} medical barges cured the rime-rot on {colony}, healed deck-hands develop sudden lethargy whenever {rival} signal buoys ping near {star}, revealing a hidden neural sedative in the cure.",
    choices: [
      {
        label: "Purge the sedative and demand restitution",
        result: "Clan apothecaries flush the taint while angry envoys extract heavy coin indemnities from the {rival}.",
        shift: { mercy: -1, openness: -2 },
        effects: [
          { kind: "money", amount: 240 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Reverse-engineer the compound for fleet med-bays",
        result: "Studying the bio-agent unlocks resilient planetology treatments without sparking border war.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "research", field: "planetology", amount: 260 },
          { kind: "culture", amount: 85 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Forgive the sleight and share the antidote openly",
        result: "Publishing our clean counter-formula shames the {rival}'s schemers and earns galactic respect.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "relations", amount: 15 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-branch-beast-graveyard",
    raceId: "gorrath",
    act: 2,
    kind: "branch",
    needs: ["followed-void-beast"],
    title: "The Ice-Shell Sanctum",
    art: "ruins",
    text: "Following the Frost-Back Wanderer's trail past {star} leads Gorrath worldships into a quiet nebula packed with generations of ancient void-beast shells and gleaming meteoric iron.",
    choices: [
      {
        label: "Harvest the shed ice-plates for shipyards",
        result: "Naturally cast bio-armor supercharges factory builds on {colony} without harming a living creature.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "research", field: "construction", amount: 210 },
          { kind: "money", amount: 140 },
        ],
      },
      {
        label: "Declare the nebula a sacred nomad shrine",
        result: "Pilgrimages to the quiet graveyard deepen clan songs and steady crew spirits across {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -120 },
        ],
      },
      {
        label: "Chart the gravity currents around the graveyard",
        result: "Mapping the beasts' migration eddies boosts propulsion science and reveals distant star lanes.",
        shift: { openness: 2 },
        effects: [
          { kind: "research", field: "propulsion", amount: 240 },
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-branch-ghost-cruiser",
    raceId: "gorrath",
    act: 3,
    kind: "branch",
    needs: ["spoofed-rival-beacons"],
    title: "The Phantom Armada",
    art: "pirates",
    text: "Lured by our spoofed hull-gel beacons near {star}, a {rival} hunter-killer squadron blunders straight into an asteroid trap, leaving three intact hulls drifting with dead reactors.",
    choices: [
      {
        label: "Claim the prize hulls and press them into service",
        result: "Refitted enemy scouts swell our patrol wing and lift raider pride on {colony}.",
        shift: { mercy: -1, openness: -1 },
        effects: [
          { kind: "ships", template: "scout", count: 3 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Tow the stranded crews home to the {rival}",
        result: "Returning their warriors alive turns a clever ambush into lasting diplomatic leverage.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "culture", amount: 120 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Strip their targeting cores for Gorrath gunners",
        result: "Salvaged fire-control arrays advance weapons research while leaving {rival} pride bruised.",
        shift: { tradition: -1, mercy: -1 },
        effects: [
          { kind: "research", field: "weapons", amount: 280 },
          { kind: "money", amount: 180 },
          { kind: "relations", amount: -14 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-branch-exile-return",
    raceId: "gorrath",
    act: 4,
    kind: "branch",
    needs: ["cast-out-kinsman"],
    blockedBy: ["redeemed-kinsman"],
    title: "The Drift-Lord's Return",
    art: "pirates",
    text: "Surviving his cold exile beyond {star}, the High Admiral's cast-out brother returns at the helm of a scarred mercenary flotilla, offering to shatter {rival} supply lines if his clan name is restored.",
    choices: [
      {
        label: "Accept his blades and welcome him back",
        result: "Reunited bloodlines unleash fierce strikes on border lanes, though traditional jurists grumble at broken oaths.",
        shift: { mercy: 2, tradition: -2 },
        effects: [
          { kind: "ships", template: "scout", count: 3 },
          { kind: "money", amount: 290 },
          { kind: "culture", amount: -110 },
        ],
      },
      {
        label: "Open fire on sight to uphold the banishment",
        result: "Blasting the kinsman's flagship proves Gorrath law never bends, inspiring grim awe across {colony}.",
        shift: { mercy: -2, tradition: 2 },
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "research", field: "weapons", amount: 310 },
          { kind: "population", amount: -2 },
        ],
      },
      {
        label: "Buy his charts and banish him beyond the rim",
        result: "Paying off the outcast buys peaceful borders and deep-space star maps without staining clan law.",
        shift: { openness: 1, tradition: 1 },
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "culture", amount: 130 },
          { kind: "money", amount: -260 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-branch-cinder-bequest",
    raceId: "gorrath",
    act: 4,
    kind: "branch",
    needs: ["sheltered-dying-kin"],
    blockedBy: ["abandoned-dying-kin"],
    title: "The Last Keel-Song",
    art: "victory",
    text: "As the final elder of the Cinder-Kin passes peacefully aboard {colony}, they bequeath their crystalline star-vaults and self-guiding worldship blueprints to the Gorrath clans who honored their twilight.",
    choices: [
      {
        label: "Build a fleet of crystal-prowed worldships",
        result: "Fusing Gorrath iron with Cinder-Kin star-sails launches far-ranging colony ships into the unknown.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "ships", template: "colony", count: 2 },
          { kind: "research", field: "propulsion", amount: 380 },
          { kind: "money", amount: -240 },
        ],
      },
      {
        label: "Weave their memory into our sacred saga-halls",
        result: "Two peoples' histories entwine in {colony}'s grand halls, elevating Gorrath culture across the galaxy.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 240 },
          { kind: "morale", amount: 7 },
          { kind: "money", amount: -180 },
        ],
      },
      {
        label: "Share their star-vaults with friendly neighbors",
        result: "Distributing the Cinder-Kin's peaceful discoveries wins warm gratitude from the {rival}.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "relations", amount: 24 },
          { kind: "research", field: "planetology", amount: 320 },
          { kind: "culture", amount: 140 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-gorrath-end-great-wandering",
    raceId: "gorrath",
    needs: { tradition: { min: 5 }, openness: { min: 3 } },
    title: "The Unbound Horizon",
    art: "victory",
    text: "True to the restless keel-songs of their ancestors, the Gorrath Clans launch a grand migratory armada beyond the rim, planting new hearths across distant stars while {colony} thins behind them.",
    outcome: "exodus",
    choices: [
      {
        label: "Cast off the moorings",
        result: "Countless worldships set sail for untamed horizons, carrying the Gorrath name across the deep void.",
        effects: [
          { kind: "revealStars", count: 8 },
          { kind: "culture", amount: 220 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-end-scourge-of-frost",
    raceId: "gorrath",
    needs: { mercy: { max: -5 }, openness: { max: -3 } },
    title: "The Iron Winter",
    art: "crisis",
    text: "Hardened by ruthless purges, piracy, and cold pragmatism, the Gorrath Clans become the dread of every border—no neighbor loves us, yet none dares provoke our iron worldships.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Let them fear the frost",
        result: "Rival fleets give wide berth to Gorrath lanes as our foundries roar unchallenged.",
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "research", field: "weapons", amount: 340 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-end-hearth-alliance",
    raceId: "gorrath",
    needs: { mercy: { min: 5 }, openness: { min: 4 } },
    title: "Kin of the Shared Fire",
    art: "council",
    text: "By tempering nomad pride with unexpected grace and open hearths, the Gorrath Clans win the devotion of our fiercest rival, uniting former foes around a single clan fire.",
    outcome: "rivalBecomesAlly",
    choices: [
      {
        label: "Pass the horn of brotherhood",
        result: "Sworn enemies lay down their blades and join the Gorrath Clans as trusted kin.",
        effects: [
          { kind: "culture", amount: 200 },
          { kind: "money", amount: 320 },
        ],
      },
    ],
  },
  {
    id: "saga-gorrath-end-song-of-keels",
    raceId: "gorrath",
    title: "The Eternal Drift",
    art: "victory",
    text: "Neither bound to cold stone nor lost to endless war, the Gorrath Clans thrive in a golden age of bold voyages, booming shipyards, and proud tundra sagas.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Keep the keels singing",
        result: "Worldships and ground hearths prosper together in a bright era of Gorrath strength.",
        effects: [
          { kind: "money", amount: 340 },
          { kind: "culture", amount: 190 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
];
