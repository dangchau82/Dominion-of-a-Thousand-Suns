// 3D race scenes (written by Claude 2), built on the main Claude's battle3d stage: a colony
// ship landing, two battle lines firing (war), the enemy line blowing apart (battle won),
// a great work's ring assembling around a star (wonder), an orbital laboratory lighting up
// (science), an agent's ship slipping past enemy searchlights (spy), and the Ascension Gate
// opening (technology victory). The race's portrait fades in over science and spy. Loaded
// with import() from scenes.ts so three.js only downloads when a scene plays. Conquest,
// council/culture victories and defeat stay 2D.

import * as THREE from "three";
import { buildShip, type Ship3D } from "./battle3d/ships3d";
import { glowTexture, makePlanet, makeStage, spaceBackdrop } from "./battle3d/stage";
import type { Scene } from "./scenes";
import { SCENE_TITLES } from "./sceneText";
import { portraitHTML } from "./assets";
import type { Climate } from "../engine/types";

export const LENGTH_S = 7;

/** For previews and screenshots: hold 3D scenes at this many seconds (null = play normally). */
let hold: number | null = null;
export function hold3dAt(sec: number | null): void { hold = sec; }

/** Which scenes have a 3D version. */
export function has3d(s: Scene): boolean {
  return s.kind === "colony" || s.kind === "war" || s.kind === "battle" || s.kind === "wonder" || s.kind === "science" || s.kind === "spy" || (s.kind === "victory" && s.victoryKind === "technology");
}

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const hex = (c: string) => new THREE.Color(c);

function glowSprite(color: THREE.ColorRepresentation, size: number): THREE.Sprite {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  s.scale.setScalar(size);
  return s;
}

function beam(from: THREE.Vector3, to: THREE.Vector3, color: THREE.ColorRepresentation): THREE.Mesh {
  const len = from.distanceTo(to);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, len, 6, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.position.copy(from).add(to).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
  return m;
}

