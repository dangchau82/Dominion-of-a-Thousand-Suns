// Turns a battle recording (engine/battleLog.ts) into a timeline the 3D viewer can play.
// Pure: no three.js, no DOM, no randomness, so it can be unit-tested. The viewer shows what
// really happened in the battle, shot by shot; it never invents results.

import { unpackShot, type BattleRecord, type Shot } from "../../engine/battleLog";

export interface TimedShot extends Shot {
  /** Seconds from the start of the replay when the shot is fired. */
  t: number;
  /** For kills: which of the target unit's ship models blows up (-1 = none left to show). */
  modelLost: number;
}

export interface UnitModels {
  /** Ship models shown for this unit (a stack of 40 fighters is not 40 models). */
  shown: number;
  /** How many of those models are still standing when the battle ends. */
  survive: number;
}

export interface Timeline {
  shots: TimedShot[];
  units: UnitModels[];
  /** Seconds until the last shot lands; the viewer adds a short pause after it. */
  duration: number;
  rounds: number;
}

/** Most models one unit gets, so huge stacks stay readable and fast on phones. */
export const MAX_MODELS = 8;
/** Seconds of quiet before the first shot (fleets close in). */
export const LEAD_IN = 2.2;
/** Seconds each combat round takes on screen. */
export const ROUND_SECONDS = 3.4;
/** At most this many shots are drawn; every kill is always kept. */
export const MAX_DRAWN = 420;

/** Ship models to show for a stack of `count` ships (planets are always one model). */
export function modelsFor(count: number, key: string): number {
  if (key === "planet") return 1;
  if (count <= 0) return 0;
  return Math.min(MAX_MODELS, key.endsWith("#fighters") ? Math.ceil(count / 4) : count);
}

export function battleTimeline(rec: BattleRecord): Timeline {
  const all = rec.shots.map(unpackShot);
  // Thin out the shots if there are too many to draw, keeping every kill and an even spread of the rest.
  let drawn = all.map((s, i) => ({ s, i }));
  if (drawn.length > MAX_DRAWN) {
    const kills = drawn.filter((x) => x.s.result === "kill");
    const rest = drawn.filter((x) => x.s.result !== "kill");
    const room = Math.max(0, MAX_DRAWN - kills.length);
    const step = rest.length / Math.max(1, room);
    const keep = new Set<number>();
    for (let k = 0; k < room; k++) keep.add(rest[Math.floor(k * step)]!.i);
    drawn = drawn.filter((x) => x.s.result === "kill" || keep.has(x.i));
  }
  // Spread each round's shots evenly through that round.
  const perRound = new Map<number, number>();
  for (const { s } of drawn) perRound.set(s.round, (perRound.get(s.round) ?? 0) + 1);
  const seen = new Map<number, number>();
  const rounds = Math.max(1, rec.rounds, ...drawn.map((x) => x.s.round + 1));

  const units: UnitModels[] = rec.units.map((u) => {
    const shown = modelsFor(u.start, u.key);
    const lost = u.start - u.end;
    const survive = u.key === "planet" ? 1 : u.start > 0 ? Math.max(0, Math.round(shown * (1 - lost / u.start))) : 0;
    return { shown, survive: lost >= u.start && u.key !== "planet" ? 0 : survive };
  });

  // Kills knock out models in order; a model goes when the share of ships killed passes its turn.
  const killsOn = rec.units.map(() => 0);
  const modelsLost = rec.units.map(() => 0);
  const shots: TimedShot[] = drawn.map(({ s }) => {
    const n = seen.get(s.round) ?? 0;
    seen.set(s.round, n + 1);
    const t = LEAD_IN + s.round * ROUND_SECONDS + (n / Math.max(1, perRound.get(s.round)!)) * ROUND_SECONDS * 0.85;
    let modelLost = -1;
    if (s.result === "kill" && rec.units[s.target]) {
      const u = rec.units[s.target]!;
      const m = units[s.target]!;
      killsOn[s.target]! += 1;
      const lost = u.start - u.end;
      const totalKills = Math.max(1, lost);
      const shouldBeGone = Math.min(m.shown - m.survive, Math.floor((killsOn[s.target]! / totalKills) * (m.shown - m.survive) + 1e-9));
      if (shouldBeGone > modelsLost[s.target]!) { modelLost = modelsLost[s.target]!; modelsLost[s.target]! += 1; }
    }
    return { ...s, t, modelLost };
  });
  const last = shots.length ? shots[shots.length - 1]!.t : LEAD_IN;
  return { shots, units, duration: Math.max(last + 1.5, LEAD_IN + rounds * ROUND_SECONDS * 0.5), rounds };
}

/** Models of a unit still not destroyed by the end of the drawn shots (the viewer blows these up at the end). */
export function leftoverLosses(tl: Timeline, unitIndex: number): number {
  const m = tl.units[unitIndex]!;
  const lost = tl.shots.filter((s) => s.target === unitIndex && s.modelLost >= 0).length;
  return Math.max(0, m.shown - m.survive - lost);
}
