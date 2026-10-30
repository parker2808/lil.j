/** Logarithmic spiral shared by the renderer and the era labels. */

export const GALAXY = {
  arms: 4,
  wind: 3.35,
  tilt: 1.05,
  camDist: 2.7,
  /** World radius 1 fills this fraction of the shorter canvas side. */
  fill: 0.52,
  spinSpeed: 0.16,
} as const;

export type GalaxyCamera = {
  spin: number;
  zoom: number;
  focusX: number;
  focusY: number;
  parallaxX: number;
  parallaxY: number;
};

export function frameFor(width: number, height: number): number {
  const shorter = Math.min(width, height);
  return (GALAXY.fill * shorter * GALAXY.camDist * 2) / Math.max(height, 1);
}

export function eraAnchor(index: number, count: number): { x: number; y: number } {
  const arm = index % GALAXY.arms;
  const turn = Math.floor(index / GALAXY.arms);
  const t = count <= 1 ? 0.5 : index / Math.max(count - 1, 1);
  const radius = 0.42 + t * 0.26;
  const theta =
    (arm / GALAXY.arms) * Math.PI * 2 + Math.log(radius + 0.05) * GALAXY.wind + turn * 0.4;
  return { x: Math.cos(theta) * radius, y: Math.sin(theta) * radius };
}

export type PlacedCluster = {
  x: number;
  y: number;
  halfW: number;
  halfH: number;
};

/** Push overlapping chapter knots apart, and keep each one inside the frame. */
export function separatePoints(points: PlacedCluster[], width: number, height: number, inset = 2): void {
  const gap = 6;
  for (let iter = 0; iter < 32; iter += 1) {
    let moved = false;
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i];
        const b = points[j];
        const needX = a.halfW + b.halfW + gap;
        const needY = a.halfH + b.halfH + gap;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const overlapX = needX - Math.abs(dx);
        const overlapY = needY - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;
        if (overlapX < overlapY) {
          const sign = dx === 0 ? 1 : Math.sign(dx);
          const push = overlapX / 2;
          a.x -= sign * push;
          b.x += sign * push;
        } else {
          const sign = dy === 0 ? 1 : Math.sign(dy);
          const push = overlapY / 2;
          a.y -= sign * push;
          b.y += sign * push;
        }
        moved = true;
      }
    }
    for (const point of points) {
      const minX = inset + point.halfW;
      const maxX = width - inset - point.halfW;
      const minY = inset + point.halfH;
      const maxY = height - inset - point.halfH;
      point.x = minX > maxX ? width / 2 : Math.min(maxX, Math.max(minX, point.x));
      point.y = minY > maxY ? height / 2 : Math.min(maxY, Math.max(minY, point.y));
    }
    if (!moved) break;
  }
}

export function project(
  x: number,
  y: number,
  z: number,
  camera: GalaxyCamera,
  width: number,
  height: number,
): { x: number; y: number } {
  const frame = frameFor(width, height);
  const x1 = (x - camera.focusX) * camera.zoom;
  const y1 = (y - camera.focusY) * camera.zoom;
  const z1 = z * camera.zoom;
  const cs = Math.cos(camera.spin);
  const sn = Math.sin(camera.spin);
  const x2 = x1 * cs - y1 * sn;
  const y2 = x1 * sn + y1 * cs;
  const ct = Math.cos(GALAXY.tilt);
  const st = Math.sin(GALAXY.tilt);
  const y3 = y2 * ct - z1 * st + camera.parallaxY;
  const z3 = y2 * st + z1 * ct;
  const x3 = x2 + camera.parallaxX;
  const w = Math.max(0.35, GALAXY.camDist - z3);
  const aspect = width / Math.max(height, 1);
  const ndcX = ((x3 / w) * frame) / aspect;
  const ndcY = (y3 / w) * frame;
  return {
    x: (ndcX * 0.5 + 0.5) * width,
    y: (1 - (ndcY * 0.5 + 0.5)) * height,
  };
}

