// Minor races: small neutral peoples to court or conquer. Written by Gemini (2026-11-25), checked by Claude; rules built by Claude.
import type { Climate } from "../types";

export interface MinorRaceDef {
  id: string;
  name: string;                // e.g. "the Something Kin"
  description: string;         // under 40 words
  homeClimate: Climate;        // one of: terran, jungle, ocean, arid, steppe, desert, minimal, barren, tundra, dead, inferno, toxic, radiated
  worlds: 1 | 2 | 3;
  /** What wins them over fastest. */
  likes: "gifts" | "trade" | "protection" | "technology" | "culture";
  /** What they can't stand (makes them like you less). */
  dislikes: "war" | "spies" | "conquest" | "poverty" | "isolation";
  /** What a friend gets each turn, kept small. */
  friendGift: { kind: "money"; amount: number } | { kind: "research"; amount: number } | { kind: "culture"; amount: number } | { kind: "councilVotes"; amount: number };
  greeting: string;            // their first words, under 30 words
  joinText: string;            // when they become your friends, under 25 words
}

export const MINOR_RACES: MinorRaceDef[] = [
  {
    id: "aurelian-caravaneers",
    name: "the Aurelian Caravaneers",
    description: "Nomadic bazaar-guilds inhabiting terraced canyon cities, famed across nearby sectors for shrewd ledgers and reliable freight.",
    homeClimate: "arid",
    worlds: 2,
    likes: "trade",
    dislikes: "poverty",
    friendGift: { kind: "money", amount: 8 },
    greeting: "Our scales are balanced and our docks are open, traveler. Show us full coffers and fair tariffs.",
    joinText: "Aurelian guild-ships now fly your pennant, routing steady tariff profits straight into your treasury.",
  },
  {
    id: "hoarfrost-anchorites",
    name: "the Hoarfrost Anchorites",
    description: "Contemplative cliff-monks who carve acoustic libraries into frozen peaks and preserve pre-warp philosophies.",
    homeClimate: "tundra",
    worlds: 1,
    likes: "culture",
    dislikes: "war",
    friendGift: { kind: "culture", amount: 4 },
    greeting: "Tread softly upon our frost-gardens, starfarer. Weapons speak loudly, yet wisdom echoes far longer.",
    joinText: "The Anchorites dedicate their mountain scriptoria to your realm, enriching your people's cultural heritage.",
  },
  {
    id: "ashfall-reclaimers",
    name: "the Ashfall Reclaimers",
    description: "Reformed freebooters who fortified a volcanic archipelago and now sell hard-won salvage rights to trustworthy patrons.",
    homeClimate: "inferno",
    worlds: 2,
    likes: "gifts",
    dislikes: "spies",
    friendGift: { kind: "money", amount: 10 },
    greeting: "Keep your cloaked scouts out of our ash-coves and bring shiny tribute if you want to talk business.",
    joinText: "The Reclaimers swear off raiding your lanes and share a generous cut of their smelter bullion.",
  },
  {
    id: "pelagic-archivists",
    name: "the Pelagic Archivists",
    description: "Bioluminescent reef-dwellers maintaining vast living coral computers beneath warm global seas.",
    homeClimate: "ocean",
    worlds: 3,
    likes: "technology",
    dislikes: "conquest",
    friendGift: { kind: "research", amount: 10 },
    greeting: "Our tidal reefs hum with questions from the deep. Share your theorems, and the ocean will answer.",
    joinText: "Coral memory-banks link with your academies, streaming continuous scientific insights to your researchers.",
  },
  {
    id: "remnant-custodian",
    name: "the Remnant Custodian",
    description: "A polite custodian intelligence tending glass observatories on a quiet airless world since its creators departed.",
    homeClimate: "dead",
    worlds: 1,
    likes: "technology",
    dislikes: "isolation",
    friendGift: { kind: "research", amount: 12 },
    greeting: "Greetings, biological guests. Centuries of silent telemetry grow lonely; please exchange data with our arrays.",
    joinText: "The Remnant Custodian grants your scientists full access to its pristine deep-space sensor archives.",
  },
  {
    id: "silt-striders",
    name: "the Silt Striders",
    description: "Gentle, long-lived titans who wade through misty steppe marshes and speak in slow, resonant sub-harmonics.",
    homeClimate: "steppe",
    worlds: 2,
    likes: "protection",
    dislikes: "war",
    friendGift: { kind: "councilVotes", amount: 2 },
    greeting: "Hrrrm... you move so quickly, little ships. Stand beside us against raiders, and we shall stand for you.",
    joinText: "The Silt Striders pledge their ancient voice to your delegation in every Galactic Council session.",
  },
  {
    id: "oakhaven-exiles",
    name: "the Oakhaven Exiles",
    description: "Descendants of planetary refugees who rebuilt fertile terrace farms after fleeing a distant stellar catastrophe.",
    homeClimate: "terran",
    worlds: 2,
    likes: "protection",
    dislikes: "conquest",
    friendGift: { kind: "councilVotes", amount: 1 },
    greeting: "We lost one home to fire and greed. Promise our skies will stay safe, and our votes are yours.",
    joinText: "Grateful for your shield, the Oakhaven Exiles back your representatives at the Galactic Council.",
  },
  {
    id: "mycelial-synod",
    name: "the Mycelial Synod",
    description: "Symbiotic fungal collectives spanning dense canopy continents, communicating through airborne luminescent spores.",
    homeClimate: "jungle",
    worlds: 3,
    likes: "culture",
    dislikes: "spies",
    friendGift: { kind: "culture", amount: 3 },
    greeting: "Breathe our golden pollen in peace, stranger, but hide no poisoned needles beneath your cloak.",
    joinText: "The Synod weaves your songs into its continental spore-network, lifting your empire's cultural renown.",
  },
  {
    id: "brine-alchemists",
    name: "the Brine Alchemists",
    description: "Hazard-suited chemists harvesting exotic catalysts from bubbling acid seas and toxic geysers.",
    homeClimate: "toxic",
    worlds: 1,
    likes: "trade",
    dislikes: "isolation",
    friendGift: { kind: "research", amount: 8 },
    greeting: "Don't mind the fumes! Send freighters regularly and we'll bottle compounds your labs have never dreamed of.",
    joinText: "Alchemical tanker-shuttles now supply your laboratories with rare catalytic reagents every turn.",
  },
  {
    id: "dune-cartographers",
    name: "the Dune Cartographers",
    description: "Wind-sail nomads who chart shifting glass deserts by starlight and trade accurate sector astrogation.",
    homeClimate: "desert",
    worlds: 2,
    likes: "gifts",
    dislikes: "poverty",
    friendGift: { kind: "money", amount: 6 },
    greeting: "Gold weighs heavy on sand-skiffs, yet bright tribute buys maps no scout ship could ever chart.",
    joinText: "Dune navigators share toll revenues and desert crystal fees with your imperial treasury.",
  },
  {
    id: "basalt-wardens",
    name: "the Basalt Wardens",
    description: "Stoic subterranean masons who hollow asteroid-scarred moons into indestructible sanctuaries and diplomatic vaults.",
    homeClimate: "barren",
    worlds: 1,
    likes: "protection",
    dislikes: "conquest",
    friendGift: { kind: "councilVotes", amount: 1 },
    greeting: "Stone endures when empires crumble. Respect our borders and guard our skies, and we will honor your word.",
    joinText: "The Basalt Wardens endorse your leadership at the Galactic Council with unshakeable loyalty.",
  },
  {
    id: "glow-glass-artisans",
    name: "the Glow-Glass Artisans",
    description: "Radiation-adapted sculptors who fuse vitrified crater sands into luminous harmonics prized across civilized space.",
    homeClimate: "radiated",
    worlds: 1,
    likes: "culture",
    dislikes: "war",
    friendGift: { kind: "culture", amount: 4 },
    greeting: "Even harsh light can be blown into beauty. Bring us art and peace, not orbital bombardment.",
    joinText: "Glow-Glass galleries open across your worlds, radiating prestige throughout known space.",
  },
];