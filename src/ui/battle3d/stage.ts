// The 3D stage shared by the battle scenes: a full-screen overlay with a WebGL canvas,
// bloom, resizing, a render loop and clean-up. Also the space backdrop (nebula, stars,
// the system's sun) and planets coloured by climate.

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Climate, StarColor } from "../../engine/types";

export interface Stage {
  overlay: HTMLDivElement;
  hud: HTMLDivElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  /** Called every frame with seconds since the last frame (capped). */
  onFrame: (fn: (dt: number) => void) => void;
  close: () => void;
  closed: boolean;
}

/** Phones get fewer pixels and a softer bloom so battles stay smooth. */
export const isSmallScreen = (): boolean => Math.min(innerWidth, innerHeight) < 700;

export function makeStage(onClose: () => void, opts: { bloom?: number; exposure?: number } = {}): Stage {
  const overlay = document.createElement("div");
  overlay.className = "battle3d";
  overlay.style.cssText = "position:fixed;inset:0;z-index:1000;background:#02040a;touch-action:none";
  const hud = document.createElement("div");
  hud.className = "battle3d-hud";
  overlay.append(hud);
  document.body.append(overlay);

  const renderer = new THREE.WebGLRenderer({ antialias: !isSmallScreen(), powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isSmallScreen() ? 1.25 : 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.exposure ?? 1;
  renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
  overlay.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 4000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enabled = false;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), (opts.bloom ?? 0.9) * (isSmallScreen() ? 0.8 : 1), 0.5, opts.bloom !== undefined ? 0.85 : 0.72));
  composer.addPass(new OutputPass());

  const resize = () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  };
  addEventListener("resize", resize);

  const frames: ((dt: number) => void)[] = [];
  const clock = new THREE.Clock();
  let raf = 0;
  const stage: Stage = {
    overlay, hud, renderer, scene, camera, controls, closed: false,
    onFrame: (fn) => { frames.push(fn); },
    close: () => {
      if (stage.closed) return;
      stage.closed = true;
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("keydown", onKey);
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        for (const x of mats) x.dispose();
      });
      composer.dispose();
      renderer.dispose();
      pmrem.dispose();
      overlay.remove();
      onClose();
    },
  };
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") stage.close(); };
  addEventListener("keydown", onKey);
  const loop = () => {
    if (stage.closed) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    for (const f of frames) f(dt);
    if (controls.enabled) controls.update();
    composer.render();
  };
  raf = requestAnimationFrame(loop);
  return stage;
}

// ---------- textures ----------
export function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Deterministic pseudo-random numbers for scenery, so a replay looks the same every time. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

let glow: THREE.CanvasTexture | null = null;
export function glowTexture(): THREE.CanvasTexture {
  return glow ??= canvasTexture(64, 64, (g, w) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
}

export const STAR_COLORS: Record<StarColor, number> = {
  red: 0xff6a4a, orange: 0xffa64a, yellow: 0xffe29a, white: 0xf2f6ff, blue: 0x9ac4ff, purple: 0xd29aff,
};

/** Main colours of each climate: [ground, highlight, sea/cloud]. */
export const CLIMATE_COLORS: Record<Climate, [string, string, string]> = {
  terran: ["#3f7a3a", "#c8b07a", "#2a5fa8"], jungle: ["#2f6a26", "#6fa03a", "#2a7a6a"], ocean: ["#1f4f9a", "#3a80c8", "#e8f2ff"],
  arid: ["#b08a52", "#d8b880", "#8a6a3a"], steppe: ["#8a8a4a", "#b8b070", "#6a7a3a"], desert: ["#d0a060", "#f0d090", "#a07040"],
  minimal: ["#7a6a5a", "#a89888", "#5a4e44"], barren: ["#77736c", "#a8a39a", "#4e4a44"], tundra: ["#c8d8e8", "#ffffff", "#8aa0b8"],
  dead: ["#5e5a56", "#86817a", "#3a3734"], inferno: ["#a02a10", "#ff8a2a", "#3a0a04"], toxic: ["#8a9a2a", "#d8e04a", "#4a5a14"],
  radiated: ["#5a3a7a", "#9ad84a", "#2a1a3a"],
};

export function planetTexture(climate: Climate, seed: number): THREE.CanvasTexture {
  const [a, b, c] = CLIMATE_COLORS[climate];
  const r = seeded(seed);
  return canvasTexture(1024, 512, (g, w, h) => {
    g.fillStyle = climate === "ocean" ? c === "#e8f2ff" ? a : c : a; g.fillRect(0, 0, w, h);
    const blobs = climate === "ocean" ? 40 : 140;
    for (let i = 0; i < blobs; i++) {
      g.fillStyle = i % 3 === 0 ? b : i % 3 === 1 ? (climate === "ocean" ? b : c) : a;
      g.globalAlpha = 0.25 + r() * 0.5;
      g.beginPath(); g.ellipse(r() * w, h * 0.12 + r() * h * 0.76, 10 + r() * 120, 6 + r() * 50, r() * 3, 0, 7); g.fill();
    }
    if (climate === "inferno") { g.strokeStyle = "#ffb24a"; g.globalAlpha = 0.8; g.lineWidth = 2; for (let i = 0; i < 40; i++) { g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (r() - 0.5) * 60; y += (r() - 0.5) * 30; g.lineTo(x, y); } g.stroke(); } }
    // clouds and ice caps
    g.globalAlpha = 1;
    if (!["dead", "barren", "minimal", "radiated"].includes(climate)) {
      g.fillStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 50; i++) { g.beginPath(); g.ellipse(r() * w, r() * h, 20 + r() * 140, 4 + r() * 14, 0, 0, 7); g.fill(); }
    }
    g.fillStyle = "rgba(240,248,255,0.85)"; g.fillRect(0, 0, w, h * 0.05); g.fillRect(0, h * 0.95, w, h * 0.05);
  });
}

