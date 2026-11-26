// The galaxy's history: a one-page story of the whole game, written from the chronicle (per-turn stats of every
// empire and the key events). Shown at the end of the game and on the History screen. Pure: it only reads state.
// (Idea from Danny's second Claude session; written by the main Claude, 2026-11-26.)

import { race } from "./data/races";
import type { ChronicleEvent } from "./chronicle";
import { CHRONICLE_STATS } from "./chronicle";
import type { GameState } from "./types";

export interface HistoryChapter {
  title: string;
  lines: string[];
}

// Looked up when used (not at load time): chronicle.ts imports this file too.
const statIndex = (k: (typeof CHRONICLE_STATS)[number]) => CHRONICLE_STATS.indexOf(k);
const AGE = 100;
const AGE_NAMES = ["The Age of First Light", "The Age of Borders", "The Age of Empires", "The Age of Reckoning", "The Long Age"];

function name(state: GameState, id: number): string {
  return state.empires[id]?.name ?? "an unknown people";
}

/** Who led (most people) at a turn, from the chronicle. */
function leaderAt(state: GameState, t: number): { id: number; pop: number; share: number } | null {
  const POP = statIndex("population");
  const row = state.chronicle?.turns.find((x) => x.t === t) ?? state.chronicle?.turns.filter((x) => x.t <= t).at(-1);
  if (!row) return null;
  let best = -1, pop = -1, total = 0;
  row.e.forEach((r, i) => { if (!r) return; total += r[POP]!; if (r[POP]! > pop) { pop = r[POP]!; best = i; } });
  return best < 0 ? null : { id: best, pop, share: total > 0 ? pop / total : 0 };
}

function count(evs: ChronicleEvent[], re: RegExp): number {
  return evs.filter((e) => re.test(e.text)).length;
}

function plural(n: number, word: string): string {
  return `${n} ${n === 1 ? word : word.endsWith("y") ? `${word.slice(0, -1)}ies` : `${word}s`}`;
}

export function galaxyHistory(state: GameState): HistoryChapter[] {
  const ch = state.chronicle;
  const out: HistoryChapter[] = [];
  const peoples = state.homeStars?.length ?? state.empires.length;
  const first = state.empires.slice(0, peoples);
  out.push({
    title: "The Beginning",
    lines: [
      `${plural(first.length, "people")} looked up from their home worlds: ${first.map((e) => `the ${e.name} (${race(e.raceId).style.toLowerCase()})`).join(", ")}.`,
      `The galaxy was ${state.settings.size}, its stars scattered in ${/^[aeiou]/.test(state.settings.shape) ? "an" : "a"} ${state.settings.shape}.`,
    ],
  });
  if (!ch || !ch.turns.length) return out;
  const lastT = ch.turns.at(-1)!.t;
  // When each empire fell: the first turn its row is null after being alive.
  const fell = new Map<number, number>();
  for (const tr of ch.turns) tr.e.forEach((r, i) => { if (!r && !fell.has(i) && ch.turns[0]!.e[i]) fell.set(i, tr.t); });
  for (let a = 0; a * AGE < lastT; a++) {
    const from = a * AGE + 1, to = Math.min(lastT, (a + 1) * AGE);
    const evs = ch.events.filter((e) => e.t >= from && e.t <= to);
    const lines: string[] = [];
    const lead = leaderAt(state, to);
    if (lead) lines.push(`By turn ${to} the ${name(state, lead.id)} were the greatest people, with ${Math.round(lead.share * 100)}% of the galaxy's population.`);
    const met = count(evs.filter((e) => e.kind === "contact"), /./);
    if (met) lines.push(`${plural(met, "first contact")} ${met === 1 ? "was" : "were"} made.`);
    const wars = evs.filter((e) => e.kind === "war" && /declared war on/.test(e.text));
    const peaces = count(evs.filter((e) => e.kind === "war"), /made peace/);
    if (wars.length) {
      const firstWar = wars[0]!;
      lines.push(`${plural(wars.length, "war")} began${a === 0 || wars.length ? ` (the first: ${firstWar.text.replace(/!$/, "")}, turn ${firstWar.t})` : ""}; ${plural(peaces, "peace")} ${peaces === 1 ? "was" : "were"} made.`);
    }
    const captured = count(evs.filter((e) => e.kind === "invasion"), /captured/) ;
    const ceded = evs.filter((e) => e.kind === "war" && /handing over/.test(e.text)).length;
    if (captured || ceded) lines.push(`${plural(Math.round(captured / 2), "world")} fell to invasion${ceded ? ` and ${plural(ceded, "treaty")} handed worlds to the victors` : ""}.`);
    const golden = evs.filter((e) => /golden age begins/i.test(e.text)).map((e) => e.text.match(/for the (.+?)!/)?.[1]).filter(Boolean);
    if (golden.length) lines.push(`Golden ages lit the ${[...new Set(golden)].join(", the ")}.`);
    const firsts = evs.filter((e) => /^Galactic first/.test(e.text)).map((e) => e.text.replace(/^Galactic first, "([^"]+)": the (.+?) were the first to (.+?)\. \(.*$/, "the $2 were the first to $3"));
    if (firsts.length) lines.push(`Firsts: ${firsts.join("; ")}.`);
    const nova = evs.find((e) => /has exploded/.test(e.text));
    if (nova) lines.push(`In turn ${nova.t}, ${nova.text.split("!")[0]}!`);
    // Story moments marked "saga" by the content code, once each.
    for (const t of [...new Set(evs.filter((e) => e.kind === "saga").map((e) => e.text))]) if (!/has exploded/.test(t)) lines.push(t);
    for (const [id, t] of fell) if (t >= from && t <= to) lines.push(`The ${name(state, id)} fell in turn ${t}.`);
    const council = evs.filter((e) => e.kind === "council" && /now hold \d+ of the galaxy's/.test(e.text));
    for (const c of council) lines.push(c.text);
    out.push({ title: `${AGE_NAMES[Math.min(a, AGE_NAMES.length - 1)]} (turns ${from}-${to})`, lines: lines.length ? lines : ["A quiet century: the peoples built, and waited."] });
  }
  // The end.
  const end: string[] = [];
  if (state.winner) {
    const how: Record<string, string> = {
      conquest: "by conquest", council: "by vote of the Galactic Council", culture: "through the brilliance of its culture", technology: "by opening the Ascension Gate",
    };
    end.push(`In turn ${state.winner.turn} the ${name(state, state.winner.empireId)} won the galaxy ${how[state.winner.kind] ?? state.winner.kind}.`);
  } else end.push(`The story is still being written (turn ${state.turn}).`);
  const POP = statIndex("population"), COLS = statIndex("colonies");
  const last = ch.turns.at(-1)!;
  const standing = last.e.map((r, i) => ({ i, r })).filter((x) => x.r).sort((a, b) => b.r![POP]! - a.r![POP]!);
  if (standing.length) end.push(`At the end: ${standing.map((x) => `the ${name(state, x.i)} with ${plural(x.r![COLS]!, "world")}`).join(", ")}.`);
  const gone = [...fell.keys()].map((i) => `the ${name(state, i)}`);
  if (gone.length) end.push(`Remembered but gone: ${gone.join(", ")}.`);
  out.push({ title: "The Ending", lines: end });
  return out;
}

/** Plain text version (for the downloadable log and for sharing). */
export function galaxyHistoryText(state: GameState): string {
  return galaxyHistory(state).map((c) => `${c.title}\n${c.lines.map((l) => `  ${l}`).join("\n")}`).join("\n\n");
}
