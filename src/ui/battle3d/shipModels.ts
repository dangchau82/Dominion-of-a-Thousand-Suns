// Real 3D ship models, one per race, built in Blender by the main Claude (sources on Danny's PC
// in E:\Tools\Blender\models\ships) and shipped as public/models/ships/<race>_cruiser.glb.
// Each model is 10 units long with its nose on Blender's +Y (glTF -Z). The space battle
// viewer calls preloadShips() first; buildShip() then uses a model when one is loaded and
// falls back to the shapes built in code (ships3d.ts) when it isn't.

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const cache = new Map<string, THREE.Object3D>();
const pending = new Map<string, Promise<void>>();
const failed = new Set<string>();

/** Loads the models for these races (once each). Resolves after `timeoutMs` at the latest. */
export function preloadShips(raceIds: Iterable<string>, timeoutMs = 4000): Promise<void> {
  const loader = new GLTFLoader();
  const jobs: Promise<void>[] = [];
  for (const id of new Set(raceIds)) {
    if (cache.has(id) || failed.has(id)) continue;
    let p = pending.get(id);
    if (!p) {
      p = new Promise<void>((resolve) => {
        loader.load(`models/ships/${id}_cruiser.glb`, (g) => {
          g.scene.traverse((o) => {
            const m = o as THREE.Mesh;
            if (!m.isMesh) return;
            for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
              const st = mat as THREE.MeshStandardMaterial;
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
export function shipModel(raceId: string, length: number): THREE.Group | null {
  const src = cache.get(raceId);
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
