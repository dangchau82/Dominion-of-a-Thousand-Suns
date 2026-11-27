// Ground and sea invasions in 3D. The engine fights invasions as troop duels and reports only
// the outcome (captured or thrown back, and troops left), so this scene acts out that outcome:
// dropships come down through the sky, troops pour out and fight the defenders' bunkers.
// On ocean worlds it becomes a sea battle: gunboats on the water fire at the landing craft
// and the troops come ashore on an island beach.
//
// 2026-11-27 overhaul (main Claude; Danny: "ur land sea battle pic sucks"): the dropships,
// soldiers, bunkers, city, trees, rocks and gunboats are now models built in Blender
// (see landingKit.ts), on noise-shaped terrain with rock on the slopes, real shadows, a sky
// with sun and clouds, reflecting water, burning buildings and lower, closer camera shots.

import * as THREE from "three";
import type { Climate, GameState, Id } from "../../engine/types";
import { canvasTexture, CLIMATE_COLORS, glowTexture, isSmallScreen, makeStage, seeded } from "./stage";
import { sfx, startBattleMusic, stopBattleMusic } from "./audio3d";
import { loadKit, type Kit } from "./landingKit";

const V3 = THREE.Vector3;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export interface LandingInfo {
  starId: Id;
  attackerId: Id;
  /** Null if the player doesn't know who held the world. */
  defenderId: Id | null;
  captured: boolean;
  /** Troops landed (if known) and troops left standing. */
  troops: number;
  survivors: number;
  turn: number;
}

interface Trooper { g: THREE.Group; side: 0 | 1; alive: boolean; target: THREE.Vector3; cool: number; dieAt: number; fall: number; phase: number }

/** Smooth seeded 2D noise, 0..1, and a few octaves of it. */
function makeNoise(seed: number): (x: number, z: number) => number {
  const r = seeded(seed);
  const N = 256, perm = new Uint8Array(N * 2), val = new Float32Array(N);
  for (let i = 0; i < N; i++) { perm[i] = i; val[i] = r(); }
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j]!, perm[i]!]; }
  for (let i = 0; i < N; i++) perm[i + N] = perm[i]!;
  const v = (x: number, z: number) => val[perm[(perm[x & 255]! + (z & 255)) & 511]!]!;
  const s = (t: number) => t * t * (3 - 2 * t);
  const n1 = (x: number, z: number) => {
    const xi = Math.floor(x), zi = Math.floor(z), xf = s(x - xi), zf = s(z - zi);
    const a = v(xi, zi), b = v(xi + 1, zi), c = v(xi, zi + 1), d = v(xi + 1, zi + 1);
    return a + (b - a) * xf + (c - a) * zf + (a - b - c + d) * xf * zf;
  };
  return (x, z) => n1(x, z) * 0.55 + n1(x * 2.1 + 17, z * 2.1 + 31) * 0.28 + n1(x * 4.3 + 7, z * 4.3 + 5) * 0.12 + n1(x * 9.1, z * 9.1) * 0.05;
}

function skyColors(c: Climate): [THREE.Color, THREE.Color] {
  const top = c === "inferno" ? 0x2a0804 : c === "toxic" ? 0x22300a : c === "radiated" ? 0x1a0a2a : c === "dead" || c === "barren" || c === "minimal" ? 0x1a1c24 : 0x1c4a8a;
  const low = c === "inferno" ? 0xd8602a : c === "toxic" ? 0xa8b850 : c === "radiated" ? 0x8a6aa0 : c === "dead" || c === "barren" || c === "minimal" ? 0x8a8478 : c === "desert" || c === "arid" ? 0xd8c8a8 : c === "tundra" ? 0xc8d8e8 : 0x9cc4e8;
  return [new THREE.Color(top), new THREE.Color(low)];
}

export function playLanding(state: GameState, info: LandingInfo, playerId: Id, onClose: () => void = () => {}): void {
  let envTex: THREE.Texture | null = null;
  const stage = makeStage(() => { stopBattleMusic(); envTex?.dispose(); onClose(); }, { bloom: 0.35, exposure: 0.9 });
  const loadingNote = document.createElement("div");
  loadingNote.style.cssText = "position:absolute;inset:0;display:grid;place-items:center;color:#cfd8e3;font:15px system-ui,sans-serif";
  loadingNote.textContent = "Preparing the landing…";
  stage.hud.append(loadingNote);
  void loadKit().then((kit) => { loadingNote.remove(); if (!stage.closed) build(state, info, playerId, stage, kit, (t) => { envTex = t; }); });
}

