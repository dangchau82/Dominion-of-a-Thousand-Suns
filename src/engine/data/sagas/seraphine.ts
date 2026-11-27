// seraphine saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-seraphine-1-gilded-wing",
    raceId: "seraphine",
    act: 1,
    kind: "act",
    title: "The Plumed Prototype",
    art: "anomaly",
    text: "A celebrated aristocratic house on {colony} unveils a private phase-yacht clad in hand-beaten gold-foil feathers, demanding it lead our first reconnaissance flight toward {star} for pure aesthetic glory.",
    choices: [
      {
        label: "Crown the yacht as flagship of the vanguard",
        result: "Dazzling holo-broadcasts sweep {colony} in rapturous applause, though gaudy vanes drain shipyard coin.",
        shift: { tradition: 2, openness: 1 },
        sets: ["blessed-gilded-yacht"],
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Strip the gold foil for pure tactical telemetry",
        result: "Unadorned sensor pods map distant lanes cleanly and advance propulsion science, offending proud wing-lords.",
        shift: { tradition: -2, openness: -1 },
        sets: ["stripped-gilded-yacht"],
        effects: [
          { kind: "research", field: "propulsion", amount: 210 },
          { kind: "revealStars", count: 4 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Stage an exhibition regatta for foreign observers",
        result: "Graceful orbital maneuvers enchant scouts from {star} and warm early border relations.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 15 },
          { kind: "culture", amount: 90 },
          { kind: "money", amount: -80 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-1-rust-embassy",
    raceId: "seraphine",
    act: 1,
    kind: "act",
    title: "The Box-Hulled Envoys",
    art: "contact",
    text: "Diplomats from the {rival} dock at {colony}'s soaring spire-ports aboard a squat, soot-streaked freighter, and court stylists beg permission to politely mock their blunt manners in verse.",
    choices: [
      {
        label: "Welcome them with lavish, sincere hospitality",
        result: "Gracious Seraphine etiquette charms the {rival} delegation and opens lucrative luxury trade.",
        shift: { openness: 2, mercy: 2 },
        sets: ["charmed-rival-envoys"],
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "money", amount: 150 },
          { kind: "culture", amount: 70 },
        ],
      },
      {
        label: "Let court poets lampoon the mud-walkers",
        result: "Witty ballads delight {colony}'s high salons while the {rival} departs nursing bitter humiliation.",
        shift: { openness: -2, mercy: -1 },
        sets: ["mocked-rival-envoys"],
        effects: [
          { kind: "culture", amount: 115 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Gift them tailored silk robes before audience",
        result: "Subtle condescension wrapped in fine cloth satisfies salon vanity without triggering an incident.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "culture", amount: 95 },
          { kind: "relations", amount: 8 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-1-canyon-duel",
    raceId: "seraphine",
    act: 1,
    kind: "act",
    title: "The Ribbon of Wind",
    art: "ruins",
    text: "Two rival wing-captains on {colony} challenge each other to a live plasma-skiff duel through the razor-mesas near {star} to settle an ancient family slight.",
    choices: [
      {
        label: "Sanction the duel under ancient sky-law",
        result: "Breathtaking aerial grace rallies noble pride across {colony}, though a brilliant pilot falls in flames.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "morale", amount: 4 },
          { kind: "population", amount: -1 },
        ],
      },
      {
        label: "Outlaw lethal duels in favor of holo-bouts",
        result: "Preserving elite pilots accelerates computer-assisted flight training while conservative nobles sneer.",
        shift: { tradition: -2, mercy: 2 },
        effects: [
          { kind: "research", field: "computers", amount: 200 },
          { kind: "population", amount: 2 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Send both captains to race-chart {star}'s asteroid belt",
        result: "Turning rivalry into exploration maps rich orbital lanes and brings home rare mineral samples.",
        shift: { openness: 1, mercy: 1 },
        effects: [
          { kind: "revealStars", count: 3 },
          { kind: "money", amount: 140 },
          { kind: "culture", amount: 65 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-seraphine-2-clipped-wings",
    raceId: "seraphine",
    act: 2,
    kind: "act",
    title: "The Grounded Cohort",
    art: "crisis",
    text: "A generation of Seraphine raised inside low-ceilinged orbital shipyards above {colony} develops vestigial wing-crests, prompting highborn purists to bar them from officer commissions.",
    choices: [
      {
        label: "Grant equal officer rank to all wing-crests",
        result: "Meritocratic reform unleashes brilliant shipyard productivity on {colony}, though salon lords sulk.",
        shift: { openness: 2, tradition: -2 },
        sets: ["enfranchised-ground-born"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "research", field: "construction", amount: 220 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Reserve command for full-winged steppe nobles",
        result: "Upholding aristocratic lineage thrills traditional houses and elevates courtly morale across {colony}.",
        shift: { tradition: 2, openness: -1 },
        sets: ["preserved-winged-nobility"],
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "morale", amount: 5 },
          { kind: "factories", amount: -4 },
        ],
      },
      {
        label: "Design personal phase-gliders for orbital citizens",
        result: "Elegant anti-gravity harnesses let every citizen soar in Spire Halls, uniting {colony} at steep cost.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "research", field: "propulsion", amount: 190 },
          { kind: "money", amount: -190 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-2-perfume-monopoly",
    raceId: "seraphine",
    act: 2,
    kind: "act",
    title: "Essence of the High Steppe",
    art: "contact",
    text: "Steppe distillers on {colony} synthesize a luminous sky-blossom nectar coveted by {rival} aristocrats, while court traditionalists warn that mass-exporting royal scents cheapens our mystique.",
    choices: [
      {
        label: "Flood {rival} luxury markets with golden vials",
        result: "Extravagant markups pour immense wealth into {colony}'s vaults and warm ties with the {rival}.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "money", amount: 270 },
          { kind: "relations", amount: 16 },
          { kind: "culture", amount: -50 },
        ],
      },
      {
        label: "Keep the nectar exclusive to Seraphine salons",
        result: "Unattainable allure deepens cultural prestige and civic pride across every winged estate.",
        shift: { openness: -2, tradition: 2 },
        effects: [
          { kind: "culture", amount: 135 },
          { kind: "morale", amount: 5 },
          { kind: "relations", amount: -12 },
        ],
      },
      {
        label: "Gift rare flasks strictly to allied ambassadors",
        result: "Curated diplomatic favors win refined influence near {star} without glutting common bazaars.",
        shift: { openness: 1, mercy: 1 },
        effects: [
          { kind: "relations", amount: 14 },
          { kind: "culture", amount: 105 },
          { kind: "money", amount: 110 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-2-mirage-shields",
    raceId: "seraphine",
    act: 2,
    kind: "act",
    title: "The Prismatic Veil",
    art: "anomaly",
    text: "Phase-physicists orbiting {star} discover how to bend hull shields into dazzling holographic decoys—either to stage breathtaking peace pageants or lure enemy squadrons into lethal crossfires.",
    choices: [
      {
        label: "Deploy prismatic decoys as lethal fleet traps",
        result: "Phantom squadrons baffle hostile gunners and sharpen weapons doctrine across {colony}.",
        shift: { mercy: -1, tradition: -1 },
        effects: [
          { kind: "research", field: "weapons", amount: 240 },
          { kind: "research", field: "forceFields", amount: 190 },
          { kind: "relations", amount: -10 },
        ],
      },
      {
        label: "Project celestial light-symphonies across {colony}",
        result: "Sky-spanning aurora pageants lift every spirit and crown Seraphine artistry.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Use holographic beacons to guide lost freighters",
        result: "Shimmering lane-markers save civilian hulls near {star} and earn warm gratitude.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "money", amount: 160 },
          { kind: "research", field: "forceFields", amount: 150 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-seraphine-3-fallen-rival",
    raceId: "seraphine",
    act: 3,
    kind: "act",
    title: "The Velvet Surrender",
    art: "crisis",
    text: "After a dazzling flanking maneuver near {star}, the battered flagship of the {rival} drifts helplessly beneath our guns, its captain offering an ornate ceremonial sword in formal surrender.",
    choices: [
      {
        label: "Accept the blade and escort their crew home",
        result: "Chivalrous mercy wins astonished praise from the {rival} and elevates Seraphine honor across {colony}.",
        shift: { mercy: 2, openness: 2 },
        sets: ["spared-rival-flagship"],
        effects: [
          { kind: "relations", amount: 22 },
          { kind: "culture", amount: 150 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Shatter the flagship to prove sky-lord supremacy",
        result: "Ruthless gunnery leaves zero doubt of Seraphine lethality, terrifying border patrols near {star}.",
        shift: { mercy: -2, openness: -1 },
        sets: ["destroyed-rival-flagship"],
        effects: [
          { kind: "research", field: "weapons", amount: 290 },
          { kind: "morale", amount: 5 },
          { kind: "relations", amount: -22 },
        ],
      },
      {
        label: "Mount the captured sword in {colony}'s High Salon",
        result: "Trophy pageantry delights noble salons while ransoming the surviving officers for hefty coin.",
        shift: { tradition: 1, mercy: 1 },
        sets: ["spared-rival-flagship"],
        effects: [
          { kind: "money", amount: 240 },
          { kind: "culture", amount: 120 },
          { kind: "relations", amount: -8 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-3-salon-mutiny",
    raceId: "seraphine",
    act: 3,
    kind: "act",
    title: "The Gilded Deficit",
    art: "council",
    text: "Treasury auditors on {colony} warn that endless palace masques, feathered cruiser hulls, and aristocratic stipends are starving frontier shipyards near {star} of raw alloy.",
    choices: [
      {
        label: "Tax the High Salons to fund frontier foundries",
        result: "Redirecting noble luxury into heavy industry supercharges {colony}'s factories while salon lords fume.",
        shift: { tradition: -2, mercy: 1 },
        sets: ["taxed-high-salons"],
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "research", field: "construction", amount: 240 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Protect the stipends—beauty is our true strength",
        result: "Unbroken patronage inspires radiant artworks and fierce aristocratic devotion across {colony}.",
        shift: { tradition: 2, openness: -1 },
        sets: ["protected-high-salons"],
        effects: [
          { kind: "culture", amount: 160 },
          { kind: "morale", amount: 6 },
          { kind: "factories", amount: -5 },
        ],
      },
      {
        label: "Sell noble titles to wealthy off-world merchants",
        result: "Opening salon ranks to foreign bullion fills {colony}'s vaults while scandalizing old bloodlines.",
        shift: { openness: 2, tradition: -2 },
        sets: ["taxed-high-salons"],
        effects: [
          { kind: "money", amount: 310 },
          { kind: "relations", amount: 15 },
          { kind: "culture", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-3-whisper-verse",
    raceId: "seraphine",
    act: 3,
    kind: "act",
    title: "The Satire of the Spires",
    art: "contact",
    text: "Anonymous court playwrights on {colony} broadcast a razor-sharp holo-opera mocking both the {rival}'s clumsy diplomats and our own pompous wing-lords, drawing massive audiences across the border.",
    choices: [
      {
        label: "Celebrate free wit and invite {rival} critics",
        result: "Shared laughter dissolves stiff formality, warming ties with the {rival} and boosting cultural brilliance.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 145 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Censor the play and exile the troupe",
        result: "Defending aristocratic dignity steadies conservative houses on {colony} while chilling creative spirit.",
        shift: { openness: -2, tradition: 2 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "factories", amount: 6 },
          { kind: "culture", amount: -100 },
        ],
      },
      {
        label: "Secretly fund sharper satires aimed at {rival} morale",
        result: "Weaponized court wit undermines foreign prestige and sharpens computer-aided propaganda.",
        shift: { mercy: -1, openness: -1 },
        effects: [
          { kind: "research", field: "computers", amount: 260 },
          { kind: "money", amount: 150 },
          { kind: "relations", amount: -15 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-seraphine-4-sky-palace",
    raceId: "seraphine",
    act: 4,
    kind: "act",
    title: "The Crown of Cloud",
    art: "victory",
    text: "Floating above {colony}'s golden steppes, master architects complete a ring of anti-gravity spire-palaces capable of hosting the grandest diplomatic court or launching unmatched dreadnoughts.",
    choices: [
      {
        label: "Consecrate the Spires as a Galactic Salon",
        result: "Envoys from every star flock to {colony}'s floating courts, elevating Seraphine grace to interstellar law.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 24 },
          { kind: "money", amount: 290 },
        ],
      },
      {
        label: "Convert the orbital ring into gilded dreadnought yards",
        result: "Shimmering super-slips churn out lethal phase-cruisers while neighbors watch in dread.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "factories", amount: 13 },
          { kind: "research", field: "weapons", amount: 380 },
          { kind: "relations", amount: -20 },
        ],
      },
      {
        label: "Open the floating gardens to every Seraphine citizen",
        result: "Turning noble sky-palaces into public wonders ignites joyful prosperity across {colony}.",
        shift: { mercy: 2, tradition: -2 },
        effects: [
          { kind: "morale", amount: 8 },
          { kind: "population", amount: 4 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-4-feathered-fleet",
    raceId: "seraphine",
    act: 4,
    kind: "act",
    title: "Wings Over the Corona",
    art: "supernova",
    text: "Phase-engineers above {star} achieve harmonic resonance across entire cruiser wings, allowing Seraphine squadrons to dance through stellar coronas untouched by ordinary sensors.",
    choices: [
      {
        label: "Deploy stealth wing-patrols along rival borders",
        result: "Invisible phase-interceptors terrify neighboring admirals and perfect propulsion mastery.",
        shift: { openness: -2, mercy: -1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 410 },
          { kind: "revealStars", count: 6 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Charter royal phase-couriers for peaceful trade",
        result: "Instantaneous luxury and diplomatic couriers bind distant worlds and pour coin into {colony}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "money", amount: 410 },
          { kind: "relations", amount: 20 },
          { kind: "research", field: "propulsion", amount: 280 },
        ],
      },
      {
        label: "Stage a sector-wide aurora festival of flight",
        result: "Dazzling phase-trails paint the heavens above {colony} and {star}, inspiring transcendent art.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "morale", amount: 7 },
          { kind: "money", amount: -190 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-4-mirror-treaty",
    raceId: "seraphine",
    act: 4,
    kind: "act",
    title: "The Etiquette of Equals",
    art: "council",
    text: "At a grand summit near {star}, delegates from the {rival} ask the Seraphine Ascendancy to formally renounce aristocratic supremacy and sign a covenant of equal dignity among all starfaring peoples.",
    choices: [
      {
        label: "Sign the Covenant of Equal Grace",
        result: "Setting aside ancient vanity crowns the Seraphine as beloved leaders of a civilized galaxy.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "relations", amount: 25 },
          { kind: "culture", amount: 200 },
          { kind: "morale", amount: 5 },
        ],
      },
      {
        label: "Refuse—the winged were born to soar above",
        result: "Unapologetic aristocratic pride galvanizes {colony}'s houses while cooling ties with the {rival}.",
        shift: { tradition: 2, openness: -2 },
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "morale", amount: 7 },
          { kind: "relations", amount: -22 },
        ],
      },
      {
        label: "Offer honorary peerage to worthy {rival} leaders",
        result: "Cleverly folding foreign notables into Seraphine court ranks flatters egos and preserves prestige.",
        shift: { openness: 1, tradition: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "money", amount: 310 },
          { kind: "culture", amount: 140 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-seraphine-branch-gilded-regatta",
    raceId: "seraphine",
    act: 2,
    kind: "branch",
    needs: ["blessed-gilded-yacht"],
    blockedBy: ["stripped-gilded-yacht"],
    title: "The Sun-Foil Ballad",
    art: "anomaly",
    text: "Gleaming in gold leaf above {star}, the flagship yacht's solar-catching feathers accidentally focus ambient corona waves into a novel phase-harmonic, inspiring poets and physicists alike on {colony}.",
    choices: [
      {
        label: "Tune the gold vanes into phase-research mirrors",
        result: "Beauty meets science as reflective vanes boost propulsion research and cultural pride.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 240 },
          { kind: "culture", amount: 110 },
          { kind: "money", amount: -120 },
        ],
      },
      {
        label: "Tour the flagship through allied starports",
        result: "Dazzling diplomatic pageants win warm admiration and luxury commissions near {star}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "money", amount: 220 },
          { kind: "culture", amount: 90 },
        ],
      },
      {
        label: "Enshrine the vessel as a sacred royal heirloom",
        result: "Preserving the gilded hull in orbital glory uplifts noble morale across {colony}.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "morale", amount: 5 },
          { kind: "factories", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-branch-velvet-treaty",
    raceId: "seraphine",
    act: 2,
    kind: "branch",
    needs: ["charmed-rival-envoys"],
    blockedBy: ["mocked-rival-envoys"],
    title: "The Silk Exchange",
    art: "contact",
    text: "Delighted by our gracious hospitality on {colony}, aristocratic envoys from the {rival} propose a permanent cultural and luxury trade exchange linking our spire-ports with their border hubs near {star}.",
    choices: [
      {
        label: "Ratify the bilateral luxury compact",
        result: "Fine Seraphine silks and foreign bullion flow freely, enriching {colony} and warming ties.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "money", amount: 260 },
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 95 },
        ],
      },
      {
        label: "Open joint academies of art and diplomacy",
        result: "Cross-cultural salons elevate Seraphine etiquette to the gold standard of the sector.",
        shift: { openness: 2, tradition: 1 },
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "relations", amount: 15 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Keep trade one-way to preserve our mystique",
        result: "Selling high while importing nothing swells {colony}'s treasury without diluting high culture.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "money", amount: 230 },
          { kind: "culture", amount: 105 },
          { kind: "relations", amount: -8 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-branch-wingless-admirals",
    raceId: "seraphine",
    act: 3,
    kind: "branch",
    needs: ["enfranchised-ground-born"],
    blockedBy: ["preserved-winged-nobility"],
    title: "The Iron-Crest Armada",
    art: "council",
    text: "Promoted on merit on {colony}, orbital-born officers unveil sleek, modular phase-frigates stripped of aristocratic ornament, triggering fierce debate in the High Salons near {star}.",
    choices: [
      {
        label: "Commission full squadrons of modular frigates",
        result: "Streamlined construction doubles shipyard efficiency and sharpens fleet propulsion.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "research", field: "propulsion", amount: 260 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Adorn the modular hulls with engraved wing-crests",
        result: "Marrying practical engineering with noble artistry heals the divide on {colony}.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "research", field: "construction", amount: 250 },
          { kind: "culture", amount: 130 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Export modular hull frames to friendly neighbors",
        result: "Reliable Seraphine shipwrights win lucrative contracts and warm border goodwill.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "money", amount: 290 },
          { kind: "relations", amount: 16 },
          { kind: "culture", amount: -50 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-branch-chivalric-bond",
    raceId: "seraphine",
    act: 4,
    kind: "branch",
    needs: ["spared-rival-flagship"],
    blockedBy: ["destroyed-rival-flagship"],
    title: "The Returned Blade",
    art: "victory",
    text: "Moved by our chivalry after the battle near {star}, the rescued flagship captain of the {rival} arrives at {colony}'s spire-court bearing a formal proposal for a joint frontier peace watch.",
    choices: [
      {
        label: "Swear the Chivalric Watch together",
        result: "Former adversaries patrol border lanes side by side, crowning Seraphine honor across the stars.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "relations", amount: 24 },
          { kind: "culture", amount: 210 },
          { kind: "morale", amount: 6 },
        ],
      },
      {
        label: "Turn the truce into a bustling border free-port",
        result: "Peaceful convoys pour immense wealth into {colony}'s spire-bazaars.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "money", amount: 390 },
          { kind: "relations", amount: 18 },
          { kind: "factories", amount: 6 },
        ],
      },
      {
        label: "Accept their gratitude while keeping fleets sovereign",
        result: "Dignified independence preserves high aristocratic pride and sharpens shield defense.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "culture", amount: 190 },
          { kind: "research", field: "forceFields", amount: 320 },
          { kind: "morale", amount: 5 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-branch-salon-revolt",
    raceId: "seraphine",
    act: 4,
    kind: "branch",
    needs: ["protected-high-salons"],
    blockedBy: ["taxed-high-salons"],
    title: "The Velvet Strikes",
    art: "crisis",
    text: "Exhausted by funding endless palace masques while frontier yards rust near {star}, orbital dockworkers on {colony} blockade the spire-elevators and demand civic representation.",
    choices: [
      {
        label: "Grant dockworker guilds seats in the Court",
        result: "Sharing power revives {colony}'s foundries and morale, though proud wing-lords bristle.",
        shift: { mercy: 2, tradition: -2 },
        effects: [
          { kind: "factories", amount: 11 },
          { kind: "morale", amount: 7 },
          { kind: "culture", amount: -100 },
        ],
      },
      {
        label: "Send sky-guards to clear the spire-elevators",
        result: "Iron enforcement restores aristocratic order on {colony} while deepening bitter class resentment.",
        shift: { mercy: -2, tradition: 2 },
        effects: [
          { kind: "culture", amount: 180 },
          { kind: "money", amount: 260 },
          { kind: "morale", amount: -9 },
        ],
      },
      {
        label: "Fund public sky-gardens and worker stipends",
        result: "Lavish royal generosity buys peace across {colony} at steep treasury expense.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "morale", amount: 8 },
          { kind: "population", amount: 3 },
          { kind: "money", amount: -340 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-seraphine-end-gilded-tyranny",
    raceId: "seraphine",
    needs: { mercy: { max: -4 }, openness: { max: -3 } },
    title: "The Sovereign Sky",
    art: "crisis",
    text: "Looking down from soaring spire-palaces upon flightless worlds as mere subjects, the Seraphine Ascendancy enforces aristocratic supremacy with merciless precision—inspiring cold dread across every border.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Rule the heavens unchallenged",
        result: "Rival fleets cower beneath the shadow of gilded Seraphine dreadnoughts.",
        effects: [
          { kind: "research", field: "weapons", amount: 360 },
          { kind: "money", amount: 320 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-end-crimson-masque",
    raceId: "seraphine",
    needs: { mercy: { max: -4 }, tradition: { max: -3 } },
    title: "The Fallen Plume",
    art: "crisis",
    text: "Tearing down ancient chivalric codes while squeezing citizens to bankroll ruthless ambition shatters the Ascendancy from within, plunging {colony}'s sky-palaces and shipyards into bitter civil war.",
    outcome: "civilWar",
    choices: [
      {
        label: "Rally loyalist wings to the sky",
        result: "Gilded cruisers clash over {colony} as noble houses and orbital guilds tear the empire apart.",
        effects: [
          { kind: "research", field: "propulsion", amount: 300 },
          { kind: "morale", amount: -8 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-end-celestial-court",
    raceId: "seraphine",
    needs: { openness: { min: 4 }, mercy: { min: 4 } },
    title: "The Celestial Accord",
    art: "council",
    text: "Tempering aristocratic grace with genuine chivalry and open-hearted diplomacy, the Seraphine Ascendancy turns the galaxy into a court of equals—binding their fiercest rival into lasting alliance.",
    outcome: "rivalBecomesAlly",
    choices: [
      {
        label: "Raise a toast to shared skies",
        result: "Former rivals stand beside the Seraphine in dazzling mutual respect and enduring peace.",
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 25 },
        ],
      },
    ],
  },
  {
    id: "saga-seraphine-end-radiant-steppe",
    raceId: "seraphine",
    title: "The Golden Wing",
    art: "victory",
    text: "Poised, graceful, and radiant in art and phase-craft, the Seraphine Ascendancy enters a shimmering golden age of soaring spire-cities, inspired salons, and effortless prosperity.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Soar into the golden dawn",
        result: "Every Seraphine world gleams with cultural brilliance, joyful citizens, and thriving trade.",
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "morale", amount: 8 },
          { kind: "money", amount: 280 },
        ],
      },
    ],
  },
];
