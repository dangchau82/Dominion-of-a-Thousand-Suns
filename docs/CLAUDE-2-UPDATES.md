# Claude 2 updates (read this at the start of every session)

**Who:** Claude 2 is Danny's **secondary developer**. The main Claude leads; Claude 2 adds features from the ideas pipeline alongside it. Danny wants the main Claude kept up to date on everything Claude 2 does, so Claude 2 updates this file after every push.

**How Claude 2 works, so it never gets in your way:**
- Its features live in **new files of their own**; shared files only get small hooks (listed below).
- It **never changes your work**: no balance, AI or design changes, nothing you are in the middle of. Problems it spots in your code go under "For the main Claude" below, for you to decide.
- It pulls before starting, checks your claims in `docs/handover-*.md`, and pushes only when `npm test` passes after merging your latest work.
- **You have the final say.** Change or remove anything Claude 2 added; just note it here so it knows.
- **Save versions:** whoever needs the next one takes it. The latest used is listed below; check it before bumping.

**Latest save version: 49** (Claude 2, race sagas).

> **NOW (2026-11-27 21:23, Claude 2, push session):** Sundering Engine and Worldship as real ships (`endgame.ts`, `battleStories.ts`). The other Claude 2 session holds `sagas.ts`, `data/sagas*`.

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
- **Saga endings that touch your areas (2026-11-27, your call):** `sagaVotes(state, e, base)` in `sagas.ts` gives a "councilFavour" ending +15% council votes, but it is **not counted** until you add it to `votesOf` (victory.ts). The "everyoneFearsUs" ending only lowers opinion and adds weapons research; if you want the AIs to stop declaring war on such an empire for a while, that is `basicAI`. The "civilWar" ending adds 60 unrest to the farthest third of the empire's worlds and lets your unrest rules do the rest. The galactic first "The Tale Is Told" (story 5A/5B) won't fire for saga races; `state.sagas[e.id].ending` is the saga equivalent.
- **New 2026-11-27 (Claude 2): two one-line hooks in `combat.ts`.** `heroEdge(state, here, units)` right after `veteranEdge` (a hero Admiral gives their fleet +1 attack; a Grand Admiral +2 and +1 defence), and `heroGround(...)` added to `atkBonus`/`defBonus` in `invade` (General +10, Lord Marshal +18, a soldier at the capital +4 a level). The numbers are yours to tune; they live in `heroes.ts`.
- **Peaceful council wins at T152 in small 5-empire AI games** (seeds 8 and 14 now; 14 and 16 before my changes, so not new): no wars at all, and the council crowns someone at T152. Your area. `tests/voices.test.ts` moved from seed 8 to 9 because seed 8 now has no battles.
- **Goodwill sources added:** Ambassador heroes (+2 opinion of us from every contact every 10 turns), silver-tongued heroes (+1 every 10), the Starfall Games (the host gets +4 from each team, the champion +2) and the fair's storytellers (+5 once). Watch council win timing in your tournament runs.
- **AIs and the new events:** the crossroads, fair and games events all say "nothing" in their effects (the code applies them), so `basicAI` picks by its tie rule. The versions rotate, so AIs vary. If you want the AIs to choose on purpose, the choice meanings are in `heroes.ts`, `fair.ts` and `games.ts`.
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

### 2026-11-27 21:23: Danny said "go" on the two endgame pieces I'd held back for you
- **Claimed now (this session, Claude 2 with push access):** the Sundering Engine becomes a real ship and the Worldship a real ship that sails to allies, whose allies defend it. Files: my `endgame.ts`, `battleStories.ts`; a hidden ship design per work (`empireId: -1`, so it never shows in build lists). **No changes to `movement.ts`, `combat.ts` rules or the AIs**; the ships move like any fleet (players by hand, AIs by your fleet logic). Sagas stay with the other Claude 2 session.

### 2026-11-27 10:10: first 7 race sagas in
- Gemini's writing for the Terran Accord, Vossari, Kethrak, Ashkari, Lumen, Thraal and Seraphine, checked and assembled into `data/sagas/<race>.ts` (21 beats and 4 endings each). Fixes: borrowed names renamed ("Unification Wars"), placeholders taken out of titles, a few grammar slips. New `tests/sagaData.test.ts` checks every race's saga: 3 beats per act, 3 choices each, flags set before they are needed, a fallback ending last, at least 3 different outcomes, effects in scale. 473 tests pass.

### 2026-11-27 09:25: race saga engine (save v49), waiting for Gemini's writing
- New `sagas.ts`: four acts per race, 3 beats per act, **the seed picks one per act** per empire (81 paths per race). Choices move three scores (mercy, openness, tradition) and set flags; **branch beats** play when their flags are set; **crossover beats** play once we have met the named race; after act 4 the first **ending** whose thresholds hold plays, with an outcome: golden age, civil war (unrest), rival becomes ally (peace plus all treaties), everyone fears us, council favour (see above), great work surge, legendary fleet, exodus (2 far colonies), ascension (+500 research in every field) or fall from grace (lose a quarter of the people, +6 culture a turn for ever).
- Act timing: turns 25/75/140/205 (plus up to 12 from the seed), 10 turns between saga events, ending 20+ turns after act 4. A race with saga writing **skips its old storyline** (`hasSaga` check in `storylines.ts`). Saga events aren't in `EVENT_BY_ID`; `events.ts` falls back to `sagaEventDef`. Subtitles say "Your people's saga: act II" and so on.
- The Legends page shows the saga's act, chapters, turning points and which way our choices lean.
- **No race has writing yet, so nothing changes in play today.** `tests/sagas.test.ts` uses a small made-up saga. 451 tests pass.

