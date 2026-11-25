// Picks what an alien leader says. Lines live in data/dialogue.ts.

import { DIALOGUE, type DialogueSituation } from "./data/dialogue";
import type { Empire } from "./types";

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
