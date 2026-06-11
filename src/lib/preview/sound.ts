// Sound and haptics for the /preview layer.
// Synthesis approach ported from the proven Web Audio pattern in
// flowstate-v2/src/lib/cadence/dropSound.ts (original: bccs-mnmtss-hub
// src/lib/bce-board/dropSound.ts). Pure Web Audio, no assets, no deps.
// New here: a user-facing sound toggle and navigator.vibrate support.
// Known limit: iPad Safari has no vibrate; sound and motion carry tablets.

let soundEnabled = true;

export function setSoundEnabled(on: boolean) {
  soundEnabled = on;
}

function getCtx(): AudioContext | null {
  try {
    type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
    const AudioCtx =
      typeof window !== "undefined"
        ? window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
        : undefined;
    if (!AudioCtx) return null;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return null;
    return new AudioCtx();
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

/** Soft click on every press. Short, quiet, low. */
export function playClick() {
  vibrate(8);
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
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.05);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);
    osc.start(t);
    osc.stop(t + 0.07);
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
    firstGain.gain.setValueAtTime(0.18, t);
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
    secondGain.gain.linearRampToValueAtTime(0.18, t + 0.14);
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
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    osc.start(t);
    osc.stop(t + 0.25);
  } catch {
    // Silent fallback.
  }
}
