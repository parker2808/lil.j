import { readSheetDevice, type SheetDevice } from "./sheet-device.ts";

/** Queue for Parker's sheet. Pure data in and out: no storage, no network. */

export type DreamsEntry = {
  kind: "dreams";
  ids: string[];
  items: string[];
  at: number;
  test: boolean;
  device?: SheetDevice;
};

export type WishEntry = {
  kind: "wish";
  id: string;
  text: string;
  at: number;
  test: boolean;
  device?: SheetDevice;
};

export type SheetEntry = DreamsEntry | WishEntry;

/** Only the latest dreams list matters. Every shared wish is its own row. */
export type Outbox = {
  dreams: DreamsEntry | null;
  wishes: WishEntry[];
};

export type Delivery = "done" | "retry";

export const OUTBOX_LIMIT = 24;
export const TEXT_LIMIT = 180;

export function emptyOutbox(): Outbox {
  return { dreams: null, wishes: [] };
}

export function withDreams(outbox: Outbox, entry: DreamsEntry): Outbox {
  return { ...outbox, dreams: entry };
}

export function withWish(outbox: Outbox, entry: WishEntry): Outbox {
  if (outbox.wishes.some((wish) => wish.id === entry.id)) return outbox;
  return { ...outbox, wishes: [...outbox.wishes, entry].slice(-OUTBOX_LIMIT) };
}

export function pending(outbox: Outbox): SheetEntry[] {
  return outbox.dreams ? [outbox.dreams, ...outbox.wishes] : [...outbox.wishes];
}

function sameDreams(left: DreamsEntry, right: DreamsEntry): boolean {
  return left.at === right.at && left.ids.join(",") === right.ids.join(",");
}

/** Drops a delivered entry. A newer dreams list queued during the send stays. */
export function without(outbox: Outbox, sent: SheetEntry): Outbox {
  if (sent.kind === "dreams") {
    return outbox.dreams && sameDreams(outbox.dreams, sent) ? { ...outbox, dreams: null } : outbox;
  }
  const wishes = outbox.wishes.filter((wish) => wish.id !== sent.id);
  return wishes.length === outbox.wishes.length ? outbox : { ...outbox, wishes };
}

export function isEmpty(outbox: Outbox): boolean {
  return !outbox.dreams && outbox.wishes.length === 0;
}

/** Only shared entries, a random browser id and optional coarse device labels leave the phone. */
export function payloadFor(entry: SheetEntry, visitor: string): Record<string, unknown> {
  const device = readSheetDevice(entry.device);
  const extra = device ? { device } : {};
  if (entry.kind === "dreams") {
    return { ...extra, v: 1, kind: "dreams", visitor, at: entry.at, ids: entry.ids, items: entry.items, test: entry.test };
  }
  return { ...extra, v: 1, kind: "wish", visitor, at: entry.at, id: entry.id, text: entry.text, test: entry.test };
}

/**
 * Sends the queue in order and stops at the first failure,
 * so an offline phone waits for the next try instead of looping.
 * Reloads the outbox after each send so entries queued meanwhile are kept.
 */
export async function flushOutbox(
  load: () => Outbox,
  save: (outbox: Outbox) => void,
  deliver: (entry: SheetEntry) => Promise<Delivery>,
): Promise<boolean> {
  for (const entry of pending(load())) {
    if ((await deliver(entry)) !== "done") return false;
    save(without(load(), entry));
  }
  return true;
}

function finiteTime(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function strings(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) return null;
  return value as string[];
}

function readDreams(value: unknown): DreamsEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const ids = strings(record.ids);
  const items = strings(record.items);
  const at = finiteTime(record.at);
  if (record.kind !== "dreams" || !ids || !items || ids.length !== items.length || at === null) return null;
  return { kind: "dreams", ids, items, at, test: record.test === true, device: readSheetDevice(record.device) };
}

function readWish(value: unknown): WishEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const at = finiteTime(record.at);
  if (record.kind !== "wish" || typeof record.id !== "string" || typeof record.text !== "string" || at === null) return null;
  const text = record.text.trim().slice(0, TEXT_LIMIT);
  if (!record.id || !text) return null;
  return { kind: "wish", id: record.id, text, at, test: record.test === true, device: readSheetDevice(record.device) };
}

/** Reads a stored outbox. Anything malformed is dropped rather than sent. */
export function readOutbox(value: unknown): Outbox {
  if (!value || typeof value !== "object" || Array.isArray(value)) return emptyOutbox();
  const record = value as Record<string, unknown>;
  const wishes: WishEntry[] = [];
  if (Array.isArray(record.wishes)) {
    for (const item of record.wishes) {
      const wish = readWish(item);
      if (wish && !wishes.some((known) => known.id === wish.id)) wishes.push(wish);
    }
  }
  return { dreams: readDreams(record.dreams), wishes: wishes.slice(-OUTBOX_LIMIT) };
}
