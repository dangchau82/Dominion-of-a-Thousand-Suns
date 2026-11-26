// The player's autopilot runs only what the player lets it. Each autopilot command belongs to an area
// (colonies, research, fleets, diplomacy, empire); areas the player took back, and colonies marked
// "hands off", are left exactly as the player set them. Rival AIs are never filtered.
// Commands that keep the game moving (answering events, keep playing) always go through.

import type { Command } from "../engine/commands";
import type { AutoArea, Empire, GameState } from "../engine/types";

const AREA: Partial<Record<Command["type"], AutoArea>> = {
  setSlider: "colonies", setSliders: "colonies", lockSlider: "colonies", setBuild: "colonies", setBuilding: "colonies",
  buyBuilding: "colonies", fundShips: "colonies", issueEdict: "colonies", declarePrison: "colonies",
  setResearch: "research", setResearchProject: "research",
  createDesign: "fleets", scrapDesign: "fleets", moveFleet: "fleets", colonize: "fleets", crackPlanet: "fleets", sendTransports: "fleets",
  declareWar: "diplomacy", propose: "diplomacy", respond: "diplomacy", gift: "diplomacy", breakTreaty: "diplomacy",
  offerPeace: "diplomacy", councilVote: "diplomacy", councilVerdict: "diplomacy", resolutionVote: "diplomacy",
  investSink: "empire", hireLeader: "empire", dismissLeader: "empire", proclaim: "empire", revokeProclamation: "empire",
  setSpies: "empire", setSecurity: "empire",
};

export function areaOf(cmd: Command): AutoArea | null {
  return AREA[cmd.type] ?? null;
}

/** May the player's autopilot carry out this command? */
export function autopilotMay(state: GameState, e: Empire, cmd: Command): boolean {
  const area = areaOf(cmd);
  if (!area) return true;
  if (e.autoOff?.includes(area)) return false;
  // A colony marked hands off: nothing that changes it. Ships may still leave from it.
  const starId = "starId" in cmd ? cmd.starId : undefined;
  if (starId !== undefined && (area === "colonies" || cmd.type === "investSink") && state.colonies[starId]?.handsOff) return false;
  return true;
}
