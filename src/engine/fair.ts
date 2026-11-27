// The Grand Fair of the Wandering Stars (written by Claude 2; Danny's list, a companion to
// the Travelling Auction). A caravan of circus-ships tours the galaxy one homeworld at a time.
// Each season it carries three troupes (acrobats, seers, duellists, engineers...). When it
// reaches our capital we can throw a grand festival (every troupe performs and leaves a gift),
// let it trade in the market square (tourist money plus the star troupe's gift), or hire the
// star troupe to stay for good (a small bonus every turn; at most two troupes stay).
// The route and the troupes come from the seed; no random draws.

import type { GameEventDef } from "./data/events";
import { adjustRelation } from "./diplomacy";
import { distance } from "./formulas";
import type { Empire, GameState, Id, PendingEvent, ResearchField } from "./types";

export interface TroupeDef {
  id: string;
  name: string;
  act: string;
  /** One-off gift when they perform for us. */
  gift: { culture?: number; money?: number; research?: { field: ResearchField; amount: number }; population?: number; factories?: number; relations?: number };
  /** Every turn, if they stay for good. */
  stay: { culture?: number; money?: number; research?: { field: ResearchField; amount: number } };
}

export const TROUPES: TroupeDef[] = [
  { id: "t-acrobats", name: "the Skyfall Acrobats", act: "tumble between gravity wells", gift: { culture: 120 }, stay: { culture: 2 } },
  { id: "t-menagerie", name: "the Menagerie of a Hundred Worlds", act: "parade beasts nobody has names for", gift: { culture: 40, population: 2 }, stay: { money: 3 } },
  { id: "t-seers", name: "the Seers of the Veil", act: "read the futures of whole planets", gift: { research: { field: "computers", amount: 200 } }, stay: { research: { field: "computers", amount: 4 } } },
  { id: "t-bladedancers", name: "the Bladedancers of Korr", act: "duel with singing blades", gift: { research: { field: "weapons", amount: 200 } }, stay: { research: { field: "weapons", amount: 4 } } },
  { id: "t-clockwork", name: "the Clockwork Pavilion", act: "build machines that build machines", gift: { factories: 4 }, stay: { research: { field: "construction", amount: 4 } } },
  { id: "t-lanterns", name: "the Lantern Storytellers", act: "tell tales of every people in the galaxy", gift: { relations: 5, culture: 30 }, stay: { culture: 2 } },
  { id: "t-choir", name: "the Choir of Distant Suns", act: "sing songs that take a week to finish", gift: { culture: 90 }, stay: { culture: 1, money: 2 } },
  { id: "t-comet-riders", name: "the Comet Riders", act: "fly stunt ships through the rings of the capital", gift: { research: { field: "propulsion", amount: 200 } }, stay: { research: { field: "propulsion", amount: 4 } } },
  { id: "t-green-road", name: "the Physicians of the Green Road", act: "heal any sick who come to their tents", gift: { population: 3 }, stay: { research: { field: "planetology", amount: 4 } } },
  { id: "t-spice", name: "the Spice Caravan", act: "sell flavours from the far side of the galaxy", gift: { money: 150 }, stay: { money: 4 } },
  { id: "t-lightweavers", name: "the Lightweavers", act: "juggle shields of solid light", gift: { research: { field: "forceFields", amount: 200 } }, stay: { research: { field: "forceFields", amount: 4 } } },
];
export const TROUPE_BY_ID = new Map(TROUPES.map((t) => [t.id, t]));

export interface FairState {
  /** Turn the next season starts (when not touring). */
  nextAt: number;
  season: number;
  troupes: string[];
  /** Empires still to visit this season, in order. */
  route: Id[];
  /** The capital the fair is at or heading for, and the empire. */
  hostId: Id | null;
  starId: Id | null;
  arrives: number;
  leaves: number;
  /** Has the current host been asked? */
  asked: boolean;
  /** Troupes that stayed for good, per empire. */
  residents: Record<Id, string[]>;
  /** Empires that have welcomed the fair, for the history page and medals. */
  festivals: Record<Id, number>;
}

export const FIRST_FAIR = 50;
export const FAIR_REST = 40;
export const FAIR_STAY = 3;
/** Galaxy units per turn of travel. */
export const FAIR_SPEED = 4;
export const FESTIVAL_COST = 120;
export const HIRE_COST = 250;
export const TOURIST_MONEY = 80;
export const MAX_RESIDENTS = 2;
export const FAIR_PREFIX = "fair:";

