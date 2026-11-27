# Gemini job: race sagas (branching, replayable race stories)

**Read `GEMINI-RULES-Dominion.md` first (all of it).** This is a **writing and data** job (rules section 7). No engine code: Claude 2 writes the engine that plays this.

**Attach with this file:** `GEMINI-RULES-Dominion.md`, `src/engine/data/sagas.ts` (the data shape), `src/engine/data/races.ts` (the 18 races) and the four `src/engine/data/storylines*.ts` files (each race's character and voice so far).

---

## What Danny wants

Race stories that feel like the big story-driven role-playing games: **choices that matter, forks that open or close later scenes, and thresholds that really change how the game ends.** Every new game should tell a **different** story, even with the same race.

**Ideas only.** No names, characters, places, factions or wording from any game, show or book (rules section 2.4). Write everything new, in this game's own voice.

## How it plays (so your writing fits)

- Each race has **four acts**. For each act you write **3 different act beats**. The game seed picks one per act, so there are 81 ways through a race's main story.
- Every choice moves three hidden **saga scores**:
  - `mercy`: + spare, forgive, protect; − punish, sacrifice, crush
  - `openness`: + welcome outsiders, share, trade; − close the borders, keep secrets, trust no one
  - `tradition`: + honour the old ways, ancestors, faith; − break with the past, change, innovate
  Each choice moves **one or two** of them by −2 to +2. Give the choices in a beat **different directions**, so no option is simply "the good one".
- Choices can set **flags** (short kebab-case names like `spared-the-heir`, `burned-the-archive`). **Branch beats** play only when their `needs` flags are set: these are the forks. A branch can also be shut by `blockedBy` flags.
- At the end, the game checks the **endings** in order and plays the **first one whose thresholds hold**. The last ending has no `needs` (the fallback).
- **Crossover beats** play when this race has met another named race, so stories meet.

## What to write, per race (all 18)

1. **12 act beats**: acts 1, 2, 3 and 4, three beats each (`kind: "act"`). Each has **3 choices**.
   - Act 1 (around turn 20-60): the race's first big question.
   - Act 2 (60-130): its consequences grow.
   - Act 3 (130-200): a crisis. **At least one choice in each act-3 beat should set a flag.**
   - Act 4 (200+): the reckoning.
2. **5 branch beats** (`kind: "branch"`, give them `act` 2, 3 or 4), each needing a flag set by an earlier choice. **Every flag you set must be needed by at least one branch beat or ending**, and every flag you need must be set somewhere earlier. Make at least one branch a hard turn: a betrayal, a return from the dead, a secret coming out.
3. **4 endings** (`SagaEnding`), checked in order:
   - three with `needs` thresholds (scores run from about −16 to +16 over a game; use thresholds of **4 to 8**, for example `{ mercy: { min: 5 } }` or `{ tradition: { max: -4 }, openness: { min: 3 } }`), optionally `needsFlags`;
   - one fallback with no `needs`.
   - Each picks an `outcome` from the `SagaOutcome` list in `sagas.ts`. **Use at least three different outcomes per race**, and fit them to the story: a ruthless, closed race might end in `everyoneFearsUs` or `civilWar`; a merciful, open one in `rivalBecomesAlly` or `councilFavour`.
   - Endings have **one choice** (the label is how we meet our fate, for example "So be it"), with effects in scale.

**Then, once all 18 are done: 12 crossover beats** (`kind: "crossover"`, `withRace` set, any `act` 2-4, 3 choices each), each for a pair of races whose stories would clash or meet. Spread them over different races.

## Rules for the text

- `text` is 1-3 sentences. Choice `label` up to about 10 words; `result` one sentence.
- You may use `{rival}` (an empire we know), `{colony}` (one of our worlds) and `{star}` (a star) in `text`, `label` and `result`.
- `effects` are the normal event effects (`EventEffect` in `data/events.ts`), **in scale** (rules section 3): money up to about ±300, research up to about 400, culture up to about 160, population ±1-5, morale ±1-8, relations ±20. Act 4 and endings may go up to 1.5 times that. Costs and drawbacks are good: big rewards should hurt somewhere.
- `art` is one of: anomaly, ruins, supernova, pirates, contact, crisis, council, victory.
- **Ids:** `saga-<raceId>-<act>-<short-name>`, `saga-<raceId>-branch-<short-name>`, `saga-<raceId>-end-<short-name>`, `saga-x-<raceA>-<raceB>-<short-name>`. All unique.
- Keep each race's voice from its storylines (the Ashkari are warlords of the red desert, the Nyx are machines, the Verdane are plants...). Don't retell the old storylines: these are **new** stories.

## How to deliver

- **One file per race:** `src/engine/data/sagas/<raceId>.ts`:
  ```ts
  import type { SagaBeat, SagaEnding } from "../sagas";
  export const BEATS: SagaBeat[] = [ /* 12 act beats, then 5 branch beats */ ];
  export const ENDINGS: SagaEnding[] = [ /* 3 with needs, then the fallback */ ];
  ```
- Crossovers last, in `src/engine/data/sagas/crossovers.ts` exporting `BEATS`.
- One race will not fit in one reply (8 KB limit). Split it: **acts 1-2 in one reply, acts 3-4 in the next, branches and endings in a third.** Use `CONTINUED IN NEXT REPLY` and `END OF REPLY` as the rules say.
- Order: humans, vossari, kethrak, ashkari, lumen, thraal, seraphine, orrun, nyx, velari, drovani, gorrath, ixil, verdane, quorai, raxxan, ruuvak, tarkhan, then crossovers.
- At the end of each race, list its flags and which beat sets and which beat needs each one (one line per flag), so Claude can check the forks connect.

## Checklist before each reply

- Every beat has 3 choices (endings 1), every choice has `shift` with one or two scores, and effects in scale.
- Flags: set before they are needed; none left dangling.
- Endings: three with thresholds, then one fallback; at least three different outcomes.
- No names or wording from other works. No `{` placeholders other than `{rival}`, `{colony}`, `{star}`.
- Ends with `END OF REPLY`.
