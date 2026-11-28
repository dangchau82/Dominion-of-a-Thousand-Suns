// Space battles, planetary defense, bombing and invasions.
// Battles resolve automatically at the end of each turn wherever empires at
// war share a star. Same rules for every empire; all dice come from the
// game's seeded RNG, so a save replays exactly.
// Hit chances follow the classic beam formula, adapted from Remnants of the
// Precursors (GPL-3.0).

import { HULLS, type ShipDesign } from "./data/ships";
import { tech } from "./tech";
import { empireBonus, transferWonders } from "./civ";
import { edictShare, EDICT_DEFENSE_POINTS } from "./decrees";
import { afterBattle, afterCapture, capturedPopulation, damageBonus } from "./abilities";
import { say, sayMoment } from "./dialogue";
import { adjustRelation, breakTreaty, treatiesWith } from "./diplomacy";
import { bestBeam, fighterStats, fightersPerShip, shipDesign } from "./designs";
import { beamHitChance } from "./formulas";
import { empireRace, newColony, shipCount } from "./game";
import { onCapture } from "./unrest";
import { addGrudge, GRUDGE } from "./grudges";
import * as R from "./rng";
import { techStats } from "./tech";
import type { Colony, Empire, Fleet, GameState, Id, Star } from "./types";
import { ambushing } from "./gates";

import { BattleRecorder } from "./battleLog";
import { noteBattle, veteranEdge } from "./battleStories";
import { heroEdge, heroGround } from "./heroes";
import { coalitionEdge } from "./coalition";

/** Told about each shot (battle recordings). */
export type ShotListener = (round: number, shooter: Unit, target: Unit, kind: string, result: "miss" | "intercepted" | "dodged" | "blocked" | "hit" | "kill", damage: number) => void;

export const BASE_HP = 25;
/** Carrier tuning (see tools/carrier-duel.test.ts): fighters' share of incoming fire vs ships (1 = at most half), and their toughness. */
export const FIGHTER_TUNING = { screen: 0.5, hitsMul: 1, interceptMul: 3 };
export const MAX_ROUNDS = 8;
/** Missiles and torpedoes run out after this many rounds. */
export const MISSILE_ROUNDS = 3;

// Unit, shipUnit, fighterUnit, planetUnit, armed, fight, lossText and applyLosses are exported so
// neutral lairs and raiders (lairs.ts, raiders.ts, Claude 2) fight with exactly these rules.
export function atWar(a: Empire, b: Empire): boolean {
  return a.atWar[b.id] !== undefined;
}

export interface Gun {
  kind: "beam" | "missile" | "bomb" | "torpedo";
  /** Weapon family (rail, ion, cannon, stinger, plasma, lance): extra battle rules, see fight(). */
  family?: string;
  min: number;
  max: number;
  count: number;
}

export interface Unit {
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
  /** Fighters launched by carriers: lost fighters are rebuilt free after the battle, so they never count as losses. */
  fighter?: boolean;
  /** Fighters only: chance each one shoots down an incoming missile per round. */
  intercept?: number;
  /** Cloaking field: can't be targeted in the first round unless the enemy has hyperspace sensors, and fires first in round 1. */
  cloaked?: boolean;
  /** This side's empire sees cloaked ships (hyperspace sensors). */
  seesCloak?: boolean;
  /** Juggernaut class: double damage against planets, -1 attack against ships. */
  siege?: boolean;
}

function guns(d: ShipDesign): Gun[] {
  const out: Gun[] = [];
  for (const w of d.weapons) {
    const t = tech(w.techId);
    for (const fx of t.effects) if (fx.stat === "weapon") out.push({ kind: fx.kind, min: fx.min, max: fx.max, count: w.count, ...(fx.family ? { family: fx.family } : {}) });
  }
  return out;
}

function levelOf(id: string | null, stat: string): number {
  if (!id) return 0;
  for (const fx of tech(id).effects) if (fx.stat === stat && "value" in fx) return fx.value;
  return 0;
}

