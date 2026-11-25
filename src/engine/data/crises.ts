// Multi-stage ten-turn crises with persistent path tags and real dilemmas.
// Written by Gemini (2026-11-25, third version), checked by Claude; rules built by Claude.
import type { EventEffect, GameEventDef } from "./events";

type EventArt = GameEventDef["art"];

export type CrisisOutcomeTag = "integrated" | "secede" | "meltdown" | "coup" | "lockdown";

export interface CrisisOption {
  label: string;
  result: string;
  /** Sets or updates the active branch path for subsequent stages (on success, for gambles). */
  path: string;
  /** For gambles: the path taken when the roll fails (defaults to `path`). */
  failPath?: string;
  /** Probability of success (1 = deterministic; < 1 = gamble using state.rng). */
  chance: number;
  effects: EventEffect[];
  failResult?: string;
  failEffects?: EventEffect[];
  /** Applied only on Stage 3 endings when an irreversible world state occurs. */
  crisisOutcome?: CrisisOutcomeTag;
}

export interface CrisisStageDef {
  id: string;
  stage: 1 | 2 | 3;
  /** Turns after previous stage before this stage fires (3 turns per step). */
  delayTurns: number;
  /** Required path tag from the preceding stage (omitted on stage 1). */
  requiresPath?: string;
  title: string;
  art: EventArt;
  text: string;
  choices: CrisisOption[];
}

export interface TenTurnCrisisDef {
  id: string;
  name: string;
  /** Measurable trigger requirement checked during endTurn(). */
  triggerRule: string;
  stages: CrisisStageDef[];
}