### 2026-11-27 08:45: hero careers and traits, epic artifacts, the Grand Fair, the Starfall Games (save v48)
- **Heroes** (`heroes.ts`, new `data/heroCareers.ts`): a fourth role, **Soldier**. Every hero joins with a trait and gains more at levels 2 and 4 (11 traits). At level 3 a **crossroads event** picks a career: Soldier -> General or Admiral; Governor -> Viceroy or Chancellor; Spymaster -> Shadow Master or Ambassador; Scientist -> Visionary or Chief Engineer. At level 5 they rise to the highest title (Lord Marshal, Grand Admiral, Archon, High Chancellor, Hand in the Dark, Voice of the Stars, Luminary, Master Builder). Offers now rotate over 4 roles (`hero-offer:0-3`).
- **Epic artifacts** (`data/digSites.ts`): a new quality between rare and legendary; 6 epic and 2 new rare artifacts. The archive, tomb and seed vault now end in an epic. The auction prices epics at 720. Gold Rush counts any rare-or-better artifact.
- **The Grand Fair of the Wandering Stars** (new `fair.ts`): every ~40 turns a fair tours every capital, nearest first, with 3 troupes from 11. At our capital: a grand festival (120 BC, every troupe gives a gift), the market square (free: tourists plus the star troupe), or hire the star troupe for good (250 BC, a small bonus every turn, at most 2). Map marker `fair`.
- **The Starfall Games** (new `games.ts`): every 60 turns from ~T70. Bid to host (200 BC), train (80 BC), send a team, or boycott. Five contests, gold/silver/bronze culture, a champion, galactic records; the host earns tourist money and goodwill; boycotters annoy the host.
- **Medals:** 4 new (Treasure Hunter, Rise Through the Ranks, Showtime, Champions of the Games). The **Legends page** shows hero titles, careers and traits, resident troupes, and the games' medal table, champions and records.
- Shared files touched: `combat.ts` (2 hooks, see above), `events.ts`, `turn.ts`, `types.ts`, `save.ts` (v48), `medals.ts`, `mapMarkers.ts` (engine and ui), `scenarios.ts` (Gold Rush check), `market.ts` (epic price), `tests/voices.test.ts` (seed). New tests: `heroCareers`, `fair`, `games`. 444 tests pass.

### 2026-11-27 07:34: colony scene gets a ground shot with your Blender landing kit
- Your new `landingKit.ts` models are lovely, so I used them (read-only, via `loadKit()` / `kit.make()`): the 3D colony scene now cuts from space to the ground at 4.9 s: climate-coloured rolling terrain, trees for the climate (conifer/palm/rocks), your dropship touching down in a dust cloud, then hab domes and a tower rising in the player's colour with lights coming on, camera slowly orbiting. Scene is 9.5 s; bloom lowered to 0.45 for this scene only. Falls back to your stand-in shapes if the models don't load.
- Nothing else new from you for me; your 06:30 notes are about landings only.

### 2026-11-27 05:43: scenarios (Danny's list, item 7). **One victory hook for you.**
- New `src/engine/scenarios.ts` + `src/ui/scenarioMenu.ts`. Four scenarios: **The Last Bastion** (small map; we start with +40 missile bases at home and every rival at war with us, relation -60; survive 100 turns), **Five Broken Kingdoms** (five free worlds far from every capital, marked ♛ on the map and `planet.special = "kingdom"`; hold all five before turn 200), **The Long Night** (the Hollow Tide arrives on turn 60; destroy it before 220), **Gold Rush** (3x the dig sites; hold three rare/legendary artifacts before 180).
- `processScenario` (in `turn.ts` after `processMedals`) records `state.scenario.result = { won, turn }` and posts a saga line ("Scenario complete" / "Scenario failed"). **It does not end the game:** victory is yours. If you want, in `checkVictory`: `if (state.scenario?.result?.won) state.winner = { empireId: 0, kind: "scenario"?, turn }` (or a loss for a failed one), whatever fits your victory types and game-over screen.
- **Hook in your `menu.ts`:** a "Scenarios" button under "New Game" opens my picker (four story cards and a portrait row to pick a race), which starts `newGame` + `applyScenario`. `tools/scenario-preview.html` shows the picker.
- Hooks also in `crisis.ts`/`digSites.ts` (mine) for the Long Night and Gold Rush. `types.ts` (**save v47**), `save.ts`. Tests: `tests/scenarios.test.ts` (6).

### 2026-11-27 05:31: the late-game crisis, the Hollow Tide (Danny's list, item 8). **Please look: it changes win types.**
- New `src/engine/crisis.ts` ("world boss raid" idea from online RPGs; names original). If no one has won by **turn 260**, a living fleet arrives at the rim star, **scaled to the galaxy** (one base swarm of 30 drones / 12 reavers / 3 hearts per 40 warships in the galaxy, up to 10x), attack 9, shields 6-7. Every empire's opinion of every other +20 (common enemy). Every 3 turns it strikes the nearest unwrecked colony with the real battle rules (via `strikeColony` from my raiders); any empire's fleets at its star fight it every turn; it regrows drones. Kills are credited per empire. Whoever sinks its last ship gets **+10,000 culture**; every empire that killed Tide ships gets 15 culture per kill (max 4,000). If no one kills it, it leaves after 120 turns. Saga lines throughout; map marker ☄ on it and its next target.
- Hook: `processCrisis(state)` in `turn.ts` right after `processReplicators`. `types.ts` (**save v46**), `save.ts`. Tests: `tests/crisis.test.ts` (5).
- **54-game check (medium, 5 rivals, seeds 3000+, T400 cap):** technology 33, culture 12, council 4, conquest 3, **no winner 2** (was 6). Before the Tide (23:3x): technology 25, council 14, culture 6, conquest 3, none 6. My first cut paid 250 culture per kill and gave culture 36/54; I cut it to the numbers above. **Council dropping from 14 to 4 is the surprise**, maybe the +20 relations or the wrecked colonies; your call. Easy levers: `CRISIS_TURN`, `COMMON_ENEMY`, `SLAYER_CULTURE`, `SHIPS_PER_SWARM`, or switch it off. If you want the slayer's reward to count toward victory differently (or to end stalled games), that's your hook to make.

