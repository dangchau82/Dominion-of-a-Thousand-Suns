// Stage 4 AI. Plays to win with the same information and the same commands as
// the player: it reads only its EmpireView and acts only through commands.
// No bonuses of any kind. Personality (from the race) shapes its choices:
// aggressive races arm early and pick fights, curious ones research more,
// honorable ones keep the peace longer.
//
// Turn plan: assess -> diplomacy (war/peace) -> research -> ship designs ->
// colony production -> scouts and colony ships -> war fleets and invasions.

import type { Command } from "../engine/commands";
import { WAKE_COST, WAKE_TECH } from "../engine/leviathans";
import { bayPart, canUseFuelTanks, designStats, fighterBayChoices, partChoices, weaponFitsHull, type DesignSpec } from "../engine/designs";
import type { ProposalInput } from "../engine/diplomacy";
import { fieldTier, researchChoices } from "../engine/tech";
import { COLONY_POD, FUEL_TANKS, MAX_DESIGNS, isCapitalHull, maxMissileBases, type HullSize, type ShipDesign, type ShipClass } from "../engine/data/ships";
import { TECHS, type Tech } from "../engine/data/techs";

const TECH_TIERS = new Map(TECHS.map((t) => [t.id, t.tier]));
import type { ColonyInfo, EmpireView, KnownEmpire, PublicStar } from "../engine/view";
import { BLAST_LOSS, INNER as SUPERNOVA_INNER, REACH as SUPERNOVA_REACH, supernovaPlanOf } from "../engine/supernova";
import type { AutopilotFocus, Fleet, Id, ResearchField, SliderSet } from "../engine/types";

// ---------- helpers ----------

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

/** A fixed "coin flip" from the turn and ids, so the AI varies without hidden randomness. */
function coin(view: EmpireView, salt: number): number {
  const h = Math.sin((view.turn + 1) * 12.9898 + (view.me.id + 1) * 78.233 + salt * 37.719) * 43758.5453;
  return h - Math.floor(h);
}

function isWarship(d: ShipDesign | undefined): boolean {
  return !!d && d.role === "warship" && d.weapons.length > 0;
}

/** Colony ship types in a fleet, longest range first. */
function colonyIds(ctx: Ctx, ships: Record<string, number>): string[] {
  return Object.keys(ships).filter((id) => (ships[id] ?? 0) > 0 && ctx.designs.get(id)?.role === "colony")
    .sort((a, b) => (ctx.designs.get(b)!.extraRange - ctx.designs.get(a)!.extraRange) || (a < b ? -1 : 1));
}

/** Could a ship of this type reach the star from our colonies? */
function canReach(ctx: Ctx, starId: Id, shipId: string): boolean {
  const any = ctx.view.fleets[0];
  const probe = { id: -1, empireId: ctx.view.me.id, x: 0, y: 0, starId: null, destStarId: null, ...(any ?? {}), ships: { [shipId]: 1 } } as Fleet;
  return ctx.view.reachable(starId, probe);
}

/** Is growth blocked by fuel range or by which planets we can live on? Drives research. */
function boxedIn(ctx: Ctx): { range: boolean; hostility: boolean } {
  const { view } = ctx;
  const pod = bestColonyDesign(ctx);
  const free = view.stars.filter((s) => view.knowledge[s.id]?.ownerId == null);
  const settle = free.filter((s) => view.canSettle(s.id));
  const settleReach = settle.filter((s) => canReach(ctx, s.id, pod)).length;
  const unexplored = view.stars.filter((s) => !view.knowledge[s.id]?.explored);
  const unexploredReach = unexplored.filter((s) => canReach(ctx, s.id, "scout")).length;
  const harshReach = free.filter((s) => view.knowledge[s.id]?.explored && view.knowledge[s.id]?.planet && !view.canSettle(s.id) && canReach(ctx, s.id, pod)).length;
  return {
    range: settleReach < 2 && (settle.length > settleReach || (unexplored.length > 0 && unexploredReach === 0)),
    hostility: settleReach < 2 && harshReach >= 1,
  };
}

/** Best colony ship to build: our own long-range design if we have one, otherwise the standard one. */
function bestColonyDesign(ctx: Ctx): string {
  const own = ctx.view.designs.filter((d) => d.role === "colony" && d.empireId !== null).sort((a, b) => b.extraRange - a.extraRange);
  return own[0]?.id ?? "colony";
}

/** Autopilot focus: how the AI bends its race's usual habits. "balanced" leaves them alone. */
interface FocusKnobs {
  aggression?: number; curiosity?: number;
  fleet: number; settlePop: number; spies: number;
  research: Partial<Record<ResearchField, number>>;
}
const FOCUS: Record<AutopilotFocus, FocusKnobs> = {
  balanced: { fleet: 1, settlePop: 25, spies: 0, research: {} },
  warlike: { aggression: 0.85, fleet: 1.7, settlePop: 30, spies: 0, research: { weapons: 25, forceFields: 15, computers: 5 } },
  industrial: { aggression: 0.25, fleet: 0.8, settlePop: 30, spies: 0, research: { construction: 30, planetology: 10 } },
  expansion: { fleet: 0.8, settlePop: 15, spies: 0, research: { propulsion: 25, planetology: 25 } },
  science: { curiosity: 0.95, fleet: 0.8, settlePop: 30, spies: 0, research: { computers: 30 } },
  spies: { fleet: 0.9, settlePop: 25, spies: 2, research: { computers: 20 } },
};

/** How seriously the AI plays at each difficulty. Same information and rules at every level. */
const LEVEL = {
  relaxed: { fleet: 0.5, edge: 0.6, firstWar: 140, warMood: 0.3, troops: 2.2 }, // 2026-11-26: firstWar 110 -> 140, warMood 0.4 -> 0.3 (relaxed started more wars than hard on the test seeds)
  normal: { fleet: 1, edge: 0, firstWar: 50, warMood: 1, troops: 1.7 },
  hard: { fleet: 1.35, edge: -0.25, firstWar: 35, warMood: 1.6, troops: 1.5 },
  // Master difficulty: the Master AI plays on top of the basic AI with hard-level fleets (it filters out wars of choice itself).
  master: { fleet: 1.35, edge: -0.25, firstWar: 35, warMood: 1.6, troops: 1.5 },
};

interface Ctx {
  /** An empire close to winning that everyone should stop (never us). */
  threat: Id | null;
  level: (typeof LEVEL)["normal"];
  view: EmpireView;
  cmds: Command[];
  designs: Map<string, ShipDesign>;
  focus: FocusKnobs;
  /** Empires we accepted a deal from this turn: no war on them the same turn. */
  dealtWith: Set<Id>;
  aggression: number;
  honor: number;
  curiosity: number;
  wars: KnownEmpire[];
  /** Stars we already sent something to this turn or earlier. */
  taken: Set<Id>;
  starById: Map<Id, PublicStar>;
}

function warPower(ctx: Ctx, f: Fleet): number {
  let p = 0;
  for (const [id, n] of Object.entries(f.ships)) {
    const d = ctx.designs.get(id);
    if (isWarship(d)) p += d!.cost * n;
  }
  return p;
}

function idle(f: Fleet): boolean {
  return f.starId !== null && f.destStarId === null;
}

function enemyColonies(ctx: Ctx, empireId: Id) {
  return Object.entries(ctx.view.knowledge)
    .filter(([, k]) => k.ownerId === empireId && k.planet)
    .map(([id, k]) => ({ star: ctx.starById.get(Number(id))!, pop: k.population ?? 10, lastSeen: k.lastSeen }));
}

function knownPop(ctx: Ctx, empireId: Id): number {
  return enemyColonies(ctx, empireId).reduce((a, c) => a + c.pop, 0);
}

function myPop(ctx: Ctx): number {
  return ctx.view.colonies.reduce((a, c) => a + c.population, 0);
}

function nearestColony(ctx: Ctx, p: { x: number; y: number }): ColonyInfo | undefined {
  return [...ctx.view.colonies].sort((a, b) => dist(ctx.starById.get(a.starId)!, p) - dist(ctx.starById.get(b.starId)!, p))[0];
}

// ---------- diplomacy ----------

