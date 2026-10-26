let audio: HTMLAudioElement | null = null;
let currentSrc = "";
let fadeTimer: number | null = null;
let fadeResolve: (() => void) | null = null;
let wantPlay = false;
let op = 0;
const listeners = new Set<() => void>();

const REST_VOLUME = 0.45;

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeMusic(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function stopFade(): void {
  if (fadeTimer != null) {
    window.clearInterval(fadeTimer);
    fadeTimer = null;
  }
  if (fadeResolve) {
    const resolve = fadeResolve;
    fadeResolve = null;
    resolve();
  }
}

function element(src: string): HTMLAudioElement {
  if (!audio) {
    audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0;
    audio.addEventListener("play", emit);
    audio.addEventListener("pause", emit);
  }
  if (src && currentSrc !== src) {
    audio.src = src;
    currentSrc = src;
  }
  audio.muted = false;
  return audio;
}

function fadeTo(target: number, ms: number): Promise<void> {
  stopFade();
  const player = audio;
  if (!player) return Promise.resolve();
  const start = player.volume;
  if (ms <= 0 || Math.abs(start - target) < 0.01) {
    player.volume = target;
    return Promise.resolve();
  }
  const steps = 16;
  let index = 0;
  return new Promise((resolve) => {
    fadeResolve = resolve;
    fadeTimer = window.setInterval(() => {
      index += 1;
      const current = audio;
      if (!current) {
        stopFade();
        return;
      }
      const t = Math.min(1, index / steps);
      const eased = t * t * (3 - 2 * t);
      current.volume = start + (target - start) * eased;
      if (index >= steps) {
        current.volume = target;
        const done = fadeResolve;
        fadeTimer = null;
        fadeResolve = null;
        done?.();
      }
    }, ms / steps);
  });
}

/** Play or pause. Playback starts only when this runs from a user gesture. */
export async function startMusic(src: string, muted: boolean): Promise<void> {
  const mine = ++op;
  if (muted) {
    wantPlay = false;
    if (audio && !audio.paused) {
      await fadeTo(0, 380);
      if (mine !== op || wantPlay || !audio) return;
      audio.pause();
      audio.volume = 0;
      emit();
    }
    return;
  }
  wantPlay = true;
  const player = element(src);
  if (player.paused) {
    player.volume = 0;
    await player.play();
    if (mine !== op) return;
  }
  await fadeTo(REST_VOLUME, 640);
}

export function musicIsPlaying(): boolean {
  return Boolean(audio && !audio.paused && !audio.muted);
}

export function fadeMusic(ms = 8000): void {
  if (!audio || audio.paused) return;
  void fadeTo(0, ms);
}

export function restoreMusicVolume(): void {
  if (audio && !audio.paused && wantPlay) void fadeTo(REST_VOLUME, 600);
}

/** Pause while the tab is hidden. Coming back resumes only if the listener already started. */
export function bindMusicVisibility(src: string): () => void {
  const onChange = () => {
    if (document.hidden) {
      if (audio && !audio.paused) {
        stopFade();
        audio.pause();
        audio.volume = 0;
        emit();
      }
      return;
    }
    if (!wantPlay) return;
    const player = element(src);
    if (!player.paused) return;
    player.volume = 0;
    void player
      .play()
      .then(() => fadeTo(REST_VOLUME, 700))
      .catch(() => {
        // A visibility change is not a gesture. The music button can start it.
      });
  };
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/** A short bell, only while the visit's music is actually playing. */
export function playChime(): void {
  if (!audio || audio.paused || audio.muted) return;
  const Ctx =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const context = new Ctx();
  const now = context.currentTime;
  const notes = [880, 1318];
  for (const [index, freq] of notes.entries()) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02 + index * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55 + index * 0.08);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now + index * 0.08);
    osc.stop(now + 0.7 + index * 0.08);
  }
  window.setTimeout(() => void context.close(), 1200);
}
