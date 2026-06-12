// Sound and haptics for the /preview layer.
// Synthesis voicing ported from the proven Web Audio pattern in
// flowstate-v2/src/lib/cadence/dropSound.ts (original: bccs-mnmtss-hub
// src/lib/bce-board/dropSound.ts). Pure Web Audio, no assets, no deps.
//
// One change from the source pattern, learned in this preview: the source
// created a NEW AudioContext per play, fine for rare drag-drops, but a UI
// that clicks on every tap piles up contexts until the browser caps them,
// which shows up as crackle and a growing delay before each sound. This
// module keeps ONE shared context for the whole session and resumes it on
// demand. Same exported API as before.
//
// Known limit: iPad Safari has no vibrate; sound and motion carry tablets.

let soundEnabled = true;
let sharedCtx: AudioContext | null = null;

export function setSoundEnabled(on: boolean) {
  soundEnabled = on;
}

function getCtx(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return null;
    if (!sharedCtx) {
      type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
      const AudioCtx = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
      if (!AudioCtx) return null;
      sharedCtx = new AudioCtx();
    }
    if (sharedCtx.state === "suspended") {
      void sharedCtx.resume();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // No vibration support: silent fallback.
  }
}

/** A crisp, contemporary click on every press. Transient-forward, so it reads
 *  as a real click: a focused, resonant filtered tick (the snap) leads, with a
 *  short mid-range body under it for tactility. Mid-bright, not a high chirp,
 *  not a low tok. Quiet and short, since it fires on every press. */
export function playClick() {
  vibrate(6);
  if (!soundEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;

    // Layer 1: the click snap. A short noise burst through a resonant bandpass
    // around 2.2 kHz gives a focused, distinctive tick rather than a hiss.
    const dur = 0.013;
    const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.5);
    }
    const noise = ctx.createBufferSource();
    const noiseFilter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    noise.buffer = buffer;
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 2200;
    noiseFilter.Q.value = 1.6;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseGain.gain.setValueAtTime(0.075, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.0006, t + dur);
    noise.start(t);

    // Layer 2: a short mid body for tactility, triangle, slight downward settle.
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = "triangle";
    body.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    body.frequency.setValueAtTime(520, t);
    body.frequency.exponentialRampToValueAtTime(430, t + 0.028);
    bodyGain.gain.setValueAtTime(0.0001, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.11, t + 0.003);
    bodyGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.045);
    body.start(t);
    body.stop(t + 0.05);
  } catch {
    // Silent fallback.
  }
}

/** Two-tone chime on success. */
export function playSuccess() {
  vibrate([10, 40, 18]);
  if (!soundEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const first = ctx.createOscillator();
    const firstGain = ctx.createGain();
    first.type = "triangle";
    first.connect(firstGain);
    firstGain.connect(ctx.destination);
    first.frequency.setValueAtTime(660, t);
    firstGain.gain.setValueAtTime(0.16, t);
    firstGain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    first.start(t);
    first.stop(t + 0.18);

    const second = ctx.createOscillator();
    const secondGain = ctx.createGain();
    second.type = "triangle";
    second.connect(secondGain);
    secondGain.connect(ctx.destination);
    second.frequency.setValueAtTime(990, t + 0.12);
    secondGain.gain.setValueAtTime(0, t + 0.1);
    secondGain.gain.linearRampToValueAtTime(0.16, t + 0.14);
    secondGain.gain.exponentialRampToValueAtTime(0.01, t + 0.38);
    second.start(t + 0.12);
    second.stop(t + 0.38);
  } catch {
    // Silent fallback.
  }
}

/** Low buzz on errors. Gentle, never alarming. */
export function playError() {
  vibrate([30, 30, 30]);
  if (!soundEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.2);
    gain.gain.setValueAtTime(0.13, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    osc.start(t);
    osc.stop(t + 0.25);
  } catch {
    // Silent fallback.
  }
}
