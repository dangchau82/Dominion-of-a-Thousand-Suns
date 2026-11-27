// Heroes (written by Claude 2; Danny's list, with ideas borrowed from hero units in
// real-time strategy games and companions in story role-playing games; names original).
// Every so often a person of rare talent offers to serve: a governor (runs one world), a
// spymaster (steals research from the strongest rival) or a scientist (pushes one field).
// Heroes gain levels as they serve, use a signature ability every few turns, and in the end
// die (old age, or with their world) with a line in the galaxy's history. Up to three serve
// an empire at once. Names come from the seed; no random draws.

import type { GameEventDef } from "./data/events";
import { colonyProduction } from "./formulas";
import { empireRace } from "./game";
import { FIELDS, type Empire, type GameState, type Id, type PendingEvent, type ResearchField } from "./types";

export type HeroRole = "governor" | "spymaster" | "scientist";

export interface Hero {
  name: string;
  role: HeroRole;
  since: number;
  /** Dies of old age on this turn. */
  until: number;
  level: number;
  /** Governor: the world. */
  starId?: Id;
  /** Scientist: the field. */
  field?: ResearchField;
  deeds: number;
}

export interface HeroState {
  heroes: Record<Id, Hero[]>;
  offers: Record<Id, number>;
  nextOffer: Record<Id, number>;
  fallen: { empireId: Id; name: string; role: HeroRole; turn: number; how: string }[];
}

export const FIRST_OFFER = 40;
export const OFFER_EVERY = 55;
export const MAX_HEROES = 3;
export const MAX_OFFERS = 6;
export const LEVEL_EVERY = 30;
export const MAX_LEVEL = 5;
/** Governor: share of the world's production paid as BC each turn, per level. */
export const GOVERNOR_SHARE = 0.06;
/** Scientist: research a turn in their field, per level. */
export const SCIENTIST_RESEARCH = 6;
/** Spymaster: every SPY_EVERY turns, steals this much per level from the strongest rival's best field. */
export const SPY_EVERY = 12;
export const SPY_STEAL = 40;
/** Signature abilities every ABILITY_EVERY turns. */
export const ABILITY_EVERY = 20;

const ROLES: HeroRole[] = ["governor", "spymaster", "scientist"];
export const ROLE_NAMES: Record<HeroRole, string> = { governor: "Governor", spymaster: "Spymaster", scientist: "Scientist" };
const ROLE_TEXT: Record<HeroRole, string> = {
  governor: "a governor to run our busiest world",
  spymaster: "a spymaster to steal from our strongest rival",
  scientist: "a scientist to drive one field of research",
};

const FIRST = ["Ilsa", "Brannoc", "Tavi", "Oren", "Sefa", "Corwyn", "Nadra", "Pell", "Yorik", "Mave", "Daro", "Quen", "Lio", "Esk", "Rulan", "Veyra"];
const LAST = ["Ashgrove", "Tenn", "Morrow", "Calder", "Vossk", "Hallam", "Ruel", "Keth", "Sabre", "Lune", "Draven", "Orrick", "Pyke", "Thorne", "Wend", "Ilyr"];

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Three versions of the offer with the roles in a different order, so AIs (which favour the first choice on a tie) take different heroes. */
export const HERO_EVENTS: GameEventDef[] = [0, 1, 2].map((rot) => {
  const order = [0, 1, 2].map((i) => ROLES[(i + rot) % 3]!);
  return {
    id: `hero-offer:${rot}`,
    title: "A Person of Rare Talent",
    art: "council",
    trigger: "turn",
    text: "Word of our empire has spread, and three remarkable people have come to court, each offering a lifetime of service. We can take only one of them.",
    choices: order.map((r) => ({ label: `Take ${ROLE_TEXT[r]}`, result: `A new ${ROLE_NAMES[r].toLowerCase()} joins our service.`, effects: [{ kind: "nothing" as const }] })),
  };
});

const roleOf = (eventId: string, choice: number): HeroRole => ROLES[(choice + Number(eventId.split(":")[1] ?? 0)) % 3]!;

function mine(state: GameState, e: Empire) {
  return Object.values(state.colonies).filter((c) => c.empireId === e.id);
}

function production(state: GameState, starId: Id): number {
  const c = state.colonies[starId];
  if (!c) return 0;
  const e = state.empires[c.empireId]!;
  return colonyProduction(c, state.stars[starId]!.planet!, e, empireRace(e));
}

function news(state: GameState, empireId: Id | null, text: string, starId?: Id, kind: "info" | "saga" = "info"): void {
  state.events.push({ turn: state.turn, empireId, kind, starId, text });
}

function fall(state: GameState, st: HeroState, e: Empire, h: Hero, how: string): void {
  st.fallen.push({ empireId: e.id, name: h.name, role: h.role, turn: state.turn, how });
  if (st.fallen.length > 40) st.fallen.splice(0, st.fallen.length - 40);
  news(state, null, `${ROLE_NAMES[h.role]} ${h.name} of the ${e.name} ${how}, after ${state.turn - h.since} turns of service.`, h.starId, "saga");
}

