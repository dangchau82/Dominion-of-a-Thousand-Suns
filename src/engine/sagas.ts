// Race sagas in play (written by Claude 2; Danny's request 2026-11-27: story-driven race
// campaigns where choices fork the story and, past certain thresholds, change how the game
// ends; and a different story every new game). The writing is Gemini's (data/sagas*.ts);
// this file decides which beats play, when, and what the endings do.
//
// - Four acts. Each act has 3 beats per race; the seed picks one per act per empire.
// - Choices move three saga scores (mercy, openness, tradition) and set flags.
// - Branch beats play when their flags are set (and none of their blockers).
// - Crossover beats play once we have met the race they name.
// - After act 4, the first ending whose thresholds hold plays; its outcome changes the game.
// A race with saga writing plays its saga instead of its old 5-chapter storyline.
// No random draws: picks come from the seed, so a save replays exactly.

import { SAGA_BEATS, SAGA_ENDINGS, type SagaBeat, type SagaEnding, type SagaOutcome, type SagaScore } from "./data/sagas";
import type { GameEventDef } from "./data/events";
import { designsOf } from "./designs";
import { adjustRelation, relation } from "./diplomacy";
import { offerPeace } from "./combat";
import { distance } from "./formulas";
import { newColony } from "./game";
import { addUnrest } from "./unrest";
import { FIELDS, type Empire, type GameState, type Id, type PendingEvent } from "./types";

export interface SagaRun {
  /** The act beat picked for each act (index 0-3), from the seed. */
  picks: (string | null)[];
  /** Acts played so far (0-4). */
  acts: number;
  played: string[];
  scores: Record<SagaScore, number>;
  flags: string[];
  lastTurn: number;
  ending?: string;
  outcome?: SagaOutcome;
  /** Lasting effects of some endings. */
  votes?: number;
  culturePerTurn?: number;
}

/** Earliest turn for each act (plus up to ACT_JITTER turns from the seed). */
export const ACT_TURN = [25, 75, 140, 205] as const;
export const ACT_JITTER = 12;
/** Turns between two saga events for one empire. */
export const SAGA_GAP = 10;
/** The ending comes at least this long after act 4 began. */
export const ENDING_AFTER = 20;
export const SCORES: SagaScore[] = ["mercy", "openness", "tradition"];

// Ending outcome numbers (in scale with the game; tuned by the main Claude if needed).
export const OUTCOME = {
  goldenAgeTurns: 30,
  civilWarUnrest: 60,
  allyRelation: 60,
  fearChill: 12,
  fearResearch: 500,
  councilShare: 0.15,
  legendShips: 8,
  exodusColonies: 2,
  exodusPeople: 4,
  exodusCapitalLoss: 0.3,
  ascensionResearch: 500,
  graceLoss: 0.25,
  graceCulture: 6,
} as const;

// ---- Indexes (rebuilt if the data arrays change, e.g. in tests) ----
let indexed = -1;
let beatById = new Map<string, SagaBeat>();
let endingById = new Map<string, SagaEnding>();
let racesWithSagas = new Set<string>();
function index(): void {
  const n = SAGA_BEATS.length * 1000 + SAGA_ENDINGS.length;
  if (n === indexed) return;
  indexed = n;
  beatById = new Map(SAGA_BEATS.map((b) => [b.id, b]));
  endingById = new Map(SAGA_ENDINGS.map((e) => [e.id, e]));
  racesWithSagas = new Set(SAGA_BEATS.filter((b) => b.kind === "act").map((b) => b.raceId));
}

/** Does this race have saga writing (and so skip its old storyline)? */
export function hasSaga(raceId: string): boolean {
  index();
  return racesWithSagas.has(raceId);
}

/** The event definition behind a saga event id (events.ts asks when its own table has none). */
export function sagaEventDef(id: string): GameEventDef | undefined {
  index();
  const b = beatById.get(id);
  if (b) return { id: b.id, title: b.title, art: b.art, trigger: "turn", text: b.text, choices: b.choices };
  const e = endingById.get(id);
  if (e) return { id: e.id, title: e.title, art: e.art, trigger: "turn", text: e.text, choices: e.choices };
  return undefined;
}

