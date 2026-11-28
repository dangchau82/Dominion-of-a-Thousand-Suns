// Orrun Consortium saga. Written by Gemini (2026-11-27), checked and assembled by Claude 2.
import type { SagaBeat, SagaEnding } from "../sagas";

export const BEATS: SagaBeat[] = [
  // ================= ACT 1 (Turns 20-60) =================
  {
    id: "saga-orrun-1-pearl-ledger",
    raceId: "orrun",
    act: 1,
    kind: "act",
    title: "The Tidal Ledger",
    art: "ruins",
    text: "Dredging the coral canyons beneath {colony}, mercantile divers recover intact Tide-Guild ledgers from the Reef Wars—proving several ruling syndicate houses owe astronomical compound interest to extinct coastal clans.",
    choices: [
      {
        label: "Honor the ancient debt into a civic trust",
        result: "Restoring forgotten reef-clan equity wins immense public goodwill across {colony}, though boardrooms wince at the payout.",
        shift: { mercy: 1, tradition: 1 },
        sets: ["honored-tidal-trust"],
        effects: [
          { kind: "culture", amount: 105 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -140 },
        ],
      },
      {
        label: "Liquidate the ledgers as sovereign salvage",
        result: "Auctioning antique pearl-bonds floods the Consortium treasury, though old lagoon families mutter of gilded theft.",
        shift: { mercy: -1, tradition: -1 },
        effects: [
          { kind: "money", amount: 230 },
          { kind: "factories", amount: 4 },
          { kind: "morale", amount: -4 },
        ],
      },
      {
        label: "Audit the vaults quietly for merchant families",
        result: "Quietly settling claims behind closed doors preserves syndicate harmony and funds fresh port expansions.",
        shift: { openness: -1, tradition: 1 },
        effects: [
          { kind: "money", amount: 140 },
          { kind: "culture", amount: 70 },
          { kind: "morale", amount: 2 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-1-lane-monopoly",
    raceId: "orrun",
    act: 1,
    kind: "act",
    title: "The Toll at Deepwater",
    art: "contact",
    text: "Orrun starlane beacons near {star} lock onto a narrow transit corridor favored by independent freighters. Guild captains urge erecting an automated toll buoy before foreign hulls map the route.",
    choices: [
      {
        label: "Establish an open free-transit exchange",
        result: "Welcoming outside captains turns {star} into a bustling crossroads of charts and rumor.",
        shift: { openness: 2, tradition: -1 },
        sets: ["opened-lane-exchange"],
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "culture", amount: 85 },
          { kind: "money", amount: -100 },
        ],
      },
      {
        label: "Enforce a steep Consortium transit tariff",
        result: "Every passing hull pays coin into {colony}'s vaults, though independent haulers curse our greed.",
        shift: { openness: -1, mercy: -1 },
        effects: [
          { kind: "money", amount: 240 },
          { kind: "factories", amount: 5 },
          { kind: "relations", amount: -10 },
        ],
      },
      {
        label: "Offer discounted tolls in exchange for ship repairs",
        result: "Bartering lane access for hull components boosts shipyard efficiency without alienating passing traders.",
        shift: { mercy: 1 },
        effects: [
          { kind: "research", field: "construction", amount: 190 },
          { kind: "money", amount: 110 },
          { kind: "morale", amount: 2 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-1-sunken-bourse",
    raceId: "orrun",
    act: 1,
    kind: "act",
    title: "The Reef-Market Strike",
    art: "crisis",
    text: "Kelp-harvesters and dock-riggers on {colony} halt cargo lifts, demanding profit-sharing warrants on every orbital freighter launched from their sea-platforms.",
    choices: [
      {
        label: "Issue worker equity shares on every hull",
        result: "Giving riggers a stake in orbital profits sparks joyful pride across {colony}'s floating docks.",
        shift: { mercy: 2, tradition: -1 },
        effects: [
          { kind: "morale", amount: 5 },
          { kind: "population", amount: 3 },
          { kind: "money", amount: -150 },
        ],
      },
      {
        label: "Hire mercenary bailiffs to reopen the lifts",
        result: "Cargo resumes moving on schedule and dividends stay high, though bitter resentment festers below the waves.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "money", amount: 180 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Invoke traditional guild arbitration courts",
        result: "Elder sea-brokers hammer out a modest wage bonus that honors custom while keeping yards humming.",
        shift: { tradition: 2 },
        effects: [
          { kind: "culture", amount: 95 },
          { kind: "factories", amount: 4 },
          { kind: "money", amount: -90 },
        ],
      },
    ],
  },

  // ================= ACT 2 (Turns 60-130) =================
  {
    id: "saga-orrun-2-shadow-bond",
    raceId: "orrun",
    act: 2,
    kind: "act",
    title: "The Sovereign Underwriter",
    art: "contact",
    text: "Secret envoys from the {rival} approach our merchant-banks near {star}, offering prime mining concessions if the Consortium quietly underwrites their war bonds against a third neighbor.",
    choices: [
      {
        label: "Underwrite the war bonds secretly",
        result: "Compound interest pours gold into {colony}'s vaults, though dirty money stains our commercial honor.",
        shift: { openness: -2, mercy: -1 },
        sets: ["underwrote-rival-war"],
        effects: [
          { kind: "money", amount: 280 },
          { kind: "factories", amount: 6 },
          { kind: "culture", amount: -80 },
        ],
      },
      {
        label: "Refuse and publish their war-bond prospectus",
        result: "Exposing the scheme warns the galaxy and lifts Orrun prestige, at the cost of fury from the {rival}.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 130 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -18 },
        ],
      },
      {
        label: "Counter with a joint peaceful trade loan",
        result: "Redirecting the {rival}'s credit into civilian shipping turns potential bloodshed into steady bilateral profit.",
        shift: { mercy: 1, openness: 1 },
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "money", amount: 150 },
          { kind: "research", field: "propulsion", amount: 170 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-2-proxy-seat",
    raceId: "orrun",
    act: 2,
    kind: "act",
    title: "The Purchased Bench",
    art: "council",
    text: "Ahead of interstellar deliberations, wealthy syndicates on {colony} propose buying up the debt of minor border delegates near {star} to lock in proxy voting blocs.",
    choices: [
      {
        label: "Buy out the delegates' debt in full",
        result: "Financial leverage bends diplomatic corridors to our will, though moralists call the Consortium a gilded cartel.",
        shift: { mercy: -1, tradition: -2 },
        sets: ["bought-proxy-blocs"],
        effects: [
          { kind: "relations", amount: 16 },
          { kind: "research", field: "computers", amount: 220 },
          { kind: "money", amount: -240 },
        ],
      },
      {
        label: "Ban debt-leverage in diplomatic chambers",
        result: "Upholding the old Sea-Guild code of clean scales earns respect across {colony} and beyond.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 135 },
          { kind: "morale", amount: 5 },
          { kind: "money", amount: -110 },
        ],
      },
      {
        label: "Endow transparent development grants instead",
        result: "Open infrastructure loans win genuine partners for Orrun shipyards without backroom coercion.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 95 },
          { kind: "money", amount: -200 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-2-pirate-insurance",
    raceId: "orrun",
    act: 2,
    kind: "act",
    title: "The Corsair Syndicate",
    art: "pirates",
    text: "Raiders preying on freighters near {star} offer a discreet protection racket: pay a quarterly retainer and Orrun hulls sail unmolested while the {rival}'s convoys burn.",
    choices: [
      {
        label: "Pay the retainer and divert raiders to the {rival}",
        result: "Our merchant lanes run smoothly while rival shipping bleeds, though captains whisper of blood-coin.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "money", amount: 230 },
          { kind: "relations", amount: -16 },
          { kind: "culture", amount: -60 },
        ],
      },
      {
        label: "Hire the corsairs openly as convoy escorts",
        result: "Legitimizing outlaws into licensed privateers swells our patrol roster and delights pragmatic traders.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "ships", template: "scout", count: 2 },
          { kind: "money", amount: -160 },
          { kind: "morale", amount: 3 },
        ],
      },
      {
        label: "Fund a joint anti-piracy patrol with the {rival}",
        result: "Coordinated naval sweeps clear {star}'s lanes and build unexpected trust with the {rival}.",
        shift: { mercy: 1, openness: 1 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "research", field: "weapons", amount: 180 },
          { kind: "money", amount: -150 },
        ],
      },
    ],
  },

// ================= ACT 3 (Turns 130-200) =================
  {
    id: "saga-orrun-3-debt-foreclosure",
    raceId: "orrun",
    act: 3,
    kind: "act",
    title: "The Sovereign Foreclosure",
    art: "crisis",
    text: "A famine-stricken border world near {star} defaults on heavy infrastructure loans held by {colony}'s merchant banks. Syndicate liquidators demand seizing the planet's orbital shipyards and conscripting its laborers to cover the note.",
    choices: [
      {
        label: "Foreclose and seize their orbital yards",
        result: "Cold contract enforcement adds factories and bullion to {colony}, though neighbors recoil at our ruthless accounting.",
        shift: { mercy: -2, tradition: 1 },
        sets: ["foreclosed-debtor-world"],
        effects: [
          { kind: "factories", amount: 8 },
          { kind: "money", amount: 240 },
          { kind: "relations", amount: -16 },
        ],
      },
      {
        label: "Forgive the principal and send relief grain",
        result: "Tearing up the debt wins heartfelt gratitude across {star}, even as bank directors howl at the write-off.",
        shift: { mercy: 2, openness: 1 },
        sets: ["forgave-sovereign-debt"],
        effects: [
          { kind: "culture", amount: 145 },
          { kind: "relations", amount: 18 },
          { kind: "money", amount: -220 },
        ],
      },
      {
        label: "Restructure into a fifty-year timber and ore lease",
        result: "Patient sea-guild terms keep the debtor world solvent while guaranteeing steady raw shipments to {colony}.",
        shift: { tradition: 1, mercy: 1 },
        sets: ["forgave-sovereign-debt"],
        effects: [
          { kind: "money", amount: 130 },
          { kind: "research", field: "planetology", amount: 210 },
          { kind: "morale", amount: 3 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-3-mint-counterfeit",
    raceId: "orrun",
    act: 3,
    kind: "act",
    title: "The Ghost Ducat",
    art: "anomaly",
    text: "Auditors on {colony} uncover a covert mint operating inside a submerged cavern near {star}, striking undetectable Consortium pearl-ducats to bankroll black-market weapons from the {rival}.",
    choices: [
      {
        label: "Nationalize the mint as a covert slush fund",
        result: "Untraceable currency supercharges weapons research and secret budgets, risking catastrophic inflation if exposed.",
        shift: { openness: -2, tradition: -2 },
        sets: ["kept-shadow-mint"],
        effects: [
          { kind: "money", amount: 290 },
          { kind: "research", field: "weapons", amount: 270 },
          { kind: "culture", amount: -110 },
        ],
      },
      {
        label: "Melt the dies publicly and recall tainted coin",
        result: "Painful deflation hits {colony}'s markets, yet foreign merchants hail the unassailable purity of Orrun currency.",
        shift: { tradition: 2, openness: 2 },
        sets: ["purged-shadow-mint"],
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "relations", amount: 16 },
          { kind: "money", amount: -210 },
        ],
      },
      {
        label: "Trace the dies to expose the {rival}'s gunrunners",
        result: "Quietly rolling up the smuggling ring yields encrypted trade logs without panicking {colony}'s exchanges.",
        shift: { openness: -1, mercy: 1 },
        sets: ["purged-shadow-mint"],
        effects: [
          { kind: "research", field: "computers", amount: 250 },
          { kind: "morale", amount: 4 },
          { kind: "relations", amount: -12 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-3-reef-cartel-coup",
    raceId: "orrun",
    act: 3,
    kind: "act",
    title: "Boardroom Mutiny",
    art: "crisis",
    text: "Three mega-syndicates controlling {colony}'s orbital elevators threaten to lock down planetary exports unless the Consortium abolishes public welfare tithes and hands them monopoly charters.",
    choices: [
      {
        label: "Break the cartels and nationalize the elevators",
        result: "Seizing the tethers lifts worker morale across {colony}, though panicked investors pull capital out of our exchanges.",
        shift: { mercy: 2, tradition: -1 },
        sets: ["broke-merchant-cartels"],
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "factories", amount: 7 },
          { kind: "money", amount: -230 },
        ],
      },
      {
        label: "Grant their monopolies for a cut of profits",
        result: "Cartel efficiency floods the state coffers with dividends while dockworkers groan under higher prices.",
        shift: { mercy: -2, openness: -1 },
        sets: ["crowned-merchant-cartels"],
        effects: [
          { kind: "money", amount: 300 },
          { kind: "factories", amount: 8 },
          { kind: "morale", amount: -6 },
        ],
      },
      {
        label: "Open the elevators to foreign shipping bids",
        result: "Inviting outside competition shatters the domestic monopoly and brings brisk interstellar commerce to {star}.",
        shift: { openness: 2, tradition: -2 },
        sets: ["broke-merchant-cartels"],
        effects: [
          { kind: "relations", amount: 15 },
          { kind: "money", amount: 160 },
          { kind: "culture", amount: -70 },
        ],
      },
    ],
  },

  // ================= ACT 4 (Turns 200+) =================
  {
    id: "saga-orrun-4-galactic-reserve",
    raceId: "orrun",
    act: 4,
    kind: "act",
    title: "The Pearl Standard",
    art: "council",
    text: "With Consortium clearinghouses dominating interstellar shipping near {star}, ministers on {colony} propose backing a galaxy-wide reserve currency—either as a transparent public trust or a private Orrun lever.",
    choices: [
      {
        label: "Charter an open multi-species reserve board",
        result: "Sharing monetary oversight makes the Orrun ducat the undisputed currency of peaceful trade across the stars.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "relations", amount: 24 },
          { kind: "money", amount: 260 },
        ],
      },
      {
        label: "Keep the clearinghouse keys strictly in Orrun vaults",
        result: "Unilateral control lets {colony} manipulate credit flows at will, enriching our treasury while breeding resentment.",
        shift: { openness: -2, mercy: -1 },
        effects: [
          { kind: "money", amount: 420 },
          { kind: "research", field: "computers", amount: 310 },
          { kind: "relations", amount: -20 },
        ],
      },
      {
        label: "Anchor the reserve to traditional pearl-guild bullion",
        result: "Tangible oceanic reserves reassure conservative investors and elevate ancestral Orrun prestige.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "culture", amount: 190 },
          { kind: "morale", amount: 6 },
          { kind: "factories", amount: 8 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-4-abyssal-ark",
    raceId: "orrun",
    act: 4,
    kind: "act",
    title: "The Deep-Trench Dividend",
    art: "victory",
    text: "Generations of oceanic engineering on {colony} yield colossal floating city-domes capable of either expanding our home seas or launching self-sustaining merchant-arks toward distant stars beyond {star}.",
    choices: [
      {
        label: "Subsidize free-port merchant arks for pioneers",
        result: "Eager sea-clans set sail to plant new commercial havens across the rim, thinning home labor pools.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "ships", template: "colony", count: 2 },
          { kind: "revealStars", count: 6 },
          { kind: "population", amount: -3 },
        ],
      },
      {
        label: "Anchor the mega-domes across {colony}'s oceans",
        result: "Vast floating metropolises expand habitable shelf-space and cradle a booming generation of artisans.",
        shift: { tradition: 1, mercy: 1 },
        effects: [
          { kind: "planetSize", amount: 7 },
          { kind: "population", amount: 5 },
          { kind: "money", amount: -320 },
        ],
      },
      {
        label: "Convert the hulls into automated mobile shipyards",
        result: "Industrial leviathans churn out hulls around the clock, driving domestic output to staggering heights.",
        shift: { mercy: -1, tradition: -2 },
        effects: [
          { kind: "factories", amount: 13 },
          { kind: "research", field: "construction", amount: 380 },
          { kind: "morale", amount: -6 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-4-reckoning-of-scales",
    raceId: "orrun",
    act: 4,
    kind: "act",
    title: "The Golden Reckoning",
    art: "council",
    text: "On the eve of the Consortium's bicentennial assembly at {colony}, elder sea-brokers ask whether Orrun greatness is measured by the warmth of our harbors or the weight of our vaults.",
    choices: [
      {
        label: "Endow a galaxy-wide maritime relief fund",
        result: "Orrun hospital-ships and grain freighters sail to every troubled star, turning wealth into enduring grace.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "culture", amount: 230 },
          { kind: "relations", amount: 22 },
          { kind: "money", amount: -340 },
        ],
      },
      {
        label: "Proclaim the Perpetual Dividend Doctrine",
        result: "Every citizen becomes a lifelong shareholder in Consortium conquest, supercharging industry at steep moral cost.",
        shift: { mercy: -2, tradition: -1 },
        effects: [
          { kind: "money", amount: 400 },
          { kind: "factories", amount: 11 },
          { kind: "culture", amount: -130 },
        ],
      },
      {
        label: "Restore the Ancient Tide-Guild Charter",
        result: "Binding commerce once more to ancestral sea-oaths brings serene pride and civic unity to {colony}.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 200 },
          { kind: "morale", amount: 8 },
          { kind: "money", amount: -220 },
        ],
      },
    ],
  },

  // ================= BRANCH BEATS (5) =================
  {
    id: "saga-orrun-branch-tidal-heirs",
    raceId: "orrun",
    act: 2,
    kind: "branch",
    needs: ["honored-tidal-trust"],
    title: "Children of the Reef Trust",
    art: "council",
    text: "Empowered by the civic trust we honored on {colony}, descendants of the old coastal clans petition to establish a public sea-academy near {star}, challenging traditional syndicate monopolies.",
    choices: [
      {
        label: "Charter the public reef-academy",
        result: "Vibrant scholarship lifts civic pride and research across {colony}, though old merchant houses lose prestige.",
        shift: { openness: 1, tradition: -1 },
        effects: [
          { kind: "culture", amount: 140 },
          { kind: "research", field: "planetology", amount: 210 },
          { kind: "money", amount: -130 },
        ],
      },
      {
        label: "Merge the trust into existing guild halls",
        result: "Folding the coastal heirs into established merchant lineages keeps boardrooms calm and productive.",
        shift: { tradition: 2, openness: -1 },
        effects: [
          { kind: "factories", amount: 6 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: 110 },
        ],
      },
      {
        label: "Fund coastal trade expeditions for the heirs",
        result: "Reef-born captains chart outer currents and open fresh commercial contacts.",
        shift: { openness: 2, mercy: 1 },
        effects: [
          { kind: "revealStars", count: 4 },
          { kind: "money", amount: 140 },
          { kind: "morale", amount: -2 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-branch-war-bond-leak",
    raceId: "orrun",
    act: 3,
    kind: "branch",
    needs: ["underwrote-rival-war"],
    title: "The Blood-Coin Ledger",
    art: "crisis",
    text: "A disgruntled clerk at {colony} leaks proof that Consortium banks secretly financed the {rival}'s border offensive near {star}, sparking outrage among neutral trading partners.",
    choices: [
      {
        label: "Publish the books and pay war-victim reparations",
        result: "Steep restitution drains our vaults, yet stunned neighbors praise our sudden candor.",
        shift: { mercy: 2, openness: 2 },
        effects: [
          { kind: "relations", amount: 18 },
          { kind: "culture", amount: 130 },
          { kind: "money", amount: -280 },
        ],
      },
      {
        label: "Silence the clerk and double down on arms loans",
        result: "Ruthless secrecy protects our compound interest while driving foreign diplomats away in disgust.",
        shift: { mercy: -2, openness: -2 },
        effects: [
          { kind: "money", amount: 290 },
          { kind: "research", field: "weapons", amount: 240 },
          { kind: "relations", amount: -20 },
        ],
      },
      {
        label: "Force the {rival} to convert war debt into grain trade",
        result: "Shrewd financial leverage turns toxic war bonds into peaceful civilian shipments for {colony}.",
        shift: { tradition: 1, mercy: 1 },
        effects: [
          { kind: "population", amount: 3 },
          { kind: "morale", amount: 4 },
          { kind: "money", amount: -140 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-branch-foreclosed-revolt",
    raceId: "orrun",
    act: 4,
    kind: "branch",
    needs: ["foreclosed-debtor-world"],
    blockedBy: ["forgave-sovereign-debt"],
    title: "Uprising on the Lien-World",
    art: "crisis",
    text: "Indebted dockworkers on the border world we foreclosed near {star} seize the orbital shipyards, broadcasting images of Consortium bailiffs confiscating family heirlooms to {colony}.",
    choices: [
      {
        label: "Cancel the remaining liens and grant self-rule",
        result: "Relinquishing our harsh claim heals galactic outrage and restores civic dignity on {colony}.",
        shift: { mercy: 2, openness: 1 },
        effects: [
          { kind: "culture", amount: 210 },
          { kind: "relations", amount: 20 },
          { kind: "factories", amount: -6 },
        ],
      },
      {
        label: "Deploy heavy security cruisers to crush the strike",
        result: "Brutal orbital enforcement keeps foundry quotas running, though the galaxy brands us heartless slavers.",
        shift: { mercy: -2, openness: -1 },
        effects: [
          { kind: "factories", amount: 10 },
          { kind: "money", amount: 310 },
          { kind: "relations", amount: -22 },
        ],
      },
      {
        label: "Buy out the workers with guild pension bonds",
        result: "Turning rebels into minor shareholders restores dockyard peace at steep treasury cost.",
        shift: { tradition: 1, mercy: 1 },
        effects: [
          { kind: "morale", amount: 6 },
          { kind: "factories", amount: 5 },
          { kind: "money", amount: -320 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-branch-mint-collapse",
    raceId: "orrun",
    act: 4,
    kind: "branch",
    needs: ["kept-shadow-mint"],
    blockedBy: ["purged-shadow-mint"],
    title: "The Gilded Panic",
    art: "crisis",
    text: "Foreign clearinghouses detect subtle alloy flaws in ducats struck by our secret cavern mint near {star}, triggering a bank run across {colony}'s orbital exchanges.",
    choices: [
      {
        label: "Back every ducat with sovereign pearl reserves",
        result: "Emptying state bullion vaults halts the panic and saves the Consortium's commercial name.",
        shift: { tradition: 2, openness: 1 },
        effects: [
          { kind: "culture", amount: 190 },
          { kind: "morale", amount: 6 },
          { kind: "money", amount: -390 },
        ],
      },
      {
        label: "Freeze foreign withdrawals and seize exchange assets",
        result: "Capital controls keep {colony}'s treasury liquid while stranding allied merchants with worthless paper.",
        shift: { openness: -2, mercy: -2 },
        effects: [
          { kind: "money", amount: 350 },
          { kind: "factories", amount: 8 },
          { kind: "relations", amount: -24 },
        ],
      },
      {
        label: "Pin the counterfeit plates on agents of the {rival}",
        result: "A slick intelligence cover-up deflects market blame onto the {rival}, stoking border hostility.",
        shift: { openness: -1, tradition: -1 },
        effects: [
          { kind: "research", field: "computers", amount: 290 },
          { kind: "morale", amount: 3 },
          { kind: "relations", amount: -18 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-branch-cartel-ultimatum",
    raceId: "orrun",
    act: 4,
    kind: "branch",
    needs: ["crowned-merchant-cartels"],
    blockedBy: ["broke-merchant-cartels"],
    title: "The Syndicate Crown",
    art: "council",
    text: "Grown richer than the state itself, the mega-syndicates we empowered on {colony} summon the Consortium's elected ministers to sign over planetary taxation rights.",
    choices: [
      {
        label: "Submit and reorganize as a corporate board",
        result: "Ruthless syndicate rule maximizes industrial output and credit flow while extinguishing civic democracy.",
        shift: { mercy: -2, tradition: -2 },
        effects: [
          { kind: "money", amount: 410 },
          { kind: "factories", amount: 12 },
          { kind: "culture", amount: -160 },
        ],
      },
      {
        label: "Rally the naval fleets to arrest the cartel lords",
        result: "Armed reclamation restores public sovereignty on {colony} amid bitter street-and-dock fighting.",
        shift: { tradition: 2, mercy: 1 },
        effects: [
          { kind: "culture", amount: 200 },
          { kind: "morale", amount: 7 },
          { kind: "factories", amount: -7 },
        ],
      },
      {
        label: "Invite foreign trade guilds to buy out cartel shares",
        result: "Diluting domestic monopolies with interstellar capital breaks the syndicate's stranglehold.",
        shift: { openness: 2, tradition: -1 },
        effects: [
          { kind: "relations", amount: 20 },
          { kind: "money", amount: 240 },
          { kind: "morale", amount: -4 },
        ],
      },
    ],
  },
];

export const ENDINGS: SagaEnding[] = [
  {
    id: "saga-orrun-end-harbor-of-trust",
    raceId: "orrun",
    needs: { openness: { min: 5 }, mercy: { min: 4 } },
    title: "The Open Harbor",
    art: "council",
    text: "By choosing fair scales, generous credit, and transparent ports at every tide, the Orrun Consortium becomes the indispensable clearinghouse of the Galactic Council.",
    outcome: "councilFavour",
    choices: [
      {
        label: "Open the ledgers to every star",
        result: "Unmatched commercial trust grants the Consortium decisive sway in every council session.",
        effects: [
          { kind: "culture", amount: 220 },
          { kind: "relations", amount: 24 },
          { kind: "money", amount: 300 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-end-gilded-leviathan",
    raceId: "orrun",
    needs: { mercy: { max: -4 }, openness: { max: -4 } },
    title: "The Iron Bourse",
    art: "crisis",
    text: "Through debt-traps, secret mints, and merciless foreclosures, the Consortium turns interstellar finance into a weapon—every empire hates our greed, yet none dares default on our fleets.",
    outcome: "everyoneFearsUs",
    choices: [
      {
        label: "Call in every sovereign note",
        result: "Rival treasuries tremble before Orrun debt-collectors, buying cold peace through financial dread.",
        effects: [
          { kind: "money", amount: 420 },
          { kind: "factories", amount: 11 },
          { kind: "relations", amount: -25 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-end-tide-guild-renaissance",
    raceId: "orrun",
    needs: { tradition: { min: 5 } },
    title: "The Eternal Tide-Guild",
    art: "victory",
    text: "Anchored to ancestral sea-oaths and honest bullion, {colony} enters a luminous age of oceanic craftsmanship, thriving ports, and serene civic pride.",
    outcome: "goldenAge",
    choices: [
      {
        label: "Sail with the ancient tide",
        result: "Bustling floating markets and soaring reef-spires usher in an Orrun golden age.",
        effects: [
          { kind: "culture", amount: 230 },
          { kind: "morale", amount: 8 },
          { kind: "money", amount: 320 },
        ],
      },
    ],
  },
  {
    id: "saga-orrun-end-merchant-empire",
    raceId: "orrun",
    title: "The Grand Bourse",
    art: "victory",
    text: "Balancing shrewd risk with pragmatic diplomacy, the Orrun Consortium builds a vast commercial network whose treasure fleets fund a monumental galactic undertaking.",
    outcome: "greatWorkSurge",
    choices: [
      {
        label: "Underwrite the grand design",
        result: "Syndicate capital and logistics surge into our monumental project across {colony}.",
        effects: [
          { kind: "money", amount: 350 },
          { kind: "factories", amount: 10 },
          { kind: "culture", amount: 180 },
        ],
      },
    ],
  },
];
