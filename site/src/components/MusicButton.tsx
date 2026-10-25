import { useState } from "react";
import { content } from "../content.ts";
import { musicIsPlaying, setMusicMuted, startMusic } from "../lib/music.ts";

type MusicButtonProps = {
  muted: boolean;
  onMuted: (muted: boolean) => void;
  onBlocked: () => void;
};

export function MusicButton({ muted, onMuted, onBlocked }: MusicButtonProps) {
  const [busy, setBusy] = useState(false);
  const label = muted || !musicIsPlaying() ? content.ui.musicOn : content.ui.musicOff;

  async function onClick() {
    if (busy) return;
    setBusy(true);
    try {
      if (!musicIsPlaying()) {
        onMuted(false);
        await startMusic(content.music, false);
        return;
      }
      const next = !muted;
      setMusicMuted(next);
      onMuted(next);
    } catch {
      onBlocked();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="music" onClick={() => void onClick()} aria-pressed={!muted}>
      <span aria-hidden="true">{muted ? "♪̸" : "♪"}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
