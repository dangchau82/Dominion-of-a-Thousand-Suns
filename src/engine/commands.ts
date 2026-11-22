// Every action a player OR an AI can take goes through applyCommand.
// Same rules, same checks for everyone — this is how the no-cheat rule is enforced.

import { template } from "./data/ships";
import { canColonize } from "./formulas";
import { empire, empireRace, newColony, shipCount, star } from "./game";
import { exploreStar, isExplored } from "./knowledge";
import { fleetExtraRange, inFuelRange } from "./movement";
import {
  FIELDS, SLIDERS,
  type Colony, type GameState, type Id, type ResearchField, type Slider, type SliderSet,
} from "./types";

export type Command =
  | { type: "setSlider"; starId: Id; slider: Slider; value: number }
  | { type: "setSliders"; starId: Id; sliders: SliderSet }
  | { type: "lockSlider"; starId: Id; slider: Slider; locked: boolean }
  | { type: "setBuild"; starId: Id; templateId: string | null }
  | { type: "setResearch"; alloc: Record<ResearchField, number> }
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
      if (cmd.templateId !== null) template(cmd.templateId);
      if (c.buildTemplate !== cmd.templateId) c.shipProgress = 0;
      c.buildTemplate = cmd.templateId;
      return { ok: true };
    }
    case "setResearch": {
      e.research.alloc = normalizeTo100(cmd.alloc, FIELDS);
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
          const extra = fleetExtraRange({ ...f, ships });
          if (!inFuelRange(state, e, dest, extra)) return fail("Out of fuel range");
          for (const [t, n] of Object.entries(ships)) f.ships[t] = (f.ships[t] ?? 0) - n;
          moving = { id: state.nextFleetId++, empireId, ships, x: f.x, y: f.y, starId: f.starId, destStarId: null };
          state.fleets.push(moving);
        }
      }
      if (!inFuelRange(state, e, dest, fleetExtraRange(moving))) return fail("Out of fuel range");
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
