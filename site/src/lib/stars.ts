import type { Copy } from "./i18n.ts";

export type Star = {
  id: string;
  ra: number;
  dec: number;
  mag: number;
  group: string;
};

export type Constellation = {
  id: string;
  name: Copy;
  lines: [string, string][];
};

/** Bright-star subset, J2000. RA is in hours, declination in degrees. Precession is ignored. */
export const CATALOG: Star[] = [
  { id: "polaris", ra: 2.5303, dec: 89.2642, mag: 2.0, group: "umi" },
  { id: "kochab", ra: 14.8451, dec: 74.155, mag: 2.1, group: "umi" },
  { id: "dubhe", ra: 11.0621, dec: 61.751, mag: 1.8, group: "uma" },
  { id: "merak", ra: 11.0307, dec: 56.382, mag: 2.4, group: "uma" },
  { id: "phecda", ra: 11.8971, dec: 53.695, mag: 2.4, group: "uma" },
  { id: "megrez", ra: 12.2571, dec: 57.033, mag: 3.3, group: "uma" },
  { id: "alioth", ra: 12.9004, dec: 55.96, mag: 1.8, group: "uma" },
  { id: "mizar", ra: 13.3987, dec: 54.925, mag: 2.2, group: "uma" },
  { id: "alkaid", ra: 13.7923, dec: 49.313, mag: 1.9, group: "uma" },
  { id: "schedar", ra: 0.6751, dec: 56.537, mag: 2.2, group: "cas" },
  { id: "caph", ra: 0.153, dec: 59.15, mag: 2.3, group: "cas" },
  { id: "gamma-cas", ra: 0.9451, dec: 60.717, mag: 2.2, group: "cas" },
  { id: "ruchbah", ra: 1.4302, dec: 60.235, mag: 2.7, group: "cas" },
  { id: "segin", ra: 1.9066, dec: 63.67, mag: 3.4, group: "cas" },
  { id: "vega", ra: 18.6156, dec: 38.7836, mag: 0.03, group: "lyr" },
  { id: "sheliak", ra: 18.8346, dec: 33.363, mag: 3.5, group: "lyr" },
  { id: "sulafat", ra: 18.9823, dec: 32.69, mag: 3.2, group: "lyr" },
  { id: "deneb", ra: 20.6905, dec: 45.2803, mag: 1.25, group: "cyg" },
  { id: "sadr", ra: 20.3704, dec: 40.257, mag: 2.2, group: "cyg" },
  { id: "albireo", ra: 19.512, dec: 27.96, mag: 3.1, group: "cyg" },
  { id: "gienah", ra: 20.7702, dec: 33.97, mag: 2.5, group: "cyg" },
  { id: "delta-cyg", ra: 19.7496, dec: 45.131, mag: 2.9, group: "cyg" },
  { id: "altair", ra: 19.8464, dec: 8.8683, mag: 0.76, group: "aql" },
  { id: "tarazed", ra: 19.771, dec: 10.613, mag: 2.7, group: "aql" },
  { id: "alshain", ra: 19.9218, dec: 6.407, mag: 3.7, group: "aql" },
  { id: "antares", ra: 16.4901, dec: -26.4317, mag: 1.06, group: "sco" },
  { id: "dschubba", ra: 16.0055, dec: -22.622, mag: 2.3, group: "sco" },
  { id: "acrab", ra: 16.0906, dec: -19.805, mag: 2.6, group: "sco" },
  { id: "pi-sco", ra: 15.9808, dec: -26.114, mag: 2.9, group: "sco" },
  { id: "tau-sco", ra: 16.598, dec: -28.216, mag: 2.8, group: "sco" },
  { id: "eps-sco", ra: 16.836, dec: -34.293, mag: 2.3, group: "sco" },
  { id: "shaula", ra: 17.5601, dec: -37.104, mag: 1.6, group: "sco" },
  { id: "lesath", ra: 17.5127, dec: -37.296, mag: 2.7, group: "sco" },
  { id: "sargas", ra: 17.6219, dec: -42.998, mag: 1.9, group: "sco" },
  { id: "arcturus", ra: 14.2611, dec: 19.1824, mag: -0.05, group: "boo" },
  { id: "izar", ra: 14.7498, dec: 27.074, mag: 2.4, group: "boo" },
  { id: "nekkar", ra: 14.5304, dec: 40.391, mag: 3.5, group: "boo" },
  { id: "spica", ra: 13.42, dec: -11.1614, mag: 0.98, group: "vir" },
  { id: "porrima", ra: 12.6944, dec: -1.45, mag: 2.7, group: "vir" },
  { id: "vindemiatrix", ra: 13.0363, dec: 10.959, mag: 2.8, group: "vir" },
  { id: "regulus", ra: 10.1395, dec: 11.9672, mag: 1.4, group: "leo" },
  { id: "algieba", ra: 10.3329, dec: 19.842, mag: 2.2, group: "leo" },
  { id: "zosma", ra: 11.2352, dec: 20.524, mag: 2.6, group: "leo" },
  { id: "denebola", ra: 11.8176, dec: 14.572, mag: 2.1, group: "leo" },
  { id: "betelgeuse", ra: 5.9195, dec: 7.4071, mag: 0.5, group: "ori" },
  { id: "rigel", ra: 5.2422, dec: -8.2016, mag: 0.13, group: "ori" },
  { id: "bellatrix", ra: 5.4188, dec: 6.35, mag: 1.6, group: "ori" },
  { id: "mintaka", ra: 5.5334, dec: -0.299, mag: 2.2, group: "ori" },
  { id: "alnilam", ra: 5.6034, dec: -1.202, mag: 1.7, group: "ori" },
  { id: "alnitak", ra: 5.6794, dec: -1.943, mag: 1.8, group: "ori" },
  { id: "saiph", ra: 5.796, dec: -9.67, mag: 2.1, group: "ori" },
  { id: "aldebaran", ra: 4.5987, dec: 16.5093, mag: 0.87, group: "tau" },
  { id: "elnath", ra: 5.4382, dec: 28.608, mag: 1.7, group: "tau" },
  { id: "sirius", ra: 6.7525, dec: -16.7161, mag: -1.46, group: "cma" },
  { id: "mirzam", ra: 6.378, dec: -17.956, mag: 2.0, group: "cma" },
  { id: "wezen", ra: 7.14, dec: -26.393, mag: 1.8, group: "cma" },
  { id: "adhara", ra: 6.977, dec: -28.972, mag: 1.5, group: "cma" },
  { id: "procyon", ra: 7.655, dec: 5.225, mag: 0.34, group: "cmi" },
  { id: "pollux", ra: 7.7553, dec: 28.0262, mag: 1.14, group: "gem" },
  { id: "castor", ra: 7.5766, dec: 31.8883, mag: 1.58, group: "gem" },
  { id: "capella", ra: 5.2782, dec: 45.998, mag: 0.08, group: "aur" },
  { id: "acrux", ra: 12.4432, dec: -63.099, mag: 0.76, group: "cru" },
  { id: "mimosa", ra: 12.7954, dec: -59.689, mag: 1.25, group: "cru" },
  { id: "gacrux", ra: 12.5194, dec: -57.113, mag: 1.6, group: "cru" },
  { id: "delta-cru", ra: 12.2524, dec: -58.749, mag: 2.8, group: "cru" },
  { id: "kaus-a", ra: 18.4029, dec: -34.385, mag: 1.85, group: "sgr" },
  { id: "kaus-m", ra: 18.35, dec: -29.828, mag: 2.7, group: "sgr" },
  { id: "nunki", ra: 18.921, dec: -26.297, mag: 2.05, group: "sgr" },
];

