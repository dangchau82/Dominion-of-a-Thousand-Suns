// Master AI (stage 8), part 1: economy, spending and statecraft.
// Same rules as every AI: it reads only its EmpireView and acts only through commands.
// No bonuses of any kind. It starts from the basic AI's turn and then plays the parts
// that decide games better:
//   - no wars of choice (peace keeps friends, and friends are council votes);
//   - culture buildings and the helpful wonders first; never paints a target on itself with the Gate;
//   - never sits on a hoard: rushes buildings every turn;
//   - wins the Galactic Council by making friends (gifts) just before the vote.

import type { Command } from "../engine/commands";
import { costFor } from "../engine/civ";
import { VOTE_SHARE_TO_WIN } from "../engine/victory";
import type { Id } from "../engine/types";
import type { ColonyInfo, EmpireView } from "../engine/view";
import { basicAIAnswers, basicAITurn } from "./basicAI";

/** A rival voter crowns us at 40-60 feeling (warlike races need more); aim just above the top. */
const FRIEND = 62;
/** One gift warms relations by BC/10, at most 20. */
const GIFT_BC = 200;
const GIFT_WARMTH = 20;

const WONDER_SCORE: Record<string, number> = {
  "w-chorus": 12, "w-embassy": 11, "w-archive": 8, "w-forge": 8, "w-garden": 7, "w-whisper": 2, "w-beacon": 2, "w-academy": 2,
};

function buildingScore(view: EmpireView, c: ColonyInfo, id: string, atWar: boolean, bestYard: Id | null): number {
  if (id === "w-ascension") return 0; // the Gate makes every empire attack its builder
  if (id.startsWith("w-")) return c.starId === bestYard && c.budget.production >= 80 ? (WONDER_SCORE[id] ?? 2) : 0;
  const crowded = c.population > c.capacity - 5;
  switch (id) {
    case "civic-forum": return 10;
    case "grand-theater": return 10;
    case "automated-foundry": return 9;
    case "research-institute": return 8;
    case "hydroponic-farms": return crowded ? 9 : 4;
    case "arcology": return crowded ? 9 : 5;
    case "spaceport": return 6;
    case "planetary-fortress": return atWar ? 7 : 0;
    case "orbital-drydock": return atWar && c.budget.production > 60 ? 4 : 1;
    default: return 1;
  }
}

/** Someone close enough to winning that fighting them is worth losing a friend. */
function nearlyWinning(view: EmpireView, id: Id): boolean {
  const s = view.standings.find((x) => x.id === id);
  return !!s && (s.buildingAscension || s.culture >= 54000 || s.techFields >= 5);
}

export function masterAIAnswers(view: EmpireView): Command[] {
  return basicAIAnswers(view);
}

