// Frontier job board. Written by Gemini; rules built by Claude.
// Checked by Claude 2026-11-25: ids unique, tier-3 rewards within twice event size, text clean. Passed.
import type { EventEffect, GameEventDef } from "./events";

export type ContractKind = "cargo" | "escort" | "smuggling" | "rescue" | "bounty" | "survey";

export interface ContractDef {
  id: string;
  kind: ContractKind;
  name: string;            // original, e.g. "Medicine Run to the Rim"
  poster: string;          // who posts it, original (a frontier town, a guild, a hermit)
  description: string;     // under 35 words
  tier: 1 | 2 | 3;         // 1 = early, 2 = mid, 3 = late
  /** Ship needed: "scout" (any ship), "warship" (an armed ship), "transport". */
  needs: "scout" | "warship" | "transport";
  /** Turns allowed to finish (3 to 15). */
  turns: number;
  /** Chance it goes wrong (0 to 0.5). Smuggling and bounty should be the riskiest. */
  risk: number;
  reward: EventEffect[];   // up to twice event sizes for tier 3
  /** What happens when it goes wrong. */
  failure: EventEffect[];
  /** Smuggling only: relations lost with the empire whose space you smuggle through if caught (5 to 20). */
  caughtRelations?: number;
}

export const CONTRACTS: ContractDef[] = [
  // =========================================================================
  // CARGO (3)
  // =========================================================================
  {
    id: "salt-run-to-barren-ridge",
    kind: "cargo",
    name: "Salt Run to Barren Ridge",
    poster: "Copperhead Quarry",
    description: "Haul industrial brine canisters to an arid mining camp before their atmospheric scrubbers lock up.",
    tier: 1,
    needs: "transport",
    turns: 5,
    risk: 0.1,
    reward: [
      { kind: "money", amount: 110 },
      { kind: "morale", amount: 2 },
    ],
    failure: [
      { kind: "money", amount: -40 },
    ],
  },
  {
    id: "cryo-seed-convoy",
    kind: "cargo",
    name: "Cryo-Seed Convoy",
    poster: "Veridian Seed Vault",
    description: "Transport stabilized heirloom biosphere pods across three sectors to a terraforming cooperative.",
    tier: 2,
    needs: "transport",
    turns: 8,
    risk: 0.15,
    reward: [
      { kind: "money", amount: 210 },
      { kind: "research", field: "planetology", amount: 160 },
    ],
    failure: [
      { kind: "money", amount: -90 },
      { kind: "morale", amount: -2 },
    ],
  },
  {
    id: "helion-core-freight",
    kind: "cargo",
    name: "Helion Core Freight",
    poster: "Grand Foundry Guild",
    description: "Deliver magnetic containment rings for an orbital smelter under strict thermal-shielding tolerances.",
    tier: 3,
    needs: "transport",
    turns: 11,
    risk: 0.2,
    reward: [
      { kind: "money", amount: 440 },
      { kind: "factories", amount: 4 },
    ],
    failure: [
      { kind: "money", amount: -220 },
      { kind: "factories", amount: -2 },
    ],
  },

  // =========================================================================
  // ESCORT (3)
  // =========================================================================
  {
    id: "pilgrim-barge-guard",
    kind: "escort",
    name: "Pilgrim Barge Guard",
    poster: "Order of the Quiet Star",
    description: "Shadow an unarmed settler barge through an asteroid belt frequented by opportunistic claim-jumpers.",
    tier: 1,
    needs: "warship",
    turns: 6,
    risk: 0.15,
    reward: [
      { kind: "money", amount: 120 },
      { kind: "culture", amount: 45 },
    ],
    failure: [
      { kind: "money", amount: -55 },
      { kind: "morale", amount: -2 },
    ],
  },
  {
    id: "ore-hauler-picket",
    kind: "escort",
    name: "Ore Hauler Picket",
    poster: "Red-Dust Combine",
    description: "Protect three slow bulk freighters carrying refined titanium ingots through contested border lanes.",
    tier: 2,
    needs: "warship",
    turns: 9,
    risk: 0.25,
    reward: [
      { kind: "money", amount: 250 },
      { kind: "research", field: "construction", amount: 180 },
    ],
    failure: [
      { kind: "money", amount: -130 },
      { kind: "relations", amount: -6 },
    ],
  },
  {
    id: "envoy-flagship-screen",
    kind: "escort",
    name: "Envoy Flagship Screen",
    poster: "Free-Port Syndicate",
    description: "Provide heavy cruiser escort for a neutral trade delegation crossing an active war zone.",
    tier: 3,
    needs: "warship",
    turns: 12,
    risk: 0.3,
    reward: [
      { kind: "money", amount: 480 },
      { kind: "relations", amount: 14 },
      { kind: "culture", amount: 120 },
    ],
    failure: [
      { kind: "money", amount: -250 },
      { kind: "relations", amount: -14 },
    ],
  },

  // =========================================================================
  // SMUGGLING (3)
  // =========================================================================
  {
    id: "unmarked-tonic-crates",
    kind: "smuggling",
    name: "Unmarked Tonic Crates",
    poster: "Wharfmaster Kael",
    description: "Slip twenty crates of untaxed frontier fever-tonic past customs patrols to a quarantined moon.",
    tier: 1,
    needs: "scout",
    turns: 4,
    risk: 0.3,
    reward: [
      { kind: "money", amount: 165 },
      { kind: "morale", amount: 3 },
    ],
    failure: [
      { kind: "money", amount: -80 },
      { kind: "morale", amount: -3 },
    ],
    caughtRelations: 8,
  },
  {
    id: "ghost-circuit-manifest",
    kind: "smuggling",
    name: "Ghost-Circuit Manifest",
    poster: "The Hollow Broker",
    description: "Run restricted targeting processors through a naval blockade using spoofed transponder codes.",
    tier: 2,
    needs: "scout",
    turns: 7,
    risk: 0.4,
    reward: [
      { kind: "money", amount: 310 },
      { kind: "research", field: "computers", amount: 260 },
    ],
    failure: [
      { kind: "money", amount: -175 },
      { kind: "morale", amount: -4 },
    ],
    caughtRelations: 14,
  },
  {
    id: "void-glass-contraband",
    kind: "smuggling",
    name: "Void-Glass Contraband",
    poster: "Shadow-Market Exchange",
    description: "Smuggle outlawed dark-matter lenses across imperial core space without triggering gravitic buoys.",
    tier: 3,
    needs: "scout",
    turns: 10,
    risk: 0.48,
    reward: [
      { kind: "money", amount: 580 },
      { kind: "research", field: "forceFields", amount: 520 },
    ],
    failure: [
      { kind: "money", amount: -300 },
      { kind: "morale", amount: -6 },
    ],
    caughtRelations: 20,
  },

  // =========================================================================
  // RESCUE (3)
  // =========================================================================
  {
    id: "drift-beacon-recovery",
    kind: "rescue",
    name: "Drift Beacon Recovery",
    poster: "Outpost Nine Watch",
    description: "Pull twelve stranded ice-miners from a tumbling hab-pod before their reserve air runs dry.",
    tier: 1,
    needs: "transport",
    turns: 4,
    risk: 0.15,
    reward: [
      { kind: "money", amount: 95 },
      { kind: "population", amount: 1 },
      { kind: "morale", amount: 3 },
    ],
    failure: [
      { kind: "money", amount: -50 },
      { kind: "morale", amount: -3 },
    ],
  },
  {
    id: "corona-skimmer-extraction",
    kind: "rescue",
    name: "Corona Skimmer Extraction",
    poster: "Helios Survey Union",
    description: "Tow a crippled solar-research vessel out of a star's upper chromosphere before its shields buckle.",
    tier: 2,
    needs: "warship",
    turns: 6,
    risk: 0.25,
    reward: [
      { kind: "money", amount: 220 },
      { kind: "research", field: "forceFields", amount: 210 },
      { kind: "morale", amount: 4 },
    ],
    failure: [
      { kind: "money", amount: -135 },
      { kind: "morale", amount: -4 },
    ],
  },
  {
    id: "sinkhole-colony-airlift",
    kind: "rescue",
    name: "Sinkhole Colony Airlift",
    poster: "Magistrate Vane",
    description: "Evacuate civilian engineers from a collapsing tectonic shelf while seismic plumes buffet your hull.",
    tier: 3,
    needs: "transport",
    turns: 9,
    risk: 0.3,
    reward: [
      { kind: "money", amount: 420 },
      { kind: "population", amount: 3 },
      { kind: "culture", amount: 140 },
    ],
    failure: [
      { kind: "money", amount: -240 },
      { kind: "population", amount: -1 },
      { kind: "morale", amount: -5 },
    ],
  },

  // =========================================================================
  // BOUNTY (3)
  // =========================================================================
  {
    id: "red-fang-raider-warrant",
    kind: "bounty",
    name: "Red-Fang Raider Warrant",
    poster: "Dry-Creek Bailiff",
    description: "Hunt down a converted gun-cutter raiding moisture farms on the outer fringe.",
    tier: 1,
    needs: "warship",
    turns: 6,
    risk: 0.3,
    reward: [
      { kind: "money", amount: 175 },
      { kind: "research", field: "weapons", amount: 120 },
    ],
    failure: [
      { kind: "money", amount: -90 },
      { kind: "morale", amount: -3 },
    ],
  },
  {
    id: "iron-jackal-corsair",
    kind: "bounty",
    name: "Iron-Jackal Corsair",
    poster: "Merchant Wardens",
    description: "Intercept and neutralize a fast blockade-runner preying on unescorted spice convoys.",
    tier: 2,
    needs: "warship",
    turns: 9,
    risk: 0.4,
    reward: [
      { kind: "money", amount: 300 }, // Claude: 330 -> 300, tier 2 stays inside the event scale
      { kind: "research", field: "propulsion", amount: 240 },
      { kind: "morale", amount: 4 },
    ],
    failure: [
      { kind: "money", amount: -190 },
      { kind: "morale", amount: -5 },
    ],
  },
  {
    id: "black-flag-dreadnought",
    kind: "bounty",
    name: "Black-Flag Dreadnought",
    poster: "Sector Marshals",
    description: "Destroy a rogue warlord's heavily armored flagship hiding inside a dense ion nebula.",
    tier: 3,
    needs: "warship",
    turns: 14,
    risk: 0.45,
    reward: [
      { kind: "money", amount: 600 },
      { kind: "research", field: "weapons", amount: 550 },
      { kind: "culture", amount: 160 },
    ],
    failure: [
      { kind: "money", amount: -300 },
      { kind: "factories", amount: -3 },
      { kind: "morale", amount: -6 },
    ],
  },

  // =========================================================================
  // SURVEY (3)
  // =========================================================================
  {
    id: "dust-belt-mineral-sweep",
    kind: "survey",
    name: "Dust-Belt Mineral Sweep",
    poster: "Prospector Guild",
    description: "Chart three unmapped planetoids for rare-earth veins and drop automated claim beacons.",
    tier: 1,
    needs: "scout",
    turns: 6,
    risk: 0.1,
    reward: [
      { kind: "money", amount: 90 },
      { kind: "revealStars", count: 2 },
    ],
    failure: [
      { kind: "money", amount: -35 },
    ],
  },
  {
    id: "grav-well-drift-mapping",
    kind: "survey",
    name: "Grav-Well Drift Mapping",
    poster: "Navigators Chapter",
    description: "Plot safe slipstream corridors around a binary pulsar to shave days off regional transit.",
    tier: 2,
    needs: "scout",
    turns: 10,
    risk: 0.2,
    reward: [
      { kind: "money", amount: 200 },
      { kind: "research", field: "propulsion", amount: 220 },
      { kind: "revealStars", count: 4 },
    ],
    failure: [
      { kind: "money", amount: -110 },
      { kind: "morale", amount: -2 },
    ],
  },
  {
    id: "abyssal-rift-telemetry",
    kind: "survey",
    name: "Abyssal Rift Telemetry",
    poster: "Deep-Void Institute",
    description: "Deploy sensor buoys along a spatial shear zone to record sub-space harmonic readings.",
    tier: 3,
    needs: "scout",
    turns: 15,
    risk: 0.25,
    reward: [
      { kind: "money", amount: 400 },
      { kind: "research", field: "computers", amount: 500 },
      { kind: "revealStars", count: 6 },
    ],
    failure: [
      { kind: "money", amount: -210 },
      { kind: "morale", amount: -4 },
    ],
  },
];

