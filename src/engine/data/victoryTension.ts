// Public victory-race warnings (50%, 75%, 90%) and bounded counter-plays.
// Written by Gemini (2026-11-25), checked by Claude; rules built by Claude.
// Claude: Gemini used old victory rules (culture 75,000; council two-thirds). Fixed to the real ones
// in src/engine/victory.ts: CULTURE_VICTORY 90,000 and VOTE_SHARE_TO_WIN 60%.
import type { VictoryKind } from "../types";

export type VictoryMilestone = 50 | 75 | 90;

export interface VictoryWarningDef {
  milestone: VictoryMilestone;
  /** Exact threshold ratio in [0, 1] of the victory condition. */
  ratio: number;
  text: string;
}

export interface VictoryCounterPlayDef {
  id: string;
  name: string;
  victoryKind: VictoryKind;
  /** Minimum progress ratio (0.75 = 75% to victory) before rivals can trigger it. */
  triggerRatio: number;
  cooldownTurns: number;
  /** Hard cap on how many empires may declare war from this counter-play at once. */
  maxSimultaneousWars: 0 | 1 | 2;
  /** Max number of rival empires that can join a single counter-play activation. */
  maxParticipants: 2;
  bcCostPerParticipant: number;
  /** Exact measurable rules and numbers for engine execution. */
  rules: {
    effectSummary: string;
    leaderProgressPenalty: number;
    leaderRelationsDelta: number;
    coalitionBonus?: { attack?: number; productionPct?: number; durationTurns: number };
  };
  aiRule: string;
  announceText: string;
}

export interface VictoryTensionDef {
  kind: VictoryKind;
  progressFormula: string;
  warnings: [VictoryWarningDef, VictoryWarningDef, VictoryWarningDef];
  counterPlay: VictoryCounterPlayDef;
}

export const MAX_COUNTERPLAY_WARS = 2;

