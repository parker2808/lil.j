import { useEffect, useRef, useState } from "react";
import { content } from "../content.ts";
import { cloudinaryUrl } from "../lib/images.ts";
import { skipAhead } from "../lib/progress.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { Spark } from "../components/Fireworks.tsx";
import { useI18n } from "../lib/locale-context.ts";
import {
  buildMemoryDeck,
  randomSeed,
  readMemorySeedFromSearch,
  type MemoryCard,
} from "../lib/memory-deck.ts";
import { fillTemplate } from "../lib/pure.ts";
import type { ChapterProps } from "../types.ts";

function memoryPool() {
  return content.photos.map((photo) => ({
    id: photo.id,
    src: photo.src,
    alt: photo.alt,
  }));
}

function deckSeed(): number {
  const fromUrl = readMemorySeedFromSearch(window.location.search);
  if (fromUrl !== undefined) return fromUrl;
  return randomSeed();
}

function buildDeck(): MemoryCard[] {
  return buildMemoryDeck(memoryPool(), content.memoryPhotoIds.length, deckSeed());
}

export function Memory({ progress, update }: ChapterProps) {
  const { t } = useI18n();
  const chapter = content.chapters.find((item) => item.id === "memory");
  const [deck, setDeck] = useState(buildDeck);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [cheer, setCheer] = useState(0);
  const timerRef = useRef(0);
  const toastTimerRef = useRef(0);
  const [toast, setToast] = useState<string | null>(null);
  const aliveRef = useRef(true);
  const pairCount = new Set(deck.map((card) => card.photoId)).size;
  const won = matched.length > 0 && matched.length === pairCount;

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      window.clearTimeout(timerRef.current);
      timerRef.current = 0;
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = 0;
    };
  }, []);

  function showMatchToast(matchIndex: number) {
    const message = t(
      content.memoryCopy.lines[matchIndex % content.memoryCopy.lines.length] ?? content.memoryCopy.win,
    );
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      toastTimerRef.current = 0;
      if (!aliveRef.current) return;
      setToast(null);
    }, 1800);
  }

  function onFlip(card: MemoryCard) {
    if (lock || flipped.includes(card.uid) || matched.includes(card.photoId) || flipped.length >= 2) return;
    const next = [...flipped, card.uid];
    if (next.length < 2) {
      setFlipped(next);
      return;
    }
    const first = deck.find((item) => item.uid === next[0]);
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    if (first && first.photoId === card.photoId) {
      const nextMatched = [...matched, first.photoId];
      setMatched(nextMatched);
      setFlipped([]);
      setCheer((count) => count + 1);
      showMatchToast(nextMatched.length - 1);
      if (nextMatched.length === pairCount) {
        update((current) => {
          const best = current.memoryBest == null ? nextMoves : Math.min(current.memoryBest, nextMoves);
          if (best === current.memoryBest) return current;
          return { ...current, memoryBest: best };
        });
      }
      return;
    }
    setFlipped(next);
    setLock(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = 0;
      if (!aliveRef.current) return;
      setFlipped([]);
      setLock(false);
    }, 700);
  }

  function again() {
    window.clearTimeout(timerRef.current);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = 0;
    setToast(null);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setLock(false);
    setDeck(buildDeck());
  }

  return (
    <ChapterFrame
      kicker={t(chapter?.kicker)}
      title={t(chapter?.title)}
      lede={t(chapter?.lede)}
    >
      <div className="memory-board">
        <div className="memory-spark" aria-hidden="true">
          <Spark play={cheer} />
        </div>
        <div className="memory-fit">
          <div className="memory-toast-host" aria-live="polite" role="status">
            {toast ? <p className="memory-toast is-visible">{toast}</p> : null}
          </div>
          <div className="memory-play">
            <div className="memory-meta">
              <p className="count">
                {fillTemplate(t(content.memoryCopy.moves), { n: moves })}
                {progress.memoryBest != null
                  ? ` · ${fillTemplate(t(content.memoryCopy.best), { n: progress.memoryBest })}`
                  : ""}
              </p>
            </div>
            <div className="memory-grid">
          {deck.map((card) => {
            const matchedCard = matched.includes(card.photoId);
            const up = flipped.includes(card.uid) || matchedCard;
            return (
              <div key={card.uid} className={matchedCard ? "mem is-up is-matched" : up ? "mem is-up" : "mem"}>
                <div className="mem-inner" aria-hidden="true">
                  <div className="mem-face mem-back">{content.meta.monogram}</div>
                  <div className="mem-face mem-front">
                    <img src={cloudinaryUrl(card.src, 480)} alt="" width={800} height={1000} loading="lazy" decoding="async" />
                  </div>
                </div>
                <button
                  type="button"
                  className="hit"
                  onClick={() => onFlip(card)}
                  disabled={up}
                  aria-label={up ? t(card.alt) : t(content.memoryCopy.back)}
                />
              </div>
            );
          })}
            </div>
            <div className={won ? "memory-actions is-won" : "memory-actions"}>
              {won ? (
                <>
                  <p className="memory-win">{t(content.memoryCopy.win)}</p>
                  <button type="button" className="btn btn-quiet memory-again" onClick={again}>
                    {t(content.memoryCopy.again)}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-quiet memory-later"
                  onClick={() => update((current) => skipAhead(current, "memory"))}
                >
                  {t(content.memoryCopy.later)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChapterFrame>
  );
}
