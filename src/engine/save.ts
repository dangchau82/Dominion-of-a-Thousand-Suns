// Saving and loading. A save is the whole GameState as JSON.
// Export codes let Danny move a game between phone and PC.

import { race } from "./data/races";
import { makeRng } from "./rng";
import { learn, newResearchState, TECH_BY_ID } from "./tech";
import { FIELDS, SAVE_VERSION, type GameState } from "./types";

/** Version 1 saves had research "levels"; give each empire a tech tree and the techs those levels imply. */
function migrateV1(state: GameState): void {
  for (const e of state.empires) {
    const old = e.research as unknown as { alloc: GameState["empires"][number]["research"]["alloc"]; level?: Record<string, number> };
    const rs = newResearchState(makeRng(state.settings.seed + 7919 * (e.id + 1)), race(e.raceId));
    rs.alloc = old.alloc;
    for (const id of rs.available) {
      const t = TECH_BY_ID.get(id)!;
      if (t.tier < (old.level?.[t.field] ?? 1)) learn(rs, id);
    }
    for (const f of FIELDS) rs.current[f] = null;
    e.research = rs;
  }
  state.version = SAVE_VERSION;
}

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function deserialize(json: string): GameState {
  const data = JSON.parse(json) as Partial<GameState>;
  if (typeof data !== "object" || data === null || !Array.isArray(data.stars) || !Array.isArray(data.empires)) {
    throw new Error("This doesn't look like a saved game.");
  }
  if (data.version === 1) migrateV1(data as GameState);
  if (data.version !== SAVE_VERSION) {
    throw new Error(`Save is from version ${data.version}; this game reads version ${SAVE_VERSION}.`);
  }
  return data as GameState;
}

/** Base64 text that can be pasted between devices. */
export function exportCode(state: GameState): string {
  const bytes = new TextEncoder().encode(serialize(state));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function importCode(code: string): GameState {
  const bin = atob(code.trim());
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return deserialize(new TextDecoder().decode(bytes));
}
