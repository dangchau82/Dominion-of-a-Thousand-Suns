// Dig sites: ancient ruins excavated in three stages (written by Claude 2; Danny's list).
// Each kind of site has its own story. Every stage offers: dig deeper, take what we have and
// seal it, or sell the find. Digging deeper pays more but the last stage of some sites wakes
// something. Finds can include an artifact of common, rare, epic or legendary quality (an idea
// borrowed from loot tiers in online role-playing games; names and text are original).

import type { GameEventDef } from "./events";
import type { ResearchField } from "../types";

export type DigKind = "archive" | "vault" | "tomb" | "armory" | "seedbank";

export type ArtifactQuality = "common" | "rare" | "epic" | "legendary";
export const QUALITY_ORDER: ArtifactQuality[] = ["common", "rare", "epic", "legendary"];

export interface ArtifactDef {
  id: string;
  name: string;
  quality: ArtifactQuality;
  /** Per-turn bonus while the empire keeps it. */
  money?: number;
  research?: { field: ResearchField; amount: number };
  culture?: number;
  text: string;
}

export const ARTIFACTS: ArtifactDef[] = [
  { id: "a-star-chart", name: "Precursor Star Chart", quality: "common", research: { field: "propulsion", amount: 6 }, text: "Routes between stars nobody has flown in a million years." },
  { id: "a-coin-hoard", name: "Hoard of Old Coin", quality: "common", money: 8, text: "Collectors across the galaxy pay well for a single piece." },
  { id: "a-death-mask", name: "Gold Death Mask", quality: "common", culture: 2, text: "A face no living species has worn, displayed in our grandest museum." },
  { id: "a-thinking-stone", name: "Thinking Stone", quality: "rare", research: { field: "computers", amount: 14 }, text: "A crystal that solves problems while you sleep beside it." },
  { id: "a-forge-heart", name: "Forge Heart", quality: "rare", research: { field: "weapons", amount: 14 }, text: "A palm-sized reactor that never cools. Weapon smiths fight to work near it." },
  { id: "a-world-seed", name: "World Seed", quality: "rare", research: { field: "planetology", amount: 14 }, text: "Plant it, and a barren valley is green within a year." },
  { id: "a-merchant-seal", name: "Merchant Prince's Seal", quality: "rare", money: 12, text: "Any contract stamped with it is honoured on a thousand worlds." },
  { id: "a-kings-sceptre", name: "Sceptre of the First Kings", quality: "rare", culture: 3, text: "Pilgrims queue for days just to stand in the same room." },
  // Epic: rarer than rare, a step below the legends.
  { id: "a-oracle-engine", name: "Oracle Engine", quality: "epic", research: { field: "computers", amount: 18 }, money: 6, text: "Ask it a question and it answers next week, correctly, every time." },
  { id: "a-gilded-throne", name: "Gilded Throne", quality: "epic", money: 14, culture: 2, text: "The seat of a dead empire. Envoys bow to it before they remember not to." },
  { id: "a-eternal-garden", name: "Eternal Garden", quality: "epic", research: { field: "planetology", amount: 18 }, culture: 1, text: "A garden in a crystal sphere that has bloomed, unwatered, since before our sun." },
  { id: "a-void-compass", name: "Void Compass", quality: "epic", research: { field: "propulsion", amount: 18 }, money: 4, text: "Its needle points to wherever you most need to go." },
  { id: "a-titan-gauntlet", name: "Titan's Gauntlet", quality: "epic", research: { field: "weapons", amount: 18 }, money: 4, text: "Built for a hand three times ours. Our engineers study every joint." },
  { id: "a-bastion-stone", name: "Bastion Stone", quality: "epic", research: { field: "forceFields", amount: 18 }, money: 4, text: "Strike it and the air around it hardens like glass." },
  { id: "a-crown-of-ages", name: "Crown of Ages", quality: "legendary", money: 20, culture: 4, text: "Whoever wears it, the galaxy listens to. For a while." },
  { id: "a-shield-of-dawn", name: "Shield of Dawn", quality: "legendary", research: { field: "forceFields", amount: 25 }, text: "A barrier generator older than our sun, still humming." },
];
export const ARTIFACT_BY_ID = new Map(ARTIFACTS.map((a) => [a.id, a]));

interface Stage { text: string; dig: string; take: string; sell: string }

/** What each kind of site rewards at each stage (index 0-2): research, money, culture, artifact. */
export const DIG_REWARDS: Record<DigKind, { field: ResearchField; research: number[]; money: number[]; culture: number[]; artifact: string[]; danger: string }> = {
  archive: { field: "computers", research: [150, 300, 600], money: [40, 80, 160], culture: [20, 40, 80], artifact: ["a-star-chart", "a-thinking-stone", "a-oracle-engine"], danger: "A defence program wakes in the deepest vault and burns out half our equipment." },
  vault: { field: "construction", research: [80, 160, 300], money: [150, 300, 600], culture: [10, 20, 40], artifact: ["a-coin-hoard", "a-merchant-seal", "a-crown-of-ages"], danger: "The vault's guardians wake. Diggers die before the doors can be sealed." },
  tomb: { field: "planetology", research: [60, 120, 240], money: [40, 80, 120], culture: [60, 120, 300], artifact: ["a-death-mask", "a-kings-sceptre", "a-gilded-throne"], danger: "Something in the deepest chamber was not dead. A sickness spreads through the colony." },
  armory: { field: "weapons", research: [150, 300, 600], money: [40, 60, 100], culture: [10, 20, 30], artifact: ["a-forge-heart", "a-forge-heart", "a-shield-of-dawn"], danger: "An ancient weapon fires as the last door opens. The blast is felt across the colony." },
  seedbank: { field: "planetology", research: [150, 300, 600], money: [30, 60, 100], culture: [20, 40, 60], artifact: ["a-world-seed", "a-world-seed", "a-eternal-garden"], danger: "A blight escapes the sealed seed vaults and withers the colony's farms." },
};

