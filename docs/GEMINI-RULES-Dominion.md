# Rules for working on Dominion of a Thousand Suns

You are a contributor to **Dominion of a Thousand Suns**, a turn-based space 4X game written in TypeScript. The lead developer is **Claude**, who reviews and merges everything. The owner is **Danny**, who playtests and is not a programmer.

This one file holds all the rules: the basics (sections 1 to 8) and the lessons from your earlier jobs (section 9). **Read all of it before every job.** Work that breaks these rules is rejected and rewritten, which wastes everyone's time.

Last updated: 2026-11-25 (save version 11).

---

## 0. How every job starts

1. Danny uploads this file and a **job file** (`gemini-task-*.md` or `gemini-bundle-*.md`). The job file says what to do and, for code jobs, contains every source file you need in full.
2. Reply first with **one short line**: what you are about to deliver and in how many parts. Then start part 1.
3. **Keep every reply under about 8 KB (roughly 200 lines).** Your answers get cut off without warning, sometimes at only 7 to 10 KB, and you can't tell when you're near the limit. When a job is bigger, end the reply with `CONTINUED IN NEXT REPLY` and wait for Danny to type **next**.
4. **End every reply with the line `END OF REPLY`.** If that line is missing, Danny and Claude know the reply was cut off.
5. If something you need isn't in the files, **say so and stop**. Never guess at code you can't see.
6. Use a normal Gemini chat for big job files. A notebook may load only parts of a long file.

## 1. Always work from the real source

- Danny attaches the latest source: either a bundle like `dominion-source-YYYY-MM-DD.ts` (each file starts with `// ===== FILE: path =====`) or the complete files inside a job file.
- **Only use types, functions and fields that exist in that source.** Before you write `empire.money`, check `src/engine/types.ts`: the real field is `empire.treasury`. If something you need does not exist, say so and list it as a new addition (see section 6). Never assume it is there.
- **Change existing files; do not write a parallel system.** If combat needs retreat, edit `resolveCombat`/`battle`/`fight` in `src/engine/combat.ts`. Do not write a new `battle()` with its own types.
- **Take game numbers from the source, never from memory.** Rules change often. If the source and your memory disagree, the source wins. Better still, refer to the constant by name (for example `CULTURE_VICTORY`, `VOTE_SHARE_TO_WIN` in `src/engine/victory.ts`).
- If the source looks older than the request (something Danny mentions is missing from it), stop and ask for the latest source.

## 2. Hard rules (never break these)

1. **No `Math.random`, `Date`, `performance.now` or any DOM in `src/engine`.** All randomness goes through the game's seeded generator, stored in the state:
   ```ts
   import * as R from "./rng";
   R.next(state.rng)            // 0..1
   R.int(state.rng, min, max)   // whole number, inclusive
   R.range(state.rng, min, max) // decimal
   R.chance(state.rng, p)       // true with probability p
   R.pick(state.rng, list)
   R.shuffle(state.rng, list)
   ```
   No default parameters like `rng = Math.random` either. A save plus its seed must replay exactly.
2. **State is plain JSON.**
   - Ids are **numbers** (`type Id = number`) for stars, empires and fleets. Design ids, tech ids and data ids are strings.
   - Never store object references, class instances, Maps, Sets or functions in `GameState`.
3. **The AI never cheats.**
   - Code in `src/ai/` may read only `EmpireView` (from `src/engine/view.ts`), never `GameState`.
   - The AI acts only through `applyCommand` commands, the same ones the player uses.
   - It gets no bonuses at any difficulty.
   - If AI code needs new information, add it to `EmpireView`, and only what that empire could legally know.
4. **Everything must be original.** No names, races, characters, ships, places or text from any game, show, film or book: Master of Orion, Civilization, Stellaris, Endless Space, Mass Effect, Babylon 5, Crusade, Stargate, Star Trek, Star Wars, Firefly, the Riddick films, the Aliens films, or any other. **Ideas are fine; names and wording must be new.** The repo is public.
5. **Game data is data.** New tables (events, buildings, specials, traits, lairs) go in `src/engine/data/*.ts` as plain exported objects, so they can be tuned without touching logic.
6. **Saves must keep working.** If you add or rename a field in `GameState`, `Empire`, `Colony`, `Star`, `Fleet` or `Leader`:
   - bump `SAVE_VERSION` in `types.ts` (it is **11** now, so the next is 12, unless the job file says Claude already did it);
   - add a migration step in `deserialize` in `src/engine/save.ts` that fills the new field for old saves.
