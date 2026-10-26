import type { Content } from "../types.ts";

const MAX_TIMEOUT = 2_147_483_647;

export function unlockTime(iso: string): number {
  return Date.parse(iso);
}

/** True while the birthday instant is still ahead. The ISO offset is absolute, so the device timezone does not move it. */
export function isBeforeUnlock(iso: string | undefined, now = Date.now()): boolean {
  if (!iso) return false;
  const at = unlockTime(iso);
  return Number.isFinite(at) && now < at;
}

export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function countdownParts(iso: string, now = Date.now()): Countdown {
  const at = unlockTime(iso);
  let ms = Number.isFinite(at) ? Math.max(0, at - now) : 0;
  const days = Math.floor(ms / 86_400_000);
  ms -= days * 86_400_000;
  const hours = Math.floor(ms / 3_600_000);
  ms -= hours * 3_600_000;
  const minutes = Math.floor(ms / 60_000);
  ms -= minutes * 60_000;
  const seconds = Math.floor(ms / 1000);
  return { days, hours, minutes, seconds };
}

export function msUntilUnlock(iso: string, now = Date.now()): number | null {
  const at = unlockTime(iso);
  if (!Number.isFinite(at)) return null;
  const wait = at - now;
  if (wait <= 0 || wait > MAX_TIMEOUT) return null;
  return wait;
}

export function lockProblem(value: Content): string | null {
  const lock = value?.lock;
  if (!lock?.unlockAt?.trim()) return "content.json thiếu lock.unlockAt.";
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+07:00$/.test(lock.unlockAt)) {
    return "lock.unlockAt phải là ISO với múi giờ +07:00.";
  }
  if (Number.isNaN(unlockTime(lock.unlockAt))) return "lock.unlockAt không phải ngày hợp lệ.";
  const fields = ["title", "subtitle", "days", "hours", "minutes", "seconds"] as const;
  for (const field of fields) {
    const copy = lock[field];
    if (!copy?.vi?.trim() || !copy?.en?.trim()) return `content.json thiếu lock.${field}.`;
  }
  return null;
}