function diplomacy(ctx: Ctx): void {
  const { view, cmds } = ctx;
  const mine = myPop(ctx);
  let availableTreasury = view.me.treasury;
  // The Grand Coalition (coalition.ts): when the galaxy unites against a giant, make peace with
  // everyone else and point every war at the giant.
  const giant = view.coalition.leaderId;
  const inCoalition = giant !== null && giant !== view.me.id;
  if (inCoalition) ctx.threat = giant;
  for (const c of view.contacts) {
    if (!c.alive) continue;
    const theirs = knownPop(ctx, c.id);
    if (c.warSince !== null && inCoalition && c.id !== giant && !c.weOfferedPeace) { cmds.push({ type: "offerPeace", targetId: c.id }); continue; }
    if (c.warSince !== null) {
      const length = view.turn - c.warSince;
      // Losing badly: sue for peace with a gift (Gemini, coding test 2026-11-25).
      if (!c.weOfferedPeace && length >= 10 && theirs > mine * 2.5) {
        const giftBc = Math.max(50, Math.floor(availableTreasury * 0.2));
        if (availableTreasury >= giftBc) {
          cmds.push({ type: "gift", to: c.id, bc: giftBc });
          availableTreasury -= giftBc;
        }
        cmds.push({ type: "offerPeace", targetId: c.id });
        continue;
      }
      const losing = theirs > mine * 1.2;
      if (c.id === ctx.threat) continue;
      if (c.offersPeace && (length >= 10 + Math.round(ctx.aggression * 20) || losing)) cmds.push({ type: "offerPeace", targetId: c.id });
      else if (!c.weOfferedPeace && length >= 15 && (losing || coin(view, c.id) < 0.05 * (1 - ctx.aggression))) cmds.push({ type: "offerPeace", targetId: c.id });
      // War-weariness: endless wars wear everyone down.
      else if (!c.weOfferedPeace && length >= 50 && coin(view, 31 + c.id) < 0.15 + (length - 50) * 0.01) cmds.push({ type: "offerPeace", targetId: c.id });
    }
  }
  // Stop a runaway leader: war on them, and rally others.
  if (ctx.threat !== null) {
    const t = view.contacts.find((c) => c.id === ctx.threat)!;
    // Never fight more than two wars at once: allies' calls and runaway leaders can't drag us into a dogpile.
    if (t.warSince === null && !t.treaties.includes("alliance") && ctx.wars.length < 2) {
      const others = view.contacts.filter((c) => c.id !== t.id && c.alive).length;
      if (mine >= knownPop(ctx, t.id) * 0.25 || others >= 2) { cmds.push({ type: "declareWar", targetId: t.id }); return; }
    }
  }
  // Start at most one war at a time, and only once established. No side wars while the coalition stands.
  if (ctx.wars.length > 0 || view.turn < ctx.level.firstWar || inCoalition) return;
  const myFleet = view.fleets.reduce((a, f) => a + warPower(ctx, f), 0);
  const candidates = view.contacts
    // Honorable races keep their pacts.
    .filter((c) => c.alive && c.warSince === null && !(ctx.honor >= 0.4 && (c.treaties.includes("nap") || c.treaties.includes("alliance"))))
    .filter((c) => !c.treaties.includes("alliance") && !ctx.dealtWith.has(c.id))
    // Partners we trade or research with are friends unless we're truly ruthless.
    .filter((c) => ctx.honor < 0.3 || !(c.treaties.includes("research") || c.treaties.includes("trade")))
    .map((c) => {
      const cols = enemyColonies(ctx, c.id);
      const near = cols.length ? Math.min(...cols.map((x) => dist(x.star, nearestColony(ctx, x.star) ? ctx.starById.get(nearestColony(ctx, x.star)!.starId)! : x.star))) : 99;
      const theirs = knownPop(ctx, c.id);
      // Old wrongs make a target more tempting: up to a third more for a full grudge.
      return { c, near, ratio: (mine / Math.max(1, theirs)) * (1 + (c.grudge?.points ?? 0) / 180), cols: cols.length };
    })
    .filter((x) => x.cols > 0 && x.near <= 8)
    .sort((a, b) => b.ratio - a.ratio);
  const best = candidates[0];
  if (!best) return;
  // Aggressive races need less of an edge; honorable ones rarely start wars.
  const needRatio = 1.1 + (1 - ctx.aggression) * 1.2 + ctx.honor * 0.4 + ctx.level.edge;
  const armed = myFleet >= 300 + view.turn * 2;
  const mood = coin(view, 99 + best.c.id) < (0.04 + ctx.aggression * 0.08) * ctx.level.warMood;
  if (best.ratio >= needRatio && armed && mood) cmds.push({ type: "declareWar", targetId: best.c.id });
}

// ---------- treaties, trades and spies ----------

const tierOf = (id: string) => Number(TECH_TIERS.get(id) ?? 1);

/** Answers to proposals addressed to us. Also used for instant replies to the player. */
function answers(ctx: Ctx): void {
  const { view, cmds } = ctx;
  const mine = myPop(ctx);
  for (const p of view.proposals.filter((x) => x.to === view.me.id)) {
    const c = view.contacts.find((x) => x.id === p.from);
    if (!c) continue;
    const rel = c.ourFeeling;
    const theirs = knownPop(ctx, c.id);
    let ok = false;
    switch (p.kind) {
      case "trade": case "research": ok = rel >= -15 && c.warSince === null; break;
      case "nap": ok = rel >= 5 || theirs > mine * 1.4; break;
      case "alliance": ok = rel >= 45; break;
      case "techSwap": ok = rel >= -20 && tierOf(p.offerTech!) >= tierOf(p.wantTech!) - (rel >= 30 ? 1 : 0); break;
      case "tribute": ok = theirs > mine * 1.5 && ctx.aggression < 0.6 && (!p.bc || p.bc <= view.me.treasury * 0.5); break;
      case "cede": {
        // Peace terms: hand over a few worlds to end a war we are losing, but never most of the empire.
        const given = view.colonies.filter((x) => p.stars?.includes(x.starId)).reduce((a, x) => a + x.population, 0);
        const share = given / Math.max(1, mine);
        const length = c.warSince === null ? 0 : view.turn - c.warSince;
        ok = c.warSince !== null && length >= 8 && p.from !== ctx.threat
          && ((theirs > mine * 1.4 && share <= 0.3) || (theirs > mine * 2.5 && share <= 0.5));
        break;
      }
      case "joinWar": {
        const target = p.targetId !== undefined ? knownPop(ctx, p.targetId) : 0;
        ok = ctx.wars.length < 2 && (p.targetId === ctx.threat || ((rel >= 35 || c.treaties.includes("alliance")) && mine >= target * 0.8));
        break;
      }
    }
    cmds.push({ type: "respond", proposalId: p.id, accept: ok });
    if (ok) ctx.dealtWith.add(p.from);
  }
}

function deals(ctx: Ctx): void {
  const { view, cmds } = ctx;
  if ((view.turn + view.me.id * 3) % 8 !== 0) return;
  const mine = myPop(ctx);
  const pending = new Set(view.proposals.filter((p) => p.from === view.me.id).map((p) => `${p.to}:${p.kind}`));
  for (const c of view.contacts) {
    if (!c.alive) continue;
    const rel = c.ourFeeling;
    const ask = (proposal: ProposalInput) => { if (!pending.has(`${c.id}:${proposal.kind}`)) cmds.push(propose(c.id, proposal)); };
    if (c.warSince === null) {
      if (!c.treaties.includes("trade") && rel >= -5) ask({ kind: "trade" });
      else if (!c.treaties.includes("research") && rel >= 10) ask({ kind: "research" });
      else if (!c.treaties.includes("nap") && rel >= 20) ask({ kind: "nap" });
      else if (!c.treaties.includes("alliance") && rel >= 55 && ctx.honor >= 0.5) ask({ kind: "alliance" });
      // Swap a tech of ours for one of theirs at a similar level.
      if (rel >= 15 && (view.turn + c.id) % 16 < 8 && c.theirTechs.length && c.ourTechs.length) {
        const want = [...c.theirTechs].sort((a, b) => tierOf(b) - tierOf(a))[0]!;
        const offer = [...c.ourTechs].sort((a, b) => tierOf(a) - tierOf(b)).find((id) => tierOf(id) >= tierOf(want));
        if (offer) ask({ kind: "techSwap", offerTech: offer, wantTech: want });
      }
      // Bullies demand tribute from much weaker neighbours.
      if (ctx.aggression > 0.55 && rel < 10 && c.theirTechs.length && mine > knownPop(ctx, c.id) * 1.8 && coin(view, 7 + c.id) < 0.3) {
        ask({ kind: "tribute", wantTech: [...c.theirTechs].sort((a, b) => tierOf(b) - tierOf(a))[0]! });
      }
    }
    // Winning a war: offer peace in exchange for their worlds nearest ours (never what looks like their capital).
    if (c.warSince !== null && view.turn - c.warSince >= 12) {
      const theirs = knownPop(ctx, c.id);
      if (theirs > 0 && mine > theirs * 1.6) {
        const cols = enemyColonies(ctx, c.id);
        const biggest = [...cols].sort((x, y) => y.pop - x.pop)[0]?.star.id;
        const n = mine > theirs * 3 ? 3 : mine > theirs * 2.2 ? 2 : 1;
        const near = (s: { x: number; y: number }) => { const m = nearestColony(ctx, s); return m ? dist(ctx.starById.get(m.starId)!, s) : 99; };
        const stars = cols.filter((x) => x.star.id !== biggest).sort((x, y) => near(x.star) - near(y.star) || x.star.id - y.star.id).slice(0, n).map((x) => x.star.id);
        if (stars.length) ask({ kind: "cede", stars });
      }
    }
    // Ask friends to join our wars; ask everyone to stop a runaway leader.
    for (const w of ctx.wars) {
      if (c.id !== w.id && c.warSince === null && (rel >= 35 || c.treaties.includes("alliance") || w.id === ctx.threat)) ask({ kind: "joinWar", targetId: w.id });
    }
  }
}

