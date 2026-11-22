// Saves live in the browser on this device. Export codes move a game between devices.

import { deserialize, serialize, type GameState } from "../engine";

const AUTOSAVE = "dots.autosave";

export function autosave(state: GameState): void {
  try {
    localStorage.setItem(AUTOSAVE, serialize(state));
  } catch {
    // Storage full or blocked (private mode). The game keeps running; export still works.
  }
}

export function loadAutosave(): GameState | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE);
    return raw ? deserialize(raw) : null;
  } catch {
    return null;
  }
}

export function hasAutosave(): boolean {
  try {
    return localStorage.getItem(AUTOSAVE) !== null;
  } catch {
    return false;
  }
}

export function clearAutosave(): void {
  try { localStorage.removeItem(AUTOSAVE); } catch { /* ignore */ }
}
