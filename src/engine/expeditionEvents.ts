// Expedition events, built from Gemini's data/expeditions.ts. Each choice shows its odds;
// the outcome is applied by expeditions.ts once the choice is made. Kept apart from
// expeditions.ts so events.ts can list them without an import cycle.

import { EXPEDITIONS } from "./data/expeditions";
import type { GameEventDef } from "./data/events";

export const EXPEDITION_PREFIX = "expedition:";

export const EXPEDITION_EVENTS: GameEventDef[] = EXPEDITIONS.map((x) => ({
  id: EXPEDITION_PREFIX + x.id,
  title: `Expedition: ${x.title}`,
  art: x.art,
  trigger: "turn",
  text: x.text,
  choices: x.choices.map((c) => ({
    label: `${c.label} (about ${Math.round(c.chance * 100)}% chance it works)`,
    result: "The away team sets out. We'll hear how it went.",
    effects: [{ kind: "nothing" }],
  })),
}));