const ROMAN = ["I", "II", "III", "IV"];
/** "The saga, act II" style label, or null. */
export function sagaLabel(id: string): string | null {
  index();
  const b = beatById.get(id);
  if (b) return b.kind === "crossover" ? "Your people's saga: paths cross" : `Your people's saga: act ${ROMAN[b.act - 1]}${b.kind === "branch" ? " (a turn in the tale)" : ""}`;
  return endingById.has(id) ? "Your people's saga: the ending" : null;
}

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}
function hash(...xs: number[]): number {
  let h = 2166136261;
  for (const x of xs) h = Math.imul(h ^ (x >>> 0), 16777619) >>> 0;
  return h;
}

function runOf(state: GameState, e: Empire): SagaRun {
  const all = (state.sagas ??= {});
  if (all[e.id]) return all[e.id]!;
  const seed = seedNumber(state);
  const picks = [1, 2, 3, 4].map((act) => {
    const options = SAGA_BEATS.filter((b) => b.raceId === e.raceId && b.kind === "act" && b.act === act).map((b) => b.id).sort();
    return options.length ? options[hash(seed, e.id, act) % options.length]! : null;
  });
  return (all[e.id] = { picks, acts: 0, played: [], scores: { mercy: 0, openness: 0, tradition: 0 }, flags: [], lastTurn: -Infinity });
}

const flagsOk = (run: SagaRun, b: { needs?: string[]; blockedBy?: string[] }) =>
  (b.needs ?? []).every((f) => run.flags.includes(f)) && !(b.blockedBy ?? []).some((f) => run.flags.includes(f));

function metRace(state: GameState, e: Empire, raceId: string): boolean {
  return e.contacts.some((id) => state.empires[id]?.alive && state.empires[id]!.raceId === raceId);
}

/** What this empire's saga should play next, if anything is due now. */
function nextBeat(state: GameState, e: Empire, run: SagaRun): string | null {
  const ready = (b: SagaBeat) => !run.played.includes(b.id) && b.act <= run.acts && flagsOk(run, b);
  const branch = SAGA_BEATS.find((b) => b.raceId === e.raceId && b.kind === "branch" && ready(b));
  if (branch) return branch.id;
  const cross = SAGA_BEATS.find((b) => b.kind === "crossover" && b.raceId === e.raceId && ready(b) && b.withRace && metRace(state, e, b.withRace));
  if (cross) return cross.id;
  if (run.acts < 4) {
    const at = ACT_TURN[run.acts]! + (hash(seedNumber(state), e.id, 99, run.acts) % ACT_JITTER);
    if (state.turn < at) return null;
    const id = run.picks[run.acts];
    if (!id) { run.acts++; return null; }
    return id;
  }
  if (run.ending) return null;
  if (state.turn < ACT_TURN[3] + ENDING_AFTER) return null;
  return endingFor(e, run)?.id ?? null;
}

/** The first ending whose thresholds hold (the last is the fallback). */
export function endingFor(e: Empire | { raceId: string }, run: SagaRun): SagaEnding | undefined {
  return SAGA_ENDINGS.filter((x) => x.raceId === e.raceId).find((x) =>
    SCORES.every((s) => {
      const t = x.needs?.[s];
      if (!t) return true;
      return (t.min === undefined || run.scores[s] >= t.min) && (t.max === undefined || run.scores[s] <= t.max);
    }) && (x.needsFlags ?? []).every((f) => run.flags.includes(f)));
}

/** The rival a beat is about: an enemy if at war, otherwise the contact we like least. */
function pickRival(state: GameState, e: Empire): Id | null {
  const enemies = Object.keys(e.atWar).map(Number).filter((id) => state.empires[id]?.alive).sort((a, b) => a - b);
  if (enemies.length) return enemies[0]!;
  const known = e.contacts.filter((id) => state.empires[id]?.alive).sort((a, b) => relation(e, state.empires[a]!) - relation(e, state.empires[b]!) || a - b);
  return known[0] ?? null;
}