/** Three versions with the choices in a different order, so AIs (first choice on a tie) vary. */
export const FAIR_EVENTS: GameEventDef[] = [0, 1, 2].map((rot) => {
  const opts = [
    { label: `Throw a grand festival (${FESTIVAL_COST} BC): every troupe performs`, result: "The whole capital turns out. Nobody sleeps for three days." },
    { label: "Let them trade in the market square (free)", result: "Tourists pour in, and the star troupe gives a show for free." },
    { label: `Hire the star troupe to stay for good (${HIRE_COST} BC)`, result: "The star troupe unpacks its tents for the last time. They are ours now." },
  ];
  const order = [0, 1, 2].map((i) => opts[(i + rot) % 3]!);
  return {
    id: FAIR_PREFIX + rot,
    title: "The Grand Fair Arrives",
    art: "contact",
    trigger: "turn",
    text: "Lights fill the sky over the capital: the circus-ships of the Grand Fair of the Wandering Stars have arrived. This season they bring {work}.",
    choices: order.map((o) => ({ label: o.label, result: o.result, effects: [{ kind: "nothing" as const }] })),
  };
});

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function living(state: GameState): Empire[] {
  return state.empires.filter((e) => e.alive && e.rebelOf === undefined && state.colonies[e.capitalStarId]?.empireId === e.id);
}

const scale = (state: GameState) => 1 + state.turn / 150;

function news(state: GameState, empireId: Id | null, text: string, starId?: Id | null): void {
  state.events.push({ turn: state.turn, empireId, kind: "info", starId: starId ?? undefined, text });
}

/** Plan a season: three troupes, and a route that hops to the nearest capital each time. */
function startSeason(state: GameState, st: FairState): void {
  const all = living(state);
  if (!all.length) { st.nextAt = state.turn + FAIR_REST; return; }
  st.season++;
  const seed = seedNumber(state) + st.season * 11;
  const pool = [...TROUPES];
  st.troupes = [0, 1, 2].map((i) => pool.splice((seed + i * 5) % pool.length, 1)[0]!.id);
  let at = all[seed % all.length]!;
  const left = all.filter((e) => e.id !== at.id);
  st.route = [at.id];
  while (left.length) {
    const here = state.stars[at.capitalStarId]!;
    left.sort((a, b) => {
      const sa = state.stars[a.capitalStarId]!, sb = state.stars[b.capitalStarId]!;
      return distance(here.x, here.y, sa.x, sa.y) - distance(here.x, here.y, sb.x, sb.y) || a.id - b.id;
    });
    at = left.shift()!;
    st.route.push(at.id);
  }
  st.hostId = null; st.starId = null;
  next(state, st, true);
  news(state, null, `The Grand Fair of the Wandering Stars sets out on its ${ordinal(st.season)} tour, with ${troupeList(st.troupes)}.`);
}

/** Head for the next stop on the route (or end the season). */
function next(state: GameState, st: FairState, first = false): void {
  while (st.route.length) {
    const id = st.route.shift()!;
    const e = state.empires[id];
    if (!e?.alive || state.colonies[e.capitalStarId]?.empireId !== e.id) continue;
    const to = state.stars[e.capitalStarId]!;
    const from = st.starId !== null ? state.stars[st.starId]! : to;
    const travel = first ? 1 : Math.max(2, Math.ceil(distance(from.x, from.y, to.x, to.y) / FAIR_SPEED));
    st.hostId = id; st.starId = to.id; st.arrives = state.turn + travel; st.leaves = st.arrives + FAIR_STAY; st.asked = false;
    return;
  }
  st.hostId = null; st.starId = null; st.troupes = [];
  st.nextAt = state.turn + FAIR_REST;
  news(state, null, "The Grand Fair of the Wandering Stars packs up its tents and vanishes into deep space until next season.");
}

/** Once a turn. */
export function processFair(state: GameState): void {
  const st = (state.fair ??= { nextAt: FIRST_FAIR + (seedNumber(state) % 20), season: 0, troupes: [], route: [], hostId: null, starId: null, arrives: 0, leaves: 0, asked: false, residents: {}, festivals: {} });
  // Troupes that stayed for good perform every turn.
  for (const [id, list] of Object.entries(st.residents)) {
    const e = state.empires[Number(id)];
    if (!e?.alive) continue;
    for (const tid of list) {
      const t = TROUPE_BY_ID.get(tid);
      if (!t) continue;
      if (t.stay.money) e.treasury += t.stay.money;
      if (t.stay.culture) e.culture += t.stay.culture;
      if (t.stay.research) e.research.progress[t.stay.research.field] += t.stay.research.amount;
    }
  }
  if (st.hostId === null) {
    if (state.turn >= st.nextAt) startSeason(state, st);
    return;
  }
  const host = state.empires[st.hostId]!;
  if (!host.alive || state.colonies[host.capitalStarId]?.empireId !== host.id) { next(state, st); return; }
  if (state.turn < st.arrives) return;
  if (state.turn === st.arrives) news(state, null, `The Grand Fair of the Wandering Stars has arrived at ${state.stars[st.starId!]!.name}, capital of the ${host.name}.`, st.starId);
  if (!st.asked && !state.pendingEvents.some((p) => p.empireId === host.id)) {
    st.asked = true;
    state.pendingEvents.push({ id: state.nextEventId++, empireId: host.id, eventId: FAIR_PREFIX + ((seedNumber(state) + host.id + st.season) % 3), turn: state.turn, colonyStarId: host.capitalStarId, starId: host.capitalStarId, rivalId: null });
  }
  if (state.turn >= st.leaves) {
    // Unanswered offers lapse when the fair leaves.
    state.pendingEvents = state.pendingEvents.filter((p) => !(p.empireId === host.id && p.eventId.startsWith(FAIR_PREFIX)));
    next(state, st);
  }
}

