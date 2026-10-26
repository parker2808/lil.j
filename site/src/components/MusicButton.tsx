import { useEffect, useLayoutEffect, useState } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { currentTrack, musicIsPlaying, startMusic, subscribeMusic } from "../lib/music.ts";

const HEARD_KEY = "lilj.musicHeard.v1";

function musicWasHeard(): boolean {
  try {
    return localStorage.getItem(HEARD_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberMusic(): void {
  try {
    localStorage.setItem(HEARD_KEY, "1");
  } catch {
    // Private mode can refuse storage. This session still remembers.
  }
}

export function MusicCredit() {
  const [track, setTrack] = useState(currentTrack);
  const [playing, setPlaying] = useState(musicIsPlaying);

  useEffect(() => {
    return subscribeMusic(() => {
      setTrack(currentTrack());
      setPlaying(musicIsPlaying());
    });
  }, []);

  if (!playing || !track) return null;
  const now = track.artist ? `${track.title} · ${track.artist}` : track.title;

  return <p className="music-credit">{now}</p>;
}

type MusicButtonProps = {
  muted: boolean;
  onMuted: (muted: boolean) => void;
  onBlocked: () => void;
  onPress: () => void;
  onInvite: (invite: boolean) => void;
  hintVisible: boolean;
};

export function MusicButton({ onMuted, onBlocked, onPress, onInvite, hintVisible }: MusicButtonProps) {
  const { t } = useI18n();
  const [playing, setPlaying] = useState(musicIsPlaying);
  const [heard, setHeard] = useState(() => {
    if (musicIsPlaying()) rememberMusic();
    return musicWasHeard() || musicIsPlaying();
  });

  useEffect(() => {
    return subscribeMusic(() => {
      const on = musicIsPlaying();
      setPlaying(on);
      if (!on) return;
      rememberMusic();
      setHeard(true);
    });
  }, []);

  const invite = !playing && !heard;

  useLayoutEffect(() => {
    onInvite(invite);
  }, [invite, onInvite]);

  useEffect(() => () => onInvite(false), [onInvite]);

  async function onClick() {
    onPress();
    const turningOff = musicIsPlaying();
    onMuted(turningOff);
    try {
      await startMusic(turningOff);
    } catch {
      onMuted(!turningOff);
      onBlocked();
    }
  }

  const label = playing ? t(content.ui.musicOff) : t(content.ui.musicOn);
  const className = playing ? "music is-on" : invite ? "music is-quiet is-first" : "music is-quiet";

  return (
    <button
      type="button"
      className={className}
      onClick={() => void onClick()}
      aria-pressed={playing}
      aria-label={label}
      aria-describedby={hintVisible ? "music-hint" : undefined}
    >
      {playing ? (
        <span className="eq" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      ) : (
        <svg className="music-off" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10v4h3.2L12 18.2V5.8L7.2 10H4z" fill="currentColor" />
          <path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
