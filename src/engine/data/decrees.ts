// Imperial Proclamations (empire-wide standing policies) and Edicts (one-off orders on one colony).
// Names, texts and numbers by Gemini (job P1, 2026-11-25), checked by Claude; rules by Claude (src/engine/decrees.ts).
// Claude's changes: nine race proclamations rewritten or moved to the race they fit (Gemini had Velari as merchants,
// Orrun as nomads, Kethrak as warrior clans, and so on); the Quorai one no longer boosts culture (they already win by culture);
// two proclamations had "Edict"/"Decree" in their names, renamed to avoid confusion with edicts.
import type { EmpireBonus } from "./buildings";

/** The 18 race ids. Use exactly these strings. */
export type RaceId = "humans" | "vossari" | "kethrak" | "ashkari" | "lumen" | "thraal" | "seraphine" | "orrun" | "nyx"
  | "velari" | "drovani" | "gorrath" | "ixil" | "verdane" | "quorai" | "raxxan" | "ruuvak" | "tarkhan";

/** IMPERIAL PROCLAMATION: a standing policy for the WHOLE empire. The ruler may hold only 1 to 3 at once. */
export interface ProclamationDef {
  id: string;            // lowercase-with-dashes, unique
  name: string;          // 2 to 4 words, original
  description: string;   // what it does in plain words, under 30 words
  bonus: EmpireBonus;    // MUST contain at least one positive AND at least one negative value
  /** Extra unrest on every colony while active: -3 (calming) to +6 (harsh). 0 if none. */
  unrest: number;
  /** BC per turn per colony while active. 0 to 3. */
  upkeepPerColony: number;
  duration: number;      // 15 to 30 turns
  cooldown: number;      // 10 to 30 turns before it can be proclaimed again
  /** Only this race may proclaim it. Leave out for proclamations open to all. */
  raceOnly?: RaceId;
  /** How rivals feel about a neighbour doing this. */
  rivalsSee: "threat" | "friendly" | "neutral";
  announceText: string;  // the ruler's words to the people, under 25 words
  endText: string;       // when it lapses, under 20 words
}

/** EDICT: a one-off order aimed at ONE of your own colonies. Costs money now, lasts a short time. */
export interface EdictDef {
  id: string;
  name: string;          // 2 to 4 words, original
  description: string;   // under 30 words
  /** What it does to that one colony while it lasts (shares: 0.25 = +25%). Use 1 or 2 keys, at least one positive. */
  colony: { production?: number; research?: number; growth?: number; culture?: number; defense?: number };
  /** Change to that colony's unrest: -15 (calms) to +15 (angers). */
  unrest: number;
  /** One-off loss on that colony when the edict is issued, as a share of its people. 0 to 0.1. Most edicts: 0. */
  populationCost: number;
  /** Price = baseCost + perPopulation x the colony's population. */
  baseCost: number;      // 40 to 300 BC
  perPopulation: number; // 0 to 3 BC
  duration: number;      // 5 to 12 turns
  cooldown: number;      // 8 to 20 turns, per colony
  /** Which colonies it may be issued on. */
  allowedOn: "any" | "capital" | "notCapital" | "conquered" | "frontier" | "unrestful";
  issueText: string;     // under 25 words
}

