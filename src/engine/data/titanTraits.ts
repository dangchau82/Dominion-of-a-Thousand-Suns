// Titan traits (main Claude, 2026-11-28; Danny's capital tier): every race's Titan has its own power.
// A Colossus has the same power five times over where it is a weapon. Applied in combat.ts shipUnit();
// auras lift every ship on the Titan's side in that battle (the best aura of each kind, not stacked).
// Ancient Leviathans (hidden one-off designs) get no trait.

export interface TitanTrait {
  name: string;
  /** Shown in the designer and the encyclopedia. */
  text: string;
  /** Extra guns the Titan carries (a Colossus gets 5x the count). */
  guns?: { kind: "beam" | "missile"; family?: "rail" | "ion" | "cannon" | "stinger" | "plasma" | "lance"; min: number; max: number; count: number }[];
  /** Changes to the Titan itself. */
  hitsX?: number;
  shield?: number;
  dodge?: number;
  first?: boolean;
  cloaked?: boolean;
  /** Bonuses for every ship on the Titan's side in the battle. */
  aura?: { attack?: number; beamDef?: number; missileDef?: number; shield?: number };
}

export const TITAN_TRAITS: Record<string, TitanTrait> = {
  humans: { name: "Accord Flagship", text: "Every ship in the battle on its side gets +1 attack: the fleet fights to the flagship's plan.", aura: { attack: 1 } },
  vossari: { name: "Shield Projector", text: "Throws its shields around the whole fleet: every ship on its side gets +2 shield.", aura: { shield: 2 } },
  kethrak: { name: "Mother Queen", text: "Pours out a brood swarm of 30 stingers every round.", guns: [{ kind: "missile", family: "stinger", min: 3, max: 4, count: 30 }] },
  ashkari: { name: "Red Throne", text: "Six spinal lances and a first strike: it fires before anything else.", guns: [{ kind: "beam", family: "lance", min: 20, max: 50, count: 6 }], first: true },
  lumen: { name: "Great Prism", text: "Splits starlight into 12 ion beams that wear down enemy shields.", guns: [{ kind: "beam", family: "ion", min: 3, max: 8, count: 12 }] },
  thraal: { name: "World Anvil", text: "A moving mountain: half as many hits again.", hitsX: 1.5 },
  seraphine: { name: "Archangel", text: "Too graceful to pin down: dodges a quarter of all shots and strikes first.", dodge: 0.25, first: true },
  orrun: { name: "Convoy Bastion", text: "A point-defence net over the fleet: every ship on its side gets +2 missile defence.", aura: { missileDef: 2 } },
  nyx: { name: "Silent Citadel", text: "Always cloaked: it can't be found in the first round and fires first.", cloaked: true, first: true },
  velari: { name: "Twin Moons", text: "Its crescents bend the enemy's aim: every ship on its side gets +2 beam defence.", aura: { beamDef: 2 } },
  drovani: { name: "Leviathan Mother", text: "Carries a school of remora craft: 20 stingers every round.", guns: [{ kind: "missile", family: "stinger", min: 3, max: 4, count: 20 }] },
  gorrath: { name: "Worldship Hammer", text: "A third more hits and ten plasma cannons bolted to its flanks.", hitsX: 1.3, guns: [{ kind: "beam", family: "cannon", min: 6, max: 30, count: 10 }] },
  ixil: { name: "Deep Mind", text: "Ion tentacles: 14 shield-stripping beams.", guns: [{ kind: "beam", family: "ion", min: 3, max: 8, count: 14 }] },
  verdane: { name: "Elder Tree", text: "A fifth more hits, and its living hull shelters the fleet: +1 beam and missile defence for every ship on its side.", hitsX: 1.2, aura: { beamDef: 1, missileDef: 1 } },
  quorai: { name: "Caged Star", text: "Four solar lances and +3 shield from the star in its heart.", guns: [{ kind: "beam", family: "lance", min: 20, max: 50, count: 4 }], shield: 3 },
  raxxan: { name: "Scrap Crown", text: "Twenty salvaged rail guns welded on wherever they fit.", guns: [{ kind: "beam", family: "rail", min: 6, max: 14, count: 20 }] },
  ruuvak: { name: "Brood Ark", text: "Releases 24 brood stingers every round.", guns: [{ kind: "missile", family: "stinger", min: 3, max: 4, count: 24 }] },
  tarkhan: { name: "Great Hunter", text: "Eight hunting lances and the first shot of every round.", guns: [{ kind: "beam", family: "lance", min: 20, max: 50, count: 8 }], first: true },
};
