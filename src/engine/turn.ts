// End-of-turn processing. Same order for every empire, player or AI.

import { ensureProject, learn, tech, techCost, techStats } from "./tech";
import { maxMissileBases, missileBaseCost } from "./data/ships";
import { colonyShipCount, shipDesign } from "./designs";
import { recordChronicle } from "./chronicle";
import { resolveCombat } from "./combat";
import { rollEvents } from "./events";
import { processStorylines } from "./storylines";
import { processSupernova } from "./supernova";
import { processLairs } from "./lairs";
import { processCrusade } from "./crusade";
import { processCritters } from "./critters";
import { processInfestation } from "./infestation";
import { processContracts } from "./contracts";
import { processDeathWorlds } from "./deathWorlds";
import { processSynthetics } from "./legends";
import { processNatives } from "./natives";
import { processExpeditions } from "./expeditions";
import { processMinorRaces } from "./minorRaces";
import { processGates } from "./gates";
import { processSecrets } from "./secrets";
import { processTechMages } from "./techMages";
import { processPowerCells } from "./powerCells";
import { processSmugglers } from "./smugglers";
import { processBountyHunters } from "./bountyHunters";
import { processDeathCult } from "./deathCult";
import { processParasites } from "./parasites";
import { processHybridDerelict } from "./hybridDerelict";
import { processVeterans } from "./battleStories";
import { processMegastructures } from "./megastructures";
import { processEndgame } from "./endgame";
import { processUnderdogs } from "./underdogs";
import { processDigSites } from "./digSites";
import { processHeroes } from "./heroes";
import { processMarket } from "./market";
import { processMedals } from "./medals";
import { processCrisis } from "./crisis";
import { processCoalition } from "./coalition";
import { processOpenSecret, openSecretProduction, openSecretResearch, openSecretCostFactor } from "./openSecret";
import { processRaiders } from "./raiders";
import { processReplicators } from "./replicators";
import { growthMultiplier, shipCost } from "./abilities";
import { checkVictory, convene, resolveCouncil } from "./victory";
import { colonyEffects, empireBonus, processCivilization, progressBuilding } from "./civ";
import { applyTreaties, borderWarnings, processEspionage, researchPactBonus, spendingShare, updateRelations } from "./diplomacy";
import {
  colonyProduction, factoryCost, FIELD_NAMES, maxUsableFactories, planetCapacity,
  popCost, popGrowth,
} from "./formulas";
import { empireRace } from "./game";
import { processUnrest, unrestPenalty } from "./unrest";
import { processMoneySinks } from "./moneySinks";
import { processProphecies } from "./prophecy";
import { processResolutions } from "./resolutions";
import { processPrisons } from "./prison";
import { edictShare, processDecrees } from "./decrees";
import { growsByMigrants, processMigrants } from "./migrants";
import { fadeGrudges } from "./grudges";
import { processFirsts } from "./firsts";
import { processLeaderLives } from "./leaderLives";
import { distance as lightYears } from "./formulas";
import { PRISON_COLONY } from "./data/hazardWorlds";
import { canSee, updateVision } from "./knowledge";
import { intelReports } from "./intel";
import { mergeFleets, moveFleets } from "./movement";
import { FIELDS, type Colony, type Empire, type GameEvent, type GameState, type Star } from "./types";

/** Share of unused BC that goes to the treasury instead of being lost. */
export const LEFTOVER_TO_TREASURY = 0.5;

/** Governing distance: a colony far from the capital loses part of its output to the cost of ruling it from afar.
 *  DISTANCE_FREE ly are free; each light-year beyond costs DISTANCE_COST, up to DISTANCE_MAX. A brake on sprawling
 *  empires and far-off conquests. (Idea from Danny's second Claude session, as output rather than money; 2026-11-26.) */
export const DISTANCE_FREE = 8;
export const DISTANCE_COST = 0.01;
export const DISTANCE_MAX = 0.2;
export function distanceCost(state: GameState, c: Colony): number {
  const e = state.empires[c.empireId];
  if (!e || c.isCapital) return 0;
  const home = state.stars[e.capitalStarId], s = state.stars[c.starId];
  if (!home || !s) return 0;
  return Math.min(DISTANCE_MAX, Math.max(0, lightYears(home.x, home.y, s.x, s.y) - DISTANCE_FREE) * DISTANCE_COST);
}

/** Running a big empire costs money: upkeep grows faster than the colony count, so hoards and runaway sprawl are checked. */
export function imperialUpkeep(colonies: number): number {
  return colonies <= 6 ? 0 : 0.3 * Math.pow(colonies - 6, 1.25);
}

function event(state: GameState, ev: Omit<GameEvent, "turn">): void {
  state.events.push({ turn: state.turn, ...ev });
}

export interface ColonyBudget {
  production: number;
  ship: number; defense: number; industry: number; ecology: number; research: number;
}

