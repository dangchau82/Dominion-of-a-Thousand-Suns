// Prophecies: cryptic but true warnings of scheduled events. Written by Gemini (2026-11-25), checked by Claude; rules built by Claude.

export type ProphecyThreat =
  | "invasion"        // a rival is massing a fleet against one of our worlds
  | "plague"          // a plague will break out on one of our colonies
  | "supernova"       // a star near our worlds will flare violently
  | "elderAwakening"  // the elder powers are about to return
  | "goldenAge"       // our people are about to enter a golden age
  | "betrayal";       // an empire we have a treaty with will break it

export interface ProphecyDef {
  id: string;
  threat: ProphecyThreat;
  /** The cryptic version everyone gets. Placeholders: {starColor}, {direction}, {turns}. */
  text: string;
  /** The clearer version for mystic and telepath races. Same placeholders, plus {star} and {rival}. */
  clearText: string;
  /** Shown when it comes true. Placeholders: {star}, {rival}. */
  fulfilled: string;
}

export const PROPHECIES: ProphecyDef[] = [
  {
    id: "invasion-oracle-iron-tide",
    threat: "invasion",
    text: "When the {starColor} lantern has guttered {turns} times, iron wolves will leap from the {direction} to tear at our shore.",
    clearText: "In {turns} turns, war-fleets of the {rival} will strike from the {direction} past the {starColor} light of {star}.",
    fulfilled: "Raiders of the {rival} descend upon {star}, fulfilling the oracle's warning of iron wolves.",
  },
  {
    id: "invasion-child-red-snow",
    threat: "invasion",
    text: "A child woke weeping of ash falling from the {direction}, counting {turns} heartbeats beneath a cold {starColor} eye.",
    clearText: "The child's dream shows cruisers of the {rival} massing in the {direction} by the {starColor} sun, set to strike {star} in {turns} turns.",
    fulfilled: "Armadas of the {rival} breach orbit above {star}, turning the child's nightmare into fire.",
  },
  {
    id: "invasion-machine-vector",
    threat: "invasion",
    text: "Corrupted relay logs repeat one bearing: {direction}, bearing {starColor} spectrum, countdown {turns} cycles until hull-breach.",
    clearText: "Decoded telemetry reveals a strike taskforce of the {rival} staging in the {direction} near a {starColor} star to hit {star} in {turns} turns.",
    fulfilled: "The predicted assault fleet of the {rival} drops out of transit at {star}.",
  },
  {
    id: "plague-poet-pale-bloom",
    threat: "plague",
    text: "A dying poet sang of velvet dust drifting from the {direction}, blooming in {turns} nights under a {starColor} moon.",
    clearText: "The poet's verse foretells a virulent contagion breaking out on {star} in {turns} turns, beneath its {starColor} sky in the {direction}.",
    fulfilled: "Quarantine sirens wail across {star} as the velvet contagion erupts just as foretold.",
  },
  {
    id: "plague-song-silent-wells",
    threat: "plague",
    text: "Pilgrims hum an old dirge: after {turns} tides toward the {direction}, the {starColor} well turns bitter and empties the streets.",
    clearText: "The pilgrim dirge warns that in {turns} turns, a wasting sickness will sweep the domes of {star} under its {starColor} sun to the {direction}.",
    fulfilled: "Hospitals overflow on {star} as the bitter sickness strikes our colonists.",
  },
  {
    id: "plague-oracle-glass-breath",
    threat: "plague",
    text: "The temple brazier smoked {starColor} toward the {direction}, spelling {turns} harvests before fever steals the breath of crowds.",
    clearText: "Our seers trace the smoke to {star} in the {direction}, where a fever plague will erupt under the {starColor} star in {turns} turns.",
    fulfilled: "A sudden fever sweeps the habitat rings of {star}, matching the temple omen.",
  },
  {
    id: "supernova-oracle-shattered-crown",
    threat: "supernova",
    text: "Look toward the {direction} where the {starColor} crown trembles; in {turns} breaths its heart will crack and blind the dark.",
    clearText: "In {turns} turns, the unstable {starColor} star {star} in the {direction} will erupt in a violent stellar flare.",
    fulfilled: "Blinding radiation washes over {star} as its unstable core ruptures on schedule.",
  },
  {
    id: "supernova-machine-core-fault",
    threat: "supernova",
    text: "Ancient probe memory loops a thermal warning: {starColor} beacon in the {direction} exceeds containment in {turns} intervals.",
    clearText: "Precursor sensor echoes confirm {star}, a {starColor} sun in the {direction}, will suffer a catastrophic flare in {turns} turns.",
    fulfilled: "Solar prominences tear outward from {star}, scorched into ancient memory long ago.",
  },
  {
    id: "supernova-poet-white-cinder",
    threat: "supernova",
    text: "An elegy carved in basalt warns that in {turns} seasons a {starColor} ember in the {direction} will swallow its own sky.",
    clearText: "The basalt elegy marks {star} in the {direction}, foretelling that its {starColor} furnace will flare violently in {turns} turns.",
    fulfilled: "The sky above {star} ignites in a searing flare, fulfilling the basalt elegy.",
  },
  {
    id: "elder-song-sleeping-titans",
    threat: "elderAwakening",
    text: "Deep-space listeners hear a {starColor} chord rising from the {direction}, counting {turns} beats until the old thrones stir.",
    clearText: "The ancient signal radiates from {star} in the {direction}; in {turns} turns, the sleeping elder powers will awaken.",
    fulfilled: "Ancient vaults unseal near {star} as the elder powers return to the galaxy.",
  },
  {
    id: "elder-child-stone-giants",
    threat: "elderAwakening",
    text: "Children across three worlds drew {starColor} doors opening in the {direction}, whispering that giants wake after {turns} sleeps.",
    clearText: "Telepathic echoes from {star} in the {direction} confirm the elder powers will stir beneath their {starColor} beacon in {turns} turns.",
    fulfilled: "Colossal vessels emerge from ancient slumber near {star}, just as the children dreamed.",
  },
  {
    id: "elder-oracle-first-keys",
    threat: "elderAwakening",
    text: "When the {starColor} pendulum swings {turns} times in the {direction}, the first builders will reclaim their forgotten keys.",
    clearText: "Our seers foresee ancient mechanisms activating around {star} in the {direction} in {turns} turns, heralding the elder powers.",
    fulfilled: "Dormant precursor relays flare to life around {star} as the elder powers awaken.",
  },
  {
    id: "golden-poet-luminous-harvest",
    threat: "goldenAge",
    text: "A wandering singer promises that in {turns} turns a {starColor} dawn from the {direction} will turn our labor into song.",
    clearText: "In {turns} turns, a surge of inspiration centered on {star} in the {direction} under its {starColor} sun will spark a golden age.",
    fulfilled: "A cultural and scientific renaissance sweeps out from {star}, ushering in a golden age.",
  },
  {
    id: "golden-oracle-gilded-loom",
    threat: "goldenAge",
    text: "Star-readers trace a {starColor} arc toward the {direction}, foretelling {turns} cycles before brilliance crowns every forge and academy.",
    clearText: "The {starColor} alignment over {star} in the {direction} heralds an empire-wide golden age beginning in {turns} turns.",
    fulfilled: "Citizens across {star} celebrate as unprecedented prosperity inaugurates a golden age.",
  },
  {
    id: "golden-child-glass-cities",
    threat: "goldenAge",
    text: "A dreamer saw spires of {starColor} light rising in the {direction} after {turns} winters, where no hand grew weary.",
    clearText: "The dream points to {star} in the {direction}, where breakthroughs under its {starColor} sky will ignite a golden age in {turns} turns.",
    fulfilled: "New wonders of art and industry bloom across {star}, fulfilling the dreamer's vision.",
  },
  {
    id: "betrayal-oracle-serpent-seal",
    threat: "betrayal",
    text: "Wax melts in a {starColor} flame facing the {direction}; in {turns} turns a sworn hand will draw a hidden blade.",
    clearText: "In {turns} turns, the {rival} will shatter our treaty, striking from their border near the {starColor} star {star} in the {direction}.",
    fulfilled: "Envoys of the {rival} tear up our accord and strike near {star}, proving the omen true.",
  },
  {
    id: "betrayal-machine-cipher-leak",
    threat: "betrayal",
    text: "Ghost packets on the {starColor} band echo from the {direction}: treaty protocols expire in {turns} cycles without warning.",
    clearText: "Intercepted whispers show the {rival} plotting to break our pact near {star} in the {direction} within {turns} turns.",
    fulfilled: "The {rival} abruptly renounces our treaty and mobilizes near {star}.",
  },
  {
    id: "betrayal-song-broken-cup",
    threat: "betrayal",
    text: "Bards sing of a {starColor} goblet cracked toward the {direction}, counting {turns} toasts before a friend forgets their oath.",
    clearText: "The ballad warns that in {turns} turns, the {rival} will betray our pact along the {direction} frontier near {star}.",
    fulfilled: "Sworn oaths turn to ash as the {rival} betrays our treaty near {star}.",
  },
];