/** Play a 3D scene; the caption goes in the stage's HUD. Calls `done` when it ends or is skipped. */
export function play3dScene(s: Scene, done: () => void): void {
  const stage = makeStage(done, { bloom: 1.0 });
  const { scene, camera, hud } = stage;
  spaceBackdrop(scene, "yellow", 7 + s.kind.length, true);
  scene.add(new THREE.AmbientLight(0x8899bb, 0.35));

  // Caption and skip, styled like the 2D scenes.
  hud.innerHTML = `<div class="scene-cap"><h2 style="color:${s.color}">${SCENE_TITLES[s.kind]}</h2><div></div></div>
    <div class="scene-skip" style="position:absolute;top:2%;right:1.5%;display:flex;gap:8px"><button data-skip>Skip ▸</button></div>`;
  hud.style.cssText = "position:absolute;inset:0;pointer-events:none";
  (hud.querySelector(".scene-cap div") as HTMLElement).textContent = s.text;
  if (s.kind === "science" || s.kind === "spy") {
    const face = document.createElement("div");
    face.innerHTML = portraitHTML(s.raceId, 'style="width:100%;height:100%;object-fit:cover"');
    face.style.cssText = `position:absolute;left:3%;top:8%;height:68%;aspect-ratio:4/5;border-radius:50%/42%;overflow:hidden;opacity:0;transition:opacity 1.6s ease;
      -webkit-mask-image:radial-gradient(ellipse at center, #000 55%, transparent 72%);mask-image:radial-gradient(ellipse at center, #000 55%, transparent 72%);${s.kind === "spy" ? "filter:brightness(.55) sepia(.4) hue-rotate(60deg);" : ""}`;
    hud.prepend(face);
    setTimeout(() => { face.style.opacity = "0.9"; }, 300);
  }
  const skip = hud.querySelector<HTMLButtonElement>("[data-skip]")!;
  skip.style.pointerEvents = "auto";
  skip.onclick = () => stage.close();
  stage.overlay.addEventListener("click", (e) => { if (e.target === stage.renderer.domElement) stage.close(); });
  const onKey = (e: KeyboardEvent) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); stage.close(); } };
  addEventListener("keydown", onKey, true);

  let t = 0;
  const update: ((t: number, dt: number) => void)[] = [];
  stage.onFrame((dt) => {
    t = hold ?? t + dt;
    for (const f of update) f(t, dt);
    if (hold === null && t >= LENGTH_S) { removeEventListener("keydown", onKey, true); stage.close(); }
  });

  const ours = s.color, theirs = s.rivalColor ?? "#ff4444";
  const enemyRace = s.rivalRaceId ?? s.raceId;

  if (s.kind === "colony") {
    const planet = makePlanet((s.climate ?? "terran") as Climate, 30, 11);
    scene.add(planet);
    const ship = buildShip(s.raceId, "medium");
    scene.add(ship.root);
    const start = new THREE.Vector3(-90, 30, 50), land = new THREE.Vector3(-14, 6, 26);
    const engine = glowSprite(ours, 5); ship.root.add(engine); engine.position.set(-3, 0, 0);
    // City lights spread out from the landing site once the ship is down.
    const lights: THREE.Sprite[] = [];
    const r = (k: number) => Math.sin(k * 91.3) * 0.5 + 0.5;
    const site = land.clone().normalize();
    for (let i = 0; i < 80; i++) {
      const spread = 0.05 + 0.45 * (i / 80);
      const p = site.clone().add(new THREE.Vector3(r(i) - 0.5, r(i + 40) - 0.5, r(i + 80) - 0.5).multiplyScalar(spread * 2)).normalize().multiplyScalar(30.4);
      const l = glowSprite(0xffd27a, 1.1); l.position.copy(p); l.visible = false; planet.add(l); lights.push(l);
    }
    camera.position.set(-75, 30, 150);
    update.push((t) => {
      const p = ease(t / 4.2);
      ship.root.position.lerpVectors(start, land, p);
      ship.root.lookAt(land.clone().add(land.clone().sub(start)));
      ship.root.rotateY(-Math.PI / 2); // models point along +X
      ship.root.scale.setScalar(1 - 0.6 * ease((t - 3) / 1.4));
      ship.root.visible = t < 4.4;
      lights.forEach((l, i) => { l.visible = t > 4.3 + i * 0.025; });
      camera.position.set(-75 + t * 5, 30 - t, 150 - t * 6);
      camera.lookAt(-20, 6, 10);
    });
  } else if (s.kind === "war" || s.kind === "battle") {
    const side = (race: string, x: number, flip: boolean) => Array.from({ length: 5 }, (_, i) => {
      const sh: Ship3D = buildShip(race, i === 2 ? "huge" : i % 2 ? "large" : "medium");
      sh.root.position.set(x, (i - 2) * 4, (i - 2) * 9);
      if (flip) sh.root.rotation.y = Math.PI;
      scene.add(sh.root);
      return sh;
    });
    const a = side(s.raceId, -70, false), b = side(enemyRace, 70, true);
    const shots: { m: THREE.Mesh; until: number }[] = [];
    const booms: { s: THREE.Sprite; at: number }[] = [];
    let nextShot = 2.2, k = 0;
    camera.position.set(0, 28, 95);
    update.push((t) => {
      const close = ease(t / 2.2) * 40;
      a.forEach((sh) => { sh.root.position.x = -70 + close; });
      b.forEach((sh) => { sh.root.position.x = 70 - close; });
      while (t >= nextShot && t < 6.2) {
        const ourShot = k % 2 === 0;
        const fromShip = (ourShot ? a : b)[(k * 3) % 5]!, toShip = (ourShot ? b : a)[(k * 7 + 1) % 5]!;
        const m = beam(fromShip.root.position.clone(), toShip.root.position.clone(), ourShot ? hex(ours) : hex(theirs));
        scene.add(m); shots.push({ m, until: t + 0.25 });
        if (k % 3 === 0) { const sp = glowSprite(0xffaa44, 6); sp.position.copy(toShip.root.position); scene.add(sp); booms.push({ s: sp, at: t }); }
        k++; nextShot += 0.09;
      }
      for (const sh of shots) sh.m.visible = t < sh.until;
      for (const bo of booms) { const age = t - bo.at; bo.s.scale.setScalar(6 + age * 30); (bo.s.material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - age); }
      if (s.kind === "battle" && t > 4.2) {
        b.forEach((sh, i) => {
          if (t > 4.2 + i * 0.3 && sh.root.visible) {
            sh.root.visible = false;
            const sp = glowSprite(0xffcc66, 20); sp.position.copy(sh.root.position); scene.add(sp); booms.push({ s: sp, at: t });
          }
        });
      }
      camera.position.x = Math.sin(t * 0.25) * 30;
      camera.lookAt(0, 0, 0);
    });
  } else if (s.kind === "wonder") {
    const sun = glowSprite(0xfff1c0, 60); scene.add(sun);
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ color: 0xfff6d8 })));
    const ring = new THREE.Group(); scene.add(ring);
    const mat = new THREE.MeshStandardMaterial({ color: hex(ours), emissive: hex(ours), emissiveIntensity: 0.6, metalness: 0.6, roughness: 0.4 });
    const parts: THREE.Mesh[] = [];
    for (const [r, tilt] of [[38, 0.3], [48, -0.25]] as const) {
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const m = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 2.4), mat);
        m.position.set(Math.cos(a) * r, Math.sin(a) * r * Math.sin(tilt), Math.sin(a) * r * Math.cos(tilt));
        m.lookAt(0, 0, 0); m.visible = false; ring.add(m); parts.push(m);
      }
    }
    camera.position.set(0, 35, 120);
    update.push((t) => {
      const n = Math.floor(ease(t / 4.5) * parts.length);
      parts.forEach((m, i) => { m.visible = i < n; });
      ring.rotation.y = t * 0.08;
      sun.scale.setScalar(60 + Math.sin(t * 2) * 4 + (t > 4.6 ? (t - 4.6) * 40 : 0));
      camera.position.set(Math.sin(t * 0.15) * 120, 35 - t * 2, Math.cos(t * 0.15) * 120);
      camera.lookAt(0, 0, 0);
    });
  } else if (s.kind === "science") {
    // An orbital laboratory over our world: rings spin up, then the breakthrough flash.
    const planet = makePlanet((s.climate ?? "terran") as Climate, 26, 5);
    planet.position.set(10, -30, -20); scene.add(planet);
    const lab = new THREE.Group(); lab.position.set(10, 8, 0); scene.add(lab);
    const metal = new THREE.MeshStandardMaterial({ color: 0x9aa4b4, metalness: 0.8, roughness: 0.35 });
    const glowMat = new THREE.MeshStandardMaterial({ color: hex(ours), emissive: hex(ours), emissiveIntensity: 1.2 });
    lab.add(new THREE.Mesh(new THREE.SphereGeometry(3, 32, 16), metal));
    const core = glowSprite(ours, 8); lab.add(core);
    const rings = [8, 11.5, 15].map((r, i) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.35, 8, 96), i === 1 ? glowMat : metal);
      m.rotation.set(i * 0.7, i * 0.4, 0); lab.add(m); return m;
    });
    for (let i = 0; i < 4; i++) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 22), metal); arm.rotation.y = (i * Math.PI) / 4; lab.add(arm); }
    const motes = Array.from({ length: 40 }, (_, i) => { const m = glowSprite(ours, 0.8); lab.add(m); return { m, a: i * 2.4, r: 5 + (i % 9) * 1.4, y: ((i * 37) % 13) - 6 }; });
    camera.position.set(-10, 14, 55);
    update.push((t) => {
      const spin = 0.4 + ease(t / 3.5) * 3;
      rings.forEach((r, i) => { r.rotation.x += 0.004 * spin * (i + 1); r.rotation.y += 0.006 * spin * (i % 2 ? -1 : 1); });
      motes.forEach((o) => { o.a += 0.01 * spin; o.m.position.set(Math.cos(o.a) * o.r, o.y + Math.sin(t + o.a) * 0.8, Math.sin(o.a) * o.r); });
      core.scale.setScalar(8 + (t > 4 ? (1 - ease((t - 4) / 1.5)) * 50 : Math.sin(t * 6) * 0.8));
      camera.position.set(-10 + t * 2, 14, 55 - t * 2.5);
      camera.lookAt(12, 6, 0);
    });
  } else if (s.kind === "spy") {
    // Our agent's small ship slips past enemy warships and their searchlights, then the data streaks home.
    const guards = [0, 1, 2].map((i) => {
      const sh = buildShip(enemyRace, i === 1 ? "huge" : "large");
      sh.root.position.set(-25 + i * 28, (i - 1) * 6, -12 + (i % 2) * 18);
      sh.root.rotation.y = Math.PI / 2 + i * 0.3; scene.add(sh.root);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(9, 40, 24, 1, true), new THREE.MeshBasicMaterial({ color: hex(theirs), transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      cone.position.copy(sh.root.position).add(new THREE.Vector3(0, -18, 0)); scene.add(cone);
      return { sh, cone, phase: i * 1.9 };
    });
    const agent = buildShip(s.raceId, "small"); agent.root.scale.setScalar(1.6); scene.add(agent.root);
    const trail = glowSprite(ours, 2.5); agent.root.add(trail); trail.position.set(-1.5, 0, 0);
    const data = glowSprite(0x9dff9d, 4); data.visible = false; scene.add(data);
    camera.position.set(0, 22, 70);
    update.push((t) => {
      guards.forEach((g) => { g.cone.rotation.z = Math.sin(t * 0.9 + g.phase) * 0.6; g.cone.rotation.x = Math.cos(t * 0.7 + g.phase) * 0.3; });
      const p = ease(t / 4.4);
      agent.root.position.set(-70 + p * 130, -4 + Math.sin(p * 9) * 3, 20 - p * 6);
      agent.root.rotation.z = Math.sin(p * 9) * 0.2;
      if (t > 4.4) {
        const q = ease((t - 4.4) / 1.6);
        data.visible = true; data.scale.setScalar(4 + q * 6);
        data.position.set(60 - q * 140, -4 + q * 30, 14 - q * 60);
      }
      camera.lookAt(agent.root.position.x * 0.4, 0, 0);
    });
  } else {
    // Technology victory: the Ascension Gate opens and our ships fly through.
    const gate = new THREE.Group(); scene.add(gate);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(30, 2.2, 16, 96), new THREE.MeshStandardMaterial({ color: hex(ours), emissive: hex(ours), emissiveIntensity: 0.8, metalness: 0.7, roughness: 0.3 }));
    gate.add(rim);
    const light = glowSprite(0xffffff, 10); gate.add(light);
    const fleet = Array.from({ length: 6 }, (_, i) => { const sh = buildShip(s.raceId, i === 0 ? "huge" : "large"); scene.add(sh.root); return sh; });
    camera.position.set(-70, 20, 80);
    update.push((t) => {
      light.scale.setScalar(10 + ease(t / 3) * 70);
      rim.rotation.z = t * 0.3;
      fleet.forEach((sh, i) => {
        const p = ease((t - 1.5 - i * 0.35) / 3);
        sh.root.position.set(-120 + p * 125, (i % 3 - 1) * 8, (Math.floor(i / 3) - 0.5) * 14);
        sh.root.visible = p < 0.98;
      });
      camera.lookAt(0, 0, 0);
    });
  }
}
