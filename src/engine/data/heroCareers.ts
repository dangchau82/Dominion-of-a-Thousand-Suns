// Hero careers and traits (written by Claude 2; Danny's list). Every hero starts in one of
// four roles. At level 3 they reach a crossroads and pick one of two careers; at level 5 they
// rise to that career's highest title. Along the way they pick up traits (one when they join,
// more at levels 2 and 4). Ideas borrowed from career trees in role-playing and strategy
// games; names and text are original.

export type HeroRole = "governor" | "spymaster" | "scientist" | "soldier";

export type Branch =
  | "viceroy" | "chancellor" // governor
  | "shadow" | "envoy" // spymaster
  | "visionary" | "engineer" // scientist
  | "general" | "admiral"; // soldier

export interface BranchDef {
  id: Branch;
  /** Title at level 3-4, and the highest title at level 5. */
  title: string;
  high: string;
  /** What the choice says in the crossroads event. */
  pitch: string;
  /** One line for the Legends page. */
  does: string;
}

export const ROLE_NAMES: Record<HeroRole, string> = { governor: "Governor", spymaster: "Spymaster", scientist: "Scientist", soldier: "Soldier" };

export const BRANCHES: Record<HeroRole, [BranchDef, BranchDef]> = {
  governor: [
    { id: "viceroy", title: "Viceroy", high: "Archon", pitch: "Become Viceroy: rule the worlds around their own as well", does: "Runs their world and the nearest worlds around it." },
    { id: "chancellor", title: "Chancellor", high: "High Chancellor", pitch: "Become Chancellor: run the treasury of the whole empire", does: "Collects BC from every world we hold." },
  ],
  spymaster: [
    { id: "shadow", title: "Shadow Master", high: "Hand in the Dark", pitch: "Become Shadow Master: steal more, and sabotage what they can't steal", does: "Steals research from our strongest rival and burns what it can't carry." },
    { id: "envoy", title: "Ambassador", high: "Voice of the Stars", pitch: "Become Ambassador: turn their silver tongue to diplomacy", does: "Warms every empire we know towards us." },
  ],
  scientist: [
    { id: "visionary", title: "Visionary", high: "Luminary", pitch: "Become a Visionary: give their whole life to their own field", does: "Pushes their own field of research far ahead." },
    { id: "engineer", title: "Chief Engineer", high: "Master Builder", pitch: "Become Chief Engineer: build the factories of the capital", does: "Construction research, and new factories at the capital." },
  ],
  soldier: [
    { id: "general", title: "General", high: "Lord Marshal", pitch: "Become a General: lead our troops on the ground", does: "Our troops fight harder in every invasion, and the capital is held more strongly." },
    { id: "admiral", title: "Admiral", high: "Grand Admiral", pitch: "Become an Admiral: take command of our largest fleet", does: "Our largest fleet fights better under their flag." },
  ],
};
export const BRANCH_BY_ID = new Map(Object.values(BRANCHES).flat().map((b) => [b.id, b]));
export const BRANCH_ROLE = new Map((Object.entries(BRANCHES) as [HeroRole, [BranchDef, BranchDef]][]).flatMap(([r, bs]) => bs.map((b) => [b.id, r] as const)));

export type TraitId = "brilliant" | "tireless" | "long-lived" | "beloved" | "frugal" | "scholarly" | "lucky" | "ruthless" | "silver-tongued" | "iron-willed" | "daring";

export interface TraitDef {
  id: TraitId;
  name: string;
  text: string;
  /** Roles that can gain it (all if left out). */
  roles?: HeroRole[];
}

export const TRAITS: TraitDef[] = [
  { id: "brilliant", name: "Brilliant", text: "Does their job a quarter better." },
  { id: "tireless", name: "Tireless", text: "Uses their great ability every 15 turns instead of 20." },
  { id: "long-lived", name: "Long-lived", text: "Will serve 30 turns longer." },
  { id: "beloved", name: "Beloved", text: "+2 culture a turn: the people adore them." },
  { id: "frugal", name: "Frugal", text: "+3 BC a turn saved on waste." },
  { id: "scholarly", name: "Scholarly", text: "+3 research a turn in our weakest field." },
  { id: "lucky", name: "Lucky", text: "Escapes death once." },
  { id: "ruthless", name: "Ruthless", text: "Hits harder: more stolen, more damage, harder fighting.", roles: ["spymaster", "soldier"] },
  { id: "silver-tongued", name: "Silver-tongued", text: "Every 10 turns, empires we know like us a little more.", roles: ["governor", "spymaster", "scientist"] },
  { id: "iron-willed", name: "Iron-willed", text: "The capital's defenders fight harder while they serve.", roles: ["governor", "soldier"] },
  { id: "daring", name: "Daring", text: "Fights with reckless courage (+1 attack for an admiral, harder invasions for a general).", roles: ["soldier"] },
];
export const TRAIT_BY_ID = new Map(TRAITS.map((t) => [t.id, t]));
