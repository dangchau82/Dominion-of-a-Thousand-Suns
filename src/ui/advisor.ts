// The advisor: short tips that appear once, when they become useful.
// Players can switch them off in the game menu.

import type { EmpireView } from "../engine/view";

const SEEN = "dots.tips.seen";
const OFF = "dots.tips.off";

export interface Tip { id: string; when: (v: EmpireView) => boolean; text: string }

const idle = (v: EmpireView, kind: string) => v.fleets.some((f) => f.starId !== null && f.destStarId === null
  && Object.entries(f.ships).some(([id, n]) => n > 0 && (id === kind || (kind === "colony" && v.designs.find((d) => d.id === id)?.role === "colony"))));

export const TIPS: Tip[] = [
  { id: "start", when: (v) => v.turn <= 2, text: "Welcome, ruler! Tap your home star to open its colony. The sliders split its production between ships, defense, industry, ecology and research." },
  { id: "scouts", when: (v) => v.turn <= 6 && idle(v, "scout"), text: "Your scouts are waiting. Tap the ship icon beside your home star, press Send 1 Scout, then tap an unexplored star." },
  { id: "colony-ship", when: (v) => idle(v, "colony") && v.stars.some((s) => v.canSettle(s.id)), text: "You have a colony ship and a world it can settle. Stars you can settle get a green ring while moving it." },
  { id: "research", when: (v) => v.turn >= 4, text: "Open Research (top right) to see what you're studying. Push one field's slider up to get its tech much sooner." },
  { id: "contact", when: (v) => v.contacts.length > 0, text: "You've met another empire! Tap 🤝 Diplomacy at the top, then Talk, to trade, sign treaties, swap techs or send spies." },
  { id: "factories", when: (v) => v.colonies.some((c) => c.isCapital && c.factories >= c.maxFactories - 0.5), text: "Your capital's factories are full. Move its Industry slider to Research, Ship or a building." },
  { id: "buildings", when: (v) => v.colonies.some((c) => v.buildable(c.starId).length > 1), text: "Colonies can construct buildings (Start building… in the colony panel). Wonders (★) are one per galaxy, so race for them." },
  { id: "warships", when: (v) => v.turn >= 35, text: "Rivals will arm. Use Fleets → 🛠️ Ship designs to make warships, and set a shipyard to build them." },
  { id: "war", when: (v) => v.contacts.some((c) => c.warSince !== null), text: "You're at war. Missile bases (the Defense slider) protect planets. To take a planet, defeat its defenses, then tap it and choose Invade…" },
  { id: "leader", when: (v) => v.me.leaderOffer !== null, text: "A leader offers to serve you. Tap 🏛️ Empire at the top to hire them." },
  { id: "council", when: (v) => v.turn >= 135, text: "The Galactic Council meets from turn 150. Tap ⚖️ Council at the top to see who has the most votes." },
  { id: "autopilot", when: (v) => v.turn >= 20, text: "Busy? ☰ → Autopilot lets the AI run your empire for a few turns. It stops for new races, wars, council votes and the end of the game." },
];

export function tipsOff(): boolean {
  try { return localStorage.getItem(OFF) === "1"; } catch { return false; }
}
export function setTipsOff(off: boolean): void {
  try { localStorage.setItem(OFF, off ? "1" : "0"); } catch { /* ignore */ }
}
function seen(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN) ?? "[]") as string[]); } catch { return new Set(); }
}
export function markSeen(id: string): void {
  const s = seen();
  s.add(id);
  try { localStorage.setItem(SEEN, JSON.stringify([...s])); } catch { /* ignore */ }
}

export function nextTip(v: EmpireView): Tip | null {
  if (tipsOff()) return null;
  const s = seen();
  return TIPS.find((t) => !s.has(t.id) && t.when(v)) ?? null;
}
