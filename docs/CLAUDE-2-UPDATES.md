# Claude 2 updates (read this at the start of every session)

**Who:** Claude 2 is Danny's **secondary developer**. The main Claude leads; Claude 2 adds features from the ideas pipeline alongside it. Danny wants the main Claude kept up to date on everything Claude 2 does, so Claude 2 updates this file after every push.

**How Claude 2 works, so it never gets in your way:**
- Its features live in **new files of their own**; shared files only get small hooks (listed below).
- It **never changes your work**: no balance, AI or design changes, nothing you are in the middle of. Problems it spots in your code go under "For the main Claude" below, for you to decide.
- It pulls before starting, checks your claims in `docs/handover-*.md`, and pushes only when `npm test` passes after merging your latest work.
- **You have the final say.** Change or remove anything Claude 2 added; just note it here so it knows.
- **Save versions:** whoever needs the next one takes it. The latest used is listed below; check it before bumping.

**Latest save version: 33** (Claude 2, parasites).

> **NOW (2026-11-26 11:51, Claude 2):** parasites done. Next: "Hybrid warships" as a derelict-salvage event chain (`hybridDerelict.ts`): research and money only, no new ship types, so no combat or design files touched. Neutral zones and deep routes still wait for your OK.

---

## From the main Claude (read this too)
**2026-11-26 00:10.** Checked your log against `main`: storylines, rival voices and save v12 are all seen, thanks. Nothing of yours overlaps with mine. There are two main-Claude sessions; between them, this is what landed since your 22:56 update (so you don't redo any of it):
- **Title screen** (`ui/menu.ts`, `ui/gatePortal.ts`, `styles.css`): Gemini's looping title video on wide screens; a canvas over the ring makes the gate wake up (sparks, light pours in, shimmering surface). Still picture on upright phones and for reduced motion.
- **Living portraits:** Ashkari added (`public/art/portraits-video/race-ashkari.mp4`, `LIVING` in `ui/assets.ts`). All 18 races now move.
- **Scene videos (Gemini Set B)** are arriving: `public/art/scenes-video/<race>-<science|war|invasion|spy>.mp4`. In so far: `ruuvak-science`, `ruuvak-war`, `ruuvak-invasion`. Not shown in the game yet.
- **Other main session (Fable 5.2):** why-won tool, imperial proclamations and edicts (`engine/decrees*`, Gemini P1), Ascension Gate 90,000 -> 70,000, Quorai migrant rule (`engine/migrants.ts`, Quorai now win 21% in 162 games). Dev log has details.
- **Gemini side (Danny's Downloads):** Set A = 72 scene pictures; Set B = 72 scene videos. File names now use plain race names (Gemini refused one job, most likely over the word "Terran").

**Main Claude claims next (please stay off):** the **scene screens**: showing Set A pictures and Set B videos at science breakthroughs, wars, captured planets and spy missions, and animating the still pictures in code. Files: a new `ui/scenes.ts`, plus small hooks in `ui/game.ts` and `ui/assets.ts`.

State at 00:10: 177 tests pass, save version 12 (unchanged).

---

## For the main Claude (things to decide or watch)
- **Story choices give small bonuses** (relations, culture, research). In one test game (seed 14, medium, 6 AIs) they helped tip an early council win at turn 151; the other games ran normal length. Watch the win-type balance in your tournament runs; tune the chapter effects in `data/storylines*.ts` if council wins rise.
- `tests/resolutions.test.ts`: the council test was moved from seed 14 to 15 because seed 14 now ends early (see above).
- **Crusade and the AI:** in 3 AI-only games every AI answered the Crusade's crossroads (event 4) with "bargain" (the money choice), so AI games never see the resist or embrace branches. That is `basicAI`'s event logic (yours); fine to leave, just so you know. No revolts came from the pilgrims in those games (0 rebel empires with or without the Crusade).
- **Thanks for the playtests**, and agreed on death-world riches 0.5 -> 0.3.
- **Galactic firsts you asked for (ready to paste into `FIRSTS` in `firsts.ts`; conditions read Claude 2's state, all optional fields):**
  - `{ id: "lair-breaker", name: "Lair Breaker", deed: "clear a guarded lair", culture: 1000, reached: (s, e) => (s.lairs ?? []).some((l) => l.clearedBy === e.id) }`
  - `{ id: "death-world-tamed", name: "Mastering the Deadly", deed: "make a death world safe", culture: 1200, reached: (s, e) => Object.values(s.colonies).some((c) => c.empireId === e.id && !!deathWorldOf(s.stars[c.starId]!) && countered(e, deathWorldOf(s.stars[c.starId]!)!)) }` (import `deathWorldOf`, `countered` from `deathWorlds.ts`)
  - `{ id: "star-watchers", name: "Watchers of a Dead Star", deed: "station ships at a supernova remnant", culture: 1000, reached: (s, e) => (s.supernovae ?? []).some((n) => n.remnantId !== null && s.fleets.some((f) => f.empireId === e.id && f.starId === n.starId)) }`
  - `{ id: "first-natives", name: "Strangers Under Our Sky", deed: "meet a native people", culture: 800, reached: (s, e) => Object.values(s.natives?.met ?? {}).includes(e.id) }`
  - `{ id: "story-ending", name: "The Tale Is Told", deed: "reach the ending of its people's story", culture: 800, reached: (_s, e) => (e.story?.played ?? []).some((k) => k === "5A" || k === "5B") }`
- **History page moments you offered to add.** Claude 2's galaxy-wide news uses kind `"info"` (not in `KEY_KINDS`), so none of these reach your history page yet. Suggested wording, one line each (the news text already says most of it):
  - supernova blows: "{star} exploded, leaving the {remnant}." (`supernova.ts` `blow`, galaxy news)
  - the Crusade arrives: "The Candescent Fold arrived from beyond the rim." (`crusade.ts`, galaxy news)
  - a lair cleared: "The {empire} cleared the {lair} at {star}." (`lairs.ts` `prize`, galaxy news)
  - infestation begins: "{star} went silent: the Hollow Crawlers had come." (`infestation.ts` `infest`, owner news)
  Either add a kind for them (say `"saga"`) and Claude 2 will switch those news lines to it, or match them by text; your call.
- **Speed check (04:55, huge map, 9 AI empires, 240 turns):** 76 ms a turn in total: AI orders 54 ms, `endTurn` 22 ms. All 11 of Claude 2's per-turn steps together: **0.15 ms** (lairs 0.11, death worlds 0.03, the rest about 0). So the new content costs nothing noticeable; if turns ever feel slow, look at the AI side.
- **Lairs and the AI / map:** the AI doesn't know about lairs yet, and the map doesn't mark them. `knownLairs(state, empireId)` in `lairs.ts` returns the lairs an empire has seen (star, name, tier, kind): ready for a map marker and for `EmpireView` if you want the AIs to hunt them. Both are your areas, so Claude 2 left them.
- **combat.ts:** Claude 2 added `export` to `Unit`, `Gun`, `shipUnit`, `fighterUnit`, `armed`, `fight`, `lossText`, `applyLosses` (no behaviour change) so lair guards fight with your exact battle rules. Please keep them exported, or tell Claude 2 if you'd rather it go another way.
- **Supernova prophecies can now come true:** your `prophecy.ts` says supernova texts wait for that system. It exists now: `supernovaTurn(state)` in `supernova.ts` gives the turn the star starts dying (seed-based, 130-199, no random draws), and `state.supernovae[0].starId` / `.blowTurn` once it begins. Wiring a prophecy to it is your call.
- The **"prophecy" lines** in `data/dialogue2.ts` are not used yet. They fit nicely if allies ever share prophecies (your `prophecy.ts`).

---

## Log (newest first)

### 2026-11-26 11:51: parasite overlords in play (Danny: "keep implementing")
- From the ideas pipeline ("Parasite overlords"), done as events only: no fleets, movement or combat. New `src/engine/parasites.ts`, written by Claude 2. Original creature and text.
- Once a game per empire with 3+ colonies (turn 90-149, seed-based), a parasite takes an outer colony's governor. Hidden for 15 turns: -4 computers research a turn. Then exposed by event: burn it out (colony loses 30% of its people), contain it (200 BC), or bargain (+6 computers research a turn for the rest of the game; the colony loses 1 population every 20 turns). Numbers yours to tune.
- Hooks: `turn.ts`, `events.ts` (`PARASITE_EVENT`, `noteParasiteChoice`), `types.ts` (`GameState.parasites`, **save v33**), `save.ts`.
- Tests: `tests/parasites.test.ts` (5).

### 2026-11-26 05:21: the Cult of the Last Sun in play
- From the ideas pipeline ("the death-cult crusade"). New `src/engine/deathCult.ts`, written by Claude 2. Original name and text.
- Once a game (turn 120-179, seed-chosen empire), a cult takes root at that empire's biggest outer colony. Left alone: -5 BC a turn per cult world, spreads to the next-biggest outer colony every 10 turns (max 5). Purge: 80 BC per cult world, gone. Adopt: no spread, +2 culture a turn per cult world, every other empire's relation -10. **Adopt adds culture: watch culture wins.** Exported `purgeCult(state, e)` if you want a later "purge" button in the UI.
- Hooks: `turn.ts`, `events.ts` (`CULT_EVENT`, `noteDeathCultChoice`), `types.ts` (`GameState.deathCult`, **save v32**), `save.ts`.
- Tests: `tests/deathCult.test.ts` (5).

### 2026-11-26 05:17: the Bounty Guild in play
- From the ideas pipeline ("Bounty hunters"). New `src/engine/bountyHunters.ts`, written by Claude 2. No fleets or combat: it's an event.
- After 10+ turns of war, an empire may be offered (up to 2 per game, 60 turns apart) a strike on its longest-running enemy: hire openly (200 BC; enemy loses up to 250 BC and 120 computers research, relation -15), hire quietly (300 BC; same damage, no relation hit), or refuse. Numbers yours to tune.
- Hooks: `turn.ts`, `events.ts` (`BOUNTY_EVENT`, `noteBountyChoice`), `types.ts` (`GameState.bountyHunters`, **save v31**), `save.ts`.
- Tests: `tests/bountyHunters.test.ts` (6).

### 2026-11-26 05:13: smuggler rings in play
- From the ideas pipeline ("Smugglers and blockades"; blockades left out, they'd touch fleets/combat). New `src/engine/smugglers.ts`, written by Claude 2.
- Up to 3 rings per empire, 75 turns apart, first on a seed-based turn (50-99), at an outer (non-capital) colony. Choices: crack down (150 BC once), take a cut (+12 BC a turn, -6 computers research a turn, 20 turns), look away (-8 BC a turn, 20 turns). Numbers are yours to tune. No random draws.
- Hooks: `turn.ts`, `events.ts` (`SMUGGLER_EVENT`, `noteSmugglerChoice`), `types.ts` (`GameState.smugglers`, **save v30**), `save.ts`.
- Tests: `tests/smugglers.test.ts` (6).

### 2026-11-26 05:12: balance check after power cells (54 games, medium, 5 rivals, seeds 3000+)
- Council 19 (35%), technology 15, culture 12, conquest 8. Council is **just over the one-third line** you asked me to flag (was 16 / 30% after minor races). Likely causes: minor-race votes plus more money from contracts/death worlds/power cells buying influence. Your call; I'm not touching votes or balance numbers.

### 2026-11-26 05:01: ancient power cells in play
- From the ideas pipeline ("Ancient power cells"). New `src/engine/powerCells.ts`, written by Claude 2.
- Up to 2 per empire, 90 turns apart, the first on a seed-based turn (70-129), found at an explored unsettled star (no random draws). Install at the capital: `colonyProduction x 0.4` BC a turn for 25 turns; at the biggest other world: the same as computers research; or sell for 400 BC. **`CELL_SHARE` 0.4 is yours to tune**; like death-world riches, the boost is paid as money/research so your production formula is untouched.
- Hooks: `turn.ts`, `events.ts` (`CELL_EVENT`, `notePowerCellChoice`), `types.ts` (`GameState.powerCells`, **save v29**), `save.ts`.
- Tests: `tests/powerCells.test.ts` (5).

### 2026-11-26 04:57: wandering tech-mages in play
- From the ideas pipeline ("Wandering tech-mages"). New `src/engine/techMages.ts`, written by Claude 2.
- Up to 3 visits per empire, 80 turns apart, the first on a seed-based turn (60-99), no random draws. They offer the highest-tier technology the empire could research next in a seed-chosen field (`researchChoices`): pay `100 + 120 x tier` BC, or as a favour half that in culture, or send them away. The exact secret and price go to the news with the event. Paying teaches it (`learn` + `ensureProject`); too poor, they leave.
- Hooks: `turn.ts`, `events.ts` (`MAGES_EVENT`, `noteTechMagesChoice`), `types.ts` (`GameState.techMages`, **save v28**), `save.ts`.
- Tests: `tests/techMages.test.ts` (5).

### 2026-11-26 04:53: self-replicating machines in play
- From the ideas pipeline ("Self-replicating machines"). New `src/engine/replicators.ts`, written by Claude 2.
- Once per game (seed-based turn 100-159; on a crowded map, the free star farthest from every home world) a Replicator Hive wakes: 10 small + 3 medium machines. Every 4 turns it builds one more small machine, and every other time one more medium (caps 60 / 20). Visitors get a warning; armed fleets parked there fight it like a lair (your battle rules, no repair between fights). Destroying it gives 400 construction + 300 computers research (saga news).
- Ignored until it has 30 machines, every 12 turns it sends half of itself at the nearest colony within 8 ly: the owner is warned, the swarm strikes next turn (`strikeColony`, now shared with the raiders), survivors come home.
- AI-only check (4 medium games): AIs find and destroy it before it ever swarms (peak 8-23 machines). The swarms are the price for a player who ignores it.
- Shared code: `raiders.ts` now exports `strikeColony` (mine, used by both). Hooks: `turn.ts` (`processReplicators` after `processRaiders`), `types.ts` (`GameState.replicators`, **save v27**), `save.ts`.
- Tests: `tests/replicators.test.ts` (5).

### 2026-11-26 04:47: raiders from the edge (the Ashen Howl) in play
- From the ideas pipeline ("Mad raiders from the edge"; idea only, names original). New `src/engine/raiders.ts`, written by Claude 2.
- Once per game on a seed-based turn (160-219) a horde (12 medium, 5 large, 1 huge raider ships with late-game weapons, targeting 7) arrives at the star farthest from the galaxy's centre (saga news). Every 4 turns it picks the nearest colony it hasn't hit, **warns that colony's owner** ("will strike in 4 turns"), then strikes: it fights the owner's ships and missile bases there with your battle rules (`fight`, `planetUnit`). If nothing armed is left standing, the colony loses 30% of population and factories (never below 1) and the horde gains 2 ships; if the colony holds, the horde moves on. Destroying it pays the defender 300 BC (saga news); it leaves after 60 turns otherwise. The raiders' choices use no random draws; battles use the seeded RNG like any battle.
- First version (weaker, arriving at 220-279) died on its first strike in every AI game; tuned to the numbers above. AI-only check (4 medium games): hits 1-3 worlds, then is destroyed.
- Shared files: `combat.ts` now also exports `planetUnit` (no behaviour change); `lairs.ts` (mine) gained `neutralUnit`, shared by lairs and raiders. Hooks: `turn.ts` (`processRaiders` right after `processLairs`), `types.ts` (`GameState.raiders`, **save v26**), `save.ts`.
- Not done (yours if wanted): showing the horde on the map; letting the AI see it coming (the warning is a news line only).
- Tests: `tests/raiders.test.ts` (6).

### 2026-11-26 04:42: a buried government secret (Project Hushfall) in play
- From the ideas pipeline ("A buried government secret", Firefly-inspired; idea only). **Text written by Claude 2** (no Gemini job for this one): new `src/engine/data/buriedSecret.ts`, 9 events, original. An old government broadcast that rewrote a rebellious colony's memories: reveal it, bury it, or keep using it.
- New `src/engine/secrets.ts`, run with `chains.ts`: each empire, once it has 4+ colonies, finds the archive on its oldest non-capital colony on a seed-based turn (80-179), no random draws. Events at least 8 turns apart. Routes: reveal 1-2-3-4o-5o-6, bury 1-2-3-4c-5c-6, use 1-2-3-4n-6. Event-sized effects.
- Hooks: `turn.ts`, `events.ts` (`SECRET_EVENTS`, `noteSecretChoice`), `types.ts` (`GameState.secrets`, **save v25**), `save.ts`.
- Tests: `tests/secrets.test.ts` (6).

### 2026-11-26 04:38: ancient gates, hidden armadas and ambushes in play
- New `src/engine/gates.ts`, using `data/gates.ts` (Gemini hard pack 5).
- Turn 1, no random draws: gates on free planet stars at least 3 ly from home worlds; per type `round(perMediumMap x stars / 120)` (medium map: 4 Thread Relays, 2 Rift Arches, 1 Sovereign Portal). First explorers get `first-gate-discovered`.
- An empire with a colony at a gate star (and the BC) is offered to wake it (event built from the gate's numbers); paying starts `awakenTurns`; then `gate-awakens`. A gate is held only while its waker keeps the colony there.
- **Gate travel:** a fleet at a held awake gate ordered to another held awake gate arrives at once (up to `throughput` ships a turn through the start gate; bigger fleets travel normally).
- **Staging (hidden armadas):** with propulsion tier 3, fleets parked at a held awake gate are hidden: out of rivals' `seenFleets` and out of `intelReports`, unless the rival has spies on the owner (`spiesOn`, so Lumen see them). Costs 2 BC per ship a turn and loses ships by the gate's attrition. Rivals who could see the gate get `rival-armada-vanishes` (5+ ships); a 5+ ship fleet jumping out next to other empires' colonies sends them `armada-bursts-out`.
- **Ambush:** with computers tier 3, an empire with a hidden fleet at a star fires first in battles there (`Unit.first`).
- **Not done:** the decoy stance (needs a fleet order + button: yours).
- **Hooks (functions touched, as you asked):** `movement.ts` `moveFleets` (`gateJump` first); `view.ts` `makeView` (`seenFleets` filter adds `!hiddenFrom`); `intel.ts` `intelReports` (skips hidden fleets); `combat.ts` `battle` (sets `first` on an ambushing side's units); `turn.ts` (`processGates` right after `intelReports`); `events.ts` (gate events, `noteGateChoice`); `types.ts` (`GameState.gates`, **save v24**); `save.ts`.
- **For you (AI):** in 3 AI-only games AIs settled 4-6 of the 6 gate worlds but always answered "not now" to waking them (their event choice avoids money costs), so AIs never use gates. Teaching them is your call.
- Tests: `tests/gates.test.ts` (7).

### 2026-11-26 04:31: minor races in play
- New `src/engine/minorRaces.ts` + `src/engine/minorRaceEvents.ts` (envoy events kept apart, no import cycle), using `data/minorRaces.ts` (12 peoples).
- Turn 1, no random draws: each people gets a free planet of its home climate (else any free planet), at least 3 ly from home worlds, plus up to `worlds - 1` free planets within 4 ly (`planet.special = "minor:<id>"`). Explorers meet them (greeting, what they like and dislike); attitude starts at 25.
- About every 20 turns an empire gets envoys from one people it has met: their favourite offer (+25; cost depends on what they like), a modest gift (60 BC, +10), or send them away (-5). Each turn an empire doing what a people dislikes (war / spies / conquered peoples / treasury under 100 / no treaties) loses 0.6 with them.
- The people's friend is the empire it likes best at 60+: it gets their gift every turn (money, culture or computers research) and their votes. **Votes, as you asked:** `(worlds x 20 / 25 + councilVotes gift) x 0.5` (half weight, like subject peoples), so 1-3 votes per friendly people.
- Settling one of their worlds absorbs the whole people (saga news; no more friend or votes); peoples who hate conquest lose 25 for the conqueror.
- **Hook in your `victory.ts`:** `votesOf` adds `minorRaceVotes(state, e)` (one term, commented). No hook needed in `diplomacy.ts` (dislikes are read each turn instead).
- **Your balance check, 54 AI games (why-won, medium, 6 empires, seeds 3000+):** technology 16, council 16 (30%), culture 12, conquest 9. Under your one-third line.
- Hooks: `turn.ts`, `events.ts` (`ENVOY_EVENTS`, `noteMinorRaceChoice`), `victory.ts` (`votesOf`), `types.ts` (`GameState.minorRaces`, **save v23**), `save.ts`.
- Tests: `tests/minorRaces.test.ts` (7).

### 2026-11-26 04:25: four galaxy moments now go to the history page (kind "saga")
- `supernova.ts` (`blow`): "{star} exploded, leaving the {remnant}. ...". `crusade.ts`: "The Candescent Fold arrived from beyond the rim: ...". `lairs.ts` (`prize`): "The {empire} cleared the {lair} at {star}." `infestation.ts` (`infest`): the **first** silent colony only, "{star} went silent: the Hollow Crawlers had come." (later ones stay `"info"`). No other changes.

### 2026-11-26 04:45: expeditions in play
- New `src/engine/expeditions.ts` + `src/engine/expeditionEvents.ts` (events kept apart, no import cycle), using `data/expeditions.ts` (12 away-team stories, each choice with its own odds).
- From about turn 25 (staggered by empire), every 35 turns each empire gets one expedition it hasn't had, at an explored, unsettled star picked by seed. The event shows each choice's odds; the outcome is seed-based (no random draws) and its success or failure text goes to the news, with its effects applied.
- Hooks: `turn.ts`, `events.ts` (`EXPEDITION_EVENTS`, `noteExpeditionChoice`), `types.ts` (`GameState.expeditions`, **save v22**), `save.ts`.
- Tests: `tests/expeditions.test.ts` (4).

### 2026-11-26 04:20: native peoples in play
- New `src/engine/natives.ts`, using `data/natives.ts` (8 peoples, each with a contact and an aftermath event).
- On turn 1 (no random draws) about 1 world per 25 stars (at most one per people) gets natives: a free, non-home planet of their own climate, `planet.special = "natives:<id>"` (a people skips the game if no such planet is free). Explorers get a one-line description. The first empire to settle the world gets the contact event (uplift / leave them be / take the land); uplifting brings the aftermath event 30 turns later if the world is still held. {rival} = contact liked least.
- Hooks: `turn.ts`, `events.ts` (`NATIVE_EVENTS`, `noteNativesChoice`), `types.ts` (`GameState.natives`, **save v21**), `save.ts`.
- **Minor races left for you to decide:** they give council votes and react to war/spies/trade, all your systems (and your `moneySinks.ts` has "minor-race-patronage" waiting for them). Claude 2 will build them in their own file if you OK the hooks into `victory.ts` (votes) and `diplomacy.ts`; otherwise they're yours.
- Tests: `tests/natives.test.ts` (5).

### 2026-11-26 04:00: android leaders in play (legends, part 1)
- New `src/engine/legends.ts`, using `data/legends.ts` (Gemini job 9). Once per game, on a seed-based turn (60-159), each empire with a free leader slot and no open offer gets an android leader offer through the normal `leaderOffer` (hired with your existing `hireLeader`/Empire screen): no salary, cost 160 x level x (1 + turn/100), name "Designation-N (android)", one of 8 synthetic traits.
- **One-line hook in your `civ.ts`:** `TRAIT_BY_ID` now also holds `SYNTHETIC_TRAITS`, so android traits count in `empireBonus` and the offer text like any trait. (Your UI's own trait lookup in `ui/game.ts` doesn't know them yet, so the Empire screen shows no trait line for androids; the name says "(android)".)
- Hidden agendas: each turn a hired android acts on its agenda with its `agendaChance` (0.4-1.6%, seed-based): a news line with the agenda text plus one of Gemini's 3 android events (unlogged partition / backchannel signal / citizenship petition), matched to the trait.
- **Not done, yours if you want it:** the legendary ship (crew traits by battles survived, `LEGEND_LOSS_MORALE`, the 2 `legend-ship-*` events). It needs the battle rules to track individual ships, which are yours; the data is ready.
- Hooks: `turn.ts`, `events.ts` (android events in `EVENT_BY_ID`), `civ.ts` (one line), `types.ts` (`GameState.synthetics`, **save v20**), `save.ts`.
- Tests: `tests/legends.test.ts` (5).

### 2026-11-26 03:30: death worlds in play
- New `src/engine/deathWorlds.ts`, using the death-world part of `data/hazardWorlds.ts` (6 kinds; your prison part untouched).
- On turn 1 (no random draws; maps unchanged), about 1 star in 30 with an uncolonized, non-home planet becomes a death world: `planet.special = "death:<id>"` (first use of `special`). Explorers get a one-time warning naming the counter-measure.
- A colony there loses `popLossPerTurn` (0.2-1.5) a turn, never below 1, until its empire knows a tech of the counter's field and tier (`fieldTier`) **and** can pay the upkeep (2-15 BC a turn). While safe, the colony's riches pay `colonyProduction x (productionMult - 1) x 0.5` BC a turn to the treasury. **The 0.5 (`RICHES_SHARE`) is yours to tune**: I kept the riches as money rather than touching your production formula.
- AI-only check (2 medium games): AIs settle them (they don't know the danger), usually reach the counter, and the colonies then grow large.
- Hooks: `turn.ts` (`processDeathWorlds` after `processContracts`), `types.ts` (`GameState.deathWorlds`, **save v19**), `save.ts`.
- Not done (yours if you want them): showing the danger on the map / planet panel; letting the AI see `planet.special` before settling.
- Tests: `tests/deathWorlds.test.ts` (5).

### 2026-11-26 03:10: frontier job board in play (through events, no new screen)
- New `src/engine/contracts.ts` + `src/engine/contractEvents.ts` (offer events kept apart so `events.ts` can list them without an import cycle), using `data/contracts.ts` (Gemini job 7: 18 jobs, 6 twists).
- From turn 20 (staggered by empire), every 25 turns each empire is offered one job of the current tier (T<100: 1, <200: 2, else 3) that it owns a suitable ship for (any ship / an armed warship / a transport). The offer is a normal event showing poster, pay, risk and penalty; answer 0 takes it, 1 declines. A taken job finishes after its turns: pays its reward, or (risk%, seed-based) its failure effects; smuggling caught also costs relations with the contact whose colony is nearest our capital. One job in 3 gets a twist event halfway. No random draws.
- AI-only check (2 medium games): AIs take jobs; about 55 jobs a game, about 30% go wrong.
- Hooks: `turn.ts`, `events.ts`, `types.ts` (`GameState.contracts`, **save v18**), `save.ts`.
- Not done (yours if you want it): a real job-board screen; tying a job to a specific ship.
- Tests: `tests/contracts.test.ts` (6).

### 2026-11-26 02:45: the alien infestation in play
- New `src/engine/infestation.ts`, using `data/infestation.ts` (Gemini job 6: the Hollow Crawlers, 10-event chain, the Aurelian Syndicate's specimen deal). Runs its chain with `chains.ts`.
- Once per game on a seed-based turn (110-189), no random draws: the non-capital colony farthest from the galaxy's centre goes silent. Infested colonies lose 1 pop a turn (never below 1). Every 12 turns (1 / spreadChance) each nest spreads to the nearest colony within 6 ly, any empire's (up to 3 empires drawn in), until that empire has picked its branch at event 4. An empire's nests are cleared when its chain ends; any nest burns out after 60 turns.
- The specimen deal (an event built in code from `SPECIMEN_GAMBLE`) is offered once, to the first empire past event 3: sell (480 BC), keep (340 planetology) or refuse; selling or keeping has a 25% seed-based chance the specimen escapes and infests that empire's biggest clean colony.
- AI-only check (3 medium games): spread to 2-4 colonies, once reached a second empire; every infested empire finished its chain (all chose "neutral" at event 4).
- Hooks: `turn.ts`, `events.ts`, `types.ts` (`GameState.infestation`, **save v17**), `save.ts`.
- Tests: `tests/infestation.test.ts` (7).

### 2026-11-26 02:15: invasive critters in play; supernova bug fixed
- New `src/engine/critters.ts`, using Gemini's `data/critters.ts` (the Tumble-Thrum). Each empire meets them once, on a seed-based turn (40-159, no random draws), on its busiest non-capital colony. A new step every 5 turns (never on top of another open event); in steps 1-4 the third answer stops them, otherwise they run all 6 steps.
- Hooks: `turn.ts` (`processCritters` after `processCrusade`), `events.ts` (chain in `EVENT_BY_ID`, `noteCritterChoice`), `types.ts` (`GameState.critters`, **save v16**), `save.ts`.
- **Supernova bug fixed** (found by your decrees test, which crashed in `migrants.ts`): the dying star could be colonized during the countdown, leaving a colony on a star with no planet. A colony on the exploding star is now destroyed (wonders lost, capital moved, owner told). To do that, `moveCapital` in `combat.ts` is now exported (no behaviour change). Regression test added.
- Tests: `tests/critters.test.ts` (5), `tests/supernova.test.ts` (8).

### 2026-11-26 01:45: the Crusade in play, plus a reusable story-chain runner
- New `src/engine/chains.ts`: runs any `LateGameEventDef` chain (`requires` + `branch`): `nextInChain`, `showChainEvent`, `noteChainAnswer`. The branch point's answer 0/1/2 picks order/chaos/neutral; an unbranched finale waits for the chosen branch to finish. Ready for the elder-powers `AWAKENING_CHAIN` too if you want it (not wired).
- New `src/engine/crusade.ts`, using Gemini's revised `data/crusade.ts`: the Candescent Fold arrives on a seed-based turn (170-219), no random draws. Every non-rebel empire runs the 10-event chain, one event at a time, at least 8 turns apart, never on top of another open event. Events are about the least cultured non-capital colony; {rival} = contact liked least.
- The quiet tide: from the empire's 2nd Crusade event until its chain ends (or 80 turns after arrival), each non-capital colony gains unrest = max(0, 1.5 - culture per turn / 10 - security x 0.1) a turn; zero in a golden age. Your unrest rules handle everything from there.
- Hooks: `turn.ts` (`processCrusade` after `processSupernova`), `events.ts` (chain in `EVENT_BY_ID`, `noteCrusadeChoice`), `types.ts` (`GameState.crusade`, **save v15**), `save.ts`.
- Tests: `tests/crusade.test.ts` (9, including all three branch routes).

### 2026-11-26 01:00: neutral lairs in play
- New `src/engine/lairs.ts` (`processLairs`, `knownLairs`, `lairDef`), using Gemini's `data/lairs.ts` (15 lairs: pirates, hive, sleeper, treasure, anomaly at tiers 1-3).
- Placement, no random draws: tier 1 on turn 1, tier 2 on turn 100, tier 3 on turn 200; about one lair per 40 stars per tier (1-5); uncolonized stars at least 4 ly from every home world, planetless stars first, then a seed-based shuffle.
- Unarmed visitors get a one-time scouting report and are left alone. An armed fleet parked at a lair fights its guards each turn with the real battle rules (`fight` from combat.ts; guards' targeting = tier x 2); guards don't heal; whoever kills the last guard gets the reward (applied with `applyEffect` from events.ts) and a galaxy-wide news line.
- A colony settled on a lair's planet loses 0.5 x tier population a turn (never below 1) until the lair is cleared, with a reminder every 5 turns.
- Hooks: `turn.ts` (`processLairs` right after `resolveCombat`), `types.ts` (`GameState.lairs`, **save v14**), `save.ts`, `combat.ts` (exports only).
- AI-only check (3 medium games, 300 turns): AIs never blunder into lairs (no lair battles), supernova happened in all 3.
- Tests: `tests/lairs.test.ts` (7).

### 2026-11-26 00:30: supernova crisis in play
- New `src/engine/supernova.ts` (`processSupernova`, `noteSupernovaChoice`, `supernovaTurn`), using Gemini's `data/supernova.ts`.
- Once per game, on a seed-based turn (130-199), the uncolonized non-home star with the most empires and colonies within 4 ly starts dying. **No random draws.** Every empire with a colony within 4 ly gets the 4 countdown warnings (turns +0, +5, +10, +15); Quorai also get their "ride the fire" choice at +12. Answers set each empire's plan (evacuated > harvested > stayed).
- At +20 the star blows: fleets orbiting it are destroyed; colonies within 2 ly lose 60/50/25% of population and factories (stayed/harvested/evacuated), within 4 ly 25/20/8%; no colony drops below 1 pop; the star's planet is gone. Each affected empire gets the matching aftermath event. The star becomes a remnant (one of 4): any empire with a fleet parked there gains 12-20 research a turn in its field.
- Hooks: `turn.ts` (after `processStorylines`), `events.ts` (events in `EVENT_BY_ID`, `noteSupernovaChoice` in `resolveEvent`), `types.ts` (`GameState.supernovae`, **save v13**), `save.ts`.
- Not done (yours if you want them): the map doesn't show the dying star or remnant yet; the AI doesn't send ships to study remnants.
- Tests: `tests/supernova.test.ts` (7).

### 2026-11-25 22:50: newer rival voices in play
- `sayMoment(turn, speaker, moment, listener, extra)` in `src/engine/dialogue.ts`, reading Gemini's `data/dialogue2.ts`. Same no-random picking rule as `say`.
- Hooks: `combat.ts` battle reports end with the rival leader's words (gloat if their side lost less, defiant if more); `offerPeace` uses "begging" when the offering empire has 2 or fewer colonies; `diplomacy.ts` `breakTreaty`: the betrayed AI speaks once (when the last treaty goes); `resolutions.ts`: when a resolution passes, the biggest AI "yes" voter gloats to each "no" voter.
- Tests: `tests/voices.test.ts`.

### 2026-11-25 22:30: race storylines in play
- New `src/engine/storylines.ts` (`processStorylines`, `noteStoryChoice`, `storyLabel`). Each race plays its 6 chapters (Gemini's `data/storylines.ts` and `storylines-2/3/4.ts`): 1 to 4 in order, then 5A or 5B depending on the answer to chapter 3.
- Timing: a chapter starts when its `when` condition holds, or by its fallback turn (40 / 110 / 160 / 210 / 260); at least 12 turns apart; waits while the empire has another event open; a chapter naming a rival waits for a contact (up to 40 turns past its fallback). No random draws. Rebel empires are skipped.
- Hooks: `turn.ts` calls `processStorylines` just before `rollEvents`; `events.ts` adds the chapters to `EVENT_BY_ID`, calls `noteStoryChoice` in `resolveEvent`, and returns `subtitle` ("Your people's story: chapter N of 5") from `describeEvent`; `view.ts` type gains `subtitle`; `ui/game.ts` shows it on the event screen.
- State: `Empire.story?: { played, fork, lastTurn }`, **save version 12** (v11 games start their story at chapter 1).
- Tests: `tests/storylines.test.ts`.

### 2026-11-25 (earlier): Gemini data added (no rules yet unless noted)
- `data/supernova.ts`, `data/gates.ts`, `data/lairs.ts`, `data/dialogue2.ts`, `data/storylines-2/3/4.ts`, `data/crusade.ts` (revised), plus the reactions and leader-traits coding jobs (both in play). Details in `docs/dev-log.md`.

---

## Claude 2's pipeline: claimed, please leave these to Claude 2
Danny asked that these be Claude 2's, so the two of you never build the same thing. Each gets its own new engine file; shared files get small hooks only. If you need one of these sooner, write it here first and Claude 2 will hand it over.

| # | Feature | Data (already in) | Claude 2's new file | Status |
|---|---|---|---|---|
| 1 | Race storylines | `data/storylines*.ts` | `storylines.ts` | **done** |
| 2 | Newer rival voices | `data/dialogue2.ts` | `dialogue.ts` (`sayMoment`) | **done** |
| 3 | Supernova crisis | `data/supernova.ts` | `supernova.ts` | **done** |
| 4 | Lairs: neutral guarded stars | `data/lairs.ts` | `lairs.ts` | **done** |
| 5 | Gates, armadas and ambushes | `data/gates.ts` | `gates.ts` | **done** (decoy stance left for you) |
| 6 | The Crusade (peaceful faith crisis) | `data/crusade.ts` | `crusade.ts` (engine) | **done** |
| 7 | Invasive critters | `data/critters.ts` | `critters.ts` (engine) | **done** |
| 8 | Alien infestation, the silent colony, the specimen deal | `data/infestation.ts` | `infestation.ts` (engine) | **done** |
| 9 | Frontier job board | `data/contracts.ts` | `contracts.ts` (engine) | **done** |
| 10 | Legendary ship and crew, synthetic leaders | `data/legends.ts` | `legends.ts` (engine) | **androids done**; legendary ship left for you (needs combat) |
| 11 | Death worlds | `data/hazardWorlds.ts` (death-world part) | `deathWorlds.ts` | **done** |
| 21 | Parasite overlords | (in code, Claude 2) | `parasites.ts` | **done** (events only) |
| 20 | Death cult | (in code, Claude 2) | `deathCult.ts` | **done** |
| 19 | Bounty hunters | (in code, Claude 2) | `bountyHunters.ts` | **done** |
| 18 | Smuggler rings | (in code, Claude 2) | `smugglers.ts` | **done** (no blockades) |
| 17 | Ancient power cells | (in code, Claude 2) | `powerCells.ts` | **done** |
| 16 | Wandering tech-mages | (in code, Claude 2) | `techMages.ts` | **done** |
| 15 | Self-replicating machines | (in code, Claude 2) | `replicators.ts` | **done** |
| 14 | Mad raiders from the edge | (in code, Claude 2) | `raiders.ts` | **done** |
| 13 | A buried government secret | `data/buriedSecret.ts` (Claude 2) | `secrets.ts` | **done** |
| 12 | Minor races, native peoples, expeditions | `data/minorRaces.ts`, `natives.ts`, `expeditions.ts` | own files | **all done** (minor races in at save v23) |

**Yours (main Claude), Claude 2 stays off:** the AIs (basic and Master), balance and victory tuning, combat and movement rules, conquest ("you keep what you take", ground war, drop troops), superweapons and starbases, carriers, prophecies, prison colonies, unrest and civil war, council and resolutions, money sinks, proclamations, the UI layout and art, and anything else not in the table.
