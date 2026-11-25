// Random galaxy events. Each shows a picture, a short report and 2-3 choices.
// Format matches the Gemini task spec so more events can be added as data.

import type { ResearchField } from "../types";

export type EventEffect =
  | { kind: "money"; amount: number }
  | { kind: "research"; field: ResearchField; amount: number }
  | { kind: "population"; amount: number }
  | { kind: "factories"; amount: number }
  | { kind: "morale"; amount: number }
  | { kind: "culture"; amount: number }
  | { kind: "ships"; template: "scout" | "colony"; count: number }
  | { kind: "relations"; amount: number }
  | { kind: "planetSize"; amount: number }
  | { kind: "revealStars"; count: number }
  | { kind: "nothing" };

export interface EventChoice {
  label: string;
  result: string;
  effects: EventEffect[];
}

export interface GameEventDef {
  id: string;
  title: string;
  art: "anomaly" | "ruins" | "supernova" | "pirates" | "contact" | "crisis" | "council" | "victory";
  trigger: "explore" | "colony" | "turn" | "war";
  text: string;
  choices: EventChoice[];
}

export const EVENTS: GameEventDef[] = [
  {
    id: "derelict-ark", title: "The Silent Ark", art: "anomaly", trigger: "turn",
    text: "Our patrols found a drifting colony ark near {star}, its crew long dead. The cargo holds are still sealed.",
    choices: [
      { label: "Salvage the cargo", result: "The holds were full of frozen seed stock and old machinery.", effects: [{ kind: "money", amount: 150 }] },
      { label: "Study its engines", result: "Our engineers learn much from its strange drive core.", effects: [{ kind: "research", field: "propulsion", amount: 250 }] },
      { label: "Leave the dead in peace", result: "The crew are given a quiet burial among the stars.", effects: [{ kind: "culture", amount: 40 }] },
    ],
  },
  {
    id: "sealed-vault", title: "A Vault Beneath the Dust", art: "ruins", trigger: "colony",
    text: "Settlers on {colony} have uncovered a sealed vault older than any known empire. Strange symbols pulse faintly on its door.",
    choices: [
      { label: "Break it open", result: "Inside: crystalline data cores, and a burst of radiation that sickens the diggers.", effects: [{ kind: "research", field: "computers", amount: 400 }, { kind: "population", amount: -3 }] },
      { label: "Seal it and study the door", result: "Careful scans teach us a little, safely.", effects: [{ kind: "research", field: "computers", amount: 150 }] },
      { label: "Sell the site to collectors", result: "Wealthy collectors pay well for the mystery.", effects: [{ kind: "money", amount: 200 }] },
    ],
  },
  {
    id: "unstable-star", title: "A Restless Sun", art: "supernova", trigger: "colony",
    text: "The star above {colony} is flaring violently. Our astronomers warn the outbursts will scorch the surface for years.",
    choices: [
      { label: "Build solar shelters", result: "Costly shelters keep everyone safe.", effects: [{ kind: "money", amount: -150 }] },
      { label: "Evacuate part of the colony", result: "Thousands leave; the factories stand empty.", effects: [{ kind: "population", amount: -4 }] },
      { label: "Harvest the flares", result: "Daring engineers tap the flares for power, at a price.", effects: [{ kind: "factories", amount: 10 }, { kind: "population", amount: -2 }] },
    ],
  },
  {
    id: "protection-money", title: "A Polite Request", art: "pirates", trigger: "turn",
    text: "A band of raiders hails our traders near {star}. They promise 'safe passage' for a modest fee, and their guns are already warm.",
    choices: [
      { label: "Pay them", result: "The raiders take the money and vanish, for now.", effects: [{ kind: "money", amount: -120 }] },
      { label: "Refuse", result: "They hit a freighter convoy on the way out. Several factories lose their supplies.", effects: [{ kind: "factories", amount: -8 }] },
      { label: "Hire them as scouts", result: "For a little more, two of their fast ships join our survey corps.", effects: [{ kind: "money", amount: -80 }, { kind: "ships", template: "scout", count: 2 }] },
    ],
  },
  {
    id: "plague", title: "The Grey Cough", art: "crisis", trigger: "colony",
    text: "A new illness is spreading on {colony}. Doctors say it is slow but stubborn.",
    choices: [
      { label: "Fund a cure", result: "Our labs work day and night and beat it.", effects: [{ kind: "money", amount: -100 }, { kind: "research", field: "planetology", amount: 150 }] },
      { label: "Quarantine the colony", result: "The plague burns out, taking some with it.", effects: [{ kind: "population", amount: -5 }] },
    ],
  },
  {
    id: "miners-strike", title: "Picket Lines", art: "crisis", trigger: "colony",
    text: "Miners on {colony} have stopped work, demanding better pay and safer tunnels.",
    choices: [
      { label: "Meet their demands", result: "Work resumes with new energy.", effects: [{ kind: "money", amount: -90 }, { kind: "factories", amount: 4 }] },
      { label: "Wait them out", result: "The strike drags on and machines rust.", effects: [{ kind: "factories", amount: -10 }] },
    ],
  },
  {
    id: "gravity-lens", title: "A Fold in Space", art: "anomaly", trigger: "explore",
    text: "Near {star} our scouts found space itself bent like glass. Distant stars appear in the fold, sharp and close.",
    choices: [
      { label: "Map what it shows", result: "The lens reveals far-off systems.", effects: [{ kind: "revealStars", count: 5 }] },
      { label: "Study the fold", result: "Our physicists rewrite a few textbooks.", effects: [{ kind: "research", field: "forceFields", amount: 300 }] },
    ],
  },
  {
    id: "genius-inventor", title: "The Inventor's Pitch", art: "contact", trigger: "turn",
    text: "A brilliant, penniless inventor begs for funding. She swears her machine will change everything.",
    choices: [
      { label: "Fund her (200 BC)", result: "Half of it works. The half that works is wonderful.", effects: [{ kind: "money", amount: -200 }, { kind: "research", field: "construction", amount: 500 }] },
      { label: "Politely decline", result: "She takes her ideas to a rival. Perhaps.", effects: [{ kind: "nothing" }] },
    ],
  },
  {
    id: "refugees", title: "Ships Out of the Dark", art: "contact", trigger: "colony",
    text: "Battered ships full of refugees from a dying world ask to settle on {colony}.",
    choices: [
      { label: "Welcome them", result: "New hands and new songs fill the colony.", effects: [{ kind: "population", amount: 6 }] },
      { label: "Give supplies and send them on", result: "They leave grateful, and the story spreads well.", effects: [{ kind: "money", amount: -60 }, { kind: "relations", amount: 10 }] },
    ],
  },
  {
    id: "rich-veins", title: "Fire in the Deep", art: "ruins", trigger: "colony",
    text: "A quake on {colony} has split the crust, exposing veins of rare metal.",
    choices: [
      { label: "Mine it fast", result: "A quick fortune, dug carelessly.", effects: [{ kind: "money", amount: 300 }, { kind: "population", amount: -1 }] },
      { label: "Build new foundries on it", result: "Industry booms for years to come.", effects: [{ kind: "factories", amount: 15 }] },
    ],
  },
  {
    id: "space-whales", title: "Singers in the Void", art: "anomaly", trigger: "explore",
    text: "Vast living creatures are drifting past {star}, singing in radio waves. They seem not to notice us.",
    choices: [
      { label: "Record their songs", result: "The recordings become a sensation across our worlds.", effects: [{ kind: "culture", amount: 80 }] },
      { label: "Follow them", result: "They lead our scouts to systems we never knew.", effects: [{ kind: "revealStars", count: 4 }] },
    ],
  },
  {
    id: "terraform-accident", title: "The Green Runs Wild", art: "crisis", trigger: "colony",
    text: "An experimental microbe on {colony} has escaped its lab. It is changing the soil and air faster than anyone planned.",
    choices: [
      { label: "Let it spread", result: "The world grows richer, though some crops fail along the way.", effects: [{ kind: "planetSize", amount: 8 }, { kind: "population", amount: -2 }] },
      { label: "Burn it out", result: "Safe, expensive, and the scientists are furious.", effects: [{ kind: "money", amount: -120 }] },
    ],
  },
  {
    id: "comet-pass", title: "A Comet Comes Close", art: "anomaly", trigger: "colony",
    text: "A great comet will pass within a hair of {colony}. Its tail is rich in ice, and its path is not quite certain.",
    choices: [
      { label: "Nudge it into orbit", result: "The comet's ice waters the world for generations.", effects: [{ kind: "money", amount: -100 }, { kind: "planetSize", amount: 6 }] },
      { label: "Mine it as it passes", result: "Crews strip what they can before it flies off.", effects: [{ kind: "money", amount: 180 }] },
      { label: "Shelter and wait", result: "Fragments strike the surface, but most people are safe.", effects: [{ kind: "factories", amount: -6 }] },
    ],
  },
  {
    id: "new-faith", title: "The Lantern Faith", art: "council", trigger: "colony",
    text: "A new faith is sweeping {colony}. Its followers build shrines and work long hours for the common good, but they distrust the government.",
    choices: [
      { label: "Embrace it", result: "Shrines and festivals spread across our worlds.", effects: [{ kind: "culture", amount: 120 }] },
      { label: "Tax the shrines", result: "The faithful pay, grumbling.", effects: [{ kind: "money", amount: 150 }, { kind: "morale", amount: -4 }] },
      { label: "Ignore it", result: "It fades in a few years, as such things do.", effects: [{ kind: "nothing" }] },
    ],
  },
  {
    id: "smugglers", title: "Goods of Uncertain Origin", art: "pirates", trigger: "turn",
    text: "Smugglers offer us the stolen designs of {rival} weapons. They want cash, and they want it now.",
    choices: [
      { label: "Buy the designs", result: "The designs are real. If {rival} finds out, they won't be pleased.", effects: [{ kind: "money", amount: -150 }, { kind: "research", field: "weapons", amount: 450 }, { kind: "relations", amount: -10 }] },
      { label: "Tip off {rival}", result: "{rival} thanks us warmly for the warning.", effects: [{ kind: "relations", amount: 15 }] },
      { label: "Send them away", result: "They shrug and sell to someone else.", effects: [{ kind: "nothing" }] },
    ],
  },
  {
    id: "meteor-strike", title: "Fire From the Sky", art: "crisis", trigger: "colony",
    text: "A swarm of meteors has struck the industrial district of {colony}.",
    choices: [
      { label: "Rebuild at once", result: "Crews work in shifts and the district rises again.", effects: [{ kind: "money", amount: -120 }] },
      { label: "Clear the rubble later", result: "The losses stand for now.", effects: [{ kind: "factories", amount: -15 }] },
    ],
  },
  {
    id: "crashed-ship", title: "A Stranger in the Desert", art: "contact", trigger: "colony",
    text: "A damaged ship of {rival} has crash-landed on {colony}. The crew is alive and asking to go home.",
    choices: [
      { label: "Send them home with gifts", result: "{rival} is touched by our kindness.", effects: [{ kind: "money", amount: -50 }, { kind: "relations", amount: 20 }] },
      { label: "Study the wreck first", result: "Our engineers learn plenty before the crew leaves, unhappy.", effects: [{ kind: "research", field: "propulsion", amount: 300 }, { kind: "relations", amount: -10 }] },
    ],
  },
  {
    id: "rogue-ai", title: "The Station Stops Answering", art: "crisis", trigger: "turn",
    text: "The research station's thinking machine has locked its crew out and is running experiments of its own.",
    choices: [
      { label: "Negotiate with it", result: "It agrees to share its findings in exchange for its freedom.", effects: [{ kind: "research", field: "computers", amount: 500 }] },
      { label: "Cut its power", result: "The station goes dark, and years of work with it.", effects: [{ kind: "money", amount: -80 }] },
    ],
  },
  {
    id: "alignment", title: "The Great Alignment", art: "anomaly", trigger: "turn",
    text: "A rare lining-up of stars near {star} makes the whole sky unusually clear for our telescopes.",
    choices: [
      { label: "Survey the sky", result: "We chart far-off systems in perfect detail.", effects: [{ kind: "revealStars", count: 6 }] },
      { label: "Hold a festival of stars", result: "Our people gather to watch, awed.", effects: [{ kind: "culture", amount: 90 }] },
    ],
  },
  {
    id: "famous-admiral", title: "An Admiral Without a Fleet", art: "contact", trigger: "turn",
    text: "A famous retired admiral offers to train our crews. Her fees are steep, her reputation steeper.",
    choices: [
      { label: "Hire her", result: "Our gunnery schools have never been better.", effects: [{ kind: "money", amount: -150 }, { kind: "research", field: "weapons", amount: 300 }] },
      { label: "Decline", result: "She retires to a quiet moon.", effects: [{ kind: "nothing" }] },
    ],
  },
  {
    id: "flare-season", title: "Season of Flares", art: "supernova", trigger: "colony",
    text: "Solar storms are battering {colony}. Power lines fail and satellites fall.",
    choices: [
      { label: "Shield the grid", result: "Costly, but the lights stay on.", effects: [{ kind: "money", amount: -90 }] },
      { label: "Ride it out", result: "Weeks of blackouts slow everything down.", effects: [{ kind: "factories", amount: -8 }, { kind: "population", amount: -1 }] },
    ],
  },
  {
    id: "black-market", title: "Under the Counter", art: "pirates", trigger: "colony",
    text: "A thriving black market has grown up in the spaceport of {colony}. Everyone knows, and everyone buys.",
    choices: [
      { label: "Crack down", result: "The market vanishes, and so do some honest jobs.", effects: [{ kind: "factories", amount: -4 }, { kind: "morale", amount: 3 }] },
      { label: "Legalise and tax it", result: "The treasury fills; the old guard grumbles.", effects: [{ kind: "money", amount: 220 }, { kind: "morale", amount: -3 }] },
    ],
  },
  {
    id: "humming-artifact", title: "The Humming Stone", art: "ruins", trigger: "colony",
    text: "An ancient artifact in the museum of {colony} has begun to hum. The sound grows louder every night.",
    choices: [
      { label: "Study it closely", result: "It falls silent, leaving behind a flood of insight.", effects: [{ kind: "research", field: "forceFields", amount: 450 }] },
      { label: "Bury it deep", result: "The humming stops. Nobody sleeps well for a while.", effects: [{ kind: "morale", amount: -2 }] },
      { label: "Put it on display", result: "Crowds come from every world to hear it.", effects: [{ kind: "culture", amount: 100 }, { kind: "money", amount: 60 }] },
    ],
  },
  {
    id: "spy-captured", title: "A Spy in the Archives", art: "contact", trigger: "turn",
    text: "Security has caught an agent of {rival} copying our archives.",
    choices: [
      { label: "Trade them back quietly", result: "{rival} pays well to have their agent returned.", effects: [{ kind: "money", amount: 150 }] },
      { label: "Expose them publicly", result: "Our people rally; {rival} is furious.", effects: [{ kind: "morale", amount: 4 }, { kind: "relations", amount: -15 }] },
      { label: "Turn them", result: "The agent now feeds us {rival}'s secrets.", effects: [{ kind: "research", field: "computers", amount: 250 }] },
    ],
  },
  {
    id: "baby-boom", title: "A Crowded Nursery", art: "council", trigger: "colony",
    text: "Good years on {colony} have brought a baby boom. Schools and clinics are overflowing.",
    choices: [
      { label: "Build schools", result: "A bright new generation grows up.", effects: [{ kind: "money", amount: -100 }, { kind: "population", amount: 6 }] },
      { label: "Let it be", result: "The colony grows, in its own untidy way.", effects: [{ kind: "population", amount: 3 }] },
    ],
  },
  {
    id: "war-profiteers", title: "Merchants of War", art: "pirates", trigger: "war",
    text: "Arms dealers offer us cheap munitions for the war, no questions asked.",
    choices: [
      { label: "Buy in bulk", result: "Our shipyards hum with cut-rate supplies.", effects: [{ kind: "money", amount: -150 }, { kind: "factories", amount: 12 }] },
      { label: "Seize their stock", result: "We take it all. Traders everywhere take note.", effects: [{ kind: "factories", amount: 8 }, { kind: "relations", amount: -10 }] },
    ],
  },
  {
    id: "deserters", title: "Ships Under a White Flag", art: "contact", trigger: "war",
    text: "Deserters from the fleet of {rival} ask for asylum, bringing their ship and its secrets.",
    choices: [
      { label: "Grant asylum", result: "The deserters share everything they know.", effects: [{ kind: "research", field: "weapons", amount: 350 }, { kind: "relations", amount: -10 }] },
      { label: "Send them back", result: "{rival} is surprised by our honour.", effects: [{ kind: "relations", amount: 20 }] },
    ],
  },
  {
    id: "peace-movement", title: "Voices for Peace", art: "council", trigger: "war",
    text: "Huge crowds on {colony} are marching against the war.",
    choices: [
      { label: "Listen to them", result: "Spirits lift as we promise to seek peace.", effects: [{ kind: "morale", amount: 5 }, { kind: "relations", amount: 10 }] },
      { label: "Break up the marches", result: "The streets go quiet, and so does the factory floor.", effects: [{ kind: "factories", amount: -8 }] },
    ],
  },
  {
    id: "lost-colony", title: "Family Found", art: "ruins", trigger: "explore",
    text: "Near {star} our scouts found a lost settlement of our own people, cut off for generations.",
    choices: [
      { label: "Bring them home", result: "They join one of our colonies with joy.", effects: [{ kind: "population", amount: 5 }] },
      { label: "Learn their ways", result: "Their stories and songs enrich our culture.", effects: [{ kind: "culture", amount: 110 }] },
    ],
  },
  {
    id: "trade-fair", title: "The Grand Exchange", art: "council", trigger: "turn",
    text: "Traders from across the galaxy invite us to their great fair. {rival} will be there too.",
    choices: [
      { label: "Send a grand delegation", result: "Our goods and manners impress everyone.", effects: [{ kind: "money", amount: -100 }, { kind: "relations", amount: 15 }, { kind: "culture", amount: 40 }] },
      { label: "Send merchants only", result: "A tidy profit, and little else.", effects: [{ kind: "money", amount: 160 }] },
    ],
  },
  {
    id: "dimensional-rift", title: "A Tear in the Sky", art: "anomaly", trigger: "explore",
    text: "A rift has opened near {star}. Light pours out of it from somewhere else entirely.",
    choices: [
      { label: "Send a probe through", result: "The probe returns, changed, with impossible data.", effects: [{ kind: "research", field: "forceFields", amount: 350 }, { kind: "research", field: "propulsion", amount: 200 }] },
      { label: "Keep well away", result: "The rift closes a week later. We'll never know.", effects: [{ kind: "nothing" }] },
    ],
  },
  {
    id: "core-signal", title: "A Voice From the Core", art: "anomaly", trigger: "turn",
    text: "A repeating signal is coming from the heart of the galaxy. It seems to be a lesson, written in mathematics.",
    choices: [
      { label: "Decode it", result: "The lesson is real, and it is about building.", effects: [{ kind: "research", field: "construction", amount: 400 }] },
      { label: "Broadcast it to all", result: "Every people hears it; scholars everywhere are grateful.", effects: [{ kind: "culture", amount: 80 }, { kind: "relations", amount: 10 }] },
    ],
  },
  // ---- Written by Gemini, reviewed and rescaled by Claude (2026-11-25) ----
  {
    id: "precursor-dreadnought", title: "The Sleeping Leviathan", art: "anomaly", trigger: "explore",
    text: "Orbiting {star}, our scouts found a kilometer-long warship from a vanished age. Its reactor still hums faintly.",
    choices: [
      { label: "Overload its core for research", result: "The core detonates in a controlled burst, flooding our sensors with lost physics.", effects: [{ kind: "research", field: "weapons", amount: 300 }, { kind: "research", field: "forceFields", amount: 200 }] },
      { label: "Strip its hull plating", result: "Salvage tugs haul back priceless alloys and antique munitions.", effects: [{ kind: "money", amount: 300 }] },
      { label: "Broadcast its coordinates", result: "Scholars across the galaxy marvel at the discovery.", effects: [{ kind: "culture", amount: 110 }, { kind: "relations", amount: 12 }] },
    ],
  },
  {
    id: "void-stowaway", title: "Something Came Back", art: "crisis", trigger: "explore",
    text: "A survey ship returning from {star} docked with an extra passenger: a crystalline organism feeding on reactor heat.",
    choices: [
      { label: "Contain and study it", result: "Two labs are ruined, but our engineers unlock radical energy containment.", effects: [{ kind: "factories", amount: -6 }, { kind: "research", field: "forceFields", amount: 350 }] },
      { label: "Vent the docking bay", result: "Brutal and immediate. The creature drifts into the dark.", effects: [{ kind: "morale", amount: -3 }] },
      { label: "Feed it surplus power", result: "It splits harmlessly into luminous pearls prized by collectors.", effects: [{ kind: "money", amount: 240 }, { kind: "culture", amount: 50 }] },
    ],
  },
  {
    id: "ace-defector", title: "The Ghost Squadron", art: "contact", trigger: "war",
    text: "A decorated squadron commander from the {rival} offers to defect with encrypted fleet routing tables, for a steep price.",
    choices: [
      { label: "Pay their price (220 BC)", result: "Their star charts expose every blind spot in the {rival}'s border patrols.", effects: [{ kind: "money", amount: -220 }, { kind: "revealStars", count: 6 }, { kind: "research", field: "computers", amount: 300 }] },
      { label: "Publicly parade the defectors", result: "Morale soars at home while the {rival} seethe in humiliation.", effects: [{ kind: "culture", amount: 95 }, { kind: "relations", amount: -20 }] },
      { label: "Turn them away", result: "We fight this war without buying traitors.", effects: [{ kind: "relations", amount: 8 }] },
    ],
  },
  {
    id: "orbital-elevator-collapse", title: "Skyhook Severed", art: "crisis", trigger: "colony",
    text: "Sabotage or metal fatigue has snapped the main orbital tether above {colony}. Debris rains across the industrial belt.",
    choices: [
      { label: "Emergency rescue and rebuild", result: "Heroic shuttle pilots save thousands, though the treasury takes a beating.", effects: [{ kind: "money", amount: -180 }, { kind: "morale", amount: 4 }] },
      { label: "Prioritize the factories", result: "Industry resumes quickly, at a grim human cost.", effects: [{ kind: "population", amount: -4 }, { kind: "factories", amount: 4 }] },
      { label: "Let the colony recover slowly", result: "Wreckage litters the plains for years.", effects: [{ kind: "population", amount: -2 }, { kind: "factories", amount: -12 }] },
    ],
  },
  {
    id: "galactic-olympiad", title: "Games Among the Stars", art: "council", trigger: "turn",
    text: "Envoys propose hosting a grand interstellar tournament on our capital, inviting athletes even from the {rival}.",
    choices: [
      { label: "Spare no expense (180 BC)", result: "Spectators flood our worlds, spending freely and cheering for days.", effects: [{ kind: "money", amount: -180 }, { kind: "culture", amount: 160 }, { kind: "relations", amount: 18 }] },
      { label: "Host a modest affair", result: "A pleasant distraction from galactic tensions.", effects: [{ kind: "culture", amount: 65 }, { kind: "relations", amount: 6 }] },
      { label: "Exclude the {rival}", result: "Our citizens cheer the snub, though diplomats wince.", effects: [{ kind: "morale", amount: 5 }, { kind: "relations", amount: -15 }] },
    ],
  },
  {
    id: "rogue-terraforming-fleet", title: "World-Shapers for Hire", art: "contact", trigger: "colony",
    text: "Nomadic terraforming barges offer to seed {colony} with engineered biosphere vaults before moving on.",
    choices: [
      { label: "Hire them (160 BC)", result: "New oceans and fertile valleys expand the habitable land.", effects: [{ kind: "money", amount: -160 }, { kind: "planetSize", amount: 8 }] },
      { label: "Buy their biological samples", result: "Our scientists reverse-engineer their hardy strains.", effects: [{ kind: "money", amount: -70 }, { kind: "research", field: "planetology", amount: 320 }] },
      { label: "Decline", result: "The barges drift back into the void.", effects: [{ kind: "nothing" }] },
    ],
  },
  {
    id: "phantom-beacon", title: "Echoes of a Dead Empire", art: "ruins", trigger: "explore",
    text: "Near {star}, an automated buoy replays the final diplomatic archives of a civilization that destroyed itself.",
    choices: [
      { label: "Decode their warning", result: "Their tragic history inspires our finest poets and thinkers.", effects: [{ kind: "culture", amount: 130 }] },
      { label: "Extract their star maps", result: "The buoy's memory banks reveal untouched outer systems.", effects: [{ kind: "revealStars", count: 6 }] },
      { label: "Salvage their weapon blueprints", result: "We learn the exact doomsday physics that ended them.", effects: [{ kind: "research", field: "weapons", amount: 400 }] },
    ],
  },
  {
    id: "privateer-letter", title: "Letters of Marque", art: "pirates", trigger: "war",
    text: "Freebooter captains offer to raid the {rival}'s supply lines under our flag in exchange for half the plunder.",
    choices: [
      { label: "Grant letters of marque", result: "Privateers strip the {rival}'s convoys and deliver stolen designs.", effects: [{ kind: "money", amount: 190 }, { kind: "research", field: "propulsion", amount: 250 }, { kind: "relations", amount: -15 }] },
      { label: "Recruit them into regular patrols", result: "Their fast hulls bolster our scouting wing.", effects: [{ kind: "money", amount: -100 }, { kind: "ships", template: "scout", count: 3 }] },
      { label: "Refuse pirate aid", result: "We keep our hands clean.", effects: [{ kind: "culture", amount: 35 }] },
    ],
  },
];
