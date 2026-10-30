/** Difference between the server's clock and the device's, once known. */
let offset: number | null = null;

/** Current time by the server once synced, so changing the phone's clock cannot open the lock early. */
export function serverNow(): number {
  return Date.now() + (offset ?? 0);
}

export function serverClockSynced(): boolean {
  return offset !== null;
}

/** Reads the `Date` header of a `HEAD` request to this site. Resolves false if the server could not be reached. */
export async function syncServerClock(timeout = 4000): Promise<boolean> {
  try {
    const sent = Date.now();
    const response = await fetch(`/?clock=${sent}`, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(timeout) });
    const received = Date.now();
    const date = Date.parse(response.headers.get("date") ?? "");
    if (!Number.isFinite(date)) return false;
    const age = Number(response.headers.get("age")) || 0;
    // `Date` is rounded down to the second, so its midpoint is the best guess.
    offset = date + age * 1000 + 500 - (sent + received) / 2;
    return true;
  } catch {
    return false;
  }
}
