// Small synthesized sound effects (no audio files). Off switch in the game menu.

const KEY = "dots.sound";
let ctx: AudioContext | null = null;

export function soundOn(): boolean {
  try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
}
export function setSound(on: boolean): void {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* storage unavailable */ }
}

type Note = [freq: number, start: number, dur: number, type?: OscillatorType, vol?: number];

const SOUNDS: Record<string, Note[]> = {
  click: [[660, 0, 0.05, "sine", 0.05]],
  turn: [[392, 0, 0.08, "triangle", 0.07], [523, 0.07, 0.12, "triangle", 0.07]],
  discovery: [[523, 0, 0.1, "sine"], [659, 0.09, 0.1, "sine"], [784, 0.18, 0.18, "sine"]],
  colony: [[440, 0, 0.12, "triangle"], [554, 0.1, 0.12, "triangle"], [659, 0.2, 0.25, "triangle"]],
  battle: [[110, 0, 0.25, "sawtooth", 0.06], [82, 0.12, 0.35, "square", 0.04]],
  war: [[147, 0, 0.3, "sawtooth", 0.07], [139, 0.28, 0.45, "sawtooth", 0.07]],
  message: [[880, 0, 0.07, "sine", 0.05], [988, 0.08, 0.1, "sine", 0.05]],
  victory: [[523, 0, 0.15], [659, 0.15, 0.15], [784, 0.3, 0.15], [1047, 0.45, 0.5]],
  defeat: [[392, 0, 0.3, "triangle"], [330, 0.3, 0.3, "triangle"], [262, 0.6, 0.7, "triangle"]],
};

export function play(name: keyof typeof SOUNDS | string): void {
  if (!soundOn()) return;
  const notes = SOUNDS[name];
  if (!notes) return;
  try {
    ctx ??= new AudioContext();
    const now = ctx.currentTime;
    for (const [freq, start, dur, type = "sine", vol = 0.08] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(vol, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    }
  } catch { /* audio not available */ }
}
