// Animated soldiers, mechs and alien scenery for the landing scenes.
// Models: "Ultimate Space Kit" by Quaternius (CC0 1.0, public domain; quaternius.com), converted to
// small meshopt .glb files in public/models/spacekit. Danny downloaded the kit on 2026-11-27.
// Every model shares one colour atlas, so team colours are applied by tinting the whole material.
// If anything fails to load, the landing falls back to the Blender kit (landingKit.ts).

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

export type CharKind = "soldierA" | "soldierB" | "mech" | "brute";
export type PropKind =
  | "dome" | "base" | "house_round" | "house_long" | "solar" | "radar" | "rover" | "rover_round"
  | "rock_big1" | "rock_big2" | "tree_lava1" | "tree_lava2" | "tree_spiral" | "tree_swirl" | "tree_blob"
  | "tree_light" | "tree_floating" | "plant" | "bush";

const CHAR_FILES: Record<CharKind, string> = {
  soldierA: "astronaut_finnthefrog", soldierB: "astronaut_raetheredpanda", mech: "mech_barbarathebee", brute: "enemy_large",
};
const PROP_FILES: Record<PropKind, string> = {
  dome: "geodesicdome", base: "base_large", house_round: "house_cylinder", house_long: "house_long", solar: "solarpanel_ground",
  radar: "roof_radar", rover: "rover_1", rover_round: "rover_round", rock_big1: "rock_large_1", rock_big2: "rock_large_2",
  tree_lava1: "tree_lava_1", tree_lava2: "tree_lava_2", tree_spiral: "tree_spiral_1", tree_swirl: "tree_swirl_1",
  tree_blob: "tree_blob_1", tree_light: "tree_light_1", tree_floating: "tree_floating_1", plant: "plant_1", bush: "bush_1",
};
/** Height (metres in the scene) each character is scaled to. */
const CHAR_HEIGHT: Record<CharKind, number> = { soldierA: 2.1, soldierB: 2.1, mech: 3.4, brute: 3.2 };

export interface Actor {
  root: THREE.Group;
  /** Cross-fades to a clip by name; unknown names are ignored. once = play one time and hold. */
  play(name: string, once?: boolean): void;
  update(dt: number): void;
  clips: string[];
}

export interface SpaceKit {
  actor(kind: CharKind, tint?: THREE.ColorRepresentation, tintAmount?: number): Actor | null;
  prop(kind: PropKind, tint?: THREE.ColorRepresentation, tintAmount?: number): THREE.Group | null;
  real: boolean;
}

// The kit's astronauts have cartoon animal heads; ours wear a closed combat helmet with a
// visor in the empire's colour, fixed to the head bone so it moves with every animation.
const helmetGeo = new THREE.SphereGeometry(1, 20, 14);
const visorGeo = new THREE.SphereGeometry(1, 20, 10, -Math.PI * 0.42, Math.PI * 0.84, Math.PI * 0.28, Math.PI * 0.34);
function addHelmet(model: THREE.Object3D, tint?: THREE.ColorRepresentation): void {
  let head: THREE.Object3D | null = null;
  model.traverse((o) => { if (!head && o.name === "Head") head = o; });
  if (!head) return;
  const team = new THREE.Color(tint ?? 0x9aa4b0);
  const shell = new THREE.Mesh(helmetGeo, new THREE.MeshStandardMaterial({ color: new THREE.Color(0xd8dde4).lerp(team, 0.45), metalness: 0.35, roughness: 0.38 }));
  shell.scale.set(0.6, 0.54, 0.72); shell.position.set(0, 0.26, 0.12);
  const visor = new THREE.Mesh(visorGeo, new THREE.MeshStandardMaterial({ color: 0x0b1118, metalness: 0.9, roughness: 0.12, emissive: team, emissiveIntensity: 0.55 }));
  visor.scale.set(0.62, 0.56, 0.74); visor.position.set(0, 0.26, 0.12);
  for (const m of [shell, visor]) { m.castShadow = true; (head as THREE.Object3D).add(m); }
}