export const CONSTELLATIONS: Constellation[] = [
  {
    id: "umi",
    name: { vi: "Tiểu Hùng", en: "Ursa Minor" },
    lines: [["polaris", "kochab"]],
  },
  {
    id: "uma",
    name: { vi: "Gấu Lớn", en: "Ursa Major" },
    lines: [
      ["dubhe", "merak"],
      ["merak", "phecda"],
      ["phecda", "megrez"],
      ["megrez", "dubhe"],
      ["megrez", "alioth"],
      ["alioth", "mizar"],
      ["mizar", "alkaid"],
    ],
  },
  {
    id: "cas",
    name: { vi: "Tiên Hậu", en: "Cassiopeia" },
    lines: [
      ["caph", "schedar"],
      ["schedar", "gamma-cas"],
      ["gamma-cas", "ruchbah"],
      ["ruchbah", "segin"],
    ],
  },
  {
    id: "lyr",
    name: { vi: "Thiên Cầm", en: "Lyra" },
    lines: [
      ["vega", "sheliak"],
      ["sheliak", "sulafat"],
      ["sulafat", "vega"],
    ],
  },
  {
    id: "cyg",
    name: { vi: "Thiên Nga", en: "Cygnus" },
    lines: [
      ["deneb", "sadr"],
      ["sadr", "albireo"],
      ["delta-cyg", "sadr"],
      ["sadr", "gienah"],
    ],
  },
  {
    id: "aql",
    name: { vi: "Thiên Ưng", en: "Aquila" },
    lines: [
      ["tarazed", "altair"],
      ["altair", "alshain"],
    ],
  },
  {
    id: "sco",
    name: { vi: "Thiên Yết", en: "Scorpius" },
    lines: [
      ["acrab", "dschubba"],
      ["dschubba", "pi-sco"],
      ["pi-sco", "antares"],
      ["antares", "tau-sco"],
      ["tau-sco", "eps-sco"],
      ["eps-sco", "shaula"],
      ["shaula", "lesath"],
      ["shaula", "sargas"],
    ],
  },
  {
    id: "boo",
    name: { vi: "Mục Phu", en: "Boötes" },
    lines: [
      ["arcturus", "izar"],
      ["izar", "nekkar"],
    ],
  },
  {
    id: "vir",
    name: { vi: "Xử Nữ", en: "Virgo" },
    lines: [
      ["spica", "porrima"],
      ["porrima", "vindemiatrix"],
    ],
  },
  {
    id: "leo",
    name: { vi: "Sư Tử", en: "Leo" },
    lines: [
      ["regulus", "algieba"],
      ["algieba", "zosma"],
      ["zosma", "denebola"],
    ],
  },
  {
    id: "ori",
    name: { vi: "Lạp Hộ", en: "Orion" },
    lines: [
      ["betelgeuse", "bellatrix"],
      ["bellatrix", "rigel"],
      ["rigel", "saiph"],
      ["saiph", "betelgeuse"],
      ["mintaka", "alnilam"],
      ["alnilam", "alnitak"],
    ],
  },
  {
    id: "tau",
    name: { vi: "Kim Ngưu", en: "Taurus" },
    lines: [["aldebaran", "elnath"]],
  },
  {
    id: "cma",
    name: { vi: "Đại Khuyển", en: "Canis Major" },
    lines: [
      ["sirius", "mirzam"],
      ["sirius", "wezen"],
      ["wezen", "adhara"],
    ],
  },
  {
    id: "cmi",
    name: { vi: "Tiểu Khuyển", en: "Canis Minor" },
    lines: [],
  },
  {
    id: "gem",
    name: { vi: "Song Tử", en: "Gemini" },
    lines: [["castor", "pollux"]],
  },
  {
    id: "aur",
    name: { vi: "Ngự Phu", en: "Auriga" },
    lines: [],
  },
  {
    id: "cru",
    name: { vi: "Nam Thập Tự", en: "Crux" },
    lines: [
      ["acrux", "gacrux"],
      ["mimosa", "delta-cru"],
    ],
  },
  {
    id: "sgr",
    name: { vi: "Nhân Mã", en: "Sagittarius" },
    lines: [
      ["kaus-a", "kaus-m"],
      ["kaus-m", "nunki"],
    ],
  },
];

