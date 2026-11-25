// Death worlds and prison worlds. Written by Gemini; rules built by Claude.
// Checked by Claude 2026-11-25: ids unique, effects in scale. Passed. (Gemini called this file deathWorlds.ts.)
import type { GameEventDef } from "./events";

export interface DeathWorldDef {
  id: string;
  name: string;              // the kind of world, original (e.g. "Furnace Dawn World")
  description: string;       // under 35 words, what scouts report
  /** What kills colonists, in plain words, under 20 words. */
  hazard: string;
  /** Minerals bonus: production multiplier (1.2 to 2.0). */
  productionMult: number;
  /** Population lost each turn without the counter-measure (0.2 to 1.5). */
  popLossPerTurn: number;
  /** What stops the losses: a research field and tier (tier 2 to 8). */
  counter: { field: "planetology" | "construction" | "forceFields"; tier: number; name: string };
  /** BC per turn to keep the colony safe once countered (2 to 15). */
  upkeep: number;
}

export const DEATH_WORLDS: DeathWorldDef[] = [
  {
    id: "furnace-dawn-world",
    name: "Furnace Dawn World",
    description:
      "Slow-rotating desert world rich in exposed platinum seams. Daylight sweeps across the crust like a blast furnace, forcing miners underground until twilight returns.",
    hazard: "Seventy-hour solar dawns flash-boil exposed flesh and crack unshielded hull plating.",
    productionMult: 1.7,
    popLossPerTurn: 1.0,
    counter: { field: "construction", tier: 4, name: "Sub-Crust Thermal Vaults" },
    upkeep: 9,
  },
  {
    id: "eclipse-predator-world",
    name: "Eclipse Predator World",
    description:
      "A gloom-shrouded basin planet packed with dense heavy-metal veins. Whenever its twin moons align, starved subterranean swarms pour out to hunt anything warm.",
    hazard: "Pack-hunting cave stalkers swarm surface outposts during multi-day lunar eclipses.",
    productionMult: 1.6,
    popLossPerTurn: 0.9,
    counter: { field: "forceFields", tier: 5, name: "Perimeter Stasis Fences" },
    upkeep: 8,
  },
  {
    id: "vitriol-squall-world",
    name: "Vitriol Squall World",
    description:
      "Yellow cloud decks churn over hyper-dense iridium ridges. Corrosive lightning squalls strip paint, seals, and lungs within minutes of any breach.",
    hazard: "Sulfuric windstorms dissolve standard pressure seals and scorch unprotected airways.",
    productionMult: 1.5,
    popLossPerTurn: 0.7,
    counter: { field: "planetology", tier: 3, name: "Fluoropolymer Dome Liners" },
    upkeep: 6,
  },
  {
    id: "rust-glacier-world",
    name: "Rust Glacier World",
    description:
      "Frozen brine continents laced with catalytic salts that devour refined alloys on contact, hiding vast deposits of pure titanium beneath brittle ice shelves.",
    hazard: "Cryo-halide frost pits structural steel and collapses habitats overnight.",
    productionMult: 1.4,
    popLossPerTurn: 0.5,
    counter: { field: "construction", tier: 2, name: "Ceramic-Clad Bulkheads" },
    upkeep: 4,
  },
  {
    id: "spore-miasma-world",
    name: "Spore Miasma World",
    description:
      "Fungal jungles blanket rare isotope bogs. Every wind gust releases microscopic barbs that take root inside air scrubbers and human respiratory tracts alike.",
    hazard: "Airborne fungal needles clog filtration grids and calcify human lung tissue.",
    productionMult: 1.3,
    popLossPerTurn: 0.4,
    counter: { field: "planetology", tier: 2, name: "Catalytic Bio-Scrubbers" },
    upkeep: 3,
  },
  {
    id: "razor-glass-world",
    name: "Razor Glass World",
    description:
      "Hyper-velocity jet streams whip pulverized volcanic obsidian across exposed super-heavy ore beds, shredding habitats and blinding orbital dropships during gales.",
    hazard: "Supersonic volcanic glass gales slice through suits, cables, and unreinforced domes.",
    productionMult: 1.9,
    popLossPerTurn: 1.3,
    counter: { field: "forceFields", tier: 7, name: "Repulsor Wind-Deflectors" },
    upkeep: 13,
  },
];

