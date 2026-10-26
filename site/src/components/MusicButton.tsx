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
  const { t } = useI18n();
  const [track, setTrack] = useState(currentTrack);
  const [playing, setPlaying] = useState(musicIsPlaying);

  useEffect(() => {
    return subscribeMusic(() => {
      setTrack(currentTrack());
      setPlaying(musicIsPlaying());
    });
  }, []);

  const now = playing && track ? `${track.title} · ${track.artist}` : "";

  return (
    <p className="music-credit">
      {t(content.music.credit)}
      {now ? <span className="music-now">{now}</span> : null}
    </p>
  );
}

type MusicButtonProps = {
  muted: boolean;
  onMuted: (muted: boolean) => void;
  onBlocked: () => void;
  onInvite: (invite: boolean) => void;
};

export function MusicButton({ onMuted, onBlocked, onInvite }: MusicButtonProps) {
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
      aria-describedby={invite ? "music-hint" : undefined}
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