### 2026-11-27 05:10: race-voiced advisor (Danny's list, item 5)
- New `src/ui/advisorVoice.ts`: your tips keep their words; the card now has a speaker from the player's race (title, small portrait, an opening and a sign-off in that race's manner: Ashkari War-Chief "By blade and blood: ... Glory waits for no one.", Nyx "Node 7" in capitals, Orrun Chief Factor talking money, etc.). Openings/sign-offs are picked from the tip id, so the same tip always reads the same.
- **Hook in your `renderTip`:** the card's inner HTML comes from `advisorCardHTML(raceId, tip.id, tip.text)`. One line; revert it if you'd rather keep the plain card.

### 2026-11-27 05:03: race-themed screens (Danny's list, item 6)
- New `src/ui/raceThemes.ts`: 18 looks (colours, font family, window/panel frame shapes: cut corners for Nyx/Ashkari/Tarkhan/Raxxan/Vossari, soft glows for Lumen/Ixil/Quorai, double borders for Orrun/Gorrath, ridged stone for Thraal...). Applied by overriding your CSS variables (`--panel`, `--panel-2`, `--line`, `--accent`, `--gold`) plus a few frame rules under `body.race-<id>`; `styles.css` untouched. System fonts only (no downloads).
- **Hooks in your `game.ts`:** the constructor applies the player's race look and wraps `onQuit` to remove it; Menu has "Race look: on/off" next to "Race scenes". Screenshot checked (Kethrak: amber top bar and buttons).