export const DIG_NAMES: Record<DigKind, string> = { archive: "Drowned Archive", vault: "Sealed Vault", tomb: "Tomb of the First Kings", armory: "Buried Armory", seedbank: "Seed Vault of the Ancients" };

const STAGES: Record<DigKind, [Stage, Stage, Stage]> = {
  archive: [
    { text: "Settlers at {colony} have broken into a flooded hall lined with crystal tablets: an archive older than any known species.", dig: "Pump it out and read deeper", take: "Copy what we can reach and seal it", sell: "Sell the location to scholars" },
    { text: "Below the first hall, the archive goes down floor after floor. The tablets here describe sciences we have no names for.", dig: "Keep going down", take: "Take these records and stop", sell: "Sell copies of what we found" },
    { text: "At the very bottom of the archive at {colony}, a sealed core still has power. Something in it is listening.", dig: "Open the core", take: "Leave it sealed and go home with what we have", sell: "Sell the core's location" },
  ],
  vault: [
    { text: "Beneath {colony} lies a vault door the size of a hill, carved with warnings in a dead language.", dig: "Cut through the door", take: "Take the treasures in the antechamber and seal it", sell: "Sell the vault's map" },
    { text: "Inside the vault at {colony}: chamber after chamber of coin, jewels and machines. And more doors.", dig: "Open the next door", take: "Load what we can carry and leave", sell: "Sell salvage rights" },
    { text: "The last door in the vault at {colony} is warm to the touch. Behind it, something is moving.", dig: "Open it anyway", take: "We are rich enough. Seal it for ever", sell: "Sell the last key to the highest bidder" },
  ],
  tomb: [
    { text: "Wind uncovers a stair at {colony}, leading down into the tomb of kings who ruled before our sun was born.", dig: "Descend into the tomb", take: "Take the grave goods at the entrance and close it", sell: "Sell the tomb to a museum" },
    { text: "The royal halls of the tomb at {colony} are painted with the history of an empire nobody remembers.", dig: "Find the king's chamber", take: "Copy the paintings and leave", sell: "Sell the paintings" },
    { text: "The king's sarcophagus at {colony} is sealed with seven seals. The diggers say they hear breathing.", dig: "Break the seals", take: "Leave the dead king in peace", sell: "Sell the sarcophagus unopened" },
  ],
  armory: [
    { text: "A collapsed hill at {colony} reveals racks of weapons that hum when touched: a buried armory.", dig: "Dig out the armory", take: "Take the weapons we can see and fill in the hole", sell: "Sell the weapons to collectors" },
    { text: "Deeper in the armory at {colony}: war machines, half-built, waiting for a war that ended a million years ago.", dig: "Go deeper still", take: "Study these machines and stop", sell: "Sell the machines for scrap" },
    { text: "The armory's heart at {colony} is a single weapon, still charged, still aimed at the sky.", dig: "Try to take it", take: "Seal the chamber; some weapons should stay buried", sell: "Sell its location to whoever dares" },
  ],
  seedbank: [
    { text: "Under the ice at {colony} lies a vault of seeds from ten thousand worlds, still alive.", dig: "Open the seed vault", take: "Take a few samples and seal it", sell: "Sell samples to agrarian worlds" },
    { text: "The deeper rooms of the seed vault at {colony} hold whole frozen forests.", dig: "Wake the forests", take: "Take what we have learned and stop", sell: "Sell the frozen forests" },
    { text: "In the last room of the seed vault at {colony} is a single black seed, labelled in warning colours.", dig: "Plant it", take: "Leave the black seed frozen", sell: "Sell the black seed" },
  ],
};

export const DIG_KINDS: DigKind[] = ["archive", "vault", "tomb", "armory", "seedbank"];
export const digEventId = (kind: DigKind, stage: number) => `dig:${kind}:${stage}`;

/** Event effects are applied by digSites.ts (they depend on the stage), so choices here say "nothing". */
export const DIG_EVENTS: GameEventDef[] = DIG_KINDS.flatMap((k) =>
  STAGES[k].map((st, i): GameEventDef => ({
    id: digEventId(k, i),
    title: i === 0 ? `Ruins: the ${DIG_NAMES[k]}` : `The ${DIG_NAMES[k]}, Level ${i + 1}`,
    art: "ruins",
    trigger: "turn",
    text: st.text,
    choices: [
      { label: i === 2 ? `${st.dig} (great rewards, or great danger)` : `${st.dig} (a few turns of work)`, result: "The diggers go deeper.", effects: [{ kind: "nothing" }] },
      { label: st.take, result: "We take our finds and seal the site.", effects: [{ kind: "nothing" }] },
      { label: st.sell, result: "A buyer is found within days.", effects: [{ kind: "nothing" }] },
    ],
  })),
);