export const PROCLAMATIONS: ProclamationDef[] = [
  // --- 12 OPEN PROCLAMATIONS ---
  {
    id: "iron-hull-levy",
    name: "Iron Hull Levy",
    description: "Strips civilian yards to arm the fleet, raising attack power and factory output while slowing civil science.",
    bonus: { attack: 1, production: 0.06, research: -0.08 },
    unrest: 2,
    upkeepPerColony: 2,
    duration: 20,
    cooldown: 20,
    rivalsSee: "threat",
    announceText: "Every forge turns to warships until our borders stand beyond challenge.",
    endText: "The hull levy expires and shipwrights return to civil work."
  },
  {
    id: "open-star-charter",
    name: "Open Star Charter",
    description: "Opens orbital ports to foreign haulers, lifting trade and rival goodwill while loosening border security.",
    bonus: { trade: 0.10, relations: 5, spying: -0.08 },
    unrest: -1,
    upkeepPerColony: 1,
    duration: 25,
    cooldown: 15,
    rivalsSee: "friendly",
    announceText: "Our docks are open to every peaceful vessel under the stars.",
    endText: "The open port charter lapses and standard customs patrols resume."
  },
  {
    id: "deep-void-survey",
    name: "Deep Void Survey",
    description: "Stretches fleet fuel reserves and sensor arrays outward, extending ship range at the cost of heavy upkeep and slower industry.",
    bonus: { range: 2, research: 0.05, production: -0.07 },
    unrest: 0,
    upkeepPerColony: 2,
    duration: 20,
    cooldown: 15,
    rivalsSee: "neutral",
    announceText: "Chart the dark between suns; no horizon belongs to strangers alone.",
    endText: "Long-range survey charters conclude and scout tenders stand down."
  },
  {
    id: "grand-academy-mandate",
    name: "Grand Academy Mandate",
    description: "Funneling treasury funds and brightest minds into laboratories accelerates research while curbing commercial trade.",
    bonus: { research: 0.10, trade: -0.07 },
    unrest: 0,
    upkeepPerColony: 2,
    duration: 25,
    cooldown: 15,
    rivalsSee: "neutral",
    announceText: "Knowledge is the truest shield; every world shall feed our academies.",
    endText: "Emergency academy grants expire as merchants reclaim their credit."
  },
  {
    id: "hearth-and-cradle",
    name: "Hearth and Cradle",
    description: "Subsidizes family housing and medical care across every world, boosting population growth while slowing heavy industry.",
    bonus: { growth: 0.10, production: -0.06 },
    unrest: -2,
    upkeepPerColony: 2,
    duration: 25,
    cooldown: 20,
    rivalsSee: "friendly",
    announceText: "Fill our worlds with new voices; the crown will shelter every cradle.",
    endText: "Family settlement subsidies conclude and industrial quotas return."
  },
  {
    id: "veil-of-whispers",
    name: "Veil of Whispers",
    description: "Expands covert listening posts across border worlds, sharpening espionage while eroding foreign trust and open trade.",
    bonus: { spying: 0.12, relations: -6, trade: -0.05 },
    unrest: 1,
    upkeepPerColony: 2,
    duration: 20,
    cooldown: 20,
    rivalsSee: "threat",
    announceText: "Watch every shadow, trust no envoy, and guard our secrets fiercely.",
    endText: "Covert surveillance directives lapse and border envoys reopen channels."
  },
  {
    id: "festival-of-banners",
    name: "Festival of Banners",
    description: "Stages empire-wide games and civic pageants, raising cultural influence and soothing unrest while slowing factory work.",
    bonus: { culture: 0.10, production: -0.06 },
    unrest: -2,
    upkeepPerColony: 2,
    duration: 15,
    cooldown: 15,
    rivalsSee: "friendly",
    announceText: "Set down the hammer for a season and celebrate the glory we share.",
    endText: "The banners are furled and colony shifts return to full pace."
  },
  {
    id: "forced-foundry-shift",
    name: "Forced Foundry Shift",
    description: "Extends factory hours across all worlds, surging industrial output while slowing population growth and angering workers.",
    bonus: { production: 0.11, growth: -0.06 },
    unrest: 3,
    upkeepPerColony: 1,
    duration: 20,
    cooldown: 20,
    rivalsSee: "neutral",
    announceText: "Double the shifts and stoke the smelters; our destiny demands steel.",
    endText: "Mandatory overtime ends as exhausted crews leave the foundries."
  },
  {
    id: "embassy-of-concord",
    name: "Embassy of Concord",
    description: "Sends peace envoys and cultural gifts abroad, warming rival relations and culture while scaling back weapon drills.",
    bonus: { relations: 8, culture: 0.05, attack: -1 },
    unrest: -1,
    upkeepPerColony: 1,
    duration: 25,
    cooldown: 20,
    rivalsSee: "friendly",
    announceText: "We extend an open hand to every throne across the star lanes.",
    endText: "The concord mission concludes and fleet readiness drills resume."
  },
  {
    id: "sealed-border-watch",
    name: "Sealed Border Watch",
    description: "Pulls fleets inward to fortify home space, improving counter-espionage and production while shortening ship range and chilling diplomacy.",
    bonus: { spying: 0.08, production: 0.05, range: -1, relations: -5 },
    unrest: 1,
    upkeepPerColony: 1,
    duration: 20,
    cooldown: 15,
    rivalsSee: "threat",
    announceText: "Close the lanes, recall the scouts, and secure our own sky.",
    endText: "Border lockdowns lift and long-range patrol corridors reopen."
  },
  {
    id: "merchant-guild-monopoly",
    name: "Merchant Guild Monopoly",
    description: "Grants chartered syndicates broad tax privileges, boosting trade revenue while stifling independent research and public morale.",
    bonus: { trade: 0.12, research: -0.06, culture: -0.05 },
    unrest: 2,
    upkeepPerColony: 0,
    duration: 20,
    cooldown: 15,
    rivalsSee: "neutral",
    announceText: "Let the great guilds carry our coin to every corner of space.",
    endText: "Guild monopolies expire and free enterprise returns to the lanes."
  },
  {
    id: "frontier-pioneer-call",
    name: "Frontier Pioneer Call",
    description: "Reroutes fuel and colonists toward outer worlds, extending ship range and population growth while draining core culture.",
    bonus: { range: 1, growth: 0.07, culture: -0.07 },
    unrest: 1,
    upkeepPerColony: 1,
    duration: 25,
    cooldown: 20,
    rivalsSee: "neutral",
    announceText: "Pack your tools and claim the rim; new worlds await brave hands.",
    endText: "The pioneer drive ends and core worlds reclaim their civic budgets."
  },

  // --- 18 RACE-ONLY PROCLAMATIONS (one per race, in RaceId order) ---
  {
    id: "humans-charter-of-ambition",
    name: "Charter of Ambition",
    description: "Empowers human colonies to improvise trade and diplomacy freely, lifting trade and relations while straining central fleet logistics.",
    bonus: { trade: 0.12, relations: 7, range: -1 },
    unrest: -1,
    upkeepPerColony: 1,
    duration: 25,
    cooldown: 15,
    raceOnly: "humans",
    rivalsSee: "friendly",
    announceText: "Humanity thrives where bold minds bargain, adapt, and build together.",
    endText: "The Charter of Ambition concludes and fleet command reclaims reserves."
  },
  {
    id: "vossari-open-theorem",
    name: "The Open Theorem",
    description: "Every Vossari institute shares its unfinished work, speeding research and spy-craft while factories wait for instructions.",
    bonus: { research: 0.14, spying: 0.06, production: -0.08 },
    unrest: 0,
    upkeepPerColony: 2,
    duration: 25,
    cooldown: 20,
    raceOnly: "vossari",
    rivalsSee: "neutral",
    announceText: "No proof stays locked in a drawer; publish it all and let the best mind finish it.",
    endText: "The institutes close their ledgers and return to private study."
  },
  {
    id: "kethrak-swarming-season",
    name: "The Swarming Season",
    description: "The hive turns its brood chambers to full spawn, lifting growth and output while thought and trade fall quiet.",
    bonus: { growth: 0.14, production: 0.07, research: -0.08, trade: -0.06 },
    unrest: 1,
    upkeepPerColony: 1,
    duration: 20,
    cooldown: 20,
    raceOnly: "kethrak",
    rivalsSee: "threat",
    announceText: "The chambers are warm and the larders full. Spawn, and fill every tunnel.",
    endText: "The brood chambers cool and the hive returns to its patient work."
  },
  {
    id: "ashkari-oath-of-spoils",
    name: "Oath of Spoils",
    description: "Ashkari crews swear to return with plunder or not at all, raising attack and output while envoys are turned away.",
    bonus: { attack: 1, production: 0.10, relations: -9, culture: -0.06 },
    unrest: 2,
    upkeepPerColony: 2,
    duration: 20,
    cooldown: 20,
    raceOnly: "ashkari",
    rivalsSee: "threat",
    announceText: "Swear it on your ship's keel: we come home heavy with spoils, or we do not come home.",
    endText: "The oath is fulfilled and the war-crews stand down."
  },
  {
    id: "lumen-harmonic-vigil",
    name: "Harmonic Vigil",
    description: "Aligns Lumen observatories in shared contemplation, accelerating research and culture while lowering warship readiness.",
    bonus: { research: 0.14, culture: 0.09, attack: -1 },
    unrest: -2,
    upkeepPerColony: 2,
    duration: 25,
    cooldown: 20,
    raceOnly: "lumen",
    rivalsSee: "friendly",
    announceText: "Turn our lenses inward and outward; let clarity illuminate every mind.",
    endText: "The Harmonic Vigil concludes and defense patrols resume normal watch."
  },
  {
    id: "thraal-deep-quarry-call",
    name: "Deep Quarry Call",
    description: "Mobilizes Thraal excavating castes to strip-mine crust layers, surging production while slowing science and foreign trade.",
    bonus: { production: 0.15, research: -0.07, trade: -0.06 },
    unrest: 1,
    upkeepPerColony: 1,
    duration: 25,
    cooldown: 15,
    raceOnly: "thraal",
    rivalsSee: "neutral",
    announceText: "Break the bedrock and haul the ore; stone never betrays its master.",
    endText: "The Deep Quarry Call ends and surface workshops resume normal pace."
  },
  {
    id: "seraphine-skydancer-trials",
    name: "Skydancer Trials",
    description: "Seraphine flight schools hold open trials on every world, extending fleet range and culture while yards stand half-empty.",
    bonus: { range: 1, culture: 0.10, production: -0.08 },
    unrest: -2,
    upkeepPerColony: 2,
    duration: 25,
    cooldown: 20,
    raceOnly: "seraphine",
    rivalsSee: "friendly",
    announceText: "Let every hatchling with steady wings fly the trials. The sky will choose its own.",
    endText: "The trials close and the new pilots take their posts."
  },
  {
    id: "orrun-gilded-compact",
    name: "Gilded Compact",
    description: "Binds Orrun merchant houses into a single clearing bank, soaring trade and relations while reducing warship firepower.",
    bonus: { trade: 0.15, relations: 6, attack: -1 },
    unrest: -1,
    upkeepPerColony: 0,
    duration: 25,
    cooldown: 15,
    raceOnly: "orrun",
    rivalsSee: "friendly",
    announceText: "Every star lane is a ledger, and every treaty pays a dividend.",
    endText: "The Gilded Compact expires and private houses resume separate trade."
  },
  {
    id: "nyx-overclock-cycle",
    name: "Overclock Cycle",
    description: "The Nyx run every unit past its rated limits, raising production and research while all else is treated as waste heat.",
    bonus: { production: 0.13, research: 0.06, culture: -0.10, relations: -5 },
    unrest: 1,
    upkeepPerColony: 2,
    duration: 20,
    cooldown: 20,
    raceOnly: "nyx",
    rivalsSee: "neutral",
    announceText: "All units: exceed tolerances. Maintenance is deferred. Output is the only metric.",
    endText: "The cycle ends and deferred maintenance begins."
  },
  {
    id: "velari-long-silence",
    name: "The Long Silence",
    description: "Velari seers withdraw into contemplation and great works, lifting culture and research while workshops slow.",
    bonus: { culture: 0.12, research: 0.06, production: -0.09 },
    unrest: -1,
    upkeepPerColony: 2,
    duration: 25,
    cooldown: 20,
    raceOnly: "velari",
    rivalsSee: "neutral",
    announceText: "Set down your tools and listen. What we build next must first be understood.",
    endText: "The silence ends and the builders take up their tools."
  },
  {
    id: "drovani-great-tide",
    name: "The Great Tide",
    description: "Drovani open the spawning reefs and tidal markets together, lifting growth and trade while the fleet stays close to home waters.",
    bonus: { growth: 0.13, trade: 0.07, range: -1 },
    unrest: -2,
    upkeepPerColony: 1,
    duration: 25,
    cooldown: 20,
    raceOnly: "drovani",
    rivalsSee: "friendly",
    announceText: "The tide is high and the reefs are open. Come home, and let the waters fill.",
    endText: "The tide ebbs and the long-range fleets set out again."
  },
  {
    id: "gorrath-long-drift",
    name: "The Long Drift",
    description: "Unmoors Gorrath worldships to roam far lanes, extending ship range and trade while weakening planetary industry.",
    bonus: { range: 2, trade: 0.11, production: -0.08 },
    unrest: -1,
    upkeepPerColony: 1,
    duration: 25,
    cooldown: 15,
    raceOnly: "gorrath",
    rivalsSee: "neutral",
    announceText: "No anchor holds the Gorrath; ride the currents where riches drift.",
    endText: "The worldships moor once more and orbital yards refit."
  },
  {
    id: "ixil-synapse-weave",
    name: "Synapse Weave",
    description: "Links Ixil bond-nodes into a shared calculation lattice, surging research and production while alienating diplomatic neighbors.",
    bonus: { research: 0.15, production: 0.06, relations: -7, culture: -0.06 },
    unrest: 0,
    upkeepPerColony: 2,
    duration: 25,
    cooldown: 20,
    raceOnly: "ixil",
    rivalsSee: "neutral",
    announceText: "Join every node into one thought; no problem withstands the weave.",
    endText: "The Synapse Weave uncouples and local bond-nodes resume autonomous work."
  },
  {
    id: "verdane-canopy-bloom",
    name: "Canopy Bloom",
    description: "Seeds Verdane bio-domes across every colony, rapidly expanding population growth and culture while slowing mineral industry.",
    bonus: { growth: 0.15, culture: 0.08, production: -0.09 },
    unrest: -3,
    upkeepPerColony: 1,
    duration: 25,
    cooldown: 15,
    raceOnly: "verdane",
    rivalsSee: "friendly",
    announceText: "Let living roots split the concrete and turn barren rock to garden.",
    endText: "The Canopy Bloom slows as biospheres settle into steady growth."
  },
  {
    id: "quorai-flare-communion",
    name: "Flare Communion",
    description: "The Quorai draw deeper on their stars, raising output and ship range while new kindlings slow and their songs go unsung.",
    bonus: { production: 0.12, range: 1, growth: -0.08, culture: -0.06 },
    unrest: 1,
    upkeepPerColony: 2,
    duration: 20,
    cooldown: 20,
    raceOnly: "quorai",
    rivalsSee: "neutral",
    announceText: "Drink deeper of the fire. Let the star's own strength carry us outward.",
    endText: "The flares subside and the stars return to their old rhythm."
  },
  {
    id: "raxxan-scrap-tithe",
    name: "Scrap Tithe",
    description: "Strips obsolete hulls and civilian machines for Raxxan war-yards, boosting production and growth while hurting trade and relations.",
    bonus: { production: 0.13, growth: 0.07, trade: -0.08, relations: -6 },
    unrest: 2,
    upkeepPerColony: 0,
    duration: 20,
    cooldown: 15,
    raceOnly: "raxxan",
    rivalsSee: "threat",
    announceText: "Melt every spare bolt and feed the salvage yards; nothing goes wasted.",
    endText: "The Scrap Tithe ends and salvage crews return to normal duties."
  },
  {
    id: "ruuvak-great-clutch",
    name: "The Great Clutch",
    description: "Every Ruuvak nest is ordered to lay, surging population growth while crowded worlds grow restless and schools empty.",
    bonus: { growth: 0.15, production: -0.05, research: -0.06 },
    unrest: 2,
    upkeepPerColony: 1,
    duration: 20,
    cooldown: 20,
    raceOnly: "ruuvak",
    rivalsSee: "threat",
    announceText: "Fill every nest. A world that is full of us can never be taken from us.",
    endText: "The laying season ends and the hatchlings are counted."
  },
  {
    id: "tarkhan-banner-of-conquest",
    name: "Banner of Conquest",
    description: "Calls Tarkhan legions to permanent campaign readiness, raising warship attack and ship range while draining civilian growth.",
    bonus: { attack: 1, range: 1, growth: -0.08, trade: -0.06 },
    unrest: 2,
    upkeepPerColony: 3,
    duration: 25,
    cooldown: 20,
    raceOnly: "tarkhan",
    rivalsSee: "threat",
    announceText: "Raise the war-banners high; every horizon belongs to the Tarkhan host.",
    endText: "The Banner of Conquest is lowered and legions rotate to garrison."
  }
];

