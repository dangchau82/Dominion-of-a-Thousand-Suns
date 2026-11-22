// Seeded random numbers. The engine never uses Math.random, so a save plus
// its RNG state always replays the same way (needed for fair AI simulation,
// bug reports and shared galaxy seeds).

export interface RngState {
  s: number; // 32-bit state
}

export function makeRng(seed: number): RngState {
  return { s: seed >>> 0 || 0x9e3779b9 };
}

/** Uniform float in [0, 1). Mulberry32. */
export function next(r: RngState): number {
  r.s = (r.s + 0x6d2b79f5) >>> 0;
  let t = r.s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Float in [min, max). */
export function range(r: RngState, min: number, max: number): number {
  return min + next(r) * (max - min);
}

/** Integer in [min, max] inclusive. */
export function int(r: RngState, min: number, max: number): number {
  return min + Math.floor(next(r) * (max - min + 1));
}

export function chance(r: RngState, p: number): boolean {
  return next(r) < p;
}

export function pick<T>(r: RngState, items: readonly T[]): T {
  if (items.length === 0) throw new Error("pick from empty list");
  return items[Math.floor(next(r) * items.length)] as T;
}

export function shuffle<T>(r: RngState, items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(next(r) * (i + 1));
    const tmp = items[i] as T;
    items[i] = items[j] as T;
    items[j] = tmp;
  }
  return items;
}

/** Pick an index from cumulative thresholds (last must be 1). */
export function pickCumulative(r: RngState, cumulative: readonly number[]): number {
  const x = next(r);
  for (let i = 0; i < cumulative.length; i++) {
    if (x <= (cumulative[i] as number)) return i;
  }
  return cumulative.length - 1;
}
