# Ideas pipeline

Future features Danny has approved for later. Not scheduled yet: pick from here when a stage opens up. Newest first.

**Originality rule:** these are inspired by shows and games Danny likes. Keep the ideas, never the names, characters or text. Gemini turns each idea into original names and data (see "Who does what").

Status: `idea` → `designed` (data or design notes exist) → `building` → `done`.

---

## Added 2026-11-25 (inspired by Babylon 5, Crusade and Stargate)

| Idea | Inspired by | How it plays in our game | Status | Notes |
|---|---|---|---|---|
| Ancient gate network | gate networks in both shows | Neutral gates on the map. Claim one and fleets jump between gates in one turn; lose it and the enemy uses it. | idea | Fits the elder-powers stage; the Serevahn "Slipstream Rings" in `data/lateGameLore.ts` are this. Velari already travel by "gates". |
| Occupation and resistance | one race occupying another | Conquered worlds have unrest: lower output, rebels, sometimes a revolt that frees them. Conquest stops being a pure win. | idea | **Top pick.** Also tackles the open problem that conquest rarely decides games. |
| Surrender offers | wars ending at the brink | A losing empire offers worlds or tech to stop a war. | idea | Part of Gemini's coding test ("AI reactions"); waiting for its answer. |
| Galactic Council resolutions | the station's council | Between elections the council votes on sanctions, trade embargoes or condemning an aggressor, giving smaller empires power. | idea | **Top pick.** Gives the council something to do every 25 turns. |
| Parasite overlords | Stargate's ruling parasites | A neutral tyrant holding enslaved worlds. Free them for loyal colonies, or take its tech. | idea | Could be a big neutral "lair" with planets. |
| Self-replicating machines | Stargate's machine swarm | A lair that grows every turn if ignored, and eventually threatens everyone. | idea | Fits the "hive" lair in `gemini-task-lairs.md`. |
| Crusading faith | Stargate's preachers | A late crisis that converts planets through culture rather than war; culture becomes defence. | idea | A late-game crisis, like the Glass Mottle plague. |
| Wandering tech-mages | the secretive mages | Rare visitors who sell one powerful tech or ship for a steep price, or a favour. | idea | Also a money sink for hoarded treasuries (open problem). |
| Hybrid warships | an ancient race sharing ship tech | Allying with an elder power unlocks one special ship design. | idea | Elder-powers stage: the "ship" gifts in `ELDER_POWERS` are this. |
| Ancient power cells | Stargate's limited power units | Rare artifacts that massively boost one colony until they run out. | idea | Serevahn "Chronicle Prisms" in the lore are close. |

## Living ships (Danny's idea, 2026-11-25)

Organic ships that are **grown, not built**. Natural for the Kethrak Hive, Verdane, Ixil and Ruuvak; a late Planetology tech for everyone else.

1. **Cheap but young:** they hatch weak and grow stronger with age.
2. **Three life stages:** Hatchling, Adult (more hit points), Elder (more hit points and better aim). Veteran fleets matter.
3. **Inherited traits** chosen at design time instead of some metal parts, e.g. spined hide (armor), spore clouds (harder to hit), acid glands (eat through shields), swift fins (speed), symbiotic crew (aim).
4. **Mutations:** a fleet reaching Elder rolls one random extra trait (seeded RNG).
5. **Weakness:** no energy shields; burning weapons (plasma) hurt them more.

Status: idea, waiting for Danny's answers on (a) organic races only, or a tech for everyone too, and (b) age stages and mutations, or traits only.
Build notes: fleets store only ship counts today, so each fleet needs an age (save version bump plus migration); combat, designs and the AI all need to learn them. Best after the Master AI and the elder-powers stage. Gemini can write the trait and mutation list.

---

## Who does what
- **Gemini:** turns an idea into original names, text and data tables, in the real scale (task files in Drive under "Source for Gemini").
- **Claude:** checks and fixes Gemini's data, builds the rules, tests, balances with the AI tournament.
- **Danny:** picks what's next and playtests.
