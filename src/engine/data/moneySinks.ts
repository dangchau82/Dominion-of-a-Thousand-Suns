// Late-game money sinks for treasuries of 2,000 to 20,000 BC. Written by Gemini (2026-11-25), checked by Claude; rules built by Claude.

export type MoneySinkCategory =
  | "military"
  | "science"
  | "diplomacy"
  | "minorRaces"
  | "industry"
  | "finance";

export interface BourseOutcome {
  id: "boom" | "dividend" | "correction" | "default";
  label: string;
  probability: number;
  payoutMultiplier: number;
  bonusCulture: number;
  bonusMorale: number;
}

export interface MoneySinkDef {
  id: string;
  name: string;
  category: MoneySinkCategory;
  description: string;
  /** Scaling cost formula: Math.round((baseCost + colonyFactor * colonies) * (1 + turn / turnDivisor)). */
  baseCost: number;
  colonyFactor: number;
  turnDivisor: number;
  cooldownTurns: number;
  /** Active duration in turns (0 = instant, 1 = next council session, 10-15 = timed effect). */
  durationTurns: number;
  /** Benefit parameters read by the engine. */
  benefitKind:
    | "spawnMercenaryFleet"
    | "convertToResearch"
    | "buyCouncilVotes"
    | "buyMinorRaceLoyalty"
    | "rushWonderProduction"
    | "bourseInvestment";
  benefitValue: number;
  secondaryValue: number;
  /** Only populated for galactic-venture-exchange. */
  outcomes?: BourseOutcome[];
  aiSummary: string;
}

export const MONEY_SINKS: MoneySinkDef[] = [
  {
    id: "mercenary-armada",
    name: "Free-Company Battle Group",
    category: "military",
    description: "Hire an autonomous mercenary warship squadron that deploys immediately at your capital for 15 turns.",
    baseCost: 450,
    colonyFactor: 60,
    turnDivisor: 120,
    cooldownTurns: 10,
    durationTurns: 15,
    benefitKind: "spawnMercenaryFleet",
    benefitValue: 3, // base medium warships spawned (+1 per 50 turns elapsed)
    secondaryValue: 15, // upkeep BC per turn for 15 turns
    aiSummary: "Bought when at war with inferior local fleet strength and treasury exceeds 1.4x cost.",
  },
  {
    id: "emergency-research-grant",
    name: "Crash Symposium Grant",
    category: "science",
    description: "Funnel treasury reserves into active laboratories, converting BC into research at an inefficient 2.5:1 rate.",
    baseCost: 400,
    colonyFactor: 50,
    turnDivisor: 100,
    cooldownTurns: 5,
    durationTurns: 0,
    benefitKind: "convertToResearch",
    benefitValue: 0.4, // grants Math.round(cost * 0.40) RP in active field
    secondaryValue: 0,
    aiSummary: "Bought by science or boxed-in empires (or Ascension Gate contenders) with over 2,500 BC.",
  },
  {
    id: "council-lobbying-bloc",
    name: "Council Envoy Retainer",
    category: "diplomacy",
    description: "Bankroll neutral delegate blocs to secure +4 extra Galactic Council votes for the upcoming vote.",
    baseCost: 500,
    colonyFactor: 80,
    turnDivisor: 150,
    cooldownTurns: 8,
    durationTurns: 1,
    benefitKind: "buyCouncilVotes",
    benefitValue: 4, // +4 council votes for next vote (max 2 stacks)
    secondaryValue: 5, // +5 relations with minor delegations
    aiSummary: "Bought within 5 turns of a Council vote when +4 votes can swing an election or defeat a sanction.",
  },
  {
    id: "minor-race-patronage",
    name: "Sovereign Protectorate Charter",
    category: "minorRaces",
    description: "Endow trade guarantees on a neutral minor race to gain +35 loyalty and block rival bribes for 15 turns.",
    baseCost: 350,
    colonyFactor: 45,
    turnDivisor: 120,
    cooldownTurns: 6,
    durationTurns: 15,
    benefitKind: "buyMinorRaceLoyalty",
    benefitValue: 35, // +35 loyalty/relations with target minor race
    secondaryValue: 15, // turns rival bribery is locked out
    aiSummary: "Bought by diplomatic or vote-hungry AIs to lock in recurring minor-race gifts and votes.",
  },
  {
    id: "wonder-rush-consortium",
    name: "Guildwright Megaproject Rush",
    category: "industry",
    description: "Contract interstellar engineering guilds to inject immediate production progress into an active Galactic Wonder (not the Ascension Gate).",
    baseCost: 600,
    colonyFactor: 70,
    turnDivisor: 100,
    cooldownTurns: 8,
    durationTurns: 0,
    benefitKind: "rushWonderProduction",
    // Claude: 0.65 -> 0.45 (buying a building costs 2 BC per point, so 0.5 is the ceiling); never the Ascension Gate, which cannot be bought.
    benefitValue: 0.45, // adds Math.round(cost * 0.45) production to active wonder
    secondaryValue: 0,
    aiSummary: "Bought whenever building a unique Galactic Wonder (never the Ascension Gate) with excess cash.",
  },
  {
    id: "galactic-venture-exchange",
    name: "Astral Bourse Syndicate",
    category: "finance",
    description: "Invest a block of treasury into merchant syndicates that mature in 10 turns with risky returns.",
    baseCost: 500,
    colonyFactor: 60,
    turnDivisor: 120,
    cooldownTurns: 10,
    durationTurns: 10,
    benefitKind: "bourseInvestment",
    benefitValue: 10, // matures after 10 turns
    secondaryValue: 0,
    // Claude: payouts lowered so the average return is about 97%: a gamble that drains hoards, not a money machine (was 115%).
    outcomes: [
      { id: "boom", label: "Hyper-Lane Boom", probability: 0.25, payoutMultiplier: 1.5, bonusCulture: 40, bonusMorale: 0 },
      { id: "dividend", label: "Steady Guild Dividend", probability: 0.45, payoutMultiplier: 1.05, bonusCulture: 0, bonusMorale: 0 },
      { id: "correction", label: "Tariff Contraction", probability: 0.2, payoutMultiplier: 0.6, bonusCulture: 0, bonusMorale: 0 },
      { id: "default", label: "Syndicate Insolvency", probability: 0.1, payoutMultiplier: 0, bonusCulture: 0, bonusMorale: -2 },
    ],
    aiSummary: "Bought during peacetime by wealthy empires (treasury > 2.5x cost) to compound reserves.",
  },
];