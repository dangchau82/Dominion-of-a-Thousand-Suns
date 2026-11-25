// Race storylines: 5 chapters per race, 2 forks per chapter. Story data only;
// the engine that plays them is built by Claude. Written by Gemini (2026-11-25), checked by Claude.
import type { GameEventDef } from "./events";

/** When a chapter may start. The engine picks the first turn the condition holds. */
export type StoryWhen =
  | { kind: "turn"; turn: number }          // on or after this turn
  | { kind: "colonies"; count: number }     // we hold at least this many colonies
  | { kind: "firstWar" }                    // we are at war for the first time
  | { kind: "goldenAge" }                   // our first golden age begins
  | { kind: "council" };                    // the Galactic Council meets

export interface StoryChapter extends GameEventDef {
  raceId: string;
  /** 1-4, or "5A" / "5B" (the ending, picked by the chapter 3 fork). */
  chapter: 1 | 2 | 3 | 4 | "5A" | "5B";
  when: StoryWhen;
}

export const STORYLINES: StoryChapter[] = [
  // Ashkari Dominion
  {
    id: "ashkari-1-tomb-of-ash",
    raceId: "ashkari",
    chapter: 1,
    when: { kind: "turn", turn: 22 },
    title: "Vaults of the Red Sand",
    art: "ruins",
    trigger: "turn",
    text: "Deep beneath {colony}, quarry crews breach a sealed bunker of the First Warlords. Inside rest forbidden siege-engines and the ashes of clans who broke ancient desert truces.",
    choices: [
      {
        label: "Unseal the war-vaults",
        result: "Engineers strip ruthless siege schematics from the crypt, though elders condemn the desecration.",
        effects: [
          { kind: "research", field: "weapons", amount: 220 },
          { kind: "research", field: "construction", amount: 150 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Burn the relics in ritual fire",
        result: "The legions salute the pyre, reaffirming that Ashkari steel needs no dishonorable shortcuts.",
        effects: [
          { kind: "culture", amount: 90 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -80 },
        ],
      },
    ],
  },
  {
    id: "ashkari-2-blood-tithe",
    raceId: "ashkari",
    chapter: 2,
    when: { kind: "colonies", count: 3 },
    title: "The Right of Spoils",
    art: "pirates",
    trigger: "turn",
    text: "Veteran legions garrisoning {colony} invoke the desert Right of Spoils, demanding direct control over salvage stripped from border hulks near {star} instead of remitting bullion to the capital.",
    choices: [
      {
        label: "Grant the legions their plunder",
        result: "Warrior clans weld captured plates into roaring local foundries, swelling pride across the frontier.",
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Enforce central war-chest discipline",
        result: "Quartermasters seize the salvage for imperial coffers, leaving scarred veterans muttering in their barracks.",
        effects: [
          { kind: "money", amount: 200 },
          { kind: "research", field: "construction", amount: 140 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "ashkari-3-oath-of-steel",
    raceId: "ashkari",
    chapter: 3,
    when: { kind: "firstWar" },
    title: "The Unbroken Blade",
    art: "crisis",
    trigger: "turn",
    text: "War with the {rival} tests our oldest creed. Turncoat captains from the {rival} offer stolen fleet routes for coin, while High Legates demand we strike only in open battle.",
    choices: [
      {
        label: "Execute the traitors and fight openly",
        result: "We cast the turncoats into the void and march under unstained war banners.",
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 80 },
          { kind: "money", amount: -120 },
        ],
      },
      {
        label: "Buy the stolen fleet routes",
        result: "Our raiders ambush unguarded supply lanes, though old warriors spit at winning through treachery.",
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "computers", amount: 220 },
          { kind: "morale", amount: -5 },
          { kind: "relations", amount: -12 },
        ],
      },
    ],
  },
  {
    id: "ashkari-4-salt-and-rust",
    raceId: "ashkari",
    chapter: 4,
    when: { kind: "turn", turn: 155 },
    title: "Ash Over the Springs",
    art: "crisis",
    trigger: "turn",
    text: "Decades of nonstop smelter output on {colony} have poisoned the deep desert aquifers. Clan elders warn that our war machine is choking the very soil that bred our legions.",
    choices: [
      {
        label: "Keep the war-forges burning",
        result: "Conscripted labor battalions stoke the furnaces day and night, churning out hulls at grim cost.",
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "research", field: "weapons", amount: 240 },
          { kind: "population", amount: -3 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Halt smelting to restore the wells",
        result: "Clean water returns to the oasis basins, reviving weary clans while armaments stall.",
        effects: [
          { kind: "population", amount: 3 },
          { kind: "planetSize", amount: 4 },
          { kind: "factories", amount: -6 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
  {
    id: "ashkari-5a-crown-of-spears",
    raceId: "ashkari",
    chapter: "5A",
    when: { kind: "turn", turn: 215 },
    title: "Crown of Unbent Spears",
    art: "victory",
    trigger: "turn",
    text: "Having spurned shadow-tricks against the {rival}, the Ashkari stand as unmatched exemplars of martial honor. Now the High Legates ask how our proud Dominion shall command the galaxy.",
    choices: [
      {
        label: "Proclaim the Eternal Crusade",
        result: "Every foundry swears an oath of endless conquest, terrifying neighbors across every border.",
        effects: [
          { kind: "research", field: "weapons", amount: 300 },
          { kind: "factories", amount: 12 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Offer the Shield-Pact of Equals",
        result: "Even the {rival} respects our unblemished word, hailing Ashkari legions as honorable guardians.",
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "relations", amount: 18 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
  {
    id: "ashkari-5b-throne-of-iron",
    raceId: "ashkari",
    chapter: "5B",
    when: { kind: "turn", turn: 215 },
    title: "The Iron Directorate",
    art: "council",
    trigger: "turn",
    text: "Buying victory over the {rival} shattered our old desert taboos, forging {colony} into a cold machine of total strategy. Aging veterans ask whether any Ashkari honor still survives.",
    choices: [
      {
        label: "Formalize the Shadow Legate Directorate",
        result: "Logistics officers and cipher-masters rule the stars with ruthless, unassailable efficiency.",
        effects: [
          { kind: "money", amount: 280 },
          { kind: "research", field: "computers", amount: 320 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Redeem our name in grand monuments",
        result: "Vast marble memorials honor the fallen, healing the rift between generals and legions.",
        effects: [
          { kind: "culture", amount: 160 },
          { kind: "morale", amount: 7 },
          { kind: "money", amount: -200 },
        ],
      },
    ],
  },

  // Quorai
  {
    id: "quorai-1-cooling-choir",
    raceId: "quorai",
    chapter: 1,
    when: { kind: "turn", turn: 26 },
    title: "A Speck of Cold Iron",
    art: "supernova",
    trigger: "turn",
    text: "Deep inside the convective heart of {star}, elder plasma harmonics detect a tiny knot of dense iron, proof that even immortal star-children slowly cool toward dark matter.",
    choices: [
      {
        label: "Stoke the core with magnetic reserves",
        result: "Blinding prominence flares purge the slag, restoring our radiant pride at heavy expense.",
        effects: [
          { kind: "research", field: "forceFields", amount: 200 },
          { kind: "culture", amount: 80 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Harvest the cooled slag for hulls",
        result: "Our engineers shape the dead iron into dense framing, though elders mourn the omen.",
        effects: [
          { kind: "research", field: "construction", amount: 220 },
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "quorai-2-mud-architects",
    raceId: "quorai",
    chapter: 2,
    when: { kind: "colonies", count: 3 },
    title: "Cities of Baked Clay",
    art: "anomaly",
    trigger: "turn",
    text: "Orbiting a dead rock near {colony}, our phase-scouts find intricate clay observatories built by short-lived mortals who vanished ages ago yet mastered subtle gravity lenses.",
    choices: [
      {
        label: "Strip their lenses for phase research",
        result: "We shatter the fragile clay vaults to extract pure mathematical theorems on space folding.",
        effects: [
          { kind: "research", field: "propulsion", amount: 240 },
          { kind: "research", field: "computers", amount: 160 },
          { kind: "culture", amount: -40 },
        ],
      },
      {
        label: "Preserve the silent clay towers",
        result: "Solar choruses compose elegies for the brief sparks who once studied our light.",
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "quorai-3-prism-schism",
    raceId: "quorai",
    chapter: 3,
    when: { kind: "turn", turn: 115 },
    title: "The Prism Schism",
    art: "contact",
    trigger: "turn",
    text: "Younger Quorai sparks propose anchoring plasma waveforms inside crystal lattices to converse directly with the {rival}. Solar Elders condemn binding pure starfire to cold mud.",
    choices: [
      {
        label: "Forbid matter-bonding and seal the choir",
        result: "Our coronas burn untouched by clay, leaving the {rival} baffled by our aloof silence.",
        effects: [
          { kind: "research", field: "forceFields", amount: 260 },
          { kind: "morale", amount: 6 },
          { kind: "relations", amount: -15 },
        ],
      },
      {
        label: "Authorize crystal-lattice communion",
        result: "Refracted through quartz, our voices astonish the {rival}, though traditional elders recoil in disgust.",
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "relations", amount: 15 },
          { kind: "morale", amount: -5 },
        ],
      },
    ],
  },
  {
    id: "quorai-4-prominence-rift",
    raceId: "quorai",
    chapter: 4,
    when: { kind: "goldenAge" },
    title: "The Phase Filament",
    art: "supernova",
    trigger: "turn",
    text: "At the peak of our radiance, a phase experiment above {colony} tears open a subspace filament, bleeding raw stellar plasma across surrounding orbital lanes.",
    choices: [
      {
        label: "Drain the rift for forbidden physics",
        result: "Arcane telemetry floods our arrays before the tear snaps shut, scorching orbital infrastructure.",
        effects: [
          { kind: "research", field: "weapons", amount: 300 },
          { kind: "research", field: "propulsion", amount: 250 },
          { kind: "population", amount: -2 },
          { kind: "factories", amount: -8 },
        ],
      },
      {
        label: "Weave a magnetic containment crown",
        result: "Costly field coils stabilize the flare into a permanent solar garden around {colony}.",
        effects: [
          { kind: "planetSize", amount: 6 },
          { kind: "culture", amount: 90 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },
  {
    id: "quorai-5a-eternal-furnace",
    raceId: "quorai",
    chapter: "5A",
    when: { kind: "turn", turn: 220 },
    title: "Lords of Unstained Fire",
    art: "supernova",
    trigger: "turn",
    text: "Unsoiled by cold matter, the Quorai shine with solitary majesty while the {rival} watches our silent suns in dread. Now our elders prepare to reshape the dark.",
    choices: [
      {
        label: "Ignite dormant stellar nurseries",
        result: "Phase-torches kindle cold gas clouds into new suns, expanding our luminous domain.",
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "planetSize", amount: 8 },
          { kind: "research", field: "planetology", amount: 260 },
          { kind: "money", amount: -240 },
        ],
      },
      {
        label: "Fortify the Solar Sanctum",
        result: "Blinding corona walls seal our borders against every creature of ash and clay.",
        effects: [
          { kind: "research", field: "forceFields", amount: 360 },
          { kind: "research", field: "weapons", amount: 340 },
          { kind: "relations", amount: -20 },
        ],
      },
    ],
  },
  {
    id: "quorai-5b-living-prism",
    raceId: "quorai",
    chapter: "5B",
    when: { kind: "turn", turn: 220 },
    title: "The Living Prism",
    art: "victory",
    trigger: "turn",
    text: "By anchoring starfire inside crystal and clay, the Quorai bridge immortal plasma and the {rival}'s fleeting mortal empires, forging a luminous synthesis never before imagined.",
    choices: [
      {
        label: "Share solar-harmonic science openly",
        result: "Mortal scholars and star-beings compose a unified physics across every peaceful world.",
        effects: [
          { kind: "culture", amount: 160 },
          { kind: "relations", amount: 20 },
          { kind: "research", field: "computers", amount: 320 },
        ],
      },
      {
        label: "Become radiant patrons of matter-worlds",
        result: "Boundless stellar energy powers allied industries, enriching our coffers with heavy tribute.",
        effects: [
          { kind: "money", amount: 300 },
          { kind: "factories", amount: 10 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },

  // Terran Accord
  {
    id: "humans-1-charter-archives",
    raceId: "humans",
    chapter: 1,
    when: { kind: "turn", turn: 20 },
    title: "The Sealed Annex",
    art: "ruins",
    trigger: "turn",
    text: "Cataloging pre-warp sleeper pods above {colony}, archivists uncover encrypted logs proving the Accord's founders quietly bribed rival warlords to ratify our sacred peace Charter.",
    choices: [
      {
        label: "Publish the unedited historical logs",
        result: "Painful honesty sparks fierce public debate, deepening democratic trust after initial shock.",
        effects: [
          { kind: "culture", amount: 100 },
          { kind: "morale", amount: -4 },
          { kind: "money", amount: -90 },
        ],
      },
      {
        label: "Classify the annex for civic unity",
        result: "Citizens keep their comforting legends while intelligence analysts study the founders' statecraft.",
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "research", field: "computers", amount: 160 },
          { kind: "culture", amount: -60 },
        ],
      },
    ],
  },
  {
    id: "humans-2-freeport-accord",
    raceId: "humans",
    chapter: 2,
    when: { kind: "colonies", count: 3 },
    title: "The Open Harbor Debate",
    art: "contact",
    trigger: "turn",
    text: "Merchant guilds on {colony} petition to declare {star} a duty-free interstellar clearinghouse open to all hulls, even unvetted freighters from the {rival}.",
    choices: [
      {
        label: "Ratify the open-port compact",
        result: "Tariff-free convoys flood our docks with credit, though local shipwrights lose state subsidies.",
        effects: [
          { kind: "money", amount: 240 },
          { kind: "relations", amount: 12 },
          { kind: "factories", amount: -5 },
        ],
      },
      {
        label: "Enforce strict naval customs",
        result: "Security patrols bolster domestic yards, though the {rival} protests our closed borders.",
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "research", field: "propulsion", amount: 180 },
          { kind: "relations", amount: -10 },
        ],
      },
    ],
  },
  {
    id: "humans-3-security-council",
    raceId: "humans",
    chapter: 3,
    when: { kind: "turn", turn: 110 },
    title: "The Consensus Crisis",
    art: "crisis",
    trigger: "turn",
    text: "Border skirmishes near {star} expose how slowly our colonial assembly debates while the {rival} mobilizes. Ministers propose an Emergency Directorate to bypass votes during crises.",
    choices: [
      {
        label: "Uphold full colonial consent",
        result: "Deliberation slows treasury allocations, yet every world remains a willing partner in our Charter.",
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "relations", amount: 14 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "Establish the Executive Directorate",
        result: "Centralized decrees accelerate shipyards and tax collection, chafing independent colonial assemblies.",
        effects: [
          { kind: "money", amount: 240 },
          { kind: "factories", amount: 8 },
          { kind: "morale", amount: -5 },
          { kind: "relations", amount: -10 },
        ],
      },
    ],
  },
  {
    id: "humans-4-diaspora-drift",
    raceId: "humans",
    chapter: 4,
    when: { kind: "goldenAge" },
    title: "The Frontier Charter",
    art: "contact",
    trigger: "turn",
    text: "Golden-age prosperity inspires idealists on {colony} to outfit private ark-ships bound beyond our borders, seeking to plant self-governing settlements near {star}.",
    choices: [
      {
        label: "Sponsor their frontier charters",
        result: "Eager pioneers depart with Accord blessings and deep-space charts, thinning home populations.",
        effects: [
          { kind: "ships", template: "colony", count: 2 },
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: -260 },
          { kind: "population", amount: -3 },
        ],
      },
      {
        label: "Keep citizens home for civic renewal",
        result: "Skilled engineers stay to enrich core cities, though frustrated pioneers grumble at the restriction.",
        effects: [
          { kind: "population", amount: 3 },
          { kind: "culture", amount: 120 },
          { kind: "research", field: "planetology", amount: 200 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "humans-5a-concert-of-worlds",
    raceId: "humans",
    chapter: "5A",
    when: { kind: "council" },
    title: "Concert of Free Worlds",
    art: "council",
    trigger: "turn",
    text: "As the Galactic Council convenes, the Terran Accord stands as known space's trusted mediator, respected even by the {rival} for keeping faith with democratic consent.",
    choices: [
      {
        label: "Propose the Interstellar Covenant",
        result: "Open trade corridors and shared civic law unite the galaxy around Terran diplomacy.",
        effects: [
          { kind: "culture", amount: 160 },
          { kind: "relations", amount: 20 },
          { kind: "money", amount: 260 },
        ],
      },
      {
        label: "Lead a voluntary peacekeeping watch",
        result: "Allied patrols safeguard neutral lanes under our banner, bolstering confidence across every world.",
        effects: [
          { kind: "ships", template: "scout", count: 3 },
          { kind: "research", field: "forceFields", amount: 320 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
  {
    id: "humans-5b-pax-terran",
    raceId: "humans",
    chapter: "5B",
    when: { kind: "council" },
    title: "The Terran Hegemony",
    art: "victory",
    trigger: "turn",
    text: "At the Galactic Council, our streamlined Directorate commands unmatched trade leverage and industrial might, forcing the {rival} to bargain strictly on Terran terms.",
    choices: [
      {
        label: "Enforce a Terran credit standard",
        result: "Galactic commerce flows through our central banks, though rivals resent our quiet dominance.",
        effects: [
          { kind: "money", amount: 300 },
          { kind: "research", field: "computers", amount: 340 },
          { kind: "relations", amount: -14 },
        ],
      },
      {
        label: "Dissolve emergency powers and restore the Charter",
        result: "Voluntarily surrendering hegemony sparks jubilant celebration across every colony in the Accord.",
        effects: [
          { kind: "culture", amount: 160 },
          { kind: "morale", amount: 8 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
];