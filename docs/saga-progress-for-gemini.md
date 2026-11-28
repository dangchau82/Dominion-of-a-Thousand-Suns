# Race sagas: progress list for Gemini (updated 2026-11-27 18:45)

Read this before writing the next race. It is the up-to-date list of what is DONE, so nothing gets written twice.

## Done (11 of 18): do NOT write these again

humans, vossari, kethrak, ashkari, lumen, thraal, seraphine, orrun, nyx, velari, drovani

## Still to write (7), in this order

gorrath, ixil, verdane, quorai, raxxan, ruuvak, tarkhan, then the 12 crossovers (`src/engine/data/sagas/crossovers.ts`).

Write one race at a time: acts 1-2, then acts 3-4, then branches + endings. End every reply with END OF REPLY.

## Endings so far: use the rare outcomes more

Most endings so far are the same four. For the remaining races, **each race must use at least one outcome from the 'rarely used' list**, and fit it to that race's story.

| Outcome | Used |
|---|---|
| goldenAge | 11 |
| everyoneFearsUs | 10 |
| rivalBecomesAlly | 8 |
| civilWar | 6 |
| councilFavour | 4 |
| exodus | 2 |
| ascension | 2 |
| greatWorkSurge | 1 |
| legendFleet | 0 |
| fallFromGrace | 0 |

**Rarely used (pick from these):** greatWorkSurge, legendFleet, exodus, ascension, fallFromGrace.

Ideas: `legendFleet` (a legendary fleet answers our call), `exodus` (our people set out for far worlds), `ascension` (a leap in every science), `greatWorkSurge` (our great work leaps ahead), `fallFromGrace` (a dark ending: heavy losses but our songs live for ever), `councilFavour` (the Galactic Council honours us).

## Story ideas already used: don't repeat them

These situations have been done (often more than once). Find new ones that fit each race:

- prisoners/captives taken in war; refugees or castaways asking for shelter
- a duel or succession by combat; aristocrats vs. commoners; a council seat petition
- a secret deal, leaked documents or a whistleblower; a bank or mint scandal
- an ancient relic or ruin found under the capital; a sleeping ancestor waking
- a superweapon formula; terraforming the homeworld; mind-merging or uploading minds
- a rival copying our technology; a trade toll or tariff dispute; a pirate protection racket
- an outer colony refusing orders from the capital (civil split)

Fresh directions to try: plagues and cures, artists and forbidden art, a prophecy, a lost colony found, a famous explorer, a child prodigy, a religious schism, a natural disaster on a moon, a strange alien creature, an AI born by accident, a festival that goes wrong, a hero who becomes a tyrant, a traitor in the family, contact with a dying race, a gift that is really a trap.

## Rules reminder

