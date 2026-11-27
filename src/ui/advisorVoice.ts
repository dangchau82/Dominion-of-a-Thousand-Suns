// Race-voiced advisor (written by Claude 2; Danny's list). The main Claude's advisor tips
// (advisor.ts) keep their words; this gives the card a speaker from the player's own race:
// a title, a portrait, a way of opening and a sign-off in that race's manner. An Ashkari
// war-chief pushes for war, an Orrun factor talks money, a Nyx node reports in numbers.

import { portraitHTML } from "./assets";

interface Voice { title: string; open: string[]; close: string[] }

const VOICES: Record<string, Voice> = {
  humans: { title: "Chief of Staff", open: ["If I may, Councillor:", "A suggestion from the cabinet:"], close: ["The Accord is counting on us.", "Your call, of course."] },
  vossari: { title: "Senior Analyst", open: ["The figures indicate:", "Observation:"], close: ["Confidence: high.", "Recommend you proceed."] },
  kethrak: { title: "Brood-Speaker", open: ["The Hive whispers:", "Ten thousand minds agree:"], close: ["The swarm hungers.", "We are many. We are ready."] },
  ashkari: { title: "War-Chief", open: ["Warlord! Hear me:", "By blade and blood:"], close: ["Glory waits for no one.", "Strike first. Strike hard."] },
  lumen: { title: "Choir-Voice", open: ["The Choir hums a thought for you:", "We dreamed of this:"], close: ["Listen to the song.", "All minds are with you."] },
  thraal: { title: "Elder Stone", open: ["Slowly, young one:", "The mountain says:"], close: ["Patience. It will come.", "Stone outlasts all."] },
  seraphine: { title: "Wing-Marshal", open: ["Flight report, Commander:", "From the high nests:"], close: ["Fly true.", "The skies are ours."] },
  orrun: { title: "Chief Factor", open: ["A profitable note:", "Business first:"], close: ["Every credit counts.", "There's money in this."] },
  nyx: { title: "Node 7", open: ["QUERY RESOLVED:", "ADVISORY PROCESS OUTPUT:"], close: ["END OF ADVISORY.", "OPTIMAL PATH LOGGED."] },
  velari: { title: "High Seer", open: ["The veil parts, and I see:", "In the visions tonight:"], close: ["So it is written.", "Trust the vision."] },
  drovani: { title: "Tide-Keeper", open: ["From the deep currents:", "The tide brings word:"], close: ["Flow with it.", "The deep remembers."] },
  gorrath: { title: "Clan-Mother", open: ["Listen, little chief:", "Around the fire we say:"], close: ["The clans ride with you.", "Now go, and come back with stories."] },
  ixil: { title: "Bonded Counsel", open: ["We two have considered:", "Our host and I suggest:"], close: ["Together, always.", "We are never alone."] },
  verdane: { title: "Root-Elder", open: ["The forest grows a thought:", "Slowly the roots tell me:"], close: ["Grow, and keep growing.", "Every seed matters."] },
  quorai: { title: "Bright One", open: ["A spark for you:", "Burning brightly with an idea:"], close: ["Shine on.", "Let the light guide you."] },
  raxxan: { title: "Quartermaster", open: ["Oi, boss:", "Word from the scrapyard:"], close: ["Grab what's loose.", "Waste nothing. Steal everything."] },
  ruuvak: { title: "Warren-Speaker", open: ["The broods have voted:", "All our cousins say:"], close: ["More of us every day.", "Numbers win."] },
  tarkhan: { title: "Master of the Hunt", open: ["Hunter, mark this:", "From the high blind:"], close: ["Aim true.", "The Hunt is patient."] },
};

function pick<T>(list: T[], key: string): T {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length]!;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** The advisor card's inner HTML in the race's voice. `tipId` picks the opening and sign-off. */
export function advisorCardHTML(raceId: string, tipId: string, text: string): string {
  const v = VOICES[raceId];
  if (!v) return `<b>Advisor</b><div>${esc(text)}</div>`;
  return `<div style="display:flex;gap:10px;align-items:flex-start">
    ${portraitHTML(raceId, 'style="width:48px;height:60px;object-fit:cover;border-radius:8px;flex:none"')}
    <div><b>${esc(v.title)}</b><div><i>${esc(pick(v.open, tipId))}</i> ${esc(text)} <span class="dim">${esc(pick(v.close, tipId + "!"))}</span></div></div></div>`;
}
