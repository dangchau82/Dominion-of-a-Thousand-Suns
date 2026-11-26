// Job-board offer events, built from Gemini's data/contracts.ts. Kept apart from
// contracts.ts so events.ts can list them without importing contracts.ts (which needs
// events.ts): no import cycle.

import { CONTRACTS, CONTRACT_TWISTS, type ContractDef } from "./data/contracts";
import type { EventEffect, GameEventDef } from "./data/events";

export const OFFER_PREFIX = "contract-offer:";

export function effectText(fx: EventEffect[]): string {
  return fx.map((f) => {
    switch (f.kind) {
      case "money": return `${f.amount > 0 ? "+" : ""}${f.amount} BC`;
      case "research": return `${f.amount > 0 ? "+" : ""}${f.amount} ${f.field} research`;
      case "culture": return `${f.amount > 0 ? "+" : ""}${f.amount} culture`;
      case "morale": return `morale ${f.amount > 0 ? "+" : ""}${f.amount}`;
      case "relations": return `relations ${f.amount > 0 ? "+" : ""}${f.amount}`;
      case "population": return `population ${f.amount > 0 ? "+" : ""}${f.amount}`;
      case "factories": return `factories ${f.amount > 0 ? "+" : ""}${f.amount}`;
      case "ships": return `${f.count} ${f.template} ship${f.count === 1 ? "" : "s"}`;
      case "revealStars": return `${f.count} stars charted`;
      default: return "";
    }
  }).filter(Boolean).join(", ");
}

export const NEEDS_TEXT: Record<ContractDef["needs"], string> = { scout: "any ship", warship: "an armed ship", transport: "a transport" };

/** One offer event per contract, so they show in the normal event screen. */
export const CONTRACT_OFFERS: GameEventDef[] = CONTRACTS.map((c) => ({
  id: OFFER_PREFIX + c.id,
  title: `Job board: ${c.name}`,
  art: c.kind === "bounty" || c.kind === "smuggling" ? "pirates" : "contact",
  trigger: "turn",
  text: `${c.poster} posts a job: ${c.description} Needs ${NEEDS_TEXT[c.needs]}; ${c.turns} turns; about ${Math.round(c.risk * 100)}% chance it goes wrong. Pay: ${effectText(c.reward)}. If it goes wrong: ${effectText(c.failure) || "nothing"}.`,
  choices: [
    { label: "Take the job", result: "Our crew signs on. We'll hear how it went when the job is done.", effects: [{ kind: "nothing" }] },
    { label: "Turn it down", result: "The poster shrugs and pins the job up for someone else.", effects: [{ kind: "nothing" }] },
  ],
}));
export const CONTRACT_EVENTS: GameEventDef[] = [...CONTRACT_OFFERS, ...CONTRACT_TWISTS];