function propose(to: Id, proposal: ProposalInput): Command {
  return { type: "propose", to, proposal };
}

function espionage(ctx: Ctx): void {
  const { view, cmds } = ctx;
  if ((view.turn + view.me.id) % 10 !== 2) return;
  // Restless worlds need more internal security.
  const unrest = Math.max(0, ...view.colonies.map((c) => c.unrest ?? 0));
  const calm = unrest >= 55 ? 5 : unrest >= 40 ? 3 : unrest >= 25 ? 1 : 0;
  cmds.push({ type: "setSecurity", percent: Math.min(10, 2 + Math.round(ctx.aggression * 2) + (ctx.wars.length ? 2 : 0) + (ctx.focus.spies ? 2 : 0) + calm) });
  for (const c of view.contacts) {
    if (!c.alive) continue;
    const atWar = c.warSince !== null;
    const base = atWar ? 3 : c.ourFeeling < -25 ? 2 : ctx.curiosity > 0.7 && c.theirTechs.length > 5 ? 1 : 0;
    const alloc = Math.min(6, base + ctx.focus.spies);
    const saboteur = ctx.focus.spies > 0 && (atWar || c.ourFeeling < 0);
    // Against a runaway leader, fund rebels in its worlds; spy empires at war also stir up unrest.
    const mission = atWar && c.id === ctx.threat ? "fundRebels"
      : saboteur && coin(view, 57 + c.id) < 0.4 ? "inciteUnrest"
      : (atWar && ctx.aggression > 0.5) || saboteur ? "sabotage" : alloc > 0 ? "steal" : "watch";
    if (alloc > 0 || (c.spies?.alloc ?? 0) > 0) cmds.push({ type: "setSpies", targetId: c.id, alloc, mission });
  }
}

// ---------- buildings and leaders ----------

const BUILD_PRIORITY: Record<string, (ctx: Ctx, c: ColonyInfo) => number> = {
  "research-institute": (x) => 5 + x.curiosity * 4,
  "automated-foundry": () => 6,
  "hydroponic-farms": (_x, c) => (c.population > c.capacity - 4 ? 7 : 2),
  "arcology": (_x, c) => (c.population > c.capacity - 6 ? 8 : 3),
  "spaceport": () => 4,
  "orbital-drydock": (x, c) => (c.isCapital || c.population > 40 ? 3 + x.aggression * 5 : 0),
  "civic-forum": (_x, c) => ((c.unrest ?? 0) >= 25 ? 9 : 3),
  "grand-theater": (_x, c) => ((c.unrest ?? 0) >= 25 ? 9 : 3),
  "planetary-fortress": (x) => (x.wars.length ? 7 : 0.5),
};

function civilization(ctx: Ctx): void {
  const { view, cmds } = ctx;
  for (const c of view.colonies) {
    const options = view.buildable(c.starId);
    if (c.buildQueue && options.includes(c.buildQueue)) {
      // Rich empires finish things early.
      const cost = view.buyCost(c.starId);
      if (cost > 0 && view.me.treasury > cost * 2.5 && view.me.treasury > 600) cmds.push({ type: "buyBuilding", starId: c.starId });
      continue;
    }
    if (c.population < 8) continue;
    const prod = c.budget.production;
    let best: string | null = null;
    let bestScore = 0;
    for (const id of options) {
      let score: number;
      if (id === "w-ascension") score = c.isCapital ? 100 : 0;
      else if (id.startsWith("w-")) score = c.isCapital && prod > 120 && view.turn > 60 ? 5 + ctx.curiosity * 3 : 0;
      else score = BUILD_PRIORITY[id]?.(ctx, c) ?? 1;
      if (score > bestScore) { bestScore = score; best = id; }
    }
    if (best) cmds.push({ type: "setBuilding", starId: c.starId, buildingId: best });
  }
  // Leaders first (offers don't last), then don't sit on a hoard: buy buildings, then fund ships.
  const offer = view.me.leaderOffer;
  let reserve = 150 + view.turn * 1.5;
  if (offer && view.me.leaders.length < 3 && view.me.treasury >= offer.cost * 1.1) { cmds.push({ type: "hireLeader" }); reserve += offer.cost; }
  let spare = view.me.treasury - reserve;
  for (const c of [...view.colonies].sort((a, b) => view.buyCost(a.starId) - view.buyCost(b.starId))) {
    const cost = view.buyCost(c.starId);
    if (cost > 0 && cost <= spare * 0.5) { cmds.push({ type: "buyBuilding", starId: c.starId }); spare -= cost; }
  }
  // Treasury projects (money sinks): at most one a turn, only from real surplus.
  spare -= treasuryProject(ctx, spare);
  // Edicts: calm a restless world, or push a strong one, with what is left.
  spare -= edict(ctx, spare);
  // Fund every shipyard, warship yards first, so a big hoard turns into ships instead of piling up.
  const yards = view.colonies
    .filter((c) => c.buildTemplate)
    .sort((a, b) => Number(ctx.designs.get(b.buildTemplate!)?.role === "warship") - Number(ctx.designs.get(a.buildTemplate!)?.role === "warship"));
  let pool = spare * (ctx.wars.length ? 0.7 : 0.5);
  for (const yard of yards) {
    if (pool < 100) break;
    const bc = Math.floor(Math.min(pool, Math.max(150, pool / 2)));
    cmds.push({ type: "fundShips", starId: yard.starId, bc });
    pool -= bc;
  }
}

/** Issue at most one edict a turn: relief for the most restless colony first, else a boost for the biggest producer. Returns its cost. */
function edict(ctx: Ctx, spare: number): number {
  const { view } = ctx;
  if (spare < 200) return 0;
  const free = view.colonies.filter((c) => !c.edict);
  const restless = [...free].sort((a, b) => (b.unrest ?? 0) - (a.unrest ?? 0) || a.starId - b.starId)[0];
  if (restless && (restless.unrest ?? 0) >= 40) {
    const o = view.edicts(restless.starId).filter((x) => !x.why && x.unrest < 0 && x.cost <= spare * 0.5).sort((a, b) => a.unrest - b.unrest || a.cost - b.cost)[0];
    if (o) { ctx.cmds.push({ type: "issueEdict", starId: restless.starId, edictId: o.id }); return o.cost; }
  }
  if (spare < 800) return 0;
  const key = ctx.wars.length || ctx.curiosity < 0.6 ? "production" : "research";
  const big = [...free].filter((c) => (c.unrest ?? 0) < 25).sort((a, b) => b.budget.production - a.budget.production || a.starId - b.starId)[0];
  if (!big) return 0;
  const o = view.edicts(big.starId).filter((x) => !x.why && (x.colony[key] ?? 0) > 0 && x.populationCost === 0 && x.unrest <= 8 && x.cost + 300 <= spare)
    .sort((a, b) => (b.colony[key] ?? 0) - (a.colony[key] ?? 0) || a.cost - b.cost)[0];
  if (!o) return 0;
  ctx.cmds.push({ type: "issueEdict", starId: big.starId, edictId: o.id });
  return o.cost;
}

