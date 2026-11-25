// New rival lines for 6 moments (battles, betrayal, council wins, prophecies, begging), all 18 races.
// Written by Gemini (hard pack 5, 2026-11-25, two chats), checked by Claude; rules built by Claude.
// Placeholders: {leader} (their own empire name), {empire} (the one they speak to), {star}.

export interface NewLines {
  battleWon: string[]; // after they beat our fleet
  battleLost: string[]; // after we beat theirs
  betrayed: string[]; // when we break a treaty with them
  councilWin: string[]; // when they win a council vote or resolution
  prophecy: string[]; // sharing a cryptic warning with a friend
  begging: string[]; // when they are nearly destroyed and plead for mercy
}

export type NewMoment = keyof NewLines;

export const NEW_DIALOGUE: Record<string, NewLines> = {
  humans: {
    battleWon: [
      "Our crews held the line near {star} today, though every hull lost on either side weighs heavily.",
      "The {leader} carried the day at {star}, {empire}. Let us find a path back to peace before more lives are spent.",
    ],
    battleLost: [
      "Our ships fell back from {star} in good order. A hard blow for the {leader}, yet our resolve holds.",
      "You took the field this time, {empire}. Even so, the {leader} stands firm by its principles.",
    ],
    betrayed: [
      "Breaking a solemn pact with the {leader} harms more than trust, {empire}. History will judge this breach.",
      "We entered our treaty in good faith, {empire}. Shattering it tears down years of shared work.",
    ],
    councilWin: [
      "The council has decided, and the {leader} welcomes this step toward steady order.",
      "Fair debate brought a clear vote today. The {leader} thanks all who stood for stability.",
    ],
    prophecy: [
      "Our sensors read dark weather gathering past {star}, {empire}. Keep your squadrons ready before it hits.",
      "Friends warn each other early: something restless stirs in the dark near {star}, {empire}.",
    ],
    begging: [
      "Our worlds lie scarred, {empire}. Grant mercy to the {leader}, and let survivors rebuild in peace.",
      "We lack the strength to keep fighting, {empire}. Spare our remaining people and accept our plea.",
    ],
  },
  vossari: {
    battleWon: [
      "Engagement near {star} confirmed hull failure projections on your vessels, {empire}. Telemetry archived.",
      "Tactical models held at {star}. Continued resistance shows diminishing returns for the {empire}.",
    ],
    battleLost: [
      "Unmodeled weapon output near {star} disrupted our formation. Recalibrating defense matrices now.",
      "A setback at {star}, {empire}. Our analysts are already computing counters to your fleet.",
    ],
    betrayed: [
      "Treaty breach logged, {empire}. Trust probability for your regime drops to its floor.",
      "Repudiating an accord with the {leader} is statistically reckless, {empire}. Expect firm responses.",
    ],
    councilWin: [
      "Empirical alignment favored the {leader}'s proposal. Structured governance advances across the sector.",
      "The council vote validates the optimal course. The {leader} moves to implementation.",
    ],
    prophecy: [
      "Anomaly readings near {star} indicate acute instability ahead, {empire}. Reinforce installations accordingly.",
      "Long-range arrays flag a high-probability crisis near {star}, {empire}. Disregard at your risk.",
    ],
    begging: [
      "Colony stability falling below viable limits, {empire}. Cease fire and preserve {leader} research cores.",
      "Survival odds approach zero, {empire}. Spare remaining scientists so data is not lost.",
    ],
  },
  kethrak: {
    battleWon: [
      "Shattered hulls drift around {star}! The {leader} strips your wrecks to feed the hungry swarm.",
      "Your ships snap like dry shells at {star}, {empire}. The hive rejoices in the feast!",
    ],
    battleLost: [
      "Lost brood-ships near {star} will be bred tenfold! The {leader} never runs out of claws!",
      "You crushed one limb at {star}, {empire}, yet the hive still has ten thousand more!",
    ],
    betrayed: [
      "Oath-breaker! The {leader} smells your treachery and marks every {empire} world for the swarm!",
      "You broke faith with the {leader}, {empire}! Now the hive pours through every gap!",
    ],
    councilWin: [
      "Countless voices bend to the {leader}'s mass! The swarm claims its prize in council!",
      "The council yields to our numbers, {empire}! What the hive decrees now rules!",
    ],
    prophecy: [
      "The brood-queens feel tremors toward {star}, {empire}. Great fire or deep hunger wakes soon!",
      "Hive senses buzz sharp around {star}, {empire}. Something huge is about to strike!",
    ],
    begging: [
      "The queens are cornered and cold, {empire}! Spare the last broods of the {leader}!",
      "Our hives are smoking and torn, {empire}! Let small remnants crawl away and live!",
    ],
  },
  ashkari: {
    battleWon: [
      "Your hulls break easily against Ashkari iron, {empire}. Send stronger steel next time.",
      "Another victory forged in fire! The {leader} claims the spoils of your shattered fleet.",
    ],
    battleLost: [
      "A clean strike, {empire}. Enjoy your trophy today, for the {leader} repays blood tenfold.",
      "You bent our blades, not our will. The {leader} sharpens its wrath for the next clash.",
    ],
    betrayed: [
      "You strike from the dark like a coward, {empire}! The {leader} will mount your banner on a spear!",
      "A broken oath stains your honor forever, {empire}. Prepare to meet our steel face to face!",
    ],
    councilWin: [
      "Strength commands respect, and the {leader} now holds the council gavel. Fall in line, {empire}.",
      "The galaxy bows to true might! Even you must abide by the {leader}'s decree, {empire}.",
    ],
    prophecy: [
      "Listen well, ally. A dark storm gathers near {star}, and even iron hulls will be tested.",
      "Our seers smell ash on the solar winds by {star}. Keep your blades honed and your guard high.",
    ],
    begging: [
      "Our last redoubts burn, {empire}... Stay your hand, and the {leader} will bend the knee in peace.",
      "We have fought with honor to the bitter end. Spare the {leader}'s remnant, {empire}, and accept our truce.",
    ],
  },
  lumen: {
    battleWon: [
      "Your captains' minds grew loud with panic before the end, {empire}. Now there is only quiet.",
      "We sang your fleet into stillness, {empire}. Do not send more troubled minds to suffer the same.",
    ],
    battleLost: [
      "A sharp, discordant shock... Your pilots struck before our chorus could steady, {empire}.",
      "You silenced our vanguard today, {empire}, yet our deeper song still echoes across the void.",
    ],
    betrayed: [
      "We felt the cold treachery form in your minds before you struck, {empire}. How hollow you are.",
      "You shattered a fragile harmony, {empire}. The {leader} will never trust your silent thoughts again.",
    ],
    councilWin: [
      "The galaxy's many voices have found a single chord. Rejoice with the {leader}, {empire}.",
      "Calm reason prevails in the chamber today. Let this decree bring peace to your turbulent minds, {empire}.",
    ],
    prophecy: [
      "A heavy sorrow ripples through the deep chorus near {star}, friend. Tread gently if your ships pass there.",
      "We sense an ancient discord waking around {star}. Shield your crews' minds before approaching.",
    ],
    begging: [
      "Our song is fading to a whisper, {empire}... Please, let the {leader} survive in quiet peace.",
      "Have mercy on our few remaining voices, {empire}. End this bloodshed before our light goes out forever.",
    ],
  },
  thraal: {
    battleWon: [
      "Your ships broke like brittle shale against our hulls, {empire}. Stillness returns to the void.",
      "The {leader} stood unmoved, and your fleet crumbled away. Do not test the mountain again.",
    ],
    battleLost: [
      "Even granite chips under a heavy hammer, {empire}. We will take our time to mend.",
      "A swift blow from a fleeting race. The {leader} endures, and we will remember this crack.",
    ],
    betrayed: [
      "You swore an oath as light as dust, {empire}. Stone does not forget a traitor's weight.",
      "We trusted your word to hold firm, {empire}. Now only cold bedrock awaits your ships.",
    ],
    councilWin: [
      "Slow patience outweighs hasty noise. The council settles upon the {leader}'s foundation, {empire}.",
      "The chamber has chosen permanence over whim. Abide by the {leader}'s steady decree, {empire}.",
    ],
    prophecy: [
      "Deep tremors echo through the crust of {star}, friend. Something old shifts beneath the stone.",
      "Our elders feel a slow, grinding danger gathering at {star}. Do not anchor there unprepared.",
    ],
    begging: [
      "Only rubble remains of our peaks, {empire}... Let the {leader} rest in peace before we are dust.",
      "We are worn down to gravel, {empire}. Grant the {leader} a quiet truce so our last stones endure.",
    ],
  },
  seraphine: {
    battleWon: [
      "Our wings swept {star} with effortless precision while your ships stumbled, {empire}.",
      "A graceful triumph for the {leader} near {star}. Even in victory, we keep our poise.",
    ],
    battleLost: [
      "A sharp gust ruffled our feathers at {star}, {empire}, yet our flight is far from over.",
      "You clipped a wing near {star}, {empire}. The {leader} rises again with keener sight.",
    ],
    betrayed: [
      "How unseemly to break a pledge with the {leader}, {empire}. Such bad form leaves a stain.",
      "You turned on a signed word, {empire}. Now watch how swiftly our talons strike.",
    ],
    councilWin: [
      "The council chamber tilted toward the {leader} today, {empire}. Elegance carries weight.",
      "Our motion soared through the vote with ease. The {leader} guides the high wind now.",
    ],
    prophecy: [
      "High winds shift above {star}, {empire}. Keep your wings tucked and your eyes sharp.",
      "Our sky-watchers read a sudden squall near {star}, {empire}. Beware what gathers there.",
    ],
    begging: [
      "Our highest perches are shattered, {empire}. Spare the {leader} a little sky to breathe.",
      "We yield our pride in the dust, {empire}. Have mercy on the remnants of the {leader}.",
    ],
  },
  orrun: {
    battleWon: [
      "Assets seized around {star} and losses booked cleanly, {empire}. The {leader} profits again.",
      "Your ships overextended near {star}, {empire}. A costly lesson in market risk.",
    ],
    battleLost: [
      "A write-off near {star}, {empire}, though our capital reserves remain healthy.",
      "You took the margin at {star} today, {empire}. The {leader} will adjust its rates.",
    ],
    betrayed: [
      "Defaulting on a contract with the {leader} ruins your credit across the sector, {empire}.",
      "You tore up our ledger, {empire}. Collection agents of the {leader} are inbound.",
    ],
    councilWin: [
      "The {leader} closed the deal in council today, {empire}. Sound terms always win.",
      "Majority shares swung to the {leader} in the vote. Business moves forward on our terms.",
    ],
    prophecy: [
      "Market indicators near {star} flash heavy volatility ahead, {empire}. Hedge your exposure early.",
      "Our trade scouts report sharp trouble brewing by {star}, {empire}. Insure your routes now.",
    ],
    begging: [
      "Our ledgers are in the red and our vaults breached, {empire}. Restructure terms and spare the {leader}!",
      "Bankruptcy looms over every world we hold, {empire}. Accept a settlement and let the {leader} survive.",
    ],
  },
  nyx: {
    battleWon: [
      "Engagement at {star} resolved in favor of {leader}. Probability of {empire} recovery: low.",
      "Hull failure rate for {empire} near {star} matched projection. Unit expenditure minimal.",
    ],
    battleLost: [
      "Tactical variance detected at {star}. {leader} models recalibrating for {empire} weaponry.",
      "Loss registered near {star}. Fleet replacement scheduled; {empire} advantage remains temporary.",
    ],
    betrayed: [
      "Treaty breach logged from {empire}. Cooperative probability reduced to zero point zero.",
      "Contract termination by {empire} noted. {leader} shifts allocation to hostile response.",
    ],
    councilWin: [
      "Vote tally favors {leader}. Statistical consensus achieved across participating delegations.",
      "Resolution passed for {leader}. Compliance metrics updated for {empire}.",
    ],
    prophecy: [
      "Telemetry anomalies near {star} project high-impact disruption, {empire}. Probability exceeds eighty percent.",
      "Sensor patterns around {star} indicate impending crisis, {empire}. Recommend defensive posture.",
    ],
    begging: [
      "Core systems critical across {leader} nodes, {empire}. Requesting cessation to preserve surviving units.",
      "Survival probability below five percent, {empire}. Suspend hostilities and retain remnant capacity.",
    ],
  },
  velari: {
    battleWon: [
      "The glass turned at {star}, and your fleet fell where the pattern foretold, {empire}.",
      "Stars aligned for the {leader} near {star}. What seemed chance was already woven.",
    ],
    battleLost: [
      "One thread snapped at {star}, {empire}, yet the loom of the {leader} holds unbroken.",
      "A shadow crossed {star} today, {empire}. Wait until the next turn of the wheel.",
    ],
    betrayed: [
      "You broke the oath sworn before the stars, {empire}. The {leader} sees the dark omen you invite.",
      "A bitter turn of the glass, {empire}. Breaking faith with the {leader} carries a heavy price.",
    ],
    councilWin: [
      "The council's mirror reflects the {leader} today, {empire}. A long design moves into view.",
      "The vote turns toward the {leader}. What is written in starlight begins to take shape.",
    ],
    prophecy: [
      "A strange eclipse gathers near {star}, {empire}. Read the signs before the hour strikes.",
      "Our watchers see a turning point near {star}, {empire}. Guard what you hold dear.",
    ],
    begging: [
      "Our sands are nearly run and our towers darkened, {empire}. Spare the {leader} one last breath.",
      "The wheel grinds hard against the {leader}, {empire}. Show pity before the final grain falls.",
    ],
  },
  drovani: {
    battleWon: [
      "The current swept your vessels aside at {star}, {empire}. Deep waters favor the {leader}.",
      "Your hulls went under near {star}, {empire}. The tide of the {leader} rolls on.",
    ],
    battleLost: [
      "A rogue wave broke against our flank at {star}, {empire}, yet the ocean remains deep.",
      "You surged ahead near {star}, {empire}. Still, the {leader} knows every reef and swell.",
    ],
    betrayed: [
      "You fouled calm waters between us, {empire}. The {leader} remembers every broken tide-oath.",
      "Treacherous currents run from {empire} now. The {leader} answers with rising storm-force.",
    ],
    councilWin: [
      "The council tide lifted the {leader} today, {empire}. Steady currents carry far.",
      "Our measure rides the crest in the council vote. The {leader} sets the course ahead.",
    ],
    prophecy: [
      "Deep swells stir past {star}, {empire}. Brace for heavy waters before the gale hits.",
      "Our tide-seers sense a dark surge near {star}, {empire}. Keep your fleets in deep water.",
    ],
    begging: [
      "Our coastal worlds are swamped and broken, {empire}. Let the {leader} find calm water once more.",
      "The storm has battered the {leader} to its knees, {empire}. Spare our surviving folk.",
    ],
  },
  gorrath: {
    battleWon: [
      "We smashed your ships around {star} and kept the iron! The {leader} rides strong!",
      "Your fleet broke against the {leader} at {star}, {empire}! Victory tastes like smoke and steel!",
    ],
    battleLost: [
      "Our hulls took a beating at {star}, {empire}, but the clan-fires still burn bright!",
      "You won the round at {star}, {empire}! The {leader} will hit back twice as hard!",
    ],
    betrayed: [
      "Oath-breaker! The {leader} spits on your lies, {empire}! War-drums roar for your blood!",
      "You stabbed the {leader} behind a truce, {empire}! Now every clan rides to burn you out!",
    ],
    councilWin: [
      "Even the council bowed to the {leader} today, {empire}! Our banners fly high!",
      "The {leader} claimed the council vote! Now watch us back words with fire!",
    ],
    prophecy: [
      "War-smoke gathers on the horizon past {star}, {empire}! Keep your shields up and your blades ready!",
      "Our elders smell fire brewing near {star}, {empire}! Something fierce is coming!",
    ],
    begging: [
      "Our worldships are scarred and our hearths cold, {empire}! Spare what is left of the {leader}!",
      "The clans are cornered and bleeding, {empire}! Grant mercy before the {leader} goes dark!",
    ],
  },
  ixil: {
    battleWon: [
      "Your ships yielded to our embrace near {star}, {empire}. The {leader} absorbs what remains.",
      "A clean joining at {star}, {empire}. Our bond grows stronger while your hulls drift cold.",
    ],
    battleLost: [
      "A sharp sting near {star}, {empire}, yet our roots remain deep inside the {leader}.",
      "You pushed back our tendrils at {star}, {empire}. We adapt and press again.",
    ],
    betrayed: [
      "You tore apart a shared bond with the {leader}, {empire}. That breach will not go unanswered.",
      "A bitter severing from {empire}. The {leader} turns from kinship to stern discipline.",
    ],
    councilWin: [
      "The council threads draw tight around the {leader}'s measure today, {empire}.",
      "Our voices weave through the council vote now, {empire}. The {leader} guides the next turn.",
    ],
    prophecy: [
      "Deep currents pulse strangely near {star}, {empire}. Something awakening shifts the dark.",
      "Our senses taste sharp change toward {star}, {empire}. Guard your worlds closely.",
    ],
    begging: [
      "Our branches are stripped and fading, {empire}. Spare the {leader}'s last roots to mend.",
      "We are nearly severed, {empire}. Let the {leader} survive and rebuild in peace.",
    ],
  },
  verdane: {
    battleWon: [
      "Sunlight and steady growth favored the {leader} at {star}, {empire}. Your fleet withered early.",
      "New shoots rise over {star} while your broken hulls fall silent, {empire}.",
    ],
    battleLost: [
      "Frost nipped our outer boughs at {star}, {empire}, yet spring returns to every grove.",
      "A harsh pruning near {star}, {empire}. The {leader} will grow back taller and stronger.",
    ],
    betrayed: [
      "Scorched earth after a promise of peace, {empire}. The {leader} remembers every burned leaf.",
      "You brought blight to our trust, {empire}. The {leader} closes its canopy against you.",
    ],
    councilWin: [
      "Steady sunlight warms the {leader}'s resolution in council today, {empire}.",
      "The council vote favors enduring growth for the {leader}, {empire}.",
    ],
    prophecy: [
      "Sap runs thick with warning toward {star}, {empire}. A harsh season approaches.",
      "Our oldest groves rustle with dread near {star}, {empire}. Prepare for a sudden storm.",
    ],
    begging: [
      "Our groves are charred down to the roots, {empire}. Leave a seed for the {leader} to live.",
      "Even ancient forests can be felled, {empire}. Spare what remains of the {leader}.",
    ],
  },
  quorai: {
    battleWon: [
      "Your fleeting sparks flickered out around {star}, {empire}. The {leader} commands the radiance here.",
      "A brief, noisy flare from {empire} at {star}, extinguished by the {leader} without effort.",
    ],
    battleLost: [
      "A stray ember scattered near {star}, {empire}. A star does not dim because one spark drifts.",
      "You stirred a minor eddy at {star}, {empire}. The {leader} remains unmoved in its corona.",
    ],
    betrayed: [
      "Such petty treachery from cold matter, {empire}. The {leader} tires of your deceit.",
      "You broke faith with a living star, {empire}. Prepare for solar wrath from the {leader}.",
    ],
    councilWin: [
      "Even mortals in council bend toward the {leader}'s brilliance today, {empire}.",
      "The vote falls to the {leader}, as light must always outshine shadow, {empire}.",
    ],
    prophecy: [
      "Magnetic tides twist violently near {star}, {empire}. Watch before the flare consumes all.",
      "Our corona-seers glimpse a coming upheaval past {star}, {empire}. Mind your frail vessels.",
    ],
    begging: [
      "Our radiance is dimmed and battered, {empire}. Spare the {leader} from fading into cold ash.",
      "Even stars can be quenched, {empire}. Grant mercy to the last fire of the {leader}.",
    ],
  },
  raxxan: {
    battleWon: [
      "Prime salvage all over {star}! The {leader} hauls off the best scrap while {empire} cries!",
      "Cracked your hulls wide open at {star}, {empire}! Plenty of shiny loot for the {leader}!",
    ],
    battleLost: [
      "Lost a few raiders at {star}, {empire}, big deal. The {leader} always finds more prey!",
      "You got lucky at {star}, {empire}! Watch your cargo holds next time!",
    ],
    betrayed: [
      "Double-crossed! The {leader} doesn't forgive cheats, {empire}, we strip 'em bare!",
      "Broke the deal on the {leader}, {empire}? Now every hull you own is fair game!",
    ],
    councilWin: [
      "Look at that, {empire}, the {leader} swindled a council win right under your nose!",
      "Council vote went our way, {empire}! Time to cash in!",
    ],
    prophecy: [
      "Word on the spacer lanes says big trouble's brewing near {star}, {empire}. Keep one eye open!",
      "Scavengers near {star} spotted bad omens, {empire}. Don't get caught sleeping!",
    ],
    begging: [
      "Our hulls are holey and our holds empty, {empire}! Go easy on the {leader} and let us scram!",
      "You cleaned us out, {empire}! Spare what's left of the {leader} and call it a haul!",
    ],
  },
  ruuvak: {
    battleWon: [
      "More clutches hatch every day while your fleet sinks at {star}, {empire}! The {leader} wins!",
      "Swamped your ships around {star}, {empire}! There's always plenty more where they came from!",
    ],
    battleLost: [
      "A big litter lost at {star}, {empire}, no sweat! The {leader} breeds faster than that!",
      "Ouch at {star}, {empire}! Good thing the warrens never run out of young!",
    ],
    betrayed: [
      "You bit the hand after the truce, {empire}! The whole brood of the {leader} is coming!",
      "Broken pact with the {leader}, {empire}! Now every hungry mouth turns your way!",
    ],
    councilWin: [
      "So many voices in the {leader}'s brood that the council had to listen, {empire}!",
      "The {leader} carried the vote, {empire}! Room for everyone in our big plans!",
    ],
    prophecy: [
      "The warrens twitch uneasy near {star}, {empire}! Big trouble's on the way soon!",
      "Littlest ones get jumpy toward {star}, {empire}! Something heavy's coming!",
    ],
    begging: [
      "The warrens are crushed and the young are starving, {empire}! Spare the {leader}, please!",
      "Too many mouths and nowhere left to hide, {empire}! Have mercy on the {leader}!",
    ],
  },
  tarkhan: {
    battleWon: [
      "Clean shot at {star}! The {leader} tracks down every straggler while {empire} scatters!",
      "Your formation broke at {star}, {empire}. A fine hunt for the {leader} today!",
    ],
    battleLost: [
      "You dodged that round at {star}, {empire}. Good sport, now the {leader} tracks harder!",
      "A nick on the barrel at {star}, {empire}. The hunt isn't over yet!",
    ],
    betrayed: [
      "Shot from behind after a truce, {empire}? The {leader} marks you as unfair game now!",
      "You broke the hunter's word with the {leader}, {empire}. Now there's no quarter given!",
    ],
    councilWin: [
      "Sights lined up and the {leader} took the council shot clean, {empire}!",
      "The council vote lands true for the {leader}, {empire}. On to the next target!",
    ],
    prophecy: [
      "The wind shifts sharp toward {star}, {empire}. Something big is moving into range!",
      "Trackers on {star} smell heavy game stirring, {empire}. Keep your guard up!",
    ],
    begging: [
      "Out of ammo and cornered hard, {empire}. Grant the {leader} a clean finish and spare the rest!",
      "The chase is done and our lodge is broken, {empire}. Show mercy to the {leader}!",
    ],
  },
};
