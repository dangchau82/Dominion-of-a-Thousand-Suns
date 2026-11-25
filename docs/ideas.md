# Ideas pipeline

Future features Danny has approved for later. Not scheduled yet: pick from here when a stage opens up. Newest first.

**Originality rule:** these are inspired by shows and games Danny likes. Keep the ideas, never the names, characters or text. Gemini turns each idea into original names and data (see "Who does what").

Status: `idea` → `designed` (data or design notes exist) → `building` → `done`.

---

## Danny's must-haves (2026-11-25)
Danny's all-time favourites are Babylon 5 and Stargate, then Star Trek and Star Wars. He marked these as must-haves: **carriers and fighters, superweapons, starbases, protected worlds, prophecies, civil war (with spy options), and gates with surprise invasions.**

### Hyperspace gates, armadas and surprise attacks (late game)
Danny remembers a massive armada gathering in hyperspace before an invasion. Build the late game around that:
- **Gate network** (see the table below): claimed gates let fleets jump across the map in one turn.
- **Staging in deep space:** a fleet can wait "between the stars" (in a gate's hidden space), off everyone's map, then strike anywhere the gate reaches.
- **Ambush:** fleets set to ambush at a star stay hidden until an enemy arrives, then fire first.
- **Decoy worlds:** make a planet look undefended or empty, so rivals send weak forces into a trap.
- **No-cheat rule:** the AI only ever sees its `EmpireView`, so deception works by changing what that view shows (hidden fleets left out of `seenFleets`, false reports through spies or decoys). The Master AI must learn to doubt "free" planets, for example by checking how fresh its intelligence is.

### Prophecies (expand this; Danny loves it)
- **Real foreshadowing:** when the game secretly schedules a future event (an elder awakening, a plague, a rival's planned invasion, a supernova), a seer may deliver a cryptic prophecy about it several turns early. The event is fixed by the seeded RNG at the moment of the prophecy, so the prophecy is always true.
- **Readable but cryptic:** each prophecy has clues (a colour of star, a direction, a number of turns, a symbol for the threat) that a careful player can decode and prepare for.
- **Seers have voices:** mystic and telepath races (Velari, Lumen) get prophecies more often and clearer; others hear them through events, the Vespera Conclave or the elder powers.
- **Branching prophecies:** some prophecies offer a choice ("the one who lights the fire will rule it or burn"); acting on them changes which version comes true.
- **Self-fulfilling and false prophets:** a rare event where a rival spreads a false prophecy to panic you (a spy mission).
- **Prophecy log:** a screen listing prophecies heard and whether they came true, a good story record.
- **AI rule:** the AI may hear and use only its own prophecies (through its view).

### Civil war and spy-driven unrest
- **Civil war:** a huge, unhappy empire can split; rebels take some worlds and become a new AI empire. A natural brake on runaway leaders.
- **Unrest** comes from conquest (occupation), war weariness, sprawl, lost wars and enemy agents.
- **New spy missions:** "incite unrest" (raise unrest on a target world), "fund rebels" (push an unhappy world toward revolt), "spread propaganda" (lower their culture, raise ours). Spy races (Lumen, Ixil, and any empire on the Spies focus) are best at it.
- **Defence:** security spending, garrisons, culture buildings and golden ages calm unrest.

## Added 2026-11-25 (inspired by Babylon 5, Crusade and Stargate)

| Idea | Inspired by | How it plays in our game | Status | Notes |
|---|---|---|---|---|
| Ancient gate network | gate networks in both shows | Neutral gates on the map. Claim one and fleets jump between gates in one turn; lose it and the enemy uses it. | idea | Fits the elder-powers stage; the Serevahn "Slipstream Rings" in `data/lateGameLore.ts` are this. Velari already travel by "gates". |
| Occupation and resistance | one race occupying another | Conquered worlds have unrest: lower output, rebels, sometimes a revolt that frees them. Conquest stops being a pure win. | idea | **Top pick.** Also tackles the open problem that conquest rarely decides games. |
| Surrender offers | wars ending at the brink | A losing empire offers worlds or tech to stop a war. | idea | Part of Gemini's coding test ("AI reactions"); waiting for its answer. |
| Galactic Council resolutions | the station's council | Between elections the council votes on sanctions, trade embargoes or condemning an aggressor, giving smaller empires power. | idea | **Top pick.** Gives the council something to do every 25 turns. |
| Parasite overlords | Stargate's ruling parasites | A neutral tyrant holding enslaved worlds. Free them for loyal colonies, or take its tech. | idea | Could be a big neutral "lair" with planets. |
| Self-replicating machines | Stargate's machine swarm | A lair that grows every turn if ignored, and eventually threatens everyone. | idea | Fits the "hive" lair in `gemini-task-lairs.md`. |
| Crusading faith | Stargate's preachers | A late crisis that converts planets through culture rather than war; culture becomes defence. | idea | A late-game crisis, like the Glass Mottle plague. |
| Wandering tech-mages | the secretive mages | Rare visitors who sell one powerful tech or ship for a steep price, or a favour. | idea | Also a money sink for hoarded treasuries (open problem). |
| Hybrid warships | an ancient race sharing ship tech | Allying with an elder power unlocks one special ship design. | idea | Elder-powers stage: the "ship" gifts in `ELDER_POWERS` are this. |
| Ancient power cells | Stargate's limited power units | Rare artifacts that massively boost one colony until they run out. | idea | Serevahn "Chronicle Prisms" in the lore are close. |

## Added 2026-11-25 (inspired by Babylon 5, Stargate, Star Trek and Star Wars)

| Idea | Inspired by | How it plays in our game | Status | Notes |
|---|---|---|---|---|
| Minor races | Babylon 5's league of small worlds | Small neutral peoples with a few worlds. Court them with gifts and treaties for votes, bases and troops, or conquer them. | idea | Great with the council. |
| Prophecies | Babylon 5's seers | See "Prophecies" above. | idea | **Must-have.** |
| Dangerous deep routes | Babylon 5's hyperspace | Fast shortcuts between far stars, risky without navigation beacons. | idea | Pairs with the gate network. |
| Expeditions | Stargate's off-world teams | Send a small team to ruins; each mission is a short story with success, failure or a surprise. | idea | Gemini can write the missions. |
| Protected worlds | Stargate's protected planets treaty | A powerful elder race forbids attacks on some young worlds; break it and face its anger. | idea | **Must-have.** Elder-powers stage. |
| Native peoples | Star Trek's non-interference rule | Planets with primitive natives: uplift them (people and tech, trouble later), leave them (culture and respect), or take the planet (others like you less). | idea | `Planet.special` already reserves "natives". |
| Starbases | Star Trek's starbases | Stations at stars with no planet: extend range, repair fleets, defend chokepoints. | idea | **Must-have.** |
| Neutral zones | Star Trek's neutral zone | Treaties can create a no-go border; entering it is an act of war. | idea | |
| Federation victory | Star Trek's federation | Allied empires can win together by council vote: a peaceful path to victory. | idea | Needs care so allies don't win too easily. |
| Invasive critters | Star Trek's breeding furballs | A funny event chain: cute creatures breed out of control on a colony. | idea | Pure Gemini writing job. |
| Civil war | Star Wars' rebellion | See "Civil war and spy-driven unrest" above. | idea | **Must-have.** |
| Supernova crisis | Danny's request | Late game: a star flickers, then counts down (~20 turns, prophecies may warn earlier). Evacuate with transports or harvest it for research until the last moment. The blast wipes most people and factories on nearby colonies, destroys fleets there, and leaves a dead star (blocks travel) or a rare remnant (big research). Quorai live in stars: disaster or a unique "ride the fire" choice. Lure enemy fleets there. | idea | Today only two small "star flare" events exist (unstable-star, flare-season). |
| Superweapon project | Star Wars' battle station | A planet-killing station that takes years to build but has a weak point a small fleet can strike. | idea | **Must-have.** A wonder-style project everyone can see coming. |
| Bounty hunters | Star Wars' bounty hunters | Pay to remove an enemy leader or a key captain. | idea | Also a money sink. |
| Carriers and fighters | Star Wars' fighter swarms | Large ships launch fighters that swarm, screen and intercept missiles. | idea | **Must-have.** Needs combat work: fighters as their own shot pool, carriers as a special system. |
| Smugglers and blockades | Star Wars' smugglers | Blockade a rival's trade to cut their income; smugglers break blockades for a fee. | idea | Trade treaties already pay per turn. |

## Added 2026-11-25 (inspired by Firefly, the Riddick films and the Aliens films)

| Idea | Inspired by | How it plays in our game | Status | Notes |
|---|---|---|---|---|
| Frontier job board | Firefly's odd jobs | Minor races and traders post contracts (carry cargo, escort, smuggle, rescue) for BC, culture or favours; risky jobs pay more. | idea | Uses minor races and the money sinks; gives small empires income. |
| Mad raiders from the edge | Firefly's savage raiders | A late, terrifying pirate swarm that comes from the map's edge, wrecks colonies and can't be bargained with. | idea | A "pirates" lair that roams; pairs with the gates/ambush rules. |
| A buried government secret | Firefly's hidden planet | A story event: an empire's old experiment (a pacification gas, a failed super-soldier) is uncovered; reveal it, bury it, or use it. | idea | Gemini writing job; ties into unrest. |
| A legendary ship and crew | Firefly's crew | Name one ship; it gains a captain and crew traits as it survives battles, and losing it hurts morale. | idea | Pairs with leader traits and living-ship ages. |
| Death worlds | Riddick's scorched and night-creature planets | Rare planets with deadly cycles (scorching days, monsters at night): rich but costly to hold; needs special tech or buildings. | idea | New planet specials. |
| Prison worlds | Riddick's prison planets | Turn a harsh world into a penal colony: cheap population and labour, but unrest, escapes and riots. | idea | Uses unrest; a use for poor planets. |
| A death-cult crusade | Riddick's conquering cult | A violent counterpart to the Crusade: convert or be destroyed; its fleets get stronger with each world taken. | idea | Late crisis; a contrast to the peaceful Candescent Fold. |
| "You keep what you take" | Riddick's conqueror's rule | Capturing an enemy capital lets you take one of their leaders, techs or wonders. | idea | **Makes conquest pay** (open problem: conquest rarely decides games). |
| The silent colony | Aliens: the colony that stops answering | A colony goes quiet; send troops to find out. Inside: an alien infestation, survivors, or something worse. | idea | An expedition-style crisis with ground combat. |
| Alien infestation | Aliens: the hive | A creature hive spreads to nearby colonies through transports and traders; fight it on the ground, quarantine, or burn the planet from orbit (lose the colony, stop the spread). | idea | Fits the "hive" lair and the crises engine. |
| The company that wants a specimen | Aliens: the corporation | A trade guild offers a fortune to bring back a living alien: huge research or money, with a chance it escapes. | idea | Gemini gamble event with failPath. |
| Synthetic crew | Aliens: the androids | Android leaders: no salary and steady bonuses, but a small chance of a hidden agenda (spying for another empire). | idea | A leader trait family. |
| Drop troops and ground war | Aliens: the marines | Better invasions: troop types, armour and ground battles worth researching, not just numbers. | idea | Helps conquest matter. |

## Living ships (Danny's idea, 2026-11-25)

Organic ships that are **grown, not built**. Natural for the Kethrak Hive, Verdane, Ixil and Ruuvak; a late Planetology tech for everyone else.

1. **Cheap but young:** they hatch weak and grow stronger with age.
2. **Three life stages:** Hatchling, Adult (more hit points), Elder (more hit points and better aim). Veteran fleets matter.
3. **Inherited traits** chosen at design time instead of some metal parts, e.g. spined hide (armor), spore clouds (harder to hit), acid glands (eat through shields), swift fins (speed), symbiotic crew (aim).
4. **Mutations:** a fleet reaching Elder rolls one random extra trait (seeded RNG).
5. **Weakness:** no energy shields; burning weapons (plasma) hurt them more.

Status: designed (Gemini data in `src/engine/data/livingShips.ts`), waiting for Danny's answers on (a) organic races only, or a tech for everyone too, and (b) age stages and mutations, or traits only.
Build notes: fleets store only ship counts today, so each fleet needs an age (save version bump plus migration); combat, designs and the AI all need to learn them. Best after the Master AI and the elder-powers stage. Gemini can write the trait and mutation list.

---

## Who does what
- **Gemini:** turns an idea into original names, text and data tables, in the real scale (task files in Drive under "Source for Gemini").
- **Claude:** checks and fixes Gemini's data, builds the rules, tests, balances with the AI tournament.
- **Danny:** picks what's next and playtests.
