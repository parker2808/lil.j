import { detectSheetDevice } from "./sheet-device.ts";
import {
  TEXT_LIMIT,
  emptyOutbox,
  flushOutbox,
  isEmpty,
  payloadFor,
  readOutbox,
  withDreams,
  withWish,
  type Delivery,
  type Outbox,
  type SheetEntry,
} from "./sheet-outbox.ts";

/** Parker's Apps Script `/exec` URL. Write-only, so it is not a secret. Empty turns the feature off. */
const ENDPOINT = String(import.meta.env.VITE_SHEET_URL ?? "").trim();
const OUTBOX_KEY = "lilj.outbox.v1";
const VISITOR_KEY = "lilj.visitor.v1";
const DREAMS_WAIT = 1500;
const RETRY_WAIT = 30000;

export const sheetSyncOn = ENDPOINT.startsWith("https://");

/** Vercel flag. Only `false` hides "keep this wish to yourself", so every new wish is shared. */
export const privateSwitchOn = String(import.meta.env.VITE_WISH_PRIVATE_SWITCH ?? "").trim().toLowerCase() !== "false";

/** Mirrors storage so a private-mode refusal still sends during this visit. */
let memory: Outbox = emptyOutbox();
let visitor: string | null = null;
let timer: number | null = null;
let running = false;
let again = false;

function load(): Outbox {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    return raw ? readOutbox(JSON.parse(raw)) : memory;
  } catch {
    return memory;
  }
}

function save(outbox: Outbox): void {
  memory = outbox;
  try {
    if (isEmpty(outbox)) localStorage.removeItem(OUTBOX_KEY);
    else localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
  } catch {
    // Private mode can refuse storage. `memory` still holds the queue for this visit.
  }
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function visitorId(): string {
  if (visitor) return visitor;
  try {
    visitor = localStorage.getItem(VISITOR_KEY);
  } catch {
    visitor = null;
  }
  if (!visitor) {
    visitor = randomId();
    try {
      localStorage.setItem(VISITOR_KEY, visitor);
    } catch {
      // Same visitor for this visit only.
    }
  }
  return visitor;
}

/** `?dev=1` rows are marked so Parker can filter out his own tests. */
function isTest(): boolean {
  return new URLSearchParams(window.location.search).get("dev") === "1";
}

async function deliver(entry: SheetEntry, keepalive: boolean): Promise<Delivery> {
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      // text/plain keeps this a simple request, so Apps Script needs no preflight.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payloadFor(entry, visitorId())),
      keepalive,
    });
    if (!response.ok) return "retry";
    const data = (await response.json()) as { ok?: unknown; error?: unknown } | null;
    // The script refuses malformed rows for good. Sending them again cannot help.
    if (data?.ok === true || data?.error === "invalid") return "done";
    return "retry";
  } catch {
    return "retry";
  }
}

function schedule(wait: number): void {
  if (timer !== null) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = null;
    void run(false);
  }, wait);
}

async function run(keepalive: boolean): Promise<void> {
  if (!sheetSyncOn) return;
  if (running) {
    again = true;
    return;
  }
  running = true;
  try {
    const sentAll = await flushOutbox(load, save, (entry) => deliver(entry, keepalive));
    if (!sentAll) schedule(RETRY_WAIT);
  } finally {
    running = false;
  }
  if (again) {
    again = false;
    void run(false);
  }
}

/** Latest ticked list, in content order. Sent once the ticking settles. */
export function queueDreams(ids: string[], items: string[]): void {
  if (!sheetSyncOn) return;
  save(withDreams(load(), { kind: "dreams", ids, items, at: Date.now(), test: isTest(), device: detectSheetDevice(navigator.userAgent, navigator.maxTouchPoints) }));
  schedule(DREAMS_WAIT);
}

/** A shared wish. Private wishes never reach this function. */
export function queueWish(id: string, text: string, at: number): void {
  if (!sheetSyncOn) return;
  save(withWish(load(), { kind: "wish", id, text: text.slice(0, TEXT_LIMIT), at, test: isTest(), device: detectSheetDevice(navigator.userAgent, navigator.maxTouchPoints) }));
  schedule(0);
}

/** Retries on open, when the phone comes back online, and when the page is hidden. */
export function bindSheetSync(): () => void {
  if (!sheetSyncOn) return () => {};
  const online = () => void run(false);
  const hidden = () => {
    if (document.visibilityState === "hidden") void run(true);
  };
  window.addEventListener("online", online);
  document.addEventListener("visibilitychange", hidden);
  void run(false);
  return () => {
    window.removeEventListener("online", online);
    document.removeEventListener("visibilitychange", hidden);
  };
}
