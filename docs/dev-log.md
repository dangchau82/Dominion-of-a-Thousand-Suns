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

## 2026-11-25 15:50 Master AI wired in; council votes can no longer be bought on voting day
- **Gift cap:** one empire's gifts earn another empire's goodwill at most +20 per 10 turns (`GIFT_WARMTH_CAP`, `GIFT_WINDOW` in diplomacy.ts; stored in `Empire.giftWarmth`). Extra gold still arrives but buys no more love. Basic-AI balance unchanged (54 games, seeds 3000+: identical results).
- **Master AI** now courts voters steadily instead: from turn 110, once every 10 turns, if it is in the top two for votes, it gifts the cheapest voters it still needs.
- **Wired in:** difficulty `"master"` (new-game menu: "Rivals play the Master AI"), `Empire.ai` + `setAutopilotAI` command, autopilot menu "Standard / Master autopilot" for the player, router in `src/ai/index.ts` (`brainOf`). The old `master-ai-groundwork.patch` is superseded. No save bump (optional field).
- **Tournament after the gift cap** (1 master vs 5 basic, medium, seeds 8000+): **13/18 wins** (7 council, 6 culture); control (basic AI in the same seat) 0/18. Note: seat 0 under a basic AI has won only 1 of 24 tournament games (expected ~4); worth checking whether seat 0 starts worse.
- **All-master games** (18, seeds 3000+): culture 13, council 3, no winner 2, median end T343, 12 different races won; Quorai not dominant.
- Tests: `tests/masterAI.test.ts` (wiring, legal orders, never the Gate, gift cap, determinism). Balance tester takes `DIFF=master`.

## 2026-11-25 16:05 Gemini packs taken over from Claude 2 (out of usage)
Danny passed 5 Gemini answers to the main session. All added as **data only** with `tests/lore2.test.ts`:
- `data/infestation.ts` (Hollow Crawlers: 10-event chain with 3 branches, specimen gamble): passed. Note for the runner: event 10 should follow the end of the chosen branch, not event 4.
- `data/contracts.ts` (frontier job board: 18 contracts, 6 twists): passed; Iron-Jackal Corsair money 330 -> 300 (tier 2 stays in event scale).
- `data/hazardWorlds.ts` (6 death worlds, prison colony, 6 prison events; Gemini called it deathWorlds.ts): passed; upkeep rises with the production bonus.
- `data/legends.ts` (12 crew traits, legend loss morale, 8 synthetic leader traits, 5 events): passed; unused import removed, one description capitalised.
- `data/megaprojectEvents.ts` (5 superweapon + 5 starbase events, superweapon reactions for all 18 races): superweapon events named one specific weapon though any of the four can be built: now "our superweapon"; one title and two labels reworded.

## 2026-11-25 16:40 Carriers and fighters (must-have), built on Gemini's `data/carriers.ts`
- **Designer:** Large and Huge warships can fit up to 6 fighter bays (`ShipDesign.bays`: bay type, count, optional variant). Bays unlock at research tiers (Bay I construction 3, II weapons 5, III computers 7, IV construction 9); variants: interceptor and heavy fighter with Bay I, bomber with II, salvo wing with III. Bays shrink with newer tech like other parts. No save bump (optional field).
- **Combat:** each carrier group launches a fighter wing. Fighters fire after ships each round, use the bay's guns or 75% of the owner's best beam (whichever is bigger), draw at most half of the enemy's fire, and shoot down missiles and torpedoes (up to half of those aimed at their side). Lost fighters are never lost ships: they are rebuilt free.
- **Tuning** with `tools/carrier-duel.test.ts` (equal-cost fleets, tiers 4-8): Gemini's flat damage fell far behind late shields; fighters fired first and wiped fleets; tiny fighters soaked all fire. After the fixes above, plus Bay I 2 hits and huge-hull fighters 34/39/44/44 per bay, carriers trade **0.7-1.5x vs beam fleets and 0.9-2x vs missile fleets**. Tuning knobs: `FIGHTER_TUNING` in combat.ts, `FIGHTER_BEAM_SHARE` in designs.ts.
- **AI:** about half the empires (more if aggressive) give a third of a new Large/Huge design's free room to bays; design value counts fighter damage.
- **UI:** bay picker, count and fighter-type menu in the ship designer; fighters listed in design cards and the summary.
- **Balance** (54 medium games, seeds 3000+): culture 26, council 18, tech 5, no winner 5, median end T330 (before: 25/18/6/5, T330). Unchanged.
- Tests: `tests/carriers.test.ts`.
- Also: `docs/gemini-art-jobs.md` (title screen, cutscenes, battle art, UI mock-ups, Ashkari video) for Gemini.