export function colonyBudget(state: GameState, c: Colony): ColonyBudget {
  const e = state.empires[c.empireId] as Empire;
  const s = state.stars[c.starId] as Star;
  const production = s.planet ? colonyProduction(c, s.planet, e, empireRace(e)) : 0;
  // Buildings, wonders, leaders and golden ages raise output.
  const ce = colonyEffects(c);
  const eb = empireBonus(e);
  // Unrest cuts output (up to 25% at open revolt).
  const boosted = production * (1 + ce.production + eb.production + openSecretProduction(state, e.id)) * (1 - unrestPenalty(c)) * (c.prison ? 1 + PRISON_COLONY.productionBonus : 1) * (1 + edictShare(c, "production")) * (1 - distanceCost(state, c));
  // Spies and internal security are paid first, out of every colony's output.
  const net = boosted * (1 - spendingShare(e));
  const part = (pct: number) => (net * pct) / 100;
  return {
    production: boosted,
    ship: part(c.sliders.ship) * (1 + ce.ships), defense: part(c.sliders.defense), industry: part(c.sliders.industry),
    ecology: part(c.sliders.ecology), research: part(c.sliders.research) * (1 + ce.research + eb.research + edictShare(c, "research")),
  };
}

/** Returns research points produced. */
function processColony(state: GameState, c: Colony): number {
  const e = state.empires[c.empireId] as Empire;
  const r = empireRace(e);
  const s = state.stars[c.starId] as Star;
  if (!s.planet) return 0;
  const b = colonyBudget(state, c);
  let leftover = 0;

  // Ships
  if (c.buildTemplate) {
    const t = shipDesign(state, c.buildTemplate);
    c.shipProgress += b.ship;
    let built = 0;
    const unit = shipCost(e, t);
    while (c.shipProgress >= unit) {
      c.shipProgress -= unit;
      built++;
    }
    if (built > 0) {
      state.fleets.push({
        id: state.nextFleetId++, empireId: e.id, ships: { [t.id]: built },
        x: s.x, y: s.y, starId: s.id, destStarId: null,
      });
      event(state, { empireId: e.id, kind: "shipBuilt", text: `${s.name} built ${built} ${t.name}${built > 1 ? "s" : ""}.`, starId: s.id });
    }
  } else {
    leftover += b.ship;
  }

  // Defense
  // Each base costs more than the last, and a colony can keep only so many; spending past the cap goes to the treasury.
  const baseCap = maxMissileBases(c.population);
  if (c.missileBases >= baseCap) {
    leftover += b.defense + c.defenseProgress;
    c.defenseProgress = 0;
  } else {
    c.defenseProgress += b.defense;
    let builtBases = 0;
    while (c.missileBases < baseCap && c.defenseProgress >= missileBaseCost(c.missileBases)) {
      c.defenseProgress -= missileBaseCost(c.missileBases);
      c.missileBases++;
      builtBases++;
    }
    if (c.missileBases >= baseCap) { leftover += c.defenseProgress; c.defenseProgress = 0; }
    if (builtBases > 0) event(state, { empireId: e.id, kind: "baseBuilt", text: `${s.name} built ${builtBases > 1 ? `${builtBases} missile bases` : "a missile base"} (${c.missileBases} total${c.missileBases >= baseCap ? ", the most it can hold" : ""}).`, starId: s.id });
  }

  // Industry: a building in progress takes half (all, once factories are full);
  // the rest builds factories up to what the population can run.
  const room = Math.max(0, maxUsableFactories(c, e) - c.factories);
  let industry = b.industry;
  if (c.buildQueue) {
    const toBuilding = room > 0 ? industry / 2 : industry;
    industry = industry - toBuilding + progressBuilding(state, e, c, toBuilding);
  }
  e.treasury += colonyEffects(c).treasury * b.production;
  if (room > 0) {
    const cost = factoryCost(e);
    const built = Math.min(room, industry / cost);
    c.factories += built;
    leftover += industry - built * cost;
    const fullPlanetMax = planetCapacity(s.planet, e) * (maxUsableFactories(c, e) / Math.max(c.population, 1e-9));
    if (built >= room - 1e-9 && c.factories >= fullPlanetMax - 1e-6) {
      event(state, { empireId: e.id, kind: "factoriesDone", text: `${s.name} has all the factories its people can run.`, starId: s.id });
    }
  } else {
    leftover += industry;
  }

  // Ecology: natural growth, then buy extra population with ecology spending.
  const cap = planetCapacity(s.planet, e);
  // A conquered world may hold more people than its new owner's tech supports.
  if (c.population > cap) c.population = cap;
  const wasFull = c.population >= cap - 1e-9;
  // A migrant people's colonies do not grow on their own (migrants.ts); ecology spending can still add people.
  const migrant = growsByMigrants(e, c);
  if (!migrant) c.population = Math.min(cap, c.population + popGrowth(c.population, s.planet, r, e) * growthMultiplier(e, s) * (1 + edictShare(c, "growth")));
  const space = Math.max(0, cap - c.population);
  const pc = popCost(e);
  const bought = Math.min(space, b.ecology / pc);
  c.population = Math.min(cap, c.population + bought);
  leftover += b.ecology - bought * pc;
  if (!wasFull && c.population >= cap - 1e-9) {
    event(state, { empireId: e.id, kind: "popMaxed", text: `${s.name} has reached full population.`, starId: s.id });
  }

  e.treasury += leftover * LEFTOVER_TO_TREASURY;
  return b.research;
}

