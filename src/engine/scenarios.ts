// Scenarios (written by Claude 2; Danny's list): ready-made starts with a story and a goal,
// for short games and for showing the game to friends. `applyScenario` changes a freshly
// made game; `processScenario` checks the goal every turn and announces success or failure.
// Victory rules belong to the main Claude: a met goal is recorded in `state.scenario.result`
// and announced, and the main Claude can make it end the game.

import { ARTIFACT_BY_ID } from "./data/digSites";
import { adjustRelation } from "./diplomacy";
import type { GameState, Id } from "./types";
import { distance } from "./formulas";

export type ScenarioId = "last-bastion" | "broken-kingdoms" | "long-night" | "gold-rush";

export interface ScenarioDef {
  id: ScenarioId;
  name: string;
  /** Shown before the game starts. */
  story: string;
  goal: string;
  /** Turn by which the goal must be met (or survived until). */
  deadline: number;
}

export interface ScenarioState {
  id: ScenarioId;
  /** Stars that matter to the goal (Broken Kingdoms). */
  stars: Id[];
  result?: { won: boolean; turn: number };
  /** Hollow Tide arrival, if the scenario moves it. */
  crisisTurn?: number;
  /** More ruins than usual (Gold Rush). */
  digMultiplier?: number;
}

export const SCENARIOS: ScenarioDef[] = [
  { id: "last-bastion", name: "The Last Bastion", deadline: 100,
    story: "Our empire has fallen to a single world. Every neighbour smells blood, and every one of them is already at war with us. But the old fortress-world has guns no one has seen in a century.",
    goal: "Survive for 100 turns." },
  { id: "broken-kingdoms", name: "Five Broken Kingdoms", deadline: 200,
    story: "The old empire shattered into five kingdoms a generation ago. Their capitals still stand, empty and waiting. Whoever holds all five will be crowned.",
    goal: "Hold all five marked worlds at once before turn 200." },
  { id: "long-night", name: "The Long Night", deadline: 220,
    story: "The scouts at the rim have gone silent. Something is coming, far sooner than anyone feared. There is no time for old feuds.",
    goal: "Destroy the Hollow Tide (it arrives on turn 60)." },
  { id: "gold-rush", name: "Gold Rush", deadline: 180,
    story: "A survey ship has found ruins on dozens of worlds at once. Every empire is racing to dig. Legends are buried out there.",
    goal: "Hold three rare, epic or legendary artifacts before turn 180." },
];
export const SCENARIO_BY_ID = new Map(SCENARIOS.map((s) => [s.id, s]));

export const BASTION_BASES = 40;

/** Set up a scenario in a game just made with newGame. The player is empire 0. */
export function applyScenario(state: GameState, id: ScenarioId, playerId: Id = 0): void {
  const me = state.empires[playerId]!;
  const sc: ScenarioState = { id, stars: [] };
  state.scenario = sc;
  if (id === "last-bastion") {
    const home = state.colonies[me.capitalStarId];
    if (home) home.missileBases += BASTION_BASES;
    for (const o of state.empires) {
      if (o.id === playerId) continue;
      if (!me.contacts.includes(o.id)) me.contacts.push(o.id);
      if (!o.contacts.includes(me.id)) o.contacts.push(me.id);
      me.atWar[o.id] = state.turn;
      o.atWar[me.id] = state.turn;
      adjustRelation(o, me, -60);
    }
  } else if (id === "broken-kingdoms") {
    // Five empty worlds spread across the map, far from every capital.
    const caps = state.empires.map((e) => state.stars[e.capitalStarId]!);
    const free = state.stars.filter((s) => s.planet && !state.colonies[s.id])
      .map((s) => ({ s, d: Math.min(...caps.map((c) => distance(c.x, c.y, s.x, s.y))) }))
      .sort((a, b) => b.d - a.d || a.s.id - b.s.id);
    const picked: typeof free = [];
    for (const f of free) {
      if (picked.length >= 5) break;
      if (picked.every((p) => distance(p.s.x, p.s.y, f.s.x, f.s.y) > 2.5)) picked.push(f);
    }
    for (const f of free) { if (picked.length >= 5) break; if (!picked.includes(f)) picked.push(f); }
    sc.stars = picked.map((p) => p.s.id);
    for (const sid of sc.stars) {
      const p = state.stars[sid]!.planet;
      if (p && !p.special) p.special = "kingdom";
    }
  } else if (id === "long-night") {
    sc.crisisTurn = 60;
  } else if (id === "gold-rush") {
    sc.digMultiplier = 3;
  }
  state.events.push({ turn: state.turn, empireId: playerId, kind: "saga", text: `${SCENARIO_BY_ID.get(id)!.name}: ${SCENARIO_BY_ID.get(id)!.goal}` });
}

function goalMet(state: GameState, sc: ScenarioState, playerId: Id): boolean {
  const me = state.empires[playerId]!;
  switch (sc.id) {
    case "last-bastion": return me.alive && state.turn >= SCENARIO_BY_ID.get(sc.id)!.deadline;
    case "broken-kingdoms": return sc.stars.length > 0 && sc.stars.every((sid) => state.colonies[sid]?.empireId === playerId);
    case "long-night": return state.crisis?.over === "destroyed";
    case "gold-rush": {
      const held = state.digs?.artifacts[playerId] ?? [];
      return held.filter((a) => ARTIFACT_BY_ID.get(a)?.quality !== "common" && ARTIFACT_BY_ID.has(a)).length >= 3;
    }
  }
}

/** Once a turn: has the player met the goal, or run out of time? */
export function processScenario(state: GameState, playerId: Id = 0): void {
  const sc = state.scenario;
  if (!sc || sc.result) return;
  const def = SCENARIO_BY_ID.get(sc.id)!;
  const me = state.empires[playerId];
  if (!me?.alive) { sc.result = { won: false, turn: state.turn }; return; }
  if (goalMet(state, sc, playerId)) {
    sc.result = { won: true, turn: state.turn };
    state.events.push({ turn: state.turn, empireId: null, kind: "saga", text: `Scenario complete: ${def.name}. ${def.goal.replace(/\.$/, "")}: done.` });
  } else if (state.turn > def.deadline) {
    sc.result = { won: false, turn: state.turn };
    state.events.push({ turn: state.turn, empireId: playerId, kind: "saga", text: `Scenario failed: ${def.name}. Time ran out.` });
  }
}
