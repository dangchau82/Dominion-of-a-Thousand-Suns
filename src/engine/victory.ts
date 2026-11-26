// How the game is won: conquest, the Galactic Council, culture or technology.
// The council works like the classic one: votes by population, the two
// biggest empires stand, and a three-fifths (60%) majority wins the galaxy.

import { declareWar } from "./combat";
import { boughtVotes } from "./abilities";
import { fieldTier } from "./tech";
import { FIELDS, type Empire, type GameState, type Id, type VictoryKind } from "./types";

export const COUNCIL_FIRST = 150;
export const COUNCIL_EVERY = 25;
export const VOTE_SHARE_TO_WIN = 0.6;
export const POP_PER_VOTE = 25;
export const CULTURE_VICTORY = 90000; // balance 2026-11-24: 100k -> tech won 14/18; 90k -> culture won 12/18
/** Technology victory: master all six fields, then build this. */
export const ASCENSION_GATE = "w-ascension";

/** Conquest victory: hold more than this share of the galaxy's original home worlds, your own included. */
export const HOME_WORLD_SHARE = 0.5;

/** Home worlds needed for a conquest victory (0 if this game has no record of them). */
export function homeWorldsNeeded(state: GameState): number {
  const n = state.homeStars?.length ?? 0;
  return n >= 3 ? Math.floor(n * HOME_WORLD_SHARE) + 1 : 0;
}

/** Original home worlds this empire holds now. */
export function homeWorldsHeld(state: GameState, e: Empire): number {
  return (state.homeStars ?? []).filter((h) => state.colonies[h]?.empireId === e.id).length;
}

function ev(state: GameState, empireId: Id | null, text: string): void {
  state.events.push({ turn: state.turn, empireId, kind: "council", text });
}

export function population(state: GameState, e: Empire): number {
  return Object.values(state.colonies).filter((c) => c.empireId === e.id).reduce((a, c) => a + c.population, 0);
}

/** Conquered or handed-over peoples (another race living under us) count for this share of their population in council votes. */
export const SUBJECT_VOTE_SHARE = 0.5;

/** Population that votes for this empire: its own people in full, subject peoples at SUBJECT_VOTE_SHARE. */
export function votingPopulation(state: GameState, e: Empire): number {
  return Object.values(state.colonies).filter((c) => c.empireId === e.id)
    .reduce((a, c) => a + c.population * (c.peopleRaceId && c.peopleRaceId !== e.raceId ? SUBJECT_VOTE_SHARE : 1), 0);
}

/** Council votes: one per 25 voting population; the Hall of Many Voices adds a fifth more. */
export function votesOf(state: GameState, e: Empire): number {
  if (!e.alive) return 0;
  const base = Math.max(1, Math.round(votingPopulation(state, e) / POP_PER_VOTE));
  const lobby = e.councilBoost && e.councilBoost.until > state.turn ? e.councilBoost.votes : 0;
  return (e.wonders.includes("w-embassy") ? Math.round(base * 1.2) : base) + boughtVotes(e, base) + lobby;
}

export function techVictoryProgress(e: Empire): number {
  return FIELDS.filter((f) => fieldTier(e.research, f) >= 10).length;
}

function win(state: GameState, empireId: Id, kind: VictoryKind): void {
  if (state.winner) return;
  // After "Fight on", rivals have had their win; only the player can still take the galaxy.
  if (state.rivalWin && !state.empires[empireId]!.isPlayer) return;
  state.winner = { empireId, kind, turn: state.turn, ...(state.rivalWin ? { comeback: true } : {}) };
  const e = state.empires[empireId]!;
  const how: Record<VictoryKind, string> = {
    conquest: state.empires.filter((x) => x.alive).length > 1 ? "by conquest: it rules most of the galaxy's home worlds" : "by conquest: no rival remains",
    council: "by vote of the Galactic Council",
    culture: "through the brilliance of its culture",
    technology: "by mastering every field of science",
  };
  ev(state, null, `The ${e.name} have won the galaxy ${how[kind]}!`);
}

export function convene(state: GameState): void {
  const c = state.council;
  if (state.winner || c.defied || c.session || c.awaitingVerdict !== null || state.turn < c.nextTurn) return;
  const alive = state.empires.filter((e) => e.alive);
  if (alive.length < 3) return;
  const weight: Record<Id, number> = {};
  for (const e of alive) weight[e.id] = votesOf(state, e);
  const ranked = [...alive].sort((a, b) => weight[b.id]! - weight[a.id]! || a.id - b.id);
  c.session = { turn: state.turn, candidates: [ranked[0]!.id, ranked[1]!.id], votes: {}, weight };
  c.nextTurn = state.turn + COUNCIL_EVERY;
  const total = Object.values(weight).reduce((a, b) => a + b, 0);
  ev(state, null, `The Galactic Council convenes! Candidates: the ${ranked[0]!.name} (${weight[ranked[0]!.id]} votes) and the ${ranked[1]!.name} (${weight[ranked[1]!.id]} votes). ${Math.ceil(total * VOTE_SHARE_TO_WIN)} of ${total} votes are needed. Votes are cast next turn.`);
}

