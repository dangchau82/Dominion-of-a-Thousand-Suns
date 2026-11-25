// Ancient gates, staging and ambushes. Written by Gemini (hard pack 5, 2026-11-25), checked by Claude; rules built by Claude.
import type { ResearchField } from "../types";
import type { GameEventDef } from "./events";

export interface GateTypeDef {
  id: string;
  name: string;
  description: string;
  /** How many ships can come through per turn (5 to 60). */
  throughput: number;
  /** Turns to repair or awaken it after claiming (0 to 10). */
  awakenTurns: number;
  /** BC to awaken (0 to 2000). */
  awakenCost: number;
  /** Fleets waiting inside lose this share of hit points per turn (0 to 0.05): waiting is not free. */
  attritionPerTurn: number;
  /** How many of these appear on a medium map (1 to 4). */
  perMediumMap: number;
}

export const GATE_TYPES: GateTypeDef[] = [
  { id: "thread-relay", name: "Thread Relay", description: "A compact ancient transit ring with light capacity and fast activation.", throughput: 10, awakenTurns: 2, awakenCost: 400, attritionPerTurn: 0.015, perMediumMap: 4 },
  { id: "rift-arch", name: "Rift Arch", description: "A balanced star-gate handling steady squadrons after moderate restoration.", throughput: 25, awakenTurns: 5, awakenCost: 900, attritionPerTurn: 0.025, perMediumMap: 2 },
  { id: "sovereign-portal", name: "Sovereign Portal", description: "A colossal precursor gateway able to move entire armadas at once.", throughput: 60, awakenTurns: 9, awakenCost: 1800, attritionPerTurn: 0.04, perMediumMap: 1 },
];

export interface StanceDef {
  id: "ambush" | "decoy" | "staging";
  name: string;
  description: string;
  requires: [ResearchField, number];
  /** What it costs to keep up: BC per ship per turn (0 to 3). */
  upkeepPerShip: number;
  /** How a careful rival can see through it, in plain words (spies, scanners, old reports...). */
  counter: string;
}

export const STANCES: StanceDef[] = [
  { id: "ambush", name: "Ambush Stance", description: "Hold hidden in orbit until enemies arrive, then strike first for one free round.", requires: ["computers", 3], upkeepPerShip: 1, counter: "Deep-range scanners or infiltrated spies can spot power spikes before entry." },
  { id: "decoy", name: "Decoy Stance", description: "Mask colony defenses and ship counts so rival scouts read a softer target.", requires: ["forceFields", 2], upkeepPerShip: 1, counter: "Outdated scout reports or active spies reveal true garrison strength." },
  { id: "staging", name: "Staging Stance", description: "Stage ships inside the gate network out of sight until ready to emerge.", requires: ["propulsion", 3], upkeepPerShip: 2, counter: "Espionage on gate worlds and sensor watches near exit stars warn of buildup." },
];

/** News events about gates. trigger "turn"; may use {star} and {rival}. */
export const GATE_EVENTS: GameEventDef[] = [
  {
    id: "first-gate-discovered",
    title: "Precursor Ring in Orbit",
    art: "ruins",
    trigger: "turn",
    text: "Deep-space sweeps near {star} have located a dormant transit ring suspended in high orbit. With proper repairs, squadrons could fold across light-years in a single turn.",
    choices: [
      { label: "Chart nearby transit beacons", result: "Long-range sensors map neighboring systems that may hold linked gates.", effects: [{ kind: "revealStars", count: 4 }, { kind: "research", field: "propulsion", amount: 180 }] },
      { label: "Study the ring's relay harmonics", result: "Scholars and engineers publish findings on ancient transit rings.", effects: [{ kind: "culture", amount: 90 }, { kind: "money", amount: -70 }] },
    ],
  },
  {
    id: "gate-awakens",
    title: "Gateway Spools to Life",
    art: "anomaly",
    trigger: "turn",
    text: "Conduits along the ancient gate at {star} hum with renewed power as its aperture stabilizes. Fleets can now route across the network toward linked relays or portals.",
    choices: [
      { label: "Calibrate jump targeting cores", result: "Navigators tune transit locks for cleaner jumps out of the gate network.", effects: [{ kind: "research", field: "computers", amount: 220 }, { kind: "money", amount: -110 }] },
      { label: "Hold public transit celebrations", result: "Citizens celebrate fast cross-map reach, though festival logistics strain funds.", effects: [{ kind: "morale", amount: 4 }, { kind: "money", amount: -80 }] },
    ],
  },
  {
    id: "rival-armada-vanishes",
    title: "Armada Vanishes into the Gate",
    art: "crisis",
    trigger: "turn",
    text: "Border pickets near {star} report an armada of the {rival} slipping into a transit gate and dropping off every scanner. Where or when it emerges remains unknown.",
    choices: [
      { label: "Deploy extra picket patrols", result: "Escorts sweep likely exit systems at high alert to deter a hidden strike.", effects: [{ kind: "money", amount: -140 }, { kind: "morale", amount: 3 }] },
      { label: "Scan the gate's spatial wake", result: "Sensors gather field readings from the jump, leaving border patrols thin.", effects: [{ kind: "research", field: "forceFields", amount: 210 }, { kind: "morale", amount: -2 }] },
    ],
  },
  {
    id: "armada-bursts-out",
    title: "Armada Out of the Gate",
    art: "pirates",
    trigger: "turn",
    text: "A transit gate near {star} flares wide as an armada of the {rival} bursts into real space, catching nearby outposts off guard.",
    choices: [
      { label: "Sound the orbital defense alert", result: "Garrisons man batteries and hold the line, though hurried mobilization strains plant output.", effects: [{ kind: "morale", amount: 4 }, { kind: "factories", amount: -4 }] },
      { label: "Evacuate non-essential crews", result: "Support staff pull back from exposed yards, saving funds while losing some workers.", effects: [{ kind: "population", amount: -2 }, { kind: "money", amount: 130 }] },
    ],
  },
];
