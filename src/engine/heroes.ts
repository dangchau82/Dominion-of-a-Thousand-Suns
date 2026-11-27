// Heroes (written by Claude 2; Danny's list, with ideas borrowed from hero units in
// real-time strategy games and companions in story role-playing games; names original).
// Every so often a person of rare talent offers to serve: a governor (runs one world), a
// spymaster (steals research from the strongest rival), a scientist (pushes one field) or a
// soldier (guards the capital). Heroes gain levels as they serve and pick up traits. At level
// 3 each one reaches a crossroads and chooses a career (a soldier becomes a General or an
// Admiral, a governor a Viceroy or a Chancellor, and so on); at level 5 they rise to that
// career's highest title. In the end they die (old age, or with their world) with a line in
// the galaxy's history. Up to three serve an empire at once. Names and traits come from the
// seed; no random draws.

import { BRANCH_BY_ID, BRANCH_ROLE, BRANCHES, ROLE_NAMES, TRAIT_BY_ID, TRAITS, type Branch, type HeroRole, type TraitId } from "./data/heroCareers";
import type { GameEventDef } from "./data/events";
import { adjustRelation } from "./diplomacy";
import { colonyProduction, distance } from "./formulas";
import { empireRace } from "./game";
import { FIELDS, type Empire, type Fleet, type GameState, type Id, type PendingEvent, type ResearchField } from "./types";

export { ROLE_NAMES, type HeroRole };

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
  /** Traits picked up along the way (heroes from before save 48 have none). */
  traits?: TraitId[];
  /** Career chosen at the level-3 crossroads. */
  branch?: Branch;
  /** The crossroads event waiting for an answer. */
  crossroads?: number;
  /** Admiral: the fleet they command. */
  fleetId?: Id;
  /** Lucky: has already cheated death. */
  escaped?: boolean;
}

export interface HeroState {
  heroes: Record<Id, Hero[]>;
  offers: Record<Id, number>;
  nextOffer: Record<Id, number>;
  fallen: { empireId: Id; name: string; role: HeroRole; turn: number; how: string; title?: string }[];
}

export const FIRST_OFFER = 40;
export const OFFER_EVERY = 55;
export const MAX_HEROES = 3;
export const MAX_OFFERS = 6;
export const LEVEL_EVERY = 30;
export const MAX_LEVEL = 5;
/** The level of the career crossroads, and of the highest title. */
export const CROSSROADS_LEVEL = 3;
export const HIGH_LEVEL = 5;
/** Governor: share of the world's production paid as BC each turn, per level. */
export const GOVERNOR_SHARE = 0.06;
/** Viceroy: how many nearby worlds they also run (at half the share). */
export const VICEROY_WORLDS = 3;
/** Chancellor: BC a turn per world we hold (High Chancellor: one more). */
export const CHANCELLOR_PER_WORLD = 2;
/** Scientist: research a turn in their field, per level. */
export const SCIENTIST_RESEARCH = 6;
/** Spymaster: every SPY_EVERY turns, steals this much per level from the strongest rival's best field. */
export const SPY_EVERY = 12;
export const SPY_STEAL = 40;
/** Ambassador: every ENVOY_EVERY turns, every empire we know warms by this much (Voice of the Stars: one more). */
export const ENVOY_EVERY = 10;
export const ENVOY_WARMTH = 2;
/** Chief Engineer: factories added at the capital by their great ability, per level. */
export const ENGINEER_FACTORIES = 2;
/** Soldier: ground bonus defending the capital, per level. General: bonus in every invasion. */
export const SOLDIER_GROUND = 4;
export const GENERAL_GROUND = 10;
export const MARSHAL_GROUND = 18;
/** Signature abilities every ABILITY_EVERY turns (Tireless: every 15). */
export const ABILITY_EVERY = 20;
export const TIRELESS_EVERY = 15;
export const LONG_LIFE = 30;

const ROLES: HeroRole[] = ["governor", "spymaster", "scientist", "soldier"];
const ROLE_TEXT: Record<HeroRole, string> = {
  governor: "a governor to run our busiest world",
  spymaster: "a spymaster to steal from our strongest rival",
  scientist: "a scientist to drive one field of research",
  soldier: "a soldier to guard the capital (a future general or admiral)",
};

