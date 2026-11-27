// Code-drawn ships: every race has its own shape family and colours, and
// hull size adds length, modules, engines and guns. Returns SVG text, so the
// same ship can be a tiny map icon or fill the battle screen. Nose points up.

import type { HullSize } from "../engine/data/ships";

export interface Palette { light: string; mid: string; dark: string; accent: string; glow: string; flame: string }
export type Family = "sleek" | "wedge" | "winged" | "insect" | "symbiote" | "brood" | "crystal" | "halo" | "crescent"
  | "rock" | "block" | "cube" | "salvage" | "freighter" | "manta" | "pod" | "orb" | "hunter";

export const RACE_STYLE: Record<string, { family: Family; p: Palette }> = {
  humans: { family: "sleek", p: { light: "#e3e9f3", mid: "#8e99ad", dark: "#323a4b", accent: "#ff9d3a", glow: "#7fd0ff", flame: "#ff8a3a" } },
  vossari: { family: "halo", p: { light: "#ffffff", mid: "#c8d4e6", dark: "#5f6e8a", accent: "#4fe3ff", glow: "#9ff3ff", flame: "#5fd8ff" } },
  kethrak: { family: "insect", p: { light: "#b6c96a", mid: "#5f7a2e", dark: "#22300f", accent: "#ffcc33", glow: "#e3ff7a", flame: "#c8ff4a" } },
  ashkari: { family: "wedge", p: { light: "#e0a090", mid: "#8e2f24", dark: "#2a0c0a", accent: "#ffd25a", glow: "#ff6a3a", flame: "#ff4a2a" } },
  lumen: { family: "crystal", p: { light: "#f3d9ff", mid: "#9b5cd6", dark: "#341552", accent: "#ffffff", glow: "#d79bff", flame: "#c27bff" } },
  thraal: { family: "rock", p: { light: "#a89482", mid: "#5d4e42", dark: "#241c16", accent: "#ff7a1a", glow: "#ffae4a", flame: "#ff6a1a" } },
  seraphine: { family: "winged", p: { light: "#ffffff", mid: "#e6dcc2", dark: "#8c7a52", accent: "#ffd54a", glow: "#fff3b0", flame: "#ffe08a" } },
  orrun: { family: "freighter", p: { light: "#f1dc9c", mid: "#b08a32", dark: "#3e2f10", accent: "#2fd6c0", glow: "#7affee", flame: "#5affd8" } },
  nyx: { family: "cube", p: { light: "#6c7380", mid: "#2b2f37", dark: "#0c0d10", accent: "#ff2a3a", glow: "#ff4a5a", flame: "#ff3a4a" } },
  velari: { family: "crescent", p: { light: "#cfd8ff", mid: "#3c4f9a", dark: "#121a3e", accent: "#ffffff", glow: "#a8c0ff", flame: "#8aa8ff" } },
  drovani: { family: "manta", p: { light: "#9fe6e0", mid: "#2f8f9a", dark: "#0c3038", accent: "#e0fff6", glow: "#6affea", flame: "#4affd0" } },
  gorrath: { family: "block", p: { light: "#c49a6c", mid: "#7a5232", dark: "#2c1b10", accent: "#ffcf5a", glow: "#ffb04a", flame: "#ff9a3a" } },
  ixil: { family: "symbiote", p: { light: "#ffc6e8", mid: "#c25b9c", dark: "#4a1638", accent: "#8affd8", glow: "#ff9ad8", flame: "#ff7ac8" } },
  verdane: { family: "pod", p: { light: "#c9f0a0", mid: "#4f9a3a", dark: "#1a3a14", accent: "#ffe27a", glow: "#b8ff8a", flame: "#a8ff6a" } },
  quorai: { family: "orb", p: { light: "#fffbe0", mid: "#ffd24a", dark: "#7a4a00", accent: "#ffffff", glow: "#fff08a", flame: "#ffe066" } },
  raxxan: { family: "salvage", p: { light: "#b8a48a", mid: "#6e5a44", dark: "#261d14", accent: "#ffd21a", glow: "#ff9a2a", flame: "#ff7a1a" } },
  ruuvak: { family: "brood", p: { light: "#e8a88a", mid: "#a24a3a", dark: "#3a1210", accent: "#ffe0a0", glow: "#ff8a6a", flame: "#ff6a4a" } },
  tarkhan: { family: "hunter", p: { light: "#b8bcc4", mid: "#4a4f5a", dark: "#16181d", accent: "#ff2a2a", glow: "#ff5a4a", flame: "#ff6a3a" } },
};

