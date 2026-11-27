// Race storylines in play: each race lives through its own six-chapter story
// (chapters 1-4, then ending 5A or 5B picked by the choice made in chapter 3).
// The story text is Gemini's (data/storylines*.ts); this file decides when each
// chapter happens. It uses no random draws, so it never changes a seed's game.

import { STORYLINES, type StoryChapter, type StoryWhen } from "./data/storylines";
import { STORYLINES_2 } from "./data/storylines-2";
import { STORYLINES_3 } from "./data/storylines-3";
import { STORYLINES_4 } from "./data/storylines-4";
import { distance } from "./formulas";
import { hasSaga } from "./sagas";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export const ALL_STORY_CHAPTERS: readonly StoryChapter[] = [...STORYLINES, ...STORYLINES_2, ...STORYLINES_3, ...STORYLINES_4];
export const STORY_BY_ID: ReadonlyMap<string, StoryChapter> = new Map(ALL_STORY_CHAPTERS.map((c) => [c.id, c]));

type ChapterKey = "1" | "2" | "3" | "4" | "5A" | "5B";
const ORDER = ["1", "2", "3", "4"] as const;

/** No chapter before this turn. */
export const STORY_START = 15;
/** Turns between two chapters, so the story breathes. */
export const STORY_GAP = 12;
/**
 * Each chapter plays by this turn even if its own condition never comes true
 * (an empire that never goes to war still reaches its chapter 3).
 */
export const STORY_FALLBACK: Record<ChapterKey, number> = { "1": 40, "2": 110, "3": 160, "4": 210, "5A": 260, "5B": 260 };
/** A chapter that names a rival waits for one to be met, but not past its fallback by more than this. */
const RIVAL_GRACE = 40;

function chapterFor(raceId: string, key: ChapterKey): StoryChapter | undefined {
  return ALL_STORY_CHAPTERS.find((c) => c.raceId === raceId && String(c.chapter) === key);
}

/** The next chapter this empire should see, or null when its story is over. */
function nextKey(e: Empire): ChapterKey | null {
  const played = e.story?.played ?? [];
  for (const k of ORDER) if (!played.includes(k)) return k;
  if (played.includes("5A") || played.includes("5B")) return null;
  return e.story?.fork === "B" ? "5B" : "5A";
}

function conditionMet(state: GameState, e: Empire, when: StoryWhen): boolean {
  switch (when.kind) {
    case "turn": return state.turn >= when.turn;
    case "colonies": return Object.values(state.colonies).filter((c) => c.empireId === e.id).length >= when.count;
    case "firstWar": return Object.keys(e.atWar).length > 0;
    case "goldenAge": return e.goldenAges > 0;
    case "council": return state.council.session !== null;
  }
}

function mentionsRival(c: StoryChapter): boolean {
  return [c.text, ...c.choices.flatMap((x) => [x.label, x.result])].some((t) => t.includes("{rival}"));
}

/** The rival a chapter is about: an enemy if at war, otherwise the contact we like least. */
function pickRival(state: GameState, e: Empire): Id | null {
  const enemies = Object.keys(e.atWar).map(Number).filter((id) => state.empires[id]?.alive).sort((a, b) => a - b);
  if (enemies.length) return enemies[0]!;
  const contacts = e.contacts.filter((id) => state.empires[id]!.alive).sort((a, b) => (e.relations[a] ?? 0) - (e.relations[b] ?? 0) || a - b);
  return contacts[0] ?? null;
}

/** The capital (or, if it was lost, the oldest colony we still hold). */
function homeColony(state: GameState, e: Empire): Id | null {
  if (state.colonies[e.capitalStarId]?.empireId === e.id) return e.capitalStarId;
  const mine = Object.values(state.colonies).filter((c) => c.empireId === e.id).sort((a, b) => a.starId - b.starId);
  return mine[0]?.starId ?? null;
}

/** The explored star nearest home that is not home itself: "the frontier" of the story. */
function nearbyStar(state: GameState, e: Empire, home: Id): Id | null {
  const h = state.stars[home]!;
  let best: Id | null = null;
  let bestD = Infinity;
  for (const s of state.stars) {
    if (s.id === home || !e.knowledge[s.id]?.explored) continue;
    const d = distance(h.x, h.y, s.x, s.y);
    if (d < bestD) { bestD = d; best = s.id; }
  }
  return best;
}

/** Once a turn: start the next chapter of each race's story when its moment comes. */
export function processStorylines(state: GameState): void {
  if (state.turn < STORY_START) return;
  for (const e of state.empires) {
    // Rebel empires share a race with the empire they left; the story belongs to the original.
    if (!e.alive || e.rebelOf !== undefined) continue;
    // Races with saga writing play their saga instead (sagas.ts).
    if (hasSaga(e.raceId)) continue;
    // One decision at a time: wait while this empire has any event open.
    if (state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    const key = nextKey(e);
    if (!key) continue;
    const chapter = chapterFor(e.raceId, key);
    if (!chapter) continue;
    const last = e.story?.lastTurn ?? -Infinity;
    if (state.turn - last < STORY_GAP) continue;
    const due = state.turn >= STORY_FALLBACK[key];
    if (!due && !conditionMet(state, e, chapter.when)) continue;
    const rival = pickRival(state, e);
    if (rival === null && mentionsRival(chapter) && state.turn < STORY_FALLBACK[key] + RIVAL_GRACE) continue;
    const home = homeColony(state, e);
    if (home === null) continue;
    const p: PendingEvent = {
      id: state.nextEventId++, empireId: e.id, eventId: chapter.id, turn: state.turn,
      colonyStarId: home, starId: nearbyStar(state, e, home), rivalId: rival,
    };
    state.pendingEvents.push(p);
    e.story = { played: [...(e.story?.played ?? []), key], fork: e.story?.fork, lastTurn: state.turn };
  }
}

/** Called when any event is answered: remember the chapter 3 fork, which picks the ending. */
export function noteStoryChoice(state: GameState, p: PendingEvent, choice: number): void {
  const c = STORY_BY_ID.get(p.eventId);
  if (!c || c.chapter !== 3) return;
  const e = state.empires[p.empireId]!;
  e.story = { played: e.story?.played ?? ["1", "2", "3"], fork: choice === 0 ? "A" : "B", lastTurn: e.story?.lastTurn ?? state.turn };
}

/** "Chapter 3 of 5" style label for a story event, or null for ordinary events. */
export function storyLabel(eventId: string): string | null {
  const c = STORY_BY_ID.get(eventId);
  if (!c) return null;
  const n = typeof c.chapter === "number" ? c.chapter : 5;
  return n === 5 ? "Your people's story: the ending" : `Your people's story: chapter ${n} of 5`;
}