## 2026-11-25 17:10 Treasury projects (money sinks) in play, from Gemini's `data/moneySinks.ts`
- **Rules** (`src/engine/moneySinks.ts`, command `investSink`, `EmpireView.moneySinks`): 5 projects, each with a cost that grows with turn and colony count and a cooldown. Privateer Armada Charter (warships of your best design worth 1.1x the price at the capital, 15% the captains skim and raid), Crash-Program Institute (0.45 research per BC into your weakest field), Delegate Syndicate Retainer (extra council votes = 4% of all votes for 15 turns; 20% leak: 2% and angry rivals), Imperial Monument Bonds (0.45 wonder progress per BC; never the Ascension Gate), Freeport Venture Syndicate (10-turn bond paying 1.3x / 0.95x / 0.3x, 0.98x on average; rolled at maturity). Minor-race patronage stays off until minor races are in play. No save bump (optional fields).
- **AI:** one project a turn from surplus after buildings: mercenaries when at war, wonder rush, research grant, bonds in peace; the Master AI also lobbies before a council it can win.
- **UI:** Empire screen, "Treasury projects" with costs, reasons and Buy buttons; bonds listed with their pay-out turn.
- **Result** (54 medium games, seeds 3000+): AIs buy 150-200 projects a game (`tools/treasury-probe.test.ts`). Median final treasury 2243 -> 2017; wins culture 24, council 18, tech 7, none 5, median end T334 (before 26/18/5/5, T330). **The hoard is only a little smaller:** AI income swings by thousands a turn late in the game, which a few cooldown-limited projects can't absorb. The real fix is in the economy (e.g. leftover-to-treasury 50% -> 30%, or upkeep on fleets); not done, needs a balance round of its own.
- Tests: `tests/moneySinks.test.ts`.

## 2026-11-25 17:40 Prophecies in play (Danny's favourite), from Gemini's `data/prophecies.ts`
- **Rules** (`src/engine/prophecy.ts`): fates are decided ahead by the seeded RNG and then happen; seers may foretell them. Velari and Lumen hear plain words naming the world; everyone else hears riddles with the star colour, the direction from their capital and the number of turns.
  - **Plague:** about 1 in 150 turns per empire from turn 40, 6-12 turns of warning (70% foretold, seers always): -25% people on that colony, only -8% if it spends 30%+ on ecology when it hits (quarantine).
  - **Golden age:** foretold 6-15 turns ahead when the culture curve says so (seers always, others 15%); it then arrives no later than foretold.
  - **Invasion:** an unseen enemy fleet heading for one of our worlds 3+ turns out (seers 50% a turn, others 15%); "came true" if it arrives or the world falls, otherwise "did not come to pass".
  - Supernova, elder-awakening and betrayal texts wait for those systems.
- **Log:** `Empire.prophecies` (last 20, with outcome); Empire screen has a "🔮 Prophecies" list. AI quarantines a named plague world 2 turns before it hits.
- No save bump (optional fields). Tests: `tests/prophecy.test.ts`.

