// Race-themed screens (written by Claude 2; Danny's list, PC first). While you play a race,
// the game's panels, windows, buttons and top bar take on that race's look: colours, type
// and frame shapes. Only the shared colour variables and a few frame rules change, under a
// body class (`race-<id>`), so the main stylesheet stays as it is. Can be turned off.

const KEY = "dots-race-theme";

interface Theme {
  panel: string; panel2: string; line: string; accent: string; gold: string; dim?: string;
  font: string;
  /** Extra frame rules for windows and panels. */
  frame: string;
}

const SERIF = `Georgia, "Palatino Linotype", "Book Antiqua", serif`;
const MONO = `"Cascadia Mono", Consolas, "Courier New", monospace`;
const SANS = `"Segoe UI", system-ui, sans-serif`;
const CONDENSED = `"Bahnschrift", "Arial Narrow", "Segoe UI", sans-serif`;

const cut = (n: number) => `clip-path: polygon(${n}px 0, calc(100% - ${n}px) 0, 100% ${n}px, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, ${n}px 100%, 0 calc(100% - ${n}px), 0 ${n}px);`;

export const THEMES: Record<string, Theme> = {
  humans: { panel: "rgba(12,20,38,.95)", panel2: "#16243f", line: "#2d4670", accent: "#4a8fe7", gold: "#f3c560", font: SANS, frame: "border-radius: 12px;" },
  vossari: { panel: "rgba(8,20,28,.95)", panel2: "#10262f", line: "#2c5566", accent: "#8fd3f0", gold: "#bfe9ff", font: MONO, frame: `border-radius: 2px; ${cut(10)}` },
  kethrak: { panel: "rgba(30,20,6,.95)", panel2: "#33240c", line: "#6b4a16", accent: "#e0a030", gold: "#ffc95a", font: CONDENSED, frame: "border-radius: 22px 6px 22px 6px; border-width: 2px;" },
  ashkari: { panel: "rgba(30,8,8,.95)", panel2: "#3a1210", line: "#7a2418", accent: "#d03a2a", gold: "#f0a848", font: CONDENSED, frame: `border-radius: 0; ${cut(14)} border-width: 2px;` },
  lumen: { panel: "rgba(22,16,36,.92)", panel2: "#2a2042", line: "#5a4a8a", accent: "#c7a8ff", gold: "#f1dcff", font: SERIF, frame: "border-radius: 26px; box-shadow: 0 0 24px rgba(199,168,255,.18);" },
  thraal: { panel: "rgba(26,24,22,.96)", panel2: "#2f2c28", line: "#5e574d", accent: "#b8ab98", gold: "#e3d2b0", font: CONDENSED, frame: "border-radius: 4px; border-width: 3px; border-style: ridge;" },
  seraphine: { panel: "rgba(30,28,22,.93)", panel2: "#36322a", line: "#8a7c56", accent: "#f2e6c2", gold: "#ffe08a", font: SERIF, frame: "border-radius: 18px 18px 4px 4px;" },
  orrun: { panel: "rgba(8,26,16,.95)", panel2: "#0f3320", line: "#2a6b45", accent: "#3fbf6f", gold: "#e9c55a", font: SANS, frame: "border-radius: 10px; border-style: double; border-width: 4px;" },
  nyx: { panel: "rgba(10,6,18,.96)", panel2: "#170f26", line: "#4a2f80", accent: "#7a4fd0", gold: "#c5a6ff", font: MONO, frame: `border-radius: 0; ${cut(8)} box-shadow: inset 0 0 0 1px rgba(122,79,208,.35);` },
  velari: { panel: "rgba(30,14,32,.93)", panel2: "#3a1c3e", line: "#7a4a80", accent: "#d58fd8", gold: "#ffd2f2", font: SERIF, frame: "border-radius: 30px 6px 30px 6px;" },
  drovani: { panel: "rgba(4,24,28,.94)", panel2: "#0a3238", line: "#1f6a70", accent: "#2fb5b5", gold: "#9ff0e6", font: SANS, frame: "border-radius: 24px; border-width: 2px;" },
  gorrath: { panel: "rgba(30,20,10,.95)", panel2: "#3a2814", line: "#7a5428", accent: "#a0703a", gold: "#e8b070", font: CONDENSED, frame: "border-radius: 6px; border-width: 3px; border-style: double;" },
  ixil: { panel: "rgba(24,8,28,.94)", panel2: "#30113a", line: "#6a2a7a", accent: "#9b3fa8", gold: "#e59cf0", font: SANS, frame: "border-radius: 28px 10px; box-shadow: 0 0 18px rgba(155,63,168,.2);" },
  verdane: { panel: "rgba(12,24,8,.94)", panel2: "#18320f", line: "#3e6a22", accent: "#6fbf3a", gold: "#d8f08a", font: SERIF, frame: "border-radius: 20px 20px 20px 4px;" },
  quorai: { panel: "rgba(30,24,6,.93)", panel2: "#3a300c", line: "#8a6e18", accent: "#f5c542", gold: "#fff0a0", font: SANS, frame: "border-radius: 16px; box-shadow: 0 0 22px rgba(245,197,66,.2);" },
  raxxan: { panel: "rgba(28,14,8,.96)", panel2: "#36190c", line: "#7a3a1a", accent: "#c45a2a", gold: "#f0a060", font: CONDENSED, frame: `border-radius: 2px; ${cut(6)} border-style: dashed;` },
  ruuvak: { panel: "rgba(16,22,8,.95)", panel2: "#212c0f", line: "#4a5e22", accent: "#7f9a3a", gold: "#cfe080", font: SANS, frame: "border-radius: 14px 4px 14px 4px;" },
  tarkhan: { panel: "rgba(30,10,16,.95)", panel2: "#3a1420", line: "#7a2a40", accent: "#e06a8a", gold: "#ffc0d0", font: CONDENSED, frame: `border-radius: 0; ${cut(12)}` },
};

export function raceThemeOn(): boolean {
  try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
}
export function setRaceTheme(on: boolean): void {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* storage unavailable */ }
}

let styleEl: HTMLStyleElement | null = null;

/** Apply (or remove, with null) a race's look to the whole page. */
export function applyRaceTheme(raceId: string | null): void {
  for (const c of [...document.body.classList]) if (c.startsWith("race-")) document.body.classList.remove(c);
  if (!raceId || !raceThemeOn() || !THEMES[raceId]) return;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.textContent = Object.entries(THEMES).map(([id, t]) => `
body.race-${id} { --panel: ${t.panel}; --panel-2: ${t.panel2}; --line: ${t.line}; --accent: ${t.accent}; --gold: ${t.gold};${t.dim ? ` --dim: ${t.dim};` : ""} }
body.race-${id}, body.race-${id} button { font-family: ${t.font}; }
body.race-${id} .modal, body.race-${id} .panel { ${t.frame} border-color: ${t.line}; }
body.race-${id} .topbar { border-bottom: 2px solid ${t.line}; background: linear-gradient(${t.panel2}, ${t.panel}); }
body.race-${id} h2, body.race-${id} h3 { color: ${t.gold}; }
body.race-${id} button:hover { border-color: ${t.accent}; box-shadow: 0 0 10px ${t.accent}33; }`).join("\n");
    document.head.append(styleEl);
  }
  document.body.classList.add(`race-${raceId}`);
}
