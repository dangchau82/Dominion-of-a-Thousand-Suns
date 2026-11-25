// Space battles, planetary defense, bombing and invasions.
// Battles resolve automatically at the end of each turn wherever empires at
// war share a star. Same rules for every empire; all dice come from the
// game's seeded RNG, so a save replays exactly.
// Hit chances follow the classic beam formula, adapted from Remnants of the
// Precursors (GPL-3.0).

import { HULLS, type ShipDesign } from "./data/ships";
import { tech } from "./tech";
import { empireBonus, transferWonders } from "./civ";
import { afterBattle, afterCapture, capturedPopulation, damageBonus } from "./abilities";
import { say } from "./dialogue";
import { adjustRelation, breakTreaty, treatiesWith } from "./diplomacy";
import { shipDesign } from "./designs";
import { beamHitChance } from "./formulas";
import { empireRace, newColony, shipCount } from "./game";
import { onCapture } from "./unrest";
import * as R from "./rng";
import { techStats } from "./tech";
import type { Colony, Empire, Fleet, GameState, Id, Star } from "./types";

export const BASE_HP = 25;
export const MAX_ROUNDS = 8;
/** Missiles and torpedoes run out after this many rounds. */
export const MISSILE_ROUNDS = 3;

export function atWar(a: Empire, b: Empire): boolean {
  return a.atWar[b.id] !== undefined;
}

interface Gun {
  kind: "beam" | "missile" | "bomb" | "torpedo";
  min: number;
  max: number;
  count: number;
}

interface Unit {
  side: 0 | 1;
  empireId: Id;
  /** Design id, or "planet". */
  key: string;
  name: string;
  count: number;
  start: number;
  hp: number;
  maxHp: number;
  attack: number;
  beamDef: number;
  missileDef: number;
  shield: number;
  guns: Gun[];
  small: boolean;
  invulnerable: boolean;
  /** Extra damage per hit (Tarkhan). */
  bonusDamage: number;
  /** Fires before everyone else (Tarkhan first strike). */
  first: boolean;
  /** Chance an incoming hit misses anyway (displacement field). */
  dodge: number;
  /** Has a stasis field: freezes one enemy group in the first round. */
  stasis: boolean;
  /** Slows enemy evasion (warp dampener). */
  dampener: boolean;
  /** Frozen this round. */
  frozen: boolean;
}

function guns(d: ShipDesign): Gun[] {
  const out: Gun[] = [];
  for (const w of d.weapons) {
    const t = tech(w.techId);
    for (const fx of t.effects) if (fx.stat === "weapon") out.push({ kind: fx.kind, min: fx.min, max: fx.max, count: w.count });
  }
  return out;
}

function levelOf(id: string | null, stat: string): number {
  if (!id) return 0;
  for (const fx of tech(id).effects) if (fx.stat === stat && "value" in fx) return fx.value;
  return 0;
}

function shipUnit(state: GameState, side: 0 | 1, e: Empire, d: ShipDesign, count: number): Unit {
  const r = empireRace(e);
  const h = HULLS[d.hull];
  const armor = levelOf(d.armor, "armor");
  const maxHp = d.role === "warship" ? h.hits * (1 + 0.5 * Math.max(0, armor - 1)) : d.role === "transport" ? 1 : h.hits;
  const sp = (id: string) => d.specials.includes(id);
  return {
    side, empireId: e.id, key: d.id, name: d.name, count, start: count, hp: maxHp, maxHp,
    attack: levelOf(d.computer, "computer") + r.shipAttack + (d.role === "warship" ? empireBonus(e).attack : 0) + (sp("subspace-interdictor") ? 1 : 0),
    beamDef: h.defense + r.shipDefense + (sp("inertial-dampers") ? 2 : 0) + (sp("cloaking-field") ? 2 : 0),
    missileDef: h.defense + r.shipDefense + levelOf(d.ecm, "ecm") + (sp("cloaking-field") ? 2 : 0) + (sp("repulsor-beam") ? 3 : 0),
    shield: levelOf(d.shield, "shield"),
    guns: guns(d), small: d.hull === "small",
    invulnerable: !!(e.isPlayer && state.cheats?.godMode),
    bonusDamage: damageBonus(e), first: damageBonus(e) > 0, dodge: sp("displacement-field") ? 0.25 : 0,
    stasis: sp("stasis-field"), dampener: sp("warp-dampener"), frozen: false,
  };
}

