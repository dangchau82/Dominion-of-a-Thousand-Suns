// The 3D space battle replay. It plays a real battle recording (engine/battleLog.ts) shot by
// shot: every beam, missile and torpedo, every miss, shield block, point-defence kill, hit and
// destroyed ship is the one the engine rolled. Ships are the race models from ships3d.ts.
// Nothing here changes the game; it only reads the state.

import * as THREE from "three";
import type { BattleRecord } from "../../engine/battleLog";
import { designsOf } from "../../engine/designs";
import { tech } from "../../engine/tech";
import type { GameState, Id } from "../../engine/types";
import { buildFighter, buildShip, type Ship3D } from "./ships3d";
import { preloadShips } from "./shipModels";
import { battleTimeline, leftoverLosses, type TimedShot } from "./timeline";
import { glowTexture, isSmallScreen, makePlanet, makeStage, seeded, spaceBackdrop } from "./stage";
import { sfx, startBattleMusic, stopBattleMusic } from "./audio3d";

const V3 = THREE.Vector3;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

interface Model { obj: THREE.Object3D; ship: Ship3D | null; alive: boolean; base: THREE.Vector3; phase: number; fires: THREE.Sprite[] }
interface UnitView { models: Model[]; side: 0 | 1; isPlanet: boolean; isFighters: boolean; count: number; color: string; name: string }

/** Loads the Blender ship models for the races in this battle (a moment at most), then plays it. */
export function playSpaceBattle(state: GameState, rec: BattleRecord, playerId: Id, onClose: () => void = () => {}): void {
  const races = rec.units.map((u) => state.empires[u.empireId]?.raceId).filter((r): r is string => !!r);
  // only the hull sizes that actually fight here, so a battle downloads a few models, not every size
  const hulls = new Set<string>();
  for (const u of rec.units) {
    const race = state.empires[u.empireId]?.raceId;
    const d = race ? (designsOf(state, u.empireId).find((x) => x.id === u.key.replace("#fighters", "")) ?? state.designs[u.key.replace("#fighters", "")]) : undefined;
    if (race && d) { hulls.add(`${race}_${d.hull}`); if (d.hull === "titan" || d.hull === "colossus") hulls.add(`${race}_huge`); }
  }
  void preloadShips(races, 4000, hulls).then(() => playNow(state, rec, playerId, onClose));
}

