import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { SpiralGalaxy, type SpiralGalaxyHandle } from "../components/SpiralGalaxy.tsx";
import { cloudinarySrcSet, cloudinaryUrl } from "../lib/images.ts";
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

function Words({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return words.map((word, index) => (
    <span key={`${word}-${index}`} className="ink-word" style={{ animationDelay: `${delay + index * 45}ms` }}>
      {index === 0 ? word : ` ${word}`}
    </span>
  ));
}

function Stack({
  era,
  index,
  flipped,
  reduced,
  controlRef,
  onAdvance,
  onBack,
  onFlip,
  onOpen,
}: {
  era: Era;
  index: number;
  flipped: string[];
  reduced: boolean;
  controlRef: RefObject<StackControl>;
  onAdvance: () => void;
  onBack: () => void;
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
  const arriving = !reduced && arrivedEra !== era.id;

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

  const backLabel = t(content.galleryCopy.back);
  const countLabel = fillTemplate(t(content.galleryCopy.progress), {
    n: Math.min(index + 1, photos.length),
    total: photos.length,
  });

  return (
    <div className="stack-view">
      <button type="button" className="back stack-back" onClick={onBack}>
        {backLabel}
      </button>
      {visible.length === 0 ? (
        <div className="stack-empty">
          <p>{t(content.galleryCopy.empty)}</p>
        </div>
      ) : (
        <div className={arriving ? "stack-deck is-arriving" : "stack-deck"}>
          {visible.map((photo, depth) => {
            const top = depth === 0;
            const caption = t(photo.caption);
            const compliment = t(photo.compliment);
            const isFlipped = flipped.includes(photo.id);
            const date = formatDotted(photo.date, t(content.ui.dottedDate));
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
                    aria-label={top ? (isFlipped ? `${caption}. ${compliment}` : caption) : undefined}
                  >
                    <span className="stack-trail" aria-hidden="true" />
                    <div className={isFlipped ? "stack-flip is-flipped" : "stack-flip"}>
                      <div className="stack-face stack-front">
                        <div className="stack-photo">
                          <img
                            {...delivered(photo.src, 720, [360, 720, 1080], "(min-width: 900px) 360px, 80vw")}
                            alt={caption}
                            width={800}
                            height={1000}
                            decoding="async"
                            draggable={false}
                          />
                        </div>
                      </div>
                      <div className="stack-face stack-backface">
                        <div className="stack-compliment">
                          <p>{compliment}</p>
                        </div>
                      </div>
                    </div>
                    <p className="stack-meta">
                      <span className="stack-date">{top ? <Words text={date} /> : date}</span>
                      <span className="stack-caption">{top ? <Words text={caption} delay={80} /> : caption}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="stack-progress">
        {photos.length <= 12 ? (
          <span className="stack-dots" aria-hidden="true">
            {photos.map((photo, dot) => (
              <i key={photo.id} className={dot === index ? "is-on" : dot < index ? "is-seen" : ""} />
            ))}
          </span>
        ) : (
          <span className="stack-bar" aria-hidden="true">
            <span style={{ transform: `scaleX(${Math.min(index + 1, photos.length) / photos.length})` }} />
          </span>
        )}
        <p className="stack-count">{countLabel}</p>
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

export function Gallery({ progress, update }: ChapterProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const chapter = content.chapters.find((item) => item.id === "gallery");
  const [mode, setMode] = useState<Mode>({ kind: "orbit" });
  const [cruising, setCruising] = useState(false);
  const [fullPhoto, setFullPhoto] = useState<EraPhoto | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const galaxyRef = useRef<SpiralGalaxyHandle>(null);
  const planetRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const controlRef = useRef<StackControl>(idleControl);
  const stateRef = useRef({ mode, full: fullPhoto });
  const focusPlanetRef = useRef<(delta: number) => void>(() => {});
  const backRef = useRef(() => {});
  const opening = useRef(false);

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
      setMode({ kind: "orbit" });
      void galaxyRef.current?.settle().finally(() => setCruising(false));
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
    void galaxyRef.current?.flyTo(id).finally(() => {
      setMode({ kind: "stack", eraId: id, index: 0 });
      setCruising(false);
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

  const fullCaption = fullPhoto ? t(fullPhoto.caption) : "";

  return (
    <ChapterFrame
      className={mode.kind === "stack" ? "gallery-scene is-stack" : "gallery-scene"}
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
        <p className="orbit-hint">{t(content.galleryCopy.orbit)}</p>
      ) : (
        <Stack
          era={era}
          index={mode.index}
          flipped={progress.flippedPhotos}
          reduced={reduced}
          controlRef={controlRef}
          onAdvance={() => {
            setMode((current) => (current.kind === "stack" ? { ...current, index: current.index + 1 } : current));
          }}
          onBack={() => backRef.current()}
          onFlip={toggleFlip}
          onOpen={setFullPhoto}
        />
      )}
      {fullPhoto ? <Fullscreen photo={fullPhoto} caption={fullCaption} onClose={() => setFullPhoto(null)} /> : null}
    </ChapterFrame>
  );
}
