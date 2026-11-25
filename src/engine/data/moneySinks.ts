// Treasury money sinks for mid- and late-game BC surpluses.
// Written by Gemini (2026-11-25, second version), checked by Claude; rules built by Claude.
import type { EventEffect } from "./events";

export interface MoneySinkCost {
  base: number;
  perTurn: number;
  perColony: number;
  perMinorWorld?: number;
}

export interface MoneySinkOutcome {
  chance: number;
  result: string;
  effects: EventEffect[];
  special?: {
    kind: "spawnMercenaries" | "crashResearch" | "councilVoteShare" | "minorLoyalty" | "wonderRush" | "exchangeBond";
    value: number;
    durationTurns?: number;
  };
}

export interface MoneySinkDef {
  id: string;
  name: string;
  formulaText: string;
  cost: MoneySinkCost;
  cooldownTurns: number;
  /** Measurable AI trigger condition using only EmpireView fields. */
  aiRule: string;
  description: string;
  outcomes: MoneySinkOutcome[];
}

export const MONEY_SINKS: MoneySinkDef[] = [
  {
    id: "mercenary-contract",
    name: "Privateer Armada Charter",
    formulaText: "Math.round(450 + turn * 6 + colonies * 35)",
    cost: { base: 450, perTurn: 6, perColony: 35 },
    cooldownTurns: 12,
    aiRule: "wars.length > 0 && fleetPower < wantPower && treasury >= cost + 300",
    description: "Hire an independent strike squadron (3 medium warships and 1 large cruiser scaled to your tech tier, +1 attack) at your capital. Carries a 15% risk that captains pocket part of the fee and raid an outlying colony.",
    outcomes: [
      {
        // EV at T=100, C=10 (cost 1,400 BC): 0.85 * (+150) + 0.15 * (-1,865) = -152.2 BC
        chance: 0.85,
        result: "Four veteran privateer hulls dock at {colony} under your banner, ready for immediate deployment.",
        effects: [],
        special: { kind: "spawnMercenaries", value: 4 },
      },
      {
        chance: 0.15,
        result: "Rogue captains skim 30% of the retainer and loot border depots on {colony} before vanishing into deep space.",
        effects: [
          { kind: "money", amount: -420 },
          { kind: "population", amount: -1 },
          { kind: "factories", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "emergency-research-grant",
    name: "Crash-Program Institute",
    formulaText: "Math.round(400 + turn * 4 + colonies * 25)",
    cost: { base: 400, perTurn: 4, perColony: 25 },
    cooldownTurns: 8,
    aiRule: "(boxedIn.range || boxedIn.hostility || techVictoryProgress >= 4) && treasury > 1500 + turn * 6",
    description: "Convert surplus treasury directly into immediate research points in your lowest-tier field at a steep 0.45 RP per BC rate.",
    outcomes: [
      {
        // EV at T=100, C=10 (cost 1,050 BC): +473 RP (+473 BC eq.) - 1,050 BC = -577.0 BC
        chance: 1,
        result: "Emergency laboratories work around the clock, converting treasury reserves into immediate theoretical breakthroughs.",
        effects: [],
        special: { kind: "crashResearch", value: 0.45 },
      },
    ],
  },
  {
    id: "council-lobbying",
    name: "Delegate Syndicate Retainer",
    formulaText: "Math.round(600 + turn * 5 + colonies * 40)",
    cost: { base: 600, perTurn: 5, perColony: 40 },
    cooldownTurns: 15,
    aiRule: "council.nextTurn - turn <= 10 && isCouncilContender && treasury >= cost + 400",
    description: "Retain off-world syndicates to secure +4% bonus Galactic Council vote share for the next session and improve ties with two wary rivals, at a 20% risk of a diplomatic leak.",
    outcomes: [
      {
        // EV at T=100, C=10 (cost 1,600 BC): 0.80 * (-1,300) + 0.20 * (-1,840) = -1,408.0 BC
        chance: 0.8,
        result: "Discreet envoys lock in swing delegates across the sector ahead of the upcoming council vote.",
        effects: [{ kind: "relations", amount: 6 }],
        special: { kind: "councilVoteShare", value: 0.04, durationTurns: 15 },
      },
      {
        chance: 0.2,
        result: "A leaked ledger exposes your slush fund to the galaxy, alienating rivals and cutting your swing bloc in half.",
        effects: [{ kind: "relations", amount: -12 }],
        special: { kind: "councilVoteShare", value: 0.02, durationTurns: 15 },
      },
    ],
  },
  {
    id: "minor-race-patronage",
    name: "Sovereign Patronage Endowment",
    formulaText: "Math.round(350 + turn * 3 + minorWorlds * 150)",
    cost: { base: 350, perTurn: 3, perColony: 0, perMinorWorld: 150 },
    cooldownTurns: 15,
    aiRule: "hasUnalliedMinorWithLoyaltyAtLeast30 && treasury > 1000 + turn * 5",
    description: "Endow infrastructure and trade credits for a minor enclave, granting +45 loyalty (securing their +10 RP/turn or +3% council vote gift) unless conquered by a rival.",
    outcomes: [
      {
        // EV at T=100, minorWorlds=2 (cost 950 BC): 0.85 * (-600) + 0.15 * (-900) = -645.0 BC
        chance: 0.85,
        result: "Enclave elders ratify a permanent patronage charter, pledging their scholars and delegates to your cause.",
        effects: [{ kind: "relations", amount: 10 }],
        special: { kind: "minorLoyalty", value: 45, durationTurns: 25 },
      },
      {
        chance: 0.15,
        result: "Border raiders disrupt the enclave shortly after payment, limiting your return to a single diplomatic tribute.",
        effects: [{ kind: "money", amount: 50 }],
      },
    ],
  },
  {
    id: "wonder-rush-grant",
    name: "Imperial Monument Bonds",
    formulaText: "Math.round(500 + turn * 4 + colonies * 20)",
    cost: { base: 500, perTurn: 4, perColony: 20 },
    cooldownTurns: 6,
    aiRule: "hasActiveWonderBuild && wonder !== 'w-ascension' && treasury >= cost + 500",
    description: "Issue high-yield state bonds to rush an active Galactic Wonder (never the Ascension Gate, which cannot be bought), converting BC into immediate wonder production at a 0.45 production-per-BC rate.",
    outcomes: [
      {
        // EV at T=100, C=10 (cost 1,100 BC): 0.90 * (495 - 1,100) + 0.10 * (-1,100) = -654.5 BC
        chance: 1,
        result: "Thousands of private haulers and engineers converge on {colony}, accelerating wonder assembly.",
        effects: [],
        special: { kind: "wonderRush", value: 0.45 },
      },
    ],
  },
  {
    id: "interstellar-exchange",
    name: "Freeport Venture Syndicate",
    formulaText: "Math.round(500 + turn * 5 + colonies * 30)",
    cost: { base: 500, perTurn: 5, perColony: 30 },
    cooldownTurns: 10,
    aiRule: "wars.length === 0 && treasury > 1800 + turn * 8",
    description: "Invest treasury in a 10-turn interstellar trade bond. Matures with a boom (45% for 1.30x payout + 40 culture), a small loss after fees (35% for 0.95x), or a market crash (20% for 0.30x). On average it loses a little: a gamble, not a money machine.",
    outcomes: [
      {
        // Claude: Gemini's payouts (1.65 / 1.20 / 0.45) returned 125% on average, a money machine, the opposite of a sink.
        // Now 0.45*1.30 + 0.35*0.95 + 0.20*0.30 = 0.98: about 2% lost on average.
        chance: 0.45,
        result: "Freeport trade volumes surge across the sector, returning 130% of your principal plus cultural prestige.",
        effects: [{ kind: "culture", amount: 40 }],
        special: { kind: "exchangeBond", value: 1.3, durationTurns: 10 },
      },
      {
        chance: 0.35,
        result: "Steady convoy tariffs return most of your bond, 95% after broker fees.",
        effects: [],
        special: { kind: "exchangeBond", value: 0.95, durationTurns: 10 },
      },
      {
        chance: 0.2,
        result: "Frontier piracy and guild defaults trigger a crash, wiping out 70% of your invested principal.",
        effects: [{ kind: "morale", amount: -2 }],
        special: { kind: "exchangeBond", value: 0.3, durationTurns: 10 },
      },
    ],
  },
];