export function castVote(state: GameState, voter: Empire, choice: Id | null): string | null {
  const s = state.council.session;
  if (!s) return "The council is not in session";
  if (!voter.alive || s.weight[voter.id] === undefined) return "You have no seat this session";
  if (choice !== null && !s.candidates.includes(choice)) return "Vote for a candidate or abstain";
  if (s.candidates.includes(voter.id) && choice !== voter.id) return "Candidates vote for themselves";
  s.votes[voter.id] = choice;
  return null;
}

export function resolveCouncil(state: GameState): void {
  const s = state.council.session;
  if (!s || state.turn <= s.turn) return;
  state.council.session = null;
  const tally = new Map<Id, number>(s.candidates.map((id) => [id, 0]));
  let total = 0;
  const lines: string[] = [];
  for (const [idStr, w] of Object.entries(s.weight)) {
    const id = Number(idStr);
    const e = state.empires[id]!;
    if (!e.alive) continue;
    total += w;
    let choice = s.votes[id];
    if (choice === undefined) choice = s.candidates.includes(id) ? id : null;
    if (choice !== null) tally.set(choice, (tally.get(choice) ?? 0) + w);
    lines.push(`${e.name}: ${choice === null ? "abstained" : state.empires[choice]!.name} (${w})`);
  }
  const need = Math.ceil(total * VOTE_SHARE_TO_WIN);
  const [a, b] = s.candidates;
  const elected = (tally.get(a) ?? 0) >= need ? a : (tally.get(b) ?? 0) >= need ? b : null;
  ev(state, null, `Council vote: the ${state.empires[a]!.name} ${tally.get(a)}, the ${state.empires[b]!.name} ${tally.get(b)} (needed ${need}). ${lines.join("; ")}.`);
  if (elected === null) {
    ev(state, null, "No one reached three fifths. The council will meet again.");
    return;
  }
  const player = state.empires.find((e) => e.isPlayer);
  if (state.rivalWin && !state.empires[elected]!.isPlayer) {
    ev(state, null, `The council favors the ${state.empires[elected]!.name}, but the ${player?.name ?? "defiant"} still refuse to bow. The struggle goes on.`);
    return;
  }
  if (state.empires[elected]!.isPlayer || !player || !player.alive) win(state, elected, "council");
  else {
    state.council.awaitingVerdict = elected;
    ev(state, player.id, `The council has elected the ${state.empires[elected]!.name} to rule the galaxy. Accept the result, or defy it and face every empire at once.`);
  }
}

/** The player's answer when the council elects someone else. */
export function councilVerdict(state: GameState, player: Empire, accept: boolean): string | null {
  const id = state.council.awaitingVerdict;
  if (id === null) return "Nothing to decide";
  state.council.awaitingVerdict = null;
  if (accept) { win(state, id, "council"); return null; }
  state.council.defied = true;
  ev(state, null, `The ${player.name} defy the Galactic Council! Every empire turns against them.`);
  for (const e of state.empires) {
    if (e.alive && !e.isPlayer && e.atWar[player.id] === undefined && e.contacts.includes(player.id)) declareWar(state, e, player);
  }
  return null;
}

export function checkVictory(state: GameState): void {
  if (state.winner) return;
  const alive = state.empires.filter((e) => e.alive);
  const player = state.empires.find((e) => e.isPlayer);
  // Fighting on after a rival's win: if the player falls, that rival's win stands.
  if (state.rivalWin && player && !player.alive) { state.winner = { ...state.rivalWin }; return; }
  if (alive.length === 1) return win(state, alive[0]!.id, "conquest");
  if (player && !player.alive && alive.length) {
    // The player is gone: the strongest survivor takes the galaxy.
    const top = [...alive].sort((a, b) => population(state, b) - population(state, a))[0]!;
    return win(state, top.id, "conquest");
  }
  // Conquest: an empire that still holds its own home world and has taken enough of the others rules the galaxy.
  const need = homeWorldsNeeded(state);
  if (need) {
    for (const e of alive) {
      const own = state.homeStars![e.id];
      if (own === undefined || state.colonies[own]?.empireId !== e.id) continue;
      const held = homeWorldsHeld(state, e);
      if (held >= need) return win(state, e.id, "conquest");
      const warned = (state.homeWarned ??= {});
      if (held >= need - 1 && held >= 2 && (warned[e.id] ?? 0) < held) {
        warned[e.id] = held;
        ev(state, null, `The ${e.name} now hold ${held} of the galaxy's ${state.homeStars!.length} home worlds. One more and they rule by conquest.`);
      }
    }
  }
  for (const e of alive) {
    if (e.wonders.includes(ASCENSION_GATE)) return win(state, e.id, "technology");
    if (e.culture >= CULTURE_VICTORY) return win(state, e.id, "culture");
  }
}

/** "Fight on": the player refuses a rival's victory. The game goes on; only the player can still win. */
export function fightOn(state: GameState, player: Empire): string | null {
  const w = state.winner;
  if (!w || w.empireId === player.id || !player.alive) return "Nothing to fight on against";
  state.rivalWin = { ...w };
  state.winner = null;
  state.keepPlaying = false;
  ev(state, null, `The ${player.name} refuse to accept the ${state.empires[w.empireId]!.name}'s victory and fight on!`);
  return null;
}