export function starBudget(cssWidth: number, cores: number): number {
  const narrow = cssWidth < 520;
  const weak = cores > 0 && cores <= 4;
  if (narrow && weak) return 4200;
  if (narrow) return 6400;
  if (weak) return 8000;
  return 12000;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mix(a: number[], b: number[], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const CORE = [1, 0.94, 0.97];
const BLUSH = [0.98, 0.58, 0.76];
const LAVENDER = [0.7, 0.6, 0.98];
const DUST = [0.62, 0.46, 0.7];

export type StarCloud = {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  twinkle: Float32Array;
  count: number;
};

function pushStar(
  cloud: StarCloud,
  index: number,
  x: number,
  y: number,
  z: number,
  color: [number, number, number],
  size: number,
  twinkle: number,
) {
  cloud.positions[index * 3] = x;
  cloud.positions[index * 3 + 1] = y;
  cloud.positions[index * 3 + 2] = z;
  cloud.colors[index * 3] = color[0];
  cloud.colors[index * 3 + 1] = color[1];
  cloud.colors[index * 3 + 2] = color[2];
  cloud.sizes[index] = size;
  cloud.twinkle[index] = twinkle;
}

export function buildStars(count: number): StarCloud {
  const rng = mulberry32(0x51a1);
  const cloud: StarCloud = {
    positions: new Float32Array(count * 3),
    colors: new Float32Array(count * 3),
    sizes: new Float32Array(count),
    twinkle: new Float32Array(count),
    count,
  };
  for (let index = 0; index < count; index += 1) {
    const roll = rng();
    const twinkle = rng();
    if (roll < 0.22) {
      const radius = rng() ** 2.15 * 0.34;
      const angle = rng() * Math.PI * 2;
      const color = mix(CORE, BLUSH, radius / 0.34);
      pushStar(
        cloud,
        index,
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (rng() - 0.5) * 0.05,
        color,
        1.15 + rng() * 2.1,
        twinkle,
      );
      continue;
    }
    if (roll > 0.94) {
      const radius = Math.sqrt(rng()) * 1.05;
      const angle = rng() * Math.PI * 2;
      pushStar(
        cloud,
        index,
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (rng() - 0.5) * 0.02,
        mix(LAVENDER, DUST, 0.45),
        0.8 + rng() * 0.7,
        twinkle,
      );
      continue;
    }
    const radius = 0.05 + rng() ** 0.62 * 1.02;
    const arm = Math.floor(rng() * GALAXY.arms);
    const spread = 0.05 + radius * 0.15;
    const theta =
      (arm / GALAXY.arms) * Math.PI * 2 +
      Math.log(radius + 0.05) * GALAXY.wind +
      (rng() - 0.5) * spread * 5.2;
    const radial = radius + (rng() - 0.5) * spread;
    const along = Math.min(1, Math.max(0, radial / 1.05));
    const color = mix(mix(CORE, BLUSH, Math.min(1, along * 1.4)), LAVENDER, Math.max(0, along - 0.25));
    pushStar(
      cloud,
      index,
      Math.cos(theta) * radial,
      Math.sin(theta) * radial,
      (rng() - 0.5) * 0.055 * (0.3 + along),
      color,
      0.9 + rng() * 1.7 * (1.15 - along * 0.45),
      twinkle,
    );
  }
  return cloud;
}

export function buildCluster(
  anchors: Array<{ x: number; y: number; color: [number, number, number]; viewed: boolean }>,
): StarCloud {
  const rng = mulberry32(0xc105);
  const per = 84;
  const count = anchors.length * per;
  const cloud: StarCloud = {
    positions: new Float32Array(count * 3),
    colors: new Float32Array(count * 3),
    sizes: new Float32Array(count),
    twinkle: new Float32Array(count),
    count,
  };
  anchors.forEach((anchor, anchorIndex) => {
    const cool: [number, number, number] = [0.9, 0.88, 1];
    const hot = mix(anchor.color, [1, 0.96, 0.98], 0.35);
    const color = anchor.viewed ? mix(hot, cool, 0.72) : hot;
    for (let n = 0; n < per; n += 1) {
      const index = anchorIndex * per + n;
      const radius = (rng() ** 1.7) * 0.055;
      const angle = rng() * Math.PI * 2;
      const bright = n < 6;
      pushStar(
        cloud,
        index,
        anchor.x + Math.cos(angle) * radius,
        anchor.y + Math.sin(angle) * radius,
        (rng() - 0.5) * 0.02,
        bright ? mix(color, CORE, 0.65) : color,
        (bright ? 3.2 : 1.2) + rng() * (anchor.viewed ? 1.1 : 1.8),
        rng(),
      );
    }
  });
  return cloud;
}

export function parseColor(value: string): [number, number, number] {
  const match = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return [0.96, 0.71, 0.82];
  const hex = Number.parseInt(match[1], 16);
  return [(hex >> 16) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
}