export const VICTORY_TENSION: VictoryTensionDef[] = [
  // =========================================================================
  // 1. CULTURE VICTORY (CULTURE_VICTORY = 90,000 in src/engine/victory.ts)
  // =========================================================================
  {
    kind: "culture",
    progressFormula: "empire.culture / CULTURE_VICTORY",
    warnings: [
      {
        milestone: 50,
        ratio: 0.5,
        text: "Cultural tide rising: the {rival} has reached 45,000 culture (50% to Cultural Hegemony), drawing artists and pilgrims from across the sector.",
      },
      {
        milestone: 75,
        ratio: 0.75,
        text: "Cultural warning: the {rival} has reached 67,500 culture (75% to Cultural Hegemony); border worlds across the galaxy are adopting their customs.",
      },
      {
        milestone: 90,
        ratio: 0.9,
        text: "Final cultural alert: the {rival} stands at 81,000 culture (90% to Cultural Hegemony) and will soon eclipse every rival civilization.",
      },
    ],
    counterPlay: {
      id: "cultural-embargo",
      name: "Counter-Cultural Embargo",
      victoryKind: "culture",
      triggerRatio: 0.75,
      cooldownTurns: 15,
      maxSimultaneousWars: 0,
      maxParticipants: 2,
      bcCostPerParticipant: 400,
      rules: {
        // Cuts 8% of leader's culture (capped at 6,000) per participant (up to 2 participants = max 12,000 culture cut) and -15% culture output for 10 turns.
        effectSummary: "Up to 2 non-allied rivals spend 400 BC each to cut 8% of the leader's culture (cap 6,000 per rival) and impose -15% culture output for 10 turns. Causes 0 war declarations.",
        leaderProgressPenalty: 0.08,
        leaderRelationsDelta: -18,
      },
      aiRule: "leader.culture >= CULTURE_VICTORY * 0.75 && !hasTreaty(me, leader, 'alliance') && treasury >= 600 && activeWars < 2",
      announceText: "Alarmed by the cultural dominance of the {rival}, rival powers enact a galaxy-wide Counter-Cultural Embargo!",
    },
  },

  // =========================================================================
  // 2. COUNCIL VICTORY (VOTE_SHARE_TO_WIN = 60% of total votes in victory.ts)
  // =========================================================================
  {
    kind: "council",
    progressFormula: "votesOf(state, empire) / (totalAliveVotes * VOTE_SHARE_TO_WIN)",
    warnings: [
      {
        milestone: 50,
        ratio: 0.5,
        text: "Council bloc alert: the {rival} now holds 30% of all galactic votes, halfway to the three-fifths majority needed to claim supreme leadership.",
      },
      {
        milestone: 75,
        ratio: 0.75,
        text: "Council warning: the {rival} commands 45% of all Galactic Council votes (75% of the winning threshold); a single coalition could elect them.",
      },
      {
        milestone: 90,
        ratio: 0.9,
        text: "Final council alert: the {rival} controls 54% of all galactic votes (90% of the three-fifths threshold) ahead of the upcoming session.",
      },
    ],
    counterPlay: {
      id: "council-filibuster",
      name: "Minority Filibuster Bloc",
      victoryKind: "council",
      triggerRatio: 0.75,
      cooldownTurns: 20,
      maxSimultaneousWars: 0,
      maxParticipants: 2,
      bcCostPerParticipant: 500,
      rules: {
        // Up to 2 non-allied rivals spend 500 BC each; each reduces the leader's effective council vote weight by 6% of total votes (up to -12% combined) and pledges votes to the runner-up.
        effectSummary: "Within 10 turns of a session, up to 2 rivals spend 500 BC each to reduce the leader's effective council vote share by 6% per blocker (max 12%) and lock bloc votes for the runner-up. Causes 0 war declarations.",
        leaderProgressPenalty: 0.06,
        leaderRelationsDelta: -15,
      },
      aiRule: "leaderVoteShare >= VOTE_SHARE_TO_WIN * 0.75 && council.nextTurn - turn <= 10 && !hasTreaty(me, leader, 'alliance') && treasury >= 700",
      announceText: "Minority delegations unite in a Constitutional Filibuster to block the {rival} from sweeping the Galactic Council!",
    },
  },

  // =========================================================================
  // 3. TECHNOLOGY VICTORY (All 6 fields Tier 10 + w-ascension 90,000 prod)
  // =========================================================================
  {
    kind: "technology",
    progressFormula: "(techVictoryProgress(empire) / 6) * 0.5 + (ascensionBuildProgress / 90000) * 0.5",
    warnings: [
      {
        milestone: 50,
        ratio: 0.5,
        text: "Subspace breakthrough: the {rival} has mastered all six fields of science (50% to Ascension) and begun drafting blueprints for the Ascension Gate.",
      },
      {
        milestone: 75,
        ratio: 0.75,
        text: "Ascension warning: gravity waves ripple outward as the {rival}'s Ascension Gate reaches 50% construction (75% to victory).",
      },
      {
        milestone: 90,
        ratio: 0.9,
        text: "Final Ascension alert: the {rival}'s Ascension Gate is 80% complete (90% to victory); once energized, their empire will transcend known space.",
      },
    ],
    counterPlay: {
      id: "ascension-sabotage",
      name: "Gate Anchor Sabotage",
      victoryKind: "technology",
      triggerRatio: 0.75,
      cooldownTurns: 12,
      maxSimultaneousWars: 2,
      maxParticipants: 2,
      bcCostPerParticipant: 550,
      rules: {
        // Up to 2 rivals spend 550 BC each to destroy 10,000 production on w-ascension (up to 20,000 total); at most 2 empires with activeWars < 2 may declare containment war.
        effectSummary: "Up to 2 rivals spend 550 BC each to destroy 10,000 production on the leader's Ascension Gate (max 20,000). At most 2 rivals with fewer than 2 active wars may declare containment war.",
        leaderProgressPenalty: 10000,
        leaderRelationsDelta: -25,
      },
      aiRule: "leaderAscensionProgress >= 45000 && !hasTreaty(me, leader, 'alliance') && treasury >= 750 && activeWars < 2",
      announceText: "Strike teams and containment fleets mobilize to sabotage the Ascension Gate of the {rival}!",
    },
  },

  // =========================================================================
  // 4. CONQUEST VICTORY (Eliminate all rivals / 100% galaxy population)
  // =========================================================================
  {
    kind: "conquest",
    progressFormula: "Math.max(1 - aliveRivals / Math.max(1, initialEmpires - 1), leaderPop / totalGalaxyPop)",
    warnings: [
      {
        milestone: 50,
        ratio: 0.5,
        text: "Hegemony alert: the {rival} controls half of all settled worlds and population (50% to Conquest), dominating the central hyperlanes.",
      },
      {
        milestone: 75,
        ratio: 0.75,
        text: "Conquest warning: three-quarters of the galaxy has fallen under the banner of the {rival} (75% to Conquest); only a few free powers remain.",
      },
      {
        milestone: 90,
        ratio: 0.9,
        text: "Final conquest alert: the {rival} holds 90% of galactic strength; if the last independent capitals fall, total conquest is assured.",
      },
    ],
    counterPlay: {
      id: "conquest-coalition",
      name: "Mutual Defense Compact",
      victoryKind: "conquest",
      triggerRatio: 0.75,
      cooldownTurns: 15,
      maxSimultaneousWars: 2,
      maxParticipants: 2,
      bcCostPerParticipant: 450,
      rules: {
        // Up to 2 strongest surviving rivals with activeWars < 2 sign an automatic NAP + trade + research pact (+25 relations), gain +1 ship attack and +8% production for 15 turns, and at most 2 empires declare war on the conqueror.
        effectSummary: "Up to 2 strongest surviving rivals (each with < 2 active wars) spend 450 BC to sign an automatic NAP/trade/research pact (+25 relations), gain +1 ship attack and +8% production for 15 turns, and declare a capped 2-empire containment war.",
        leaderProgressPenalty: 0,
        leaderRelationsDelta: -25,
        coalitionBonus: { attack: 1, productionPct: 0.08, durationTurns: 15 },
      },
      aiRule: "leaderConquestProgress >= 0.75 && activeWars < 2 && treasury >= 600",
      announceText: "Surviving free powers ratify an emergency Mutual Defense Compact to halt the conquests of the {rival}!",
    },
  },
];