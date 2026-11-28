// Real 3D ship models, one per race, built in Blender by the main Claude (sources on Danny's PC
// in E:\Tools\Blender\models\ships) and shipped as public/models/ships/<race>_cruiser.glb.
// Each model is 10 units long with its nose on Blender's +Y (glTF -Z). The space battle
// viewer calls preloadShips() first; buildShip() then uses a model when one is loaded and
// falls back to the shapes built in code (ships3d.ts) when it isn't.

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const cache = new Map<string, THREE.Object3D>();

// Hull plating and window-light textures, shared by every detailed (metal) hull. From Spaceship
// Generator by Michael Davies (MIT licence; see public/models/ships/tex/LICENSE-SpaceshipGenerator-MIT.txt).
let hullTex: { normal: THREE.Texture; lights: THREE.Texture } | null = null;
function hullTextures(): { normal: THREE.Texture; lights: THREE.Texture } {
  if (!hullTex) {
    const tl = new THREE.TextureLoader();
    const normal = tl.load("models/ships/tex/hull_normal.png");
    const lights = tl.load("models/ships/tex/hull_lights.png");
    for (const t of [normal, lights]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; }
    lights.colorSpace = THREE.SRGBColorSpace;
    hullTex = { normal, lights };
  }
  return hullTex;
}
/**
 * Extra hull-size models (2026-11-27, Danny: "expand on them based on their race features"):
 * public/models/ships/<race>_<size>.glb. All 18 races have them (organic 2026-11-27, metal 2026-11-28); medium uses the cruiser.
 */
export const SIZE_MODELS: Record<string, readonly ("small" | "large" | "huge")[]> = {
  kethrak: ["small", "large", "huge"],
  ruuvak: ["small", "large", "huge"],
  ixil: ["small", "large", "huge"],
  verdane: ["small", "large", "huge"],
  drovani: ["small", "large", "huge"],
  seraphine: ["small", "large", "huge"],
  lumen: ["small", "large", "huge"],
  thraal: ["small", "large", "huge"],
  humans: ["small", "large", "huge"],
  vossari: ["small", "large", "huge"],
  ashkari: ["small", "large", "huge"],
  orrun: ["small", "large", "huge"],
  nyx: ["small", "large", "huge"],
  velari: ["small", "large", "huge"],
  gorrath: ["small", "large", "huge"],
  quorai: ["small", "large", "huge"],
  raxxan: ["small", "large", "huge"],
  tarkhan: ["small", "large", "huge"],
};
const pending = new Map<string, Promise<void>>();
const failed = new Set<string>();

/** Loads the models for these races (once each). Resolves after `timeoutMs` at the latest. */
/** Loads each race's cruiser, plus only the hull sizes listed in `hulls` (all sizes when it is left out). */
export function preloadShips(raceIds: Iterable<string>, timeoutMs = 4000, hulls?: ReadonlySet<string>): Promise<void> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder); // the detailed hulls are meshopt-compressed
  const jobs: Promise<void>[] = [];
  const keys: string[] = [];
  for (const race of new Set(raceIds)) { keys.push(race); for (const sz of SIZE_MODELS[race] ?? []) if (!hulls || hulls.has(`${race}_${sz}`)) keys.push(`${race}_${sz}`); }
  for (const id of keys) {
    if (cache.has(id) || failed.has(id)) continue;
    let p = pending.get(id);
    if (!p) {
      p = new Promise<void>((resolve) => {
        loader.load(`models/ships/${id.includes("_") ? id : `${id}_cruiser`}.glb`, (g) => {
          g.scene.traverse((o) => {
            const m = o as THREE.Mesh;
            if (!m.isMesh) return;
            for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
              const st = mat as THREE.MeshStandardMaterial;
              if (/_hull[LM]/.test(st.name)) { // plated metal hull: panel lines everywhere, lit windows on the darker plates
                const t = hullTextures();
                st.normalMap = t.normal;
                if (/_hullL/.test(st.name)) { st.color.multiplyScalar(0.72); st.roughness = Math.max(st.roughness, 0.5); } // pale hulls glare under the battle bloom
                if (/_hullM/.test(st.name)) { st.emissiveMap = t.lights; st.emissive = new THREE.Color(0xffe8c0); st.emissiveIntensity = 3.3; }
                st.needsUpdate = true;
              }
              if (st.vertexColors) { st.color.multiplyScalar(0.8); st.envMapIntensity = 0.45; } // organic skins painted in Blender (scales, veins, lava): pale ones glare under the bloom
              if (st.emissiveIntensity !== undefined) st.emissiveIntensity *= 0.3; // Blender glow is tuned for stills; the battle adds bloom
              if (st.envMapIntensity !== undefined) st.envMapIntensity = 0.55;
            }
          });
          cache.set(id, g.scene); resolve();
        }, undefined, () => { failed.add(id); resolve(); });
      });
      pending.set(id, p);
    }
    jobs.push(p);
  }
  return Promise.race([Promise.all(jobs).then(() => undefined), new Promise<void>((r) => setTimeout(r, timeoutMs))]);
}

/** A copy of the race's model, nose along +X, `length` units long. Null if not loaded. */
export function shipModel(raceId: string, length: number, hull?: string): THREE.Group | null {
  const src = (hull && cache.get(`${raceId}_${hull}`)) || cache.get(raceId);
  if (!src) return null;
  const inner = src.clone(true);
  inner.rotation.y = -Math.PI / 2; // glTF -Z nose → +X
  inner.scale.setScalar(length / 10);
  const root = new THREE.Group();
  root.add(inner);
  return root;
}

/** For tests and tools. */
export function hasShipModel(raceId: string): boolean {
  return cache.has(raceId);
}