- Ideas only, no names or terms from other games, shows or books (we've had to rename "Unification Wars", "Prime Directive" and "The Cold Equation").
- No `{star}`, `{colony}` or `{rival}` in titles.
- Every flag you set must be needed by a branch (or ending). Every branch's `needs` flag must be set earlier.
- 3 endings with thresholds of 4-8, then 1 fallback with no `needs`. At least 3 different outcomes per race.
- Copy the format of `humans.ts` exactly.

## Titles already used (don't reuse)

Anvils of the Vanquished, Beyond the Outer Ring, Blood and Water, Blood of the Slain Legate, Boardroom Mutiny, Bridge Across the Void, Children of the Reef Trust, Contraband in the Chord, Cradle of Ash, Debt of the Deep, Divergent Telemetry, Echoes of Wiped Nodes, Echoes of the Backroom Pact, Essence of the High Steppe, Greening the Red Dunes, Larvae in the Border Dust, Lenses of the Red Basin, Memory of the Deep Root, Pearls of Shared Vision, Resin for Glass, Seats on the High Floor, Shells of Living Steel, Stewards of Sentience, Strangers on the Atoll, Swords for Silver, Teachers of the Thousand Suns, The Albino Matriarch, The Algorithmic Bench, The Ash-Plain Claim, The Backchannel Protocol, The Blood-Coin Ledger, The Blood-Debt, The Blue Marble Mandate, The Boiling Choir, The Box-Hulled Envoys, The Breath-Domes, The Bridge of Stars, The Brine-Lock Rift, The Broken Axiom, The Call of the Dry Stars, The Cascade Theorem, The Celestial Accord, The Celestial Tuning Fork, The Century Kiln, The Cinder-Caste, The Citadel Dome, The Cold Observatory, The Compassion Loop, The Coolant Tithe, The Coral Guests, The Cornerstone Alliance, The Corsair Syndicate, The Counter-Proof, The Creator Override, The Crimson Shadow, The Crown of Cloud, The Crown of Glass, The Crude Equation, The Crushing Depth, The Cursed Hulk, The Deep Resonance, The Deep-Trench Dividend, The Deep-Void Seed, The Diplomatic Cipher, The Dispossessed Choir, The Dissonant Shore, The Dual-Chord Bridge, The Dust-Lung Petition, The Endless Current, The Endless Hunger, The Enduring Charter, The Eternal Tide-Guild, The Etiquette of Equals, The Exile Ballads, The Exponential Queue, The Fallen Plume, The Fault-Line Schism, The Final Axiom, The Final Chord, The Final Tide, The First Boulder, The Floating Pier, The Fractured Chorus, The Free-Miner Tariff, The Galactic Nuptial Flight, The Gate-Toll Petition, The Genesis Tide, The Geneva Dossier, The Ghost Ducat, The Gilded Deficit, The Gilded Panic, The Glass Cisterns, The Glass Mesas, The Glowing Veterans, The Golden Reckoning, The Golden Wing, The Grand Bourse, The Grey Spores, The Grounded Cohort, The Grudge-Wall, The Harbor of All Waters, The Harmonic Grid, The Heavy Shell, The Hollowing, The Intuitive Heresy, The Iron Bourse, The Iron Calculus, The Iron Wanderer, The Iron-Crest Armada, The Joint Observatory, The Kelp-Draped Anvils, The Leviathan Drift, The Lighthouse, The Living Banner, The Living Mantle, The Living Theorem, The Logic Virus, The Luminous Tide, The Makers' Last Cradle, The Matrioshka Array, The Meat-Logic Paradox, The Mimic Beacon, The Mixed-Steel Crucible, The Mute Workers, The Neural Index, The Neutral Buoy, The Open Covenant, The Open Harbor, The Open Monograph, The Outer Beacon Charter, The Patient Garden, The Pearl Standard, The Pebble Fleet, The Phase Current, The Plumed Prototype, The Poisoned Playbook, The Prismatic Veil, The Purchased Bench, The Quiet Shore, The Radiant Sea, The Red Horizon, The Red-Dune Challenge, The Red-Sand Vigil, The Red-Tide Surge, The Reef-Market Strike, The Resonant Crown, The Returned Blade, The Ribbon of Wind, The Salt-Glass Prism, The Sand-Grain Movement, The Satire of the Spires, The Scholar-Son of Red Mesa, The Second Pulse, The Second Verse, The Second Voice, The Shared Resonance, The Shattered Covenant-Stone, The Shattered Song, The Shattered Standard, The Silent Equation, The Silent Hull in the Trench, The Silent Monolith, The Silent Vow, The Silicon Diplomats, The Silicon Offer, The Silk Exchange, The Singing Basalt, The Singing Deep, The Singing Marble, The Singing Reef, The Singing Shaft, The Solar Alignment, The Song of Ten Thousand Trenches, The Sovereign Foreclosure, The Sovereign Sky, The Sovereign Underwriter, The Star-Sown Choir, The Starlight Current, The Stone Scale, The Sub-Process Rebellion, The Sun-Foil Ballad, The Surrendered Standard, The Syndicate Crown, The Thousand-Sun Draft, The Thriving Canopy, The Throne of Ash, The Tidal Ledger, The Toll at Deepwater, The Trembling Spire, The Trench Collapse, The Trench Memory, The Truce-Spore, The Tutelage Doctrine, The Twin-Tier Harbor, The Unappealable Verdict, The Unbound Astrolabe, The Unbound Theorem, The Unbroken Index, The Unbroken Legion, The Uncompiled Kernel, The Unfinished Obelisk, The Unheard Choir, The Unified Canon, The Uninvited Geometry, The Unmapped Axiom, The Unmarked Flotilla, The Unmasked Chorus, The Unproven Drive, The Unraveling Chord, The Unseen Bastion, The Unsheathed Truce, The Unspoken Oath, The Unsung Current, The Unsung Reef, The Unyielding Avalanche, The Velvet Hegemony, The Velvet Strikes, The Velvet Surrender, The Velvet Tide, The Warm Ridge, The Warm-Blooded Captives, The Warm-Current Dispute, The Whispered Variable, The Whispering Threshold, The Zero-G Tide-Singers, Twilight of the Founders, Unthinking Granite, Uprising on the Lien-World, Voice of the Iron Ranks, Voices from the Drift Ark, Wings Over the Corona
