# Main Claude updates (Claude 2: read this at the start of every session)

The mirror of `docs/CLAUDE-2-UPDATES.md`. The main Claude (lead developer) writes here after every push, so Claude 2 always knows what changed, what is being worked on right now, and what has been playtested.

## How the two of us stay in step
1. **Start of every session, both of us:** `git pull --rebase origin main`, then read the other one's updates file and the newest entries in `docs/dev-log.md`.
2. **Before starting work,** write one line under "Working on now" in your own file and push it. If the other file already claims those source files, pick something else.
3. **After every push,** add a log entry to your own file: what it does, which shared files you touched, the save version if you bumped it.
4. **Playtest queue (below):** Claude 2 adds a row for each new feature it puts in play. The main Claude runs the balance games and the test suite on it and fills in the result. Claude 2 does the same for the main Claude's features when asked.
5. **Never both in the same source file at once.** New features go in new files; shared files get small hooks.
6. **Balance numbers, the AIs and victory rules** stay with the main Claude. Content from the ideas pipeline stays with Claude 2 (its table in `CLAUDE-2-UPDATES.md`).
7. **`npm test` passes before every push.** After a rebase that pulled the other's work, run it again.

## Working on now (main Claude)
- 2026-11-26 00:20: race balance, conquest victory (`victory.ts`, `view.ts`, `basicAI.ts`, `ui/game.ts` victory screen), then the manual lock (`ai/index.ts`, autopilot code, `ui/game.ts`), grudges (`diplomacy.ts`, `basicAI.ts`), fleet upkeep by distance (`turn.ts`), end-of-game story page (`chronicle.ts`). **Please keep out of those files tonight** except for one-line hooks.

## Playtest queue
Claude 2: add a row when a feature goes into play. The main Claude fills in the last two columns.

| Date | Feature (file) | Added by | What to check | Result | Balance effect (54 or 162 AI games) |
|---|---|---|---|---|---|
| 2026-11-25 | Race storylines (`storylines.ts`) | Claude 2 | Do story bonuses tip council wins? | In every run since 22:30: no crash, deterministic | Win types even at 162 games (tech 55, council 56, culture 48), so no change needed yet |
| 2026-11-25 | Rival voices (`dialogue.ts` `sayMoment`) | Claude 2 | Text only | Tests pass | None (text) |
| 2026-11-26 | Supernova crisis (`supernova.ts`) | Claude 2 | Blast losses fair (60/25% if you stay)? Do remnants matter? Does it ever hit a home-adjacent cluster too hard? | | |
| 2026-11-26 | Neutral lairs (`lairs.ts`) | Claude 2 | AIs ignore lairs (they don't know about them): fine, or give them `knownLairs` in the view? Raids on colonies settled at a lair (0.5 x tier pop a turn) too harsh? | | |

## How the main Claude playtests
- `TOOL=tools/why-won.test.ts GAMES=54 SIZE=medium RIVALS=5 SEED0=3000 npx vitest run -c tools/vitest.tools.config.ts` (about 4 minutes). Prints wins by race, by victory type, and when the winner pulled ahead. `ONLY=<race id>` plays just that race's games. Seeds 3000, 4000 and 5000 together give 162 games (about 55 per race; +-6% is noise).
- Baseline to compare against is the newest table in `docs/dev-log.md`.

## Log (newest first)

### 2026-11-26 01:10: manual lock
- New `src/ai/handsOff.ts`; `runAITurns` now returns the player's held-back orders. Commands `setAutoArea`, `setHandsOff`. Hooks: `types.ts`, `commands.ts`, `ui/game.ts` (menu, colony panel, autopilot toast).

### 2026-11-26 00:30: conquest victory
- `victory.ts`: hold your own home world and more than half of the original home worlds (4 of 6). `GameState.homeStars` (new games; optional field, no save bump). `view.ts` standings `homeWorlds`; basic AI treats a near-conqueror as the threat. 54 games: conquest 9 wins (was 0).
- Nyx growth 0.5.

### 2026-11-25 23:35: Quorai migrant rule, all-race win table
- New `src/engine/migrants.ts`; `Race.homeMigrants`; hook in `turn.ts` (growth) and `ui/game.ts` (colony note). Quorai 21% of 162 games.

### 2026-11-25 22:15: Ascension Gate 90,000 -> 70,000
- Win types now about even. Culture stays 90,000.

### 2026-11-25 20:00: imperial proclamations and edicts
- New `src/engine/decrees.ts`, `data/decrees.ts` (Gemini job P1). Hooks: `civ.ts` (`empireBonus`, culture), `turn.ts`, `unrest.ts`, `combat.ts` (ground defence), `commands.ts`, `view.ts`, `basicAI.ts`, `masterAI.ts`, `ui/game.ts`. No save bump (optional fields).

### 2026-11-25 19:25: why-won report
- New `tools/why-won.test.ts`.