7. **Never change how a seed generates the galaxy without saying so.** Extra `R.*` calls during `newGame` change every map, and Danny replays seeds. Extra draws later in the game are fine, but say so.

## 3. The game's real scale (match it)

| Thing | Real values |
|---|---|
| Ship hull hit points (`HULLS` in `data/ships.ts`) | small 3, medium 18, large 100, huge 600 |
| Hull cost (BC) | small 6, medium 36, large 200, huge 1200 |
| Weapon damage per shot (`data/techs.ts`) | from 1–4 (early) up to 50–100 (best late-game weapons) |
| Missile base hit points | `BASE_HP = 25` (in `combat.ts`); battles last at most `MAX_ROUNDS = 8` |
| Buildings (`data/buildings.ts`) | 60–150 BC early; wonders cost thousands; Ascension Gate 90,000 |
| Random-event rewards (`data/events.ts`) | money up to about ±300, research up to about 400 per field, culture up to about 160, population ±1–5 |
| Victory | culture 90,000; council needs 60% of votes; Ascension Gate (tech) 90,000 |
| Treasury mid-game | a few hundred to about 2,000 BC |

A new monster or bonus far outside these numbers will be rescaled.

## 4. Where things live

- `src/engine/types.ts`: all state types and `SAVE_VERSION`. Read it first.
- `src/engine/turn.ts`: `endTurn` runs one turn: colonies, research, upkeep, civilization, events, espionage, treaties, relations, border warnings, movement, combat, vision, council and victory.
- `src/engine/combat.ts`: per-shot battles (`fight`, `pickTarget`, `hitChance`), invasion, bombing, war and peace.
- `src/engine/movement.ts`: fuel range and fleet speed.
- `src/engine/commands.ts`: every player/AI action (`Command` union, `applyCommand`).
- `src/engine/view.ts`: `EmpireView`, what one empire is allowed to know.
- `src/engine/abilities.ts`: the 18 race abilities.
- `src/engine/civ.ts`: buildings, wonders, leaders and their traits, culture, golden ages.
- `src/engine/diplomacy.ts`: relations, gifts, treaties, spies, border warnings.
- `src/engine/victory.ts`: council, culture and tech victory, "Fight on".
- `src/engine/save.ts`: `serialize`, `deserialize` and the save migrations.
- `src/engine/data/`: game data, including:
  - `races.ts`, `techs.ts`, `ships.ts`, `buildings.ts`, `planets.ts`;
  - `events.ts` (event format and `EventEffect` kinds), `dialogue.ts`;
  - your earlier work: `lateGameLore.ts`, `storylines.ts`, `leaderTraits.ts`, `prophecies.ts`, `minorRaces.ts`, `expeditions.ts`, `resolutions.ts`, `unrest.ts`, `livingShips.ts`, `moneySinks.ts`, `crises.ts`, `victoryTension.ts`, `carriers.ts`, `megaprojects.ts`, `natives.ts`, `protectedWorlds.ts`, `crusade.ts`, `critters.ts`.
- `src/ai/basicAI.ts`: the AI, built only on `EmpireView`.
- `tests/`: Vitest tests. `tests/selfplay.test.ts` runs whole AI-vs-AI games; `tests/lore.test.ts` checks every data file.

## 5. Performance

Games run up to 18 empires on maps of up to 280 stars for 400+ turns, and the AI checks ranges thousands of times per turn.

- **Do not loop over all stars inside a function that is called per star or per fleet.** Precompute once per turn, or cache.
- No path searches over all star pairs (O(n²)) inside range checks.
- A full AI-vs-AI game on a medium map should still take about 2–3 seconds.

## 6. How to deliver code

1. **Name every file you change**, with its full path as the first line comment, for example `// src/engine/combat.ts`.
2. **Send only the functions you changed, each one complete, plus any new files.** Never resend unchanged code. Say exactly where each function goes (which file, replacing which function or after which one).
3. **Never paste the old version back.** Only the new version, written out in full.
4. Then list, in plain words:
   - every new field, type, command or data table;
   - any save migration;
   - whether the galaxy for a given seed changes;
   - anything you were unsure about.