/** Proclaim the policy that suits this empire's character and situation when a slot is free (one a turn). */
function proclamations(ctx: Ctx): void {
  const { view } = ctx;
  const { slots, options } = view.proclamations;
  if (options.filter((o) => o.activeUntil !== null).length >= slots) return;
  const p = view.race.personality;
  const atWar = ctx.wars.length > 0;
  const worst = Math.max(0, ...view.colonies.map((c) => c.unrest ?? 0));
  const score = (o: (typeof options)[number]): number => {
    const b = o.bonus;
    let s = (b.production ?? 0) * 1
      + (b.research ?? 0) * (0.6 + 0.8 * ctx.curiosity)
      + (b.growth ?? 0) * (view.turn < 120 ? 1 : 0.6)
      + (b.trade ?? 0) * (0.4 + 0.6 * p.greed)
      + (b.culture ?? 0) * (0.4 + 0.6 * p.pride)
      + (b.spying ?? 0) * 0.3
      + (b.attack ?? 0) * (atWar ? 0.12 : 0.05 * ctx.aggression)
      + (b.range ?? 0) * (view.turn < 100 ? 0.04 : 0.015)
      + (b.relations ?? 0) * (atWar ? 0.0005 : 0.002);
    s -= (o.unrest / 100) * (worst >= 25 ? 1.5 : 0.5);
    s -= (o.upkeep / Math.max(300, view.me.treasury)) * 0.5;
    return s;
  };
  const best = options
    .filter((o) => !o.why && view.me.treasury >= o.upkeep * 8 + 200)
    .map((o) => ({ o, s: score(o) }))
    .sort((a, b) => b.s - a.s || (a.o.id < b.o.id ? -1 : 1))[0];
  if (best && best.s > 0.03) ctx.cmds.push({ type: "proclaim", proclamationId: best.o.id });
}

/** Pick one treasury project to buy with surplus money; returns what it costs (0 if none). */
function treasuryProject(ctx: Ctx, spare: number): number {
  const { view } = ctx;
  const ok = (id: string, margin: number) => {
    const o = view.moneySinks.find((s) => s.id === id);
    return o && !o.why && spare >= o.cost + margin ? o : undefined;
  };
  const choice =
    (ctx.wars.length > 0 && ok("mercenary-contract", 300)) ||
    ok("wonder-rush-grant", 300) ||
    ok("emergency-research-grant", 300 + (1 - ctx.curiosity) * 500) ||
    (ctx.wars.length === 0 && ok("interstellar-exchange", 1000));
  if (!choice) return 0;
  ctx.cmds.push({ type: "investSink", sinkId: choice.id });
  return choice.cost;
}

/** A seer named a world about to be struck by plague: quarantine it (ecology 30%+) when the time comes. */
function prophecies(ctx: Ctx): void {
  const { view } = ctx;
  for (const p of view.me.prophecies ?? []) {
    if (p.kind !== "plague" || p.outcome !== "waiting" || p.starId === null || p.due - view.turn > 2) continue;
    if (view.colonies.some((c) => c.starId === p.starId)) ctx.cmds.push({ type: "setSlider", starId: p.starId, slider: "ecology", value: 35 });
  }
}

// ---------- random events ----------

function randomEvents(ctx: Ctx): void {
  const { view, cmds } = ctx;
  for (const ev of view.pendingEvents) {
    let best = 0;
    let bestScore = -Infinity;
    ev.choices.forEach((c, i) => {
      let s = 0;
      for (const fx of c.effects) {
        switch (fx.kind) {
          case "money": s += fx.amount < 0 && view.me.treasury < -fx.amount ? -999 : fx.amount; break;
          case "research": s += fx.amount * (0.6 + ctx.curiosity * 0.4); break;
          case "population": s += fx.amount * 25; break;
          case "factories": s += fx.amount * 10; break;
          case "morale": s += fx.amount * 8; break;
          case "culture": s += fx.amount; break;
          case "ships": s += fx.count * (fx.template === "colony" ? 120 : 25); break;
          case "relations": s += fx.amount * 3 * ctx.honor; break;
          case "planetSize": s += fx.amount * 15; break;
          case "revealStars": s += fx.count * (view.turn < 100 ? 25 : 8); break;
          default: break;
        }
      }
      // A dying star nearby: weigh what each plan would cost our colonies in the blast (public rules).
      const plan = supernovaPlanOf(ev.eventId, i);
      const star = ev.starId !== null ? ctx.starById.get(ev.starId) : undefined;
      if (plan && star) {
        for (const c of view.colonies) {
          const d = dist(ctx.starById.get(c.starId)!, star);
          if (d > SUPERNOVA_REACH) continue;
          const loss = BLAST_LOSS[plan][d <= SUPERNOVA_INNER ? 0 : 1];
          s -= loss * (c.population * 25 + c.factories * 10);
        }
      }
      if (s > bestScore) { bestScore = s; best = i; }
    });
    cmds.push({ type: "chooseEvent", eventId: ev.id, choice: best });
  }
}

// ---------- the Galactic Council ----------

function council(ctx: Ctx): void {
  const s = ctx.view.council.session;
  const me = ctx.view.me.id;
  if (!s || s.myVote !== undefined || s.weight[me] === undefined) return;
  if (s.candidates.includes(me)) { ctx.cmds.push({ type: "councilVote", candidateId: me }); return; }
  const feel = (id: Id) => ctx.view.contacts.find((c) => c.id === id)?.ourFeeling ?? -5;
  const [a, b] = s.candidates;
  const best = a === ctx.threat ? b : b === ctx.threat ? a : feel(a) >= feel(b) ? a : b;
  // A vote for someone is a vote to lose the game to them: only for a close ally we like, or, when we are too small
  // to matter, for a patron we truly love. Otherwise abstain. (2026-11-26: liked candidates were being crowned by
  // the whole galaxy as early as turn 176.)
  const ally = ctx.view.contacts.find((c) => c.id === best)?.treaties.includes("alliance");
  const total = Object.values(s.weight).reduce((x, w) => x + w, 0);
  const small = total > 0 && (s.weight[me] ?? 0) / total < 0.12;
  const crown = (ally && feel(best) >= 40) || (small && feel(best) >= 70 + ctx.aggression * 20);
  ctx.cmds.push({ type: "councilVote", candidateId: crown ? best : null });
}

/** Council resolutions: sanctions on rivals we dislike or fear, measures that help us. */
function resolutionVote(ctx: Ctx): void {
  const r = ctx.view.resolution;
  const me = ctx.view.me.id;
  if (!r || r.myVote !== undefined) return;
  let yes: boolean | null;
  if (r.targetId === me) yes = false;
  else if (r.targetId !== null) {
    const feel = ctx.view.contacts.find((c) => c.id === r.targetId)?.ourFeeling ?? 0;
    const atWar = ctx.wars.some((w) => w.id === r.targetId);
    yes = r.targetId === ctx.threat || atWar || feel < 20 ? true : feel >= 50 ? false : null;
  } else {
    const b = r.bonus;
    let score = (b.production ?? 0) * 100 + (b.research ?? 0) * 80 * (0.5 + ctx.curiosity) + (b.growth ?? 0) * 50 + (b.culture ?? 0) * 30
      + (b.trade ?? 0) * 40 + (b.attack ?? 0) * 6 * ctx.aggression + (b.relations ?? 0) * 0.5 * ctx.honor + (b.range ?? 0) * 3 + (b.spying ?? 0) * 3 * ctx.focus.spies;
    if (r.rule === "noNewWars") score += ctx.wars.length || ctx.aggression > 0.6 ? -8 : 2;
    if (r.rule === "noSpies") score += ctx.focus.spies ? -8 : 1;
    yes = score > 0.5 ? true : score < -0.5 ? false : null;
  }
  ctx.cmds.push({ type: "resolutionVote", yes });
}

// ---------- research ----------

