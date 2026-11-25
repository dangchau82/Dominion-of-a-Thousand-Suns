// Relations, treaties, proposals, gifts and espionage.
// The same rules for every empire. AI empires answer proposals from their
// own EmpireView through the same "respond" command the player uses.

import { race } from "./data/races";
import { SPY_MISSION_TEXTS } from "./data/unrest";
import { say } from "./dialogue";
import { empireBonus } from "./civ";
import { tradeMultiplier } from "./abilities";
import { colonyProduction, distance } from "./formulas";
import { empireRace } from "./game";
import * as R from "./rng";
import { fieldTier, learn, tech } from "./tech";
import {
  TREATIES, type Empire, type GameState, type Id, type Proposal, type ProposalKind, type SpyMission, type TreatyKind,
} from "./types";

export const MAX_AGENTS = 10;
export const AGENT_COST = 50;
export const MAX_SPENDING = 30;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function event(state: GameState, empireId: Id | null, kind: "diplomacy" | "spy" | "war", text: string, starId?: Id): void {
  state.events.push({ turn: state.turn, empireId, kind, text, ...(starId !== undefined ? { starId } : {}) });
}

export const TREATY_NAMES: Record<TreatyKind, string> = {
  trade: "trade agreement", research: "research pact", nap: "non-aggression pact", alliance: "alliance",
};
export const PROPOSAL_NAMES: Record<ProposalKind, string> = {
  trade: "trade agreement", research: "research pact", nap: "non-aggression pact", alliance: "alliance",
  techSwap: "technology exchange", tribute: "demand for tribute", joinWar: "call to war",
};

export function relation(a: Empire, b: Empire): number {
  return a.relations[b.id] ?? 0;
}

export function adjustRelation(a: Empire, b: Empire, delta: number): void {
  a.relations[b.id] = clamp(relation(a, b) + delta, -100, 100);
}

export function hasTreaty(a: Empire, b: Empire, k: TreatyKind): boolean {
  return a.treaties[b.id]?.[k] !== undefined;
}

export function treatiesWith(a: Empire, b: Empire): TreatyKind[] {
  return TREATIES.filter((k) => hasTreaty(a, b, k));
}

function sign(state: GameState, a: Empire, b: Empire, k: TreatyKind): void {
  (a.treaties[b.id] ??= {})[k] = state.turn;
  (b.treaties[a.id] ??= {})[k] = state.turn;
  adjustRelation(a, b, 5);
  adjustRelation(b, a, 5);
  event(state, null, "diplomacy", `The ${a.name} and the ${b.name} signed ${k === "alliance" ? "an" : "a"} ${TREATY_NAMES[k]}.`);
}

export function breakTreaty(state: GameState, a: Empire, b: Empire, k: TreatyKind): void {
  if (!hasTreaty(a, b, k)) return;
  delete a.treaties[b.id]![k];
  delete b.treaties[a.id]![k];
  adjustRelation(b, a, k === "alliance" ? -35 : k === "nap" ? -25 : -10);
  event(state, null, "diplomacy", `The ${a.name} broke their ${TREATY_NAMES[k]} with the ${b.name}.`);
}

/** Total production of an empire's colonies, before any spending. */
export function grossProduction(state: GameState, e: Empire): number {
  let total = 0;
  for (const c of Object.values(state.colonies)) {
    if (c.empireId !== e.id) continue;
    const s = state.stars[c.starId]!;
    if (s.planet) total += colonyProduction(c, s.planet, e, empireRace(e));
  }
  return total;
}

/** Share of production that goes to spies and security before colonies get theirs. */
export function spendingShare(e: Empire): number {
  const spies = Object.values(e.spies).reduce((a, n) => a + n.alloc, 0);
  return clamp(e.security + spies, 0, MAX_SPENDING) / 100;
}

/** Techs `from` knows that `to` doesn't (what could be traded, given or stolen). */
export function tradeableTechs(from: Empire, to: Empire): string[] {
  return from.research.known.filter((id) => !to.research.known.includes(id));
}

export function researchPactBonus(e: Empire): number {
  return Math.min(0.2, Object.values(e.treaties).filter((t) => t.research !== undefined).length * 0.05);
}

// ---------- proposals ----------

export type ProposalInput = Omit<Proposal, "id" | "from" | "to" | "turn" | "says">;

