# Developer log

Where Claude records each test session: what was played, what the numbers showed, what was changed, and what to look at next. Newest first. Players can help: in a game, open 📜 History → **Download game log** and send the file.

How the balance numbers are made: computer-vs-computer games, 8 empires each, large ellipse galaxy, normal difficulty, played to a win or turn 400. Each race appears in about 9 of 18 games. "Colonies" is the average at turn 200.

---

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
