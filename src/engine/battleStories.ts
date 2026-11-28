// Battle stories (written by Claude 2): veteran fleets, hero admirals and great battles.
//
// - Veteran fleets: a fleet that wins a real battle (the enemy loses 2+ ships and more than
//   we do) earns a victory. At 3 it gets a name and the rank Veteran, at 7 Elite, at 12
//   Legendary. Its ships fight a little better (attack +1, +1, +2). Losing one makes history.
// - Hero admirals: when a fleet turns Elite, an admiral takes command, with a personality
//   that gives a small edge, a saying after each win, and a death scene if the fleet falls.
// - Great battles: 80+ ships with both sides losing 8+ gets a name and an entry in the
//   galaxy's history (event kind "saga"), at most once per star every 20 turns.
// No random draws: names come from hashing the seed, fleet id and turn.
//
// Hooks in combat.ts `battle`: `veteranEdge` before the fight, `noteBattle` after it (before
// losses are taken off the fleets). `processVeterans` runs once a turn.

import { rallyToWorldship } from "./endgame";
import { saveBattle, type BattleRecorder, type BattleRecord } from "./battleLog";
import type { Unit } from "./combat";
import { shipDesign } from "./designs";
import { shipCount } from "./game";
import type { Empire, Fleet, GameState, Id, Star } from "./types";

export type Personality = "bold" | "cautious" | "ruthless" | "cunning" | "honourable";

export interface Admiral {
  name: string;
  personality: Personality;
  since: number;
  victories: number;
}

export interface VeteranFleet {
  empireId: Id;
  victories: number;
  /** Enemy ships destroyed in battles this fleet won or fought in. */
  kills: number;
  name?: string;
  admiral?: Admiral;
  /** Where the fleet was last seen (to follow it through merges). */
  lastStar: Id | null;
}

export interface GreatBattle {
  turn: number;
  starId: Id;
  name: string;
  empires: [Id, Id];
  ships: number;
  losses: [number, number];
}

export const RANKS = [
  { at: 3, title: "Veteran", attack: 1 },
  { at: 7, title: "Elite", attack: 1 },
  { at: 12, title: "Legendary", attack: 2 },
] as const;
/** A great battle: this many ships in all, and each side loses at least GREAT_BATTLE_LOSSES. */
export const GREAT_BATTLE_SHIPS = 80;
export const GREAT_BATTLE_LOSSES = 8;
/** No second great battle at the same star within this many turns. */
export const GREAT_BATTLE_GAP = 20;
/** A win only counts as a victory if the enemy lost at least this many ships. */
export const VICTORY_KILLS = 2;
export const GREAT_KEPT = 30;

const NAME_A = ["Iron", "Ash", "Silent", "Crimson", "Hollow", "Ember", "Grey", "Last", "Burning", "Black", "Winter", "Star", "Pale", "Storm", "Hungry", "Seventh"];
const NAME_B = ["Widows", "Lanterns", "Hounds", "Choir", "Knives", "Wardens", "Tide", "Ravens", "Lances", "Saints", "Embers", "Hammers", "Ghosts", "Spears", "Thorns", "Vigil"];
const ADM_FIRST = ["Asha", "Torvin", "Mira", "Kael", "Sena", "Doran", "Ilse", "Vex", "Rhea", "Oskar", "Lune", "Taro", "Yeva", "Bram", "Nyla", "Corin"];
const ADM_LAST = ["Varr", "Okonde", "Sillith", "Marrow", "Teague", "Hale", "Quill", "Strand", "Ravel", "Dusk", "Arden", "Coil", "Vane", "Ostrel", "Brack", "Linn"];
const PERSONALITIES: Personality[] = ["bold", "cautious", "ruthless", "cunning", "honourable"];
const BATTLE_WORDS = ["Battle", "Burning", "Siege", "Fire", "Stand", "Breaking", "Long Night", "Reckoning"];

const SAYINGS: Record<Personality, string[]> = {
  bold: ["Forward. Always forward.", "They had the numbers. We had the nerve.", "Tell the yards to build faster; I'm not done."],
  cautious: ["Nobody dies who doesn't have to. Today, nobody did.", "Patience won this, not guns.", "We hold. We wait. We win."],
  ruthless: ["Leave nothing they can rebuild.", "Mercy is for empires that can afford it.", "Let the wreckage be a warning."],
  cunning: ["They watched the front door. We came through the window.", "Every battle is won before the first shot.", "They'll be studying this one for years."],
  honourable: ["Let their dead be recovered with honour.", "A good fight against a worthy foe.", "We fought fair, and we fought well."],
};
const LAST_WORDS: Record<Personality, string> = {
  bold: "went down firing every gun, still giving the order to advance",
  cautious: "held the line long enough for the crews of the damaged ships to escape",
  ruthless: "rammed the flagship into the enemy line rather than be taken",
  cunning: "sent one last coded message no one has been able to read",
  honourable: "saluted the enemy flagship before the end",
};

