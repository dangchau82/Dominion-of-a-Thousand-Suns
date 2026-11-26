// A buried government secret (ideas pipeline, inspired by a frontier show's hidden planet;
// idea only, all names and text original). Written by Claude 2. A 6-event chain in the
// LateGameEventDef format, run by chains.ts: events 1-2, then event 3 picks the branch
// (order = reveal it, chaos = bury it, neutral = use it), two branch events, and a finale.
import type { LateGameEventDef } from "./lateGameLore";

export const SECRET_NAME = "Project Hushfall";

export const SECRET_CHAIN: LateGameEventDef[] = [
  {
    id: "secret-1-sealed-archive",
    title: "The Sealed Archive",
    art: "ruins",
    trigger: "colony",
    text: "Engineers widening the old records vault on {colony} break into a sealed room nobody remembers building. Inside: shelves of encrypted data cores stamped with our own government's seal and a single word, Hushfall.",
    choices: [
      { label: "Decrypt the cores", result: "Our best cryptographers start work. The first files are dull budget sheets. Then they aren't.", effects: [{ kind: "research", field: "computers", amount: 120 }, { kind: "money", amount: -60 }] },
      { label: "Seal the room again, quietly", result: "The door is welded shut. The engineers are moved to other postings, and talk anyway.", effects: [{ kind: "morale", amount: -2 }, { kind: "money", amount: 40 }] },
    ],
  },
  {
    id: "secret-2-what-hushfall-was",
    title: "What Hushfall Was",
    art: "crisis",
    trigger: "colony",
    requires: "secret-1-sealed-archive",
    text: "The files are clear now. Generations ago, a frontier colony rose against our rule. Instead of sending troops, the government sent Hushfall: a broadcast that rewrote memories. Within a year the rebels had forgotten the rebellion, their leaders, even their own songs.",
    choices: [
      { label: "Find out if anyone from that colony is still alive", result: "A few names turn up in old census rolls. One of them is still listed as living.", effects: [{ kind: "money", amount: -80 }] },
      { label: "Study how the broadcast worked", result: "The engineering is brilliant and horrifying. Our scientists can't stop reading.", effects: [{ kind: "research", field: "computers", amount: 220 }, { kind: "morale", amount: -2 }] },
    ],
  },
  {
    id: "secret-3-the-choice",
    title: "What We Do With It",
    art: "council",
    trigger: "turn",
    requires: "secret-2-what-hushfall-was",
    text: "Word of the archive is spreading through the ministries. The cabinet must decide: tell the people the truth, bury Hushfall so deep nobody finds it again, or quietly keep the broadcast in case it is ever needed.",
    choices: [
      { label: "Tell the people everything", result: "The Chancellor reads the files aloud in the assembly. The chamber goes silent.", effects: [{ kind: "culture", amount: 120 }, { kind: "morale", amount: -4 }] },
      { label: "Bury it: destroy the files", result: "The cores are melted down. Officially, Hushfall never existed.", effects: [{ kind: "morale", amount: 2 }, { kind: "money", amount: -100 }] },
      { label: "Keep the broadcast, just in case", result: "The cores go to a vault only three people can open. Nobody sleeps well.", effects: [{ kind: "research", field: "computers", amount: 160 }, { kind: "morale", amount: -3 }] },
    ],
  },
  {
    id: "secret-4o-hearings",
    title: "The Hushfall Hearings",
    art: "council",
    trigger: "turn",
    requires: "secret-3-the-choice",
    branch: "order",
    text: "Public hearings into Hushfall run for weeks. Retired officials testify; some weep, some defend it. The frontier colonies demand to know whether it was ever used on them.",
    choices: [
      { label: "Open every archive to the frontier worlds", result: "No other colony was touched. Trust in the government rises slowly, painfully.", effects: [{ kind: "culture", amount: 140 }, { kind: "relations", amount: 8 }, { kind: "money", amount: -120 }] },
      { label: "Close the hearings: the past is the past", result: "The hearings end early. Many feel cheated of the truth.", effects: [{ kind: "morale", amount: -3 }, { kind: "money", amount: 80 }] },
    ],
  },
  {
    id: "secret-5o-the-survivors",
    title: "The Survivors Speak",
    art: "contact",
    trigger: "colony",
    requires: "secret-4o-hearings",
    branch: "order",
    text: "Descendants of the Hushfall colony arrive at {colony}. They never knew what their grandparents lost. Now they want their history back, and an apology.",
    choices: [
      { label: "Apologise and fund a memorial", result: "The memorial's empty plinth, for the songs nobody remembers, becomes a place of pilgrimage.", effects: [{ kind: "culture", amount: 160 }, { kind: "morale", amount: 4 }, { kind: "money", amount: -150 }] },
      { label: "Offer them land and money instead", result: "They take the land. They do not forgive.", effects: [{ kind: "population", amount: 2 }, { kind: "money", amount: -120 }] },
    ],
  },
  {
    id: "secret-4c-whistleblower",
    title: "The Whistleblower",
    art: "crisis",
    trigger: "turn",
    requires: "secret-3-the-choice",
    branch: "chaos",
    text: "An archivist kept a copy. She has fled toward the border and is broadcasting fragments of the Hushfall files to anyone who will listen, including the {rival}.",
    choices: [
      { label: "Send agents to bring her back", result: "She is found. The broadcasts stop. The rumours do not.", effects: [{ kind: "money", amount: -140 }, { kind: "morale", amount: -3 }] },
      { label: "Deny everything", result: "Our denials are loud and official. Not everyone believes them.", effects: [{ kind: "relations", amount: -10 }, { kind: "culture", amount: -60 }] },
    ],
  },
  {
    id: "secret-5c-leaks",
    title: "Leaks in the Dark",
    art: "crisis",
    trigger: "colony",
    requires: "secret-4c-whistleblower",
    branch: "chaos",
    text: "Graffiti appears overnight on {colony}: a single word, Hushfall, painted on every ministry wall. Nobody knows who started it. Everybody knows what it means.",
    choices: [
      { label: "Crack down on the vandals", result: "Arrests make it worse. The word is everywhere now.", effects: [{ kind: "morale", amount: -5 }, { kind: "factories", amount: -3 }] },
      { label: "Admit it at last", result: "A late confession. Some respect it; many never trust us again.", effects: [{ kind: "culture", amount: 100 }, { kind: "morale", amount: -2 }] },
    ],
  },
  {
    id: "secret-4n-quiet-broadcast",
    title: "The Quiet Broadcast",
    art: "anomaly",
    trigger: "colony",
    requires: "secret-3-the-choice",
    branch: "neutral",
    text: "Unrest on {colony} is growing. The three keyholders meet in the vault. A short, faint Hushfall broadcast would calm the crowds. Nobody would ever know.",
    choices: [
      { label: "Broadcast, once, faintly", result: "By morning the protests have dissolved. People can't quite say why they were angry.", effects: [{ kind: "morale", amount: 6 }, { kind: "culture", amount: -80 }] },
      { label: "Leave the vault shut", result: "The protests run their course. The vault stays closed, for now.", effects: [{ kind: "morale", amount: -2 }, { kind: "culture", amount: 60 }] },
    ],
  },
  {
    id: "secret-6-last-survivor",
    title: "The Last Survivor of Hushfall",
    art: "contact",
    trigger: "colony",
    requires: "secret-3-the-choice",
    text: "The last person alive who heard the original Hushfall broadcast asks to see {colony} before she dies. She remembers nothing of the rebellion, only that something was taken. She wants to know if it was worth it.",
    choices: [
      { label: "Tell her the whole truth", result: "She listens, nods, and says she is glad someone finally remembered.", effects: [{ kind: "culture", amount: 140 }, { kind: "morale", amount: 3 }] },
      { label: "Give her a comfortable lie", result: "She leaves content. The ministers who arranged it do not sleep any better.", effects: [{ kind: "morale", amount: 2 }, { kind: "money", amount: 60 }] },
    ],
  },
];
