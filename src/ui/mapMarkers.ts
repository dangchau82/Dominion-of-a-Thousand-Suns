// Map markers (written by Claude 2): small glowing symbols beside stars for lairs, death
// worlds, gates, raiders, the hive, dying stars, great works, cracked worlds, natives,
// minor races and the cult. Drawn from EmpireView.markers (engine/mapMarkers.ts).

import type { MapMarker, MarkerKind } from "../engine/mapMarkers";
import type { EmpireView } from "../engine/view";

const LOOK: Record<MarkerKind, { glyph: string; color: string }> = {
  lair: { glyph: "☠", color: "#ff7a5a" },
  deathWorld: { glyph: "☣", color: "#c6ff4a" },
  cracked: { glyph: "✸", color: "#ff9a3a" },
  natives: { glyph: "⌂", color: "#8fe3a0" },
  minorRace: { glyph: "◈", color: "#8fd0ff" },
  gate: { glyph: "◎", color: "#7fe8ff" },
  raiders: { glyph: "⚔", color: "#ff5050" },
  hive: { glyph: "⬢", color: "#d070ff" },
  supernova: { glyph: "✹", color: "#ffd84a" },
  greatWork: { glyph: "★", color: "#ffd27a" },
  cult: { glyph: "◐", color: "#b0b0b0" },
};

/** Draw every marker. `toScreen` turns galaxy coordinates into canvas pixels; `scale` is the map zoom. */
export function drawMarkers(
  ctx: CanvasRenderingContext2D,
  view: EmpireView,
  toScreen: (x: number, y: number) => [number, number],
  scale: number,
  colorOf: (empireId: number | null) => string,
): void {
  const markers = view.markers;
  if (!markers?.length || scale < 6) return;
  const byStar = new Map<number, MapMarker[]>();
  for (const m of markers) byStar.set(m.starId, [...(byStar.get(m.starId) ?? []), m]);
  const size = Math.max(13, Math.min(20, scale * 0.32));
  const pulse = 0.65 + 0.35 * Math.sin(performance.now() / 420);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${size}px "Segoe UI Symbol", "Noto Sans Symbols 2", system-ui, sans-serif`;
  for (const [starId, list] of byStar) {
    const s = view.stars[starId];
    if (!s) continue;
    const [x, y] = toScreen(s.x, s.y);
    list.forEach((m, i) => {
      const look = LOOK[m.kind];
      const color = (m.kind === "greatWork" || (m.kind === "gate" && m.empireId !== undefined)) ? colorOf(m.empireId ?? null) : look.color;
      const mx = x - size * 1.3 - i * size * 1.1, my = y - size * 0.9;
      ctx.shadowColor = color;
      ctx.shadowBlur = m.active ? 10 * pulse : 5;
      ctx.fillStyle = color;
      ctx.globalAlpha = m.active === false ? 0.65 : 1;
      ctx.fillText(look.glyph, mx, my);
      // A great work that is finished gets a ring around its star.
      if (m.kind === "greatWork" && m.active) {
        ctx.globalAlpha = 0.5 + 0.3 * pulse;
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, Math.max(10, scale * 0.25), 0, Math.PI * 2); ctx.stroke();
      }
      if (m.kind === "supernova") {
        ctx.globalAlpha = 0.25 * pulse;
        ctx.fillStyle = look.color;
        ctx.beginPath(); ctx.arc(x, y, Math.max(12, scale * 0.35) * (1 + 0.15 * pulse), 0, Math.PI * 2); ctx.fill();
      }
    });
  }
  ctx.restore();
}

/** The marker labels at a star, for the star's info panel or a tooltip. */
export function markerLabels(view: EmpireView, starId: number): string[] {
  return (view.markers ?? []).filter((m) => m.starId === starId).map((m) => `${LOOK[m.kind].glyph} ${m.label}`);
}
