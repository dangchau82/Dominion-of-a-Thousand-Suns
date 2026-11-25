// Creating a new game and small lookup helpers.

import { RACES, race } from "./data/races";
import { STARTING_FLEET } from "./data/ships";
import { bridgeStars, generateStars, pickHomeStars, prepareHome } from "./galaxy";
import { exploreStar } from "./knowledge";
import * as R from "./rng";
import { newResearchState } from "./tech";
import { addDesign, starterDesigns } from "./designs";
import {
  FIELDS, SAVE_VERSION,
  type Colony, type Empire, type Fleet, type GameSettings, type GameState, type Id,
  type ResearchField, type SliderSet, type Star,
} from "./types";

export const DEFAULT_SLIDERS: SliderSet = { ship: 15, defense: 0, industry: 50, ecology: 10, research: 25 };
export const NEW_COLONY_SLIDERS: SliderSet = { ship: 0, defense: 0, industry: 70, ecology: 30, research: 0 };

export function newColony(starId: Id, empireId: Id, population: number, turn: number, isCapital = false): Colony {
  return {
    starId, empireId, population, factories: 0,
    sliders: { ...(isCapital ? DEFAULT_SLIDERS : NEW_COLONY_SLIDERS) },
    locked: { ship: false, defense: false, industry: false, ecology: false, research: false },
    buildTemplate: isCapital ? "scout" : null,
    shipProgress: 0, defenseProgress: 0, missileBases: 0,
    foundedTurn: turn, isCapital,
  };
}

export function newGame(settings: GameSettings): GameState {
  const rng = R.makeRng(settings.seed);
  const stars = generateStars(rng, settings.size, settings.shape);

  const playerRace = race(settings.playerRaceId);
  const aiRaces = R.shuffle(rng, RACES.filter((r) => r.id !== playerRace.id)).slice(0, settings.rivals);
  const races = [playerRace, ...aiRaces];
  const homes = pickHomeStars(rng, stars, races.length);

  const state: GameState = {
    version: SAVE_VERSION, turn: 1, settings, rng, stars,
    empires: [], colonies: {}, fleets: [], nextFleetId: 1, events: [], designs: {}, nextDesignId: 1,
  };

  races.forEach((r, i) => {
    const home = homes[i] as Star;
    prepareHome(rng, stars, home, r, homes.filter((h) => h !== home));
    const empire: Empire = {
      id: i,
      name: i === 0 ? settings.playerName : r.name,
      raceId: r.id,
      color: r.color,
      isPlayer: i === 0,
      alive: true,
      capitalStarId: home.id,
      treasury: 0,
      research: newResearchState(rng, r),
      knowledge: {},
      contacts: [],
      atWar: {},
      peaceOffers: [],
    };
    state.empires.push(empire);
    for (const spec of starterDesigns()) addDesign(state, empire, spec);
    const capital = newColony(home.id, empire.id, 50, 1, true);
    capital.factories = 30;
    state.colonies[home.id] = capital;
    state.fleets.push({
      id: state.nextFleetId++, empireId: empire.id, ships: { ...STARTING_FLEET },
      x: home.x, y: home.y, starId: home.id, destStarId: null,
    });
  });

  bridgeStars(rng, stars);
  for (const e of state.empires) exploreStar(state, e, star(state, e.capitalStarId), false);
  return state;
}

// ---------- Lookups ----------

export function star(state: GameState, id: Id): Star {
  const s = state.stars[id];
  if (!s || s.id !== id) throw new Error(`No star ${id}`);
  return s;
}

export function empire(state: GameState, id: Id): Empire {
  const e = state.empires[id];
  if (!e) throw new Error(`No empire ${id}`);
  return e;
}

export function empireRace(e: Empire) {
  return race(e.raceId);
}

export function coloniesOf(state: GameState, empireId: Id): Colony[] {
  return Object.values(state.colonies).filter((c) => c.empireId === empireId);
}

export function fleetsOf(state: GameState, empireId: Id): Fleet[] {
  return state.fleets.filter((f) => f.empireId === empireId);
}

export function fleet(state: GameState, id: Id): Fleet | undefined {
  return state.fleets.find((f) => f.id === id);
}

export function shipCount(f: Fleet): number {
  return Object.values(f.ships).reduce((a, b) => a + b, 0);
}
