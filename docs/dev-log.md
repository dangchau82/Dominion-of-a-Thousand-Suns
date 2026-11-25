# Developer log

Where Claude records each test session: what was played, what the numbers showed, what was changed, and what to look at next. Newest first. Players can help: in a game, open 📜 History → **Download game log** and send the file.

How the balance numbers are made: computer-vs-computer games, 8 empires each, large ellipse galaxy, normal difficulty, played to a win or turn 400. Each race appears in about 9 of 18 games. "Colonies" is the average at turn 200.

---

## 2026-11-25 midday (Claude 2, acting lead while the main session rests)
- **Gemini's 8 random events added** (`src/engine/data/events.ts`, now 40 events). Fixes: precursor-dreadnought research 450+300 -> 300+200; void-stowaway forceFields 500 -> 350; "Golden Age" removed from galactic-olympiad; also star reveals 7-8 -> 6 and terraforming +10 -> +8 to match the largest existing events; "{rival}" -> "the {rival}" so names read right.
- **Late-game lore added as data only** (`src/engine/data/lateGameLore.ts`): the Serevahn, Gilded Lattice vs Cinder Pact, the 8-event awakening chain, Meridian Spindle, Vespera Conclave, Lantern Wardens, Glass Mottle. Nothing fires yet; it waits for the elder-powers stage. Fixes: imports our event types (Gemini had copied them), art "war" -> "crisis", "destroyer" reward -> 3 scouts, station vote bonus now a share (`sponsorVoteShare` 0.1, `embassyVoteShare` 0.05), reveals/terraform/relations rescaled.
- New `tests/lore.test.ts`: scale limits, wording, every new choice resolves, chain order. 76 tests pass.
- Note for the elder-powers stage: the Conclave/Wardens/Spindle descriptions mention mechanics that don't exist (morale as a stat, war weariness, sensor range, "+30% spying"); treat those as design notes, not numbers.
- Gemini given its next job: `gemini-task-storylines.md` (Ashkari, Quorai, Terran Accord; 5 chapters, 2 forks, data format fixed in advance). In Drive under "Source for Gemini".
- **Gemini's race storylines added as data** (`src/engine/data/storylines.ts`: Ashkari, Quorai, Terran Accord, 6 chapters each). Passed every check first time: format, sizes, "the {rival}" wording, word limits, endings matching the chapter-3 fork. Only fix: a quoted `"count"` key. Engine not built yet. Notes for the engine: play chapters strictly in order (chapter 2's "3 colonies" usually comes before chapter 1's turn 20-26); Ashkari chapter 3 waits for a first war, so give it a fallback turn (e.g. 150) for peaceful games; goldenAge chapters wait for the first golden age.
  - Gemini's own notes agree, and add: hold a chapter that uses {rival} until we've met someone; play 5A if the chapter 3 choice was 0, 5B if 1; give goldenAge chapters a fallback turn too. Checked: planet-size rewards work on Quorai star colonies (settling a star gives it a real planet, size 15, which terraform adds to).
