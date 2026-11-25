// Saving and loading. A save is the whole GameState as JSON.
// Export codes let Danny move a game between phone and PC.

import { race } from "./data/races";
import { makeRng } from "./rng";
import { learn, newResearchState, TECH_BY_ID } from "./tech";
import { addDesign, starterDesigns } from "./designs";
import { COUNCIL_FIRST } from "./victory";
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
  state.version = 2;
}

/** Version 2 saves had no ship designer; give every empire the starter designs. */
function migrateV2(state: GameState): void {
  state.designs = {};
  state.nextDesignId = 1;
  for (const e of state.empires) for (const spec of starterDesigns()) addDesign(state, e, spec);
  state.version = 3;
}

/** Version 3 saves had no war or peace. */
function migrateV3(state: GameState): void {
  for (const e of state.empires) { e.atWar = {}; e.peaceOffers = []; }
  state.version = 4;
}

/** Version 4 saves had no diplomacy or spies. */
function migrateV4(state: GameState): void {
  for (const e of state.empires) { e.relations = {}; e.treaties = {}; e.spies = {}; e.security = 2; }
  state.proposals = [];
  state.nextProposalId = 1;
  state.version = 5;
}

/** Version 5 saves had no buildings, culture, wonders or leaders. */
function migrateV5(state: GameState): void {
  for (const e of state.empires) {
    Object.assign(e, { culture: 0, goldenAges: 0, goldenAgeUntil: 0, goldenAge: false, wonders: [], leaders: [], leaderOffer: null });
  }
  for (const c of Object.values(state.colonies)) Object.assign(c, { buildings: [], buildQueue: null, buildProgress: 0 });
  state.wonders = {};
  state.nextLeaderId = 1;
  state.version = 6;
}

/** Version 6 saves had no council or victory. */
function migrateV6(state: GameState): void {
  state.council = { nextTurn: Math.max(COUNCIL_FIRST, state.turn + 10), session: null, awaitingVerdict: null, defied: false };
  state.winner = null;
  state.version = 7;
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
  if (data.version === 2) migrateV2(data as GameState);
  if (data.version === 3) migrateV3(data as GameState);
  if (data.version === 4) migrateV4(data as GameState);
  if (data.version === 5) migrateV5(data as GameState);
  if (data.version === 6) migrateV6(data as GameState);
  if (data.version === 7) { const s = data as GameState; s.pendingEvents = []; s.nextEventId = 1; s.version = 8; }
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
