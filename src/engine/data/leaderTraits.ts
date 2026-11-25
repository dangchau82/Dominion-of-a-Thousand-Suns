// Leader traits: every leader has one, with an upside and a downside.
// Written by Gemini (2026-11-25), checked by Claude; rules that apply them are built by Claude.
import type { EmpireBonus } from "./buildings";

export interface LeaderTrait {
  id: string;            // lowercase-with-dashes, all different
  name: string;          // 1 to 3 words, e.g. "Iron Nerves"
  description: string;   // one sentence, under 25 words, shown to the player
  upside: EmpireBonus;   // only positive numbers
  downside: EmpireBonus; // only negative numbers
}

export const LEADER_TRAITS: LeaderTrait[] = [
  {
    id: "iron-nerves",
    name: "Iron Nerves",
    description: "Stays icy calm under heavy fire, though blunt speech ruffles sensitive foreign envoys.",
    upside: { attack: 1 },
    downside: { relations: -8 },
  },
  {
    id: "silver-tongue",
    name: "Silver Tongue",
    description: "Charms rival courts with effortless grace, yet neglects dull factory audits at home.",
    upside: { relations: 9, trade: 0.1 },
    downside: { production: -0.06 },
  },
  {
    id: "relentless-taskmaster",
    name: "Relentless Taskmaster",
    description: "Squeezes extra output from every assembly line while exhausting workers, stifling culture and slowing population growth.",
    upside: { production: 0.08 },
    downside: { growth: -0.12, culture: -0.1 },
  },
  {
    id: "ivory-recluse",
    name: "Ivory Recluse",
    description: "Avoids public banquets and foreign courts to pursue uninterrupted theoretical breakthroughs.",
    upside: { research: 0.08 },
    downside: { relations: -8, trade: -0.1 },
  },
  {
    id: "daring-gambler",
    name: "Daring Gambler",
    description: "Risks bold deep-space shortcuts and aggressive maneuvers, occasionally losing supply convoys.",
    upside: { range: 1, attack: 0.5 },
    downside: { trade: -0.14 },
  },
  {
    id: "grand-showman",
    name: "Grand Showman",
    description: "Turns every public appearance into a civic festival, though lavish pageants drain industrial budgets.",
    upside: { culture: 0.15 },
    downside: { production: -0.07 },
  },
  {
    id: "sworn-pacifist",
    name: "Sworn Pacifist",
    description: "Champions peaceful coexistence and open commerce, refusing to endorse aggressive fleet doctrines.",
    upside: { relations: 10, growth: 0.1 },
    downside: { attack: -1 },
  },
  {
    id: "dogmatic-zealot",
    name: "Dogmatic Zealot",
    description: "Inspires fierce cultural devotion across colonies while dismissing unorthodox scientific inquiry.",
    upside: { culture: 0.14, attack: 0.5 },
    downside: { research: -0.08 },
  },
  {
    id: "shadow-broker",
    name: "Shadow Broker",
    description: "Maintains covert informant rings across every border, leaving foreign diplomats deeply suspicious.",
    upside: { spying: 1 },
    downside: { relations: -9 },
  },
  {
    id: "frugal-quartermaster",
    name: "Frugal Quartermaster",
    description: "Stretches every hull-plate and fuel cell further, though stingy stipends slow laboratory trials.",
    upside: { production: 0.06, range: 1 },
    downside: { research: -0.07 },
  },
  {
    id: "merchant-prince",
    name: "Merchant Prince",
    description: "Opens lucrative interstellar trade lanes while treating cultural patronage as wasted credit.",
    upside: { trade: 0.15 },
    downside: { culture: -0.13 },
  },
  {
    id: "frontier-pioneer",
    name: "Frontier Pioneer",
    description: "Charts distant starlanes and rallies eager settlers, leaving core-world academies short-staffed.",
    upside: { range: 1, growth: 0.1 },
    downside: { research: -0.07 },
  },
  {
    id: "disgraced-noble",
    name: "Disgraced Noble",
    description: "Overcompensates for past scandal with fierce battlefield daring, though high society still scorns their name.",
    upside: { attack: 1 },
    downside: { culture: -0.14 },
  },
  {
    id: "hearth-warden",
    name: "Hearth Warden",
    description: "Dedicated to healthy, thriving families on established worlds, with little appetite for distant expeditions.",
    upside: { growth: 0.15 },
    downside: { range: -1 },
  },
  {
    id: "parochial-bureaucrat",
    name: "Parochial Bureaucrat",
    description: "Keeps domestic mines and foundries humming smoothly while neglecting off-world diplomacy and trade.",
    upside: { production: 0.07 },
    downside: { trade: -0.13 },
  },
  {
    id: "reckless-experimenter",
    name: "Reckless Experimenter",
    description: "Pushes unstable prototypes straight to the bench, speeding discovery at the cost of factory safety.",
    upside: { research: 0.08 },
    downside: { production: -0.06, growth: -0.08 },
  },
  {
    id: "open-book",
    name: "Open Book",
    description: "Wins rivals over with plain candor, making it effortless for enemy agents to read our intentions.",
    upside: { relations: 9 },
    downside: { spying: -1 },
  },
  {
    id: "void-hermit",
    name: "Void Hermit",
    description: "Prefers deep-space sensor buoys to crowded cities, uncovering hidden lanes while neglecting civic life.",
    upside: { range: 1, spying: 0.5 },
    downside: { culture: -0.12, growth: -0.08 },
  },
  {
    id: "gilded-patron",
    name: "Gilded Patron",
    description: "Sponsors grand theaters and bustling market exchanges, yet hesitates to authorize military strikes.",
    upside: { culture: 0.12, trade: 0.12 },
    downside: { attack: -1 },
  },
  {
    id: "cautious-tactician",
    name: "Cautious Tactician",
    description: "Refuses to overextend supply lines, preserving lives and trade at the cost of operational reach.",
    upside: { growth: 0.1, trade: 0.1 },
    downside: { range: -1 },
  },
  {
    id: "cloak-and-dagger",
    name: "Cloak and Dagger",
    description: "Treats every trade guild as an intelligence front, chilling legitimate commerce across borders.",
    upside: { spying: 1 },
    downside: { trade: -0.14 },
  },
  {
    id: "academic-purist",
    name: "Academic Purist",
    description: "Insists on rigorous peer review before weaponizing any discovery, slowing tactical deployment.",
    upside: { research: 0.07, culture: 0.1 },
    downside: { attack: -0.5, production: -0.05 },
  },
  {
    id: "scarred-veteran",
    name: "Scarred Veteran",
    description: "Drills crews to lethal precision in combat while viewing counter-intelligence work as dishonorable.",
    upside: { attack: 1 },
    downside: { spying: -1 },
  },
  {
    id: "colonial-midwife",
    name: "Colonial Midwife",
    description: "Excels at turning harsh frontier outposts into booming settlements, though domestic traditions fade.",
    upside: { growth: 0.14, production: 0.05 },
    downside: { culture: -0.13, spying: -0.5 },
  },
];