/** A colony's missile bases fight as one target whose hit points are its bases. */
function planetUnit(state: GameState, side: 0 | 1, e: Empire, c: Colony): Unit | null {
  if (c.missileBases <= 0) return null;
  const ts = techStats(e);
  const best = ts.weapons.map(tech).flatMap((t) => t.effects).filter((fx) => fx.stat === "weapon" && fx.kind === "missile")
    .reduce((m, fx) => (fx.stat === "weapon" && fx.max > m ? fx.max : m), 4);
  return {
    side, empireId: e.id, key: "planet", name: "missile base", count: c.missileBases, start: c.missileBases,
    hp: BASE_HP, maxHp: BASE_HP, attack: ts.computer, beamDef: 0, missileDef: 0, shield: ts.planetShield,
    guns: [{ kind: "missile", min: best, max: best, count: 2 }], small: false,
    invulnerable: !!(e.isPlayer && state.cheats?.godMode),
    bonusDamage: 0, first: false, dodge: 0, stasis: false, dampener: false, frozen: false,
  };
}

function armed(u: Unit): boolean {
  return u.count > 0 && u.guns.some((g) => g.kind !== "bomb");
}

function hitChance(g: Gun, shooter: Unit, target: Unit): number {
  if (g.kind === "beam") return beamHitChance(shooter.attack, 0, target.beamDef, 1);
  // Missiles and torpedoes home in; jammers (ECM) throw them off.
  return Math.min(1, Math.max(0.05, (7 + shooter.attack - target.missileDef) / 10));
}

/** Pick a target, weighted by how many of each enemy are left. Unarmed one-hit ships (troop transports) draw only a quarter of the fire, so they can't act as a shield for a fleet. */
function pickTarget(rng: R.RngState, enemies: Unit[]): Unit | null {
  const live = enemies.filter((u) => u.count > 0);
  const weight = (u: Unit) => u.count * (u.guns.length === 0 && u.maxHp <= 1 ? 0.25 : 1);
  const total = live.reduce((a, u) => a + weight(u), 0);
  if (total <= 0) return null;
  let roll = R.next(rng) * total;
  for (const u of live) {
    roll -= weight(u);
    if (roll < 0) return u;
  }
  return live[live.length - 1]!;
}

function fight(state: GameState, units: Unit[]): number {
  const rng = state.rng;
  let rounds = 0;
  // Warp dampeners slow the other side, making them easier to hit.
  for (const sd of [0, 1] as const) {
    if (units.some((u) => u.side === sd && u.dampener)) for (const u of units) if (u.side !== sd) u.beamDef = Math.max(0, u.beamDef - 1);
  }
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const sideArmed = [0, 1].map((sd) => units.some((u) => u.side === sd && armed(u)));
    const sideAlive = [0, 1].map((sd) => units.some((u) => u.side === sd && u.count > 0));
    if (!sideAlive[0] || !sideAlive[1] || (!sideArmed[0] && !sideArmed[1])) break;
    rounds = round;
    // Stasis fields freeze the biggest enemy group for the first round.
    for (const u of units) u.frozen = false;
    if (round === 1) {
      for (const sd of [0, 1] as const) {
        if (!units.some((u) => u.side === sd && u.stasis && u.count > 0)) continue;
        const target = units.filter((u) => u.side !== sd && u.count > 0 && u.key !== "planet").sort((a, b) => b.count - a.count)[0];
        if (target) target.frozen = true;
      }
    }
    // First strikers, then best computers; small ships before big ones on ties.
    const order = units.filter((u) => u.count > 0)
      .sort((a, b) => Number(b.first) - Number(a.first) || b.attack - a.attack || Number(b.small) - Number(a.small) || a.side - b.side);
    for (const u of order) {
      if (u.count <= 0 || u.frozen) continue;
      for (const g of u.guns) {
        if (g.kind === "bomb") continue;
        if ((g.kind === "missile" || g.kind === "torpedo") && u.key !== "planet" && round > MISSILE_ROUNDS) continue;
        const shots = u.count * g.count;
        for (let s = 0; s < shots; s++) {
          const target = pickTarget(rng, units.filter((x) => x.side !== u.side));
          if (!target) break;
          if (!R.chance(rng, hitChance(g, u, target))) continue;
          if (target.dodge > 0 && R.chance(rng, target.dodge)) continue;
          const raw = R.int(rng, g.min, g.max) + u.bonusDamage;
          // Torpedoes punch through half of the shield.
          const dmg = raw - (g.kind === "torpedo" ? Math.floor(target.shield / 2) : target.shield);
          if (dmg <= 0 || target.invulnerable) continue;
          target.hp -= dmg;
          if (target.hp <= 0) {
            // A ship dies; extra damage is wasted (no overkill), as in the classic game.
            target.count--;
            target.hp = target.maxHp;
          }
        }
      }
    }
  }
  return rounds;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function lossText(units: Unit[], side: 0 | 1): string {
  const parts = units.filter((u) => u.side === side && u.start > u.count).map((u) => plural(u.start - u.count, u.name));
  return parts.length ? parts.join(", ") : "nothing";
}

