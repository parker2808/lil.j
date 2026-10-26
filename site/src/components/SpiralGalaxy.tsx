import { useEffect, useLayoutEffect, useRef, type CSSProperties, type RefObject } from "react";
import { content } from "../content.ts";
import { eraAnchor, parseColor, type GalaxyCamera } from "../lib/galaxy.ts";
import { mountGalaxy, type GalaxyMount } from "../lib/galaxy-gl.ts";
import { useI18n } from "../lib/locale-context.ts";
import { fillTemplate } from "../lib/pure.ts";

export type SpiralGalaxyHandle = {
  flyTo: (id: string) => Promise<void>;
  settle: () => Promise<void>;
};

function ease(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function glide(mount: GalaxyMount, to: Pick<GalaxyCamera, "zoom" | "focusX" | "focusY">, ms: number): Promise<void> {
  const from = { zoom: mount.camera.zoom, focusX: mount.camera.focusX, focusY: mount.camera.focusY };
  const start = performance.now();
  return new Promise((resolve) => {
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const e = ease(t);
      mount.camera.zoom = from.zoom + (to.zoom - from.zoom) * e;
      mount.camera.focusX = from.focusX + (to.focusX - from.focusX) * e;
      mount.camera.focusY = from.focusY + (to.focusY - from.focusY) * e;
      if (t < 1) requestAnimationFrame(step);
      else {
        mount.render();
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

export function SpiralGalaxy({
  viewed,
  focusIndex,
  reduced,
  hidden,
  cruising,
  handleRef,
  buttonRefs,
  onOpen,
}: {
  viewed: string[];
  focusIndex: number;
  reduced: boolean;
  hidden: boolean;
  cruising: boolean;
  handleRef: RefObject<SpiralGalaxyHandle | null>;
  buttonRefs: RefObject<Array<HTMLButtonElement | null>>;
  onOpen: (id: string) => void;
}) {
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountRef = useRef<GalaxyMount | null>(null);
  const reducedRef = useRef(reduced);
  const hiddenRef = useRef(hidden);
  const anchors = useRef(content.eras.map((_, index) => eraAnchor(index, content.eras.length)));
  const viewedRef = useRef(viewed);

  useLayoutEffect(() => {
    reducedRef.current = reduced;
    hiddenRef.current = hidden;
    viewedRef.current = viewed;
  });

  const place = () => {
    const root = rootRef.current;
    const mount = mountRef.current;
    if (!root || !mount) return;
    const width = root.clientWidth;
    const height = root.clientHeight;
    if (width < 2 || height < 2) return;
    content.eras.forEach((_, index) => {
      const button = buttonRefs.current[index];
      const anchor = anchors.current[index];
      if (!button || !anchor) return;
      const point = mount.project(anchor.x, anchor.y, 0);
      const origin = mount.project(0, 0, 0);
      const vx = point.x - origin.x;
      const vy = point.y - origin.y;
      const len = Math.hypot(vx, vy) || 1;
      const halfW = Math.max(22, button.offsetWidth / 2);
      const halfH = Math.max(22, button.offsetHeight / 2);
      const x = Math.min(width - halfW - 2, Math.max(halfW + 2, point.x + (vx / len) * 22));
      const y = Math.min(height - halfH - 2, Math.max(halfH + 2, point.y + (vy / len) * 22));
      button.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    });
  };
  const placeRef = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    placeRef.current = place;
  });

  const knotsFor = (seen: string[]) =>
    content.eras.map((era, index) => ({
      x: anchors.current[index]?.x ?? 0,
      y: anchors.current[index]?.y ?? 0,
      color: parseColor(era.color),
      viewed: seen.includes(era.id),
    }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mount = mountGalaxy(canvas, {
      reduced,
      onFrame: () => placeRef.current(),
    });
    mountRef.current = mount;
    mount.setPaused(hiddenRef.current);
    mount.setKnots(knotsFor(viewedRef.current));
    placeRef.current();
    return () => {
      mount.destroy();
      mountRef.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    mountRef.current?.setKnots(knotsFor(viewed));
  }, [viewed]);

  useEffect(() => {
    mountRef.current?.setPaused(hidden);
    if (!hidden) placeRef.current();
  }, [hidden]);

  useLayoutEffect(() => {
    handleRef.current = {
      flyTo: (id: string) => {
        const mount = mountRef.current;
        const index = content.eras.findIndex((era) => era.id === id);
        const anchor = anchors.current[index];
        if (!mount || !anchor || reducedRef.current) {
          mount?.render();
          return Promise.resolve();
        }
        return glide(mount, { zoom: 3.2, focusX: anchor.x, focusY: anchor.y }, 840);
      },
      settle: () => {
        const mount = mountRef.current;
        if (!mount) return Promise.resolve();
        if (reducedRef.current) {
          mount.camera.zoom = 1;
          mount.camera.focusX = 0;
          mount.camera.focusY = 0;
          mount.render();
          return Promise.resolve();
        }
        return glide(mount, { zoom: 1, focusX: 0, focusY: 0 }, 640);
      },
    };
    return () => {
      handleRef.current = null;
    };
  });

  const classes = ["galaxy", hidden ? "is-behind" : "", cruising ? "is-cruising" : ""].filter(Boolean).join(" ");

  return (
    <div
      className={classes}
      ref={rootRef}
      onPointerMove={(event) => {
        if (reduced || hidden) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.16;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * -0.1;
        mountRef.current?.setPointer(x, y);
      }}
      onPointerLeave={() => mountRef.current?.setPointer(0, 0)}
    >
      <canvas ref={canvasRef} className="galaxy-canvas" aria-hidden="true" />
      {content.eras.map((era, index) => {
        const title = t(era.title);
        const count = fillTemplate(t(content.galleryCopy.count), { n: era.photos.length });
        const seen = viewed.includes(era.id);
        return (
          <button
            key={era.id}
            type="button"
            className={seen ? "cluster is-viewed" : "cluster"}
            data-era={era.id}
            style={{ "--cluster": era.color } as CSSProperties}
            tabIndex={hidden ? -1 : index === focusIndex ? 0 : -1}
            aria-pressed={seen}
            aria-label={`${title}. ${count}`}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            onClick={() => onOpen(era.id)}
          >
            <span className="cluster-knot" aria-hidden="true" />
            <span className="cluster-name">{title}</span>
            <span className="cluster-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
