// 3D ships built in code, one shape family per race (same families and colours as the 2D
// ship art in ui/shipArt.ts). Hull size sets length and how many guns and engines a ship has.
// Nose points along +X. Placeholder art until real models arrive; the viewer only needs
// `root`, the gun `muzzles`, the `engines` and a rough `radius`.

import * as THREE from "three";
import type { HullSize } from "../../engine/data/ships";
import { RACE_STYLE, type Family, type Palette } from "../shipArt";
import { shipModel } from "./shipModels";

export interface Ship3D {
  root: THREE.Group;
  muzzles: THREE.Vector3[];
  engines: THREE.Vector3[];
  radius: number;
  glow: THREE.Color;
}

export const LENGTH: Record<HullSize, number> = { small: 3, medium: 5, large: 8, huge: 12, titan: 22, colossus: 34 };
const GUNS: Record<HullSize, number> = { small: 1, medium: 2, large: 4, huge: 6, titan: 10, colossus: 16 };

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);

// ---- shared textures and materials ----
let panelTex: THREE.CanvasTexture | null = null;
function panels(): THREE.CanvasTexture {
  if (panelTex) return panelTex;
  const c = document.createElement("canvas"); c.width = 512; c.height = 256;
  const g = c.getContext("2d")!;
  const r = rng(7);
  g.fillStyle = "#9aa0a8"; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 160; i++) {
    const s = (r() * 40 - 20) | 0, x = r() * 512, y = r() * 256, w = 20 + r() * 110, h = 10 + r() * 50;
    g.fillStyle = `rgb(${154 + s},${160 + s},${168 + s})`; g.fillRect(x, y, w, h);
    g.strokeStyle = "rgba(20,24,30,.6)"; g.lineWidth = 1.5; g.strokeRect(x, y, w, h);
  }
  g.fillStyle = "rgba(20,24,30,.5)";
  for (let i = 0; i < 700; i++) g.fillRect(r() * 512, r() * 256, 1.5, 1.5);
  panelTex = new THREE.CanvasTexture(c);
  panelTex.wrapS = panelTex.wrapT = THREE.RepeatWrapping;
  panelTex.repeat.set(2, 1);
  panelTex.colorSpace = THREE.SRGBColorSpace;
  return panelTex;
}

interface Mats { hull: THREE.Material; dark: THREE.Material; accent: THREE.Material; glow: THREE.Material; flesh: THREE.Material; crystal: THREE.Material }
const matCache = new Map<string, Mats>();
function mats(p: Palette): Mats {
  const key = p.mid + p.glow;
  const hit = matCache.get(key);
  if (hit) return hit;
  const tex = panels();
  const m: Mats = {
    hull: new THREE.MeshStandardMaterial({ color: p.light, map: tex, bumpMap: tex, bumpScale: 1.2, metalness: 0.75, roughness: 0.38, envMapIntensity: 0.6 }),
    dark: new THREE.MeshStandardMaterial({ color: p.dark, map: tex, metalness: 0.8, roughness: 0.45, envMapIntensity: 0.5 }),
    accent: new THREE.MeshStandardMaterial({ color: p.accent, metalness: 0.5, roughness: 0.4, emissive: p.accent, emissiveIntensity: 0.25 }),
    glow: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: p.glow, emissiveIntensity: 2.2 }),
    flesh: new THREE.MeshPhysicalMaterial({ color: p.mid, roughness: 0.45, metalness: 0.05, clearcoat: 0.7, clearcoatRoughness: 0.35, sheen: 0.4, sheenColor: new THREE.Color(p.light) }),
    crystal: new THREE.MeshPhysicalMaterial({ color: p.mid, emissive: p.glow, emissiveIntensity: 0.22, roughness: 0.1, metalness: 0, transmission: 0.3, thickness: 1, transparent: true, opacity: 0.92 }),
  };
  matCache.set(key, m);
  return m;
}

