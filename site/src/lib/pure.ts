export function normalizeNickname(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
}

export function nicknamesMatch(input: string, password: string): boolean {
  return normalizeNickname(input) === normalizeNickname(password);
}

export function fillTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

export function formatZoned(iso: string, locale: "vi" | "en"): string {
  const date = new Date(iso);
  const tag = locale === "vi" ? "vi-VN" : "en-GB";
  const match = /([+-])(\d{2}):(\d{2})$/.exec(iso);
  if (!match || Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat(tag, { dateStyle: "long", timeStyle: "short" }).format(date);
  }
  const sign = match[1] === "-" ? -1 : 1;
  const offsetMin = sign * (Number(match[2]) * 60 + Number(match[3]));
  const shifted = new Date(date.getTime() + offsetMin * 60_000);
  return new Intl.DateTimeFormat(tag, { dateStyle: "long", timeStyle: "short", timeZone: "UTC" }).format(shifted);
}

export function formatDotted(iso: string, template: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso.slice(0, 10);
  return fillTemplate(template, { y: match[1], m: match[2], d: match[3] });
}

export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type Elapsed = {
  future: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function elapsedParts(fromIso: string, now = new Date()): Elapsed {
  const from = new Date(fromIso).getTime();
  const current = now.getTime();
  const future = current < from;
  let ms = Math.abs(current - from);
  const days = Math.floor(ms / 86_400_000);
  ms -= days * 86_400_000;
  const hours = Math.floor(ms / 3_600_000);
  ms -= hours * 3_600_000;
  const minutes = Math.floor(ms / 60_000);
  ms -= minutes * 60_000;
  const seconds = Math.floor(ms / 1000);
  return { future, days, hours, minutes, seconds };
}

export function shuffle<T>(list: readonly T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = arr[i];
    arr[i] = arr[j] as T;
    arr[j] = current as T;
  }
  return arr;
}

export function tiltFromId(id: string): number {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return (hash % 7) - 3;
}

export const CHAPTER_IDS = [
  "gallery",
  "scratch",
  "quiz",
  "memory",
  "dreams",
  "friends",
  "counter",
] as const;

export const STAR_LAYOUT: { id: string; x: number; y: number }[] = [
  { id: "memory", x: 8, y: 48 },
  { id: "friends", x: 26, y: 16 },
  { id: "quiz", x: 50, y: 30 },
  { id: "counter", x: 74, y: 16 },
  { id: "dreams", x: 92, y: 48 },
  { id: "scratch", x: 50, y: 90 },
  { id: "gallery", x: 30, y: 70 },
];
