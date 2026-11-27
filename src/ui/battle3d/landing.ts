// Ground and sea invasions in 3D. The engine fights invasions as troop duels and reports only
// the outcome (captured or thrown back, and troops left), so this scene acts out that outcome:
// dropships come down through the sky, troops pour out and fight the defenders' bunkers.
// On ocean worlds it becomes a sea battle: gunboats on the water fire at the landing craft
// and the troops come ashore on an island beach.

import * as THREE from "three";
import type { GameState, Id } from "../../engine/types";
import { buildShip } from "./ships3d";
import { canvasTexture, CLIMATE_COLORS, glowTexture, isSmallScreen, makeStage, seeded } from "./stage";
import { sfx, startBattleMusic, stopBattleMusic } from "./audio3d";

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

interface Trooper { g: THREE.Group; side: 0 | 1; alive: boolean; target: THREE.Vector3; cool: number; dieAt: number; fall: number }

export function playLanding(state: GameState, info: LandingInfo, playerId: Id, onClose: () => void = () => {}): void {
  const stage = makeStage(() => { stopBattleMusic(); onClose(); }, { bloom: 0.45, exposure: 0.85 });
  const { scene, camera, controls, hud } = stage;
  const star = state.stars[info.starId]!;
  const climate = star.planet?.climate ?? "barren";
  const sea = climate === "ocean";
  const [cGround, cHigh, cThird] = CLIMATE_COLORS[climate];
  const rand = seeded(info.starId * 131 + info.turn);
  const small = isSmallScreen();
  const atk = state.empires[info.attackerId]!;
  const def = info.defenderId !== null ? state.empires[info.defenderId]! : null;
  const defColor = def?.color ?? "#9aa4b0";

  // ---- sky, light, fog ----
  const skyTop = new THREE.Color(climate === "inferno" ? 0x3a0a04 : climate === "toxic" ? 0x2a3a08 : climate === "radiated" ? 0x1a0a2a : 0x0a1a3a);
  const skyLow = new THREE.Color(climate === "inferno" ? 0xff6a2a : climate === "toxic" ? 0xb8c84a : climate === "dead" || climate === "barren" ? 0x8a8478 : 0x8ab8e8);
  scene.background = skyLow.clone().lerp(skyTop, 0.5);
  scene.fog = new THREE.Fog(skyLow.clone().lerp(skyTop, 0.25), 160, 650);
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: skyTop }, low: { value: skyLow } },
    vertexShader: "varying float h; void main(){ h=normalize(position).y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: "uniform vec3 top; uniform vec3 low; varying float h; void main(){ gl_FragColor=vec4(mix(low,top,smoothstep(-.05,.6,h)),1.); }",
  })));
  const bright = ["desert", "tundra", "arid"].includes(climate);
  const sun = new THREE.DirectionalLight(0xfff0d8, bright ? 1.6 : 2.3); sun.position.set(120, 160, 60); scene.add(sun);
  scene.add(new THREE.HemisphereLight(skyLow, new THREE.Color(cGround), bright ? 0.45 : 0.7));

  // ---- land or sea ----
  const heightAt = (x: number, z: number) => {
    if (sea) { const d = Math.hypot(x - 20, z + 10); return Math.max(-2, 14 * Math.exp(-(d * d) / 3500) - 2.5 + Math.sin(x * 0.08) * Math.cos(z * 0.07) * 1.2); }
    return Math.sin(x * 0.03) * Math.cos(z * 0.025) * 6 + Math.sin(x * 0.11 + z * 0.07) * 1.5 + Math.max(0, (z + 120) * -0.25);
  };
  const seg = small ? 90 : 160;
  const gGeo = new THREE.PlaneGeometry(700, 700, seg, seg); gGeo.rotateX(-Math.PI / 2);
  const colors = new Float32Array(gGeo.attributes.position!.count * 3);
  const dim = bright ? 0.72 : 0.9;
  const ca = new THREE.Color(sea ? "#c8b88a" : cGround).multiplyScalar(dim), cb = new THREE.Color(sea ? "#4a7a32" : cHigh).multiplyScalar(dim), cc = new THREE.Color(sea ? "#2f5a24" : cThird).multiplyScalar(dim);
  for (let i = 0; i < gGeo.attributes.position!.count; i++) {
    const x = gGeo.attributes.position!.getX(i), z = gGeo.attributes.position!.getZ(i);
    const h = heightAt(x, z);
    gGeo.attributes.position!.setY(i, h);
    const k = sea ? Math.min(1, Math.max(0, (h - 0.5) / 4)) : (Math.sin(x * 0.05 + z * 0.03) * 0.5 + 0.5);
    const col = sea ? ca.clone().lerp(cb, k).lerp(cc, Math.max(0, (h - 8) / 6)) : ca.clone().lerp(cb, k * 0.6).lerp(cc, Math.max(0, Math.sin(z * 0.04)) * 0.3);
    colors.set([col.r, col.g, col.b], i * 3);
  }
  gGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  gGeo.computeVertexNormals();
  scene.add(new THREE.Mesh(gGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, envMapIntensity: 0.2 })));
  let water: THREE.Mesh | null = null;
  if (sea) {
    const wGeo = new THREE.PlaneGeometry(900, 900, small ? 60 : 120, small ? 60 : 120); wGeo.rotateX(-Math.PI / 2);
    water = new THREE.Mesh(wGeo, new THREE.MeshStandardMaterial({ color: 0x15508e, roughness: 0.22, metalness: 0.05, transparent: true, opacity: 0.94, envMapIntensity: 0.25 }));
    scene.add(water);
  }

  // ---- defenders: bunkers, a city skyline, gunboats on ocean worlds ----
  const defMat = new THREE.MeshStandardMaterial({ color: 0x7a8088, metalness: 0.6, roughness: 0.5 });
  const defGlow = new THREE.MeshStandardMaterial({ color: 0, emissive: new THREE.Color(defColor), emissiveIntensity: 2.5 });
  const bunkers: THREE.Vector3[] = [];
  const nb = sea ? 4 : 6;
  for (let i = 0; i < nb; i++) {
    const x = sea ? 20 + (rand() - 0.5) * 40 : (i - nb / 2) * 22 + (rand() - 0.5) * 6;
    const z = sea ? -10 + (rand() - 0.5) * 30 : -40 - rand() * 12;
    const y = heightAt(x, z);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4, 2.5, 10), defMat); b.position.set(x, y + 1.2, z); scene.add(b);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2.6, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), defMat); dome.position.set(x, y + 2.4, z); scene.add(dome);
    const slit = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.3, 0.3), defGlow); slit.position.set(x, y + 3.1, z + 2.2); scene.add(slit);
    bunkers.push(new V3(x, y + 3.2, z + 2.2));
  }
  const winTex = canvasTexture(128, 256, (g, w, h) => {
    g.fillStyle = "#5a6068"; g.fillRect(0, 0, w, h);
    for (let y = 6; y < h; y += 12) for (let x = 6; x < w; x += 12) { g.fillStyle = rand() < 0.45 ? "#ffd890" : "#2a2e34"; g.fillRect(x, y, 6, 7); }
  });
  winTex.wrapS = winTex.wrapT = THREE.RepeatWrapping;
  const towerMat = new THREE.MeshStandardMaterial({ color: 0xb8c0c8, map: winTex, emissive: 0xffffff, emissiveMap: winTex, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.6 });
  for (let i = 0; i < (small ? 14 : 28); i++) { // distant city
    const x = (rand() - 0.5) * 260, z = sea ? -40 - rand() * 30 : -110 - rand() * 60, h = 6 + rand() * 30;
    const y = heightAt(x, z);
    if (sea && y < 1) continue;
    const t = new THREE.Mesh(new THREE.BoxGeometry(4 + rand() * 6, h, 4 + rand() * 6), towerMat); t.position.set(x, y + h / 2, z); scene.add(t);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.2), defGlow); cap.position.set(x, y + h + 0.3, z); scene.add(cap);
  }
  const boats: THREE.Object3D[] = [];
  if (sea && def) {
    for (let i = 0; i < 4; i++) {
      const s = buildShip(def.raceId, "medium"); s.root.scale.setScalar(1.6);
      s.root.position.set(-40 + i * 26, 0.6, 30 + (rand() - 0.5) * 20); s.root.rotation.y = Math.PI / 2 + (rand() - 0.5) * 0.4;
      scene.add(s.root); boats.push(s.root);
    }
  }

  // ---- sprites and effects ----
  interface Part { s: THREE.Sprite; v: THREE.Vector3; life: number; age: number; size: number; grow: number; g: number }
  const parts: Part[] = [];
  const spark = (pos: THREE.Vector3, color: THREE.ColorRepresentation, size: number, life: number, vel?: THREE.Vector3, grow = 0.5, gravity = 0) => {
    if (parts.length > (small ? 300 : 700)) return;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    s.position.copy(pos); s.scale.setScalar(size); scene.add(s);
    parts.push({ s, v: vel?.clone() ?? new V3(), life, age: 0, size, grow, g: gravity });
  };
  const boom = (pos: THREE.Vector3, big = false) => {
    for (let i = 0; i < (big ? 26 : 10); i++) spark(pos, i % 3 ? 0xffb050 : 0xffffff, big ? 3 : 1.4, 0.8 + rand() * 0.6, new V3((rand() - 0.5) * 14, rand() * 14, (rand() - 0.5) * 14), 0.8, -12);
    for (let i = 0; i < (big ? 8 : 3); i++) spark(pos, 0x554e48, big ? 6 : 3, 2.5, new V3((rand() - 0.5) * 3, 3 + rand() * 3, (rand() - 0.5) * 3), 1.5); // smoke
    sfx.explosion(big);
  };
  const bolts: { m: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3; t: number; dur: number; onHit: () => void }[] = [];
  const boltGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 5); boltGeo.rotateX(Math.PI / 2);
  const shoot = (from: THREE.Vector3, to: THREE.Vector3, color: string, onHit: () => void = () => {}) => {
    const m = new THREE.Mesh(boltGeo, new THREE.MeshStandardMaterial({ color: 0, emissive: new THREE.Color(color), emissiveIntensity: 6 }));
    m.position.copy(from); m.lookAt(to); scene.add(m);
    bolts.push({ m, from: from.clone(), to: to.clone(), t: 0, dur: from.distanceTo(to) / 90, onHit });
  };

  // ---- troops ----
  const trooperGeo = new THREE.CapsuleGeometry(0.26, 0.7, 3, 6);
  const headGeo = new THREE.SphereGeometry(0.22, 8, 6);
  const gunGeo = new THREE.BoxGeometry(0.1, 0.12, 0.9);
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x222428, metalness: 0.7, roughness: 0.4 });
  const makeTrooper = (side: 0 | 1, color: string, at: THREE.Vector3): Trooper => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(trooperGeo, new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.3 })); body.position.y = 0.62; g.add(body);
    const gun = new THREE.Mesh(gunGeo, gunMat); gun.position.set(0.22, 0.85, 0.35); g.add(gun);
    const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: 0x222222, emissive: new THREE.Color(color), emissiveIntensity: 0.6 })); head.position.y = 1.28; g.add(head);
    g.position.copy(at); g.position.y = heightAt(at.x, at.z);
    scene.add(g);
    return { g, side, alive: true, target: at.clone(), cool: rand() * 1.5, dieAt: Infinity, fall: 0 };
  };
  const troopers: Trooper[] = [];
  const defCount = small ? 12 : 22;
  for (let i = 0; i < defCount; i++) {
    const b = bunkers[i % bunkers.length]!;
    troopers.push(makeTrooper(1, defColor, b.clone().add(new V3((rand() - 0.5) * 12, 0, 4 + rand() * 6))));
  }
  const atkCount = Math.max(6, Math.min(small ? 18 : 30, info.troops || 20));

  // ---- dropships ----
  const drops: { s: THREE.Object3D; from: THREE.Vector3; to: THREE.Vector3; t: number; landed: boolean; hit: boolean }[] = [];
  const nDrop = Math.max(2, Math.min(5, Math.ceil(atkCount / 6)));
  for (let i = 0; i < nDrop; i++) {
    const ship = buildShip(atk.raceId, "large"); ship.root.scale.setScalar(0.9);
    const to = new V3(sea ? 0 + (i - nDrop / 2) * 12 : (i - nDrop / 2) * 18, 0, sea ? 8 + rand() * 6 : 25 + rand() * 10);
    to.y = Math.max(sea ? 0.5 : -100, heightAt(to.x, to.z)) + 2.5;
    const from = to.clone().add(new V3(-60 + rand() * 30, 140 + rand() * 30, 80));
    ship.root.position.copy(from); ship.root.rotation.z = -0.5;
    scene.add(ship.root);
    drops.push({ s: ship.root, from, to, t: -i * 0.6, landed: false, hit: false });
  }

  // Outcome: which side falls, and when. The engine already decided this.
  const atkSurvive = info.captured ? Math.max(1, Math.round(atkCount * Math.min(0.85, Math.max(0.25, info.troops > 0 ? info.survivors / info.troops : 0.5)))) : 0;
  const FIGHT_START = 6, FIGHT_LEN = 14;
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

  const camShots: (() => [THREE.Vector3, THREE.Vector3])[] = [
    () => [new V3(-50, 30, 90), new V3(0, 20, 10)],
    () => [new V3(30, 12, 55), new V3(0, 3, -10)],
    () => [new V3(Math.cos(clock * 0.12) * 70, 22, Math.sin(clock * 0.12) * 70), new V3(0, 3, -10)],
    () => [new V3(-10, 4, -20), new V3(0, 4, 30)],
  ];
  camera.position.set(-70, 50, 120);

  stage.onFrame((raw) => {
    const dt = paused ? 0 : raw;
    clock += dt;
    // waves
    if (water && dt > 0) {
      const p = water.geometry.attributes.position!;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Math.sin(x * 0.08 + clock * 1.3) * 0.35 + Math.cos(z * 0.06 + clock * 0.9) * 0.3); }
      p.needsUpdate = true; water.geometry.computeVertexNormals();
      for (const [i, b] of boats.entries()) { b.position.y = 0.6 + Math.sin(clock * 1.2 + i) * 0.3; b.rotation.z = Math.sin(clock + i) * 0.05; }
    }
    // dropships come down
    for (const d of drops) {
      if (d.landed) { d.s.position.y = d.to.y + Math.sin(clock * 2) * 0.15; continue; }
      d.t += dt / 4.5;
      const k = Math.max(0, Math.min(1, d.t));
      const e = 1 - Math.pow(1 - k, 3);
      d.s.position.lerpVectors(d.from, d.to, e);
      d.s.rotation.z = -0.5 * (1 - e);
      if (k > 0 && rand() < 0.5) spark(d.s.position.clone().add(new V3(0, -1, 0)), 0xffc070, 2.5, 0.4, new V3(0, -6, 0));
      if (k >= 1) { d.landed = true; spark(d.to.clone(), 0xffffff, 10, 0.5); for (let i = 0; i < 12; i++) spark(d.to.clone(), sea ? 0xe8f4ff : 0x8a7a66, 3, 1.4, new V3((rand() - 0.5) * 14, rand() * 4, (rand() - 0.5) * 14), 1.2); }
    }
    // defenders shoot at incoming dropships; gunboats too
    if (!deployed && clock > 1.5 && rand() < dt * (sea ? 6 : 3.5)) {
      const d = drops[Math.floor(rand() * drops.length)]!;
      const src = sea && boats.length && rand() < 0.6 ? boats[Math.floor(rand() * boats.length)]!.position.clone().add(new V3(0, 2, 0)) : bunkers[Math.floor(rand() * bunkers.length)]!.clone();
      const at = d.s.position.clone().add(new V3((rand() - 0.5) * 10, (rand() - 0.5) * 6, (rand() - 0.5) * 10));
      shoot(src, at, defColor, () => { if (rand() < 0.35) { spark(at, 0xffb050, 3, 0.4); sfx.explosion(false); } else spark(at, 0xffffff, 1.2, 0.2); });
      if (rand() < 0.3) sfx.cannon();
    }
    // troops pour out once the ships are down
    if (!deployed && drops.every((d) => d.landed)) {
      deployed = true;
      for (let i = 0; i < atkCount; i++) {
        const d = drops[i % drops.length]!;
        const tr = makeTrooper(0, atk.color, d.to.clone().add(new V3((rand() - 0.5) * 6, 0, 3 + rand() * 3)));
        const goal = bunkers[i % bunkers.length]!;
        tr.target = goal.clone().add(new V3((rand() - 0.5) * 14, 0, 10 + rand() * 10));
        troopers.push(tr);
      }
      scheduleDeaths();
      clock = Math.max(clock, FIGHT_START);
    }
    // troopers move, shoot and fall
    for (const t of troopers) {
      if (!t.alive) { if (t.fall < 1) { t.fall = Math.min(1, t.fall + dt * 2); t.g.rotation.x = -t.fall * Math.PI / 2; } continue; }
      if (clock >= t.dieAt) { t.alive = false; spark(t.g.position.clone().add(new V3(0, 1, 0)), 0xffa050, 2, 0.4); continue; }
      if (t.side === 0 && deployed) {
        const to = t.target.clone(); const d = to.sub(t.g.position); d.y = 0;
        if (d.length() > 1) { d.normalize().multiplyScalar(dt * 4); t.g.position.add(d); t.g.position.y = heightAt(t.g.position.x, t.g.position.z) + Math.abs(Math.sin(clock * 9 + t.cool * 5)) * 0.15; t.g.lookAt(t.target.x, t.g.position.y, t.target.z); }
      }
      if (deployed && clock > FIGHT_START) {
        t.cool -= dt;
        if (t.cool <= 0) {
          t.cool = 0.6 + rand() * 1.2;
          const foes = troopers.filter((o) => o.alive && o.side !== t.side);
          const f = foes.length ? foes[Math.floor(rand() * foes.length)]! : null;
          if (f) {
            const from = t.g.position.clone().add(new V3(0, 1.2, 0)), at = f.g.position.clone().add(new V3((rand() - 0.5) * 2, 1, (rand() - 0.5) * 2));
            shoot(from, at, t.side === 0 ? atk.color : defColor, () => spark(at, 0xffffff, 0.8, 0.15));
            if (rand() < 0.25) sfx.laser(1.6 + rand() * 0.4);
          }
        }
      }
    }
    // bunkers fall when the attackers win
    if (info.captured && deployed && clock > FIGHT_START + 4 && rand() < dt * 0.6) { const b = bunkers[Math.floor(rand() * bunkers.length)]!; boom(b.clone(), rand() < 0.4); }
    // bolts
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i]!; b.t += dt / Math.max(0.05, b.dur);
      b.m.position.lerpVectors(b.from, b.to, Math.min(1, b.t));
      if (b.t >= 1) { b.onHit(); scene.remove(b.m); (b.m.material as THREE.Material).dispose(); bolts.splice(i, 1); }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]!; p.age += dt;
      if (p.age >= p.life) { scene.remove(p.s); p.s.material.dispose(); parts.splice(i, 1); continue; }
      const k = p.age / p.life;
      p.v.y += p.g * dt;
      p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = (1 - k) * (1 - k); p.s.scale.setScalar(p.size * (1 + p.grow * k));
    }
    // ending
    if (!done && deployed && clock > FIGHT_START + FIGHT_LEN + 3) {
      done = true;
      const mineWon = (info.captured && info.attackerId === playerId) || (!info.captured && info.defenderId === playerId);
      const title = info.captured ? `${atk.name} take ${star.name}` : `${star.name} holds`;
      banner.innerHTML = `<div style="font:800 clamp(26px,5.5vw,46px)/1.05 system-ui,sans-serif">${esc(title)}</div><div style="opacity:.85;margin-top:6px">${mineWon ? "Victory" : info.attackerId === playerId || info.defenderId === playerId ? "Defeat" : ""}${info.captured ? ` · ${info.survivors} troops standing` : " · the landing is thrown back"}</div>`;
      banner.style.opacity = "1";
      if (info.captured) { // plant the conqueror's banner
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 8, 6), defMat); const b0 = bunkers[0]!; pole.position.set(b0.x, b0.y + 3, b0.z); scene.add(pole);
        const flag = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.2), new THREE.MeshStandardMaterial({ color: atk.color, side: THREE.DoubleSide, emissive: new THREE.Color(atk.color), emissiveIntensity: 0.4 })); flag.position.set(b0.x + 1.8, b0.y + 6, b0.z); scene.add(flag);
      }
    }
    if (cinematic) {
      const [pos, target] = camShots[Math.floor(clock / 5.5) % camShots.length]!();
      const k = 1 - Math.exp(-raw * 1.3);
      camera.position.lerp(pos, k);
      camera.position.y = Math.max(camera.position.y, heightAt(camera.position.x, camera.position.z) + 5);
      look.lerp(target, k); camera.lookAt(look);
    }
  });
  startBattleMusic();
}