function research(ctx: Ctx): void {
  const { view } = ctx;
  if (view.turn % 5 !== 1) return;
  const a = ctx.aggression;
  const cu = ctx.curiosity;
  const war = ctx.wars.length > 0 ? 1 : 0;
  const early = view.turn < 60 ? 1 : 0;
  const alloc: Record<ResearchField, number> = {
    computers: 10 + cu * 10 + a * 5,
    construction: 20 + early * 5,
    forceFields: 6 + a * 10 + war * 10,
    planetology: 20 + early * 15 + (1 - a) * 5,
    propulsion: 18 + early * 10,
    weapons: 6 + a * 15 + war * 15,
  };
  // Boxed in: push the fields that open up new worlds.
  const boxed = boxedIn(ctx);
  if (boxed.range) alloc.propulsion += 35;
  if (boxed.hostility) alloc.planetology += 35;
  for (const [f, add] of Object.entries(ctx.focus.research)) alloc[f as ResearchField] += add ?? 0;
  // Late game: pour research into the fields still short of the top tier (the road to the Ascension Gate).
  const tiers = Object.fromEntries((Object.keys(alloc) as ResearchField[]).map((f) => [f, fieldTier(view.me.research, f)])) as Record<ResearchField, number>;
  if (Object.values(tiers).filter((t) => t >= 8).length >= 3) {
    for (const f of Object.keys(alloc) as ResearchField[]) alloc[f] = tiers[f] >= 10 ? 1 : 5 + (10 - tiers[f]) * 4;
  }
  cmds(ctx).push({ type: "setResearch", alloc });
}

/** Pick the most useful project in each field instead of simply the cheapest. */
function researchProjects(ctx: Ctx): void {
  const { view } = ctx;
  if ((view.turn + view.me.id) % 5 !== 0) return;
  const war = ctx.wars.length > 0;
  const boxed = boxedIn(ctx);
  const worth = (t: Tech): number => {
    let v = 0;
    for (const fx of t.effects) {
      switch (fx.stat) {
        case "hostility": v += boxed.hostility ? 20 : 6; break;
        case "terraform": v += fx.value / 3; break;
        case "robotControls": v += 6; break;
        case "productivity": v += fx.value * 30; break;
        case "factoryCost": v += 3; break;
        case "range": v += boxed.range ? 20 : view.turn < 120 ? 5 : 2; break;
        case "speed": v += 3; break;
        case "research": v += fx.value * 30 * (1 + ctx.curiosity); break;
        case "growth": v += 3; break;
        case "popCost": v += 2; break;
        case "weapon": v += (fx.min + fx.max) / 4 * (war ? 2 : 1) * (1 + ctx.aggression); break;
        case "shield": case "armor": case "computer": case "ecm": v += fx.value * (war ? 1.5 : 0.8); break;
        case "planetShield": v += war ? 3 : 1; break;
        default: v += 1;
      }
    }
    return v / Math.pow(t.tier, 1.5);
  };
  for (const f of ["computers", "construction", "forceFields", "planetology", "propulsion", "weapons"] as ResearchField[]) {
    const options = researchChoices(view.me.research, f);
    if (options.length < 2) continue;
    const best = [...options].sort((a, b) => worth(b) - worth(a))[0]!;
    if (best.id !== view.me.research.current[f]) ctx.cmds.push({ type: "setResearchProject", field: f, techId: best.id });
  }
}

function cmds(ctx: Ctx): Command[] {
  return ctx.cmds;
}

// ---------- ship design ----------

function bestOf(list: Tech[], stat: string): Tech | null {
  let best: Tech | null = null;
  let bv = -1;
  for (const t of list) {
    for (const fx of t.effects) if (fx.stat === stat && "value" in fx && fx.value > bv) { bv = fx.value; best = t; }
  }
  return best;
}

function bestWeapon(list: Tech[], kinds: string[]): Tech | null {
  let best: Tech | null = null;
  let bv = -1;
  for (const t of list) {
    for (const fx of t.effects) {
      if (fx.stat === "weapon" && kinds.includes(fx.kind)) {
        const v = (fx.min + fx.max) / 2;
        if (v > bv) { bv = v; best = t; }
      }
    }
  }
  return best;
}

const DESIGN_NAMES = ["Vanguard", "Sentinel", "Striker", "Warden", "Reaver", "Lancer", "Bulwark", "Corsair", "Harbinger", "Paragon", "Tempest", "Monarch"];

function designs(ctx: Ctx): void {
  const { view } = ctx;
  if (view.turn % 12 !== 3) return;
  const me = view.me;
  titanDesign(ctx);
  const ownCount = view.designs.filter((d) => d.empireId !== null).length;
  // A long-range colony ship, once fuel tanks are known. Never scraps a warship to make room.
  if (canUseFuelTanks(me) && ownCount < MAX_DESIGNS && !view.designs.some((d) => d.role === "colony" && d.empireId !== null)) {
    const taken = new Set(view.designs.map((d) => d.name.toLowerCase()));
    const name = ["Pathfinder", "Wayfarer", "Seedship", "Long Ark"].find((n) => !taken.has(n.toLowerCase())) ?? `Ark ${me.id}`;
    ctx.cmds.push({ type: "createDesign", spec: {
      name, role: "colony", hull: COLONY_POD.hull, computer: null, shield: null, ecm: null, armor: null, weapons: [], specials: [FUEL_TANKS.id],
    } });
    return;
  }
  const parts = partChoices(me);
  const capProd0 = Math.max(...view.colonies.map((c) => c.budget.ship + c.budget.industry + c.budget.research + c.budget.ecology + c.budget.defense), 0);
  const hull0: HullSize = capProd0 > 900 ? "huge" : capProd0 > 220 ? "large" : "medium";
  const usable = parts.weapons.filter((t) => weaponFitsHull(t.id, hull0));
  const beam = bestWeapon(usable, ["beam"]);
  const missile = bestWeapon(usable, ["missile", "torpedo"]);
  const bombT = bestWeapon(usable, ["bomb"]);
  const capProd = Math.max(...view.colonies.map((c) => c.budget.ship + c.budget.industry + c.budget.research + c.budget.ecology + c.budget.defense), 0);
  const hull: HullSize = capProd > 900 ? "huge" : capProd > 220 ? "large" : "medium";
  const spec: DesignSpec = {
    name: "",
    hull,
    computer: bestOf(parts.computer, "computer")?.id ?? null,
    shield: bestOf(parts.shield, "shield")?.id ?? null,
    ecm: bestOf(parts.ecm, "ecm")?.id ?? null,
    armor: bestOf(parts.armor, "armor")?.id ?? null,
    weapons: [],
    specials: [],
  };
  const st0 = designStats(me, spec);
  if (st0.spaceUsed > st0.space * 0.6) { spec.ecm = null; spec.shield = null; }
  // Defensive specials first, while they leave plenty of room for guns.
  for (const id of ["displacement-field", "inertial-dampers", "cloaking-field", "stasis-field", "repulsor-beam"]) {
    if (spec.specials.length >= 2 || !parts.specials.some((t) => t.id === id)) continue;
    const trial = { ...spec, specials: [...spec.specials, id] };
    if (designStats(me, trial).spaceUsed <= designStats(me, trial).space * 0.45) spec.specials = trial.specials;
  }
  if (ctx.aggression > 0.6 && ctx.honor < 0.5 && hull !== "medium" && parts.specials.some((t) => t.id === "planet-cracker") && spec.specials.length < 3) {
    spec.specials = [...spec.specials, "planet-cracker"];
    if (designStats(me, spec).spaceUsed > designStats(me, spec).space * 0.6) spec.specials.pop();
  }
  // Carriers: about half of the empires (by personality and luck) give a third of the free room to fighter bays.
  const bay = fighterBayChoices(me).sort((a, b) => b.tier - a.tier)[0];
  if (bay && bay.hulls.includes(hull) && coin(view, 71 + me.id * 13) < 0.35 + ctx.aggression * 0.3) {
    const st = designStats(me, spec);
    const n = Math.min(3, Math.floor(((st.space - st.spaceUsed) / 3) / bayPart(me, bay.id, hull).space));
    if (n > 0) spec.bays = { bayId: bay.id, count: n };
  }
  const banks: { id: string; share: number }[] = [];
  if (beam) banks.push({ id: beam.id, share: missile ? 0.55 : 1 });
  if (missile) banks.push({ id: missile.id, share: beam ? 0.3 : 0.85 });
  if (bombT && ctx.aggression > 0.4) banks.push({ id: bombT.id, share: 0.15 });
  // Fill free room with weapons, one bank at a time.
  for (const b of banks) spec.weapons.push({ techId: b.id, count: 0 });
  for (let i = 0; i < spec.weapons.length; i++) {
    const w = spec.weapons[i]!;
    const roomBefore = designStats(me, spec);
    const free = roomBefore.space - roomBefore.spaceUsed;
    const unit = designStats(me, { ...spec, weapons: [{ techId: w.techId, count: 1 }] }).spaceUsed - designStats(me, { ...spec, weapons: [] }).spaceUsed;
    const share = banks[i]!.share / banks.slice(i).reduce((a, x) => a + x.share, 0);
    w.count = Math.max(0, Math.floor((free * share) / unit));
  }
  spec.weapons = spec.weapons.filter((w) => w.count > 0);
  if (!spec.weapons.length && !spec.bays) return;
  const st = designStats(me, spec);
  if (st.spaceUsed > st.space) return;

  // Skip if it isn't clearly better than our best existing warship.
  const own = view.designs.filter((d) => d.empireId !== null);
  const current = own.filter((d) => isWarship(d) && !isCapitalHull(d.hull)).sort((a, b) => b.cost - a.cost)[0];
  const value = (d: DesignSpec) => {
    const s = designStats(me, d);
    const dmg = s.weapons.reduce((a, w) => a + w.count * (w.min + w.max) / 2, 0)
      + (s.fighters ? s.fighters.count * s.fighters.shots * (s.fighters.min + s.fighters.max) / 2 : 0);
    return (dmg * (1 + s.attack * 0.1) * s.hits * (1 + s.shield * 0.2)) / Math.max(1, s.cost);
  };
  if (current && current.hull === spec.hull && value(spec) <= value(current) * 1.15) return;

  // Make room: scrap our oldest design that has no ships.
  if (own.length >= MAX_DESIGNS) {
    const used = new Set(view.fleets.flatMap((f) => Object.keys(f.ships).filter((k) => (f.ships[k] ?? 0) > 0)));
    const building = new Set(view.colonies.map((c) => c.buildTemplate));
    const spare = own.find((d) => !used.has(d.id) && !building.has(d.id));
    if (!spare) return;
    ctx.cmds.push({ type: "scrapDesign", designId: spare.id });
  }
  const names = new Set(view.designs.map((d) => d.name.toLowerCase()));
  const base = DESIGN_NAMES[(view.turn / 12 + me.id) % DESIGN_NAMES.length | 0]!;
  let name = base;
  for (let n = 2; names.has(name.toLowerCase()); n++) name = `${base} ${["", "", "II", "III", "IV", "V", "VI"][n] ?? n}`;
  spec.name = name;
  ctx.cmds.push({ type: "createDesign", spec });
}

