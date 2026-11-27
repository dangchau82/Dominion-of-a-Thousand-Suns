// Medals (written by Claude 2; Danny's list): achievements the player earns during a game,
// shown as they happen and kept in the Hall of Legends. Checked once a turn for player
// empires only. Each medal is earned once per game.

import { ARTIFACT_BY_ID } from "./data/digSites";
import { rankOf } from "./battleStories";
import type { Empire, GameState, Id } from "./types";

export interface MedalDef { id: string; name: string; text: string; icon: string }
export interface MedalState {
  earned: Record<Id, { id: string; turn: number }[]>;
  /** Facts that can't be read back from the state later. */
  everAtWar: Id[];
  wasUnderdog: Id[];
  peakWorlds: Record<Id, number>;
}

export const MEDALS: MedalDef[] = [
  { id: "m-settler", icon: "🌱", name: "Settler", text: "Founded a second world." },
  { id: "m-ten-worlds", icon: "🌍", name: "Ten Worlds", text: "Held ten worlds at once." },
  { id: "m-twenty-worlds", icon: "🌌", name: "Dominion", text: "Held twenty worlds at once." },
  { id: "m-named-fleet", icon: "⚓", name: "A Name Among Fleets", text: "One of our fleets earned a name." },
  { id: "m-legendary-fleet", icon: "🛡", name: "Legend of the Void", text: "One of our fleets became Legendary." },
  { id: "m-admiral", icon: "🎖", name: "Admiral's Flag", text: "A hero admiral took command of one of our fleets." },
  { id: "m-great-battle", icon: "⚔", name: "Remembered in Song", text: "Won a battle great enough to get a name." },
  { id: "m-great-work", icon: "★", name: "Wonder of the Age", text: "Finished a great work." },
  { id: "m-world-breaker", icon: "✸", name: "World Breaker", text: "Cracked a world with the Sundering Engine." },
  { id: "m-deep-digger", icon: "⛏", name: "Deep Digger", text: "Excavated ruins to the very bottom." },
  { id: "m-legendary-artifact", icon: "💎", name: "Keeper of Legends", text: "Held a legendary artifact." },
  { id: "m-full-court", icon: "👑", name: "Full Court", text: "Three heroes served at once." },
  { id: "m-epic-artifact", icon: "🔮", name: "Treasure Hunter", text: "Held an epic artifact." },
  { id: "m-career", icon: "🎓", name: "Rise Through the Ranks", text: "A hero of ours reached the highest title of their career." },
  { id: "m-fair", icon: "🎪", name: "Showtime", text: "Welcomed the Grand Fair to our capital." },
  { id: "m-games-champion", icon: "🏅", name: "Champions of the Games", text: "Won the Starfall Games." },
  { id: "m-auction", icon: "🔨", name: "Highest Bidder", text: "Won the Travelling Auction." },
  { id: "m-last-stand", icon: "🔥", name: "Still Standing", text: "Survived 50 turns after a last stand." },
  { id: "m-two-paths", icon: "☯", name: "Many Faces", text: "Opened two endgame paths." },
  { id: "m-peaceful-win", icon: "🕊", name: "Peace in Our Time", text: "Won the game without ever going to war." },
  { id: "m-underdog-win", icon: "🐺", name: "Against All Odds", text: "Won the game after being one of the smallest empires." },
];
export const MEDAL_BY_ID = new Map(MEDALS.map((m) => [m.id, m]));

function worlds(state: GameState, e: Empire): number {
  let n = 0;
  for (const c of Object.values(state.colonies)) if (c.empireId === e.id) n++;
  return n;
}

function underdog(state: GameState, e: Empire): boolean {
  const all = state.empires.filter((o) => o.alive && o.rebelOf === undefined);
  if (all.length < 3) return false;
  const avg = all.reduce((a, o) => a + worlds(state, o), 0) / all.length;
  return worlds(state, e) * 2 <= avg;
}

