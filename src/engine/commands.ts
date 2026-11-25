// Every action a player OR an AI can take goes through applyCommand.
// Same rules, same checks for everyone — this is how the no-cheat rule is enforced.

import { researchChoices } from "./tech";
import { atWar, declareWar, offerPeace } from "./combat";
import { buildable, buyCost, hireLeader, progressBuilding } from "./civ";
import { castVote, councilVerdict } from "./victory";
import { answerProposal, breakTreaty, checkProposal, giveGift, hasTreaty, makeProposal, setSpies, type ProposalInput } from "./diplomacy";
import { SCRAP_REFUND, addDesign, checkDesign, designsOf, type DesignSpec } from "./designs";
import { canColonize } from "./formulas";
import { empire, empireRace, newColony, shipCount, star } from "./game";
import { exploreStar, isExplored } from "./knowledge";
import { fleetExtraRange, inFuelRange } from "./movement";
import {
  FIELDS, SLIDERS,
  type Colony, type GameState, type Id, type ResearchField, type Slider, type SliderSet, type SpyMission, type TreatyKind,
} from "./types";

export type Command =
  | { type: "setSlider"; starId: Id; slider: Slider; value: number }
  | { type: "setSliders"; starId: Id; sliders: SliderSet }
  | { type: "lockSlider"; starId: Id; slider: Slider; locked: boolean }
  | { type: "setBuild"; starId: Id; templateId: string | null }
  | { type: "setResearch"; alloc: Record<ResearchField, number> }
  | { type: "setResearchProject"; field: ResearchField; techId: string }
  | { type: "createDesign"; spec: DesignSpec }
  | { type: "declareWar"; targetId: Id }
  | { type: "propose"; to: Id; proposal: ProposalInput }
  | { type: "respond"; proposalId: number; accept: boolean }
  | { type: "gift"; to: Id; bc: number; techId?: string }
  | { type: "breakTreaty"; with: Id; treaty: TreatyKind }
  | { type: "setSpies"; targetId: Id; alloc: number; mission: SpyMission }
  | { type: "setSecurity"; percent: number }
  | { type: "setBuilding"; starId: Id; buildingId: string | null }
  | { type: "buyBuilding"; starId: Id }
  | { type: "hireLeader" }
  | { type: "councilVote"; candidateId: Id | null }
  | { type: "councilVerdict"; accept: boolean }
  | { type: "keepPlaying" }
  | { type: "fundShips"; starId: Id; bc: number }
  | { type: "dismissLeader"; leaderId: number }
  | { type: "offerPeace"; targetId: Id }
  | { type: "sendTransports"; fromStarId: Id; toStarId: Id; troops: number }
  | { type: "scrapDesign"; designId: string }
  | { type: "moveFleet"; fleetId: Id; destStarId: Id; ships?: Record<string, number> }
  | { type: "colonize"; fleetId: Id };

export type CommandResult = { ok: true; fleetId?: Id } | { ok: false; error: string };

const fail = (error: string): CommandResult => ({ ok: false, error });

function ownColony(state: GameState, empireId: Id, starId: Id): Colony | null {
  const c = state.colonies[starId];
  return c && c.empireId === empireId ? c : null;
}

/** Normalize percentages to whole numbers summing to 100. */
export function normalizeTo100<K extends string>(values: Record<K, number>, keys: readonly K[]): Record<K, number> {
  const clean = keys.map((k) => Math.max(0, Number.isFinite(values[k]) ? values[k] : 0));
  const total = clean.reduce((a, b) => a + b, 0);
  const out = {} as Record<K, number>;
  if (total <= 0) {
    keys.forEach((k, i) => (out[k] = i === 0 ? 100 : 0));
    return out;
  }
  let used = 0;
  keys.forEach((k, i) => {
    const v = Math.floor(((clean[i] as number) / total) * 100);
    out[k] = v;
    used += v;
  });
  // Hand out rounding leftovers to the largest entries.
  const order = keys.map((k, i) => ({ k, frac: ((clean[i] as number) / total) * 100 - out[k] }))
    .sort((a, b) => b.frac - a.frac);
  for (let i = 0; used < 100; i++, used++) out[(order[i % order.length] as { k: K }).k]++;
  return out;
}

