import { useEffect, useRef, useState } from "react";
import { content } from "../content.ts";
import { cloudinaryUrl } from "../lib/images.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { Spark } from "../components/Fireworks.tsx";
import type { Copy } from "../lib/i18n.ts";
import { useI18n } from "../lib/locale-context.ts";
import { fillTemplate, shuffle } from "../lib/pure.ts";
import type { ChapterProps } from "../types.ts";

type Card = {
  uid: string;
  photoId: string;
  src: string;
  alt: Copy;
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
      setCheer((count) => count + 1);
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
      kicker={t(chapter?.kicker)}
      title={t(chapter?.title)}
      lede={t(chapter?.lede)}
    >
      <p className="count">
        {fillTemplate(t(content.memoryCopy.moves), { n: moves })}
        {progress.memoryBest != null
          ? ` · ${fillTemplate(t(content.memoryCopy.best), { n: progress.memoryBest })}`
          : ""}
      </p>
      <Spark play={cheer} />
      <div className={matched.length > 0 ? "pair-toast" : "pair-toast is-idle"} role="status" aria-live="polite">
        {matched.length > 0 ? (
          <p>
            {t(content.memoryCopy.lines[(matched.length - 1) % content.memoryCopy.lines.length] ?? content.memoryCopy.win)}
          </p>
        ) : null}
        {won ? (
          <button type="button" className="btn" onClick={again}>
            {t(content.memoryCopy.again)}
          </button>
        ) : null}
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
    </ChapterFrame>
  );
}