### Quorai investigation, round 2 (54 medium games each, seeds 3000+, current code)
- Baseline 7 wins in their games; ignoresEnvironment off: 8/22; average personality: 6/22; no starless settling: 6/22. None alone is the driver.
- They win by **culture** (24 of 27 wins). At turn 220 they hold 67k culture vs 30-45k for others, 19 colonies, 7 golden ages (others 5-6): an early expansion lead that compounds through culture and golden ages.

## 2026-11-25 18:15 Council resolutions in play; prophecy golden-age bug fixed; title screen art
- **Bug (from the 17:40 prophecy commit, now fixed):** when a foretold golden age arrived early on its own, the "comes true by the due turn" step raised culture to the *next* golden-age threshold, a huge free gift. It pushed culture wins to 42/54 and games ended ~T287. Fates now remember which golden age they foretold. Test added.
- **Council resolutions** (`src/engine/resolutions.ts`, Gemini's `data/resolutions.ts`): from turn 112, every 25 turns (halfway between elections) the council debates one resolution, voted next turn with council votes (command `resolutionVote`, yes/no/abstain; the target always counts as no); passes with more than half of all votes. Sanctions are aimed at the worst aggressor (2+ wars), the leader (culture + votes), the spymaster or the hoarder (2000+ BC); galaxy-wide measures cover everyone. Passed resolutions add their bonuses through `empireBonus` for 12-25 turns; rules: no new wars (declareWar refused), embargo (no trade income for the target and its partners), disarmament (no spy missions). AI votes: sanctions on its threat, enemies or rivals it dislikes; measures by how much they help it. Player: a vote screen after the turn, and auto-turns stop for it.
- Data changes (Claude): galaxy-wide culture boosts removed from the jubilee, science year and seed grant (they sped up culture wins); the leader sanction's culture cut 8% -> 15%.
- Council screen text said "two thirds"; the rule has been three fifths since this morning. Fixed.
- **Balance** (54 medium games, seeds 3000+, with all of today's systems): culture 28, council 13, tech 7, no winner 6, median end T351; Quorai won 6 of their 22 games (27%, was 32-36%).
- AI test "relaxed rivals start fewer wars" now sums 8 seeds (5 was too noisy once resolutions change who fights whom).
- **Title screen:** Gemini's title art (wide for landscape, tall for phones held upright, `public/art/backgrounds/title-*.jpg`); the name sits in the dark top, the buttons below the gate.

## 2026-11-25 18:20 Prison colonies (Gemini coding job 05)
- Gemini wrote `src/engine/prison.ts` (breakout events on prison colonies, same pattern as unrest events) and `tests/prison.test.ts`; its reply 2 (the small edits) never reached Claude, so Claude wired those from the job spec: `Colony.prison` (optional, no save bump), command `declarePrison` (own non-capital colony, 220 BC and a little culture), +25% output in `colonyBudget`, "+15 Prison colony" in the unrest reasons, `PRISON_EVENTS` findable by `EVENT_BY_ID`, `processPrisons` after `processUnrest`. Colony panel: "⛓️ Make prison colony" button.
- **Gemini's score:** real functions only, compiled first time, deterministic, 4 of 5 tests right. The fifth expected the unrest target to rise by exactly 15, but targets are clamped at 0, so one assertion was fixed. Same standard as its earlier coding jobs: fine for contained jobs with complete files.
- AI doesn't declare prison colonies yet.

## 2026-11-25 18:25 — Moving title screen, gate opens, Ashkari living portrait
- Title screen (wide screens): Gemini's 10 s title video, re-cut to loop seamlessly (1 s crossfade), 0.4 MB, `public/art/backgrounds/title-wide.mp4`. Phones held upright and reduced-motion players keep the still picture.
- `src/ui/gatePortal.ts`: a canvas laid over the ring (object-fit cover maths) wakes the gate: sparks run round the rim, light pours in from the edge, then a soft rippling, shimmering surface holds. Original design, no film effect copied.
- Ashkari living portrait from Gemini (Gemini job 03), cropped square to match the others, looped by crossfade; `ashkari` added to `LIVING`.

- 19:15 Gemini Set B (moving scenes): first clip in, `public/art/scenes-video/ruuvak-science.mp4` (17a, egg hatching, plays once). Not shown in game yet; wire up with the scene pictures.
- 19:15 Set B 17b in: `ruuvak-war.mp4` (guarding the nest, frill lowers; little battle damage shown, plays once).
- 19:17 Set B 17c in: `ruuvak-invasion.mp4` (ships lower eggs onto the captured world, she blesses the nests; only 640x360 from Gemini).

## 2026-11-25 19:25 Why-won report (new tool, no rule changes)
- `tools/why-won.test.ts`: plays AI-only games and reads the chronicle to find the first turn from which the winner stayed #1 in each stat (colonies, population, factories, techs, fleet, culture), plus its ranks at T50/100/150. Run: `TOOL=tools/why-won.test.ts GAMES=54 SIZE=medium RIVALS=5 SEED0=3000 npx vitest run -c tools/vitest.tools.config.ts` (about 3 minutes; JSON in /tmp/why-won.json).
- **54 medium games, seeds 3000+ (code at 835e7db):** culture 28, council 13, tech 7, conquest 0, no winner 6.
- **Quorai:** won 6 of 22, all by culture; in all 6 they were #1 in colonies by T100 and never lost it. Only 11 of the other 42 winners led in colonies at T100. Their edge is early expansion.
- **Snowball:** the median winner locks its first lasting lead 167 turns before the game ends. First stat locked: colonies 14, techs 10, culture 9, fleet 7, factories 6.
- Next candidate (from the ideas review): Quorai colonies grow only from homeworld migrants; re-run these seeds.

## 2026-11-25 20:00 Imperial proclamations and edicts in play (Gemini job P1 data, Claude rules)
- **Proclamations** (`src/engine/decrees.ts`, data `data/decrees.ts`, commands `proclaim` / `revokeProclamation`, `EmpireView.proclamations`): standing empire-wide policies, each with a gain and a price. 12 open to all plus one for each race (30). Slots: 1, +1 after two golden ages, +1 while calm (4+ colonies, average unrest under 15); never by size. Bonuses go through `empireBonus`; `unrest` x3 is added to every colony's unrest reasons; upkeep per colony each turn (lapses if unpaid); then a cooldown. Rivals are told, and feel -2 / +1 while it lasts.
- **Edicts** (command `issueEdict`, `EmpireView.edicts(starId)`): 16 one-off orders on one own colony (any / capital / not capital / conquered / frontier beyond 8 ly / unrest 30+). One per colony at a time; each has its own cooldown there. Effects: production, research, growth, culture, ground defence (+60 duel points per 100%), unrest at once and while it lasts, some cost people.
- **Gemini's data, as checked:** counts, ranges and plus/minus rule all correct first time. Nine race proclamations did not fit the race (Velari written as merchants, Orrun as nomads, Kethrak as warrior clans, Seraphine as singers, and so on): rewritten or moved by Claude. The Quorai one boosted culture (their winning path): replaced with production and range. Two proclamations were named "Edict"/"Decree": renamed.
- **Balance fixes found by the 54-game run** (medium, seeds 3000+, `tools/why-won.test.ts`):
  - First cut: council wins 30, culture 11, games 50 turns shorter. Two causes: a one-off relations change on every proclaim piled up for ever, and production edicts were so cheap the AI ran one on every big colony non-stop.
  - Now: rival reaction lasts only while the proclamation does; listed goodwill counts 40% (`PROCLAMATION_GOODWILL`; ill will in full); a production or research edict also costs 80% of the extra output it brings (`EDICT_OUTPUT_PRICE`), so it buys a burst, not free output.
  - **Result:** culture 27, council 17, tech 6, no winner 4, median end T335 (before decrees: 28 / 13 / 7 / 6, T351). Quorai 6 of 22, unchanged. **Watch:** humans won 8 (2 before); their Charter of Ambition stacks with their trade trait. One run only, so check again before changing it.
- **AI:** proclaims the best-scoring option for its personality and situation when a slot is free; issues at most one edict a turn (relief for a world at unrest 40+, else a boost for its biggest producer from real surplus). Master AI counts edict spending.
- **UI:** Empire screen "Imperial proclamations" (Proclaim / Withdraw); colony panel "Issue an edict" list.
- No save bump (optional fields). Tests: `tests/decrees.test.ts` (10).

## 2026-11-25 22:15 Ascension Gate 90,000 -> 70,000 (more technology wins, fewer culture wins)
Danny asked for fewer culture wins and more technology wins. 54 medium games each, seeds 3000+ (`tools/why-won.test.ts`):

| Culture target | Gate cost | Culture | Council | Tech | No winner | Median end |
| --- | --- | --- | --- | --- | --- | --- |
| 90,000 | 90,000 (before) | 27 | 17 | 6 | 4 | T335 |
| 95,000 | 90,000 | 19 | 22 | 6 | 7 | T341 |
| 100,000 | 90,000 | 16 | 23 | 8 | 7 | T348 |
| 95,000 | 60,000 | 7 | 18 | 29 | 0 | T311 |
| 95,000 | 45,000 | 0 | 12 | 42 | 0 | T278 |
| 90,000 | 75,000 | 20 | 17 | 15 | 2 | T329 |
| **90,000** | **70,000 (now)** | **16** | **16** | **20** | 2 | T327 |

- Raising the culture target does not help technology: those wins go to the council and more games stall. The Gate's price is the lever, and it is steep (60,000 already gives tech 29).
- Quorai 6 of 22 in every row except 45,000 (4): the victory mix is not their problem.
- Conquest still 0 of 54.

## 2026-11-25 22:30 (Claude 2): race storylines in play
- New `src/engine/storylines.ts`: every race now lives through its own 6-chapter story (Gemini's text in `data/storylines*.ts`). Chapters 1-4 in order, then ending 5A or 5B, picked by the answer to chapter 3. Each chapter starts when its own condition comes true (a turn, N colonies, first war, first golden age, a council session), or by a fallback turn (40 / 110 / 160 / 210 / 260) so nobody misses theirs. At least 12 turns between chapters; waits while the empire has another event open; a chapter naming a rival waits for one to be met (up to 40 turns past its fallback). {colony} = capital, {star} = nearest explored star, {rival} = current enemy, else the contact liked least. Rebel empires don't get the story.
- **No random draws**, so seeds and galaxies are unchanged; but story choices change how games go (one test game ended in an early council win at T151). `tests/resolutions.test.ts` council test moved from seed 14 to 15 for that reason.
- Story events go through the normal event screen and AI; the screen shows "Your people's story: chapter N of 5" above the title (`subtitle` on view events). Chapter 3's answer is remembered in `resolveEvent` via `noteStoryChoice`.
- `Empire.story` + **save version 12** (v11 games start their story at chapter 1). `tests/storylines.test.ts` (8 tests). 170 tests pass.
- **Newer rival voices in play** (Gemini's `data/dialogue2.ts`): `sayMoment` in dialogue.ts (no random draws). Battle reports now end with the rival leader's words (gloating if their side lost less, defiant if more); a rival whose treaties we break says so once (`breakTreaty`); an empire down to its last 2 worlds pleads ("begging") instead of its normal peace line (`offerPeace`); when a council resolution passes, the biggest AI "yes" voter gloats to each "no" voter. Not used yet: the "prophecy" lines (for when allies share prophecies). `tests/voices.test.ts` (4 tests). 174 tests pass.


## 2026-11-25 23:35 Quorai migrant rule; 162-game win table for all 18 races
- **Rule** (`src/engine/migrants.ts`, race field `homeMigrants`): Quorai colonies no longer grow on their own. Each turn the capital sends 3% of its people, split evenly among colonies with room, and regrows what it sent. Ecology spending still buys people. Colony panel says so.
- **Tuning** (22 Quorai games of the 54, seeds 3000+): pure rule at 2% or 3%, no buying: 0 of 22. Buying allowed: 1. Growth 1.0, share 5%, bonus 8, no buying: 1. **Buying allowed + colonizeBonus 4 -> 8: 4 of 22 (kept).**
- `tools/why-won.test.ts` now prints a win rate for every race, and `ONLY=<race>` plays just that race's games.
- **162 medium games** (6 empires each, seeds 3000+, 4000+, 5000+; each race in 45-60 games; fair share 17%): technology 55, council 56, culture 48, no winner 3, conquest 0.

| Race | Wins | | Race | Wins |
| --- | --- | --- | --- | --- |
| nyx | 21/60 35% | | lumen | 8/59 14% |
| thraal | 15/57 26% | | orrun | 7/55 13% |
| gorrath | 13/56 23% | | tarkhan | 7/55 13% |
| drovani | 13/58 22% | | kethrak | 7/56 12% |
| quorai | 11/52 21% | | velari | 6/54 11% |
| ruuvak | 9/49 18% | | seraphine | 5/56 9% |
| humans | 10/55 18% | | verdane | 4/45 9% |
| ashkari | 8/51 16% | | raxxan | 4/48 8% |
| vossari | 8/53 15% | | ixil | 3/53 6% |

- **Next:** Nyx are now the strongest (35%); Ixil, Raxxan, Verdane and Seraphine are under 10%. With ~55 games a race, about +-6% is noise.

## 2026-11-26 00:30 (Claude 2): supernova crisis in play
See `docs/CLAUDE-2-UPDATES.md` for details. New `src/engine/supernova.ts`, save v13, `tests/supernova.test.ts`.

## 2026-11-26 00:30 Conquest victory: hold most home worlds; Nyx growth halved
- **Conquest** (`victory.ts`): an empire that holds its own home world and more than half of the galaxy's original home worlds wins (4 of 6 in a 6-empire game). Last-one-standing still counts. The galaxy is warned once when someone is one home world short; the basic AI treats that empire as the threat to stop. `GameState.homeStars` records the starting home stars (new games only; old saves keep the old rule). Victory screen shows each empire's home worlds.
- Why: in 18 test games, the eventual winner usually held 2-4 home worlds and 3 rivals were dead, but games still ran to culture, tech or council at T300+.
- **Nyx** growth 1 -> 0.5 ("built, not born": they still buy people in factories at 2/3 cost). Nyx 7 of 37 games (19%), was 35% of 162.
- **54 games (seeds 3000+):** technology 18, council 15, **conquest 9** (was 0), culture 11, no winner 1, median end T322. Nyx 1/16 here (small sample). Tests: `tests/conquest.test.ts` (4).
## 2026-11-26 01:00 (Claude 2): neutral lairs in play
See `docs/CLAUDE-2-UPDATES.md`. New `src/engine/lairs.ts`, save v14, `tests/lairs.test.ts`; `combat.ts` now exports its battle building blocks (no behaviour change).

## 2026-11-26 01:10 Manual lock: keep parts of the empire from the autopilot
- **Menu → Autopilot:** five switches, all on by default: colonies, research, fleets, diplomacy, treasury/spies/proclamations. Tap one to keep it: the autopilot then leaves it exactly as the player set it (e.g. diplomacy off = it never offers, accepts or refuses peace, declares war or votes for you).
- **Colony panel:** "Hands off" button per colony: the autopilot never changes its sliders, build, buildings or edicts; ships may still leave from it.
- The autopilot report says how many orders it left to the player. Events and game-flow orders are never held.
- Code: `src/ai/handsOff.ts` (which area each command belongs to); `runAITurns` filters only the player's empire and returns what it held. Commands `setAutoArea`, `setHandsOff`; `Empire.autoOff`, `Colony.handsOff` (optional, no save bump). Rival AIs and the balance tools are unaffected. Tests: `tests/handsOff.test.ts` (4).
- Fixes the handover's open problem 4 (autopilot resets ship builds and makes peace on its own).
## 2026-11-26 01:45 (Claude 2): the Crusade in play
See `docs/CLAUDE-2-UPDATES.md`. New `src/engine/crusade.ts` and `src/engine/chains.ts`, save v15, `tests/crusade.test.ts`.

## 2026-11-26 02:15 (Claude 2): invasive critters in play; supernova colony bug fixed
See `docs/CLAUDE-2-UPDATES.md`. New `src/engine/critters.ts`, save v16, `tests/critters.test.ts`.
## 2026-11-26 01:40 Playtest of Claude 2's supernova and lairs
- 18 medium games plus a 54-game run. Supernova fires once per game (T166-214), hits 2-4 empires, losses as designed. AIs always harvest, never evacuate; nobody studies remnants. A colony settled inside the dying star was left planetless: Claude 2 fixed this at the same time (its version kept). Lairs: AIs clear many in passing; raid losses small.
- **54 games (seeds 3000+), current main:** technology 23, council 15, culture 10, conquest 6, median T326. Strongest Ruuvak 35%, Thraal 29%; weakest Raxxan 5%, Ashkari 6%, Verdane 8%, Seraphine 9% (race balance being worked on).

## 2026-11-26 02:45 (Claude 2): alien infestation in play
See `docs/CLAUDE-2-UPDATES.md`. New `src/engine/infestation.ts`, save v17, `tests/infestation.test.ts`.

## 2026-11-26 03:10 (Claude 2): frontier job board in play
See `docs/CLAUDE-2-UPDATES.md`. New `src/engine/contracts.ts`, `src/engine/contractEvents.ts`, save v18, `tests/contracts.test.ts`.
## 2026-11-26 02:30 Peace terms: wars can end with worlds changing hands
- New proposal kind `cede`: at war, ask for 1-3 of the enemy's worlds (never their capital) in exchange for peace. Accepted: the worlds move with their people, factories and buildings (the people resent it like a conquest: `onCapture`), wonders go with them, and the war ends (`cedeColonies` in `combat.ts`). Refused: relations -5, the war goes on.
- **AI:** after 12 turns of war, an empire with 1.6x the enemy's known population asks for 1-3 of their worlds nearest its own (never the biggest known world). The loser accepts after 8+ turns of war if the asker is 1.4x bigger and the worlds are at most 30% of its people (2.5x bigger: up to 50%); never to the runaway leader.
- **Player:** diplomacy screen, at war: tick up to 3 of their worlds, "Offer peace for these worlds". Incoming terms appear with the other proposals.
- 6 test games: 92 demands, 39 accepted (about 6 treaties a game). 54 games (seeds 3000+): council 20, technology 16, culture 10, conquest 8; median T301 (was T326). Ceded home worlds count toward a conquest win. Tests: `tests/peaceTerms.test.ts` (4). `why-won` now counts treaties that handed over worlds.

## 2026-11-26 03:30 (Claude 2): death worlds in play
See `docs/CLAUDE-2-UPDATES.md`. New `src/engine/deathWorlds.ts`, save v19, `tests/deathWorlds.test.ts`.

## 2026-11-26 04:00 (Claude 2): android leaders in play
See `docs/CLAUDE-2-UPDATES.md`. New `src/engine/legends.ts`, one-line hook in `civ.ts`, save v20, `tests/legends.test.ts`.