function playNow(state: GameState, rec: BattleRecord, playerId: Id, onClose: () => void): void {
  const stage = makeStage(() => { stopBattleMusic(); onClose(); });
  const { scene, camera, controls, hud } = stage;
  const star = state.stars[rec.starId]!;
  const rand = seeded(rec.id * 7919 + rec.starId);
  spaceBackdrop(scene, star.color, rec.starId + 11, star.nebula);
  const tl = battleTimeline(rec);
  const small = isSmallScreen();

  // ---- particles ----
  interface Part { s: THREE.Sprite; v: THREE.Vector3; life: number; age: number; size: number; grow: number }
  const parts: Part[] = [];
  const maxParts = small ? 350 : 800;
  const spark = (pos: THREE.Vector3, color: THREE.ColorRepresentation, size: number, life: number, vel?: THREE.Vector3, grow = 0.4, parent: THREE.Object3D = scene): THREE.Sprite | null => {
    if (parts.length > maxParts) return null;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    s.position.copy(pos); s.scale.setScalar(size); parent.add(s);
    parts.push({ s, v: vel?.clone() ?? new V3(), life, age: 0, size, grow });
    return s;
  };
  const burst = (pos: THREE.Vector3, n: number, color: THREE.ColorRepresentation, speed: number, size: number, life: number) => {
    for (let i = 0; i < (small ? Math.ceil(n / 2) : n); i++) spark(pos, color, size * (0.5 + rand() * 0.7), life * (0.6 + rand() * 0.6), new V3().randomDirection().multiplyScalar(speed * (0.3 + rand() * 0.7)), 0.6);
  };

  // ---- the planet, if the battle is over a world ----
  const planetUnit = rec.units.findIndex((u) => u.key === "planet");
  let planetGroup: THREE.Group | null = null;
  if (star.planet) {
    const defSide = planetUnit >= 0 ? rec.units[planetUnit]!.side : 1;
    planetGroup = makePlanet(star.planet.climate, planetUnit >= 0 ? 70 : 80, rec.starId);
    planetGroup.position.set(defSide === 0 ? -190 : 190, -70, -260);
    if (planetUnit < 0) planetGroup.position.set(-60, -150, -320);
    scene.add(planetGroup);
  }

  // ---- fleets ----
  const FRONT = 34;
  const perSideRow = [0, 0];
  const views: UnitView[] = rec.units.map((u, i) => {
    const emp = state.empires[u.empireId]!;
    const isPlanet = u.key === "planet";
    const isFighters = u.key.endsWith("#fighters");
    const designId = u.key.replace("#fighters", "");
    const design = (designsOf(state, u.empireId).find((d) => d.id === designId) ?? state.designs[designId]);
    const hull = design?.hull ?? "medium";
    const dir = u.side === 0 ? 1 : -1;
    const models: Model[] = [];
    if (isPlanet && planetGroup) {
      // orbital defence platforms around the planet stand in for the planet's guns
      const n = Math.max(3, Math.min(8, Math.round(tl.units[i]!.shown + 3)));
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const ship = buildShip(emp.raceId, "small");
        ship.root.scale.setScalar(1.3);
        const base = planetGroup.position.clone().add(new V3(Math.cos(a) * 88, 30 + Math.sin(a) * 14, Math.sin(a) * 88));
        ship.root.position.copy(base);
        ship.root.lookAt(new V3(0, 0, 0));
        ship.root.rotateY(-Math.PI / 2);
        scene.add(ship.root);
        models.push({ obj: ship.root, ship, alive: true, base, phase: rand() * 6, fires: [] });
      }
    } else {
      const shown = tl.units[i]!.shown;
      const row = perSideRow[u.side]!;
      perSideRow[u.side]! += 1;
      for (let k = 0; k < shown; k++) {
        const ship = isFighters ? buildFighter(emp.raceId) : buildShip(emp.raceId, hull);
        const spacing = Math.max(4, ship.radius * 2.4);
        const col = k - (shown - 1) / 2;
        const base = new V3(-dir * (FRONT + row * 14 + (isFighters ? -8 : 0)) , (row % 2 ? 4 : -3) + (rand() - 0.5) * 3, col * spacing + (row % 2 ? spacing / 2 : 0));
        ship.root.position.copy(base).add(new V3(-dir * 40, 0, 0)); // start further back, then close in
        if (dir < 0) ship.root.rotation.y = Math.PI;
        scene.add(ship.root);
        for (const e of ship.engines) { const g = spark(e, ship.glow.clone().multiplyScalar(0.6), Math.min(3, ship.radius * 0.28), 1e9, undefined, 0, ship.root); if (g) g.userData.engine = true; }
        models.push({ obj: ship.root, ship, alive: true, base, phase: rand() * 6, fires: [] });
      }
    }
    return { models, side: u.side, isPlanet, isFighters, count: u.start, color: emp.color, name: isPlanet ? `${star.name} defences` : isFighters ? `${design?.name ?? u.name} fighters` : (design?.name ?? u.name) };
  });

  // ---- shields: one bubble per model, shown only when it blocks a shot ----
  const shieldMat = (color: THREE.Color) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { c: { value: color }, a: { value: 0 } },
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vV=-mv.xyz; vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*mv; }",
    fragmentShader: "uniform vec3 c; uniform float a; varying vec3 vN; varying vec3 vV; void main(){ float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),3.); gl_FragColor=vec4(c*f*a,f*a); }",
  });
  const shieldGeo = new THREE.SphereGeometry(1, 32, 16);
  const shields: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; t: number }[] = [];
  const flashShield = (m: Model, at: THREE.Vector3) => {
    const already = shields.find((x) => x.mesh.parent === m.obj);
    if (already) { already.t = 0; burst(at, 5, 0x8ad8ff, 8, 1, 0.3); return; }
    const r = (m.ship?.radius ?? 6) * 0.95;
    const mat = shieldMat(new THREE.Color(0x66c8ff));
    const mesh = new THREE.Mesh(shieldGeo, mat);
    mesh.scale.setScalar(r);
    m.obj.add(mesh);
    mesh.scale.divide(m.obj.scale);
    shields.push({ mesh, mat, t: 0 });
    burst(at, 8, 0x8ad8ff, 10, 1.2, 0.4);
    sfx.shield();
  };

  // ---- projectiles and beams ----
  const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true);
  interface Fly { kind: TimedShot["kind"]; obj: THREE.Object3D; from: THREE.Vector3; to: THREE.Vector3; t: number; dur: number; shot: TimedShot; color: THREE.Color; done: boolean }
  const flying: Fly[] = [];
  interface Beam { g: THREE.Group; outer: THREE.Mesh; core: THREE.Mesh; from: () => THREE.Vector3; to: THREE.Vector3; t: number; dur: number; width?: number }
  const beams: Beam[] = [];

  const aliveModels = (u: number) => views[u]!.models.filter((m) => m.alive);
  const muzzleOf = (m: Model, k: number) => {
    if (!m.ship) return m.obj.getWorldPosition(new V3());
    const mz = m.ship.muzzles[k % m.ship.muzzles.length]!;
    return m.obj.localToWorld(mz.clone());
  };
  const pointOn = (m: Model) => m.obj.getWorldPosition(new V3()).add(new V3().randomDirection().multiplyScalar((m.ship?.radius ?? 5) * 0.5));
  const unitCenter = (u: number) => { const ms = views[u]!.models; const c = new V3(); for (const m of ms) c.add(m.obj.position); return ms.length ? c.divideScalar(ms.length) : c; };

  // Weapon families (2026-11-28): each shooter's beam and missile family, from its design, so rail slugs,
  // ion streams, plasma bolts, spinal lances, stinger swarms and plasma missiles each look different.
  const families = rec.units.map((u) => {
    const out: { beam?: string; missile?: string } = {};
    const d = (designsOf(state, u.empireId).find((x) => x.id === u.key.replace("#fighters", "")) ?? state.designs[u.key.replace("#fighters", "")]);
    if (!d || u.key.endsWith("#fighters")) return out;
    for (const w of d.weapons) {
      if (w.count <= 0) continue;
      for (const fx of tech(w.techId).effects) if (fx.stat === "weapon" && fx.family) {
        if (fx.kind === "beam" && !out.beam) out.beam = fx.family;
        if (fx.kind === "missile" && !out.missile) out.missile = fx.family;
      }
    }
    // Kethrak Mother Queen's brood swarm (combat.ts titanTrait) flies as stinger darts.
    if (!out.missile && state.empires[u.empireId]?.raceId === "kethrak" && (d.hull === "titan" || d.hull === "colossus")) out.missile = "stinger";
    return out;
  });
  let shotNo = 0;
  const kills = rec.units.map(() => 0);
  const fire = (s: TimedShot) => {
    const sv = views[s.shooter], tv = views[s.target];
    if (!sv || !tv) return;
    const shooters = aliveModels(s.shooter);
    const src = shooters.length ? shooters[shotNo % shooters.length]! : sv.models[0];
    const tAlive = aliveModels(s.target);
    let tgt = s.modelLost >= 0 ? tv.models[s.modelLost] : tAlive.length ? tAlive[(shotNo * 7) % tAlive.length] : tv.models[0];
    if (tgt && !tgt.alive && tAlive.length) tgt = tAlive[0];
    shotNo++;
    const from = src ? muzzleOf(src, shotNo) : unitCenter(s.shooter);
    let to = tgt ? pointOn(tgt) : unitCenter(s.target);
    const color = new THREE.Color(state.empires[rec.units[s.shooter]!.empireId] ? (src?.ship?.glow ?? 0xffffff) : 0xffffff);
    if (s.result === "miss" || s.result === "dodged") to = to.clone().add(new V3().randomDirection().multiplyScalar(8 + rand() * 6)).add(to.clone().sub(from).normalize().multiplyScalar(25));
    const fam = s.kind === "beam" ? families[s.shooter]?.beam : s.kind === "missile" ? families[s.shooter]?.missile : undefined;
    if (s.kind === "beam" && fam === "cannon") { // plasma cannon: a slow, fat glowing bolt instead of a beam
      const obj = new THREE.Group();
      const hot = new THREE.Color(0xff8a30).lerp(color, 0.3);
      obj.add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), new THREE.MeshStandardMaterial({ color: 0, emissive: hot, emissiveIntensity: 6 })));
      spark(new V3(), hot, 3, 1e9, undefined, 0, obj);
      obj.position.copy(from); scene.add(obj); sfx.cannon();
      const fly: Fly = { kind: "torpedo", obj, from, to, t: 0, dur: 0.6 + rand() * 0.15, shot: s, color: hot, done: false };
      fly.obj.userData.target = tgt ?? null; flying.push(fly);
      return;
    }
    if (s.kind === "beam") {
      const g = new THREE.Group();
      const outer = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(0.55), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
      const core = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: color.clone().lerp(new THREE.Color(0xffffff), 0.5).multiplyScalar(0.8), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      g.add(outer, core); scene.add(g);
      const srcModel = src;
      const k = shotNo;
      // rail: a thin white-hot tracer, gone in a blink; lance: a thick, long-lasting spinal beam; ion: blue-white crackle.
      const look = fam === "rail" ? { w: 0.35, dur: 0.1 } : fam === "lance" ? { w: 3.2, dur: 0.75 } : { w: 1, dur: 0.32 };
      if (fam === "rail") { (core.material as THREE.MeshBasicMaterial).color.set(0xffffff); (outer.material as THREE.MeshBasicMaterial).color.set(0xb0c8ff).multiplyScalar(0.6); }
      if (fam === "ion") { (outer.material as THREE.MeshBasicMaterial).color.set(0x60b0ff).multiplyScalar(0.7); (core.material as THREE.MeshBasicMaterial).color.set(0xd8f0ff); }
      beams.push({ g, outer, core, from: () => (srcModel ? muzzleOf(srcModel, k) : from), to, t: 0, dur: look.dur, width: look.w });
      spark(from, color, fam === "lance" ? 5 : 1.2, fam === "lance" ? 0.5 : 0.12, undefined, 1);
      if (fam === "ion") for (let i = 0; i < 4; i++) spark(to.clone().add(new V3().randomDirection().multiplyScalar(1.5)), 0x9ad8ff, 0.9, 0.25, undefined, 1);
      if (fam === "rail" || fam === "lance") sfx.cannon(); else sfx.laser(0.8 + rand() * 0.5);
      land({ kind: s.kind, obj: g, from, to, t: 0, dur: 0.12, shot: s, color, done: false }, tgt ?? null);
      return;
    }
    const obj = new THREE.Group();
    const isTorp = s.kind === "torpedo";
    // stinger: a cluster of tiny darts; plasma missile: a violet plasma warhead.
    const mcol = fam === "plasma" ? new THREE.Color(0xc060ff) : color;
    const darts = fam === "stinger" ? 4 : 1;
    for (let i = 0; i < darts; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(isTorp ? 0.55 : fam === "stinger" ? 0.08 : fam === "plasma" ? 0.3 : 0.18, 10, 8), new THREE.MeshStandardMaterial({ color: 0, emissive: mcol, emissiveIntensity: 5 }));
      if (darts > 1) m.position.set((rand() - 0.5) * 1.2, (rand() - 0.5) * 1.2, (rand() - 0.5) * 1.2);
      obj.add(m);
    }
    spark(new V3(), mcol, isTorp ? 4 : fam === "plasma" ? 2.6 : fam === "stinger" ? 1.0 : 1.6, 1e9, undefined, 0, obj);
    obj.position.copy(from); scene.add(obj);
    (isTorp ? sfx.cannon : sfx.missile)();
    const fly: Fly = { kind: s.kind, obj, from, to, t: 0, dur: (isTorp ? 1.5 : 1.1) + rand() * 0.3, shot: s, color, done: false };
    fly.obj.userData.target = tgt ?? null;
    flying.push(fly);
  };

  const kill = (m: Model, at: THREE.Vector3) => {
    if (!m.alive) return;
    m.alive = false;
    const c = m.obj.getWorldPosition(new V3());
    const big = (m.ship?.radius ?? 3) > 4;
    burst(c, big ? 40 : 22, 0xffc070, big ? 22 : 14, big ? 3.2 : 1.8, 1.1);
    burst(c, 12, m.ship?.glow ?? 0xffffff, 10, 1.6, 0.8);
    spark(c, 0xffffff, big ? 16 : 9, 0.3, undefined, 1.3);
    flashLight(c, big ? 900 : 400);
    sfx.explosion(true);
    // break the model apart into drifting debris
    const kids = [...m.obj.children];
    for (const k of kids) {
      if ((k as THREE.Sprite).isSprite) { m.obj.remove(k); continue; }
      const wp = k.getWorldPosition(new V3()), wq = k.getWorldQuaternion(new THREE.Quaternion()), ws = k.getWorldScale(new V3());
      scene.attach(k); k.position.copy(wp); k.quaternion.copy(wq); k.scale.copy(ws);
      debris.push({ o: k, v: wp.clone().sub(c).normalize().multiplyScalar(2 + rand() * 7).add(new V3().randomDirection().multiplyScalar(1.5)), spin: new V3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(3), age: 0 });
    }
    void at;
  };

  const land = (f: Fly, tgt: Model | null) => {
    const s = f.shot, at = f.to;
    switch (s.result) {
      case "miss": case "dodged": break;
      case "intercepted": burst(at, 10, 0xffe08a, 9, 1.2, 0.4); sfx.explosion(false); break;
      case "blocked": if (tgt) flashShield(tgt, at); break;
      case "hit":
        burst(at, 10, 0xffa040, 14, 1, 0.5); sfx.explosion(false);
        if (tgt && tgt.alive && tgt.fires.length < 3 && rand() < 0.4 && tgt.ship) {
          const local = tgt.obj.worldToLocal(at.clone());
          const fire = spark(local, 0xff7a2a, (tgt.ship.radius) * 0.35, 1e9, undefined, 0, tgt.obj);
          if (fire) { fire.userData.fire = true; tgt.fires.push(fire); }
        }
        break;
      case "kill":
        kills[s.target]! += 1;
        if (s.modelLost >= 0 && views[s.target]!.models[s.modelLost]) kill(views[s.target]!.models[s.modelLost]!, at);
        else burst(at, 14, 0xffa040, 16, 1.4, 0.6);
        break;
    }
  };

  // ---- light flashes and debris ----
  const flash = new THREE.PointLight(0xffd0a0, 0, 300, 1.4); scene.add(flash);
  let flashI = 0;
  const flashLight = (at: THREE.Vector3, power: number) => { flash.position.copy(at); flashI = Math.min(1200, Math.max(flashI, power)); };
  const debris: { o: THREE.Object3D; v: THREE.Vector3; spin: THREE.Vector3; age: number }[] = [];

  // ---- HUD ----
  const sideName = (side: 0 | 1) => { const id = rec.units.find((u) => u.side === side)?.empireId ?? rec.empires[side]; return state.empires[id]!; };
  const playerSide = rec.units.find((u) => u.empireId === playerId)?.side ?? 0;
  hud.style.cssText = "position:absolute;inset:0;pointer-events:none;display:flex;flex-direction:column;justify-content:space-between;padding:max(10px,env(safe-area-inset-top)) 12px 12px;font:14px/1.35 system-ui,sans-serif;color:#e8eef5";
  hud.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
      <div class="b3-side" data-side="0" style="background:rgba(8,12,20,.6);border-radius:10px;padding:8px 12px;max-width:44vw"></div>
      <div style="text-align:center;background:rgba(8,12,20,.6);border-radius:10px;padding:6px 12px"><b>Battle at ${esc(star.name)}</b><br><span class="b3-round" style="opacity:.75">Turn ${rec.turn}</span></div>
      <div class="b3-side" data-side="1" style="background:rgba(8,12,20,.6);border-radius:10px;padding:8px 12px;max-width:44vw;text-align:right"></div>
    </div>
    <div class="b3-banner" style="align-self:center;text-align:center;opacity:0;transition:opacity .8s;text-shadow:0 0 18px #000"></div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;pointer-events:auto">
      <button class="b3-btn" data-act="pause">Pause</button>
      <button class="b3-btn" data-act="speed">Speed 1×</button>
      <button class="b3-btn" data-act="cam">Cinematic camera</button>
      <button class="b3-btn" data-act="skip">Skip to end</button>
      <button class="b3-btn" data-act="close">Close</button>
    </div>`;
  for (const b of hud.querySelectorAll<HTMLButtonElement>(".b3-btn")) b.style.cssText = "min-height:44px;padding:0 14px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(8,12,20,.7);color:#e8eef5;font:600 14px system-ui,sans-serif;cursor:pointer";
  const sideBox = [hud.querySelector<HTMLDivElement>('[data-side="0"]')!, hud.querySelector<HTMLDivElement>('[data-side="1"]')!];
  let over = false;
  const countNow = (u: number) => {
    const info = rec.units[u]!;
    if (over) return info.end;
    return Math.max(info.end, info.start - kills[u]!);
  };
  const drawSides = () => {
    for (const side of [0, 1] as const) {
      const e = sideName(side);
      const rows = rec.units.map((u, i) => ({ u, i })).filter(({ u }) => u.side === side)
        .map(({ u, i }) => `<div style="font-size:13px${countNow(i) === 0 && u.key !== "planet" ? ";opacity:.45;text-decoration:line-through" : ""}">${esc(views[i]!.name)} ${u.key === "planet" ? "" : `×${countNow(i)}`}</div>`).join("");
      sideBox[side]!.innerHTML = `<b style="color:${e.color}">${esc(e.name)}</b>${side === playerSide ? " <span style='opacity:.7'>(you)</span>" : ""}${rows}`;
    }
  };
  drawSides();

  let paused = false, speed = 1, cinematic = true;
  const banner = hud.querySelector<HTMLDivElement>(".b3-banner")!;
  const btn = (a: string) => hud.querySelector<HTMLButtonElement>(`[data-act="${a}"]`)!;
  btn("pause").onclick = () => { paused = !paused; btn("pause").textContent = paused ? "Play" : "Pause"; };
  btn("speed").onclick = () => { speed = speed === 1 ? 2 : speed === 2 ? 4 : 1; btn("speed").textContent = `Speed ${speed}×`; };
  const setCinematic = (on: boolean) => { cinematic = on; controls.enabled = !on; btn("cam").textContent = on ? "Cinematic camera" : "Free camera"; if (!on) controls.target.copy(look); };
  btn("cam").onclick = () => setCinematic(!cinematic);
  controls.addEventListener("start", () => { if (cinematic) setCinematic(false); });
  btn("close").onclick = () => stage.close();

  let clock = 0, next = 0, ended = false;
  const pending: { at: number; m: Model }[] = [];
  let bannerAt = Infinity;
  const finish = () => {
    if (ended) return;
    ended = true; over = true;
    // Ships the drawn shots didn't account for (long battles are cut short) go down one by one.
    const doomed: Model[] = [];
    rec.units.forEach((_, i) => {
      let left = leftoverLosses(tl, i);
      for (const m of views[i]!.models) { if (left <= 0) break; if (m.alive && !views[i]!.isPlanet) { doomed.push(m); left--; } }
    });
    const gap = doomed.length ? Math.min(0.25, 3 / doomed.length) : 0;
    doomed.forEach((m, k) => { pending.push({ at: clock + 0.3 + k * gap, m }); });
    drawSides();
    const standing = [0, 1].map((side) => rec.units.reduce((a, u) => a + (u.side === side && u.key !== "planet" ? u.end : 0), 0) + (planetUnit >= 0 && rec.units[planetUnit]!.side === side ? 1 : 0));
    const mine = standing[playerSide]!, theirs = standing[1 - playerSide]!;
    const theirShips = theirs - (planetUnit >= 0 && rec.units[planetUnit]!.side !== playerSide ? 1 : 0);
    const myShips = mine - (planetUnit >= 0 && rec.units[planetUnit]!.side === playerSide ? 1 : 0);
    const title = mine > 0 && theirs === 0 ? "Victory"
      : mine === 0 && theirs > 0 ? "Defeat"
      : planetUnit >= 0 && rec.units[planetUnit]!.side !== playerSide && theirShips === 0 && myShips > 0 ? "Your fleet holds the orbit"
      : planetUnit >= 0 && rec.units[planetUnit]!.side === playerSide && myShips === 0 && theirShips > 0 ? "Our world still stands, under siege"
      : "Both sides withdraw";
    banner.innerHTML = `<div style="font:800 clamp(28px,6vw,48px)/1.05 system-ui,sans-serif">${title}</div><div style="opacity:.85;margin-top:6px">${rec.cut ? "A long battle: the last shots are summarised." : `${rec.rounds} round${rec.rounds === 1 ? "" : "s"} of fire`}</div>`;
    bannerAt = (pending.length ? pending[pending.length - 1]!.at : clock) + 1.2;
  };
  btn("skip").onclick = () => {
    while (next < tl.shots.length) {
      const s = tl.shots[next++]!;
      if (s.result === "kill") { kills[s.target]! += 1; if (s.modelLost >= 0) { const m = views[s.target]!.models[s.modelLost]; if (m?.alive) kill(m, m.obj.position); } }
    }
    clock = tl.duration;
  };

  // ---- cinematic camera ----
  const look = new V3();
  const shotsCam: (() => [THREE.Vector3, THREE.Vector3])[] = [
    () => [new V3(0, 22, 95), new V3(0, 0, 0)],
    () => [new V3(-75, 14, 32), new V3(30, 0, 0)],
    () => [new V3(75, 10, -32), new V3(-30, 0, 0)],
    () => [new V3(Math.cos(clock * 0.15) * 70, 18, Math.sin(clock * 0.15) * 70), new V3(0, 0, 0)],
    () => [new V3(0, -26, 60), new V3(0, 4, 0)],
    () => { const a = views.flatMap((v) => v.models).find((m) => m.alive && m.ship && (m.ship.radius > 3)); const p = a ? a.obj.position : new V3(); return [p.clone().add(new V3(0, 8, 26)), p.clone()]; },
  ];
  camera.position.set(0, 30, 120);

  stage.onFrame((rawDt) => {
    const dt = paused ? 0 : rawDt * speed;
    clock += dt;
    // fleets close in during the lead-in, then hold and bob
    for (const v of views) for (const m of v.models) {
      if (!m.alive || v.isPlanet) continue;
      const pull = Math.min(1, clock / 2.2);
      const dir = v.side === 0 ? 1 : -1;
      const tx = m.base.x - dir * 40 * (1 - pull);
      const t = clock + m.phase;
      if (v.isFighters) {
        m.obj.position.set(m.base.x + dir * (8 + Math.sin(t * 0.9) * 10), m.base.y + Math.sin(t * 1.3) * 5, m.base.z + Math.cos(t * 0.9) * 8);
        m.obj.rotation.set(0, dir > 0 ? Math.cos(t * 0.9) * 0.6 : Math.PI + Math.cos(t * 0.9) * 0.6, Math.sin(t * 1.3) * 0.4);
      } else {
        m.obj.position.set(tx, m.base.y + Math.sin(t * 0.6) * 0.6, m.base.z);
        m.obj.rotation.x = Math.sin(t * 0.4) * 0.05;
      }
    }
    if (planetGroup) planetGroup.rotation.y += rawDt * 0.01;
    // fire due shots
    while (!ended && next < tl.shots.length && tl.shots[next]!.t <= clock) fire(tl.shots[next++]!);
    if (!ended && next >= tl.shots.length && clock >= tl.duration && flying.length === 0) finish();
    for (let i = pending.length - 1; i >= 0; i--) if (pending[i]!.at <= clock) { const p = pending.splice(i, 1)[0]!; kill(p.m, p.m.obj.position); }
    if (clock >= bannerAt && banner.style.opacity !== "1") banner.style.opacity = "1";
    // projectiles
    for (let i = flying.length - 1; i >= 0; i--) {
      const f = flying[i]!;
      f.t += dt / f.dur;
      const k = Math.min(1, f.t);
      const p = f.from.clone().lerp(f.to, k);
      p.y += Math.sin(k * Math.PI) * (f.kind === "missile" ? 4 : 1.5);
      if (f.shot.result === "intercepted" && k >= 0.6) { f.to = p; f.t = 1; }
      f.obj.position.copy(p);
      if (f.kind === "missile" && rand() < 0.7) spark(p, 0xffd0a0, 0.9, 0.5, undefined, 1);
      if (f.kind === "torpedo") spark(p, f.color, 2, 0.35, undefined, -0.5);
      if (f.t >= 1) { land(f, f.obj.userData.target as Model | null); scene.remove(f.obj); flying.splice(i, 1); }
    }
    for (let i = beams.length - 1; i >= 0; i--) {
      const b = beams[i]!; b.t += dt;
      if (b.t >= b.dur) { scene.remove(b.g); (b.outer.material as THREE.Material).dispose(); (b.core.material as THREE.Material).dispose(); beams.splice(i, 1); continue; }
      const from = b.from(), dir = b.to.clone().sub(from), len = dir.length();
      b.g.position.copy(from).addScaledVector(dir, 0.5);
      b.g.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir.normalize());
      const w = Math.sin(Math.PI * b.t / b.dur);
      const bw = b.width ?? 1;
      b.outer.scale.set(0.16 * w * bw, len, 0.16 * w * bw); b.core.scale.set(0.045 * w * bw, len, 0.045 * w * bw);
    }
    for (let i = shields.length - 1; i >= 0; i--) {
      const s = shields[i]!; s.t += dt;
      s.mat.uniforms.a!.value = Math.max(0, 1 - s.t / 0.4) * 0.9;
      if (s.t > 0.4) { s.mesh.parent?.remove(s.mesh); s.mat.dispose(); shields.splice(i, 1); }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]!; p.age += dt;
      if (p.s.userData.fire) { p.s.scale.setScalar(p.size * (0.7 + rand() * 0.5)); continue; }
      if (p.s.userData.engine) { p.s.scale.setScalar(p.size * (0.85 + rand() * 0.3)); continue; }
      if (p.age >= p.life) { p.s.parent?.remove(p.s); p.s.material.dispose(); parts.splice(i, 1); continue; }
      const k = p.age / p.life;
      p.s.position.addScaledVector(p.v, dt); p.v.multiplyScalar(Math.pow(0.96, dt * 60));
      p.s.material.opacity = (1 - k) * (1 - k); p.s.scale.setScalar(p.size * (1 + p.grow * k));
    }
    for (const d of debris) { d.age += dt; d.o.position.addScaledVector(d.v, dt); d.o.rotation.x += d.spin.x * dt; d.o.rotation.y += d.spin.y * dt; d.o.rotation.z += d.spin.z * dt; }
    flashI *= Math.pow(0.02, rawDt); flash.intensity = flashI;
    // HUD refresh a few times a second is enough
    if (Math.floor(clock * 4) !== Math.floor((clock - dt) * 4)) drawSides();
    // camera
    if (cinematic) {
      const [pos, target] = shotsCam[Math.floor(clock / 6) % shotsCam.length]!();
      const k = 1 - Math.exp(-rawDt * 1.4);
      camera.position.lerp(pos, k); look.lerp(target, k); camera.lookAt(look);
    }
  });
  if (location.hash.includes("demo")) (window as unknown as { __b3d: unknown }).__b3d = { scene, camera };
  startBattleMusic();
}
