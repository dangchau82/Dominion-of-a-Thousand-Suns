// Image loading. Paths are relative so the game works from any web folder
// (local dev, GitHub Pages, or installed on a phone).

const cache = new Map<string, HTMLImageElement>();
let onAnyLoad: () => void = () => {};

export function setImageLoadedHandler(fn: () => void): void {
  onAnyLoad = fn;
}

export function img(path: string): HTMLImageElement {
  let im = cache.get(path);
  if (!im) {
    im = new Image();
    im.decoding = "async";
    im.onload = () => onAnyLoad();
    im.src = path;
    cache.set(path, im);
  }
  return im;
}

export const art = {
  portrait: (raceId: string) => `art/races/race-${raceId}.png`,
  ship: (raceId: string, size: 1 | 2 | 3 | 4 | 5) => `art/ships/${raceId}-${size}.png`,
  planet: (climate: string) => `art/planets/planet-${climate}.png`,
  bg: (name: "menu" | "menu-2" | "council" | "diplomacy") => `art/backgrounds/bg-${name}.png`,
  event: (name: string) => `art/events/event-${name}.png`,
};

export function ready(im: HTMLImageElement): boolean {
  return im.complete && im.naturalWidth > 0;
}