/** Once a turn. */
export function processHeroes(state: GameState): void {
  const st = (state.heroes ??= { heroes: {}, offers: {}, nextOffer: {}, fallen: [] });
  const seed = seedNumber(state);
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    const list = (st.heroes[e.id] ??= []);
    // Serve, level up, use abilities; the old die.
    for (const h of [...list]) {
      const served = state.turn - h.since;
      if (state.turn >= h.until) { fall(state, st, e, h, "has died peacefully of old age"); list.splice(list.indexOf(h), 1); continue; }
      if (h.role === "governor" && (h.starId === undefined || state.colonies[h.starId]?.empireId !== e.id)) {
        fall(state, st, e, h, "fell with their world"); list.splice(list.indexOf(h), 1); continue;
      }
      if (served > 0 && served % LEVEL_EVERY === 0 && h.level < MAX_LEVEL) {
        h.level++;
        news(state, e.id, `${ROLE_NAMES[h.role]} ${h.name} has grown in skill (level ${h.level}).`, h.starId);
      }
      if (h.role === "governor") {
        e.treasury += Math.round(production(state, h.starId!) * GOVERNOR_SHARE * h.level);
        if (served > 0 && served % ABILITY_EVERY === 0) { e.culture += 40 * h.level; h.deeds++; news(state, e.id, `Governor ${h.name} holds a great festival at ${state.stars[h.starId!]!.name} (+${40 * h.level} culture).`, h.starId); }
      } else if (h.role === "scientist") {
        e.research.progress[h.field!] += SCIENTIST_RESEARCH * h.level;
        if (served > 0 && served % ABILITY_EVERY === 0) { e.research.progress[h.field!] += 100 * h.level; h.deeds++; news(state, e.id, `Scientist ${h.name} has a flash of insight (+${100 * h.level} ${h.field} research).`); }
      } else if (served > 0 && served % SPY_EVERY === 0) {
        // Steal from the strongest rival we know: research in their best field.
        const rival = state.empires
          .filter((o) => o.alive && o.id !== e.id && e.contacts.includes(o.id))
          .sort((a, b) => mine(state, b).length - mine(state, a).length || a.id - b.id)[0];
        if (rival) {
          const field = [...FIELDS].sort((a, b) => rival.research.progress[b] - rival.research.progress[a])[0]!;
          const amount = SPY_STEAL * h.level;
          e.research.progress[field] += amount;
          h.deeds++;
          news(state, e.id, `Spymaster ${h.name}'s agents stole ${amount} ${field} research from the ${rival.name}.`);
        }
      }
    }
    // Offers.
    const next = (st.nextOffer[e.id] ??= FIRST_OFFER + ((seed + e.id * 13) % 30));
    if (state.turn < next || list.length >= MAX_HEROES || (st.offers[e.id] ?? 0) >= MAX_OFFERS || state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    st.nextOffer[e.id] = state.turn + OFFER_EVERY;
    const n = (st.offers[e.id] = (st.offers[e.id] ?? 0) + 1);
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: `hero-offer:${(seed + e.id + n) % 3}`, turn: state.turn, colonyStarId: null, starId: null, rivalId: null });
  }
}

/** Called when any event is answered: the chosen hero joins. */
export function noteHeroChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (!p.eventId.startsWith("hero-offer:")) return;
  const st = state.heroes;
  const e = state.empires[p.empireId]!;
  if (!st) return;
  const list = (st.heroes[e.id] ??= []);
  if (list.length >= MAX_HEROES) return;
  const role = roleOf(p.eventId, choice);
  const h0 = (seedNumber(state) + e.id * 31 + state.turn * 7) >>> 0;
  const name = `${FIRST[h0 % FIRST.length]} ${LAST[Math.floor(h0 / 16) % LAST.length]}`;
  const hero: Hero = { name, role, since: state.turn, until: state.turn + 90 + (h0 % 60), level: 1, deeds: 0 };
  if (role === "governor") {
    // The busiest world without a governor.
    const taken = new Set(list.filter((h) => h.role === "governor").map((h) => h.starId));
    hero.starId = mine(state, e).filter((c) => !taken.has(c.starId)).sort((a, b) => production(state, b.starId) - production(state, a.starId) || a.starId - b.starId)[0]?.starId;
    if (hero.starId === undefined) return;
  }
  if (role === "scientist") {
    // The field we are furthest behind in.
    hero.field = [...FIELDS].sort((a, b) => e.research.progress[a] - e.research.progress[b])[0]!;
  }
  list.push(hero);
  news(state, e.id, `${ROLE_NAMES[role]} ${name} has entered our service${hero.starId !== undefined ? ` at ${state.stars[hero.starId]!.name}` : hero.field ? ` (${hero.field})` : ""}.`, hero.starId);
}

export function heroesOf(state: GameState, e: Empire): Hero[] {
  return state.heroes?.heroes[e.id] ?? [];
}
