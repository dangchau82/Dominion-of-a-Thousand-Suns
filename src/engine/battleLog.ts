// Battle recordings (written by Claude 2). Every battle is recorded shot by shot so the
// battle screen can replay what really happened instead of an invented animation. Recording
// never touches the RNG: `fight` only reports what it already did.
//
// Shots are packed into one number each to keep saves small; use `unpackShot` to read them.
// Only the last KEEP battles the player saw (plus any great battle, see `greatBattles.ts`)
// are kept.

import type { Unit } from "./combat";
import type { GameState, Id } from "./types";

export type ShotKind = "beam" | "missile" | "torpedo";
/** What happened to one shot. */
export type ShotResult = "miss" | "intercepted" | "dodged" | "blocked" | "hit" | "kill";

export interface BattleUnitInfo {
  side: 0 | 1;
  empireId: Id;
  /** Design id, `${id}#fighters`, or "planet". */
  key: string;
  name: string;
  start: number;
  end: number;
  maxHp: number;
}

export interface BattleRecord {
  id: number;
  turn: number;
  starId: Id;
  empires: [Id, Id];
  rounds: number;
  units: BattleUnitInfo[];
  /** Packed shots, in firing order. */
  shots: number[];
  /** Shots beyond MAX_SHOTS were not stored (the result is still right). */
  cut: boolean;
}

export interface Shot {
  round: number;
  shooter: number;
  target: number;
  kind: ShotKind;
  result: ShotResult;
  damage: number;
}

export const KEEP = 8;
export const MAX_SHOTS = 2500;
const KINDS: ShotKind[] = ["beam", "missile", "torpedo"];
const RESULTS: ShotResult[] = ["miss", "intercepted", "dodged", "blocked", "hit", "kill"];

// Layout (low to high bits): damage 8, result 3, kind 2, target 7, shooter 7, round 4.
export function packShot(s: Shot): number {
  const dmg = Math.max(0, Math.min(255, Math.round(s.damage)));
  return dmg + RESULTS.indexOf(s.result) * 2 ** 8 + KINDS.indexOf(s.kind) * 2 ** 11
    + (s.target & 127) * 2 ** 13 + (s.shooter & 127) * 2 ** 20 + (s.round & 15) * 2 ** 27;
}

export function unpackShot(n: number): Shot {
  const at = (shift: number, bits: number) => Math.floor(n / 2 ** shift) % 2 ** bits;
  return { damage: at(0, 8), result: RESULTS[at(8, 3)]!, kind: KINDS[at(11, 2)]!, target: at(13, 7), shooter: at(20, 7), round: at(27, 4) };
}

/** Records one fight. Pass `recorder.shot` to `fight`. */
export class BattleRecorder {
  readonly shots: number[] = [];
  cut = false;
  constructor(private readonly units: Unit[]) {}
  shot = (round: number, shooter: Unit, target: Unit, kind: string, result: ShotResult, damage: number): void => {
    if (this.shots.length >= MAX_SHOTS) { this.cut = true; return; }
    const k = (kind === "missile" || kind === "torpedo" ? kind : "beam") as ShotKind;
    this.shots.push(packShot({ round, shooter: this.units.indexOf(shooter), target: this.units.indexOf(target), kind: k, result, damage }));
  };
}

/** Store a finished battle. Returns the record (kept or not). */
export function saveBattle(state: GameState, starId: Id, a: Id, b: Id, rounds: number, units: Unit[], rec: BattleRecorder): BattleRecord {
  const record: BattleRecord = {
    id: (state.nextBattleId = (state.nextBattleId ?? 0) + 1),
    turn: state.turn, starId, empires: [a, b], rounds,
    units: units.map((u) => ({ side: u.side, empireId: u.empireId, key: u.key, name: u.name, start: u.start, end: u.count, maxHp: u.maxHp })),
    shots: rec.shots, cut: rec.cut,
  };
  const playerSaw = state.empires[a]?.isPlayer || state.empires[b]?.isPlayer;
  if (playerSaw) {
    const list = (state.battles ??= []);
    list.push(record);
    if (list.length > KEEP) list.splice(0, list.length - KEEP);
  }
  return record;
}

/** The player's latest battle at a star (or anywhere), for the battle screen. */
export function latestBattle(state: GameState, starId?: Id): BattleRecord | undefined {
  const list = state.battles ?? [];
  for (let i = list.length - 1; i >= 0; i--) if (starId === undefined || list[i]!.starId === starId) return list[i];
  return undefined;
}