/** Take losses off the fleets at a star. */
function applyLosses(state: GameState, fleets: Fleet[], units: Unit[]): void {
  for (const u of units) {
    if (u.key === "planet") continue;
    let lost = u.start - u.count;
    for (const f of fleets) {
      if (lost <= 0) break;
      if (f.empireId !== u.empireId) continue;
      const have = f.ships[u.key] ?? 0;
      const take = Math.min(have, lost);
      if (take > 0) { f.ships[u.key] = have - take; lost -= take; }
    }
  }
}

function battle(state: GameState, s: Star, a: Empire, b: Empire): void {
  const here = state.fleets.filter((f) => f.starId === s.id && (f.empireId === a.id || f.empireId === b.id));
  const colony = state.colonies[s.id];
  const units: Unit[] = [];
  for (const [side, e] of [[0, a], [1, b]] as const) {
    const counts = new Map<string, number>();
    for (const f of here) {
      if (f.empireId !== e.id) continue;
      for (const [id, n] of Object.entries(f.ships)) if (n > 0) counts.set(id, (counts.get(id) ?? 0) + n);
    }
    for (const [id, n] of [...counts].sort((x, y) => x[0].localeCompare(y[0]))) {
      units.push(shipUnit(state, side, e, shipDesign(state, id), n));
    }
    if (colony && colony.empireId === e.id) {
      const p = planetUnit(state, side, e, colony);
      if (p) units.push(p);
    }
  }
  if (!units.some(armed)) return; // nobody here can shoot
  if (!units.some((u) => u.side === 0) || !units.some((u) => u.side === 1)) return;

  const rounds = fight(state, units);
  applyLosses(state, here, units);
  // Race abilities after the battle (Ashkari spoils, Raxxan salvage).
  const lossValue = (sd: 0 | 1) => units.filter((u) => u.side === sd && u.key !== "planet")
    .reduce((acc, u) => acc + (u.start - u.count) * shipDesign(state, u.key).cost, 0);
  for (const [me, them, theirSide] of [[a, b, 1], [b, a, 0]] as const) {
    const note = afterBattle(state, me, them, lossValue(theirSide));
    if (note) state.events.push({ turn: state.turn, empireId: me.id, kind: "battle", starId: s.id, text: note });
  }
  const planet = units.find((u) => u.key === "planet");
  if (colony && planet) colony.missileBases = planet.count;

  for (const [me, them, mine, theirs] of [[a, b, 0, 1], [b, a, 1, 0]] as const) {
    state.events.push({
      turn: state.turn, empireId: me.id, kind: "battle", starId: s.id,
      text: `Battle at ${s.name} against the ${them.name} (${plural(rounds, "round")}). You lost ${lossText(units, mine)}; they lost ${lossText(units, theirs)}.`,
    });
  }
}

/** Fleets with bombs pound an enemy colony once its defenders are gone. */
function bomb(state: GameState, s: Star, c: Colony, attacker: Empire, owner: Empire): void {
  const fleets = state.fleets.filter((f) => f.starId === s.id && f.empireId === attacker.id);
  const shield = techStats(owner).planetShield;
  let dmg = 0;
  for (const f of fleets) {
    for (const [id, n] of Object.entries(f.ships)) {
      if (n <= 0) continue;
      for (const g of guns(shipDesign(state, id))) {
        if (g.kind !== "bomb") continue;
        for (let i = 0; i < n * g.count; i++) dmg += Math.max(0, R.int(state.rng, g.min, g.max) - shield);
      }
    }
  }
  if (dmg <= 0) return;
  const popLost = Math.min(c.population, dmg / 10);
  const facLost = Math.min(c.factories, dmg / 5);
  c.population -= popLost;
  c.factories -= facLost;
  const text = `${s.name} bombed: ${popLost.toFixed(1)} population and ${Math.round(facLost)} factories destroyed.`;
  state.events.push({ turn: state.turn, empireId: attacker.id, kind: "battle", starId: s.id, text });
  state.events.push({ turn: state.turn, empireId: owner.id, kind: "battle", starId: s.id, text });
  if (c.population < 0.5) {
    delete state.colonies[s.id];
    transferWonders(state, s.id, null);
    const t2 = `The colony on ${s.name} has been wiped out.`;
    state.events.push({ turn: state.turn, empireId: attacker.id, kind: "battle", starId: s.id, text: t2 });
    state.events.push({ turn: state.turn, empireId: owner.id, kind: "battle", starId: s.id, text: t2 });
    if (owner.capitalStarId === s.id) moveCapital(state, owner);
  }
}

