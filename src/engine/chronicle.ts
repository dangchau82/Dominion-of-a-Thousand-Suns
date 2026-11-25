// The chronicle: a compact turn-by-turn record of every empire, kept in the
// save. The player sees their own lines (History screen); the full log can be
// downloaded to study balance. AI code never reads it (it isn't in EmpireView).

import { shipDesign } from "./designs";
import type { GameState } from "./types";

/** Stats recorded for each empire each turn, in this order. */
export const CHRONICLE_STATS = ["colonies", "population", "factories", "techs", "fleet", "treasury", "culture", "wars"] as const;
export type ChronicleStat = (typeof CHRONICLE_STATS)[number];

export interface ChronicleTurn {
  t: number;
  /** One row per empire (index = empire id), values in CHRONICLE_STATS order; null once the empire is gone. */
  e: (number[] | null)[];
}

export interface ChronicleEvent {
  t: number;
  empireId: number | null;
  kind: string;
  text: string;
}

export interface Chronicle {
  turns: ChronicleTurn[];
  events: ChronicleEvent[];
}

const KEY_KINDS = new Set(["contact", "war", "invasion", "colonized", "council", "culture", "diplomacy", "battle", "research", "spy"]);
const MAX_EVENTS = 8000;

/** Called at the end of every turn. Pure and deterministic. */
export function recordChronicle(state: GameState): void {
  const ch = (state.chronicle ??= { turns: [], events: [] });
  const rows = state.empires.map((e) => {
    if (!e.alive) return null;
    let colonies = 0, pop = 0, factories = 0;
    for (const c of Object.values(state.colonies)) {
      if (c.empireId !== e.id) continue;
      colonies++; pop += c.population; factories += c.factories;
    }
    let fleet = 0;
    for (const f of state.fleets) {
      if (f.empireId !== e.id) continue;
      for (const [id, n] of Object.entries(f.ships)) {
        const d = shipDesign(state, id);
        if (d.role === "warship") fleet += d.cost * n;
      }
    }
    const r = (x: number) => Math.round(x);
    return [colonies, r(pop), r(factories), e.research.known.length, r(fleet), r(e.treasury), r(e.culture), Object.keys(e.atWar).length];
  });
  ch.turns.push({ t: state.turn, e: rows });
  for (const ev of state.events) {
    if (ev.turn !== state.turn || !KEY_KINDS.has(ev.kind)) continue;
    ch.events.push({ t: ev.turn, empireId: ev.empireId, kind: ev.kind, text: ev.text });
  }
  if (ch.events.length > MAX_EVENTS) ch.events.splice(0, ch.events.length - MAX_EVENTS);
}

/** A plain-text log of the whole game (all empires), for studying balance. */
export function chronicleText(state: GameState): string {
  const ch = state.chronicle;
  const out: string[] = [];
  const s = state.settings;
  out.push(`Dominion of a Thousand Suns · game log · turn ${state.turn}`);
  out.push(`Galaxy ${s.size}/${s.shape}, ${state.empires.length} empires, difficulty ${s.difficulty ?? "normal"}, seed ${s.seed}`);
  out.push(`Empires: ${state.empires.map((e) => `${e.id}=${e.name} (${e.raceId}${e.isPlayer ? ", player" : ""}${e.focus ? `, focus ${e.focus}` : ""})`).join("; ")}`);
  const first = ch?.turns[0]?.t;
  if (first !== undefined && first > 1) out.push(`(Recording started on turn ${first}: this game began before the log existed.)`);
  if (state.winner) out.push(`Winner: ${state.empires[state.winner.empireId]!.name} by ${state.winner.kind} on turn ${state.winner.turn}`);
  out.push("");
  out.push(`# Stats per turn: empire:${CHRONICLE_STATS.join("/")}`);
  for (const t of ch?.turns ?? []) {
    out.push(`T${t.t} ` + t.e.map((row, i) => (row ? `${i}:${row.join("/")}` : `${i}:dead`)).join(" "));
  }
  out.push("");
  out.push("# Key events");
  for (const ev of ch?.events ?? []) {
    out.push(`T${ev.t} [${ev.kind}]${ev.empireId !== null ? ` (${ev.empireId})` : ""} ${ev.text}`);
  }
  return out.join("\n");
}
