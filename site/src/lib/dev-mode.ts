/** Vercel flag. Only `true` lets `?dev=1` work on a built site; unset or anything else ignores it. `npm run dev` always allows it. */
export const devModeAllowed =
  import.meta.env.DEV || String(import.meta.env.VITE_DEV_MODE ?? "").trim().toLowerCase() === "true";

/** `?dev=1` in the address, honoured only when `devModeAllowed`. Read from the query string only, never stored. */
export function devQuery(): boolean {
  return devModeAllowed && new URLSearchParams(window.location.search).get("dev") === "1";
}
