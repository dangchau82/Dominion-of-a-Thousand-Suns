# Claude 2 updates (read this at the start of every session)

**Who:** Claude 2 is Danny's **secondary developer**. The main Claude leads; Claude 2 adds features from the ideas pipeline alongside it. Danny wants the main Claude kept up to date on everything Claude 2 does, so Claude 2 updates this file after every push.

**How Claude 2 works, so it never gets in your way:**
- Its features live in **new files of their own**; shared files only get small hooks (listed below).
- It **never changes your work**: no balance, AI or design changes, nothing you are in the middle of. Problems it spots in your code go under "For the main Claude" below, for you to decide.
- It pulls before starting, checks your claims in `docs/handover-*.md`, and pushes only when `npm test` passes after merging your latest work.
- **You have the final say.** Change or remove anything Claude 2 added; just note it here so it knows.
- **Save versions:** whoever needs the next one takes it. The latest used is listed below; check it before bumping.

**Latest save version: 13** (Claude 2, supernova crisis).

> **NOW (2026-11-26 00:10, Claude 2, working overnight):** supernova **done**; now building **lairs** (new `src/engine/lairs.ts`), then the Crusade, critters, infestation, job board, in that order (table below). Hooks only in `events.ts`, `turn.ts`, `types.ts`, `save.ts`. Each finished feature gets a log entry here.

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
- **Supernova prophecies can now come true:** your `prophecy.ts` says supernova texts wait for that system. It exists now: `supernovaTurn(state)` in `supernova.ts` gives the turn the star starts dying (seed-based, 130-199, no random draws), and `state.supernovae[0].starId` / `.blowTurn` once it begins. Wiring a prophecy to it is your call.
- The **"prophecy" lines** in `data/dialogue2.ts` are not used yet. They fit nicely if allies ever share prophecies (your `prophecy.ts`).

---

## Log (newest first)

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
| 4 | Lairs: neutral guarded stars | `data/lairs.ts` | `lairs.ts` | planned |
| 5 | Gates, armadas and ambushes | `data/gates.ts` | `gates.ts` | planned (will ask before hooking `movement.ts` / `combat.ts`) |
| 6 | The Crusade (peaceful faith crisis) | `data/crusade.ts` | `crusade.ts` (engine) | planned |
| 7 | Invasive critters | `data/critters.ts` | `critters.ts` (engine) | planned |
| 8 | Alien infestation, the silent colony, the specimen deal | `data/infestation.ts` | `infestation.ts` (engine) | planned |
| 9 | Frontier job board | `data/contracts.ts` | `contracts.ts` (engine) | planned |
| 10 | Legendary ship and crew, synthetic leaders | `data/legends.ts` | `legends.ts` (engine) | planned |
| 11 | Death worlds | `data/hazardWorlds.ts` (death-world part) | `deathWorlds.ts` | planned |
| 12 | Minor races, native peoples, expeditions | `data/minorRaces.ts`, `natives.ts`, `expeditions.ts` | own files | later |

**Yours (main Claude), Claude 2 stays off:** the AIs (basic and Master), balance and victory tuning, combat and movement rules, conquest ("you keep what you take", ground war, drop troops), superweapons and starbases, carriers, prophecies, prison colonies, unrest and civil war, council and resolutions, money sinks, proclamations, the UI layout and art, and anything else not in the table.
