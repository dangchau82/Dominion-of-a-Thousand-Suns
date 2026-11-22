# Dominion of a Thousand Suns

A deep, turn-based space 4X strategy game for phone and PC, built with Claude.

Start with one homeworld and expand across a galaxy of up to 280 stars against rival races that play by exactly the same rules you do: no cheating AI, at any difficulty.

Inspired by the classic space and civilization-building strategy games of the 1990s and today. All names, races, art and text are original.

## Status

**Stage 1 of 10: core engine in place.** Galaxy generation, colonies with production sliders, population growth, research, scouting, colonizing, fog of war and saves all work and are tested with AI-vs-AI games. The game screens are next.

| Stage | What it adds |
| --- | --- |
| 1 | Core loop: galaxy, colonies, sliders, exploring, colonizing |
| 2 | Tech tree and ship designer |
| 3 | Smart auto-resolved combat and invasions |
| 4 | AI rivals |
| 5 | Diplomacy and espionage |
| 6 | Wonders, great people, governments, minor races, pirates, events |
| 7 | Victory conditions and the galactic council |
| 8 | Master-level AI |
| 9 | Polish, custom races, leaders |
| 10 | Optional Gemini link for talking with rival leaders |

## Running it

```
npm install
npm run dev     # play locally in the browser
npm test        # run the test suite, including AI self-play
```

## Credits and license

Licensed under the GNU GPL v3 (see `LICENSE`).

Some core rules formulas and planet/star tables are adapted from [Remnants of the Precursors](https://github.com/rayfowler/rotp-public) (GPL-3.0), and are marked where used. AI design ideas were studied from [FreeOrion](https://github.com/freeorion/freeorion). No art or text from either project is used.
