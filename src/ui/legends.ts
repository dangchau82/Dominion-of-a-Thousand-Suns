// Hall of Legends (written by Claude 2). One page for the stories the game keeps but never
// showed: our famous fleets and their admirals, the galaxy's great battles, the endgame
// paths and great works of the empires we know, and the Ascension Gate requirements.
// Reads the player's view plus public fame (named fleets and great battles are news).

import { famousFleets, rankTitle } from "../engine/battleStories";
import { PATH_NAMES, WORK_BY_ID, type EndgamePath } from "../engine/data/greatWorks";
import { gateWorlds, raceWork } from "../engine/endgame";
import { artifactsOf } from "../engine/digSites";
import { residentTroupes } from "../engine/fair";
import { sagaEventDef, sagaOf } from "../engine/sagas";
import { CONTESTS, medalTable } from "../engine/games";
import { heroesOf, heroTitle, ROLE_NAMES } from "../engine/heroes";
import { BRANCH_BY_ID, TRAIT_BY_ID } from "../engine/data/heroCareers";
import { MEDALS, medalsOf } from "../engine/medals";
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

/** Concept art for a great work, if Danny has added it (art/works/<id>.png); hidden if missing. */
function workArt(id: string): string {
  return `<img src="art/works/${id}.png" alt="" onerror="this.remove()" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:10px;margin:4px 0">`;
}

