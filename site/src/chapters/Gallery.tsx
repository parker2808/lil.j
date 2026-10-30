import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";
import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { SpiralGalaxy, type SpiralGalaxyHandle } from "../components/SpiralGalaxy.tsx";
import { cloudinaryBlur, cloudinarySrcSet, cloudinaryUrl } from "../lib/images.ts";
import { useI18n } from "../lib/locale-context.ts";
import { fillTemplate, formatDotted } from "../lib/pure.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";
import type { ChapterProps, Era, EraPhoto } from "../types.ts";

type Mode = { kind: "orbit" } | { kind: "stack"; eraId: string; index: number };

type StackControl = {
  fling: (dir: -1 | 1) => void;
  flip: () => void;
  open: () => void;
};

const idleControl: StackControl = {
  fling: () => {},
  flip: () => {},
  open: () => {},
};

function hash(id: string): number {
  let value = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    value ^= id.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function tiltOf(id: string): number {
  return ((hash(id) % 121) - 60) / 10;
}

function delivered(src: string, width: number, widths: number[], sizes: string) {
  const srcSet = cloudinarySrcSet(src, widths);
  return {
    src: cloudinaryUrl(src, width),
    ...(srcSet ? { srcSet, sizes } : {}),
  };
}

const STACK_SIZES = "(min-width: 900px) 360px, 80vw";
const STACK_WIDTHS = [360, 720, 1080];
const decoded = new Set<string>();

/** Warm the browser cache with the same srcset the card uses, then decode it. */
function preloadPhoto(src: string) {
  if (decoded.has(src) || typeof Image === "undefined") return;
  decoded.add(src);
  const blur = cloudinaryBlur(src);
  if (blur) new Image().src = blur;
  const img = new Image();
  const props = delivered(src, 720, STACK_WIDTHS, STACK_SIZES);
  if (props.srcSet) {
    img.sizes = props.sizes ?? "";
    img.srcset = props.srcSet;
  }
  img.src = props.src;
  img.decode?.().catch(() => {});
}

function StackImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const blur = cloudinaryBlur(src);
  return (
    <div
      className={loaded ? "stack-photo is-loaded" : "stack-photo"}
      style={blur ? ({ "--blur": `url("${blur}")` } as CSSProperties) : undefined}
    >
      <img
        {...delivered(src, 720, STACK_WIDTHS, STACK_SIZES)}
        alt={alt}
        width={800}
        height={1000}
        loading="eager"
        decoding="async"
        draggable={false}
        ref={(node) => {
          if (node?.complete && node.naturalWidth > 0 && !loaded) setLoaded(true);
        }}
        onLoad={(event) => {
          const node = event.currentTarget;
          const done = () => setLoaded(true);
          if (node.decode) node.decode().then(done, done);
          else done();
        }}
      />
    </div>
  );
}