const FIRST = ["Ilsa", "Brannoc", "Tavi", "Oren", "Sefa", "Corwyn", "Nadra", "Pell", "Yorik", "Mave", "Daro", "Quen", "Lio", "Esk", "Rulan", "Veyra"];
const LAST = ["Ashgrove", "Tenn", "Morrow", "Calder", "Vossk", "Hallam", "Ruel", "Keth", "Sabre", "Lune", "Draven", "Orrick", "Pyke", "Thorne", "Wend", "Ilyr"];

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

/** Four versions of the offer: three of the four roles each, in a different order, so AIs (which favour the first choice on a tie) take different heroes. */
export const HERO_EVENTS: GameEventDef[] = [0, 1, 2, 3].map((rot) => {
  const order = [0, 1, 2].map((i) => ROLES[(i + rot) % 4]!);
  return {
    id: `hero-offer:${rot}`,
    title: "A Person of Rare Talent",
    art: "council",
    trigger: "turn",
    text: "Word of our empire has spread, and three remarkable people have come to court, each offering a lifetime of service. We can take only one of them.",
    choices: order.map((r) => ({ label: `Take ${ROLE_TEXT[r]}`, result: `A new ${ROLE_NAMES[r].toLowerCase()} joins our service.`, effects: [{ kind: "nothing" as const }] })),
  };
});

const roleOf = (eventId: string, choice: number): HeroRole => ROLES[(choice + Number(eventId.split(":")[1] ?? 0)) % 4]!;

export const CROSSROADS_PREFIX = "hero-path:";
const CROSS_TEXT: Record<HeroRole, string> = {
  governor: "{work} has ruled well, and the court whispers that they are wasted on a single world. They could rule a whole region in our name, or take the keys to the treasury.",
  spymaster: "{work} knows every secret worth knowing. Now they must choose: go deeper into the dark, or step into the light as our voice among the stars.",
  scientist: "{work} stands at the edge of a great discovery, and of a choice: give everything to their own field, or turn their genius to the forges and factories.",
  soldier: "{work} has served with honour, and the generals and admirals both want them. Will they lead our troops on the ground, or take a fleet to the stars?",
};
/** Two versions per role with the careers swapped, so AIs vary. */
export const CROSSROADS_EVENTS: GameEventDef[] = ROLES.flatMap((r) => [0, 1].map((rot): GameEventDef => ({
  id: `${CROSSROADS_PREFIX}${r}:${rot}`,
  title: "A Hero at the Crossroads",
  art: "council",
  trigger: "turn",
  text: CROSS_TEXT[r],
  choices: [0, 1].map((i) => {
    const b = BRANCHES[r][(i + rot) % 2]!;
    return { label: b.pitch, result: `A new ${b.title} rises in our service.`, effects: [{ kind: "nothing" as const }] };
  }),
})));

export function heroTitle(h: Hero): string {
  const b = h.branch ? BRANCH_BY_ID.get(h.branch) : undefined;
  if (!b) return ROLE_NAMES[h.role];
  return h.level >= HIGH_LEVEL ? b.high : b.title;
}
export const has = (h: Hero, t: TraitId) => !!h.traits?.includes(t);
const boost = (h: Hero) => (has(h, "brilliant") ? 1.25 : 1);
const abilityEvery = (h: Hero) => (has(h, "tireless") ? TIRELESS_EVERY : ABILITY_EVERY);
const isHigh = (h: Hero) => !!h.branch && h.level >= HIGH_LEVEL;

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
  st.fallen.push({ empireId: e.id, name: h.name, role: h.role, turn: state.turn, how, title: heroTitle(h) });
  if (st.fallen.length > 40) st.fallen.splice(0, st.fallen.length - 40);
  news(state, null, `${heroTitle(h)} ${h.name} of the ${e.name} ${how}, after ${state.turn - h.since} turns of service.`, h.starId, "saga");
}

/** A new trait, picked from the seed, that suits the role and the hero doesn't have. */
function gainTrait(state: GameState, e: Empire, h: Hero, quiet = false): void {
  const pool = TRAITS.filter((t) => (!t.roles || t.roles.includes(h.role)) && !h.traits?.includes(t.id));
  if (!pool.length) return;
  const t = pool[hash(seedNumber(state), e.id, h.since, h.level, h.name.length) % pool.length]!;
  (h.traits ??= []).push(t.id);
  if (t.id === "long-lived") h.until += LONG_LIFE;
  if (!quiet) news(state, e.id, `${heroTitle(h)} ${h.name} has become ${t.name.toLowerCase()}: ${t.text}`, h.starId);
}