export function checkProposal(state: GameState, from: Empire, to: Empire, p: ProposalInput): string | null {
  if (from.id === to.id || !to.alive) return "No such empire";
  if (!from.contacts.includes(to.id)) return "You haven't met them";
  if (state.proposals.some((x) => x.from === from.id && x.to === to.id && x.kind === p.kind)) return "Already proposed; wait for their answer";
  const war = from.atWar[to.id] !== undefined;
  switch (p.kind) {
    case "trade": case "research": case "nap": case "alliance":
      if (war) return "Make peace first";
      if (hasTreaty(from, to, p.kind)) return "You already have that treaty";
      return null;
    case "techSwap":
      if (war) return "Make peace first";
      if (!p.offerTech || !tradeableTechs(from, to).includes(p.offerTech)) return "They already know that, or you don't";
      if (!p.wantTech || !tradeableTechs(to, from).includes(p.wantTech)) return "Pick a tech they know and you don't";
      return null;
    case "tribute":
      if (!p.wantTech && !(p.bc && p.bc > 0)) return "Ask for something";
      if (p.wantTech && !tradeableTechs(to, from).includes(p.wantTech)) return "They don't have that";
      return null;
    case "joinWar": {
      const t = p.targetId !== undefined ? state.empires[p.targetId] : undefined;
      if (!t || from.atWar[t.id] === undefined) return "You aren't at war with them";
      if (to.atWar[t.id] !== undefined) return "They are already at war with them";
      if (!to.contacts.includes(t.id)) return "They haven't met that empire";
      return null;
    }
  }
}

export function makeProposal(state: GameState, from: Empire, to: Empire, p: ProposalInput): Proposal {
  const prop: Proposal = { ...p, id: state.nextProposalId++, from: from.id, to: to.id, turn: state.turn };
  if (!from.isPlayer) {
    const sit = p.kind === "tribute" ? "demandTribute" : p.kind === "joinWar" || p.kind === "alliance" ? "allyRequest" : "tradeOffer";
    prop.says = say(state.turn, from, sit, to, { tech: p.wantTech ? tech(p.wantTech).name : undefined });
  }
  state.proposals.push(prop);
  return prop;
}

export function describeProposal(state: GameState, p: Proposal): string {
  const from = state.empires[p.from]!;
  switch (p.kind) {
    case "techSwap": return `The ${from.name} offer ${tech(p.offerTech!).name} in exchange for your ${tech(p.wantTech!).name}.`;
    case "tribute": return `The ${from.name} demand ${p.wantTech ? tech(p.wantTech).name : `${p.bc} BC`} as tribute.`;
    case "joinWar": return `The ${from.name} ask you to declare war on the ${state.empires[p.targetId!]!.name}.`;
    default: return `The ${from.name} propose a ${TREATY_NAMES[p.kind]}.`;
  }
}

/** Accept or refuse. Returns an error, or null. */
export function answerProposal(state: GameState, responder: Empire, p: Proposal, accept: boolean, declareWar: (a: Empire, b: Empire) => void): string | null {
  const from = state.empires[p.from]!;
  state.proposals = state.proposals.filter((x) => x.id !== p.id);
  if (accept) {
    // Re-check: things may have changed since it was made.
    if (p.kind === "tribute" && p.bc && responder.treasury < p.bc) return "Not enough BC in the treasury";
    if (p.kind !== "tribute" && checkProposalStillValid(state, from, responder, p)) return "That offer is no longer possible";
    switch (p.kind) {
      case "trade": case "research": case "nap": case "alliance": sign(state, from, responder, p.kind); break;
      case "techSwap":
        learn(responder.research, p.offerTech!);
        learn(from.research, p.wantTech!);
        adjustRelation(responder, from, 5);
        adjustRelation(from, responder, 5);
        event(state, from.id, "diplomacy", `You received ${tech(p.wantTech!).name} from the ${responder.name} for ${tech(p.offerTech!).name}.`);
        event(state, responder.id, "diplomacy", `You received ${tech(p.offerTech!).name} from the ${from.name} for ${tech(p.wantTech!).name}.`);
        break;
      case "tribute":
        if (p.wantTech) learn(from.research, p.wantTech);
        if (p.bc) { responder.treasury -= p.bc; from.treasury += p.bc; }
        adjustRelation(responder, from, -5);
        adjustRelation(from, responder, 10);
        event(state, from.id, "diplomacy", `The ${responder.name} paid your tribute.`);
        break;
      case "joinWar": {
        const t = state.empires[p.targetId!]!;
        if (responder.atWar[t.id] === undefined) declareWar(responder, t);
        adjustRelation(from, responder, 15);
        break;
      }
    }
  } else {
    adjustRelation(from, responder, p.kind === "tribute" ? -15 : p.kind === "joinWar" ? -8 : -3);
  }
  // Tell the proposer, in the responder's own words if it's an alien leader.
  const verdict = `The ${responder.name} ${accept ? "accepted" : "refused"} your ${PROPOSAL_NAMES[p.kind]}.`;
  const words = !responder.isPlayer ? ` ${say(state.turn, responder, accept ? "accept" : p.kind === "tribute" ? "threaten" : "refuse", from)}` : "";
  event(state, from.id, "diplomacy", verdict + words);
  return null;
}

