// Galaxy generation: star placement by shape, planets by star color
// (odds from data/planets), and fair homeworld placement.

import {
  CLIMATES, PLANET_ODDS, PLANET_ORDER, POOR_ODDS, RICH_ODDS, STAR_NAMES, STAR_ODDS, STAR_ORDER,
} from "./data/planets";
import type { Race } from "./data/races";
import { canColonizeClimate } from "./formulas";
import * as R from "./rng";
import type { RngState } from "./rng";
import type { Climate, GalaxyShape, GalaxySize, Minerals, Planet, Star } from "./types";

export const STAR_COUNT: Record<GalaxySize, [number, number]> = {
  small: [32, 44], medium: [70, 95], large: [130, 170], huge: [210, 280],
};

/** Square light-years of space per star; sets how crowded the map is. */
const AREA_PER_STAR = 9;
const MIN_STAR_GAP = 1.8;
/** Distance within which every homeworld is guaranteed good nearby worlds. */
export const FAIR_START_RADIUS = 3.2;
const FAIR_START_WORLDS = 2;
const FAIR_START_STARS = 3;

type Point = { x: number; y: number };

function samplePoint(rng: RngState, shape: GalaxyShape, n: number): Point {
  const area = n * AREA_PER_STAR;
  switch (shape) {
    case "rectangle": {
      const h = Math.sqrt(area / 1.5);
      const w = h * 1.5;
      return { x: R.range(rng, 0, w), y: R.range(rng, 0, h) };
    }
    case "ring": {
      const outer = Math.sqrt(area / (Math.PI * (1 - 0.3)));
      const r = Math.sqrt(R.range(rng, 0.3 * outer * outer, outer * outer));
      const a = R.range(rng, 0, Math.PI * 2);
      return { x: outer + r * Math.cos(a), y: outer + r * Math.sin(a) };
    }
    case "spiral": {
      const radius = Math.sqrt(area / Math.PI) * 1.3;
      const arms = 3;
      const arm = R.int(rng, 0, arms - 1);
      const t = Math.sqrt(R.next(rng)); // more stars toward the rim
      const angle = (arm / arms) * Math.PI * 2 + t * Math.PI * 1.6;
      const spread = 0.35 + 0.25 * (1 - t);
      const r = t * radius;
      const jitter = R.range(rng, -spread, spread) * radius * 0.25;
      return {
        x: radius + r * Math.cos(angle) + jitter * Math.cos(angle + Math.PI / 2),
        y: radius + r * Math.sin(angle) + jitter * Math.sin(angle + Math.PI / 2),
      };
    }
    case "ellipse":
    default: {
      const b = Math.sqrt(area / (Math.PI * 1.4));
      const a = b * 1.4;
      const r = Math.sqrt(R.next(rng));
      const ang = R.range(rng, 0, Math.PI * 2);
      return { x: a + a * r * Math.cos(ang), y: b + b * r * Math.sin(ang) };
    }
  }
}

function placeStars(rng: RngState, shape: GalaxyShape, n: number): Point[] {
  const pts: Point[] = [];
  let attempts = 0;
  while (pts.length < n && attempts < n * 400) {
    attempts++;
    const p = samplePoint(rng, shape, n);
    if (pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= MIN_STAR_GAP)) pts.push(p);
  }
  return pts;
}

/** Longest hop allowed between neighbouring stars; equals starting fuel range. */
export const MAX_HOP = 3;

/**
 * Makes sure every star can be reached from every other by hops of at most
 * MAX_HOP light-years, adding "stepping-stone" stars across any gap.
 * Without this, spiral arms can trap an empire for 100+ turns.
 */
export function connectStars(pts: Point[]): void {
  for (let guard = 0; guard < 500; guard++) {
    // Label connected groups.
    const group = new Array<number>(pts.length).fill(-1);
    let groups = 0;
    for (let i = 0; i < pts.length; i++) {
      if (group[i] !== -1) continue;
      const stack = [i];
      group[i] = groups;
      while (stack.length) {
        const a = pts[stack.pop()!]!;
        for (let j = 0; j < pts.length; j++) {
          if (group[j] === -1 && Math.hypot(pts[j]!.x - a.x, pts[j]!.y - a.y) <= MAX_HOP) {
            group[j] = groups;
            stack.push(j);
          }
        }
      }
      groups++;
    }
    if (groups <= 1) return;
    // Bridge group 0 to its nearest other group with evenly spaced stars.
    let best = { a: 0, b: 0, d: Infinity };
    for (let i = 0; i < pts.length; i++) {
      if (group[i] !== 0) continue;
      for (let j = 0; j < pts.length; j++) {
        if (group[j] === 0) continue;
        const d = Math.hypot(pts[i]!.x - pts[j]!.x, pts[i]!.y - pts[j]!.y);
        if (d < best.d) best = { a: i, b: j, d };
      }
    }
    const a = pts[best.a]!;
    const b = pts[best.b]!;
    const steps = Math.ceil(best.d / (MAX_HOP * 0.85));
    for (let k = 1; k < steps; k++) {
      pts.push({ x: a.x + ((b.x - a.x) * k) / steps, y: a.y + ((b.y - a.y) * k) / steps });
    }
  }
}

/** Re-check connectivity after homes were adjusted, adding stepping-stone stars if needed. */
export function bridgeStars(rng: RngState, stars: Star[]): void {
  const pts: Point[] = stars.map((s) => ({ x: s.x, y: s.y }));
  const before = pts.length;
  connectStars(pts);
  for (let i = before; i < pts.length; i++) {
    const pt = pts[i]!;
    const star: Star = {
      id: stars.length, name: `${R.pick(rng, STAR_NAMES)} ${stars.length}`, x: pt.x, y: pt.y,
      color: STAR_ORDER[R.pickCumulative(rng, STAR_ODDS)] ?? "red", planet: null, nebula: false,
    };
    star.planet = rollPlanet(rng, star);
    stars.push(star);
  }
}

