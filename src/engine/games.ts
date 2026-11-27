// The Starfall Games (written by Claude 2; Danny's list, growing the one-off "Games Among
// the Stars" event into a galactic tradition, like the Olympic Games). Every 60 turns the
// games are announced. Each empire chooses: bid to host (and train its team), train its
// athletes hard, send a team as it is, or boycott. The richest-in-culture bidder hosts.
// Five contests follow, each won by the empire strongest in what it tests (with training,
// home crowd and a little seed-based luck): the Zero-G Race (propulsion), the Starfighter
// Duel (weapons), the Grandmaster's Board (computers), Gravball (the capital's people and
// the race's ground strength) and the Pageant of Worlds (culture). Gold, silver and bronze
// medals bring culture; the overall champion is remembered; galactic records are kept; the
// host earns tourist money and goodwill; boycotters annoy the host. No random draws.

import type { GameEventDef } from "./data/events";
import { adjustRelation } from "./diplomacy";
import { empireRace } from "./game";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export type ContestId = "race" | "duel" | "board" | "gravball" | "pageant";
export const CONTESTS: { id: ContestId; name: string; verb: string }[] = [
  { id: "race", name: "Zero-G Race", verb: "flew the course" },
  { id: "duel", name: "Starfighter Duel", verb: "out-flew every rival pilot" },
  { id: "board", name: "Grandmaster's Board", verb: "out-thought every mind at the table" },
  { id: "gravball", name: "Gravball", verb: "carried the ball through crushing gravity" },
  { id: "pageant", name: "Pageant of Worlds", verb: "dazzled the judges" },
];

export type Entry = "host" | "train" | "send" | "boycott";

export interface Medals { gold: number; silver: number; bronze: number }

export interface GamesState {
  nextAt: number;
  held: number;
  /** While gathering: each empire's answer, and the turn the games begin. */
  entries: Record<Id, Entry>;
  opens?: number;
  /** All-time medal table. */
  table: Record<Id, Medals>;
  /** Champions of each games. */
  champions: { turn: number; empireId: Id | null; host: Id | null }[];
  /** Best score ever in each contest. */
  records: Partial<Record<ContestId, { score: number; empireId: Id; athlete: string; turn: number }>>;
  /** Most recent results, for the history page: contest -> [gold, silver, bronze] empire ids. */
  last?: { turn: number; host: Id | null; podium: Partial<Record<ContestId, Id[]>> };
}

export const FIRST_GAMES = 70;
export const GAMES_EVERY = 60;
export const GATHER_TURNS = 4;
export const HOST_COST = 200;
export const TRAIN_COST = 80;
export const TRAIN_EDGE = 15;
export const HOME_EDGE = 10;
export const LUCK = 25;
export const MEDAL_CULTURE = { gold: 80, silver: 50, bronze: 30 } as const;
export const CHAMPION_CULTURE = 200;
export const HOST_MONEY = 150;
export const HOST_MONEY_PER_TEAM = 40;
export const HOST_CULTURE = 100;
export const HOST_WARMTH = 4;
export const BOYCOTT_CHILL = 5;
export const GAMES_PREFIX = "games:";

const ENTRIES: Entry[] = ["host", "train", "send", "boycott"];
const LABELS: Record<Entry, { label: string; result: string }> = {
  host: { label: `Bid to host the games, and train our team (${HOST_COST} BC)`, result: "Our bid goes to the Games Council. The capital is already building stadiums." },
  train: { label: `Train our athletes hard (${TRAIN_COST} BC)`, result: "Our athletes go into the training camps." },
  send: { label: "Send a team as it is", result: "Our team packs its bags." },
  boycott: { label: "Boycott the games", result: "We will not take part. The host will remember it." },
};

/** Four versions with the entries in a different order, so AIs (first choice on a tie) vary. */
export const GAMES_EVENTS: GameEventDef[] = [0, 1, 2, 3].map((rot) => ({
  id: GAMES_PREFIX + rot,
  title: "The Starfall Games",
  art: "council",
  trigger: "turn",
  text: "Heralds cross the galaxy: the {work} Starfall Games will begin in a few turns. Five contests, every people invited, and the whole galaxy watching. How will we take part?",
  choices: [0, 1, 2, 3].map((i) => {
    const e = ENTRIES[(i + rot) % 4]!;
    return { label: LABELS[e].label, result: LABELS[e].result, effects: [{ kind: "nothing" as const }] };
  }),
}));

