// Stage 4 AI. Plays to win with the same information and the same commands as
// the player: it reads only its EmpireView and acts only through commands.
// No bonuses of any kind. Personality (from the race) shapes its choices:
// aggressive races arm early and pick fights, curious ones research more,
// honorable ones keep the peace longer.
//
// Turn plan: assess -> diplomacy (war/peace) -> research -> ship designs ->
// colony production -> scouts and colony ships -> war fleets and invasions.

import type { Command } from "../engine/commands";
import { designStats, partChoices, type DesignSpec } from "../engine/designs";
import { MAX_DESIGNS, type HullSize, type ShipDesign } from "../engine/data/ships";
import type { Tech } from "../engine/data/techs";
import type { ColonyInfo, EmpireView, KnownEmpire, PublicStar } from "../engine/view";
import type { Fleet, Id, ResearchField, SliderSet } from "../engine/types";

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

/** How seriously the AI plays at each difficulty. Same information and rules at every level. */
const LEVEL = {
  relaxed: { fleet: 0.5, edge: 0.6, firstWar: 110, warMood: 0.4, troops: 2.2 },
  normal: { fleet: 1, edge: 0, firstWar: 50, warMood: 1, troops: 1.7 },
  hard: { fleet: 1.35, edge: -0.25, firstWar: 35, warMood: 1.6, troops: 1.5 },
};

