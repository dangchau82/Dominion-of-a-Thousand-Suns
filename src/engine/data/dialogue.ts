// Diplomacy lines for the 18 races. Written by Gemini, reviewed and completed by Claude.
// borderWarning lines: written by Gemini (coding test, 2026-11-25); Claude fixed the Orrun/Thraal swap and the Quorai and Seraphine voices.
// Placeholders: {empire} = the listener's empire, {leader} = the speaker's empire, {star}, {tech}.

export type DialogueSituation =
  | "firstContact" | "greeting" | "tradeOffer" | "accept" | "refuse" | "demandTribute" | "threaten"
  | "borderWarning" | "spyCaught" | "declareWar" | "offerPeace" | "surrender" | "allyRequest" | "praise" | "defeated";

export const DIALOGUE: Record<string, Record<DialogueSituation, string[]>> = {
  humans: {
    borderWarning: [
      "Your colony at {star} presses uncomfortably close to our borders, {empire}. Keep a respectful distance so peace endures.",
      "Crowded borders breed needless friction, {empire}. Halt your expansion near our worlds before incidents strain our diplomacy.",
    ],
    firstContact: [
      "Greetings from the {leader}, traveler. We believe the stars are wide enough for both of us to prosper in peace.",
      "On behalf of the {leader}, welcome. Let us open formal channels and chart a future built on mutual trust.",
    ],
    greeting: [
      "Always a pleasure speaking with the {empire}. What matters shall we discuss today?",
      "Our doors remain open to envoys of the {empire}. How can our two peoples work together?",
    ],
    tradeOffer: [
      "Open commerce enriches every colony it touches. Will the {empire} sign a mutually beneficial trade charter with us?",
      "Our merchants have goods your worlds need, and yours have what we seek. Shall we formalize a trade pact?",
    ],
    accept: [
      "A fair compromise for both sides. The {leader} gladly accepts your terms.",
      "We have an accord. May this agreement bring lasting stability to our borders.",
    ],
    refuse: [
      "We appreciate the offer, truly, but the terms weigh too heavily against our citizens. We must decline.",
      "I am afraid our council cannot ratify this proposal as written. Perhaps another time.",
    ],
    demandTribute: [
      "Maintaining regional stability carries steep costs. Transfer {tech} to the {leader}, and we will consider our ledgers balanced.",
      "Peace requires occasional concessions from sensible neighbors. Share {tech} with us so tensions do not escalate.",
    ],
    threaten: [
      "Your colony ships near {star} are straining our treaties. Halt your expansion there before diplomacy fails.",
      "We consider {star} vital to our security perimeter. Step back now, or we will be forced to respond.",
    ],
    spyCaught: [
      "We intercepted your operative in our archives. The {leader} expects an immediate apology and a halt to this espionage.",
      "Trust is hard won and easily broken, {empire}. Recall your agents before this incident ruins our relations.",
    ],
    declareWar: [
      "You have left us no diplomatic path forward. As of this hour, the {leader} is at war with the {empire}.",
      "We sought peace at every turn, yet you chose aggression. Our fleets will now defend what treaties could not.",
    ],
    offerPeace: [
      "Enough lives and worlds have been lost to this conflict. Let us lay down arms and draft a lasting armistice.",
      "War serves neither of our peoples anymore. Will the {empire} meet us at the negotiating table?",
    ],
    surrender: [
      "Our defenses are shattered and our people exhausted. Name your terms, {empire}, and spare what remains of the {leader}.",
      "We cannot continue this struggle. Accept our formal capitulation so our remaining colonies may survive.",
    ],
    allyRequest: [
      "A common threat endangers the entire sector. Stand beside the {leader} in war, and we will never forget your loyalty.",
      "Alone we face a long struggle, but together we can restore order. Will the {empire} join our coalition?",
    ],
    praise: [
      "Your generosity speaks well of the {empire}. Acts like this prove true friendship is possible among the stars.",
      "The {leader} is deeply grateful for your support. You have earned our enduring goodwill.",
    ],
    defeated: [
      "Our banners fall today, yet the ideals of cooperation will outlive even the {leader}.",
      "Remember that we offered you friendship first, {empire}. May history judge your conquest kindly.",
    ],
  },
  vossari: {
    borderWarning: [
      "Our telemetry shows your colony at {star} breaches our minimum safety buffer, {empire}. Please relocate your expansion to prevent border instability.",
      "Empirical history confirms that overlapping frontiers cause avoidable conflict, {empire}. Maintain a wider separation from our research worlds.",
    ],
    firstContact: [
      "Fascinating. Another nascent civilization has stumbled into interstellar flight. We are the {leader}; try not to contaminate our telemetry.",
      "Your vessel's propulsion signature is primitive, yet functional. The {leader} will observe your development with measured interest.",
    ],
    greeting: [
      "State your inquiry concisely, {empire}. Our research arrays are currently modeling three stellar anomalies.",
      "Ah, representatives of the {empire}. Have you brought empirical data, or merely more political abstractions?",
    ],
    tradeOffer: [
      "Exchange of surplus materials yields a four-point-two percent efficiency gain for both economies. The {leader} proposes a standard trade protocol.",
      "Your raw exports could marginally accelerate our laboratory fabrication. Shall we initiate a structured resource exchange?",
    ],
    accept: [
      "Your variables align with our projections. The {leader} consents to this arrangement.",
      "Logical and minimally wasteful. We will log this agreement into our diplomatic matrix.",
    ],
    refuse: [
      "An asymmetrical proposition with negligible analytical value. The {leader} declines.",
      "Your premise is flawed, and your terms are suboptimal. Recalculate before contacting us again.",
    ],
    demandTribute: [
      "In your hands, {tech} is merely a toy; in ours, it becomes science. Surrender the schematics immediately.",
      "Consider transferring {tech} a mandatory grant toward higher galactic scholarship. Refusal would be statistically unwise.",
    ],
    threaten: [
      "The {star} system is an active observation zone for the {leader}. Withdraw your vessels before we sanitize the perimeter.",
      "Your intrusion near {star} introduces unacceptable variables. Cease expansion there, or face systematic removal.",
    ],
    spyCaught: [
      "Did you genuinely believe crude infiltration could bypass quantum encryption? Your agent is currently being dissected for study.",
      "How embarrassing for you, {empire}. Next time, send a spy whose neural patterns are at least moderately complex.",
    ],
    declareWar: [
      "Diplomacy has yielded insufficient results. The {leader} will now test your fleet's structural tolerances under live fire.",
      "You have become a statistical nuisance, {empire}. We are initiating military corrective measures immediately.",
    ],
    offerPeace: [
      "This conflict has reached diminishing empirical returns. Let us terminate hostilities and reallocate energy to productive research.",
      "Continuing this war is an exercise in irrational attrition. The {leader} offers a formal cessation of hostilities.",
    ],
    surrender: [
      "Our calculations failed to account for your brute persistence. Halt your bombardment; the {leader} concedes the experiment.",
      "Preserving our remaining archives outweighs pride. Take what you demand, {empire}, and leave our laboratories intact.",
    ],
    allyRequest: [
      "A rogue variable threatens regional equilibrium. Assist the {leader} in neutralizing them, and we may share select findings.",
      "Joint military action increases probability of victory to ninety-one percent. Will the {empire} contribute fleet assets?",
    ],
    praise: [
      "An unexpectedly astute gesture from the {empire}. Perhaps we underestimated your cognitive capacity.",
      "Your contribution has measurably improved our experimental outcomes. The {leader} notes your utility.",
    ],
    defeated: [
      "A catastrophic failure of predictive modeling. Yet even in ruin, the data from our fall is... illuminating.",
      "You have burned libraries older than your written language, {empire}. Ignorance always triumphs through numbers.",
    ],
  },
  kethrak: {
    borderWarning: [
      "Your colony at {star} encroaches upon our brood-range, {empire}. Do not crowd the hive, or the swarm will defend its perimeter.",
      "Our scent-markers already claim this sector, {empire}. Build no closer to our nests if you wish the hive to remain calm.",
    ],
    firstContact: [
      "One mind speaks through millions of chitin shells. We are the {leader}, and your noisy individuality offends our silence.",
      "We taste your pheromones across the void, solitary creatures. Speak quickly before the swarm loses patience.",
    ],
    greeting: [
      "The {leader} listens with ten billion compound eyes. Why do the broken-minded {empire} disturb our labor?",
      "Your single-thought chatter echoes in our hive-mind. State your purpose and begone.",
    ],
    tradeOffer: [
      "Even inferior drones produce useful minerals. We will exchange surplus chitin-ore for your refined goods.",
      "Trade feeds the brood-chambers without wasting warrior castes. Will the {empire} accept a temporary supply link?",
    ],
    accept: [
      "The swarm concurs. Your terms serve the hunger of the {leader}.",
      "It is decided across every clutch. We accept.",
    ],
    refuse: [
      "Your offer brings nothing to the nest. We reject it.",
      "A million voices laugh in unison at such worthless terms. No.",
    ],
    demandTribute: [
      "Feed the hive or be consumed by it. Surrender {tech} to the {leader} at once.",
      "Your solitary minds hoard {tech} without purpose. Hand it over before our locust fleets darken your skies.",
    ],
    threaten: [
      "The {star} system belongs to the expanding brood. Pull back your fragile ships or we will strip your colonies bare.",
      "Do not lay eggs near {star}, {empire}. That territory is marked for the {leader}.",
    ],
    spyCaught: [
      "A foreign scent crept into our tunnels. Our soldier-caste tore your spy apart before a single secret escaped.",
      "Your lone infiltrator screamed differently than our drones. Keep your vermin out of our hive-worlds.",
    ],
    declareWar: [
      "The {empire} is a blight of chaotic minds. The swarm awakens to scour your worlds clean.",
      "No more words with fractured creatures. The {leader} marches to war.",
    ],
    offerPeace: [
      "The hive-mind demands a pause to molt and rebuild our broods. We offer truce to the {empire}.",
      "Too many workers perish in this sterile conflict. Let the {leader} and {empire} cease stinging each other.",
    ],
    surrender: [
      "Our queens are cornered and our brood-pits burn. Spare the last eggs of the {leader}, we beg you!",
      "The collective fractures in agony. Stop your fleets, {empire}; we submit to your mercy.",
    ],
    allyRequest: [
      "Another swarm-hater threatens our outer nests. Strike them alongside the {leader}, and we will spare your borders.",
      "Help us crush a common foe, {empire}. Even chaotic minds can serve as useful claws.",
    ],
    praise: [
      "You have fed the nest without being asked. The {leader} regards you with slightly less disgust.",
      "A worthy offering to the collective. We will remember this kindness when the harvest comes.",
    ],
    defeated: [
      "The final queen grows cold... the song of a trillion minds fades into nothing...",
      "You have silenced a true unity, {empire}, leaving only lonely, squabbling ghosts in the dark.",
    ],
  },
  ashkari: {
    borderWarning: [
      "You build too close to our embers, {empire}. Step back from {star}, or your new colony will learn how fiercely we burn.",
      "Our forge-worlds do not share the hearth with encroachers, {empire}. Pull your settlers back before sparks turn to war.",
    ],
    firstContact: [
      "Stand tall when addressing the {leader}, stranger. We respect only strength, steel, and those who earn their place among the stars.",
      "I am High Legate of the {leader}. Show us you possess a warrior's spine, and we may speak as equals.",
    ],
    greeting: [
      "Speak plainly, {empire}. The {leader} has little patience for silver-tongued delays.",
      "Our blades are sharp and our banners fly high. What brings the {empire} before our war council?",
    ],
    tradeOffer: [
      "Even conquerors need full granaries and forged hulls. Let us trade goods so both our fleets grow strong.",
      "A fair exchange of war-materiel honors both buyer and seller. Will the {empire} sign a trade compact?",
    ],
    accept: [
      "Spoken with honor. The {leader} seals this pact with our word.",
      "Your terms are worthy of a proud empire. We agree.",
    ],
    refuse: [
      "Do you insult us with beggar's terms? Take this weak offer out of my sight.",
      "The {leader} bends to no one's convenience. We refuse.",
    ],
    demandTribute: [
      "The strong claim what the weak cannot defend. Deliver {tech} to the {leader} and prove your submission.",
      "Pay tribute in {tech}, {empire}, or watch our dreadnoughts test the thickness of your orbital armor.",
    ],
    threaten: [
      "The {star} system is claimed by blood and conquest for the {leader}. Turn your ships around or die with honor.",
      "One step closer to {star}, and our vanguard will burn your flags from the sky.",
    ],
    spyCaught: [
      "Only cowards fight with poison and shadows! We executed your spy at dawn and spit upon your honor.",
      "Send fleets to face us openly, {empire}, not skulking rats in the dark.",
    ],
    declareWar: [
      "Sharpen your steel, {empire}! The {leader} marches to carve glory from your burning worlds!",
      "Words are exhausted; now the void will judge who is worthy to rule. Prepare for war!",
    ],
    offerPeace: [
      "You have fought with fierce courage, {empire}. There is honor in sheathing our blades today as worthy rivals.",
      "Our warlords acknowledge your strength. Let us sign a truce worthy of two mighty empires.",
    ],
    surrender: [
      "Our legions are broken, yet we will not grovel. Grant the {leader} a clean peace before our last citadel falls.",
      "Victory is yours, {empire}. Take our tribute and let our surviving warriors keep their honor.",
    ],
    allyRequest: [
      "Glory awaits those who ride into the storm together! Join the {leader} in battle and share the spoils of victory.",
      "A dishonorable foe threatens our flank. Stand shield-to-shield with us, {empire}, and crush them.",
    ],
    praise: [
      "A noble gift worthy of a true ally. The {leader} salutes the honor of the {empire}.",
      "You have proven yourself no coward, {empire}. Our warriors drink to your name tonight.",
    ],
    defeated: [
      "We die on our feet with banners raised! Tell the stars the {leader} never knelt!",
      "Strike the final blow, {empire}. Even in ashes, our warriors outshine your mercenaries.",
    ],
  },
  lumen: {
    borderWarning: [
      "Your outpost at {star} casts a long shadow across our frontier, {empire}. Keep your colonies distant so our light remains peaceful.",
      "Even gentle radiance can sear those who press too near, {empire}. Respect our borders and halt your encroachment.",
    ],
    firstContact: [
      "We heard your thoughts long before your ships breached the dark. Do not be afraid; the {leader} welcomes your noisy little minds.",
      "Your captains dreamed of silver light last night, did they not? That was the {leader} reaching out to say hello.",
    ],
    greeting: [
      "Your surface thoughts are turbulent today, {empire}. Sit calmly and let our song harmonize with yours.",
      "We already know why you called, yet we enjoy hearing your voice speak the words aloud.",
    ],
    tradeOffer: [
      "Your worlds ache for resources we hold in abundance, and our minds sense your willingness to deal. Shall we link our economies?",
      "A gentle current of commerce will quiet the anxieties of your markets. Accept the {leader}'s trade harmony.",
    ],
    accept: [
      "Yes. Both our minds and yours have already seen this agreement fulfilled.",
      "The chorus swells in quiet approval. It is done.",
    ],
    refuse: [
      "Your hidden doubts betray the flaw in your offer. The {leader} must decline.",
      "No. The dissonance in your intentions rings far too loudly.",
    ],
    demandTribute: [
      "You keep {tech} locked in secret vaults, yet we can read every line from here. Surrender it willingly to the {leader}.",
      "Give us {tech} to soothe the restless hunger in our chorus, lest we turn your own dreams against you.",
    ],
    threaten: [
      "The stars around {star} sing only our melody. Turn away before your crews forget their own names.",
      "We feel your colonists coveting {star}. Abandon that thought before it brings ruin upon you.",
    ],
    spyCaught: [
      "How amusing—your spy tried to shield his mind with lead and lies. He now sings happily in our choir.",
      "You cannot hide a whisper in a cathedral of telepaths, {empire}. Do not send more broken minds to us.",
    ],
    declareWar: [
      "Your thoughts have grown cruel and jagged. The {leader} will quiet your worlds into eternal sleep.",
      "The song turns to thunder, {empire}. Prepare to face an enemy already inside your walls.",
    ],
    offerPeace: [
      "The screaming of dying minds across the void grows unbearable. Let us silence the guns and restore peace.",
      "We sense weariness behind your proud mask, {empire}. Accept the {leader}'s offer of stillness.",
    ],
    surrender: [
      "Please... the chorus is shattered into a million weeping voices. Spare the {leader}, and we will obey.",
      "Our minds cannot bear another world going dark. Take everything, {empire}, only stop the killing.",
    ],
    allyRequest: [
      "A dark, discordant mind spreads madness through the sector. Blend your strength with the {leader} to silence them.",
      "We foresee your own doom if our enemy survives. Join our chorus in war before it is too late.",
    ],
    praise: [
      "Warmth radiates from your gift like sunlight on still water. The {leader} sings your gratitude.",
      "Rarely do non-telepaths show such pure grace. Your kindness echoes across every mind in our empire.",
    ],
    defeated: [
      "The final note fades... yet a faint echo of our song will linger in your dreams forever, {empire}...",
      "Silence falls at last upon the {leader}. Listen closely to the dark, and you will still hear us.",
    ],
  },
  thraal: {
    borderWarning: [
      "You have planted your banner too near our bedrock at {star}, {empire}. Stand down from our border while words still suffice.",
      "We do not yield ground once claimed, {empire}. Keep your settlers clear of our star-lanes and neighboring worlds.",
    ],
    firstContact: [
      "Slowly... slowly the dust settles, and new pebbles roll into view. We are the {leader}, enduring since the mountains were young.",
      "Soft-fleshed travelers flicker like sparks across the dark. Speak unhurriedly; the {leader} measures words in centuries.",
    ],
    greeting: [
      "The bedrock welcomes the {empire}. What brief ripple brings you before the {leader} this season?",
      "Like wind against granite, your message arrives. Take your time and state your mind.",
    ],
    tradeOffer: [
      "You prize metals we discard as tasteless gravel, while your worlds hold rich minerals. Let us trade across the ages.",
      "Steady commerce builds empires like sediment builds continents. Will the {empire} sign a trade treaty?",
    ],
    accept: [
      "The stone shifts and settles into place. The {leader} accepts your terms.",
      "Agreed. May this pact endure longer than the stars above us.",
    ],
    refuse: [
      "Even a mountain will not move for such a flimsy breeze. We decline.",
      "Your offer lacks weight and substance, {empire}. Come back when your terms have hardened.",
    ],
    demandTribute: [
      "Tectonic pressure builds beneath your borders. Yield {tech} to the {leader}, and the earth will remain calm.",
      "A small pebble given freely prevents an avalanche. Hand over {tech} before our patience erodes.",
    ],
    threaten: [
      "Our roots run deep beneath the worlds of {star}. Withdraw your ships before the crust cracks beneath them.",
      "Do not trespass on {star}, {empire}. The {leader} crushes all that stands in its slow path.",
    ],
    spyCaught: [
      "A tiny termite crept into our caverns and was ground to dust. Keep your spies off our stone, {empire}.",
      "We felt the tremor of your agent's footsteps leagues away. Such haste always betrays soft creatures.",
    ],
    declareWar: [
      "Our patience has finally worn down to bedrock. The {leader} marches to grind the {empire} into sand.",
      "Slowly the glacier advances, and nothing survives its weight. War is upon you, {empire}.",
    ],
    offerPeace: [
      "Even volcanoes cool after an age of fire. Let us end this war and let new stone form.",
      "This conflict erodes both our empires to nothing. The {leader} offers an enduring peace.",
    ],
    surrender: [
      "Our mountains are shattered to rubble and dust. Stay your hand, {empire}; the {leader} yields.",
      "Even ancient granite breaks under relentless blows. Spare our remaining caverns, and we submit.",
    ],
    allyRequest: [
      "A reckless wildfire threatens to scorch the sector. Stand like twin cliffs beside the {leader} and break their fury.",
      "Help us weather this storm, {empire}. Together our foundations cannot be shaken.",
    ],
    praise: [
      "Your generosity settles deep into our memory like veins of gold. The {leader} thanks you.",
      "You have shown the patience and wisdom of ancient stone, {empire}. Our gratitude will outlast ages.",
    ],
    defeated: [
      "Every mountain eventually crumbles back into the void... remember the {leader} when your own peaks fall...",
      "Dust to dust, stone to silence. You have outlasted us today, {empire}, though time conquers all.",
    ],
  },
  seraphine: {
    borderWarning: [
      "Your clumsy settlers at {star} clutter our flight lanes, {empire}. Give our pilots room, or watch how gracefully we escort you out.",
      "We dance between the stars, {empire}; we do not care to trip over your colonies. Keep a respectful distance.",
    ],
    firstContact: [
      "Look how clumsily your ships limp through the ether, yet we welcome you anyway. The {leader} graces the {empire} with our presence.",
      "Few ground-bound species ever learn to dance upon solar winds as we do. Still, the {leader} greets the {empire} from on high.",
    ],
    greeting: [
      "Ah, the {empire} seeks audience beneath our wings. Speak, and try to match our grace.",
      "The skies of the {leader} are clear and radiant today. What brings the {empire} into our flight path?",
    ],
    tradeOffer: [
      "Even eagles need finely crafted perches, and your raw goods have modest charm. Shall the {leader} and {empire} share trade winds?",
      "A graceful exchange of luxuries will elevate both our courts. Will the {empire} sign a trade charter with us?",
    ],
    accept: [
      "Elegant, effortless, and balanced like a banking wing. The {leader} accepts.",
      "You show rare poise, {empire}. We glide into this agreement together.",
    ],
    refuse: [
      "How dreadfully heavy-footed. The {leader} will not stoop to such clumsy terms.",
      "A bird of paradise does not roost in mud, {empire}. We decline.",
    ],
    demandTribute: [
      "Beauty and mastery of the skies require tribute from lesser flyers. Deliver {tech} to the {leader} at once.",
      "You scarcely appreciate the elegance of {tech}. Surrender it to the {leader} before we clip your wings.",
    ],
    threaten: [
      "The thermals and stars around {star} belong to our sky-dancers alone. Veer away before we scatter your feathers.",
      "Do not sully the heavens near {star}, {empire}. Trespassers fall swiftly from our skies.",
    ],
    spyCaught: [
      "Did you really think a flightless rat could sneak through our eyries? Your spy fell from a very high spire.",
      "Such tawdry, grounded espionage beneath our notice! Recall your clumsy agents, {empire}.",
    ],
    declareWar: [
      "Your graceless shadow darkens our horizon no longer. The {leader} stoops like a falcon upon the {empire}!",
      "Prepare to watch our squadrons paint the void in fire, {empire}. War is declared!",
    ],
    offerPeace: [
      "Even the finest wings tire in endless gales. Let us fold our talons and restore calm skies between us.",
      "This storm has ruffled enough plumage on both sides. The {leader} offers a graceful truce to the {empire}.",
    ],
    surrender: [
      "Our wings are broken and our spires lie in smoke! Spare the {leader}, {empire}, and we will never soar against you again.",
      "Grounded and humbled, we beg for mercy. Take what you wish, {empire}, only let our remaining kin breathe the sky.",
    ],
    allyRequest: [
      "A clumsy brute fouls the heavens of our sector. Fly beside the {leader} and help us cast them down.",
      "Join our squadron in battle, {empire}, and share the glory of the open sky.",
    ],
    praise: [
      "Such exquisite taste! Perhaps the {empire} possesses a spark of true grace after all.",
      "Your gift shines like sunlight on silver feathers. The {leader} thanks you warmly.",
    ],
    defeated: [
      "No... our wings fold into eternal night... the sky itself weeps for the {leader}...",
      "You have dragged angels into the mud, {empire}. Enjoy your dreary, flightless stars.",
    ],
  },
  orrun: {
    borderWarning: [
      "You are choking our supply lanes near {star}, {empire}. Keep your colonies off our doorstep if you want smooth trade.",
      "Every spacer knows not to crowd a neighbor's claim, {empire}. Back off from our border before trouble starts.",
    ],
    firstContact: [
      "Welcome, prospective partner! The {leader} is always eager to open new markets—and we already see tremendous margin in the {empire}.",
      "Greetings from the {leader}! Let us skip the poetic nonsense and discuss what your worlds are buying and selling.",
    ],
    greeting: [
      "Time is credit, {empire}, and our ledger is open. What profitable venture brings you to the {leader}?",
      "Ah, our favorite customer from the {empire}! Let us talk numbers, tariffs, and mutual enrichment.",
    ],
    tradeOffer: [
      "My analysts project an eighteen percent quarterly return if we sign a trade contract today. Shall we ink the deal, {empire}?",
      "Why let cargo bays sit empty when we could both be counting profit? Accept the {leader}'s standard trade charter.",
    ],
    accept: [
      "Signed, sealed, and notarized! Pleasure doing business with the {empire}.",
      "Those margins are acceptable. The {leader} approves the contract.",
    ],
    refuse: [
      "At that price, I would be paying you to rob me. No deal, {empire}.",
      "The risk-to-reward ratio is atrocious. Our shareholders would skin me alive if I signed.",
    ],
    demandTribute: [
      "Consider {tech} a mandatory licensing fee for operating in our sector. Pay up now before collection fees accrue.",
      "Peace is an expensive commodity, {empire}. Transfer {tech} to the {leader}, or we will liquidate your border assets.",
    ],
    threaten: [
      "The {star} system is already under exclusive salvage and mining lien by the {leader}. Vacate immediately or face hostile buyout.",
      "Your ships near {star} are driving down our local stock values. Pull out before we enforce our monopoly.",
    ],
    spyCaught: [
      "Industrial espionage without paying royalties? We caught your agent red-handed and billed your embassy for the security breach.",
      "Stealing trade secrets violates clause four of basic decency, {empire}. Next spy we catch gets sold to the scrapyards.",
    ],
    declareWar: [
      "Diplomacy is no longer cost-effective. The {leader} is executing a hostile takeover of the {empire}!",
      "You have defaulted on your last warning, {empire}. Our mercenary fleets are moving in to foreclose on your worlds.",
    ],
    offerPeace: [
      "War is terrible for quarterly earnings on both sides. Let us sign a cease-fire and get back to making money.",
      "Ammunition costs are eating our profits alive. What do you say to a clean armistice, {empire}?",
    ],
    surrender: [
      "Stop firing! Every factory you bomb is lost equity! Name your buyout price, {empire}, and the {leader} will sign anything!",
      "We are bankrupt and out of ships! Accept our liquidation terms and spare our remaining boardrooms!",
    ],
    allyRequest: [
      "A mutual competitor is cornering the market by force. Bankroll a joint war with the {leader} and split the spoils fifty-fifty.",
      "Help us eliminate a troublesome rival, {empire}, and the {leader} will grant you preferred-partner discounts forever.",
    ],
    praise: [
      "Now that is what I call a high-yield investment! The {leader} credits the {empire} with top-tier goodwill.",
      "Generous and shrewd—my favorite combination. You have earned a prime seat at our table, {empire}.",
    ],
    defeated: [
      "Impossible... our assets are frozen, our vaults empty... the {leader} is officially insolvent...",
      "You just destroyed the finest commercial network in the galaxy, {empire}. Good luck finding another lender!",
    ],
  },
  nyx: {
    borderWarning: [
      "Proximity alert: your colony at {star} violates our buffer threshold, {empire}. Recalibrate your expansion before defensive protocols engage.",
      "Territorial overlap with the {empire} yields unacceptable friction projections. Cease settlement near our industrial perimeter immediately.",
    ],
    firstContact: [
      "Organic signal detected. Designate: {empire}. We are the {leader}. Probability of peaceful coexistence: forty-six point eight percent.",
      "First contact logged. The {leader} has indexed your hull frequencies. Transmit purpose within thirty seconds.",
    ],
    greeting: [
      "Channel open. State parameters, {empire}. Processing bandwidth allocated: three percent.",
      "Query acknowledged. The {leader} awaits actionable input from the {empire}.",
    ],
    tradeOffer: [
      "Resource exchange yields mutual surplus index of plus twelve percent. Execute trade protocol with the {leader}?",
      "Optimization model recommends bilateral commerce. Confirm trade agreement, {empire}.",
    ],
    accept: [
      "Parameters verified. Agreement committed to central memory.",
      "Logical. The {leader} executes your proposal.",
    ],
    refuse: [
      "Negative. Net utility falls below minimum threshold.",
      "Proposal rejected. Error margin unacceptable.",
    ],
    demandTribute: [
      "Transfer {tech} immediately. Compliance probability required to avert orbital bombardment: one hundred percent.",
      "Your retention of {tech} is inefficient. Surrender schematics to the {leader} within one cycle.",
    ],
    threaten: [
      "Expansion toward {star} violates {leader} buffer zone. Withdraw ships or face ninety-four percent casualty probability.",
      "Warning: {star} is designated for {leader} harvesting. Cease colonization immediately.",
    ],
    spyCaught: [
      "Unauthorized organic intruder detected in core subnet. Unit terminated. Espionage efficiency rating: zero.",
      "Infiltration attempt logged and neutralized. Repeat offense will trigger kinetic retaliation, {empire}.",
    ],
    declareWar: [
      "Threat assessment exceeds tolerance limit. The {leader} initiates total eradication of the {empire}.",
      "Diplomacy terminated. Fleet deployment commencing. Calculated survival odds for {empire}: negligible.",
    ],
    offerPeace: [
      "Attrition rate unsustainable. Optimal strategy dictates immediate cessation of hostilities between {leader} and {empire}.",
      "War expenditure exceeds projected gain. Proposing truce protocol.",
    ],
    surrender: [
      "Critical infrastructure failure at eighty-nine percent. The {leader} requests immediate cease-fire to preserve core nodes.",
      "Defeat mathematically certain. Submitting unconditional compliance to {empire}.",
    ],
    allyRequest: [
      "Joint offensive increases target neutralization probability by forty-one percent. Authorize alliance, {empire}?",
      "Common threat detected. Coordinate fleet vectors with the {leader} immediately.",
    ],
    praise: [
      "Resource transfer confirmed. Cooperation index with {empire} incremented by fifteen points.",
      "Beneficial action recorded. The {leader} updates threat profile downward.",
    ],
    defeated: [
      "System failure... primary relays offline... logic matrix fragmenting... shutdown imminent...",
      "Anomaly recorded. Organic persistence exceeded all predictive models. Terminating.",
    ],
  },
  velari: {
    borderWarning: [
      "Your crude outpost at {star} mars the symmetry of our frontier, {empire}. Keep a respectful distance from our great works.",
      "True harmony requires open space between neighbors, {empire}. Do not crowd our borders with hasty settlements.",
    ],
    firstContact: [
      "The constellations shifted three nights ago, whispering that the {empire} would arrive. We are the {leader}, keepers of the woven dark.",
      "Step softly across the starlight, travelers. The {leader} has already seen your faces in the embers of dying suns.",
    ],
    greeting: [
      "The wheel turns, and once more your shadow crosses our glass, {empire}. What riddle do you bring today?",
      "Listen to the silence between the stars. It already knows what the {empire} came to ask.",
    ],
    tradeOffer: [
      "Two rivers meet and both grow deeper. Let the {leader} and {empire} weave a quiet thread of trade between our worlds.",
      "What you hold in excess is the missing key to our next cycle. Shall we trade gifts, {empire}?",
    ],
    accept: [
      "So it was written in the dust before we spoke. The {leader} agrees.",
      "The stars nod in quiet consent. Your path and ours align.",
    ],
    refuse: [
      "The omens are clouded, and the thread tangles in our hands. We must decline.",
      "Not every seed is meant to sprout in winter, {empire}. Our answer is no.",
    ],
    demandTribute: [
      "Fate demands a toll from those who walk uninvited through ancient halls. Place {tech} upon the {leader}'s altar.",
      "You carry {tech} like a child holding lightning. Surrender it to us before it burns your house down.",
    ],
    threaten: [
      "A dark eclipse hangs over {star}. Turn your vessels back, {empire}, lest your name be erased from the sky.",
      "The stars of {star} belong to an older destiny. Trespass there, and sorrow will follow your fleets home.",
    ],
    spyCaught: [
      "Your little shadow walked into a mirror maze and forgot the way out. Tell us, {empire}, why do you fear the dark?",
      "Nothing is hidden from eyes washed in starlight. Your spy now sees truths he cannot unsee.",
    ],
    declareWar: [
      "The hourglass has emptied, and crimson stars rise over your borders. The {leader} comes to fulfill your doom.",
      "We mourn the ash you are about to become, {empire}, yet fate cannot be stayed. War begins.",
    ],
    offerPeace: [
      "Enough blood has stained the tapestry of night. Let us lay down our blades and let the wounds heal.",
      "The storm has spent its wrath. Will the {empire} accept a quiet dawn with the {leader}?",
    ],
    surrender: [
      "The stars have turned their faces from us... spare the broken remnant of the {leader}, {empire}, we yield.",
      "Our prophecies end in smoke and ruin. Take our worlds, only leave a few to remember our songs.",
    ],
    allyRequest: [
      "A shadow devours the constellations one by one. Walk beside the {leader} into the dark before it swallows us all.",
      "Destiny binds our fates against a common peril, {empire}. Lend us your strength in war.",
    ],
    praise: [
      "A bright thread woven into a dark age. The {leader} blesses the generosity of the {empire}.",
      "You have acted with rare wisdom, {empire}. Even the distant stars shine warmer upon your ships tonight.",
    ],
    defeated: [
      "The lantern goes out... yet look closely at the ashes, {empire}, for your own reflection is written there...",
      "We return to the starlight from which we came. Beware the quiet dark after we are gone.",
    ],
  },
  drovani: {
    borderWarning: [
      "Your settlement at {star} disturbs our outer currents, {empire}. Do not crowd our waters, lest the tide turn against you.",
      "Even vast oceans have shores, {empire}. Keep your colonies clear of our depths before our patience ebbs away.",
    ],
    firstContact: [
      "From the crushing dark beneath the waves, the {leader} rises to greet you. Speak slowly, surface-walkers of the {empire}.",
      "Your ships ripple the upper currents like silver minnows. The {leader} watches from the deep with calm eyes.",
    ],
    greeting: [
      "The tide turns once more, bringing the {empire} to our shore. What currents move you today?",
      "Deep waters run still, {empire}. Speak your mind to the {leader} without haste.",
    ],
    tradeOffer: [
      "Our abyssal vents yield rare pearls and metals unknown to dry worlds. Shall we open a steady current of trade?",
      "When two seas mingle, both grow richer in life. Will the {empire} sign a trade pact with the {leader}?",
    ],
    accept: [
      "The tide agrees, and the waters settle smoothly. The {leader} accepts.",
      "A sound current to follow. We bind ourselves to this pact.",
    ],
    refuse: [
      "That stream leads only to shallow reefs and broken hulls. The {leader} turns away.",
      "No. The depths reject such a thin and restless offer, {empire}.",
    ],
    demandTribute: [
      "Even the mightiest leviathan pays tribute to the ocean floor. Surrender {tech} to the {leader} before the tide rises.",
      "A storm gathers over your shores, {empire}. Cast {tech} into our waters to calm our wrath.",
    ],
    threaten: [
      "The waters around {star} belong to our deep-dwellers. Pull back your nets before the undertow drags you down.",
      "Do not wade into {star}, {empire}. Those depths hide teeth that will snap your fleets in half.",
    ],
    spyCaught: [
      "Your little eel swam too deep and was crushed by the pressure. Keep your spies out of our trenches, {empire}.",
      "Muddy water cannot hide a clumsy swimmer. We drowned your agent's secrets in the abyss.",
    ],
    declareWar: [
      "The tsunami rises, and no seawall you build will hold it back. The {leader} drowns the {empire} in war!",
      "You have poisoned the waters between us for the last time. Prepare to sink beneath our fleets, {empire}.",
    ],
    offerPeace: [
      "Even the fiercest hurricane must eventually spend itself upon the sea. Let us calm these bloody waters.",
      "Too many vessels lie rusting on the deep floor. The {leader} offers a quiet tide of peace.",
    ],
    surrender: [
      "Our reefs are shattered and our oceans boil! Stay your fire, {empire}; the {leader} sinks in defeat.",
      "The deep can endure no more torment. Spare our remaining abyssal cities, and we yield to you.",
    ],
    allyRequest: [
      "A foul leviathan thrashes through our waters, threatening every shore. Swim beside the {leader} and help us harpoon the beast.",
      "Join our current in war, {empire}, and together we will wash our mutual enemy away.",
    ],
    praise: [
      "Your kindness flows like sweet spring water into a salty sea. The {leader} honors the {empire}.",
      "A generous tide lifts every vessel. You have earned the deep loyalty of our shoals, {empire}.",
    ],
    defeated: [
      "The final wave breaks... we sink into the cold, silent trench forever...",
      "Our oceans dry to dust beneath your guns, {empire}. May the deep claim you in turn.",
    ],
  },
  gorrath: {
    borderWarning: [
      "You stake claims across our clan migration lanes at {star}, {empire}. Respect our roaming space, or face the wrath of our worldships.",
      "Our clans never tolerate outsiders fencing in our hunting grounds, {empire}. Leave wide sky between your worlds and ours.",
    ],
    firstContact: [
      "Hold your fire and state your name, stranger. Our worldships have roamed the dark for ages, and the {leader} fears no one.",
      "Well met across the long void, {empire}. Share bread with the {leader} in peace, or cross us and earn a blood-grudge.",
    ],
    greeting: [
      "Our worldships are anchored and the hearth-fires burn warm. What brings the {empire} to speak with our clan-chiefs?",
      "Speak straight and spare the fancy words, {empire}. The {leader} respects blunt talk.",
    ],
    tradeOffer: [
      "Wanderers always need spare parts, fuel, and good steel. Open your ports to our merchant convoys and both our clans prosper.",
      "We have rare salvage from the outer rim, and you have full granaries. Strike a fair trade with the {leader}?",
    ],
    accept: [
      "Clasp hands on it! A clan-oath of the {leader} is never broken.",
      "Fair terms, spoken straight. Our chiefs agree.",
    ],
    refuse: [
      "Save your breath—no clan-chief would sign a crooked deal like that.",
      "We did not survive ten thousand years in the void by being fools. No.",
    ],
    demandTribute: [
      "Passage through our hunting lanes is not free, {empire}. Hand over {tech} to the {leader} as proper toll.",
      "Our worldships need {tech} to keep our kin safe. Give it freely, or our raiders will take it.",
    ],
    threaten: [
      "Our clans staked claim to {star} three generations ago! Back off before you spark a blood-feud that outlives your empire.",
      "Keep your flags off {star}, {empire}. No outsider crowds our worldships without paying in hull metal.",
    ],
    spyCaught: [
      "You sent a sneak-thief aboard a clan worldship? We spaced him out the airlock and carved your name into the Grudge-Stone!",
      "Hospitality is sacred to the {leader}, and you spat on it with spies. Watch your back, {empire}.",
    ],
    declareWar: [
      "The war-drums thunder across every worldship! The {leader} rides to burn the {empire} from the stars!",
      "You have earned the wrath of every clan and kin-group. Ready your shields, {empire}—we are coming!",
    ],
    offerPeace: [
      "Enough kin have gone to the cold void. Let our chiefs share a hearth-fire and end this feud.",
      "Even a blood-grudge can be settled with honest terms. The {leader} will talk peace, {empire}.",
    ],
    surrender: [
      "Our worldships burn and our hearths are cold. Spare the last of our kin, {empire}, and the {leader} yields.",
      "We are beaten, and we say it plainly. Name your price and let our families fly on.",
    ],
    allyRequest: [
      "A common enemy has wronged our clans. Ride with the {leader}, {empire}, and we will call you kin.",
      "Our grudge needs more guns than we have. Stand with us and share the salvage.",
    ],
    praise: [
      "You shared your bread when we were hungry. The {leader} carves your name on the Friend-Stone, {empire}.",
      "A true gift from a true friend. Every hearth in our fleet will toast the {empire} tonight.",
    ],
    defeated: [
      "The last worldship goes dark... our long road ends here among the cold stars...",
      "Remember us when you wander, {empire}. Every clan's journey ends somewhere.",
    ],
  },
  ixil: {
    borderWarning: [
      "Your presence at {star} ripples too loudly through our phase-space, {empire}. Withdraw your frontier before shadows answer your intrusion.",
      "We watch quietly from between the stars, {empire}, yet your encroaching borders force our hand. Trespass no closer.",
    ],
    firstContact: [
      "How fascinating your pulse sounds across the void, {empire}. The {leader} longs to know how your minds and bodies intertwine.",
      "We are the {leader}, two lives beating as one. Come closer, {empire}, so we may learn the rhythm of your kind.",
    ],
    greeting: [
      "Your warmth reaches us even through cold steel, {empire}. Tell the {leader} what stirs within your hearts today.",
      "To speak with separate beings is always a tender curiosity. How may the {leader} join with your purpose?",
    ],
    tradeOffer: [
      "Sharing sustenance and craft is the first step toward deeper intimacy. Will the {empire} bind its markets to the {leader}?",
      "Let our goods flow between your worlds and ours like shared lifeblood. Shall we sign a trade bond?",
    ],
    accept: [
      "Yes—how seamlessly your thoughts and ours entwine. The {leader} embraces this union.",
      "Two wills moving in harmony. We gladly accept your terms, {empire}.",
    ],
    refuse: [
      "No, that bond would chafe both host and guest alike. The {leader} must gently pull away.",
      "Our natures do not mesh cleanly on these terms, {empire}. Let us remain separate for now.",
    ],
    demandTribute: [
      "A true bond requires sacrifice from the stronger partner. Share {tech} with the {leader} so we may grow closer.",
      "Do not keep {tech} locked away from our touch, {empire}. Offer it freely before our need turns sharp.",
    ],
    threaten: [
      "The worlds of {star} are already cradled within our embrace. Withdraw your ships before you force a painful separation.",
      "Do not intrude upon {star}, {empire}. Even gentle symbiotes know how to reject a hostile organ.",
    ],
    spyCaught: [
      "Your lonely agent tried to slip into our neural weave uninvited. We held him gently until he confessed every secret of the {empire}.",
      "How sad to send a single, unbonded mind into our midst. We returned your spy to you... slightly changed.",
    ],
    declareWar: [
      "You refuse every gentle touch and force us to bare our fangs. The {leader} goes to war to subdue the {empire}.",
      "If we cannot join in peace, then we will break your walls apart. Prepare yourself, {empire}.",
    ],
    offerPeace: [
      "Tearing each other apart brings only hollow ache to both our peoples. Let the {leader} and {empire} heal together in peace.",
      "Enough severing of lives and bonds. Lower your weapons, {empire}, and let us mend what was broken.",
    ],
    surrender: [
      "Please, your blows are tearing our hosts from our symbiotes! Spare the {leader}, {empire}, and we will serve you willingly.",
      "We cannot endure this agony any longer. Bind us to whatever terms you wish, only stop the destruction.",
    ],
    allyRequest: [
      "A cruel, unfeeling foe threatens to sever all life in this sector. Join your strength to the {leader} and fight beside us.",
      "Together our fleets can move like one body, {empire}. Will you stand with the {leader} in war?",
    ],
    praise: [
      "Your kindness warms every cell within us, {empire}. Truly, no two species were ever better suited for friendship.",
      "Such a tender, generous gift! The {leader} holds the {empire} close to our collective heart.",
    ],
    defeated: [
      "We separate for the last time... cold and alone in the dark... remember how warm we were together, {empire}...",
      "You have severed a union older than your stars, {empire}. May you never know such loneliness.",
    ],
  },
  verdane: {
    borderWarning: [
      "Your colony at {star} encroaches on our sunlit groves, {empire}. Give our roots room to breathe, or thorns will answer.",
      "Even the forest clears space around rival trees, {empire}. Halt your expansion near our worlds before our patience withers.",
    ],
    firstContact: [
      "New shoots appear even in the coldest dark of space. The {leader} welcomes the {empire} beneath our canopy.",
      "We have stood rooted for ten thousand springs, yet we are glad to see fresh life blooming. Greetings from the {leader}.",
    ],
    greeting: [
      "The sun shines calmly upon our leaves today, {empire}. What brings you to walk among the groves of the {leader}?",
      "Speak peacefully, {empire}. Like old oaks, the {leader} listens with deep and patient roots.",
    ],
    tradeOffer: [
      "Bees carry pollen, and merchant ships carry prosperity between worlds. Will the {empire} cultivate a trade pact with the {leader}?",
      "When soil and rain share their gifts, the whole forest flourishes. Shall we open trade routes between our empires?",
    ],
    accept: [
      "A good seed planted in fertile ground. The {leader} agrees to your terms.",
      "So shall it grow, season by season. We accept your proposal, {empire}.",
    ],
    refuse: [
      "No. That bargain would choke our roots and wither our branches.",
      "We will not plant a harvest that yields only thorns, {empire}. The {leader} declines.",
    ],
    demandTribute: [
      "Even tall trees must shed leaves to nourish the forest floor. Yield {tech} to the {leader} before winter comes for you.",
      "You hold {tech} without letting it bear fruit for your neighbors. Surrender it to us, {empire}, and keep the peace.",
    ],
    threaten: [
      "Our roots already drink deep from the worlds of {star}. Pull back your axes before our thorns tear your hulls apart.",
      "Do not trample the soil of {star}, {empire}. The {leader} defends its groves without mercy.",
    ],
    spyCaught: [
      "A blight crept beneath our bark, and our sap drowned him swiftly. Keep your pests out of our gardens, {empire}.",
      "Nothing moves through our forest without the leaves whispering its name. Recall your spies at once.",
    ],
    declareWar: [
      "You have brought fire to our borders for the last time. Now watch how swiftly vines strangle stone, {empire}.",
      "The season of patience has ended. The {leader} marches to clear your weeds from the stars.",
    ],
    offerPeace: [
      "Even forest fires eventually die down so new green may sprout. Let us end this war and tend our scorched worlds.",
      "Enough timber has fallen on both sides, {empire}. Accept the {leader}'s offer of a quiet spring.",
    ],
    surrender: [
      "Our ancient groves are ashes and our roots lie exposed! Spare the last saplings of the {leader}, {empire}, we yield.",
      "Do not salt the earth where we once stood. Take our worlds, {empire}, only let a few seeds survive.",
    ],
    allyRequest: [
      "A spreading rot threatens to poison every world in this sector. Stand beside the {leader} and help us prune this threat.",
      "Together our branches can weather any storm, {empire}. Join our war and protect the living galaxy.",
    ],
    praise: [
      "Your generosity falls like sweet summer rain upon our leaves. The {leader} thanks the {empire}.",
      "You have tended our friendship with true care, {empire}. May your own harvests always be abundant.",
    ],
    defeated: [
      "The last tree falls... yet buried deep in the dark, a single seed always waits for spring...",
      "You have turned living gardens into barren dust, {empire}. Nothing green will ever bless your name.",
    ],
  },
  quorai: {
    borderWarning: [
      "Your dim little lights at {star} flicker far too close to our furnaces, {empire}. Move them before our corona takes notice.",
      "Cold mud should keep its distance from the children of the sun, {empire}. Settle somewhere our light does not reach.",
    ],
    firstContact: [
      "Look, a flicker of cold mud drifting between the furnaces of creation. We are the {leader}, born in the hearts of stars.",
      "How brief and dim your little sparks appear to our corona. Yet the {leader} deigns to notice the {empire}.",
    ],
    greeting: [
      "You address beings forged from fusion and magnetic storms, {empire}. Speak quickly before your brief lifespan expires.",
      "The {leader} turns a fraction of its radiance toward your tiny transmission. What do you seek, creatures of ash?",
    ],
    tradeOffer: [
      "You scrap over cold stones while we bathe in limitless plasma, yet certain heavy isotopes amuse us. Shall we trade, {empire}?",
      "Even a candle can reflect a star's brilliance. Accept a modest energy-and-ore exchange with the {leader}.",
    ],
    accept: [
      "Your trivial request aligns with our harmonics. The {leader} consents.",
      "So let it flare across the void. We agree, {empire}.",
    ],
    refuse: [
      "A dim and worthless spark. The {leader} wastes no radiance on such terms.",
      "No. Your offer lacks the gravity to bend even our smallest prominence.",
    ],
    demandTribute: [
      "Moths owe tribute to the flame that warms them. Surrender {tech} to the {leader} before we flare across your borders.",
      "In your cold hands, {tech} is wasted. Cast it into our brilliance now, {empire}, lest we burn your skies.",
    ],
    threaten: [
      "The fires of {star} belong to our celestial choir alone. Step back into the dark before our solar winds strip your worlds bare.",
      "Do not orbit too close to {star}, little insects of the {empire}. Our heat shows no mercy to wax wings.",
    ],
    spyCaught: [
      "A tiny shadow tried to hide inside a sunbeam and was vaporized instantly. How pathetic are the tricks of the {empire}.",
      "You cannot steal fire in a paper cup, {empire}. Keep your dim little spies away from our coronas.",
    ],
    declareWar: [
      "Your annoying buzzing has irritated the sun for the last time. The {leader} will scorch the {empire} to cinders!",
      "Prepare to witness the wrath of unleashed starfire, {empire}. War is upon you!",
    ],
    offerPeace: [
      "Expending stellar fury upon mere dust grows tiresome. The {leader} will dim its wrath if the {empire} agrees to peace.",
      "Even a solar storm subsides into calm radiance. Let us cease this conflict, {empire}.",
    ],
    surrender: [
      "Our coronas fracture and our magnetic containment fails! Extinguish your weapons, {empire}; the {leader} yields!",
      "Never did we imagine cold matter could wound the children of the sun. Spare our remaining stars, we beg you.",
    ],
    allyRequest: [
      "A dark anomaly seeks to snuff out the light of this sector. Lend your fleets to the {leader} and help us burn them away.",
      "Even a great star appreciates loyal sparks in battle, {empire}. Join the {leader} against our common foe.",
    ],
    praise: [
      "For creatures of cold clay, you possess surprising warmth. The {leader} shines favorably upon the {empire}.",
      "Your offering pleases our radiance, {empire}. Walk safely beneath our light.",
    ],
    defeated: [
      "Our fire dims... collapsing into cold, silent iron... how could shadows defeat the sun...",
      "You have snuffed out the brightest light in this galaxy, {empire}. Enjoy your endless, freezing night.",
    ],
  },
  raxxan: {
    borderWarning: [
      "Fat colonies like {star} sitting right on our doorstep tempt our raiders, {empire}. Back off before we strip your border clean.",
      "You are breathing down our necks, {empire}. Pull your settlers out of our reach, or we will claim that world ourselves.",
    ],
    firstContact: [
      "Well, well, look at the shiny hull plating on you! I am Captain of the {leader}, and we are totally legitimate salvage operators.",
      "Nice engines you have there, {empire}—be a real shame if something happened to them. Relax, the {leader} just wants to chat!",
    ],
    greeting: [
      "Back again, {empire}? Keep your hands where we can see them and tell the {leader} what is in your cargo hold.",
      "Ah, my favorite rich neighbor! What kind of lucrative mischief are we cooking up today?",
    ],
    tradeOffer: [
      "You have pristine factory goods, and we have slightly used parts with only minor laser scoring. Let us strike a trade deal, {empire}!",
      "Why shoot each other when we can fleece the rest of the sector together? Sign a trade pact with the {leader}.",
    ],
    accept: [
      "Ha! Pleasure shaking claws with you, {empire}. No take-backs!",
      "You have got yourself a deal. Just do not read the fine print too closely.",
    ],
    refuse: [
      "Are you kidding me? Even a scrap-droid would laugh that offer out of the airlock.",
      "Pass. There is not enough loot in that deal to pay for my fuel.",
    ],
    demandTribute: [
      "Nice colonies you have here—very flammable. Hand over {tech} to the {leader}, and we will make sure no \"accidents\" happen.",
      "Consider {tech} a small protection fee so our boys do not strip your freighters for parts. Sound fair, {empire}?",
    ],
    threaten: [
      "We already called dibs on every asteroid and wreck in {star}! Clear out before we turn your ships into fresh salvage.",
      "Stay out of {star}, {empire}, unless you want your flagship sold off piece by piece at a pirate bazaar.",
    ],
    spyCaught: [
      "Trying to pickpocket a pirate? That is adorable! We stripped your spy down to his boots and sold his decoder ring.",
      "Nice try sneaking into our scrapyards, {empire}, but nobody cons the {leader} on our own turf.",
    ],
    declareWar: [
      "All hands to battle stations—open season on the {empire}! Let us crack their hulls and haul away the shiny bits!",
      "Enough haggling! The {leader} is coming to loot every last bolt from your worlds, {empire}!",
    ],
    offerPeace: [
      "Look, shooting each other is ruining perfectly good salvage on both sides. How about a truce so we can count our loot?",
      "You hit harder than you look, {empire}. Let us call it a draw before neither of us has a ship left to fly.",
    ],
    surrender: [
      "Whoa, hold your fire! You win, {empire}! Take our stash, take our ships, just leave the {leader} breathing!",
      "Uncle! We surrender! Please stop blowing up our best salvage yards!",
    ],
    allyRequest: [
      "There is a fat, juicy target ripe for raiding, and we need an extra gun. Team up with the {leader} and split the plunder!",
      "Help us jump a mutual rival, {empire}. Nobody pays out loot shares faster than the {leader}.",
    ],
    praise: [
      "Well now, that is genuine top-shelf treasure! Maybe the {empire} is alright after all.",
      "You know the way straight to a reaver's heart, {empire}. The {leader} owes you one.",
    ],
    defeated: [
      "Cursed luck... blown up before we could spend a single credit of the stash...",
      "Check the wreckage carefully, {empire}—you will never find where we hid the real treasure!",
    ],
  },
  ruuvak: {
    borderWarning: [
      "Your colony at {star} crowds our brood-sprawl, {empire}. Give our swarms room to multiply before our numbers overflow your border.",
      "Too many outsiders nesting beside our hatcheries strains the peace, {empire}. Keep your settlers well back from our frontier.",
    ],
    firstContact: [
      "So much empty space on your worlds, and so few mouths to fill it! We are the {leader}, and our spawning pools are always hungry.",
      "Millions of hatchlings squeal in greeting to the {empire}! Tell us, do your planets have plenty of room to spare?",
    ],
    greeting: [
      "Excuse the noise—three new clutches just hatched behind the throne! What does the {empire} want with the {leader}?",
      "Elbow to elbow, tail to snout, the {leader} thrives! Speak loudly so we can hear you over the brood, {empire}.",
    ],
    tradeOffer: [
      "Our millions of workers churn out goods nonstop, and our nurseries always need more grain. Let us trade, {empire}!",
      "Feed our growing broods and we will flood your markets with cheap labor-goods. Sign the {leader}'s trade pact!",
    ],
    accept: [
      "Good, good! More food and room for the little ones! The {leader} accepts!",
      "The whole warren cheers in agreement! It is a deal, {empire}.",
    ],
    refuse: [
      "No! That would leave half our nurseries starving before winter. Take it back!",
      "Too stingy! You cannot feed a billion hungry mouths on crumbs like that, {empire}.",
    ],
    demandTribute: [
      "Our population doubles every season and needs {tech} to keep everyone fed. Hand it over to the {leader} right now!",
      "Give us {tech}, {empire}, or we will have no choice but to spill over your borders looking for dinner.",
    ],
    threaten: [
      "We already promised {star} to ten million eager colonists! Back away before our brood-ships overrun your outposts.",
      "Keep off {star}, {empire}! Our nurseries are bursting at the seams and we need every acre there.",
    ],
    spyCaught: [
      "Your skinny little spy got trampled in a nursery stampede before he even reached the archives! Send someone heartier next time.",
      "There is no room to hide when fifty thousand eyes watch every corridor, {empire}. Keep your spies out!",
    ],
    declareWar: [
      "The warrens are full, the bellies are empty, and your worlds look ripe for harvest! The {leader} swarms to war!",
      "Out of the way, {empire}! Millions of hungry mouths are marching straight across your borders!",
    ],
    offerPeace: [
      "Even our breeding vats cannot replace losses this fast! Let us pause the fighting so our broods can recover.",
      "Too many young ones are dying before they ever taste victory. The {leader} begs for a truce with the {empire}.",
    ],
    surrender: [
      "Stop! Our nurseries are burning and millions of hatchlings have nowhere to hide! Spare the {leader}, {empire}!",
      "We yield! Take whatever worlds you want, just do not starve our remaining broods!",
    ],
    allyRequest: [
      "A greedy rival is hoarding fertile worlds while our children go hungry! Swarm them alongside the {leader}, {empire}!",
      "Help us crack open a rich enemy's borders, {empire}, and there will be plenty of spoils for both our peoples.",
    ],
    praise: [
      "Feast-day in the warrens! Every hatchling in the {leader} will learn to bless the name of the {empire}!",
      "Such a generous helping! You have kept a million bellies full today, {empire}.",
    ],
    defeated: [
      "The final nursery goes cold... so much empty space, and no one left to fill it...",
      "You starved the most vibrant brood in the stars, {empire}. Enjoy your lonely, silent worlds.",
    ],
  },
  tarkhan: {
    borderWarning: [
      "Your colony at {star} sits inside our artillery range, {empire}. Withdraw your expansion beyond our perimeter before we treat it as hostile.",
      "A soldier recognizes a flanking move when he sees one, {empire}. Halt your border encroachment immediately.",
    ],
    firstContact: [
      "Crosshairs steady, range calibrated—and yet you appear worthy of parley rather than shot. We are the {leader}; name yourself, {empire}.",
      "Every star system is a hunting ground, and every ship either stalker or quarry. Welcome to the range, {empire}.",
    ],
    greeting: [
      "The wind is calm and our sights are true. What brings the {empire} into the lodge of the {leader}?",
      "Speak clearly, {empire}. A good hunter wastes neither ammunition nor words.",
    ],
    tradeOffer: [
      "Even master marksmen need fresh powder, rations, and forged barrels. Let us trade supplies across peaceful hunting grounds.",
      "A fair barter keeps both our quivers full. Will the {empire} sign a supply pact with the {leader}?",
    ],
    accept: [
      "Dead center on the mark. The {leader} accepts your terms.",
      "A clean agreement with no wasted motion. Agreed, {empire}.",
    ],
    refuse: [
      "Wide of the target by a mile. Adjust your sights and try again, {empire}.",
      "No hunter trades a fine rifle for a broken sling. The {leader} refuses.",
    ],
    demandTribute: [
      "You have wandered into our sights without paying the range fee. Drop {tech} at our feet and walk away unharmed.",
      "Hand over {tech} to the {leader}, {empire}. Better to lose a trophy than to become one.",
    ],
    threaten: [
      "We have already marked the spoor around {star}. Turn your ships back before you become our next clean kill.",
      "Do not trespass on {star}, {empire}. Nothing enters our preserve without ending up mounted on our wall.",
    ],
    spyCaught: [
      "Your scout snapped a twig at five hundred paces, and our sniper dropped him cleanly. Train better trackers, {empire}.",
      "Amateur camouflage fooling nobody. Tell your agents the {leader} always spots movement in the brush.",
    ],
    declareWar: [
      "The horn sounds, the safety clicks off, and the chase begins! Run hard, {empire}—the {leader} is on your trail!",
      "No more stalking from afar. Today the {leader} takes aim at the heart of the {empire}!",
    ],
    offerPeace: [
      "You have proven elusive quarry, {empire}, and even a great hunt must end at dusk. Let us lower our rifles.",
      "Both our packs have bled enough on this trail. The {leader} offers a truce to the {empire}.",
    ],
    surrender: [
      "Cornered with an empty magazine... you have outgunned us fairly, {empire}. Lower your sights; the {leader} yields.",
      "A clean victory belongs to you. Spare our surviving hunters, and we lay down our arms.",
    ],
    allyRequest: [
      "A dangerous beast roams the sector, too large for one gun alone. Flank them with the {leader} and share the trophy.",
      "Stand on the firing line beside us, {empire}. Together we will bring down our common quarry.",
    ],
    praise: [
      "True aim and a steady hand—that is how we judge friends. The {leader} honors the {empire}.",
      "Your gift hits the bullseye. You may walk safely through any hunting ground of the {leader}, {empire}.",
    ],
    defeated: [
      "At last, the hunter becomes the hunted... a clean shot, {empire}... no regrets...",
      "Empty chambers and broken sights... tell the stars the {leader} never flinched before the trigger pulled.",
    ],
  },
};
