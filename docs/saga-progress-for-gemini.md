# Race sagas: progress list for Gemini (updated 2026-11-27 21:25)

Read this before writing. It is the up-to-date list of what is DONE.

## ⚠ Only these race ids exist

humans, vossari, kethrak, ashkari, lumen, thraal, seraphine, orrun, nyx, velari, drovani, gorrath, ixil, verdane, quorai, raxxan, ruuvak, tarkhan. **There is no 'mekkhar', 'terran', 'krell', 'aelori', 'voss', 'zynth' or 'drakari'**: don't invent races, and don't write an index file (Claude 2 does that).

## Done (16 of 18): do NOT write these again

humans, vossari, kethrak, ashkari, lumen, thraal, seraphine, orrun, nyx, velari, drovani, gorrath, ixil, verdane, quorai, raxxan

## Still to write (2)

1. **ruuvak** (Ruuvak Brood: breeders, steppe homeworld; see races.ts and their storyline)
2. **tarkhan** (Tarkhan Hunt: gunners, arid homeworld; see races.ts and their storyline)
3. then the **12 crossovers** in `src/engine/data/sagas/crossovers.ts` (one `BEATS` array, `kind: "crossover"`, `withRace` set, ids `saga-x-<raceA>-<raceB>-<name>`, `raceId` = the race whose saga it appears in).

## Endings: use the outcomes nobody has used

| Outcome | Used |
|---|---|
| goldenAge | 16 |
| everyoneFearsUs | 14 |
| rivalBecomesAlly | 13 |
| civilWar | 7 |
| councilFavour | 4 |
| ascension | 4 |
| greatWorkSurge | 3 |
| exodus | 3 |
| legendFleet | 0 |
| fallFromGrace | 0 |

**ruuvak and tarkhan must each use `legendFleet` or `fallFromGrace`** (never used yet), plus one of `exodus`/`ascension`/`councilFavour`. Avoid `goldenAge` as the fallback this time: use another outcome for the fallback.

## Story ideas that are now worn out: do NOT use any of these again

The last five races (gorrath, ixil, verdane, quorai, raxxan) all reused the same skeleton. These are banned for the remaining races:

- a disease/blight at the start where the {rival} offers a cure that later turns out to be a trap
- a friendly space creature that you follow, tame, dissect or release
- a child or young prodigy who breaks the rules
- a gift from the {rival} with a hidden spy device, which you then reverse to trap their fleet (and capture 3 hulls)
- an AI or machine mind born by accident
- a festival that goes wrong
- a sibling, twin, nephew or brother of a leader who betrays us
- the last survivors of a dying ancient race offering their archive
- a war hero who wants to be crowned for life
- artists or a play mocking the elders
- a moon cracking and falling
- plus everything from earlier lists: captives, refugees, duels, leaked secrets, relics under the capital, mind-uploads, trade tolls, pirates' protection money, outer colony refusing orders

Fresh ground for ruuvak (breeders) and tarkhan (gunners): a sacred hunt gone wrong; a breeding program that produces something unexpected; a weapon that thinks; an honour code tested by a famous prey; a herd migration that crosses a border; an arms race with a neighbour; a hunting ground claimed by two empires; a legendary beast returning after a thousand years; a ceasefire hunt; a gun-maker's last masterpiece; a mother-queen choosing her heir; a famine that tests the brood; a prophecy about the last hunt.

## Rules reminder

