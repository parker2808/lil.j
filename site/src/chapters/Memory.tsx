import { useEffect, useRef, useState } from "react";
import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { fillTemplate, shuffle } from "../lib/pure.ts";
import type { ChapterProps } from "../types.ts";

type Card = {
  uid: string;
  photoId: string;
  src: string;
  alt: string;
};

function buildDeck(): Card[] {
  const pairs = content.photos.filter((photo) => photo.pair).slice(0, 6);
  return shuffle(
    pairs.flatMap((photo) => [
      { uid: `${photo.id}-a`, photoId: photo.id, src: photo.src, alt: photo.alt },
      { uid: `${photo.id}-b`, photoId: photo.id, src: photo.src, alt: photo.alt },
    ]),
  );
}

export function Memory({ progress, update, onBack }: ChapterProps) {
  const chapter = content.chapters.find((item) => item.id === "memory");
  const [deck, setDeck] = useState(buildDeck);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const timerRef = useRef(0);
  const pairCount = new Set(deck.map((card) => card.photoId)).size;
  const won = matched.length > 0 && matched.length === pairCount;

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function onFlip(card: Card) {
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
      setFlipped([]);
      setLock(false);
    }, 700);
  }

  function again() {
    window.clearTimeout(timerRef.current);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setLock(false);
    setDeck(buildDeck());
  }

  return (
    <ChapterFrame
      kicker={chapter?.kicker ?? ""}
      title={chapter?.title ?? ""}
      lede={chapter?.lede ?? ""}
      onBack={onBack}
    >
      <p className="count">
        {fillTemplate(content.memoryCopy.moves, { n: moves })}
        {progress.memoryBest != null
          ? ` · ${fillTemplate(content.memoryCopy.best, { n: progress.memoryBest })}`
          : ""}
      </p>
      <div className="memory-grid">
        {deck.map((card) => {
          const up = flipped.includes(card.uid) || matched.includes(card.photoId);
          return (
            <div key={card.uid} className={up ? "mem is-up" : "mem"}>
              <div className="mem-inner" aria-hidden="true">
                <div className="mem-face mem-back">{content.meta.monogram}</div>
                <div className="mem-face mem-front">
                  <img src={card.src} alt="" width={800} height={1000} loading="lazy" decoding="async" />
                </div>
              </div>
              <button
                type="button"
                className="hit"
                onClick={() => onFlip(card)}
                disabled={up}
                aria-label={up ? card.alt : content.memoryCopy.back}
              />
            </div>
          );
        })}
      </div>
      {won && (
        <div className="win">
          <p>{content.memoryCopy.win}</p>
          <button type="button" className="btn" onClick={again}>
            {content.memoryCopy.again}
          </button>
        </div>
      )}
    </ChapterFrame>
  );
}