const SCALE: Record<HullSize, number> = { small: 0.55, medium: 0.72, large: 0.88, huge: 1 };
const TIER: Record<HullSize, number> = { small: 0, medium: 1, large: 2, huge: 3 };

let uid = 0;

export function shipSVG(raceId: string, hull: HullSize = "medium", opts: { size?: number; animate?: boolean; background?: boolean } = {}): string {
  const style = RACE_STYLE[raceId] ?? RACE_STYLE.humans!;
  const id = `s${++uid}`;
  const p = style.p;
  const anim = opts.animate !== false;
  const t = TIER[hull];
  const body = FAMILIES[style.family](p, t, id, anim);
  const size = opts.size ?? 200;
  const bg = opts.background ? `<rect x="-130" y="-160" width="260" height="320" fill="url(#${id}sp)"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-130 -160 260 320" width="${size}" height="${size * 1.23}">
<defs>
  <radialGradient id="${id}sp" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#0d1530"/><stop offset="1" stop-color="#02030a"/></radialGradient>
  <linearGradient id="${id}h" x1="0" x2="1"><stop offset="0" stop-color="${p.dark}"/><stop offset="0.47" stop-color="${p.light}"/><stop offset="0.55" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.dark}"/></linearGradient>
  <linearGradient id="${id}v" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.dark}"/></linearGradient>
  <radialGradient id="${id}r" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="${p.light}"/><stop offset="0.6" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.dark}"/></radialGradient>
  <radialGradient id="${id}g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="${p.glow}"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient>
  <radialGradient id="${id}f" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.3" stop-color="${p.flame}"/><stop offset="1" stop-color="${p.flame}" stop-opacity="0"/></radialGradient>
  <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="${id}s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1"/></filter>
</defs>
${bg}<g transform="scale(${SCALE[hull]})">${body}</g></svg>`;
}

// ---------- shared pieces ----------

const n = (v: number) => Math.round(v * 10) / 10;