interface Ctx {
  level: (typeof LEVEL)["normal"];
  view: EmpireView;
  cmds: Command[];
  designs: Map<string, ShipDesign>;
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
  for (const c of view.contacts) {
    if (!c.alive) continue;
    const theirs = knownPop(ctx, c.id);
    if (c.warSince !== null) {
      const length = view.turn - c.warSince;
      const losing = theirs > mine * 1.2;
      if (c.offersPeace && (length >= 10 + Math.round(ctx.aggression * 20) || losing)) cmds.push({ type: "offerPeace", targetId: c.id });
      else if (!c.weOfferedPeace && length >= 15 && (losing || coin(view, c.id) < 0.05 * (1 - ctx.aggression))) cmds.push({ type: "offerPeace", targetId: c.id });
    }
  }
  // Start at most one war at a time, and only once established.
  if (ctx.wars.length > 0 || view.turn < ctx.level.firstWar) return;
  const myFleet = view.fleets.reduce((a, f) => a + warPower(ctx, f), 0);
  const candidates = view.contacts
    .filter((c) => c.alive && c.warSince === null)
    .map((c) => {
      const cols = enemyColonies(ctx, c.id);
      const near = cols.length ? Math.min(...cols.map((x) => dist(x.star, nearestColony(ctx, x.star) ? ctx.starById.get(nearestColony(ctx, x.star)!.starId)! : x.star))) : 99;
      const theirs = knownPop(ctx, c.id);
      return { c, near, ratio: mine / Math.max(1, theirs), cols: cols.length };
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

// ---------- research ----------

function research(ctx: Ctx): void {
  const { view } = ctx;
  if (view.turn % 10 !== 1) return;
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
  cmds(ctx).push({ type: "setResearch", alloc });
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
  const parts = partChoices(me);
  const beam = bestWeapon(parts.weapons, ["beam"]);
  const missile = bestWeapon(parts.weapons, ["missile", "torpedo"]);
  const bombT = bestWeapon(parts.weapons, ["bomb"]);
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
  if (!spec.weapons.length) return;
  const st = designStats(me, spec);
  if (st.spaceUsed > st.space) return;

  // Skip if it isn't clearly better than our best existing warship.
  const own = view.designs.filter((d) => d.empireId !== null);
  const current = own.filter(isWarship).sort((a, b) => b.cost - a.cost)[0];
  const value = (d: DesignSpec) => {
    const s = designStats(me, d);
    const dmg = s.weapons.reduce((a, w) => a + w.count * (w.min + w.max) / 2, 0);
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

function sliders(ship: number, defense: number, industry: number, ecology: number, research: number): SliderSet {
  return { ship, defense, industry, ecology, research };
}

function production(ctx: Ctx, settleTargets: number): void {
  const { view, cmds } = ctx;
  const scouts = view.fleets.reduce((n, f) => n + (f.ships.scout ?? 0), 0);
  const colonyShips = view.fleets.reduce((n, f) => n + (f.ships.colony ?? 0), 0);
  const unexplored = view.stars.filter((s) => !view.knowledge[s.id]?.explored).length;
  const warship = view.designs.filter(isWarship).sort((a, b) => b.cost - a.cost)[0];
  const atWar = ctx.wars.length > 0;
  const fleetPower = view.fleets.reduce((a, f) => a + warPower(ctx, f), 0);
  const totalProd = view.colonies.reduce((a, c) => a + c.budget.ship + c.budget.defense + c.budget.industry + c.budget.ecology + c.budget.research, 0);
  // Keep a standing fleet worth a few turns of the whole empire's output; more for warlike races and in wartime.
  const wantPower = totalProd * (1.5 + 5 * ctx.aggression) * (atWar ? 1.6 : 1) * Math.min(1, view.turn / 80) * ctx.level.fleet;
  const needShips = !!warship && fleetPower < wantPower;
  const threatened = new Set(view.seenFleets.filter((f) => ctx.wars.some((w) => w.id === f.empireId)).map((f) => f.starId));
  const enemyNear = (c: ColonyInfo) => view.seenFleets.some((f) => ctx.wars.some((w) => w.id === f.empireId) && dist(f, ctx.starById.get(c.starId)!) < 6);

  for (const c of view.colonies) {
    const growing = c.population < c.capacity - 1;
    const factoriesFull = c.factories >= c.maxFactories - 0.5;
    const big = c.population >= 30;
    let want: string | null = null;
    let s: SliderSet;
    const def = atWar && (enemyNear(c) || threatened.has(c.starId)) ? 25 : atWar ? 5 : 0;
    if (c.isCapital) {
      want = scouts < 2 && unexplored > 0 ? "scout"
        : needShips && (atWar || colonyShips >= settleTargets) ? warship!.id
        : settleTargets > colonyShips ? "colony"
        : needShips ? warship!.id : null;
      const ship = want === "scout" ? 10 : want ? (atWar ? 40 : 30) : 0;
      const eco = growing ? 10 : 0;
      const res = 100 - ship - def - eco - (factoriesFull ? 0 : 30);
      s = sliders(ship, def, factoriesFull ? 0 : 30, eco, Math.max(0, res));
    } else if (big && factoriesFull && needShips && warship) {
      want = warship.id;
      s = sliders(atWar ? 50 : 30, def, 0, growing ? 10 : 0, 0);
      s.research = 100 - s.ship - s.defense - s.ecology;
    } else {
      want = null;
      s = factoriesFull && !growing
        ? sliders(0, def, 0, 0, 100 - def)
        : sliders(0, def, factoriesFull ? 0 : 70 - def, growing ? 30 : 0, factoriesFull ? 70 : 0);
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
  for (const f of view.fleets.filter((x) => idle(x) && (x.ships.colony ?? 0) > 0)) {
    if (view.canSettle(f.starId!)) { cmds.push({ type: "colonize", fleetId: f.id }); taken.add(f.starId!); continue; }
    const best = settleable
      .filter((s) => !taken.has(s.id) && view.reachable(s.id, { ...f, ships: { colony: 1 } }))
      .map((s) => {
        const k = view.knowledge[s.id]!;
        const size = k.planet ? k.planet.size : 0;
        const rich = k.planet && (k.planet.minerals === "rich" || k.planet.minerals === "ultraRich") ? 1.4 : 1;
        return { s, score: (size * rich) / (view.turnsTo(f, s.id) + 2) };
      })
      .sort((a, b) => b.score - a.score)[0];
    if (best) { cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: best.s.id, ships: { colony: 1 } }); taken.add(best.s.id); }
  }
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
  return settleable.filter((s) => !taken.has(s.id)).length;
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

  // Defend: send idle warships to a colony where an enemy fleet is.
  const attacked = view.colonies.filter((c) => view.seenFleets.some((sf) => sf.starId === c.starId && ctx.wars.some((w) => w.id === sf.empireId)));
  const used = new Set<Id>();
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
  const targets = ctx.wars.flatMap((w) => enemyColonies(ctx, w.id))
    .map((t) => {
      const home = nearestColony(ctx, t.star);
      const d = home ? dist(ctx.starById.get(home.starId)!, t.star) : 99;
      return { ...t, d, score: t.pop + d * 3 };
    })
    .filter((t) => t.d <= 12)
    .sort((a, b) => a.score - b.score);
  const target = targets[0];
  if (!target) return;

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
  const threshold = 250 + target.pop * 8 + enemyThere * 40;
  if (total >= threshold || strengthThere > 0) {
    for (const f of free) if (view.reachable(target.star.id, f)) cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: target.star.id });
  } else {
    const stage = nearestColony(ctx, target.star);
    if (stage) for (const f of free) if (f.starId !== stage.starId && view.reachable(stage.starId, f)) cmds.push({ type: "moveFleet", fleetId: f.id, destStarId: stage.starId });
  }
}

// ---------- entry point ----------

export function basicAITurn(view: EmpireView): Command[] {
  const p = view.race.personality;
  const ctx: Ctx = {
    level: LEVEL[view.difficulty] ?? LEVEL.normal,
    view,
    cmds: [],
    designs: new Map(view.designs.map((d) => [d.id, d])),
    aggression: p.aggression,
    honor: p.honor,
    curiosity: p.curiosity,
    wars: view.contacts.filter((c) => c.warSince !== null && c.alive),
    taken: new Set(view.fleets.map((f) => f.destStarId).filter((d): d is Id => d !== null)),
    starById: new Map(view.stars.map((s) => [s.id, s])),
  };
  diplomacy(ctx);
  research(ctx);
  designs(ctx);
  const openTargets = expansion(ctx);
  production(ctx, openTargets);
  military(ctx);
  return ctx.cmds;
}
