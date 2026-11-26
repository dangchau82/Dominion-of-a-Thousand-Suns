// Galactic Council resolutions, voted between elections. Written by Gemini (2026-11-25), checked by Claude; rules built by Claude.
import type { EmpireBonus } from "./buildings";

export interface ResolutionDef {
  id: string;
  name: string;                 // e.g. "The Open Lanes Act"
  description: string;          // what it does, plain words, under 35 words
  /** "oneEmpire": aimed at one empire (the most aggressive, the leader, ...). "everyone": affects all. */
  target: "oneEmpire" | "everyone";
  /** Who the council aims it at, if target is "oneEmpire". */
  aimedAt?: "aggressor" | "leader" | "spymaster" | "hoarder";
  bonus: EmpireBonus;           // applied to the target (or to everyone) while it lasts
  /** Extra rule, if any. */
  rule?: "noNewWars" | "noTrade" | "noSpies" | "openBorders" | "none";
  duration: number;             // 10 to 25 turns
  proposalText: string;         // the council's words when proposing, under 30 words, may use {rival}
  passedText: string;           // under 25 words
  failedText: string;           // under 25 words
}

export const RESOLUTIONS: ResolutionDef[] = [
  {
    id: "sanction-warmonger-embargo",
    name: "The Belligerence Embargo",
    description: "Freezes Galactic Council trade routes with the worst aggressor and reduces their diplomatic standing across known space.",
    target: "oneEmpire",
    aimedAt: "aggressor",
    bonus: { relations: -6, trade: -0.05 },
    rule: "noTrade",
    duration: 15,
    proposalText: "Member worlds propose severing all commercial charters with the {rival} until their fleets stand down.",
    passedText: "Council marshals seal the trade lanes against the aggressor.",
    failedText: "Merchant lobbies block the embargo, keeping border markets open.",
  },
  {
    id: "condemn-war-crimes",
    name: "Censure of the Iron Fist",
    description: "Formally condemns the galaxy's primary aggressor, straining their foreign relations and disrupting war-industry logistics.",
    target: "oneEmpire",
    aimedAt: "aggressor",
    bonus: { production: -0.06, relations: -10, culture: -0.1 },
    rule: "none",
    duration: 20,
    proposalText: "Envoys demand an official censure condemning the {rival} for relentless frontier aggression.",
    passedText: "The chamber votes to censure the aggressor, tarnishing their name across the stars.",
    failedText: "Fear of retaliation persuades wavering delegates to table the censure.",
  },
  {
    id: "contain-runaway-hegemon",
    name: "The Parity Containment Act",
    description: "Imposes technology-sharing tariffs and diplomatic friction on the leading empire to slow its march toward dominance.",
    target: "oneEmpire",
    aimedAt: "leader",
    bonus: { research: -0.07, relations: -8, culture: -0.15 }, // Claude: culture -8% -> -15% (the runaway leader usually wins by culture)
    rule: "none",
    duration: 20,
    proposalText: "Smaller delegations unite to curb the growing hegemony of the {rival} before balance is lost.",
    passedText: "Containment tariffs take effect, slowing the frontrunner's momentum.",
    failedText: "Allies of the leading power rally enough votes to defeat containment.",
  },
  {
    id: "frontier-inspection-mandate",
    name: "The Frontier Inspection Mandate",
    description: "Requires the leading empire to open its borders to neutral observers, curbing fleet coordination and covert operations.",
    target: "oneEmpire",
    aimedAt: "leader",
    bonus: { attack: -1, spying: -1 },
    rule: "openBorders",
    duration: 15,
    proposalText: "The assembly moves to station neutral inspectors along the borders of the {rival}.",
    passedText: "Observer beacons deploy along the leader's frontier without incident.",
    failedText: "Sovereignty objections sink the inspection mandate on the council floor.",
  },
  {
    id: "shadow-network-crackdown",
    name: "The Counter-Cipher Accord",
    description: "Exposes covert relays operated by the galaxy's most active spymaster, crippling their espionage reach and standing.",
    target: "oneEmpire",
    aimedAt: "spymaster",
    bonus: { research: -0.04, spying: -1, relations: -10 },
    rule: "none",
    duration: 18,
    proposalText: "Intelligence ministers present intercepted ciphers implicating the {rival} in widespread espionage.",
    passedText: "Joint counter-intelligence sweeps dismantle the spymaster's shadow networks.",
    failedText: "Lacking hard proof, the council declines to penalize the accused spymaster.",
  },
  {
    id: "bullion-windfall-levy",
    name: "The Treasury Hoard Levy",
    description: "Taxes idle interstellar reserves held by the wealthiest treasury, redirecting trade margins toward smaller council members.",
    target: "oneEmpire",
    aimedAt: "hoarder",
    bonus: { production: -0.05, relations: -5, trade: -0.15 },
    rule: "none",
    duration: 15,
    proposalText: "Delegates call upon the {rival} to release hoarded bullion stifling interstellar liquidity.",
    passedText: "Clearinghouse surcharges trim the hoarder's surplus margins.",
    failedText: "Financial envoys defeat the levy, protecting sovereign vaults.",
  },
  {
    id: "galactic-peace-jubilee",
    name: "The Armistice of the Lantern",
    description: "Prohibits declaring any new wars across the galaxy while fostering modest goodwill among all council members.",
    target: "everyone",
    bonus: { relations: 6 }, // Claude: culture +5% removed (galaxy-wide culture boosts sped up culture wins)
    rule: "noNewWars",
    duration: 12,
    proposalText: "Peacekeepers propose a sacred truce forbidding new declarations of war across the sector.",
    passedText: "The Lantern Armistice passes; no member may declare war while it endures.",
    failedText: "Warhawks block the truce, leaving rival fleets free to strike.",
  },
  {
    id: "pan-galactic-science-year",
    name: "The Shared Symposium Charter",
    description: "Opens academic relays across all member worlds, boosting research output everywhere.",
    target: "everyone",
    bonus: { research: 0.08, relations: 5 }, // Claude: culture +10% removed
    rule: "none",
    duration: 20,
    proposalText: "Scholars petition the council to link civilian laboratories for an era of shared discovery.",
    passedText: "Subspace lecture halls open across known space, accelerating research everywhere.",
    failedText: "Secrecy concerns derail the symposium before data links can open.",
  },
  {
    id: "open-starlanes-treaty",
    name: "The Open Starlanes Convention",
    description: "Opens all borders to peaceful transit, expanding trade revenue and extending effective fleet logistics range.",
    target: "everyone",
    bonus: { range: 1, trade: 0.15 },
    rule: "openBorders",
    duration: 20,
    proposalText: "Navigator guilds urge the council to abolish border tolls and open every starlane.",
    passedText: "Navigation beacons flash green across every frontier as borders open.",
    failedText: "Border commanders convince delegates to keep customs cordons closed.",
  },
  {
    id: "covert-disarmament-pact",
    name: "The Glass Cloak Treaty",
    description: "Bans all active espionage missions galaxy-wide and lowers spying effectiveness while building mutual trust.",
    target: "everyone",
    bonus: { spying: -1, relations: 8 },
    rule: "noSpies",
    duration: 15,
    proposalText: "Moderates propose recalling all covert operatives to end the shadow war.",
    passedText: "Covert agencies stand down across the galaxy under council oversight.",
    failedText: "No empire trusts its rivals enough to disarm its intelligence service.",
  },
  {
    id: "anti-piracy-war-tax",
    name: "The Sector Defense Tithe",
    description: "Diverts industrial output into joint patrol armaments, sharpening fleet attack power at the cost of factory efficiency.",
    target: "everyone",
    bonus: { production: -0.06, attack: 1, trade: -0.08 },
    rule: "none",
    duration: 15,
    proposalText: "Admirals request a galaxy-wide defense tithe to standardize gunnery and patrol readiness.",
    passedText: "Shipyards retool for standardized ordnance as the defense tithe takes hold.",
    failedText: "Colony governors reject the military surcharge as an unnecessary burden.",
  },
  {
    id: "colonial-seed-grant",
    name: "The Homesteaders' Compact",
    description: "Funds frontier medical and agricultural exchanges, boosting population growth across all colonies.",
    target: "everyone",
    bonus: { production: -0.03, growth: 0.15 }, // Claude: culture +12% removed
    rule: "none",
    duration: 25,
    proposalText: "Frontier representatives propose pooling biosphere grants to help young colonies flourish.",
    passedText: "Seed-ships and medical teams fan out across the galaxy under council charter.",
    failedText: "Core-world delegates vote down the frontier subsidy.",
  },
];