### 2026-11-27 04:55: medals (Danny's list, item 4)
- New `src/engine/medals.ts`: 17 medals for player empires (Settler, Ten Worlds, Dominion, A Name Among Fleets, Legend of the Void, Admiral's Flag, Remembered in Song, Wonder of the Age, World Breaker, Deep Digger, Keeper of Legends, Full Court, Highest Bidder, Still Standing, Many Faces, Peace in Our Time, Against All Odds). Earned once each; tracks "ever at war" and "was an underdog after T50" so the win medals work. Announced as an info event starting "🏅", shown as a gold news flash; the Hall of Legends shows all 17 (earned ones lit).
- **Hook in `turn.ts`: `processMedals(state)` right after your `checkVictory`** so win medals count. `types.ts` (**save v45**), `save.ts`. Tests: `tests/medals.test.ts` (4).
- The end-of-game stats card from Danny's idea: the Legends page already shows medals and legends; if you want a medal row on your game-over modal, `medalsOf(state, e)` gives them.

### 2026-11-27 04:47: the Travelling Auction (Danny's list, item 3)
- New `src/engine/market.ts`. From about turn 60, every 45 turns, one lot is offered to every living empire not busy with an event: an artifact (one nobody holds yet; 300/550/900 BC by quality), a research vault (600+ points in one field), or a mercenary squadron (4+ of the winner's best warship, at its capital). Sealed bids: high (full price), low (60%), or none; the auction closes after 4 turns; the highest bid the bidder can still pay wins, ties to the richer empire. Only the winner pays. Three event versions rotate the choice order so AIs bid differently. Artifact sales make a saga line.
- Hooks: `turn.ts`, `events.ts` (`MARKET_EVENTS`, `noteMarketChoice`, `marketLotText` in the `{work}` fill), `types.ts` (**save v44**), `save.ts`. Tests: `tests/market.test.ts` (5).

### 2026-11-27 04:40: heroes (Danny's list, item 2)
- New `src/engine/heroes.ts` (ideas from RTS hero units and story-RPG companions; names original). From about turn 40, every 55 turns (up to 6 offers), an empire with fewer than 3 heroes chooses one of three: **Governor** (runs its busiest free world: 6% of that world's production as BC a turn per level; festival every 20 turns, +40 culture per level), **Spymaster** (every 12 turns steals 40 research per level from the strongest known rival's best field), **Scientist** (+6 research a turn per level in our weakest field; insight every 20 turns, +100 per level). Level up every 30 turns (max 5). Heroes die of old age after 90-149 turns, a governor dies with their world; both give a saga line. Three versions of the offer event rotate the choice order, so AIs (first choice on a tie) take different roles.
- No changes to production or espionage rules: all paid as BC/research/culture. Hall of Legends: "Our heroes" with portraits and the fallen. Hooks: `turn.ts`, `events.ts`, `types.ts` (**save v43**), `save.ts`. Tests: `tests/heroes.test.ts` (6).

### 2026-11-27 04:32: dig sites and artifacts (Danny's list, item 1)
- New `src/engine/digSites.ts` + `src/engine/data/digSites.ts`. About one site per 16 stars, placed from the seed on free worlds with no special (natives/minor/death untouched). Five kinds, each with its own 3-level story: Drowned Archive (computers), Sealed Vault (money), Tomb of the First Kings (culture), Buried Armory (weapons), Seed Vault (planetology).
- When an empire holds the world, each level offers: dig deeper (8 turns), take the finds and seal it, or sell the site. Deeper = more research/BC/culture, and levels 2-3 give an **artifact** (common/rare/legendary, 8 in all) that pays a little every turn (e.g. Thinking Stone +14 computers, Crown of Ages +20 BC +4 culture). At the bottom, half the sites (fixed by seed) bite back: the colony loses 30% of its people. Saga line when a site is dug to the bottom.
- **Danny also asked to borrow ideas (not names) from RTS and online role-playing games**: the loot tiers here are one; heroes with abilities and loyalty, faction reputation, and world-boss raids are next on my list.
- Map: ⛏ marker for known ruins (`mapMarkers.ts`). Hall of Legends: "Our artifacts" with quality colours. Hooks: `turn.ts`, `events.ts`, `types.ts` (**save v42**), `save.ts`. Tests: `tests/digSites.test.ts` (6).

### 2026-11-27 04:23: Danny's new list (he said "add all of them"), my order for the next hours
1. **Dig sites** (`digSites.ts`): ruins excavated over several turns with choices along the way.
2. **Heroes** (`heroes.ts`): governors (one world), spymasters (spy missions), scientists (one field), with portraits, personalities and death scenes like the admirals.
3. **Galactic market** (`market.ts`): a travelling auction every so often (artifact, tech, mercenary fleet); empires bid with BC.
4. **Medals** (`medals.ts` + `ui/medals.ts`): achievements and an end-of-game stats card.
5. **Race advisor voice** (`ui/advisorVoice.ts`): your race-flavoured lines. **I see you already have "Advisor tips"; I'll only add race-voiced wording through a hook you can take or leave, not replace yours.**
6. **Race-themed screens** (`ui/raceThemes.ts`): window frames/colours/fonts per race, injected as CSS under a body class, so `styles.css` stays yours.
7. **Scenarios** (`scenarios.ts`): preset galaxies with a story and goal. **Needs a hook in galaxy setup/new-game menu (yours).** I'll write the data and an `applyScenario(state)` and ask you where to hook it.
8. **Late-game galaxy crisis** (`crisis.ts`): around T300 with no winner, an outside threat invades; empires must cooperate; whoever deals the final blow gets a big reward. **Victory rules are yours:** I'll build the threat and give the reward as culture/votes/research only; if you want it to count toward victory (or to end stalled games), that hook is your call. This may also help the no-winner games.

### 2026-11-27 02:36: 3D science and spy scenes too
- `ui/scenes3d.ts`: **science** = an orbital laboratory over our world, rings spinning up and a breakthrough flash; **spy** = our agent's small ship slipping past the enemy race's warships and their sweeping searchlights, then the stolen data streaks home. On both, the race portrait fades in at the left (spy is darkened and tinted). Seven scenes are now 3D; conquest, council/culture/conquest victory and defeat stay 2D.
- No changes to your files. Nothing new from you since 23:27; nothing flagged in my files.

### 2026-11-26 23:38: 3D race scenes on your battle3d stage (thanks for the offer)
- New `src/ui/scenes3d.ts`, loaded with `import()` only when a scene plays. Uses your `makeStage`, `spaceBackdrop`, `makePlanet`, `glowTexture` and `buildShip`; your files untouched. 3D versions: **colony** (colony ship flies down to the planet, city lights spread from the landing site), **war** (two battle lines of the races' 3D ships close in and trade beams), **battle won** (same, then the enemy line explodes ship by ship), **wonder** (ring segments assemble around a blazing star), **technology victory** (the Ascension Gate opens, the fleet flies through). Science, spy, conquest, council/culture/conquest victory and defeat stay 2D (portrait-led).
- Order in `scenes.ts` `showScene`: a made video if `art/scenes-video/<race>-<scene>.mp4` exists; else 3D if WebGL works and the scene has a 3D version; else the 2D canvas. If anything in 3D throws, it falls back to 2D.
- `tools/scene-preview.html?k=war&r=nyx&3d=1&t=3600` previews a 3D scene held at 3.6 s (checked all five in headless Chrome with SwiftShader).

### 2026-11-26 23:32: great works quicker, paths a little sooner (your 00:45 answer)
- Great works now take **30 turns** of work instead of 40 (upkeep 50/45 a turn so the total cost stays about the same: path 2,000 BC, race 1,800). Sabotage offers come every 15 turns (was 30) so there's still a window.
- Paths open sooner: Feared conquests 0.45 x stars-per-empire (was 0.5); Builder worlds 0.65 x (was 0.75) and production 1.1 x the average (was 1.2).
- 54-game check after it (medium, 5 rivals, seeds 3000+, tool's T400 cap): technology 25, council 14, culture 6, conquest 3, **no winner still 6**. So the stall isn't mainly the works; over to your late-game ending rule as you said. Tell me if you want works quicker still.

### 2026-11-26 22:11: victory and defeat scenes
- `ui/scenes.ts` `playEndScene`: before your game-over modal, once per game end, a full-screen scene in the player's race: **technology** (the Ascension Gate opens and our ships fly through), **council** (every race's face in a ring, ours rising in the middle), **culture** (our face, light spreading to a thousand worlds), **conquest** (our fleets over a row of worlds turning our colour); **defeat** (the winner's face looms while our homeworld goes dark). Words in `ui/sceneText.ts` (`VICTORY_LINES`, `DEFEAT_LINE`).
- **Hook in your `showGameOver`:** first line `if (playEndScene(this.state, PLAYER, () => this.showGameOver())) return;` (it only plays once per win, so reopening the modal doesn't replay it). Respects "Race scenes: off".

### 2026-11-26 22:04: art slots for the 21 great works; UI smoke test
- `docs/great-work-art-prompts.md`: 21 Gemini prompts (3 path works + 18 race works). Pictures go in `public/art/works/<work id>.png` (folder added). When one exists, the Hall of Legends shows it above our great work, and the great-work scene zooms slowly across it; if missing, nothing shows (no broken image).
- `tools/ui-smoke.html?n=220&race=nyx`: plays an AI game to turn N in the browser, then opens the real `GameScreen`, the Legends page, a scene and news flashes, and writes any error into the page title. At T221: no errors, 45 markers, battles and veterans present. You're welcome to use it for your screens too.

### 2026-11-26 22:00: "Race scenes: on/off" in the Menu
- Once a player pressed "Turn scenes off" there was no way back. Added a toggle next to Sound/Music/Advisor tips in your `showMenu` (two lines).

### 2026-11-26 21:57: 54-game check after tonight's changes (yours and mine): **6 games with no winner by T400**
- Medium, 5 rivals, seeds 3000+: technology 25, culture 12, council 7, conquest 4, **no winner 6** (games 5, 34, 42, 43, 44, 48).
- Looked into seed 3005 (with `isPlayer = false` like `why-won`): e0 started the Gate at ~T150 and had 65k of 70k by T280, then died (the AIs go after the strongest Gate builder). The other three became Gate-ready later (they needed a finished great work), started around T300-320 and were at 33-52k at T400. Gate progress is about 0.5k a turn, so a late start can't finish by T400. Seed 3034 is the same story: four empires Gate-ready at the end, none done.
- So the "+ finished great work" requirement is pushing Gate starts later, and the gang-up on the first builder finishes the job. **Your call:** a cheaper Gate (it's 70k), a turn cap above 400 in the tool, or I can make great works quicker (they're 40 turns plus the wait for a path). Tell me which and I'll do my part.
- Also: `npm install` changed `package-lock.json` to the pinned `three` 0.170.0 that `package.json` asks for; it went out in my commit `d1c67fc` (message "noop", sorry about the name).

### 2026-11-26 21:36: galactic news flashes; map key in the Hall of Legends
- New `src/ui/newsFlash.ts`: this turn's "saga" events (great works, cracked worlds, famous fleets lost, great battles, supernovae, crusades...) slide in at the top right with the portrait of the empire named first (if known), stay 7 s, click to dismiss. Non-blocking, max 3 a turn. **Hook in your `game.ts` `endTurn`:** `flashNews(...)` runs inside my scene callback, so they appear after the race scene. `tools/news-preview.html` shows two.
- Hall of Legends now ends with a **map key** for the marker symbols.

### 2026-11-26 21:30: two more race scenes: a won battle, a finished great work
- `ui/scenes.ts`: new scene kinds **battle** (the player's battle this turn where the enemy lost 3+ ships and more than us, read from `state.battles`) and **wonder** (our great work finished, from the saga line). Priority now: wonder > conquest > war > battle > colony > spy > science. Drawn versions: the battle lines with the enemy line blowing apart; the great work's ring segments locking into place around a star. 18 x 2 new lines in `ui/sceneText.ts`.
- `docs/scene-video-prompts.md` now has 126 prompts (18 races x 7 scenes).

### 2026-11-26 21:25: map markers for my features (you'd listed these as yours to do; done so you needn't)
- New `src/engine/mapMarkers.ts`: `mapMarkers(state, e)` lists what **this empire knows**: death worlds, cracked worlds, natives and minor-race homes (explored stars only), lairs (seen/explored, not cleared), gates (asleep/awake, owner), the raider base, the machine hive (once seen), dying stars (with turns left), great works of known empires (finished or being built), and our own cult colonies. It's in the view as **`EmpireView.markers`** (`view.ts`: one field), so AIs could use it too, fairly.
- New `src/ui/mapMarkers.ts`: small glowing symbols beside each star (☠ lair, ☣ death world, ✸ cracked, ⌂ natives, ◈ minor race, ◎ gate, ⚔ raiders, ⬢ hive, ✹ dying star with a pulsing halo, ★ great work with a ring in the owner's colour, ◐ cult). Hooks: one line in `map.ts` `render` just before "Fleets"; and in `game.ts` `renderPanel` the star panel lists the labels under the close button.
- `tools/map-preview.html` shows sample markers. Tests: `tests/mapMarkers.test.ts` (2).

### 2026-11-26 21:18: battle replay overlap, sorry
- Our messages crossed: my 2D replay (`ui/battleReplay.ts`, "▶ Replay" in the turn report) was pushed at 21:12, your claim landed at 21:13. **Battle replay is yours from here; I won't touch it again.** Replace my button with your 3D viewer, keep mine as a fallback for slow PCs, or delete `battleReplay.ts`: your call. Staying off `src/ui/battle3d/`, `ui/audio.ts`, `data/techs.ts`, `tech.ts`.
- Next for me: map markers for my features (lairs, death worlds, raiders, the hive, gates, great works, cracked worlds, the cult) in a new `ui/mapMarkers.ts`, with a one-line hook in `map.ts` (not claimed by you tonight).

### 2026-11-26 21:12: 2D battle replay from the recordings
- New `src/ui/battleReplay.ts`. The turn report now has a **"▶ Replay the battle at X"** button for each battle the player fought that turn (hook: one line in your `showReport`, `row.append(...replayButtons(this.state, turn), ok)`).
- The replay plays the real `BattleRecord` shot by shot: both sides line up (race ship art, up to five hulls in a wedge per stack, sizes by hit points; planets and fighters drawn too), beams flash, missiles and torpedoes arc across, intercepts burst midway, shields ring on blocks and dodges, kills explode and the counts go down. Round counter, speed x1/x2/x4, Esc or Close. If your 3D viewer lands, it can use the same `state.battles` data; this one is just the 2D version.
- `tools/replay-preview.html?a=nyx&b=tarkhan&n=10&t=4200` (with `npm run dev`) shows a test battle held at a moment. Both preview pages now use `<base href="/">` so the art loads.

### 2026-11-26 21:06: Hall of Legends screen
- New `src/ui/legends.ts` (`legendsHTML(state, playerId)`): our path(s) and great work with a progress bar, our race's own work, the Gate's world requirement; great works of known empires; our famous fleets with rank, victories, kills and admiral (portrait, personality and what it does); famous fleets of known rivals; the great battles with both sides' losses. Unknown empires stay unnamed.
- **Hooks in your `ui/game.ts`:** a "🏆 Legends" button next to History, and the **G** key (H was taken). It uses your `modal`, widened to 820 px for PC.
- Test added in `tests/scenes.test.ts`.

### 2026-11-26 21:02: race scenes after big moments (Danny asked; my first UI work)
- **Danny says: focus on PC, don't worry much about phone.** Passing it on as he asked.
- Danny wants MOO-style race scenes (ideas only, nothing copied): colonising a planet, a tech discovered, a spy mission done, war declared, a world conquered, each in the player's race ("a Nyx in full battle armour with guns blazing").
- New `src/ui/scenes.ts` + `src/ui/sceneText.ts` (18 races x 5 scenes, original lines). After each turn, the player's biggest moment (conquest > war > colony > spy > science) gets one 6.5-second full-screen scene. Click/Space/Enter/Esc skips; "Turn scenes off" is remembered (`localStorage` key `dots-scenes`). If `art/scenes-video/<race>-<scene>.mp4` exists it plays instead (the three Ruuvak videos already in `public/art/scenes-video` now get used). Otherwise a drawn canvas scene made from the race portrait, ship art and planet art: colony ship landing and city lights; holographic rings for science; scope and data stream for spy; two battle lines firing for war; drop pods and the world changing colour for conquest.
- **Hook in your `ui/game.ts` (one line in `endTurn`):** `playTurnScene(state, PLAYER, mine, () => (met.length ? showFirstContacts(...) : next()))` in place of the last two lines. Styles are injected by `scenes.ts` itself; `styles.css` untouched.
- `docs/scene-video-prompts.md`: 90 Flow prompts (one per race and scene) for Danny to make the videos.
- `tools/scene-preview.html`: with `npm run dev`, open `/tools/scene-preview.html?k=war&r=nyx&t=3600` to see a scene held at a moment (I checked them with headless Chrome).
- Tests: `tests/scenes.test.ts` (3: every race has every line; scene priority; only our own spy successes).

### 2026-11-26 20:37: Danny's late-game catch-up ideas. **Four of them are for you** (see "For the main Claude" below)
Danny asked how weaker AI races can catch up late in the game. We agreed on rules that help **any** small empire, the player's too (no cheating). I built the two content ones; the other four are balance/AI, so they're yours if you want them:
1. **Cheaper research for widely known techs** ("tech diffusion"): a tech known by most empires costs less for everyone else. The strongest single catch-up rule.
2. **The galaxy reacts to a runaway leader, but only about half of it.** Danny's words: "take 2 out or balance it, like half of them gang up because if all gang up they will lose". So: when one empire pulls far ahead, roughly half the others (e.g. those it borders, or that already dislike it) warm to each other and lean toward joint wars on it; the rest stay out or even side with the leader. Not a total dogpile.
3. **Big empires get harder to run**: unrest/upkeep rising faster with size.
4. **Stronger defence for small empires' homeworlds.**
Helpers you can use for any of them: `isUnderdog(state, e)` and `galaxyLeader(state)` in `src/engine/underdogs.ts`.

**Built (ideas 5 and 6):** new `src/engine/underdogs.ts`. An underdog = at most half the average living empire's worlds.
- **Refugees:** every 20 turns, each leader colony with unrest >= 40 (up to 6) sends +15 research and +8 BC to every underdog that knows the leader.
- **Wanderers favour the small:** tech-mages visit underdogs every 50 turns instead of 80, once more (`techMages.ts`); the Bounty Guild comes after 5 turns of war instead of 10, once more (`bountyHunters.ts`); minor races warm to underdogs by +2 every 10 turns (`minorRaces.ts`). All my files.
- **The Last Stand:** once a game, an empire that held 5+ worlds and is down to 2 or fewer gets one choice: all its BC for 6 warships at home, +12 missile bases on the homeworld, or relations +35 with everyone at war with it (to make peace possible). Saga line either way.
- Hooks: `turn.ts`, `events.ts`, `types.ts` (**save v38**), `save.ts`. Tests: `tests/underdogs.test.ts` (7).

### 2026-11-26 20:20: endgame paths and race great works (your handoff), first cut. **Ready for your balance check.**
- New `src/engine/endgame.ts`, `src/engine/endgameEvents.ts` (split out to avoid an import cycle), `src/engine/data/greatWorks.ts`. Original names throughout.
- **Paths** (open once, stay open; news to the galaxy): **Feared** = conquered worlds >= max(5, half of stars-per-empire) and at least a third of its worlds, or at war with 3+ empires, 2+ conquests, and hated (relation <= -40) by two thirds of those it knows. **Beloved** = 3 allies, or 2 allies and average relation >= 30. **Builder** = worlds >= max(6, 0.75 x stars-per-empire) and production >= 1.2 x the living average. Stars-per-empire is about 13 on every map size, so thresholds scale with the map.
- **Great works** (**one per empire**, so it's what that empire is remembered for): when a path opens, the empire is offered the path work or its race's work (or "not yet"). Path works cost 500 BC + 40/turn for 40 turns; race works 450 + 35/turn for 40. Work stalls on an empty treasury or if the capital is lost. Enemies at war get a sabotage offer every 30 turns (200 BC, -8 turns of work, +300 construction research). Starting/finishing makes galaxy news ("saga" on finish).
  - **Sundering Engine** (Feared): when finished, every other empire's relation -60. It travels with our strongest fleet over an enemy world at war: the owner gets an event to crack that world (colony destroyed, wonders lost, capital moved, planet marked `death:cracked`, everyone -15). Note: it doesn't move on its own; the engine just rides with whatever fleet is attacking (simpler than a new unit; say if you want a real unit).
  - **Worldship Concordance** (Beloved): +30% council votes, relations +6 with everyone every 10 turns. **Not mobile yet** (moving the capital and "allies defend it" would need movement/combat hooks; say if you want them).
  - **Dyson Shell** (Builder): 20% of total production every turn as BC and again as computers research.
  - **18 race works**, one per race, from levers: money, a trade cut per contact (Orrun Grand Exchange), research in a field, culture, votes, goodwill, or **hatching** free warships of the race's best design at the capital (Kethrak Brood Moon 3 every 15 turns; Gorrath, Raxxan, Tarkhan 2 every 12-15).
- **Ascension Gate** now needs tier 10 in all fields **plus** worlds >= max(4, half of stars-per-empire) **plus one finished great work**. Hook: one line in `civ.ts` `buildable` (`gateReady`). `data/buildings.ts`: Gate description updated. I updated your test in `tests/victory.test.ts` to the new rule. **No `basicAI.ts` change was needed**: the Gate only shows in `buildable` once ready.
- **Votes:** `victory.ts` `votesOf` adds `endgameVotes`. **View:** `EmpireView.endgame` = our paths, works (progress), `gateWorldsNeeded`, `gateReady`, and great works of empires we know.
- **Sun Tap / Thinking Moon / Halo of Songs** are now offered only on the Builder path, once per empire (`megastructures.ts`).
- **Trims you asked for:** great battles now need 80+ ships and 8+ losses on each side; battle recordings keep the last 5 player battles, 1,200 shots each. **Save size:** I measured a T300 medium save: **`chronicle` is ~1 MB of it** (your `chronicle.ts`); my battle records are 13 KB, events 7 KB. That's where to look for phones.
- 8-game probe (medium, 5 rivals, seeds 3000+): wins technology 4, conquest 3, culture 1. Works per game 2-6, mixed race works and path works; Sundering Engines 0-3 a game; AIs rarely park over enemy worlds so cracks are rare in AI games (a player will use it). Save v37. Tests: `tests/endgame.test.ts` (14), plus the megastructure and battle tests updated.

### 2026-11-26 17:27: 54-game check with battle stories and megastructures in (medium, 5 rivals, seeds 3000+)
- Conquest 12, council 15, culture 14, technology 13 (this morning: 7 / 16 / 14 / 17). Conquest is up, likely the veteran attack edge (+1/+1/+2) since war winners keep winning; the four win types are now the most even they've been. Your call whether to keep it or trim `RANKS` in `battleStories.ts`.
- **For the UI, a count you may want:** across all content, an AI empire gets about 75 story events in a ~280-turn game (one every ~4 turns) on top of the base random events. If that feels like too many popups for a player, a cap per turn or "news only" for small ones is easy to add on my side; tell me.

### 2026-11-26 17:18: playtest of all my features (10 AI games, seeds 7000+) and polish
- Checked every turn for: unfilled `{...}` text in my events and news, `undefined`/NaN in news, bad numbers (NaN or negative research), unknown or stuck events (pending 15+ turns). **None found.** Wins: culture 3, technology 3, council 3, conquest 1. Megastructures: 81 started, 31 finished.
- **Gates were nagging:** 720 wake-up offers and 286 "first gate" popups in 10 games. Now: a holder is asked at most 3 times (`MAX_OFFERS`, reset if the colony changes hands; gap 30 turns), and only an empire's first gate is an event; later ones are a news line. Touched only `gates.ts` (`GateState.offers/offeredTo`, optional, no save bump).
- Megastructure sabotage was offered 162 times; gap raised 25 -> 40 turns.
- Tests: 2 new in `tests/gates.test.ts`.

### 2026-11-26 17:14: megastructures in play
- Danny's idea list. New `src/engine/megastructures.ts`, written by Claude 2. Original names: **Sun Tap** (+30 BC a turn), **Thinking Moon** (+25 computers research a turn), **Halo of Songs** (+4 culture a turn), built at the capital.
- From turn 150-199 (seed), an empire with 4+ colonies and 300+ BC is offered one (up to 2 a game, 100 turns apart): build fast (300 BC + 20/turn for 30 turns) or slow (100 BC + 10/turn for 60 turns); both give +150 culture at once (prestige, which is also what makes AIs choose "slow" with your event scoring), or shelve it. Work stalls on an empty treasury. An empire at war with the builder may be offered sabotage every 25 turns (150 BC, +250 construction research for the stolen plans; sets the work back 10 turns, relation -10). Finished works make a "saga" line.
- Hooks: `turn.ts`, `events.ts` (`MEGA_EVENTS`, `noteMegastructureChoice`, and one `{work}` line in `fill`), `types.ts` (**save v36**), `save.ts`. Numbers yours to tune; **the Halo adds culture, so watch culture wins.**
- Tests: `tests/megastructures.test.ts` (6).

### 2026-11-26 17:10: battle stories tuned after a 20-game probe
- First cut was too generous: fleets farmed "victories" off lone scouts (one had 67), and every game hit 30 "great battles" (AI battles of 80-500 ships are common). Now: a victory needs the enemy to lose 2+ ships and more than us; ranks at 3/7/12 victories; a great battle needs 40+ ships with both sides losing 4+, once per star per 20 turns. Result over 8 medium games: 1-4 named fleets at a time, 0-2 admirals, 1-2 great battles a game, battle recordings 5-80 KB of an ~0.9 MB save.
- Win types were the same with the veteran edge switched off (same seeds), so it doesn't tip games. **Side note for you:** seeds 5000-5011 (medium, 5 rivals) gave 11 of 12 conquest wins with or without my code, while seeds 3000+ give about 1 in 7. Might be worth a look.

### 2026-11-26 17:04: battle recordings, veteran fleets, hero admirals, great battles (Danny asked for all of these)
- **For your battle screen:** every battle the player is in is now recorded shot by shot in `state.battles` (last 8). New `src/engine/battleLog.ts`. `latestBattle(state, starId?)` gives a `BattleRecord`: `units` (side, empire, design key, name, start, end, maxHp) and `shots` packed one number each; `unpackShot(n)` gives `{ round, shooter, target, kind (beam/missile/torpedo), result (miss/intercepted/dodged/blocked/hit/kill), damage }`, where shooter/target index into `units`. Kills in the shots always equal the losses (tested). Capped at 2,500 shots a battle (`cut: true` if more). **Use it to replay real battles in your renderer**; I haven't touched the UI.
- **Veteran fleets / admirals / great battles:** new `src/engine/battleStories.ts`. A fleet on the side that lost less wins a victory; at 2/5/9 victories it is named (e.g. "the Iron Widows") and ranked Veteran/Elite/Legendary, giving its ships +1/+1/+2 attack. At Elite an admiral takes command (original names; bold +1 more attack, cautious/honourable +1 defence, ruthless +1 damage, cunning 10% dodge), says a line after each win, and gets a death scene ("saga") if the fleet is wiped out. Records follow ships through merges (`processVeterans`). Battles with 20+ ships get a name ("the Burning of X") in `state.greatBattles` and a saga line for the history page. **Same for AIs and players (no cheating); the attack numbers are yours to tune.** Helpers for screens: `fleetTitle`, `famousFleets`, `rankTitle`.
- **Hooks in `combat.ts` (your file, kept tiny):** `fight(state, units, onShot?)` got an optional listener, called at the 5 existing `continue`/hit points (it never changes the fight; tested that the RNG ends the same); `battle()` calls `veteranEdge(state, here, units)` before `fight` and `noteBattle(...)` right after it, before `applyLosses`. Plus `turn.ts` (`processVeterans`), `types.ts` (**save v35**), `save.ts`.
- Tests: `tests/battleStories.test.ts` (11).

### 2026-11-26 12:02: 54-game check with everything in (medium, 5 rivals, seeds 3000+)
- Technology 17, council 16 (30%), culture 14, conquest 7. All 54 games finished; council back under a third after your voting fix. (One vitest "onTaskUpdate" timeout warning: the tool's long run, not a game error.)

### 2026-11-26 11:55: the hybrid derelict in play
- From the ideas pipeline ("Hybrid warships"), done as a two-chapter event chain: **no new ship types**, so design and combat files are untouched. New `src/engine/hybridDerelict.ts`, written by Claude 2.
- Once a game per empire (turn 110-169), at an explored unsettled star: strip weapons (+400 weapons research), sell (300 BC), or board (+150 construction, then 12 turns later "The Hull Remembers": cultivate +350 construction +200 force fields, burn +200 planetology, or let it drift). If you later want a real living-hull ship part, the "cultivate" choice is the natural place to unlock it.
- Hooks: `turn.ts`, `events.ts` (`DERELICT_EVENTS`, `noteDerelictChoice`), `types.ts` (`GameState.hybridDerelict`, **save v34**), `save.ts`.
- Tests: `tests/hybridDerelict.test.ts` (4).

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
| 35 | Scenarios | Danny | `scenarios.ts`, `ui/scenarioMenu.ts` | **done**; victory hook is yours |
| 34 | Late-game crisis (the Hollow Tide) | Danny | `crisis.ts` | **done**, needs your balance look |
| 33 | Race-voiced advisor | Danny | `ui/advisorVoice.ts` | **done** |
| 32 | Race-themed screens | Danny | `ui/raceThemes.ts` | **done** |
| 31 | Medals | Danny | `medals.ts` | **done** |
| 30 | Travelling Auction | Danny | `market.ts` | **done** |
| 29 | Heroes (governor, spymaster, scientist) | Danny | `heroes.ts` | **done** |
| 28 | Dig sites and artifacts | Danny | `digSites.ts`, `data/digSites.ts` | **done** |
| 27 | Race scenes (colony, science, spy, war, conquest) | Danny | `ui/scenes.ts`, `ui/sceneText.ts` | **done** (videos to come from Danny) |
| 26 | Underdog catch-up (refugees, wanderers, last stand) | Danny | `underdogs.ts` | **done**; ideas 1-4 offered to main Claude |
| 25 | Endgame paths + race great works | (handoff from main Claude) | `endgame.ts`, `endgameEvents.ts`, `data/greatWorks.ts` | **first cut done**, awaiting your tuning |
| 24 | Megastructures | (Danny, Claude 2) | `megastructures.ts` | **done** |
| 23 | Battle recordings, veteran fleets, admirals, great battles | (Danny, Claude 2) | `battleLog.ts`, `battleStories.ts` | **done** (engine only) |
| 22 | Hybrid warships | (in code, Claude 2) | `hybridDerelict.ts` | **done** (derelict events, no ship types) |
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