/** Race traits for capital ships. Kethrak Mother Queen: a Kethrak Titan pours out a brood swarm, 30 stingers every round. */
function titanTrait(e: Empire, d: ShipDesign, g: Gun[]): Gun[] {
  if (e.raceId === "kethrak" && (d.hull === "titan" || d.hull === "colossus") && d.role === "warship")
    return [...g, { kind: "missile", family: "stinger", min: 3, max: 4, count: d.hull === "colossus" ? 150 : 30 }];
  return g;
}

export function shipUnit(state: GameState, side: 0 | 1, e: Empire, d: ShipDesign, count: number): Unit {
  const r = empireRace(e);
  const h = HULLS[d.hull];
  const armor = levelOf(d.armor, "armor");
  const maxHp = (d.role === "warship" ? h.hits * (1 + 0.5 * Math.max(0, armor - 1)) : d.role === "transport" ? 1 : h.hits) * (d.shipClass === "battlecruiser" ? 0.75 : 1);
  const sp = (id: string) => d.specials.includes(id);
  return {
    side, empireId: e.id, key: d.id, name: d.name, count, start: count, hp: maxHp, maxHp,
    attack: levelOf(d.computer, "computer") + r.shipAttack + (d.role === "warship" ? empireBonus(e).attack : 0) + (sp("subspace-interdictor") ? 1 : 0),
    beamDef: h.defense + r.shipDefense + (sp("inertial-dampers") ? 2 : 0) + (sp("cloaking-field") ? 1 : 0),
    missileDef: h.defense + r.shipDefense + levelOf(d.ecm, "ecm") + (sp("cloaking-field") ? 1 : 0) + (sp("repulsor-beam") ? 3 : 0),
    shield: levelOf(d.shield, "shield"),
    guns: titanTrait(e, d, guns(d)), small: d.hull === "small",
    invulnerable: !!(e.isPlayer && state.cheats?.godMode),
    bonusDamage: damageBonus(e), first: damageBonus(e) > 0 || d.shipClass === "battlecruiser", dodge: sp("displacement-field") ? 0.25 : 0,
    stasis: sp("stasis-field"), dampener: sp("warp-dampener"), frozen: false,
    cloaked: sp("cloaking-field"), seesCloak: e.research.known.includes("hyperspace-sensors"),
    ...(d.shipClass === "juggernaut" ? { siege: true } : {}),
  };
}

/** The fighters a group of carriers launches, as one unit. */
export function fighterUnit(state: GameState, side: 0 | 1, e: Empire, d: ShipDesign, carriers: Unit): Unit | null {
  const per = fightersPerShip(d.bays, d.hull);
  if (!d.bays || per <= 0) return null;
  const f = fighterStats(d.bays.bayId, d.bays.variant, bestBeam(e));
  const r = empireRace(e);
  const count = per * carriers.count;
  return {
    side, empireId: e.id, key: `${d.id}#fighters`, name: `${d.name} ${f.name.toLowerCase()}`, count, start: count,
    hp: f.hits * FIGHTER_TUNING.hitsMul, maxHp: f.hits * FIGHTER_TUNING.hitsMul, attack: carriers.attack,
    // Fighters are small and nimble: one point harder to hit than a small hull.
    beamDef: HULLS.small.defense + 1 + r.shipDefense, missileDef: HULLS.small.defense + 1 + r.shipDefense,
    shield: 0, guns: [{ kind: "beam", min: f.min, max: f.max, count: f.shots }], small: false,
    invulnerable: carriers.invulnerable, bonusDamage: carriers.bonusDamage, first: false, dodge: 0,
    stasis: false, dampener: false, frozen: false, fighter: true, intercept: f.intercept,
  };
}

