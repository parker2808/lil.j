import type { MusicTrack } from "../types.ts";

let bed: HTMLAudioElement | null = null;
let guest: HTMLAudioElement | null = null;
let tracks: MusicTrack[] = [];
let index = 0;
let picked = false;
let birthday: MusicTrack | null = null;
let usingGuest = false;
let savedTime = 0;
let savedIndex = 0;
let wantPlay = false;
let ducked = false;
let op = 0;

const listeners = new Set<() => void>();
const fades = new Map<HTMLAudioElement, { timer: number; resolve: () => void }>();

const REST_VOLUME = 0.45;
const CROSSFADE_MS = 800;

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeMusic(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Another track, never the one that just played when there is a choice. */
export function nextTrackIndex(length: number, current: number, random: () => number = Math.random): number {
  if (length <= 1) return 0;
  const offset = 1 + Math.floor(random() * (length - 1));
  return (current + offset) % length;
}

export function bindPlaylist(list: MusicTrack[]): void {
  tracks = list.filter((track) => track.src);
  if (picked) return;
  picked = true;
  index = tracks.length ? Math.floor(Math.random() * tracks.length) : 0;
  emit();
}

export function currentTrack(): MusicTrack | null {
  if (usingGuest && birthday) return birthday;
  return tracks[index] ?? null;
}

function activePlayer(): HTMLAudioElement | null {
  return usingGuest ? guest : bed;
}

function sameSrc(player: HTMLAudioElement, src: string): boolean {
  if (!player.getAttribute("src") && !player.src) return false;
  try {
    return new URL(player.src, window.location.href).pathname === src;
  } catch {
    return player.src.endsWith(src);
  }
}

function stopFade(player?: HTMLAudioElement): void {
  const list = player ? [player] : [...fades.keys()];
  for (const item of list) {
    const fade = fades.get(item);
    if (!fade) continue;
    window.clearInterval(fade.timer);
    fades.delete(item);
    fade.resolve();
  }
}

function fadePlayer(player: HTMLAudioElement, target: number, ms: number): Promise<void> {
  stopFade(player);
  const start = player.volume;
  if (ms <= 0 || Math.abs(start - target) < 0.01) {
    player.volume = target;
    return Promise.resolve();
  }
  const steps = 16;
  let step = 0;
  return new Promise((resolve) => {
    const timer = window.setInterval(() => {
      step += 1;
      const t = Math.min(1, step / steps);
      const eased = t * t * (3 - 2 * t);
      player.volume = start + (target - start) * eased;
      if (step >= steps) {
        player.volume = target;
        window.clearInterval(timer);
        fades.delete(player);
        resolve();
      }
    }, ms / steps);
    fades.set(player, { timer, resolve });
  });
}

function makePlayer(kind: "bed" | "guest"): HTMLAudioElement {
  const player = new Audio();
  player.preload = "metadata";
  player.volume = 0;
  player.addEventListener("play", emit);
  player.addEventListener("pause", emit);
  if (kind === "bed") {
    player.loop = false;
    player.addEventListener("ended", () => {
      if (!wantPlay || usingGuest) return;
      const next = nextTrackIndex(tracks.length, index);
      const track = tracks[next];
      if (!track || !bed) return;
      index = next;
      bed.src = track.src;
      bed.volume = 0;
      emit();
      void bed
        .play()
        .then(() => {
          if (!wantPlay || usingGuest || ducked || !bed || bed.paused) return;
          return fadePlayer(bed, REST_VOLUME, 500);
        })
        .catch(() => {
          // The ended event is not a new gesture. The music button can start it.
        });
    });
    bed = player;
    return player;
  }
  player.loop = true;
  guest = player;
  return player;
}

function ensureBed(track: MusicTrack): HTMLAudioElement {
  const player = bed ?? makePlayer("bed");
  player.loop = false;
  if (!sameSrc(player, track.src)) player.src = track.src;
  return player;
}

function ensureGuest(track: MusicTrack): HTMLAudioElement {
  const player = guest ?? makePlayer("guest");
  player.loop = true;
  if (!sameSrc(player, track.src)) player.src = track.src;
  return player;
}

function restTarget(): number {
  return ducked ? 0 : REST_VOLUME;
}

/** Play or pause whichever track this visit is on. Playback starts only from a user gesture. */
export async function startMusic(muted: boolean): Promise<void> {
  const mine = ++op;
  if (muted) {
    wantPlay = false;
    const player = activePlayer();
    if (player && !player.paused) {
      await fadePlayer(player, 0, 380);
      if (mine !== op || wantPlay) return;
      player.pause();
      player.volume = 0;
      emit();
    }
    return;
  }
  wantPlay = true;
  const track = currentTrack();
  if (!track) throw new Error("no track");
  const player = usingGuest ? ensureGuest(track) : ensureBed(track);
  if (player.paused) {
    player.volume = 0;
    await player.play();
    if (mine !== op) return;
  }
  await fadePlayer(player, restTarget(), 640);
}

export function musicIsPlaying(): boolean {
  const player = activePlayer();
  return Boolean(player && !player.paused && !player.muted);
}

export function fadeMusic(ms = 8000): void {
  ducked = true;
  const player = activePlayer();
  if (!player || player.paused) return;
  void fadePlayer(player, 0, ms);
}

export function restoreMusicVolume(): void {
  ducked = false;
  const player = activePlayer();
  if (player && !player.paused && wantPlay) void fadePlayer(player, REST_VOLUME, 600);
}

/**
 * Crossfade the birthday track over the playlist and loop it.
 * A muted visit remembers the switch and plays it on the next unmute.
 */
export async function playBirthday(track: MusicTrack): Promise<void> {
  birthday = track;
  const mine = ++op;
  if (!usingGuest) {
    savedIndex = index;
    if (bed) savedTime = bed.currentTime;
  }
  if (!wantPlay) {
    usingGuest = true;
    emit();
    return;
  }
  const guestEl = ensureGuest(track);
  guestEl.volume = 0;
  if (!usingGuest) {
    try {
      guestEl.currentTime = 0;
    } catch {
      // A new file already starts at the beginning.
    }
  }
  try {
    if (guestEl.paused) await guestEl.play();
  } catch {
    return;
  }
  if (mine !== op) return;
  usingGuest = true;
  emit();
  const jobs = [fadePlayer(guestEl, restTarget(), CROSSFADE_MS)];
  if (bed && !bed.paused) {
    jobs.push(
      fadePlayer(bed, 0, CROSSFADE_MS).then(() => {
        if (mine !== op || !bed || !usingGuest) return;
        savedTime = bed.currentTime;
        bed.pause();
      }),
    );
  }
  await Promise.all(jobs);
}

/** Crossfade back to the playlist track, at the position it had before the cake. */
export async function resumePlaylist(): Promise<void> {
  if (!usingGuest) return;
  const mine = ++op;
  const resumeAt = savedTime;
  index = savedIndex;
  usingGuest = false;
  emit();
  if (guest && !guest.paused) {
    void fadePlayer(guest, 0, CROSSFADE_MS).then(() => {
      if (mine !== op || !guest) return;
      guest.pause();
      guest.volume = 0;
    });
  }
  const track = tracks[index];
  if (!wantPlay || !track) return;
  const player = ensureBed(track);
  try {
    if (player.readyState >= 1) player.currentTime = resumeAt;
  } catch {
    // Metadata may not be ready until play() resolves.
  }
  if (player.paused) {
    player.volume = 0;
    try {
      await player.play();
    } catch {
      return;
    }
  }
  if (mine !== op) return;
  if (player.currentTime < 0.05 && resumeAt > 0.25) {
    try {
      player.currentTime = resumeAt;
    } catch {
      // Some browsers ignore a seek until the next loadedmetadata.
    }
  }
  await fadePlayer(player, restTarget(), CROSSFADE_MS);
}

/** Pause while the tab is hidden. Coming back resumes only if the listener already started. */
export function bindMusicVisibility(): () => void {
  const onChange = () => {
    const player = activePlayer();
    if (document.hidden) {
      if (player && !player.paused) {
        stopFade(player);
        player.pause();
        player.volume = 0;
        emit();
      }
      return;
    }
    if (!wantPlay) return;
    const track = currentTrack();
    if (!track) return;
    const next = usingGuest ? ensureGuest(track) : ensureBed(track);
    if (!next.paused) return;
    next.volume = 0;
    void next
      .play()
      .then(() => fadePlayer(next, restTarget(), 700))
      .catch(() => {
        // A visibility change is not a gesture. The music button can start it.
      });
  };
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/** A short bell, only while the visit's music is actually playing. */
export function playChime(): void {
  const player = activePlayer();
  if (!player || player.paused || player.muted || player.volume <= 0.01) return;
  const Ctx =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const context = new Ctx();
  const now = context.currentTime;
  const notes = [880, 1318];
  for (const [step, freq] of notes.entries()) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02 + step * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55 + step * 0.08);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now + step * 0.08);
    osc.stop(now + 0.7 + step * 0.08);
  }
  window.setTimeout(() => void context.close(), 1200);
}
