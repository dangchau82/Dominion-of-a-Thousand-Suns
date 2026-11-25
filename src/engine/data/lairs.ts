// Neutral lairs: guarded places with a prize. Written by Gemini (2026-11-25, parallel-chat test, chat 4), checked by Claude; rules built by Claude.
// Claude cut the tier-3 guard counts by about half: as written, a tier-3 lair had 4,000-6,000 hit points of huge ships, more than a late-game empire fields.
import type { EventEffect } from "./events";
import type { HullSize } from "./ships";

export interface LairGuard {
  name: string;          // e.g. "Raider Corvette"
  hull: HullSize;        // "small" | "medium" | "large" | "huge"
  count: number;         // 1 to 12
  weapons: { techId: string; count: number }[]; // tech ids from the list above
  shield: number;        // 0-7
  armor: number;         // 0-7
}

export interface LairDef {
  id: string;            // lowercase-with-dashes
  kind: "pirates" | "hive" | "sleeper" | "treasure" | "anomaly";
  name: string;
  tier: 1 | 2 | 3;       // 1 = early (around turn 50), 2 = mid (150), 3 = late (250+)
  description: string;   // what scouts report, under 40 words
  guards: LairGuard[];   // anomaly lairs may use one "hazard" guard instead of ships
  victoryText: string;   // shown when it falls, under 30 words
  reward: EventEffect[];
}