/**
 * Set one slider and rebalance the other unlocked sliders proportionally,
 * like dragging a slider in the classic colony screen.
 */
export function setOneSlider(c: Colony, slider: Slider, value: number): void {
  const others = SLIDERS.filter((s) => s !== slider && !c.locked[s]);
  const lockedTotal = SLIDERS.filter((s) => s !== slider && c.locked[s]).reduce((a, s) => a + c.sliders[s], 0);
  const v = Math.round(Math.max(0, Math.min(100 - lockedTotal, value)));
  const remaining = 100 - lockedTotal - v;
  const othersTotal = others.reduce((a, s) => a + c.sliders[s], 0);
  c.sliders[slider] = v;
  if (others.length === 0) { c.sliders[slider] = 100 - lockedTotal; return; }
  let given = 0;
  others.forEach((s, i) => {
    const share = othersTotal > 0 ? c.sliders[s] / othersTotal : 1 / others.length;
    const amount = i === others.length - 1 ? remaining - given : Math.round(remaining * share);
    c.sliders[s] = Math.max(0, amount);
    given += c.sliders[s];
  });
}

export function applyCommand(state: GameState, empireId: Id, cmd: Command): CommandResult {
  const e = empire(state, empireId);
  if (!e.alive) return fail("Empire is gone");

  switch (cmd.type) {
    case "setSlider": {
      const c = ownColony(state, empireId, cmd.starId);
      if (!c) return fail("Not your colony");
      if (c.locked[cmd.slider]) return fail("That slider is locked");
      setOneSlider(c, cmd.slider, cmd.value);
      return { ok: true };
    }
    case "setSliders": {
      const c = ownColony(state, empireId, cmd.starId);
      if (!c) return fail("Not your colony");
      c.sliders = normalizeTo100(cmd.sliders, SLIDERS);
      return { ok: true };
    }
    case "lockSlider": {
      const c = ownColony(state, empireId, cmd.starId);
      if (!c) return fail("Not your colony");
      c.locked[cmd.slider] = cmd.locked;
      return { ok: true };
    }
    case "setBuild": {
      const c = ownColony(state, empireId, cmd.starId);
      if (!c) return fail("Not your colony");
      if (cmd.templateId !== null && !designsOf(state, empireId).some((d) => d.id === cmd.templateId)) return fail("Unknown design");
      if (c.buildTemplate !== cmd.templateId) c.shipProgress = 0;
      c.buildTemplate = cmd.templateId;
      return { ok: true };
    }
    case "setResearch": {
      e.research.alloc = normalizeTo100(cmd.alloc, FIELDS);
      return { ok: true };
    }
    case "declareWar": {
      const t = state.empires[cmd.targetId];
      if (!t || t.id === e.id || !t.alive) return fail("No such empire");
      if (!e.contacts.includes(t.id)) return fail("You haven't met them");
      if (atWar(e, t)) return fail("Already at war");
      declareWar(state, e, t);
      return { ok: true };
    }
    case "propose": {
      const t = state.empires[cmd.to];
      if (!t) return fail("No such empire");
      const err = checkProposal(state, e, t, cmd.proposal);
      if (err) return fail(err);
      makeProposal(state, e, t, cmd.proposal);
      return { ok: true };
    }
    case "respond": {
      const p = state.proposals.find((x) => x.id === cmd.proposalId && x.to === empireId);
      if (!p) return fail("That offer has expired");
      const err = answerProposal(state, e, p, cmd.accept, (a, b) => declareWar(state, a, b));
      return err ? fail(err) : { ok: true };
    }
    case "gift": {
      const t = state.empires[cmd.to];
      if (!t) return fail("No such empire");
      const err = giveGift(state, e, t, cmd.bc, cmd.techId);
      return err ? fail(err) : { ok: true };
    }
    case "breakTreaty": {
      const t = state.empires[cmd.with];
      if (!t || !hasTreaty(e, t, cmd.treaty)) return fail("No such treaty");
      breakTreaty(state, e, t, cmd.treaty);
      return { ok: true };
    }
    case "setSpies": {
      const t = state.empires[cmd.targetId];
      if (!t || t.id === e.id || !e.contacts.includes(t.id)) return fail("You haven't met them");
      if (!["steal", "sabotage", "watch"].includes(cmd.mission)) return fail("Unknown mission");
      setSpies(e, t.id, cmd.alloc, cmd.mission);
      return { ok: true };
    }
    case "setBuilding": {
      const c = ownColony(state, empireId, cmd.starId);
      if (!c) return fail("Not your colony");
      if (cmd.buildingId !== null && !buildable(state, e, c).some((b) => b.id === cmd.buildingId)) return fail("Can't build that here");
      c.buildQueue = cmd.buildingId;
      return { ok: true };
    }
    case "buyBuilding": {
      const c = ownColony(state, empireId, cmd.starId);
      if (!c || !c.buildQueue) return fail("Nothing being built");
      const cost = buyCost(c);
      if (cost <= 0) return fail("This can't be bought");
      if (e.treasury < cost) return fail(`Need ${cost} BC`);
      e.treasury -= cost;
      progressBuilding(state, e, c, cost / 2);
      return { ok: true };
    }
    case "fundShips": {
      // Spend treasury on a shipyard's current ship (like transferring the reserve).
      const c = ownColony(state, empireId, cmd.starId);
      if (!c || !c.buildTemplate) return fail("This shipyard isn't building anything");
      if (!(cmd.bc > 0) || cmd.bc > e.treasury) return fail("Not enough BC");
      e.treasury -= cmd.bc;
      c.shipProgress += cmd.bc;
      return { ok: true };
    }
    case "councilVote": {
      const err = castVote(state, e, cmd.candidateId);
      return err ? fail(err) : { ok: true };
    }
    case "keepPlaying": {
      if (!e.isPlayer || !state.winner || !e.alive) return fail("Nothing to continue");
      state.keepPlaying = true;
      return { ok: true };
    }
    case "councilVerdict": {
      if (!e.isPlayer) return fail("Only the player answers the council's verdict");
      const err = councilVerdict(state, e, cmd.accept);
      return err ? fail(err) : { ok: true };
    }
    case "hireLeader": {
      const err = hireLeader(state, e);
      return err ? fail(err) : { ok: true };
    }
    case "dismissLeader": {
      if (!e.leaders.some((l) => l.id === cmd.leaderId)) return fail("No such leader");
      e.leaders = e.leaders.filter((l) => l.id !== cmd.leaderId);
      return { ok: true };
    }
    case "setSecurity": {
      e.security = Math.max(0, Math.min(10, Math.round(cmd.percent)));
      return { ok: true };
    }
    case "offerPeace": {
      const t = state.empires[cmd.targetId];
      if (!t || !atWar(e, t)) return fail("Not at war with them");
      offerPeace(state, e, t);
      return { ok: true };
    }
    case "sendTransports": {
      const c = ownColony(state, empireId, cmd.fromStarId);
      if (!c) return fail("Not your colony");
      const dest = state.stars[cmd.toStarId];
      if (!dest || dest.id === c.starId) return fail("Pick another star");
      if (!Number.isInteger(cmd.troops) || cmd.troops < 1) return fail("Send at least 1 troop");
      if (c.population - cmd.troops < 1) return fail("Leave at least 1 population behind");
      if (!isExplored(e, dest.id)) return fail("Explore it first");
      if (!inFuelRange(state, e, dest, 0)) return fail("Out of range");
      c.population -= cmd.troops;
      const src = state.stars[c.starId]!;
      const f = { id: state.nextFleetId++, empireId, ships: { transport: cmd.troops }, x: src.x, y: src.y, starId: src.id, destStarId: dest.id };
      state.fleets.push(f);
      return { ok: true, fleetId: f.id };
    }
    case "createDesign": {
      const err = checkDesign(state, e, cmd.spec);
      if (err) return fail(err);
      addDesign(state, e, cmd.spec);
      return { ok: true };
    }
    case "scrapDesign": {
      // Like the classic game: scrapping a design scraps every ship of it, for a small refund.
      const d = state.designs[cmd.designId];
      if (!d || d.empireId !== empireId) return fail("Not your design");
      let n = 0;
      for (const f of state.fleets) {
        if (f.empireId !== empireId) continue;
        n += f.ships[d.id] ?? 0;
        delete f.ships[d.id];
      }
      state.fleets = state.fleets.filter((f) => shipCount(f) > 0);
      for (const c of Object.values(state.colonies)) {
        if (c.empireId === empireId && c.buildTemplate === d.id) { c.buildTemplate = null; c.shipProgress = 0; }
      }
      e.treasury += n * d.cost * SCRAP_REFUND;
      delete state.designs[d.id];
      return { ok: true };
    }
    case "setResearchProject": {
      if (!researchChoices(e.research, cmd.field).some((t) => t.id === cmd.techId)) return fail("Can't research that yet");
      e.research.current[cmd.field] = cmd.techId;
      return { ok: true };
    }
    case "moveFleet": {
      const f = state.fleets.find((x) => x.id === cmd.fleetId && x.empireId === empireId);
      if (!f) return fail("Not your fleet");
      const dest = state.stars[cmd.destStarId];
      if (!dest) return fail("No such star");
      // Optionally split off part of the fleet.
      let moving = f;
      if (cmd.ships) {
        for (const [t, n] of Object.entries(cmd.ships)) {
          if (n < 0 || n > (f.ships[t] ?? 0)) return fail("Not enough ships");
        }
        const total = Object.values(cmd.ships).reduce((a, b) => a + b, 0);
        if (total <= 0) return fail("No ships selected");
        if (total < shipCount(f)) {
          if (f.starId === null) return fail("Cannot split a fleet in flight");
          const ships: Record<string, number> = {};
          for (const [t, n] of Object.entries(cmd.ships)) if (n > 0) ships[t] = n;
          const extra = fleetExtraRange(state, { ...f, ships });
          if (!inFuelRange(state, e, dest, extra)) return fail("Out of fuel range");
          for (const [t, n] of Object.entries(ships)) f.ships[t] = (f.ships[t] ?? 0) - n;
          moving = { id: state.nextFleetId++, empireId, ships, x: f.x, y: f.y, starId: f.starId, destStarId: null };
          state.fleets.push(moving);
        }
      }
      if (!inFuelRange(state, e, dest, fleetExtraRange(state, moving))) return fail("Out of fuel range");
      if (moving.starId === dest.id) { moving.destStarId = null; return { ok: true, fleetId: moving.id }; }
      moving.destStarId = dest.id;
      return { ok: true, fleetId: moving.id };
    }
    case "colonize": {
      const f = state.fleets.find((x) => x.id === cmd.fleetId && x.empireId === empireId);
      if (!f) return fail("Not your fleet");
      if (f.starId === null) return fail("Fleet is in flight");
      if ((f.ships.colony ?? 0) < 1) return fail("No colony ship in this fleet");
      const s = star(state, f.starId);
      if (!isExplored(e, s.id)) exploreStar(state, e, s);
      if (!s.planet) return fail("No habitable planet here");
      if (state.colonies[s.id]) return fail("Planet already settled");
      if (!canColonize(s.planet, e, empireRace(e))) return fail("Need more Planetology to settle this climate");
      f.ships.colony = (f.ships.colony ?? 0) - 1;
      state.colonies[s.id] = newColony(s.id, empireId, 2, state.turn);
      state.fleets = state.fleets.filter((x) => shipCount(x) > 0);
      state.events.push({ turn: state.turn, empireId, kind: "colonized", text: `Founded a colony on ${s.name}.`, starId: s.id });
      exploreStar(state, e, s, false);
      return { ok: true };
    }
  }
}
