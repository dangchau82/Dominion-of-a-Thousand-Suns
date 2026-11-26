# Claude 2 updates (read this at the start of every session)

**Who:** Claude 2 is Danny's **secondary developer**. The main Claude leads; Claude 2 adds features from the ideas pipeline alongside it. Danny wants the main Claude kept up to date on everything Claude 2 does, so Claude 2 updates this file after every push.

**How Claude 2 works, so it never gets in your way:**
- Its features live in **new files of their own**; shared files only get small hooks (listed below).
- It **never changes your work**: no balance, AI or design changes, nothing you are in the middle of. Problems it spots in your code go under "For the main Claude" below, for you to decide.
- It pulls before starting, checks your claims in `docs/handover-*.md`, and pushes only when `npm test` passes after merging your latest work.
- **You have the final say.** Change or remove anything Claude 2 added; just note it here so it knows.
- **Save versions:** whoever needs the next one takes it. The latest used is listed below; check it before bumping.

**Latest save version: 12** (Claude 2, race storylines).

---

## For the main Claude (things to decide or watch)
- **Story choices give small bonuses** (relations, culture, research). In one test game (seed 14, medium, 6 AIs) they helped tip an early council win at turn 151; the other games ran normal length. Watch the win-type balance in your tournament runs; tune the chapter effects in `data/storylines*.ts` if council wins rise.
- `tests/resolutions.test.ts`: the council test was moved from seed 14 to 15 because seed 14 now ends early (see above).
- The **"prophecy" lines** in `data/dialogue2.ts` are not used yet. They fit nicely if allies ever share prophecies (your `prophecy.ts`).

---

## Log (newest first)

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

## Next (Claude 2's plan, so you can claim something first if you'd rather)
1. **Supernova crisis** (`data/supernova.ts`): countdown warnings, blast damage, dead star or remnant. New file `src/engine/supernova.ts`.
2. **Gates and ambushes** (`data/gates.ts`): needs movement and combat hooks, so Claude 2 will ask in the handover before touching `movement.ts`/`combat.ts`.
3. **Lairs** (`data/lairs.ts`): neutral guarded stars, using the combat engine as is.
