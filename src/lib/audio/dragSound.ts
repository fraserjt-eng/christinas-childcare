// Shared drag/drop audio + haptic feedback for kanban-style surfaces.
// Ported from MnMTSS Hub's bce-board/dropSound.ts (4-layer Web Audio synthesis)
// with a softer "lift" tone added for drag-start.
//
// All functions are silent no-ops when:
//   - rendering server-side (no window)
//   - Web Audio API unavailable
//   - user has disabled sound via localStorage `christinas_kanban_sound === 'off'`
//
// No external audio assets, no extra dependencies.

export type DropDirection = 'forward' | 'backward';

const SOUND_PREF_KEY = 'christinas_kanban_sound';

function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SOUND_PREF_KEY) !== 'off';
  } catch {
    return true;
  }
}

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
  const Ctor =
    window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!Ctor) return null;
  try {
    return new Ctor();
  } catch {
    return null;
  }
}

// ─── Lift (drag-start) ──────────────────────────────────────────────────────
// Soft, brief "pickup" cue. Gentler than the layered drop so it doesn't
// fatigue the ear on every micro-movement.

export function playLiftSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.06);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  } catch {
    // silent fallback
  }
}

// ─── Drop (drag-end) ────────────────────────────────────────────────────────
// 4-layer satisfying "chunk" sound. Direction-aware:
//   forward  — moving toward completion (ascending swoosh, rising boom, triumphant ping)
//   backward — moving away from completion (descending swoosh, falling boom, descending ping)
//
// If your surface has no notion of direction, just call playDropSound() and
// you'll get the forward variant.

export function playDropSound(direction: DropDirection = 'forward'): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;

    if (direction === 'forward') {
      // Layer 1: Ascending swoosh
      const swoosh = ctx.createOscillator();
      const swooshGain = ctx.createGain();
      swoosh.type = 'sine';
      swoosh.connect(swooshGain);
      swooshGain.connect(ctx.destination);
      swoosh.frequency.setValueAtTime(80, t);
      swoosh.frequency.exponentialRampToValueAtTime(400, t + 0.18);
      swooshGain.gain.setValueAtTime(0.35, t);
      swooshGain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
      swoosh.start(t);
      swoosh.stop(t + 0.22);

      // Layer 2: Ascending filtered noise
      const bufferSize = ctx.sampleRate * 0.15;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        noiseData[i] =
          (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      const noiseFilter = ctx.createBiquadFilter();
      noise.buffer = noiseBuffer;
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(200, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(2000, t + 0.12);
      noiseFilter.Q.value = 1.5;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseGain.gain.setValueAtTime(0.2, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      noise.start(t);

      // Layer 3: Rising power chord
      const boom = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boom.type = 'sine';
      boom.connect(boomGain);
      boomGain.connect(ctx.destination);
      boom.frequency.setValueAtTime(80, t + 0.08);
      boom.frequency.exponentialRampToValueAtTime(200, t + 0.3);
      boomGain.gain.setValueAtTime(0, t + 0.06);
      boomGain.gain.linearRampToValueAtTime(0.4, t + 0.1);
      boomGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      boom.start(t + 0.06);
      boom.stop(t + 0.35);

      // Layer 4: Triumphant high ping
      const ping = ctx.createOscillator();
      const pingGain = ctx.createGain();
      ping.type = 'triangle';
      ping.connect(pingGain);
      pingGain.connect(ctx.destination);
      ping.frequency.setValueAtTime(800, t + 0.12);
      ping.frequency.exponentialRampToValueAtTime(1600, t + 0.25);
      pingGain.gain.setValueAtTime(0, t + 0.1);
      pingGain.gain.linearRampToValueAtTime(0.2, t + 0.13);
      pingGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      ping.start(t + 0.1);
      ping.stop(t + 0.35);
    } else {
      // Layer 1: Descending swoosh
      const swoosh = ctx.createOscillator();
      const swooshGain = ctx.createGain();
      swoosh.type = 'sine';
      swoosh.connect(swooshGain);
      swooshGain.connect(ctx.destination);
      swoosh.frequency.setValueAtTime(300, t);
      swoosh.frequency.exponentialRampToValueAtTime(60, t + 0.15);
      swooshGain.gain.setValueAtTime(0.4, t);
      swooshGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      swoosh.start(t);
      swoosh.stop(t + 0.2);

      // Layer 2: Noise burst
      const bufferSize = ctx.sampleRate * 0.15;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        noiseData[i] =
          (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
      }
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      const noiseFilter = ctx.createBiquadFilter();
      noise.buffer = noiseBuffer;
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.12);
      noiseFilter.Q.value = 2;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseGain.gain.setValueAtTime(0.25, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      noise.start(t);

      // Layer 3: Impact boom
      const boom = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boom.type = 'sine';
      boom.connect(boomGain);
      boomGain.connect(ctx.destination);
      boom.frequency.setValueAtTime(120, t + 0.1);
      boom.frequency.exponentialRampToValueAtTime(40, t + 0.35);
      boomGain.gain.setValueAtTime(0, t + 0.08);
      boomGain.gain.linearRampToValueAtTime(0.5, t + 0.12);
      boomGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      boom.start(t + 0.08);
      boom.stop(t + 0.4);

      // Layer 4: Descending ping
      const ping = ctx.createOscillator();
      const pingGain = ctx.createGain();
      ping.type = 'triangle';
      ping.connect(pingGain);
      pingGain.connect(ctx.destination);
      ping.frequency.setValueAtTime(1400, t + 0.12);
      ping.frequency.exponentialRampToValueAtTime(800, t + 0.22);
      pingGain.gain.setValueAtTime(0, t + 0.1);
      pingGain.gain.linearRampToValueAtTime(0.15, t + 0.13);
      pingGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      ping.start(t + 0.1);
      ping.stop(t + 0.3);
    }
  } catch {
    // silent fallback
  }
}

// ─── Haptic ─────────────────────────────────────────────────────────────────
// Vibration patterns for mobile. Silently no-ops on devices without support
// (most desktops, iOS Safari) and respects the same sound-off preference so
// users get a single quiet toggle.

export function vibrate(pattern: number | number[]): void {
  if (!isSoundEnabled()) return;
  if (typeof navigator === 'undefined') return;
  if (!('vibrate' in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // silent fallback
  }
}

// Convenience presets matched to lift/drop intensities.
export function vibrateLift(): void {
  vibrate(10);
}

export function vibrateDrop(): void {
  vibrate([15, 30, 25]);
}