- Ideas only, no names from other works (we've had to rename "Unification Wars", "Prime Directive", "The Cold Equation"; avoid famous fantasy names like Thrain).
- No `{star}`, `{colony}` or `{rival}` in titles.
- Every flag you set should be needed by a branch or an ending; every `needs` flag must be set earlier.
- Culture effects at most 240, money 450, research 600 (act 4 and endings included).
- Never two effects of the same kind in one choice.
- Copy the format of `humans.ts` exactly. End every reply with END OF REPLY.

## Titles already used (don't reuse)

Anvils of the Vanquished, Ash on the Canopy Moon, Ashes of the Cinder-Kin, Ballads in Living Bark, Beyond the Outer Ring, Blood and Water, Blood of the Slain Legate, Boardroom Mutiny, Bounty of the Dying Ark, Bridge Across the Void, Bridge of Starlight and Clay, Casks of Sun-Nectar, Children of the Reef Trust, Children of the White Corona, Choir of Luminous Moss, Choir of the Solar Wind, Collapse of Slag-Rock Seven, Contraband in the Chord, Cradle of Ash, Cutlass in the Ledger, Dampening in the Photosphere, Debt of the Deep, Divergent Telemetry, Drifter in the Phase-Wake, Echoes of Wiped Nodes, Echoes of the Backroom Pact, Embers of a White Dwarf, Essence of the High Steppe, Fall of the Dark Companion, Festival of the Seven Flares, Frost-Moon Falling, Greening the Red Dunes, Kin of the Shared Fire, Larvae in the Border Dust, Lenses of the Red Basin, Memory of the Deep Root, Mutiny of the Black Flag, Night of the Crimson Nectar, One Pulse Across the Stars, Pearls of Shared Vision, Pilgrims of the Phase-Wake, Reef of Living Memory, Resin for Glass, Rime-Rot in the Hold, Sap in the Cipher, Seats on the High Floor, Shadow Over the Solarium, Shanties of the Hollow Hull, Shells of Living Steel, Shelter of Shared Shade, Stewards of Sentience, Strangers on the Atoll, Suns of Unforgiving Fire, Swords for Silver, Symphony of Two Suns, Teachers of the Thousand Suns, Tears of the Jungle Moon, Terror of the Black Tunnels, The Albino Matriarch, The Algorithmic Bench, The Ash-Plain Claim, The Backchannel Protocol, The Bilge-Box Ghost, The Bitter Draught, The Black-Glass Relic, The Blind Navigator, The Blinding Crown, The Blood-Coin Ledger, The Blood-Debt, The Blue Marble Mandate, The Boiling Choir, The Box-Hulled Envoys, The Brass Sextant, The Breath-Domes, The Bridge of Stars, The Brimful Vault, The Brine-Lock Rift, The Broken Axiom, The Call of the Dry Stars, The Cascade Theorem, The Celestial Accord, The Celestial Tuning Fork, The Century Kiln, The Cinder-Caste, The Citadel Dome, The Clockwork Sovereign, The Cold Observatory, The Cold-Coil Tether, The Compassion Loop, The Coolant Tithe, The Cooling Rebellion, The Copper Rust, The Copper Symbiote, The Coral Guests, The Cornerstone Alliance, The Corsair Syndicate, The Counter-Proof, The Creator Override, The Crimson Scrimshaw, The Crimson Shadow, The Crown of Cloud, The Crown of Glass, The Crown of Thorns, The Crude Equation, The Crushing Depth, The Cursed Hulk, The Dead-End Haul, The Deep Resonance, The Deep-Trench Dividend, The Deep-Void Seed, The Dim-Star Uprising, The Dim-Sun Evangel, The Diplomatic Cipher, The Dispossessed Choir, The Dissonant Shore, The Drift-Lord's Return, The Dual-Chord Bridge, The Dust-Lung Petition, The Endless Current, The Endless Hunger, The Enduring Charter, The Eternal Drift, The Eternal Summer, The Eternal Tide-Guild, The Etiquette of Equals, The Exile Ballads, The Exponential Queue, The Fading Husk-Fleet, The Fallen Plume, The Fault-Line Schism, The Final Axiom, The Final Chord, The Final Tide, The First Boulder, The Floating Pier, The Forge-Beast's Brood, The Fractured Chorus, The Free-Miner Tariff, The Free-Port Confederacy, The Frost-Back Wanderer, The Galactic Nuptial Flight, The Gate-Toll Petition, The Genesis Tide, The Geneva Dossier, The Ghost Ducat, The Gilded Deficit, The Gilded Panic, The Glass Cisterns, The Glass Mesas, The Glowing Veterans, The Golden Reckoning, The Golden Wing, The Grand Bourse, The Grey Spores, The Grounded Cohort, The Grudge-Wall, The Guild of Golden Gears, The Harbor of All Waters, The Harmonic Grid, The Harmonious Canopy, The Hearth-Seer's Warning, The Heavy Shell, The Hollowing, The Hull-Eater, The Ice-Shell Sanctum, The Intuitive Heresy, The Iron Bourse, The Iron Calculus, The Iron Cutlass Throne, The Iron Wanderer, The Iron Winter, The Iron-Crest Armada, The Joint Observatory, The Kelp-Draped Anvils, The Kinsman's Ledger, The Last Autumn Fleet, The Last Keel-Song, The Leviathan Drift, The Lighthouse, The Living Banner, The Living Mantle, The Living Synthesis, The Living Theorem, The Logic Virus, The Luminous Tide, The Magneto-Leviathan, The Makers' Last Cradle, The Matrioshka Array, The Meat-Logic Paradox, The Mimic Beacon, The Mirror Choir, The Mirror Spore, The Mixed-Steel Crucible, The Mocking Aurora, The Mute Workers, The Neural Index, The Neutral Buoy, The One-Spine Mandate, The Open Covenant, The Open Harbor, The Open Monograph, The Open-Hatch Creed, The Outer Beacon Charter, The Parasite Bloom, The Patient Garden, The Pearl Standard, The Pebble Fleet, The Phantom Armada, The Phantom Corona, The Phase Current, The Plumed Prototype, The Poisoned Playbook, The Prismatic Veil, The Purchased Bench, The Quiet Severance, The Quiet Shore, The Radiant Cocoon, The Radiant Convergence, The Radiant Sea, The Red Horizon, The Red-Dune Challenge, The Red-Ice Solstice, The Red-Sand Vigil, The Red-Tide Surge, The Reef-Market Strike, The Refracted Oath, The Resonant Crown, The Returned Blade, The Ribbon of Wind, The Rooted Clan, The Salt-Glass Prism, The Salted Filters, The Sand-Grain Movement, The Satire of the Spires, The Scholar-Son of Red Mesa, The Second Pulse, The Second Verse, The Second Voice, The Severed Canopy, The Severed Twin, The Shared Resonance, The Shattered Covenant-Stone, The Shattered Song, The Shattered Standard, The Silent Equation, The Silent Hull in the Trench, The Silent Monolith, The Silent Vow, The Silicon Chord, The Silicon Diplomats, The Silicon Offer, The Silk Exchange, The Silver Wilt, The Singing Basalt, The Singing Deep, The Singing Marble, The Singing Reef, The Singing Shaft, The Singing Spire-Wood, The Solar Alignment, The Song of Ten Thousand Trenches, The Sovereign Foreclosure, The Sovereign Sky, The Sovereign Underwriter, The Star-Root Awakening, The Star-Sown Choir, The Starlight Current, The Stone Scale, The Strangling Briar, The Sub-Process Rebellion, The Sun-Foil Ballad, The Sun-Weaver Sprout, The Surrendered Standard, The Syndicate Crown, The Thinking Vine, The Thousand-Sun Draft, The Thriving Canopy, The Throne of Ash, The Tidal Ledger, The Toll at Deepwater, The Trembling Spire, The Trench Collapse, The Trench Memory, The Truce-Spore, The Tutelage Doctrine, The Twin-Tier Harbor, The Unappealable Verdict, The Unbonded Creed, The Unbound Astrolabe, The Unbound Horizon, The Unbound Theorem, The Unbound Trailblazer, The Unbroken Helm, The Unbroken Index, The Unbroken Legion, The Uncompiled Kernel, The Unfading Noon, The Unfinished Obelisk, The Unheard Choir, The Unified Canon, The Uninvited Geometry, The Unmapped Axiom, The Unmarked Flotilla, The Unmasked Chorus, The Unproven Drive, The Unraveling Chord, The Unseen Bastion, The Unsheathed Truce, The Unsplit Chord, The Unspoken Oath, The Unsung Current, The Unsung Reef, The Unyielding Avalanche, The Velvet Hegemony, The Velvet Strikes, The Velvet Surrender, The Velvet Tide, The Warm Ridge, The Warm-Blooded Captives, The Warm-Current Dispute, The Weld-Sickness, The Weld-Torch Regatta, The Whispered Variable, The Whispering Threshold, The White-Core Prodigy, The World-Tree Rises, The Wrench-Queen of Bay Four, The Zero-G Tide-Singers, Tribute of Warm Amber, Twilight of the Founders, Unthinking Granite, Uprising on the Lien-World, Voice of the Iron Ranks, Voices from the Drift Ark, Wings Over the Corona, Wings of Solar Pollen
