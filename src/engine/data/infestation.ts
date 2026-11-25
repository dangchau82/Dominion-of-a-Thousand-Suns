// The infestation crisis. Written by Gemini; rules built by Claude.
// Checked by Claude 2026-11-25: ids unique, effects in scale, text clean. Passed with notes (see bottom).
import type { LateGameEventDef } from "./lateGameLore";

export interface InfestationDef {
  creatureName: string;      // original, what colonists call them (2 words max)
  description: string;       // under 40 words, frightening but not gory
  /** Chance per turn (0.02 to 0.15) an infested colony spreads it to a colony its transports or trade reach. */
  spreadChance: number;
  /** Population lost per turn on an infested colony (0.5 to 3). */
  popLossPerTurn: number;
  /** Ground troops needed per population point to clear a colony (0.5 to 3). */
  troopsPerPop: number;
  /** Turns a quarantine must hold to starve the nest (5 to 20). */
  quarantineTurns: number;
  /** What burning the world from orbit costs, in plain words (it destroys the colony). */
  burnCost: string;          // under 30 words
}

export const INFESTATION: InfestationDef = {
  creatureName: "Hollow Crawlers",
  description:
    "Blind, chitin-plated predators that nest in sub-surface conduits, mimic local acoustic signals to lure prey, and multiply rapidly inside warm industrial vents.",
  spreadChance: 0.08,
  popLossPerTurn: 1,
  troopsPerPop: 1.5,
  quarantineTurns: 10,
  burnCost:
    "Orbital bombardment sterilizes the surface, destroying all colonists, factories, and planetary infrastructure permanently.",
};

/**
 * 10-event chain, same pattern as the Crusade (see the example below):
 * 1 the silent colony, 2 the rescue team goes in, 3 what they find (no branch);
 * 4 sets the branch: "order" = fight on the ground, "chaos" = burn and quarantine, "neutral" = study and contain;
 * 5-6 "order", 7-8 "chaos", 9 "neutral"; 10 (no branch) the queen nest, the finale.
 * Each event has exactly 2 or 3 choices. `requires` = the previous event's id (5, 7 and 9 require event 4).
 */