// ---- small builders ----
type Add = (geo: THREE.BufferGeometry, mat: THREE.Material, x?: number, y?: number, z?: number) => THREE.Mesh;

function lathe(profile: [number, number][], seg = 24): THREE.LatheGeometry {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(0.001, r), y)), seg);
  g.rotateZ(-Math.PI / 2); // lathe axis +Y -> +X
  return g;
}
function bumpy(g: THREE.BufferGeometry, amount: number, freq: number): THREE.BufferGeometry {
  g.computeVertexNormals();
  const p = g.attributes.position!, n = g.attributes.normal!;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const d = (Math.sin(x * freq) * 0.5 + Math.sin(y * freq * 1.7 + x) * 0.3 + Math.sin(z * freq * 1.3) * 0.2) * amount;
    p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d);
  }
  g.computeVertexNormals();
  return g;
}
function tube(points: [number, number, number][], r: number): THREE.TubeGeometry {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))), 24, r, 6);
}

/** Build one ship of a race and hull size. */
export function buildShip(raceId: string, hull: HullSize): Ship3D {
  const style = RACE_STYLE[raceId] ?? RACE_STYLE.humans!;
  const p = style.p;
  const model = shipModel(raceId, LENGTH[hull], hull);
  if (model) return fromModel(model, hull, new THREE.Color(p.glow));
  const M = mats(p);
  const L = LENGTH[hull];
  const r = rng(hash(raceId + hull));
  const root = new THREE.Group();
  const muzzles: THREE.Vector3[] = [];
  const engines: THREE.Vector3[] = [];
  const add: Add = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); root.add(m); return m; };
  const box = (w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z);
  const guns = GUNS[hull];
  const turret = (x: number, y: number, z: number, flip = false) => {
    const base = add(new THREE.CylinderGeometry(L * 0.04, L * 0.05, L * 0.03, 10), M.dark, x, y, z);
    if (flip) base.rotation.x = Math.PI;
    const bg = new THREE.CylinderGeometry(L * 0.008, L * 0.011, L * 0.14, 6); bg.rotateZ(-Math.PI / 2);
    add(bg, M.dark, x + L * 0.07, y + (flip ? -1 : 1) * L * 0.025, z);
    muzzles.push(new THREE.Vector3(x + L * 0.14, y + (flip ? -1 : 1) * L * 0.025, z));
  };
  const engine = (x: number, y: number, z: number, rad: number) => {
    const eg = new THREE.CylinderGeometry(rad * 0.85, rad, rad * 1.6, 14); eg.rotateZ(Math.PI / 2);
    add(eg, M.dark, x, y, z);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(rad * 0.75, 14), M.glow); disc.rotation.y = -Math.PI / 2; disc.position.set(x - rad * 0.81, y, z); root.add(disc);
    engines.push(new THREE.Vector3(x - rad * 0.9, y, z));
  };
  const emitter = (x: number, y: number, z: number, rad = L * 0.05) => {
    add(new THREE.SphereGeometry(rad, 12, 8), M.glow, x, y, z);
    muzzles.push(new THREE.Vector3(x, y, z));
  };
  const fam: Family = style.family;
  const H = L * 0.5;

  switch (fam) {
    case "sleek": { // long hull, wedge prow, nacelles, bridge
      box(L * 0.7, L * 0.12, L * 0.2, M.hull, -L * 0.05);
      const pr = new THREE.ConeGeometry(L * 0.13, L * 0.3, 4); pr.rotateY(Math.PI / 4); pr.rotateZ(-Math.PI / 2);
      const prow = add(pr, M.hull, L * 0.45); prow.scale.set(1, 0.7, 1.15);
      box(L * 0.25, L * 0.08, L * 0.12, M.dark, -L * 0.2, L * 0.1);
      box(L * 0.02, L * 0.03, L * 0.13, M.glow, -L * 0.07, L * 0.12);
      for (const s of [1, -1]) { box(L * 0.4, L * 0.07, L * 0.07, M.dark, -L * 0.18, -L * 0.02, s * L * 0.17); engine(-L * 0.4, -L * 0.02, s * L * 0.17, L * 0.045); }
      box(L * 0.3, L * 0.02, L * 0.22, M.accent, L * 0.1, L * 0.065);
      for (let i = 0; i < guns; i++) turret(L * 0.25 - i * L * 0.15, L * 0.065, 0, i % 2 === 1);
      break;
    }
    case "wedge": case "hunter": { // flat triangular blade
      const sh = new THREE.Shape(); sh.moveTo(H, 0); sh.lineTo(-H, H * 0.55); sh.lineTo(-H * 0.8, 0); sh.lineTo(-H, -H * 0.55); sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, { depth: L * 0.08, bevelEnabled: true, bevelThickness: L * 0.02, bevelSize: L * 0.02, bevelSegments: 1 });
      g.rotateX(Math.PI / 2); g.translate(0, L * 0.04, 0);
      add(g, fam === "hunter" ? M.dark : M.hull);
      box(L * 0.45, L * 0.07, L * 0.12, M.dark, -L * 0.1, L * 0.07);
      box(L * 0.3, L * 0.015, L * 0.02, M.accent, 0, L * 0.11);
      if (fam === "hunter") for (const s of [1, -1]) box(L * 0.35, L * 0.03, L * 0.03, M.dark, L * 0.55, 0, s * L * 0.07);
      else for (let i = 0; i < 4; i++) { const sp = new THREE.ConeGeometry(L * 0.02, L * 0.12, 5); sp.rotateZ(-Math.PI / 2); add(sp, M.accent, -L * 0.3 + i * L * 0.04, L * 0.12, (i % 2 ? 1 : -1) * L * 0.1); }
      for (const s of [1, -1]) engine(-H * 0.85, 0, s * L * 0.15, L * 0.05);
      for (let i = 0; i < guns; i++) emitter(L * 0.3 - i * L * 0.12, L * 0.0, (i % 2 ? 1 : -1) * (L * 0.08 + i * L * 0.04), L * 0.025);
      break;
    }
    case "winged": { // white spindle with great swept wings
      add(lathe([[0, -H], [L * 0.06, -H * 0.8], [L * 0.09, 0], [L * 0.06, H * 0.7], [0, H]]), M.hull);
      for (const s of [1, -1]) {
        const w = box(L * 0.45, L * 0.015, L * 0.55, M.hull, -L * 0.12, 0, s * L * 0.3);
        w.rotation.y = s * 0.45; w.rotation.x = s * 0.12;
        box(L * 0.42, L * 0.02, L * 0.02, M.accent, -L * 0.1, L * 0.01, s * L * 0.56);
        emitter(L * 0.05, 0, s * L * 0.5, L * 0.03);
      }
      engine(-H, 0, 0, L * 0.06);
      for (let i = 2; i < guns; i++) emitter(L * 0.35 - i * L * 0.05, L * 0.08, 0, L * 0.025);
      break;
    }
    case "crescent": case "halo": {
      const arc = fam === "crescent" ? Math.PI * 1.25 : Math.PI * 2;
      const ring = add(new THREE.TorusGeometry(L * 0.32, L * 0.045, 10, 48, arc), M.hull);
      ring.rotation.x = Math.PI / 2;
      if (fam === "crescent") ring.rotation.z = Math.PI * 0.375 + Math.PI;
      add(lathe([[0, -H * 0.7], [L * 0.07, -H * 0.4], [L * 0.08, H * 0.2], [0, H * 0.75]]), M.dark);
      add(new THREE.SphereGeometry(L * 0.07, 16, 10), M.glow, L * 0.05, 0, 0);
      for (let i = 0; i < Math.max(2, guns); i++) { const a = (i / Math.max(2, guns)) * arc + (fam === "crescent" ? -arc / 2 : 0); emitter(Math.cos(a) * L * 0.32, 0, Math.sin(a) * L * 0.32, L * 0.03); }
      engine(-H * 0.7, 0, 0, L * 0.05);
      break;
    }
    case "orb": {
      add(new THREE.SphereGeometry(L * 0.28, 32, 20), M.dark);
      const ring = add(new THREE.TorusGeometry(L * 0.42, L * 0.03, 8, 48), M.hull); ring.rotation.x = Math.PI / 2;
      const ring2 = add(new THREE.TorusGeometry(L * 0.36, L * 0.012, 8, 48), M.accent); ring2.rotation.x = Math.PI / 2 + 0.3;
      add(new THREE.SphereGeometry(L * 0.06, 16, 10), M.glow, L * 0.27, 0, 0);
      for (let i = 0; i < guns; i++) { const a = (i / guns) * Math.PI * 2; emitter(Math.cos(a) * L * 0.42, 0, Math.sin(a) * L * 0.42, L * 0.03); }
      engine(-L * 0.3, 0, 0, L * 0.07);
      break;
    }
    case "crystal": {
      const n = 4 + guns * 2;
      for (let i = 0; i < n; i++) {
        const c = add(new THREE.OctahedronGeometry(L * (0.08 + r() * 0.1), 0), M.crystal, (r() - 0.5) * L * 0.7, (r() - 0.5) * L * 0.3, (r() - 0.5) * L * 0.35);
        c.scale.set(1 + r() * 2.5, 0.6, 0.6); c.rotation.set(r(), r(), r());
      }
      add(new THREE.OctahedronGeometry(L * 0.2, 0), M.crystal).scale.set(2.4, 0.8, 0.8);
      add(new THREE.SphereGeometry(L * 0.035, 12, 8), M.glow);
      for (let i = 0; i < guns; i++) emitter(L * 0.3 - i * L * 0.1, (r() - 0.5) * L * 0.15, (r() - 0.5) * L * 0.2, L * 0.03);
      engines.push(new THREE.Vector3(-H, 0, 0));
      break;
    }
    case "cube": {
      add(new THREE.BoxGeometry(L * 0.5, L * 0.5, L * 0.5), M.dark);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(L * 0.51, L * 0.51, L * 0.51)), new THREE.LineBasicMaterial({ color: p.glow }));
      root.add(edges);
      for (let i = 0; i < 3 + guns; i++) {
        const s = L * (0.08 + r() * 0.12);
        add(new THREE.BoxGeometry(s, s, s), M.dark, (r() - 0.5) * L * 0.6, (r() - 0.5) * L * 0.6, (r() - 0.5) * L * 0.6);
      }
      for (let i = 0; i < 6; i++) box(L * 0.52, L * 0.008, L * 0.008, M.glow, 0, (i / 5 - 0.5) * L * 0.5, L * 0.255);
      for (let i = 0; i < guns; i++) emitter(L * 0.26, (i / Math.max(1, guns - 1) - 0.5) * L * 0.3, 0, L * 0.03);
      engines.push(new THREE.Vector3(-L * 0.26, 0, 0));
      break;
    }
    case "block": case "freighter": case "salvage": {
      const parts = fam === "freighter" ? 5 + guns : fam === "salvage" ? 6 + guns * 2 : 3 + guns;
      box(L * 0.85, L * 0.08, L * 0.08, M.dark); // spine
      for (let i = 0; i < parts; i++) {
        const t = i / Math.max(1, parts - 1);
        const w = fam === "block" ? L * 0.22 : L * (0.08 + r() * 0.12);
        const h = fam === "block" ? L * 0.22 + r() * L * 0.08 : L * (0.06 + r() * 0.12);
        const d = fam === "freighter" ? L * 0.16 : L * (0.08 + r() * 0.16);
        const b = box(w, h, d, fam === "salvage" ? (r() < 0.5 ? M.hull : M.dark) : i % 2 ? M.hull : M.dark,
          (t - 0.5) * L * 0.75, fam === "freighter" ? (i % 2 ? 1 : -1) * L * 0.07 : (r() - 0.5) * L * 0.08, (r() - 0.5) * (fam === "salvage" ? L * 0.2 : L * 0.04));
        if (fam === "salvage") b.rotation.set((r() - 0.5) * 0.6, (r() - 0.5) * 0.6, (r() - 0.5) * 0.6);
      }
      box(L * 0.2, L * 0.02, L * 0.25, M.accent, L * 0.3, L * 0.13);
      for (const s of [1, -1]) engine(-L * 0.45, 0, s * L * 0.08, L * 0.05);
      for (let i = 0; i < guns; i++) turret(L * 0.3 - i * L * 0.12, L * 0.13, (i % 2 ? 1 : -1) * L * 0.05, i % 3 === 2);
      break;
    }
    case "rock": {
      add(bumpy(new THREE.IcosahedronGeometry(L * 0.32, 3), L * 0.05, 3 / L * 6), M.dark).scale.set(1.5, 0.8, 0.9);
      for (let i = 0; i < 3 + guns; i++) add(new THREE.DodecahedronGeometry(L * (0.06 + r() * 0.08), 0), M.dark, (r() - 0.5) * L * 0.8, (r() - 0.3) * L * 0.3, (r() - 0.5) * L * 0.4);
      for (let i = 0; i < 6; i++) box(L * 0.3, L * 0.012, L * 0.012, M.glow, (r() - 0.5) * L * 0.4, (r() - 0.5) * L * 0.25, (r() > 0.5 ? 1 : -1) * L * 0.27).rotation.y = (r() - 0.5) * 0.8;
      for (const s of [1, -1]) engine(-L * 0.48, 0, s * L * 0.1, L * 0.06);
      for (let i = 0; i < guns; i++) turret(L * 0.2 - i * L * 0.12, L * 0.24, (i % 2 ? 1 : -1) * L * 0.06);
      break;
    }
    case "insect": case "brood": case "symbiote": case "pod": case "manta": {
      const prof: [number, number][] =
        fam === "insect" ? [[0, -H], [L * 0.07, -H * 0.85], [L * 0.1, -H * 0.55], [L * 0.07, -H * 0.4], [L * 0.12, -H * 0.15], [L * 0.08, H * 0.05], [L * 0.1, H * 0.3], [L * 0.06, H * 0.6], [0, H]]
        : fam === "brood" ? [[0, -H], [L * 0.15, -H * 0.6], [L * 0.2, -H * 0.1], [L * 0.15, H * 0.35], [L * 0.08, H * 0.7], [0, H]]
        : fam === "pod" ? [[0, -H], [L * 0.08, -H * 0.7], [L * 0.16, -H * 0.1], [L * 0.12, H * 0.5], [0, H]]
        : fam === "manta" ? [[0, -H], [L * 0.1, -H * 0.5], [L * 0.12, H * 0.1], [L * 0.07, H * 0.7], [0, H]]
        : [[0, -H], [L * 0.1, -H * 0.6], [L * 0.13, 0], [L * 0.09, H * 0.6], [0, H]];
      const body = add(bumpy(lathe(prof, 28), L * 0.012, 18 / L), M.flesh);
      if (fam === "manta") body.scale.set(1, 0.45, 1);
      if (fam === "manta") for (const s of [1, -1]) { const w = add(new THREE.SphereGeometry(L * 0.3, 20, 10), M.flesh, -L * 0.05, 0, s * L * 0.25); w.scale.set(1, 0.08, 0.9); }
      if (fam === "pod") for (const s of [1, -1]) { const leaf = add(new THREE.SphereGeometry(L * 0.18, 16, 8), M.accent, -L * 0.15, 0, s * L * 0.16); leaf.scale.set(1.6, 0.12, 0.8); leaf.rotation.y = s * 0.5; }
      if (fam === "brood") for (let i = 0; i < 3 + guns; i++) { const a = r() * Math.PI * 2; add(new THREE.SphereGeometry(L * (0.05 + r() * 0.05), 12, 8), M.flesh, (r() - 0.5) * L * 0.5, Math.cos(a) * L * 0.2, Math.sin(a) * L * 0.2); }
      if (fam === "insect") for (const s of [1, -1]) { add(tube([[H * 0.6, 0, s * L * 0.04], [H * 0.85, 0, s * L * 0.1], [H * 1.05, 0, s * L * 0.04]], L * 0.012), M.dark); for (let k = 0; k < 3; k++) add(tube([[-k * L * 0.1, 0, s * L * 0.08], [-k * L * 0.1 - L * 0.04, -L * 0.06, s * L * 0.2], [-k * L * 0.1 - L * 0.1, -L * 0.12, s * L * 0.22]], L * 0.008), M.dark); }
      if (fam === "symbiote") for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; add(tube([[-H, Math.cos(a) * L * 0.03, Math.sin(a) * L * 0.03], [-H - L * 0.15, Math.cos(a) * L * 0.1, Math.sin(a) * L * 0.1], [-H - L * 0.35, Math.cos(a + 0.6) * L * 0.12, Math.sin(a + 0.6) * L * 0.12]], L * 0.012), M.flesh); }
      // glowing sacs are the weapons
      for (let i = 0; i < guns; i++) { const a = (i / guns) * Math.PI * 2 + 0.4; const rr = (fam === "brood" ? 0.2 : 0.12) * L; emitter(L * 0.1 - (i % 2) * L * 0.1, Math.cos(a) * rr * (fam === "manta" ? 0.45 : 1), Math.sin(a) * rr, L * 0.035); }
      engines.push(new THREE.Vector3(-H, 0, 0));
      add(new THREE.SphereGeometry(L * 0.03, 10, 6), M.glow, H * 0.82, L * 0.04, 0);
      break;
    }
  }
  if (!muzzles.length) muzzles.push(new THREE.Vector3(H, 0, 0));
  if (!engines.length) engines.push(new THREE.Vector3(-H, 0, 0));
  return { root, muzzles, engines, radius: L * 0.55, glow: new THREE.Color(p.glow) };
}

