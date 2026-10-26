let audio: HTMLAudioElement | null = null;
let currentSrc = "";
let fadeTimer: number | null = null;

const REST_VOLUME = 0.45;

function stopFade(): void {
  if (fadeTimer != null) {
    window.clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

function element(src: string, muted: boolean): HTMLAudioElement {
  if (!audio) {
    audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    audio.volume = REST_VOLUME;
  }
  if (currentSrc !== src) {
    audio.src = src;
    currentSrc = src;
  }
  audio.muted = muted;
  return audio;
}

export async function startMusic(src: string, muted: boolean): Promise<void> {
  const player = element(src, muted);
  stopFade();
  player.volume = REST_VOLUME;
  await player.play();
}

export function setMusicMuted(muted: boolean): void {
  if (audio) audio.muted = muted;
}

export function musicIsPlaying(): boolean {
  return Boolean(audio && !audio.paused);
}

export function fadeMusic(ms = 8000): void {
  if (!audio) return;
  stopFade();
  const start = audio.volume;
  const steps = 40;
  let index = 0;
  fadeTimer = window.setInterval(() => {
    index += 1;
    if (!audio) return;
    audio.volume = Math.max(0, start * (1 - index / steps));
    if (index >= steps) stopFade();
  }, ms / steps);
}

export function restoreMusicVolume(): void {
  stopFade();
  if (audio && !audio.muted) audio.volume = REST_VOLUME;
}
