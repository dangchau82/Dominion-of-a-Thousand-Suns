// Galactic Firsts: the first empire to reach a milestone is celebrated across the galaxy and gains culture.
// A race of firsts gives peaceful players goals all game long (the space race, the legacy milestones of the newer
// civilization games). Each first can be won once per game. Deterministic: checked once a turn in empire order.
// (From the ideas review; main Claude, 2026-11-26.)

import { CLIMATES } from "./data/planets";
import { fieldTier } from "./tech";
import { FIELDS, type Empire, type GameState, type Id } from "./types";

export interface FirstDef {
  id: string;
  name: string;
  /** Shown in the announcement: "The X were the first to ...". */
  deed: string;
  culture: number;
  reached(state: GameState, e: Empire): boolean;
}

const coloniesOf = (state: GameState, e: Empire) => Object.values(state.colonies).filter((c) => c.empireId === e.id);

export const FIRSTS: readonly FirstDef[] = [
  { id: "ten-worlds", name: "Ten Worlds", deed: "settle ten worlds", culture: 1200, reached: (s, e) => coloniesOf(s, e).length >= 10 },
  { id: "hostile-world", name: "Life Against the Odds", deed: "found a colony on a truly hostile world", culture: 1000,
    reached: (s, e) => coloniesOf(s, e).some((c) => { const p = s.stars[c.starId]!.planet; return !!p && CLIMATES[p.climate].hostility >= 8; }) },
  { id: "all-met", name: "Every Voice Heard", deed: "meet every other people in the galaxy", culture: 1200,
    reached: (s, e) => s.empires.every((o) => o.id === e.id || !o.alive || e.contacts.includes(o.id)) && s.empires.filter((o) => o.alive).length > 2 },
  { id: "tier-five", name: "The Great Leap", deed: "master the fifth tier of any science", culture: 1000,
    reached: (_s, e) => FIELDS.some((f) => fieldTier(e.research, f) >= 5) },
  { id: "golden-age", name: "The First Golden Age", deed: "enter a golden age", culture: 800, reached: (_s, e) => e.goldenAges >= 1 },
  { id: "first-wonder", name: "A Wonder of the Galaxy", deed: "complete a wonder", culture: 1000, reached: (_s, e) => e.wonders.length >= 1 },
  { id: "billion-souls", name: "A Thousand Million", deed: "count a thousand population", culture: 1500,
    reached: (s, e) => coloniesOf(s, e).reduce((a, c) => a + c.population, 0) >= 1000 },
  { id: "tier-ten", name: "Beyond the Horizon", deed: "master the tenth tier of any science", culture: 2000,
    reached: (_s, e) => FIELDS.some((f) => fieldTier(e.research, f) >= 10) },
  { id: "many-peoples", name: "Empire of Many Peoples", deed: "rule worlds of three different peoples", culture: 1200,
    reached: (s, e) => new Set(coloniesOf(s, e).map((c) => c.peopleRaceId ?? e.raceId)).size >= 3 },
];

export const FIRST_BY_ID: ReadonlyMap<string, FirstDef> = new Map(FIRSTS.map((f) => [f.id, f]));

/** Once a turn: award any first that someone has now reached. Ties go to the empire with the lower id (deterministic). */
export function processFirsts(state: GameState): void {
  const won = (state.firsts ??= {});
  for (const f of FIRSTS) {
    if (won[f.id]) continue;
    const e = state.empires.find((x) => x.alive && f.reached(state, x));
    if (!e) continue;
    won[f.id] = { empireId: e.id, turn: state.turn };
    e.culture += f.culture;
    state.events.push({ turn: state.turn, empireId: null, kind: "culture", text: `Galactic first, "${f.name}": the ${e.name} were the first to ${f.deed}. (+${f.culture} culture)` });
  }
}

/** Firsts won so far, in the order they happened. */
export function firstsWon(state: GameState): { id: string; name: string; deed: string; empireId: Id; turn: number }[] {
  return Object.entries(state.firsts ?? {})
    .map(([id, w]) => ({ id, name: FIRST_BY_ID.get(id)?.name ?? id, deed: FIRST_BY_ID.get(id)?.deed ?? "", ...w }))
    .sort((a, b) => a.turn - b.turn || a.id.localeCompare(b.id));
}