// ---------- production ----------

/** A Titan design once Titan Slipways is known: best systems, guns filling the room, and a class that fits the personality. */
function titanDesign(ctx: Ctx): void {
  const { view } = ctx;
  const me = view.me;
  if (!me.research.known.includes("titan-slipways")) return;
  const own = view.designs.filter((d) => d.empireId !== null);
  if (own.some((d) => d.hull === "titan")) return;
  let scrap: string | null = null;
  if (own.length >= MAX_DESIGNS) { // make room: our cheapest design with no ships and nothing building it
    const used = new Set(view.fleets.flatMap((f) => Object.keys(f.ships).filter((k) => (f.ships[k] ?? 0) > 0)));
    const building = new Set(view.colonies.map((c) => c.buildTemplate));
    scrap = own.filter((d) => !used.has(d.id) && !building.has(d.id)).sort((x, y) => x.cost - y.cost)[0]?.id ?? null;
    if (!scrap) return;
  }
  const parts = partChoices(me);
  const beam = bestWeapon(parts.weapons, ["beam"]);
  const missile = bestWeapon(parts.weapons, ["missile", "torpedo"]);
  if (!beam && !missile) return;
  const shipClass: ShipClass | undefined = ctx.aggression > 0.7 ? "battlecruiser" : ctx.aggression > 0.5 && ctx.honor < 0.5 ? "juggernaut" : undefined;
  const spec: DesignSpec = {
    name: "", hull: "titan",
    computer: bestOf(parts.computer, "computer")?.id ?? null, shield: bestOf(parts.shield, "shield")?.id ?? null,
    ecm: bestOf(parts.ecm, "ecm")?.id ?? null, armor: bestOf(parts.armor, "armor")?.id ?? null,
    weapons: [], specials: [], ...(shipClass ? { shipClass } : {}),
  };
  const banks = [beam && { id: beam.id, share: missile ? 0.65 : 1 }, missile && { id: missile.id, share: 1 }].filter((b): b is { id: string; share: number } => !!b);
  for (const b of banks) {
    const st = designStats(me, spec);
    const unit = designStats(me, { ...spec, weapons: [{ techId: b.id, count: 1 }] }).spaceUsed - designStats(me, { ...spec, weapons: [] }).spaceUsed;
    const n = Math.floor(((st.space - st.spaceUsed) * b.share) / Math.max(1e-6, unit));
    if (n > 0) spec.weapons.push({ techId: b.id, count: n });
  }
  if (!spec.weapons.length || designStats(me, spec).spaceUsed > designStats(me, spec).space) return;
  const names = new Set(view.designs.map((d) => d.name.toLowerCase()));
  spec.name = ["Throne of Stars", "Last Word", "Worldbreaker", "Crown of War", "Sovereign Dawn"].find((n) => !names.has(n.toLowerCase())) ?? `Titan ${me.id}`;
  if (scrap) ctx.cmds.push({ type: "scrapDesign", designId: scrap });
  ctx.cmds.push({ type: "createDesign", spec });
}

function sliders(ship: number, defense: number, industry: number, ecology: number, research: number): SliderSet {
  return { ship, defense, industry, ecology, research };
}

function production(ctx: Ctx, settleTargets: number): void {
  const { view, cmds } = ctx;
  const scouts = view.fleets.reduce((n, f) => n + (f.ships.scout ?? 0), 0);
  const colonyShips = view.fleets.reduce((n, f) => n + colonyIds(ctx, f.ships).reduce((k, id) => k + (f.ships[id] ?? 0), 0), 0);
  const unexplored = view.stars.filter((s) => !view.knowledge[s.id]?.explored).length;
  const warship = view.designs.filter((d) => isWarship(d) && !isCapitalHull(d.hull)).sort((a, b) => b.cost - a.cost)[0];
  // A Titan: built at the capital when the empire is rich or at war and has none afloat (one allowed).
  const titan = view.designs.filter((d) => d.empireId !== null && d.hull === "titan" && isWarship(d)).sort((a, b) => b.cost - a.cost)[0];
  const titanAfloat = !!titan && view.fleets.some((f) => Object.entries(f.ships).some(([id, n]) => n > 0 && ctx.designs.get(id)?.hull === "titan"));
  const atWar = ctx.wars.length > 0;
  const fleetPower = view.fleets.reduce((a, f) => a + warPower(ctx, f), 0);
  const totalProd = view.colonies.reduce((a, c) => a + c.budget.ship + c.budget.defense + c.budget.industry + c.budget.ecology + c.budget.research, 0);
  // Keep a standing fleet worth a few turns of the whole empire's output; more for warlike races and in wartime.
  // At war, the fleet target is full size at once (no early-game ramp), so a declaration gets a real answer.
  const ramp = atWar ? 1 : Math.min(1, view.turn / 80);
  const wantPower = totalProd * (1.5 + 5 * ctx.aggression) * (atWar ? 1.6 : 1) * ramp * ctx.level.fleet * ctx.focus.fleet;
  // A big hoard turns into ships rather than sitting idle (the treasury then funds the shipyard).
  const rich = view.me.treasury > 800 + view.turn * 4;
  const needShips = !!warship && (fleetPower < wantPower || rich);
  const threatened = new Set(view.seenFleets.filter((f) => ctx.wars.some((w) => w.id === f.empireId)).flatMap((f) => [f.starId, f.destStarId]));
  const enemyNear = (c: ColonyInfo) => view.seenFleets.some((f) => ctx.wars.some((w) => w.id === f.empireId) && dist(f, ctx.starById.get(c.starId)!) < 6);

  // Colony ships already being built anywhere count toward the worlds we want to settle.
  let colonyPlanned = colonyShips + view.colonies.filter((c) => c.buildTemplate && ctx.designs.get(c.buildTemplate)?.role === "colony").length;
  const pod = bestColonyDesign(ctx);
  const buildsColony = (c: ColonyInfo) => !!c.buildTemplate && ctx.designs.get(c.buildTemplate)?.role === "colony";
  const colonies = [...view.colonies].sort((a, b) => Number(b.isCapital) - Number(a.isCapital));
  for (const c of colonies) {
    const growing = c.population < c.capacity - 1;
    const factoriesFull = c.factories >= c.maxFactories - 0.5;
    const big = c.population >= (atWar ? 15 : 30);
    let want: string | null = null;
    let s: SliderSet;
    const basesFull = c.missileBases >= maxMissileBases(c.population);
    const def = basesFull ? 0 : atWar && (enemyNear(c) || threatened.has(c.starId)) ? 25 : atWar ? 5 : 0;
    if (c.isCapital && titan && !titanAfloat && (atWar || rich) && c.population >= 40) {
      want = titan.id;
      s = sliders(atWar ? 60 : 45, def, 0, growing ? 10 : 0, 0);
      s.research = 100 - s.ship - s.defense - s.ecology;
    } else if (c.isCapital) {
      want = scouts < 2 && unexplored > 0 ? "scout"
        : needShips && (atWar || colonyShips >= settleTargets) ? warship!.id
        : settleTargets > colonyShips ? pod
        : needShips ? warship!.id : null;
      if (want === pod && !buildsColony(c)) colonyPlanned++;
      const ship = want === "scout" ? 10 : want ? (atWar ? 40 : 30) : 0;
      const eco = growing ? 10 : 0;
      const res = 100 - ship - def - eco - (factoriesFull ? 0 : 30);
      s = sliders(ship, def, factoriesFull ? 0 : 30, eco, Math.max(0, res));
    } else if (!atWar && c.population >= ctx.focus.settlePop && factoriesFull && settleTargets > colonyPlanned - (buildsColony(c) ? 1 : 0)) {
      // A well-built colony helps the capital spread out.
      want = pod;
      if (!buildsColony(c)) colonyPlanned++;
      s = sliders(35, def, 0, growing ? 10 : 0, 0);
      s.research = 100 - s.ship - s.defense - s.ecology;
    } else if ((big || rich) && factoriesFull && needShips && warship) {
      want = warship.id;
      s = sliders(atWar ? 50 : 30, def, 0, growing ? 10 : 0, 0);
      s.research = 100 - s.ship - s.defense - s.ecology;
    } else {
      want = null;
      s = factoriesFull && !growing
        ? sliders(0, def, 0, 0, 100 - def)
        : sliders(0, def, factoriesFull ? 0 : 70 - def, growing ? 30 : 0, factoriesFull ? 70 : 0);
    }
    // Something under construction needs industry.
    if (c.buildQueue && s.industry < 25) {
      const move = Math.min(25 - s.industry, s.research);
      s.industry += move; s.research -= move;
    }
    if (c.buildTemplate !== want) cmds.push({ type: "setBuild", starId: c.starId, templateId: want });
    cmds.push({ type: "setSliders", starId: c.starId, sliders: s });
  }
}