function processResearch(state: GameState, e: Empire, points: number): void {
  const r = empireRace(e);
  const rs = e.research;
  points *= 1 + techStats(e).research + researchPactBonus(e) + openSecretResearch(state, e.id);
  for (const f of FIELDS) {
    rs.progress[f] += (points * rs.alloc[f]) / 100;
    for (;;) {
      const id = ensureProject(rs, f);
      if (!id) break;
      const t = tech(id);
      const cost = techCost(t, r) * openSecretCostFactor(state, e.id, id);
      if (rs.progress[f] < cost) break;
      rs.progress[f] -= cost;
      learn(rs, id);
      const nextId = ensureProject(rs, f);
      const next = nextId ? ` Now researching ${tech(nextId).name}.` : ` ${FIELD_NAMES[f]} has nothing left to research.`;
      event(state, { empireId: e.id, kind: "research", text: `Discovered ${t.name}: ${t.description}${next}` });
    }
  }
}

function updateAlive(state: GameState): void {
  for (const e of state.empires) {
    if (!e.alive) continue;
    const hasColony = Object.values(state.colonies).some((c) => c.empireId === e.id);
    const hasColonyShip = state.fleets.some((f) => f.empireId === e.id && colonyShipCount(state, f.ships) > 0);
    if (!hasColony && !hasColonyShip) {
      e.alive = false;
      event(state, { empireId: null, kind: "info", text: `The ${e.name} have vanished from the galaxy.` });
    }
  }
}

/** Process one full turn for every empire. Orders must already have been given. */
export function endTurn(state: GameState): void {
  // Keep only events from this turn's order phase.
  state.events = state.events.filter((ev) => ev.turn >= state.turn);

  const researchByEmpire = new Map<number, number>();
  const colonies = Object.values(state.colonies).sort((a, b) => a.starId - b.starId);
  for (const c of colonies) {
    const pts = processColony(state, c);
    researchByEmpire.set(c.empireId, (researchByEmpire.get(c.empireId) ?? 0) + pts);
  }
  for (const e of state.empires) {
    if (e.alive) processResearch(state, e, researchByEmpire.get(e.id) ?? 0);
  }

  // Imperial upkeep (never pushes the treasury below zero).
  const colonyCount = new Map<number, number>();
  for (const c of colonies) colonyCount.set(c.empireId, (colonyCount.get(c.empireId) ?? 0) + 1);
  for (const e of state.empires) {
    if (e.alive) e.treasury = Math.max(0, e.treasury - imperialUpkeep(colonyCount.get(e.id) ?? 0));
  }

  processMigrants(state);
  fadeGrudges(state);
  processCivilization(state);
  processLeaderLives(state);
  processFirsts(state);
  processUnrest(state);
  processPrisons(state);
  processDecrees(state);
  processMoneySinks(state);
  // Story chapters come before random events, so a race's story is never crowded out.
  processStorylines(state);
  processSupernova(state);
  processCrusade(state);
  processCritters(state);
  processInfestation(state);
  processContracts(state);
  processDeathWorlds(state);
  processSynthetics(state);
  processNatives(state);
  processExpeditions(state);
  processMinorRaces(state);
  processSecrets(state);
  processTechMages(state);
  processPowerCells(state);
  processSmugglers(state);
  processBountyHunters(state);
  processDeathCult(state);
  processParasites(state);
  processHybridDerelict(state);
  processVeterans(state);
  processMegastructures(state);
  processEndgame(state);
  processUnderdogs(state);
  processDigSites(state);
  processHeroes(state);
  processMarket(state);
  processOpenSecret(state);
  processCoalition(state);
  rollEvents(state);
  processEspionage(state);
  applyTreaties(state);

  mergeFleets(state);
  moveFleets(state);
  resolveCombat(state);
  processLairs(state);
  processRaiders(state);
  processReplicators(state);
  processCrisis(state); // the Hollow Tide, late game (crisis.ts, Claude 2)
  updateVision(state);
  intelReports(state, (e, x, y) => canSee(state, e, x, y));
  // Gates: placing, waking, staging hidden fleets (gates.ts, Claude 2).
  processGates(state, (e, x, y) => canSee(state, e, x, y));
  processProphecies(state);
  updateRelations(state);
  borderWarnings(state);
  updateAlive(state);
  resolveCouncil(state);
  processResolutions(state);
  checkVictory(state);
  processMedals(state); // after victory, so winning medals count (medals.ts, Claude 2)
  convene(state);
  recordChronicle(state);
  state.turn++;
}
