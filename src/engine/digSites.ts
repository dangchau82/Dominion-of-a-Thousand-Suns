// Dig sites (written by Claude 2; Danny's list): ancient ruins on a few unclaimed worlds.
// When an empire settles a world with ruins, it can excavate them in three stages, each a few
// turns of work with a choice: dig deeper, take the finds and seal it, or sell the site.
// Finds are research, money, culture, and sometimes an artifact (common, rare, epic, legendary)
// that pays a little every turn while the empire holds it. Some sites wake something at the
// bottom. Sites are placed from the seed; no random draws.

import { ARTIFACT_BY_ID, DIG_KINDS, DIG_NAMES, DIG_REWARDS, digEventId, type DigKind } from "./data/digSites";
import type { Empire, GameState, Id, PendingEvent } from "./types";

export interface DigSite {
  starId: Id;
  kind: DigKind;
  /** Stage reached (0 = untouched, 3 = done). */
  stage: number;
  /** Turn the current dig finishes, if digging. */
  diggingUntil?: number;
  /** Empire working it. */
  empireId?: Id;
  closed: boolean;
  /** Where in the event chain we are, so events are not offered twice. */
  offered?: number;
}

export interface DigState {
  sites: DigSite[];
  /** Artifacts held, per empire. */
  artifacts: Record<Id, string[]>;
}

export const DIG_TURNS = 8;
export const SELL_SHARE = 0.6;
/** Danger at the bottom: the colony loses this share of its people. */
export const DANGER_LOSS = 0.3;

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function place(state: GameState): DigState {
  const homes = new Set(state.empires.map((e) => e.capitalStarId));
  const spots = state.stars.filter((s) => s.planet && !s.planet.special && !state.colonies[s.id] && !homes.has(s.id));
  const n = Math.max(2, Math.round(state.stars.length / 16)) * (state.scenario?.digMultiplier ?? 1);
  const seed = seedNumber(state);
  const sites: DigSite[] = [];
  for (let i = 0; i < n && spots.length; i++) {
    const s = spots.splice((seed + i * 97) % spots.length, 1)[0]!;
    sites.push({ starId: s.id, kind: DIG_KINDS[(seed + i * 3) % DIG_KINDS.length]!, stage: 0, closed: false });
  }
  return { sites, artifacts: {} };
}

/** Rewards for a stage (0-2). */
function reward(state: GameState, e: Empire, site: DigSite, stage: number, sell: boolean): string[] {
  const r = DIG_REWARDS[site.kind];
  const got: string[] = [];
  if (sell) {
    const bc = Math.round((r.money[stage]! + r.research[stage]! * 0.5) * SELL_SHARE * 2);
    e.treasury += bc;
    got.push(`${bc} BC`);
    return got;
  }
  e.research.progress[r.field] += r.research[stage]!;
  e.treasury += r.money[stage]!;
  e.culture += r.culture[stage]!;
  got.push(`${r.research[stage]} research`, `${r.money[stage]} BC`, `${r.culture[stage]} culture`);
  // An artifact at stages 2 and 3 (the deepest one is the best).
  if (stage >= 1) {
    const id = r.artifact[stage]!;
    const held = ((state.digs ??= { sites: [], artifacts: {} }).artifacts[e.id] ??= []);
    if (!held.includes(id)) {
      held.push(id);
      const a = ARTIFACT_BY_ID.get(id)!;
      got.push(`the ${a.name} (${a.quality})`);
    }
  }
  return got;
}

/** Once a turn. */
export function processDigSites(state: GameState): void {
  const st = (state.digs ??= place(state));
  // Artifacts pay out.
  for (const [id, list] of Object.entries(st.artifacts)) {
    const e = state.empires[Number(id)];
    if (!e?.alive) continue;
    for (const aid of list) {
      const a = ARTIFACT_BY_ID.get(aid);
      if (!a) continue;
      if (a.money) e.treasury += a.money;
      if (a.culture) e.culture += a.culture;
      if (a.research) e.research.progress[a.research.field] += a.research.amount;
    }
  }
  for (const site of st.sites) {
    if (site.closed || site.stage >= 3) continue;
    const c = state.colonies[site.starId];
    if (!c) continue;
    const e = state.empires[c.empireId]!;
    if (site.empireId !== undefined && site.empireId !== e.id) { site.empireId = e.id; site.diggingUntil = undefined; site.offered = undefined; }
    site.empireId = e.id;
    if (site.diggingUntil !== undefined && state.turn < site.diggingUntil) continue;
    if (site.offered === site.stage || state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    site.offered = site.stage;
    site.diggingUntil = undefined;
    state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: digEventId(site.kind, site.stage), turn: state.turn, colonyStarId: site.starId, starId: site.starId, rivalId: null });
  }
}

/** Called when any event is answered. */
export function noteDigChoice(state: GameState, p: PendingEvent, choice: number): void {
  if (!p.eventId.startsWith("dig:")) return;
  const site = state.digs?.sites.find((s) => s.starId === p.starId);
  if (!site || site.closed) return;
  const e = state.empires[p.empireId]!;
  const stage = site.stage;
  const name = DIG_NAMES[site.kind];
  if (choice === 0) {
    // Dig deeper: this stage's finds come when the next level is reached.
    if (stage === 2) {
      const got = reward(state, e, site, 2, false);
      site.stage = 3;
      // Some sites bite back at the very bottom (fixed per site, from the seed).
      const bites = (seedNumber(state) + site.starId) % 2 === 0;
      const c = state.colonies[site.starId];
      if (bites && c) {
        c.population = Math.max(1, Math.round(c.population * (1 - DANGER_LOSS)));
        state.events.push({ turn: state.turn, empireId: e.id, kind: "info", starId: site.starId, text: `${DIG_REWARDS[site.kind].danger} (${name}: ${got.join(", ")})` });
      } else {
        state.events.push({ turn: state.turn, empireId: e.id, kind: "info", starId: site.starId, text: `The bottom of the ${name} is ours: ${got.join(", ")}.` });
      }
      state.events.push({ turn: state.turn, empireId: null, kind: "saga", starId: site.starId, text: `The ${e.name} have excavated the ${name} to its very bottom.` });
      return;
    }
    reward(state, e, site, stage, false);
    site.stage = stage + 1;
    site.diggingUntil = state.turn + DIG_TURNS;
  } else {
    const got = reward(state, e, site, stage, choice === 2);
    site.closed = true;
    state.events.push({ turn: state.turn, empireId: e.id, kind: "info", starId: site.starId, text: `The ${name} is ${choice === 2 ? "sold" : "sealed"}: ${got.join(", ")}.` });
  }
}

/** Artifacts an empire holds (for screens). */
export function artifactsOf(state: GameState, e: Empire) {
  return (state.digs?.artifacts[e.id] ?? []).map((id) => ARTIFACT_BY_ID.get(id)!).filter(Boolean);
}
