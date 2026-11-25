// Carriers and fighters. Written by Gemini (2026-11-25), balanced by Claude; rules built by Claude.
import type { HullSize } from "./ships";

export interface FighterBayDef {
  id: string;              // tech id, e.g. "fighter-bay-1"
  name: string;
  field: "construction" | "weapons" | "computers";
  tier: number;            // 2 to 9: when it becomes available
  /** Hulls that can carry it. Never "small". */
  hulls: HullSize[];
  /** Share of the hull's space one bay takes (like specials, which take 0.12). */
  spaceShare: number;
  /** Share of the hull's cost one bay adds. */
  costShare: number;
  /** Fighters launched per bay, per hull size. */
  fighters: Partial<Record<HullSize, number>>;
  fighter: {
    hits: number;          // 1 to 4 (a fighter is smaller than a small hull)
    damage: [number, number]; // per shot, against ships
    shots: number;         // shots per round, 1 or 2
    /** Chance each fighter shoots down one incoming missile per round (0 to 0.5). */
    intercept: number;
  };
  /** Fighters lost in battle are rebuilt free only if the carrier survives. */
  description: string;     // under 30 words, for the player
}

// Balance (Claude): one bay should match the same space filled with beams of its tier.
// Space: a bay takes 15% of the hull (large 150); a beam takes 8 + 2 x tier. Per round, large hull:
//   tier 3: 6 fighters x 10 = 60  vs 10.7 ion cannons x 5.5 = 59
//   tier 5: 7 x 8.5 = 60          vs 8.3 neutron blasters x 7.5 = 63   (Gemini had 112)
//   tier 7: 8 x 7.5 x 2 = 120     vs 6.8 plasma cannons x 18 = 123     (Gemini had 176)
//   tier 9: 8 x 9 x 2 = 144       vs 5.8 disruptors x 25 = 144         (Gemini had 256)
// Cost share 0.35 -> 0.75 so a bay costs about what the same guns cost (large: 150 BC vs 139-179).
// Fighters can die (1-4 hits) but intercept missiles, so even damage is fair.
export const FIGHTER_BAYS: FighterBayDef[] = [
  {
    id: "fighter-bay-1",
    name: "Fighter Bay I",
    field: "construction",
    tier: 3,
    hulls: ["large", "huge"],
    spaceShare: 0.15,
    costShare: 0.75,
    fighters: { large: 6, huge: 30 },
    fighter: {
      hits: 1,
      damage: [6, 14],
      shots: 1,
      intercept: 0.15,
    },
    description: "Launches light strike craft that screen their carrier, swarm small hulls, and shoot down incoming missiles. Lost craft rebuild free if the carrier survives.",
  },
  {
    id: "fighter-bay-2",
    name: "Fighter Bay II",
    field: "weapons",
    tier: 5,
    hulls: ["large", "huge"],
    spaceShare: 0.15,
    costShare: 0.75,
    fighters: { large: 7, huge: 35 },
    fighter: {
      hits: 2,
      damage: [5, 12],
      shots: 1,
      intercept: 0.2,
    },
    description: "Expanded launch decks fielding reinforced fighters with heavier armor and upgraded point-defense guns. Lost craft rebuild free if the carrier survives.",
  },
  {
    id: "fighter-bay-3",
    name: "Fighter Bay III",
    field: "computers",
    tier: 7,
    hulls: ["large", "huge"],
    spaceShare: 0.15,
    costShare: 0.75,
    fighters: { large: 8, huge: 40 },
    fighter: {
      hits: 3,
      damage: [5, 10],
      shots: 2,
      intercept: 0.25,
    },
    description: "Automated magnetic catapults deploying rapid-cycling starfighters with dual pulse cannons. Lost craft rebuild free if the carrier survives.",
  },
  {
    id: "fighter-bay-4",
    name: "Fighter Bay IV",
    field: "construction",
    tier: 9,
    hulls: ["large", "huge"],
    spaceShare: 0.15,
    costShare: 0.75,
    fighters: { large: 8, huge: 40 },
    fighter: {
      hits: 4,
      damage: [6, 12],
      shots: 2,
      intercept: 0.3,
    },
    description: "High-capacity dreadnought hangars launching heavy strike wings capable of sustained twin volleys. Lost craft rebuild free if the carrier survives.",
  },
];

/** Special fighter variants a bay can carry instead of the standard fighter. */
export interface FighterVariant {
  id: string;
  name: string;
  /** What changes compared with the standard fighter of the same bay. */
  change: { hitsMul?: number; damageMul?: number; interceptAdd?: number; shotsAdd?: number };
  description: string;     // under 25 words
}

export const FIGHTER_VARIANTS: FighterVariant[] = [
  {
    id: "interceptor",
    name: "Interceptor",
    change: { damageMul: 0.7, interceptAdd: 0.25 },
    description: "Agile escort craft tuned to shred incoming missiles before impact, sacrificing anti-ship firepower for fleet defense.",
  },
  {
    id: "bomber",
    name: "Bomber",
    change: { hitsMul: 0.5, damageMul: 1.85 },
    description: "Heavy ordnance strike craft that punches through capital shields, though thin plating leaves them fragile under fire.",
  },
  {
    id: "heavy-fighter",
    name: "Heavy Fighter",
    change: { hitsMul: 1.75, damageMul: 0.85 },
    description: "Armored multi-role craft built to absorb enemy volleys and screen their carrier through prolonged engagements.",
  },
  {
    id: "salvo-wing",
    name: "Salvo Wing",
    change: { damageMul: 0.65, shotsAdd: 1 },
    description: "Light twin-pod gunships firing rapid scatter-volleys that shred small escort swarms but struggle against heavy shields.",
  },
];