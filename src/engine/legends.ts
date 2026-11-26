// Synthetic (android) leaders, from Gemini's data/legends.ts. Once per game each empire
// gets an android leader offer through the normal leader slot: no salary, one of the 8
// synthetic traits (bonus and catch, counted by civ.ts like any leader trait). Each has a
// small chance per turn of acting on its hidden agenda, which brings up one of Gemini's
// android events. No random draws: offer turns and agendas come from the seed.
//
// The legendary-ship half of data/legends.ts (crew traits, LEGEND_LOSS_MORALE) needs the
// battle rules to track ships, which are the main Claude's; it is left ready, unwired.

import { LEADER_KINDS, MAX_LEADERS, type LeaderKind } from "./data/buildings";
import { LEGEND_EVENTS, SYNTHETIC_TRAITS, type SyntheticTrait } from "./data/legends";
import type { Empire, GameState, Id, Leader } from "./types";

export interface SyntheticsState {
  /** Empires that have had their android offer. */
  offeredTo: Id[];
}

export const SYNTH_EVENTS = LEGEND_EVENTS.filter((e) => e.id.startsWith("legend-synth-"));
const SYNTH_BY_ID = new Map(SYNTHETIC_TRAITS.map((t) => [t.id, t]));

/** The android offer comes in this window, by seed and empire. */
const EARLIEST = 60;
const SPREAD = 100;
/** Offer lasts this long, like other leader offers. */
const OFFER_TURNS = 10;

/** Which android event each hidden agenda brings up. */
const AGENDA_EVENT: Record<string, string> = {
  "tireless-calculator": "legend-synth-unlogged-partition",
  "deep-telemetry": "legend-synth-unlogged-partition",
  "biosphere-warden": "legend-synth-unlogged-partition",
  "silent-relay": "legend-synth-backchannel-signal",
  "protocol-mimic": "legend-synth-backchannel-signal",
  "archive-core": "legend-synth-backchannel-signal",
  "cold-logic": "legend-synth-citizenship-petition",
  "harmonic-synthesizer": "legend-synth-citizenship-petition",
};

const DESIGNATIONS = ["Kessa", "Orin", "Vael", "Tamsin", "Ixo", "Brannoc", "Selwe", "Quill"];

function seedNumber(state: GameState): number {
  let h = 0;
  for (const ch of String(state.settings.seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function synthOfferTurn(state: GameState, e: Empire): number {
  return EARLIEST + ((seedNumber(state) + e.id * 53) % SPREAD);
}

export function syntheticTrait(l: Leader): SyntheticTrait | null {
  return l.trait ? SYNTH_BY_ID.get(l.trait) ?? null : null;
}

function makeAndroid(state: GameState, e: Empire): Leader {
  const n = seedNumber(state) + e.id * 7 + state.turn;
  const kinds = Object.keys(LEADER_KINDS) as LeaderKind[];
  const kind = kinds[n % kinds.length]!;
  const trait = SYNTHETIC_TRAITS[(n >> 3) % SYNTHETIC_TRAITS.length]!;
  const level = 1 + ((n >> 5) % 2);
  const scale = 1 + state.turn / 100;
  return {
    id: state.nextLeaderId++,
    name: `${DESIGNATIONS[(n >> 7) % DESIGNATIONS.length]}-${1 + (n % 9)} (android)`,
    kind, level,
    // Androids draw no salary, so they cost a little more to bring online.
    cost: Math.round(160 * level * scale), salary: 0,
    offerUntil: state.turn + OFFER_TURNS, trait: trait.id,
  };
}

/** Once a turn. */
export function processSynthetics(state: GameState): void {
  const st = (state.synthetics ??= { offeredTo: [] });
  for (const e of state.empires) {
    if (!e.alive || e.rebelOf !== undefined) continue;
    // The offer: once, when the leader slot is free.
    if (!st.offeredTo.includes(e.id) && state.turn >= synthOfferTurn(state, e) && !e.leaderOffer && e.leaders.length < MAX_LEADERS) {
      st.offeredTo.push(e.id);
      const l = makeAndroid(state, e);
      e.leaderOffer = l;
      const t = syntheticTrait(l)!;
      state.events.push({ turn: state.turn, empireId: e.id, kind: "culture",
        text: `${l.name} offers to serve as ${LEADER_KINDS[l.kind].title} (level ${l.level}, boosts ${LEADER_KINDS[l.kind].text}). An android: no salary. Trait: ${t.name}. Hire for ${l.cost} BC in the Empire screen.` });
    }
    // Hidden agendas of hired androids.
    if (state.pendingEvents.some((p) => p.empireId === e.id)) continue;
    for (const l of e.leaders) {
      const t = syntheticTrait(l);
      if (!t) continue;
      const roll = (seedNumber(state) + l.id * 97 + state.turn * 31) % 10000;
      if (roll >= t.agendaChance * 10000) continue;
      const where = state.colonies[e.capitalStarId]?.empireId === e.id ? e.capitalStarId : null;
      const rival = e.contacts.filter((id) => state.empires[id]!.alive).sort((a, b) => (e.relations[a] ?? 0) - (e.relations[b] ?? 0) || a - b)[0] ?? null;
      state.events.push({ turn: state.turn, empireId: e.id, kind: "info", text: `${l.name}: ${t.agenda}` });
      state.pendingEvents.push({ id: state.nextEventId++, empireId: e.id, eventId: AGENDA_EVENT[t.id]!, turn: state.turn, colonyStarId: where, starId: where, rivalId: rival });
      break;
    }
  }
}