function checkProposalStillValid(state: GameState, from: Empire, to: Empire, p: Proposal): string | null {
  // Temporarily lift the "already proposed" rule for this check.
  const saved = state.proposals;
  state.proposals = [];
  const err = checkProposal(state, from, to, p);
  state.proposals = saved;
  return err;
}

/** Gifts arrive at once and warm relations. */
/** Goodwill one empire can earn from another's gifts per window (stops buying council votes on voting day). */
export const GIFT_WARMTH_CAP = 20;
export const GIFT_WINDOW = 10;

export function giveGift(state: GameState, from: Empire, to: Empire, bc: number, techId?: string): string | null {
  if (!from.contacts.includes(to.id) || !to.alive) return "You haven't met them";
  if (bc < 0 || bc > from.treasury) return "Not enough BC";
  if (techId && !tradeableTechs(from, to).includes(techId)) return "They already know that";
  if (bc <= 0 && !techId) return "Give something";
  from.treasury -= bc;
  to.treasury += bc;
  if (techId) learn(to.research, techId);
  // Gifts can't buy love in bulk: at most GIFT_WARMTH_CAP goodwill from one giver per GIFT_WINDOW turns.
  const log = (to.giftWarmth ??= {});
  const w = log[from.id] && state.turn - log[from.id]!.since < GIFT_WINDOW ? log[from.id]! : { since: state.turn, used: 0 };
  const warmth = Math.min(GIFT_WARMTH_CAP - w.used, bc / 10 + (techId ? tech(techId).tier * 3 : 0));
  w.used += Math.max(0, warmth);
  log[from.id] = w;
  if (warmth > 0) adjustRelation(to, from, warmth);
  event(state, to.id, "diplomacy", `The ${from.name} sent a gift: ${[bc > 0 ? `${Math.round(bc)} BC` : "", techId ? tech(techId).name : ""].filter(Boolean).join(" and ")}.`);
  if (!from.isPlayer && from.atWar[to.id] !== undefined) {
    event(state, to.id, "diplomacy", say(state.turn, from, "surrender", to));
  } else if (!to.isPlayer) {
    event(state, from.id, "diplomacy", say(state.turn, to, "praise", from));
  }
  return null;
}

// ---------- each turn ----------

/** Relations drift toward what the situation suggests; one-off events (gifts, spies) fade. */
export function updateRelations(state: GameState): void {
  const colonies = Object.values(state.colonies);
  for (const a of state.empires) {
    if (!a.alive) continue;
    for (const bid of a.contacts) {
      const b = state.empires[bid]!;
      if (!b.alive) continue;
      let base = race(b.raceId).diplomacy * 8 + empireBonus(b).relations + treatiesWith(a, b).length * 10;
      if (a.atWar[b.id] !== undefined) base -= 50;
      let friction = 0;
      for (const ca of colonies) {
        if (ca.empireId !== a.id) continue;
        const sa = state.stars[ca.starId]!;
        for (const cb of colonies) {
          if (cb.empireId !== b.id) continue;
          const sb = state.stars[cb.starId]!;
          if (distance(sa.x, sa.y, sb.x, sb.y) < 4) friction++;
        }
      }
      base -= Math.min(6, friction) * 5;
      if (Object.keys(a.atWar).some((id) => b.atWar[Number(id)] !== undefined)) base += 15;
      a.relations[b.id] = clamp(relation(a, b) + (base - relation(a, b)) * 0.05, -100, 100);
    }
  }
}

