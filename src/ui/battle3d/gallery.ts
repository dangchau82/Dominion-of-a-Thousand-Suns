// A turning line-up of every race's ship (#ship-gallery): the Blender models where loaded,
// the code-built shapes otherwise.
import * as THREE from "three";
import type { HullSize } from "../../engine/data/ships";
import { RACE_STYLE } from "../shipArt";
import { buildShip, LENGTH } from "./ships3d";
import { preloadShips } from "./shipModels";
import { makeStage, spaceBackdrop } from "./stage";

export function showGallery(hull: HullSize): void {
  void preloadShips(Object.keys(RACE_STYLE)).then(() => show(hull));
}

function show(hull: HullSize): void {
  const stage = makeStage(() => {});
  spaceBackdrop(stage.scene, "yellow", 3, false);
  const races = Object.keys(RACE_STYLE);
  const cols = 6, gap = LENGTH[hull] * 1.6;
  const ships: THREE.Object3D[] = [];
  races.forEach((r, i) => {
    const s = buildShip(r, hull);
    s.root.position.set(((i % cols) - (cols - 1) / 2) * gap, -Math.floor(i / cols) * gap * 0.75 + gap * 0.75, 0);
    stage.scene.add(s.root); ships.push(s.root);
    const c = document.createElement("canvas"); c.width = 256; c.height = 48;
    const g = c.getContext("2d")!; g.fillStyle = "#e8eef5"; g.font = "bold 26px system-ui"; g.textAlign = "center"; g.fillText(r, 128, 34);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthWrite: false }));
    label.scale.set(gap * 0.6, gap * 0.11, 1); label.position.copy(s.root.position).add(new THREE.Vector3(0, -gap * 0.32, 0));
    stage.scene.add(label);
  });
  stage.camera.position.set(0, 0, gap * 4.2);
  stage.camera.lookAt(0, 0, 0);
  stage.hud.innerHTML = `<div style="position:absolute;top:10px;left:12px;color:#e8eef5;font:15px system-ui">Race ships (${hull} hull). Drag to turn. Esc to close.</div>`;
  stage.controls.enabled = true;
  stage.onFrame((dt) => { for (const s of ships) s.rotation.y += dt * 0.4; });
}