/** Space backdrop: nebula sphere, star field and the system's sun as a glowing sprite. */
export function spaceBackdrop(scene: THREE.Scene, starColor: StarColor, seed: number, nebula: boolean): { sunDir: THREE.Vector3 } {
  const r = seeded(seed);
  const tint = ["90,40,140", "30,70,150", "20,120,130", "150,50,90", "60,30,110", "140,80,40"];
  const tex = canvasTexture(2048, 1024, (g, w, h) => {
    g.fillStyle = "#010208"; g.fillRect(0, 0, w, h);
    const n = nebula ? 110 : 60;
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = h * 0.15 + r() * h * 0.7, rad = 80 + r() * 360, col = tint[(i + seed) % tint.length];
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, `rgba(${col},${(nebula ? 0.1 : 0.05) + r() * 0.1})`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1800, 48, 24), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide })));
  const n = isSmallScreen() ? 2000 : 4000, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1), d = 1500;
    pos.set([d * Math.sin(ph) * Math.cos(th), d * Math.cos(ph), d * Math.sin(ph) * Math.sin(th)], i * 3);
    const b = r() < 0.06 ? 0.9 + r() * 0.4 : 0.25 + r() * 0.45;
    col.set([b, b * 0.95, b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.3, sizeAttenuation: false, vertexColors: true })));
  const sunDir = new THREE.Vector3(0.8, 0.45, -0.4).normalize();
  const sunColor = STAR_COLORS[starColor];
  const sun = new THREE.DirectionalLight(sunColor, 3); sun.position.copy(sunDir).multiplyScalar(100); scene.add(sun);
  scene.add(new THREE.HemisphereLight(0x5577cc, 0x1a120a, 0.35));
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: sunColor, blending: THREE.AdditiveBlending, depthWrite: false }));
  sprite.position.copy(sunDir).multiplyScalar(1200); sprite.scale.setScalar(300); scene.add(sprite);
  return { sunDir };
}

export function makePlanet(climate: Climate, radius: number, seed: number): THREE.Group {
  const g = new THREE.Group();
  const planet = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 32), new THREE.MeshStandardMaterial({ map: planetTexture(climate, seed), color: 0xb0b0b0, roughness: 1, metalness: 0, envMapIntensity: 0 }));
  g.add(planet);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.04, 48, 24), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    uniforms: { c: { value: new THREE.Color(climate === "inferno" ? 0xff7a3a : climate === "toxic" ? 0xc8ff4a : 0x6ab0ff) } },
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vV=-mv.xyz; vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*mv; }",
    fragmentShader: "uniform vec3 c; varying vec3 vN; varying vec3 vV; void main(){ float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.5); gl_FragColor=vec4(c*f*0.8,f*0.8); }",
  }));
  g.add(atmo);
  return g;
}