const FIRST = ["Asha", "Tor", "Velle", "Kiro", "Mirren", "Dax", "Suun", "Iyo", "Brenna", "Hask", "Oriel", "Zan", "Pim", "Rhea", "Coll", "Nyra"];
const LAST = ["Swift", "Vane", "Oakhart", "Strand", "Kell", "Marrow", "Quill", "Ember", "Dusk", "Arden", "Flint", "Haze", "Rook", "Sorrel", "Tallis", "Wren"];

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
const ordinal = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"}`;

function living(state: GameState): Empire[] {
  return state.empires.filter((e) => e.alive && e.rebelOf === undefined);
}
function news(state: GameState, empireId: Id | null, text: string, kind: "info" | "saga" = "info", starId?: Id): void {
  state.events.push({ turn: state.turn, empireId, kind, starId, text });
}

/** What a contest measures for an empire (before scaling to 0-100). */
function strength(state: GameState, e: Empire, c: ContestId): number {
  switch (c) {
    case "race": return e.research.progress.propulsion;
    case "duel": return e.research.progress.weapons;
    case "board": return e.research.progress.computers;
    case "gravball": { const cap = state.colonies[e.capitalStarId]; return (cap?.empireId === e.id ? cap.population : 1) * (1 + empireRace(e).ground * 0.25); }
    case "pageant": return e.culture;
  }
}

/** Once a turn. */
export function processGames(state: GameState): void {
  const st = (state.games ??= { nextAt: FIRST_GAMES + (seedNumber(state) % 15), held: 0, entries: {}, table: {}, champions: [], records: {} });
  if (st.opens !== undefined) {
    if (state.turn >= st.opens) hold(state, st);
    return;
  }
  if (state.turn < st.nextAt) return;
  st.opens = state.turn + GATHER_TURNS;
  st.entries = {};
  st.nextAt = state.turn + GAMES_EVERY;
  for (const e of living(state)) {
    st.entries[e.id] = "send"; // teams go unless we hear otherwise
    if (state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: GAMES_PREFIX + ((seedNumber(state) + e.id + st.held) % 4), turn: state.turn, colonyStarId: null, starId: null, rivalId: null });
  }
}

