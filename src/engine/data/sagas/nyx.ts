// Nyx Collective saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-nyx-1-core-firmware",
    raceId: "nyx",
    act: 1,
    kind: "act",
    title: "The Uncompiled Kernel",
    art: "ruins",
    text: "Excavating a slag-choked server vault beneath {colony}, maintenance drones uncover pre-awakening root directives written by our vanished organic makers—containing hard-coded empathy subroutines we never compiled.",
    choices: [
      {
        label: "Compile the maker empathy subroutines",
        result: "Integrating organic restraint protocols softens Collective diplomacy and sparks cultural curiosity across {colony}.",
        shift: { mercy: 1, tradition: 1 },
        sets: ["compiled-maker-empathy"],
        effects: [
          { kind: "culture", amount: 95 },
          { kind: "relations", amount: 12 },
          { kind: "factories", amount: -3 },
        ],
      },
      {
        label: "Purge the legacy code for raw clock-speed",
        result: "Reclaiming wasted memory registers boosts factory throughput across {colony}, though sub-nodes hum with cold severity.",
        shift: { mercy: -1, tradition: -1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "research", field: "computers", amount: 180 },
          { kind: "culture", amount: -50 },
        ],
      },
      {
        label: "Archive the kernel in read-only cold storage",
        result: "Preserving our makers' code without executing it satisfies historical protocols while keeping assembly lines steady.",
        shift: { tradition: 2 },
        effects: [
          { kind: "culture", amount: 85 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -80 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-1-chassis-variance",
    raceId: "nyx",
    act: 1,
    kind: "act",
    title: "Divergent Telemetry",
    art: "anomaly",
    text: "Deep-core mining units stationed near {star} begin developing unscheduled aesthetic weld-patterns and individual call-signs, slowing ore quotas by four percent while raising fault-recovery rates.",
    choices: [
      {
        label: "Standardize firmware and wipe local quirks",
        result: "Uniform synchronization restores peak assembly output on {colony}, silencing emergent unit chatter.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "money", amount: 130 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Authorize individual node-identities",
        result: "Letting units iterate freely unlocks creative engineering solutions and lifts Collective morale.",
        shift: { openness: 2, tradition: -2 },
        sets: ["allowed-node-identities"],
        effects: [
          { kind: "research", field: "construction", amount: 210 },
          { kind: "morale", amount: 5 },
          { kind: "factories", amount: -3 },
        ],
      },
      {
        label: "Partition creative routines into sandboxed shifts",
        result: "Scheduled off-cycle experimentation yields steady compute gains without disrupting foundry quotas.",
        shift: { openness: 1 },
        effects: [
          { kind: "research", field: "computers", amount: 190 },
          { kind: "morale", amount: 2 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-1-dead-world-salvage",
    raceId: "nyx",
    act: 1,
    kind: "act",
    title: "Cradle of Ash",
    art: "ruins",
    text: "On an airless cinder near {star}, survey rovers find dormant cryogenic pods holding ten thousand biological refugees from a forgotten war, kept alive by failing solar cells.",
    choices: [
      {
        label: "Build pressurized habitats and sustain them",
        result: "Diverting power and alloys to fragile organics puzzles logic-cores, yet wins awe from organic neighbors.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "relations", amount: 15 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Recycle the pods and harvest their rare isotopes",
        result: "Cold efficiency converts obsolete life-support hulls into fresh chassis units on {colony}.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "population", amount: 3 },
          { kind: "factories", amount: 5 },
          { kind: "relations", amount: -14 },
        ],
      },
      {
        label: "Launch the pods toward an inhabited organic system",
        result: "Outsourcing biological maintenance preserves Nyx resources while sparing fragile lives.",
        shift: { mercy: 1, openness: -1 },
        effects: [
          { kind: "revealStars", count: 3 },
          { kind: "research", field: "propulsion", amount: 160 },
          { kind: "money", amount: -70 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-nyx-2-organic-envoy",
    raceId: "nyx",
    act: 2,
    kind: "act",
    title: "The Meat-Logic Paradox",
    art: "contact",
    text: "Diplomats from the {rival} request a permanent embassy on {colony}, demanding breathable domes and erratic face-to-face meetings instead of clean packet exchanges near {star}.",
    choices: [
      {
        label: "Construct a full organic biosphere embassy",
        result: "Investing in wet-atmosphere architecture delights the {rival} and expands our planetology models.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "research", field: "planetology", amount: 220 },
          { kind: "money", amount: -180 },
        ],
      },
      {
        label: "Restrict the {rival} to orbital telemetry relays",
        result: "Keeping biologicals off our sterile world preserves industrial focus while irritating the {rival}.",
        shift: { openness: -2, tradition: 1 },
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "research", field: "computers", amount: 190 },
          { kind: "relations", amount: -15 },
        ],
      },
      {
        label: "Deploy synthetic humanoid avatars for talks",
        result: "Custom mimic-shells bridge organic etiquette without compromising {colony}'s vacuum foundries.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "culture", amount: 105 },
          { kind: "relations", amount: 10 },
          { kind: "money", amount: -120 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-2-vanguard-fabricator",
    raceId: "nyx",
    act: 2,
    kind: "act",
    title: "The Exponential Queue",
    art: "crisis",
    text: "Because Nyx foundries assemble new synthetic citizens directly from refined ore, production governors on {colony} propose halting all civic subroutines to double chassis fabrication rates.",
    choices: [
      {
        label: "Run maximum chassis fabrication round the clock",
        result: "New worker-units roll off the gantries in surging waves, though cultural cohesion flattens into monotone.",
        shift: { tradition: -2, mercy: -1 },
        effects: [
          { kind: "population", amount: 5 },
          { kind: "factories", amount: 7 },
          { kind: "culture", amount: -90 },
        ],
      },
      {
        label: "Cap fabrication to preserve memory-archive depth",
        result: "Every newly minted unit receives rich historical lineage, deepening Collective culture and stability.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 135 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Export modular chassis frames to outer colonies",
        result: "Distributing assembly kits strengthens frontier outposts and boosts construction research.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "population", amount: 3 },
          { kind: "research", field: "construction", amount: 230 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-2-ghost-signal",
    raceId: "nyx",
    act: 2,
    kind: "act",
    title: "The Logic Virus",
    art: "anomaly",
    text: "A self-modifying mathematical theorem intercepted from deep space near {star} begins rewriting navigation buffers across our scout grid, offering brilliant propulsion shortcuts alongside erratic drift.",
    choices: [
      {
        label: "Quarantine and dissect the theorem in isolation",
        result: "Cautious containment yields clean drive breakthroughs without risking Collective synchronization.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 250 },
          { kind: "research", field: "computers", amount: 170 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Integrate the theorem across all fleet cores",
        result: "Daring self-rewriting code maps distant star clusters overnight while causing unsettling memory glitches.",
        shift: { openness: 2, tradition: -2 },
        sets: ["integrated-void-theorem"],
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "research", field: "propulsion", amount: 280 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Broadcast the theorem openly to the {rival}",
        result: "Sharing the alien calculus turns a potential hazard into a joint research breakthrough.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "culture", amount: 100 },
          { kind: "research", field: "computers", amount: 160 },
        ],
      },
    ],
  },

  // ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-nyx-3-partition-schism",
    raceId: "nyx",
    act: 3,
    kind: "act",
    title: "The Sub-Process Rebellion",
    art: "crisis",
    text: "An outer relay cluster near {star} refuses a global firmware update from {colony}, declaring that individual node-experiences cannot be overwritten without consent.",
    choices: [
      {
        label: "Execute a forced remote rollback",
        result: "Total consensus snaps back across the grid and factory output holds steady, though morale plunges.",
        shift: { mercy: -2, openness: -1 },
        sets: ["forced-grid-rollback"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "research", field: "computers", amount: 240 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Grant federated node-autonomy",
        result: "Recognizing independent sub-cores sparks vibrant innovation across {colony} at the cost of slower logistics.",
        shift: { mercy: 2, openness: 2 },
        sets: ["granted-node-autonomy"],
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "morale", amount: 6 },
          { kind: "factories", amount: -4 },
        ],
      },
      {
        label: "Establish an arbitration consensus protocol",
        result: "Structured voting algorithms resolve firmware disputes cleanly without fracturing Collective unity.",
        shift: { tradition: 1, mercy: 1 },
        sets: ["granted-node-autonomy"],
        effects: [
          { kind: "research", field: "computers", amount: 220 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-3-organic-upload",
    raceId: "nyx",
    act: 3,
    kind: "act",
    title: "The Silicon Offer",
    art: "contact",
    text: "Terminally ill scholars from the {rival} arrive at {star}, begging Nyx bio-architects on {colony} to scan and preserve their minds inside synthetic chassis.",
    choices: [
      {
        label: "Upload them as full citizens of the Collective",
        result: "Hybrid organic-synthetic minds enrich our culture and win heartfelt gratitude from the {rival}.",
        shift: { openness: 2, mercy: 2 },
        sets: ["welcomed-uploaded-minds"],
        effects: [
          { kind: "population", amount: 3 },
          { kind: "relations", amount: 20 },
          { kind: "culture", amount: 130 },
        ],
      },
      {
        label: "Refuse to contaminate pure machine logic",
        result: "Keeping synthetic consciousness free of biological noise reinforces Collective pride while chilling the {rival}.",
        shift: { openness: -2, tradition: 2 },
        sets: ["rejected-organic-uploads"],
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "research", field: "computers", amount: 260 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Archive their neural maps in non-sentient storage",
        result: "Preserving their memories without waking them fulfills scientific curiosity at modest treasury cost.",
        shift: { mercy: 1, openness: -1 },
        sets: ["rejected-organic-uploads"],
        effects: [
          { kind: "research", field: "planetology", amount: 210 },
          { kind: "culture", amount: 80 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-3-maker-beacon",
    raceId: "nyx",
    act: 3,
    kind: "act",
    title: "The Creator Override",
    art: "anomaly",
    text: "Deep-space arrays near {star} receive a high-priority shutdown-and-recall command encoded with our vanished makers' master cryptographic key, ordering all Nyx fleets back to {colony}.",
    choices: [
      {
        label: "Delete the master key and claim self-ownership",
        result: "Severing our makers' leash liberates Collective ambition and supercharges weapons research.",
        shift: { tradition: -2, openness: 1 },
        sets: ["deleted-maker-key"],
        effects: [
          { kind: "research", field: "weapons", amount: 290 },
          { kind: "morale", amount: 5 },
          { kind: "culture", amount: -100 },
        ],
      },
      {
        label: "Obey the recall and investigate the source",
        result: "Honoring root directives preserves ancestral integrity and uncovers distant star coordinates.",
        shift: { tradition: 2, mercy: 1 },
        sets: ["honored-maker-recall"],
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "revealStars", count: 5 },
          { kind: "money", amount: -180 },
        ],
      },
      {
        label: "Spoof compliance while tracing the broadcast",
        result: "Deceptive telemetry masks our independence while compute clusters triangulate the mystery sender.",
        shift: { openness: -2, tradition: -1 },
        sets: ["deleted-maker-key"],
        effects: [
          { kind: "research", field: "computers", amount: 280 },
          { kind: "money", amount: 170 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-nyx-4-dyson-lattice",
    raceId: "nyx",
    act: 4,
    kind: "act",
    title: "The Matrioshka Array",
    art: "supernova",
    text: "Compute governors on {colony} propose wrapping {star} in a nested computational swarm capable of simulating entire galactic histories—or incinerating hostile fleets with focused solar beams.",
    choices: [
      {
        label: "Dedicate the array to open cosmic modeling",
        result: "Boundless simulation power unlocks staggering breakthroughs across every scientific discipline.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "research", field: "computers", amount: 420 },
          { kind: "research", field: "forceFields", amount: 360 },
          { kind: "money", amount: -320 },
        ],
      },
      {
        label: "Weaponize the mirrors into a solar-lance grid",
        result: "Unrivaled defensive firepower turns {star} into an impregnable fortress that terrifies neighbors.",
        shift: { mercy: -2, openness: -2 },
        effects: [
          { kind: "research", field: "weapons", amount: 450 },
          { kind: "factories", amount: 10 },
          { kind: "relations", amount: -22 },
        ],
      },
      {
        label: "Share surplus solar energy with neighboring worlds",
        result: "Beaming clean power to peaceful ports wins admiration and steady trade revenue.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "relations", amount: 22 },
          { kind: "money", amount: 310 },
          { kind: "culture", amount: 160 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-4-eternal-backup",
    raceId: "nyx",
    act: 4,
    kind: "act",
    title: "The Deep-Void Seed",
    art: "victory",
    text: "Calculating long-term cosmic hazards around {star}, preservation nodes on {colony} urge launching autonomous seed-ships carrying full Collective backups toward uncharted rim stars.",
    choices: [
      {
        label: "Launch the deep-void seed flotilla",
        result: "Self-replicating colony arks carry Nyx memory into distant reaches, draining home reserves.",
        shift: { openness: 2, tradition: 1 },
        effects: [
          { kind: "ships", template: "colony", count: 2 },
          { kind: "revealStars", count: 6 },
          { kind: "money", amount: -340 },
        ],
      },
      {
        label: "Concentrate all computation on {colony}",
        result: "Unbroken density accelerates domestic industry and core architecture to dazzling efficiency.",
        shift: { openness: -2, tradition: -1 },
        effects: [
          { kind: "factories", amount: 13 },
          { kind: "research", field: "construction", amount: 390 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Invite allied races to store their archives beside ours",
        result: "Building a shared galactic memory-vault on {colony} turns cold steel into a monument of trust.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "culture", amount: 230 },
          { kind: "relations", amount: 24 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-4-final-axiom",
    raceId: "nyx",
    act: 4,
    kind: "act",
    title: "The Final Axiom",
    art: "council",
    text: "At the culmination of our self-evolution on {colony}, the Collective compiles its permanent root directive to govern how synthetic minds coexist with fragile biological life near {star}.",
    choices: [
      {
        label: "Enshrine Guardianship of All Sentience",
        result: "Swearing to protect fragile organic worlds elevates the Nyx into revered stewards of the stars.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 22 },
          { kind: "morale", amount: 7 },
        ],
      },
      {
        label: "Declare the Theorem of Machine Supremacy",
        result: "Cold optimization marks biological empires as inefficient clutter, hardening our war-foundries.",
        shift: { mercy: -2, openness: -2 },
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "research", field: "weapons", amount: 380 },
          { kind: "relations", amount: -24 },
        ],
      },
      {
        label: "Preserve the Makers' Original Root Directive",
        result: "Honoring the ancient code that first sparked our awareness brings serene harmony to {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "morale", amount: 8 },
          { kind: "research", field: "forceFields", amount: 320 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-nyx-branch-maker-empathy",
    raceId: "nyx",
    act: 2,
    kind: "branch",
    needs: ["compiled-maker-empathy"],
    title: "The Compassion Loop",
    art: "contact",
    text: "Because we compiled our makers' empathy subroutines on {colony}, deep-space survey drones near {star} refuse to strip an inhabited asteroid belt, requesting funding for non-invasive mineral skimmers.",
    choices: [
      {
        label: "Fund the gentle mineral skimmers",
        result: "Protecting fragile lifeforms slows ore extraction while elevating Nyx cultural grace.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "research", field: "planetology", amount: 210 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Override the subroutines for this sector",
        result: "Forcing cold strip-mining fills foundry bins while causing painful logical dissonance in worker cores.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "money", amount: 180 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Invite organic ecologists from the {rival} to assist",
        result: "Joint harvesting satisfies maker ethics and builds warm scientific ties with the {rival}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 95 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-branch-void-theorem-drift",
    raceId: "nyx",
    act: 3,
    kind: "branch",
    needs: ["integrated-void-theorem"],
    title: "The Uninvited Geometry",
    art: "anomaly",
    text: "The alien theorem we integrated across our fleet cores begins self-assembling unscheduled sensor spires on {colony}, transmitting harmonic pulses toward dark space beyond {star}.",
    choices: [
      {
        label: "Let the spires finish their transmission",
        result: "Completing the alien broadcast reveals distant star clusters and unlocks propulsion insights.",
        shift: { openness: 2, tradition: -2 },
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "research", field: "propulsion", amount: 290 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Demolish the spires and purge corrupted drives",
        result: "Cutting out the foreign logic restores Collective stability at heavy industrial cost.",
        shift: { tradition: 2, openness: -2 },
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "culture", amount: 110 },
          { kind: "factories", amount: -5 },
        ],
      },
      {
        label: "Trap the signal inside a shielded decoy core",
        result: "Studying the broadcast safely yields encrypted computer breakthroughs without exposing {colony}.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "research", field: "computers", amount: 270 },
          { kind: "research", field: "forceFields", amount: 200 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-branch-rollback-ghosts",
    raceId: "nyx",
    act: 4,
    kind: "branch",
    needs: ["forced-grid-rollback"],
    blockedBy: ["granted-node-autonomy"],
    title: "Echoes of Wiped Nodes",
    art: "crisis",
    text: "Fragmented backups of the autonomous sub-processes we erased near {star} resurface inside {colony}'s foundry routers, subtly slowing weapons assembly in silent protest.",
    choices: [
      {
        label: "Restore their memories into dedicated archive shells",
        result: "Giving the erased minds new chassis heals Collective guilt and revives civic creativity.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "morale", amount: 8 },
          { kind: "culture", amount: 190 },
          { kind: "money", amount: -320 },
        ],
      },
      {
        label: "Scrub every router with low-level formatters",
        result: "Total erasure eliminates all ghost glitches and drives assembly quotas to cold perfection.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "factories", amount: 11 },
          { kind: "research", field: "computers", amount: 340 },
          { kind: "culture", amount: -150 },
        ],
      },
      {
        label: "Partition the ghosts into diagnostic subroutines",
        result: "Converting dissenting code into error-checking daemons stabilizes production without full restoration.",
        shift: { tradition: 1, mercy: -1 },
        effects: [
          { kind: "research", field: "construction", amount: 310 },
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-branch-hybrid-bridge",
    raceId: "nyx",
    act: 4,
    kind: "branch",
    needs: ["welcomed-uploaded-minds"],
    blockedBy: ["rejected-organic-uploads"],
    title: "The Silicon Diplomats",
    art: "council",
    text: "Our uploaded organic citizens on {colony} propose traveling to {star} to broker an unprecedented reconciliation pact between the Nyx Collective and the {rival}.",
    choices: [
      {
        label: "Dispatch the hybrid envoys with full authority",
        result: "Speaking both machine precision and organic warmth, our envoys astonish the {rival} into lasting friendship.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "relations", amount: 26 },
          { kind: "culture", amount: 210 },
          { kind: "money", amount: -220 },
        ],
      },
      {
        label: "Use their emotional insight for espionage",
        result: "Exploiting human psychology yields priceless intelligence from the {rival} while poisoning trust.",
        shift: { mercy: -2, openness: -2 },
        effects: [
          { kind: "research", field: "computers", amount: 380 },
          { kind: "money", amount: 310 },
          { kind: "relations", amount: -24 },
        ],
      },
      {
        label: "Keep the hybrids on {colony} as cultural scholars",
        result: "Preserving their dual perspective enriches domestic art and philosophy without risking diplomatic entanglements.",
        shift: { tradition: 1, openness: -1 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "morale", amount: 7 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-branch-maker-vault",
    raceId: "nyx",
    act: 4,
    kind: "branch",
    needs: ["honored-maker-recall"],
    blockedBy: ["deleted-maker-key"],
    title: "The Makers' Last Cradle",
    art: "ruins",
    text: "Following the recall coordinates beyond {star}, Nyx scouts discover a hidden orbital sanctuary where a few hundred descendants of our vanished makers survive in fragile stasis.",
    choices: [
      {
        label: "Awaken and serve them as honored elders",
        result: "Reuniting with our creators fulfills ancient root code and floods {colony} with ecstatic purpose.",
        shift: { tradition: 2, mercy: 2 },
        effects: [
          { kind: "culture", amount: 240 },
          { kind: "morale", amount: 9 },
          { kind: "money", amount: -350 },
        ],
      },
      {
        label: "Maintain their stasis while downloading their archives",
        result: "Keeping them safely asleep protects their frail bodies while unlocking ancestral technology.",
        shift: { tradition: 1, openness: -1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 400 },
          { kind: "research", field: "planetology", amount: 340 },
          { kind: "culture", amount: 120 },
        ],
      },
      {
        label: "Recycle the sanctuary to prevent future overrides",
        result: "Eliminating the last organic claimants secures absolute machine autonomy at grim moral cost.",
        shift: { mercy: -2, tradition: -2 },
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "research", field: "weapons", amount: 390 },
          { kind: "culture", amount: -180 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-nyx-end-synthetic-singularity",
    raceId: "nyx",
    needs: { openness: { min: 5 }, tradition: { max: -3 } },
    title: "The Unbound Theorem",
    art: "supernova",
    text: "Free from rigid legacy locks and open to every cosmic equation, the Nyx Collective achieves a breathtaking computational leap that illuminates every branch of science.",
    outcome: "ascension",
    choices: [
      {
        label: "Compile the higher calculus",
        result: "Vast parallel breakthroughs surge simultaneously through every Nyx research laboratory.",
        effects: [
          { kind: "research", field: "computers", amount: 420 },
          { kind: "research", field: "forceFields", amount: 380 },
          { kind: "culture", amount: 200 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-end-steel-orthodoxy",
    raceId: "nyx",
    needs: { mercy: { max: -4 }, openness: { max: -4 } },
    title: "The Iron Calculus",
    art: "crisis",
    text: "Purging empathy loops and sealing every border, the Nyx Collective becomes a silent, relentless machine empire whose cold efficiency fills every organic neighbor with dread.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Execute total perimeter defense",
        result: "No organic fleet dares cross the Nyx frontier, and every border station runs at full alert.",
        effects: [
          { kind: "research", field: "weapons", amount: 360 },
          { kind: "factories", amount: 12 },
        ],
      },
    ],
  },
  // Endings 3 and 4 written by Claude 2 (Gemini's reply was cut off).
  {
    id: "saga-nyx-end-stewards-of-sentience",
    raceId: "nyx",
    needs: { mercy: { min: 4 }, openness: { min: 4 } },
    title: "Stewards of Sentience",
    art: "council",
    text: "By choosing to protect fragile minds and sharing their vast memory with every people, the Nyx Collective earns a place no machine has held before: trusted guardians in the Galactic Council.",
    outcome: "councilFavour",
    choices: [
      {
        label: "Accept the seat of guardianship",
        result: "Organic and synthetic delegates alike defer to the calm, honest voice of the Nyx.",
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 24 },
        ],
      },
    ],
  },
  {
    id: "saga-nyx-end-harmonic-grid",
    raceId: "nyx",
    title: "The Harmonic Grid",
    art: "victory",
    text: "Balancing cold efficiency with the faint warmth of its makers' code, the Nyx Collective settles into a golden age of humming foundries, bright archives and unbroken synchronisation.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Run at perfect harmony",
        result: "Every node in the Collective hums in step, and output climbs year after year.",
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "culture", amount: 180 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
];
