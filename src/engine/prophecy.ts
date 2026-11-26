// Prophecies: cryptic but true warnings. Texts by Gemini (data/prophecies.ts); rules by Claude.
//
// Fates are decided by the seeded RNG some turns ahead and then always happen; a seer may foretell them.
// Mystic and telepath races (Velari, Lumen) hear clear prophecies that name the world; everyone else hears
// riddles with a star colour, a direction from their capital and a number of turns.
// Fates in play now:
//   plague     - a colony will be struck; a colony spending 30%+ on ecology when it hits (quarantine) loses far less.
//   goldenAge  - foretold when a golden age is near; it then arrives no later than foretold.
//   invasion   - an enemy fleet (warships or troops) is on its way to one of our worlds, unseen.
// (Supernova, elder awakening and betrayal texts wait for those systems.)

import { PROPHECIES, type ProphecyDef, type ProphecyThreat } from "./data/prophecies";
import { GOLDEN_AGE_AT } from "./data/buildings";
import { colonyEffects, empireBonus } from "./civ";
import { canSee } from "./knowledge";
import { turnsToArrive } from "./movement";
import * as R from "./rng";
import type { Empire, GameState, Id } from "./types";

/** Races whose seers speak plainly. */
export const SEER_RACES = new Set(["velari", "lumen"]);
/** Chance per turn that an empire's fate holds a plague (from turn 40). */
export const PLAGUE_CHANCE = 1 / 150;
export const PLAGUE_LOSS = 0.25;
export const PLAGUE_LOSS_QUARANTINED = 0.08;

export interface Fate {
  empireId: Id;
  kind: ProphecyThreat;
  due: number;
  starId: Id;
  rivalId: Id | null;
  prophecyId: string;
  /** Fleet whose arrival this foretells (invasions). */
  fleetId?: Id;
  /** Golden ages: which one (index into GOLDEN_AGE_AT) was foretold. */
  goldenAge?: number;
}

function direction(state: GameState, e: Empire, starId: Id): string {
  const home = state.stars[e.capitalStarId]!, s = state.stars[starId]!;
  const dx = s.x - home.x, dy = s.y - home.y;
  if (Math.hypot(dx, dy) < 1) return "heart of our realm";
  const a = (Math.atan2(-dy, dx) * 180) / Math.PI; // y grows downward on the map
  const names = ["east", "north-east", "north", "north-west", "west", "south-west", "south", "south-east"];
  return names[Math.round(((a + 360) % 360) / 45) % 8]!;
}

function fillText(state: GameState, e: Empire, f: Fate, text: string): string {
  const s = state.stars[f.starId]!;
  return text
    .replace(/\{starColor\}/g, s.color)
    .replace(/\{direction\}/g, direction(state, e, f.starId))
    .replace(/\{turns\}/g, String(Math.max(1, f.due - state.turn)))
    .replace(/\{star\}/g, s.name)
    .replace(/\{rival\}/g, f.rivalId !== null ? state.empires[f.rivalId]!.name : "a hidden foe");
}

/** Tell an empire its fate (seers clearly, others in riddles) and remember it. */
function foretell(state: GameState, e: Empire, f: Fate): void {
  const def = PROPHECIES.find((p) => p.id === f.prophecyId)!;
  const clear = SEER_RACES.has(e.raceId);
  const text = fillText(state, e, f, clear ? def.clearText : def.text);
  (state.fates ??= []).push(f);
  e.prophecies = [...(e.prophecies ?? []), { turn: state.turn, kind: f.kind, text, due: f.due, starId: clear ? f.starId : null, outcome: "waiting" as const }].slice(-20);
  state.events.push({ turn: state.turn, empireId: e.id, kind: "info", text: `🔮 Prophecy: ${text}` });
}

function pickProphecy(state: GameState, kind: ProphecyThreat): ProphecyDef {
  return R.pick(state.rng, PROPHECIES.filter((p) => p.threat === kind));
}

function settle(state: GameState, e: Empire, f: Fate, outcome: "fulfilled" | "averted", text: string): void {
  const log = e.prophecies?.find((p) => p.due === f.due && p.kind === f.kind && p.outcome === "waiting");
  if (log) log.outcome = outcome;
  state.events.push({ turn: state.turn, empireId: e.id, kind: "info", text: `🔮 ${text}`, starId: f.starId });
}

function cultureRate(state: GameState, e: Empire): number {
  let c = 0;
  for (const col of Object.values(state.colonies)) if (col.empireId === e.id) c += colonyEffects(col).culture + col.population * 0.005;
  return c * (1 + empireBonus(e).culture);
}