export const LAIRS: LairDef[] = [
  // ============================================================================
  // TIER 1 (Early game, around turn 50)
  // ============================================================================
  {
    id: "driftwake-raider-post",
    kind: "pirates",
    name: "Driftwake Raider Post",
    tier: 1,
    description: "Scrap-welded gunboats patrol a hidden fueling rock in the outer orbit of {star}, preying on merchant lanes.",
    guards: [
      {
        name: "Raider Skiff",
        hull: "small",
        count: 5,
        weapons: [{ techId: "laser", count: 1 }],
        shield: 1,
        armor: 1,
      },
      {
        name: "Corsair Corvette",
        hull: "medium",
        count: 1,
        weapons: [
          { techId: "pulse-laser", count: 1 },
          { techId: "nuclear-missile", count: 1 },
        ],
        shield: 1,
        armor: 2,
      },
    ],
    victoryText: "The raider corvette breaks apart, leaving behind stolen bullion and local star charts.",
    reward: [
      { kind: "money", amount: 220 },
      { kind: "revealStars", count: 2 },
    ],
  },
  {
    id: "spore-drift-nest",
    kind: "hive",
    name: "Spore Drift Nest",
    tier: 1,
    description: "A pulsing web of calcified pods clings to a cold asteroid at {star}, spitting acidic darts at passing ships.",
    guards: [
      {
        name: "Mite Skimmer",
        hull: "small",
        count: 9,
        weapons: [{ techId: "laser", count: 1 }],
        shield: 0,
        armor: 1,
      },
      {
        name: "Brood Queen",
        hull: "medium",
        count: 1,
        weapons: [{ techId: "nuclear-missile", count: 2 }],
        shield: 1,
        armor: 2,
      },
    ],
    victoryText: "The calcified pods shatter into sterile dust, revealing resilient organic polymers.",
    reward: [
      { kind: "research", field: "construction", amount: 280 },
      { kind: "morale", amount: 3 },
    ],
  },
  {
    id: "serevahn-beacon-vault",
    kind: "sleeper",
    name: "Serevahn Beacon Vault",
    tier: 1,
    description: "Two ancient Serevahn patrol drones drift around a silent spire at {star}, waking as our sensors lock on.",
    guards: [
      {
        name: "Serevahn Sentinel",
        hull: "medium",
        count: 2,
        weapons: [{ techId: "pulse-laser", count: 2 }],
        shield: 2,
        armor: 2,
      },
    ],
    victoryText: "The sentinels go dark and the spire unlocks a cache of intact Serevahn logic cores.",
    reward: [
      { kind: "research", field: "computers", amount: 300 },
    ],
  },
  {
    id: "drifting-smuggler-hulk",
    kind: "treasure",
    name: "Drifting Smuggler Hulk",
    tier: 1,
    description: "A gutted bulk freighter tumbles near {star}, its automated perimeter turrets still tracking movement.",
    guards: [
      {
        name: "Sentry Drone",
        hull: "small",
        count: 3,
        weapons: [{ techId: "laser", count: 1 }],
        shield: 1,
        armor: 1,
      },
      {
        name: "Defense Turret",
        hull: "medium",
        count: 1,
        weapons: [{ techId: "hyper-velocity-rockets", count: 1 }],
        shield: 1,
        armor: 2,
      },
    ],
    victoryText: "With the turrets silenced, boarding teams recover unmarked trade bars and an intact scout.",
    reward: [
      { kind: "money", amount: 260 },
      { kind: "ships", template: "scout", count: 1 },
    ],
  },
  {
    id: "static-eddy-rift",
    kind: "anomaly",
    name: "Static Eddy Rift",
    tier: 1,
    description: "Crackling plasma arcs dance across a magnetic sinkhole at {star}, lashing any hull that approaches.",
    guards: [
      {
        name: "Magnetic Arc Surge",
        hull: "medium",
        count: 2,
        weapons: [{ techId: "ion-cannon", count: 1 }],
        shield: 2,
        armor: 0,
      },
    ],
    victoryText: "Our hull fields ground out the static storm, letting science teams map its drive harmonics.",
    reward: [
      { kind: "research", field: "propulsion", amount: 280 },
      { kind: "culture", amount: 80 },
    ],
  },

  // ============================================================================
  // TIER 2 (Mid game, around turn 150)
  // ============================================================================
  {
    id: "ash-veil-syndicate-depot",
    kind: "pirates",
    name: "Ash Veil Syndicate Depot",
    tier: 2,
    description: "Armored privateer cruisers guard a hidden fuel and salvage anchorage inside the dust ring of {star}.",
    guards: [
      {
        name: "Privateer Frigate",
        hull: "medium",
        count: 6,
        weapons: [
          { techId: "ion-cannon", count: 2 },
          { techId: "seeker-missile", count: 1 },
        ],
        shield: 3,
        armor: 3,
      },
      {
        name: "Syndicate Galleon",
        hull: "large",
        count: 2,
        weapons: [
          { techId: "neutron-blaster", count: 2 },
          { techId: "smart-missile", count: 2 },
        ],
        shield: 4,
        armor: 3,
      },
    ],
    victoryText: "The syndicate galleons burn out in the dust ring, leaving their vault unsealed.",
    reward: [
      { kind: "money", amount: 420 },
      { kind: "revealStars", count: 4 },
    ],
  },
  {
    id: "chitin-spindle-brood",
    kind: "hive",
    name: "Chitin Spindle Brood",
    tier: 2,
    description: "A swollen cluster of bio-vascular sacs clings to an asteroid belt at {star}, spawning armored flyers.",
    guards: [
      {
        name: "Spore Swarmer",
        hull: "small",
        count: 10,
        weapons: [{ techId: "mass-driver", count: 1 }],
        shield: 1,
        armor: 3,
      },
      {
        name: "Carapace Matriarch",
        hull: "large",
        count: 3,
        weapons: [
          { techId: "graviton-beam", count: 2 },
          { techId: "seeker-missile", count: 2 },
        ],
        shield: 3,
        armor: 4,
      },
    ],
    victoryText: "The brood sacs rupture and freeze in vacuum, yielding dense bio-alloy samples.",
    reward: [
      { kind: "research", field: "construction", amount: 450 },
      { kind: "morale", amount: 5 },
    ],
  },
  {
    id: "serevahn-relay-bastion",
    kind: "sleeper",
    name: "Serevahn Relay Bastion",
    tier: 2,
    description: "An obsidian Serevahn lattice orbits {star}, powering up heavy defense platforms as our sensors sweep it.",
    guards: [
      {
        name: "Serevahn Warden",
        hull: "large",
        count: 3,
        weapons: [
          { techId: "neutron-blaster", count: 3 },
          { techId: "smart-missile", count: 1 },
        ],
        shield: 4,
        armor: 4,
      },
    ],
    victoryText: "The bastion powers down in a cascade of blue sparks, opening its archival memory banks.",
    reward: [
      { kind: "research", field: "computers", amount: 450 },
      { kind: "research", field: "forceFields", amount: 250 },
    ],
  },
  {
    id: "sunken-mint-vault",
    kind: "treasure",
    name: "Sunken Mint Vault",
    tier: 2,
    description: "An ancient bullion carrier lies wedged inside a fractured moon at {star}, protected by automated escorts.",
    guards: [
      {
        name: "Vault Escort",
        hull: "medium",
        count: 4,
        weapons: [
          { techId: "mass-driver", count: 2 },
          { techId: "seeker-missile", count: 1 },
        ],
        shield: 3,
        armor: 3,
      },
      {
        name: "Custodian Dreadnought",
        hull: "large",
        count: 1,
        weapons: [{ techId: "plasma-cannon", count: 2 }],
        shield: 4,
        armor: 4,
      },
    ],
    victoryText: "Our salvage crews crack the carrier bulkheads and haul out pallets of stamped platinum.",
    reward: [
      { kind: "money", amount: 500 },
      { kind: "culture", amount: 180 },
    ],
  },
  {
    id: "phase-shear-vortex",
    kind: "anomaly",
    name: "Phase Shear Vortex",
    tier: 2,
    description: "Twisted spatial folds around {star} hurl folded-space bolts at anything entering the inner orbit.",
    guards: [
      {
        name: "Spatial Shear Rifts",
        hull: "large",
        count: 3,
        weapons: [
          { techId: "graviton-beam", count: 3 },
          { techId: "plasma-cannon", count: 1 },
        ],
        shield: 5,
        armor: 2,
      },
    ],
    victoryText: "Our emitters stabilize the vortex core, exposing a pocket of exotic drive data.",
    reward: [
      { kind: "research", field: "propulsion", amount: 450 },
      { kind: "ships", template: "scout", count: 2 },
    ],
  },

  // ============================================================================
  // TIER 3 (Late game, turn 250+)
  // ============================================================================
  {
    id: "black-star-corsair-citadel",
    kind: "pirates",
    name: "Black Star Corsair Citadel",
    tier: 3,
    description: "A fleet of dreadnoughts assembled from stolen hulls blockades a shadowy fortress at {star}.",
    guards: [
      {
        name: "Marauder Cruiser",
        hull: "large",
        count: 5,
        weapons: [
          { techId: "disruptor", count: 3 },
          { techId: "stellar-torpedo", count: 2 },
        ],
        shield: 5,
        armor: 5,
      },
      {
        name: "Black Star Dreadnought",
        hull: "huge",
        count: 3,
        weapons: [
          { techId: "phase-lance", count: 3 },
          { techId: "hellfire-torpedo", count: 2 },
        ],
        shield: 6,
        armor: 6,
      },
    ],
    victoryText: "The corsair dreadnoughts shatter, exposing centuries of plundered gold and deep-sector charts.",
    reward: [
      { kind: "money", amount: 600 },
      { kind: "revealStars", count: 6 },
    ],
  },
  {
    id: "abyssal-leviathan-maw",
    kind: "hive",
    name: "Abyssal Leviathan Maw",
    tier: 3,
    description: "Colossal void-born beasts orbit a dark nursery moon at {star}, their carapaces glowing with bio-plasma.",
    guards: [
      {
        name: "Void Ravager",
        hull: "large",
        count: 6,
        weapons: [
          { techId: "plasma-cannon", count: 3 },
          { techId: "stellar-torpedo", count: 1 },
        ],
        shield: 4,
        armor: 6,
      },
      {
        name: "Abyssal Leviathan",
        hull: "huge",
        count: 3,
        weapons: [
          { techId: "phase-lance", count: 4 },
          { techId: "disruptor", count: 2 },
        ],
        shield: 5,
        armor: 7,
      },
    ],
    victoryText: "The leviathans fall silent, providing self-knitting hull tissue and inspiring our colonies.",
    reward: [
      { kind: "research", field: "construction", amount: 600 },
      { kind: "morale", amount: 8 },
      { kind: "population", amount: 3 },
    ],
  },
  {
    id: "serevahn-prime-citadel",
    kind: "sleeper",
    name: "Serevahn Prime Citadel",
    tier: 3,
    description: "A ring of colossal Serevahn war-machines surrounds a gleaming nexus at {star}, charging annihilator arrays.",
    guards: [
      {
        name: "Serevahn Arbiter",
        hull: "huge",
        count: 4,
        weapons: [
          { techId: "annihilator-ray", count: 2 },
          { techId: "phase-lance", count: 3 },
        ],
        shield: 7,
        armor: 7,
      },
    ],
    victoryText: "The arbiters power down in unison, surrendering the Serevahn nexus vault to our scholars.",
    reward: [
      { kind: "research", field: "computers", amount: 600 },
      { kind: "research", field: "weapons", amount: 600 },
    ],
  },
  {
    id: "imperial-bullion-ark",
    kind: "treasure",
    name: "Imperial Bullion Ark",
    tier: 3,
    description: "A sealed pre-collapse treasury ark hangs in synchronous orbit above {star} behind heavy automated bastions.",
    guards: [
      {
        name: "Aegis Defender",
        hull: "large",
        count: 4,
        weapons: [
          { techId: "disruptor", count: 3 },
          { techId: "stellar-torpedo", count: 2 },
        ],
        shield: 6,
        armor: 6,
      },
      {
        name: "Ark Guardian",
        hull: "huge",
        count: 2,
        weapons: [
          { techId: "phase-lance", count: 3 },
          { techId: "hellfire-torpedo", count: 2 },
        ],
        shield: 7,
        armor: 6,
      },
    ],
    victoryText: "Our engineers breach the ark seals, recovering royal crowns and chests of refined iridium.",
    reward: [
      { kind: "money", amount: 600 },
      { kind: "culture", amount: 320 },
    ],
  },
  {
    id: "singularity-crown-spire",
    kind: "anomaly",
    name: "Singularity Crown Spire",
    tier: 3,
    description: "A captive micro-singularity at {star} bends starlight into razor-sharp beams that lash any approaching fleet.",
    guards: [
      {
        name: "Gravitational Lash",
        hull: "huge",
        count: 3,
        weapons: [
          { techId: "annihilator-ray", count: 2 },
          { techId: "disruptor", count: 3 },
        ],
        shield: 7,
        armor: 5,
      },
    ],
    victoryText: "Containment fields lock around the singularity, unlocking breakthroughs in warp and shield physics.",
    reward: [
      { kind: "research", field: "propulsion", amount: 600 },
      { kind: "research", field: "forceFields", amount: 600 },
      { kind: "ships", template: "scout", count: 3 },
    ],
  },
];