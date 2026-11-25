// Protected worlds: the elders forbid attacks on young peoples. Written by Gemini (2026-11-25), checked by Claude; rules built by Claude.
import type { GameEventDef } from "./events";

export interface DecreeStage {
  /** How many times the empire has broken the decree. */
  offences: 1 | 2 | 3;
  warning: GameEventDef;          // trigger "turn"; 2 choices (apologise and pay, or defy); may use {star}
  /** What the elders do, in plain words; Claude makes it a rule. Escalates each time. */
  punishment: string;             // under 30 words
}

export const DECREE: {
  name: string;                   // what the decree is called
  proclamation: string;           // the elders' announcement, under 50 words, their voice (see lateGameLore.ts)
  /** Which worlds qualify, in plain words (e.g. natives at stage 1-2, or new colonies under 10 population). */
  whoIsProtected: string;         // under 30 words
  stages: [DecreeStage, DecreeStage, DecreeStage];
  /** Reward for an empire that guards protected worlds for 50 turns. */
  guardianReward: GameEventDef;   // trigger "turn"; 2 choices
} = {
  name: "The Edict of Sheltered Cradles",
  proclamation:
    "Hear the chime, little flames. We measured your pulse from the cradle, and we forbid you from snuffing out sparks still sleeping. Nascent peoples and fragile colonies stand beneath our white-gold canopy. Strike them, and our architecture shall quiet your blades.",
  whoIsProtected:
    "Any unsettled world hosting stage 1 or 2 natives, and any newly founded colony with fewer than 10 population that has no missile bases.",
  stages: [
    {
      offences: 1,
      warning: {
        id: "first-chime-of-censure",
        title: "The First Chime of Censure",
        art: "council",
        trigger: "turn",
        text: "A gleaming telemetry mirror of the Gilded Lattice has appeared above {star}, broadcasting a calm rebuke: our strike against a sheltered world violated the Edict of Sheltered Cradles.",
        choices: [
          {
            label: "Issue a formal apology and pay restitution",
            result: "Our envoys remit reparations to the Lattice wardens, restoring good standing while citizens grumble at bowing to elders.",
            effects: [
              { kind: "money", amount: -150 },
              { kind: "morale", amount: -2 },
              { kind: "relations", amount: 6 },
            ],
          },
          {
            label: "Reject their meddling in our sovereign campaigns",
            result: "The telemetry mirror chimes once in sorrow and vanishes, imposing a customs sanction on our orbital ports.",
            effects: [
              { kind: "culture", amount: 60 },
              { kind: "relations", amount: -10 },
            ],
          },
        ],
      },
      punishment:
        "If defied, Lattice beacons levy a 15% tax on empire treasury income for 10 turns until the empire pays a 200 BC atonement fine.",
    },
    {
      offences: 2,
      warning: {
        id: "shadows-of-white-gold",
        title: "Shadows of White Gold",
        art: "crisis",
        trigger: "turn",
        text: "Towering white-gold spire-ships of the Gilded Lattice have entered high orbit over {star}. Their adjudicator speaks softly: 'Twice you have trampled a cradle, little flame. Temper your blades now.'",
        choices: [
          {
            label: "Stand down fleets and pay heavy reparations",
            result: "Steep indemnities and public disarmament pledges appease the adjudicators, though proud captains chafe at the humiliation.",
            effects: [
              { kind: "money", amount: -260 },
              { kind: "morale", amount: -5 },
              { kind: "culture", amount: -40 },
            ],
          },
          {
            label: "Refuse to halt our offensive",
            result: "Harmonic stasis beams lance down from orbit, locking our drydock gantries in silent golden fields.",
            effects: [
              { kind: "factories", amount: -5 },
              { kind: "relations", amount: -16 },
            ],
          },
        ],
      },
      punishment:
        "If defied, Lattice stasis projectors freeze all ship construction across every colony for 8 turns unless the empire pays 400 BC in reparations.",
    },
    {
      offences: 3,
      warning: {
        id: "custody-of-the-unruly",
        title: "Custody of the Unruly",
        art: "crisis",
        trigger: "turn",
        text: "An armada of interlocking white-gold cathedrals has materialized around {star}, surrounded by halos of focusing mirrors. The Lattice delivers its final verdict: 'You have chosen anarchy; now accept gentle custody.'",
        choices: [
          {
            label: "Sign the Act of Contrition and pay full indemnity",
            result: "We surrender heavy reparations and disband frontier militias, convincing the Lattice armada to withdraw to high orbit.",
            effects: [
              { kind: "money", amount: -300 },
              { kind: "culture", amount: -100 },
              { kind: "morale", amount: -6 },
            ],
          },
          {
            label: "Defy the elders and prepare for battle",
            result: "The white-gold cathedrals power up their solar lances, moving to enforce permanent pacification upon our worlds.",
            effects: [
              { kind: "morale", amount: 5 },
              { kind: "relations", amount: -20 },
            ],
          },
        ],
      },
      punishment:
        "If defied, an elder pacification fleet attacks the offending star and blockades colonies until defeated or until the empire pays 600 BC for peace.",
    },
  ],
  guardianReward: {
    id: "blessing-of-the-sheltered-cradles",
    title: "Blessing of the Sheltered Cradles",
    art: "contact",
    trigger: "turn",
    text: "After fifty years of honoring the Edict of Sheltered Cradles and defending young worlds from raiders, a silent white-gold envoy descends above {colony} to commend our restraint.",
    choices: [
      {
        label: "Request elder shield and sensor harmonics",
        result: "The envoy transmits pristine geometric theorems into our relays, elevating our defensive science and galactic renown.",
        effects: [
          { kind: "research", field: "forceFields", amount: 350 },
          { kind: "culture", amount: 120 },
          { kind: "relations", amount: 15 },
        ],
      },
      {
        label: "Accept golden-age patronage and deep-space charts",
        result: "Telemetry mirrors map untouched border stars while elders endow our civic academies with generous bullion.",
        effects: [
          { kind: "money", amount: 260 },
          { kind: "revealStars", count: 5 },
          { kind: "culture", amount: 140 },
        ],
      },
    ],
  },
};