function build(state: GameState, info: LandingInfo, playerId: Id, stage: ReturnType<typeof makeStage>, kit: Kit, keepEnv: (t: THREE.Texture) => void): void {
  const { scene, camera, controls, hud, renderer } = stage;
  const star = state.stars[info.starId]!;
  const climate: Climate = star.planet?.climate ?? "barren";
  const sea = climate === "ocean";
  const [cGround, cHigh, cThird] = CLIMATE_COLORS[climate];
  const seed = info.starId * 131 + info.turn;
  const rand = seeded(seed);
  const noise = makeNoise(seed + 7);
  const small = isSmallScreen();
  const atk = state.empires[info.attackerId]!;
  const def = info.defenderId !== null ? state.empires[info.defenderId]! : null;
  const defColor = def?.color ?? "#9aa4b0";

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ---- sky: gradient dome, sun, clouds; the same sky lights and reflects the scene ----
  const [skyTop, skyLow] = skyColors(climate);
  const sunDir = new V3(0.55, 0.42, -0.72).normalize();
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: skyTop }, low: { value: skyLow }, sun: { value: sunDir } },
    vertexShader: "varying vec3 d; void main(){ d=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: "uniform vec3 top; uniform vec3 low; uniform vec3 sun; varying vec3 d; void main(){ float h=d.y; vec3 c=mix(low,top,smoothstep(-.02,.55,h)); float s=max(dot(d,sun),0.); c+=vec3(1.,.9,.7)*(pow(s,600.)*4.+pow(s,8.)*.25); gl_FragColor=vec4(c,1.); }",
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), skyMat);
  scene.add(sky);
  { // environment light from the sky itself (not the indoor room the space battles use)
    const pm = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), skyMat));
    const t = pm.fromScene(envScene, 0.02).texture; scene.environment = t; keepEnv(t); pm.dispose();
  }
  scene.fog = new THREE.Fog(skyLow.clone(), sea ? 160 : 220, sea ? 700 : 950);
  const cloudTex = canvasTexture(512, 512, (g, w, h) => {
    const r = seeded(seed + 3);
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const x = r() * w, y = r() * h, rad = 20 + r() * 70;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, `rgba(255,255,255,${0.18 + r() * 0.2})`); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  });
  cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping; cloudTex.repeat.set(2, 2);
  const cloudTint = climate === "inferno" ? 0x6a3020 : climate === "toxic" ? 0xc8d070 : climate === "dead" || climate === "barren" ? 0x9a948a : 0xffffff;
  const cloudFade = canvasTexture(128, 128, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, "#fff"); gr.addColorStop(0.55, "#bbb"); gr.addColorStop(1, "#000");
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  }, false);
  const clouds = new THREE.Mesh(new THREE.PlaneGeometry(1700, 1700), new THREE.MeshBasicMaterial({ map: cloudTex, alphaMap: cloudFade, color: cloudTint, transparent: true, depthWrite: false, fog: false, opacity: 0.85 }));
  clouds.rotation.x = Math.PI / 2; clouds.position.y = 230; scene.add(clouds);

  const bright = ["desert", "tundra", "arid"].includes(climate);
  const sun = new THREE.DirectionalLight(0xfff0d8, bright ? 2.2 : 2.8);
  sun.position.copy(sunDir).multiplyScalar(260); sun.target.position.set(0, 0, -10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -130, right: 130, top: 130, bottom: -130, near: 10, far: 700 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.4;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(skyLow, new THREE.Color(cGround).multiplyScalar(0.5), bright ? 0.5 : 0.75));

  // ---- terrain ----
  const heightAt = (x: number, z: number): number => {
    const n = noise(x * 0.011, z * 0.011);
    if (sea) {
      const ang = Math.atan2(z + 10, x - 20);
      const ragged = 0.75 + noise(Math.cos(ang) * 2 + 40, Math.sin(ang) * 2 + 40) * 0.6;
      const d = Math.hypot(x - 20, (z + 10) * 1.15) / ragged;
      const island = 17 * Math.exp(-(d * d) / 5200) - 3;
      return island + (n - 0.5) * 6 * Math.min(1, Math.max(0, island + 3) / 6);
    }
    const battle = Math.exp(-((x / 95) ** 2) - (((z + 5) / 60) ** 2)); // flatter where the fight happens
    const hills = (n - 0.5) * 26 * (1 - battle * 0.75);
    const ridge = Math.max(0, -z - 170) * 0.55 * (0.6 + noise(x * 0.03 + 50, 3) * 0.8); // mountains far behind the city
    const sides = Math.max(0, Math.abs(x) - 150) * 0.25 * noise(x * 0.02, z * 0.02 + 9);
    return hills + ridge + sides;
  };
  const seg = small ? 110 : 200;
  const gGeo = new THREE.PlaneGeometry(760, 760, seg, seg); gGeo.rotateX(-Math.PI / 2);
  const pos = gGeo.attributes.position!;
  for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
  gGeo.computeVertexNormals();
  const nrm = gGeo.attributes.normal!;
  const colors = new Float32Array(pos.count * 3);
  const dim = bright ? 0.7 : 0.85;
  const cLow = new THREE.Color(sea ? "#cdbb8a" : cGround).multiplyScalar(dim);
  const cMid = new THREE.Color(sea ? "#4f7f34" : cHigh).multiplyScalar(dim);
  const cTop = new THREE.Color(sea ? "#2f5a24" : cThird).multiplyScalar(dim);
  const cRock = new THREE.Color("#6a645c").lerp(new THREE.Color(cGround), 0.25).multiplyScalar(dim);
  const cWet = new THREE.Color("#8a7a58").multiplyScalar(dim);
  const col = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const slope = 1 - nrm.getY(i);
    const v = noise(x * 0.06 + 100, z * 0.06);
    if (sea) {
      col.copy(y < 0.2 ? cWet : cLow).lerp(cMid, Math.min(1, Math.max(0, (y - 1.2) / 3))).lerp(cTop, Math.min(1, Math.max(0, (y - 7) / 6)) * v);
    } else {
      col.copy(cLow).lerp(cMid, Math.min(1, v * 0.9)).lerp(cTop, Math.max(0, noise(x * 0.02, z * 0.02 + 40) - 0.55) * 1.6);
    }
    col.lerp(cRock, Math.min(1, Math.max(0, (slope - 0.08) * 5)));
    col.multiplyScalar(0.9 + noise(x * 0.35, z * 0.35) * 0.2);
    colors.set([col.r, col.g, col.b], i * 3);
  }
  gGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const detail = canvasTexture(256, 256, (g, w, h) => { // fine grain so close-ups aren't flat
    const r = seeded(seed + 11); const img = g.createImageData(w, h);
    for (let i = 0; i < w * h; i++) { const k = 200 + r() * 55; img.data.set([k, k, k, 255], i * 4); }
    g.putImageData(img, 0, 0);
  });
  detail.wrapS = detail.wrapT = THREE.RepeatWrapping; detail.repeat.set(90, 90);
  const ground = new THREE.Mesh(gGeo, new THREE.MeshStandardMaterial({ vertexColors: true, map: detail, roughness: 0.95, metalness: 0, envMapIntensity: 0.35 }));
  ground.receiveShadow = true;
  scene.add(ground);

  let water: THREE.Mesh | null = null;
  let waterNormal: THREE.CanvasTexture | null = null;
  if (sea) {
    waterNormal = canvasTexture(256, 256, (g, w, h) => {
      const n = makeNoise(seed + 21); const img = g.createImageData(w, h);
      const hgt = (x: number, y: number) => n(x / 24, y / 24) + n(x / 9 + 30, y / 9) * 0.4;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const dx = hgt(x + 1, y) - hgt(x - 1, y), dy = hgt(x, y + 1) - hgt(x, y - 1);
        const v = new V3(-dx * 6, -dy * 6, 1).normalize();
        img.data.set([(v.x * 0.5 + 0.5) * 255, (v.y * 0.5 + 0.5) * 255, (v.z * 0.5 + 0.5) * 255, 255], (y * w + x) * 4);
      }
      g.putImageData(img, 0, 0);
    }, false);
    waterNormal.wrapS = waterNormal.wrapT = THREE.RepeatWrapping; waterNormal.repeat.set(90, 90);
    water = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshPhysicalMaterial({
      color: 0x0c3a5a, roughness: 0.06, metalness: 0, normalMap: waterNormal, normalScale: new THREE.Vector2(0.35, 0.35),
      transparent: true, opacity: 0.9, envMapIntensity: 1.1, clearcoat: 1, clearcoatRoughness: 0.08,
    }));
    water.rotation.x = -Math.PI / 2; water.position.y = 0; water.receiveShadow = true;
    scene.add(water);
  }

  // ---- scenery: rocks and trees (none on the battle lanes) ----
  const onLane = (x: number, z: number) => Math.abs(x) < 75 && z > -58 && z < 48;
  const place = (part: "rock" | "conifer" | "palm", n: number, minY: number, scale: [number, number]) => {
    for (let i = 0, tries = 0; i < n && tries < n * 8; tries++) {
      const x = (rand() - 0.5) * 520, z = (rand() - 0.5) * 420 - 30;
      if (onLane(x, z) && part !== "rock") continue;
      if (onLane(x, z) && rand() < 0.8) continue;
      const y = heightAt(x, z);
      if (y < minY) continue;
      const o = kit.make(part);
      const s = scale[0] + rand() * (scale[1] - scale[0]);
      o.scale.setScalar(s); o.position.set(x, y - (part === "rock" ? 0.3 * s : 0.1), z); o.rotation.y = rand() * Math.PI * 2;
      if (part === "rock") o.rotation.x = (rand() - 0.5) * 0.4;
      scene.add(o); i++;
    }
  };
  const rocky = ["desert", "arid", "barren", "dead", "minimal", "inferno", "radiated", "toxic"].includes(climate);
  place("rock", small ? 30 : 60, sea ? 0.6 : -99, rocky ? [0.8, 4] : [0.6, 2.4]);
  if (climate === "jungle") place("palm", small ? 35 : 70, -99, [0.9, 1.5]);
  if (sea) place("palm", small ? 18 : 34, 1.2, [0.8, 1.3]);
  if (["terran", "steppe", "tundra", "jungle"].includes(climate)) place("conifer", small ? 30 : 60, -99, [0.8, 1.8]);

  // ---- defenders: bunkers, a city, gunboats on ocean worlds ----
  const defTint = { team: new THREE.Color(defColor).multiplyScalar(0.8), glow: defColor, glowStrength: 3 };
  const bunkers: THREE.Vector3[] = [];
  const bunkerObjs: THREE.Object3D[] = [];
  const nb = sea ? 4 : 6;
  for (let i = 0; i < nb; i++) {
    const x = sea ? 20 + (i - nb / 2 + 0.5) * 11 + (rand() - 0.5) * 4 : (i - nb / 2 + 0.5) * 22 + (rand() - 0.5) * 6;
    const z = sea ? -6 + (rand() - 0.5) * 10 : -40 - rand() * 10;
    const y = heightAt(x, z);
    const b = kit.make("bunker", defTint); b.position.set(x, y - 0.2, z); b.scale.setScalar(sea ? 0.8 : 1);
    scene.add(b); bunkerObjs.push(b);
    bunkers.push(new V3(x, y + (sea ? 2.7 : 3.3), z + (sea ? 2.9 : 3.6)));
  }
  const fires: THREE.Vector3[] = [];
  for (let i = 0; i < (small ? 10 : 18); i++) { // the city behind the line
    const x = (rand() - 0.5) * 220, z = sea ? -28 - rand() * 26 : -95 - rand() * 70;
    const y = heightAt(x, z);
    if (sea && y < 2) continue;
    const tower = rand() < 0.45;
    const o = kit.make(tower ? "tower" : "hab_dome", { team: defColor, glow: defColor, glowStrength: 2.5 });
    o.scale.setScalar(tower ? 0.55 + rand() * 0.6 : 0.6 + rand() * 0.5); o.position.set(x, y - 0.3, z); o.rotation.y = rand() * 6.28;
    scene.add(o);
    if (info.captured && rand() < 0.5) fires.push(new V3(x, y + (tower ? 10 : 3), z));
  }
  const boats: { o: THREE.Object3D; base: THREE.Vector3; phase: number }[] = [];
  if (sea && def) {
    for (let i = 0; i < 4; i++) {
      const o = kit.make("gunboat", defTint); o.scale.setScalar(1.5);
      const base = new V3(-55 + i * 30, 0.2, 34 + (rand() - 0.5) * 18);
      o.position.copy(base); o.rotation.y = Math.PI / 2 + (rand() - 0.5) * 0.3;
      scene.add(o); boats.push({ o, base, phase: rand() * 6 });
    }
  }

  // ---- particles, bolts and flashes ----
  interface Part { s: THREE.Sprite; v: THREE.Vector3; life: number; age: number; size: number; grow: number; g: number; a: number }
  const parts: Part[] = [];
  const glowMat = new Map<string, THREE.SpriteMaterial>();
  const spark = (p: THREE.Vector3, color: THREE.ColorRepresentation, size: number, life: number, vel?: THREE.Vector3, grow = 0.5, gravity = 0, additive = true, alpha = 1) => {
    if (parts.length > (small ? 350 : 800)) return;
    const key = `${String(color)}|${additive}`;
    let base = glowMat.get(key);
    if (!base) { base = new THREE.SpriteMaterial({ map: glowTexture(), color, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false, transparent: true, fog: !additive }); glowMat.set(key, base); }
    const s = new THREE.Sprite(base.clone());
    s.position.copy(p); s.scale.setScalar(size); scene.add(s);
    parts.push({ s, v: vel?.clone() ?? new V3(), life, age: 0, size, grow, g: gravity, a: alpha });
  };
  const smoke = (p: THREE.Vector3, size: number, life = 3) => spark(p, 0x3a3632, size, life, new V3((rand() - 0.5) * 1.5, 3 + rand() * 2.5, (rand() - 0.5) * 1.5), 2.2, 0, false, 0.55);
  const flashes = Array.from({ length: 3 }, () => { const l = new THREE.PointLight(0xffa050, 0, 40, 2); scene.add(l); return { l, t: 0 }; });
  let nextFlash = 0;
  const flash = (p: THREE.Vector3, strength: number) => { const f = flashes[nextFlash++ % flashes.length]!; f.l.position.copy(p); f.l.intensity = strength; f.t = 0.35; };
  const boom = (p: THREE.Vector3, big = false) => {
    for (let i = 0; i < (big ? 26 : 10); i++) spark(p, i % 3 ? 0xffb050 : 0xffffff, big ? 3 : 1.4, 0.8 + rand() * 0.6, new V3((rand() - 0.5) * 14, rand() * 14, (rand() - 0.5) * 14), 0.8, -12);
    for (let i = 0; i < (big ? 8 : 3); i++) smoke(p.clone(), big ? 6 : 3, 3.5);
    flash(p.clone().add(new V3(0, 2, 0)), big ? 900 : 300);
    sfx.explosion(big);
  };
  const bolts: { m: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3; t: number; dur: number; onHit: () => void }[] = [];
  const boltGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.8, 5); boltGeo.rotateX(Math.PI / 2);
  const boltMats = new Map<string, THREE.Material>();
  const shoot = (from: THREE.Vector3, to: THREE.Vector3, color: string, onHit: () => void = () => {}) => {
    let m = boltMats.get(color);
    if (!m) { m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(4), toneMapped: false }); boltMats.set(color, m); }
    const b = new THREE.Mesh(boltGeo, m);
    b.position.copy(from); b.lookAt(to); scene.add(b);
    bolts.push({ m: b, from: from.clone(), to: to.clone(), t: 0, dur: from.distanceTo(to) / 110, onHit });
    spark(from, color, 0.9, 0.08);
  };

  // ---- troops ----
  const makeTrooper = (side: 0 | 1, color: string, at: THREE.Vector3): Trooper => {
    const g = kit.make("trooper", { team: new THREE.Color(color).multiplyScalar(0.85), glow: color, glowStrength: 2.5 });
    g.scale.setScalar(1.15);
    g.position.copy(at); g.position.y = heightAt(at.x, at.z);
    scene.add(g);
    return { g, side, alive: true, target: at.clone(), cool: rand() * 1.5, dieAt: Infinity, fall: 0, phase: rand() * 6 };
  };
  const troopers: Trooper[] = [];
  const defCount = small ? 12 : 22;
  for (let i = 0; i < defCount; i++) {
    const b = bunkers[i % bunkers.length]!;
    const t = makeTrooper(1, defColor, b.clone().add(new V3((rand() - 0.5) * 14, 0, 3 + rand() * 7)));
    t.g.rotation.y = 0; // face the beach / the landing zone (+Z)
    troopers.push(t);
  }
  const atkCount = Math.max(6, Math.min(small ? 18 : 30, info.troops || 20));

  // ---- dropships ----
  const drops: { s: THREE.Object3D; from: THREE.Vector3; to: THREE.Vector3; t: number; landed: boolean }[] = [];
  const nDrop = Math.max(2, Math.min(5, Math.ceil(atkCount / 6)));
  for (let i = 0; i < nDrop; i++) {
    const s = kit.make("dropship", { team: atk.color, glow: atk.color, glowStrength: 1.6 });
    s.scale.setScalar(1.5);
    const to = new V3(sea ? 6 + (i - nDrop / 2 + 0.5) * 13 : (i - nDrop / 2 + 0.5) * 19, 0, sea ? 14 + rand() * 6 : 26 + rand() * 10);
    to.y = Math.max(sea ? 0.3 : -100, heightAt(to.x, to.z)) + 0.4;
    const from = to.clone().add(new V3(-40 + rand() * 12, 150 + rand() * 12, 110));
    s.position.copy(from); s.rotation.y = Math.PI; // nose towards the defenders (-Z)
    scene.add(s);
    drops.push({ s, from, to, t: -i * 0.3, landed: false });
  }

  // Outcome: which side falls, and when. The engine already decided this.
  const atkSurvive = info.captured ? Math.max(1, Math.round(atkCount * Math.min(0.85, Math.max(0.25, info.troops > 0 ? info.survivors / info.troops : 0.5)))) : 0;
  const FIGHT_START = 6.5, FIGHT_LEN = 14;
  const scheduleDeaths = () => {
    const atks = troopers.filter((t) => t.side === 0), defs = troopers.filter((t) => t.side === 1);
    atks.forEach((t, i) => { if (i >= atkSurvive) t.dieAt = FIGHT_START + 1 + rand() * FIGHT_LEN; });
    defs.forEach((t) => { if (info.captured || rand() < 0.15) t.dieAt = FIGHT_START + 2 + rand() * FIGHT_LEN; });
  };

  // ---- HUD ----
  hud.style.cssText = "position:absolute;inset:0;pointer-events:none;display:flex;flex-direction:column;justify-content:space-between;padding:max(10px,env(safe-area-inset-top)) 12px 12px;font:14px/1.35 system-ui,sans-serif;color:#e8eef5";
  hud.innerHTML = `
    <div style="align-self:center;text-align:center;background:rgba(8,12,20,.6);border-radius:10px;padding:8px 14px">
      <b>${sea ? "Sea landing" : "Ground assault"} on ${esc(star.name)}</b><br>
      <span style="color:${atk.color}">${esc(atk.name)}</span> ${info.attackerId === playerId ? "(you) " : ""}against <span style="color:${defColor}">${def ? esc(def.name) : "the defenders"}</span>${info.defenderId === playerId ? " (you)" : ""}
    </div>
    <div class="b3-banner" style="align-self:center;text-align:center;opacity:0;transition:opacity .8s;text-shadow:0 0 18px #000"></div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;pointer-events:auto">
      <button class="b3-btn" data-act="pause">Pause</button><button class="b3-btn" data-act="cam">Cinematic camera</button><button class="b3-btn" data-act="close">Close</button>
    </div>`;
  for (const b of hud.querySelectorAll<HTMLButtonElement>(".b3-btn")) b.style.cssText = "min-height:44px;padding:0 14px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(8,12,20,.7);color:#e8eef5;font:600 14px system-ui,sans-serif;cursor:pointer";
  const btn = (a: string) => hud.querySelector<HTMLButtonElement>(`[data-act="${a}"]`)!;
  let paused = false, cinematic = true, clock = 0, deployed = false, done = false;
  btn("pause").onclick = () => { paused = !paused; btn("pause").textContent = paused ? "Play" : "Pause"; };
  const look = new V3(0, 5, 0);
  const setCinematic = (on: boolean) => { cinematic = on; controls.enabled = !on; btn("cam").textContent = on ? "Cinematic camera" : "Free camera"; if (!on) controls.target.copy(look); };
  btn("cam").onclick = () => setCinematic(!cinematic);
  controls.addEventListener("start", () => { if (cinematic) setCinematic(false); });
  btn("close").onclick = () => stage.close();
  const banner = hud.querySelector<HTMLDivElement>(".b3-banner")!;

  // The demo routes can freeze a moment for screenshots: #landing-demo-desert-3@9 shows second 9.
  const freezeAt = Number(/@(\d+(?:\.\d+)?)$/.exec(location.hash)?.[1] ?? NaN);

  const attackersCentre = () => {
    const a = troopers.filter((t) => t.side === 0 && t.alive);
    if (!a.length) return new V3(0, 2, 20);
    const c = new V3(); for (const t of a) c.add(t.g.position); return c.divideScalar(a.length);
  };
  const camShots: { until: number; shot: () => [THREE.Vector3, THREE.Vector3] }[] = [
    { until: 3.4, shot: () => { const c = drops[0]!.s.position; return [c.clone().add(new V3(-16, 7, 22)), c.clone().add(new V3(4, -8, -16))]; } }, // ride in with the lead dropship
    { until: 6.5, shot: () => [new V3(28, 3.5, sea ? 34 : 50), new V3(0, 4, sea ? 10 : 22)] },                                          // ground level as they touch down
    { until: 11, shot: () => { const c = attackersCentre(); return [c.clone().add(new V3(16, 3.2, 4)), c.clone().add(new V3(-6, 1.5, -18))]; } }, // beside the charge
    { until: 15.5, shot: () => { const b = bunkers[1 % bunkers.length]!; return [b.clone().add(new V3(-9, 2.5, -10)), b.clone().add(new V3(4, -1, 30))]; } }, // from the defenders' line
    { until: 99, shot: () => [new V3(Math.cos(clock * 0.1) * 75, 26, Math.sin(clock * 0.1) * 75 - 10), new V3(0, 3, -15)] },          // slow orbit to the end
  ];
  camera.position.set(-70, 60, 160);

  let fastForwarded = false;
  stage.onFrame((raw) => {
    if (Number.isFinite(freezeAt) && !fastForwarded) { // screenshot links: run the scene up to that second, then hold
      fastForwarded = true;
      while (clock < freezeAt) step(1 / 30);
      paused = true;
    }
    step(raw);
  });
  function step(raw: number): void {
    const dt = paused ? 0 : raw;
    clock += dt;
    cloudTex.offset.x += dt * 0.0015;
    if (water && waterNormal) { waterNormal.offset.x += dt * 0.012; waterNormal.offset.y += dt * 0.007; }
    for (const b of boats) {
      b.o.position.x = b.base.x + Math.sin(clock * 0.15 + b.phase) * 10;
      b.o.position.y = b.base.y + Math.sin(clock * 1.2 + b.phase) * 0.25;
      b.o.rotation.z = Math.sin(clock + b.phase) * 0.04;
      if (dt > 0 && rand() < dt * 10) spark(b.o.position.clone().add(new V3((rand() - 0.5) * 3, 0.1, (rand() - 0.5) * 3)), 0xdfefff, 2.2, 1.6, new V3(0, 0.3, 0), 1.6, 0, false, 0.5);
    }
    for (const f of flashes) if (f.t > 0) { f.t -= dt; f.l.intensity *= f.t > 0 ? 0.86 : 0; }
    // burning city when the world falls
    if (dt > 0 && deployed && info.captured) for (const f of fires) if (rand() < dt * 3) { smoke(f.clone(), 7, 5); if (rand() < 0.4) spark(f.clone(), 0xff7a2a, 3, 0.5, new V3(0, 3, 0)); }
    // dropships come down
    for (const d of drops) {
      if (d.landed) { d.s.position.y = d.to.y + Math.sin(clock * 2 + d.from.x) * 0.06; continue; }
      d.t += dt / 4.8;
      const k = Math.max(0, Math.min(1, d.t));
      const e = 1 - Math.pow(1 - k, 2.2);
      d.s.position.lerpVectors(d.from, d.to, e);
      d.s.rotation.x = -0.35 * (1 - e);
      if (k > 0 && dt > 0) {
        if (rand() < 0.7) spark(d.s.position.clone().add(new V3((rand() - 0.5) * 3, 0.3, (rand() - 0.5) * 4)), 0xffc070, 2.6, 0.35, new V3(0, -10, 0));
        if (k > 0.85 && rand() < 0.6) spark(d.to.clone().add(new V3((rand() - 0.5) * 10, 0.3, (rand() - 0.5) * 10)), sea ? 0xe8f4ff : 0x9a8a72, 3.5, 1.4, new V3((rand() - 0.5) * 10, 1.5, (rand() - 0.5) * 10), 1.4, 0, false, 0.6);
      }
      if (k >= 1) {
        d.landed = true; sfx.explosion(false);
        for (let i = 0; i < 14; i++) spark(d.to.clone().add(new V3(0, 0.5, 0)), sea ? 0xe8f4ff : 0x8a7a66, 4, 1.8, new V3((rand() - 0.5) * 16, rand() * 3, (rand() - 0.5) * 16), 1.4, 0, false, 0.6);
      }
    }
    // defenders shoot at incoming dropships; gunboats too
    if (!deployed && clock > 1.2 && dt > 0 && rand() < dt * (sea ? 7 : 4.5)) {
      const d = drops[Math.floor(rand() * drops.length)]!;
      const src = sea && boats.length && rand() < 0.6 ? boats[Math.floor(rand() * boats.length)]!.o.position.clone().add(new V3(0, 2.6, 0)) : bunkers[Math.floor(rand() * bunkers.length)]!.clone();
      const at = d.s.position.clone().add(new V3((rand() - 0.5) * 10, (rand() - 0.5) * 6, (rand() - 0.5) * 10));
      shoot(src, at, defColor, () => { if (rand() < 0.35) { spark(at, 0xffb050, 3, 0.4); flash(at, 200); sfx.explosion(false); } else spark(at, 0xffffff, 1.2, 0.2); });
      if (rand() < 0.3) sfx.cannon();
    }
    // troops pour out once the ships are down
    if (!deployed && drops.every((d) => d.landed)) {
      deployed = true;
      for (let i = 0; i < atkCount; i++) {
        const d = drops[i % drops.length]!;
        const tr = makeTrooper(0, atk.color, d.to.clone().add(new V3((rand() < 0.5 ? -1 : 1) * (4 + rand() * 3), 0, -3 - rand() * 6)));
        const goal = bunkers[i % bunkers.length]!;
        tr.target = goal.clone().add(new V3((rand() - 0.5) * 14, 0, 9 + rand() * 10));
        troopers.push(tr);
      }
      scheduleDeaths();
      clock = Math.max(clock, FIGHT_START);
    }
    // troopers move, shoot and fall
    for (const t of troopers) {
      if (!t.alive) { if (t.fall < 1) { t.fall = Math.min(1, t.fall + dt * 2.5); t.g.rotation.x = -t.fall * Math.PI / 2; t.g.position.y = heightAt(t.g.position.x, t.g.position.z) + 0.25 * t.fall; } continue; }
      if (clock >= t.dieAt) { t.alive = false; spark(t.g.position.clone().add(new V3(0, 1, 0)), 0xffa050, 2, 0.4); smoke(t.g.position.clone().add(new V3(0, 0.5, 0)), 1.5, 1.6); continue; }
      if (t.side === 0 && deployed && dt > 0) {
        const d = t.target.clone().sub(t.g.position); d.y = 0;
        if (d.length() > 1) {
          d.normalize().multiplyScalar(dt * 4.2); t.g.position.add(d);
          t.g.position.y = heightAt(t.g.position.x, t.g.position.z) + Math.abs(Math.sin(clock * 9 + t.phase)) * 0.12;
          t.g.rotation.y = Math.atan2(t.target.x - t.g.position.x, t.target.z - t.g.position.z);
          t.g.rotation.z = Math.sin(clock * 9 + t.phase) * 0.06;
          if (rand() < dt * 2 && !sea) spark(t.g.position.clone().add(new V3(0, 0.2, 0)), 0x9a8a72, 1, 0.8, new V3(0, 0.6, 0), 1, 0, false, 0.35);
        } else { t.g.rotation.z = 0; }
      }
      if (deployed && clock > FIGHT_START && dt > 0) {
        t.cool -= dt;
        if (t.cool <= 0) {
          t.cool = 0.5 + rand() * 1.1;
          const foes = troopers.filter((o) => o.alive && o.side !== t.side);
          const f = foes.length ? foes[Math.floor(rand() * foes.length)]! : null;
          if (f) {
            if (t.side === 1) t.g.rotation.y = Math.atan2(f.g.position.x - t.g.position.x, f.g.position.z - t.g.position.z);
            const from = t.g.position.clone().add(new V3(Math.sin(t.g.rotation.y) * 0.9, 1.05, Math.cos(t.g.rotation.y) * 0.9));
            const at = f.g.position.clone().add(new V3((rand() - 0.5) * 2, 1, (rand() - 0.5) * 2));
            shoot(from, at, t.side === 0 ? atk.color : defColor, () => spark(at, 0xffffff, 0.8, 0.15));
            if (rand() < 0.25) sfx.laser(1.6 + rand() * 0.4);
          }
        }
      }
    }
    // bunkers blow up when the attackers win
    if (info.captured && deployed && clock > FIGHT_START + 4 && dt > 0 && rand() < dt * 0.6) {
      const i = Math.floor(rand() * bunkers.length);
      boom(bunkers[i]!.clone(), rand() < 0.45);
      const bo = bunkerObjs[i]!; bo.rotation.z = (rand() - 0.5) * 0.15; bo.position.y -= 0.15;
    }
    // bolts
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i]!; b.t += dt / Math.max(0.05, b.dur);
      b.m.position.lerpVectors(b.from, b.to, Math.min(1, b.t));
      if (b.t >= 1) { b.onHit(); scene.remove(b.m); bolts.splice(i, 1); }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]!; p.age += dt;
      if (p.age >= p.life) { scene.remove(p.s); p.s.material.dispose(); parts.splice(i, 1); continue; }
      const k = p.age / p.life;
      p.v.y += p.g * dt;
      p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = p.a * (1 - k) * (1 - k); p.s.scale.setScalar(p.size * (1 + p.grow * k));
    }
    // ending
    if (!done && deployed && clock > FIGHT_START + FIGHT_LEN + 3) {
      done = true;
      const mineWon = (info.captured && info.attackerId === playerId) || (!info.captured && info.defenderId === playerId);
      const title = info.captured ? `${atk.name} take ${star.name}` : `${star.name} holds`;
      banner.innerHTML = `<div style="font:800 clamp(26px,5.5vw,46px)/1.05 system-ui,sans-serif">${esc(title)}</div><div style="opacity:.85;margin-top:6px">${mineWon ? "Victory" : info.attackerId === playerId || info.defenderId === playerId ? "Defeat" : ""}${info.captured ? ` · ${info.survivors} troops standing` : " · the landing is thrown back"}</div>`;
      banner.style.opacity = "1";
      if (info.captured) { // plant the conqueror's banner on the first bunker
        const b0 = bunkers[0]!;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 8, 6), new THREE.MeshStandardMaterial({ color: 0x8a8e94, metalness: 0.6, roughness: 0.4 }));
        pole.position.set(b0.x, b0.y + 3.5, b0.z - 3); pole.castShadow = true; scene.add(pole);
        const flag = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.2), new THREE.MeshStandardMaterial({ color: atk.color, side: THREE.DoubleSide, emissive: new THREE.Color(atk.color), emissiveIntensity: 0.35 }));
        flag.position.set(b0.x + 1.8, b0.y + 6.4, b0.z - 3); flag.castShadow = true; scene.add(flag);
      }
    }
    if (cinematic) {
      const shot = camShots.find((s) => clock < s.until) ?? camShots[camShots.length - 1]!;
      const [p, target] = shot.shot();
      const k = 1 - Math.exp(-raw * (clock < 3.4 ? 5 : 1.6));
      camera.position.lerp(p, k);
      camera.position.y = Math.max(camera.position.y, heightAt(camera.position.x, camera.position.z) + 1.8, sea ? 1.5 : -999);
      look.lerp(target, k); camera.lookAt(look);
    }
  }
  startBattleMusic();
}