const shipCount = (f: Fleet) => Object.values(f.ships).reduce((a, b) => a + b, 0);
function largestFleet(state: GameState, e: Empire): Fleet | undefined {
  return state.fleets.filter((f) => f.empireId === e.id && shipCount(f) > 0).sort((a, b) => shipCount(b) - shipCount(a) || a.id - b.id)[0];
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
        if (has(h, "lucky") && !h.escaped && state.colonies[e.capitalStarId]?.empireId === e.id) {
          h.escaped = true;
          const lost = h.starId !== undefined ? state.stars[h.starId]!.name : "their world";
          h.starId = e.capitalStarId;
          news(state, e.id, `${heroTitle(h)} ${h.name} escaped the fall of ${lost} on the last ship out, and now serves at the capital.`, h.starId);
        } else { fall(state, st, e, h, "fell with their world"); list.splice(list.indexOf(h), 1); continue; }
      }
      if (served > 0 && served % LEVEL_EVERY === 0 && h.level < MAX_LEVEL) {
        h.level++;
        if (h.level === HIGH_LEVEL && h.branch) {
          news(state, null, `${BRANCH_BY_ID.get(h.branch)!.title} ${h.name} of the ${e.name} is raised to ${heroTitle(h)}.`, h.starId, "saga");
        } else news(state, e.id, `${heroTitle(h)} ${h.name} has grown in skill (level ${h.level}).`, h.starId);
        if (h.level === 2 || h.level === 4) gainTrait(state, e, h);
      }
      // The crossroads: once level 3, ask (when no other question is waiting).
      if (h.level >= CROSSROADS_LEVEL && !h.branch && h.crossroads === undefined && !state.pendingEvents.some((p) => p.empireId === e.id)) {
        const id = state.nextEventId++;
        h.crossroads = id;
        state.pendingEvents.push({ id, empireId: e.id, eventId: `${CROSSROADS_PREFIX}${h.role}:${hash(seed, e.id, h.since) % 2}`, turn: state.turn, colonyStarId: h.starId ?? null, starId: h.starId ?? null, rivalId: null });
      }
      serve(state, e, h, served);
      // Traits that work for any role.
      if (has(h, "beloved")) e.culture += 2;
      if (has(h, "frugal")) e.treasury += 3;
      if (has(h, "scholarly")) e.research.progress[[...FIELDS].sort((a, b) => e.research.progress[a] - e.research.progress[b])[0]!] += 3;
      if (has(h, "silver-tongued") && served > 0 && served % ENVOY_EVERY === 0) for (const o of state.empires) if (o.alive && e.contacts.includes(o.id)) adjustRelation(o, e, 1);
    }
    // Offers.
    const next = (st.nextOffer[e.id] ??= FIRST_OFFER + ((seed + e.id * 13) % 30));
    if (state.turn < next || list.length >= MAX_HEROES || (st.offers[e.id] ?? 0) >= MAX_OFFERS || state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    st.nextOffer[e.id] = state.turn + OFFER_EVERY;
    const n = (st.offers[e.id] = (st.offers[e.id] ?? 0) + 1);
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: `hero-offer:${(seed + e.id + n) % 4}`, turn: state.turn, colonyStarId: null, starId: null, rivalId: null });
  }
}