// Written by Gemini (coding test, 2026-11-25), checked by Claude.
/** AI empires warn neighbors with colonies within 4 ly, at most once every 30 turns per pair. */
export function borderWarnings(state: GameState): void {
  const byEmpire = new Map<Id, { id: Id; name: string; x: number; y: number }[]>();
  for (const c of Object.values(state.colonies)) {
    const s = state.stars[c.starId]!;
    let list = byEmpire.get(c.empireId);
    if (!list) {
      list = [];
      byEmpire.set(c.empireId, list);
    }
    list.push(s);
  }

  for (const a of state.empires) {
    if (!a.alive || a.isPlayer) continue;
    const colsA = byEmpire.get(a.id);
    if (!colsA?.length) continue;
    for (const bid of a.contacts) {
      const b = state.empires[bid];
      if (!b || !b.alive || a.atWar[b.id] !== undefined) continue;
      const lastWarned = a.borderWarned?.[b.id];
      if (lastWarned !== undefined && state.turn - lastWarned < 30) continue;
      const colsB = byEmpire.get(b.id);
      if (!colsB?.length) continue;

      let closeStar: { id: Id; name: string } | null = null;
      for (const sa of colsA) {
        for (const sb of colsB) {
          if (distance(sa.x, sa.y, sb.x, sb.y) < 4) {
            closeStar = sb;
            break;
          }
        }
        if (closeStar) break;
      }

      if (closeStar) {
        (a.borderWarned ??= {})[b.id] = state.turn;
        adjustRelation(a, b, -3);
        event(state, b.id, "diplomacy", say(state.turn, a, "borderWarning", b, { star: closeStar.name }), closeStar.id);
      }
    }
  }
}

/** Trade agreements pay both sides, growing over the first ten turns. */
export function applyTreaties(state: GameState): void {
  const prod = new Map(state.empires.map((e) => [e.id, e.alive ? grossProduction(state, e) : 0]));
  for (const a of state.empires) {
    if (!a.alive) continue;
    for (const [bid, t] of Object.entries(a.treaties)) {
      if (t.trade === undefined) continue;
      const b = state.empires[Number(bid)]!;
      if (!b.alive) continue;
      const ramp = Math.min(1, (state.turn - t.trade) / 10);
      a.treasury += 0.02 * Math.min(prod.get(a.id)!, prod.get(b.id)!) * ramp * (1 + empireBonus(a).trade) * tradeMultiplier(a);
    }
  }
  // Proposals last until the end of the turn after they were made.
  state.proposals = state.proposals.filter((p) => p.turn >= state.turn);
}

function computersTier(e: Empire): number {
  return fieldTier(e.research, "computers");
}

