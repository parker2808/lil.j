import { useEffect, useState } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { musicIsPlaying, startMusic, subscribeMusic } from "../lib/music.ts";

type MusicButtonProps = {
  muted: boolean;
  onMuted: (muted: boolean) => void;
  onBlocked: () => void;
};

export function MusicButton({ onMuted, onBlocked }: MusicButtonProps) {
  const { t } = useI18n();
  const [playing, setPlaying] = useState(musicIsPlaying);

  useEffect(() => subscribeMusic(() => setPlaying(musicIsPlaying())), []);

  async function onClick() {
    const turningOff = musicIsPlaying();
    onMuted(turningOff);
    try {
      await startMusic(content.music, turningOff);
    } catch {
      onMuted(!turningOff);
      onBlocked();
    }
  }

  const label = playing ? t(content.ui.musicOff) : t(content.ui.musicOn);

  return (
    <button
      type="button"
      className={playing ? "music is-on" : "music"}
      onClick={() => void onClick()}
      aria-pressed={playing}
      aria-label={label}
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
