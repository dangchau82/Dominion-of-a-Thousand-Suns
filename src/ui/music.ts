// Background music made in code (WebAudio): slow space-ambient pads and a soft arpeggio that
// never repeats exactly. Two moods: "peace" (open, bright chords) and "war" (darker chords,
// low pulse, faster arpeggio). No audio files. Its own on/off switch, and it stays silent
// when the game's sound is off.

import { soundOn } from "./sound";

const KEY = "dots.music";
export function musicOn(): boolean { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } }
export function setMusic(on: boolean): void {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* storage unavailable */ }
  if (on) startMusic(); else stopMusic();
}

type Mood = "peace" | "war";
// Chords as semitones above A1 (55 Hz). Peace: Am9 - Fmaj7 - Cmaj7 - G6. War: Dm - Bb - Gm - A (sus).
const CHORDS: Record<Mood, number[][]> = {
  peace: [[0, 7, 12, 14, 19], [-4, 3, 11, 16, 19], [3, 10, 14, 19, 22], [-2, 5, 9, 14, 17]],
  war: [[5, 12, 17, 20, 24], [1, 8, 13, 17, 20], [-2, 5, 10, 13, 17], [0, 7, 12, 14, 19]],
};
const hz = (semi: number) => 55 * Math.pow(2, semi / 12);

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let mood: Mood = "peace";
let timer: ReturnType<typeof setTimeout> | null = null;
let step = 0;
let seed = 99;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

function ensure(): boolean {
  if (!soundOn() || !musicOn()) return false;
  try {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain(); master.gain.value = 0.0001;
      const verbIn = ctx.createGain();
      // a cheap "space" echo: two feedback delays
      for (const [time, fb] of [[0.37, 0.45], [0.61, 0.35]] as const) {
        const d = ctx.createDelay(1.5); d.delayTime.value = time;
        const g = ctx.createGain(); g.gain.value = fb;
        const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2200;
        verbIn.connect(d); d.connect(lp).connect(g).connect(d); g.connect(ctx.destination);
      }
      master.connect(ctx.destination);
      master.connect(verbIn);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return true;
  } catch { return false; }
}

function pad(freq: number, t: number, dur: number, vol: number): void {
  const a = ctx!, out = master!;
  for (const det of [-6, 6]) {
    const o = a.createOscillator(); o.type = "sawtooth"; o.frequency.value = freq; o.detune.value = det;
    const f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(900 + rnd() * 500, t + dur / 2); f.frequency.linearRampToValueAtTime(400, t + dur);
    const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.35); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05);
  }
}
function pluck(freq: number, t: number, vol: number): void {
  const a = ctx!, out = master!;
  const o = a.createOscillator(); o.type = "triangle"; o.frequency.value = freq;
  const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
  o.connect(g).connect(out); o.start(t); o.stop(t + 1.5);
}
function drum(t: number, vol: number): void {
  const a = ctx!, out = master!;
  const o = a.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(35, t + 0.35);
  const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  o.connect(g).connect(out); o.start(t); o.stop(t + 0.5);
}

/** One bar of music (one chord), then schedule the next. */
function bar(): void {
  if (!ensure()) { timer = null; return; }
  const a = ctx!;
  const t = a.currentTime + 0.05;
  const war = mood === "war";
  const len = war ? 6 : 8;
  const chord = CHORDS[mood][step % 4]!;
  step++;
  pad(hz(chord[0]! - 12), t, len + 1, 0.05);
  for (const n of chord.slice(1, 4)) pad(hz(n), t, len + 1, 0.022);
  const notes = war ? 12 : 7;
  for (let i = 0; i < notes; i++) {
    if (rnd() < (war ? 0.25 : 0.35)) continue;
    const n = chord[1 + Math.floor(rnd() * (chord.length - 1))]! + 12 * (1 + Math.floor(rnd() * 2));
    pluck(hz(n), t + (i * len) / notes + rnd() * 0.05, war ? 0.03 : 0.025);
  }
  if (war) for (let i = 0; i < 4; i++) drum(t + i * (len / 4), i % 2 ? 0.08 : 0.14);
  timer = setTimeout(bar, len * 1000);
}

/** Start the music (call from a user gesture the first time, so browsers allow sound). */
export function startMusic(): void {
  if (!ensure()) return;
  const a = ctx!;
  master!.gain.cancelScheduledValues(a.currentTime);
  master!.gain.setValueAtTime(Math.max(0.0001, master!.gain.value), a.currentTime);
  master!.gain.exponentialRampToValueAtTime(0.5, a.currentTime + 3);
  if (!timer) bar();
}

export function stopMusic(): void {
  if (timer) { clearTimeout(timer); timer = null; }
  if (ctx && master) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), ctx.currentTime); master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5); }
}

/** Switch between peaceful and tense music at the next chord. */
export function setMood(m: Mood): void { mood = m; }

/** Quieter while a battle replay plays its own music. */
export function duckMusic(on: boolean): void {
  if (!ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(on ? 0.06 : 0.5, ctx.currentTime + 0.8);
}
