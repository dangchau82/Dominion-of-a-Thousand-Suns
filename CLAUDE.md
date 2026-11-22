# Dominion of a Thousand Suns — instructions for Claude

Turn-based space 4X for phone and PC: Master of Orion 1 core plus the best of MoO 2/3, Civilization, Galactic Civilizations, Stellaris and Endless Space 2. Owner: Danny (dangchau82). He playtests; he is not a programmer, so explain in plain words.

- Full design doc: https://claude.ai/artifact/HyUZt6eKiXupud6oRpZszL
- Project docs (claude.ai project "Dominion of a Thousand Suns"): `claude/game-brief.md`, `claude/reference-study.md`

## Hard rules
1. **The AI never cheats.** AI code may read only `EmpireView` (src/engine/view.ts), never `GameState` directly, and acts only through `applyCommand` — the same API the player uses. No production, research or vision bonuses at any difficulty.
2. **No Master of Orion or Civilization names, race names, art or text.** The repo is public. Our races, names and text are original.
3. **Ported code is credited.** Anything adapted from Remnants of the Precursors (GPL-3.0) carries a comment `Adapted from Remnants of the Precursors (GPL-3.0)`. Never copy ROTP images or text (CC BY-NC-ND).
4. **Engine is pure and deterministic.** `src/engine` has no DOM, no `Math.random`, no `Date`. All randomness goes through the seeded RNG stored in the state, so a save + seed replays exactly. State is plain JSON (ids, not object references).
5. **Every stage ends playable**, and `npm test` must pass before pushing.
6. Never commit API keys (Gemini key stays on the device).

## Layout
- `src/engine/` — rules: types, data tables, formulas, galaxy generation, turn processing, commands, per-empire views, saves
- `src/engine/data/` — game data (planets, stars, races, ship templates). Data, not code, so it can be tuned or modded.
- `src/ai/` — AI players (stage 1: a simple test bot)
- `src/ui/` — screens (stage 1 screens come next)
- `tests/` — Vitest; `tests/selfplay.test.ts` runs AI-vs-AI games as a stability check

## Commands
- `npm test` — all tests
- `npm run typecheck`
- `npm run dev` — run the game locally

## Build stages
1 Core loop · 2 Research and ships · 3 Combat · 4 Basic AI · 5 Diplomacy and espionage · 6 Civilization layer · 7 Victory and council · 8 Master AI · 9 Polish · 10 Optional Gemini link
