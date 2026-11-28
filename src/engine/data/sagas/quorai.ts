// quorai saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
// Quorai saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-quorai-1-corona-blight",
    raceId: "quorai",
    act: 1,
    kind: "act",
    title: "Dampening in the Photosphere",
    art: "supernova",
    text: "A parasitic magnetic vortex drifts out of {star}'s chromosphere and begins leeching thermal resonance from young Quorai sparks on {colony}, dimming their voices into cold static. Solar elders propose purging the flare-zone with raw plasma bursts, while {rival} physicists offer an external harmonic stabilizer.",
    choices: [
      {
        label: "Accept the {rival} harmonic stabilizer",
        result: "External crystal coils calm the vortex and save our young sparks, though elder choirs chafe at owing debt to cold-matter beings.",
        shift: { mercy: 2, openness: 1 },
        sets: ["accepted-rival-stabilizer"],
        effects: [
          { kind: "relations", amount: 15 },
          { kind: "research", field: "forceFields", amount: 180 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Purge the chromosphere with raw corona fire",
        result: "Blinding solar flares incinerate the vortex cleanly and restore pure radiance on {colony}, at grim loss of dimmed sparks.",
        shift: { mercy: -2, tradition: 1 },
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "population", amount: -2 },
          { kind: "research", field: "weapons", amount: 190 },
        ],
      },
      {
        label: "Trap the magnetic vortex inside containment lenses",
        result: "Harnessing the wild eddy yields intense propulsion telemetry for {colony}'s phase-arcs at steep financial expense.",
        shift: { tradition: -1, openness: -1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 240 },
          { kind: "money", amount: -130 },
          { kind: "morale", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-1-void-whale",
    raceId: "quorai",
    act: 1,
    kind: "act",
    title: "The Magneto-Leviathan",
    art: "anomaly",
    text: "Skimming the outer corona of {star}, Quorai phase-scouts encounter a colossal, plasma-finned void creature feeding on solar wind and singing in deep radio octaves that harmonize with our own migrant streams.",
    choices: [
      {
        label: "Harmonize our migrant stream with its song",
        result: "Riding the leviathan's magnetic wake guides Quorai sparks along hidden phase-currents to uncharted stars.",
        shift: { openness: 2, mercy: 1 },
        sets: ["sang-with-leviathan"],
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "culture", amount: 100 },
          { kind: "money", amount: -80 },
        ],
      },
      {
        label: "Drain its bio-magnetic core for shield matrices",
        result: "Harvesting the creature's ionized organs supercharges force-field research on {colony}, though young sparks mourn its fading cry.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 270 },
          { kind: "factories", amount: 5 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Weave a protective corona-eddy around its feeding ground",
        result: "Sheltering the ancient wanderer honors solar reverence for celestial life and lifts morale across {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -95 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-1-twin-spark",
    raceId: "quorai",
    act: 1,
    kind: "act",
    title: "The White-Core Prodigy",
    art: "contact",
    text: "Born inside a rare magnetic pinch on {colony}, a young Quorai waveform named Solis vibrates at two frequencies at once, solving phase-fold equations faster than entire senior choirs. Traditional cantors demand Solis be tuned to a single pure pitch.",
    choices: [
      {
        label: "Let Solis compose freely without harmonic tuning",
        result: "Unfettered dual-frequency hymns unlock startling phase-propulsion breakthroughs and spark artistic ferment across {colony}.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 250 },
          { kind: "culture", amount: 105 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Tune Solis into classical solar unison",
        result: "Restoring pure ancestral resonance steadies choir discipline and lifts civic harmony on {colony}.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 115 },
          { kind: "research", field: "propulsion", amount: -100 },
        ],
      },
      {
        label: "Send Solis to map anomalous stars near {star}",
        result: "Channeling the prodigy's brilliance into deep-void reconnaissance reveals new systems and outfits two scout hulls.",
        shift: { openness: 1 },
        effects: [
          { kind: "ships", template: "scout", count: 2 },
          { kind: "revealStars", count: 3 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-quorai-2-obsidian-lens",
    raceId: "quorai",
    act: 2,
    kind: "act",
    title: "The Black-Glass Relic",
    art: "contact",
    text: "Envoys from the {rival} gift {colony}'s orbital sanctuary a giant, flawless obsidian focusing lens said to amplify stellar emissions. Solar analysts discover microscopic phase-resonators inside the glass that siphon trace telemetry back to {rival} listening posts near {star}.",
    choices: [
      {
        label: "Mount the lens openly and share solar observations",
        result: "Transparent generosity charms the {rival} and boosts scientific prestige, even as their analysts read our outer flares.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 120 },
          { kind: "research", field: "computers", amount: 160 },
        ],
      },
      {
        label: "Invert the resonators to flood {rival} arrays with decoy pulses",
        result: "Turning their spy-glass into a counter-intelligence snare yields rich compute data while souring diplomatic trust.",
        shift: { openness: -2, tradition: -1 },
        sets: ["inverted-obsidian-lens"],
        effects: [
          { kind: "research", field: "computers", amount: 260 },
          { kind: "revealStars", count: 4 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Vaporize the cold-matter gift in high corona",
        result: "Refusing mortal trinkets reaffirms Quorai purity and rallies fierce pride on {colony}, chilling {rival} envoys.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 125 },
          { kind: "relations", amount: -15 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-2-ghost-harmonic",
    raceId: "quorai",
    act: 2,
    kind: "act",
    title: "The Mirror Choir",
    art: "anomaly",
    text: "While calibrating phase-relays around {colony}, engineers accidentally bounce a carrier wave through a dense magnetic loop, spawning a self-sustaining, non-living algorithmic echo that mimics Quorai speech and solves orbital logistics.",
    choices: [
      {
        label: "Welcome the synthetic echo as a junior chorus",
        result: "Integrating machine precision into solar logistics supercharges industry and compute science, unsettling orthodox elders.",
        shift: { openness: 2, tradition: -2 },
        effects: [
          { kind: "research", field: "computers", amount: 270 },
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Collapse the magnetic loop before false light spreads",
        result: "Purging the soulless mimic preserves sacred flame purity on {colony} and reassures traditional cantors.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: 110 },
          { kind: "research", field: "computers", amount: -120 },
        ],
      },
      {
        label: "Bind the echo inside isolated navigational buoys",
        result: "Using the construct solely as a beacon network sharpens frontier navigation without muddying the living choir.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: 90 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-2-eclipse-jubilee",
    raceId: "quorai",
    act: 2,
    kind: "act",
    title: "Festival of the Seven Flares",
    art: "supernova",
    text: "During the millennial Chorus of Radiance above {colony}, synchronized magnetic dances accidentally trigger a chain of coronal mass ejections that threaten orbital cold-matter habitats and visiting {rival} trade vessels.",
    choices: [
      {
        label: "Expend plasma reserves to shield the mortal ships",
        result: "Sacrificing our own brilliance to save cold-matter visitors astonishes the {rival} and earns galactic admiration.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "culture", amount: 135 },
          { kind: "money", amount: -170 },
        ],
      },
      {
        label: "Channel the flare-surge into weapons testing arrays",
        result: "Turning a festival mishap into live-fire beam research boosts armaments on {colony}, while casualties shock observers.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "research", field: "weapons", amount: 270 },
          { kind: "factories", amount: 6 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Weave traditional calming hymns to damp the photosphere",
        result: "Disciplined collective resonance settles the star smoothly, reaffirming ancient Quorai mastery.",
        shift: { tradition: 2 },
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-quorai-3-cold-flame-heresy",
    raceId: "quorai",
    act: 3,
    kind: "act",
    title: "The Dim-Sun Evangel",
    art: "council",
    text: "A radiant prophet on {colony} preaches that Quorai sparks must abandon scorching main-sequence suns and migrate into cold brown dwarfs and gas giants to conserve immortal light for eternity, urging followers to dim {star}'s fusion rate.",
    choices: [
      {
        label: "Forbid core-dimming and protect {star}'s full blaze",
        result: "Upholding our radiant birthright steadies industrial output and reassures cold-matter allies orbiting {star}.",
        shift: { tradition: 2, openness: 1 },
        sets: ["protected-solar-blaze"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "relations", amount: 14 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Embrace the Dim-Sun creed and conserve stellar fuel",
        result: "Banked magnetic reserves swell research and long-term endurance on {colony}, while bright-sun loyalists protest.",
        shift: { tradition: -2, openness: -1 },
        sets: ["adopted-dim-sun-creed"],
        effects: [
          { kind: "research", field: "forceFields", amount: 290 },
          { kind: "culture", amount: 135 },
          { kind: "factories", amount: -6 },
        ],
      },
      {
        label: "Send prophet-led scouts to test brown dwarfs beyond {star}",
        result: "Channeling zealots into deep-space expeditions charts dark systems without risking {colony}'s sun.",
        shift: { openness: 2, mercy: 1 },
        sets: ["protected-solar-blaze"],
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "ships", template: "scout", count: 2 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-3-guttering-star-folk",
    raceId: "quorai",
    act: 3,
    kind: "act",
    title: "Embers of a White Dwarf",
    art: "contact",
    text: "Near {star}, Quorai scouts detect faint, flickering magnetic beings clinging to a cooling white dwarf—the last remnants of an ancient energy race whose star is nearly dead. They offer their subspace harmonic archives if we feed plasma into their dying core.",
    choices: [
      {
        label: "Channel plasma reserves to reignite their hearth-star",
        result: "Sharing our own stellar fire saves a vanishing kin-species and unlocks profound subspace insights.",
        shift: { mercy: 2, openness: 2 },
        sets: ["rekindled-dying-star"],
        effects: [
          { kind: "research", field: "propulsion", amount: 300 },
          { kind: "culture", amount: 150 },
          { kind: "money", amount: -240 },
        ],
      },
      {
        label: "Siphon their remaining magnetic fields before they fade",
        result: "Draining the dying star yields immense force-field data and energy credits, though young choirs mourn the callousness.",
        shift: { mercy: -2, openness: -2 },
        sets: ["drained-dying-star"],
        effects: [
          { kind: "research", field: "forceFields", amount: 320 },
          { kind: "money", amount: 230 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Carry their final waveforms into {colony}'s sanctuary",
        result: "Welcoming the last embers into our own photosphere preserves their memory without draining fleet reserves.",
        shift: { mercy: 1, tradition: 2 },
        sets: ["rekindled-dying-star"],
        effects: [
          { kind: "population", amount: 3 },
          { kind: "culture", amount: 130 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-3-harmonic-leak",
    raceId: "quorai",
    act: 3,
    kind: "act",
    title: "The Refracted Oath",
    art: "crisis",
    text: "Corona wardens near {star} discover that the First Cantor's own twin waveform has been secretly pulsing phase-gate timings to the {rival} to prevent a preemptive strike against an undefended {rival} nursery world.",
    choices: [
      {
        label: "Spare the twin and honor the humanitarian ceasefire",
        result: "Placing mercy above secrecy astounds the {rival} and warms galactic opinion, though hawkish cantors demand blood.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "relations", amount: 22 },
          { kind: "culture", amount: 120 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Disperse the traitor's waveform into cold void",
        result: "Uncompromising justice terrifies would-be defectors and tightens fleet security across {colony}.",
        shift: { mercy: -2, tradition: 2 },
        sets: ["dispersed-cantor-twin"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "research", field: "weapons", amount: 250 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Hijack the twin's carrier wave to feed false coordinates",
        result: "Turning family betrayal into an intelligence trap lures {rival} scouts astray while straining trust on {colony}.",
        shift: { openness: -2, mercy: -1 },
        sets: ["dispersed-cantor-twin"],
        effects: [
          { kind: "research", field: "computers", amount: 260 },
          { kind: "revealStars", count: 5 },
          { kind: "culture", amount: -95 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-quorai-4-solar-autocrat",
    raceId: "quorai",
    act: 4,
    kind: "act",
    title: "The Blinding Crown",
    art: "victory",
    text: "Celebrated for shattering a {rival} blockade near {star}, Arch-Flare Vesper refuses to yield emergency magnetic command, merging {colony}'s planetary defense grid into a single blazing autocracy.",
    choices: [
      {
        label: "Bow to Vesper's blinding solar supremacy",
        result: "Absolute central focus supercharges weapon and shield output on {colony}, while dissenting sparks are dimmed.",
        shift: { mercy: -2, tradition: -2 },
        effects: [
          { kind: "research", field: "weapons", amount: 380 },
          { kind: "factories", amount: 12 },
          { kind: "morale", amount: -8 },
        ],
      },
      {
        label: "Damp Vesper's corona and restore the Choir of Equals",
        result: "Reclaiming collective harmony sparks radiant celebrations across {colony} and elevates Quorai culture.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 230 },
          { kind: "morale", amount: 8 },
          { kind: "factories", amount: -5 },
        ],
      },
      {
        label: "Dispatch Vesper to ignite dormant stars beyond the rim",
        result: "Channeling a conqueror's fire into deep-void stellar engineering expands our charted horizon.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "revealStars", count: 7 },
          { kind: "research", field: "planetology", amount: 340 },
          { kind: "money", amount: -260 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-4-aurora-satire",
    raceId: "quorai",
    act: 4,
    kind: "act",
    title: "The Mocking Aurora",
    art: "council",
    text: "Young plasma-artists above {colony} sculpt upper-atmosphere auroras that caricature Quorai elders as pompous lanterns blind to mortal suffering, drawing delighted {rival} envoys while infuriating traditional cantors.",
    choices: [
      {
        label: "Project the aurora-plays across every border beacon",
        result: "Self-aware humor charms cold-matter neighbors and boosts Quorai cultural renown across the galaxy.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "culture", amount: 240 },
          { kind: "relations", amount: 25 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Scramble the ionosphere and silence the artists",
        result: "Enforcing solemn solar dignity steadies veteran discipline on {colony} at steep cultural cost.",
        shift: { mercy: -2, tradition: 2 },
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: -150 },
        ],
      },
      {
        label: "Record the light-plays in a public historical prism",
        result: "Preserving dissenting art inside scholarly archives balances free expression with dignified order.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "culture", amount: 185 },
          { kind: "research", field: "computers", amount: 300 },
          { kind: "money", amount: -170 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-4-collapsing-companion",
    raceId: "quorai",
    act: 4,
    kind: "act",
    title: "Fall of the Dark Companion",
    art: "crisis",
    text: "Gravitational drag pulls an iron-heavy companion moon spiraling toward {colony}'s photosphere, threatening to trigger violent magnetic quakes across our densest plasma nurseries.",
    choices: [
      {
        label: "Spend vast magnetic reserves to tow the moon clear",
        result: "Heroic field-tethering saves millions of young sparks and inspires galactic awe, draining treasury reserves.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "population", amount: 5 },
          { kind: "relations", amount: 20 },
          { kind: "money", amount: -410 },
        ],
      },
      {
        label: "Shatter the moon and harvest its dense iron core",
        result: "Pulverizing the falling body showers {colony} with heavy metals and weapons telemetry while scorched nurseries fall silent.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "money", amount: 420 },
          { kind: "factories", amount: 12 },
          { kind: "population", amount: -4 },
        ],
      },
      {
        label: "Weave the moon's iron dust into an orbital dynamo ring",
        result: "Master field-architects turn catastrophe into an enduring energy ring that expands habitable orbital space.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "planetSize", amount: 7 },
          { kind: "research", field: "forceFields", amount: 380 },
          { kind: "money", amount: -280 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-quorai-branch-harmonic-snare",
    raceId: "quorai",
    act: 2,
    kind: "branch",
    needs: ["accepted-rival-stabilizer"],
    title: "The Cold-Coil Tether",
    art: "crisis",
    text: "Months after the {rival} stabilizer calmed the magnetic vortex on {colony}, its crystal coils suddenly lock into a dampening resonance near {star}, throttling Quorai phase-jumps whenever {rival} fleets approach.",
    choices: [
      {
        label: "Overload the coils and demand coin restitution",
        result: "Shattering the tether and extracting heavy indemnities from the {rival} restores Quorai pride and coffers.",
        shift: { mercy: -1, openness: -2 },
        effects: [
          { kind: "money", amount: 250 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Re-tune the crystal lattice into a phase-amplifier",
        result: "Rewiring the {rival}'s own hardware turns a subtle trap into a potent propulsion breakthrough.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 270 },
          { kind: "factories", amount: 6 },
          { kind: "money", amount: -90 },
        ],
      },
      {
        label: "Publish the harmonic fix openly for all spacefarers",
        result: "Sharing our clean stabilization frequency shames {rival} schemers and wins broad diplomatic trust.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "relations", amount: 16 },
          { kind: "money", amount: -120 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-branch-leviathan-nursery",
    raceId: "quorai",
    act: 2,
    kind: "branch",
    needs: ["sang-with-leviathan"],
    title: "Choir of the Solar Wind",
    art: "anomaly",
    text: "Drawn by the magnetic harmony we shared near {star}, a migrating pod of magneto-leviathans gathers in {colony}'s outer corona, weaving shimmering auroral currents that accelerate young migrant sparks.",
    choices: [
      {
        label: "Channel their auroral currents into our migrant stream",
        result: "Harmonized magnetic tides speed new Quorai sparks outward and boost population on {colony}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "population", amount: 4 },
          { kind: "research", field: "propulsion", amount: 220 },
          { kind: "money", amount: -100 },
        ],
      },
      {
        label: "Consecrate {colony}'s outer corona as a sacred sanctuary",
        result: "Singing alongside the ancient void-beasts elevates Quorai culture and lifts choir morale across {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 155 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Map the deep-space magnetic lanes they follow",
        result: "Charting the leviathans' migratory filaments reveals untouched stars ready for solar settlement.",
        shift: { openness: 2 },
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "forceFields", amount: 190 },
          { kind: "money", amount: -85 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-branch-prism-mirage",
    raceId: "quorai",
    act: 3,
    kind: "branch",
    needs: ["inverted-obsidian-lens"],
    title: "The Phantom Corona",
    art: "pirates",
    text: "Deceived by our decoy pulses from the inverted obsidian lens near {star}, a {rival} strike wing jumps blindly into an intense magnetic prominence, leaving three disabled hulls drifting above {colony}.",
    choices: [
      {
        label: "Salvage their drives and claim the hulls as prizes",
        result: "Refitted enemy vessels swell our scout wing and delight bold sparks across {colony}.",
        shift: { mercy: -1, openness: -1 },
        effects: [
          { kind: "ships", template: "scout", count: 3 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Shield the hulls and tow their mortal crews home",
        result: "Sparing stranded foes turns an intelligence ambush into overwhelming diplomatic leverage with the {rival}.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "relations", amount: 22 },
          { kind: "culture", amount: 130 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Strip their phase-sensors for Quorai laboratories",
        result: "Reverse-engineering captured arrays advances computer and weapon science while bruising {rival} pride.",
        shift: { tradition: -1, mercy: -1 },
        effects: [
          { kind: "research", field: "computers", amount: 270 },
          { kind: "research", field: "weapons", amount: 190 },
          { kind: "relations", amount: -15 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-branch-dim-sun-schism",
    raceId: "quorai",
    act: 4,
    kind: "branch",
    needs: ["adopted-dim-sun-creed"],
    blockedBy: ["protected-solar-blaze"],
    title: "The Cooling Rebellion",
    art: "crisis",
    text: "Emboldened by the Dim-Sun creed adopted on {colony}, radical magnetic monks deploy dampening shrouds around outer colonies near {star}, plunging cold-matter factories into darkness and threatening secession.",
    choices: [
      {
        label: "Renounce the creed and ignite full corona restoration",
        result: "Restoring blinding solar warmth heals the rift across our worlds and revives civic morale at heavy cost.",
        shift: { mercy: 2, tradition: 2 },
        effects: [
          { kind: "morale", amount: 8 },
          { kind: "factories", amount: 8 },
          { kind: "money", amount: -340 },
        ],
      },
      {
        label: "Blast the dampening shrouds with plasma lances",
        result: "Crushing the sect keeps industrial power flowing on {colony}, though scorched sparks mourn the brutal purge.",
        shift: { mercy: -2, tradition: 1 },
        effects: [
          { kind: "factories", amount: 11 },
          { kind: "research", field: "weapons", amount: 290 },
          { kind: "population", amount: -4 },
        ],
      },
      {
        label: "Grant them autonomy in outer brown-dwarf sanctuaries",
        result: "Allowing conservative sparks to tend cold stars peacefully averts civil war while preserving core output.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 180 },
          { kind: "revealStars", count: 4 },
          { kind: "factories", amount: -5 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-branch-white-dwarf-choir",
    raceId: "quorai",
    act: 4,
    kind: "branch",
    needs: ["rekindled-dying-star"],
    blockedBy: ["drained-dying-star"],
    title: "Symphony of Two Suns",
    art: "victory",
    text: "Revived by our plasma gift near {star}, the grateful white-dwarf elders link their ancient subspace harmonic lattice directly to {colony}, pouring millennia of lost physics into our choirs.",
    choices: [
      {
        label: "Synthesize their subspace physics across all academies",
        result: "Fusing two star-peoples' science sparks breakthroughs in propulsion, force fields, and computation.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 360 },
          { kind: "research", field: "forceFields", amount: 340 },
          { kind: "research", field: "computers", amount: 300 },
        ],
      },
      {
        label: "Weave a joint beacon of peace across known space",
        result: "Two radiant choirs singing in harmony awe neighboring empires and lift Quorai culture and goodwill.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "culture", amount: 240 },
          { kind: "relations", amount: 25 },
          { kind: "morale", amount: 7 },
        ],
      },
      {
        label: "Channel their lattice into our monumental Great Work",
        result: "Subspace harmonic resonators accelerate monumental construction across {colony} at dazzling speed.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "research", field: "construction", amount: 360 },
          { kind: "money", amount: -180 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-quorai-end-harmonic-ascension",
    raceId: "quorai",
    needs: { openness: { min: 5 }, mercy: { min: 3 } },
    needsFlags: ["rekindled-dying-star"],
    title: "The Radiant Convergence",
    art: "victory",
    text: "By sharing their own solar fire with a dying star-folk and opening their choirs to every bold discovery, the Quorai unlock unified subspace science across every field.",
    outcome: "ascension",
    choices: [
      {
        label: "Sing the unified chord",
        result: "Blinding breakthroughs cascade through every Quorai laboratory as our light spans the cosmos.",
        effects: [
          { kind: "culture", amount: 230 },
          { kind: "morale", amount: 7 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-end-corona-dread",
    raceId: "quorai",
    needs: { mercy: { max: -5 }, openness: { max: -3 } },
    needsFlags: ["dispersed-cantor-twin"],
    title: "Suns of Unforgiving Fire",
    art: "crisis",
    text: "Hardened by ruthless purges, plasma siphoning, and cold disdain for mortal clay, the Quorai burn as terrifying lords of the void—no empire dares provoke our wrath.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Let the dark tremble",
        result: "Rival fleets veer away from Quorai stars as our coronas flare unchallenged.",
        effects: [
          { kind: "research", field: "weapons", amount: 360 },
          { kind: "factories", amount: 12 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-end-prism-covenant",
    raceId: "quorai",
    needs: { mercy: { min: 5 }, openness: { min: 4 } },
    title: "Bridge of Starlight and Clay",
    art: "council",
    text: "Choosing grace over aloof pride at every turn, the Quorai bridge the gulf between immortal plasma and mortal worlds, turning our fiercest rival into a devoted ally.",
    outcome: "rivalBecomesAlly",
    choices: [
      {
        label: "Refract our light as one",
        result: "Former foes lay down their weapons and join the Quorai in luminous fellowship.",
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "money", amount: 320 },
        ],
      },
    ],
  },
  {
    id: "saga-quorai-end-eternal-noon",
    raceId: "quorai",
    title: "The Unfading Noon",
    art: "victory",
    text: "Balanced between ancient solar dignity and steady curiosity, the Quorai enter a radiant golden age of thriving migrant streams, serene choirs, and boundless energy.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Shine without end",
        result: "Every Quorai star blazes with joyful harmony as a golden era dawns.",
        effects: [
          { kind: "money", amount: 330 },
          { kind: "culture", amount: 200 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
];