export const INFESTATION_CHAIN: LateGameEventDef[] = [
  {
    id: "infestation-1-the-silent-colony",
    title: "The Silent Colony",
    art: "crisis",
    trigger: "colony",
    text: "All scheduled telemetry and merchant transponders at {colony} ceased broadcasting six days ago. Long-range orbital sensors detect intact power grids and warm reactors, yet zero surface movement or emergency beacons.",
    choices: [
      {
        label: "Dispatch an immediate armed reconnaissance cutter",
        result: "A fast scout vessel burns hard for {colony} to establish visual contact.",
        effects: [
          { kind: "money", amount: -90 },
          { kind: "ships", template: "scout", count: 1 },
        ],
      },
      {
        label: "Halt inbound freighters and observe from orbit first",
        result: "Diverting merchant traffic costs trade revenue, but prevents premature exposure.",
        effects: [
          { kind: "money", amount: -140 },
          { kind: "morale", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "infestation-2-breaching-the-airlocks",
    title: "Breaching the Airlocks",
    art: "anomaly",
    trigger: "colony",
    requires: "infestation-1-the-silent-colony",
    text: "Landing teams at {colony} find primary blast doors welded shut from the inside. Faint rhythmic clicking echoes through the ventilation shafts, and thermal scans reveal hundreds of fast-moving signatures beneath the floorplates.",
    choices: [
      {
        label: "Cut through into the central command bunker",
        result: "Engineers breach the reinforced bulkhead and recover the colony's final security logs.",
        effects: [
          { kind: "research", field: "computers", amount: 180 },
          { kind: "population", amount: -1 },
        ],
      },
      {
        label: "Sweep the residential domes for trapped survivors",
        result: "Marines extract several hundred frightened civilians from sealed hydroponic vaults.",
        effects: [
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },
  {
    id: "infestation-3-the-subterranean-nest",
    title: "The Subterranean Nest",
    art: "crisis",
    trigger: "colony",
    requires: "infestation-2-breaching-the-airlocks",
    text: "Deep beneath {colony}, the geothermal shafts have been hollowed into a vast resinous hive teeming with Hollow Crawlers. Worse, manifest logs show three automated ore haulers departed for neighboring systems hours before blackout.",
    choices: [
      {
        label: "Broadcast a sector-wide biohazard alert",
        result: "Neighboring worlds slam shut their docking bays, sparking panic across border ports.",
        effects: [
          { kind: "morale", amount: -5 },
          { kind: "relations", amount: 10 },
        ],
      },
      {
        label: "Classify the report while tracking the missing haulers",
        result: "Intelligence teams quietly trace the freighter beacons without triggering market collapse.",
        effects: [
          { kind: "money", amount: -150 },
          { kind: "revealStars", count: 3 },
        ],
      },
    ],
  },
  {
    id: "infestation-4-doctrine-of-containment",
    title: "Doctrine of Containment",
    art: "council",
    trigger: "turn",
    requires: "infestation-3-the-subterranean-nest",
    text: "High Command convenes in emergency session as confirmed Hollow Crawler sightings surface in border cargo bays. Every hour of hesitation lets new brood chambers mature beneath our industrial centers.",
    choices: [
      {
        label: "Mobilize planetary militias to purge every nest on foot",
        result: "Armored infantry divisions deploy with flame-lances to reclaim our worlds tunnel by tunnel.",
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -220 },
        ],
      },
      {
        label: "Enforce total blockades and sterilize lost worlds from orbit",
        result: "Fleet admirals receive standing orders to glass any sector beyond salvation.",
        effects: [
          { kind: "morale", amount: -7 },
          { kind: "factories", amount: -4 },
        ],
      },
      {
        label: "Seal the hive perimeters and harvest their biology for science",
        result: "Xenobiologists construct containment domes to study the hive's rapid adaptation.",
        effects: [
          { kind: "research", field: "planetology", amount: 260 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
  {
    id: "infestation-5-clearing-the-conduits",
    title: "Clearing the Conduits",
    art: "crisis",
    trigger: "colony",
    requires: "infestation-4-doctrine-of-containment",
    branch: "order",
    text: "Infantry squads descending into the lower maintenance levels of {colony} face coordinated ambushes. The Hollow Crawlers mimic squad radio clicks to separate fireteams in the dark.",
    choices: [
      {
        label: "Flood the lower decks with heavy nerve-gas canisters",
        result: "The tunnels fall silent quickly, though toxic residue ruins lower-level assembly lines.",
        effects: [
          { kind: "factories", amount: -6 },
          { kind: "morale", amount: 3 },
        ],
      },
      {
        label: "Equip troopers with short-range seismic motion trackers",
        result: "Custom acoustic filters defeat the creatures' mimicry and save dozens of platoons.",
        effects: [
          { kind: "money", amount: -180 },
          { kind: "research", field: "weapons", amount: 190 },
        ],
      },
    ],
  },
  {
    id: "infestation-6-the-citadel-holdout",
    title: "The Citadel Holdout",
    art: "victory",
    trigger: "colony",
    requires: "infestation-5-clearing-the-conduits",
    branch: "order",
    text: "Three thousand miners and engineers at {colony} barricaded themselves inside the central fusion plant, holding off endless waves for weeks until relief columns broke through the outer perimeter.",
    choices: [
      {
        label: "Award civic honors and rebuild their shattered district",
        result: "Stories of the fusion plant defenders inspire volunteers across the entire empire.",
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Draft the seasoned survivors into specialist hive-hunter cadres",
        result: "Veteran miners train regular troops in close-quarters subterranean demolition.",
        effects: [
          { kind: "research", field: "weapons", amount: 240 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "infestation-7-the-iron-cordon",
    title: "The Iron Cordon",
    art: "crisis",
    trigger: "colony",
    requires: "infestation-4-doctrine-of-containment",
    branch: "chaos",
    text: "Cruisers locked in geosynchronous orbit above {colony} shoot down every shuttle attempting to lift off. Desperate transmissions from surface shelters beg for evacuation before food reserves run dry.",
    choices: [
      {
        label: "Maintain zero-tolerance quarantine until surface movement stops",
        result: "No ship leaves the gravity well; neighboring colonies breathe easier at a grim price.",
        effects: [
          { kind: "morale", amount: -6 },
          { kind: "relations", amount: 8 },
        ],
      },
      {
        label: "Drop automated supply pods to keep the bunkers alive",
        result: "Orbital drops sustain the trapped population without risking cross-contamination.",
        effects: [
          { kind: "money", amount: -210 },
          { kind: "morale", amount: 4 },
        ],
      },
    ],
  },
  {
    id: "infestation-8-cinder-protocol",
    title: "Cinder Protocol",
    art: "supernova",
    trigger: "colony",
    requires: "infestation-7-the-iron-cordon",
    branch: "chaos",
    text: "Surface sensors confirm the hive beneath {colony} has breached the final civilian shelter. Fleet gunners await authorization to ignite the upper atmosphere with thermobaric salvos.",
    choices: [
      {
        label: "Execute orbital sterilization and scour the crust",
        result: "Firestorms consume the hive completely, leaving a barren, glassed wasteland behind.",
        effects: [
          { kind: "population", amount: -4 },
          { kind: "factories", amount: -8 },
        ],
      },
      {
        label: "Target only the geothermal vents with precision lance strikes",
        result: "Targeted strikes collapse the main brood caverns while sparing half the surface domes.",
        effects: [
          { kind: "population", amount: -2 },
          { kind: "money", amount: -240 },
        ],
      },
    ],
  },
  {
    id: "infestation-9-chitin-and-resonance",
    title: "Chitin and Resonance",
    art: "anomaly",
    trigger: "turn",
    requires: "infestation-4-doctrine-of-containment",
    branch: "neutral",
    text: "Inside sealed orbital labs, researchers discover that Hollow Crawler carapace plates deflect standard plasma bolts while their nervous system coordinates via low-frequency sub-space pulses.",
    choices: [
      {
        label: "Synthesize composite armor plating from shed carapace",
        result: "Foundries adapt the layered chitin structure into lightweight hull reinforcement.",
        effects: [
          { kind: "research", field: "construction", amount: 310 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Broadcast inverse harmonic pulses to disrupt hive coordination",
        result: "Field emitters scatter the swarm's pack tactics, though lab containment nearly fails.",
        effects: [
          { kind: "research", field: "forceFields", amount: 320 },
          { kind: "population", amount: -1 },
        ],
      },
    ],
  },
  {
    id: "infestation-10-the-brood-sovereign",
    title: "The Brood Sovereign",
    art: "crisis",
    trigger: "colony",
    requires: "infestation-4-doctrine-of-containment",
    text: "Seismic arrays pinpoint the crisis's origin: an ancient, city-sized matriarch dormant beneath {colony}, broadcasting sub-space pheromone directives to every splinter nest across the sector.",
    choices: [
      {
        label: "Overload the planetary core tap to incinerate the chamber",
        result: "A controlled geothermal surge vaporizes the matriarch and silences every splinter hive.",
        effects: [
          { kind: "factories", amount: -7 },
          { kind: "culture", amount: 150 },
        ],
      },
      {
        label: "Deploy neural-dampening charges to capture the matriarch intact",
        result: "Heavy stasis fields lock down the central cavern, unlocking unprecedented biological data.",
        effects: [
          { kind: "research", field: "planetology", amount: 380 },
          { kind: "money", amount: -280 },
        ],
      },
      {
        label: "Collapse the shaft and seal the abyss under ferro-concrete",
        result: "Millions of tons of slag entomb the chamber, ending the threat at minimal cost.",
        effects: [
          { kind: "money", amount: -120 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
];

/** A trading guild offers a fortune for a live specimen. */
export interface SpecimenGambleDef {
  guildName: string;         // original
  offer: string;             // under 40 words, what they say
  /** BC paid if you deliver (200 to 600). */
  payment: number;
  /** Research in one field if you keep it yourself (200 to 400). */
  research: { field: "planetology" | "weapons" | "computers"; amount: number };
  /** Chance (0.1 to 0.4) the specimen escapes and starts a new infestation. */
  escapeChance: number;
  escapeText: string;        // under 30 words
  successText: string;       // under 30 words
}

export const SPECIMEN_GAMBLE: SpecimenGambleDef = {
  guildName: "Aurelian Syndicate",
  offer:
    "Our private biolabs will transfer 480 BC immediately for one intact, living crawler drone. No customs logs, no diplomatic questions, and full indemnity for your fleet.",
  payment: 480,
  research: { field: "planetology", amount: 340 },
  escapeChance: 0.25,
  escapeText:
    "Acidic secretions breached the stasis crate during transfer. The specimen vanished into the lower transit vents, and deck alarms are already wailing.",
  successText:
    "The syndicate's armored courier departs without incident, leaving untraceable credits in our treasury and zero biological trace aboard.",
};

/*
 * CLAUDE (2026-11-25): data only, not wired into play yet. When the chain runner is built, gate event 10
 * on the end of whichever branch was taken (6, 8 or 9), not on event 4. The specimen's escapeChance
 * applies only when the empire keeps it.
 *
 * BALANCE WORKING
 *
 * 1. Untreated 10-population colony survival & spread probability:
 *    - popLossPerTurn = 1 -> An untreated colony of 10 population reaches 0 in exactly 10 turns.
 *    - spreadChance = 0.08 per turn -> Probability of NOT spreading in a single turn is (1 - 0.08) = 0.92.
 *    - Over 10 turns (assuming active trade/transport routes exist each turn):
 *      P(no spread over 10 turns) = 0.92^10 ≈ 0.4344 (43.4%).
 *      P(at least one spread to a second colony) = 1 - 0.4344 ≈ 0.5656 (56.6%).
 *    - Result: Slightly over a coin-flip chance (56.6%) of spreading before burning itself out, giving
 *      the player a tense ~10-turn window to respond with ground troops (15 troops needed at 1.5/pop)
 *      or a 10-turn quarantine.
 *
 * 2. Specimen Gamble expected value:
 *    - Sell to Aurelian Syndicate: Guaranteed +480 BC (or if escapeChance applies to handling/transfer,
 *      see note below).
 *    - Keep for research: +340 Planetology research, with a 25% (0.25) chance of starting a new infestation.
 *    - Expected cost of failure: 0.25 * (1 colony worth ~1,200–1,600 BC in infrastructure/pop/troop response)
 *      ≈ -300 to -400 BC effective risk-adjusted cost, cleanly balancing the +340 research / +480 BC reward
 *      so neither option dominates.
 *
 * 3. Notes / anything unsure:
 *    - In INFESTATION_CHAIN event 10 ("infestation-10-the-brood-sovereign"), `requires` is set to
 *      "infestation-4-doctrine-of-containment" rather than a single branch event (6, 8, or 9) so that
 *      event 10 is reachable regardless of whether the player chose "order", "chaos", or "neutral" at
 *      event 4 (since `LateGameEventDef.requires` takes a single string, not an array). If Claude's
 *      chain runner automatically advances to the next non-branched event after a branch ends, `requires`
 *      can be adjusted to match the runner's exact gating logic.
 *    - In SPECIMEN_GAMBLE, the interface separates `payment` (sell) and `research` (keep) alongside a
 *      single `escapeChance`. Depending on how Claude wires the event, `escapeChance` can apply when
 *      keeping the specimen in your own labs (or to both options).
 */