export type Horizontal = { alt: number; az: number };

function mod(value: number, cycle: number): number {
  return ((value % cycle) + cycle) % cycle;
}

export function gmstDegrees(date: Date): number {
  const jd = date.getTime() / 86_400_000 + 2_440_587.5;
  const d = jd - 2_451_545;
  const t = d / 36_525;
  const gmst =
    280.46061837 + 360.98564736629 * d + 0.000387933 * t * t - (t * t * t) / 38_710_000;
  return mod(gmst, 360);
}

export function altAz(raHours: number, decDeg: number, latDeg: number, lonDeg: number, date: Date): Horizontal {
  const lst = mod(gmstDegrees(date) + lonDeg, 360);
  const ha = (mod(lst - raHours * 15 + 180, 360) - 180) * (Math.PI / 180);
  const dec = (decDeg * Math.PI) / 180;
  const lat = (latDeg * Math.PI) / 180;
  const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const cosAlt = Math.cos(alt);
  let az = 0;
  if (Math.abs(cosAlt) > 1e-6 && Math.abs(Math.cos(lat)) > 1e-6) {
    const cosAz = (Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / (cosAlt * Math.cos(lat));
    az = Math.acos(Math.max(-1, Math.min(1, cosAz)));
    if (Math.sin(ha) > 0) az = Math.PI * 2 - az;
  }
  return { alt: (alt * 180) / Math.PI, az: (az * 180) / Math.PI };
}

export function starRadius(mag: number): number {
  return Math.max(0.55, Math.min(2.7, 2.15 - mag * 0.42));
}

export type PlottedStar = Star & Horizontal & { x: number; y: number; visible: boolean };

export type PlottedLine = {
  group: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type SkyLabel = {
  id: string;
  name: Copy;
  x: number;
  y: number;
};

export type SkyPlot = {
  stars: PlottedStar[];
  lines: PlottedLine[];
  labels: SkyLabel[];
};

const CX = 50;
const CY = 50;
const RADIUS = 44;

function project(alt: number, az: number): { x: number; y: number } {
  const r = ((90 - alt) / 90) * RADIUS;
  const azRad = (az * Math.PI) / 180;
  return {
    x: CX + r * Math.sin(azRad),
    y: CY - r * Math.cos(azRad),
  };
}

export function projectSky(lat: number, lon: number, date: Date): SkyPlot {
  const byId = new Map<string, PlottedStar>();
  const stars = CATALOG.map((star) => {
    const horizontal = altAz(star.ra, star.dec, lat, lon, date);
    const point = project(horizontal.alt, horizontal.az);
    const plotted: PlottedStar = {
      ...star,
      ...horizontal,
      ...point,
      visible: horizontal.alt > 0,
    };
    byId.set(star.id, plotted);
    return plotted;
  });

  const lines: PlottedLine[] = [];
  for (const group of CONSTELLATIONS) {
    for (const [fromId, toId] of group.lines) {
      const from = byId.get(fromId);
      const to = byId.get(toId);
      if (!from || !to) continue;
      const clipped = clip(from, to);
      if (clipped) lines.push({ group: group.id, ...clipped });
    }
  }

  const labels: SkyLabel[] = [];
  for (const group of CONSTELLATIONS) {
    const visible = stars.filter((star) => star.group === group.id && star.visible);
    if (visible.length === 0) continue;
    const x = visible.reduce((sum, star) => sum + star.x, 0) / visible.length;
    const y = visible.reduce((sum, star) => sum + star.y, 0) / visible.length;
    labels.push({ id: group.id, name: group.name, x, y });
  }

  return { stars, lines, labels };
}

function clip(a: PlottedStar, b: PlottedStar): { x1: number; y1: number; x2: number; y2: number } | null {
  if (a.alt <= 0 && b.alt <= 0) return null;
  let start = { x: a.x, y: a.y, alt: a.alt };
  let end = { x: b.x, y: b.y, alt: b.alt };
  if (start.alt <= 0 || end.alt <= 0) {
    const hi = start.alt > 0 ? start : end;
    const lo = start.alt > 0 ? end : start;
    const span = hi.alt - lo.alt;
    if (span === 0) return null;
    const t = hi.alt / span;
    const edge = { x: hi.x + (lo.x - hi.x) * t, y: hi.y + (lo.y - hi.y) * t, alt: 0 };
    if (start.alt <= 0) start = edge;
    else end = edge;
  }
  return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
}
