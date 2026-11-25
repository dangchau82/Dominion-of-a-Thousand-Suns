// The crusade crisis: a faith that conquers through culture. Written by Gemini (2026-11-25, revised), checked by Claude; rules built by Claude.
import type { LateGameEventDef } from "./lateGameLore";

export interface CrusadeFaith {
  name: string;               // the faith's name (original!)
  preachers: string;          // what its missionaries are called
  belief: string;             // under 50 words
  appearance: string;         // under 40 words
  /** How a world falls, in plain words, for Claude to turn into rules. */
  conversion: string;         // under 50 words: use culture per turn, golden ages, security spending
  /** How the crisis ends. */
  endings: { resist: string; join: string; destroy: string }; // each under 40 words
}

export const CRUSADE: CrusadeFaith = {
  name: "The Candescent Fold",
  preachers: "Bell-Walkers",
  belief:
    "All conflict springs from the ache of separate selves. By surrendering pride, borders, and restless ambition to the Candescent Fold, every sentient mind joins a single tranquil communion where war, grief, and loneliness cease forever.",
  appearance:
    "They travel in seamless pearl-grey robes aboard slow, unarmed sail-barques draped in woven copper chimes, carrying bronze tuning bells and offering warm bread to every weary dockworker.",
  conversion:
    "Each turn, Bell-Walker pilgrim pressure rises on exposed colonies unless your empire's culture per turn outweighs it, while Golden Ages grant full immunity. Higher security spending slows infiltration; low-culture worlds eventually flip peacefully to the Fold without a shot fired.",
  endings: {
    resist:
      "Your empire's vibrant arts, civic pride, and Golden Ages outshine the Fold's lullaby, inspiring neighboring worlds to reclaim their own voices as the sail-barques drift quietly back beyond the rim.",
    join:
      "Your colonies lay down their weapons and merge into the Candescent Fold, ending all wars in serene, dreamlike unity as your empire dissolves into a borderless pilgrim communion.",
    destroy:
      "Security purges and orbital blockades shatter the bronze chimes and scatter the Bell-Walkers, leaving your worlds fiercely independent yet haunted by the memory of the peace they burned.",
  },
};

/**
 * 10-event branching chain:
 * - Events 1-3: arrival, early converts, and an ambiguous miracle;
 * - Event 4: sets branch ("order" = resist, "chaos" = join, "neutral" = bargain);
 * - Events 5-6 ("order"), 7-8 ("chaos"), 9 ("neutral"): branch consequences;
 * - Event 10 (no branch, fires after the active branch's last event resolves): the Prophet arrives.
 */