function hash(...parts: (string | number)[]): number {
  let h = 0;
  for (const ch of parts.join("|")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}
const pick = <T>(list: readonly T[], h: number): T => list[h % list.length]!;

export function rankOf(v: VeteranFleet | undefined): number {
  if (!v) return 0;
  let r = 0;
  RANKS.forEach((k, i) => { if (v.victories >= k.at) r = i + 1; });
  return r;
}
export function rankTitle(v: VeteranFleet | undefined): string | null {
  const r = rankOf(v);
  return r ? RANKS[r - 1]!.title : null;
}
function attackEdge(v: VeteranFleet | undefined): number {
  const r = rankOf(v);
  return r ? RANKS[r - 1]!.attack : 0;
}

/** A fleet's name with its rank, e.g. "the Iron Widows (Elite)", or null. */
export function fleetTitle(state: GameState, fleetId: Id): string | null {
  const v = state.veterans?.[fleetId];
  return v?.name ? `the ${v.name} (${rankTitle(v)})` : null;
}

/** Before a battle: famous fleets and their admirals give their ships an edge. */
export function veteranEdge(state: GameState, here: Fleet[], units: Unit[]): void {
  const vets = state.veterans;
  if (!vets) return;
  for (const u of units) {
    if (u.key === "planet" || u.fighter) continue;
    let atk = 0, def = 0, dmg = 0, dodge = 0;
    for (const f of here) {
      if (f.empireId !== u.empireId || !(f.ships[u.key]! > 0)) continue;
      const v = vets[f.id];
      atk = Math.max(atk, attackEdge(v));
      const p = v?.admiral?.personality;
      if (p === "bold") atk = Math.max(atk, attackEdge(v) + 1);
      if (p === "cautious" || p === "honourable") def = 1;
      if (p === "ruthless") dmg = 1;
      if (p === "cunning") dodge = 0.1;
    }
    u.attack += atk; u.beamDef += def; u.missileDef += def; u.bonusDamage += dmg; u.dodge = Math.max(u.dodge, dodge);
  }
}

function lossValue(state: GameState, units: Unit[], side: 0 | 1): number {
  return units.filter((u) => u.side === side && u.key !== "planet" && !u.fighter)
    .reduce((a, u) => a + (u.start - u.count) * shipDesign(state, u.key).cost, 0);
}
function shipsLost(units: Unit[], side: 0 | 1): number {
  return units.filter((u) => u.side === side && u.key !== "planet" && !u.fighter).reduce((a, u) => a + u.start - u.count, 0);
}

function news(state: GameState, empireId: Id | null, text: string, starId: Id, kind: "info" | "saga" = "info"): void {
  state.events.push({ turn: state.turn, empireId, kind, starId, text });
}

/** After a battle, before losses come off the fleets. */
export function noteBattle(state: GameState, s: Star, a: Empire, b: Empire, rounds: number, units: Unit[], here: Fleet[], rec: BattleRecorder): BattleRecord {
  const record = saveBattle(state, s.id, a.id, b.id, rounds, units, rec);
  // A Worldship in this battle: its owner's allies come to its defence (endgame.ts).
  rallyToWorldship(state, a, b, s.id);
  rallyToWorldship(state, b, a, s.id);
  const sides = [a, b] as const;
  const lost = [lossValue(state, units, 0), lossValue(state, units, 1)];
  const killed = [shipsLost(units, 0), shipsLost(units, 1)];
  const winner: 0 | 1 | null = lost[0]! + lost[1]! === 0 ? null : lost[0]! < lost[1]! ? 0 : lost[1]! < lost[0]! ? 1 : null;
  const vets = (state.veterans ??= {});

  for (const side of [0, 1] as const) {
    const e = sides[side];
    // Survivors of each design, to tell which fleets die.
    const left = new Map(units.filter((u) => u.side === side && u.key !== "planet" && !u.fighter).map((u) => [u.key, u.count]));
    // `applyLosses` takes losses from the first fleets, so the survivors are in the last ones: walk backwards.
    for (const f of here.filter((x) => x.empireId === e.id && shipCount(x) > 0).reverse()) {
      let survives = false;
      for (const [key, n] of Object.entries(f.ships)) {
        if (!(n > 0)) continue;
        const have = left.get(key) ?? 0;
        if (have > 0) survives = true;
        left.set(key, Math.max(0, have - n));
      }
      const v = vets[f.id];
      if (!survives) {
        if (v?.name) news(state, null, `${v.admiral ? `Admiral ${v.admiral.name} ${LAST_WORDS[v.admiral.personality]}. ` : ""}The ${e.name}'s famous ${v.name} (${rankTitle(v)}, ${v.victories} victories) were destroyed at ${s.name}.`, s.id, "saga");
        delete vets[f.id];
        continue;
      }
      if (winner !== side || killed[1 - side]! < VICTORY_KILLS) continue;
      const vf = (vets[f.id] ??= { empireId: e.id, victories: 0, kills: 0, lastStar: s.id });
      const before = rankOf(vf);
      vf.victories++;
      vf.kills += killed[1 - side]!;
      vf.lastStar = s.id;
      if (vf.admiral) {
        vf.admiral.victories++;
        news(state, e.id, `Admiral ${vf.admiral.name} after the battle at ${s.name}: "${pick(SAYINGS[vf.admiral.personality], hash(state.settings.seed, f.id, state.turn))}"`, s.id);
      }
      const after = rankOf(vf);
      if (after > before) {
        if (!vf.name) vf.name = `${pick(NAME_A, hash(state.settings.seed, f.id, "a"))} ${pick(NAME_B, hash(state.settings.seed, f.id, "b"))}`;
        news(state, e.id, `The fleet at ${s.name} has earned a name: the ${vf.name}, now ${RANKS[after - 1]!.title} (${vf.victories} victories).`, s.id);
        if (after >= 2 && !vf.admiral) {
          const h = hash(state.settings.seed, f.id, state.turn, "adm");
          vf.admiral = { name: `${pick(ADM_FIRST, h)} ${pick(ADM_LAST, Math.floor(h / 16))}`, personality: pick(PERSONALITIES, Math.floor(h / 256)), since: state.turn, victories: 0 };
          news(state, e.id, `Admiral ${vf.admiral.name}, known as ${vf.admiral.personality}, takes command of the ${vf.name}.`, s.id);
        }
        if (after === 3) news(state, null, `The ${e.name}'s ${vf.name} are now spoken of across the galaxy as Legendary.`, s.id, "saga");
      }
    }
  }

  // Great battles.
  const ships = units.filter((u) => u.key !== "planet" && !u.fighter).reduce((acc, u) => acc + u.start, 0);
  const recent = (state.greatBattles ?? []).some((g) => g.starId === s.id && state.turn - g.turn < GREAT_BATTLE_GAP);
  if (ships >= GREAT_BATTLE_SHIPS && Math.min(killed[0]!, killed[1]!) >= GREAT_BATTLE_LOSSES && !recent) {
    const word = pick(BATTLE_WORDS, hash(state.settings.seed, s.id, state.turn));
    const name = `the ${word} of ${s.name}`;
    const g: GreatBattle = { turn: state.turn, starId: s.id, name, empires: [a.id, b.id], ships, losses: [killed[0]!, killed[1]!] };
    const list = (state.greatBattles ??= []);
    list.push(g);
    if (list.length > GREAT_KEPT) list.splice(0, list.length - GREAT_KEPT);
    const outcome = winner === null ? "Neither side could claim victory" : `The ${sides[winner].name} held the field`;
    news(state, null, `${name[0]!.toUpperCase()}${name.slice(1)}: ${ships} ships of the ${a.name} and the ${b.name} clashed. ${outcome}; ${killed[0]} and ${killed[1]} ships were lost.`, s.id, "saga");
  }
  return record;
}

/** Once a turn: keep veteran records attached to their fleets through merges and splits. */
export function processVeterans(state: GameState): void {
  const vets = state.veterans;
  if (!vets) return;
  const byId = new Map(state.fleets.map((f) => [f.id, f]));
  for (const [idStr, v] of Object.entries(vets)) {
    const id = Number(idStr);
    const f = byId.get(id);
    if (f && shipCount(f) > 0) { v.lastStar = f.starId ?? v.lastStar; continue; }
    // The fleet merged into another at the same star: the record moves with its ships.
    const heir = state.fleets
      .filter((x) => x.empireId === v.empireId && x.starId !== null && x.starId === v.lastStar && !vets[x.id] && shipCount(x) > 0)
      .sort((x, y) => shipCount(y) - shipCount(x) || x.id - y.id)[0];
    delete vets[id];
    if (heir) vets[heir.id] = v;
  }
}

/** Famous fleets of an empire, best first (for screens). */
export function famousFleets(state: GameState, e: Empire): { fleetId: Id; v: VeteranFleet }[] {
  return Object.entries(state.veterans ?? {})
    .filter(([, v]) => v.empireId === e.id && v.name)
    .map(([id, v]) => ({ fleetId: Number(id), v }))
    .sort((x, y) => y.v.victories - x.v.victories || x.fleetId - y.fleetId);
}