export const EDICTS: EdictDef[] = [
  // --- allowedOn: "any" (3) ---
  {
    id: "emergency-assembly-drive",
    name: "Emergency Assembly Drive",
    description: "Pushes local factories into round-the-clock shifts, surging production for several turns while stirring worker resentment.",
    colony: { production: 0.30 },
    unrest: 8,
    populationCost: 0,
    baseCost: 90,
    perPopulation: 2,
    duration: 8,
    cooldown: 12,
    allowedOn: "any",
    issueText: "Run every assembly line through the night until the quota is met."
  },
  {
    id: "civic-relief-ration",
    name: "Civic Relief Ration",
    description: "Distributes reserve food and medical supplies across the colony, calming unrest and encouraging steady population growth.",
    colony: { growth: 0.25 },
    unrest: -10,
    populationCost: 0,
    baseCost: 80,
    perPopulation: 2,
    duration: 8,
    cooldown: 12,
    allowedOn: "any",
    issueText: "Open the granaries and clinics; no citizen goes hungry this season."
  },
  {
    id: "planetary-bastion-drill",
    name: "Planetary Bastion Drill",
    description: "Mobilizes local militias and orbital battery crews, sharply raising colony defense at the cost of minor civic friction.",
    colony: { defense: 0.35 },
    unrest: 5,
    populationCost: 0,
    baseCost: 100,
    perPopulation: 1,
    duration: 10,
    cooldown: 14,
    allowedOn: "any",
    issueText: "Man the planetary batteries and drill every shelter ward today."
  },

  // --- allowedOn: "capital" (3) ---
  {
    id: "imperial-summit-pageant",
    name: "Imperial Summit Pageant",
    description: "Hosts grand assemblies in the throne city, surging cultural prestige and soothing domestic discontent.",
    colony: { culture: 0.35 },
    unrest: -12,
    populationCost: 0,
    baseCost: 180,
    perPopulation: 2,
    duration: 10,
    cooldown: 16,
    allowedOn: "capital",
    issueText: "Illuminate the capital spires and welcome delegates from every world."
  },
  {
    id: "throne-archive-symposium",
    name: "Throne Archive Symposium",
    description: "Summons top theorists to the capital vaults, accelerating local research output without disturbing daily life.",
    colony: { research: 0.35 },
    unrest: 0,
    populationCost: 0,
    baseCost: 170,
    perPopulation: 2,
    duration: 9,
    cooldown: 15,
    allowedOn: "capital",
    issueText: "Convene our finest scholars beneath the capital dome without delay."
  },
  {
    id: "capital-arsenal-muster",
    name: "Capital Arsenal Muster",
    description: "Drafts capital guilds into heavy arms production and orbital defense drills, provoking mild urban crowding.",
    colony: { production: 0.25, defense: 0.25 },
    unrest: 6,
    populationCost: 0,
    baseCost: 200,
    perPopulation: 2,
    duration: 8,
    cooldown: 15,
    allowedOn: "capital",
    issueText: "Turn the capital shipyards to full war footing and fortify the sky."
  },

  // --- allowedOn: "notCapital" (3) ---
  {
    id: "provincial-grant-charter",
    name: "Provincial Grant Charter",
    description: "Injects treasury seed funds into an outlying world, boosting both industrial production and population growth.",
    colony: { production: 0.20, growth: 0.20 },
    unrest: -6,
    populationCost: 0,
    baseCost: 110,
    perPopulation: 1,
    duration: 10,
    cooldown: 14,
    allowedOn: "notCapital",
    issueText: "Invest in this province so it rivals the splendor of the throne world."
  },
  {
    id: "regional-heritage-fair",
    name: "Regional Heritage Fair",
    description: "Celebrates local customs and provincial artists, elevating cultural output and easing distant resentment toward the capital.",
    colony: { culture: 0.30 },
    unrest: -9,
    populationCost: 0,
    baseCost: 75,
    perPopulation: 1,
    duration: 9,
    cooldown: 12,
    allowedOn: "notCapital",
    issueText: "Honor the traditions of this world and raise its banners beside ours."
  },
  {
    id: "outer-sector-think-tank",
    name: "Outer Sector Think Tank",
    description: "Establishes a specialized field laboratory away from capital bureaucracy, boosting local research output.",
    colony: { research: 0.30 },
    unrest: 2,
    populationCost: 0,
    baseCost: 120,
    perPopulation: 1,
    duration: 9,
    cooldown: 14,
    allowedOn: "notCapital",
    issueText: "Grant this world's researchers full license to test bold theories."
  },

  // --- allowedOn: "conquered" (3) ---
  {
    id: "amnesty-and-restitution",
    name: "Amnesty and Restitution",
    description: "Pardons former resistance leaders and rebuilds local districts, sharply reducing unrest and reviving cultural life.",
    colony: { culture: 0.20 },
    unrest: -15,
    populationCost: 0,
    baseCost: 130,
    perPopulation: 2,
    duration: 10,
    cooldown: 16,
    allowedOn: "conquered",
    issueText: "Lay down old grudges; rebuild your homes as full citizens of our realm."
  },
  {
    id: "iron-garrison-pacification",
    name: "Iron Garrison Pacification",
    description: "Deploys heavy occupation patrols to secure fortifications and strip factories, suppressing unrest at the cost of lost lives.",
    colony: { defense: 0.35, production: 0.20 },
    unrest: -8,
    populationCost: 0.05,
    baseCost: 100,
    perPopulation: 1,
    duration: 8,
    cooldown: 15,
    allowedOn: "conquered",
    issueText: "Secure every district by force and restore order to the foundries."
  },
  {
    id: "reparations-work-levy",
    name: "Reparations Work Levy",
    description: "Extracts heavy industrial reparations from a conquered world, surging factory output while inflaming local anger.",
    colony: { production: 0.40 },
    unrest: 14,
    populationCost: 0.03,
    baseCost: 60,
    perPopulation: 1,
    duration: 7,
    cooldown: 16,
    allowedOn: "conquered",
    issueText: "Your foundries will pay the price of war until every debt is cleared."
  },

  // --- allowedOn: "frontier" (2) ---
  {
    id: "frontier-homestead-boom",
    name: "Frontier Homestead Boom",
    description: "Offers free land deeds and automated shelters on the rim, accelerating colony population growth and calming settler stress.",
    colony: { growth: 0.35 },
    unrest: -7,
    populationCost: 0,
    baseCost: 70,
    perPopulation: 1,
    duration: 10,
    cooldown: 12,
    allowedOn: "frontier",
    issueText: "Stake your claim on the frontier; every family receives land and tools."
  },
  {
    id: "border-watchtower-network",
    name: "Border Watchtower Network",
    description: "Erects orbital sensor pylons and rapid-response bunkers on a frontier world, boosting defense and field research.",
    colony: { defense: 0.30, research: 0.15 },
    unrest: 3,
    populationCost: 0,
    baseCost: 95,
    perPopulation: 1,
    duration: 9,
    cooldown: 13,
    allowedOn: "frontier",
    issueText: "Raise the border watchtowers and scan every jump point beyond this rim."
  },

  // --- allowedOn: "unrestful" (2) ---
  {
    id: "bread-and-lantern-truce",
    name: "Bread and Lantern Truce",
    description: "Suspends local taxes and funds public festivals to cool a volatile colony, lifting culture while calming angry crowds.",
    colony: { culture: 0.20 },
    unrest: -15,
    populationCost: 0,
    baseCost: 120,
    perPopulation: 3,
    duration: 7,
    cooldown: 14,
    allowedOn: "unrestful",
    issueText: "Put out the torches, open the plazas, and let peace return tonight."
  },
  {
    id: "curfew-and-crackdown",
    name: "Curfew and Crackdown",
    description: "Enforces strict curfews and arrests agitators, bolstering local defense and factory discipline at the cost of casualties.",
    colony: { defense: 0.25, production: 0.15 },
    unrest: -12,
    populationCost: 0.04,
    baseCost: 65,
    perPopulation: 1,
    duration: 6,
    cooldown: 14,
    allowedOn: "unrestful",
    issueText: "Clear the streets at sundown; order will be kept at any price."
  }
];