export function rollSize(rng: RngState, c: Climate): number {
  const { minSize, maxSize } = CLIMATES[c];
  return 5 * R.int(rng, Math.round(minSize / 5), Math.round(maxSize / 5));
}

function rollMinerals(rng: RngState, star: Star, c: Climate): Minerals {
  const [ultraRich, rich] = RICH_ODDS[star.color][c] ?? [0, 0];
  const x = R.next(rng);
  if (x < ultraRich) return "ultraRich";
  if (x < rich) return "rich";
  const [ultraPoor, poor] = POOR_ODDS[star.color];
  const y = R.next(rng);
  if (y < ultraPoor) return "ultraPoor";
  if (y < poor) return "poor";
  return "normal";
}

export function makePlanet(rng: RngState, star: Star, c: Climate): Planet {
  return {
    climate: c,
    size: rollSize(rng, c),
    terraform: 0,
    minerals: rollMinerals(rng, star, c),
    environment: "normal",
    special: null,
  };
}

function rollPlanet(rng: RngState, star: Star): Planet | null {
  const kind = PLANET_ORDER[R.pickCumulative(rng, PLANET_ODDS[star.color])];
  if (!kind || kind === "none") return null;
  return makePlanet(rng, star, kind);
}

export function generateStars(rng: RngState, size: GalaxySize, shape: GalaxyShape): Star[] {
  const [lo, hi] = STAR_COUNT[size];
  const pts = placeStars(rng, shape, R.int(rng, lo, hi));
  connectStars(pts);
  const names = R.shuffle(rng, [...STAR_NAMES]);
  return pts.map((pt, i) => {
    const base = names[i % names.length] as string;
    const name = i < names.length ? base : `${base} ${["II", "III", "IV", "V", "VI"][Math.floor(i / names.length) - 1] ?? i}`;
    const star: Star = {
      id: i, name, x: pt.x, y: pt.y,
      color: STAR_ORDER[R.pickCumulative(rng, STAR_ODDS)] ?? "red",
      planet: null,
      nebula: R.chance(rng, 0.04),
    };
    star.planet = rollPlanet(rng, star);
    return star;
  });
}

/**
 * Picks homeworld stars spread as far apart as possible (farthest-point sampling).
 */
export function pickHomeStars(rng: RngState, stars: Star[], count: number): Star[] {
  if (stars.length < count) throw new Error("Galaxy too small for that many empires");
  const cx = stars.reduce((s, t) => s + t.x, 0) / stars.length;
  const cy = stars.reduce((s, t) => s + t.y, 0) / stars.length;
  // Avoid the extreme rim for the first pick so nobody starts in a dead-end corner.
  const inner = [...stars].sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy));
  const chosen: Star[] = [R.pick(rng, inner.slice(Math.floor(inner.length * 0.3), Math.floor(inner.length * 0.8)))];
  while (chosen.length < count) {
    let best: Star | null = null;
    let bestD = -1;
    for (const s of stars) {
      if (chosen.includes(s)) continue;
      const d = Math.min(...chosen.map((h) => Math.hypot(h.x - s.x, h.y - s.y)));
      // Slight pull toward the middle so homes aren't all on the outer edge.
      const edge = Math.hypot(s.x - cx, s.y - cy) * 0.15;
      if (d - edge > bestD) { bestD = d - edge; best = s; }
    }
    if (!best) break;
    chosen.push(best);
  }
  return chosen;
}

const STARTER_CLIMATES: readonly Climate[] = ["ocean", "arid", "steppe", "jungle", "desert"];

/**
 * Makes a star into a homeworld and guarantees a fair neighbourhood:
 * at least FAIR_START_STARS stars and FAIR_START_WORLDS settleable worlds nearby.
 */
export function prepareHome(rng: RngState, stars: Star[], home: Star, race: Race, otherHomes: Star[]): void {
  home.color = "yellow";
  home.nebula = false;
  home.planet = {
    climate: race.homeClimate, size: 100, terraform: 0, minerals: "normal",
    environment: "normal", special: null,
  };
  const near = stars
    .filter((s) => s !== home && !otherHomes.includes(s))
    .map((s) => ({ s, d: Math.hypot(s.x - home.x, s.y - home.y) }))
    .sort((a, b) => a.d - b.d);

  // Ensure enough stars in reach by nudging the nearest few inward.
  for (let i = 0; i < FAIR_START_STARS && i < near.length; i++) {
    const n = near[i]!;
    if (n.d > FAIR_START_RADIUS) {
      const k = (FAIR_START_RADIUS * R.range(rng, 0.7, 0.95)) / n.d;
      n.s.x = home.x + (n.s.x - home.x) * k;
      n.s.y = home.y + (n.s.y - home.y) * k;
      n.d = Math.hypot(n.s.x - home.x, n.s.y - home.y);
    }
  }
  const inReach = near.filter((n) => n.d <= FAIR_START_RADIUS);
  let good = inReach.filter((n) => n.s.planet && canColonizeClimate(n.s.planet.climate, race) && n.s.planet.size >= 35).length;
  for (const n of inReach) {
    if (good >= FAIR_START_WORLDS) break;
    if (n.s.planet && canColonizeClimate(n.s.planet.climate, race) && n.s.planet.size >= 35) continue;
    if (n.s.color === "purple" || n.s.color === "blue") n.s.color = "orange";
    n.s.planet = makePlanet(rng, n.s, R.pick(rng, STARTER_CLIMATES));
    if (n.s.planet.minerals === "ultraPoor") n.s.planet.minerals = "poor";
    good++;
  }
}