/** One hero's work for the turn. */
function serve(state: GameState, e: Empire, h: Hero, served: number): void {
  const ability = served > 0 && served % abilityEvery(h) === 0;
  const k = boost(h);
  const name = `${heroTitle(h)} ${h.name}`;
  if (h.role === "governor") {
    e.treasury += Math.round(production(state, h.starId!) * GOVERNOR_SHARE * h.level * k);
    if (h.branch === "viceroy") {
      const home = state.stars[h.starId!]!;
      const near = mine(state, e).filter((c) => c.starId !== h.starId)
        .sort((a, b) => distance(home.x, home.y, state.stars[a.starId]!.x, state.stars[a.starId]!.y) - distance(home.x, home.y, state.stars[b.starId]!.x, state.stars[b.starId]!.y) || a.starId - b.starId)
        .slice(0, VICEROY_WORLDS + (isHigh(h) ? 2 : 0));
      for (const c of near) e.treasury += Math.round(production(state, c.starId) * GOVERNOR_SHARE * 0.5 * h.level * k);
    } else if (h.branch === "chancellor") {
      e.treasury += Math.round(mine(state, e).length * (CHANCELLOR_PER_WORLD + (isHigh(h) ? 1 : 0)) * k);
    }
    if (ability) { const c = Math.round(40 * h.level * k); e.culture += c; h.deeds++; news(state, e.id, `${name} holds a great festival at ${state.stars[h.starId!]!.name} (+${c} culture).`, h.starId); }
  } else if (h.role === "scientist") {
    const mult = h.branch === "visionary" ? (isHigh(h) ? 3 : 2) : 1;
    if (h.branch === "engineer") {
      e.research.progress.construction += Math.round(SCIENTIST_RESEARCH * h.level * k * (isHigh(h) ? 1.5 : 1));
      if (ability) {
        const cap = state.colonies[e.capitalStarId];
        if (cap?.empireId === e.id) { const n = ENGINEER_FACTORIES * h.level; cap.factories += n; h.deeds++; news(state, e.id, `${name} opens ${n} new factories at the capital.`, e.capitalStarId); }
      }
    } else {
      e.research.progress[h.field!] += Math.round(SCIENTIST_RESEARCH * h.level * k * mult);
      if (ability) { const r = Math.round(100 * h.level * k * mult); e.research.progress[h.field!] += r; h.deeds++; news(state, e.id, `${name} has a flash of insight (+${r} ${h.field} research).`); }
    }
  } else if (h.role === "spymaster") {
    if (h.branch === "envoy") {
      if (served > 0 && served % ENVOY_EVERY === 0) {
        const warm = ENVOY_WARMTH + (isHigh(h) ? 1 : 0);
        let n = 0;
        for (const o of state.empires) if (o.alive && o.id !== e.id && e.contacts.includes(o.id)) { adjustRelation(o, e, warm); n++; }
        if (n && ability) { h.deeds++; news(state, e.id, `${name} tours the courts of the galaxy; ${n} empires think better of us.`); }
      }
      return;
    }
    if (served === 0 || served % SPY_EVERY !== 0) return;
    // Steal from the strongest rival we know: research in their best field.
    const rival = state.empires
      .filter((o) => o.alive && o.id !== e.id && e.contacts.includes(o.id))
      .sort((a, b) => mine(state, b).length - mine(state, a).length || a.id - b.id)[0];
    if (!rival) return;
    const field = [...FIELDS].sort((a, b) => rival.research.progress[b] - rival.research.progress[a])[0]!;
    const shadow = h.branch === "shadow" ? (isHigh(h) ? 3 : 2) : 1;
    const amount = Math.round(SPY_STEAL * h.level * k * shadow * (has(h, "ruthless") ? 1.25 : 1));
    e.research.progress[field] += amount;
    h.deeds++;
    if (h.branch === "shadow") {
      const burnt = Math.min(rival.research.progress[field], Math.round(amount / 2));
      rival.research.progress[field] -= burnt;
      news(state, e.id, `${name}'s agents stole ${amount} ${field} research from the ${rival.name}, and burned ${burnt} more.`);
      news(state, rival.id, `Saboteurs struck our ${field} laboratories; ${burnt} research is lost. Nobody saw who.`);
    } else news(state, e.id, `${name}'s agents stole ${amount} ${field} research from the ${rival.name}.`);
  } else {
    // Soldier, general, admiral.
    if (h.branch === "admiral") {
      const f = h.fleetId !== undefined ? state.fleets.find((x) => x.id === h.fleetId && shipCount(x) > 0) : undefined;
      if (!f) {
        const big = largestFleet(state, e);
        if (big && big.id !== h.fleetId) { h.fleetId = big.id; news(state, e.id, `${name} raises their flag over our largest fleet (${shipCount(big)} ships).`, big.starId ?? undefined); }
      }
    }
    if (ability && !h.branch) { const c = Math.round(20 * h.level * k); e.culture += c; h.deeds++; news(state, e.id, `${name} leads a grand parade through the capital (+${c} culture).`, e.capitalStarId); }
  }
}

