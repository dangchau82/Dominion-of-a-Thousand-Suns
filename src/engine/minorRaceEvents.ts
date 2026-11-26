// Envoy events for the minor races (Gemini's data/minorRaces.ts). Kept apart from
// minorRaces.ts so events.ts can list them without an import cycle.

import { MINOR_RACES, type MinorRaceDef } from "./data/minorRaces";
import type { EventEffect, GameEventDef } from "./data/events";

export const ENVOY_PREFIX = "minor-envoy:";

/** What it costs to offer each people the thing they like most. */
export const LIKED_OFFER: Record<MinorRaceDef["likes"], { label: string; effects: EventEffect[] }> = {
  gifts: { label: "Send a generous gift (150 BC)", effects: [{ kind: "money", amount: -150 }] },
  trade: { label: "Open a trade lane to their worlds (60 BC to set up)", effects: [{ kind: "money", amount: -60 }, { kind: "relations", amount: 2 }] },
  protection: { label: "Station a patrol near their worlds (costs factories)", effects: [{ kind: "factories", amount: -3 }] },
  technology: { label: "Lend them our scientists (costs research)", effects: [{ kind: "research", field: "computers", amount: -150 }] },
  culture: { label: "Send our artists and teachers (costs culture)", effects: [{ kind: "culture", amount: -80 }] },
};

export const ENVOY_EVENTS: GameEventDef[] = MINOR_RACES.map((m) => ({
  id: ENVOY_PREFIX + m.id,
  title: `Envoys of ${m.name}`,
  art: "contact",
  trigger: "turn",
  text: `Envoys of ${m.name} arrive: "${m.greeting}" ${m.description}`,
  choices: [
    { label: LIKED_OFFER[m.likes].label, result: "The envoys leave clearly pleased.", effects: LIKED_OFFER[m.likes].effects },
    { label: "A modest gift (60 BC)", result: "The envoys accept politely.", effects: [{ kind: "money", amount: -60 }] },
    { label: "Send them away", result: "The envoys leave without a word.", effects: [{ kind: "nothing" }] },
  ],
}));
