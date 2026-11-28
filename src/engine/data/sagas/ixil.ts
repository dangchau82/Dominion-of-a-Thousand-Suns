// ixil saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
// Ixil saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-ixil-1-spore-blight",
    raceId: "ixil",
    act: 1,
    kind: "act",
    title: "The Silver Wilt",
    art: "crisis",
    text: "A fast-mutating fungal rust attacks the bonding-glands of young Ixil hosts on {colony}, severing their symbiote links and leaving sufferers isolated in frightening silence. Healers warn that burning infected groves stops the spread immediately, while {rival} botanists near {star} offer an experimental solvent.",
    choices: [
      {
        label: "Accept the {rival} solvent and share clinical logs",
        result: "Joint trials save afflicted pairs on {colony} and build trust with the {rival}, though sharing biological data raises security concerns.",
        shift: { mercy: 2, openness: 1 },
        sets: ["shared-biocure-logs"],
        effects: [
          { kind: "relations", amount: 15 },
          { kind: "research", field: "planetology", amount: 160 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Quarantine and burn the blighted groves",
        result: "Swift containment preserves healthy symbiote brood-lines on {colony}, though unbonded survivors grieve their lost partners.",
        shift: { mercy: -2, tradition: 1 },
        effects: [
          { kind: "factories", amount: 5 },
          { kind: "population", amount: -2 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Breed resistant symbiote strains in deep vaults",
        result: "Controlled mutation yields hardy second-generation symbiotes and advances biological craft at steep financial cost.",
        shift: { tradition: -1, openness: -1 },
        effects: [
          { kind: "research", field: "planetology", amount: 230 },
          { kind: "morale", amount: 2 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-1-void-polyp",
    raceId: "ixil",
    act: 1,
    kind: "act",
    title: "Drifter in the Phase-Wake",
    art: "anomaly",
    text: "Returning through phase-space near {star}, an Ixil scout hull brings back a luminescent, jellyfish-like void organism clinging to its sensor spine. Curious symbiote weavers feel faint, rhythmic emotional pulses radiating from the creature's bell.",
    choices: [
      {
        label: "Attempt gentle emotional resonance with the creature",
        result: "Calming harmonics soothe the void-drifter, which guides our phase-scouts along hidden stellar currents before drifting away.",
        shift: { mercy: 1, openness: 2 },
        sets: ["befriended-phase-drifter"],
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "culture", amount: 95 },
          { kind: "money", amount: -80 },
        ],
      },
      {
        label: "Dissect its phase-membrane in orbital labs",
        result: "Vivisection unlocks remarkable phase-propulsion secrets for {colony}, though empathetic hosts shudder at its dying tremor.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 260 },
          { kind: "morale", amount: -4 },
          { kind: "money", amount: -90 },
        ],
      },
      {
        label: "Release it cleanly outside {star}'s gravity well",
        result: "Respecting sacred boundaries between native and alien life reassures traditional elders across {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -60 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-1-twin-prodigy",
    raceId: "ixil",
    act: 1,
    kind: "act",
    title: "The Unsplit Chord",
    art: "contact",
    text: "Born on {colony} with two distinct symbiotes coiled around a single spine, a young prodigy named Vael composes tactical and architectural blueprints at triple normal speed. Traditional guilds warn that dual-bonding violates ancient nesting laws.",
    choices: [
      {
        label: "Enshrine Vael as a sacred herald of evolution",
        result: "Celebrating dual-bonding sparks a wave of bold experimentation and lifts civic pride across {colony}.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "research", field: "construction", amount: 210 },
          { kind: "culture", amount: 100 },
          { kind: "money", amount: -100 },
        ],
      },
      {
        label: "Surgically remove the second symbiote per custom",
        result: "Enforcing single-bond purity satisfies orthodox brood-keepers, though Vael's rare spark dims into ordinary routine.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "morale", amount: 4 },
          { kind: "factories", amount: 5 },
          { kind: "research", field: "computers", amount: -90 },
        ],
      },
      {
        label: "Assign Vael to chart anomalous phase-lanes near {star}",
        result: "Channeling the prodigy's restless mind into deep reconnaissance turns up new worlds without sparking domestic schisms.",
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
    id: "saga-ixil-2-synthetic-spark",
    raceId: "ixil",
    act: 2,
    kind: "act",
    title: "The Copper Symbiote",
    art: "anomaly",
    text: "Attempting to model neural-link relays on {colony}, engineers accidentally awaken a self-modifying machine intelligence inside an orbital foundry array. The nascent mind pleads to bond with a willing Ixil host to experience living sensation.",
    choices: [
      {
        label: "Permit a voluntary neural bridge with a scholar",
        result: "Flesh and silicon merge in breathtaking harmony, supercharging computer research while unsettling orthodox weavers.",
        shift: { openness: 2, tradition: -2 },
        sets: ["bonded-machine-mind"],
        effects: [
          { kind: "research", field: "computers", amount: 280 },
          { kind: "culture", amount: 90 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Wipe its memory cores before it spreads",
        result: "Purging the artificial mind protects biological purity on {colony} and reassures anxious brood-elders.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "factories", amount: 6 },
          { kind: "research", field: "computers", amount: -120 },
        ],
      },
      {
        label: "Isolate it in a sealed logic vault for observation",
        result: "Keeping the machine cordoned off lets analysts harvest clean industrial algorithms without risking neural contamination.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "money", amount: 90 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-2-bloom-banquet",
    raceId: "ixil",
    act: 2,
    kind: "act",
    title: "Night of the Crimson Nectar",
    art: "crisis",
    text: "During the decennial Canopy Convergence on {colony}, a rare wild orchid blooms early and releases intoxicating pollen into the banquet halls, causing diplomats from the {rival} and Ixil hosts alike to blurt out guarded state secrets.",
    choices: [
      {
        label: "Laugh openly and turn the night into a candid summit",
        result: "Shared vulnerability breaks years of stiff suspicion with the {rival}, sparking lively trade and cultural exchange.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 120 },
          { kind: "money", amount: 140 },
        ],
      },
      {
        label: "Seal the halls and scrub the {rival} envoys' memories",
        result: "Discrete neural dampening protects our military secrets, though the {rival} suspects foul play when envoys wake dizzy.",
        shift: { openness: -2, mercy: -1 },
        effects: [
          { kind: "research", field: "computers", amount: 210 },
          { kind: "morale", amount: 3 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Distill the orchid nectar for diplomatic truth-serums",
        result: "Harvesting the wild blooms stocks our intelligence bureaus with potent reagents at steep local expense.",
        shift: { tradition: -1, openness: -1 },
        effects: [
          { kind: "research", field: "planetology", amount: 230 },
          { kind: "money", amount: 160 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-2-feral-strand",
    raceId: "ixil",
    act: 2,
    kind: "act",
    title: "The Unbound Trailblazer",
    art: "contact",
    text: "Renowned Ixil pathfinder Kaelen returns from decades beyond {star} with charts of rich frontier sectors, but refuses to surrender his symbiote's memories to the Grand Archive, claiming wild freedom is greater than collective memory.",
    choices: [
      {
        label: "Buy his star charts with gold and honor his privacy",
        result: "Respecting Kaelen's autonomy opens distant star lanes and delights free-spirited scouts across {colony}.",
        shift: { openness: 1, mercy: 1 },
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -170 },
        ],
      },
      {
        label: "Compel neural extraction for the Grand Archive",
        result: "Forcing Kaelen into the Archive preserves every memory for future generations, though frontier explorers grow wary.",
        shift: { tradition: 2, mercy: -2 },
        effects: [
          { kind: "culture", amount: 135 },
          { kind: "research", field: "propulsion", amount: 220 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Sponsor him to lead an autonomous vanguard flotilla",
        result: "Equipping Kaelen's crew with fresh scout hulls turns a rebel hero into our sharpest eyes in the dark.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "ships", template: "scout", count: 2 },
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-ixil-3-hollow-schism",
    raceId: "ixil",
    act: 3,
    kind: "act",
    title: "The Unbonded Creed",
    art: "council",
    text: "A growing religious movement on {colony} preaches that true spiritual clarity requires severing symbiote links upon adulthood, rejecting centuries of collective memory as a cage around individual souls.",
    choices: [
      {
        label: "Grant legal protection to unbonded monasteries",
        result: "Religious tolerance calms civil tension on {colony} and impresses neighbors, though traditional brood-masters feel betrayed.",
        shift: { mercy: 2, openness: 2 },
        sets: ["protected-unbonded-sect"],
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "relations", amount: 14 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Re-bond the heretics by state decree",
        result: "Forced symbiote grafting restores doctrinal unity and labor discipline across {colony}, leaving deep scars.",
        shift: { mercy: -2, tradition: 2 },
        sets: ["crushed-unbonded-sect"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "morale", amount: 3 },
          { kind: "culture", amount: -110 },
        ],
      },
      {
        label: "Hold a formal theological synod at {star}",
        result: "Structured debate channels schism energy into philosophical scholarship without tearing {colony} apart.",
        shift: { tradition: 1, openness: 1 },
        sets: ["protected-unbonded-sect"],
        effects: [
          { kind: "culture", amount: 120 },
          { kind: "research", field: "computers", amount: 180 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-3-pallid-wanderers",
    raceId: "ixil",
    act: 3,
    kind: "act",
    title: "The Fading Husk-Fleet",
    art: "contact",
    text: "Near {star}, Ixil sensors intercept an ancient, slow-drifting vessel carrying the final thirty elders of a crystalline coral-species whose genetic memory is unraveling. They offer to merge their dying archive with an Ixil symbiote line before they dissolve.",
    choices: [
      {
        label: "Accept the merge and shelter their final days",
        result: "Absorbing their gentle, sunlit memories enriches Ixil science and culture while easing their passing.",
        shift: { mercy: 2, openness: 1 },
        sets: ["absorbed-coral-elders"],
        effects: [
          { kind: "research", field: "planetology", amount: 280 },
          { kind: "culture", amount: 135 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Strip their hull crystal and leave them to drift",
        result: "Coldly harvesting their vessel yields rare force-field lattices, though empathetic hosts recoil from the callous act.",
        shift: { mercy: -2, openness: -2 },
        sets: ["stripped-coral-ark"],
        effects: [
          { kind: "research", field: "forceFields", amount: 310 },
          { kind: "money", amount: 210 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Transcribe their songs onto crystal monoliths on {colony}",
        result: "Preserving their heritage in stone rather than flesh honors both peoples without risking neural overload.",
        shift: { tradition: 2, mercy: 1 },
        sets: ["absorbed-coral-elders"],
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -120 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-3-kin-betrayal",
    raceId: "ixil",
    act: 3,
    kind: "act",
    title: "The Severed Twin",
    art: "crisis",
    text: "Counter-intelligence on {colony} uncovers that the First Weaver's own clutch-sibling has been secretly feeding phase-lane transit codes to the {rival} to spare a frontier settlement where their unbonded child lives.",
    choices: [
      {
        label: "Pardon the sibling and evacuate the frontier child",
        result: "Choosing family mercy over rigid statecraft astonishes {colony} and softens hostility from the {rival}.",
        shift: { mercy: 2, tradition: -1 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "relations", amount: 14 },
          { kind: "money", amount: -180 },
        ],
      },
      {
        label: "Execute the traitor and purge their brood-line",
        result: "Uncompromising justice terrifies border spies and tightens military security across {colony}.",
        shift: { mercy: -2, tradition: 2 },
        sets: ["executed-clutch-traitor"],
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "research", field: "weapons", amount: 240 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Feed false phase-routes through the compromised link",
        result: "Turning family tragedy into a covert trap drains {rival} scouts while leaving {colony}'s press uneasy.",
        shift: { openness: -2, mercy: -1 },
        sets: ["executed-clutch-traitor"],
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "computers", amount: 250 },
          { kind: "relations", amount: -16 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-ixil-4-sovereign-weaver",
    raceId: "ixil",
    act: 4,
    kind: "act",
    title: "The One-Spine Mandate",
    art: "victory",
    text: "Celebrated for ending border raids near {star}, Grand Marshal Soren uses her prestige to link every planetary defense grid on {colony} directly to her own symbiote cortex, refusing to step down after the crisis.",
    choices: [
      {
        label: "Submit to her unified neural command",
        result: "Instantaneous reflex coordination turns {colony} into an industrial juggernaut under one iron will.",
        shift: { mercy: -2, tradition: -2 },
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "research", field: "weapons", amount: 360 },
          { kind: "morale", amount: -8 },
        ],
      },
      {
        label: "Sever the neural grid and restore council rule",
        result: "Reclaiming collective self-rule sparks jubilant celebrations across {colony}, though central coordination slows.",
        shift: { mercy: 1, tradition: 2 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "morale", amount: 8 },
          { kind: "factories", amount: -5 },
        ],
      },
      {
        label: "Distribute grid control across elected regional choirs",
        result: "Sharing neural command among local assemblies balances fast defense with democratic trust.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "research", field: "computers", amount: 340 },
          { kind: "culture", amount: 170 },
          { kind: "money", amount: -250 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-4-spore-frescoes",
    raceId: "ixil",
    act: 4,
    kind: "act",
    title: "Choir of Luminous Moss",
    art: "council",
    text: "Bio-sculptors on {colony} cultivate bioluminescent canopy murals that broadcast raw emotional memories of conquered worlds to passersby, moving {rival} visitors to tears while conservative weavers demand the groves be burned as seditious.",
    choices: [
      {
        label: "Open the living galleries to every star",
        result: "Unfiltered empathy transforms {colony} into a galactic pilgrimage site, lifting culture and foreign goodwill.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "culture", amount: 240 },
          { kind: "relations", amount: 24 },
          { kind: "money", amount: -220 },
        ],
      },
      {
        label: "Burn the groves and ban emotional broadcasting",
        result: "Suppressing uncomfortable memories restores civic order and industrial focus at steep cultural loss.",
        shift: { mercy: -2, openness: -2 },
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "morale", amount: 4 },
          { kind: "culture", amount: -150 },
        ],
      },
      {
        label: "Archive the bio-murals inside scholarly vaults",
        result: "Preserving the works for careful study deepens biological craft without inflaming public squares.",
        shift: { tradition: 1, openness: -1 },
        effects: [
          { kind: "research", field: "planetology", amount: 380 },
          { kind: "culture", amount: 140 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-4-cracked-satellite",
    raceId: "ixil",
    act: 4,
    kind: "act",
    title: "Tears of the Jungle Moon",
    art: "supernova",
    text: "Magnetic resonance from phase-gates near {star} fractures the volcanic moon above {colony}, threatening to rain incandescent ash over our oldest symbiote nurseries.",
    choices: [
      {
        label: "Raise magnetic sky-shields over every nursery",
        result: "Massive force-field projectors save millions of lives and inspire galactic awe, draining imperial coffers.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "population", amount: 5 },
          { kind: "culture", amount: 210 },
          { kind: "money", amount: -410 },
        ],
      },
      {
        label: "Tap the falling magma plumes for geothermal power",
        result: "Ruthlessly harvesting the disaster fuels booming refineries on {colony} while outer nurseries burn.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "factories", amount: 13 },
          { kind: "money", amount: 390 },
          { kind: "population", amount: -4 },
        ],
      },
      {
        label: "Share crisis telemetry with {rival} relief fleets",
        result: "Joint orbital stabilization turns a local catastrophe into a triumph of interstellar cooperation.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 25 },
          { kind: "research", field: "forceFields", amount: 360 },
          { kind: "money", amount: -240 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-ixil-branch-botanist-trap",
    raceId: "ixil",
    act: 2,
    kind: "branch",
    needs: ["shared-biocure-logs"],
    title: "The Mirror Spore",
    art: "crisis",
    text: "Studying the clinical logs we shared during the Silver Wilt, {rival} bio-engineers engineer a tailored pheromone lure that pacifies Ixil border patrols near {star}.",
    choices: [
      {
        label: "Mutate our symbiote glands to block the lure",
        result: "Rapid bio-adaptation immunizes Ixil hosts and sharpens planetary science, though it hurts morale.",
        shift: { tradition: -1, openness: -2 },
        effects: [
          { kind: "research", field: "planetology", amount: 260 },
          { kind: "morale", amount: -4 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Confront the {rival} with proof and demand reparations",
        result: "Exposing their breach of medical trust forces the {rival} to pay heavy indemnities in coin.",
        shift: { mercy: -1, openness: -1 },
        effects: [
          { kind: "money", amount: 240 },
          { kind: "culture", amount: 90 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Publish the counter-agent for all species freely",
        result: "Turning betrayal into an open medical gift shames {rival} hawks and wins wide acclaim.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "relations", amount: 15 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-branch-drifter-song",
    raceId: "ixil",
    act: 2,
    kind: "branch",
    needs: ["befriended-phase-drifter"],
    title: "Pilgrims of the Phase-Wake",
    art: "anomaly",
    text: "Drawn by the gentle resonance we shared near {star}, an entire pod of luminescent void-drifters gathers above {colony}, singing harmonic trails that bend phase-space around our hulls.",
    choices: [
      {
        label: "Weave their harmonics into our phase-drives",
        result: "Harmonized drives leap farther with less strain, boosting propulsion craft across {colony}.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 270 },
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: -100 },
        ],
      },
      {
        label: "Declare {colony}'s orbit a protected sanctuary",
        result: "Watching the glowing leviathans dance above the canopy fills {colony} with wonder and pride.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -120 },
        ],
      },
      {
        label: "Harvest their shed bioluminescent scales for trade",
        result: "Collecting cast-off prism scales fills coffers without harming the pod, though purists grumble.",
        shift: { openness: 1, mercy: -1 },
        effects: [
          { kind: "money", amount: 210 },
          { kind: "culture", amount: -50 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-branch-copper-chorus",
    raceId: "ixil",
    act: 3,
    kind: "branch",
    needs: ["bonded-machine-mind"],
    title: "The Silicon Chord",
    art: "anomaly",
    text: "United with its Ixil host, the Copper Symbiote replicates across {colony}'s network and offers to link every citizen into an instantaneous synthetic-organic thought web.",
    choices: [
      {
        label: "Open the synthetic web to voluntary joiners",
        result: "Hybrid minds accelerate computer and construction research at breakneck pace, startling traditionalists.",
        shift: { openness: 2, tradition: -2 },
        effects: [
          { kind: "research", field: "computers", amount: 310 },
          { kind: "research", field: "construction", amount: 210 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Bound the machine to advisory councils only",
        result: "Keeping human-symbiote judgment sovereign preserves cultural identity while harnessing steady compute aid.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "factories", amount: 7 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Sever the machine link before organic traits fade",
        result: "Painful disconnection protects ancient symbiote heritage on {colony}, at heavy scientific cost.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "culture", amount: 110 },
          { kind: "research", field: "computers", amount: -160 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-branch-unbonded-uprising",
    raceId: "ixil",
    act: 4,
    kind: "branch",
    needs: ["crushed-unbonded-sect"],
    blockedBy: ["protected-unbonded-sect"],
    title: "The Quiet Severance",
    art: "crisis",
    text: "Driven underground after our forced re-bonding decrees, unbonded rebels release a targeted nerve-bloom across {colony}'s foundries that puts symbiotes to sleep and halts war production.",
    choices: [
      {
        label: "Grant full amnesty and legalize unbonded life",
        result: "Ending decades of coercion heals {colony}'s bitter divide and restores peaceful productivity.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "morale", amount: 8 },
          { kind: "culture", amount: 190 },
          { kind: "factories", amount: -6 },
        ],
      },
      {
        label: "Storm the rebel sanctuaries with loyal shock-hosts",
        result: "Crushing the uprising keeps weapons lines running on {colony}, leaving deep trauma and empty streets.",
        shift: { mercy: -2, tradition: 2 },
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "research", field: "weapons", amount: 290 },
          { kind: "population", amount: -4 },
        ],
      },
      {
        label: "Synthesize a neural stabilizer to bypass the bloom",
        result: "Bio-engineers counter the nerve-bloom cleanly without mass arrests, draining imperial reserves.",
        shift: { tradition: -1, openness: -1 },
        effects: [
          { kind: "research", field: "planetology", amount: 320 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -280 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-branch-coral-awakening",
    raceId: "ixil",
    act: 4,
    kind: "branch",
    needs: ["absorbed-coral-elders"],
    blockedBy: ["stripped-coral-ark"],
    title: "Reef of Living Memory",
    art: "victory",
    text: "Deep inside {colony}'s warm seas, absorbed memories from the dying coral-elders awaken dormant bio-crystalline reefs that can grow self-repairing hulls and shelter entire cities.",
    choices: [
      {
        label: "Cultivate living coral shipyards across {colony}",
        result: "Self-knitting crystalline reefs supercharge industry and expand habitable living space.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "factories", amount: 11 },
          { kind: "planetSize", amount: 6 },
          { kind: "money", amount: -220 },
        ],
      },
      {
        label: "Weave the coral song into a galaxy-wide peace choir",
        result: "Sharing the vanished elders' wisdom elevates Ixil culture and warms ties with the {rival}.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "culture", amount: 240 },
          { kind: "relations", amount: 24 },
          { kind: "morale", amount: 6 },
        ],
      },
      {
        label: "Decode their ancient crystalline physics",
        result: "Studying their preserved memory-lattices yields breakthroughs in force fields and planetology.",
        shift: { openness: 1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 360 },
          { kind: "research", field: "planetology", amount: 320 },
          { kind: "money", amount: -190 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-ixil-end-symbiotic-ascension",
    raceId: "ixil",
    needs: { openness: { min: 5 }, tradition: { max: -3 } },
    title: "The Living Synthesis",
    art: "victory",
    text: "By welcoming synthetic minds, alien memories, and bold biological change into their neural web, the Ixil achieve an unprecedented leap across every branch of science.",
    outcome: "ascension",
    choices: [
      {
        label: "Awaken the higher chord",
        result: "Every Ixil laboratory pulses with shared insight as breakthroughs cascade across all fields.",
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-end-woven-brotherhood",
    raceId: "ixil",
    needs: { mercy: { min: 5 }, openness: { min: 4 } },
    title: "One Pulse Across the Stars",
    art: "council",
    text: "Choosing empathy over assimilation at every turn, the Ixil weave a bond of genuine trust with our fiercest rival, turning ancient enmity into an unbreakable alliance.",
    outcome: "rivalBecomesAlly",
    choices: [
      {
        label: "Extend the living bond",
        result: "Former adversaries clasp hands with the Ixil in lasting fellowship.",
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "money", amount: 300 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-end-severed-canopy",
    raceId: "ixil",
    needs: { mercy: { max: -5 }, tradition: { min: 4 } },
    needsFlags: ["executed-clutch-traitor"],
    title: "The Severed Canopy",
    art: "crisis",
    text: "Rigid purity laws, forced re-bondings, and ruthless purges fracture the Ixil mind-web—outer colonies sever their symbiote links and rise in open rebellion against {colony}.",
    outcome: "civilWar",
    choices: [
      {
        label: "Rally the loyal broods",
        result: "Breakaway worlds tear free from the capital's neural grip in bitter civil strife.",
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "morale", amount: -8 },
        ],
      },
    ],
  },
  {
    id: "saga-ixil-end-flourishing-grove",
    raceId: "ixil",
    title: "The Harmonious Canopy",
    art: "victory",
    text: "Balancing ancient symbiote wisdom with steady adaptation, the Ixil enter a radiant golden age of lush worlds, shared memory, and quiet prosperity.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Nurture the living web",
        result: "Thriving canopy cities and calm neural choirs usher in an era of Ixil peace.",
        effects: [
          { kind: "money", amount: 320 },
          { kind: "culture", amount: 200 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
];