// ---------- scouts and colony ships ----------

function expansion(ctx: Ctx): number {
  const { view, cmds, taken } = ctx;
  const hostileStars = new Set(view.seenFleets.filter((f) => ctx.wars.some((w) => w.id === f.empireId)).map((f) => f.starId));
  const settleable = view.stars.filter((s) => view.canSettle(s.id) && !hostileStars.has(s.id));
  for (const f of view.fleets.filter((x) => idle(x) && colonyIds(ctx, x.ships).length > 0)) {
    if (view.canSettle(f.starId!)) { cmds.push({ type: "colonize", fleetId: f.id }); taken.add(f.starId!); continue; }
    const pod = colonyIds(ctx, f.ships)[0]!;
    const best = settleable
      .filter((s) => !taken.has(s.id) && view.reachable(s.id, { ...f, ships: { [pod]: 1 } }))
      .map((s) => {
        const k = view.knowledge[s.id]!;
        const size = k.planet ? k.planet.size : 0;
        const rich = k.planet && (k.planet.minerals === "rich" || k.planet.minerals === "ultraRich") ? 1.4 : 1;
        return { s, score: (size * rich) / (view.turnsTo(f, s.id) + 2) };
      })
      .sort((a, b) => b.score - a.score)[0];
    if (best) { cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: best.s.id, ships: { [pod]: 1 } }); taken.add(best.s.id); }
  }
  scouting(ctx);
  // Only count worlds a new colony ship could actually reach, so we don't build ships that just sit at home.
  const pod = bestColonyDesign(ctx);
  return settleable.filter((s) => !taken.has(s.id) && canReach(ctx, s.id, pod)).length;
}

/** Send each idle scout to the nearest unexplored star nobody else is heading for. */
function scouting(ctx: Ctx): void {
  const { view, cmds, taken } = ctx;
  const unexplored = view.stars.filter((s) => !view.knowledge[s.id]?.explored);
  for (const f of view.fleets.filter((x) => idle(x) && (x.ships.scout ?? 0) > 0)) {
    const count = f.ships.scout ?? 0;
    const options = unexplored
      .filter((s) => !taken.has(s.id) && view.reachable(s.id, { ...f, ships: { scout: 1 } }))
      .sort((a, b) => dist(a, f) - dist(b, f));
    for (let i = 0; i < count && i < options.length; i++) {
      cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: options[i]!.id, ships: { scout: 1 } });
      taken.add(options[i]!.id);
    }
  }
}

/** The player's "auto-explore" switch: the same scouting orders the AI gives itself, nothing else. */
export function autoScoutOrders(view: EmpireView): Command[] {
  const ctx = makeCtx(view);
  scouting(ctx);
  return ctx.cmds;
}

// ---------- war ----------