function flame(id: string, x: number, y: number, w: number, len: number, anim: boolean): string {
  const a = anim ? `<animate attributeName="ry" values="${n(len)};${n(len * 1.25)};${n(len)}" dur="${(0.25 + (Math.abs(x) % 7) / 60).toFixed(2)}s" repeatCount="indefinite"/>` : "";
  return `<ellipse cx="${n(x)}" cy="${n(y + len * 0.55)}" rx="${n(w)}" ry="${n(len)}" fill="url(#${id}f)" filter="url(#${id}s)">${a}</ellipse>`;
}
function engines(id: string, xs: number[], y: number, w: number, len: number, anim: boolean, p: Palette): string {
  return `<ellipse cx="0" cy="${n(y + len * 0.4)}" rx="${n(Math.max(30, (Math.max(...xs) - Math.min(...xs)) / 2 + 30))}" ry="${n(len * 0.6)}" fill="${p.flame}" opacity="0.2" filter="url(#${id}b)"/>`
    + xs.map((x) => flame(id, x, y, w, len, anim)).join("")
    + xs.map((x) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(w * 0.9)}" ry="${n(w * 0.35)}" fill="#111" stroke="${p.mid}" stroke-width="1"/>`).join("");
}
function lights(x: number, y: number, anim: boolean): string {
  const blink = (d: string) => (anim ? `<animate attributeName="opacity" values="1;0.15;1" dur="${d}" repeatCount="indefinite"/>` : "");
  return `<circle cx="${n(-x)}" cy="${n(y)}" r="2.6" fill="#ff4b4b">${blink("1.3s")}</circle><circle cx="${n(x)}" cy="${n(y)}" r="2.6" fill="#4bff7a">${blink("1.3s")}</circle>`;
}
function glowDot(id: string, x: number, y: number, r: number, anim: boolean): string {
  const a = anim ? `<animate attributeName="r" values="${n(r)};${n(r * 1.3)};${n(r)}" dur="1.8s" repeatCount="indefinite"/>` : "";
  return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="url(#${id}g)">${a}</circle>`;
}
function turrets(xs: number[], ys: number[], p: Palette): string {
  let s = "";
  for (const y of ys) for (const x of xs) s += `<circle cx="${n(x)}" cy="${n(y)}" r="4.5" fill="${p.dark}" stroke="${p.mid}"/><rect x="${n(x - 1.2)}" y="${n(y - 11)}" width="2.4" height="9" fill="${p.mid}"/>`;
  return s;
}
const sym = (path: (s: number) => string) => path(1) + path(-1);
const stroke = (p: Palette) => `stroke="${p.dark}" stroke-width="1.4"`;

// ---------- the families ----------

const FAMILIES: Record<Family, (p: Palette, t: number, id: string, anim: boolean) => string> = {
  // Terran: naval fuselage, swept wings, orange stripe.
  sleek(p, t, id, a) {
    const L = 120 + t * 12;
    const wing = sym((s) => `<path d="M${s * 12} 10 L${s * (90 + t * 8)} ${70 + t * 6} L${s * (84 + t * 8)} ${82 + t * 6} L${s * 14} 70 Z" fill="url(#${id}v)" ${stroke(p)}/><path d="M${s * 28} 28 L${s * (74 + t * 6)} ${66 + t * 5}" stroke="${p.accent}" stroke-width="3.5"/>`);
    return engines(id, t >= 2 ? [-14, 0, 14] : [0], L * 0.8, 9, 34 + t * 6, a, p) + wing
      + `<path d="M0 ${-L} C 20 ${-L * 0.7}, 24 ${-L * 0.2}, 22 ${L * 0.45} L 18 ${L * 0.8} L -18 ${L * 0.8} L -22 ${L * 0.45} C -24 ${-L * 0.2}, -20 ${-L * 0.7}, 0 ${-L} Z" fill="url(#${id}h)" ${stroke(p)}/>`
      + `<rect x="-2.5" y="${-L * 0.75}" width="5" height="${L * 1.4}" fill="${p.accent}" opacity="0.85"/>`
      + `<path d="M-8 ${-L * 0.68} Q0 ${-L * 0.9} 8 ${-L * 0.68} L6 ${-L * 0.5} L-6 ${-L * 0.5} Z" fill="${p.glow}" opacity="0.9"/>`
      + (t >= 1 ? turrets([-12, 12], t >= 3 ? [-30, 0, 30] : [-10], p) : "") + lights(90 + t * 8, 68 + t * 6, a);
  },
  // Ashkari: aggressive red arrowhead with spikes.
  wedge(p, t, id, a) {
    const L = 120 + t * 10, W = 70 + t * 14;
    const spikes = sym((s) => `<path d="M${s * W * 0.55} ${L * 0.15} L${s * (W + 12)} ${L * 0.05} L${s * W * 0.75} ${L * 0.35} Z" fill="${p.dark}" ${stroke(p)}/>`);
    return engines(id, t >= 2 ? [-22, 0, 22] : [-12, 12], L * 0.62, 8, 32 + t * 5, a, p) + spikes
      + `<path d="M0 ${-L} L${W} ${L * 0.6} L${W * 0.3} ${L * 0.5} L0 ${L * 0.65} L${-W * 0.3} ${L * 0.5} L${-W} ${L * 0.6} Z" fill="url(#${id}h)" ${stroke(p)}/>`
      + sym((s) => `<path d="M${s * 6} ${-L * 0.6} L${s * W * 0.7} ${L * 0.5}" stroke="${p.accent}" stroke-width="2.5" opacity="0.9"/>`)
      + `<path d="M-6 ${-L * 0.55} L0 ${-L * 0.8} L6 ${-L * 0.55} Z" fill="${p.glow}"/>`
      + turrets([-W * 0.3, W * 0.3], t >= 2 ? [0, 30] : [20], p) + lights(W, L * 0.58, a);
  },
  // Seraphine: graceful body with great feathered wings.
  winged(p, t, id, a) {
    const L = 110 + t * 10, W = 100 + t * 10;
    const feathers = (s: number) => Array.from({ length: 5 + t }, (_, i) => {
      const y = -10 + i * 14, x2 = s * (W - i * 10);
      return `<path d="M${s * 14} ${y} Q${s * (W * 0.6)} ${y - 30} ${x2} ${y + 10} Q${s * (W * 0.5)} ${y + 8} ${s * 14} ${y + 12} Z" fill="${i % 2 ? p.mid : p.light}" ${stroke(p)} opacity="0.95"/>`;
    }).join("");
    return engines(id, [0], L * 0.75, 8, 30 + t * 6, a, p) + feathers(1) + feathers(-1)
      + `<path d="M0 ${-L} C 16 ${-L * 0.6}, 16 ${L * 0.4}, 10 ${L * 0.75} L -10 ${L * 0.75} C -16 ${L * 0.4}, -16 ${-L * 0.6}, 0 ${-L} Z" fill="url(#${id}h)" ${stroke(p)}/>`
      + `<path d="M0 ${-L * 0.85} L5 ${-L * 0.6} L0 ${-L * 0.5} L-5 ${-L * 0.6} Z" fill="${p.accent}"/>`
      + glowDot(id, 0, -10, 9, a) + lights(W - 8, 4, a);
  },
  // Kethrak: segmented chitin body, mandibles, legs.
  insect(p, t, id, a) {
    const segs = 3 + t;
    let s = engines(id, [0], 40 + segs * 22, 7, 26, a, p);
    s += sym((k) => Array.from({ length: segs }, (_, i) => `<path d="M${k * 16} ${-20 + i * 24} Q${k * (52 + t * 4)} ${-30 + i * 24} ${k * (62 + t * 6)} ${-4 + i * 24}" stroke="${p.dark}" stroke-width="4" fill="none"/>`).join(""));
    for (let i = segs; i >= 0; i--) s += `<ellipse cx="0" cy="${-30 + i * 24}" rx="${24 - Math.abs(i - segs / 2) * 2}" ry="15" fill="url(#${id}r)" ${stroke(p)}/>`;
    s += sym((k) => `<path d="M${k * 8} -48 Q${k * 30} -80 ${k * 10} -102 Q${k * 22} -80 ${k * 2} -52 Z" fill="${p.mid}" ${stroke(p)}/>`);
    s += `<ellipse cx="0" cy="-50" rx="16" ry="13" fill="url(#${id}r)" ${stroke(p)}/>` + glowDot(id, -6, -54, 3.5, a) + glowDot(id, 6, -54, 3.5, a);
    return s;
  },
  // Ixil: soft, flowing body with trailing tendrils.
  symbiote(p, t, id, a) {
    const R = 46 + t * 8;
    const tend = Array.from({ length: 4 + t }, (_, i) => {
      const x = (i - (3 + t) / 2) * 14;
      const anim = a ? `<animate attributeName="d" values="M${x} ${R * 0.6} q8 30 -2 60 q-8 30 4 50;M${x} ${R * 0.6} q-8 30 2 60 q8 30 -4 50;M${x} ${R * 0.6} q8 30 -2 60 q-8 30 4 50" dur="${2 + i * 0.3}s" repeatCount="indefinite"/>` : "";
      return `<path d="M${x} ${R * 0.6} q8 30 -2 60 q-8 30 4 50" stroke="${p.mid}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.85">${anim}</path>`;
    }).join("");
    return tend + `<path d="M0 ${-R * 1.6} C ${R * 1.2} ${-R * 1.2}, ${R * 1.3} ${R * 0.4}, 0 ${R * 0.9} C ${-R * 1.3} ${R * 0.4}, ${-R * 1.2} ${-R * 1.2}, 0 ${-R * 1.6} Z" fill="url(#${id}r)" ${stroke(p)}/>`
      + `<path d="M0 ${-R * 1.2} C ${R * 0.6} ${-R * 0.8}, ${R * 0.6} 0, 0 ${R * 0.4} C ${-R * 0.6} 0, ${-R * 0.6} ${-R * 0.8}, 0 ${-R * 1.2} Z" fill="${p.light}" opacity="0.35"/>`
      + glowDot(id, 0, -R * 0.3, 10 + t * 2, a) + glowDot(id, -R * 0.45, -R * 0.6, 4, a) + glowDot(id, R * 0.45, -R * 0.6, 4, a);
  },
  // Ruuvak: fleshy brood carrier lined with egg sacs.
  brood(p, t, id, a) {
    const L = 100 + t * 14;
    let s = engines(id, [-12, 12], L * 0.7, 8, 28, a, p);
    s += `<ellipse cx="0" cy="0" rx="${36 + t * 6}" ry="${L * 0.75}" fill="url(#${id}r)" ${stroke(p)}/>`;
    for (let i = 0; i < 4 + t * 2; i++) {
      const y = -L * 0.55 + i * (L * 1.1 / (4 + t * 2));
      s += sym((k) => `<ellipse cx="${k * (34 + t * 6)}" cy="${n(y)}" rx="10" ry="12" fill="${p.accent}" opacity="0.85" ${stroke(p)}/><circle cx="${k * (34 + t * 6)}" cy="${n(y)}" r="4" fill="${p.mid}" opacity="0.6"/>`);
    }
    s += `<path d="M-18 ${-L * 0.7} Q0 ${-L} 18 ${-L * 0.7}" fill="${p.mid}" ${stroke(p)}/>` + glowDot(id, 0, -L * 0.72, 5, a);
    return s;
  },
  // Lumen: faceted crystal shard that glows from inside.
  crystal(p, t, id, a) {
    const L = 120 + t * 12, W = 40 + t * 8;
    const shards = sym((k) => `<path d="M${k * W * 0.6} ${-L * 0.1} L${k * (W + 30 + t * 6)} ${L * 0.2} L${k * W * 0.6} ${L * 0.4} Z" fill="${p.mid}" opacity="0.9" ${stroke(p)}/>`);
    return engines(id, [0], L * 0.7, 9, 30, a, p) + shards
      + `<path d="M0 ${-L} L${W} ${-L * 0.1} L${W * 0.5} ${L * 0.7} L${-W * 0.5} ${L * 0.7} L${-W} ${-L * 0.1} Z" fill="url(#${id}h)" ${stroke(p)}/>`
      + `<path d="M0 ${-L} L0 ${L * 0.7} M${W} ${-L * 0.1} L${-W * 0.5} ${L * 0.7} M${-W} ${-L * 0.1} L${W * 0.5} ${L * 0.7}" stroke="${p.light}" stroke-opacity="0.5" stroke-width="1"/>`
      + glowDot(id, 0, -L * 0.05, 14 + t * 3, a) + lights(W + 26 + t * 6, L * 0.2, a);
  },
  // Vossari: clean white hull wearing a glowing science halo.
  halo(p, t, id, a) {
    const L = 120 + t * 10, R = 50 + t * 10;
    const spin = a ? `<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="16s" repeatCount="indefinite"/>` : "";
    return engines(id, [-10, 10], L * 0.72, 7, 28, a, p)
      + `<path d="M0 ${-L} C 14 ${-L * 0.6}, 18 ${L * 0.4}, 14 ${L * 0.72} L -14 ${L * 0.72} C -18 ${L * 0.4}, -14 ${-L * 0.6}, 0 ${-L} Z" fill="url(#${id}h)" ${stroke(p)}/>`
      + `<circle r="${R}" fill="none" stroke="${p.glow}" stroke-width="7" opacity="0.35" filter="url(#${id}s)"/>`
      + `<g>${spin}<circle r="${R}" fill="none" stroke="${p.light}" stroke-width="3" stroke-dasharray="14 6"/></g>`
      + sym((k) => `<line x1="${k * 12}" y1="0" x2="${k * (R - 3)}" y2="0" stroke="${p.mid}" stroke-width="3"/>`)
      + glowDot(id, 0, 0, 10, a) + `<path d="M-6 ${-L * 0.7} Q0 ${-L * 0.88} 6 ${-L * 0.7} Z" fill="${p.accent}"/>`;
  },
  // Velari: twin crescent moons around a starlit core.
  crescent(p, t, id, a) {
    const R = 70 + t * 10;
    return engines(id, [0], R * 0.75, 8, 30, a, p)
      + `<path d="M${-R} 10 A ${R} ${R} 0 0 1 ${R} 10 A ${R * 0.8} ${R * 0.68} 0 0 0 ${-R} 10 Z" fill="url(#${id}h)" ${stroke(p)} transform="translate(0 -20)"/>`
      + `<path d="M0 ${-R * 0.55} L 14 ${R * 0.75} L -14 ${R * 0.75} Z" fill="url(#${id}v)" ${stroke(p)}/>`
      + Array.from({ length: 6 + t * 2 }, (_, i) => `<circle cx="${n(Math.cos(3.4 + i * 0.4) * R * 0.85)}" cy="${n(Math.sin(3.4 + i * 0.4) * R * 0.85 - 6)}" r="1.6" fill="${p.accent}"${a ? `><animate attributeName="opacity" values="1;0.3;1" dur="${1 + (i % 3) * 0.4}s" repeatCount="indefinite"/></circle>` : "/>"}`).join("")
      + glowDot(id, 0, -R * 0.15, 9 + t * 2, a);
  },
  // Thraal: a hollowed asteroid glowing with magma cracks.
  rock(p, t, id, a) {
    const R = 60 + t * 12;
    const pts = Array.from({ length: 11 }, (_, i) => {
      const ang = (i / 11) * Math.PI * 2;
      const r = R * (0.82 + ((i * 37) % 10) / 40);
      return `${n(Math.cos(ang) * r)} ${n(Math.sin(ang) * r * 1.15)}`;
    });
    const cracks = `<path d="M${-R * 0.5} ${-R * 0.3} L${-R * 0.1} 0 L${R * 0.2} ${-R * 0.4} M${-R * 0.1} 0 L${R * 0.1} ${R * 0.5} M${R * 0.4} ${R * 0.1} L${R * 0.1} ${R * 0.2}" stroke="${p.accent}" stroke-width="3" fill="none" filter="url(#${id}s)"${a ? `><animate attributeName="stroke-opacity" values="1;0.5;1" dur="2.2s" repeatCount="indefinite"/></path>` : "/>"}`;
    return engines(id, t >= 2 ? [-20, 0, 20] : [-12, 12], R * 1.05, 9, 30, a, p)
      + `<path d="M${pts.join(" L")} Z" fill="url(#${id}r)" ${stroke(p)}/>` + cracks
      + `<circle cx="${-R * 0.35}" cy="${R * 0.4}" r="${R * 0.12}" fill="${p.dark}" opacity="0.6"/><circle cx="${R * 0.45}" cy="${-R * 0.5}" r="${R * 0.09}" fill="${p.dark}" opacity="0.6"/>`
      + glowDot(id, 0, -R * 0.95, 6, a);
  },
  // Gorrath: heavy worldship of bolted industrial blocks and many engines.
  block(p, t, id, a) {
    const rows = 3 + t, W = 40 + t * 8;
    let s = engines(id, Array.from({ length: 2 + t }, (_, i) => (i - (1 + t) / 2) * 18), -50 + rows * 34 + 6, 8, 30, a, p);
    for (let i = 0; i < rows; i++) {
      const w = W - Math.abs(i - rows / 2) * 6;
      s += `<rect x="${-w}" y="${-60 + i * 34}" width="${w * 2}" height="30" rx="3" fill="url(#${id}h)" ${stroke(p)}/>`;
      s += `<rect x="${-w + 6}" y="${-52 + i * 34}" width="${w * 2 - 12}" height="4" fill="${p.accent}" opacity="0.7"/>`;
    }
    s += `<path d="M${-W * 0.6} -60 L0 -96 L${W * 0.6} -60 Z" fill="url(#${id}v)" ${stroke(p)}/>`;
    s += sym((k) => `<rect x="${k > 0 ? W + 2 : -W - 14}" y="-30" width="12" height="${rows * 22}" rx="4" fill="${p.mid}" ${stroke(p)}/>`);
    return s + turrets([-W * 0.5, W * 0.5], [-40, 10], p) + lights(W + 8, -32, a);
  },
  // Nyx: a cold black cube lattice with red sensor eyes.
  cube(p, t, id, a) {
    const S = 34 + t * 6;
    let s = engines(id, [-S * 0.5, S * 0.5], S * 1.6, 7, 26, a, p);
    for (let y = -1; y <= 1 + Math.floor(t / 2); y++) for (let x = -1; x <= 1; x++) {
      if (Math.abs(x) + Math.abs(y) > 1 + t) continue;
      s += `<rect x="${n(x * S - S / 2)}" y="${n(y * S - S / 2)}" width="${S - 3}" height="${S - 3}" fill="url(#${id}h)" ${stroke(p)}/>`;
      s += `<rect x="${n(x * S - S / 2 + 6)}" y="${n(y * S - S / 2 + 6)}" width="${S - 15}" height="${S - 15}" fill="none" stroke="${p.accent}" stroke-opacity="0.35"/>`;
    }
    s += `<path d="M${-S / 2} ${-S * 1.5} L0 ${-S * 2.2} L${S / 2} ${-S * 1.5} Z" fill="url(#${id}v)" ${stroke(p)}/>`;
    return s + glowDot(id, 0, -S * 1.7, 5, a) + glowDot(id, -S, 0, 3.5, a) + glowDot(id, S, 0, 3.5, a) + glowDot(id, 0, 0, 6, a);
  },
  // Raxxan: patched-together salvage with hazard stripes and mismatched parts.
  salvage(p, t, id, a) {
    const L = 100 + t * 12;
    let s = engines(id, [-16, 10], L * 0.7, 9, 30, a, p);
    s += `<path d="M-6 ${-L} L 26 ${-L * 0.4} L 30 ${L * 0.7} L -28 ${L * 0.7} L -34 ${-L * 0.2} Z" fill="url(#${id}h)" ${stroke(p)}/>`;
    s += `<rect x="24" y="${-L * 0.2}" width="${50 + t * 8}" height="22" fill="${p.mid}" ${stroke(p)} transform="rotate(12 24 ${-L * 0.2})"/>`;
    s += `<rect x="${-84 - t * 8}" y="${L * 0.05}" width="${50 + t * 8}" height="26" fill="url(#${id}v)" ${stroke(p)} transform="rotate(-8 -34 ${L * 0.05})"/>`;
    for (let i = 0; i < 5; i++) s += `<rect x="${-26 + i * 10}" y="${L * 0.45}" width="6" height="14" fill="${i % 2 ? p.dark : p.accent}"/>`;
    s += `<rect x="-14" y="${-L * 0.5}" width="18" height="14" fill="${p.light}" opacity="0.6" ${stroke(p)}/><rect x="2" y="${-L * 0.1}" width="14" height="20" fill="${p.dark}" opacity="0.5"/>`;
    s += `<rect x="${60 + t * 8}" y="${-L * 0.1}" width="3" height="${30 + t * 6}" fill="${p.mid}"/>`;
    return s + turrets([-18, 14], [0], p) + glowDot(id, -4, -L * 0.75, 4, a);
  },
  // Orrun: a trader hauling a grid of shipping containers.
  freighter(p, t, id, a) {
    const rows = 2 + t, L = 50 + rows * 28;
    let s = engines(id, [-16, 16], L, 10, 32, a, p);
    s += `<rect x="-10" y="${-L}" width="20" height="${L * 2}" rx="4" fill="url(#${id}h)" ${stroke(p)}/>`;
    for (let i = 0; i < rows; i++) for (const k of [-1, 1]) {
      const cols = ["#2fd6c0", "#f1dc9c", "#c25b5b", "#5b8cc2"];
      s += `<rect x="${k > 0 ? 14 : -50}" y="${-L * 0.6 + i * 28}" width="36" height="24" rx="2" fill="${cols[(i + (k > 0 ? 1 : 0)) % 4]}" ${stroke(p)}/>`;
      s += `<path d="M${k > 0 ? 20 : -44} ${-L * 0.6 + i * 28 + 4} v16 M${k > 0 ? 28 : -36} ${-L * 0.6 + i * 28 + 4} v16 M${k > 0 ? 36 : -28} ${-L * 0.6 + i * 28 + 4} v16" stroke="${p.dark}" stroke-opacity="0.4"/>`;
    }
    s += `<path d="M-24 ${-L} Q0 ${-L - 30} 24 ${-L} Z" fill="url(#${id}v)" ${stroke(p)}/>`;
    return s + `<rect x="-12" y="${-L - 4}" width="24" height="6" fill="${p.accent}"/>` + lights(52, -L * 0.6, a);
  },
  // Drovani: a manta ray gliding through the void.
  manta(p, t, id, a) {
    const W = 100 + t * 10, L = 90 + t * 10;
    const tail = `<path d="M0 ${L * 0.4} Q 6 ${L} 0 ${L * 1.4}" stroke="${p.mid}" stroke-width="4" fill="none"${a ? `><animate attributeName="d" values="M0 ${L * 0.4} Q 10 ${L} 0 ${L * 1.4};M0 ${L * 0.4} Q -10 ${L} 0 ${L * 1.4};M0 ${L * 0.4} Q 10 ${L} 0 ${L * 1.4}" dur="2.4s" repeatCount="indefinite"/></path>` : "/>"}`;
    return engines(id, [-16, 16], L * 0.45, 7, 24, a, p) + tail
      + `<path d="M0 ${-L} C ${W * 0.4} ${-L * 0.8}, ${W} ${-L * 0.1}, ${W} ${L * 0.15} C ${W * 0.5} ${L * 0.1}, ${W * 0.2} ${L * 0.5}, 0 ${L * 0.5} C ${-W * 0.2} ${L * 0.5}, ${-W * 0.5} ${L * 0.1}, ${-W} ${L * 0.15} C ${-W} ${-L * 0.1}, ${-W * 0.4} ${-L * 0.8}, 0 ${-L} Z" fill="url(#${id}h)" ${stroke(p)}/>`
      + sym((k) => `<path d="M${k * 10} ${-L * 0.5} Q${k * W * 0.5} ${-L * 0.2} ${k * W * 0.85} ${L * 0.1}" stroke="${p.accent}" stroke-opacity="0.5" fill="none"/>`)
      + glowDot(id, -14, -L * 0.62, 4, a) + glowDot(id, 14, -L * 0.62, 4, a) + glowDot(id, 0, -L * 0.2, 7, a);
  },
  // Verdane: a living seed pod wrapped in leaves.
  pod(p, t, id, a) {
    const L = 100 + t * 12;
    const leaves = sym((k) => Array.from({ length: 2 + t }, (_, i) => `<path d="M${k * 10} ${-L * 0.3 + i * 30} Q${k * (70 + t * 6)} ${-L * 0.5 + i * 30} ${k * (80 + t * 8)} ${-L * 0.1 + i * 30} Q${k * 40} ${-L * 0.05 + i * 30} ${k * 10} ${-L * 0.15 + i * 30} Z" fill="${i % 2 ? p.mid : p.light}" ${stroke(p)}/>`).join(""));
    return engines(id, [0], L * 0.75, 8, 26, a, p) + leaves
      + `<ellipse cx="0" cy="0" rx="${28 + t * 4}" ry="${L * 0.78}" fill="url(#${id}r)" ${stroke(p)}/>`
      + `<path d="M0 ${-L * 0.75} Q 10 0 0 ${L * 0.75} M0 ${-L * 0.75} Q -10 0 0 ${L * 0.75}" stroke="${p.dark}" stroke-opacity="0.5" fill="none"/>`
      + glowDot(id, 0, -L * 0.2, 7, a) + `<circle cx="0" cy="${-L * 0.82}" r="5" fill="${p.accent}"/>`;
  },
  // Quorai: a living star caged in energy rings.
  orb(p, t, id, a) {
    const R = 42 + t * 8;
    const ring = (rx: number, ry: number, rot: number, d: string) =>
      `<g transform="rotate(${rot})"><ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${p.mid}" stroke-width="3" opacity="0.8"/>${a ? `<ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${p.accent}" stroke-width="2" stroke-dasharray="8 30"><animate attributeName="stroke-dashoffset" values="0;-76" dur="${d}" repeatCount="indefinite"/></ellipse>` : ""}</g>`;
    return `<circle r="${R * 1.9}" fill="url(#${id}g)" opacity="0.5"/>`
      + ring(R * 1.6, R * 0.55, -25, "2s") + ring(R * 1.6, R * 0.55, 25, "2.6s") + (t >= 2 ? ring(R * 1.4, R * 0.45, 90, "3s") : "")
      + `<circle r="${R}" fill="url(#${id}r)"/>` + glowDot(id, 0, 0, R * 0.8, a)
      + `<path d="M0 ${-R * 1.1} L 6 ${-R * 1.7} L -6 ${-R * 1.7} Z" fill="${p.mid}"/>`;
  },
  // Tarkhan: a long-barrelled hunter with a single red eye.
  hunter(p, t, id, a) {
    const L = 125 + t * 12;
    const barrels = sym((k) => `<rect x="${k * (16 + t * 3) - 3}" y="${-L * 1.05}" width="6" height="${L * 0.75}" fill="${p.mid}" ${stroke(p)}/><circle cx="${k * (16 + t * 3)}" cy="${-L * 1.05}" r="3.5" fill="${p.accent}" opacity="0.9"/>`);
    return engines(id, [-10, 10], L * 0.6, 7, 30, a, p)
      + sym((k) => `<path d="M${k * 14} ${L * 0.05} L${k * (60 + t * 8)} ${L * 0.45} L${k * 16} ${L * 0.5} Z" fill="url(#${id}v)" ${stroke(p)}/>`)
      + `<path d="M0 ${-L * 0.7} L 22 ${-L * 0.2} L 18 ${L * 0.6} L -18 ${L * 0.6} L -22 ${-L * 0.2} Z" fill="url(#${id}h)" ${stroke(p)}/>`
      + barrels + glowDot(id, 0, -L * 0.3, 7, a) + `<circle cx="0" cy="${-L * 0.3}" r="3" fill="${p.accent}"/>`
      + (t >= 2 ? turrets([0], [L * 0.15], p) : "");
  },
};