function Words({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return words.map((word, index) => (
    <span key={`${word}-${index}`} className="ink-word" style={{ animationDelay: `${delay + index * 45}ms` }}>
      {index === 0 ? word : ` ${word}`}
    </span>
  ));
}

const AUTO_MS = 4000;

function Stack({
  era,
  index,
  flipped,
  reduced,
  controlRef,
  eraIndex,
  eraCount,
  hasNext,
  onAdvance,
  onBack,
  onNext,
  onFlip,
  onOpen,
  suspended = false,
}: {
  suspended?: boolean;
  era: Era;
  index: number;
  eraIndex: number;
  eraCount: number;
  hasNext: boolean;
  flipped: string[];
  reduced: boolean;
  controlRef: RefObject<StackControl>;
  onAdvance: () => void;
  onBack: () => void;
  onNext: () => void;
  onFlip: (id: string) => void;
  onOpen: (photo: EraPhoto) => void;
}) {
  const { t } = useI18n();
  const motionRef = useRef<HTMLDivElement>(null);
  const [arrivedEra, setArrivedEra] = useState<string | null>(reduced ? era.id : null);
  const onAdvanceRef = useRef(onAdvance);
  const onFlipRef = useRef(onFlip);
  const onOpenRef = useRef(onOpen);
  const onBackRef = useRef(onBack);
  const photos = era.photos;
  const visible = photos.slice(index, index + 3);
  useEffect(() => {
    for (const photo of photos.slice(Math.max(0, index - 1), index + 4)) preloadPhoto(photo.src);
  }, [photos, index]);
  const arriving = !reduced && arrivedEra !== era.id;
  const [playing, setPlaying] = useState(!reduced);
  const [hold, setHold] = useState(false);
  const [run, setRun] = useState(0);
  const onNextRef = useRef(onNext);
  const holdRef = useRef(setHold);
  const ticking = playing && !hold && !suspended;
  const atEnd = index >= photos.length;
  const stopRef = useRef(() => setPlaying(false));

  useLayoutEffect(() => {
    onNextRef.current = onNext;
  });

  useEffect(() => {
    if (!ticking) return;
    if (atEnd && !hasNext) return;
    const timer = window.setTimeout(
      () => {
        if (atEnd) onNextRef.current();
        else controlRef.current.fling(1);
      },
      atEnd ? 1400 : AUTO_MS,
    );
    return () => window.clearTimeout(timer);
  }, [ticking, atEnd, hasNext, index, era.id, run, controlRef]);

  useLayoutEffect(() => {
    onAdvanceRef.current = onAdvance;
    onFlipRef.current = onFlip;
    onOpenRef.current = onOpen;
    onBackRef.current = onBack;
  });

  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => setArrivedEra(era.id), 480);
    return () => window.clearTimeout(timer);
  }, [era.id, reduced]);

  useEffect(() => {
    const el = motionRef.current;
    const photo = photos[index];
    if (!el || !photo) {
      controlRef.current = idleControl;
      return;
    }
    const tilt = tiltOf(photo.id);
    el.style.transition = "none";
    el.style.transform = `rotate(${tilt}deg)`;
    const active = document.activeElement;
    const deck = el.closest(".stack-deck");
    if (active === document.body || active === document.documentElement || (deck && deck.contains(active))) {
      el.focus({ preventScroll: true });
    }

    let drag: {
      id: number;
      sx: number;
      sy: number;
      lx: number;
      ly: number;
      lt: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      moved: boolean;
    } | null = null;
    let spring = 0;
    let flingTimer = 0;
    let longTimer = 0;
    let tapTimer = 0;
    let lastTap = 0;
    let lock = false;
    let longFired = false;

    const trailOf = () => el.querySelector<HTMLElement>(".stack-trail");
    const showTrail = (dir: -1 | 1, amount: number) => {
      const trail = trailOf();
      if (!trail) return;
      trail.style.opacity = String(Math.max(0, Math.min(1, amount)));
      trail.style.transformOrigin = dir > 0 ? "right center" : "left center";
      trail.style.left = dir > 0 ? "auto" : "58%";
      trail.style.right = dir > 0 ? "58%" : "auto";
      trail.style.transform = `scaleX(${1.4 + Math.min(2.6, amount * 2.4)})`;
    };
    const hideTrail = () => {
      const trail = trailOf();
      if (!trail) return;
      trail.style.opacity = "0";
      trail.style.transform = "scaleX(1)";
    };

    const springBack = (x: number, y: number) => {
      hideTrail();
      cancelAnimationFrame(spring);
      let px = x;
      let py = y;
      let vx = 0;
      let vy = 0;
      const step = () => {
        vx += -0.22 * px - 0.28 * vx;
        vy += -0.22 * py - 0.28 * vy;
        px += vx;
        py += vy;
        el.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${tilt + px * 0.05}deg)`;
        if (Math.hypot(px, py) < 0.6 && Math.hypot(vx, vy) < 0.6) {
          el.style.transform = `rotate(${tilt}deg)`;
          return;
        }
        spring = requestAnimationFrame(step);
      };
      spring = requestAnimationFrame(step);
    };

    const beginFling = (dir: -1 | 1) => {
      if (lock) return;
      lock = true;
      cancelAnimationFrame(spring);
      window.clearTimeout(longTimer);
      window.clearTimeout(tapTimer);
      el.classList.add("is-flinging");
      el.style.transition = reduced ? "none" : "transform 560ms cubic-bezier(0.2, 0.7, 0.2, 1)";
      const dx = dir * (window.innerWidth + 180);
      el.style.transform = `translate3d(${dx}px, -48px, 0) rotate(${dir * 24}deg)`;
      showTrail(dir, 1);
      flingTimer = window.setTimeout(() => onAdvanceRef.current(), reduced ? 0 : 540);
    };

    controlRef.current = {
      fling: beginFling,
      flip: () => onFlipRef.current(photo.id),
      open: () => onOpenRef.current(photo),
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0 || lock) return;
      stopRef.current();
      cancelAnimationFrame(spring);
      el.style.transition = "none";
      el.setPointerCapture(event.pointerId);
      drag = {
        id: event.pointerId,
        sx: event.clientX,
        sy: event.clientY,
        lx: event.clientX,
        ly: event.clientY,
        lt: performance.now(),
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        moved: false,
      };
      longFired = false;
      window.clearTimeout(longTimer);
      longTimer = window.setTimeout(() => {
        longFired = true;
        drag = null;
        el.style.transform = `rotate(${tilt}deg)`;
        onOpenRef.current(photo);
      }, 520);
    };

    const onMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const x = event.clientX - drag.sx;
      const y = event.clientY - drag.sy;
      const now = performance.now();
      const dt = Math.max(8, now - drag.lt);
      drag.vx = (event.clientX - drag.lx) / dt;
      drag.vy = (event.clientY - drag.ly) / dt;
      drag.lx = event.clientX;
      drag.ly = event.clientY;
      drag.lt = now;
      drag.x = x;
      drag.y = y;
      if (!drag.moved && Math.hypot(x, y) > 10) {
        drag.moved = true;
        window.clearTimeout(longTimer);
      }
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt + x * 0.06}deg)`;
      if (Math.abs(x) > 18 && Math.abs(x) > Math.abs(y) * 0.65) showTrail(x < 0 ? -1 : 1, Math.min(1, Math.abs(x) / 110));
      else hideTrail();
    };

    const finish = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const gesture = drag;
      drag = null;
      window.clearTimeout(longTimer);
      if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
      if (longFired) {
        longFired = false;
        return;
      }
      if (!gesture.moved) {
        const now = performance.now();
        if (now - lastTap < 280) {
          window.clearTimeout(tapTimer);
          lastTap = 0;
          onOpenRef.current(photo);
        } else {
          lastTap = now;
          tapTimer = window.setTimeout(() => onFlipRef.current(photo.id), 280);
        }
        return;
      }
      const ax = Math.abs(gesture.x);
      const ay = Math.abs(gesture.y);
      if (gesture.y > 80 && gesture.y > ax && gesture.vy >= 0) {
        onBackRef.current();
        return;
      }
      if (ax >= ay && (ax > 80 || Math.abs(gesture.vx) > 0.6)) {
        beginFling(gesture.x < 0 || (gesture.x === 0 && gesture.vx < 0) ? -1 : 1);
        return;
      }
      springBack(gesture.x, gesture.y);
    };

    const onCancel = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const gesture = drag;
      drag = null;
      window.clearTimeout(longTimer);
      springBack(gesture.x, gesture.y);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", onCancel);
    return () => {
      cancelAnimationFrame(spring);
      window.clearTimeout(flingTimer);
      window.clearTimeout(longTimer);
      window.clearTimeout(tapTimer);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", finish);
      el.removeEventListener("pointercancel", onCancel);
      controlRef.current = idleControl;
    };
  }, [controlRef, index, photos, reduced]);

  const photoN = Math.min(index + 1, photos.length);
  const progressLabel = fillTemplate(t(content.galleryCopy.eraProgress), {
    n: eraIndex + 1,
    total: eraCount,
    photo: photoN,
    photos: photos.length,
  });
  const backLabel = t(content.galleryCopy.backToGalaxy);

  return (
    <div
      className="stack-view"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") holdRef.current(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") {
          holdRef.current(false);
          setRun((n) => n + 1);
        }
      }}
    >
      <header className="stack-head">
        <h2 className="stack-era">{t(era.title)}</h2>
        <p className="stack-count">{progressLabel}</p>
      </header>
      <div className="stack-body">
      {visible.length === 0 ? (
        <div className="era-end">
          <p className="era-end-title">{t(content.galleryCopy.empty)}</p>
          <div className="era-end-actions">
            <button type="button" className="btn" onClick={onBack}>
              {backLabel}
            </button>
            {hasNext ? (
              <button type="button" className="btn btn-gold" onClick={onNext}>
                {t(content.galleryCopy.nextEra)}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className={arriving ? "stack-deck is-arriving" : "stack-deck"}>
          {visible.map((photo, depth) => {
            const top = depth === 0;
            const caption = t(photo.caption);
            const compliment = t(photo.compliment);
            const isFlipped = flipped.includes(photo.id);
            const date = photo.date ? formatDotted(photo.date, t(content.ui.dottedDate)) : "";
            const label = caption || t(era.title);
            return (
              <div
                key={photo.id}
                className={top ? "stack-slot is-top" : "stack-slot"}
                style={
                  top
                    ? undefined
                    : {
                        transform: `translateY(${depth * 16}px) rotate(${tiltOf(photo.id)}deg) scale(${1 - depth * 0.03})`,
                        zIndex: 3 - depth,
                      }
                }
                aria-hidden={top ? undefined : true}
              >
                <div className="stack-card">
                  <div
                    className="stack-motion"
                    ref={top ? motionRef : undefined}
                    tabIndex={top ? 0 : -1}
                    role={top ? "button" : undefined}
                    aria-pressed={top ? isFlipped : undefined}
                    aria-label={top ? (isFlipped ? `${label}. ${compliment}` : label) : undefined}
                  >
                    <span className="stack-trail" aria-hidden="true" />
                    <div className={isFlipped ? "stack-flip is-flipped" : "stack-flip"}>
                      <div className="stack-face stack-front">
                        <StackImage src={photo.src} alt={label} />
                        {date || caption ? (
                          <p className="stack-meta" aria-hidden="true">
                            {date ? (
                              <span className="stack-date">{top ? <Words text={date} /> : date}</span>
                            ) : null}
                            {caption ? (
                              <span className="stack-caption">{top ? <Words text={caption} delay={80} /> : caption}</span>
                            ) : null}
                          </p>
                        ) : null}
                      </div>
                      <div className="stack-face stack-backface">
                        <div className="stack-compliment">
                          <p>{compliment}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
      <div className="stack-progress">
        {visible.length > 0 ? (
          <button type="button" className="stack-play stack-galaxy" aria-label={backLabel.replace(/^←\s*/, "")} onClick={onBack}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5.5 16.5L10 7.5l7.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
              <circle cx="5.5" cy="16.5" r="2.2" />
              <circle cx="10" cy="7.5" r="2.6" />
              <circle cx="17.5" cy="11" r="2.2" />
            </svg>
          </button>
        ) : null}
        {photos.length > 1 || hasNext ? (
          <button
            type="button"
            className={playing ? "stack-play is-playing" : "stack-play"}
            aria-pressed={playing}
            aria-label={playing ? t(content.galleryCopy.autoPause) : t(content.galleryCopy.autoPlay)}
            onClick={() => {
              setPlaying((value) => !value);
              setRun((n) => n + 1);
            }}
          >
            {playing ? (
              <svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2.5" y="2" width="2.4" height="8" rx="1" /><rect x="7.1" y="2" width="2.4" height="8" rx="1" /></svg>
            ) : (
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 2.2v7.6a.6.6 0 0 0 .9.5l6-3.8a.6.6 0 0 0 0-1L4.4 1.7a.6.6 0 0 0-.9.5Z" /></svg>
            )}
          </button>
        ) : null}
        {photos.length <= 12 ? (
          <span className="stack-dots" aria-hidden="true">
            {photos.map((photo, dot) => (
              <i key={photo.id} className={dot === index ? "is-on" : dot < index ? "is-seen" : ""}>
                {dot === index ? (
                  <b
                    key={`${era.id}-${index}-${run}`}
                    className={ticking ? "stack-dot-fill is-running" : "stack-dot-fill"}
                    style={{ animationDuration: `${AUTO_MS}ms` }}
                  />
                ) : null}
              </i>
            ))}
          </span>
        ) : (
          <span className="stack-bar" aria-hidden="true">
            <span style={{ transform: `scaleX(${Math.min(index + 1, photos.length) / photos.length})` }} />
          </span>
        )}
      </div>
    </div>
  );
}

function Fullscreen({ photo, caption, onClose }: { photo: EraPhoto; caption: string; onClose: () => void }) {
  const { t } = useI18n();
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    closeRef.current?.focus();
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;
    let scale = 1;
    let x = 0;
    let y = 0;
    let startDist = 0;
    let startScale = 1;
    let panX = 0;
    let panY = 0;
    let originX = 0;
    let originY = 0;
    let lastTap = 0;
    let pinch = false;
    let moved = false;

    const apply = (nextScale: number, nextX: number, nextY: number) => {
      scale = Math.min(4, Math.max(1, nextScale));
      const limit = 180 * (scale - 1);
      x = scale === 1 ? 0 : Math.max(-limit, Math.min(limit, nextX));
      y = scale === 1 ? 0 : Math.max(-limit, Math.min(limit, nextY));
      img.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    };

    const onTouchStart = (event: TouchEvent) => {
      if ((event.target as HTMLElement).closest(".photo-close")) return;
      if (event.touches.length === 2) {
        pinch = true;
        const [a, b] = [event.touches[0], event.touches[1]];
        startDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        startScale = scale;
      } else if (event.touches.length === 1) {
        originX = event.touches[0].clientX;
        originY = event.touches[0].clientY;
        panX = x;
        panY = y;
        moved = false;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2 && startDist > 0) {
        event.preventDefault();
        const [a, b] = [event.touches[0], event.touches[1]];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        apply(startScale * (dist / startDist), x, y);
      } else if (event.touches.length === 1 && scale > 1) {
        event.preventDefault();
        const dx = event.touches[0].clientX - originX;
        const dy = event.touches[0].clientY - originY;
        if (Math.hypot(dx, dy) > 8) moved = true;
        apply(scale, panX + dx, panY + dy);
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if ((event.target as HTMLElement).closest(".photo-close")) return;
      if (event.touches.length > 0) return;
      if (pinch || moved) {
        pinch = false;
        moved = false;
        return;
      }
      const now = performance.now();
      if (now - lastTap < 280) {
        apply(scale > 1 ? 1 : 2.5, 0, 0);
        lastTap = 0;
      } else {
        lastTap = now;
      }
    };

    const onWheel = (event: WheelEvent) => {
      if ((event.target as HTMLElement).closest(".photo-close")) return;
      event.preventDefault();
      apply(scale * (event.deltaY < 0 ? 1.08 : 0.92), x, y);
    };

    frame.addEventListener("touchstart", onTouchStart, { passive: true });
    frame.addEventListener("touchmove", onTouchMove, { passive: false });
    frame.addEventListener("touchend", onTouchEnd);
    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      frame.removeEventListener("touchstart", onTouchStart);
      frame.removeEventListener("touchmove", onTouchMove);
      frame.removeEventListener("touchend", onTouchEnd);
      frame.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return createPortal(
    <div className="photo-full" role="dialog" aria-modal="true" aria-label={caption} ref={frameRef}>
      <button
        type="button"
        className="photo-close"
        ref={closeRef}
        aria-label={t(content.galleryCopy.close)}
        onClick={onClose}
      >
        <span aria-hidden="true">×</span>
      </button>
      <img
        ref={imgRef}
        {...delivered(photo.src, 1600, [800, 1200, 1600, 2000], "100%")}
        alt={caption}
        width={800}
        height={1000}
        draggable={false}
        decoding="async"
      />
    </div>,
    document.body,
  );
}

const ORBIT_GUIDE_KEY = "lilj.guide.galleryOrbit.v1";
const ALBUM_GUIDE_KEY = "lilj.guide.galleryAlbum.v1";

function guideDone(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return true;
  }
}

function markGuide(key: string) {
  try {
    localStorage.setItem(key, "1");
  } catch {
    /* storage unavailable: guide just shows again next time */
  }
}

export function Gallery({ progress, update }: ChapterProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const chapter = content.chapters.find((item) => item.id === "gallery");
  const [mode, setMode] = useState<Mode>({ kind: "orbit" });
  const [cruising, setCruising] = useState(false);
  const [zoomDir, setZoomDir] = useState<"in" | "out" | null>(null);
  const [fullPhoto, setFullPhoto] = useState<EraPhoto | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const galaxyRef = useRef<SpiralGalaxyHandle>(null);
  const planetRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const controlRef = useRef<StackControl>(idleControl);
  const stateRef = useRef({ mode, full: fullPhoto });
  const focusPlanetRef = useRef<(delta: number) => void>(() => {});
  const backRef = useRef(() => {});
  const opening = useRef(false);
  const [orbitGuide, setOrbitGuide] = useState(false);
  const [albumGuide, setAlbumGuide] = useState(false);
  const orbitGuideDone = useRef(guideDone(ORBIT_GUIDE_KEY));
  const albumGuideDone = useRef(guideDone(ALBUM_GUIDE_KEY));

  // Scene 4 onboarding: pulse the first unseen star with a tap hand, hide after ~3s, re-show once after ~5s idle.
  useEffect(() => {
    if (mode.kind !== "orbit" || orbitGuideDone.current) return;
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setOrbitGuide(true), 700));
    timers.push(window.setTimeout(() => setOrbitGuide(false), 3700));
    timers.push(window.setTimeout(() => !orbitGuideDone.current && setOrbitGuide(true), 8700));
    timers.push(window.setTimeout(() => setOrbitGuide(false), 11700));
    const stop = () => {
      orbitGuideDone.current = true;
      markGuide(ORBIT_GUIDE_KEY);
      setOrbitGuide(false);
      timers.forEach((id) => window.clearTimeout(id));
    };
    window.addEventListener("pointerdown", stop, { once: true });
    window.addEventListener("keydown", stop, { once: true });
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [mode.kind]);

  useEffect(() => {
    const seen = new Set(progress.erasViewed);
    const target = Math.max(0, content.eras.findIndex((item) => !seen.has(item.id)));
    if (!orbitGuide) return;
    let button: HTMLButtonElement | null = null;
    let frame = 0;
    let tries = 0;
    const attach = () => {
      button = planetRefs.current[target] ?? null;
      if (!button) {
        if (tries++ < 120) frame = window.requestAnimationFrame(attach);
        return;
      }
      button.classList.add("is-guide");
      button.dataset.guide = t(content.galleryCopy.orbit);
    };
    attach();
    return () => {
      window.cancelAnimationFrame(frame);
      if (!button) return;
      button.classList.remove("is-guide");
      delete button.dataset.guide;
    };
  }, [orbitGuide, progress.erasViewed, t]);

  // First album open: faint swipe arrows + glowing back button, once.
  useEffect(() => {
    if (mode.kind !== "stack" || albumGuideDone.current) return;
    albumGuideDone.current = true;
    markGuide(ALBUM_GUIDE_KEY);
    setAlbumGuide(true);
    const id = window.setTimeout(() => setAlbumGuide(false), 3200);
    const stop = () => setAlbumGuide(false);
    window.addEventListener("pointerdown", stop, { once: true });
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("pointerdown", stop);
    };
  }, [mode.kind]);

  const era = mode.kind === "stack" ? content.eras.find((item) => item.id === mode.eraId) : undefined;

  useLayoutEffect(() => {
    stateRef.current = { mode, full: fullPhoto };
    focusPlanetRef.current = (delta) => {
      const count = content.eras.length;
      if (count < 1) return;
      const next = (focusIndex + delta + count) % count;
      setFocusIndex(next);
      planetRefs.current[next]?.focus();
    };
    backRef.current = () => {
      setFullPhoto(null);
      setCruising(!reduced);
      setZoomDir(reduced ? null : "out");
      setMode({ kind: "orbit" });
      void galaxyRef.current?.settle().finally(() => {
        setCruising(false);
        setZoomDir(null);
      });
    };
  });

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, .chrome, .flow")) return;
      const state = stateRef.current;
      if (state.full) {
        if (event.key.startsWith("Arrow")) event.preventDefault();
        return;
      }
      if (state.mode.kind === "orbit") {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          focusPlanetRef.current(1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          focusPlanetRef.current(-1);
        }
        return;
      }
      if (target instanceof HTMLElement && target.closest("button") && (event.key === " " || event.key === "Enter")) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        controlRef.current.fling(event.key === "ArrowLeft" ? -1 : 1);
      } else if (event.key === "ArrowDown" || event.key === "Escape") {
        event.preventDefault();
        backRef.current();
      } else if (event.key === " ") {
        event.preventDefault();
        controlRef.current.flip();
      } else if (event.key === "Enter") {
        event.preventDefault();
        controlRef.current.open();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (mode.kind !== "stack" || !era) return;
    if (mode.index !== era.photos.length - 1) return;
    update((current) => {
      if (current.erasViewed.includes(era.id)) return current;
      return { ...current, erasViewed: [...current.erasViewed, era.id] };
    });
  }, [era, mode, update]);

  function openEra(id: string) {
    if (opening.current) return;
    opening.current = true;
    const next = content.eras.findIndex((item) => item.id === id);
    if (next >= 0) setFocusIndex(next);
    setCruising(!reduced);
    setZoomDir(reduced ? null : "in");
    void galaxyRef.current?.flyTo(id).finally(() => {
      setMode({ kind: "stack", eraId: id, index: 0 });
      setCruising(false);
      setZoomDir(null);
      opening.current = false;
    });
  }

  function toggleFlip(id: string) {
    update((current) => {
      const has = current.flippedPhotos.includes(id);
      return {
        ...current,
        flippedPhotos: has ? current.flippedPhotos.filter((item) => item !== id) : [...current.flippedPhotos, id],
      };
    });
  }

  const fullEra = fullPhoto ? content.eras.find((item) => item.photos.some((photo) => photo.id === fullPhoto.id)) : undefined;
  const fullCaption = fullPhoto ? t(fullPhoto.caption) || (fullEra ? t(fullEra.title) : "") : "";

  return (
    <ChapterFrame
      className={["gallery-scene", mode.kind === "stack" ? "is-stack" : "", zoomDir ? `is-zoom-${zoomDir}` : "", albumGuide ? "is-album-guide" : ""].filter(Boolean).join(" ")}
      kicker={t(chapter?.kicker)}
      title={t(chapter?.title)}
      lede={t(chapter?.lede)}
    >
      <SpiralGalaxy
        viewed={progress.erasViewed}
        focusIndex={focusIndex}
        reduced={reduced}
        hidden={mode.kind === "stack"}
        cruising={cruising}
        handleRef={galaxyRef}
        buttonRefs={planetRefs}
        onOpen={openEra}
      />
      {mode.kind === "orbit" || !era ? (
        <div className="era-legend-wrap">
          <p className="orbit-hint">{t(content.galleryCopy.orbit)}</p>
          <ul className="era-legend">
            {content.eras.map((item) => {
              const seen = progress.erasViewed.includes(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={seen ? "is-seen" : undefined}
                    onClick={() => openEra(item.id)}
                  >
                    <span className="era-legend-mark" aria-hidden="true" />
                    <span className="era-legend-name">{t(item.title)}</span>
                    <span className="era-legend-state">{seen ? t(content.galleryCopy.seen) : t(content.galleryCopy.pending)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <Stack
          era={era}
          index={mode.index}
          eraIndex={content.eras.findIndex((item) => item.id === era.id)}
          eraCount={content.eras.length}
          hasNext={content.eras.findIndex((item) => item.id === era.id) < content.eras.length - 1}
          flipped={progress.flippedPhotos}
          reduced={reduced}
          controlRef={controlRef}
          onAdvance={() => {
            setMode((current) => {
              if (current.kind !== "stack") return current;
              const currentEra = content.eras.find((item) => item.id === current.eraId);
              const max = currentEra?.photos.length ?? current.index;
              return { ...current, index: Math.min(current.index + 1, max) };
            });
          }}
          onBack={() => backRef.current()}
          onNext={() => {
            const index = content.eras.findIndex((item) => item.id === era.id);
            const next = content.eras[index + 1];
            if (!next) return;
            setFocusIndex(index + 1);
            setMode({ kind: "stack", eraId: next.id, index: 0 });
          }}
          onFlip={toggleFlip}
          onOpen={setFullPhoto}
          suspended={Boolean(fullPhoto) || zoomDir !== null}
        />
      )}
      {fullPhoto ? <Fullscreen photo={fullPhoto} caption={fullCaption} onClose={() => setFullPhoto(null)} /> : null}
    </ChapterFrame>
  );
}