function military(ctx: Ctx): void {
  const { view, cmds } = ctx;
  const warFleets = view.fleets.filter((f) => idle(f) && warPower(ctx, f) > 0);
  const transportsIdle = view.fleets.filter((f) => idle(f) && (f.ships.transport ?? 0) > 0);
  const myStars = new Set(view.colonies.map((c) => c.starId));

  // Stray transports (peace made, target gone): bring them home.
  for (const f of transportsIdle) {
    const here = view.knowledge[f.starId!];
    const owner = here?.ownerId;
    const enemy = owner !== null && owner !== undefined && ctx.wars.some((w) => w.id === owner);
    if (!myStars.has(f.starId!) && !enemy) {
      const home = nearestColony(ctx, f);
      if (home && view.reachable(home.starId, f)) cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: home.starId });
    }
  }

  // Retreat from fights we would lose (seen enemy ships far outnumber ours here).
  const shipsOf = (f: Fleet) => Object.entries(f.ships).reduce((a, [id, n]) => a + (isWarship(ctx.designs.get(id)) ? n : 0), 0);
  const retreating = new Set<Id>();
  if (ctx.level !== LEVEL.relaxed) {
    for (const f of warFleets) {
      if (myStars.has(f.starId!)) continue;
      const mineHere = view.fleets.filter((x) => x.starId === f.starId).reduce((a, x) => a + shipsOf(x), 0);
      const theirs = view.seenFleets.filter((sf) => sf.starId === f.starId && ctx.wars.some((w) => w.id === sf.empireId)).reduce((a, sf) => a + sf.ships, 0);
      if (theirs > mineHere * 1.6 + 2) {
        const home = nearestColony(ctx, f);
        if (home && view.reachable(home.starId, f)) { cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: home.starId }); retreating.add(f.id); }
      }
    }
  }

  // Defend: send idle warships to a colony where an enemy fleet is.
  // Includes worlds our spies say an enemy fleet is heading for.
  const attacked = view.colonies.filter((c) => view.seenFleets.some((sf) => (sf.starId === c.starId || sf.destStarId === c.starId) && ctx.wars.some((w) => w.id === sf.empireId)));
  const used = new Set<Id>(retreating);
  for (const c of attacked) {
    const s = ctx.starById.get(c.starId)!;
    for (const f of warFleets.filter((x) => !used.has(x.id)).sort((a, b) => dist(a, s) - dist(b, s)).slice(0, 2)) {
      if (f.starId !== c.starId && view.reachable(c.starId, f)) { cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: c.starId }); used.add(f.id); }
    }
  }

  if (ctx.wars.length === 0) {
    // Peacetime: gather warships at the capital.
    const capital = view.me.capitalStarId;
    for (const f of warFleets) if (!used.has(f.id) && f.starId !== capital && view.reachable(capital, f)) cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: capital });
    return;
  }

  // Offense: pick the weakest reachable enemy colony near us.
  // Coalition Armada (coalition.ts): every member strikes the same world of the giant, so their fleets arrive together.
  const armada = view.coalition.armadaStarId;
  const armadaOn = armada !== null && view.coalition.leaderId !== view.me.id && ctx.wars.some((w) => w.id === view.coalition.leaderId);
  const targets = ctx.wars.flatMap((w) => enemyColonies(ctx, w.id))
    .map((t) => {
      const home = nearestColony(ctx, t.star);
      const d = home ? dist(ctx.starById.get(home.starId)!, t.star) : 99;
      const isThreat = enemyColonies(ctx, ctx.threat ?? -1).some((x) => x.star.id === t.star.id);
      return { ...t, d, score: t.pop + d * 3 - (isThreat ? 60 : 0) - (armadaOn && t.star.id === armada ? 1000 : 0) };
    })
    .filter((t) => t.d <= (armadaOn && t.star.id === armada ? 20 : 12))
    .sort((a, b) => a.score - b.score);
  const target = targets[0];
  if (!target) return;

  // Ruthless races crack undefended enemy worlds they can't easily take.
  if (ctx.honor < 0.4 && ctx.aggression > 0.6) {
    for (const f of view.fleets.filter((x) => idle(x) && Object.keys(x.ships).some((id) => (x.ships[id] ?? 0) > 0 && ctx.designs.get(id)?.specials.includes("planet-cracker")))) {
      const owner = view.knowledge[f.starId!]?.ownerId;
      if (owner !== null && owner !== undefined && ctx.wars.some((w) => w.id === owner) && (view.knowledge[f.starId!]?.population ?? 0) > 30) cmds.push({ type: "crackPlanet", fleetId: f.id });
    }
  }

  // Our warships already at the target: bring troops.
  const atTarget = view.fleets.filter((f) => f.starId === target.star.id && warPower(ctx, f) > 0);
  const strengthThere = atTarget.reduce((a, f) => a + warPower(ctx, f), 0);
  const enemyThere = view.seenFleets.filter((sf) => sf.starId === target.star.id && ctx.wars.some((w) => w.id === sf.empireId)).reduce((a, sf) => a + sf.ships, 0);
  const troopsComing = view.fleets.filter((f) => f.destStarId === target.star.id || f.starId === target.star.id).reduce((a, f) => a + (f.ships.transport ?? 0), 0);
  if (strengthThere > 0 && enemyThere === 0) {
    let need = Math.ceil(target.pop * ctx.level.troops) + 3 - troopsComing;
    const donors = [...view.colonies]
      .filter((c) => c.population > 12)
      .sort((a, b) => dist(ctx.starById.get(a.starId)!, target.star) - dist(ctx.starById.get(b.starId)!, target.star));
    for (const c of donors) {
      if (need <= 0) break;
      const give = Math.min(need, Math.floor(c.population * 0.4));
      if (give < 2) continue;
      cmds.push({ type: "sendTransports", fromStarId: c.starId, toStarId: target.star.id, troops: give });
      need -= give;
    }
  }

  // Mass the rest of the idle warships, then strike when strong enough.
  const free = warFleets.filter((f) => !used.has(f.id) && f.starId !== target.star.id);
  const total = free.reduce((a, f) => a + warPower(ctx, f), 0);
  const nearby = view.seenFleets.filter((sf) => ctx.wars.some((w) => w.id === sf.empireId) && dist(sf, target.star) <= 3).reduce((a, sf) => a + sf.ships, 0);
  // Armada members count the other members' warships gathering at the target as part of the strike.
  const allies = armadaOn && target.star.id === armada
    ? view.seenFleets.filter((sf) => sf.empireId !== view.coalition.leaderId && !ctx.wars.some((w) => w.id === sf.empireId) && (sf.starId === armada || sf.destStarId === armada || dist(sf, target.star) <= 3)).reduce((a, sf) => a + sf.ships, 0)
    : 0;
  const threshold = Math.max(150, 250 + target.pop * 8 + (enemyThere + nearby) * 40 * (ctx.level === LEVEL.hard ? 1.2 : 1) - allies * 30);
  if (total >= threshold || strengthThere > 0) {
    for (const f of free) if (view.reachable(target.star.id, f)) cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: target.star.id });
  } else {
    const stage = nearestColony(ctx, target.star);
    if (stage) for (const f of free) if (f.starId !== stage.starId && view.reachable(stage.starId, f)) cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: stage.starId });
  }
}

/** Ancient Leviathans (leviathans.ts): once we know Titan Slipways and can spare the BC, send a small war fleet to wake one. */
function leviathanHunt(ctx: Ctx): void {
  const { view, cmds } = ctx;
  const sleeping = view.leviathans.filter((l) => l.wokenBy === null);
  if (!sleeping.length || !view.me.research.known.includes(WAKE_TECH) || view.me.treasury < WAKE_COST + 300) return;
  const sleepStars = new Set(sleeping.map((l) => l.starId));
  const here = view.fleets.find((f) => f.starId !== null && sleepStars.has(f.starId));
  if (here) { cmds.push({ type: "wakeLeviathan", fleetId: here.id }); return; }
  if (view.fleets.some((f) => f.destStarId !== null && sleepStars.has(f.destStarId))) return; // already on the way
  const fleets = view.fleets.filter((f) => idle(f) && warPower(ctx, f) > 0).sort((a, b) => warPower(ctx, a) - warPower(ctx, b));
  for (const f of fleets) {
    const target = sleeping.map((l) => ctx.starById.get(l.starId)!).filter((st) => view.reachable(st.id, f)).sort((a, b) => dist(a, f) - dist(b, f))[0];
    if (target) { cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: target.id }); return; }
  }
}

// ---------- entry point ----------

/** Only the answers to waiting proposals (for an instant reply to the player). */
export function basicAIAnswers(view: EmpireView): Command[] {
  const ctx = makeCtx(view);
  answers(ctx);
  return ctx.cmds;
}

/** Who is about to win? Victory progress is public, so every AI can see it. */
function findThreat(view: EmpireView): Id | null {
  if (view.difficulty === "relaxed") return null;
  const live = view.standings.filter((s) => s.alive);
  const totalVotes = live.reduce((a, s) => a + s.votes, 0);
  let worst: { id: Id; score: number } | null = null;
  for (const s of live) {
    if (s.id === view.me.id) continue;
    let score = 0;
    // Several may build the Gate at once: go after the strongest builder, not whoever is listed first
    // (ties went to the lowest id, which is usually the player). Fix 2026-11-26 after a huge-map playtest.
    if (s.buildingAscension) score = Math.max(score, 1 + (totalVotes > 0 ? s.votes / totalVotes : 0));
    // Runaway leaders: close to a culture win, far ahead in tech, or holding a big share of the galaxy's votes.
    score = Math.max(score, s.culture / 95000 - 0.05, s.techFields / 6 - 0.2);
    // One home world short of a conquest win is as urgent as it gets.
    if (view.homeWorldsNeeded && s.homeWorlds >= 2) score = Math.max(score, s.homeWorlds / view.homeWorldsNeeded - 0.1);
    if (view.turn >= 120 && totalVotes > 0) score = Math.max(score, (s.votes / totalVotes) * 1.6 - 0.15);
    if (score >= 0.6 && (!worst || score > worst.score)) worst = { id: s.id, score };
  }
  // Don't gang up on someone we can't even reach.
  return worst && view.contacts.some((c) => c.id === worst!.id && c.alive) ? worst.id : null;
}

function makeCtx(view: EmpireView): Ctx {
  const p = view.race.personality;
  const focus = FOCUS[view.me.focus ?? "balanced"] ?? FOCUS.balanced;
  return {
    focus,
    dealtWith: new Set<Id>(),
    threat: findThreat(view),
    level: LEVEL[view.difficulty] ?? LEVEL.normal,
    view,
    cmds: [],
    designs: new Map(view.designs.map((d) => [d.id, d])),
    aggression: focus.aggression ?? p.aggression,
    honor: p.honor,
    curiosity: focus.curiosity ?? p.curiosity,
    wars: view.contacts.filter((c) => c.warSince !== null && c.alive),
    taken: new Set(view.fleets.map((f) => f.destStarId).filter((d): d is Id => d !== null)),
    starById: new Map(view.stars.map((s) => [s.id, s])),
  };
}

export function basicAITurn(view: EmpireView): Command[] {
  const ctx = makeCtx(view);
  answers(ctx);
  randomEvents(ctx);
  council(ctx);
  resolutionVote(ctx);
  diplomacy(ctx);
  deals(ctx);
  espionage(ctx);
  research(ctx);
  researchProjects(ctx);
  designs(ctx);
  civilization(ctx);
  proclamations(ctx);
  const openTargets = expansion(ctx);
  production(ctx, openTargets);
  military(ctx);
  leviathanHunt(ctx);
  prophecies(ctx);
  return ctx.cmds;
}
