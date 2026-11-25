// Superweapon and starbase stories. Written by Gemini; rules built by Claude.
// Checked by Claude 2026-11-25: ids unique, effects in scale; superweapon names made generic (see bottom). Passed.
import type { GameEventDef } from "./events";

/** trigger "turn". 5 about superweapons (first one built in the galaxy, a test firing, saboteurs, a protest movement, a stolen design),
 *  5 about starbases (a drydock accident, a haven full of refugees, a garrison mutiny, a beacon that attracts traders, a redoubt siege). */
export const MEGAPROJECT_EVENTS: GameEventDef[] = [
  // =========================================================================
  // SUPERWEAPONS (5)
  // =========================================================================
  {
    id: "superweapon-first-in-the-galaxy",
    title: "Dawn of the Doomsday Age",
    art: "council",
    trigger: "turn",
    text: "Long-range telemetry confirms that the {rival} has completed a strategic superweapon in orbit above {star}. News networks across every sector broadcast orbital silhouettes of the installation, sparking panic in border ports and urgent demands from our admiralty.",
    choices: [
      {
        label: "Sponsor an emergency disarmament summit",
        result: "Envoys rally nervous neighbors around arms-control accords, calming markets while leaving our fleets lightly armed.",
        effects: [
          { kind: "relations", amount: 14 },
          { kind: "culture", amount: 110 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Launch an immediate crash counter-program",
        result: "State foundries divert civilian budgets into heavy weapons trials, straining domestic morale.",
        effects: [
          { kind: "research", field: "weapons", amount: 320 },
          { kind: "morale", amount: -4 },
          { kind: "money", amount: -180 },
        ],
      },
      {
        label: "Fortify frontier colonies and hold reserves",
        result: "Engineering battalions reinforce deep-crust bunkers and expand local industrial capacity.",
        effects: [
          { kind: "factories", amount: 5 },
          { kind: "relations", amount: -8 },
        ],
      },
    ],
  },
  {
    id: "superweapon-test-firing",
    title: "Live-Fire Calibration",
    art: "supernova",
    trigger: "turn",
    text: "Our ordnance crews conducted a full-power calibration test of our superweapon against an uninhabited iron moon near {star}. Seismic shockwaves fractured the moon's mantle cleanly, though stray gravimetric shear rattled orbital habitats across the system.",
    choices: [
      {
        label: "Publish the telemetry across diplomatic channels",
        result: "Rival admiralties study the seismic readings in grim silence, boosting our prestige while souring neighborly trust.",
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "relations", amount: -15 },
        ],
      },
      {
        label: "Mask the logs and harvest the shattered core",
        result: "Mining tugs haul exposed heavy-metal seams into orbit, though the unannounced tremor shakes local colonists.",
        effects: [
          { kind: "money", amount: 240 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "superweapon-saboteurs",
    title: "Ghosts in the Capacitor Ring",
    art: "crisis",
    trigger: "turn",
    text: "Maintenance drones aboard our superweapon above {star} discovered shaped thermal charges wired into three primary collector pylons. Intelligence traces the detonator ciphers to covert operatives backed by the {rival}.",
    choices: [
      {
        label: "Sweep the station and dismiss suspect contractor crews",
        result: "Security teams disarm the charges intact and reverse-engineer the rival's field-jamming fuses, stalling civilian output.",
        effects: [
          { kind: "research", field: "forceFields", amount: 240 },
          { kind: "factories", amount: -4 },
          { kind: "relations", amount: -12 },
        ],
      },
      {
        label: "Feed false telemetry through the rigged relays",
        result: "Double agents trick the {rival} into funding dummy dead-drops, enriching our treasury at the risk of minor hull scorch.",
        effects: [
          { kind: "money", amount: 220 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "superweapon-protest-movement",
    title: "The Ash-Cloud Vigil",
    art: "council",
    trigger: "turn",
    text: "Hundreds of scientists, civic guilds, and dockworkers at {colony} have staged a sit-in blocking fuel tenders bound for our superweapon. They denounce world-killing weapons as an unforgivable stain on our civilization.",
    choices: [
      {
        label: "Grant amnesty and open public oversight hearings",
        result: "Transparent safety charters end the blockade peacefully and inspire civic pride, though refit budgets climb.",
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -230 },
        ],
      },
      {
        label: "Break the picket lines with security brigades",
        result: "Supply shuttles resume launches on schedule, leaving bitter resentment across the colony's workshops.",
        effects: [
          { kind: "factories", amount: 3 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Repurpose the weapon labs for biospheric research",
        result: "Lead protesters return to their labs to adapt the catalyst towers for planetary ecology.",
        effects: [
          { kind: "research", field: "planetology", amount: 270 },
          { kind: "money", amount: -150 },
        ],
      },
    ],
  },
  {
    id: "superweapon-stolen-design",
    title: "The Stolen Blueprints",
    art: "anomaly",
    trigger: "turn",
    text: "A defector from the {rival} docked a battered courier cutter at {colony}, offering complete schematics for a superweapon in exchange for sanctuary and a small fortune in untraceable bearer bonds.",
    choices: [
      {
        label: "Pay the defector and integrate the schematics",
        result: "Propulsion engineers verify the field equations immediately, while the {rival} demands extradition.",
        effects: [
          { kind: "research", field: "propulsion", amount: 360 },
          { kind: "money", amount: -260 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Return the courier to the {rival} sealed",
        result: "Honoring diplomatic protocols wins warm gratitude from the {rival}, though our admirals fume over the lost edge.",
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },

  // =========================================================================
  // STARBASES (5)
  // =========================================================================
  {
    id: "starbase-drydock-accident",
    title: "Gantry Shear at Drydock Nine",
    art: "crisis",
    trigger: "turn",
    text: "A magnetic mooring clamp failed inside our Fleet Drydock orbiting {star}, sending a half-refitted cruiser hull drifting into the main structural truss. Venting plasma torches threaten adjacent repair slips and dockworker habitats.",
    choices: [
      {
        label: "Flood the bay with foam and cut the hull free",
        result: "Rapid containment saves the gantry frame and crew quarters, though expensive hull plates are scrapped.",
        effects: [
          { kind: "money", amount: -170 },
          { kind: "morale", amount: 3 },
        ],
      },
      {
        label: "Push crews on double shifts to salvage the cruiser",
        result: "Exhausted riggers wrestle the hull back into alignment and strip intact alloy stock, risking injuries.",
        effects: [
          { kind: "research", field: "construction", amount: 190 },
          { kind: "population", amount: -1 },
        ],
      },
    ],
  },
  {
    id: "starbase-haven-refugees",
    title: "Lanterns at the Astral Haven",
    art: "contact",
    trigger: "turn",
    text: "A battered flotilla of civilian barges fleeing border raids from the {rival} has anchored outside our Astral Haven near {star}. Thousands of hungry families beg for docking berths and resettlement permits.",
    choices: [
      {
        label: "Open the repair bays and resettle them at {colony}",
        result: "Medical teams clear the barges and ferry grateful families down to {colony}, stretching local budgets.",
        effects: [
          { kind: "population", amount: 3 },
          { kind: "culture", amount: 95 },
          { kind: "money", amount: -190 },
        ],
      },
      {
        label: "Refuel their barges and chart a safe rimward route",
        result: "Our jump beacons guide the convoy toward unclaimed frontier stars, earning goodwill without crowding our ports.",
        effects: [
          { kind: "revealStars", count: 3 },
          { kind: "money", amount: -95 },
        ],
      },
      {
        label: "Turn the convoy away to keep fleet slips clear",
        result: "The haven maintains peak combat readiness, though news of the closed airlocks damps civic spirit.",
        effects: [
          { kind: "morale", amount: -5 },
          { kind: "relations", amount: 8 },
        ],
      },
    ],
  },
  {
    id: "starbase-garrison-mutiny",
    title: "Lockdown on the Apex Garrison",
    art: "crisis",
    trigger: "turn",
    text: "Isolated for years on the outer rim above {star}, the gunnery watch of our Apex Garrison has sealed the command core and trained its phase lances inward, demanding back hazard pay and immediate rotation relief.",
    choices: [
      {
        label: "Wire full back pay and dispatch relief shuttles",
        result: "The gunners stand down peacefully and return the fortress to full readiness at steep treasury expense.",
        effects: [
          { kind: "money", amount: -240 },
          { kind: "morale", amount: 3 },
        ],
      },
      {
        label: "Override the stasis projector from remote telemetry",
        result: "Computer specialists freeze the mutineers' command deck and retake the station, damaging delicate fire-control relays.",
        effects: [
          { kind: "research", field: "computers", amount: 180 },
          { kind: "factories", amount: -3 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "starbase-beacon-traders",
    title: "The Free-Port Ring",
    art: "contact",
    trigger: "turn",
    text: "Drawn by the long-range jump transponders of our Beacon Berth at {star}, independent merchant haulers and alien charter captains have begun congregating in orbit, turning the refueling platform into a bustling bazaar.",
    choices: [
      {
        label: "Charter an official customs and tariff exchange",
        result: "Regular docking fees flow into our treasury and warm frontier ties with the {rival}.",
        effects: [
          { kind: "money", amount: 210 },
          { kind: "relations", amount: 10 },
          { kind: "morale", amount: -2 },
        ],
      },
      {
        label: "Grant tax-free berths to cultural envoys and scouts",
        result: "Travelers swap star charts and ballads across the promenade, enriching our archives.",
        effects: [
          { kind: "culture", amount: 125 },
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },
  {
    id: "starbase-redoubt-siege",
    title: "Thirty Days Under Plasma",
    art: "victory",
    trigger: "turn",
    text: "Cut off behind hostile lines at {star}, our Iron Redoubt weathered weeks of relentless bombardment from raiders linked to the {rival}, holding the starlane until relief scouts finally broke the blockade.",
    choices: [
      {
        label: "Immortalize the garrison in empire-wide broadcasts",
        result: "The redoubt's stubborn defense rallies colonists everywhere, though the {rival} bristles at the propaganda.",
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "morale", amount: 5 },
          { kind: "relations", amount: -12 },
        ],
      },
      {
        label: "Strip the scarred deflector logs for weapons trials",
        result: "Ordnance engineers turn the battle telemetry into sharper targeting algorithms, costing heavy refit funds.",
        effects: [
          { kind: "research", field: "weapons", amount: 280 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
];

/** What each race says when ANOTHER empire fires a superweapon. 2 lines each, under 30 words. Placeholders: {empire} (who fired), {star}. */
export const SUPERWEAPON_LINES: Record<string, string[]> = {
  humans: [
    "Every treaty signed in good faith just burned in the sky above {star}. How does {empire} expect anyone to negotiate after that?",
    "Our embassies are flooded with panic following {empire}'s strike at {star}. A line has been crossed that diplomacy alone cannot erase.",
  ],
  vossari: [
    "Fascinating energy yield at {star}, yet utterly barbaric in application. {empire} wields high-tier physics like a club.",
    "Our observatories recorded every wavelength of {empire}'s discharge over {star}. Such power demands precision, not reckless slaughter.",
  ],
  kethrak: [
    "The hive feels the tremor from {star} through every tunnel. {empire} destroys nests it cannot even digest.",
    "Waste! {empire} scorches {star} instead of harvesting its biomass. The brood will remember this madness.",
  ],
  ashkari: [
    "There is no honor in slaughtering {star} from beyond gunnery range! {empire} fights like a coward hiding behind machines.",
    "Let {empire} boast of its toy at {star}. True warriors still settle empires blade to blade on the ground.",
  ],
  lumen: [
    "Millions of minds winked out at {star} in a single deafening shriek. We can still hear the echo of {empire}'s cruelty.",
    "The psychic static from {star} clouds our communion. {empire} has severed threads that can never be woven again.",
  ],
  thraal: [
    "{empire} cracks the bones of {star} as though stone and world were mere gravel. Even deep bedrock trembles at such haste.",
    "We endure eons without shattering a single crust, yet {empire} ruins {star} in one heartbeat.",
  ],
  seraphine: [
    "No pilot could dodge what {empire} unleashed over {star}. That is not warfare; it is an execution without wings.",
    "Our squadrons watched the flash at {star} from three sectors away. {empire} has poisoned the sky itself.",
  ],
  orrun: [
    "Do you have any idea what {empire}'s stunt at {star} just did to sector insurance rates? Entire trade lanes are frozen!",
    "Ruined infrastructure at {star} pays zero dividends! {empire} is burning profit margins along with worlds.",
  ],
  nyx: [
    "Calculation complete: {empire}'s expenditure at {star} yields negative long-term industrial efficiency. Illogical destruction.",
    "Telemetry from {star} confirms catastrophic asset loss. {empire} prioritizes terror over optimal resource preservation.",
  ],
  velari: [
    "The stars weep for the harmony broken at {star}. {empire} has torn a wound across the celestial tapestry.",
    "We build wonders to endure across ages, while {empire} raises engines to unmake {star} in moments.",
  ],
  drovani: [
    "Even beneath the deepest trenches, we felt the tide turn cold when {empire} struck {star}.",
    "Life clings to fragile currents across the void, yet {empire} boils {star} without a thought for what swims beneath.",
  ],
  gorrath: [
    "This is why our clans never chain our fate to one rock! Look how easily {empire} broke {star}.",
    "Our worldships are already plotting new headings away from {star}. Only fools stay anchored within {empire}'s reach.",
  ],
  ixil: [
    "What a waste of living hosts at {star}! {empire} burns away minds and lineages before anyone can bond with them.",
    "The symphony of {star} was silenced too soon. {empire} destroys the very diversity that makes conquest worthwhile.",
  ],
  verdane: [
    "To wither a whole canopy at {star} in a flash of cold fire—{empire} is a blight upon the starlight.",
    "Seeds take centuries to root, yet {empire} turns {star} to barren ash in seconds.",
  ],
  quorai: [
    "We danced inside solar coronas long before {empire} learned to spark a coil, yet even we flinch at the scar over {star}.",
    "Such clumsy, jagged radiation at {star}! {empire} plays with stellar fire without understanding its song.",
  ],
  raxxan: [
    "Hah! Look at the fireworks {empire} set off over {star}! Hope they left enough scrap intact for our salvage tugs.",
    "Big boom at {star}, courtesy of {empire}. Keep your distance until the radiation cools, then we pick the bones.",
  ],
  ruuvak: [
    "So many nests snuffed out at {star} in one stroke! {empire} fears our numbers, so it resorts to cowards' fire.",
    "Let {empire} burn {star}—for every clutch they erase, ten more are already hatching in the dark.",
  ],
  tarkhan: [
    "A gun that fires from across the map takes zero skill. {empire} proved only its cowardice at {star}.",
    "At {star}, {empire} replaced marksmanship with mass murder. Give us one clean shot at their emitter.",
  ],
};

/*
 * CLAUDE (2026-11-25): superweapon events named one specific weapon (Tectonic Sunderer, Arc-Tempest Array,
 * Pale-Shroud Emitter, Null-Tide Anchor) though any of the four can be built; now they say "our superweapon".
 * Starbase events keep their station names: each fires only for an empire that has that station.
 *
 * NOTES / ANYTHING UNSURE
 * 1. Event trigger & placeholder binding:
 *    - All 10 events in `MEGAPROJECT_EVENTS` use `trigger: "turn"`, matching the spec comment.
 *    - Placeholders used in `text`, `label`, and `result`: `{star}`, `{colony}`, and `the {rival}` (never in `title` or `id`).
 *    - When the event runner dispatches a megaproject event, it should bind `{star}` to the star where the relevant superweapon/starbase sits (or a rival's superweapon star for `superweapon-first-in-the-galaxy`), `{colony}` to one of the player's colonies, and `{rival}` to a contacted rival empire (preferably the owner of the first superweapon in `superweapon-first-in-the-galaxy`).
 * 2. Race lines placeholder:
 *    - Every line in `SUPERWEAPON_LINES` uses both `{empire}` and `{star}` and stays strictly under 30 words.
 */