/** Things that happen during a job. trigger "turn". */
export const CONTRACT_TWISTS: GameEventDef[] = [
  {
    id: "twist-sealed-manifest-broken",
    title: "The Cargo Speaks",
    art: "pirates",
    trigger: "turn",
    text: "A coolant seal cracks in the hold during transit near {star}. Inside the crate labeled 'mining valves' are dozens of stasis-locked cryotubes bearing the crest of the {rival}.",
    choices: [
      {
        label: "Keep the seals shut and finish the run",
        result: "You weld the casing back together and collect full hazard pay at the drop, though the crew refuses to speak of it.",
        effects: [
          { kind: "money", amount: 180 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Return the pods to the {rival}",
        result: "The {rival} quietly thanks your captain and reimburses fuel costs, though your original client blacklists your ship.",
        effects: [
          { kind: "relations", amount: 14 },
          { kind: "money", amount: -90 },
        ],
      },
      {
        label: "Thaw the pods at {colony}",
        result: "Freed political exiles settle onto {colony} and share encrypted technical archives with your engineers.",
        effects: [
          { kind: "population", amount: 2 },
          { kind: "research", field: "computers", amount: 140 },
          { kind: "relations", amount: -12 },
        ],
      },
    ],
  },
  {
    id: "twist-client-ambush-beacon",
    title: "Dead-Drop Double-Cross",
    art: "pirates",
    trigger: "turn",
    text: "At the rendezvous above {star}, the client's payment buoy transmits a targeting lock instead of credit codes. Three unmarked gunboats burn out from behind a moon.",
    choices: [
      {
        label: "Dump the payload and burn hard",
        result: "The ambushers stop to scoop up the jettisoned cargo, letting your crew escape intact but empty-handed.",
        effects: [
          { kind: "money", amount: -120 },
          { kind: "morale", amount: 2 },
        ],
      },
      {
        label: "Overload engines and ram through",
        result: "Your ship punches through their blockade and seizes their signal-relay box, at the cost of heavy hull scorch.",
        effects: [
          { kind: "research", field: "propulsion", amount: 190 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },
  {
    id: "twist-bilge-stowaway",
    title: "Voice in the Conduits",
    art: "contact",
    trigger: "turn",
    text: "Engineering finds a young archivist curled beside the heat exchangers out of {colony}. She stole a prototype sensor core from a syndicate lab and begs for asylum.",
    choices: [
      {
        label: "Grant asylum and study the core",
        result: "Her stolen schematic advances your sensor labs, though syndicate debt-collectors freeze one of your trade accounts.",
        effects: [
          { kind: "research", field: "computers", amount: 210 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Hand her over at the next port",
        result: "The syndicate pays a discreet finder's fee, leaving your crew bitter over the cold arithmetic.",
        effects: [
          { kind: "money", amount: 150 },
          { kind: "morale", amount: -5 },
        ],
      },
    ],
  },
  {
    id: "twist-old-comrade-distress",
    title: "An Old Debt Called In",
    art: "crisis",
    trigger: "turn",
    text: "A tight-beam hail cuts through static near {star}. An old war comrade's freighter is losing cabin pressure in a debris field, miles off your contracted course.",
    choices: [
      {
        label: "Divert and patch their hull",
        result: "You save their crew and earn lasting acclaim across the frontier, though late-delivery penalties eat your profit.",
        effects: [
          { kind: "culture", amount: 95 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Log their coordinates and stay on schedule",
        result: "You deliver on time and collect your full bonus, haunted by the silence on the distress channel.",
        effects: [
          { kind: "money", amount: 160 },
          { kind: "morale", amount: -6 },
        ],
      },
    ],
  },
  {
    id: "twist-border-customs-shakedown",
    title: "The Harbor-Master's Cut",
    art: "council",
    trigger: "turn",
    text: "A patrol frigate belonging to the {rival} holds your contract vessel at a jump gate near {star}, claiming your transit papers lack an archaic inspection stamp.",
    choices: [
      {
        label: "Pay the steep 'port tariff'",
        result: "The commander pockets the credits and waves you through immediately, preserving cordial border ties.",
        effects: [
          { kind: "money", amount: -150 },
          { kind: "relations", amount: 6 },
        ],
      },
      {
        label: "Run the gate while their sensors cycle",
        result: "You slip past untouched and keep your treasury whole, triggering an angry diplomatic protest from the {rival}.",
        effects: [
          { kind: "relations", amount: -12 },
          { kind: "morale", amount: 3 },
        ],
      },
    ],
  },
  {
    id: "twist-derelict-claim-conflict",
    title: "Ghost Ship on the Vector",
    art: "ruins",
    trigger: "turn",
    text: "While crossing uncharted space toward {star}, your scanners ping an intact pre-collapse courier hull drifting cold. Salvaging it will delay your current contract.",
    choices: [
      {
        label: "Strip the derelict's memory banks",
        result: "You recover ancient navigation charts and hull alloys, forfeiting your client's speed bonus.",
        effects: [
          { kind: "research", field: "construction", amount: 180 },
          { kind: "revealStars", count: 3 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Sell the salvage coordinates to {colony}",
        result: "Local prospectors pay well for the claim and boost civic pride, without slowing your mission.",
        effects: [
          { kind: "money", amount: 130 },
          { kind: "culture", amount: 55 },
          { kind: "morale", amount: -2 },
        ],
      },
    ],
  },
];

/*
CLAUDE (2026-11-25): data only. Rules to build: one contract offered at a time per empire, needs a ship of
the stated kind parked at a colony; colony effects hit the posting colony (else the capital); relations and
caughtRelations hit the nearest contacted empire. Twists only roll while a contract runs.

===========================================================================
BALANCE WORKING (Expected Value = Reward * (1 - risk) - Failure * risk)
===========================================================================

Note on non-BC effects:
In Dominion of a Thousand Suns, factories cost ~60-150 BC early and build
compound industrial output every turn, while random events cap at ~300 BC
and ~400 research per field. Contracts tie up a ship for 4-15 turns, so their
expected BC yield is tuned below building factories directly, giving small or
cash-strapped empires a tactical boost without replacing colony infrastructure.

TIER 1 (Early Game, 4-6 turns, ~100-175 BC nominal)
---------------------------------------------------------------------------
1. Salt Run to Barren Ridge (cargo, risk 0.10):
   EV = (110 BC + 2 morale) * 0.90 - (40 BC) * 0.10
      = 99 BC - 4 BC = +95 BC net (+1.8 morale)
2. Pilgrim Barge Guard (escort, risk 0.15):
   EV = (120 BC + 45 culture) * 0.85 - (55 BC + 2 morale) * 0.15
      = 102 BC - 8.25 BC = +93.75 BC net (+38.25 culture, -0.3 morale)
3. Unmarked Tonic Crates (smuggling, risk 0.30, caughtRelations 8):
   EV = (165 BC + 3 morale) * 0.70 - (80 BC + 3 morale + 8 rel) * 0.30
      = 115.5 BC - 24 BC = +91.5 BC net (+1.2 morale, -2.4 rel)
   *Higher upside (+165 BC) offset by diplomatic penalty if caught.
4. Drift Beacon Recovery (rescue, risk 0.15):
   EV = (95 BC + 1 pop + 3 morale) * 0.85 - (50 BC + 3 morale) * 0.15
      = 80.75 BC - 7.5 BC = +73.25 BC net (+0.85 pop, +2.1 morale)
5. Red-Fang Raider Warrant (bounty, risk 0.30):
   EV = (175 BC + 120 weapons) * 0.70 - (90 BC + 3 morale) * 0.30
      = 122.5 BC - 27 BC = +95.5 BC net (+84 weapons, -0.9 morale)
6. Dust-Belt Mineral Sweep (survey, risk 0.10):
   EV = (90 BC + 2 stars) * 0.90 - (35 BC) * 0.10
      = 81 BC - 3.5 BC = +77.5 BC net (+1.8 stars revealed)

TIER 2 (Mid Game, 6-10 turns, ~200-330 BC nominal)
---------------------------------------------------------------------------
7. Cryo-Seed Convoy (cargo, risk 0.15):
   EV = (210 BC + 160 planetology) * 0.85 - (90 BC + 2 morale) * 0.15
      = 178.5 BC - 13.5 BC = +165 BC net (+136 planetology, -0.3 morale)
8. Ore Hauler Picket (escort, risk 0.25):
   EV = (250 BC + 180 construction) * 0.75 - (130 BC + 6 rel) * 0.25
      = 187.5 BC - 32.5 BC = +155 BC net (+135 construction, -1.5 rel)
9. Ghost-Circuit Manifest (smuggling, risk 0.40, caughtRelations 14):
   EV = (310 BC + 260 computers) * 0.60 - (175 BC + 4 morale + 14 rel) * 0.40
      = 186 BC - 70 BC = +116 BC net (+156 computers, -1.6 morale, -5.6 rel)
10. Corona Skimmer Extraction (rescue, risk 0.25):
   EV = (220 BC + 210 forceFields + 4 morale) * 0.75 - (135 BC + 4 morale) * 0.25
      = 165 BC - 33.75 BC = +131.25 BC net (+157.5 forceFields, +2.0 morale)
11. Iron-Jackal Corsair (bounty, risk 0.40):
   EV = (330 BC + 240 propulsion + 4 morale) * 0.60 - (190 BC + 5 morale) * 0.40
      = 198 BC - 76 BC = +122 BC net (+144 propulsion, +0.4 morale)
12. Grav-Well Drift Mapping (survey, risk 0.20):
   EV = (200 BC + 220 propulsion + 4 stars) * 0.80 - (110 BC + 2 morale) * 0.20
      = 160 BC - 22 BC = +138 BC net (+176 propulsion, +3.2 stars)

TIER 3 (Late Game, 9-15 turns, ~400-600 BC nominal)
---------------------------------------------------------------------------
13. Helion Core Freight (cargo, risk 0.20):
   EV = (440 BC + 4 factories) * 0.80 - (220 BC + 2 factories) * 0.20
      = 352 BC - 44 BC = +308 BC net (+2.8 factories)
14. Envoy Flagship Screen (escort, risk 0.30):
   EV = (480 BC + 14 rel + 120 culture) * 0.70 - (250 BC + 14 rel) * 0.30
      = 336 BC - 75 BC = +261 BC net (+5.6 rel, +84 culture)
15. Void-Glass Contraband (smuggling, risk 0.48, caughtRelations 20):
   EV = (580 BC + 520 forceFields) * 0.52 - (300 BC + 6 morale + 20 rel) * 0.48
      = 301.6 BC - 144 BC = +157.6 BC net (+270.4 forceFields, -2.88 morale, -9.6 rel)
16. Sinkhole Colony Airlift (rescue, risk 0.30):
   EV = (420 BC + 3 pop + 140 culture) * 0.70 - (240 BC + 1 pop + 5 morale) * 0.30
      = 294 BC - 72 BC = +222 BC net (+1.8 pop, +98 culture, -1.5 morale)
17. Black-Flag Dreadnought (bounty, risk 0.45):
   EV = (600 BC + 550 weapons + 160 culture) * 0.55 - (300 BC + 3 factories + 6 morale) * 0.45
      = 330 BC - 135 BC = +195 BC net (+302.5 weapons, -1.35 factories, +88 culture, -2.7 morale)
18. Abyssal Rift Telemetry (survey, risk 0.25):
   EV = (400 BC + 500 computers + 6 stars) * 0.75 - (210 BC + 4 morale) * 0.25
      = 300 BC - 52.5 BC = +247.5 BC net (+375 computers, +4.5 stars, -1.0 morale)

NOTES / ITEMS FOR CLAUDE TO VERIFY IN ENGINE WIRING:
1. Target scope of EventEffect on contracts:
   Effects like `morale`, `population`, `factories`, and `relations` on contract
   rewards/failures assume the contract resolver applies colony-scoped effects
   to the nearest/originating colony (or capital) and `relations` to the
   relevant border/posting empire (especially `caughtRelations` on smuggling).
2. Placeholder resolution on `CONTRACT_TWISTS`:
   Because `CONTRACT_TWISTS` uses `trigger: "turn"`, ensure the event runner
   binds `{star}`, `{colony}`, and `{rival}` (only firing twists that use
   `{rival}` when at least one rival empire has been contacted).
*/