export function masterAITurn(view: EmpireView): Command[] {
  const me = view.me;
  const atWar = view.contacts.some((c) => c.alive && c.warSince !== null);
  const out: Command[] = [];
  let treasury = me.treasury;

  // 1. The basic turn, minus what the master does itself.
  for (const cmd of basicAITurn(view)) {
    if (cmd.type === "declareWar" && !nearlyWinning(view, cmd.targetId)) continue;
    if (cmd.type === "buyBuilding" || cmd.type === "fundShips" || cmd.type === "councilVote" || cmd.type === "setBuilding") continue;
    if (cmd.type === "gift") treasury -= cmd.bc;
    if (cmd.type === "hireLeader") treasury -= me.leaderOffer?.cost ?? 0;
    out.push(cmd);
  }

  // 2. Take any peace that is offered.
  for (const c of view.contacts) {
    if (c.alive && c.warSince !== null && c.offersPeace && !nearlyWinning(view, c.id)
      && !out.some((x) => x.type === "offerPeace" && x.targetId === c.id)) out.push({ type: "offerPeace", targetId: c.id });
  }

  // 3. The council: vote for ourselves, never crown anyone else, and win friends before the vote.
  const session = view.council.session;
  const reserve = 100 + view.turn * 0.5 + (atWar ? 200 : 0);
  if (session && session.myVote === undefined && session.weight[me.id] !== undefined) {
    out.push({ type: "councilVote", candidateId: session.candidates.includes(me.id) ? me.id : null });
  }
  const standing = [...view.standings].filter((s) => s.alive).sort((a, b) => b.votes - a.votes);
  const votingNow = !!session && session.candidates.includes(me.id);
  const votingSoon = !session && view.turn >= 100 && view.council.nextTurn - view.turn <= 1 && standing.slice(0, 2).some((s) => s.id === me.id);
  if (votingNow || votingSoon) {
    const weight = (id: Id) => (session ? session.weight[id] ?? 0 : standing.find((s) => s.id === id)?.votes ?? 0);
    const total = session ? Object.values(session.weight).reduce((a, b) => a + b, 0) : standing.reduce((a, s) => a + s.votes, 0);
    let have = weight(me.id);
    const need = Math.ceil(total * VOTE_SHARE_TO_WIN);
    // Rivals vote in seat order: seats before ours have voted by the time we move on voting day,
    // so they get their gifts the turn before; later seats on the day itself.
    const voters = view.contacts
      .filter((c) => c.alive && c.warSince === null && weight(c.id) > 0)
      .map((c) => {
        const gifts = c.treaties.includes("alliance") ? 0 : Math.max(0, Math.ceil((FRIEND - c.attitude) / GIFT_WARMTH));
        return { c, gifts, w: weight(c.id), reachable: votingNow ? c.id > me.id || gifts === 0 : true };
      })
      .filter((v) => v.reachable)
      .sort((a, b) => a.gifts / a.w - b.gifts / b.w);
    // Buy the cheapest set of friends that carries the vote; if it can't be carried, keep the money.
    const plan: typeof voters = [];
    let cost = 0;
    for (const v of voters) {
      if (have >= need) break;
      plan.push(v); cost += v.gifts * GIFT_BC; have += v.w;
    }
    if (have >= need && cost <= treasury - 50) {
      for (const v of plan) {
        if (votingSoon && v.c.id > me.id) continue; // their gift goes on voting day
        for (let i = 0; i < v.gifts; i++) { out.push({ type: "gift", to: v.c.id, bc: GIFT_BC }); treasury -= GIFT_BC; }
      }
    }
  }

  // 4. Buildings: culture and growth first, wonders at the best yard.
  const bestYard = [...view.colonies].sort((a, b) => b.budget.production - a.budget.production)[0]?.starId ?? null;
  const rush: { starId: Id; cost: number }[] = [];
  for (const c of view.colonies) {
    const options = view.buildable(c.starId);
    let queue = c.buildQueue && c.buildQueue !== "w-ascension" && options.includes(c.buildQueue) ? c.buildQueue : null;
    if (!queue && c.population >= 6) {
      let bestScore = 0;
      for (const id of options) {
        const s = buildingScore(view, c, id, atWar, bestYard);
        if (s > bestScore) { bestScore = s; queue = id; }
      }
      if (queue) out.push({ type: "setBuilding", starId: c.starId, buildingId: queue });
      else if (c.buildQueue === "w-ascension") out.push({ type: "setBuilding", starId: c.starId, buildingId: null });
    }
    if (queue) rush.push({ starId: c.starId, cost: Math.ceil(Math.max(0, costFor(me, queue) - c.buildProgress) * 2) });
  }

  // 5. Spend the treasury every turn: rush buildings (cheapest first), then ships.
  let spare = treasury - reserve;
  for (const r of rush.sort((a, b) => a.cost - b.cost)) {
    if (r.cost <= 0 || r.cost > spare) continue;
    out.push({ type: "buyBuilding", starId: r.starId });
    spare -= r.cost;
  }
  const role = new Map(view.designs.map((d) => [d.id, d.role]));
  const yards = view.colonies
    .filter((c) => c.buildTemplate)
    .sort((a, b) => Number(role.get(b.buildTemplate!) === "warship") - Number(role.get(a.buildTemplate!) === "warship"));
  let pool = spare * (atWar ? 0.8 : 0.4);
  for (const yard of yards) {
    if (pool < 100) break;
    const bc = Math.floor(Math.min(pool, Math.max(150, pool / 2)));
    out.push({ type: "fundShips", starId: yard.starId, bc });
    pool -= bc;
  }
  return out;
}
