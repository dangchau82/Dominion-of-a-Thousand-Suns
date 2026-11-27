// Galactic news flashes (written by Claude 2). Big galaxy-wide moments ("saga" events:
// great works finished, worlds cracked, famous fleets lost, great battles, supernovae...)
// slide in at the top right with the race's portrait, stay a few seconds and fade. They
// never block play. The full text is still in the turn report and the history.

import type { GameEvent, GameState } from "../engine/types";
import { portraitHTML } from "./assets";

const SHOW_MS = 7000;
const MAX = 3;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

let styled = false;
function style(): void {
  if (styled) return;
  styled = true;
  const css = document.createElement("style");
  css.textContent = `
  .news-stack { position: fixed; top: 64px; right: 14px; z-index: 30; display: flex; flex-direction: column; gap: 8px; width: min(420px, 90vw); pointer-events: none; }
  .news-flash { pointer-events: auto; display: flex; gap: 10px; align-items: center; background: rgba(8,10,20,.92); border: 1px solid #333; border-left: 4px solid var(--c, #c9a54a); border-radius: 10px; padding: 8px 10px; color: #ddd; font-size: 14px; line-height: 1.35; box-shadow: 0 6px 20px rgba(0,0,0,.5); animation: news-in .45s ease; cursor: pointer; }
  .news-flash.out { animation: news-out .6s ease forwards; }
  .news-flash img, .news-flash video { width: 48px; height: 60px; object-fit: cover; border-radius: 6px; flex: none; }
  .news-flash b { color: var(--c, #c9a54a); letter-spacing: .08em; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px; }
  @keyframes news-in { from { opacity: 0; transform: translateX(40px) } to { opacity: 1; transform: none } }
  @keyframes news-out { to { opacity: 0; transform: translateX(40px) } }`;
  document.head.append(css);
}

/** Show this turn's galaxy-wide moments as news flashes. */
export function flashNews(state: GameState, playerId: number, events: GameEvent[]): void {
  const me = state.empires[playerId]!;
  const news = events.filter((e) => e.kind === "saga").slice(0, MAX);
  if (!news.length) return;
  style();
  let stack = document.querySelector<HTMLElement>(".news-stack");
  if (!stack) { stack = document.createElement("div"); stack.className = "news-stack"; document.body.append(stack); }
  news.forEach((ev, i) => {
    // The empire the news is about, if we know it.
    // The news is about the empire named first in it.
    const who = state.empires
      .filter((o) => ev.text.includes(o.name) && (o.id === playerId || me.contacts.includes(o.id)))
      .sort((a, b) => ev.text.indexOf(a.name) - ev.text.indexOf(b.name))[0];
    const box = document.createElement("div");
    box.className = "news-flash";
    box.style.setProperty("--c", who?.color ?? "#c9a54a");
    box.innerHTML = `${who ? portraitHTML(who.raceId) : ""}<div><b>Galactic news</b>${esc(ev.text)}</div>`;
    const remove = () => { box.classList.add("out"); setTimeout(() => box.remove(), 600); };
    box.onclick = remove;
    setTimeout(() => stack!.append(box), i * 600);
    setTimeout(remove, SHOW_MS + i * 600);
  });
}