export interface PrisonColonyDef {
  /** BC to declare a world a prison colony (100 to 400). */
  setupCost: number;
  /** Production bonus from forced labour (0.1 to 0.4). */
  productionBonus: number;
  /** Unrest added per turn (1 to 6). */
  unrestPerTurn: number;
  /** Chance per turn of an escape that costs morale or a riot (0.02 to 0.1). */
  escapeChance: number;
  /** Morale lost across the empire when it is declared (0 to 6): some people object. */
  moraleCost: number;
  description: string;       // under 35 words, for the player
}

export const PRISON_COLONY: PrisonColonyDef = {
  setupCost: 220,
  productionBonus: 0.25,
  unrestPerTurn: 3,
  escapeChance: 0.06,
  moraleCost: 3,
  description:
    "Converts a harsh frontier world into a penal labor complex. Boosts industrial output cheaply, but breeds chronic unrest, daring escapes, and violent uprisings.",
};

/** Events on prison worlds. trigger "colony". Escapes, riots, a convict hero, a corrupt warden, a jailbreak fleet, a pardon. */
export const PRISON_EVENTS: GameEventDef[] = [
  {
    id: "prison-ore-barge-breakout",
    title: "Ore Barge Breakout",
    art: "pirates",
    trigger: "colony",
    text: "Forty long-term convicts at {colony} hijacked an automated bulk ore barge during shift change, overriding its transponder and burning hard toward the outer asteroid belt.",
    choices: [
      {
        label: "Scramble interceptors to disable the stolen barge",
        result: "Patrol cutters cripple the barge's drives and haul the survivors back to solitary cells.",
        effects: [
          { kind: "money", amount: -110 },
          { kind: "morale", amount: 2 },
        ],
      },
      {
        label: "Let them flee and tighten perimeter lockdown at home",
        result: "The escapees vanish into pirate space, embarrassing security officials across the empire.",
        effects: [
          { kind: "morale", amount: -4 },
          { kind: "factories", amount: 2 },
        ],
      },
    ],
  },
  {
    id: "prison-foundry-cellblock-uprising",
    title: "Foundry Cellblock Uprising",
    art: "crisis",
    trigger: "colony",
    text: "Inmates at {colony} seized the main smelting foundry, welding blast shutters shut and threatening to detonate the plasma furnaces unless work quotas are cut in half.",
    choices: [
      {
        label: "Storm the foundry with shock-troop breach teams",
        result: "Security forces retake the smelter in brutal close quarters, wrecking several assembly lines.",
        effects: [
          { kind: "factories", amount: -5 },
          { kind: "population", amount: -1 },
          { kind: "morale", amount: 2 },
        ],
      },
      {
        label: "Grant shorter shifts and extra rations to end the standoff",
        result: "The furnaces cool safely and work resumes at a slower, costlier pace.",
        effects: [
          { kind: "money", amount: -140 },
          { kind: "morale", amount: 3 },
        ],
      },
    ],
  },
  {
    id: "prison-the-tunnel-savior",
    title: "The Tunnel Savior",
    art: "anomaly",
    trigger: "colony",
    text: "When a deep-shaft quake collapsed the main oxygen manifold at {colony}, a notorious life-sentence convict crawled through superheated vents to seal the breach and save two hundred guards and inmates.",
    choices: [
      {
        label: "Commute the sentence and publicize the heroic rescue",
        result: "News networks broadcast the redemption story across every core world.",
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -60 },
        ],
      },
      {
        label: "Keep the convict locked up but promote them to foreman",
        result: "Work crews respect their new lead miner, driving output higher without softening policy.",
        effects: [
          { kind: "factories", amount: 3 },
          { kind: "morale", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "prison-the-wardens-ledger",
    title: "The Warden's Ledger",
    art: "council",
    trigger: "colony",
    text: "Auditors inspecting {colony} uncovered a hidden ledger proving the planetary warden has been skimming ration budgets and selling contraband weapons to inmate syndicates.",
    choices: [
      {
        label: "Arrest the warden publicly and confiscate hidden accounts",
        result: "Seized slush funds flow back into the treasury, though the scandal shakes public trust.",
        effects: [
          { kind: "money", amount: 190 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Quietly replace the warden and cover up the audit",
        result: "A disciplined administrator restores order behind closed doors at treasury expense.",
        effects: [
          { kind: "money", amount: -120 },
          { kind: "morale", amount: 2 },
        ],
      },
    ],
  },
  {
    id: "prison-corsair-jailbreak-armada",
    title: "Corsair Jailbreak Armada",
    art: "pirates",
    trigger: "colony",
    text: "Armed raiders hired by the {rival} dropped out of warp above {colony}, jamming orbital defense batteries while troop landers descended to liberate captured cartel bosses.",
    choices: [
      {
        label: "Pay local mercenary gunships to drive off the raiders",
        result: "Hired escorts scatter the landing craft before the main cellblocks are breached.",
        effects: [
          { kind: "money", amount: -220 },
          { kind: "relations", amount: -12 },
        ],
      },
      {
        label: "Seal the bunker vaults and let the raiders loot outer depots",
        result: "The command tiers hold, but raiders strip surface warehouses and free dozens of inmates.",
        effects: [
          { kind: "factories", amount: -4 },
          { kind: "population", amount: -2 },
          { kind: "relations", amount: -15 },
        ],
      },
    ],
  },
  {
    id: "prison-the-amnesty-petition",
    title: "The Amnesty Petition",
    art: "council",
    trigger: "colony",
    text: "Civic reformers and front-line commanders petition for a general pardon at {colony}, offering non-violent prisoners full citizenship in exchange for dangerous frontier resettlement.",
    choices: [
      {
        label: "Grant full pardons and charter a frontier colony vessel",
        result: "Freed convicts board a converted transport eager to build a new life on the rim.",
        effects: [
          { kind: "ships", template: "colony", count: 1 },
          { kind: "population", amount: -2 },
          { kind: "culture", amount: 95 },
        ],
      },
      {
        label: "Reject the petition and expand forced industrial shifts",
        result: "Harsh sentences stand, boosting local factory output while angering reform advocates.",
        effects: [
          { kind: "factories", amount: 4 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
];

/*
 * CLAUDE (2026-11-25): data only. Death worlds will be a new Planet.special; the counter is "any tech in
 * counter.field at counter.tier or higher". Prison worlds add PRISON_COLONY.unrestPerTurn to the colony's
 * unrest target (src/engine/unrest.ts), and PRISON_EVENTS fire only on prison worlds.
 *
 * BALANCE WORKING & NOTES
 *
 * 1. Death world payback working (size-10 colony):
 *    - In Dominion, a size-10 colony with developed factories produces roughly 20 to 30 BC/turn
 *      in gross industrial output (at ~2 to 3 BC per pop/factory unit).
 *    - Take "Eclipse Predator World" (productionMult: 1.6, upkeep: 8 BC/turn, counter tier 5).
 *      Extra output = +60% of 25 BC = +15 BC/turn.
 *      Net gain after 8 BC upkeep = +7 BC/turn.
 *      If the player rushed or invested ~140 to 210 BC equivalent in tier-5 Force Fields research
 *      and initial dome conversion, net surplus pays back that overhead in ~20 to 30 turns, and
 *      covers its ongoing 8 BC upkeep every single turn once size >= 7 (~14 BC base * 0.6 = 8.4 BC).
 *    - Take "Razor Glass World" (productionMult: 1.9, upkeep: 13 BC/turn, counter tier 7).
 *      Extra output = +90% of 30 BC = +27 BC/turn.
 *      Net gain after 13 BC upkeep = +14 BC/turn, paying off a ~280 BC late-game investment in
 *      20 turns while making small size-3 outposts unprofitable until grown or countered.
 *
 * 2. Prison colony production vs. unrest & escape costs:
 *    - Setup: 220 BC upfront and -3 empire-wide morale.
 *    - Benefit: +25% production bonus (`productionBonus: 0.25`). On a mid-game size-12 industrial
 *      world generating ~36 BC/turn, +25% yields +9 BC/turn (paying back the 220 BC setup cost
 *      in ~24.4 turns before event drag).
 *    - Ongoing drag: +3 unrest/turn requires garrison troops or morale buildings (~2 to 3 BC/turn
 *      opportunity cost), plus `escapeChance: 0.06` (~1 event every 16.7 turns). Average negative
 *      event option costs ~110 to 150 BC or ~4 factories (~6 to 9 BC/turn amortized drag).
 *    - Net result: Roughly +3 to +5 BC/turn true profit on a large industrial world, while a small
 *      or low-production colony loses money once unrest and escape losses are factored in.
 *
 * 3. Anything unsure / engine integration notes:
 *    - `PRISON_EVENTS` uses `{colony}` in `text` (and `"the {rival}"` in `prison-corsair-jailbreak-armada`).
 *      Claude's colony-event dispatcher should filter `PRISON_EVENTS` so they only fire on colonies
 *      flagged as prison colonies.
 *    - `DeathWorldDef.counter` uses `"planetology" | "construction" | "forceFields"` and `tier` (2 to 7),
 *      assuming the engine checks whether the empire owns any tech in `counter.field` at `>= counter.tier`.
 */