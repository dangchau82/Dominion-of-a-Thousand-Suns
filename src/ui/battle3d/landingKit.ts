// Models for the ground and sea landing scenes, built in Blender (E:\Tools\Blender\models\landing,
// made by the main Claude through the Blender link) and shipped as small .glb files in
// public/models/landing. Each model has a "Team" material (tinted to the empire's colour) and a
// "Glow" material (lights, tinted too). If a file can't load, a plain stand-in shape is used so
// the scene always plays.
//
// Blender's +Y (the nose) becomes -Z in glTF. Every template here is wrapped so its nose
// points +Z, which is what Object3D.lookAt expects.

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type KitPart = "dropship" | "trooper" | "bunker" | "hab_dome" | "tower" | "rock" | "conifer" | "palm" | "gunboat";
const PARTS: KitPart[] = ["dropship", "trooper", "bunker", "hab_dome", "tower", "rock", "conifer", "palm", "gunboat"];

export interface Kit {
  /** A fresh copy of a model. Geometry is shared; materials are shared unless tinted. */
  make(part: KitPart, tint?: { team?: THREE.ColorRepresentation; glow?: THREE.ColorRepresentation; glowStrength?: number }): THREE.Group;
  /** True if the Blender models loaded (false = stand-in shapes). */
  real: boolean;
}

let loading: Promise<Kit> | null = null;

/** Loads the models once per session. Never rejects: falls back to stand-ins after a timeout. */
export function loadKit(timeoutMs = 4000): Promise<Kit> {
  if (loading) return loading;
  loading = new Promise<Kit>((resolve) => {
    const loader = new GLTFLoader();
    const got = new Map<KitPart, THREE.Object3D>();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      const real = got.size === PARTS.length;
      if (!real) loading = null; // try again next time
      resolve(makeKit(real ? got : new Map(), real));
    };
    let left = PARTS.length;
    for (const p of PARTS) {
      loader.load(`models/landing/${p}.glb`, (g) => { got.set(p, g.scene); if (--left === 0) finish(); }, undefined, () => finish());
    }
    setTimeout(finish, timeoutMs);
  });
  return loading;
}

function makeKit(models: Map<KitPart, THREE.Object3D>, real: boolean): Kit {
  const tintCache = new Map<string, THREE.Material>();
  const tinted = (m: THREE.Material, tint: Parameters<Kit["make"]>[1]): THREE.Material => {
    if (!tint) return m;
    const name = m.name;
    const isTeam = /^Team/.test(name), isGlow = /^Glow/.test(name);
    if (!(isTeam && tint.team !== undefined) && !(isGlow && tint.glow !== undefined)) return m;
    const key = `${m.uuid}|${String(tint.team)}|${String(tint.glow)}|${tint.glowStrength ?? 3}`;
    let c = tintCache.get(key);
    if (!c) {
      const s = (m as THREE.MeshStandardMaterial).clone();
      if (isTeam && tint.team !== undefined) s.color = new THREE.Color(tint.team);
      if (isGlow && tint.glow !== undefined) { s.color = new THREE.Color(0x000000); s.emissive = new THREE.Color(tint.glow); s.emissiveIntensity = tint.glowStrength ?? 3; }
      tintCache.set(key, s); c = s;
    }
    return c;
  };
  const templates = new Map<KitPart, THREE.Object3D>();
  for (const p of PARTS) {
    const src = models.get(p) ?? standIn(p);
    src.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
    });
    templates.set(p, src);
  }
  return {
    real,
    make(part, tint) {
      const inner = templates.get(part)!.clone(true);
      inner.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.material = Array.isArray(mesh.material) ? mesh.material.map((x) => tinted(x, tint)) : tinted(mesh.material, tint);
      });
      inner.rotation.y = real ? Math.PI : 0; // nose to +Z
      const outer = new THREE.Group();
      outer.add(inner);
      return outer;
    },
  };
}

/** Plain shapes used if the models don't load. Same sizes and same "Team"/"Glow" material names. */
function standIn(p: KitPart): THREE.Object3D {
  const team = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.35, roughness: 0.45, name: "Team" });
  const glow = new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffffff, emissiveIntensity: 3, name: "Glow" });
  const grey = new THREE.MeshStandardMaterial({ color: 0x6a6e74, metalness: 0.5, roughness: 0.6 });
  const g = new THREE.Group();
  const add = (geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => { const k = new THREE.Mesh(geo, m); k.position.set(x, y, z); g.add(k); return k; };
  switch (p) {
    case "dropship": add(new THREE.BoxGeometry(2.6, 1.6, 6), grey, 0, 1.4); add(new THREE.BoxGeometry(2.2, 0.5, 4.2), team, 0, 2.35); add(new THREE.BoxGeometry(1.2, 0.6, 0.2), glow, 0, 1.3, -3.1); break;
    case "trooper": add(new THREE.CapsuleGeometry(0.3, 0.8, 3, 6), team, 0, 0.9); add(new THREE.SphereGeometry(0.22, 8, 6), glow, 0, 1.75); break;
    case "bunker": add(new THREE.CylinderGeometry(3.4, 4.2, 2.6, 10), grey, 0, 1.3); add(new THREE.BoxGeometry(3, 0.3, 0.3), glow, 0, 1.8, 3.2); break;
    case "hab_dome": add(new THREE.SphereGeometry(5.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), grey, 0, 1); break;
    case "tower": add(new THREE.CylinderGeometry(2, 2.6, 22, 8), grey, 0, 11); add(new THREE.SphereGeometry(0.4, 8, 6), glow, 0, 23); break;
    case "rock": add(new THREE.DodecahedronGeometry(1), grey, 0, 0.4); break;
    case "conifer": add(new THREE.ConeGeometry(2, 5, 8), new THREE.MeshStandardMaterial({ color: 0x2a5a1a }), 0, 3.5); break;
    case "palm": add(new THREE.CylinderGeometry(0.2, 0.25, 6, 6), new THREE.MeshStandardMaterial({ color: 0x4a3018 }), 0, 3); break;
    case "gunboat": add(new THREE.BoxGeometry(2.4, 1.2, 9), grey, 0, 0.6); add(new THREE.BoxGeometry(1.6, 1, 2.8), team, 0, 1.6); break;
  }
  // stand-ins face +Z already (the real models are turned in make())
  return g;
}