- **Gemini output-length test (star names):** asked for 1500 names in one reply and got all 1500 (alphabetical, so made by a name script). So ~1500 short lines fit in one Gemini answer; the 5-race storyline batches (~950 lines) are safe.
- **Extra star names added** (`src/engine/data/starNamesExtra.ts`, 1254 of Gemini's 1500): dropped real places/brands/names from other works (Akron, Intel, Alteran, Atrus...) and awkward ones (Bl-/Cl-/Fl-... starts). Large and huge maps used to have 60-160 "Aurelis II"/"X Minor" stars; now every star has its own name. **Every existing seed still makes the same galaxy** (positions, colours, planets and RNG state checked on 12 maps): extra names are picked without touching the RNG, and the old "Minor" RNG draw is kept.
- **Gemini's leader traits added as data** (`src/engine/data/leaderTraits.ts`, 24 traits): all within limits, every stat at least twice up and twice down. Two wording fixes only. Not wired in yet. Note for whoever builds it: traits are flat (not per level), and attack +1 equals two Admiral levels, so traits like Iron Nerves / Disgraced Noble / Scarred Veteran are strong; downsides on spying, range or trade hurt less than ones on production or research. Re-check with the balance tester once leaders roll traits.
- **Gemini pack 2 added as data** (not wired in): `prophecies.ts` (18, 3 per threat), `minorRaces.ts` (12), `expeditions.ts` (12 away missions with success chances). All passed scale/wording checks first time. Fixes: renamed three minor races that clashed with lore names (Vesper -> Hoarfrost Anchorites, Cinder -> Ashfall Reclaimers, Remnant Lattice -> Remnant Custodian); an expedition title used {star} (titles aren't filled in); one quoted key. Engine note for prophecies: fill {direction} with "north/south/east/west/heart of the galaxy" (the texts already say "the {direction}").
- **Gemini pack 3, jobs 1-2 added as data** (not wired in): `resolutions.ts` (12 council resolutions, all within limits; I removed the zero entries) and `unrest.ts` (10 unrest events, a rebel faction for all 18 races, texts for 3 new spy missions). Fixes: five event titles used {colony}/{star} (titles aren't filled in); Vossari rebels were written as nobles, rewritten as scientists; Velari "Veiled Conclave" -> "Veiled Weave" (clashed with the Vespera Conclave). Job 3 added too: `livingShips.ts` (12 traits covering every effect, 10 mutations with drawbacks, stage names for Kethrak, Verdane, Ixil, Ruuvak and "anyone"). Fix: five ids renamed to match their trait names. Balance note: mutation drawbacks (slower 1, fragile 10%) are mild next to two-effect gains such as Apex Reflexes (aim 2 + evasion 2); test once living ships exist.
- **Money sinks: replaced by Gemini's second version** (risky outcomes, AI trigger rules using only EmpireView fields). Same fixes needed again: the bond returned 125% on average (Gemini computed +356 BC itself), now 98%; wonder rush now excludes the Ascension Gate. Earlier version, for the record: (`src/engine/data/moneySinks.ts`): mercenaries, research grant, council lobbying, minor-race patronage, wonder rush, an investment gamble. Costs scale with colonies and turn (about 2,000 at T100 to 8,000-11,000 at T300). Fixes: the investment returned 115% on average (a money machine, the opposite of a sink), now about 97%; the wonder rush gave 0.65 production per BC (better than buying, 0.5) and could target the Ascension Gate, now 0.45 and never the Gate. Not wired in. Note: council lobbying overlaps the Orrun's vote-buying ability; mercenaries and "morale" need engine work.
- **Branching crises: replaced by Gemini's third version** (`TEN_TURN_CRISES`: gambles with success chances, trigger rules, lasting outcome tags such as secede/meltdown/coup; 6 crises, 3 stages, ~6 endings each). Fixes: art "diplomacy" does not exist -> "contact"; imported a type that does not exist; three stage-2 gambles reached their disaster ending even on success, so I added `failPath` (success -> a good ending, failure -> the disaster). Earlier version, for the record: (`src/engine/data/crises.ts`): 6 three-stage crises (breakaway colony, reactor meltdown, refugee fleet, war-hero coup, factory AI awakening, famine), each with 3-4 paths and 2-3 endings. Test checks every choice leads to a real next stage and every stage is reachable. New effect kind `secedeColony` (the colony becomes a new empire: needs the civil-war engine); `planetSize` can be negative here (meltdown). Fixes: one id echoed a famous film title, one formatting slip. **Gemini output size:** the first try stopped at 28 KB mid-file; asked again, it delivered all 43 KB. So the limit varies; addendum rule 11 tells it to split big answers itself.
- **Carriers and fighters (Gemini, hard pack 4 job 1) added as data** (`src/engine/data/carriers.ts`): 4 bay generations, 4 fighter variants. Balance check against beams in the same space: Gemini's bays matched at tier 3 but were 1.4-1.8x stronger at tiers 5-9 and half the price. Fixed: fighter damage at tiers 5/7/9 cut (10-22 -> 5-12, 7-15 -> 5-10, 10-22 -> 6-12), cost share 0.35 -> 0.75. A test keeps bays within 20% of beams. Gemini's answer didn't include the requested arithmetic.
- **Victory warnings and counter-plays (Gemini) added as data** (`src/engine/data/victoryTension.ts`): public alerts at 50/75/90% for each victory, plus one capped counter-play each (cultural embargo, council filibuster, Gate sabotage, defence compact; at most 2 participants and 2 wars). Gemini used old rules (culture 75,000, council two-thirds); fixed to 90,000 and 60%, and a test ties the texts to the real constants. Design note: this overlaps the basic AI's "runaway leader" gang-up (findThreat); when built, make it replace that logic, not add to it.
- **Superweapons and starbases (Gemini, hard pack 4 job 2) added as data** (`src/engine/data/megaprojects.ts`): 4 superweapons (travel lockdown, shield breaker, fleet storm, population plague), each with a weak point; 6 starbases (military and support per tier). Balance: superweapons take 30-100 turns at a 150-300 capital (fine). Military starbases gave 1.6-1.9x warship value per BC, so costs raised (Bastion Buoy 350 -> 600, Iron Redoubt 1100 -> 1900, Apex Garrison 2600 -> 3800); support stations were fair. Null-Tide Anchor recharge 10 -> 16 (an 8-turn lockdown every 10 turns was nearly permanent); "morale" (not a stat) -> culture.
- **Native peoples (Gemini, pack 6 job 1) added as data** (`src/engine/data/natives.ts`): all 8 peoples (uplift / leave / take, plus a 30-turn aftermath); the first answer cut off at 21 KB, the resend was complete. Size lesson: Gemini stops anywhere from 20 KB without warning and doesn't split on its own, so jobs are now capped at about 12 KB per reply.
- **Protected worlds (Gemini, pack 6 job 2) added as data** (`src/engine/data/protectedWorlds.ts`): the Gilded Lattice's "Edict of Sheltered Cradles" protects stage 1-2 natives and new colonies under 10 population with no bases. Three escalating warnings (fine, frozen shipyards, an elder fleet), each with a paid way back (200 / 400 / 600 BC), plus a reward after 50 turns of guarding. Passed checks as written. Engine note: the warnings' `relations` effects should apply to the Lattice (or all empires), not a random rival.
- **The Crusade crisis (Gemini, pack 4 job 3) added as data** (`src/engine/data/crusade.ts`): "The Candescent Fold", a peaceful faith that spreads through culture; 10 linked events, branches resist / join / bargain, the Prophet at the end. Its first version had the conversion rule backwards (high culture made worlds fall); Gemini's revision fixed it and tidied the ids. Engine note: the "join" ending dissolves the empire, so treat it as a peaceful loss (or a shared win) when built.
- **Invasive critters (Gemini, pack 6 job 3) added as data** (`src/engine/data/critters.ts`): the Tumble-Thrum, a humming fuzzball that splits when fed carbs; 6 comic events, small effects, choice 3 of events 1-4 ends the chain early. The answer arrived in two pieces (copy was cut at 7.5 KB); joined.
- **Gemini's first coding job merged: AI reactions** (`gemini-bundle-code-reactions.md`). New: border warnings (AI empires warn neighbours with a colony within 4 ly, at most once per 30 turns per pair, feeling -3; `borderWarnings` in diplomacy.ts, run each turn after `updateRelations`); losing AIs (war 10+ turns, enemy 2.5x their size) send a gift of 20% of treasury and offer peace, and the receiver hears their "surrender" line; `Empire.borderWarned`; **save version 10** with a v9 migration; 36 new dialogue lines; `tests/reactions.test.ts` (5 tests). **Score:** real functions only, compiled first time, 4 of 5 of its tests passed as written (one assertion ignored the AI's other spending that turn; fixed), rules kept (deterministic, AI via view and commands only, efficient loop). Fixes to its writing: Orrun/Thraal lines swapped, Quorai and Seraphine voices rewritten. About 10 minutes of fixing, mostly assembling the pieces Danny pasted. **Verdict: Gemini can take contained coding jobs when given complete files.** Note: losing AIs now sue for peace sooner, so basic-AI games change slightly.
- **Gemini's second coding job merged: leader traits.** Every new leader rolls one of the 24 traits (one extra RNG draw per offer; galaxy generation unchanged); hired leaders add the trait's upside and downside once (not by level) in `empireBonus`; offer messages and the Empire screen show the trait; `Leader.trait` + **save version 11** (Claude did the type and migration first to keep Gemini's replies small); `tests/leaderTraits.test.ts` (4 tests). **Score:** all 4 tests passed as written, code compiled first time, rules kept. Only slip: reply 1 was cut off at about 9 KB inside `hireLeader` (unchanged code), so Claude joined it to the existing end of the file. Lesson: Gemini cuts off around 9-12 KB, so ask for changed functions only, not whole files.
- **Hard pack 5, supernova (Gemini, second account):** `data/supernova.ts`: 4 countdown warnings, 3 aftermaths, 4 remnants (12-20 research a turn), a Quorai "ride the fire" choice; tests in lore.test.ts. Fixes: a `{star}` placeholder in a title, and "Cinder Halo" renamed "Ember Halo" (clashed with Cinder Pact). Rules (countdown, blast damage, dead star) not built yet.
- **Gates (hard pack 5):** `data/gates.ts`: 3 gate types (Thread Relay, Rift Arch, Sovereign Portal), 3 stances (ambush, decoy, staging), 4 news events; tests. Fixes: `{star}` in a title, "a {rival} armada" -> "an armada of the {rival}". Armada arithmetic still not delivered. Rules not built.
- **Storylines batch 2 (Gemini parallel-chat test, chat 1):** `data/storylines-2.ts`, Vossari, Kethrak, Lumen, Thraal, Seraphine, 30 chapters; tests. Fixes: invented art "colony" (4x, now "contact"), `{colony}` in a title, stray "[cite: 1]", two "{rival}" without "the". Followed reply plan and END OF REPLY perfectly.
- **Engine change:** negative `research` event effects now drain that field's progress (never below 0). Before, they did nothing, so Gemini's research "costs" were free.
- **Storylines batch 3 (Gemini parallel-chat test, chat 2):** `data/storylines-3.ts`, Orrun, Nyx, Velari, Drovani, Gorrath, 30 chapters; tests. Sent all 5 races in ONE 35 KB reply (ignored the 5-reply plan, but nothing was cut off). Clean: no invented art, no title placeholders. Fixes: 4 "{rival}" without "the", one grammar slip. A few choices have no real cost (to tune later).
- **Storylines batch 4 (Gemini parallel-chat test, chat 3):** `data/storylines-4.ts`, Ixil, Verdane, Raxxan, Ruuvak, Tarkhan; tests. **All 18 races now have a 6-chapter story** (engine to play them not built yet). Also one big reply. Fixes: 2 placeholders in titles, 3 "{rival}" without "the", one odd art choice. Strongest writing of the batch (Tarkhan liner dilemma, Raxxan "navigational safety fees").
- **New rival voices (hard pack 5):** `data/dialogue2.ts` `NEW_DIALOGUE`: battleWon, battleLost, betrayed, councilWin, prophecy, begging; 2 lines each for all 18 races (written across two chats, joined by Claude); test checks every race and placeholder. Not wired into diplomacy yet.
- **Neutral lairs (Gemini parallel-chat test, chat 4):** `data/lairs.ts`, 15 lairs (5 kinds x 3 tiers); test checks real weapon ids and guard hit points per tier (<=80 / 800 / 3000). Fixes: research field "shields" (does not exist) -> forceFields x2; "Cinderwake" renamed (echoed Cinder Pact); **tier-3 guard counts roughly halved** (Gemini had 4,000-6,000 HP of huge ships per lair). Rules (placing lairs, fighting them) not built.
- **Gemini scorecard so far:** writing and data are excellent (every file passed the format checks; fixes were names, a voice, placeholders in titles, invented art/types). Weak spots: (1) makes strong things too cheap (carriers 1.8x, military starbases 1.9x, money "sink" that returned 115-125%); (2) uses old rule numbers from memory (culture 75k, council 2/3); (3) a gamble whose success still led to disaster; (4) answers cut off at 20-28 KB. All are now in `GEMINI-RULES-addendum.md` (13 lessons) and pack 6 makes it print a self-check.
- **Pushed 2026-11-25 12:50** once GitHub was connected (14 commits). Master AI groundwork (Master difficulty, per-empire AI choice, basic AI internals exported; basic AI plays identical games, checked by fingerprint) is saved as a patch, not committed yet.

## 2026-11-24 — evening session

### Played
- Danny's report: autopilot "does nothing for 25 turns". Measured: the Humans on autopilot ended with 7 colonies vs 13.6 for rivals. Being the player made no difference; the cause was the shared AI.
- Live game in Danny's Chrome (Kethrak, Expansionist focus, normal): turn 61 → 12 colonies, 459 population, 985 production; met the Seraphine (trade + tech swap accepted), Ashkari and Quorai.
- 18 AI-vs-AI games for balance.

### Found
1. **AI boxed in** — when every reachable world was taken or too harsh, it kept its usual research and built colony ships that could reach nothing.
2. **Only the capital built colony ships.**
3. **Weak war response** — fleet targets ramp up over the first 80 turns even when someone has already declared war.
4. **Race balance** (colonies at turn 200, wins out of 18):
   - Quorai 33.8 colonies, 6 wins — far too strong (any planet + bare stars + research bonus).
   - Thraal 29.0, Gorrath 28.9 — strong.
   - Tarkhan 9.8, 0 wins — far too weak (combat edge only, nothing for the economy).
   - Everyone else 15–23.
5. **Victory types**: conquest 12, culture 3, technology 3. Games last 225–320 turns.
6. Small bugs: autopilot report was titled "Turn N report"; the first-contact greeting didn't match the turn report's.

### Changed
- AI detects being boxed in and pushes Propulsion (range) or Planetology (harsh worlds); counts only reachable settle targets; well-developed colonies build colony ships too.
- At war: full fleet target at once; colonies of 15+ people build warships.
- Autopilot **focus**: Balanced, Warlike, Industrial, Expansionist, Science, Spies & sabotage.
- Races: Quorai settle bonus 12→8, growth 0.7→0.6, no research bonus. Thraal settle bonus 12→10. Tarkhan +15% production, +1 ground troops, no ship-defense penalty.
- New: map hover tooltips, auto-explore for scouts, PC keyboard shortcuts, 📜 History screen with graphs, downloadable game log (the chronicle is recorded every turn in the save).

### Re-test after the race changes (18 new games)
- Winners spread over 11 races (was 7). Quorai wins 6 → 3; Tarkhan won once.
- Colonies at turn 200: Gorrath 30.8, Quorai 30.4, Thraal 29.2 at the top; Ashkari 12.0, Tarkhan 10.8 at the bottom.
- Victories: conquest 12, technology 5, culture 1. Game length 238–318 turns.

### Danny's turn-251 game (Kethrak, Warlike autopilot, read from his browser save)
- Stuck at 12 colonies from turn 61 to 251 while holding the biggest fleet: planets had up to 7,306 missile bases, so nothing could be conquered. Everyone at war with everyone; Seraphine hoarding 44k BC with 32 colonies and 60k culture.
- 13 idle colony ships at the capital: playing manually after autopilot, the shipyard kept the autopilot's "Colony Ship" order.
- Fixed: bases capped at 10 + pop/10 with rising cost (old saves trimmed), AI spends hoards on fleets, war-weariness peace after 50+ turns, runaway leaders detected sooner, advisor tip for idle colony ships.

### Balance tester fixed
- Empire 0 counted as "the player", so games ended when it died (all 12–16 "conquests" were that). Now every empire is AI and games run to a real win.
- Real results: technology 14 / culture 4 (Gate 50k, culture 100k) → culture 12 / technology 6 (Gate 65k, culture 90k). Set culture to 95k as the middle; re-test.
- Council and conquest never decide all-AI games: worth a look.

### Next to look at
- Ashkari and Tarkhan still settle the fewest worlds. Both are warrior races, so maybe that's fine if they win wars, but check their war results.
- Gorrath (cheap, long-range colony ships) are now the top expanders; watch them.
- Conquest wins two thirds of games — consider making culture/council paths more reachable, or the AI less eager for total war late.
- Expansionist and Science focus play only slightly differently from Balanced — give them stronger effects.
- Ashkari still need their living portrait video.

## 2026-11-25 overnight (Sonnet 5.5, Danny's Ashkari game, seed 569607727, large ring, 17 rivals, hard)
- AI now funds every shipyard from a hoard (was one); `rich` threshold 800+4*turn. Treasuries still 3-7k by T150: income outruns sinks. TODO: more sinks.
- AI never fights more than 2 wars at once (call-to-war acceptance and runaway-leader declarations were unlimited).
- Test 'relaxed fewer wars' now sums 3 seeds (single seed was chaotic).
- Two full playthroughs as Ashkari (warlike autopilot, no cheats, own view only): ELIMINATED around T266-277. At ~T244 every empire declared war on me within 2 turns. Likely cause (UNVERIFIED): autopilot builds the Ascension Gate, which makes everyone treat me as a runaway leader (findThreat, buildingAscension => score 1). Needs: a defence plan before the Gate, or the Gate only when strong.
- Results for rivals are only for balance work (PEEK=1 in tools/play.test.ts); normal play prints own empire only.

### Balance round (medium maps, 5 rivals, 18 AI-only games each, tools/balance.test.ts GAMES/SIZE/RIVALS/OUT)
| change | tech | culture | council | no winner by T400 | median final treasury |
|---|---|---|---|---|---|
| baseline (Gate 65k) | 6 | 5 | 4 | 3 | 2071 |
| + imperial upkeep (0.3*(colonies-6)^1.25 BC/turn) | 6 | 6 | 5 | 1 | 2449 |
| + rich empires build ships at every colony | 8 | 5 | 3 | 2 | 1940 |
| Gate 130k | 0 | 9 | 3 | 6 | 1567 |
| **Gate 100k (kept)** | 4 | 7 | 3 | 4 | 1677 |
- Quorai wins fell from 4 to 2; winners now spread over 8 races.
- Still open: hoards (~1700 median), 4 of 18 games unfinished at T400, conquest wins ~0.
- Test fix: war-count test counted events only after the last turn (events are trimmed each turn).
- Round 2 (fresh seeds 2000+): culture target 95k -> 75k and Gate 100k -> 90k. Result on 18 medium games: tech 4, culture 7, council 5, no winner 2; 12 different races won; median game ends ~T350. (Culture 85k: 5 unfinished; 70k: culture 10 / tech 1.)
- Round 3 (races, 3 x 54 medium games, seeds 3000/4000/5000; each race appears ~15-23 times so +-10% is noise):
  - Nyx won 44% / 43% / 30% -> production 1.2 -> 1.0. Quorai 36% / 25% / 50% -> colonizeBonus 8 -> 4.
  - Never or rarely winning: Velari, Verdane, Ruuvak, Ixil, Seraphine, Raxxan -> production 1.1 for Velari, Verdane, Ruuvak, Ixil; Seraphine research 1.1. Raxxan untouched, re-check next round.
  - Sonnet agent's long war game (Terran Accord, T307): conquered 2 empires and reached 32 colonies but a tech-ahead rival's huge-hull ships wiped a 330-ship fleet, and transports die in battle. Claimed, not yet verified in code: tech lead decides fights too strongly; transports soak fire.
- Round 4: combat targeting — unarmed one-hit ships (troop transports) now draw 1/4 of enemy fire, so they no longer act as a shield or die in droves (Sonnet agent's observation, confirmed in pickTarget). After this and the race buffs culture won 13 of 18 (too many), so culture target 75k -> 90k: tech 4, culture 8, council 3, conquest 1, none 2 (18 medium games, seeds 2000+).
- Round 5: tried spending hoards harder (buy fraction 0.5 -> 0.8, smaller reserve): median treasury unchanged (~2100) — the AI has nothing left to buy, so the hoard is structural; reverted. Needs a new money sink (design decision), not an AI tweak.
- Council vote share 2/3 -> 60% (stalemates were common; AIs abstain often): unfinished games 4 -> 1 of 18, council wins 4 -> 6. UI text updated.
- Round 6 (hand-played game, small spiral, 3 rivals, normal, Terran Accord, seed 777001, own-view only, no cheats): LOST. Expanded to 14 colonies, captured 4 planets, but Quorai (culture 51k at T266, 6 tier-10 fields + Ascension Gate) counter-invaded and conquered everyone by T313. Autopilot flip-flopped (declared war right after peace) and treasury sat at 2000+ unspent for 100+ turns.
- Quorai investigation: win rate in 54-game samples 36%, 25%, 50%, 59% (travel phase->warp), 41% (star habitat size 15->9), 65% (size 6). Expected ~17%. Star-habitat size and travel are NOT the driver (results did not fall as it shrank; sample noise is +-12%). Both changes reverted. Suspects not yet tested: ignoresEnvironment with low growth, AI personality p(0.4,0.5,0.2,0.9,0.4), phase travel.

## 2026-11-25 14:50 Master AI, part 1 (main session, Fable 5.2)
- New `src/ai/masterAI.ts` (not yet wired into the game: no "Master" difficulty or menu yet) and `tools/tournament.test.ts` (run: `GAMES=18 SEED0=8000 npx vitest run --config tools/vitest.tools.config.ts`).
- It plays the basic AI's turn, then: no wars of choice, takes any peace, culture buildings and wonders first, never builds the Gate, rushes buildings every turn, and before a council vote gifts 200 BC at a time to lift the cheapest set of voters to feeling 62.
- Tournament, medium, 1 master vs 5 basic, seat 0, same seeds with a basic AI in seat 0 as control: seeds 7000+ master 3/6, control 1/6; **seeds 8000+ master 14/18 (12 council, 2 culture), control 0/18**. Target was 40%.
- **Balance finding: the council can be bought.** A gift gives +BC/10 feeling (max 20 per gift, no limit on gifts per turn), and rivals vote for anyone at feeling 40-60. About 400-600 BC per voter the turn of the vote wins it. A human can do the same. Suggested fixes (not done, design decision): cap gift warmth per 10 turns, make votes need lasting friendship (treaty or 20+ turns of good relations), and make AIs refuse to crown anyone near 50% of votes.
- Still to do: wire in (Empire.ai, "master" difficulty, UI: the groundwork patch no longer applies cleanly), Gate route when safe, war play, a test in tests/.

## 2026-11-25 15:05-15:45 Unrest, revolts and civil war (main session, Opus 5.5)
Danny's must-have "civil war with spy options" and the idea "occupation and resistance", built on Gemini's `data/unrest.ts`. Rules in `src/engine/unrest.ts`; no save-version bump (all new fields are optional).
- **Unrest 0-100 per colony** drifts 15%/turn toward a target: occupied foreign people +15 (+45 more fading over 120 turns), far from the capital up to +15, more than 12 colonies up to +15, wars longer than 30 turns up to +12, enemy agitators up to +40; minus internal security x2, culture buildings x2, golden age -15. Capitals never rebel.
- **Effects:** up to -25% output at 100; at 30+ a 5%/turn chance of one of Gemini's 10 unrest events (their morale choices now also move that colony's unrest by 5 per point); at 65+ a revolt chance of 3% + 0.2%/point per turn (doubled while rebels are funded).
- **Revolt:** an occupied world rejoins its old empire (or any living empire of its people); otherwise the world and restless neighbours within 6 ly (at most a third of the empire) break away as a **rebel empire** (Gemini's faction name and manifesto), at war with the old one, keeping the techs, map knowledge and designs, with half the idle fleets there defecting. At most 4 rebel empires a game; past that, riots are crushed (people and factories lost).
- **New spy missions:** incite unrest (+30 agitation), fund rebels (angriest world, +15 agitation, revolt chance x2 for 10 turns), spread propaganda (takes 1% of their culture, max 300, half to us). Basic AI funds rebels against a runaway leader it's at war with, and spy-focused AIs incite unrest.
- **AI:** raises security when its worlds are restless (+1/+3/+5 at 25/40/55), and builds Civic Forums and Grand Theaters on restless worlds. Master AI likewise.
- **UI:** colony chip "😐/😠/😡 Unrest N ↑↓" with the reasons (tooltip, and a line when 30+); new spy missions in the spy menu; auto-turns stop when a world rises up.
- **Balance** (54 medium games, 5 rivals, seeds 3000+, same seeds before/after):

| | culture | council | tech | no winner | median end | games with a civil war |
|---|---|---|---|---|---|---|
| before | 22 | 15 | 11 | 6 | T340 | - |
| first tuning (penalty 40%, faster weariness) | 24 | 14 | 5 | **11** | T352 | 25 |
| **kept** (penalty 25%, weariness after 30 turns) | 25 | 18 | 6 | 5 | T330 | 7 |
- Quorai unchanged (9 of 22 games) — unrest is not the Quorai fix.
- Tools: `tools/unrest-probe.test.ts` (counts revolts, civil wars, unrest levels); `tools/vitest.tools.config.ts` runs any tool test (`TOOL=tools/x.test.ts`).