function perform(state: GameState, e: Empire, t: TroupeDef): string {
  const k = scale(state);
  const g = t.gift;
  const got: string[] = [];
  if (g.culture) { const n = Math.round(g.culture * k); e.culture += n; got.push(`+${n} culture`); }
  if (g.money) { const n = Math.round(g.money * k); e.treasury += n; got.push(`+${n} BC`); }
  if (g.research) { const n = Math.round(g.research.amount * k); e.research.progress[g.research.field] += n; got.push(`+${n} ${g.research.field} research`); }
  const cap = state.colonies[e.capitalStarId];
  if (g.population && cap?.empireId === e.id) { cap.population += g.population; got.push(`+${g.population} people at the capital`); }
  if (g.factories && cap?.empireId === e.id) { cap.factories += g.factories; got.push(`+${g.factories} factories`); }
  if (g.relations) {
    for (const o of state.empires) if (o.alive && o.id !== e.id && e.contacts.includes(o.id)) adjustRelation(o, e, g.relations);
    got.push("every empire we know warms to us");
  }
  return `${cap1(t.name)} ${t.act} (${got.join(", ")})`;
}

/** Called when any event is answered. */
export function noteFairChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (!p.eventId.startsWith(FAIR_PREFIX)) return;
  const st = state.fair;
  if (!st || st.hostId !== p.empireId || !st.troupes.length) return;
  const e = state.empires[p.empireId]!;
  const rot = Number(p.eventId.slice(FAIR_PREFIX.length));
  let which = (choice + rot) % 3; // 0 festival, 1 market, 2 hire
  if (which === 0 && e.treasury < FESTIVAL_COST) which = 1;
  if (which === 2 && e.treasury < HIRE_COST) which = 1;
  const star = TROUPE_BY_ID.get(st.troupes[0]!)!;
  st.festivals[e.id] = (st.festivals[e.id] ?? 0) + 1;
  if (which === 0) {
    e.treasury -= FESTIVAL_COST;
    const lines = st.troupes.map((id) => perform(state, e, TROUPE_BY_ID.get(id)!));
    news(state, e.id, `The grand festival: ${lines.join("; ")}.`, e.capitalStarId);
    state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: e.capitalStarId, text: `The ${e.name} threw a festival for the Grand Fair that the galaxy will talk about for years.` });
  } else if (which === 1) {
    const money = Math.round(TOURIST_MONEY * scale(state));
    e.treasury += money;
    news(state, e.id, `Tourists spend ${money} BC in our markets. ${perform(state, e, star)}.`, e.capitalStarId);
  } else {
    e.treasury -= HIRE_COST;
    const list = (st.residents[e.id] ??= []);
    if (!list.includes(star.id)) list.push(star.id);
    if (list.length > MAX_RESIDENTS) {
      const gone = TROUPE_BY_ID.get(list.shift()!);
      if (gone) news(state, e.id, `${cap1(gone.name)} pack up and leave to make room for the newcomers.`);
    }
    st.troupes = st.troupes.filter((id) => id !== star.id);
    news(state, e.id, `${cap1(star.name)} now live at our capital for good.`, e.capitalStarId);
    if (!st.troupes.length) next(state, st);
  }
}

/** "{work}" in the fair text: this season's troupes. */
export function fairWorkText(state: GameState, p: PendingEvent): string | null {
  if (!p.eventId.startsWith(FAIR_PREFIX) || !state.fair?.troupes.length) return null;
  const [star, ...rest] = state.fair.troupes.map((id) => TROUPE_BY_ID.get(id)!);
  return `${star!.name} (the star troupe, who ${star!.act})${rest.length ? `, with ${rest.map((t) => t.name).join(" and ")}` : ""}`;
}

export function residentTroupes(state: GameState, e: Empire): TroupeDef[] {
  return (state.fair?.residents[e.id] ?? []).map((id) => TROUPE_BY_ID.get(id)!).filter(Boolean);
}

function troupeList(ids: string[]): string {
  const names = ids.map((id) => TROUPE_BY_ID.get(id)!.name);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names.join("");
}
const cap1 = (s: string) => s[0]!.toUpperCase() + s.slice(1);
const ordinal = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"}`;
