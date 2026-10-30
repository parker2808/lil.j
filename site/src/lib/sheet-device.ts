/** Broad browser-provided labels only; never a hardware fingerprint or a person's device name. */
export type SheetDevice = { platform: string; browser: string };
const PLATFORMS = ["iPhone", "iPad", "Android", "Mac", "Windows", "Linux", "Unknown"];
const BROWSERS = ["Safari", "Chrome", "Firefox", "Edge", "Samsung Internet", "Unknown"];

export function detectSheetDevice(userAgent: string, touchPoints = 0): SheetDevice {
  const platform = /iPhone|iPod/.test(userAgent) ? "iPhone"
    : /iPad/.test(userAgent) || (/Macintosh/.test(userAgent) && touchPoints > 1) ? "iPad"
    : /Android/.test(userAgent) ? "Android"
    : /Macintosh|Mac OS X/.test(userAgent) ? "Mac"
    : /Windows/.test(userAgent) ? "Windows"
    : /Linux/.test(userAgent) ? "Linux" : "Unknown";
  const browser = /Edg\/|EdgiOS|EdgA\//.test(userAgent) ? "Edge"
    : /SamsungBrowser/.test(userAgent) ? "Samsung Internet"
    : /FxiOS|Firefox/.test(userAgent) ? "Firefox"
    : /CriOS|Chrome/.test(userAgent) ? "Chrome"
    : /Version\/.*Safari/.test(userAgent) ? "Safari" : "Unknown";
  return { platform, browser };
}

export function readSheetDevice(value: unknown): SheetDevice | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  if (typeof record.platform !== "string" || typeof record.browser !== "string") return undefined;
  if (!PLATFORMS.includes(record.platform) || !BROWSERS.includes(record.browser)) return undefined;
  return { platform: record.platform, browser: record.browser };
}