/** Which medals this empire qualifies for right now. */
function qualifies(state: GameState, e: Empire, st: MedalState): string[] {
  const out: string[] = [];
  const n = worlds(state, e);
  if (n >= 2) out.push("m-settler");
  if (n >= 10) out.push("m-ten-worlds");
  if (n >= 20) out.push("m-twenty-worlds");
  const vets = Object.values(state.veterans ?? {}).filter((v) => v.empireId === e.id);
  if (vets.some((v) => v.name)) out.push("m-named-fleet");
  if (vets.some((v) => rankOf(v) >= 3)) out.push("m-legendary-fleet");
  if (vets.some((v) => v.admiral)) out.push("m-admiral");
  if ((state.greatBattles ?? []).some((b) => {
    const side = b.empires.indexOf(e.id);
    return side >= 0 && b.losses[side]! < b.losses[1 - side]!;
  })) out.push("m-great-battle");
  const eg = state.endgame?.[e.id];
  if (eg?.works.some((w) => w.finished)) out.push("m-great-work");
  if (eg && Object.keys(eg.paths).length >= 2) out.push("m-two-paths");
  if (state.events.some((x) => x.kind === "saga" && x.text.startsWith(`The ${e.name} turned their Sundering Engine`))) out.push("m-world-breaker");
  if (state.events.some((x) => x.kind === "saga" && x.text.startsWith(`The ${e.name} have excavated`))) out.push("m-deep-digger");
  if ((state.digs?.artifacts[e.id] ?? []).some((id) => ARTIFACT_BY_ID.get(id)?.quality === "legendary")) out.push("m-legendary-artifact");
  if ((state.heroes?.heroes[e.id]?.length ?? 0) >= 3) out.push("m-full-court");
  if (state.market?.history.some((h) => h.winner === e.id)) out.push("m-auction");
  if ((state.digs?.artifacts[e.id] ?? []).some((id) => ARTIFACT_BY_ID.get(id)?.quality === "epic")) out.push("m-epic-artifact");
  if ((state.heroes?.heroes[e.id] ?? []).some((h) => h.branch && h.level >= 5) || (state.heroes?.fallen ?? []).some((f) => f.empireId === e.id && f.title && /Archon|High Chancellor|Hand in the Dark|Voice of the Stars|Luminary|Master Builder|Lord Marshal|Grand Admiral/.test(f.title))) out.push("m-career");
  if ((state.fair?.festivals[e.id] ?? 0) > 0) out.push("m-fair");
  if ((state.games?.champions ?? []).some((c) => c.empireId === e.id)) out.push("m-games-champion");
  const stand = state.underdogs?.lastStand.includes(e.id);
  if (stand && state.events.some((x) => x.kind === "saga" && x.text.startsWith(`Down to their last worlds, the ${e.name}`) && state.turn - x.turn >= 50)) out.push("m-last-stand");
  if (state.winner?.empireId === e.id) {
    if (!st.everAtWar.includes(e.id)) out.push("m-peaceful-win");
    if (st.wasUnderdog.includes(e.id)) out.push("m-underdog-win");
  }
  return out;
}

/** Once a turn (also call once more when the game is won). */
export function processMedals(state: GameState): void {
  const st = (state.medals ??= { earned: {}, everAtWar: [], wasUnderdog: [], peakWorlds: {} });
  for (const e of state.empires) {
    if (!e.isPlayer || !e.alive) continue;
    if (Object.keys(e.atWar).length && !st.everAtWar.includes(e.id)) st.everAtWar.push(e.id);
    if (state.turn > 50 && !st.wasUnderdog.includes(e.id) && underdog(state, e)) st.wasUnderdog.push(e.id);
    st.peakWorlds[e.id] = Math.max(st.peakWorlds[e.id] ?? 0, worlds(state, e));
    const have = (st.earned[e.id] ??= []);
    for (const id of qualifies(state, e, st)) {
      if (have.some((m) => m.id === id)) continue;
      have.push({ id, turn: state.turn });
      const m = MEDAL_BY_ID.get(id)!;
      state.events.push({ turn: state.turn, empireId: e.id, kind: "info", text: `🏅 Medal earned: ${m.icon} ${m.name}. ${m.text}` });
    }
  }
}

export function medalsOf(state: GameState, e: Empire) {
  return (state.medals?.earned[e.id] ?? []).map((m) => ({ ...MEDAL_BY_ID.get(m.id)!, turn: m.turn }));
}

