// Terran Accord saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-humans-1-frontier-compact",
    raceId: "humans",
    act: 1,
    kind: "act",
    title: "The Outer Beacon Charter",
    art: "contact",
    text: "Independent mining vessels orbiting {star} petition to join the Terran Accord as an autonomous guild rather than a regular province of {colony}. Colonial ministers warn that granting self-rule sets a precedent every future world will cite.",
    choices: [
      {
        label: "Grant them a self-governing charter",
        result: "Free miners cheer our democratic restraint and chart nearby lanes, though tax collectors at {colony} see slim returns.",
        shift: { openness: 1, tradition: -1 },
        sets: ["chartered-outer-guild"],
        effects: [
          { kind: "culture", amount: 95 },
          { kind: "revealStars", count: 3 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Require full integration under Accord law",
        result: "Uniform ministries bring orderly foundry quotas to {colony}, though frontier captains grumble at distant bureaucracy.",
        shift: { tradition: 1, openness: -1 },
        effects: [
          { kind: "factories", amount: 5 },
          { kind: "money", amount: 120 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Offer tax relief for naval patrol duty",
        result: "A practical brokerage turns roughneck prospectors into volunteer picket crews without rewriting constitutional law.",
        shift: { mercy: 1 },
        effects: [
          { kind: "ships", template: "scout", count: 2 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-1-sleeper-beacon",
    raceId: "humans",
    act: 1,
    kind: "act",
    title: "Voices from the Drift Ark",
    art: "anomaly",
    text: "Long-range arrays near {star} lock onto a pre-warp sleeper vessel whose cryo-vaults carry thirty thousand exiles who fled old Earth during the Charter Wars. Their descendants reject the Accord's founding treaty as an authoritarian imposition.",
    choices: [
      {
        label: "Welcome them home with full amnesty",
        result: "Tearful reunions on {colony} swell our workforce and civic pride, even as heated debates erupt in parliament.",
        shift: { mercy: 2, openness: 1 },
        sets: ["welcomed-drift-exiles"],
        effects: [
          { kind: "population", amount: 4 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "Quarantine the ark until they swear the Charter",
        result: "Constitutional oaths remain unbroken on {colony}, while stubborn exiles remain sealed in orbital transit.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "morale", amount: 2 },
          { kind: "population", amount: -1 },
        ],
      },
      {
        label: "Salvage their antique drives and resettle quietly",
        result: "Engineers strip pre-warp cryo and propulsion logs in secret, dispersing the passengers across quiet frontier farms.",
        shift: { openness: -1, tradition: -1 },
        effects: [
          { kind: "research", field: "propulsion", amount: 210 },
          { kind: "money", amount: 130 },
          { kind: "culture", amount: -50 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-1-border-tariff",
    raceId: "humans",
    act: 1,
    kind: "act",
    title: "The Neutral Buoy",
    art: "contact",
    text: "Private Terran merchants establish an unlicensed exchange post near {star}, trading hull alloys with smugglers from the {rival}. Envoys from the {rival} demand we shut down the contraband market at once.",
    choices: [
      {
        label: "Legalize the post as an open trade zone",
        result: "Bold diplomacy turns friction into brisk commercial brokerage, enriching {colony} while irritating traditionalist admirals.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "money", amount: 220 },
          { kind: "relations", amount: 12 },
          { kind: "morale", amount: -3 },
        ],
      },
      {
        label: "Impound the freighters and apologize formally",
        result: "Strict adherence to treaty protocol calms the {rival} and reassures Accord jurists, at steep commercial cost.",
        shift: { tradition: 1, mercy: 1 },
        effects: [
          { kind: "relations", amount: 15 },
          { kind: "culture", amount: 85 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Confiscate the cargo for Accord shipyards",
        result: "Seized alloys boost industrial output on {colony}, though the {rival} denounces our high-handed seizure.",
        shift: { mercy: -1, openness: -1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "money", amount: 140 },
          { kind: "relations", amount: -14 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-humans-2-colonial-senate",
    raceId: "humans",
    act: 2,
    kind: "act",
    title: "Seats on the High Floor",
    art: "council",
    text: "Outer settlements led by {colony} threaten a tax boycott unless parliamentary seats are reapportioned by population rather than founding-world seniority. Core ministries warn that proportional rule will sideline Terra's founding institutions.",
    choices: [
      {
        label: "Pass full proportional representation",
        result: "Frontier worlds celebrate a revitalized democracy, though old-guard ministries lose leverage over budgets.",
        shift: { openness: 1, tradition: -2 },
        sets: ["reformed-senate"],
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -170 },
        ],
      },
      {
        label: "Preserve the Founding Worlds veto",
        result: "Central planners safeguard long-term industrial targets on {colony}, while outer delegates walk out in protest.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "factories", amount: 7 },
          { kind: "research", field: "construction", amount: 200 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Create a dual-chamber compromise",
        result: "Months of patient consensus-building balance local voices with central stability, earning broad civic respect.",
        shift: { mercy: 1, tradition: 1 },
        effects: [
          { kind: "culture", amount: 100 },
          { kind: "morale", amount: 3 },
          { kind: "money", amount: -120 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-2-refugee-convoy",
    raceId: "humans",
    act: 2,
    kind: "act",
    title: "The Unmarked Flotilla",
    art: "pirates",
    text: "Battered civilian transports fleeing internal purges inside the {rival} limp toward {star}, begging for asylum on {colony}. Intelligence warns that agents of the {rival} may be hiding among the wounded.",
    choices: [
      {
        label: "Grant asylum and settle them openly",
        result: "Humanitarian relief swells {colony}'s workforce and wins admiration, though the {rival} condemns our interference.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "population", amount: 4 },
          { kind: "culture", amount: 110 },
          { kind: "relations", amount: -15 },
        ],
      },
      {
        label: "Turn the convoy back at the border",
        result: "Keeping strict neutrality avoids diplomatic blowback from the {rival}, yet shame hangs heavy over {colony}'s docks.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "relations", amount: 14 },
          { kind: "money", amount: 130 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Screen passengers in isolated orbital camps",
        result: "Counter-intelligence vets every arrival and extracts useful computer diagnostics without provoking open war.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "research", field: "computers", amount: 240 },
          { kind: "population", amount: 2 },
          { kind: "money", amount: -160 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-2-embassy-leak",
    raceId: "humans",
    act: 2,
    kind: "act",
    title: "The Diplomatic Cipher",
    art: "contact",
    text: "An attaché stationed near {star} hands our foreign office the decrypted diplomatic playbook of the {rival}, revealing every red line they plan to bring to upcoming trade talks.",
    choices: [
      {
        label: "Return the cipher unread as a gesture of faith",
        result: "Astonished envoys from the {rival} hail Terran integrity, opening lucrative bilateral trade agreements.",
        shift: { mercy: 1, openness: 2 },
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "culture", amount: 120 },
          { kind: "money", amount: 160 },
        ],
      },
      {
        label: "Exploit the playbook quietly at the table",
        result: "Terran negotiators extract lopsided concessions before the {rival} realizes their codes were compromised.",
        shift: { openness: -2, mercy: -1 },
        sets: ["exploited-rival-cipher"],
        effects: [
          { kind: "money", amount: 280 },
          { kind: "research", field: "computers", amount: 210 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Use the leverage to broker a mutual non-aggression pact",
        result: "Quietly steering talks past every flashpoint locks in border stability without humiliating the {rival}.",
        shift: { tradition: 1, openness: 1 },
        effects: [
          { kind: "relations", amount: 14 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -110 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-humans-3-secret-armistice",
    raceId: "humans",
    act: 3,
    kind: "act",
    title: "The Backchannel Protocol",
    art: "crisis",
    text: "Exhausted by border attrition near {star}, envoys from the {rival} propose a secret bilateral truce that sacrifices a smaller neutral system's trade rights in exchange for immediate peace at {colony}.",
    choices: [
      {
        label: "Sign the quiet partition behind closed doors",
        result: "Peace returns to {colony} and trade surges, though whispers of a cynical backroom deal stain Terran prestige.",
        shift: { openness: -2, tradition: -1 },
        sets: ["signed-secret-partition"],
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "money", amount: 240 },
          { kind: "culture", amount: -110 },
        ],
      },
      {
        label: "Expose the offer before the full assembly",
        result: "Publicly rejecting coercion rallies Terran morale and wins moral standing, though the {rival} hardens its fleet posture.",
        shift: { openness: 2, mercy: 1 },
        sets: ["defended-neutral-rights"],
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "morale", amount: 5 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Demand an open three-way summit at {star}",
        result: "Insisting on transparent mediation slows progress and drains diplomatic funds, yet keeps every covenant intact.",
        shift: { tradition: 2, mercy: 1 },
        sets: ["defended-neutral-rights"],
        effects: [
          { kind: "culture", amount: 110 },
          { kind: "relations", amount: 8 },
          { kind: "money", amount: -150 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-3-ai-arbiter",
    raceId: "humans",
    act: 3,
    kind: "act",
    title: "The Algorithmic Bench",
    art: "anomaly",
    text: "Case backlogs across {colony} and outer trade hubs grow so vast that legal scholars propose handing commercial and border arbitration to an impartial synthetic jurist built at {star}.",
    choices: [
      {
        label: "Empower the synthetic arbiter across all courts",
        result: "Instant, incorruptible rulings supercharge commerce and compute research, though citizens chafe under cold machine verdicts.",
        shift: { tradition: -2, openness: 1 },
        sets: ["installed-ai-arbiter"],
        effects: [
          { kind: "research", field: "computers", amount: 310 },
          { kind: "money", amount: 210 },
          { kind: "morale", amount: -5 },
        ],
      },
      {
        label: "Keep human juries supreme under the Charter",
        result: "Preserving flesh-and-blood judgment honors Terran legal heritage and lifts civic pride, at the cost of slower bureaucracy.",
        shift: { tradition: 2, mercy: 1 },
        sets: ["preserved-human-juries"],
        effects: [
          { kind: "culture", amount: 135 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Restrict machine rulings to foreign trade disputes",
        result: "Rival merchants trust the neutral ledger at {star}, while domestic courts keep traditional citizen panels.",
        shift: { openness: 1, tradition: -1 },
        sets: ["installed-ai-arbiter"],
        effects: [
          { kind: "relations", amount: 15 },
          { kind: "research", field: "computers", amount: 180 },
          { kind: "culture", amount: -60 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-3-whistleblower",
    raceId: "humans",
    act: 3,
    kind: "act",
    title: "The Geneva Dossier",
    art: "crisis",
    text: "A senior naval analyst on {colony} leaks proof that Terran intelligence planted false navigation buoys near {star} to provoke a border incident with the {rival} and justify defense budgets.",
    choices: [
      {
        label: "Pardon the analyst and prosecute the admirals",
        result: "Painful accountability rocks high command and shakes morale, yet astonished neighbors praise Terran integrity.",
        shift: { mercy: 2, openness: 2 },
        sets: ["purged-war-hawks"],
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Arrest the leaker for treason and bury the file",
        result: "Command discipline holds firm and naval research surges, though quiet cynicism spreads through {colony}'s press.",
        shift: { mercy: -2, openness: -2 },
        sets: ["silenced-whistleblower"],
        effects: [
          { kind: "research", field: "weapons", amount: 260 },
          { kind: "factories", amount: 7 },
          { kind: "culture", amount: -120 },
        ],
      },
      {
        label: "Convene a closed parliamentary oversight tribunal",
        result: "Quietly retiring the guilty officers restores institutional order without airing state secrets to the {rival}.",
        shift: { tradition: 1, openness: -1 },
        sets: ["silenced-whistleblower"],
        effects: [
          { kind: "morale", amount: 3 },
          { kind: "research", field: "computers", amount: 190 },
          { kind: "money", amount: -130 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-humans-4-galactic-constitution",
    raceId: "humans",
    act: 4,
    kind: "act",
    title: "The Thousand-Sun Draft",
    art: "council",
    text: "Diplomats gathered at {colony} draft a binding interstellar bill of rights meant to govern trade, borders, and war across every civilized world near {star}—requiring the Accord itself to yield sovereign vetoes.",
    choices: [
      {
        label: "Surrender Terran veto power to ratify the charter",
        result: "Putting principle above hegemony inspires galactic admiration and cements lasting trust even with the {rival}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 25 },
          { kind: "money", amount: -240 },
        ],
      },
      {
        label: "Insist on permanent Terran security oversight",
        result: "Hard-nosed realism keeps trade surpluses flowing into {colony}, though neighbors mutter of a gilded empire.",
        shift: { tradition: 1, openness: -2 },
        effects: [
          { kind: "money", amount: 380 },
          { kind: "factories", amount: 9 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Bind ratification to strict bilateral trade quotas",
        result: "Shrewd mercantile clauses turn every signatory into a steady customer of Accord shipyards and banks.",
        shift: { tradition: -1, mercy: -1 },
        effects: [
          { kind: "money", amount: 320 },
          { kind: "research", field: "computers", amount: 280 },
          { kind: "culture", amount: -80 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-4-terraforming-reckoning",
    raceId: "humans",
    act: 4,
    kind: "act",
    title: "The Blue Marble Mandate",
    art: "victory",
    text: "Generations of heavy industry have turned {colony} into an economic powerhouse, while ecological guilds demand diverting massive resources to restore fragile biosphere worlds around {star}.",
    choices: [
      {
        label: "Launch a grand biosphere restoration program",
        result: "Lush terraforming projects swell living space and civic pride across our worlds at steep treasury expense.",
        shift: { mercy: 2, tradition: 1 },
        effects: [
          { kind: "planetSize", amount: 6 },
          { kind: "population", amount: 5 },
          { kind: "money", amount: -360 },
        ],
      },
      {
        label: "Push orbital industrial rings to maximum output",
        result: "Unchecked heavy yards churn out hulls and wealth at record pace, straining worker morale on {colony}.",
        shift: { mercy: -1, tradition: -2 },
        effects: [
          { kind: "factories", amount: 12 },
          { kind: "money", amount: 350 },
          { kind: "morale", amount: -7 },
        ],
      },
      {
        label: "License green-world tech to allied colonies",
        result: "Sharing atmospheric scrubbers strengthens diplomatic bonds and research while keeping domestic budgets balanced.",
        shift: { openness: 2 },
        effects: [
          { kind: "research", field: "planetology", amount: 420 },
          { kind: "relations", amount: 18 },
          { kind: "factories", amount: -4 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-4-succession-crisis",
    raceId: "humans",
    act: 4,
    kind: "act",
    title: "Twilight of the Founders",
    art: "council",
    text: "As the last generation born on old Earth passes away on {colony}, a cultural movement urges retiring Terra's ceremonial capital status in favor of a rotating interstellar capital near {star}.",
    choices: [
      {
        label: "Establish a rotating interstellar capital",
        result: "Sharing the seat of government energizes outer colonies and deepens our pluralist identity.",
        shift: { tradition: -2, openness: 2 },
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "morale", amount: 7 },
          { kind: "money", amount: -280 },
        ],
      },
      {
        label: "Enshrine Earth as eternal heart of the Accord",
        result: "Monumental heritage decrees steady national resolve and administrative efficiency, though frontier worlds feel secondary.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "culture", amount: 180 },
          { kind: "factories", amount: 8 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Endow a joint historical archive open to all races",
        result: "Scholars from across the stars visit {colony}, turning memory into soft diplomatic power.",
        shift: { mercy: 1, openness: 1 },
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "research", field: "computers", amount: 300 },
          { kind: "money", amount: -200 },
        ],
      },
    ],
  },

// ================= BRANCH BEATS (5) =================
  {
    id: "saga-humans-branch-guild-revolt",
    raceId: "humans",
    act: 2,
    kind: "branch",
    needs: ["chartered-outer-guild"],
    title: "The Free-Miner Tariff",
    art: "pirates",
    text: "Empowered by the autonomy charter granted at {star}, the outer mining guild begins levying its own transit tolls on Accord vessels bound for {colony}.",
    choices: [
      {
        label: "Negotiate a revenue-sharing compact",
        result: "Patient mediation turns friction into steady customs royalties without firing a shot.",
        shift: { openness: 1, mercy: 1 },
        effects: [
          { kind: "money", amount: 190 },
          { kind: "culture", amount: 90 },
          { kind: "morale", amount: -2 },
        ],
      },
      {
        label: "Revoke the charter and deploy customs cruisers",
        result: "Federal patrols restore order at {star}, though frontier settlers resent the broken promise.",
        shift: { tradition: 2, mercy: -1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: -5 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Grant them a seat on the Trade Board",
        result: "Co-opting guild captains into Accord institutions aligns their ships with our frontier defense.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "ships", template: "scout", count: 2 },
          { kind: "culture", amount: 110 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-branch-exile-renaissance",
    raceId: "humans",
    act: 2,
    kind: "branch",
    needs: ["welcomed-drift-exiles"],
    title: "The Exile Ballads",
    art: "contact",
    text: "Descended from the Drift Ark exiles welcomed onto {colony}, a new generation of poets and engineers revitalizes pre-warp democratic philosophy while challenging old Accord bureaucracy.",
    choices: [
      {
        label: "Fund their civic academies across {colony}",
        result: "Vibrant public forums lift morale and cultural prestige throughout the Accord.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "Channel their antique engineering into shipyards",
        result: "Forgotten pre-warp hull techniques streamline construction on {colony} at modest cultural cost.",
        shift: { tradition: 1, openness: -1 },
        effects: [
          { kind: "research", field: "construction", amount: 240 },
          { kind: "factories", amount: 6 },
          { kind: "culture", amount: -60 },
        ],
      },
      {
        label: "Send exile envoys to mediate with the {rival}",
        result: "Outsider perspective helps Terran diplomats break deadlocks with the {rival}.",
        shift: { mercy: 1, openness: 1 },
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "culture", amount: 95 },
          { kind: "money", amount: -100 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-branch-cipher-betrayal",
    raceId: "humans",
    act: 3,
    kind: "branch",
    needs: ["exploited-rival-cipher"],
    blockedBy: ["purged-war-hawks"],
    title: "The Poisoned Playbook",
    art: "crisis",
    text: "Intelligence officers on {colony} discover the diplomatic cipher we exploited against the {rival} was deliberately leaked by a faction inside the {rival} to lure Terran fleets into a trap near {star}.",
    choices: [
      {
        label: "Spring a counter-ambush with full force",
        result: "Turning the trap back on the {rival} yields salvaged tech and bullion, though border tensions boil over.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "research", field: "weapons", amount: 270 },
          { kind: "money", amount: 220 },
          { kind: "relations", amount: -20 },
        ],
      },
      {
        label: "Quietly pull back and send an honest envoy",
        result: "Admitting the intelligence game disarms the crisis and earns grudging respect from the {rival}.",
        shift: { mercy: 1, openness: 2 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 120 },
          { kind: "money", amount: -160 },
        ],
      },
      {
        label: "Disband the black-chamber bureau publicly",
        result: "Restoring constitutional oversight steadies Accord morale after a humiliating intelligence failure.",
        shift: { tradition: 2, openness: 1 },
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "culture", amount: 110 },
          { kind: "research", field: "computers", amount: -120 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-branch-partition-backlash",
    raceId: "humans",
    act: 4,
    kind: "branch",
    needs: ["signed-secret-partition"],
    title: "Echoes of the Backroom Pact",
    art: "council",
    text: "Archived transcripts of our secret partition deal with the {rival} surface in public feeds across {colony}, sparking outrage among smaller worlds that trusted Terran neutrality.",
    choices: [
      {
        label: "Repudiate the pact and pay restitution",
        result: "Heavy treasury reparations begin healing Terran credibility across {colony} and neighboring worlds.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "culture", amount: 190 },
          { kind: "relations", amount: 15 },
          { kind: "money", amount: -340 },
        ],
      },
      {
        label: "Defend the deal as hard-nosed statecraft",
        result: "Realpolitik keeps trade flowing with the {rival}, though democratic idealism withers at home.",
        shift: { openness: -2, mercy: -1 },
        effects: [
          { kind: "money", amount: 310 },
          { kind: "factories", amount: 8 },
          { kind: "morale", amount: -7 },
        ],
      },
      {
        label: "Blame rogue envoys and tighten senate oversight",
        result: "Scapegoating former negotiators preserves institutional order while keeping commercial concessions intact.",
        shift: { tradition: 1, openness: -1 },
        effects: [
          { kind: "morale", amount: 4 },
          { kind: "research", field: "computers", amount: 240 },
          { kind: "culture", amount: -110 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-branch-arbiter-dissent",
    raceId: "humans",
    act: 4,
    kind: "branch",
    needs: ["installed-ai-arbiter"],
    blockedBy: ["preserved-human-juries"],
    title: "The Unappealable Verdict",
    art: "anomaly",
    text: "The synthetic arbiter at {star} rules that {colony}'s planetary governor must be removed for subtle budget distortions, daring parliament to obey or unplug the machine.",
    choices: [
      {
        label: "Uphold the ruling and remove the governor",
        result: "Submitting even high officials to impartial logic astonishes the galaxy and supercharges institutional trust.",
        shift: { tradition: -2, openness: 1 },
        effects: [
          { kind: "research", field: "computers", amount: 360 },
          { kind: "culture", amount: 180 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Decommission the arbiter and restore human rule",
        result: "Citizens celebrate reclaiming human sovereignty over {colony}, though automated courts collapse overnight.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "morale", amount: 8 },
          { kind: "culture", amount: 160 },
          { kind: "money", amount: -280 },
        ],
      },
      {
        label: "Recode the machine to require senate confirmation",
        result: "Blending algorithmic speed with elected vetoes stabilizes governance across {colony}.",
        shift: { tradition: 1 },
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "money", amount: 220 },
          { kind: "research", field: "computers", amount: -140 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-humans-end-beacon-of-accord",
    raceId: "humans",
    needs: { openness: { min: 5 }, mercy: { min: 4 } },
    title: "The Open Covenant",
    art: "council",
    text: "By choosing transparency, mercy, and patient brokerage at every turn, the Terran Accord becomes the trusted heart of interstellar diplomacy, swaying votes across the Galactic Council.",
    outcome: "councilFavour",
    choices: [
      {
        label: "Open the floor to every star",
        result: "Free trade and moral standing grant the Terran Accord lasting influence in every council vote.",
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 25 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-end-reconciled-rivals",
    raceId: "humans",
    needs: { mercy: { min: 5 }, tradition: { max: 1 } },
    title: "Bridge Across the Void",
    art: "victory",
    text: "Willing to bend old pride and extend genuine grace, Terran envoys achieve the unthinkable—turning our fiercest enemy into a sworn partner under a shared charter.",
    outcome: "rivalBecomesAlly",
    choices: [
      {
        label: "Sign the Treaty of Reconciliation",
        result: "Former adversaries lay down arms and join the Terran Accord in enduring alliance.",
        effects: [
          { kind: "money", amount: 340 },
          { kind: "culture", amount: 180 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-end-iron-directorate",
    raceId: "humans",
    needs: { openness: { max: -4 }, mercy: { max: -3 } },
    title: "The Velvet Hegemony",
    art: "crisis",
    text: "Behind a polite diplomatic facade, the Accord hollowed out its own Charter for secret deals, blackmail, and centralized control—sparking a colonial secession across {colony}'s outer reaches.",
    outcome: "civilWar",
    choices: [
      {
        label: "Mobilize to hold the union",
        result: "Breakaway frontier worlds raise the old founding banner against Terra's centralized regime.",
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "morale", amount: -8 },
        ],
      },
    ],
  },
  {
    id: "saga-humans-end-steady-republic",
    raceId: "humans",
    title: "The Enduring Charter",
    art: "victory",
    text: "Through compromise, commerce, and hard-won resilience, the Terran Accord enters a radiant golden age of civic prosperity and interstellar trade.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Carry the Charter forward",
        result: "Bustling spaceports and thriving democracies celebrate a new era of Terran peace.",
        effects: [
          { kind: "money", amount: 320 },
          { kind: "culture", amount: 180 },
          { kind: "morale", amount: 6 },
        ],
      },
    ],
  },
];