/** Once a turn. */
export function processSagas(state: GameState): void {
  index();
  if (!racesWithSagas.size || state.turn < ACT_TURN[0]) return;
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined || !racesWithSagas.has(e.raceId)) continue;
    const run = runOf(state, e);
    if (run.culturePerTurn) e.culture += run.culturePerTurn;
    if (state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    if (state.turn - run.lastTurn < SAGA_GAP) continue;
    const id = nextBeat(state, e, run);
    if (!id) continue;
    const home = state.colonies[e.capitalStarId]?.empireId === e.id ? e.capitalStarId : Object.values(state.colonies).find((c) => c.empireId === e.id)?.starId;
    if (home === undefined) continue;
    const hs = state.stars[home]!;
    const near = state.stars.filter((s) => state.colonies[s.id]?.empireId !== e.id)
      .sort((a, b) => distance(hs.x, hs.y, a.x, a.y) - distance(hs.x, hs.y, b.x, b.y) || a.id - b.id)[0];
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: id, turn: state.turn, colonyStarId: home, starId: near?.id ?? home, rivalId: pickRival(state, e) });
    run.played.push(id);
    run.lastTurn = state.turn;
    const b = beatById.get(id);
    if (b?.kind === "act") run.acts = Math.max(run.acts, b.act);
    if (endingById.has(id)) run.ending = id;
  }
}

/** Called when any event is answered: move the scores, set flags, play an ending's outcome. */
export function noteSagaChoice(state: GameState, p: PendingEvent, choice: number): void {
  index();
  const b = beatById.get(p.eventId);
  const end = endingById.get(p.eventId);
  if (!b && !end) return;
  const e = state.empires[p.empireId]!;
  const run = runOf(state, e);
  if (b) {
    const c = b.choices[choice];
    if (!c) return;
    for (const s of SCORES) run.scores[s] += Math.max(-2, Math.min(2, c.shift?.[s] ?? 0));
    for (const f of c.sets ?? []) if (!run.flags.includes(f)) run.flags.push(f);
    return;
  }
  run.outcome = end!.outcome;
  applyOutcome(state, e, run, end!.outcome, p.rivalId);
  state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: e.capitalStarId, text: `The saga of the ${e.name} has reached its end: ${end!.title}.` });
}

function news(state: GameState, empireId: Id | null, text: string, starId?: Id): void {
  state.events.push({ turn: state.turn, empireId, kind: "info", starId, text });
}
const mine = (state: GameState, e: Empire) => Object.values(state.colonies).filter((c) => c.empireId === e.id);

