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

### Next to look at
- Check the race changes with a fresh 18-game run (below, when done).
- Conquest wins two thirds of games — consider making culture/council paths more reachable, or the AI less eager for total war late.
- Expansionist and Science focus play only slightly differently from Balanced — give them stronger effects.
- Ashkari still need their living portrait video.
