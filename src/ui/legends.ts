// Hall of Legends (written by Claude 2). One page for the stories the game keeps but never
// showed: our famous fleets and their admirals, the galaxy's great battles, the endgame
// paths and great works of the empires we know, and the Ascension Gate requirements.
// Reads the player's view plus public fame (named fleets and great battles are news).

import { famousFleets, rankTitle } from "../engine/battleStories";
import { PATH_NAMES, WORK_BY_ID, type EndgamePath } from "../engine/data/greatWorks";
import { gateWorlds, raceWork } from "../engine/endgame";
import type { GameState, Id } from "../engine/types";
import { portraitHTML } from "./assets";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const PERSONALITY_WORDS: Record<string, string> = {
  bold: "Bold: her ships hit harder", cautious: "Cautious: her ships are harder to hit", ruthless: "Ruthless: every hit does more damage",
  cunning: "Cunning: her ships dodge some fire", honourable: "Honourable: her ships are harder to hit",
};

function bar(done: number, needs: number, color: string): string {
  const pct = Math.max(0, Math.min(100, Math.round((done / Math.max(1, needs)) * 100)));
  return `<span style="display:inline-block;width:120px;height:8px;border-radius:4px;background:#222;vertical-align:middle;overflow:hidden"><span style="display:block;height:100%;width:${pct}%;background:${color}"></span></span> ${pct}%`;
}

export function legendsHTML(state: GameState, playerId: Id): string {
  const me = state.empires[playerId]!;
  const known = (id: Id) => id === playerId || me.contacts.includes(id);
  const name = (id: Id) => (known(id) ? esc(state.empires[id]!.name) : "an unknown empire");
  const color = (id: Id) => (known(id) ? state.empires[id]!.color : "#888");
  const parts: string[] = [`<h2>🏆 Hall of Legends</h2>`];

  // Our endgame path and great work.
  const st = state.endgame?.[playerId];
  const paths = (["feared", "beloved", "builder"] as EndgamePath[]).filter((p) => st?.paths[p] !== undefined);
  const myWork = st?.works[0];
  const ours = raceWork(me);
  parts.push(`<h3>Our path</h3>`);
  parts.push(paths.length
    ? `<p>The galaxy speaks of us as <b>${paths.map((p) => PATH_NAMES[p]).join("</b> and <b>")}</b>.</p>`
    : `<p class="dim">No path has opened yet. Conquer widely to be <b>Feared</b>, win allies to be <b>Beloved</b>, or grow many productive worlds to be a <b>Builder</b>.</p>`);
  if (myWork) {
    const def = WORK_BY_ID.get(myWork.workId)!;
    parts.push(`<p>Our great work: <b>${esc(def.name)}</b> ${myWork.finished ? `<span class="gold-text">finished on turn ${myWork.finishedTurn}</span>` : bar(myWork.done, def.turns, me.color)}<br><span class="dim">${esc(def.text)}</span></p>`);
  } else if (ours) {
    parts.push(`<p class="dim">Our people's own great work, the <b>${esc(ours.name)}</b>, can be begun once a path opens.</p>`);
  }
  const worlds = Object.values(state.colonies).filter((c) => c.empireId === playerId).length;
  parts.push(`<p class="dim">The Ascension Gate also needs ${gateWorlds(state)} worlds (we have ${worlds}) and a finished great work.</p>`);

  // Great works across the galaxy.
  const works = state.empires.filter((o) => o.id !== playerId && known(o.id) && o.alive)
    .flatMap((o) => (state.endgame?.[o.id]?.works ?? []).map((w) => ({ o, w, def: WORK_BY_ID.get(w.workId)! })));
  if (works.length) {
    parts.push(`<h3>Great works of the galaxy</h3><ul>`);
    for (const { o, w, def } of works) parts.push(`<li><b style="color:${o.color}">${esc(o.name)}</b>: ${esc(def.name)} ${w.finished ? `<span class="gold-text">(finished)</span>` : `<span class="dim">(being built)</span>`}</li>`);
    parts.push(`</ul>`);
  }

  // Our famous fleets.
  const fleets = famousFleets(state, me);
  parts.push(`<h3>Our famous fleets</h3>`);
  if (!fleets.length) parts.push(`<p class="dim">No fleet of ours has made its name yet. Three real victories earn a fleet a name.</p>`);
  for (const { v } of fleets) {
    const adm = v.admiral;
    parts.push(`<div style="display:flex;gap:12px;align-items:center;margin:8px 0;padding:8px;border:1px solid #333;border-radius:10px">
      ${adm ? portraitHTML(me.raceId, 'style="width:64px;height:80px;object-fit:cover;border-radius:8px"') : ""}
      <div><b>The ${esc(v.name!)}</b> <span class="gold-text">${rankTitle(v)}</span><br>
      ${v.victories} victories, ${v.kills} enemy ships destroyed${adm ? `<br>Admiral <b>${esc(adm.name)}</b>, in command since turn ${adm.since}. <span class="dim">${PERSONALITY_WORDS[adm.personality] ?? ""}</span>` : ""}</div></div>`);
  }

  // Famous fleets of known rivals (fame travels).
  const rivals = state.empires.filter((o) => o.id !== playerId && known(o.id) && o.alive).flatMap((o) => famousFleets(state, o).map((f) => ({ o, v: f.v })));
  if (rivals.length) {
    parts.push(`<h3>Famous enemy fleets</h3><ul>`);
    for (const { o, v } of rivals.slice(0, 12)) parts.push(`<li>The <b>${esc(v.name!)}</b> of the <span style="color:${o.color}">${esc(o.name)}</span>: ${rankTitle(v)}, ${v.victories} victories${v.admiral ? `, Admiral ${esc(v.admiral.name)}` : ""}</li>`);
    parts.push(`</ul>`);
  }

  // Great battles.
  const battles = [...(state.greatBattles ?? [])].reverse();
  parts.push(`<h3>Great battles</h3>`);
  if (!battles.length) parts.push(`<p class="dim">No battle yet has been big enough to be remembered by name.</p>`);
  else {
    parts.push(`<ul>`);
    for (const b of battles) {
      const [a, d] = b.empires;
      parts.push(`<li><b>${esc(b.name[0]!.toUpperCase() + b.name.slice(1))}</b> <span class="dim">(turn ${b.turn})</span>: <span style="color:${color(a)}">${name(a)}</span> against <span style="color:${color(d)}">${name(d)}</span>, ${b.ships} ships; ${b.losses[0]} and ${b.losses[1]} lost.</li>`);
    }
    parts.push(`</ul>`);
  }
  return parts.join("\n");
}