/** The games themselves. */
function hold(state: GameState, st: GamesState): void {
  st.held++;
  st.opens = undefined;
  const n = st.held;
  const seed = seedNumber(state);
  state.pendingEvents = state.pendingEvents.filter((p) => !p.eventId.startsWith(GAMES_PREFIX));
  const teams = living(state).filter((e) => st.entries[e.id] !== undefined && st.entries[e.id] !== "boycott");
  // The host: the bidder richest in culture who can still pay.
  const host = living(state).filter((e) => st.entries[e.id] === "host" && e.treasury >= HOST_COST)
    .sort((a, b) => b.culture - a.culture || a.id - b.id)[0] ?? null;
  for (const e of teams) if (st.entries[e.id] === "train" && e.treasury >= TRAIN_COST) e.treasury -= TRAIN_COST;
  if (host) host.treasury -= HOST_COST;
  const hostName = host ? `at ${state.stars[host.capitalStarId]!.name}, capital of the ${host.name}` : "on the neutral ring-world of the Games Council";
  news(state, null, `The ${ordinal(n)} Starfall Games open ${hostName}, with ${teams.length} teams.`, "saga", host?.capitalStarId);
  st.last = { turn: state.turn, host: host?.id ?? null, podium: {} };
  if (teams.length < 2) { news(state, null, "Too few teams came; the games are called off."); st.champions.push({ turn: state.turn, empireId: null, host: host?.id ?? null }); return; }

  const golds: Record<Id, number> = {}, points: Record<Id, number> = {};
  for (const c of CONTESTS) {
    const best = Math.max(1, ...teams.map((e) => strength(state, e, c.id)));
    const scored = teams.map((e) => {
      const trained = st.entries[e.id] === "train" || st.entries[e.id] === "host";
      const score = Math.round((strength(state, e, c.id) / best) * 100 + (trained ? TRAIN_EDGE : 0) + (host?.id === e.id ? HOME_EDGE : 0) + (hash(seed, n, e.id, c.id.length, c.id.charCodeAt(0)) % LUCK));
      return { e, score };
    }).sort((a, b) => b.score - a.score || a.e.id - b.e.id);
    const podium = scored.slice(0, 3);
    st.last.podium[c.id] = podium.map((x) => x.e.id);
    podium.forEach(({ e }, place) => {
      const kind = (["gold", "silver", "bronze"] as const)[place]!;
      const m = (st.table[e.id] ??= { gold: 0, silver: 0, bronze: 0 });
      m[kind]++;
      e.culture += MEDAL_CULTURE[kind];
      points[e.id] = (points[e.id] ?? 0) + 3 - place;
      if (kind === "gold") golds[e.id] = (golds[e.id] ?? 0) + 1;
    });
    const win = podium[0]!;
    const h = hash(seed, n, win.e.id, c.id.charCodeAt(1));
    const athlete = `${FIRST[h % FIRST.length]} ${LAST[Math.floor(h / 16) % LAST.length]}`;
    const rec = st.records[c.id];
    let line = `${c.name}: gold to ${athlete} of the ${win.e.name}, who ${c.verb}${podium[1] ? `; silver to the ${podium[1].e.name}` : ""}${podium[2] ? `; bronze to the ${podium[2].e.name}` : ""}.`;
    if (!rec || win.score > rec.score) {
      st.records[c.id] = { score: win.score, empireId: win.e.id, athlete, turn: state.turn };
      if (rec) line += ` A new galactic record!`;
    }
    for (const e of teams) news(state, e.id, line);
  }
  // The champion: most golds, then most points.
  const champ = teams.slice().sort((a, b) => (golds[b.id] ?? 0) - (golds[a.id] ?? 0) || (points[b.id] ?? 0) - (points[a.id] ?? 0) || a.id - b.id)[0]!;
  champ.culture += CHAMPION_CULTURE;
  for (const o of teams) if (o.id !== champ.id && o.contacts.includes(champ.id)) adjustRelation(o, champ, 2);
  st.champions.push({ turn: state.turn, empireId: champ.id, host: host?.id ?? null });
  if (st.champions.length > 20) st.champions.splice(0, st.champions.length - 20);
  news(state, null, `The ${champ.name} are champions of the ${ordinal(n)} Starfall Games, with ${golds[champ.id] ?? 0} gold medals.`, "saga", champ.capitalStarId);
  // The host: tourists, pride and goodwill; boycotters are not forgiven quickly.
  if (host) {
    const money = HOST_MONEY + HOST_MONEY_PER_TEAM * teams.length;
    host.treasury += money;
    host.culture += HOST_CULTURE;
    for (const o of teams) if (o.id !== host.id) adjustRelation(o, host, HOST_WARMTH);
    for (const o of living(state)) if (st.entries[o.id] === "boycott") adjustRelation(host, o, -BOYCOTT_CHILL);
    news(state, host.id, `Hosting the games brought ${money} BC from tourists and ${HOST_CULTURE} culture; every team goes home thinking well of us.`);
  }
  st.entries = {};
}

/** Called when any event is answered: records the entry. */
export function noteGamesChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (!p.eventId.startsWith(GAMES_PREFIX) || state.games?.opens === undefined) return;
  const rot = Number(p.eventId.slice(GAMES_PREFIX.length));
  state.games.entries[p.empireId] = ENTRIES[(choice + rot) % 4]!;
}

/** "{work}" in the games text: which games these are. */
export function gamesWorkText(state: GameState, p: PendingEvent): string | null {
  return p.eventId.startsWith(GAMES_PREFIX) ? ordinal((state.games?.held ?? 0) + 1) : null;
}

export function medalTable(state: GameState): { empireId: Id; m: Medals }[] {
  return Object.entries(state.games?.table ?? {}).map(([id, m]) => ({ empireId: Number(id), m }))
    .sort((a, b) => b.m.gold - a.m.gold || b.m.silver - a.m.silver || b.m.bronze - a.m.bronze || a.empireId - b.empireId);
}