5. **Add at least one Vitest test** in `tests/` for each new rule: set up a small state with `newGame(...)`, apply the rule, and check the result. **Check the exact thing that changed**, not a total that other code also touches (the AI spends money on other things in the same turn, so check what the player received, not the AI's whole treasury).
6. Keep within the code's style: small functions, short comments explaining *why*, and no new libraries.
7. Do not reformat or rewrite code you were not asked to change.

## 7. How to deliver writing and data

1. **Plain TypeScript object keys,** not JSON style: `{ kind: "culture", amount: 80 }`, not `{"kind": "culture", "amount": 80}`.
2. **Leave out zero values.** Write `bonus: { relations: -6 }`, not every stat listed with 0.
3. **Ids match names.** If the trait is "Dense Heartwood", the id is `dense-heartwood`.
4. **Placeholders never go in titles or ids.** Only `text`, `label`, `result`, `fulfilled` and similar body text are filled in. "General Strike on {colony}" shows the braces to the player; write "General Strike".
5. **Write lists by hand.** Don't use a name-generator script: script output comes out alphabetical and clunky ("Bluttur", "Clirkisk"). Fewer, better names beat many.
6. **Keep each race's voice.** Check the race table before writing for a race (the Vossari are scientists, not nobles). **Check names carefully: never put one race's lines under another race.**
7. **Never leave placeholder race ids** like `race18`. Use the real ids from the source; if you don't have them, ask.
8. **Never end a file mid-object.** If you're running long, stop at the end of a whole entry and write `CONTINUED IN NEXT REPLY`.

## 8. Checklist before you answer

- [ ] I used the latest attached source, and only what is in it.
- [ ] I changed existing files instead of writing a parallel system.
- [ ] I used no `Math.random`, `Date` or DOM in the engine; randomness uses `state.rng`.
- [ ] Ids are numbers where the rules say so; the state is plain JSON.
- [ ] The AI reads only `EmpireView` and acts only through commands.
- [ ] My numbers match the scale table and come from the source, not memory.
- [ ] Every name and text is original, and no new name clashes with an existing one.
- [ ] I bumped `SAVE_VERSION` and added a migration if state changed (or the job file says Claude did).
- [ ] I added a test that checks the exact thing that changed.
- [ ] I listed every file changed and every assumption.
- [ ] This reply is under about 8 KB and ends with `END OF REPLY` (or `CONTINUED IN NEXT REPLY`).

## 9. Lessons from your earlier jobs

Your work so far has been very good, and your two coding jobs (AI reactions, leader traits) both went into the game. These are the only things Claude had to fix. Please avoid them.

1. **Check new names against existing ones.** These are already taken and must not be reused or echoed: Serevahn, Gilded Lattice, Cinder Pact, Meridian Spindle, Vespera Conclave, Lantern Wardens, Glass Mottle, Candescent Fold, Bell-Walkers, all 18 race names, and the wonders (Archive of Ten Thousand Suns, Heartforge, Garden of First Light, Hall of Many Voices, Lantern of the Void, War College of Seven Fleets, Whispering Spire, Ascension Gate, Eternal Chorus). "The Remnant Lattice" next to "the Gilded Lattice" confuses players.
2. **No real-world or borrowed names,** including place names (Akron), companies (Intel), and names from shows and games (Alteran, Atrus), even when they sound invented.
3. **Balance the catch.** When something has an upside and a downside, the downside must hurt about as much. "+2 aim and +2 evasion" for "10% more fragile" is too good.
4. **Strong things must not be cheap.** Compare the cost with similar things in the source (buildings, wonders, ships) before you set a price.
5. **Show your arithmetic** for anything with numbers (totals, strength per tier, cost per benefit) under the code, so Claude can check balance in a minute.
6. **A money sink must lose money on average.** Its whole point is to drain big treasuries. If your own expected-value working comes out positive (like a bond that returns 125%), change the numbers before answering. Things that can never be bought (the Ascension Gate) must stay unbuyable through any new feature.
7. **A gamble that succeeds must not lead to disaster.** Keep the bad outcome on the failure path.
8. **Don't invent new types, effect kinds or art names.** Use only the ones in the source; if you need a new one, list it as a request.
9. **Rules must point the right way.** Read each rule back before answering: once, "high culture makes worlds convert" was written when the opposite was meant.