function moveCapital(state: GameState, e: Empire): void {
  const mine = Object.values(state.colonies).filter((c) => c.empireId === e.id).sort((x, y) => y.population - x.population || x.starId - y.starId);
  const next = mine[0];
  if (!next) return;
  next.isCapital = true;
  e.capitalStarId = next.starId;
}

/** Ground combat: one-on-one duels until one side is gone. Defenders get a small edge. */
function invade(state: GameState, s: Star, f: Fleet, attacker: Empire): void {
  const c = state.colonies[s.id];
  const troops = f.ships.transport ?? 0;
  if (!c || troops <= 0) return;
  const owner = state.empires[c.empireId]!;
  const atkBonus = empireRace(attacker).ground * 10 + (techStats(attacker).specials.includes("personal-shields") ? 10 : 0);
  const defBonus = empireRace(owner).ground * 10 + (techStats(owner).specials.includes("personal-shields") ? 10 : 0) + 5;
  let att = troops;
  let def = Math.max(1, Math.round(c.population));
  while (att > 0 && def > 0) {
    if (R.next(state.rng) * 100 + atkBonus > R.next(state.rng) * 100 + defBonus) def--;
    else att--;
  }
  f.ships.transport = 0;
  if (att > 0) {
    const old = c;
    const cap = s.planet ? s.planet.size + s.planet.terraform + techStats(attacker).terraform : att;
    const captured = newColony(s.id, attacker.id, Math.min(capturedPopulation(attacker, att, old.population), cap), old.foundedTurn);
    captured.factories = old.factories;
    captured.buildings = [...old.buildings];
    onCapture(state, captured, old, owner, attacker);
    transferWonders(state, s.id, attacker);
    state.colonies[s.id] = captured;
    const text = `The ${attacker.name} captured ${s.name} with ${plural(att, "surviving troop")}.`;
    state.events.push({ turn: state.turn, empireId: attacker.id, kind: "invasion", starId: s.id, text });
    state.events.push({ turn: state.turn, empireId: owner.id, kind: "invasion", starId: s.id, text });
    const note = afterCapture(state, attacker, owner);
    if (note) state.events.push({ turn: state.turn, empireId: attacker.id, kind: "invasion", starId: s.id, text: note });
    if (owner.capitalStarId === s.id) moveCapital(state, owner);
  } else {
    c.population = Math.max(0.5, def);
    const text = `Invasion of ${s.name} by the ${attacker.name} was thrown back (${plural(troops, "troop")} lost).`;
    state.events.push({ turn: state.turn, empireId: attacker.id, kind: "invasion", starId: s.id, text });
    state.events.push({ turn: state.turn, empireId: owner.id, kind: "invasion", starId: s.id, text });
  }
}