/** Once a turn: new fates and prophecies, and fates that come due. */
export function processProphecies(state: GameState): void {
  const fates = (state.fates ??= []);
  // Fates that come due.
  for (const f of [...fates].filter((x) => x.due <= state.turn)) {
    state.fates = state.fates!.filter((x) => x !== f);
    const e = state.empires[f.empireId]!;
    if (!e.alive) continue;
    const def = PROPHECIES.find((p) => p.id === f.prophecyId)!;
    const c = state.colonies[f.starId];
    if (f.kind === "plague") {
      if (!c || c.empireId !== e.id) { settle(state, e, f, "averted", "The foretold plague found an empty world."); continue; }
      const quarantined = c.sliders.ecology >= 30;
      c.population = Math.max(1, c.population * (1 - (quarantined ? PLAGUE_LOSS_QUARANTINED : PLAGUE_LOSS)));
      settle(state, e, f, "fulfilled", fillText(state, e, f, def.fulfilled) + (quarantined ? " Quarantine held most of it back." : ""));
    } else if (f.kind === "goldenAge") {
      // It arrives no later than foretold: only the foretold golden age, and only if it hasn't come already.
      const next = GOLDEN_AGE_AT[e.goldenAges];
      if (f.goldenAge === e.goldenAges && next !== undefined && e.culture < next) e.culture = next;
      settle(state, e, f, "fulfilled", fillText(state, e, f, def.fulfilled));
    } else if (f.kind === "invasion") {
      const fleet = state.fleets.find((x) => x.id === f.fleetId);
      const arrived = fleet && fleet.starId === f.starId;
      if (arrived || (c && c.empireId !== e.id)) settle(state, e, f, "fulfilled", fillText(state, e, f, def.fulfilled));
      else settle(state, e, f, "averted", "The foretold attack never came: the fleet turned aside.");
    }
  }
  if (state.turn < 40) return;
  for (const e of state.empires) {
    if (!e.alive) continue;
    const mine = (k: ProphecyThreat) => state.fates!.some((f) => f.empireId === e.id && f.kind === k);
    const seer = SEER_RACES.has(e.raceId);
    // Plague: rare, a few turns of warning.
    if (!mine("plague") && R.chance(state.rng, PLAGUE_CHANCE)) {
      const cols = Object.values(state.colonies).filter((c) => c.empireId === e.id && c.population >= 8).sort((a, b) => a.starId - b.starId);
      if (cols.length) {
        const c = R.pick(state.rng, cols);
        const f: Fate = { empireId: e.id, kind: "plague", due: state.turn + R.int(state.rng, 6, 12), starId: c.starId, rivalId: null, prophecyId: pickProphecy(state, "plague").id };
        // Not every plague is foretold; seers always see it.
        if (seer || R.chance(state.rng, 0.7)) foretell(state, e, f);
        else state.fates!.push(f);
      }
    }
    // Golden age: foretold 6-15 turns ahead when the culture curve says so.
    const next = GOLDEN_AGE_AT[e.goldenAges];
    const rate = cultureRate(state, e);
    if (next !== undefined && !e.goldenAge && !mine("goldenAge") && rate > 0) {
      const turns = Math.ceil((next - e.culture) / rate);
      if (turns >= 6 && turns <= 15 && (seer || R.chance(state.rng, 0.15))) {
        foretell(state, e, { empireId: e.id, kind: "goldenAge", due: state.turn + turns, starId: e.capitalStarId, rivalId: null, prophecyId: pickProphecy(state, "goldenAge").id, goldenAge: e.goldenAges });
      }
    }
    // Invasion: an unseen enemy fleet heading for one of our worlds, 3+ turns out.
    if (!mine("invasion") && (seer ? R.chance(state.rng, 0.5) : R.chance(state.rng, 0.15))) {
      for (const fl of [...state.fleets].sort((a, b) => a.id - b.id)) {
        if (fl.destStarId === null || fl.empireId === e.id || e.atWar[fl.empireId] === undefined) continue;
        const target = state.colonies[fl.destStarId];
        if (!target || target.empireId !== e.id || canSee(state, e, fl.x, fl.y)) continue;
        const s = state.stars[fl.destStarId]!;
        const turns = turnsToArrive(state.empires[fl.empireId]!, fl, s);
        if (turns < 3) continue;
        foretell(state, e, { empireId: e.id, kind: "invasion", due: state.turn + turns, starId: s.id, rivalId: fl.empireId, prophecyId: pickProphecy(state, "invasion").id, fleetId: fl.id });
        break;
      }
    }
  }
}
