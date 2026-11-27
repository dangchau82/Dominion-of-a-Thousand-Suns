// Map markers (written by Claude 2): the places Claude 2's features create, as an empire
// knows them, so the map can show them. Only what this empire has explored or been told
// (fair for AIs and the player alike; the UI draws them from EmpireView.markers).

import { LAIRS } from "./data/lairs";
import { DIG_NAMES } from "./data/digSites";
import { WORK_BY_ID } from "./data/greatWorks";
import { gateType } from "./gates";
import type { Empire, GameState, Id } from "./types";

export type MarkerKind = "digSite" | "lair" | "deathWorld" | "cracked" | "natives" | "minorRace" | "gate" | "raiders" | "hive" | "supernova" | "greatWork" | "cult";

export interface MapMarker {
  starId: Id;
  kind: MarkerKind;
  /** Words for the tooltip / label. */
  label: string;
  /** Owner of the thing, if it belongs to an empire (for colour). */
  empireId?: Id;
  /** Finished, awake, active... depends on the kind. */
  active?: boolean;
}

export function mapMarkers(state: GameState, e: Empire): MapMarker[] {
  const out: MapMarker[] = [];
  const explored = (id: Id) => !!e.knowledge[id]?.explored;
  const known = (id: Id) => id === e.id || e.contacts.includes(id);

  for (const s of state.stars) {
    const sp = s.planet?.special;
    if (!sp || !explored(s.id)) continue;
    if (sp === "death:cracked") out.push({ starId: s.id, kind: "cracked", label: "A cracked world" });
    else if (sp.startsWith("death:")) out.push({ starId: s.id, kind: "deathWorld", label: "A death world: rich, and deadly" });
    else if (sp.startsWith("natives:")) out.push({ starId: s.id, kind: "natives", label: "Natives live here" });
    else if (sp.startsWith("minor:")) out.push({ starId: s.id, kind: "minorRace", label: "A minor race's home" });
  }
  for (const d of state.digs?.sites ?? []) {
    if (!explored(d.starId) || d.closed || d.stage >= 3) continue;
    out.push({ starId: d.starId, kind: "digSite", label: `Ruins: the ${DIG_NAMES[d.kind]}${d.stage ? ` (level ${d.stage + 1})` : ""}`, active: d.stage > 0 });
  }
  for (const l of state.lairs ?? []) {
    if (l.clearedBy !== null || !(l.seenBy.includes(e.id) || explored(l.starId))) continue;
    out.push({ starId: l.starId, kind: "lair", label: LAIRS.find((d) => d.id === l.lairId)?.name ?? "A lair" });
  }
  for (const g of state.gates?.gates ?? []) {
    if (!explored(g.starId) && !g.seenBy.includes(e.id)) continue;
    const awake = g.awakeAt !== null && state.turn >= g.awakeAt;
    out.push({ starId: g.starId, kind: "gate", label: `${gateType(g).name}${awake ? " (awake)" : " (sleeping)"}`, active: awake, empireId: g.owner ?? undefined });
  }
  const r = state.raiders;
  if (r && r.over === null && state.turn >= r.startTurn && explored(r.starId)) out.push({ starId: r.starId, kind: "raiders", label: "Raider base", active: true });
  const h = state.replicators;
  if (h && h.destroyedBy === null && h.seenBy.includes(e.id)) out.push({ starId: h.starId, kind: "hive", label: "The machine hive", active: h.wokeTurn <= state.turn });
  for (const n of state.supernovae ?? []) {
    if (state.turn >= n.blowTurn || !explored(n.starId)) continue;
    out.push({ starId: n.starId, kind: "supernova", label: `Dying star: about ${n.blowTurn - state.turn} turns left`, active: true });
  }
  for (const [id, st] of Object.entries(state.endgame ?? {})) {
    const owner = Number(id);
    if (!known(owner)) continue;
    for (const w of st.works) {
      if (state.colonies[w.starId]?.empireId !== owner) continue;
      out.push({ starId: w.starId, kind: "greatWork", label: `${WORK_BY_ID.get(w.workId)?.name ?? "Great work"}${w.finished ? "" : " (being built)"}`, empireId: owner, active: w.finished });
    }
  }
  const cult = state.deathCult;
  if (cult && cult.empireId === e.id && cult.stance !== "purged") {
    for (const sid of cult.colonies) out.push({ starId: sid, kind: "cult", label: cult.stance === "adopted" ? "Cult of the Last Sun (state faith)" : "Cult of the Last Sun", empireId: e.id });
  }
  return out;
}
