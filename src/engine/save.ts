// Saving and loading. A save is the whole GameState as JSON.
// Export codes let Danny move a game between phone and PC.

import { SAVE_VERSION, type GameState } from "./types";

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function deserialize(json: string): GameState {
  const data = JSON.parse(json) as Partial<GameState>;
  if (typeof data !== "object" || data === null || !Array.isArray(data.stars) || !Array.isArray(data.empires)) {
    throw new Error("This doesn't look like a saved game.");
  }
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