/** Called when any event is answered: the chosen hero joins, or a hero picks a career. */
export function noteHeroChoice(state: GameState, p: PendingEvent, choice: number): void {
  const st = state.heroes;
  if (!st) return;
  const e = state.empires[p.empireId]!;
  const list = (st.heroes[e.id] ??= []);
  if (p.eventId.startsWith(CROSSROADS_PREFIX)) {
    const h = list.find((x) => x.crossroads === p.id);
    if (!h) return;
    const [, role, rot] = p.eventId.slice(CROSSROADS_PREFIX.length).match(/^(\w+):(\d)$/) ?? [];
    const b = BRANCHES[role as HeroRole]?.[(choice + Number(rot)) % 2];
    if (!b || BRANCH_ROLE.get(b.id) !== h.role) return;
    h.branch = b.id;
    h.crossroads = undefined;
    if (b.id === "admiral") h.fleetId = largestFleet(state, e)?.id;
    news(state, null, `${ROLE_NAMES[h.role]} ${h.name} of the ${e.name} becomes ${b.title}.`, h.starId, "saga");
    return;
  }
  if (!p.eventId.startsWith("hero-offer:")) return;
  if (list.length >= MAX_HEROES) return;
  const role = roleOf(p.eventId, choice);
  const h0 = (seedNumber(state) + e.id * 31 + state.turn * 7) >>> 0;
  const name = `${FIRST[h0 % FIRST.length]} ${LAST[Math.floor(h0 / 16) % LAST.length]}`;
  const hero: Hero = { name, role, since: state.turn, until: state.turn + 90 + (h0 % 60), level: 1, deeds: 0, traits: [] };
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
  gainTrait(state, e, hero, true);
  list.push(hero);
  const t = TRAIT_BY_ID.get(hero.traits![0]!);
  news(state, e.id, `${ROLE_NAMES[role]} ${name} has entered our service${hero.starId !== undefined ? ` at ${state.stars[hero.starId]!.name}` : hero.field ? ` (${hero.field})` : ""}${t ? `. They are known to be ${t.name.toLowerCase()}` : ""}.`, hero.starId);
}

/** "{work}" in the crossroads text: the hero's title and name. */
export function heroWorkText(state: GameState, p: PendingEvent): string | null {
  if (!p.eventId.startsWith(CROSSROADS_PREFIX)) return null;
  const h = state.heroes?.heroes[p.empireId]?.find((x) => x.crossroads === p.id);
  return h ? `${heroTitle(h)} ${h.name}` : "One of our heroes";
}

export function heroesOf(state: GameState, e: Empire): Hero[] {
  return state.heroes?.heroes[e.id] ?? [];
}

// ---- Battle hooks (one line each in combat.ts) ----

/** Ground bonus for an empire's troops: a General or Lord Marshal in every fight; soldiers and iron-willed heroes at the capital. */
export function heroGround(state: GameState, e: Empire, defendingStarId: Id | null): number {
  let b = 0;
  for (const h of heroesOf(state, e)) {
    if (h.branch === "general") b = Math.max(b, (isHigh(h) ? MARSHAL_GROUND : GENERAL_GROUND) + (has(h, "daring") || has(h, "ruthless") ? 5 : 0));
    if (defendingStarId !== null && defendingStarId === e.capitalStarId) {
      if (h.role === "soldier" && !h.branch) b = Math.max(b, SOLDIER_GROUND * h.level);
      if (has(h, "iron-willed")) b += 5;
    }
  }
  return b;
}

/** Before a battle: ships in a fleet under a hero admiral get an edge. */
export function heroEdge(state: GameState, here: Fleet[], units: { key: string; empireId: Id; fighter?: unknown; attack: number; beamDef: number; missileDef: number; bonusDamage: number }[]): void {
  for (const u of units) {
    if (u.key === "planet" || u.fighter) continue;
    for (const f of here) {
      if (f.empireId !== u.empireId || !(f.ships[u.key]! > 0)) continue;
      const adm = state.heroes?.heroes[f.empireId]?.find((h) => h.branch === "admiral" && h.fleetId === f.id);
      if (!adm) continue;
      u.attack += (isHigh(adm) ? 2 : 1) + (has(adm, "daring") ? 1 : 0);
      if (isHigh(adm)) { u.beamDef += 1; u.missileDef += 1; }
      if (has(adm, "ruthless")) u.bonusDamage += 1;
      break;
    }
  }
}
