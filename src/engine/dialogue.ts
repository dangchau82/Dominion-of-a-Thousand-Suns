// Picks what an alien leader says. Lines live in data/dialogue.ts.

import { DIALOGUE, type DialogueSituation } from "./data/dialogue";
import type { Empire } from "./types";
import { NEW_DIALOGUE, type NewMoment } from "./data/dialogue2";

export function say(turn: number, speaker: Empire, situation: DialogueSituation, listener: Empire, extra: { star?: string; tech?: string } = {}): string {
  const lines = DIALOGUE[speaker.raceId]?.[situation];
  if (!lines || lines.length === 0) return "";
  const line = lines[(turn + speaker.id * 3 + listener.id) % lines.length]!;
  const text = line
    .replace(/\{empire\}/g, listener.name)
    .replace(/\{leader\}/g, speaker.name)
    .replace(/\{star\}/g, extra.star ?? "our space")
    .replace(/\{tech\}/g, extra.tech ?? "your secrets");
  return `${speaker.name}: “${text}”`;
}

/**
 * Lines for six newer moments (battles, betrayal, council wins, prophecies, pleading),
 * from Gemini's data/dialogue2.ts. Same picking rule as `say`: no random draws.
 */
export function sayMoment(turn: number, speaker: Empire, moment: NewMoment, listener: Empire, extra: { star?: string } = {}): string {
  const lines = NEW_DIALOGUE[speaker.raceId]?.[moment];
  if (!lines || lines.length === 0) return "";
  const line = lines[(turn + speaker.id * 3 + listener.id) % lines.length]!;
  const text = line
    .replace(/\{empire\}/g, listener.name)
    .replace(/\{leader\}/g, speaker.name)
    .replace(/\{star\}/g, extra.star ?? "our space");
  return `${speaker.name}: “${text}”`;
}

