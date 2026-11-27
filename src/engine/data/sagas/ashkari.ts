// ashkari saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-ashkari-1-duel-at-dawn",
    raceId: "ashkari",
    act: 1,
    kind: "act",
    title: "The Red-Dune Challenge",
    art: "contact",
    text: "A younger sub-commander on {colony} publicly challenges the aging garrison legate to single-blade combat over who will lead our first frontier strike wing toward {star}.",
    choices: [
      {
        label: "Honor the blood-duel before the legions",
        result: "Steel rings across the red parade ground and the victor commands fierce devotion, though a seasoned officer falls.",
        shift: { tradition: 2, mercy: -1 },
        sets: ["honored-red-duel"],
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 100 },
          { kind: "population", amount: -1 },
        ],
      },
      {
        label: "Forbid duels and promote by war-game scores",
        result: "Tactical simulations spare veteran lives and sharpen fleet gunnery, though traditionalist clans mutter of cowardice.",
        shift: { tradition: -2, mercy: 1 },
        sets: ["banned-blade-duels"],
        effects: [
          { kind: "research", field: "weapons", amount: 210 },
          { kind: "morale", amount: -4 },
          { kind: "money", amount: -80 },
        ],
      },
      {
        label: "Send both rivals to raid separate pirate coves",
        result: "Channeling hot blood into frontier action wins spoil bullion and reveals nearby lanes without losing officers.",
        shift: { openness: 1, tradition: 1 },
        effects: [
          { kind: "money", amount: 160 },
          { kind: "revealStars", count: 3 },
          { kind: "morale", amount: 2 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-1-broken-banner",
    raceId: "ashkari",
    act: 1,
    kind: "act",
    title: "The Surrendered Standard",
    art: "ruins",
    text: "Border scouts near {star} recover the tattered war-banner of an Ashkari clan that surrendered during the ancient Desert Wars rather than fight to the last spear.",
    choices: [
      {
        label: "Burn the banner and erase their clan name",
        result: "Unforgiving pride hardens every legion on {colony}, reaffirming that Ashkari warriors never yield.",
        shift: { mercy: -2, tradition: 2 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "factories", amount: 5 },
          { kind: "culture", amount: -50 },
        ],
      },
      {
        label: "Hang the banner in the hall as a lesson in survival",
        result: "Remembering that living clans rebuild armies softens reckless doctrine and bolsters colony growth.",
        shift: { mercy: 2, tradition: -1 },
        sets: ["preserved-surrender-banner"],
        effects: [
          { kind: "population", amount: 3 },
          { kind: "culture", amount: 95 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Display the relic in off-world embassies",
        result: "Showing neighbors that even Ashkari know the cost of war eases border tension near {star}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 15 },
          { kind: "culture", amount: 80 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-1-mercenary-offer",
    raceId: "ashkari",
    act: 1,
    kind: "act",
    title: "Swords for Silver",
    art: "pirates",
    text: "Envoys from the {rival} arrive at {colony} with chests of bullion, offering to hire an Ashkari veteran cohort to crush a border insurgency near {star}.",
    choices: [
      {
        label: "Accept the contract and claim battle spoils",
        result: "Our warriors return flush with {rival} coin and combat experience, though proud elders sneer at fighting for pay.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "money", amount: 240 },
          { kind: "research", field: "weapons", amount: 160 },
          { kind: "culture", amount: -60 },
        ],
      },
      {
        label: "Spurn the gold—Ashkari steel serves only the Dominion",
        result: "Dismissing foreign coin swells imperial pride on {colony}, while the {rival} departs empty-handed.",
        shift: { openness: -2, tradition: 2 },
        effects: [
          { kind: "culture", amount: 115 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -12 },
        ],
      },
      {
        label: "Dispatch military advisors instead of troops",
        result: "Training foreign officers builds quiet influence with the {rival} without risking Ashkari blood.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "money", amount: 130 },
          { kind: "morale", amount: -2 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-ashkari-2-conquered-smiths",
    raceId: "ashkari",
    act: 2,
    kind: "act",
    title: "Anvils of the Vanquished",
    art: "contact",
    text: "Master shipwrights captured in border skirmishes near {star} offer to teach {colony}'s foundries lighter hull-welding methods if granted full warrior citizenship rather than thrall labor.",
    choices: [
      {
        label: "Grant them full citizenship and foundry rank",
        result: "Honoring worthy craftspeople transforms {colony}'s yards and wins grudging admiration from neighbors.",
        shift: { openness: 2, mercy: 2 },
        sets: ["adopted-foreign-smiths"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "research", field: "construction", amount: 220 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Keep them in iron thralldom under legion guards",
        result: "Strict caste lines preserve Ashkari supremacy on {colony} while squeezing steady output from captive hands.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "money", amount: 160 },
          { kind: "relations", amount: -15 },
        ],
      },
      {
        label: "Ransom the smiths back to their kin for bullion",
        result: "Selling captives cleanly keeps Ashkari bloodlines pure while refilling {colony}'s war-chest.",
        shift: { tradition: 1, openness: -1 },
        effects: [
          { kind: "money", amount: 250 },
          { kind: "culture", amount: 90 },
          { kind: "factories", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-2-oasis-garrison",
    raceId: "ashkari",
    act: 2,
    kind: "act",
    title: "The Glass Cisterns",
    art: "crisis",
    text: "Severe drought grips the red canyon settlements of {colony} just as fleet command demands emergency alloy levies to reinforce border squadrons near {star}.",
    choices: [
      {
        label: "Divert army engineers to dig deep water-vaults",
        result: "Legions lay down rifles to save desert clans on {colony}, deepening loyalty at the cost of delayed hulls.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "population", amount: 4 },
          { kind: "morale", amount: 5 },
          { kind: "factories", amount: -4 },
        ],
      },
      {
        label: "Enforce the war-levy—weak clans harden in fire",
        result: "Unrelenting foundry quotas churn out warships on schedule while parched settlements endure grim rationing.",
        shift: { mercy: -2, tradition: 1 },
        effects: [
          { kind: "factories", amount: 9 },
          { kind: "research", field: "weapons", amount: 200 },
          { kind: "population", amount: -3 },
        ],
      },
      {
        label: "Buy bulk ice shipments from {rival} traders",
        result: "Swallowing martial pride to purchase foreign water saves both crops and shipyard schedules.",
        shift: { openness: 2, tradition: -2 },
        effects: [
          { kind: "relations", amount: 14 },
          { kind: "population", amount: 2 },
          { kind: "money", amount: -210 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-2-warlord-heir",
    raceId: "ashkari",
    act: 2,
    kind: "act",
    title: "The Scholar-Son of Red Mesa",
    art: "anomaly",
    text: "The eldest heir of {colony}'s premier warrior house refuses military command, insisting on founding an orbital physics academy to study force-field harmonics near {star}.",
    choices: [
      {
        label: "Endow his orbital academy with spoils bullion",
        result: "Turning warrior wealth toward shield physics sparks surprising breakthroughs, though old legates scoff.",
        shift: { tradition: -2, openness: 1 },
        sets: ["funded-warrior-academy"],
        effects: [
          { kind: "research", field: "forceFields", amount: 270 },
          { kind: "money", amount: -160 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Strip his inheritance and assign him to infantry",
        result: "Enforcing ancient duty keeps the warrior aristocracy unbroken and rallies conservative legions on {colony}.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "morale", amount: 5 },
          { kind: "research", field: "forceFields", amount: -90 },
        ],
      },
      {
        label: "Challenge him to prove his shields under live fire",
        result: "Testing prototype barriers against live railgun barrages satisfies both clan honor and fleet engineers.",
        shift: { tradition: 1, openness: -1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 190 },
          { kind: "research", field: "weapons", amount: 160 },
          { kind: "money", amount: -120 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-ashkari-3-oath-of-blood",
    raceId: "ashkari",
    act: 3,
    kind: "act",
    title: "The Red-Sand Vigil",
    art: "crisis",
    text: "Cornered on a barren ridge near {star}, an Ashkari vanguard cohort faces annihilation by superior {rival} forces unless it retreats before dawn—violating the ancient oath never to yield ground once blood is drawn.",
    choices: [
      {
        label: "Order a tactical withdrawal to save the veterans",
        result: "Preserving seasoned troops strengthens our frontier line near {star}, though proud officers on {colony} burn with shame.",
        shift: { mercy: 2, tradition: -2 },
        sets: ["withdrew-from-ridge"],
        effects: [
          { kind: "population", amount: 2 },
          { kind: "research", field: "propulsion", amount: 230 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Command them to stand and die on the ridge",
        result: "Their heroic last stand ignites fanatical devotion across {colony}, even as elite veterans perish to the last warrior.",
        shift: { mercy: -2, tradition: 2 },
        sets: ["held-red-ridge"],
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 6 },
          { kind: "population", amount: -3 },
        ],
      },
      {
        label: "Launch a reckless night-relief raid with all reserves",
        result: "Daring flankers shatter the {rival} blockade and haul back rich hull spoils at heavy financial cost.",
        shift: { tradition: 1, mercy: 1 },
        sets: ["held-red-ridge"],
        effects: [
          { kind: "money", amount: 220 },
          { kind: "research", field: "weapons", amount: 210 },
          { kind: "factories", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-3-hollow-spoils",
    raceId: "ashkari",
    act: 3,
    kind: "act",
    title: "The Cursed Hulk",
    art: "pirates",
    text: "After a sharp engagement near {star}, Ashkari salvagers tow in a battered {rival} cruiser whose automated reactor leaks lethal radiation—yet its weapon banks hold priceless targeting optics.",
    choices: [
      {
        label: "Strip the weapons at once despite the radiation",
        result: "Daring salvage crews extract lethal gunnery data before the core melts down, taking grim casualties on {colony}.",
        shift: { mercy: -2, openness: -1 },
        sets: ["stripped-irradiated-hulk"],
        effects: [
          { kind: "research", field: "weapons", amount: 310 },
          { kind: "money", amount: 190 },
          { kind: "population", amount: -2 },
        ],
      },
      {
        label: "Scuttle the wreck into {star} to protect our crews",
        result: "Putting clan lives ahead of plunder wins quiet gratitude from {colony}'s dockworkers.",
        shift: { mercy: 2, tradition: -1 },
        sets: ["scuttled-irradiated-hulk"],
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 100 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Return the wreck and its dead to the {rival}",
        result: "Honoring fallen adversaries with a formal funeral truce astonishes the {rival} and cools border hatred.",
        shift: { mercy: 2, openness: 2 },
        sets: ["scuttled-irradiated-hulk"],
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-3-legion-council",
    raceId: "ashkari",
    act: 3,
    kind: "act",
    title: "Voice of the Iron Ranks",
    art: "council",
    text: "Returning veterans from {star} demand voting seats on {colony}'s War Council, arguing that soldiers who bleed for the Dominion should help decide when war is declared.",
    choices: [
      {
        label: "Seat elected legion delegates on the Council",
        result: "Giving rank-and-file warriors a voice revitalizes civic pride across {colony}, though highborn legates chafe.",
        shift: { openness: 2, tradition: -2 },
        sets: ["enfranchised-legions"],
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "culture", amount: 135 },
          { kind: "factories", amount: -4 },
        ],
      },
      {
        label: "Crush the petition—command flows from above",
        result: "Unbroken aristocratic discipline keeps {colony}'s war-forges running at full tilt while barracks simmer in silence.",
        shift: { tradition: 2, mercy: -1 },
        sets: ["kept-aristocratic-command"],
        effects: [
          { kind: "factories", amount: 9 },
          { kind: "research", field: "construction", amount: 220 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Grant veteran clans tax-free frontier homesteads",
        result: "Rewarding service with land rather than political power settles outer worlds and calms unrest.",
        shift: { tradition: 1, mercy: 1 },
        sets: ["kept-aristocratic-command"],
        effects: [
          { kind: "population", amount: 3 },
          { kind: "planetSize", amount: 3 },
          { kind: "money", amount: -170 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-ashkari-4-grand-crusade",
    raceId: "ashkari",
    act: 4,
    kind: "act",
    title: "The Red Horizon",
    art: "victory",
    text: "With every foundry from {colony} to {star} ringing with war-steel, the High Legates assemble an armada capable of imposing Ashkari tribute across the entire sector.",
    choices: [
      {
        label: "Proclaim the Decade of Conquest",
        result: "Blazing banners and unmatched dreadnought yards terrify every neighbor, locking the Dominion on a path of total war.",
        shift: { mercy: -2, openness: -2 },
        effects: [
          { kind: "research", field: "weapons", amount: 420 },
          { kind: "factories", amount: 12 },
          { kind: "relations", amount: -25 },
        ],
      },
      {
        label: "Turn the armada into a neutral galactic guard",
        result: "Offering Ashkari steel to protect peaceful trade lanes transforms our feared legions into respected peacekeepers.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "relations", amount: 25 },
          { kind: "culture", amount: 210 },
          { kind: "money", amount: 280 },
        ],
      },
      {
        label: "Demobilize half the fleet to rebuild desert cities",
        result: "Melted armor plates become civic aqueducts and monuments on {colony}, sparking joy across weary clans.",
        shift: { mercy: 2, tradition: -1 },
        effects: [
          { kind: "population", amount: 5 },
          { kind: "morale", amount: 8 },
          { kind: "factories", amount: -6 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-4-oasis-empire",
    raceId: "ashkari",
    act: 4,
    kind: "act",
    title: "Blood and Water",
    art: "council",
    text: "Generations of martial tribute have filled {colony}'s vaults with foreign bullion, prompting younger clans to question whether Ashkari still need the brutal desert trials that forged their ancestors.",
    choices: [
      {
        label: "Preserve the harsh canyon trials forever",
        result: "Enduring ancient austerity keeps Ashkari warriors peerless in ground combat and unbroken in spirit.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "morale", amount: 6 },
          { kind: "population", amount: -2 },
        ],
      },
      {
        label: "Replace blood-trials with academies of strategy",
        result: "Modernizing warrior education unlocks rapid computer and force-field gains while sparing young lives.",
        shift: { tradition: -2, mercy: 1 },
        effects: [
          { kind: "research", field: "computers", amount: 380 },
          { kind: "research", field: "forceFields", amount: 340 },
          { kind: "culture", amount: -100 },
        ],
      },
      {
        label: "Open the canyon trials to worthy off-world champions",
        result: "Inviting allied warriors—even from the {rival}—to earn Ashkari honors builds deep martial kinship.",
        shift: { openness: 2, tradition: 1 },
        effects: [
          { kind: "relations", amount: 22 },
          { kind: "culture", amount: 180 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-4-final-duel",
    raceId: "ashkari",
    act: 4,
    kind: "act",
    title: "The Throne of Ash",
    art: "crisis",
    text: "Aging and scarred from forty campaigns, the Supreme Legate of {colony} summons all clan chiefs to choose how supreme command of the Ashkari Dominion will pass to the next generation.",
    choices: [
      {
        label: "Decree a grand tournament of single combat",
        result: "The fiercest duel in Dominion history crowns a new warlord and electrifies every legion across {star}.",
        shift: { tradition: 2, mercy: -2 },
        effects: [
          { kind: "morale", amount: 8 },
          { kind: "research", field: "weapons", amount: 340 },
          { kind: "population", amount: -2 },
        ],
      },
      {
        label: "Establish an elected Senate of Legates and Elders",
        result: "Peaceful constitutional succession ends centuries of succession bloodshed and earns council admiration.",
        shift: { tradition: -2, openness: 2 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 20 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Name a joint triumvirate of warrior, smith, and envoy",
        result: "Balancing sword, forge, and diplomacy steadies every pillar of {colony}'s growing empire.",
        shift: { openness: 1, mercy: 1 },
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "money", amount: 320 },
          { kind: "culture", amount: 140 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-ashkari-branch-duel-vendetta",
    raceId: "ashkari",
    act: 2,
    kind: "branch",
    needs: ["honored-red-duel"],
    blockedBy: ["banned-blade-duels"],
    title: "Blood of the Slain Legate",
    art: "crisis",
    text: "Kinsmen of the officer slain in {colony}'s red-dune duel challenge the victorious young commander to a clan blood-feud just as border patrols sight {rival} raiders near {star}.",
    choices: [
      {
        label: "Force both clans to bleed side by side in the vanguard",
        result: "Shared battle against {rival} raiders turns bitter vendetta into fierce brotherhood and spoils.",
        shift: { tradition: 1, mercy: 1 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "money", amount: 180 },
          { kind: "relations", amount: -10 },
        ],
      },
      {
        label: "Allow a formal clan champion bout to settle the debt",
        result: "Ritual honor satisfies ancient desert law on {colony}, though another promising warrior falls.",
        shift: { tradition: 2, mercy: -2 },
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: 3 },
          { kind: "population", amount: -1 },
        ],
      },
      {
        label: "Pay blood-gold from the treasury to end the feud",
        result: "Purchasing peace saves warrior lives and keeps {colony}'s garrison intact, at steep coin cost.",
        shift: { mercy: 2, tradition: -1 },
        effects: [
          { kind: "population", amount: 2 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-branch-foreign-forge",
    raceId: "ashkari",
    act: 3,
    kind: "branch",
    needs: ["adopted-foreign-smiths"],
    title: "The Mixed-Steel Crucible",
    art: "contact",
    text: "Given full citizenship on {colony}, the foreign master shipwrights unveil a revolutionary composite hull frame—though proud Ashkari armorers demand it bear traditional clan runes before deployment.",
    choices: [
      {
        label: "Bless the new hulls with full Ashkari war-rites",
        result: "Marrying alien metallurgy to ancient desert ritual unites {colony}'s yards and boosts naval construction.",
        shift: { tradition: 1, openness: 2 },
        effects: [
          { kind: "research", field: "construction", amount: 280 },
          { kind: "culture", amount: 120 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Mass-produce the stripped-down utilitarian hulls",
        result: "Pure efficiency turns {colony}'s slipways into a juggernaut while traditionalist smiths grumble.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "research", field: "propulsion", amount: 210 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Export licensed hulls to friendly frontier worlds",
        result: "Selling composite transports fills Dominion vaults and warms diplomatic ties near {star}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "money", amount: 270 },
          { kind: "relations", amount: 16 },
          { kind: "factories", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-branch-scholar-shield",
    raceId: "ashkari",
    act: 3,
    kind: "branch",
    needs: ["funded-warrior-academy"],
    title: "The Citadel Dome",
    art: "anomaly",
    text: "Graduates of the warrior-heir's orbital academy above {colony} project a harmonic barrier capable of deflecting orbital bombardment over {star}, asking to share the design with allied border colonies.",
    choices: [
      {
        label: "Guard the shield harmonics as an Ashkari secret",
        result: "Unbreakable orbital domes fortify {colony} and give our fleets a decisive tactical edge.",
        shift: { openness: -2, tradition: 1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 310 },
          { kind: "factories", amount: 7 },
          { kind: "relations", amount: -12 },
        ],
      },
      {
        label: "Share the defensive schematics with peaceful neighbors",
        result: "Proving Ashkari strength can shelter others earns awe and warm treaties across the sector.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "culture", amount: 140 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Adapt the harmonics into mobile siege-breakers",
        result: "Turning defensive physics into vanguard rams delights aggressive legates on {colony}.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "research", field: "weapons", amount: 270 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -150 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-branch-ridge-ghosts",
    raceId: "ashkari",
    act: 4,
    kind: "branch",
    needs: ["withdrew-from-ridge"],
    blockedBy: ["held-red-ridge"],
    title: "The Living Banner",
    art: "victory",
    text: "The veterans saved by our tactical withdrawal near {star} return to {colony} as hardened elite instructors, proposing a sweeping reform of Ashkari doctrine that values victory over glorious death.",
    choices: [
      {
        label: "Adopt their pragmatic war-manual across all legions",
        result: "Disciplined maneuver warfare multiplies Ashkari lethality and preserves veteran manpower.",
        shift: { tradition: -2, mercy: 2 },
        effects: [
          { kind: "research", field: "weapons", amount: 360 },
          { kind: "population", amount: 4 },
          { kind: "culture", amount: -90 },
        ],
      },
      {
        label: "Send them to train allied peacekeepers abroad",
        result: "Seasoned Ashkari officers elevate partner militaries and win lasting goodwill from the {rival}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 22 },
          { kind: "money", amount: 290 },
          { kind: "morale", amount: 4 },
        ],
      },
      {
        label: "Have them swear an oath to reclaim the ridge in triumph",
        result: "Turning past retreat into focused vengeance ignites fierce pride across {colony}'s shipyards.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "factories", amount: 11 },
          { kind: "morale", amount: 7 },
          { kind: "relations", amount: -15 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-branch-radiation-scars",
    raceId: "ashkari",
    act: 4,
    kind: "branch",
    needs: ["stripped-irradiated-hulk"],
    blockedBy: ["scuttled-irradiated-hulk"],
    title: "The Glowing Veterans",
    art: "crisis",
    text: "Salvage crews scarred while stripping the irradiated {rival} cruiser near {star} stage a march on {colony}'s War Palace, demanding lifelong honors and medical sanctuaries that High Command neglected.",
    choices: [
      {
        label: "Build grand obsidian sanctuaries and honor their sacrifice",
        result: "Public restitution heals the wound between high command and the ranks at heavy treasury expense.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "morale", amount: 8 },
          { kind: "culture", amount: 200 },
          { kind: "money", amount: -340 },
        ],
      },
      {
        label: "Disperse the protesters to remote penal garrisons",
        result: "Iron suppression preserves absolute command authority, though bitter resentment festers across {colony}.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "research", field: "weapons", amount: 300 },
          { kind: "morale", amount: -9 },
        ],
      },
      {
        label: "Turn their radiation-hardened data into shield tech",
        result: "Funding medical physics cures the survivors and yields durable force-field breakthroughs.",
        shift: { mercy: 1, tradition: -1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 350 },
          { kind: "population", amount: 2 },
          { kind: "money", amount: -240 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-ashkari-end-scourge-of-ash",
    raceId: "ashkari",
    needs: { mercy: { max: -4 }, openness: { max: -3 } },
    title: "The Crimson Shadow",
    art: "crisis",
    text: "Unforgiving, relentless, and hungry for spoils, the Ashkari Dominion turns every border into an anvil—inspiring such dread across the stars that rivals freeze rather than provoke our wrath.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Let them fear the red sand",
        result: "Neighboring fleets hold back in terror as Ashkari war-forges ring across {colony}.",
        effects: [
          { kind: "research", field: "weapons", amount: 360 },
          { kind: "factories", amount: 12 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-end-legion-mutiny",
    raceId: "ashkari",
    needs: { mercy: { max: -4 }, tradition: { max: -3 } },
    title: "The Shattered Standard",
    art: "crisis",
    text: "Abandoning ancient desert honor while grinding clans under merciless war-levies breaks the Dominion from within, as scarred frontier legions raise rebel banners against {colony}.",
    outcome: "civilWar",
    choices: [
      {
        label: "Draw steel against our own kin",
        result: "Outer garrisons secede in open rebellion as Ashkari faces Ashkari.",
        effects: [
          { kind: "money", amount: 260 },
          { kind: "morale", amount: -8 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-end-shield-brotherhood",
    raceId: "ashkari",
    needs: { mercy: { min: 4 }, openness: { min: 4 } },
    title: "The Unsheathed Truce",
    art: "council",
    text: "Tempering fierce warrior pride with mercy and respect for worthy adversaries, the Ashkari Dominion achieves an unprecedented bond—turning our bitterest enemy into a sworn shield-ally.",
    outcome: "rivalBecomesAlly",
    choices: [
      {
        label: "Clasp gauntlets in peace",
        result: "Former enemies march beside Ashkari legions in lasting brotherhood.",
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 25 },
        ],
      },
    ],
  },
  {
    id: "saga-ashkari-end-eternal-citadel",
    raceId: "ashkari",
    title: "The Unbroken Legion",
    art: "victory",
    text: "Proud, disciplined, and tempered in the red desert's fire, the Ashkari Dominion enters a glorious golden age of martial honor, roaring foundries, and unshakeable resolve.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Sound the horns of triumph",
        result: "Red banners fly high over thriving oasis cities and gleaming shipyards.",
        effects: [
          { kind: "morale", amount: 8 },
          { kind: "culture", amount: 200 },
          { kind: "factories", amount: 10 },
        ],
      },
    ],
  },
];