export const CRUSADE_CHAIN: LateGameEventDef[] = [
  {
    id: "crusade-1-sails-beyond-the-rim",
    title: "Sails Beyond the Rim",
    art: "contact",
    trigger: "turn",
    text: "Unarmed pearl-grey sail-barques have drifted into orbit near {star}, ringing bronze bells that soothe static on every comms channel. Old frontier seers long foretold that silver-robed pilgrims would arrive from beyond the dark rim when the galaxy grew weary of war.",
    choices: [
      {
        label: "Welcome their envoys to dock peacefully",
        result: "Bell-Walkers step ashore with warm bread and gentle hymns, captivating our citizens.",
        effects: [
          { kind: "culture", amount: 90 },
          { kind: "relations", amount: 10 },
        ],
      },
      {
        label: "Quarantine their barques and scan their chimes",
        result: "Our physicists record subtle harmonic waveforms woven into the bronze alloys.",
        effects: [
          { kind: "research", field: "forceFields", amount: 260 },
          { kind: "money", amount: -80 },
        ],
      },
      {
        label: "Order border patrols to turn them back",
        result: "The pilgrims depart without complaint, though their sad bells linger in crew memories.",
        effects: [
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -8 },
        ],
      },
    ],
  },
  {
    id: "crusade-2-bell-walkers-of-the-square",
    title: "The Bell-Walkers of the Square",
    art: "council",
    trigger: "colony",
    requires: "crusade-1-sails-beyond-the-rim",
    text: "Barefoot Bell-Walkers now walk the plazas of {colony}, tending the sick and calming bitter feuds. Crime has nearly vanished, yet evening shifts stand half-empty as workers linger in silent chime-circles.",
    choices: [
      {
        label: "Sponsor local festivals to rival their appeal",
        result: "Vibrant music, theater, and civic games remind {colony} of its own proud voice.",
        effects: [
          { kind: "money", amount: -140 },
          { kind: "culture", amount: 140 },
        ],
      },
      {
        label: "Let them tend the infirm and troubled",
        result: "Public spirits rise in serene contentment while factory output gently dips.",
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "factories", amount: -5 },
        ],
      },
      {
        label: "Send security agents to disperse the circles",
        result: "Shifts resume on schedule, though sullen silence settles over the lower districts.",
        effects: [
          { kind: "morale", amount: -5 },
          { kind: "factories", amount: 4 },
        ],
      },
    ],
  },
  {
    id: "crusade-3-miracle-in-the-dust",
    title: "A Miracle in the Dust",
    art: "anomaly",
    trigger: "colony",
    requires: "crusade-2-bell-walkers-of-the-square",
    text: "After a heavy-metal dust storm poisoned the reservoirs of {colony}, three Bell-Walkers rang their bells over the water all night. By dawn every well ran sweet and pure, though orbital sensors detected microscopic acoustic nanites in the silt.",
    choices: [
      {
        label: "Publish the nanite scan results",
        result: "Scientists gain insight into bio-mineral filtration, while converts call it slander.",
        effects: [
          { kind: "research", field: "planetology", amount: 320 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Celebrate the cleansed reservoirs",
        result: "Healthy families and grateful pilgrims swell the bustling districts of {colony}.",
        effects: [
          { kind: "population", amount: 3 },
          { kind: "culture", amount: 80 },
        ],
      },
      {
        label: "Quietly bottle samples for state chemists",
        result: "Private syndicates and research labs pay well for the self-purifying catalyst.",
        effects: [
          { kind: "money", amount: 160 },
          { kind: "research", field: "computers", amount: 200 },
        ],
      },
    ],
  },
  {
    id: "crusade-4-call-of-the-candescent-fold",
    title: "The Call of the Candescent Fold",
    art: "council",
    trigger: "turn",
    requires: "crusade-3-miracle-in-the-dust",
    text: "Across {colony} and neighboring worlds of the {rival}, millions prepare to lay down weapons and tools in a synchronized planetary vigil. The Bell-Walkers ask our government to choose: resist their quiet tide, embrace the Fold, or strike a pragmatic accord.",
    choices: [
      {
        label: "Rally our own cultural heritage against the Fold",
        result: "We proclaim that peace without freedom is merely sleep, igniting a civic renaissance.",
        effects: [
          { kind: "culture", amount: 160 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -120 },
        ],
      },
      {
        label: "Open the planetary gates and welcome the Fold",
        result: "Chimes ring from every spire on {colony} as old rivalries dissolve into calm fellowship.",
        effects: [
          { kind: "morale", amount: 8 },
          { kind: "culture", amount: -80 },
          { kind: "relations", amount: 16 },
        ],
      },
      {
        label: "Grant sanctuary charters in exchange for civic aid",
        result: "Regulated temple quarters keep local peace while filling port coffers.",
        effects: [
          { kind: "money", amount: 220 },
          { kind: "factories", amount: 5 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "crusade-5-anthems-over-chimes",
    title: "Anthems Over the Chimes",
    art: "council",
    trigger: "colony",
    requires: "crusade-4-call-of-the-candescent-fold",
    branch: "order",
    text: "Poets, holo-dramatists, and historians on {colony} have answered the Bell-Walkers' lullaby with soaring epics of our people's journey, drawing crowds away from the silent squares.",
    choices: [
      {
        label: "Endow empire-wide cultural academies",
        result: "New works of art and philosophy anchor every colony against outside conversion.",
        effects: [
          { kind: "money", amount: -160 },
          { kind: "culture", amount: 160 },
        ],
      },
      {
        label: "Broadcast our debates to the {rival}",
        result: "Thinkers across the {rival} applaud our spirited defense of mortal identity.",
        effects: [
          { kind: "culture", amount: 100 },
          { kind: "relations", amount: 15 },
        ],
      },
      {
        label: "Convert abandoned shrines into academies",
        result: "Empirical inquiry thrives in the quiet halls, though devout holdouts grumble.",
        effects: [
          { kind: "research", field: "computers", amount: 300 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "crusade-6-great-unlearning",
    title: "The Great Unlearning",
    art: "crisis",
    trigger: "colony",
    requires: "crusade-5-anthems-over-chimes",
    branch: "order",
    text: "Unwilling to abandon peaceful converts on {colony}, the Bell-Walkers ring a deep sub-harmonic toll that lulls entire orbital docks into a waking, dreamlike trance.",
    choices: [
      {
        label: "Counter with inverse shield harmonics",
        result: "Deflector emitters cancel the resonant wave and unlock new field-modulation theory.",
        effects: [
          { kind: "research", field: "forceFields", amount: 340 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Enforce martial curfews at every spaceport",
        result: "Security sweeps silence the bells harshly, stalling freighters and bruising morale.",
        effects: [
          { kind: "factories", amount: -6 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Stage a grand civic jubilee to wake the city",
        result: "Bells are drowned out by laughter, fireworks, and roaring planetary pride.",
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
  {
    id: "crusade-7-swords-into-chimes",
    title: "Swords Into Chimes",
    art: "council",
    trigger: "colony",
    requires: "crusade-4-call-of-the-candescent-fold",
    branch: "chaos",
    text: "Embracing the Candescent Fold, citizens on {colony} melt ordnance stockpiles into bronze chimes and invite pilgrims from the {rival} to settle beside them without walls or tariffs.",
    choices: [
      {
        label: "Convert munitions plants into pilgrim shelters",
        result: "War foundries go cold as joyful newcomers from across the sector arrive in peace.",
        effects: [
          { kind: "factories", amount: -8 },
          { kind: "population", amount: 4 },
          { kind: "relations", amount: 20 },
        ],
      },
      {
        label: "Distribute treasury reserves as peace alms",
        result: "Bells ring in celebration across every continent as want disappears.",
        effects: [
          { kind: "money", amount: -200 },
          { kind: "morale", amount: 8 },
          { kind: "culture", amount: 120 },
        ],
      },
      {
        label: "Export decommissioned hull alloys",
        result: "Peaceful merchant guilds buy up surplus armor plate for civilian transports.",
        effects: [
          { kind: "money", amount: 240 },
          { kind: "factories", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "crusade-8-borderless-communion",
    title: "The Borderless Communion",
    art: "anomaly",
    trigger: "colony",
    requires: "crusade-7-swords-into-chimes",
    branch: "chaos",
    text: "Whole districts on {colony} now move in calm unison, sharing harvests, star charts, and labor openly with neighboring Fold enclaves while military recruiting offices stand empty.",
    choices: [
      {
        label: "Pool shared pilgrim star-lore",
        result: "Wanderers from beyond the rim reveal untouched worlds and gentle biosphere techniques.",
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "research", field: "planetology", amount: 280 },
        ],
      },
      {
        label: "Dedicate civic work to communal harmony",
        result: "Blissful tranquility blankets {colony} as industrial quotas are set aside.",
        effects: [
          { kind: "morale", amount: 8 },
          { kind: "factories", amount: -6 },
        ],
      },
      {
        label: "Crew peaceful pilgrim barques as scouts",
        result: "Unarmed pathfinders set out with bronze chimes to map the outer dark.",
        effects: [
          { kind: "ships", template: "scout", count: 3 },
          { kind: "culture", amount: 90 },
        ],
      },
    ],
  },
  {
    id: "crusade-9-salt-bell-concordat",
    title: "The Salt-Bell Concordat",
    art: "contact",
    trigger: "colony",
    requires: "crusade-4-call-of-the-candescent-fold",
    branch: "neutral",
    text: "Under our chartered accord on {colony}, Bell-Walkers keep quiet order in rough frontier mining towns and mediate border disputes with the {rival} in exchange for autonomous temple quarters.",
    choices: [
      {
        label: "Use their mediators to expand border trade",
        result: "Neutral pilgrim ferries carry cargo safely across once-tense frontier lanes.",
        effects: [
          { kind: "money", amount: 260 },
          { kind: "relations", amount: 14 },
        ],
      },
      {
        label: "Tax pilgrim traffic to fund new foundries",
        result: "Industry booms on the tithes, though temple elders quietly mourn our worldliness.",
        effects: [
          { kind: "money", amount: 200 },
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Study their conflict-calming acoustics",
        result: "Engineers adapt their harmonic dampers for sensitive planetary shield grids.",
        effects: [
          { kind: "research", field: "forceFields", amount: 300 },
          { kind: "culture", amount: 80 },
        ],
      },
    ],
  },
  {
    id: "crusade-10-shepherd-of-stillness",
    title: "The Shepherd of Stillness",
    art: "council",
    trigger: "turn",
    requires: "crusade-4-call-of-the-candescent-fold",
    text: "Above {colony}, a vast cathedral-barque of woven copper unfolds like a silent flower. The Fold's blind Prophet speaks softly to every mind in the system: 'Lay down the heavy crown of self, little sibling, and rest in the peace you have sought since your first star-flight.'",
    choices: [
      {
        label: "Outshine the Prophet with our own living culture",
        result: "Our people choose the messy, radiant adventure of freedom, and the copper sails turn back toward the void.",
        effects: [
          { kind: "culture", amount: 160 },
          { kind: "morale", amount: 8 },
        ],
      },
      {
        label: "Lay down the crown and join the eternal peace",
        result: "Weapons fall silent across our stars as millions step into the Candescent Fold.",
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "population", amount: 5 },
          { kind: "factories", amount: -10 },
        ],
      },
      {
        label: "Order security fleets to shatter the copper barque",
        result: "The bronze chimes break in silent fire; our empire endures, fiercely free and forever changed.",
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "morale", amount: -6 },
          { kind: "relations", amount: -20 },
        ],
      },
    ],
  },
];