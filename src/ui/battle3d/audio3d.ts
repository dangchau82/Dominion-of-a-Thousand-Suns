// Battle sounds made in code with WebAudio: no audio files, nothing to download.
// Respects the game's sound switch (ui/sound.ts). Every sound is short and quiet so a
// busy battle doesn't turn into noise; a limiter keeps the total in check.

import { soundOn } from "../sound";

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;
let live = 0;

function audio(): AudioContext | null {
  if (!soundOn()) return null;
  try {
    if (!ctx) {
      ctx = new AudioContext();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18; comp.ratio.value = 8;
      out = ctx.createGain(); out.gain.value = 0.7;
      out.connect(comp).connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noise.getChannelData(0);
      let seed = 12345;
      for (let i = 0; i < d.length; i++) { seed = (seed * 1103515245 + 12345) >>> 0; d[i] = (seed / 4294967296) * 2 - 1; }
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch { return null; }
}

/** Don't stack more than this many sounds at once. */
const MAX_LIVE = 14;

function env(g: GainNode, t: number, peak: number, attack: number, decay: number): void {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function voice(make: (a: AudioContext, t: number, dest: AudioNode) => number): void {
  const a = audio();
  if (!a || !out || live >= MAX_LIVE) return;
  live++;
  const dur = make(a, a.currentTime, out);
  setTimeout(() => { live--; }, dur * 1000 + 50);
}

export const sfx = {
  /** A beam weapon: a falling zap. Pitch varies a little so a volley isn't one note. */
  laser(pitch = 1): void {
    voice((a, t, dest) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(1400 * pitch, t);
      o.frequency.exponentialRampToValueAtTime(180 * pitch, t + 0.22);
      const f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 3000;
      env(g, t, 0.08, 0.005, 0.22);
      o.connect(f).connect(g).connect(dest); o.start(t); o.stop(t + 0.3);
      return 0.3;
    });
  },
  /** A heavy gun or torpedo launch: low thump plus a burst of noise. */
  cannon(): void {
    voice((a, t, dest) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.25);
      env(g, t, 0.25, 0.004, 0.3);
      o.connect(g).connect(dest); o.start(t); o.stop(t + 0.35);
      const n = a.createBufferSource(); n.buffer = noise;
      const f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 900;
      const ng = a.createGain(); env(ng, t, 0.12, 0.002, 0.12);
      n.connect(f).connect(ng).connect(dest); n.start(t); n.stop(t + 0.2);
      return 0.35;
    });
  },
  /** A missile launch: rising hiss. */
  missile(): void {
    voice((a, t, dest) => {
      const n = a.createBufferSource(); n.buffer = noise;
      const f = a.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 2;
      f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(3500, t + 0.6);
      const g = a.createGain(); env(g, t, 0.07, 0.05, 0.6);
      n.connect(f).connect(g).connect(dest); n.start(t); n.stop(t + 0.7);
      return 0.7;
    });
  },
  /** Something blows up. `big` for a ship kill, small for hits. */
  explosion(big = false): void {
    voice((a, t, dest) => {
      const dur = big ? 1.6 : 0.4;
      const n = a.createBufferSource(); n.buffer = noise;
      const f = a.createBiquadFilter(); f.type = "lowpass";
      f.frequency.setValueAtTime(big ? 2200 : 1600, t); f.frequency.exponentialRampToValueAtTime(big ? 120 : 300, t + dur);
      const g = a.createGain(); env(g, t, big ? 0.5 : 0.12, 0.003, dur);
      n.connect(f).connect(g).connect(dest); n.start(t); n.stop(t + dur + 0.05);
      if (big) {
        const o = a.createOscillator(), og = a.createGain();
        o.type = "sine"; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(25, t + 1.2);
        env(og, t, 0.35, 0.01, 1.2);
        o.connect(og).connect(dest); o.start(t); o.stop(t + 1.3);
      }
      return dur + 0.1;
    });
  },
  /** A shot stopped by a shield: bright shimmer. */
  shield(): void {
    voice((a, t, dest) => {
      for (const [fr, d] of [[880, 0], [1320, 0.02], [1760, 0.04]] as const) {
        const o = a.createOscillator(), g = a.createGain();
        o.type = "sine"; o.frequency.setValueAtTime(fr, t + d); o.frequency.linearRampToValueAtTime(fr * 0.94, t + d + 0.3);
        env(g, t + d, 0.035, 0.01, 0.3);
        o.connect(g).connect(dest); o.start(t + d); o.stop(t + d + 0.35);
      }
      return 0.4;
    });
  },
};

// ---- background music for the battle screen: a slow, tense drone with a pulse ----
let music: { stop: () => void } | null = null;

export function startBattleMusic(): void {
  const a = audio();
  if (!a || !out || music) return;
  const g = a.createGain(); g.gain.value = 0.0001; g.connect(out);
  g.gain.exponentialRampToValueAtTime(0.11, a.currentTime + 2);
  const nodes: (OscillatorNode | AudioBufferSourceNode)[] = [];
  // low drone: two detuned saws through a slowly sweeping filter
  const f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 400; f.Q.value = 6; f.connect(g);
  const lfo = a.createOscillator(); lfo.frequency.value = 0.07; const lg = a.createGain(); lg.gain.value = 250; lfo.connect(lg).connect(f.frequency); lfo.start(); nodes.push(lfo);
  for (const fr of [55, 55.4, 82.4]) { const o = a.createOscillator(); o.type = "sawtooth"; o.frequency.value = fr; const og = a.createGain(); og.gain.value = 0.25; o.connect(og).connect(f); o.start(); nodes.push(o); }
  // a war-drum pulse every 1.6 s
  let stopped = false;
  const beat = () => {
    if (stopped || !ctx || !out) return;
    const t = ctx.currentTime;
    for (const [d, v] of [[0, 1], [0.4, 0.6], [0.8, 0.8]] as const) {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(95, t + d); o.frequency.exponentialRampToValueAtTime(38, t + d + 0.3);
      env(og, t + d, 0.18 * v, 0.005, 0.35);
      o.connect(og).connect(g); o.start(t + d); o.stop(t + d + 0.4);
    }
  };
  beat();
  const timer = setInterval(beat, 1600);
  music = {
    stop: () => {
      stopped = true; clearInterval(timer);
      if (ctx) { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setValueAtTime(g.gain.value, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8); }
      setTimeout(() => { for (const n of nodes) { try { n.stop(); } catch { /* already stopped */ } } g.disconnect(); }, 900);
    },
  };
}

export function stopBattleMusic(): void {
  music?.stop();
  music = null;
}
