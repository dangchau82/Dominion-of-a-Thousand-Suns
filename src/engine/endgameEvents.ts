// Event texts for the endgame paths (written by Claude 2). Kept apart from endgame.ts so
// events.ts can load them without an import cycle.

import { PATH_NAMES, PATH_WORKS, RACE_WORKS, type EndgamePath } from "./data/greatWorks";
import type { GameEventDef } from "./data/events";

export const SABOTAGE_COST = 200;

export const PATH_OFFER_PREFIX = "endgame-path:";
export const CRACK_EVENT_ID = "endgame-crack";
export const WORK_SABOTAGE_ID = "endgame-sabotage";

function offerEvent(path: EndgamePath, pathScore: number): GameEventDef {
  const pw = PATH_WORKS.find((w) => w.path === path)!;
  const blurb: Record<EndgamePath, string> = {
    feared: "Our name is spoken with fear from one end of the galaxy to the other. Our admirals propose a weapon to match it.",
    beloved: "Friends stand with us across the galaxy, and our envoys are welcome everywhere. Our people dream of something to honour that.",
    builder: "Our worlds are many and our yards never sleep. Our engineers ask what we might build if we stopped thinking small.",
  };
  return {
    id: PATH_OFFER_PREFIX + path,
    title: `The Path of ${PATH_NAMES[path]}`,
    art: "council",
    trigger: "turn",
    text: `${blurb[path]} Two great works are proposed: the ${pw.name}, or our own people's great work, {work}. Either would be spoken of for a thousand years, and either would open the way to the Ascension Gate.`,
    choices: [
      { label: `Build the ${pw.name} (${pw.down} BC now, then ${pw.upkeep} BC a turn for ${pw.turns} turns)`, result: `Work begins on the ${pw.name}. The whole galaxy is watching.`, effects: [{ kind: "money", amount: -pw.down }, { kind: "culture", amount: pw.down + pathScore }] },
      { label: `Build {work} (${RACE_WORKS[0]!.down} BC now, then ${RACE_WORKS[0]!.upkeep} BC a turn for ${RACE_WORKS[0]!.turns} turns)`, result: "Our own people's great work begins. Every world sends its best.", effects: [{ kind: "money", amount: -RACE_WORKS[0]!.down }, { kind: "culture", amount: RACE_WORKS[0]!.down + 100 }] },
      { label: "Not yet", result: "The plans are filed away for a better day.", effects: [{ kind: "nothing" }] },
    ],
  };
}

export const ENDGAME_EVENTS: GameEventDef[] = [
  // AIs score these by money and culture: Feared and Beloved favour the path work, Builder the race work.
  offerEvent("feared", 120), offerEvent("beloved", 120), offerEvent("builder", 80),
  {
    id: CRACK_EVENT_ID,
    title: "The Sundering Engine Stands Ready",
    art: "crisis",
    trigger: "turn",
    text: "Our Sundering Engine hangs over {colony}, a world of {rival}. One word from us and the planet's crust will split.",
    choices: [
      { label: "Crack the world", result: "The beam fires for eleven seconds. {colony} is no longer a place where anyone lives.", effects: [{ kind: "nothing" }] },
      { label: "Spare it (for now)", result: "The Engine powers down. Its shadow stays over {colony}.", effects: [{ kind: "nothing" }] },
    ],
  },
  {
    id: WORK_SABOTAGE_ID,
    title: "Strike at Their Great Work?",
    art: "pirates",
    trigger: "turn",
    text: "{rival} is building {work}. Our agents could set it back years, and bring home its plans.",
    choices: [
      { label: `Sabotage it (${SABOTAGE_COST} BC)`, result: "Collapsed scaffolds, burned archives, missing engineers. Their great work is years behind.", effects: [{ kind: "money", amount: -SABOTAGE_COST }, { kind: "research", field: "construction", amount: 300 }] },
      { label: "Leave it alone", result: "Let them build. We will meet it when it is finished.", effects: [{ kind: "nothing" }] },
    ],
  },
];