/** A colony's missile bases fight as one target whose hit points are its bases. */
export function planetUnit(state: GameState, side: 0 | 1, e: Empire, c: Colony): Unit | null {
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

export function armed(u: Unit): boolean {
  return u.count > 0 && u.guns.some((g) => g.kind !== "bomb");
}

function hitChance(g: Gun, shooter0: Unit, target: Unit): number {
  // Juggernauts are built for sieges: a little clumsier against ships.
  const shooter = shooter0.siege && target.key !== "planet" ? { ...shooter0, attack: shooter0.attack - 1 } : shooter0;
  if (g.kind === "beam") return beamHitChance(shooter.attack, 0, target.beamDef, 1);
  // Stingers swarm: small ships and fighters can't dodge a cloud of darts.
  if (g.family === "stinger" && (target.small || target.fighter)) return Math.min(1, Math.max(0.05, (10 + shooter.attack - target.missileDef) / 10));
  // Missiles and torpedoes home in; jammers (ECM) throw them off.
  return Math.min(1, Math.max(0.05, (7 + shooter.attack - target.missileDef) / 10));
}

/** Pick a target, weighted by how many of each enemy are left. Unarmed one-hit ships (troop transports) draw only a quarter of the fire, so they can't act as a shield for a fleet. */
function pickTarget(rng: R.RngState, enemies: Unit[]): Unit | null {
  const live = enemies.filter((u) => u.count > 0);
  const base = (u: Unit) => u.count * (u.guns.length === 0 && u.maxHp <= 1 ? 0.25 : 1);
  // Fighters screen their carriers but draw at most half the fire, however many swarm out.
  const ships = live.reduce((a, u) => a + (u.fighter ? 0 : base(u)), 0);
  const swarm = live.reduce((a, u) => a + (u.fighter ? base(u) : 0), 0);
  const fighterScale = ships > 0 && swarm > ships * FIGHTER_TUNING.screen ? (ships * FIGHTER_TUNING.screen) / swarm : 1;
  const weight = (u: Unit) => base(u) * (u.fighter ? fighterScale : 1);
  const total = live.reduce((a, u) => a + weight(u), 0);
  if (total <= 0) return null;
  let roll = R.next(rng) * total;
  for (const u of live) {
    roll -= weight(u);
    if (roll < 0) return u;
  }
  return live[live.length - 1]!;
}

/** `onShot` (optional) is told about every shot, for battle recordings (battleLog.ts, Claude 2). It never changes the fight. */
export function fight(state: GameState, units: Unit[], onShot?: ShotListener): number {
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
    // Each side's fighters can shoot down this many incoming missiles this round.
    const screen = [0, 1].map((sd) => units.reduce((a, u) => a + (u.side === sd && u.fighter ? u.count * (u.intercept ?? 0) * FIGHTER_TUNING.interceptMul : 0), 0));
    // ...but never more than half of the missiles fired at that side.
    const aimed = [0, 0], stopped = [0, 0];
    // First strikers, then ships before fighters, then best computers; small ships before big ones on ties.
    const order = units.filter((u) => u.count > 0)
      // Fighters launch and close in, so they fire after the ships each round.
      .sort((a, b) => Number(b.first || (round === 1 && !!b.cloaked)) - Number(a.first || (round === 1 && !!a.cloaked)) || Number(!!a.fighter) - Number(!!b.fighter) || b.attack - a.attack || Number(b.small) - Number(a.small) || a.side - b.side);
    for (const u of order) {
      if (u.count <= 0 || u.frozen) continue;
      for (const g of u.guns) {
        if (g.kind === "bomb") continue;
        if ((g.kind === "missile" || g.kind === "torpedo") && g.family !== "stinger" && u.key !== "planet" && round > MISSILE_ROUNDS) continue;
        // A spinal lance recharges: it fires in rounds 1, 3, 5 and 7.
        if (g.family === "lance" && round % 2 === 0) continue;
        const shots = u.count * g.count;
        for (let s = 0; s < shots; s++) {
          // Cloaked ships can't be found in the first round, unless this side has hyperspace sensors.
          const target = pickTarget(rng, units.filter((x) => x.side !== u.side && !(round === 1 && x.cloaked && !u.seesCloak)));
          if (!target) break;
          if (g.kind === "missile" || g.kind === "torpedo") aimed[target.side]!++;
          if ((g.kind === "missile" || g.kind === "torpedo") && screen[target.side]! > 0 && stopped[target.side]! < aimed[target.side]! / 2) {
            // Fighters screen their side: whole interceptions first, then a last partial chance.
            const s0 = screen[target.side]!;
            screen[target.side] = Math.max(0, s0 - 1);
            if (s0 >= 1 || R.chance(rng, s0)) { stopped[target.side]!++; onShot?.(round, u, target, g.kind, "intercepted", 0); continue; }
          }
          if (!R.chance(rng, hitChance(g, u, target))) { onShot?.(round, u, target, g.kind, "miss", 0); continue; }
          if (target.dodge > 0 && R.chance(rng, target.dodge)) { onShot?.(round, u, target, g.kind, "dodged", 0); continue; }
          const raw = (R.int(rng, g.min, g.max) + u.bonusDamage) * (u.siege && target.key === "planet" ? 2 : 1);
          // Torpedoes, rail slugs and plasma warheads punch through half of the shield; a lance ignores it.
          const halfShield = g.kind === "torpedo" || g.family === "rail" || g.family === "plasma";
          const dmg = raw - (g.family === "lance" ? 0 : halfShield ? Math.floor(target.shield / 2) : target.shield);
          // Ion hits wear the shield down for the rest of the battle, even when the shield holds.
          if (g.family === "ion" && target.shield > 0) target.shield--;
          if (dmg <= 0 || target.invulnerable) { onShot?.(round, u, target, g.kind, "blocked", 0); continue; }
          target.hp -= dmg;
          onShot?.(round, u, target, g.kind, target.hp <= 0 ? "kill" : "hit", dmg);
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

export function lossText(units: Unit[], side: 0 | 1): string {
  const parts = units.filter((u) => u.side === side && u.start > u.count).map((u) => plural(u.start - u.count, u.name));
  return parts.length ? parts.join(", ") : "nothing";
}

/** Take losses off the fleets at a star. */
export function applyLosses(state: GameState, fleets: Fleet[], units: Unit[]): void {
  for (const u of units) {
    if (u.key === "planet" || u.fighter) continue;
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
      const d = shipDesign(state, id);
      const ships = shipUnit(state, side, e, d, n);
      units.push(ships);
      const wing = fighterUnit(state, side, e, d, ships);
      if (wing) units.push(wing);
    }
    // Ambush: a fleet lying hidden in its gate fires first (gates.ts, Claude 2).
    if (ambushing(state, e, s.id)) for (const u of units) if (u.side === side) u.first = true;
    if (colony && colony.empireId === e.id) {
      const p = planetUnit(state, side, e, colony);
      if (p) units.push(p);
    }
  }
  if (!units.some(armed)) return; // nobody here can shoot
  if (!units.some((u) => u.side === 0) || !units.some((u) => u.side === 1)) return;
  veteranEdge(state, here, units); // famous fleets and admirals (battleStories.ts, Claude 2)
  heroEdge(state, here, units); // hero admirals (heroes.ts, Claude 2)
  coalitionEdge(state, units); // the galaxy against a giant (coalition.ts)

  const rec = new BattleRecorder(units);
  const rounds = fight(state, units, rec.shot);
  noteBattle(state, s, a, b, rounds, units, here, rec);
  applyLosses(state, here, units);
  // Race abilities after the battle (Ashkari spoils, Raxxan salvage).
  const lossValue = (sd: 0 | 1) => units.filter((u) => u.side === sd && u.key !== "planet" && !u.fighter)
    .reduce((acc, u) => acc + (u.start - u.count) * shipDesign(state, u.key).cost, 0);
  for (const [me, them, theirSide] of [[a, b, 1], [b, a, 0]] as const) {
    const note = afterBattle(state, me, them, lossValue(theirSide));
    if (note) state.events.push({ turn: state.turn, empireId: me.id, kind: "battle", starId: s.id, text: note });
  }
  const planet = units.find((u) => u.key === "planet");
  if (colony && planet) colony.missileBases = planet.count;

  for (const [me, them, mine, theirs] of [[a, b, 0, 1], [b, a, 1, 0]] as const) {
    // A rival leader speaks after a real fight: gloating if their side lost less, defiant if more.
    const ourLoss = lossValue(mine), theirLoss = lossValue(theirs);
    const words = !them.isPlayer && ourLoss + theirLoss > 0
      ? ` ${sayMoment(state.turn, them, theirLoss < ourLoss ? "battleWon" : "battleLost", me, { star: s.name })}` : "";
    state.events.push({
      turn: state.turn, empireId: me.id, kind: "battle", starId: s.id,
      text: `Battle at ${s.name} against the ${them.name} (${plural(rounds, "round")}). You lost ${lossText(units, mine)}; they lost ${lossText(units, theirs)}.${words}`,
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

export function moveCapital(state: GameState, e: Empire): void {
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
  const atkBonus = empireRace(attacker).ground * 10 + (techStats(attacker).specials.includes("personal-shields") ? 10 : 0) + heroGround(state, attacker, null); // heroGround: generals (heroes.ts, Claude 2)
  const defBonus = empireRace(owner).ground * 10 + (techStats(owner).specials.includes("personal-shields") ? 10 : 0) + 5 + edictShare(c, "defense") * EDICT_DEFENSE_POINTS + heroGround(state, owner, s.id);
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
    addGrudge(state, owner, attacker, GRUDGE.tookWorld, `took ${s.name}`);
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
  addGrudge(state, b, a, GRUDGE.declaredWar, "declared war on us");
  a.atWar[b.id] = state.turn;
  b.atWar[a.id] = state.turn;
  if (!a.isPlayer) state.events.push({ turn: state.turn, empireId: b.id, kind: "war", text: say(state.turn, a, "declareWar", b) });
  a.peaceOffers = a.peaceOffers.filter((x) => x !== b.id);
  b.peaceOffers = b.peaceOffers.filter((x) => x !== a.id);
  state.events.push({ turn: state.turn, empireId: null, kind: "war", text: `The ${a.name} declared war on the ${b.name}!` });
}

/** Peace terms accepted: the loser hands these worlds to the winner (people, factories and buildings stay; the
 *  people resent it as an occupation), and the war between them ends. */
export function cedeColonies(state: GameState, winner: Empire, loser: Empire, stars: Id[]): void {
  const names: string[] = [];
  for (const id of stars) {
    const old = state.colonies[id];
    if (!old || old.empireId !== loser.id || id === loser.capitalStarId) continue;
    const c = newColony(id, winner.id, old.population, old.foundedTurn);
    c.factories = old.factories;
    c.buildings = [...old.buildings];
    onCapture(state, c, old, loser, winner);
    transferWonders(state, id, winner);
    state.colonies[id] = c;
    names.push(state.stars[id]!.name);
    addGrudge(state, loser, winner, GRUDGE.forcedWorld, `forced us to give up ${state.stars[id]!.name}`);
  }
  delete winner.atWar[loser.id];
  delete loser.atWar[winner.id];
  winner.peaceOffers = winner.peaceOffers.filter((x) => x !== loser.id);
  loser.peaceOffers = loser.peaceOffers.filter((x) => x !== winner.id);
  const what = names.length ? `, handing over ${names.join(", ")}` : "";
  state.events.push({ turn: state.turn, empireId: null, kind: "war", text: `The ${loser.name} have made peace with the ${winner.name}${what}.` });
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
  // An empire down to its last worlds pleads rather than bargains.
  const lastWorlds = Object.values(state.colonies).filter((c) => c.empireId === a.id).length <= 2;
  const words = a.isPlayer ? "" : ` ${lastWorlds ? sayMoment(state.turn, a, "begging", b) : say(state.turn, a, "offerPeace", b)}`;
  state.events.push({ turn: state.turn, empireId: b.id, kind: "war", text: `The ${a.name} offer peace.${words}` });
  return false;
}