function applyOutcome(state: GameState, e: Empire, run: SagaRun, o: SagaOutcome, rivalId: Id | null): void {
  const others = state.empires.filter((x) => x.alive && x.id !== e.id && e.contacts.includes(x.id));
  const cap = state.colonies[e.capitalStarId]?.empireId === e.id ? state.colonies[e.capitalStarId] : undefined;
  switch (o) {
    case "goldenAge":
      e.goldenAgeUntil = Math.max(e.goldenAgeUntil, state.turn) + OUTCOME.goldenAgeTurns;
      e.goldenAge = true;
      news(state, null, `A golden age begins for the ${e.name}, born of their saga.`);
      break;
    case "civilWar": {
      // The farthest third of our worlds burn with unrest; the unrest rules do the rest.
      const hs = state.stars[e.capitalStarId]!;
      const far = mine(state, e).filter((c) => !c.isCapital)
        .sort((a, b) => distance(hs.x, hs.y, state.stars[b.starId]!.x, state.stars[b.starId]!.y) - distance(hs.x, hs.y, state.stars[a.starId]!.x, state.stars[a.starId]!.y) || a.starId - b.starId);
      for (const c of far.slice(0, Math.max(1, Math.floor(far.length / 3)))) addUnrest(c, OUTCOME.civilWarUnrest);
      news(state, e.id, "Our outer worlds are in uproar. They will not stay with us for long.");
      break;
    }
    case "rivalBecomesAlly": {
      const r = state.empires[rivalId ?? -1] ?? others.sort((a, b) => relation(e, a) - relation(e, b) || a.id - b.id)[0];
      if (!r?.alive) break;
      if (e.atWar[r.id]) { if (!r.peaceOffers.includes(e.id)) r.peaceOffers.push(e.id); offerPeace(state, r, e); }
      for (const k of ["nap", "trade", "alliance"] as const) { (e.treaties[r.id] ??= {})[k] = state.turn; (r.treaties[e.id] ??= {})[k] = state.turn; }
      r.relations[e.id] = Math.max(relation(r, e), OUTCOME.allyRelation);
      e.relations[r.id] = Math.max(relation(e, r), OUTCOME.allyRelation);
      if (!e.contacts.includes(r.id)) e.contacts.push(r.id);
      if (!r.contacts.includes(e.id)) r.contacts.push(e.id);
      news(state, null, `Old enemies no more: the ${r.name} and the ${e.name} have sworn an alliance.`);
      break;
    }
    case "everyoneFearsUs":
      for (const x of others) adjustRelation(x, e, -OUTCOME.fearChill);
      e.research.progress.weapons += OUTCOME.fearResearch;
      news(state, null, `The galaxy speaks the name of the ${e.name} in whispers now.`);
      break;
    case "councilFavour":
      run.votes = OUTCOME.councilShare;
      news(state, null, `The ${e.name} are honoured in the Galactic Council: their voice will carry further from now on.`);
      break;
    case "greatWorkSurge": {
      const w = state.endgame?.[e.id]?.works.find((x) => !x.finished);
      if (w) { w.done = Math.max(w.done, Math.round((w.done + 1) * 1.5)); news(state, e.id, "Our people throw themselves into the great work; it leaps ahead."); }
      else { e.research.progress.construction += OUTCOME.ascensionResearch; news(state, e.id, "With no great work yet begun, our builders pour their zeal into new methods instead."); }
      break;
    }
    case "legendFleet": {
      const best = designsOf(state, e.id).filter((d) => d.role === "warship" && d.weapons.length > 0).sort((a, b) => b.cost - a.cost || a.id.localeCompare(b.id))[0];
      const home = cap ? state.stars[cap.starId] : undefined;
      if (best && home) state.fleets.push({ id: state.nextFleetId++, empireId: e.id, ships: { [best.id]: OUTCOME.legendShips }, x: home.x, y: home.y, starId: home.id, destStarId: null });
      news(state, e.id, "A fleet out of legend answers our call and gathers over the capital.", home?.id);
      break;
    }
    case "exodus": {
      const hs = state.stars[e.capitalStarId]!;
      const free = state.stars.filter((s) => s.planet && !s.planet.special && !state.colonies[s.id])
        .sort((a, b) => distance(hs.x, hs.y, b.x, b.y) - distance(hs.x, hs.y, a.x, a.y) || a.id - b.id);
      let n = 0;
      for (const s of free.slice(0, OUTCOME.exodusColonies)) { state.colonies[s.id] = newColony(s.id, e.id, OUTCOME.exodusPeople, state.turn); n++; e.knowledge[s.id] = { explored: true, lastSeen: state.turn, planet: structuredClone(s.planet!), ownerId: e.id, population: OUTCOME.exodusPeople }; }
      if (cap) cap.population = Math.max(1, cap.population * (1 - OUTCOME.exodusCapitalLoss));
      news(state, e.id, `Our people set out for the far stars: ${n} new worlds are founded, and the capital grows quiet.`);
      break;
    }
    case "ascension":
      for (const f of FIELDS) e.research.progress[f] += OUTCOME.ascensionResearch;
      news(state, e.id, "Our people see further than ever before. Every laboratory is alight.");
      break;
    case "fallFromGrace":
      for (const c of mine(state, e)) c.population = Math.max(1, c.population * (1 - OUTCOME.graceLoss));
      run.culturePerTurn = OUTCOME.graceCulture;
      news(state, e.id, "We have paid dearly. From the ashes, our songs will be sung for ever.");
      break;
  }
}

/** Extra council votes from a saga ending (a share of base votes). Not yet counted: the main Claude decides whether to add it to `votesOf`. */
export function sagaVotes(state: GameState, e: Empire, base: number): number {
  return Math.round(base * (state.sagas?.[e.id]?.votes ?? 0));
}

/** The saga as the Legends page shows it. */
export function sagaOf(state: GameState, e: Empire): SagaRun | undefined {
  return state.sagas?.[e.id];
}