/** A small fighter craft for carrier wings. */
export function buildFighter(raceId: string): Ship3D {
  const s = buildShip(raceId, "small");
  s.root.scale.setScalar(0.45);
  s.radius *= 0.45;
  return s;
}

/** Wraps a Blender-made model (see shipModels.ts) as a Ship3D: guns at the bow and along the
 *  flanks, engines at the stern, both worked out from the model's size. */
function fromModel(root: THREE.Group, hull: HullSize, glow: THREE.Color): Ship3D {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const L = LENGTH[hull];
  const muzzles: THREE.Vector3[] = [];
  const n = GUNS[hull];
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? -1 : 1;
    const along = n === 1 ? 0.45 : 0.45 - Math.floor(i / 2) * 0.28; // bow first, then along the flanks
    muzzles.push(new THREE.Vector3(box.max.x * along * 2 - box.max.x * (along > 0.3 ? 0 : 0.3), size.y * 0.15, side * size.z * (n === 1 ? 0 : 0.3)));
  }
  const engines: THREE.Vector3[] = [];
  const ne = hull === "small" ? 1 : hull === "titan" || hull === "colossus" ? 5 : hull === "huge" ? 3 : 2;
  for (let i = 0; i < ne; i++) engines.push(new THREE.Vector3(box.min.x, 0, ne === 1 ? 0 : (i / (ne - 1) - 0.5) * size.z * 0.35));
  return { root, muzzles, engines, radius: Math.max(L * 0.55, Math.max(size.y, size.z) * 0.5), glow };
}
