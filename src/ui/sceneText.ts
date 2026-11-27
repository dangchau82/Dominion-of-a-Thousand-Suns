// Words for the race scenes (written by Claude 2). One line per race per scene, shown under
// the picture. Original text. `{star}`, `{tech}` and `{rival}` are filled in by scenes.ts.

export type SceneKind = "colony" | "science" | "spy" | "war" | "invasion";

export const SCENE_TITLES: Record<SceneKind, string> = {
  colony: "A New World",
  science: "A Breakthrough",
  spy: "Mission Complete",
  war: "War",
  invasion: "Conquest",
};

type Lines = Record<SceneKind, string>;

export const SCENE_LINES: Record<string, Lines> = {
  humans: {
    colony: "The flag goes up on {star}. By nightfall there is already a town council.",
    science: "{tech}: published, peer-reviewed, and already licensed to three trade partners.",
    spy: "A handshake, a smile, a copied file. The Accord's diplomats never travel alone.",
    war: "Talks have failed. The Accord's fleets move out with the same patience they negotiated with.",
    invasion: "Marines hold {star}. The governor's first order: open the markets.",
  },
  vossari: {
    colony: "Survey drones blanket {star}. Every grain of sand is catalogued before the first dome rises.",
    science: "{tech}. The Vossari had predicted it to the decimal; now they can prove it.",
    spy: "Their sensors never registered our probe. Their data now sits in our archive.",
    war: "The Vossari have calculated the outcome. They see no reason to wait for it.",
    invasion: "{star} falls on schedule. The occupation runs to a timetable accurate to the second.",
  },
  kethrak: {
    colony: "The broodships split open over {star}. Within a season, the jungle hums with new hives.",
    science: "{tech}: the Hive learned it the way it learns everything, all at once.",
    spy: "A single drone, a single scent. The enemy's nest now answers to ours.",
    war: "The Hive turns, ten billion minds with one hunger. The swarm is coming.",
    invasion: "{star} is overrun. The Hive does not occupy a world. It digests it.",
  },
  ashkari: {
    colony: "An Ashkari banner is driven into the rock of {star}. It will never come down.",
    science: "{tech}. The war-smiths are already asking how it can kill.",
    spy: "Our blades in their house struck clean. Their honour bleeds; ours is untouched.",
    war: "The war-horns sound across the Dominion. Every Ashkari was born for this day.",
    invasion: "{star} is taken by blade and fire. The spoils are counted before the smoke clears.",
  },
  lumen: {
    colony: "The Choir sings {star} awake. The oceans answer in a voice only we can hear.",
    science: "{tech} came to us in a dream shared by a thousand minds at once.",
    spy: "We walked through their thoughts and left no footprints.",
    war: "The Choir's song turns cold. Every enemy captain hears it, and none can stop listening.",
    invasion: "{star} surrenders before the first shot. Their minds had already gone quiet.",
  },
  thraal: {
    colony: "The Thraal sink into the stone of {star} and begin, very slowly, to make it home.",
    science: "{tech}. Ten generations of patient work, finished in a single grinding afternoon.",
    spy: "Our agent sat still in their vault for a year. They thought it was a rock.",
    war: "The mountains move. When the Thraal go to war, they do not stop.",
    invasion: "{star} is ground down beneath us. We will eat its mountains at our leisure.",
  },
  seraphine: {
    colony: "Seraphine landers spiral down to {star} in perfect formation, each touching down on its mark.",
    science: "{tech}: our pilots were flying it before the engineers finished the paperwork.",
    spy: "In and out under their sensor net, one wingbeat from disaster, and home for supper.",
    war: "The squadrons launch. Nothing in the galaxy flies like the Seraphine, and today everyone will see it.",
    invasion: "Our dropships land on {star} exactly where we said they would. Resistance ends within the hour.",
  },
  orrun: {
    colony: "The Consortium opens its newest branch office on {star}. Shares are already up.",
    science: "{tech}. Patented, packaged, and priced for every market in the galaxy.",
    spy: "A bribe, a ledger, a quiet transfer. Their secrets are now our assets.",
    war: "The Consortium has decided war is profitable. The mercenaries are already paid.",
    invasion: "{star} is under new management. Contracts will be honoured. Some of them.",
  },
  nyx: {
    colony: "Nyx fabricators land on {star} and begin printing the first of a million new bodies.",
    science: "{tech}: integrated into every unit of the Collective in 0.003 seconds.",
    spy: "Our code slipped into their network. Their machines now dream of us.",
    war: "The Collective deploys. Armoured frames march out of the foundries, every gun already hot.",
    invasion: "Nyx war-frames walk through the fire on {star}, guns blazing, and do not stop until it is quiet.",
  },
  velari: {
    colony: "A Velari seer walks the hills of {star} and names it in a language older than stars.",
    science: "{tech}. The mystics say it was always there; we only had to stop looking past it.",
    spy: "A whisper in the right ear at the right hour. They will never know which thought was ours.",
    war: "The Velari unveil weapons they swore never to use. The stars themselves seem to hold their breath.",
    invasion: "{star} bows to the Velari. Its temples will be rebuilt more beautiful than before.",
  },
  drovani: {
    colony: "Drovani pods splash down into the seas of {star}. The deep is home now.",
    science: "{tech}, carried up from the trenches where the oldest Drovani still think.",
    spy: "Like a current in the dark, our agents came and went. Their secrets drift to us.",
    war: "The Drovani rise from the deep, and the tide comes with them.",
    invasion: "The seas of {star} are ours. On land, they will learn to swim or leave.",
  },
  gorrath: {
    colony: "The clan-ships circle {star} three times, then make camp. The hearth fires are lit.",
    science: "{tech}. Traded, stolen or won in a wager; the clans don't care which.",
    spy: "Our scout rode into their camp as a trader and rode out with their maps.",
    war: "The war drums carry from ship to ship. The Gorrath clans ride together.",
    invasion: "{star} is plundered and claimed. The clans will winter here.",
  },
  ixil: {
    colony: "Ixil seed-carriers bond with the jungle of {star}. Soon it will be hard to tell where one ends.",
    science: "{tech}, learned from a host who never knew they were teaching.",
    spy: "Our symbiote rides inside their minister. He has never felt better.",
    war: "The Ixil host-armies stir. Every soldier carries two minds, and both want war.",
    invasion: "{star} is joined to us. Its people will come to love the bond.",
  },
  verdane: {
    colony: "Verdane seeds take root on {star}. In ten years it will be forest from pole to pole.",
    science: "{tech}. It grew in our labs the way everything grows here: slowly, then everywhere.",
    spy: "A spore drifted into their capital. It has been listening ever since.",
    war: "The Verdane forests close their canopies. What grows now has thorns.",
    invasion: "Roots crack the fortresses of {star}. The forest reclaims what was always going to be ours.",
  },
  quorai: {
    colony: "A Quorai spark descends into the light of {star} and begins to burn as one of us.",
    science: "{tech}. For a moment, every Quorai flared a little brighter.",
    spy: "We passed through their walls as light. Their secrets now shine in our core.",
    war: "The Quorai blaze white-hot. Their enemies will remember the colour of that light.",
    invasion: "{star} burns with our fire now. Nothing that does not shine will stay.",
  },
  raxxan: {
    colony: "The Reavers bolt three wrecks together on {star} and call it a city. It works.",
    science: "{tech}, pried from a hull we found drifting. Finders keepers.",
    spy: "Our crew broke in, took the good bits and left the lights on.",
    war: "Every Raxxan hull is patched, rusted and armed to the teeth. The Reavers are hunting.",
    invasion: "{star} is ours, and so is everything in it that isn't bolted down. The rest we'll unbolt.",
  },
  ruuvak: {
    colony: "Ruuvak broods pour onto {star}. Next week there will be twice as many. The week after, more.",
    science: "{tech}. A million young minds tried at once; one of them got it right.",
    spy: "We sent so many agents they could not catch them all. One was enough.",
    war: "The Brood is uncountable and it is angry. The warrens empty onto the transports.",
    invasion: "Wave after wave lands on {star}. The defenders run out of bullets before we run out of Ruuvak.",
  },
  tarkhan: {
    colony: "Tarkhan hunters stake out {star}. Good ground, good game, good lines of fire.",
    science: "{tech}. The gunnery masters will have it on every barrel by morning.",
    spy: "One shot, from very far away, at exactly the right moment.",
    war: "The Hunt has begun. Tarkhan guns always fire first.",
    invasion: "{star} is taken one clean shot at a time. The Hunt claims its trophy.",
  },
};

/** A neutral line for any race without its own (mods, rebels). */
export const DEFAULT_LINES: Lines = {
  colony: "Our first settlers set foot on {star}.",
  science: "Our scientists have mastered {tech}.",
  spy: "Our agents have completed their mission.",
  war: "We are at war with {rival}.",
  invasion: "{star} is ours.",
};
