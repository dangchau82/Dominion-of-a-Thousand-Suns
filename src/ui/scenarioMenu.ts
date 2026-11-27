// Scenario picker (written by Claude 2): pick one of the ready-made scenarios and a race,
// and play. Opened from the main menu's "Scenarios" button.

import { newGame, type GameSettings } from "../engine";
import { RACES } from "../engine/data/races";
import { applyScenario, SCENARIOS, type ScenarioId } from "../engine/scenarios";
import type { GameState } from "../engine/types";
import { portraitHTML } from "./assets";
import { clearAutosave } from "./storage";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Size and rivals for each scenario. */
const SETUP: Record<ScenarioId, Pick<GameSettings, "size" | "rivals" | "shape">> = {
  "last-bastion": { size: "small", rivals: 4, shape: "ellipse" },
  "broken-kingdoms": { size: "medium", rivals: 4, shape: "spiral" },
  "long-night": { size: "medium", rivals: 5, shape: "ellipse" },
  "gold-rush": { size: "medium", rivals: 4, shape: "ring" },
};

export function showScenarios(root: HTMLElement, start: (g: GameState) => void, back: () => void): void {
  let pick: ScenarioId = SCENARIOS[0]!.id;
  let raceId = RACES[0]!.id;
  root.innerHTML = "";
  const page = document.createElement("div");
  page.style.cssText = "overflow-y:auto;padding:24px 32px;height:100%;background:radial-gradient(ellipse at top, #141c33, #05070d 70%)";
  const render = () => {
    page.innerHTML = `<h1 style="margin-bottom:4px;color:var(--gold);letter-spacing:.08em">SCENARIOS</h1><p class="dim">Short games with a story and a goal.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin:12px 0">
      ${SCENARIOS.map((s) => `<button data-s="${s.id}" style="text-align:left;padding:12px;border-radius:12px;${s.id === pick ? "border-color:var(--gold);box-shadow:0 0 12px rgba(243,197,96,.3)" : ""}">
        <b style="color:var(--gold)">${esc(s.name)}</b><br><span class="dim" style="font-size:13px">${esc(s.story)}</span><br><span style="font-size:13px">🎯 ${esc(s.goal)}</span></button>`).join("")}
      </div>
      <h3>Play as</h3>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${RACES.map((r) => `<button data-r="${r.id}" title="${esc(r.name)}" style="width:auto;flex:none;padding:4px;border-radius:10px;${r.id === raceId ? `border-color:${r.color};box-shadow:0 0 10px ${r.color}66` : ""}">${portraitHTML(r.id, 'style="width:44px;height:55px;object-fit:cover;border-radius:7px;display:block"')}</button>`).join("")}</div>
      <p><b style="color:${RACES.find((r) => r.id === raceId)!.color}">${esc(RACES.find((r) => r.id === raceId)!.name)}</b></p>
      <div style="display:flex;gap:10px;margin-top:10px;max-width:420px"><button data-back>Back</button><button class="gold" data-go>Start Scenario ▶</button></div>`;
    page.querySelectorAll<HTMLButtonElement>("[data-s]").forEach((b) => (b.onclick = () => { pick = b.dataset.s as ScenarioId; render(); }));
    page.querySelectorAll<HTMLButtonElement>("[data-r]").forEach((b) => (b.onclick = () => { raceId = b.dataset.r!; render(); }));
    page.querySelector<HTMLButtonElement>("[data-back]")!.onclick = back;
    page.querySelector<HTMLButtonElement>("[data-go]")!.onclick = () => {
      const r = RACES.find((x) => x.id === raceId)!;
      const g = newGame({ seed: Math.floor(Math.random() * 2 ** 31), ...SETUP[pick], playerRaceId: raceId, playerName: r.name, difficulty: "normal" });
      applyScenario(g, pick, 0);
      clearAutosave();
      start(g);
    };
  };
  render();
  root.append(page);
}