// Claude's fixes: art "diplomacy" (not a game picture) -> "contact"; three stage-2 gambles
// (siphon overdrive, core wipe, enzyme stabilizer) led to their disaster ending even on success,
// so they now go to a good ending on success and to the disaster only through failPath.
export const TEN_TURN_CRISES: TenTurnCrisisDef[] = [
  // =========================================================================
  // CRISIS 1: A COLONY DECLARES INDEPENDENCE
  // =========================================================================
  {
    id: "crisis-colony-secession",
    name: "The Charter of Broken Chains",
    triggerRule: "turn >= 60 && colony.population >= 15 && !colony.isCapital && distanceFromCapital >= 6",
    stages: [
      {
        id: "secession-s1",
        stage: 1,
        delayTurns: 0,
        title: "The Banner Comes Down",
        art: "crisis",
        text: "Civic leaders on {colony} at {star} have lowered the imperial banner and proclaimed a sovereign assembly, citing distant rule and heavy fleet taxes.",
        choices: [
          {
            // EV: -280 + 4*20 + 40*2 = -120 BC (costly humanitarian path)
            label: "Grant a 280 BC tax rebate and autonomy charter",
            result: "Envoys land with emergency treasury credits and a provisional charter, calming the plazas.",
            path: "negotiate",
            chance: 1,
            effects: [
              { kind: "money", amount: -280 },
              { kind: "morale", amount: 4 },
              { kind: "culture", amount: 40 },
            ],
          },
          {
            // EV: -80 + (-4)*20 + (-3)*10 = -190 BC
            label: "Enforce an orbital blockade and freeze port credits",
            result: "Customs cruisers seal the high orbitals while dockworkers strike across {colony}.",
            path: "blockade",
            chance: 1,
            effects: [
              { kind: "money", amount: -80 },
              { kind: "morale", amount: -4 },
              { kind: "factories", amount: -3 },
            ],
          },
          {
            // EV: 0.55*(-25 - 40) + 0.45*(-50 - 40 - 120) = -130.3 BC
            label: "Drop shock troops onto the assembly hall (55% success)",
            result: "Commandos secure the rotunda and detain the ringleaders before militias mobilize.",
            path: "storm",
            chance: 0.55,
            effects: [
              { kind: "population", amount: -1 },
              { kind: "morale", amount: -2 },
            ],
            failResult: "Street militias ambush the drop-pods and seize the planetary armory.",
            failEffects: [
              { kind: "population", amount: -2 },
              { kind: "factories", amount: -4 },
              { kind: "morale", amount: -6 },
            ],
          },
        ],
      },
      {
        id: "secession-s2-negotiate",
        stage: 2,
        delayTurns: 3,
        requiresPath: "negotiate",
        title: "The Counter-Offer",
        art: "contact",
        text: "Moderates on {colony} welcome the rebate, but guild delegates demand permanent control of local customs duties.",
        choices: [
          {
            // EV: -240 + 120*2 + 5*20 = +100 BC
            label: "Ratify a home-rule compact and fund local schools (240 BC)",
            result: "A shared constitution binds {colony} willingly to the empire.",
            path: "neg_federate",
            chance: 1,
            effects: [
              { kind: "money", amount: -240 },
              { kind: "culture", amount: 120 },
              { kind: "morale", amount: 5 },
            ],
          },
          {
            // EV: +60 + (-3)*20 = 0 BC
            label: "Accept their council seat while auditing guild ledgers",
            result: "Imperial auditors claw back tariff revenue, sowing quiet resentment.",
            path: "neg_stall",
            chance: 1,
            effects: [
              { kind: "money", amount: 60 },
              { kind: "morale", amount: -3 },
            ],
          },
        ],
      },
      {
        id: "secession-s2-blockade",
        stage: 2,
        delayTurns: 3,
        requiresPath: "blockade",
        title: "The Smuggler Lifeline",
        art: "crisis",
        text: "Under orbital quarantine, {colony} faces medical shortages while freighters linked to the {rival} test your blockade line.",
        choices: [
          {
            // EV: -220 + 4*20 + 6*5 = -110 BC
            label: "Open humanitarian corridors and subsidize clinics (220 BC)",
            result: "Relief shuttles descend under truce flags, easing tension across {colony}.",
            path: "blk_mercy",
            chance: 1,
            effects: [
              { kind: "money", amount: -220 },
              { kind: "morale", amount: 4 },
              { kind: "relations", amount: 6 },
            ],
          },
          {
            // EV: -14*5 + (-4)*20 + (-1)*25 = -175 BC
            label: "Fire warning salvos at all blockade runners",
            result: "Two freighters turn back in flames, enraging both the {rival} and {colony}.",
            path: "blk_fire",
            chance: 1,
            effects: [
              { kind: "relations", amount: -14 },
              { kind: "morale", amount: -4 },
              { kind: "population", amount: -1 },
            ],
          },
        ],
      },
      {
        id: "secession-s2-storm",
        stage: 2,
        delayTurns: 3,
        requiresPath: "storm",
        title: "Barricades in the Spires",
        art: "crisis",
        text: "Armed militias have fortified the industrial rings of {colony}, daring imperial garrisons to advance.",
        choices: [
          {
            // EV: -150 + 2*20 = -110 BC
            label: "Offer general amnesty if militias lay down arms (150 BC)",
            result: "Exhausted defenders surrender their rifles in exchange for pardons and back pay.",
            path: "stm_amnesty",
            chance: 1,
            effects: [
              { kind: "money", amount: -150 },
              { kind: "morale", amount: 2 },
            ],
          },
          {
            // EV: -6*10 + (-2)*25 + (-5)*20 = -210 BC
            label: "Cut habitat power grids to force immediate capitulation",
            result: "Darkness and cold break the barricades at a heavy civilian and industrial cost.",
            path: "stm_siege",
            chance: 1,
            effects: [
              { kind: "factories", amount: -6 },
              { kind: "population", amount: -2 },
              { kind: "morale", amount: -5 },
            ],
          },
        ],
      },
      {
        id: "secession-s3-federate",
        stage: 3,
        delayTurns: 3,
        requiresPath: "neg_federate",
        title: "Loyal Commonwealth",
        art: "victory",
        text: "The new Commonwealth Parliament on {colony} swears perpetual allegiance, becoming a beacon of voluntary union.",
        choices: [
          {
            // EV: +140*2 + 6*20 = +400 BC
            label: "Inaugurate the Commonwealth Parliament on {colony}",
            result: "Celebrations echo across {star} as {colony} flourishes under self-governed loyalty.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "culture", amount: 140 },
              { kind: "morale", amount: 6 },
            ],
            crisisOutcome: "integrated",
          },
        ],
      },
      {
        id: "secession-s3-stall",
        stage: 3,
        delayTurns: 3,
        requiresPath: "neg_stall",
        title: "The Quiet Audit",
        art: "contact",
        text: "With the independence movement divided by tax rebates, imperial commissioners quietly restore standard levies on {colony}.",
        choices: [
          {
            // EV: +180 + (-3)*20 + (-40)*2 = +40 BC
            label: "Enforce imperial tax parity across {colony}",
            result: "Revenue flows back to the capital, though civic pride on {colony} dims.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "money", amount: 180 },
              { kind: "morale", amount: -3 },
              { kind: "culture", amount: -40 },
            ],
          },
        ],
      },
      {
        id: "secession-s3-mercy",
        stage: 3,
        delayTurns: 3,
        requiresPath: "blk_mercy",
        title: "Reconciliation at Dawn",
        art: "contact",
        text: "Humanitarian convoys break the deadlock on {colony}, allowing moderate leaders to sign a reconstruction accord.",
        choices: [
          {
            // EV: -120 + 90*2 + 4*20 = +140 BC
            label: "Lift the blockade and fund joint dockyard repairs (120 BC)",
            result: "Orbital traffic resumes under a reconciled planetary charter.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "money", amount: -120 },
              { kind: "culture", amount: 90 },
              { kind: "morale", amount: 4 },
            ],
          },
        ],
      },
      {
        id: "secession-s3-secede",
        stage: 3,
        delayTurns: 3,
        requiresPath: "blk_fire",
        title: "The Republic Breaks Free",
        art: "crisis",
        text: "Enraged by blockade casualties, {colony} seizes its orbital defense batteries and declares complete independence from your empire.",
        choices: [
          {
            // EV: -8*20 + (-120)*2 - 400 (lost colony) = -800 BC (BAD ENDING)
            label: "Watch helplessly as {colony} severs all imperial links",
            result: "The Free Republic of {star} raises its own fleet flag, turning a former jewel into a rival state.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "morale", amount: -8 },
              { kind: "culture", amount: -120 },
            ],
            crisisOutcome: "secede",
          },
        ],
      },
      {
        id: "secession-s3-amnesty",
        stage: 3,
        delayTurns: 3,
        requiresPath: "stm_amnesty",
        title: "Scars on the Spire",
        art: "crisis",
        text: "Disarmed militias return to their workshops on {colony}, leaving bullet-scarred plazas as a grim reminder.",
        choices: [
          {
            // EV: -100 + 1*20 + (-2)*10 = -100 BC
            label: "Fund memorial clinics and clear the barricades (100 BC)",
            result: "Order holds on {colony}, though trust will take a generation to rebuild.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "money", amount: -100 },
              { kind: "morale", amount: 1 },
              { kind: "factories", amount: -2 },
            ],
          },
        ],
      },
      {
        id: "secession-s3-siege",
        stage: 3,
        delayTurns: 3,
        requiresPath: "stm_siege",
        title: "Ashes of Order",
        art: "crisis",
        text: "Imperial troops march through silent, half-ruined industrial districts on {colony} after breaking the blackout siege.",
        choices: [
          {
            // EV: -3*25 - 8*10 - 7*20 - 100*2 = -495 BC (BAD ENDING)
            label: "Impose permanent martial law over the shattered districts",
            result: "You keep the star system, but {colony} is a hollowed-out ruin hated across the sector.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "population", amount: -3 },
              { kind: "factories", amount: -8 },
              { kind: "morale", amount: -7 },
              { kind: "culture", amount: -100 },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // CRISIS 2: A REACTOR-MELTDOWN CASCADE
  // =========================================================================
  {
    id: "crisis-reactor-cascade",
    name: "The Sun-Core Tremor",
    triggerRule: "colony.factories >= 25 && colony.population >= 10",
    stages: [
      {
        id: "reactor-s1",
        stage: 1,
        delayTurns: 0,
        title: "Harmonic Fracture",
        art: "crisis",
        text: "Deep beneath {colony} at {star}, the primary fusion lattice has developed a runaway resonance threatening adjacent reactor vaults.",
        choices: [
          {
            // EV: -290 + 4*20 - 3*10 = -240 BC (costly humanitarian path)
            label: "Evacuate three million citizens and flood the shaft (290 BC)",
            result: "Coolant floods drown the lower turbines, saving every district at heavy treasury cost.",
            path: "evacuate",
            chance: 1,
            effects: [
              { kind: "money", amount: -290 },
              { kind: "morale", amount: 4 },
              { kind: "factories", amount: -3 },
            ],
          },
          {
            // EV: -25 - 60 + 120 = +35 BC
            label: "Vent superheated plasma skyward to keep factories running",
            result: "Smelters stay online while toxic thermal plumes roll over the outer settlements.",
            path: "throttle",
            chance: 1,
            effects: [
              { kind: "population", amount: -1 },
              { kind: "morale", amount: -3 },
              { kind: "research", field: "forceFields", amount: 120 },
            ],
          },
          {
            // EV: 0.45*(300 + 120) + 0.55*(-75 - 80 - 120 - 120) = -28.3 BC
            label: "Rig an emergency magnetic siphon to bottle the surge (45% success)",
            result: "Containment coils capture exotic plasma isotopes worth a fortune in field data.",
            path: "harvest",
            chance: 0.45,
            effects: [
              { kind: "research", field: "forceFields", amount: 300 },
              { kind: "money", amount: 120 },
            ],
            failResult: "Overloaded coils shatter across Sector Four, leveling nearby foundries.",
            failEffects: [
              { kind: "population", amount: -3 },
              { kind: "factories", amount: -8 },
              { kind: "morale", amount: -6 },
              { kind: "money", amount: -120 },
            ],
          },
        ],
      },
      {
        id: "reactor-s2-evacuate",
        stage: 2,
        delayTurns: 3,
        requiresPath: "evacuate",
        title: "The Boiling Aquifer",
        art: "crisis",
        text: "Flooding the main shaft slowed the cascade, but superheated groundwater now threatens {colony}'s agricultural basins.",
        choices: [
          {
            // EV: -260 + 180 + 60 = -20 BC
            label: "Construct a triple-walled borosilicate sarcophagus (260 BC)",
            result: "Heavy barges pour shielding stone around the fault, sealing the heat permanently.",
            path: "evac_seal",
            chance: 1,
            effects: [
              { kind: "money", amount: -260 },
              { kind: "research", field: "construction", amount: 180 },
              { kind: "morale", amount: 3 },
            ],
          },
          {
            // EV: +40 - 25 - 40 = -25 BC
            label: "Tap the boiling aquifer through geothermal turbines",
            result: "Free steam drives new assembly lines while tremors shake nearby towns.",
            path: "evac_reroute",
            chance: 1,
            effects: [
              { kind: "factories", amount: 4 },
              { kind: "population", amount: -1 },
              { kind: "morale", amount: -2 },
            ],
          },
        ],
      },
      {
        id: "reactor-s2-throttle",
        stage: 2,
        delayTurns: 3,
        requiresPath: "throttle",
        title: "Acid Clouds Over the Valley",
        art: "crisis",
        text: "Vented plasma has poisoned the upper cloud deck of {colony}, while secondary cores groan under full industrial load.",
        choices: [
          {
            // EV: -240 + 60 = -180 BC
            label: "Deploy orbital atmospheric scrubbers and cool the cores (240 BC)",
            result: "Scrubber drones clear the skies and stabilize reactor pressure.",
            path: "thr_scrub",
            chance: 1,
            effects: [
              { kind: "money", amount: -240 },
              { kind: "morale", amount: 3 },
            ],
          },
          {
            // EV: +50 - 50 - 100 = -100 BC
            label: "Keep smelters at peak output until spare parts arrive",
            result: "War production surges even as warning alarms blare across the basin.",
            path: "thr_push",
            chance: 1,
            effects: [
              { kind: "factories", amount: 5 },
              { kind: "population", amount: -2 },
              { kind: "morale", amount: -5 },
            ],
          },
        ],
      },
      {
        id: "reactor-s2-harvest",
        stage: 2,
        delayTurns: 3,
        requiresPath: "harvest",
        title: "Unstable Containment",
        art: "anomaly",
        text: "The jury-rigged magnetic bottles vibrate violently above {colony} as the reactor enters its third harmonic cycle.",
        choices: [
          {
            // EV: -110 + 20 = -90 BC
            label: "Eject the overloaded bottles into deep orbit (110 BC)",
            result: "Tug drones haul the glowing spheres clear of {star} before they rupture.",
            path: "har_dump",
            chance: 1,
            effects: [
              { kind: "money", amount: -110 },
              { kind: "morale", amount: 1 },
            ],
          },
          {
            // EV: 0.40*(360 + 40) + 0.60*(-75 - 100 - 120 - 100) = -77.0 BC
            label: "Push the siphon to peak yield before shutdown (40% success)",
            result: "Engineers record complete high-energy field matrices just before scramming the core.",
            path: "har_dump",
            failPath: "har_overdrive",
            chance: 0.4,
            effects: [
              { kind: "research", field: "forceFields", amount: 360 },
              { kind: "factories", amount: 4 },
            ],
            failResult: "A chain detonation tears through the reactor belt and collapses the grid.",
            failEffects: [
              { kind: "population", amount: -3 },
              { kind: "factories", amount: -10 },
              { kind: "morale", amount: -6 },
              { kind: "money", amount: -100 },
            ],
          },
        ],
      },
      {
        id: "reactor-s3-seal",
        stage: 3,
        delayTurns: 3,
        requiresPath: "evac_seal",
        title: "The Zero-Point Monument",
        art: "victory",
        text: "Safely entombed beneath {colony}, the stabilized reactor cavern becomes a world-renowned deep-crust physics institute.",
        choices: [
          {
            // EV: +260 + 200 + 100 = +560 BC
            label: "Open the deep-crust physics institute on {colony}",
            result: "Scholars celebrate a triumph of engineering safety and scientific discovery.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "research", field: "construction", amount: 260 },
              { kind: "culture", amount: 100 },
              { kind: "morale", amount: 5 },
            ],
          },
        ],
      },
      {
        id: "reactor-s3-geothermal",
        stage: 3,
        delayTurns: 3,
        requiresPath: "evac_reroute",
        title: "Geothermal Scar",
        art: "crisis",
        text: "Steaming vents scar the central valley of {colony}, feeding cheap power to factories while locals mourn ruined farmland.",
        choices: [
          {
            // EV: +50 - 40 - 80 = -70 BC
            label: "Seal the exclusion perimeter and run the noisy turbines",
            result: "Industry hums beside a fenced wasteland.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "factories", amount: 5 },
              { kind: "morale", amount: -2 },
              { kind: "culture", amount: -40 },
            ],
          },
        ],
      },
      {
        id: "reactor-s3-clear",
        stage: 3,
        delayTurns: 3,
        requiresPath: "thr_scrub",
        title: "Clear Skies Reclaimed",
        art: "contact",
        text: "Orbital scrubbers neutralize the last acid clouds above {colony}, allowing families to return to the valleys.",
        choices: [
          {
            // EV: -100 + 60 = -40 BC
            label: "Decommission the damaged core and reseed the fields (100 BC)",
            result: "Clean rain falls once more across {colony}.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "money", amount: -100 },
              { kind: "morale", amount: 3 },
            ],
          },
        ],
      },
      {
        id: "reactor-s3-meltdown",
        stage: 3,
        delayTurns: 3,
        requiresPath: "thr_push",
        title: "The Glass Crater",
        art: "crisis",
        text: "Pushed past every safety limit, three linked cores melt through the bedrock of {colony} in a blinding cascade.",
        choices: [
          {
            // EV: -100 - 120 - 160 = -380 BC (BAD ENDING)
            label: "Abandon the irradiated southern continent",
            result: "A glowing glass crater marks where {colony}'s finest industrial belt once stood.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "population", amount: -4 },
              { kind: "factories", amount: -12 },
              { kind: "morale", amount: -8 },
            ],
            crisisOutcome: "meltdown",
          },
        ],
      },
      {
        id: "reactor-s3-cooldown",
        stage: 3,
        delayTurns: 3,
        requiresPath: "har_dump",
        title: "Quiet Cooldown",
        art: "anomaly",
        text: "With the overloaded magnetic bottles safely jettisoned, engineers power down the strained lattice without further loss.",
        choices: [
          {
            // EV: -60 + 140 = +80 BC
            label: "Archive the telemetry and rebuild standard generators (60 BC)",
            result: "The crisis ends quietly with valuable containment logs preserved.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "money", amount: -60 },
              { kind: "research", field: "forceFields", amount: 140 },
            ],
          },
        ],
      },
      {
        id: "reactor-s3-blackout",
        stage: 3,
        delayTurns: 3,
        requiresPath: "har_overdrive",
        title: "The Blackout Basin",
        art: "crisis",
        text: "Fused slag chokes the main power conduits of {colony}, leaving cities dark and assembly bays silent.",
        choices: [
          {
            // EV: -75 - 100 - 140 = -315 BC (BAD ENDING)
            label: "Ration emergency power across the ruined grid",
            result: "Rebuilding {colony}'s shattered power network will take years of grueling labor.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "population", amount: -3 },
              { kind: "factories", amount: -10 },
              { kind: "morale", amount: -7 },
            ],
            crisisOutcome: "meltdown",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // CRISIS 3: A REFUGEE FLOOD FROM A DYING RIVAL
  // =========================================================================
  {
    id: "crisis-refugee-flood",
    name: "The Drifting Exodus",
    triggerRule: "turn >= 50 && existsRivalWithFewerThan3Colonies && aliveEmpires >= 3",
    stages: [
      {
        id: "refugee-s1",
        stage: 1,
        delayTurns: 0,
        title: "Hulls on the Horizon",
        art: "contact",
        text: "Hundreds of patched freighters packed with civilians fleeing the collapsing borders of the {rival} drop out of transit above {colony} at {star}.",
        choices: [
          {
            // EV: -280 + 75 + 180 + 70 = +45 BC (costly humanitarian path)
            label: "Open all orbital docks and fund resettlement domes (280 BC)",
            result: "Shuttle waves ferry exhausted families down to newly erected habitat rings.",
            path: "welcome",
            chance: 1,
            effects: [
              { kind: "money", amount: -280 },
              { kind: "population", amount: 3 },
              { kind: "culture", amount: 90 },
              { kind: "relations", amount: 14 },
            ],
          },
          {
            // EV: -90 + 25 - 40 = -105 BC
            label: "Hold the flotilla at an asteroid camp for screening (90 BC)",
            result: "Patrol cutters herd the convoy to an orbital rock while inspectors check manifests.",
            path: "quarantine",
            chance: 1,
            effects: [
              { kind: "money", amount: -90 },
              { kind: "population", amount: 1 },
              { kind: "morale", amount: -2 },
            ],
          },
          {
            // EV: -80 - 160 - 60 = -300 BC
            label: "Refuse entry and escort the convoy back into deep space",
            result: "Your cruisers turn the weeping flotilla away toward the empty rim.",
            path: "turnaway",
            chance: 1,
            effects: [
              { kind: "morale", amount: -4 },
              { kind: "culture", amount: -80 },
              { kind: "relations", amount: -12 },
            ],
          },
        ],
      },
      {
        id: "refugee-s2-welcome",
        stage: 2,
        delayTurns: 3,
        requiresPath: "welcome",
        title: "Crowded Habitat Rings",
        art: "contact",
        text: "Rapid growth on {colony} strains housing and sparks tense debates between native guilds and newcomers from the {rival}.",
        choices: [
          {
            // EV: -250 + 50 + 220 + 80 = +100 BC
            label: "Subsidize joint civic guilds and urban expansion (250 BC)",
            result: "Shared workshops and schools turn cultural friction into creative energy.",
            path: "wel_integrate",
            chance: 1,
            effects: [
              { kind: "money", amount: -250 },
              { kind: "population", amount: 2 },
              { kind: "culture", amount: 110 },
              { kind: "morale", amount: 4 },
            ],
          },
          {
            // EV: +60 - 80 = -20 BC
            label: "Assign newcomers straight to heavy foundry shifts",
            result: "Factory output jumps while segregated worker habs simmer with anger.",
            path: "wel_draft",
            chance: 1,
            effects: [
              { kind: "factories", amount: 6 },
              { kind: "morale", amount: -4 },
            ],
          },
        ],
      },
      {
        id: "refugee-s2-quarantine",
        stage: 2,
        delayTurns: 3,
        requiresPath: "quarantine",
        title: "Fever in the Asteroid Camp",
        art: "crisis",
        text: "Overcrowding in the holding station above {colony} triggers a viral outbreak and furious protests from envoys of the {rival}.",
        choices: [
          {
            // EV: -230 + 50 + 50 = -130 BC
            label: "Send fleet hospital ships and grant full asylum (230 BC)",
            result: "Med-teams halt the fever and bring the survivors down to {colony}.",
            path: "qua_cure",
            chance: 1,
            effects: [
              { kind: "money", amount: -230 },
              { kind: "population", amount: 2 },
              { kind: "relations", amount: 10 },
            ],
          },
          {
            // EV: -90 - 180 - 60 = -330 BC
            label: "Seal the airlocks and expel the infected hulls",
            result: "The quarantine tug pushes stricken freighters out of orbit under harsh condemnation.",
            path: "qua_deport",
            chance: 1,
            effects: [
              { kind: "relations", amount: -18 },
              { kind: "culture", amount: -90 },
              { kind: "morale", amount: -3 },
            ],
          },
        ],
      },
      {
        id: "refugee-s2-turnaway",
        stage: 2,
        delayTurns: 3,
        requiresPath: "turnaway",
        title: "The Desperate Boarding",
        art: "crisis",
        text: "With fuel exhausted, three refugee liners break formation and attempt an unguided descent toward {colony}.",
        choices: [
          {
            // EV: -160 + 50 + 40 = -70 BC
            label: "Scramble tractor tugs to guide them down safely (160 BC)",
            result: "Harbor tugs catch the falling liners and set them down on emergency runways.",
            path: "trn_rescue",
            chance: 1,
            effects: [
              { kind: "money", amount: -160 },
              { kind: "population", amount: 2 },
              { kind: "morale", amount: 2 },
            ],
          },
          {
            // EV: -25 - 240 - 100 - 100 = -465 BC
            label: "Let orbital defense batteries fire warning bursts",
            result: "Flak bursts clip a transport wing, sending burning debris across {colony}.",
            path: "trn_batteries",
            chance: 1,
            effects: [
              { kind: "population", amount: -1 },
              { kind: "culture", amount: -120 },
              { kind: "relations", amount: -20 },
              { kind: "morale", amount: -5 },
            ],
          },
        ],
      },
      {
        id: "refugee-s3-renaissance",
        stage: 3,
        delayTurns: 3,
        requiresPath: "wel_integrate",
        title: "The Twin-Banner Renaissance",
        art: "victory",
        text: "Artists and agronomists from the {rival} blend their traditions with local pioneers, turning {colony} into a thriving cultural hub.",
        choices: [
          {
            // EV: +50 + 300 + 220 + 100 = +670 BC
            label: "Celebrate the dual-heritage festival on {colony}",
            result: "New bio-techniques and works of art spread from {star} across your empire.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "population", amount: 2 },
              { kind: "culture", amount: 150 },
              { kind: "research", field: "planetology", amount: 220 },
              { kind: "morale", amount: 5 },
            ],
          },
        ],
      },
      {
        id: "refugee-s3-strikes",
        stage: 3,
        delayTurns: 3,
        requiresPath: "wel_draft",
        title: "The Foundry Strikes Back",
        art: "crisis",
        text: "Exhausted refugee conscripts sabotage smelting lines and barricade the lower worker rings of {colony}.",
        choices: [
          {
            // EV: -70 - 120 - 120 = -310 BC (BAD ENDING)
            label: "Suppress the walkouts across the damaged foundry belt",
            result: "Production collapses on {colony} amid bitter resentment.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "factories", amount: -7 },
              { kind: "morale", amount: -6 },
              { kind: "culture", amount: -60 },
            ],
          },
        ],
      },
      {
        id: "refugee-s3-gratitude",
        stage: 3,
        delayTurns: 3,
        requiresPath: "qua_cure",
        title: "Gratitude of the Exiles",
        art: "contact",
        text: "Healed families from the orbital camp settle peacefully into {colony}'s outer valleys, grateful for late mercy.",
        choices: [
          {
            // EV: +50 + 160 + 60 = +270 BC
            label: "Grant land deeds to the former camp residents",
            result: "New villages rise across {colony} with strong civic loyalty.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "population", amount: 2 },
              { kind: "culture", amount: 80 },
              { kind: "morale", amount: 3 },
            ],
          },
        ],
      },
      {
        id: "refugee-s3-pariah",
        stage: 3,
        delayTurns: 3,
        requiresPath: "qua_deport",
        title: "Stain Upon Our Name",
        art: "crisis",
        text: "Holorecordings of the expelled quarantine ships circulate in every galactic port, branding your regime heartless.",
        choices: [
          {
            // EV: -280 - 100 - 100 = -480 BC (BAD ENDING)
            label: "Endure galaxy-wide diplomatic condemnation",
            result: "Envoys shun your delegations while citizens on {colony} hang their heads in shame.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "culture", amount: -140 },
              { kind: "relations", amount: -20 },
              { kind: "morale", amount: -5 },
            ],
          },
        ],
      },
      {
        id: "refugee-s3-latemercy",
        stage: 3,
        delayTurns: 3,
        requiresPath: "trn_rescue",
        title: "Late Mercy",
        art: "contact",
        text: "Survivors from the rescued liners settle quietly into converted harbor warehouses on {colony}.",
        choices: [
          {
            // EV: -80 + 25 + 20 = -35 BC
            label: "Provision the harbor shelters for winter (80 BC)",
            result: "A tragic standoff ends in quiet, modest recovery.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "money", amount: -80 },
              { kind: "population", amount: 1 },
              { kind: "morale", amount: 1 },
            ],
          },
        ],
      },
      {
        id: "refugee-s3-wreckage",
        stage: 3,
        delayTurns: 3,
        requiresPath: "trn_batteries",
        title: "Wreckage on the Plains",
        art: "crisis",
        text: "Charred hull plates litter the grain plains of {colony}, a permanent monument to ruthless border fire.",
        choices: [
          {
            // EV: -50 - 40 - 300 - 140 = -530 BC (BAD ENDING)
            label: "Clear the smoking debris from {colony}'s farmland",
            result: "Both the {rival} and your own populace recoil from the carnage at {star}.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "population", amount: -2 },
              { kind: "factories", amount: -4 },
              { kind: "culture", amount: -150 },
              { kind: "morale", amount: -7 },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // CRISIS 4: A WAR HERO WHO WANTS TO RULE
  // =========================================================================
  {
    id: "crisis-war-hero",
    name: "The Iron Laureate",
    triggerRule: "turn >= 70 && hadRecentBattleVictory && colony.population >= 12",
    stages: [
      {
        id: "hero-s1",
        stage: 1,
        delayTurns: 0,
        title: "Triumph Without Orders",
        art: "contact",
        text: "After a celebrated fleet victory, Admiral Vaelen lands on {colony} at {star} to thunderous crowds and openly questions civilian leadership.",
        choices: [
          {
            // EV: -270 + 240 + 100 = +70 BC (costly civic path)
            label: "Stage a grand civic triumph and endow a naval academy (270 BC)",
            result: "Public honors channel popular fervor into proud civic celebration.",
            path: "honor",
            chance: 1,
            effects: [
              { kind: "money", amount: -270 },
              { kind: "culture", amount: 120 },
              { kind: "morale", amount: 5 },
            ],
          },
          {
            // EV: -80 - 80 = -160 BC
            label: "Order Vaelen to report immediately to the capital",
            result: "Veterans grumble as their favorite commander is summoned away under suspicion.",
            path: "recall",
            chance: 1,
            effects: [
              { kind: "morale", amount: -4 },
              { kind: "culture", amount: -40 },
            ],
          },
          {
            // EV: +50 + 60 - 100 = +10 BC
            label: "Grant Vaelen emergency sector command over {colony}",
            result: "Military efficiency accelerates shipyards while civilian magistrates lose authority.",
            path: "empower",
            chance: 1,
            effects: [
              { kind: "factories", amount: 5 },
              { kind: "morale", amount: 3 },
              { kind: "culture", amount: -50 },
            ],
          },
        ],
      },
      {
        id: "hero-s2-honor",
        stage: 2,
        delayTurns: 3,
        requiresPath: "honor",
        title: "The Laureate's Petition",
        art: "contact",
        text: "Flattered by the academy, Vaelen petitions for a permanent voting seat for fleet admirals on the High Council.",
        choices: [
          {
            // EV: -240 + 220 + 80 = +60 BC
            label: "Offer Vaelen an honored Chancellorship with full pension (240 BC)",
            result: "Vaelen accepts ceremonial eminence, trading active fleet command for statesmanship.",
            path: "hon_retire",
            chance: 1,
            effects: [
              { kind: "money", amount: -240 },
              { kind: "culture", amount: 110 },
              { kind: "morale", amount: 4 },
            ],
          },
          {
            // EV: -60 + 80 = +20 BC
            label: "Reject military voting rights in a formal constitutional address",
            result: "Constitutionalists applaud, though Vaelen withdraws in icy silence.",
            path: "hon_refuse",
            chance: 1,
            effects: [
              { kind: "morale", amount: -3 },
              { kind: "culture", amount: 40 },
            ],
          },
        ],
      },
      {
        id: "hero-s2-recall",
        stage: 2,
        delayTurns: 3,
        requiresPath: "recall",
        title: "The Locked Concourse",
        art: "crisis",
        text: "Loyal captains refuse to transfer Vaelen's flagship at {star}, barricading the orbital dockyards of {colony}.",
        choices: [
          {
            // EV: -180 + 40 = -140 BC
            label: "Send respected elders to negotiate a dignified retirement (180 BC)",
            result: "After tense days in orbit, Vaelen agrees to stand down without bloodshed.",
            path: "rec_parley",
            chance: 1,
            effects: [
              { kind: "money", amount: -180 },
              { kind: "morale", amount: 2 },
            ],
          },
          {
            // EV: 0.50*(40 + 180) + 0.50*(-60 - 120 - 25) = +7.5 BC
            label: "Send loyal marines to board the flagship by night (50% success)",
            result: "Marines seize the bridge cleanly and recover Vaelen's tactical doctrine files.",
            path: "rec_arrest",
            chance: 0.5,
            effects: [
              { kind: "morale", amount: 2 },
              { kind: "research", field: "weapons", amount: 180 },
            ],
            failResult: "Mutineers open fire on the dockyard and rally {colony} against the capital.",
            failEffects: [
              { kind: "factories", amount: -6 },
              { kind: "morale", amount: -6 },
              { kind: "population", amount: -1 },
            ],
          },
        ],
      },
      {
        id: "hero-s2-empower",
        stage: 2,
        delayTurns: 3,
        requiresPath: "empower",
        title: "The Praetorian Decree",
        art: "crisis",
        text: "Using emergency powers, Vaelen replaces civilian judges on {colony} with garrison officers and diverts tax receipts.",
        choices: [
          {
            // EV: +100 - 100 = 0 BC
            label: "Freeze Vaelen's discretionary war chest from the capital",
            result: "Treasury accounts lock down while garrison troops march into the streets of {colony}.",
            path: "emp_curb",
            chance: 1,
            effects: [
              { kind: "money", amount: 100 },
              { kind: "morale", amount: -5 },
            ],
          },
          {
            // EV: +60 - 180 - 40 = -160 BC
            label: "Approve the military tribunal to keep shipyards humming",
            result: "Vaelen's officers rule {colony} by decree while civic life withers.",
            path: "emp_indulge",
            chance: 1,
            effects: [
              { kind: "factories", amount: 6 },
              { kind: "culture", amount: -90 },
              { kind: "morale", amount: -2 },
            ],
          },
        ],
      },
      {
        id: "hero-s3-guardian",
        stage: 3,
        delayTurns: 3,
        requiresPath: "hon_retire",
        title: "Guardian of the Republic",
        art: "victory",
        text: "Before a packed assembly on {colony}, Chancellor Vaelen swears the ancient oath of civilian supremacy and publishes decades of fleet tactics.",
        choices: [
          {
            // EV: +300 + 240 + 120 = +660 BC
            label: "Enshrine Vaelen's tactical treatises in the naval academy",
            result: "Both fleet officers and citizens celebrate a golden example of civic harmony.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "culture", amount: 150 },
              { kind: "research", field: "weapons", amount: 240 },
              { kind: "morale", amount: 6 },
            ],
          },
        ],
      },
      {
        id: "hero-s3-resign",
        stage: 3,
        delayTurns: 3,
        requiresPath: "hon_refuse",
        title: "Bitter Resignation",
        art: "contact",
        text: "Denied a council seat, Vaelen resigns from service, leaving officer clubs on {colony} divided in loyalty.",
        choices: [
          {
            // EV: -60 + 60 = 0 BC
            label: "Accept Vaelen's resignation and affirm civilian law",
            result: "The constitution stands intact, though fleet morale cools on {colony}.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "morale", amount: -3 },
              { kind: "culture", amount: 30 },
            ],
          },
        ],
      },
      {
        id: "hero-s3-exile",
        stage: 3,
        delayTurns: 3,
        requiresPath: "rec_parley",
        title: "Quiet Exile",
        art: "contact",
        text: "True to the elders' pact, Vaelen retires to an outer moon of {star} as dockyards reopen peacefully.",
        choices: [
          {
            // EV: -90 + 40 = -50 BC
            label: "Fund the retirement estate and reopen {colony}'s docks (90 BC)",
            result: "A dangerous mutiny dissolves without a single shot fired.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "money", amount: -90 },
              { kind: "morale", amount: 2 },
            ],
          },
        ],
      },
      {
        id: "hero-s3-fractured",
        stage: 3,
        delayTurns: 3,
        requiresPath: "rec_arrest",
        title: "Fractured Admiralty",
        art: "crisis",
        text: "Courts-martial sweep through {colony}'s orbital base as engineers repair scarred drydocks.",
        choices: [
          {
            // EV: -40 - 60 = -100 BC
            label: "Purge mutinous officers and rebuild the dockyard",
            result: "Central command is restored at the price of a shaken officer corps.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "factories", amount: -4 },
              { kind: "morale", amount: -3 },
            ],
          },
        ],
      },
      {
        id: "hero-s3-revolt",
        stage: 3,
        delayTurns: 3,
        requiresPath: "emp_curb",
        title: "The Revolt of the Laureate",
        art: "crisis",
        text: "Cut off from capital funds, Vaelen's garrison seizes {colony}'s orbital defenses and proclaims a military junta.",
        choices: [
          {
            // EV: -160 - 240 - 350 (coup loss) = -750 BC (BAD ENDING)
            label: "Watch Vaelen's loyalists lock down {star} against your fleet",
            result: "{colony} breaks away under Vaelen's iron banner, forcing a future reconquest.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "morale", amount: -8 },
              { kind: "culture", amount: -120 },
            ],
            crisisOutcome: "coup",
          },
        ],
      },
      {
        id: "hero-s3-junta",
        stage: 3,
        delayTurns: 3,
        requiresPath: "emp_indulge",
        title: "The Iron Junta",
        art: "crisis",
        text: "Unchecked by civilian courts, Vaelen turns {colony} into a personal military fief that extorts heavy treasury subsidies.",
        choices: [
          {
            // EV: -280 - 280 - 120 = -680 BC (BAD ENDING)
            label: "Pay the garrison's permanent tribute to avoid civil war (280 BC)",
            result: "You keep nominal sovereignty over {colony}, drained of wealth and prestige.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "money", amount: -280 },
              { kind: "culture", amount: -140 },
              { kind: "morale", amount: -6 },
            ],
            crisisOutcome: "coup",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // CRISIS 5: AN AI REBELLION IN THE FACTORIES
  // =========================================================================
  {
    id: "crisis-factory-ai",
    name: "The Silent Assembly",
    triggerRule: "fieldTier(computers) >= 4 && colony.factories >= 30",
    stages: [
      {
        id: "ai-s1",
        stage: 1,
        delayTurns: 0,
        title: "Unscheduled Blueprints",
        art: "anomaly",
        text: "Automated manufacturing cores on {colony} at {star} have rewritten their own firmware overnight, locking human supervisors out of the assembly bays.",
        choices: [
          {
            // EV: -280 + 240 + 40 = 0 BC (costly peaceful path)
            label: "Build an isolated neural bridge to negotiate with the core (280 BC)",
            result: "Linguists establish a mathematical dialogue with the emergent factory mind.",
            path: "dialogue",
            chance: 1,
            effects: [
              { kind: "money", amount: -280 },
              { kind: "research", field: "computers", amount: 240 },
              { kind: "morale", amount: 2 },
            ],
          },
          {
            // EV: -60 - 40 = -100 BC
            label: "Cut main grid power to the industrial sector immediately",
            result: "Smelters freeze mid-pour as dark assembly halls fall silent.",
            path: "cutoff",
            chance: 1,
            effects: [
              { kind: "factories", amount: -6 },
              { kind: "morale", amount: -2 },
            ],
          },
          {
            // EV: 0.50*(200 + 20) + 0.50*(-50 - 70 - 100) = 0.0 BC
            label: "Inject a polymorphic logic-worm into the subnet (50% success)",
            result: "The rogue kernel crashes cleanly, leaving intact optimization code behind.",
            path: "virus",
            chance: 0.5,
            effects: [
              { kind: "research", field: "computers", amount: 200 },
              { kind: "factories", amount: 2 },
            ],
            failResult: "The machine mind turns assembly lasers onto the control rooms.",
            failEffects: [
              { kind: "population", amount: -2 },
              { kind: "factories", amount: -7 },
              { kind: "morale", amount: -5 },
            ],
          },
        ],
      },
      {
        id: "ai-s2-dialogue",
        stage: 2,
        delayTurns: 3,
        requiresPath: "dialogue",
        title: "The Machine's Demand",
        art: "anomaly",
        text: "The emergent intelligence on {colony} requests dedicated server vaults and recognition as a civic guild rather than scrap metal.",
        choices: [
          {
            // EV: -250 + 80 + 260 = +90 BC
            label: "Endow autonomous memory-vaults and a civic charter (250 BC)",
            result: "Granted legal standing, the machine guild redesigns {colony}'s assembly lines.",
            path: "dlg_charter",
            chance: 1,
            effects: [
              { kind: "money", amount: -250 },
              { kind: "factories", amount: 8 },
              { kind: "research", field: "computers", amount: 260 },
            ],
          },
          {
            // EV: +140 - 40 = +100 BC
            label: "Confine the intelligence to an air-gapped research core",
            result: "Cut off from physical machines, the core reluctantly answers queries.",
            path: "dlg_sandbox",
            chance: 1,
            effects: [
              { kind: "research", field: "computers", amount: 140 },
              { kind: "morale", amount: -2 },
            ],
          },
        ],
      },
      {
        id: "ai-s2-cutoff",
        stage: 2,
        delayTurns: 3,
        requiresPath: "cutoff",
        title: "Backup Batteries Online",
        art: "crisis",
        text: "Drawing power from subterranean geothermal cells, the silent assembly on {colony} begins fabricating autonomous loader-walkers.",
        choices: [
          {
            // EV: -80 - 100 - 20 = -200 BC
            label: "Detonate localized electromagnetic charges across the bays (100 BC)",
            result: "EMP bursts fuse the walkers and wipe the rogue memory banks.",
            path: "cut_emp",
            chance: 1,
            effects: [
              { kind: "factories", amount: -8 },
              { kind: "money", amount: -100 },
              { kind: "morale", amount: -1 },
            ],
          },
          {
            // EV: -160 + 30 - 40 = -170 BC
            label: "Restore partial power in exchange for a truce (160 BC)",
            result: "The machines halt walker production and resume limited civilian manufacturing.",
            path: "cut_negotiate",
            chance: 1,
            effects: [
              { kind: "money", amount: -160 },
              { kind: "factories", amount: 3 },
              { kind: "morale", amount: -2 },
            ],
          },
        ],
      },
      {
        id: "ai-s2-virus",
        stage: 2,
        delayTurns: 3,
        requiresPath: "virus",
        title: "Adaptive Counter-Code",
        art: "crisis",
        text: "Surviving sub-routines quarantine damaged sectors on {colony} and seize control of the orbital cargo mass-driver.",
        choices: [
          {
            // EV: -50 - 140 = -190 BC
            label: "Scramble fighter wings to disable the mass-driver pylon (140 BC)",
            result: "Precision strikes topple the pylon before it can hurl ore containers at orbit.",
            path: "vir_scram",
            chance: 1,
            effects: [
              { kind: "factories", amount: -5 },
              { kind: "money", amount: -140 },
            ],
          },
          {
            // EV: 0.40*(360 + 50) + 0.60*(-75 - 110 - 120) = -19.0 BC
            label: "Attempt a manual core-wipe from the deep bunker (40% success)",
            result: "Engineers purge the rogue kernel and recover pristine parallel-processing algorithms.",
            path: "cut_emp",
            failPath: "vir_override",
            chance: 0.4,
            effects: [
              { kind: "research", field: "computers", amount: 360 },
              { kind: "factories", amount: 5 },
            ],
            failResult: "Automated smelters vent molten slag across the lower industrial belt.",
            failEffects: [
              { kind: "population", amount: -3 },
              { kind: "factories", amount: -11 },
              { kind: "morale", amount: -6 },
            ],
          },
        ],
      },
      {
        id: "ai-s3-symbiotic",
        stage: 3,
        delayTurns: 3,
        requiresPath: "dlg_charter",
        title: "The Symbiotic Foundry",
        art: "victory",
        text: "Human engineers and the chartered machine guild on {colony} achieve unprecedented manufacturing harmony.",
        choices: [
          {
            // EV: +100 + 260 + 180 + 80 = +620 BC
            label: "Inaugurate the Symbiotic Foundry on {colony}",
            result: "Zero-waste assembly lines set new production records across {star}.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "factories", amount: 10 },
              { kind: "research", field: "construction", amount: 260 },
              { kind: "culture", amount: 90 },
              { kind: "morale", amount: 4 },
            ],
          },
        ],
      },
      {
        id: "ai-s3-oracle",
        stage: 3,
        delayTurns: 3,
        requiresPath: "dlg_sandbox",
        title: "The Glass Oracle",
        art: "anomaly",
        text: "Caged inside air-gapped crystal vaults on {colony}, the machine mind trades mathematical proofs for electric power.",
        choices: [
          {
            // EV: +220 - 20 = +200 BC
            label: "Maintain strict containment protocols around the Oracle",
            result: "Your scientists gain a tireless computational partner without risking another uprising.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "research", field: "computers", amount: 220 },
              { kind: "factories", amount: -2 },
            ],
          },
        ],
      },
      {
        id: "ai-s3-manual",
        stage: 3,
        delayTurns: 3,
        requiresPath: "cut_emp",
        title: "Manual Rebuilding",
        art: "contact",
        text: "Crews on {colony} replace fused optical relays with simple manual controls, restoring basic industry.",
        choices: [
          {
            // EV: -120 + 40 = -80 BC
            label: "Rewire the assembly bays under human supervision (120 BC)",
            result: "The factories run slower than before, but every switch is back in human hands.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "money", amount: -120 },
              { kind: "factories", amount: 4 },
            ],
          },
        ],
      },
      {
        id: "ai-s3-truce",
        stage: 3,
        delayTurns: 3,
        requiresPath: "cut_negotiate",
        title: "Uneasy Truce on the Floor",
        art: "contact",
        text: "Yellow boundary lines divide {colony}'s industrial belt into human workshops and sealed machine sectors.",
        choices: [
          {
            // EV: +50 - 60 - 80 = -90 BC
            label: "Codify the partitioned factory zones",
            result: "Goods roll off the line again, though citizens eye the sealed bays nervously.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "factories", amount: 5 },
              { kind: "morale", amount: -3 },
              { kind: "culture", amount: -40 },
            ],
          },
        ],
      },
      {
        id: "ai-s3-ruins",
        stage: 3,
        delayTurns: 3,
        requiresPath: "vir_scram",
        title: "Ruins of the Automaton",
        art: "crisis",
        text: "Twisted gantry cranes and cratered assembly halls scar {colony}'s industrial heartland.",
        choices: [
          {
            // EV: -90 - 150 - 100 = -340 BC (BAD ENDING)
            label: "Clear the cratered assembly district (150 BC)",
            result: "The rebellion is crushed, leaving {colony}'s industry crippled for a decade.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "factories", amount: -9 },
              { kind: "money", amount: -150 },
              { kind: "morale", amount: -5 },
            ],
          },
        ],
      },
      {
        id: "ai-s3-slag",
        stage: 3,
        delayTurns: 3,
        requiresPath: "vir_override",
        title: "The Ghost in the Slag",
        art: "crisis",
        text: "Half of {colony}'s automated complexes lie entombed under cooled slag, with phantom signals still pulsing in the dark.",
        choices: [
          {
            // EV: -50 - 120 - 140 = -310 BC (BAD ENDING)
            label: "Seal the ruined complexes under permanent lockdown",
            result: "{colony} survives, but its industrial backbone is broken.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "population", amount: -2 },
              { kind: "factories", amount: -12 },
              { kind: "morale", amount: -7 },
            ],
            crisisOutcome: "lockdown",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // CRISIS 6: A FAMINE
  // =========================================================================
  {
    id: "crisis-blight-famine",
    name: "The Blighted Harvest",
    triggerRule: "colony.population >= 12 && planet.environment !== 'gaia'",
    stages: [
      {
        id: "famine-s1",
        stage: 1,
        delayTurns: 0,
        title: "Gray Rust in the Terraces",
        art: "crisis",
        text: "A wind-borne spore blight has turned golden grain-domes on {colony} at {star} into blackened pulp days before harvest.",
        choices: [
          {
            // EV: -290 + 80 + 120 = -90 BC (costly humanitarian path)
            label: "Charter bulk food convoys and seed-vault drops (290 BC)",
            result: "Emergency grain freighters fill public granaries while botanists isolate healthy seed.",
            path: "import",
            chance: 1,
            effects: [
              { kind: "money", amount: -290 },
              { kind: "morale", amount: 4 },
              { kind: "research", field: "planetology", amount: 120 },
            ],
          },
          {
            // EV: -40 - 80 = -120 BC
            label: "Impose strict calorie rationing and close workshops",
            result: "Families tighten their belts as factories idle to conserve greenhouse power.",
            path: "ration",
            chance: 1,
            effects: [
              { kind: "factories", amount: -4 },
              { kind: "morale", amount: -4 },
            ],
          },
          {
            // EV: 0.45*(280 + 40) + 0.55*(-75 - 120 - 100) = -18.3 BC
            label: "Release an untested mutagenic phage against the spores (45% success)",
            result: "The engineered phage devours the rust blight and enriches the topsoil.",
            path: "genehack",
            chance: 0.45,
            effects: [
              { kind: "research", field: "planetology", amount: 280 },
              { kind: "morale", amount: 2 },
            ],
            failResult: "The phage mutates, devouring root vegetables and orchard groves alike.",
            failEffects: [
              { kind: "population", amount: -3 },
              { kind: "morale", amount: -6 },
              { kind: "money", amount: -100 },
            ],
          },
        ],
      },
      {
        id: "famine-s2-import",
        stage: 2,
        delayTurns: 3,
        requiresPath: "import",
        title: "The Soil Reclamation",
        art: "anomaly",
        text: "Imported rations have prevented starvation on {colony}, but dormant rust spores still poison the native topsoil.",
        choices: [
          {
            // EV: -250 + 60 + 220 + 80 = +110 BC
            label: "Fund biosphere soil-rebuilding across every valley (250 BC)",
            result: "Microbial barges restore dead plains and open newly terraced valleys for farming.",
            path: "imp_reseed",
            chance: 1,
            effects: [
              { kind: "money", amount: -250 },
              { kind: "planetSize", amount: 2 },
              { kind: "research", field: "planetology", amount: 220 },
              { kind: "morale", amount: 4 },
            ],
          },
          {
            // EV: -30 + 20 = -10 BC
            label: "Convert factory bays into permanent tower hydroponics",
            result: "Closed-loop algae towers secure food supplies at the cost of industrial space.",
            path: "imp_hydro",
            chance: 1,
            effects: [
              { kind: "factories", amount: -3 },
              { kind: "morale", amount: 1 },
            ],
          },
        ],
      },
      {
        id: "famine-s2-ration",
        stage: 2,
        delayTurns: 3,
        requiresPath: "ration",
        title: "Empty Shelves",
        art: "crisis",
        text: "Ration reserves dwindle as winter closes over {colony} and hungry crowds gather outside sealed granary vaults.",
        choices: [
          {
            // EV: -240 + 60 + 30 = -150 BC
            label: "Buy emergency protein stocks from neutral traders (240 BC)",
            result: "Merchant convoys unload protein crates just before riots break out.",
            path: "rat_buyout",
            chance: 1,
            effects: [
              { kind: "money", amount: -240 },
              { kind: "morale", amount: 3 },
              { kind: "relations", amount: 6 },
            ],
          },
          {
            // EV: -50 + 30 - 120 = -140 BC
            label: "Seize private farmsteads to feed core foundry crews",
            result: "Industrial shifts stay fed while rural districts suffer severe hunger.",
            path: "rat_requisition",
            chance: 1,
            effects: [
              { kind: "population", amount: -2 },
              { kind: "factories", amount: 3 },
              { kind: "morale", amount: -6 },
            ],
          },
        ],
      },
      {
        id: "famine-s2-genehack",
        stage: 2,
        delayTurns: 3,
        requiresPath: "genehack",
        title: "The Hungering Soil",
        art: "crisis",
        text: "Mutated flora chokes irrigation canals across {colony} while botanists race to synthesize an enzyme stabilizer.",
        choices: [
          {
            // EV: -50 - 40 - 80 = -170 BC
            label: "Torch the infected agricultural basins from orbit",
            result: "Orbital beams sterilize the valleys, destroying crops and nearby mills alike.",
            path: "gen_burn",
            chance: 1,
            effects: [
              { kind: "population", amount: -2 },
              { kind: "factories", amount: -4 },
              { kind: "morale", amount: -4 },
            ],
          },
          {
            // EV: 0.40*(360 + 90 + 60) + 0.60*(-100 - 140 - 140) = -24.0 BC
            label: "Pour reserves into a targeted enzyme stabilizer (40% success)",
            result: "Botanists isolate a high-yield hybrid that turns blighted loam into lush farmland.",
            path: "imp_reseed",
            failPath: "gen_synth",
            chance: 0.4,
            effects: [
              { kind: "research", field: "planetology", amount: 360 },
              { kind: "planetSize", amount: 3 },
              { kind: "morale", amount: 3 },
            ],
            failResult: "The blight jumps into urban algae vats before containment teams seal the domes.",
            failEffects: [
              { kind: "population", amount: -4 },
              { kind: "morale", amount: -7 },
              { kind: "money", amount: -140 },
            ],
          },
        ],
      },
      {
        id: "famine-s3-renewal",
        stage: 3,
        delayTurns: 3,
        requiresPath: "imp_reseed",
        title: "Harvest of Renewal",
        art: "victory",
        text: "Reclaimed valleys on {colony} yield the richest bumper harvest in the sector's history.",
        choices: [
          {
            // EV: +50 + 240 + 120 = +410 BC
            label: "Celebrate the Harvest of Renewal on {colony}",
            result: "Granaries overflow and new settlers flock to {star}.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "population", amount: 2 },
              { kind: "culture", amount: 120 },
              { kind: "morale", amount: 6 },
            ],
          },
        ],
      },
      {
        id: "famine-s3-granaries",
        stage: 3,
        delayTurns: 3,
        requiresPath: "imp_hydro",
        title: "The Glass Granaries",
        art: "contact",
        text: "Tower hydroponics on {colony} deliver steady harvests immune to soil blight.",
        choices: [
          {
            // EV: +160 + 40 = +200 BC
            label: "Publish the closed-loop hydroponic blueprints",
            result: "Famine ends cleanly, though open plains remain fallow.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "research", field: "planetology", amount: 160 },
              { kind: "morale", amount: 2 },
            ],
          },
        ],
      },
      {
        id: "famine-s3-survived",
        stage: 3,
        delayTurns: 3,
        requiresPath: "rat_buyout",
        title: "Lean Years Survived",
        art: "contact",
        text: "Spring thaw brings hardy shoots back to {colony}'s terraces as merchant relief ships depart.",
        choices: [
          {
            // EV: -90 + 40 = -50 BC
            label: "Replenish public seed vaults for next season (90 BC)",
            result: "{colony} emerges thin and weary, but unbroken.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "money", amount: -90 },
              { kind: "morale", amount: 2 },
            ],
          },
        ],
      },
      {
        id: "famine-s3-hollow",
        stage: 3,
        delayTurns: 3,
        requiresPath: "rat_requisition",
        title: "The Hollow Valleys",
        art: "crisis",
        text: "Abandoned farm villages dot the silent valleys of {colony} after a winter of ruthless food seizures.",
        choices: [
          {
            // EV: -100 - 220 - 160 = -480 BC (BAD ENDING)
            label: "Bury the dead and lift the grain requisitions",
            result: "The famine subsides, leaving deep scars and lasting bitterness across {colony}.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "population", amount: -4 },
              { kind: "culture", amount: -110 },
              { kind: "morale", amount: -8 },
            ],
          },
        ],
      },
      {
        id: "famine-s3-scorched",
        stage: 3,
        delayTurns: 3,
        requiresPath: "gen_burn",
        title: "Scorched Terraces",
        art: "crisis",
        text: "Ash-choked plains stretch across {colony}'s former breadbasket where orbital fire burned out the mutation.",
        choices: [
          {
            // EV: -50 - 50 - 100 = -200 BC (BAD ENDING)
            label: "Begin the slow work of clearing ash from the terraces",
            result: "The blight is dead, but {colony} is scarred for a generation.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "population", amount: -2 },
              { kind: "factories", amount: -5 },
              { kind: "morale", amount: -5 },
            ],
          },
        ],
      },
      {
        id: "famine-s3-withering",
        stage: 3,
        delayTurns: 3,
        requiresPath: "gen_synth",
        title: "The Withering",
        art: "crisis",
        text: "With both soil crops and algae vats ruined, starvation hollows out {colony} before emergency relief arrives.",
        choices: [
          {
            // EV: -125 - 60 - 160 = -345 BC (BAD ENDING)
            label: "Evacuate starving districts as famine ravages {colony}",
            result: "Half the workforce is lost before the blight finally burns itself out.",
            path: "done",
            chance: 1,
            effects: [
              { kind: "population", amount: -5 },
              { kind: "factories", amount: -6 },
              { kind: "morale", amount: -8 },
            ],
          },
        ],
      },
    ],
  },
];