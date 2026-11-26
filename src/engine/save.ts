// Saving and loading. A save is the whole GameState as JSON.
// Export codes let Danny move a game between phone and PC.

import { race } from "./data/races";
import { makeRng } from "./rng";
import { learn, newResearchState, TECH_BY_ID } from "./tech";
import { addDesign, starterDesigns } from "./designs";
import { COUNCIL_FIRST } from "./victory";
import { FIELDS, SAVE_VERSION, type GameState } from "./types";
import { maxMissileBases } from "./data/ships";

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
  if (data.version === 8) {
    // Version 9 caps missile bases per colony; trim old fortress worlds down to the cap.
    const s = data as GameState;
    for (const c of Object.values(s.colonies)) c.missileBases = Math.min(c.missileBases, maxMissileBases(c.population));
    s.version = 9;
  }
  if (data.version === 9) {
    const s = data as GameState;
    for (const e of s.empires) e.borderWarned ??= {};
    s.version = 10;
  }
  // Version 10 -> 11: leaders gained an optional trait; old leaders simply have none.
  if (data.version === 10) { (data as GameState).version = 11; }
  // Version 11 -> 12: empires gained an optional race story; old games simply start theirs from chapter 1.
  if (data.version === 11) { (data as GameState).version = 12; }
  // Version 12 -> 13: the supernova crisis; old games simply have had none yet.
  if (data.version === 12) { (data as GameState).version = 13; }
  // Version 13 -> 14: neutral lairs; old games get theirs placed on the next turn.
  if (data.version === 13) { (data as GameState).version = 14; }
  // Version 14 -> 15: the Crusade; in old games it simply hasn't arrived yet.
  if (data.version === 14) { (data as GameState).version = 15; }
  // Version 15 -> 16: invasive critters; old games simply haven't met them yet.
  if (data.version === 15) { (data as GameState).version = 16; }
  // Version 16 -> 17: the alien infestation; old games simply haven't had it yet.
  if (data.version === 16) { (data as GameState).version = 17; }
  // Version 17 -> 18: the frontier job board; old games get their first job soon.
  if (data.version === 17) { (data as GameState).version = 18; }
  // Version 18 -> 19: death worlds; old games get theirs marked on their next turn.
  if (data.version === 18) { (data as GameState).version = 19; }
  // Version 19 -> 20: android leaders; old games get their offer in time.
  if (data.version === 19) { (data as GameState).version = 20; }
  // Version 20 -> 21: native peoples; old games get theirs placed on free worlds next turn.
  if (data.version === 20) { (data as GameState).version = 21; }
  // Version 21 -> 22: expeditions; old games get their first one soon.
  if (data.version === 21) { (data as GameState).version = 22; }
  // Version 22 -> 23: minor races; old games get theirs placed on free worlds next turn.
  if (data.version === 22) { (data as GameState).version = 23; }
  // Version 23 -> 24: ancient gates; old games get theirs placed next turn.
  if (data.version === 23) { (data as GameState).version = 24; }
  // Version 24 -> 25: the buried government secret; old games find theirs in time.
  if (data.version === 24) { (data as GameState).version = 25; }
  // Version 25 -> 26: the raider horde; old games haven't seen it yet.
  if (data.version === 25) { (data as GameState).version = 26; }
  // Version 26 -> 27: the self-replicating machines; old games haven't seen them wake yet.
  if (data.version === 26) { (data as GameState).version = 27; }
  // Version 27 -> 28: wandering tech-mages; old games get their first visit in time.
  if (data.version === 27) { (data as GameState).version = 28; }
  // Version 28 -> 29: ancient power cells; old games may still find theirs.
  if (data.version === 28) { (data as GameState).version = 29; }
  // Version 29 -> 30: smuggler rings.
  if (data.version === 29) { (data as GameState).version = 30; }
  // Version 30 -> 31: the Bounty Guild.
  if (data.version === 30) { (data as GameState).version = 31; }
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
