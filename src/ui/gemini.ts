// Optional Gemini link: chat freely with alien leaders.
// The API key is typed in by the player and kept only in this browser's storage.
// It is never in the code, never in saves, and never sent anywhere except Google's API.
// Chat is flavour only: it can't change the game, so the AI stays fair.

const KEY = "dots.gemini.key";
const MODEL = "dots.gemini.model";
export const DEFAULT_MODEL = "gemini-2.5-flash";

export function geminiKey(): string {
  try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; }
}
export function geminiModel(): string {
  try { return localStorage.getItem(MODEL) || DEFAULT_MODEL; } catch { return DEFAULT_MODEL; }
}
export function saveGemini(key: string, model: string): void {
  try {
    if (key) localStorage.setItem(KEY, key.trim()); else localStorage.removeItem(KEY);
    localStorage.setItem(MODEL, model.trim() || DEFAULT_MODEL);
  } catch { /* storage unavailable */ }
}

export interface ChatTurn { role: "user" | "model"; text: string }

export async function geminiChat(system: string, history: ChatTurn[]): Promise<string> {
  const key = geminiKey();
  if (!key) throw new Error("No Gemini key set. Add one in ☰ → Gemini link.");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel())}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: history.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
      generationConfig: { maxOutputTokens: 300, temperature: 0.9 },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(res.status === 400 || res.status === 403 ? "Gemini refused the key or model. Check them in ☰ → Gemini link." : `Gemini error ${res.status}: ${detail.slice(0, 120)}`);
  }
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini sent an empty reply. Try again.");
  return text;
}
