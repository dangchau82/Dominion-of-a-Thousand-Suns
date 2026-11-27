// vossari saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-vossari-1-blind-spot",
    raceId: "vossari",
    act: 1,
    kind: "act",
    title: "The Unmapped Axiom",
    art: "anomaly",
    text: "Vossari theorists pride themselves on seeing the entire tree of natural law without gaps, yet deep-basin interferometers on {colony} detect an anomalous energy signature near {star} that defies every equation in our index.",
    choices: [
      {
        label: "Publish the anomaly to every academy at once",
        result: "Open peer scrutiny sparks brilliant theoretical breakthroughs across {colony}, though prideful fellows bristle at admitting a blind spot.",
        shift: { openness: 2, tradition: -1 },
        sets: ["published-unmapped-axiom"],
        effects: [
          { kind: "research", field: "forceFields", amount: 230 },
          { kind: "culture", amount: 85 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Seal the raw data inside the High Synod vault",
        result: "Quietly sequestering the readings preserves scholarly authority while senior fellows dissect the phenomenon in private.",
        shift: { openness: -2, tradition: 1 },
        sets: ["sealed-unmapped-axiom"],
        effects: [
          { kind: "research", field: "computers", amount: 210 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -90 },
        ],
      },
      {
        label: "Send an uncrewed probe buoy to observe patiently",
        result: "Methodical telemetry gathers clean baseline curves over years without upsetting academic orthodoxy on {colony}.",
        shift: { tradition: 1, mercy: 1 },
        effects: [
          { kind: "revealStars", count: 3 },
          { kind: "research", field: "planetology", amount: 170 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-1-desert-glass",
    raceId: "vossari",
    act: 1,
    kind: "act",
    title: "Lenses of the Red Basin",
    art: "ruins",
    text: "Beneath the arid dunes of {colony}, drilling crews uncover pre-space optical mirrors ground by early Vossari stargazers. Industrial planners want the rare silica melted down for high-speed computer wafers.",
    choices: [
      {
        label: "Preserve the ancient observatory in situ",
        result: "Protecting the fragile desert mirrors honors our scholarly forebears and inspires civic pride across {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 115 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -100 },
        ],
      },
      {
        label: "Reclaim the silica for quantum wafers",
        result: "Refined ancient glass accelerates compute labs on {colony}, though cultural historians mourn the lost monument.",
        shift: { tradition: -2, openness: -1 },
        effects: [
          { kind: "research", field: "computers", amount: 240 },
          { kind: "factories", amount: 5 },
          { kind: "culture", amount: -70 },
        ],
      },
      {
        label: "Invite off-world observers to catalog the site",
        result: "Co-authoring monographs with neighboring scholars builds goodwill and yields modest grant stipends.",
        shift: { openness: 2 },
        effects: [
          { kind: "relations", amount: 14 },
          { kind: "money", amount: 130 },
          { kind: "research", field: "computers", amount: -80 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-1-rival-hypothesis",
    raceId: "vossari",
    act: 1,
    kind: "act",
    title: "The Crude Equation",
    art: "contact",
    text: "Intercepted broadcasts from the {rival} near {star} reveal their engineers testing an unstable propulsion drive using flawed math that could irradiate an entire orbital corridor.",
    choices: [
      {
        label: "Transmit the corrected proof free of charge",
        result: "Saved from a catastrophic test failure, the {rival} thanks Vossari scholars, though hawks accuse us of giving away tech.",
        shift: { mercy: 2, openness: 1 },
        sets: ["corrected-rival-drive"],
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 90 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Observe the failure from afar to log sensor data",
        result: "Recording their containment breach yields rich propulsion telemetry while leaving the {rival} crippled and bitter.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 250 },
          { kind: "relations", amount: -15 },
        ],
      },
      {
        label: "Sell them a licensed safety patch for bullion",
        result: "Commercializing our mathematical superiority fills {colony}'s research coffers without revealing core principles.",
        shift: { openness: -1, tradition: -1 },
        effects: [
          { kind: "money", amount: 210 },
          { kind: "relations", amount: 6 },
          { kind: "culture", amount: -50 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-vossari-2-peer-conclave",
    raceId: "vossari",
    act: 2,
    kind: "act",
    title: "The Open Monograph",
    art: "contact",
    text: "Foreign scholars petition to attend the Grand Symposium on {colony}, hoping to study how Vossari minds map entire fields of science without blind spots. Senior fellows warn that outsiders will weaponize our methods.",
    choices: [
      {
        label: "Open the symposium doors to all peaceful worlds",
        result: "Cross-species debate sparks fresh insights across {colony} and elevates Vossari prestige throughout the sector.",
        shift: { openness: 2, mercy: 1 },
        sets: ["hosted-open-symposium"],
        effects: [
          { kind: "culture", amount: 135 },
          { kind: "relations", amount: 16 },
          { kind: "research", field: "weapons", amount: -100 },
        ],
      },
      {
        label: "Enforce strict non-disclosure clearances",
        result: "Guarded archives protect Vossari military edge while frustrated visitors depart empty-handed.",
        shift: { openness: -2, tradition: 1 },
        effects: [
          { kind: "research", field: "weapons", amount: 230 },
          { kind: "research", field: "forceFields", amount: 170 },
          { kind: "relations", amount: -14 },
        ],
      },
      {
        label: "Trade curated monographs for star-lane charts",
        result: "Calculated academic barter reveals distant systems while keeping core theorems safely redacted.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "revealStars", count: 5 },
          { kind: "money", amount: 140 },
          { kind: "culture", amount: -50 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-2-dry-wells",
    raceId: "vossari",
    act: 2,
    kind: "act",
    title: "The Coolant Tithe",
    art: "crisis",
    text: "Massive supercomputing arrays beneath {colony} draw so much deep-aquifer water that outer farming basins around {star} face crop failure. Lab directors insist interrupting the simulation will waste decades of work.",
    choices: [
      {
        label: "Shut down the arrays to save the farms",
        result: "Restored irrigation saves dry-land communities on {colony}, though compute milestones slip back by years.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "population", amount: 3 },
          { kind: "morale", amount: 5 },
          { kind: "research", field: "computers", amount: -150 },
        ],
      },
      {
        label: "Maintain peak coolant flow until the proof finishes",
        result: "Uninterrupted processing unlocks major breakthroughs while displaced farmers protest outside the domes.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "research", field: "computers", amount: 310 },
          { kind: "population", amount: -2 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Import emergency ice freighters at steep cost",
        result: "Orbital tankers keep both reactors and orchards running smoothly, draining {colony}'s treasury.",
        shift: { mercy: 1, openness: 1 },
        effects: [
          { kind: "research", field: "planetology", amount: 180 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-2-heretic-fellow",
    raceId: "vossari",
    act: 2,
    kind: "act",
    title: "The Intuitive Heresy",
    art: "anomaly",
    text: "A brilliant young fellow on {colony} argues that Vossari obsession with complete deductive rigor blinds us to intuitive leaps, proposing unverified field trials near {star}.",
    choices: [
      {
        label: "Fund her unorthodox field trials",
        result: "Risky prototype runs yield sudden propulsion gains, though traditionalist chairs denounce the sloppy methodology.",
        shift: { tradition: -2, openness: 1 },
        sets: ["backed-intuitive-fellow"],
        effects: [
          { kind: "research", field: "propulsion", amount: 260 },
          { kind: "money", amount: -140 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Deny funding until she writes a formal proof",
        result: "Strict adherence to classical rigor upholds academy discipline and civic pride on {colony}.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "morale", amount: 4 },
          { kind: "research", field: "propulsion", amount: -90 },
        ],
      },
      {
        label: "Assign her to joint labs with practical engineers",
        result: "Pairing bold intuition with shipyard artisans boosts factory efficiency without offending the Synod.",
        shift: { tradition: -1, mercy: 1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "research", field: "construction", amount: 180 },
          { kind: "money", amount: -100 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-vossari-3-axiom-collapse",
    raceId: "vossari",
    act: 3,
    kind: "act",
    title: "The Broken Axiom",
    art: "crisis",
    text: "Deep-space particle trials near {star} shatter a foundational law of Vossari unified physics, proving our prized gapless tech tree was built on a convenient approximation that fails at high energies.",
    choices: [
      {
        label: "Issue a total retraction and rebuild from zero",
        result: "Humbling honesty sparks a painful but brilliant overhaul of Vossari laboratories across {colony}.",
        shift: { openness: 2, tradition: -2 },
        sets: ["retracted-flawed-axiom"],
        effects: [
          { kind: "research", field: "forceFields", amount: 320 },
          { kind: "culture", amount: 110 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Suppress the anomaly to protect Synod authority",
        result: "Maintaining the myth of Vossari infallibility steadies public confidence, though theoretical progress stalls.",
        shift: { openness: -2, tradition: 2 },
        sets: ["concealed-flawed-axiom"],
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "factories", amount: 7 },
          { kind: "research", field: "forceFields", amount: -160 },
        ],
      },
      {
        label: "Quietly patch the equations inside defense labs",
        result: "Weapon engineers exploit the anomaly in secret while civilian academies continue teaching the old canon.",
        shift: { openness: -1, mercy: -1 },
        sets: ["concealed-flawed-axiom"],
        effects: [
          { kind: "research", field: "weapons", amount: 280 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-3-weaponized-proof",
    raceId: "vossari",
    act: 3,
    kind: "act",
    title: "The Cascade Theorem",
    art: "crisis",
    text: "While modeling stellar resonance near {star}, theoretical physicists on {colony} accidentally derive a chain-reaction formula capable of igniting an enemy world's upper atmosphere from orbit.",
    choices: [
      {
        label: "Purge the proof and destroy every simulation",
        result: "Erasure protocols wipe the doomsday math from every core, earning moral relief at steep scientific cost.",
        shift: { mercy: 2, openness: 1 },
        sets: ["destroyed-cascade-proof"],
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "morale", amount: 4 },
          { kind: "research", field: "weapons", amount: -150 },
        ],
      },
      {
        label: "Turn the proof into an orbital deterrent",
        result: "Weaponized resonance batteries give Vossari fleets terrifying reach while chilling neighbors like the {rival}.",
        shift: { mercy: -2, openness: -1 },
        sets: ["weaponized-cascade-proof"],
        effects: [
          { kind: "research", field: "weapons", amount: 340 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Lock the formula in a three-key vault",
        result: "Strict institutional safeguards prevent deployment while preserving theoretical insights for emergency defense.",
        shift: { tradition: 1, openness: -1 },
        sets: ["destroyed-cascade-proof"],
        effects: [
          { kind: "research", field: "computers", amount: 220 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-3-cognitive-graft",
    raceId: "vossari",
    act: 3,
    kind: "act",
    title: "The Neural Index",
    art: "anomaly",
    text: "To keep pace with exponential data growth on {colony}, neuro-engineers propose linking Vossari scholars directly to central quantum processors, sacrificing individual sleep and memory privacy.",
    choices: [
      {
        label: "Approve voluntary neural-lattice integration",
        result: "Linked fellows process decades of proofs in days, though unlinked citizens feel alienated on {colony}.",
        shift: { tradition: -2, openness: 1 },
        sets: ["adopted-neural-lattice"],
        effects: [
          { kind: "research", field: "computers", amount: 330 },
          { kind: "research", field: "planetology", amount: 210 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Ban invasive mind-machine links",
        result: "Defending unaugmented Vossari thought honors arid-world heritage and lifts civic harmony.",
        shift: { tradition: 2, mercy: 1 },
        sets: ["rejected-neural-lattice"],
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Limit links to terminal elders preserving life-work",
        result: "Dying masters upload their final theorems before passing, enriching archives without reshaping society.",
        shift: { tradition: 1, mercy: 1 },
        sets: ["rejected-neural-lattice"],
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "research", field: "computers", amount: 180 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-vossari-4-grand-synthesis",
    raceId: "vossari",
    act: 4,
    kind: "act",
    title: "The Unified Canon",
    art: "victory",
    text: "Across every observatory from {colony} to {star}, Vossari scholars stand within reach of a complete Grand Synthesis uniting gravity, phase-space, and living matter—if we commit our entire economy.",
    choices: [
      {
        label: "Dedicate every dome to the Grand Synthesis",
        result: "All-out theoretical mobilization yields staggering breakthroughs across multiple fields, emptying {colony}'s vaults.",
        shift: { tradition: -1, openness: 1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 420 },
          { kind: "research", field: "propulsion", amount: 380 },
          { kind: "money", amount: -380 },
        ],
      },
      {
        label: "Publish the unfinished framework to all empires",
        result: "Inviting every civilization—even the {rival}—to finish the proof cements Vossari immortality as teachers of the galaxy.",
        shift: { openness: 2, mercy: 2 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 25 },
          { kind: "research", field: "computers", amount: 240 },
        ],
      },
      {
        label: "Patent the applied breakthroughs for treasury tribute",
        result: "Commercializing practical spin-offs floods {colony} with bullion while keeping core theorems proprietary.",
        shift: { openness: -2, mercy: -1 },
        effects: [
          { kind: "money", amount: 410 },
          { kind: "factories", amount: 10 },
          { kind: "relations", amount: -16 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-4-desert-bloom",
    raceId: "vossari",
    act: 4,
    kind: "act",
    title: "Greening the Red Dunes",
    art: "council",
    text: "Mastery of planetary engineering finally lets us terraform {colony}'s ancestral red deserts into lush gardens, though traditionalists warn that erasing our harsh cradle will soften Vossari discipline.",
    choices: [
      {
        label: "Terraform the red basins into verdant valleys",
        result: "Cool rivers and orchards transform {colony}, sparking a joyful population boom as desert austerity fades.",
        shift: { tradition: -2, mercy: 2 },
        effects: [
          { kind: "planetSize", amount: 7 },
          { kind: "population", amount: 5 },
          { kind: "culture", amount: -110 },
        ],
      },
      {
        label: "Preserve the ancestral desert unbroken",
        result: "Keeping our austere dunes intact honors millennia of Vossari endurance and sharpens scholarly focus.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "research", field: "planetology", amount: 360 },
          { kind: "morale", amount: 4 },
        ],
      },
      {
        label: "Build domed oasis preserves beside open dunes",
        result: "Balancing living gardens with sacred desert wilderness satisfies both reformers and elders at steep cost.",
        shift: { mercy: 1, tradition: 1 },
        effects: [
          { kind: "population", amount: 3 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -320 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-4-ignorant-stars",
    raceId: "vossari",
    act: 4,
    kind: "act",
    title: "The Tutelage Doctrine",
    art: "council",
    text: "Observing younger empires blunder toward ecological and nuclear ruin near {star}, hardline fellows urge enforcing a scientific protectorate to forbid reckless technologies across neighboring space.",
    choices: [
      {
        label: "Impose technological quarantine patrols",
        result: "Vossari dreadnoughts confiscate unstable reactors along the border, aweing neighbors while provoking fury.",
        shift: { mercy: -2, openness: -2 },
        effects: [
          { kind: "research", field: "weapons", amount: 360 },
          { kind: "factories", amount: 9 },
          { kind: "relations", amount: -24 },
        ],
      },
      {
        label: "Endow free safety academies for all neighbors",
        result: "Patient instruction averts disasters across {star} and earns deep gratitude from the {rival}.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "relations", amount: 24 },
          { kind: "culture", amount: 190 },
          { kind: "money", amount: -300 },
        ],
      },
      {
        label: "Retreat into pure observation without interference",
        result: "Maintaining strict scholarly detachment conserves resources while outer worlds chart their own fates.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "research", field: "computers", amount: 380 },
          { kind: "money", amount: 260 },
          { kind: "relations", amount: -10 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-vossari-branch-open-axiom",
    raceId: "vossari",
    act: 2,
    kind: "branch",
    needs: ["published-unmapped-axiom"],
    blockedBy: ["sealed-unmapped-axiom"],
    title: "The Counter-Proof",
    art: "contact",
    text: "Because we published the unmapped anomaly openly, independent researchers on {colony} and neighboring worlds submit competing equations that crack the energy signature near {star}.",
    choices: [
      {
        label: "Credit every co-author in the Grand Index",
        result: "Honoring outside contributors elevates Vossari prestige and accelerates shared force-field mastery.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "research", field: "forceFields", amount: 240 },
          { kind: "money", amount: -120 },
        ],
      },
      {
        label: "Synthesize the findings under Synod copyright",
        result: "Claiming institutional priority boosts compute patents while disappointing junior researchers on {colony}.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "money", amount: 220 },
          { kind: "research", field: "computers", amount: 210 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Share the breakthrough directly with the {rival}",
        result: "Extending our joint discovery warms ties with the {rival} at the cost of strategic exclusivity.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 100 },
          { kind: "research", field: "weapons", amount: -100 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-branch-vault-leak",
    raceId: "vossari",
    act: 2,
    kind: "branch",
    needs: ["sealed-unmapped-axiom"],
    blockedBy: ["published-unmapped-axiom"],
    title: "The Whispered Variable",
    art: "anomaly",
    text: "Frustrated by the Synod's secrecy over the {star} anomaly, a dissident lab technician on {colony} leaks partial sensor logs to underground student circles.",
    choices: [
      {
        label: "Declassify the vault and pardon the leaker",
        result: "Admitting the cover-up restores intellectual trust on {colony} and unlocks stagnant theoretical work.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "research", field: "forceFields", amount: 230 },
          { kind: "morale", amount: 4 },
          { kind: "culture", amount: -60 },
        ],
      },
      {
        label: "Expel the dissidents to remote relay stations",
        result: "Strict academic discipline keeps Synod vaults sealed and channels rebel energy into frontier mapping.",
        shift: { openness: -2, tradition: 1 },
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "research", field: "computers", amount: 220 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Recruit the rebels into a classified defense cell",
        result: "Co-opting bright minds turns dissent into sharp propulsion prototypes at heavy budget expense.",
        shift: { openness: -1, tradition: -1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 250 },
          { kind: "money", amount: -170 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-branch-rival-gratitude",
    raceId: "vossari",
    act: 3,
    kind: "branch",
    needs: ["corrected-rival-drive", "hosted-open-symposium"],
    title: "The Joint Observatory",
    art: "council",
    text: "Grateful for our corrected drive proof and open symposium, engineers from the {rival} offer to co-fund a deep-space sensor array around {star} linked directly to {colony}.",
    choices: [
      {
        label: "Build the shared observatory as equal partners",
        result: "Combined sensor telemetry maps distant sectors and deepens lasting trust with the {rival}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "revealStars", count: 6 },
          { kind: "relations", amount: 20 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Install quiet Vossari telemetry taps inside the array",
        result: "Hidden backdoors feed compute intelligence to {colony} while maintaining a polite facade.",
        shift: { openness: -2, mercy: -1 },
        effects: [
          { kind: "research", field: "computers", amount: 300 },
          { kind: "revealStars", count: 4 },
          { kind: "relations", amount: -12 },
        ],
      },
      {
        label: "Use the partnership to teach non-proliferation norms",
        result: "Setting shared safety protocols elevates Vossari moral authority across {colony} and beyond.",
        shift: { tradition: 1, mercy: 1 },
        effects: [
          { kind: "culture", amount: 150 },
          { kind: "relations", amount: 14 },
          { kind: "money", amount: -100 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-branch-intuitive-breakthrough",
    raceId: "vossari",
    act: 3,
    kind: "branch",
    needs: ["backed-intuitive-fellow"],
    title: "The Unproven Drive",
    art: "supernova",
    text: "The intuitive fellow we backed at {star} returns with a working fold-drive prototype whose geometry still lacks any formal mathematical proof, splitting {colony}'s Synod into warring camps.",
    choices: [
      {
        label: "Deploy the unproven drive across our scout wings",
        result: "Intuition triumphs over dogma as agile scouts chart distant systems, though traditionalists fume.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 320 },
          { kind: "ships", template: "scout", count: 2 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Ground the ships until formal proofs are completed",
        result: "Careful verification uncovers subtle hull stresses and turns raw intuition into enduring science.",
        shift: { tradition: 2 },
        effects: [
          { kind: "research", field: "construction", amount: 270 },
          { kind: "culture", amount: 120 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "License the raw prototype to daring private captains",
        result: "Commercial test-runs bring bullion into {colony} while insulating state academies from failure.",
        shift: { tradition: -1, mercy: -1 },
        effects: [
          { kind: "money", amount: 260 },
          { kind: "research", field: "propulsion", amount: 190 },
          { kind: "morale", amount: -3 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-branch-cascade-shadow",
    raceId: "vossari",
    act: 4,
    kind: "branch",
    needs: ["weaponized-cascade-proof"],
    blockedBy: ["destroyed-cascade-proof"],
    title: "The Silent Equation",
    art: "crisis",
    text: "Word of our atmospheric cascade weapon leaks across the border, prompting the {rival} to form an emergency pact with nervous neighbors while anti-war fellows on {colony} stage a strike.",
    choices: [
      {
        label: "Demonstrate the weapon on a dead moon near {star}",
        result: "The terrifying display cowers every rival fleet into stillness, though horror grips {colony}'s academies.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "research", field: "weapons", amount: 380 },
          { kind: "relations", amount: -25 },
          { kind: "morale", amount: -8 },
        ],
      },
      {
        label: "Dismantle the warheads under international inspection",
        result: "Publicly renouncing doomsday physics heals {colony}'s conscience and astounds the {rival}.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 22 },
          { kind: "research", field: "weapons", amount: -200 },
        ],
      },
      {
        label: "Transfer the arsenal to automated deep-space vaults",
        result: "Removing human triggers appeases striking fellows while keeping deterrence intact in the dark.",
        shift: { tradition: 1, openness: -1 },
        effects: [
          { kind: "research", field: "computers", amount: 310 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -260 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-vossari-end-transcendent-index",
    raceId: "vossari",
    needs: { tradition: { max: -3 }, openness: { min: 3 } },
    title: "The Living Theorem",
    art: "victory",
    text: "Freeing Vossari science from rigid orthodoxy and sharing inquiry across the stars sparks an unprecedented intellectual leap, unlocking deep laws of the cosmos across every field.",
    outcome: "ascension",
    choices: [
      {
        label: "Step beyond the old horizon",
        result: "Vossari academies illuminate every branch of galactic science at once.",
        effects: [
          { kind: "culture", amount: 200 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-end-ivory-hegemon",
    raceId: "vossari",
    needs: { openness: { max: -4 }, mercy: { max: -3 } },
    title: "The Cold Observatory",
    art: "crisis",
    text: "Hoarding forbidden physics behind sealed vaults and wielding cold deterrence, the Vossari peer down from {colony} in solitary mastery while neighboring empires freeze in silent dread.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Let them fear our certainty",
        result: "No rival dares challenge Vossari borders, though every neighbor regards us with bitter suspicion.",
        effects: [
          { kind: "research", field: "weapons", amount: 340 },
          { kind: "research", field: "forceFields", amount: 340 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-end-galactic-synod",
    raceId: "vossari",
    needs: { openness: { min: 5 }, mercy: { min: 4 } },
    title: "Teachers of the Thousand Suns",
    art: "council",
    text: "By opening their peerless archives and guiding younger civilizations with patience, the Vossari earn the reverence of the Galactic Council as impartial guardians of knowledge.",
    outcome: "councilFavour",
    choices: [
      {
        label: "Convene the Open Academy",
        result: "Empires across the galaxy defer to Vossari wisdom in council deliberations.",
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 24 },
        ],
      },
    ],
  },
  {
    id: "saga-vossari-end-quiet-lamp",
    raceId: "vossari",
    title: "The Unbroken Index",
    art: "victory",
    text: "Through disciplined inquiry and patient stewardship of their arid cradles, the Vossari enter a luminous golden age of pure discovery and civic poise.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Record the next chapter",
        result: "Observatories hum in serene harmony from {colony} to the outer rim.",
        effects: [
          { kind: "research", field: "computers", amount: 320 },
          { kind: "culture", amount: 180 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
];