export function legendsHTML(state: GameState, playerId: Id): string {
  const me = state.empires[playerId]!;
  const known = (id: Id) => id === playerId || me.contacts.includes(id);
  const name = (id: Id) => (known(id) ? esc(state.empires[id]!.name) : "an unknown empire");
  const color = (id: Id) => (known(id) ? state.empires[id]!.color : "#888");
  const parts: string[] = [`<h2>🏆 Hall of Legends</h2>`];

  // Medals earned this game.
  const medals = medalsOf(state, me);
  parts.push(`<h3>Medals <span class="dim">(${medals.length} of ${MEDALS.length})</span></h3>`);
  parts.push(`<div style="display:flex;flex-wrap:wrap;gap:6px">${MEDALS.map((m) => {
    const got = medals.find((x) => x.id === m.id);
    return `<span title="${esc(m.text)}${got ? ` (turn ${got.turn})` : ""}" style="padding:4px 8px;border-radius:8px;border:1px solid ${got ? "#c9a54a" : "#333"};opacity:${got ? 1 : 0.35}">${m.icon} ${esc(m.name)}</span>`;
  }).join("")}</div>`);

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
    parts.push(workArt(def.id));
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

  // Our people's saga: where it stands and which way our choices lean.
  const saga = sagaOf(state, me);
  if (saga && saga.played.length) {
    const lean = (v: number, plus: string, minus: string) => (v >= 4 ? `<b>${plus}</b>` : v <= -4 ? `<b>${minus}</b>` : v > 0 ? plus.toLowerCase() + " (a little)" : v < 0 ? minus.toLowerCase() + " (a little)" : "undecided");
    parts.push(`<h3>Our people's saga</h3><p>${saga.ending ? `The saga is told: <b>${esc(sagaEventDef(saga.ending)?.title ?? "")}</b>.` : `Act ${Math.max(1, saga.acts)} of 4.`} <span class="dim">${saga.played.length} chapters so far; ${saga.flags.length} turning points.</span></p>
      <p>Our choices have made us: ${lean(saga.scores.mercy, "Merciful", "Ruthless")}, ${lean(saga.scores.openness, "Open", "Guarded")}, ${lean(saga.scores.tradition, "Traditional", "Bold")}.<br><span class="dim">How our saga ends depends on these.</span></p>`);
  }

  // Heroes in our service, and those we have lost.
  const heroes = heroesOf(state, me);
  parts.push(`<h3>Our heroes</h3>`);
  if (!heroes.length) parts.push(`<p class="dim">No hero serves us yet. People of rare talent come to growing empires.</p>`);
  for (const h of heroes) {
    const where = h.starId !== undefined ? ` at ${esc(state.stars[h.starId]?.name ?? "?")}` : h.field ? ` (${h.field})` : "";
    parts.push(`<div style="display:flex;gap:12px;align-items:center;margin:6px 0;padding:6px 8px;border:1px solid #333;border-radius:10px">
      ${portraitHTML(me.raceId, 'style="width:52px;height:64px;object-fit:cover;border-radius:8px"')}
      <div><b>${esc(heroTitle(h))} ${esc(h.name)}</b>${where} <span class="gold-text">level ${h.level}</span>${h.branch ? ` <span class="dim">(was ${ROLE_NAMES[h.role].toLowerCase()})</span>` : ""}<br>
      ${h.branch ? `<span>${esc(BRANCH_BY_ID.get(h.branch)!.does)}</span><br>` : h.level < 3 ? `<span class="dim">Chooses a career at level 3.</span><br>` : ""}
      ${(h.traits ?? []).length ? `<span>Traits: ${(h.traits ?? []).map((t) => `<b title="${esc(TRAIT_BY_ID.get(t)?.text ?? "")}">${esc(TRAIT_BY_ID.get(t)?.name ?? t)}</b>`).join(", ")}</span><br>` : ""}
      <span class="dim">Serving since turn ${h.since}; ${h.deeds} great deeds.</span></div></div>`);
  }
  const lost = (state.heroes?.fallen ?? []).filter((f) => f.empireId === playerId).slice(-5).reverse();
  if (lost.length) parts.push(`<p class="dim">Remembered: ${lost.map((f) => `${esc(f.title ?? ROLE_NAMES[f.role])} ${esc(f.name)} (turn ${f.turn}, ${esc(f.how)})`).join("; ")}.</p>`);

  // Artifacts from dig sites.
  const arts = artifactsOf(state, me);
  if (arts.length) {
    const qc = { common: "#c8c8c8", rare: "#6fa8ff", epic: "#b77cff", legendary: "#ffb340" } as const;
    parts.push(`<h3>Our artifacts</h3><ul>`);
    for (const a of arts) {
      const gives = [a.money ? `+${a.money} BC` : "", a.research ? `+${a.research.amount} ${a.research.field} research` : "", a.culture ? `+${a.culture} culture` : ""].filter(Boolean).join(", ");
      parts.push(`<li><b style="color:${qc[a.quality]}">${esc(a.name)}</b> <span class="dim">(${a.quality}; ${gives} a turn)</span><br><span class="dim">${esc(a.text)}</span></li>`);
    }
    parts.push(`</ul>`);
  }

  // Troupes of the Grand Fair who stayed with us.
  const troupes = residentTroupes(state, me);
  if (troupes.length) parts.push(`<h3>Troupes of the Grand Fair at our capital</h3><ul>${troupes.map((t) => {
    const s = t.stay; const gives = [s.money ? `+${s.money} BC` : "", s.culture ? `+${s.culture} culture` : "", s.research ? `+${s.research.amount} ${s.research.field} research` : ""].filter(Boolean).join(", ");
    return `<li><b>${esc(t.name[0]!.toUpperCase() + t.name.slice(1))}</b> <span class="dim">(${gives} a turn): they ${esc(t.act)}</span></li>`;
  }).join("")}</ul>`);

  // The Starfall Games: medal table, champions, records.
  const table = medalTable(state).filter((r) => r.empireId === playerId || known(r.empireId));
  if (table.length) {
    parts.push(`<h3>The Starfall Games</h3><table style="border-collapse:collapse"><tr><th style="text-align:left;padding-right:12px">Empire</th><th>🥇</th><th>🥈</th><th>🥉</th></tr>`);
    for (const { empireId, m } of table.slice(0, 10)) parts.push(`<tr><td style="padding-right:12px"><span style="color:${color(empireId)}">${name(empireId)}</span></td><td style="text-align:center">${m.gold}</td><td style="text-align:center">${m.silver}</td><td style="text-align:center">${m.bronze}</td></tr>`);
    parts.push(`</table>`);
    const champs = (state.games?.champions ?? []).filter((c) => c.empireId !== null);
    if (champs.length) parts.push(`<p class="dim">Champions: ${champs.map((c) => `turn ${c.turn}: ${name(c.empireId!)}`).join("; ")}.</p>`);
    const recs = CONTESTS.map((c) => ({ c, r: state.games?.records[c.id] })).filter((x) => x.r);
    if (recs.length) parts.push(`<p class="dim">Galactic records: ${recs.map(({ c, r }) => `${c.name}: ${esc(r!.athlete)} of the ${name(r!.empireId)} (${r!.score}, turn ${r!.turn})`).join("; ")}.</p>`);
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
  // Map key for the markers beside stars (mapMarkers.ts).
  parts.push(`<h3>Map key</h3><p class="dim" style="columns:2;line-height:1.7">
    ☄ the Hollow Tide (and its next target)<br>⛏ ruins to excavate<br>☠ a lair of raiders or monsters<br>☣ a death world: rich and deadly<br>✸ a world cracked by a Sundering Engine<br>⌂ natives live here<br>
    ◈ a minor race's home<br>◎ an ancient gate (bright when awake)<br>⚔ the raider base<br>⬢ the machine hive<br>
    ✹ a dying star: get out before it blows<br>★ a great work (ringed when finished)<br>◐ the Cult of the Last Sun</p>`);
  return parts.join("\n");
}