/** Run every battle, bombing and invasion for this turn. Called after fleets move. */
export function resolveCombat(state: GameState): void {
  const stars = [...new Set(state.fleets.filter((f) => f.starId !== null).map((f) => f.starId as Id))].sort((x, y) => x - y);
  for (const sid of stars) {
    const s = state.stars[sid]!;
    const ids = new Set(state.fleets.filter((f) => f.starId === sid).map((f) => f.empireId));
    const colony = state.colonies[sid];
    if (colony) ids.add(colony.empireId);
    const list = [...ids].sort((x, y) => x - y).map((id) => state.empires[id]!);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (atWar(list[i]!, list[j]!)) battle(state, s, list[i]!, list[j]!);
      }
    }
    state.fleets = state.fleets.filter((f) => shipCount(f) > 0);

    // Transports: reinforce your own colony, or invade an enemy one once its defenders are gone.
    for (const f of state.fleets.filter((x) => x.starId === sid && (x.ships.transport ?? 0) > 0)) {
      const c = state.colonies[sid];
      const e = state.empires[f.empireId]!;
      if (!c) continue;
      if (c.empireId === e.id) {
        const cap = s.planet ? s.planet.size + s.planet.terraform + techStats(e).terraform : 0;
        c.population = Math.min(cap, c.population + (f.ships.transport ?? 0));
        f.ships.transport = 0;
        continue;
      }
      const owner = state.empires[c.empireId]!;
      if (!atWar(e, owner)) continue;
      const defended = c.missileBases > 0 || state.fleets.some((x) => x.starId === sid && x.empireId === owner.id &&
        Object.entries(x.ships).some(([id, n]) => n > 0 && shipDesign(state, id).weapons.length > 0));
      if (defended) continue; // wait in orbit until the defenders are beaten
      invade(state, s, f, e);
    }

    // Bombing
    const c = state.colonies[sid];
    if (c && c.missileBases === 0) {
      const owner = state.empires[c.empireId]!;
      const attackers = [...new Set(state.fleets.filter((f) => f.starId === sid).map((f) => f.empireId))]
        .map((id) => state.empires[id]!).filter((e) => atWar(e, owner));
      for (const e of attackers) if (state.colonies[sid]) bomb(state, s, state.colonies[sid]!, e, owner);
    }
    state.fleets = state.fleets.filter((f) => shipCount(f) > 0);
  }
}

/** Planet Cracker: destroy an undefended enemy world outright. Every empire is horrified. */
export function crackPlanet(state: GameState, e: Empire, f: Fleet): string | null {
  if (f.empireId !== e.id || f.starId === null) return "The fleet must be in orbit";
  const hasCracker = Object.entries(f.ships).some(([id, n]) => n > 0 && shipDesign(state, id).specials.includes("planet-cracker"));
  if (!hasCracker) return "No ship here carries a Planet Cracker";
  const s = state.stars[f.starId]!;
  const c = state.colonies[s.id];
  if (!c || c.empireId === e.id) return "No enemy colony here";
  const owner = state.empires[c.empireId]!;
  if (!atWar(e, owner)) return "You are not at war with them";
  if (c.missileBases > 0) return "Destroy its missile bases first";
  delete state.colonies[s.id];
  transferWonders(state, s.id, null);
  s.planet = null;
  if (owner.capitalStarId === s.id) moveCapital(state, owner);
  for (const o of state.empires) if (o.id !== e.id && o.alive) adjustRelation(o, e, -40);
  state.events.push({ turn: state.turn, empireId: null, kind: "battle", starId: s.id, text: `The ${e.name} cracked the planet ${s.name} into rubble! The galaxy is horrified.` });
  return null;
}

export function declareWar(state: GameState, a: Empire, b: Empire): void {
  // Breaking a pact to attack is remembered by the victim.
  for (const k of treatiesWith(a, b)) breakTreaty(state, a, b, k);
  adjustRelation(b, a, -30);
  a.atWar[b.id] = state.turn;
  b.atWar[a.id] = state.turn;
  if (!a.isPlayer) state.events.push({ turn: state.turn, empireId: b.id, kind: "war", text: say(state.turn, a, "declareWar", b) });
  a.peaceOffers = a.peaceOffers.filter((x) => x !== b.id);
  b.peaceOffers = b.peaceOffers.filter((x) => x !== a.id);
  state.events.push({ turn: state.turn, empireId: null, kind: "war", text: `The ${a.name} declared war on the ${b.name}!` });
}

/** Offer peace; if they already offered, the war ends now. Returns true if peace was made. */
export function offerPeace(state: GameState, a: Empire, b: Empire): boolean {
  if (a.peaceOffers.includes(b.id)) {
    delete a.atWar[b.id];
    delete b.atWar[a.id];
    a.peaceOffers = a.peaceOffers.filter((x) => x !== b.id);
    b.peaceOffers = b.peaceOffers.filter((x) => x !== a.id);
    state.events.push({ turn: state.turn, empireId: null, kind: "war", text: `The ${a.name} and the ${b.name} have made peace.` });
    return true;
  }
  if (!b.peaceOffers.includes(a.id)) b.peaceOffers.push(a.id);
  state.events.push({ turn: state.turn, empireId: b.id, kind: "war", text: `The ${a.name} offer peace.${!a.isPlayer ? ` ${say(state.turn, a, "offerPeace", b)}` : ""}` });
  return false;
}