interface Loaded { scene: THREE.Object3D; clips: THREE.AnimationClip[] }
let loading: Promise<SpaceKit> | null = null;

export function loadSpaceKit(timeoutMs = 15000): Promise<SpaceKit> {
  if (loading) return loading;
  loading = new Promise<SpaceKit>((resolve) => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const chars = new Map<CharKind, Loaded>(), props = new Map<PropKind, Loaded>();
    const jobs: [string, (g: Loaded) => void][] = [
      ...(Object.keys(CHAR_FILES) as CharKind[]).map((k) => [CHAR_FILES[k], (g: Loaded) => chars.set(k, g)] as [string, (g: Loaded) => void]),
      ...(Object.keys(PROP_FILES) as PropKind[]).map((k) => [PROP_FILES[k], (g: Loaded) => props.set(k, g)] as [string, (g: Loaded) => void]),
    ];
    let left = jobs.length, settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (chars.size < 2) loading = null; // try again next time
      resolve(makeKit(chars, props));
    };
    for (const [file, put] of jobs) {
      loader.load(`models/spacekit/${file}.glb`, (g) => { put({ scene: g.scene, clips: g.animations }); if (--left === 0) finish(); }, undefined, () => { if (--left === 0) finish(); });
    }
    setTimeout(finish, timeoutMs);
  });
  return loading;
}

function makeKit(chars: Map<CharKind, Loaded>, props: Map<PropKind, Loaded>): SpaceKit {
  for (const l of [...chars.values(), ...props.values()]) {
    l.scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; } });
  }
  const tintCache = new Map<string, THREE.Material>();
  const tintAll = (root: THREE.Object3D, tint?: THREE.ColorRepresentation, amount = 0.5) => {
    if (tint === undefined) return;
    const c = new THREE.Color(1, 1, 1).lerp(new THREE.Color(tint), amount);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const one = (mat: THREE.Material) => {
        const key = `${mat.uuid}|${c.getHexString()}`;
        let t = tintCache.get(key);
        if (!t) { const s = (mat as THREE.MeshStandardMaterial).clone(); s.color.multiply(c); t = s; tintCache.set(key, t); }
        return t;
      };
      m.material = Array.isArray(m.material) ? m.material.map(one) : one(m.material);
    });
  };
  const heights = new Map<CharKind, number>();
  for (const [k, l] of chars) {
    const box = new THREE.Box3().setFromObject(l.scene);
    heights.set(k, Math.max(0.1, box.max.y - box.min.y));
  }
  return {
    real: chars.size >= 2,
    actor(kind, tint, amount) {
      const l = chars.get(kind);
      if (!l) return null;
      const inner = cloneSkinned(l.scene) as THREE.Object3D;
      tintAll(inner, tint, amount);
      if (kind === "soldierA" || kind === "soldierB") addHelmet(inner, tint);
      inner.scale.setScalar(CHAR_HEIGHT[kind] / heights.get(kind)!);
      const root = new THREE.Group(); root.add(inner);
      const mixer = new THREE.AnimationMixer(inner);
      const byName = new Map(l.clips.map((c) => [c.name, c]));
      let current: THREE.AnimationAction | null = null, currentName = "";
      return {
        root, clips: [...byName.keys()],
        play(name, once = false) {
          if (name === currentName) return;
          const clip = byName.get(name);
          if (!clip) return;
          const next = mixer.clipAction(clip);
          next.reset();
          if (once) { next.setLoop(THREE.LoopOnce, 1); next.clampWhenFinished = true; } else next.setLoop(THREE.LoopRepeat, Infinity);
          next.play();
          if (current) current.crossFadeTo(next, 0.2, false);
          current = next; currentName = name;
        },
        update(dt) { mixer.update(dt); },
      };
    },
    prop(kind, tint, amount) {
      const l = props.get(kind);
      if (!l) return null;
      const inner = l.scene.clone(true);
      tintAll(inner, tint, amount);
      const g = new THREE.Group(); g.add(inner);
      return g;
    },
  };
}
