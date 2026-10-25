let audio: HTMLAudioElement | null = null;
let currentSrc = "";

function element(src: string, muted: boolean): HTMLAudioElement {
  if (!audio) {
    audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0.45;
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
  await player.play();
}

export function setMusicMuted(muted: boolean): void {
  if (audio) audio.muted = muted;
}

export function musicIsPlaying(): boolean {
  return Boolean(audio && !audio.paused);
}