/** Spies are trained, then each turn they try their mission. Security catches them. */
export function processEspionage(state: GameState): void {
  const rng = state.rng;
  for (const e of state.empires) {
    if (!e.alive) continue;
    const total = grossProduction(state, e);
    for (const [tid, net] of Object.entries(e.spies).sort((a, b) => Number(a[0]) - Number(b[0]))) {
      const t = state.empires[Number(tid)]!;
      if (!t.alive || !e.contacts.includes(t.id)) continue;
      net.progress += (total * net.alloc) / 100;
      while (net.progress >= AGENT_COST && net.agents < MAX_AGENTS) { net.progress -= AGENT_COST; net.agents++; }
      if (net.agents >= MAX_AGENTS) net.progress = Math.min(net.progress, AGENT_COST);
      if (net.agents <= 0) continue;

      const edge = (race(e.raceId).spying + empireBonus(e).spying - race(t.raceId).spying - empireBonus(t).spying) + (computersTier(e) - computersTier(t)) * 0.5;
      const catchChance = clamp(0.03 + t.security * 0.012 - edge * 0.02, 0.01, 0.4);
      let caught = 0;
      for (let i = 0; i < Math.min(net.agents, 3); i++) if (R.chance(rng, catchChance)) caught++;
      if (caught > 0) {
        net.agents -= caught;
        adjustRelation(t, e, -5);
        event(state, e.id, "spy", `${caught} of our agents in the ${t.name} ${caught > 1 ? "were" : "was"} caught.${!t.isPlayer ? ` ${say(state.turn, t, "spyCaught", e)}` : ""}`);
        event(state, t.id, "spy", `Security caught ${caught} ${e.name} spy${caught > 1 ? "s" : ""}.`);
      }
      if (net.agents <= 0) continue;

      watch(state, e, t);
      const success = clamp((0.08 + edge * 0.04 - t.security * 0.01) * Math.min(3, net.agents) / 1.5, 0.02, 0.6);
      if (net.mission === "watch" || !R.chance(rng, success)) continue;
      if (net.mission === "steal") {
        const options = tradeableTechs(t, e);
        if (!options.length) continue;
        const id = R.pick(rng, options.sort());
        learn(e.research, id);
        event(state, e.id, "spy", `Our agents stole ${tech(id).name} from the ${t.name}!`);
        event(state, t.id, "spy", `Spies stole our ${tech(id).name}${R.chance(rng, 0.5) ? ` (the trail leads to the ${e.name})` : ""}.`);
      } else if (net.mission === "inciteUnrest" || net.mission === "fundRebels" || net.mission === "spreadPropaganda") {
        unrestMission(state, e, t, net.mission);
      } else {
        const targets = Object.values(state.colonies).filter((c) => c.empireId === t.id).sort((a, b) => a.starId - b.starId);
        if (!targets.length) continue;
        const c = R.pick(rng, targets);
        const s = state.stars[c.starId]!;
        if (c.missileBases > 0 && R.chance(rng, 0.5)) {
          c.missileBases--;
          event(state, e.id, "spy", `Our saboteurs destroyed a missile base on ${s.name}.`, s.id);
          event(state, t.id, "spy", `Saboteurs destroyed a missile base on ${s.name}.`, s.id);
        } else {
          const lost = Math.min(c.factories, R.int(rng, 5, 20));
          c.factories -= lost;
          event(state, e.id, "spy", `Our saboteurs wrecked ${lost} factories on ${s.name}.`, s.id);
          event(state, t.id, "spy", `Saboteurs wrecked ${lost} factories on ${s.name}.`, s.id);
        }
      }
    }
  }
}

const MISSION_TEXT = new Map(SPY_MISSION_TEXTS.map((m) => [m.mission, m]));

/** Spy missions that stir up unrest (texts by Gemini, data/unrest.ts). */
function unrestMission(state: GameState, e: Empire, t: Empire, mission: "inciteUnrest" | "fundRebels" | "spreadPropaganda"): void {
  const targets = Object.values(state.colonies).filter((c) => c.empireId === t.id && !c.isCapital).sort((a, b) => a.starId - b.starId);
  const text = MISSION_TEXT.get(mission)!;
  let c = targets.length ? R.pick(state.rng, targets) : state.colonies[t.capitalStarId];
  if (mission === "fundRebels" && targets.length) {
    // Rebels are funded where they are angriest.
    c = [...targets].sort((a, b) => (b.unrest ?? 0) - (a.unrest ?? 0) || a.starId - b.starId)[0]!;
  }
  if (!c) return;
  const s = state.stars[c.starId]!;
  if (mission === "inciteUnrest") c.agitation = (c.agitation ?? 0) + 30;
  else if (mission === "fundRebels") {
    c.agitation = (c.agitation ?? 0) + 15;
    c.rebelsFundedUntil = state.turn + 10;
  } else {
    const loss = Math.min(t.culture * 0.01, 300);
    t.culture -= loss;
    e.culture += loss / 2;
    for (const x of targets) x.agitation = (x.agitation ?? 0) + 5;
  }
  const fill = (str: string) => str.replace(/\{colony\}/g, s.name).replace(/\{rival\}/g, t.name);
  event(state, e.id, "spy", fill(text.success), s.id);
  event(state, t.id, "spy", fill(text.victimNotice) + (R.chance(state.rng, 0.5) ? ` The trail leads to the ${e.name}.` : ""), s.id);
}

/** Agents report on the target's colonies. */
function watch(state: GameState, e: Empire, t: Empire): void {
  for (const c of Object.values(state.colonies)) {
    if (c.empireId !== t.id) continue;
    const s = state.stars[c.starId]!;
    e.knowledge[s.id] = { explored: true, lastSeen: state.turn, planet: s.planet ? { ...s.planet } : null, ownerId: t.id, population: Math.round(c.population) };
  }
}

export function setSpies(e: Empire, targetId: Id, alloc: number, mission: SpyMission): void {
  const net = (e.spies[targetId] ??= { alloc: 0, mission: "watch", progress: 0, agents: 0 });
  net.alloc = clamp(Math.round(alloc), 0, 10);
  net.mission = mission;
}
